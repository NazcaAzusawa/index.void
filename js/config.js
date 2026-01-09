// js/config.js
// モジュールの配置情報と定義を一元管理

export const MODULE_COUNT = 40; // 1レーンあたりのモジュール数

export const MODULE_CONFIG = {
  // ------------------------------------------------
  // Index 0: Meta Buttons (システムメニュー)
  // ------------------------------------------------
  "top-0": { type: "system_menu", variant: "help",    label: "HELP",    action: "openHelp" },
  "mid-0": { type: "system_menu", variant: "records", label: "RECORDS", action: "openRecords" },
  "bot-0": { type: "system_menu", variant: "options", label: "OPTIONS", action: "openOptions" },

  // ------------------------------------------------
  // Index 1: RGB Buttons (物理ボタン)
  // ------------------------------------------------
  "top-1": { type: "rgb_button", color: "red",   action: "clickRgb" },
  "mid-1": { type: "rgb_button", color: "green", action: "clickRgb" },
  "bot-1": { type: "rgb_button", color: "blue",  action: "clickRgb" },

  // ------------------------------------------------
  // Index 2: MIMIC Puzzle (振動モジュール)
  // ------------------------------------------------
  "top-2": { type: "mimic_puzzle", action: "submitMimic" },

  // ------------------------------------------------
  // Index 3, 8, 15: Cable Socket (ケーブル断面)
  // ------------------------------------------------
  "top-3":  { type: "cable_socket", wires: ["red", "empty", "blue"] },
  "mid-8":  { type: "cable_socket", wires: ["empty", "red", "yellow"] },
  "bot-15": { type: "cable_socket", wires: ["blue", "yellow", "empty"] },

  // ------------------------------------------------
  // Index 10: Clipboard (Parasite)
  // ------------------------------------------------
  "mid-10": { type: "clipboard", actionCopy: "copyTrap", actionPaste: "pasteCheck" },

  // ------------------------------------------------
  // Index 13: Monitor (監視モニター)
  // ------------------------------------------------
  "mid-13": { type: "monitor", variant: "monitor" },

  // ------------------------------------------------
  // Index 18: Raw Beta Value (ジャイロ生データ)
  // ------------------------------------------------
  "bot-18": { type: "raw_data" },

  // ------------------------------------------------
  // Index 19: Cipher Text (暗号)
  // ------------------------------------------------
  "bot-19": { type: "cipher_text" },

  // ------------------------------------------------
  // 追加モジュール
  // ------------------------------------------------
  "bot-5": { type: "keypad" },          // テンキー
  "mid-5": { type: "tap_distance" },    // タップ距離モニター
  "top-5": { type: "audio_level" },     // 音声レベルモニター
  
  // ------------------------------------------------
  // 新規モジュール（見た目のみ）
  // ------------------------------------------------
  "top-6": { type: "ball_monitor" },    // ボールモニター（緑色）
  "mid-6": { type: "lock_mechanism" },  // ロック機構
  "bot-6": { type: "rainbow_screen" },  // 虹色タッチスクリーン
  
  // ------------------------------------------------
  // 顔検出モジュール
  // ------------------------------------------------
  "top-7": { type: "face_camera" },     // インカメ表示
  "mid-7": { type: "unhappy_panel" },   // YOU ARE UNHAPPY パネル
  
  // ------------------------------------------------
  // カラーボーダー＋カメラモジュール
  // ------------------------------------------------
  "top-8": { type: "color_camera" },    // カラーボーダー＋色判定
  
  // ------------------------------------------------
  // 迷路パズル（傾きセンサー）
  // ------------------------------------------------
  "top-9": { type: "maze" },            // 傾き迷路パズル
  
  // ------------------------------------------------
  // 時刻同期パズル
  // ------------------------------------------------
  "top-10": { type: "time_sync", variant: "device" },  // 端末時刻表示
  "bot-10": { type: "time_sync", variant: "api" },     // API時刻+1時間表示
};
