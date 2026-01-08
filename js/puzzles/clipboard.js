// クリップボード（Parasite）

export function render(config, gameStateRef) {
  return `
    <div class="clipboard-panel">
      <div style="font-size:10px; color:#888;">DATA PARASITE</div>
      <button class="clip-btn" data-action="${config.actionCopy}">COPY_INFECT</button>
      <button class="clip-btn" data-action="${config.actionPaste}">PASTE_CURE</button>
      <div id="paste-result" style="height:20px; color:#f00; font-size:12px;"></div>
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
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
    return true;
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
    return true;
  }
  return false;
}
