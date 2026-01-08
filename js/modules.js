import { MODULE_CONFIG } from "./config.js";

// 各パズルファイルのインポート
// ※ monitor.js や cipher.js は不要になりました（統合したため）
import * as systemPuzzle from "./puzzles/system.js";
import * as rgbPuzzle from "./puzzles/rgb.js"; // rgb.js または rgb_button.js (ファイル名に合わせてください)
import * as mimicPuzzle from "./puzzles/mimic.js";
import * as clipboardPuzzle from "./puzzles/clipboard.js";
import * as gyroPuzzle from "./puzzles/gyro.js";   // ★ジャイロ＆暗号兼用
import * as cablePuzzle from "./puzzles/cable.js"; // ★ケーブル＆モニター兼用

// ゲーム状態を外部から受け取るための参照
export let gameStateRef = null;

export function setGameStateRef(state) {
  gameStateRef = state;
}

// ★ここが修正ポイント！
// config.js の type 名を、実際の js ファイルに割り当てる辞書
const puzzleMap = {
  system_menu: systemPuzzle,
  rgb_button: rgbPuzzle,
  mimic_puzzle: mimicPuzzle,
  clipboard: clipboardPuzzle,
  
  // ジャイロ系 (どっちも gyro.js へ)
  raw_data: gyroPuzzle,
  cipher_text: gyroPuzzle,
  
  // ケーブル系 (どっちも cable.js へ)
  cable_socket: cablePuzzle,
  monitor: cablePuzzle,
};

// モジュールのHTML生成関数
export function renderModule(tier, index, params = {}) {
  const key = `${tier}-${index}`;
  const config = MODULE_CONFIG[key];

  // Configにない場所はダミーを表示
  if (!config) {
    return `<div style="opacity:0.2; font-weight:bold; font-size:40px;">${index}</div>`;
  }

  const { type } = config;
  const puzzle = puzzleMap[type];

  // パズルファイルに render 関数があればそれを呼ぶ
  if (puzzle && puzzle.render) {
    return puzzle.render(config, gameStateRef);
  }

  // フォールバック: パズルが見つからない場合
  return `<div style="opacity:0.2; font-weight:bold; font-size:20px;">ERR:${type}</div>`;
}

// アクション処理関数
export function handleAction(action, tier, index, element, gameState, showModal, triggerMorseVibration) {
  console.log(`Action: ${action} / Tier: ${tier}`);

  const key = `${tier}-${index}`;
  const config = MODULE_CONFIG[key];

  if (!config) {
    return;
  }

  const { type } = config;
  const puzzle = puzzleMap[type];

  // パズルファイルに handleAction 関数があればそれを呼ぶ
  if (puzzle && puzzle.handleAction) {
    // config も渡すことで、パズル側で variant 判定などができるようになる
    const handled = puzzle.handleAction(
      action,
      config,
      tier,
      index,
      element,
      gameState,
      showModal,
      triggerMorseVibration
    );
    
    if (handled) {
      return;
    }
  }
}

// 振動パズルロジック（mimic.js から再エクスポート）
// メインループや他の場所から呼び出すためのブリッジ
export function triggerMorseVibration(gameState) {
  if (mimicPuzzle && mimicPuzzle.triggerMorseVibration) {
    mimicPuzzle.triggerMorseVibration(gameState);
  }
}