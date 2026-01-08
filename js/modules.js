import { MODULE_CONFIG } from "./config.js";

// ゲーム状態を外部から受け取るための参照（main.jsから設定される）
export let gameStateRef = null;

export function setGameStateRef(state) {
  gameStateRef = state;
}

// モジュールのHTML生成関数
export function renderModule(tier, index, params = {}) {
  const key = `${tier}-${index}`;
  const config = MODULE_CONFIG[key];

  if (!config) {
    // デフォルト: ダミーモジュール
    return `<div style="opacity:0.2; font-weight:bold; font-size:40px;">${index}</div>`;
  }

  const { type } = config;

  switch (type) {
    case "system_menu":
      return `<div class="meta-btn" data-action="${config.action}">${config.label}</div>`;

    case "rgb_button":
      const colorClass = `btn-${config.color}`;
      return `<div class="big-btn ${colorClass}" data-action="${config.action}"></div>`;

    case "mimic_puzzle":
      if (gameStateRef && gameStateRef.isMimicCleared) {
        return `<div style="color:#3f3; font-weight:bold; font-size:24px;">ACCESS GRANTED</div>`;
      }
      return `
        <div class="screen-frame">
          <input type="text" class="retro-input" placeholder="_____" maxlength="5"
            oninput="this.value = this.value.toUpperCase().replace(/[^A-Z]/g, '')">
        </div>
        <button class="send-btn" data-action="${config.action}">SEND</button>
      `;

    case "clipboard":
      return `
        <div class="clipboard-panel">
          <div style="font-size:10px; color:#888;">DATA PARASITE</div>
          <button class="clip-btn" data-action="${config.actionCopy}">COPY_INFECT</button>
          <button class="clip-btn" data-action="${config.actionPaste}">PASTE_CURE</button>
          <div id="paste-result" style="height:20px; color:#f00; font-size:12px;"></div>
        </div>
      `;

    case "raw_data":
      return `
        <div class="raw-data-panel">
          <span id="beta-val" class="raw-val">--.-</span>
        </div>
      `;

    case "cipher_text":
      return `
        <div class="cipher-panel">
          <div class="cipher-text">ESOY 6D<br>SY NRYS<br>246/-</div>
        </div>
      `;

    case "cable_socket":
      const wires = config.wires.map((wire) => {
        if (wire === "empty") {
          return '<div class="wire"></div>';
        }
        return `<div class="wire ${wire}"></div>`;
      });
      return `<div class="cable-socket">${wires.join("")}</div>`;

    case "monitor":
      const statusClass = gameStateRef && gameStateRef.isCablePowered
        ? "monitor-on"
        : "monitor-off";
      const text = gameStateRef && gameStateRef.isCablePowered
        ? "SYSTEM ONLINE<br>CABLE LINKED"
        : "NO SIGNAL";
      return `<div class="${statusClass}" id="cable-monitor">${text}</div>`;

    default:
      return `<div style="opacity:0.2; font-weight:bold; font-size:40px;">${index}</div>`;
  }
}

// アクション処理関数
export function handleAction(action, tier, index, element, gameState, showModal, triggerMorseVibration) {
  console.log(`Action: ${action} / Tier: ${tier}`);

  // A. Meta Buttons (モーダル表示)
  if (action === "openHelp") {
    showModal(
      "HELP",
      "This is not a game.\nDo not touch anything.\n\n...unless you have to."
    );
    return;
  }
  if (action === "openRecords") {
    showModal(
      "RECORDS",
      "No Data Found.\n\n[LOCKED] - 0/10\n[LOCKED] - 0/5"
    );
    return;
  }
  if (action === "openOptions") {
    showModal("OPTIONS", "Audio: ON\nVibration: ON\nReality: UNSTABLE");
    return;
  }

  // B. RGB Buttons
  if (action === "clickRgb") {
    console.log(`${tier} button clicked.`);
    return;
  }

  // C. MIMIC Puzzle (モールス信号)
  if (action === "submitMimic") {
    const input = element.parentElement.querySelector("input");
    const val = input.value;

    if (val === "MIMIC") {
      // 正解処理
      gameState.isMimicCleared = true;
      showModal("SYSTEM", "ACCESS GRANTED.\n\nModule unlocked.");
      element.parentElement.innerHTML = `<div style="color:#3f3; font-weight:bold; font-size:24px;">ACCESS GRANTED</div>`;
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); // 成功バイブ
      }
    } else {
      // 不正解処理 (バイブレーション)
      triggerMorseVibration();
      input.value = "";
      input.placeholder = "ERROR";
      setTimeout(() => (input.placeholder = "_____"), 1000);
    }
    return;
  }

  // D. Clipboard Actions
  if (action === "copyTrap") {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText("PAXXIXPAXX")
        .then(() => {
          const btn = element;
          const originalText = btn.innerText;
          btn.innerText = "COPIED";
          btn.style.color = "#3f3";
          setTimeout(() => {
            btn.innerText = originalText;
            btn.style.color = "";
          }, 1000);
        })
        .catch((err) => console.error(err));
    }
    return;
  }

  if (action === "pasteCheck") {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard
        .readText()
        .then((text) => {
          const resultEl = element.parentElement.querySelector("#paste-result");
          if (text && text.trim() === "PASS") {
            resultEl.style.color = "#3f3";
            resultEl.innerText = "CURE COMPLETE";
          } else {
            resultEl.style.color = "#f00";
            resultEl.innerText = "INVALID DATA";
            triggerMorseVibration();
          }
        })
        .catch((err) => {
          const resultEl = element.parentElement.querySelector("#paste-result");
          resultEl.innerText = "READ ERROR";
        });
    }
    return;
  }

  // E. Gyro Request
  if (action === "reqGyro") {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then((resp) => {
          if (resp === "granted") {
            // startGyroはmain.jsで実装
            if (window.startGyro) {
              window.startGyro();
            }
          }
        })
        .catch(console.error);
    } else {
      if (window.startGyro) {
        window.startGyro();
      }
    }
    return;
  }
}

// 振動パズルロジック
export function triggerMorseVibration(gameState) {
  if (!navigator.vibrate) {
    console.log("Vibration API not supported.");
    return;
  }

  gameState.mimicAttempt++;

  // ループ処理 (1〜5のサイクル)
  // 1,3: M (--)
  // 2,4: I (..)
  // 5  : C (-.-.)
  let step = ((gameState.mimicAttempt - 1) % 5) + 1;

  let pattern = [];

  if (step === 1 || step === 3) {
    // M (--) : Dash, Dash
    pattern = [300, 100, 300];
    console.log("Vib: M (--)");
  } else if (step === 2 || step === 4) {
    // I (..) : Dot, Dot
    pattern = [100, 100, 100];
    console.log("Vib: I (..)");
  } else if (step === 5) {
    // C (-.-.) : Dash, Dot, Dash, Dot
    pattern = [300, 100, 100, 100, 300, 100, 100];
    console.log("Vib: C (-.-.)");
  }

  navigator.vibrate(pattern);
}

