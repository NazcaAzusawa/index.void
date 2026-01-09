// js/puzzles/maze.js
// 傾き迷路パズル（スライディングボール）

// 迷路データ（13×7）
const MAZE = [
  [0,0,1,1,1,0,0,0,1,1,1,0,0],
  [0,1,0,0,0,1,0,1,0,0,0,1,0],
  [1,0,0,1,0,0,1,'G',0,0,0,1,0],
  [1,0,1,1,0,'S',1,1,0,0,1,0,1],
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
  
  // 迷路を描画
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = MAZE[y][x];
      
      if (cell === 1) {
        // 壁
        ctx.fillStyle = '#333';
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        ctx.strokeStyle = '#222';
        ctx.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      } else if (cell === 'G') {
        // ゴール
        ctx.fillStyle = '#ff9900';
        ctx.fillRect(x * cellWidth + 2, y * cellHeight + 2, cellWidth - 4, cellHeight - 4);
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * cellWidth + 2, y * cellHeight + 2, cellWidth - 4, cellHeight - 4);
      } else {
        // 通路
        ctx.fillStyle = '#111';
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
  }
  
  // ボールを描画
  const ballCenterX = ballX * cellWidth + cellWidth / 2;
  const ballCenterY = ballY * cellHeight + cellHeight / 2;
  const ballRadius = Math.min(cellWidth, cellHeight) / 2 - 4;
  
  ctx.fillStyle = '#33ff33';
  ctx.beginPath();
  ctx.arc(ballCenterX, ballCenterY, ballRadius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#00aa00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ballCenterX, ballCenterY, ballRadius, 0, Math.PI * 2);
  ctx.stroke();
}

// ボールを移動（壁にぶつかるまで滑る）
function moveBall(dx, dy) {
  let newX = ballX;
  let newY = ballY;
  
  // 指定方向に壁にぶつかるまで進む
  while (true) {
    const nextX = newX + dx;
    const nextY = newY + dy;
    
    // 範囲外チェック
    if (nextX < 0 || nextX >= COLS || nextY < 0 || nextY >= ROWS) {
      break;
    }
    
    // 壁チェック
    const nextCell = MAZE[nextY][nextX];
    if (nextCell === 1) {
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
    return true; // 移動した
  }
  
  return false; // 移動しなかった
}

// 傾きセンサーの処理
function handleOrientation(event, gameState) {
  if (!isActive) return;
  
  const now = Date.now();
  if (now - lastMoveTime < MOVE_COOLDOWN) return;
  
  const beta = event.beta || 0;   // 前後の傾き（-180 ~ 180）
  const gamma = event.gamma || 0; // 左右の傾き（-90 ~ 90）
  
  let moved = false;
  
  // 左右の傾き判定（優先）
  if (gamma < -TILT_THRESHOLD) {
    // 左に傾いた
    moved = moveBall(-1, 0);
  } else if (gamma > TILT_THRESHOLD) {
    // 右に傾いた
    moved = moveBall(1, 0);
  }
  // 前後の傾き判定
  else if (beta < -TILT_THRESHOLD) {
    // 手前に傾いた（上に移動）
    moved = moveBall(0, -1);
  } else if (beta > TILT_THRESHOLD) {
    // 奥に傾いた（下に移動）
    moved = moveBall(0, 1);
  }
  
  if (moved) {
    lastMoveTime = now;
    
    // 再描画
    const canvas = document.getElementById('maze-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (canvas && ctx) {
      drawMaze(canvas, ctx);
    }
    
    // ゴール判定
    if (ballX === goalX && ballY === goalY && !gameState.isMazeCleared) {
      gameState.isMazeCleared = true;
      
      // 効果音再生
      const audio = new Audio("ac.wav");
      audio.volume = 0.5;
      audio.play().catch(err => console.log("Audio play failed:", err));
      
      console.log("Maze cleared!");
      
      // ゴール演出（ボールを点滅）
      let blinkCount = 0;
      const blinkInterval = setInterval(() => {
        if (blinkCount >= 6) {
          clearInterval(blinkInterval);
          return;
        }
        
        const canvas = document.getElementById('maze-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
        if (canvas && ctx) {
          drawMaze(canvas, ctx);
          
          // 偶数回は非表示
          if (blinkCount % 2 === 1) {
            const cellWidth = canvas.width / COLS;
            const cellHeight = canvas.height / ROWS;
            ctx.fillStyle = '#111';
            ctx.fillRect(ballX * cellWidth, ballY * cellHeight, cellWidth, cellHeight);
          }
        }
        
        blinkCount++;
      }, 200);
    }
  }
}

// 迷路パズルを初期化
export function initMaze(gameState) {
  if (isActive) return;
  
  // ボールをスタート位置にリセット
  ballX = startX;
  ballY = startY;
  
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
  
  console.log('Maze puzzle stopped');
}
