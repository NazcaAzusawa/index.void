// ジャイロ（生データ表示）

export function render(config, gameStateRef) {
  return `
    <div class="raw-data-panel">
      <span id="beta-val" class="raw-val">--.-</span>
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  if (action === "reqGyro") {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then((resp) => {
          if (resp === "granted") {
            // startGyroはmain.jsで実装
            if (window.startGyro) {
              window.startGyro();
            }
          }
        })
        .catch(console.error);
    } else {
      if (window.startGyro) {
        window.startGyro();
      }
    }
    return true;
  }
  return false;
}
