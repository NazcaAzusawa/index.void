// js/puzzles/color_camera.js
// カラーボーダー＋アウトカメラモジュール

let video = null;
let stream = null;

export function render(config, gameStateRef) {
  return `
    <div class="color-camera-module">
      <div class="color-strip camera-strip">
        <video id="back-camera-video" autoplay playsinline muted></video>
      </div>
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

// アウトカメラを起動
export async function initBackCamera() {
  video = document.getElementById("back-camera-video");
  
  if (!video) return;
  
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
    video.play();
    
    console.log("Back camera initialized");
  } catch (err) {
    console.error("Back camera failed:", err);
  }
}

// カメラを停止
export function stopBackCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  
  if (video) {
    video.srcObject = null;
    video = null;
  }
  
  console.log("Back camera stopped");
}
