// システムメニュー（HELP, RECORDS, OPTIONS）

export function render(config, gameStateRef) {
  return `<div class="meta-btn" data-action="${config.action}">${config.label}</div>`;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  if (action === "openHelp") {
    showModal(
      "HELP",
      "This is not a game.\nDo not touch anything.\n\n...unless you have to."
    );
    return true;
  }
  if (action === "openRecords") {
    showModal(
      "RECORDS",
      "No Data Found.\n\n[LOCKED] - 0/10\n[LOCKED] - 0/5"
    );
    return true;
  }
  if (action === "openOptions") {
    showModal("OPTIONS", "Audio: ON\nVibration: ON\nReality: UNSTABLE");
    return true;
  }
  return false;
}
