// js/puzzles/lock_mechanism.js
// ロック機構（UNLOCK表示、縦棒、ボタン）

export function render(config, gameStateRef) {
  return `
    <div class="lock-mechanism">
      <div class="lock-left">
        <div class="lock-status">UNLOCK</div>
        <div class="lock-bar-container">
          <div class="lock-bar"></div>
        </div>
      </div>
      <div class="lock-right">
        <button class="lock-btn" data-action="toggleLock">PUSH</button>
      </div>
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  // 見た目のみ、ロジックは後で実装
  return false;
}
