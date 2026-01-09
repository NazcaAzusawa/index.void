// js/puzzles/rainbow_screen.js
// 虹色グラデーションのタッチスクリーン（壁のコントローラー）

export function render(config, gameStateRef) {
  // 全面を覆うタッチスクリーン（plateの外側に配置）
  return `
    <div class="rainbow-screen-fullscreen" id="rainbow-screen-bot-6">
      <div class="wall-indicator" id="wall-indicator-bot-6"></div>
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
  const indicator = document.getElementById("wall-indicator-bot-6");
  if (!screen || !indicator) return;
  
  let isTouching = false;
  
  // 壁の位置を更新する関数
  const updateWallPosition = (clientX) => {
    const rect = screen.getBoundingClientRect();
    const x = clientX - rect.left; // スクリーン内の相対X座標（ピクセル）
    
    // 絶対座標として保存（画面の絶対X座標）
    gameState.wallX = clientX;
    
    // インジケーターの位置を更新（スクリーン内の相対位置）
    indicator.style.left = `${x}px`;
    indicator.style.transform = 'translateX(-50%)';
  };
  
  // タッチ開始
  screen.addEventListener("touchstart", (e) => {
    e.stopPropagation();
    isTouching = true;
    
    const touch = e.touches[0];
    updateWallPosition(touch.clientX);
  });
  
  // タッチ移動（スワイプ）
  screen.addEventListener("touchmove", (e) => {
    e.stopPropagation();
    if (!isTouching) return;
    
    const touch = e.touches[0];
    updateWallPosition(touch.clientX);
  });
  
  // タッチ終了
  screen.addEventListener("touchend", (e) => {
    e.stopPropagation();
    isTouching = false;
  });
  
  // 初期位置を中央に設定（画面の中央の絶対座標）
  const rect = screen.getBoundingClientRect();
  gameState.wallX = rect.left + rect.width / 2;
  indicator.style.left = '50%';
  
  console.log("Rainbow screen touch control initialized");
}
