// js/puzzles/lock_mechanism.js
// ロック機構（UNLOCK表示、縦棒、ボタン）

export function render(config, gameStateRef) {
  return `
    <div class="lock-mechanism">
      <div class="lock-left">
        <div class="lock-status" id="lock-status-mid-6">UNLOCK</div>
        <div class="lock-bar-container">
          <div class="lock-bar" id="lock-bar-mid-6"></div>
        </div>
      </div>
      <div class="lock-right">
        <button class="lock-btn" id="lock-btn-mid-6" data-action="toggleLock">PUSH</button>
      </div>
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  if (action === "toggleLock") {
    const statusEl = document.getElementById("lock-status-mid-6");
    const barEl = document.getElementById("lock-bar-mid-6");
    const btnEl = document.getElementById("lock-btn-mid-6");
    
    if (!statusEl || !barEl || !btnEl) return false;
    
    // ロック中は何もしない
    if (statusEl.innerText === "LOCK") return true;
    
    // 下段のアクティブインデックスを確認
    const bottomIndex = gameState.activeIndices.bot;
    
    // BOT-6（虹色タッチスクリーン）でない場合、ERRORを表示
    if (bottomIndex !== 6) {
      statusEl.innerText = "ERROR";
      statusEl.style.color = "#ff3333";
      statusEl.style.textShadow = "0 0 4px #ff3333";
      
      // 1秒後にUNLOCKに戻す
      setTimeout(() => {
        statusEl.innerText = "UNLOCK";
        statusEl.style.color = "";
        statusEl.style.textShadow = "";
      }, 1000);
      
      return true;
    }
    
    // BOT-6の場合、ロック動作を実行
    statusEl.innerText = "LOCK";
    statusEl.style.color = "#ff9900";
    statusEl.style.textShadow = "0 0 4px #ff9900";
    barEl.style.transform = "translateY(50px)"; // 棒を下に伸ばす
    barEl.style.transition = "transform 0.3s ease";
    btnEl.disabled = true;
    btnEl.style.opacity = "0.5";
    btnEl.style.cursor = "not-allowed";
    
    // 3秒後にUNLOCKに戻す
    setTimeout(() => {
      statusEl.innerText = "UNLOCK";
      statusEl.style.color = "";
      statusEl.style.textShadow = "";
      barEl.style.transform = "translateY(0)";
      btnEl.disabled = false;
      btnEl.style.opacity = "";
      btnEl.style.cursor = "";
    }, 3000);
    
    return true;
  }
  
  return false;
}
