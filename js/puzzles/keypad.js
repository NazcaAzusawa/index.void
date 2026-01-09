// js/puzzles/keypad.js
// テンキー

export function render(config, gameStateRef) {
  return `
    <div class="keypad-container">
      <div class="keypad-display" id="keypad-display">----</div>
      <div class="keypad-grid">
        <button class="key-btn" data-action="keyPress" data-key="1">1</button>
        <button class="key-btn" data-action="keyPress" data-key="2">2</button>
        <button class="key-btn" data-action="keyPress" data-key="3">3</button>
        <button class="key-btn" data-action="keyPress" data-key="4">4</button>
        <button class="key-btn" data-action="keyPress" data-key="5">5</button>
        <button class="key-btn" data-action="keyPress" data-key="6">6</button>
        <button class="key-btn" data-action="keyPress" data-key="7">7</button>
        <button class="key-btn" data-action="keyPress" data-key="8">8</button>
        <button class="key-btn" data-action="keyPress" data-key="9">9</button>
        <button class="key-btn key-special" data-action="keyPress" data-key="*">*</button>
        <button class="key-btn" data-action="keyPress" data-key="0">0</button>
        <button class="key-btn key-special" data-action="keyPress" data-key="#">#</button>
      </div>
    </div>
  `;
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  if (action === "keyPress") {
    const key = element.dataset.key;
    const display = element.closest('.keypad-container').querySelector('#keypad-display');
    
    // 現在の表示を取得
    let current = display.innerText;
    if (current === "----") current = "";
    
    // 4桁まで入力可能
    if (current.length < 4) {
      current += key;
      display.innerText = current;
      
      // 振動フィードバック
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
      
      // 4桁になったら判定（例：正解は1234）
      if (current.length === 4) {
        if (current === "1234") {
          display.style.color = "#3f3";
          display.innerText = "OK";
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }
        } else {
          display.style.color = "#f33";
          setTimeout(() => {
            display.innerText = "----";
            display.style.color = "";
          }, 1000);
        }
      }
    }
    
    return true;
  }
  return false;
}
