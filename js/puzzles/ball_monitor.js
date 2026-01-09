// js/puzzles/ball_monitor.js
// ボールモニター（緑色基調、ボール20個表示）

export function render(config, gameStateRef) {
  // 20個のボールをランダムな位置に配置
  let ballsHTML = '';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 85 + 5; // 5-90%の範囲
    const y = Math.random() * 85 + 5;
    ballsHTML += `<div class="ball" style="left: ${x}%; top: ${y}%;"></div>`;
  }
  
  return `
    <div class="ball-monitor">
      ${ballsHTML}
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  // 見た目のみ、アクションなし
  return false;
}
