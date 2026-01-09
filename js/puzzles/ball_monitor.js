// js/puzzles/ball_monitor.js
// ボールモニター（Matter.js物理エンジン使用）

let matterEngine = null;
let matterRender = null;
let matterRunner = null;
let balls = [];
let wall = null;
let boundaries = [];
let isPhysicsRunning = false;
let canvas = null;

export function render(config, gameStateRef) {
  return `
    <div class="ball-monitor" id="ball-monitor-top-6">
      <canvas id="ball-canvas"></canvas>
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  return false;
}

// Matter.jsの初期化（グローバルから呼び出す）
export function initPhysics() {
  if (!window.Matter || matterEngine) return;
  
  const container = document.getElementById("ball-monitor-top-6");
  if (!container) return;
  
  const { Engine, Render, Runner, Bodies, Composite, World } = window.Matter;
  
  // コンテナのサイズを取得
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  
  // エンジンの作成
  matterEngine = Engine.create({
    gravity: { x: 0, y: 0 } // 重力なし
  });
  
  // レンダラーの作成
  canvas = document.getElementById("ball-canvas");
  matterRender = Render.create({
    canvas: canvas,
    engine: matterEngine,
    options: {
      width: width,
      height: height,
      wireframes: false,
      background: 'transparent'
    }
  });
  
  // 境界壁（画面外に出たことを検知するため、画面外に配置）
  const boundaryThickness = 50;
  const leftBoundary = Bodies.rectangle(-boundaryThickness, height / 2, boundaryThickness * 2, height * 3, {
    isStatic: true,
    render: { visible: false }
  });
  const rightBoundary = Bodies.rectangle(width + boundaryThickness, height / 2, boundaryThickness * 2, height * 3, {
    isStatic: true,
    render: { visible: false }
  });
  const topBoundary = Bodies.rectangle(width / 2, -boundaryThickness, width * 3, boundaryThickness * 2, {
    isStatic: true,
    render: { visible: false }
  });
  const bottomBoundary = Bodies.rectangle(width / 2, height + boundaryThickness, width * 3, boundaryThickness * 2, {
    isStatic: true,
    render: { visible: false }
  });
  
  boundaries.push(leftBoundary, rightBoundary, topBoundary, bottomBoundary);
  World.add(matterEngine.world, boundaries);
  
  // 可動壁（中央、縦長、薄い）
  wall = Bodies.rectangle(width / 2, height / 2, 3, height, {
    isStatic: true,
    render: {
      fillStyle: 'transparent', // 透明
      strokeStyle: 'transparent',
      lineWidth: 0
    }
  });
  World.add(matterEngine.world, wall);
  
  // ボールの作成（20個、ランダム配置）
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * (width - 40) + 20;
    const y = Math.random() * (height - 40) + 20;
    const ball = Bodies.circle(x, y, 4, {
      restitution: 0.8, // 反発係数
      friction: 0.01,
      density: 0.001,
      render: {
        fillStyle: '#44ff44',
        strokeStyle: '#00aa00',
        lineWidth: 1
      }
    });
    balls.push(ball);
    World.add(matterEngine.world, ball);
  }
  
  // レンダラーとランナーを開始
  Render.run(matterRender);
  matterRunner = Runner.create();
  Runner.run(matterRunner, matterEngine);
  
  isPhysicsRunning = true;
  console.log("Matter.js physics initialized for ball monitor");
}

// 物理演算の更新（main.jsから呼び出す）
export function updatePhysics(gameState) {
  if (!matterEngine || !wall || !isPhysicsRunning) return;
  
  const container = document.getElementById("ball-monitor-top-6");
  if (!container) return;
  
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  
  // BOT-6からの壁の位置を取得（パーセンテージ）
  if (gameState.wallX !== null) {
    const targetX = (gameState.wallX / 100) * width;
    const { Body } = window.Matter;
    Body.setPosition(wall, { x: targetX, y: height / 2 });
  }
  
  // 画面外に出たボールをチェック
  let allOut = true;
  for (const ball of balls) {
    const pos = ball.position;
    // 画面内にあるかチェック（余裕を持たせる）
    if (pos.x > -20 && pos.x < width + 20 && pos.y > -20 && pos.y < height + 20) {
      allOut = false;
      break;
    }
  }
  
  // 全ボールが画面外に出たらクリア
  if (allOut && !gameState.isBallPuzzleCleared) {
    gameState.isBallPuzzleCleared = true;
    console.log("BALL PUZZLE CLEARED!");
    // クリア演出（必要なら）
  }
}

// 物理演算の停止
export function stopPhysics() {
  if (!isPhysicsRunning) return;
  
  const { Runner, Render, World } = window.Matter;
  
  if (matterRunner) Runner.stop(matterRunner);
  if (matterRender) Render.stop(matterRender);
  if (matterEngine) World.clear(matterEngine.world);
  
  matterEngine = null;
  matterRender = null;
  matterRunner = null;
  balls = [];
  wall = null;
  boundaries = [];
  isPhysicsRunning = false;
  
  console.log("Matter.js physics stopped");
}
