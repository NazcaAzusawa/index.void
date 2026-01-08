// js/puzzles/gyro.js

export function render(config, gameStateRef) {
  
    // パターンA: 暗号テキスト (config.type === "cipher_text")
    if (config.type === "cipher_text") {
      return `
        <div class="cipher-panel">
          <div class="cipher-text">ESOY 6D<br>SY NRYS<br>246/-</div>
        </div>
      `;
    }
  
    // パターンB: ジャイロ生データ (config.type === "raw_data")
    if (config.type === "raw_data") {
      // モニター風にするため crt-screen クラスをつける
      return `
        <div class="raw-data-panel crt-screen" data-action="reqGyro">
          <span id="beta-val" class="raw-val">--.-</span>
        </div>
      `;
    }
  
    return `<div>Unknown Type</div>`;
  }
  
  export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
    // ジャイロの権限リクエスト
    if (action === "reqGyro") {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
          .then((resp) => {
            if (resp === "granted") {
              if (window.startGyro) window.startGyro();
            }
          })
          .catch(console.error);
      } else {
        if (window.startGyro) window.startGyro();
      }
      return true;
    }
    return false;
  }