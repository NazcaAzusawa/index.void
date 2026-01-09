// js/puzzles/cipher_text.js
// 暗号テキスト (cipher_text) - 金属パネル風

export function render(config, gameStateRef) {
  return `
    <div class="cipher-panel">
      <div class="cipher-text">ESOY 6D<br>SY NRYS<br>246/-</div>
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  // 暗号テキストはアクションなし
  return false;
}
