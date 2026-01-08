import { MODULE_COUNT } from "./config.js";
import { renderModule, handleAction, triggerMorseVibration, setGameStateRef } from "./modules.js";

// --- STATE MANAGEMENT (脳) ---
const gameState = {
  activeIndices: { top: 0, mid: 0, bot: 0 },
  mimicAttempt: 0, // MIMICパズルの失敗回数カウント
  isMimicCleared: false,
  horizonTimer: 0, // ジャイロの静止時間計測用
  isCablePowered: false, // ケーブルが繋がったかどうかのフラグ
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
    // クローンと本体を区別しない共通の識別子を持たせる

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

  // 現在の各段のズレを計算 (20個のループを考慮)
  // 基準: T:3, M:8, B:15 で繋がる
  // つまり、常に以下の関係が維持されていればOK
  // Top = (Mid - 5)
  // Bot = (Mid + 7)

  // JSの % は負の数になることがあるので、+20 してから % 20 する
  const targetTop = (mid - 5 + 20) % 20;
  const targetBot = (mid + 7 + 20) % 20;

  // 現在の位置がターゲットと一致しているか
  const isConnected = top === targetTop && bot === targetBot;

  if (isConnected) {
    if (!gameState.isCablePowered) {
      gameState.isCablePowered = true;
      console.log("CABLE CONNECTED (Internal)");
    }
  } else {
    if (gameState.isCablePowered) {
      gameState.isCablePowered = false;
    }
  }

  // モニター表示の更新 (Mid-13を見ている時だけ反映)
  // ※ checkCableConnectionは常時回っているので、ここでDOM更新してもOK
  const monitor = document.getElementById("cable-monitor");
  if (monitor) {
    if (gameState.isCablePowered) {
      // 繋がっていればオンライン表示
      monitor.className = "monitor-on";
      monitor.innerHTML = "SYSTEM ONLINE<br>CABLE LINKED";
    } else {
      // 切れていればオフライン
      monitor.className = "monitor-off";
      monitor.innerHTML = "NO SIGNAL";
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

// トリプルタップ全画面
let tapCnt = 0,
  lastTap = 0;
document.addEventListener("touchend", () => {
  const now = new Date().getTime();
  if (now - lastTap < 400) {
    tapCnt++;
    if (tapCnt >= 3) {
      document.documentElement.requestFullscreen().catch(() => {});
      tapCnt = 0;
    }
  } else tapCnt = 1;
  lastTap = now;
});

