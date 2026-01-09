// js/puzzles/tap_distance.js
// タップ距離モニター（画面中心からの距離を表示）

export function render(config, gameStateRef) {
  return `
    <div class="raw-data-panel">
      <span id="tap-distance-val" class="raw-val">0.0</span>
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  // タップ距離モニターはアクションなし（グローバルでタップを監視）
  return false;
}
