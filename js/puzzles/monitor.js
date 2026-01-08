// モニター（監視モニター）

export function render(config, gameStateRef) {
  const statusClass = gameStateRef && gameStateRef.isCablePowered
    ? "monitor-on"
    : "monitor-off";
  const text = gameStateRef && gameStateRef.isCablePowered
    ? "SYSTEM ONLINE<br>CABLE LINKED"
    : "NO SIGNAL";
  return `<div class="${statusClass}" id="cable-monitor">${text}</div>`;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  // モニターはアクションなし
  return false;
}
