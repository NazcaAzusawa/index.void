// ケーブルパズル（ソケット ＆ モニター兼用）

export function render(config, gameStateRef) {
    // config.js の定義通り、type が "monitor" かどうかだけで判定します
    if (config.type === "monitor") {
      const isPowered = gameStateRef && gameStateRef.isCablePowered;
      
      // 電源ON/OFFに応じたクラスとテキスト
      const statusClass = isPowered ? "monitor-on" : "monitor-off";
      const text = isPowered ? "SYSTEM ONLINE<br>CABLE LINKED" : "NO SIGNAL";
  
      // モニター用の枠（crt-screen）を適用して返す
      return `
        <div class="crt-screen ${statusClass}" id="cable-monitor">
          ${text}
        </div>
      `;
    }
  
    // それ以外（type: "cable_socket"）の処理
    const wireList = config.wires || ["empty", "empty", "empty"];
    
    const wiresHTML = wireList.map((wire) => {
      if (wire === "empty") return '<div class="wire"></div>';
      return `<div class="wire ${wire}"></div>`;
    });
  
    return `<div class="cable-socket">${wiresHTML.join("")}</div>`;
  }
  
  export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
    // アクションなし
    return false;
  }