// js/puzzles/monitor.js
// モニター (monitor) - ケーブル接続監視モニター

export function render(config, gameStateRef) {
  const isPowered = gameStateRef && gameStateRef.isCablePowered;
  const statusClass = isPowered ? "monitor-on" : "monitor-off";
  const text = isPowered ? "SYSTEM ONLINE<br>CABLE LINKED" : "NO SIGNAL";

  return `
    <div class="${statusClass}" id="cable-monitor">
      ${text}
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  // モニターはアクションなし
  return false;
}
