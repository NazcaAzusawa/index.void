// js/puzzles/audio_level.js
// 音声レベルモニター（マイク入力を0-100で表示）

export function render(config, gameStateRef) {
  return `
    <div class="raw-data-panel">
      <span id="audio-level-val" class="raw-val">0.0</span>
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  // 音声レベルモニターはアクションなし（グローバルでマイクを監視）
  return false;
}
