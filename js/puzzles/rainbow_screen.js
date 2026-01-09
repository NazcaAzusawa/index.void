// js/puzzles/rainbow_screen.js
// 虹色グラデーションのタッチスクリーン（壁のコントローラー）

export function render(config, gameStateRef) {
  return `
    <div class="rainbow-screen" id="rainbow-screen-bot-6" data-action="touchScreen">
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  if (action === "touchScreen") {
    // クリックイベントは処理しない（タッチイベントで処理）
    return true;
  }
  return false;
}

// タッチイベントの初期化（main.jsから呼び出す）
export function initTouchControl(gameState) {
  const screen = document.getElementById("rainbow-screen-bot-6");
  if (!screen) return;
  
  let isTouching = false;
  let touchStartX = 0;
  
  // タッチ開始
  screen.addEventListener("touchstart", (e) => {
    e.preventDefault();
    isTouching = true;
    
    const touch = e.touches[0];
    const rect = screen.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentX = (x / rect.width) * 100;
    
    // 壁をワープ
    gameState.wallX = Math.max(0, Math.min(100, percentX));
    touchStartX = percentX;
  }, { passive: false });
  
  // タッチ移動（スワイプ）
  screen.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!isTouching) return;
    
    const touch = e.touches[0];
    const rect = screen.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentX = (x / rect.width) * 100;
    
    // 壁を指に追従
    gameState.wallX = Math.max(0, Math.min(100, percentX));
  }, { passive: false });
  
  // タッチ終了
  screen.addEventListener("touchend", (e) => {
    e.preventDefault();
    isTouching = false;
  }, { passive: false });
  
  // 初期位置を中央に設定
  gameState.wallX = 50;
  
  console.log("Rainbow screen touch control initialized");
}
