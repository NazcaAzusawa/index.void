// RGBボタン（丸型ボタン）

export function render(config, gameStateRef) {
  const colorClass = `btn-${config.color}`;
  return `<div class="big-btn ${colorClass}" data-action="${config.action}"></div>`;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  if (action === "clickRgb") {
    console.log(`${tier} button clicked.`);
    return true;
  }
  return false;
}
