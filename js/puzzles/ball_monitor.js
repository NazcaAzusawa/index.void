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

// ボールをランダム配置にリセット
export function resetBalls(width, height) {
  if (!window.Matter || !balls.length) return;
  
  const { Body } = window.Matter;
  
  balls.forEach(ball => {
    const x = Math.random() * (width - 40) + 20;
    const y = Math.random() * (height - 40) + 20;
    Body.setPosition(ball, { x, y });
    Body.setVelocity(ball, { x: 0, y: 0 });
    Body.setAngularVelocity(ball, 0);
  });
  
  console.log("Balls reset to random positions");
}

let isInitialized = false; // 一度だけ初期化するフラグ

// Matter.jsの初期化（グローバルから呼び出す）
export function initPhysics() {
  if (!window.Matter) return false;
  if (isInitialized) return false; // 既に初期化済みならfalseを返す
  isInitialized = true;
  
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
  
  // 可動壁を2つに分割（上半分と下半分）
  const wallThickness = 5;
  const upperWall = Bodies.rectangle(width / 2, height / 4, wallThickness, height / 2, {
    isStatic: false,
    density: 100,
    friction: 0,
    frictionAir: 1,
    restitution: 0,
    render: {
      fillStyle: 'transparent',
      strokeStyle: 'transparent',
      lineWidth: 0
    }
  });
  
  const lowerWall = Bodies.rectangle(width / 2, height * 3 / 4, wallThickness, height / 2, {
    isStatic: false,
    density: 100,
    friction: 0,
    frictionAir: 1,
    restitution: 0,
    render: {
      fillStyle: 'transparent',
      strokeStyle: 'transparent',
      lineWidth: 0
    }
  });
  
  wall = { upper: upperWall, lower: lowerWall };
  World.add(matterEngine.world, [upperWall, lowerWall]);
  
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
  return true; // 初期化成功
}

let lastWallX = null;
let lastTopIndex = null;

// 物理演算の更新（main.jsから呼び出す）
export function updatePhysics(gameState) {
  if (!matterEngine || !wall || !isPhysicsRunning) return;
  
  const container = document.getElementById("ball-monitor-top-6");
  if (!container) return;
  
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  
  // TOP段のインデックスが変わったらボールをリセット（クリア後は除く）
  if (lastTopIndex !== null && lastTopIndex !== gameState.activeIndices.top && !gameState.isBallPuzzleCleared) {
    resetBalls(width, height);
  }
  lastTopIndex = gameState.activeIndices.top;
  
  // BOT-6からの壁の位置を取得（相対位置：0-100%）
  if (gameState.wallX !== null) {
    const { Body } = window.Matter;
    
    // パーセンテージをTOP-6のピクセル座標に変換し、2%ずつずらす
    const centerX = (gameState.wallX / 100) * width;
    const offset = width * 0.02; // 2%のオフセット
    
    const upperTargetX = centerX - offset; // 上半分は-2%
    const lowerTargetX = centerX + offset; // 下半分は+2%
    
    // 壁を移動（速度を持たせて押す）
    if (lastWallX !== null) {
      const velocityX = (centerX - lastWallX) * 2;
      Body.setVelocity(wall.upper, { x: velocityX, y: 0 });
      Body.setVelocity(wall.lower, { x: velocityX, y: 0 });
    }
    
    Body.setPosition(wall.upper, { x: upperTargetX, y: height / 4 });
    Body.setPosition(wall.lower, { x: lowerTargetX, y: height * 3 / 4 });
    lastWallX = centerX;
  }
  
  // モニターの実際のサイズを取得
  const monitorRect = container.getBoundingClientRect();
  const monitorWidth = monitorRect.width;
  const monitorHeight = monitorRect.height;
  
  // 画面外に出たボールをチェック（厳密に、余裕5pxのみ）
  let remainingCount = 0;
  let outCount = 0;
  
  for (const ball of balls) {
    const pos = ball.position;
    // モニター内にあるかチェック（余裕5pxのみ）
    const margin = 5;
    if (pos.x >= -margin && pos.x <= monitorWidth + margin && 
        pos.y >= -margin && pos.y <= monitorHeight + margin) {
      remainingCount++;
    } else {
      outCount++;
    }
  }
  
  // デバッグ用（詳細な情報を表示）
  if (remainingCount !== 20) {
    console.log(`Balls - In screen: ${remainingCount}, Out: ${outCount}, Total: ${balls.length}, Monitor: ${monitorWidth}x${monitorHeight}`);
  }
  
  // 全20個のボールが画面外に出たらクリア
  if (remainingCount === 0 && balls.length === 20 && !gameState.isBallPuzzleCleared) {
    gameState.isBallPuzzleCleared = true;
    // 効果音再生
    const audio = new Audio("ac.wav");
    audio.volume = 0.5;
    audio.play().catch(err => console.log("Audio play failed:", err));
    console.log("🎉 BALL PUZZLE CLEARED! All 20 balls are out! 🎉");
  }
}

// 物理演算の停止（レンダリングのみ停止、データは保持）
export function stopPhysics() {
  if (!isPhysicsRunning) return;
  
  const { Runner, Render } = window.Matter;
  
  if (matterRunner) Runner.stop(matterRunner);
  if (matterRender) Render.stop(matterRender);
  
  isPhysicsRunning = false;
  
  console.log("Matter.js rendering stopped (data preserved)");
}

// 物理演算の再開
export function resumePhysics() {
  if (isPhysicsRunning || !matterEngine || !matterRender || !matterRunner) return;
  
  const { Runner, Render } = window.Matter;
  
  Render.run(matterRender);
  Runner.run(matterRunner, matterEngine);
  
  isPhysicsRunning = true;
  
  console.log("Matter.js rendering resumed");
}
