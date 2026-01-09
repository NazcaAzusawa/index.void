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
  
  // 境界壁なし（画面外に自由に出られる）
  
  // 可動壁（中央、縦長、薄い）- kinematicに変更して速度を持てるようにする
  wall = Bodies.rectangle(width / 2, height / 2, 5, height * 2, {
    isStatic: false,
    density: 100, // 重い
    friction: 0,
    frictionAir: 1, // 空気抵抗を最大にして即座に止まる
    restitution: 0,
    render: {
      fillStyle: 'rgba(255, 0, 0, 0.3)', // デバッグ用に赤で表示
      strokeStyle: '#ff0000',
      lineWidth: 1
    }
  });
  World.add(matterEngine.world, wall);
  
  // ボールの作成（20個、ランダム配置）
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * (width - 40) + 20;
    const y = Math.random() * (height - 40) + 20;
    const ball = Bodies.circle(x, y, 6, {
      restitution: 0.6, // 反発係数
      friction: 0.01,
      frictionAir: 0.01, // 空気抵抗を低く
      density: 0.01,
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

let lastWallX = null;

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
    
    // 壁を移動（速度を持たせて押す）
    if (lastWallX !== null) {
      const velocityX = (targetX - lastWallX) * 2; // 速度を2倍に
      Body.setVelocity(wall, { x: velocityX, y: 0 });
    }
    
    Body.setPosition(wall, { x: targetX, y: height });
    lastWallX = targetX;
  }
  
  // 画面外に出たボールをチェック（画面サイズより大きく離れたら）
  let allOut = true;
  let remainingCount = 0;
  for (const ball of balls) {
    const pos = ball.position;
    // 画面内にあるかチェック（広めの範囲）
    if (pos.x > -100 && pos.x < width + 100 && pos.y > -100 && pos.y < height + 100) {
      allOut = false;
      remainingCount++;
    }
  }
  
  // デバッグ用（残りのボール数を表示）
  if (remainingCount > 0 && remainingCount < 20) {
    console.log(`Remaining balls: ${remainingCount}`);
  }
  
  // 全ボールが画面外に出たらクリア
  if (allOut && balls.length > 0 && !gameState.isBallPuzzleCleared) {
    gameState.isBallPuzzleCleared = true;
    console.log("🎉 BALL PUZZLE CLEARED! 🎉");
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
