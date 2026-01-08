// ケーブルソケット

export function render(config, gameStateRef) {
  const wires = config.wires.map((wire) => {
    if (wire === "empty") {
      return '<div class="wire"></div>';
    }
    return `<div class="wire ${wire}"></div>`;
  });
  return `<div class="cable-socket">${wires.join("")}</div>`;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  // ケーブルソケットはアクションなし
  return false;
}
