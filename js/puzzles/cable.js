// ケーブルパズル（ソケット ＆ モニター兼用）

export function render(config, gameStateRef) {
  
    // ------------------------------------------------
    // パターンA: モニターとして描画する場合
    // (config.js で variant: "monitor" と書いた場合)
    // ------------------------------------------------
    if (config.variant === "monitor") {
      // ケーブルが繋がっているかどうかの判定
      const isPowered = gameStateRef && gameStateRef.isCablePowered;
      
      // クラスとテキストの切り替え
      const statusClass = isPowered ? "monitor-on" : "monitor-off";
      const text = isPowered ? "SYSTEM ONLINE<br>CABLE LINKED" : "NO SIGNAL";
  
      // ★修正ポイント: "crt-screen" クラスを追加しました！
      return `
        <div class="crt-screen ${statusClass}" id="cable-monitor">
          ${text}
        </div>
      `;
    }
  
    // ------------------------------------------------
    // パターンB: ケーブルソケットとして描画する場合
    // (それ以外の場合)
    // ------------------------------------------------
    // wiresの設定がない場合は空っぽにする安全策
    const wireList = config.wires || ["empty", "empty", "empty"];
    
    const wiresHTML = wireList.map((wire) => {
      if (wire === "empty") {
        return '<div class="wire"></div>';
      }
      return `<div class="wire ${wire}"></div>`;
    });
  
    return `<div class="cable-socket">${wiresHTML.join("")}</div>`;
  }
  
  // アクション処理（タップしたときの動作）
  export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
    // ケーブルもモニターも、タップしても何も起きないので false を返す
    return false;
  }