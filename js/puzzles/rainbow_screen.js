// js/puzzles/rainbow_screen.js
// 虹色グラデーションのタッチスクリーン

export function render(config, gameStateRef) {
  return `
    <div class="rainbow-screen" data-action="touchScreen">
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  // 見た目のみ、ロジックは後で実装
  return false;
}
