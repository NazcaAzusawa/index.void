// js/puzzles/face_camera.js
// インカメ表示と顔検出（face-api.js使用）

let video = null;
let isDetecting = false;
let detectionInterval = null;
let isModelLoaded = false;

export function render(config, gameStateRef) {
  return `
    <div class="face-camera-container">
      <video id="face-video" autoplay playsinline muted></video>
      <canvas id="face-canvas"></canvas>
      <div class="camera-status" id="camera-status">INITIALIZING...</div>
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  return false;
}

// face-api.jsのモデルをロード（一度だけ）
async function loadModels() {
  if (isModelLoaded) return;
  
  try {
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    
    isModelLoaded = true;
    console.log("face-api.js models loaded");
  } catch (err) {
    console.error("Failed to load face-api.js models:", err);
    throw err;
  }
}

// カメラと顔検出の初期化
export async function initFaceDetection(gameState) {
  if (isDetecting) return;
  
  video = document.getElementById("face-video");
  const canvas = document.getElementById("face-canvas");
  const statusEl = document.getElementById("camera-status");
  
  if (!video || !canvas) return;
  
  try {
    // カメラストリームを取得（インカメ）
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 640 }
      }
    });
    
    video.srcObject = stream;
    statusEl.innerText = "LOADING MODEL...";
    
    // ビデオが再生されるまで待つ
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });
    
    // キャンバスのサイズを動画に合わせる
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // face-api.jsモデルをロード
    await loadModels();
    statusEl.innerText = "DETECTING...";
    
    isDetecting = true;
    
    // 顔検出ループ
    detectionInterval = setInterval(async () => {
      if (!isDetecting || !video || !faceapi) return;
      if (video.paused || video.ended) return;
      
      try {
        // 顔検出と表情認識を実行
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();
        
        if (detections && detections.length > 0) {
          const expressions = detections[0].expressions;
          
          // 笑顔（happy）の確率を取得（0.0 ~ 1.0）
          const happyScore = expressions.happy;
          
          // 笑顔スコアが0.7以上（70%）でクリア
          if (happyScore > 0.7 && !gameState.isSmileCleared) {
            gameState.isSmileCleared = true;
            statusEl.innerText = "SMILE DETECTED";
            statusEl.style.color = "#33ff33";
            
            // 効果音再生
            const audio = new Audio("ac.wav");
            audio.volume = 0.5;
            audio.play().catch(err => console.log("Audio play failed:", err));
            
            console.log(`Smile detected! Score: ${(happyScore * 100).toFixed(1)}%`);
          }
        }
      } catch (err) {
        console.error("Detection error:", err);
      }
    }, 500);
    
  } catch (err) {
    console.error("Face detection failed:", err);
    if (statusEl) {
      statusEl.innerText = "CAMERA ERROR";
      statusEl.style.color = "#ff3333";
    }
  }
}

// 顔検出を停止
export function stopFaceDetection() {
  if (!isDetecting) return;
  
  isDetecting = false;
  
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
  
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  
  video = null;
  
  console.log("Face detection stopped");
}
