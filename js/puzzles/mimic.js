// MIMICパズル（振動モジュール）

export function render(config, gameStateRef) {
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
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  if (action === "submitMimic") {
    const input = element.parentElement.querySelector("input");
    const val = input.value;

    if (val === "MIMIC") {
      // 正解処理
      gameState.isMimicCleared = true;
      // 効果音再生
      const audio = new Audio("ac.wav");
      audio.volume = 0.5;
      audio.play().catch(err => console.log("Audio play failed:", err));
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
    return true;
  }
  return false;
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
