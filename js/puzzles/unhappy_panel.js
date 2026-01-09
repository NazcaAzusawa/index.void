// js/puzzles/unhappy_panel.js
// YOU ARE UNHAPPY パネル

export function render(config, gameStateRef) {
  return `
    <div class="unhappy-panel">
      <div class="unhappy-text">YOU ARE<br>UNHAPPY</div>
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  return false;
}
