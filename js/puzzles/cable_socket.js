// js/puzzles/cable_socket.js
// ケーブルソケット (cable_socket) - ケーブル断面

export function render(config, gameStateRef) {
  const wireList = config.wires || ["empty", "empty", "empty"];
  const wiresHTML = wireList.map((wire) => {
    if (wire === "empty") return '<div class="wire"></div>';
    return `<div class="wire ${wire}"></div>`;
  });

  return `<div class="cable-socket">${wiresHTML.join("")}</div>`;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  // ケーブルソケットはアクションなし
  return false;
}
