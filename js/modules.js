import { MODULE_CONFIG } from "./config.js";

// 各パズルファイルのインポート
import * as systemPuzzle from "./puzzles/system.js";
import * as rgbButtonPuzzle from "./puzzles/rgb_button.js"; // RGBボタン
import * as mimicPuzzle from "./puzzles/mimic.js";
import * as clipboardPuzzle from "./puzzles/clipboard.js";
import * as rawDataPuzzle from "./puzzles/raw_data.js";   // ジャイロ生データ（CRTモニター）
import * as cipherTextPuzzle from "./puzzles/cipher_text.js"; // 暗号テキスト（金属パネル）
import * as cableSocketPuzzle from "./puzzles/cable_socket.js"; // ケーブルソケット
import * as monitorPuzzle from "./puzzles/monitor.js"; // モニター
import * as keypadPuzzle from "./puzzles/keypad.js"; // テンキー
import * as tapDistancePuzzle from "./puzzles/tap_distance.js"; // タップ距離モニター
import * as audioLevelPuzzle from "./puzzles/audio_level.js"; // 音声レベルモニター
import * as ballMonitorPuzzle from "./puzzles/ball_monitor.js"; // ボールモニター
import * as lockMechanismPuzzle from "./puzzles/lock_mechanism.js"; // ロック機構
import * as rainbowScreenPuzzle from "./puzzles/rainbow_screen.js"; // 虹色タッチスクリーン
import * as faceCameraPuzzle from "./puzzles/face_camera.js"; // 顔カメラ
import * as unhappyPanelPuzzle from "./puzzles/unhappy_panel.js"; // UNHAPPYパネル

// ゲーム状態を外部から受け取るための参照
export let gameStateRef = null;

export function setGameStateRef(state) {
  gameStateRef = state;
}

// config.js の type 名を、実際の js ファイルに割り当てる辞書
const puzzleMap = {
  system_menu: systemPuzzle,
  rgb_button: rgbButtonPuzzle,  // RGBボタン（将来的にrgb_display等を追加可能）
  mimic_puzzle: mimicPuzzle,
  clipboard: clipboardPuzzle,
  
  // 分離: ジャイロ生データと暗号テキスト
  raw_data: rawDataPuzzle,      // BOT-18: CRTモニター風（再利用可能）
  cipher_text: cipherTextPuzzle, // BOT-19: 金属パネル風
  
  // 分離: ケーブルソケットとモニター
  cable_socket: cableSocketPuzzle, // T:3, M:8, B:15: ケーブル断面
  monitor: monitorPuzzle,          // M:13: ケーブル接続監視モニター
  
  // 新規追加モジュール
  keypad: keypadPuzzle,           // テンキー
  tap_distance: tapDistancePuzzle, // タップ距離モニター
  audio_level: audioLevelPuzzle,   // 音声レベルモニター
  
  // 新規モジュール（見た目のみ）
  ball_monitor: ballMonitorPuzzle,     // ボールモニター
  lock_mechanism: lockMechanismPuzzle, // ロック機構
  rainbow_screen: rainbowScreenPuzzle, // 虹色タッチスクリーン
  
  // 顔検出モジュール
  face_camera: faceCameraPuzzle,       // インカメ表示
  unhappy_panel: unhappyPanelPuzzle,   // UNHAPPYパネル
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
