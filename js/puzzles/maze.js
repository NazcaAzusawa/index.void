// js/puzzles/maze.js
// 傾き迷路パズル（スライディングボール）

// 迷路データ（13×7）
const MAZE = [
  [0,0,1,1,1,0,0,0,1,1,1,0,0],
  [0,1,0,0,0,1,0,1,0,0,0,1,0],
  [1,0,0,1,0,'S',1,'G',0,0,0,1,0],
  [1,0,1,1,0,0,1,1,0,0,1,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,1],
  [0,1,1,1,0,0,1,0,0,0,0,1,0],
  [0,0,0,0,1,1,0,1,1,1,1,0,0]
];

const COLS = 13;
const ROWS = 7;

// スタートとゴールの座標を検索
let startX = 5, startY = 3;
let goalX = 7, goalY = 2;

for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    if (MAZE[y][x] === 'S') {
      startX = x;
      startY = y;
    }
    if (MAZE[y][x] === 'G') {
      goalX = x;
      goalY = y;
    }
  }
}

// ボールの現在位置
let ballX = startX;
let ballY = startY;

// センサー監視用
let isActive = false;
let orientationHandler = null;
let lastMoveTime = 0;
const MOVE_COOLDOWN = 300; // 移動のクールダウン（ミリ秒）

// 傾きの閾値（度）
const TILT_THRESHOLD = 15;

// 当たった壁の座標（白色で表示する用）
let hitWallX = null;
let hitWallY = null;
let wallFlashTimeout = null;
// 最後に光った壁の座標（同じ壁が連続して当たった場合は光らない）
let lastFlashedWallX = null;
let lastFlashedWallY = null;

export function render(config, gameStateRef) {
  return `
    <div class="maze-container" id="maze-container-top-9">
      <canvas id="maze-canvas" width="390" height="210"></canvas>
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  return false;
}

// 迷路を描画
function drawMaze(canvas, ctx) {
  if (!canvas || !ctx) return;
  
  const cellWidth = canvas.width / COLS;
  const cellHeight = canvas.height / ROWS;
  
  // 背景をクリア
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 迷路を描画（壁とボールは透明、ゴールのみ表示）
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = MAZE[y][x];
      
      if (cell === 'G') {
        // ゴールのみオレンジで表示
        ctx.fillStyle = '#ff9900';
        ctx.fillRect(x * cellWidth + 2, y * cellHeight + 2, cellWidth - 4, cellHeight - 4);
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * cellWidth + 2, y * cellHeight + 2, cellWidth - 4, cellHeight - 4);
      }
    }
  }
  
  // 当たった壁を白色で表示（一瞬だけ）
  if (hitWallX !== null && hitWallY !== null) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(hitWallX * cellWidth, hitWallY * cellHeight, cellWidth, cellHeight);
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(hitWallX * cellWidth, hitWallY * cellHeight, cellWidth, cellHeight);
  }
  
  // ボールは透明（描画しない）
}

// ボールを移動（壁にぶつかるまで滑る）
// 戻り値: { moved: boolean, hitWallX: number|null, hitWallY: number|null }
function moveBall(dx, dy) {
  let newX = ballX;
  let newY = ballY;
  let hitWallX = null;
  let hitWallY = null;
  
  // 指定方向に壁にぶつかるまで進む
  while (true) {
    const nextX = newX + dx;
    const nextY = newY + dy;
    
    // 範囲外チェック
    if (nextX < 0 || nextX >= COLS || nextY < 0 || nextY >= ROWS) {
      // 範囲外の壁に当たった（画面端）
      break;
    }
    
    // 壁チェック
    const nextCell = MAZE[nextY][nextX];
    if (nextCell === 1) {
      // 壁に当たった
      hitWallX = nextX;
      hitWallY = nextY;
      break;
    }
    
    // 移動
    newX = nextX;
    newY = nextY;
  }
  
  // 位置が変わったかチェック
  if (newX !== ballX || newY !== ballY) {
    ballX = newX;
    ballY = newY;
    return { moved: true, hitWallX, hitWallY };
  }
  
  // 移動しなかった場合も、当たった壁の情報を返す
  return { moved: false, hitWallX, hitWallY };
}

// 当たった壁を白色で一瞬表示
function flashWall(x, y) {
  // 壁の座標が無効な場合は何もしない
  if (x === null || y === null) return;
  
  // 最後に光った壁と同じ座標の場合は何もしない
  if (x === lastFlashedWallX && y === lastFlashedWallY) {
    return;
  }
  
  // 既存のタイマーをクリア
  if (wallFlashTimeout) {
    clearTimeout(wallFlashTimeout);
  }
  
  // 当たった壁の座標を設定
  hitWallX = x;
  hitWallY = y;
  
  // 最後に光った壁の座標を記録
  lastFlashedWallX = x;
  lastFlashedWallY = y;
  
  // 再描画
  const canvas = document.getElementById('maze-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  if (canvas && ctx) {
    drawMaze(canvas, ctx);
  }
  
  // 200ms後に壁を消す
  wallFlashTimeout = setTimeout(() => {
    hitWallX = null;
    hitWallY = null;
    
    // 再描画
    const canvas = document.getElementById('maze-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (canvas && ctx) {
      drawMaze(canvas, ctx);
    }
    
    wallFlashTimeout = null;
  }, 200);
}

// 傾きセンサーの処理
function handleOrientation(event, gameState) {
  if (!isActive) return;
  
  const now = Date.now();
  if (now - lastMoveTime < MOVE_COOLDOWN) return;
  
  const beta = event.beta || 0;   // 前後の傾き（-180 ~ 180）
  const gamma = event.gamma || 0; // 左右の傾き（-90 ~ 90）
  
  let result = null;
  
  // 左右の傾き判定（優先）
  if (gamma < -TILT_THRESHOLD) {
    // 左に傾いた
    result = moveBall(-1, 0);
  } else if (gamma > TILT_THRESHOLD) {
    // 右に傾いた
    result = moveBall(1, 0);
  }
  // 前後の傾き判定
  else if (beta < -TILT_THRESHOLD) {
    // 手前に傾いた（上に移動）
    result = moveBall(0, -1);
  } else if (beta > TILT_THRESHOLD) {
    // 奥に傾いた（下に移動）
    result = moveBall(0, 1);
  }
  
  // 壁に当たった場合（移動した場合も、移動距離0の場合も）
  if (result && (result.hitWallX !== null || result.hitWallY !== null)) {
    // 当たった壁を白色で一瞬表示
    flashWall(result.hitWallX, result.hitWallY);
  }
  
  // 移動した場合のみクールダウンとゴール判定
  if (result && result.moved) {
    lastMoveTime = now;
    
    // ゴール判定
    if (ballX === goalX && ballY === goalY && !gameState.isMazeCleared) {
      gameState.isMazeCleared = true;
      
      // 効果音再生
      const audio = new Audio("ac.wav");
      audio.volume = 0.5;
      audio.play().catch(err => console.log("Audio play failed:", err));
      
      console.log("Maze cleared!");
    }
  }
}

// 迷路パズルを初期化
export function initMaze(gameState) {
  if (isActive) return;
  
  // ボールをスタート位置にリセット
  ballX = startX;
  ballY = startY;
  
  // 壁の表示をリセット
  hitWallX = null;
  hitWallY = null;
  lastFlashedWallX = null;
  lastFlashedWallY = null;
  
  // キャンバスを取得
  const canvas = document.getElementById('maze-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // 初回描画
  drawMaze(canvas, ctx);
  
  // 傾きセンサーを開始
  orientationHandler = (event) => handleOrientation(event, gameState);
  window.addEventListener('deviceorientation', orientationHandler);
  
  isActive = true;
  console.log('Maze puzzle initialized');
}

// 迷路パズルを停止
export function stopMaze() {
  if (!isActive) return;
  
  isActive = false;
  
  if (orientationHandler) {
    window.removeEventListener('deviceorientation', orientationHandler);
    orientationHandler = null;
  }
  
  // タイマーをクリア
  if (wallFlashTimeout) {
    clearTimeout(wallFlashTimeout);
    wallFlashTimeout = null;
  }
  
  // 壁の表示をリセット
  hitWallX = null;
  hitWallY = null;
  lastFlashedWallX = null;
  lastFlashedWallY = null;
  
  console.log('Maze puzzle stopped');
}
