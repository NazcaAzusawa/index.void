// js/puzzles/rainbow_screen.js
// 虹色グラデーションのタッチスクリーン（壁のコントローラー）

export function render(config, gameStateRef) {
  // 全面を覆うタッチスクリーン（plateの外側に配置）
  return `
    <div class="rainbow-screen-fullscreen" id="rainbow-screen-bot-6">
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
  
  // タッチ開始（passiveなし、preventDefaultもなし）
  screen.addEventListener("touchstart", (e) => {
    e.stopPropagation(); // 親要素への伝播を止める
    isTouching = true;
    
    const touch = e.touches[0];
    const rect = screen.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentX = (x / rect.width) * 100;
    
    // 壁をワープ
    gameState.wallX = Math.max(0, Math.min(100, percentX));
    touchStartX = percentX;
  });
  
  // タッチ移動（スワイプ）
  screen.addEventListener("touchmove", (e) => {
    e.stopPropagation(); // 親要素への伝播を止める
    if (!isTouching) return;
    
    const touch = e.touches[0];
    const rect = screen.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentX = (x / rect.width) * 100;
    
    // 壁を指に追従
    gameState.wallX = Math.max(0, Math.min(100, percentX));
  });
  
  // タッチ終了
  screen.addEventListener("touchend", (e) => {
    e.stopPropagation(); // 親要素への伝播を止める
    isTouching = false;
  });
  
  // 初期位置を中央に設定
  gameState.wallX = 50;
  
  console.log("Rainbow screen touch control initialized");
}
