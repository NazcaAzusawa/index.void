// js/puzzles/color_camera.js
// カラーボーダー＋色判定モジュール

let video = null;
let canvas = null;
let ctx = null;
let stream = null;
let detectionInterval = null;
let isDetecting = false;
let isCameraReady = false;

// 色の定義（RGB値）
const COLOR_DEFINITIONS = {
  red: { r: 255, g: 0, b: 0, label: "赤" },
  yellow: { r: 255, g: 255, b: 0, label: "黄色" },
  green: { r: 0, g: 255, b: 0, label: "緑" },
  cyan: { r: 0, g: 255, b: 255, label: "水色" },
  blue: { r: 0, g: 0, b: 255, label: "青色" },
  orange: { r: 255, g: 165, b: 0, label: "オレンジ" },
  purple: { r: 128, g: 0, b: 128, label: "紫" },
  gray: { r: 128, g: 128, b: 128, label: "灰色" },
  white: { r: 255, g: 255, b: 255, label: "白" },
  black: { r: 0, g: 0, b: 0, label: "黒" }
};

export function render(config, gameStateRef) {
  return `
    <div class="color-camera-module">
      <video id="back-camera-video" autoplay playsinline muted style="display:none;"></video>
      <canvas id="color-canvas" style="display:none;"></canvas>
      <div class="color-strip detected-color" id="detected-color"></div>
      <div class="color-strip blue-strip"></div>
      <div class="color-strip red-strip"></div>
      <div class="color-strip yellow-strip"></div>
      <div class="color-strip white-strip"></div>
      <div class="color-strip black-strip"></div>
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  return false;
}

// RGB間の距離を計算
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

// 最も近い色を判定
function detectColor(r, g, b) {
  let minDistance = Infinity;
  let closestColor = null;
  
  for (const [key, color] of Object.entries(COLOR_DEFINITIONS)) {
    const distance = colorDistance(r, g, b, color.r, color.g, color.b);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = { key, ...color };
    }
  }
  
  // 紫の判定は厳密に（距離60以下）
  if (closestColor.key === "purple" && minDistance > 60) {
    // 紫以外の色を再検索
    let secondMinDistance = Infinity;
    let secondClosestColor = null;
    
    for (const [key, color] of Object.entries(COLOR_DEFINITIONS)) {
      if (key === "purple") continue;
      const distance = colorDistance(r, g, b, color.r, color.g, color.b);
      if (distance < secondMinDistance) {
        secondMinDistance = distance;
        secondClosestColor = { key, ...color };
      }
    }
    
    // 他の色も遠い場合は虹色
    if (secondMinDistance > 200) {
      return { key: "rainbow", label: "虹色", r, g, b };
    }
    
    return secondClosestColor;
  }
  
  // 紫以外は緩い判定（距離200以下）
  if (minDistance > 200) {
    return { key: "rainbow", label: "虹色", r, g, b };
  }
  
  return closestColor;
}

// カメラから色を測定
function detectColorFromCamera(gameState) {
  if (!video || !canvas || !ctx) return;
  if (video.paused || video.ended) return;
  if (!isCameraReady) return; // カメラが準備できるまで何もしない
  
  // カメラ映像をキャンバスに描画
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // 映像サイズが取得できない場合は何もしない
  if (canvas.width === 0 || canvas.height === 0) return;
  
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  } catch (err) {
    console.error("Failed to draw camera frame:", err);
    return;
  }
  
  // 画像の中央部分の色を取得（100x100ピクセル）
  const centerX = Math.floor(canvas.width / 2) - 50;
  const centerY = Math.floor(canvas.height / 2) - 50;
  const imageData = ctx.getImageData(centerX, centerY, 100, 100);
  const pixels = imageData.data;
  
  // 平均色を計算
  let totalR = 0, totalG = 0, totalB = 0;
  const pixelCount = pixels.length / 4;
  
  for (let i = 0; i < pixels.length; i += 4) {
    totalR += pixels[i];
    totalG += pixels[i + 1];
    totalB += pixels[i + 2];
  }
  
  const avgR = Math.round(totalR / pixelCount);
  const avgG = Math.round(totalG / pixelCount);
  const avgB = Math.round(totalB / pixelCount);
  
  // 色を判定
  const detectedColor = detectColor(avgR, avgG, avgB);
  
  // 結果を表示
  const colorDiv = document.getElementById("detected-color");
  
  if (colorDiv) {
    if (detectedColor.key === "rainbow") {
      colorDiv.style.background = `linear-gradient(to right, 
        red, orange, yellow, green, cyan, blue, purple)`;
    } else {
      colorDiv.style.background = `rgb(${detectedColor.r}, ${detectedColor.g}, ${detectedColor.b})`;
    }
    
    // 紫が検出されたらクリア
    if (detectedColor.key === "purple" && !gameState.isColorPurpleCleared) {
      gameState.isColorPurpleCleared = true;
      
      // 効果音再生
      const audio = new Audio("ac.wav");
      audio.volume = 0.5;
      audio.play().catch(err => console.log("Audio play failed:", err));
      
      console.log("Purple detected! Achievement unlocked!");
    }
  }
}

// アウトカメラを起動
export async function initBackCamera(gameState) {
  if (isDetecting) return;
  
  video = document.getElementById("back-camera-video");
  canvas = document.getElementById("color-canvas");
  
  if (!video || !canvas) return;
  
  ctx = canvas.getContext("2d");
  
  try {
    // アウトカメラを取得
    stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment', // アウトカメラ
        width: { ideal: 640 },
        height: { ideal: 640 }
      }
    });
    
    video.srcObject = stream;
    
    // ビデオが再生可能になるまで待つ
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        video.play().then(() => {
          isCameraReady = true; // カメラ準備完了
          resolve();
        }).catch(reject);
      };
      
      // タイムアウト（5秒）
      setTimeout(() => reject(new Error("Camera timeout")), 5000);
    });
    
    isDetecting = true;
    
    // 2秒ごとに色を測定
    detectionInterval = setInterval(() => {
      detectColorFromCamera(gameState);
    }, 2000);
    
    console.log("Color detection started");
  } catch (err) {
    console.error("Back camera failed:", err);
    // エラー時は何も表示を変えない（カメラの存在を隠す）
    isCameraReady = false;
  }
}

// カメラを停止
export function stopBackCamera() {
  isDetecting = false;
  isCameraReady = false;
  
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
  
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  
  if (video) {
    video.srcObject = null;
    video = null;
  }
  
  // 色のストライプを透明に戻す
  const colorDiv = document.getElementById("detected-color");
  if (colorDiv) {
    colorDiv.style.background = "transparent";
  }
  
  canvas = null;
  ctx = null;
  
  console.log("Color detection stopped");
}
