import { MODULE_COUNT } from "./config.js";
import { renderModule, handleAction, triggerMorseVibration, setGameStateRef } from "./modules.js";
import * as ballMonitor from "./puzzles/ball_monitor.js";
import * as rainbowScreen from "./puzzles/rainbow_screen.js";

// --- STATE MANAGEMENT (脳) ---
const gameState = {
  activeIndices: { top: 0, mid: 0, bot: 0 },
  mimicAttempt: 0, // MIMICパズルの失敗回数カウント
  isMimicCleared: false,
  horizonTimer: 0, // ジャイロの静止時間計測用
  isCablePowered: false, // ケーブルが繋がったかどうかのフラグ
  cableConnectedTime: 0, // ケーブル接続開始時刻
  isCableCleared: false, // 5秒経過してクリアしたかどうか
  isLocked: false, // MID-6のロック状態
  wallX: null, // BOT-6の壁のX座標（0-100のパーセンテージ）
  isBallPuzzleCleared: false, // ボールパズルがクリアされたか
};

// modules.jsにgameStateの参照を設定
setGameStateRef(gameState);

// --- UI UTILITIES (モーダル制御など) ---
const modal = document.getElementById("sys-modal");
const mTitle = document.getElementById("modal-title");
const mBody = document.getElementById("modal-body");

function showModal(title, text) {
  mTitle.innerText = title;
  mBody.innerText = text;
  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
}

// グローバルにcloseModalを公開（HTMLから呼び出すため）
window.closeModal = closeModal;

// --- INFINITE LANE INITIALIZER (無限レーン構築) ---
function initLane(laneId, tierName) {
  const lane = document.getElementById(laneId);

  // HTML生成ヘルパー
  const createModuleHTML = (index, isClone = false) => {
    const displayIndex = isClone ? `CLONE` : index;
    const content = renderModule(tierName, index);

    const el = document.createElement("div");
    el.className = "module";
    el.dataset.index = index;
    el.dataset.tier = tierName;

    el.innerHTML = `
      <div class="plate">
        <div class="screw tl"></div><div class="screw tr"></div>
        <div class="screw bl"></div><div class="screw br"></div>
        <div class="module-content">${content}</div>
        <div class="label-plate">${tierName.toUpperCase()}-${displayIndex}</div>
      </div>
    `;
    return el;
  };

  // DOM構築
  const modules = [];
  for (let i = 0; i < MODULE_COUNT; i++) {
    modules.push(createModuleHTML(i));
  }
  const cloneHead = createModuleHTML(MODULE_COUNT - 1, true);
  const cloneTail = createModuleHTML(0, true);

  lane.appendChild(cloneHead);
  modules.forEach((m) => lane.appendChild(m));
  lane.appendChild(cloneTail);

  // 初期位置調整
  setTimeout(() => {
    const w = lane.querySelector(".module").offsetWidth;
    lane.scrollLeft = w;
  }, 10);

  // 無限スクロール処理 (ワープ)
  lane.addEventListener("scroll", () => {
    const w = lane.querySelector(".module").offsetWidth;
    const maxScroll = w * (MODULE_COUNT + 1);

    // 遊びを持たせてガタつき防止（0以下になったらワープ）
    if (lane.scrollLeft <= 1) {
      lane.scrollLeft = w * MODULE_COUNT + 1;
    } else if (lane.scrollLeft >= maxScroll - 1) {
      lane.scrollLeft = w - 1;
    }
  });
  
  // LOCK中の同期スクロール（中段のみ）
  if (tierName === "mid") {
    let touchStartX = 0;
    let scrollStartPos = 0;
    let isTouching = false;
    let hasMoved = false;
    
    lane.addEventListener("touchstart", (e) => {
      if (!gameState.isLocked) return;
      
      isTouching = true;
      hasMoved = false;
      touchStartX = e.touches[0].clientX;
      scrollStartPos = lane.scrollLeft;
    }, { passive: true });
    
    lane.addEventListener("touchmove", (e) => {
      if (!gameState.isLocked || !isTouching) return;
      
      hasMoved = true;
      const touchCurrentX = e.touches[0].clientX;
      const diffX = touchStartX - touchCurrentX;
      const newScrollPos = scrollStartPos + diffX;
      
      // 中段と下段を同期してスクロール
      lane.scrollLeft = newScrollPos;
      
      const botLane = document.getElementById("lane-bot");
      if (botLane) {
        botLane.scrollLeft = newScrollPos;
      }
    }, { passive: true });
    
    lane.addEventListener("touchend", () => {
      if (!gameState.isLocked || !isTouching) return;
      
      isTouching = false;
      
      // スワイプが実際に行われた場合のみスナップとUNLOCK
      if (hasMoved) {
        // スナップ処理：最寄りのモジュールへ
        setTimeout(() => {
          const w = lane.querySelector(".module").offsetWidth;
          const currentScroll = lane.scrollLeft;
          const nearestIndex = Math.round(currentScroll / w);
          const snapPosition = nearestIndex * w;
          
          // スムーズにスナップ
          lane.scrollTo({
            left: snapPosition,
            behavior: "smooth"
          });
          
          const botLane = document.getElementById("lane-bot");
          if (botLane) {
            botLane.scrollTo({
              left: snapPosition,
              behavior: "smooth"
            });
          }
          
          // スナップ完了後にUNLOCK（アニメーション時間を考慮）
          setTimeout(() => {
            if (gameState.unlockMechanism) {
              gameState.unlockMechanism();
            }
          }, 300);
        }, 50);
      }
    }, { passive: true });
  }
  
  // BOT-6でタッチイベントを吸収してスワイプを無効化
  if (tierName === "bot") {
    lane.addEventListener("touchstart", (e) => {
      // ロック中は通常のスワイプを許可
      if (gameState.isLocked) return;
      
      // BOT-6が表示されているかチェック
      if (gameState.activeIndices.bot === 6) {
        // BOT-6のrainbow-screen-fullscreen要素をタッチしている場合のみ無効化
        const target = e.target.closest(".rainbow-screen-fullscreen");
        if (target) {
          e.stopPropagation();
        }
      }
    });
    
    lane.addEventListener("touchmove", (e) => {
      // ロック中は通常のスワイプを許可
      if (gameState.isLocked) return;
      
      // BOT-6が表示されているかチェック
      if (gameState.activeIndices.bot === 6) {
        const target = e.target.closest(".rainbow-screen-fullscreen");
        if (target) {
          e.stopPropagation();
        }
      }
    });
  }

  // ★ イベント委譲 (Event Delegation)
  // レーン全体でクリックを監視し、ボタンの種類に応じて処理を振り分ける
  lane.addEventListener("click", (e) => {
    // data-action属性を持っている要素を探す
    const target = e.target.closest("[data-action]");
    if (!target) return;

    const action = target.dataset.action;
    const moduleEl = target.closest(".module");
    const tier = moduleEl.dataset.tier;
    const index = parseInt(moduleEl.dataset.index);

    handleAction(action, tier, index, target, gameState, showModal, () => {
      triggerMorseVibration(gameState);
    });
  });
}

// --- GYRO LOGIC (ジャイロ処理) ---
let holdStartTime = 0;

function startGyro() {
  // iOS 13+ 対策: 許可が必要な場合は、画面上の任意のクリック(Event Delegation)で
  // こっそり requestPermission を呼ぶハックが必要ですが、
  // ここではシンプルに「自動登録」を試みます。
  // (AndroidやPC、古いiOSならこれで即動きます)

  window.addEventListener("deviceorientation", (e) => {
    const valSpan = document.getElementById("beta-val");
    if (!valSpan) return; // モジュールが存在しない(生成前)なら無視

    // 角度取得
    const beta = e.beta || 0;

    // 数値のみ表示 (単位なし)
    valSpan.innerText = beta.toFixed(1);

    // 判定: 135.0度 ±0.1度
    if (Math.abs(beta - 135.0) <= 0.1) {
      if (holdStartTime === 0) holdStartTime = Date.now();
      const elapsed = Date.now() - holdStartTime;

      if (elapsed >= 5000) {
        // クリア演出
        valSpan.innerText = "SYNC";
        valSpan.classList.add("synced");
        // 実績解除処理...
      }
    } else {
      holdStartTime = 0;
      valSpan.classList.remove("synced");
    }
  });
}

// グローバルにstartGyroを公開（modules.jsから呼び出すため）
window.startGyro = startGyro;

// --- CABLE PATCH LOGIC (ケーブル監視) ---
function checkCableConnection() {
  const { top, mid, bot } = gameState.activeIndices;

  // 現在の各段のズレを計算 (40個のループを考慮)
  // 基準: T:3, M:8, B:15 で繋がる
  // つまり、常に以下の関係が維持されていればOK
  // Top = (Mid - 5)
  // Bot = (Mid + 7)

  // JSの % は負の数になることがあるので、+40 してから % 40 する
  const targetTop = (mid - 5 + 40) % 40;
  const targetBot = (mid + 7 + 40) % 40;

  // 現在の位置がターゲットと一致しているか
  const isConnected = top === targetTop && bot === targetBot;

  if (isConnected) {
    if (!gameState.isCablePowered) {
      // 接続開始
      gameState.isCablePowered = true;
      gameState.cableConnectedTime = Date.now();
      gameState.isCableCleared = false;
      console.log("CABLE CONNECTED (Internal)");
    } else if (!gameState.isCableCleared) {
      // 接続中：5秒経過したかチェック
      const elapsed = Date.now() - gameState.cableConnectedTime;
      if (elapsed >= 5000) {
        gameState.isCableCleared = true;
        console.log("CABLE CLEARED (5s elapsed)");
      }
    }
  } else {
    if (gameState.isCablePowered) {
      // 接続が切れた
      gameState.isCablePowered = false;
      gameState.isCableCleared = false;
      gameState.cableConnectedTime = 0;
    }
  }

  // モニター表示の更新 (Mid-13を見ている時だけ反映)
  // ※ checkCableConnectionは常時回っているので、ここでDOM更新してもOK
  const monitor = document.getElementById("cable-monitor");
  if (monitor) {
    if (gameState.isCablePowered && gameState.isCableCleared) {
      // 状態: 接続して5秒経過してクリア（SYSTEM ONLINE）
      monitor.className = "monitor-on";
      monitor.innerHTML = "SYSTEM ONLINE<br>CABLE LINKED";
    } else {
      // 状態: 常に砂嵐（接続していない時も、接続中だが5秒未経過の時も）
      monitor.className = "monitor-static";
      monitor.innerHTML = '<div class="static-noise"></div>';
    }
  }
}

// --- OBSERVER & INIT (起動) ---
// 初期化実行
initLane("lane-top", "top");
initLane("lane-mid", "mid");
initLane("lane-bot", "bot");

startGyro();

// インデックス監視
const debugEls = {
  top: document.getElementById("d-top"),
  mid: document.getElementById("d-mid"),
  bot: document.getElementById("d-bot"),
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const tier = entry.target.dataset.tier;
        const index = parseInt(entry.target.dataset.index);
        gameState.activeIndices[tier] = index;
        debugEls[tier].innerText = index;
        
        // TOP-5 (音声レベルモニター) が表示されたらマイク監視を開始
        if (tier === "top" && index === 5) {
          startAudioMonitoring();
        }
        
        // TOP-6 (ボールモニター) が表示されたら物理演算を開始
        if (tier === "top" && index === 6) {
          setTimeout(() => {
            ballMonitor.initPhysics();
          }, 100);
        }
        
        // BOT-6 (虹色タッチスクリーン) が表示されたらタッチコントロールを初期化
        if (tier === "bot" && index === 6) {
          setTimeout(() => {
            rainbowScreen.initTouchControl(gameState);
          }, 100);
        }
      } else {
        // TOP-5 が非表示になったらマイク監視を停止
        const tier = entry.target.dataset.tier;
        const index = parseInt(entry.target.dataset.index);
        if (tier === "top" && index === 5) {
          stopAudioMonitoring();
        }
        
        // TOP-6 が非表示になったら物理演算を停止
        if (tier === "top" && index === 6) {
          ballMonitor.stopPhysics();
        }
      }
    });
  },
  { threshold: 0.6 }
);

// 少し待ってから監視開始（DOM生成待ち）
setTimeout(() => {
  document
    .querySelectorAll(".module")
    .forEach((m) => observer.observe(m));
}, 500);

// ケーブル接続チェックを定期的に実行
setInterval(() => {
  checkCableConnection();
}, 500);

// ボール物理演算の更新（TOP-6が表示されている時のみ）
setInterval(() => {
  if (gameState.activeIndices.top === 6) {
    ballMonitor.updatePhysics(gameState);
  }
}, 16); // 約60fps

// トリプルタップ全画面
let tapCnt = 0,
  lastTap = 0;
document.addEventListener("touchend", (e) => {
  const now = new Date().getTime();
  if (now - lastTap < 400) {
    tapCnt++;
    if (tapCnt >= 3) {
      document.documentElement.requestFullscreen().catch(() => {});
      tapCnt = 0;
    }
  } else tapCnt = 1;
  lastTap = now;
  
  // タップ距離の計算
  updateTapDistance(e);
});

// タップ距離計算（画面中心からの距離をパーセンテージで）
function updateTapDistance(e) {
  const tapDistanceVal = document.getElementById("tap-distance-val");
  if (!tapDistanceVal) return;
  
  // タップ位置を取得
  const touch = e.changedTouches ? e.changedTouches[0] : e;
  const x = touch.clientX;
  const y = touch.clientY;
  
  // 画面サイズを取得
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // 画面中心を計算
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;
  
  // 中心からの距離をピクセルで計算
  const distanceX = Math.abs(x - centerX);
  const distanceY = Math.abs(y - centerY);
  
  // 画面サイズに対するパーセンテージに変換
  const percentX = (distanceX / screenWidth) * 100;
  const percentY = (distanceY / screenHeight) * 100;
  
  // 合計（小数点1桁）
  const totalPercent = percentX + percentY;
  tapDistanceVal.innerText = totalPercent.toFixed(1);
}

// クリックイベントにも対応（PC用）
document.addEventListener("click", updateTapDistance);

// --- AUDIO LEVEL MONITORING (マイク入力) ---
let audioContext = null;
let analyser = null;
let microphone = null;
let gainNode = null;
let dataArray = null;
let audioStream = null;
let audioUpdateInterval = null;
let isAudioMonitoring = false;

async function startAudioMonitoring() {
  if (isAudioMonitoring) return; // 既に動作中なら何もしない
  
  try {
    // マイク許可を取得
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Web Audio API のセットアップ
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(audioStream);
    gainNode = audioContext.createGain();
    
    // 感度を高く設定
    gainNode.gain.value = 5.0; // 5倍に増幅（感度高）
    
    // アナライザーの設定
    analyser.fftSize = 512; // より精細に
    analyser.smoothingTimeConstant = 0.3; // 反応を速く（0~1、低いほど敏感）
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    // マイク → ゲイン → アナライザー
    microphone.connect(gainNode);
    gainNode.connect(analyser);
    
    // 定期的に音量レベルを更新
    audioUpdateInterval = setInterval(() => {
      const audioLevelVal = document.getElementById("audio-level-val");
      if (!audioLevelVal) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      // 平均音量を計算
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // 0-255を0-50にマッピング
      const level = (average / 255) * 50;
      
      // 表示（小数点1桁）
      audioLevelVal.innerText = level.toFixed(1);
    }, 100);
    
    isAudioMonitoring = true;
    console.log("Audio monitoring started (High sensitivity, 0-50 range)");
  } catch (err) {
    console.error("Audio monitoring failed:", err);
    const audioLevelVal = document.getElementById("audio-level-val");
    if (audioLevelVal) {
      audioLevelVal.innerText = "ERR";
    }
  }
}

function stopAudioMonitoring() {
  if (!isAudioMonitoring) return; // 動作していなければ何もしない
  
  // インターバルを停止
  if (audioUpdateInterval) {
    clearInterval(audioUpdateInterval);
    audioUpdateInterval = null;
  }
  
  // Audio Contextをクローズ
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  
  // ストリームを停止
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
    audioStream = null;
  }
  
  analyser = null;
  microphone = null;
  gainNode = null;
  dataArray = null;
  isAudioMonitoring = false;
  
  console.log("Audio monitoring stopped");
}
