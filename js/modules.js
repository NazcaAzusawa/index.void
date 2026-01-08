import { MODULE_CONFIG } from "./config.js";
import * as systemPuzzle from "./puzzles/system.js";
import * as rgbPuzzle from "./puzzles/rgb.js";
import * as mimicPuzzle from "./puzzles/mimic.js";
import * as clipboardPuzzle from "./puzzles/clipboard.js";
import * as gyroPuzzle from "./puzzles/gyro.js";
import * as cipherPuzzle from "./puzzles/cipher.js";
import * as cablePuzzle from "./puzzles/cable.js";
import * as monitorPuzzle from "./puzzles/monitor.js";

// ゲーム状態を外部から受け取るための参照（main.jsから設定される）
export let gameStateRef = null;

export function setGameStateRef(state) {
  gameStateRef = state;
}

// type 名からパズルモジュールへのマッピング
const puzzleMap = {
  system_menu: systemPuzzle,
  rgb_button: rgbPuzzle,
  mimic_puzzle: mimicPuzzle,
  clipboard: clipboardPuzzle,
  raw_data: gyroPuzzle,
  cipher_text: cipherPuzzle,
  cable_socket: cablePuzzle,
  monitor: monitorPuzzle,
};

// モジュールのHTML生成関数
export function renderModule(tier, index, params = {}) {
  const key = `${tier}-${index}`;
  const config = MODULE_CONFIG[key];

  if (!config) {
    // デフォルト: ダミーモジュール
    return `<div style="opacity:0.2; font-weight:bold; font-size:40px;">${index}</div>`;
  }

  const { type } = config;
  const puzzle = puzzleMap[type];

  if (puzzle && puzzle.render) {
    return puzzle.render(config, gameStateRef);
  }

  // フォールバック: ダミーモジュール
  return `<div style="opacity:0.2; font-weight:bold; font-size:40px;">${index}</div>`;
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

  if (puzzle && puzzle.handleAction) {
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
export function triggerMorseVibration(gameState) {
  if (mimicPuzzle.triggerMorseVibration) {
    mimicPuzzle.triggerMorseVibration(gameState);
  }
}
