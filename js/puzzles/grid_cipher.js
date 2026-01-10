// js/puzzles/grid_cipher.js
// グリッド暗号パネル（7×13グリッド）

// グリッドデータ（縦7横13）
const GRID_DATA = [
  "UZWIHXKCATCBW",
  "POQMBLVONHDRL",
  "IYRSPATGJSEHY",
  "NTEDGFWQSKUYI",
  "CDAMCWYUKZGVJ",
  "XUOMLQPVBJEIQ",
  "MFSZNGAFEOXRK"
];

const COLS = 13;
const ROWS = 7;

// オレンジ色にする座標（行2の7文字目がG、0ベースでx=7, y=2）
// ユーザー指定の(8,3)は1ベースなので、0ベースでは(7,2)
const ORANGE_X = 7;
const ORANGE_Y = 2;

export function render(config, gameStateRef) {
  let gridHTML = '<div class="cipher-panel"><div class="grid-cipher-container">';
  
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const char = GRID_DATA[y][x];
      const isOrange = (x === ORANGE_X && y === ORANGE_Y);
      const cellClass = isOrange ? 'grid-cell orange' : 'grid-cell';
      
      gridHTML += `<span class="${cellClass}">${char}</span>`;
    }
  }
  
  gridHTML += '</div></div>';
  return gridHTML;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  return false;
}
