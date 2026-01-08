export function render(config, gameStateRef) {
    // ジャイロと同じく、config.type で判断します
    if (config.type === "monitor") {
      const isPowered = gameStateRef && gameStateRef.isCablePowered;
      const statusClass = isPowered ? "monitor-on" : "monitor-off";
      const text = isPowered ? "SYSTEM ONLINE<br>CABLE LINKED" : "NO SIGNAL";
  
      return `
        <div class="crt-screen ${statusClass}" id="cable-monitor">
          ${text}
        </div>
      `;
    }
  
    // それ以外（type: "cable_socket" など）
    const wireList = config.wires || ["empty", "empty", "empty"];
    const wiresHTML = wireList.map((wire) => {
      if (wire === "empty") return '<div class="wire"></div>';
      return `<div class="wire ${wire}"></div>`;
    });
  
    return `<div class="cable-socket">${wiresHTML.join("")}</div>`;
  }
  
  export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
    return false;
  }