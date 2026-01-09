// js/puzzles/raw_data.js
// ジャイロ生データ (raw_data) - CRTモニター風

export function render(config, gameStateRef) {
  return `
    <div class="raw-data-panel">
      <span id="beta-val" class="raw-val">--.-</span>
    </div>
  `;
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
