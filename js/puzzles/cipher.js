// 暗号テキスト

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
