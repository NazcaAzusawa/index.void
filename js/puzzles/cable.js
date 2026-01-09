// js/puzzles/cable.js
// ケーブルソケット (cable_socket) とモニター (monitor) の両方を処理

export function render(config, gameStateRef) {
  // パターンA: モニター (config.type === "monitor")
  if (config.type === "monitor") {
    const isPowered = gameStateRef && gameStateRef.isCablePowered;
    const statusClass = isPowered ? "monitor-on" : "monitor-off";
    const text = isPowered ? "SYSTEM ONLINE<br>CABLE LINKED" : "NO SIGNAL";

    return `
      <div class="${statusClass}" id="cable-monitor">
        ${text}
      </div>
    `;
  }

  // パターンB: ケーブルソケット (config.type === "cable_socket")
  const wireList = config.wires || ["empty", "empty", "empty"];
  const wiresHTML = wireList.map((wire) => {
    if (wire === "empty") return '<div class="wire"></div>';
    return `<div class="wire ${wire}"></div>`;
  });

  return `<div class="cable-socket">${wiresHTML.join("")}</div>`;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  // ケーブルソケットとモニターはアクションなし
  return false;
}
