// js/puzzles/time_sync.js
// 時刻同期パズル（端末時刻 vs API時刻+1時間）

// API時刻の基準値（初回取得時のタイムスタンプ）
let apiBaseTime = null;
let apiBaseLocalTime = null; // API取得時の端末時刻

// 更新インターバル
let updateInterval = null;
let isActive = false;

export function render(config, gameStateRef) {
  const variant = config.variant; // "device" or "api"
  
  if (variant === "device") {
    // 端末時刻（青字）
    return `
      <div class="time-sync-container">
        <div class="time-label">It is</div>
        <div class="time-monitor device-time" id="device-time-top-10">--:--</div>
      </div>
    `;
  } else {
    // API時刻+1時間（赤字）
    return `
      <div class="time-sync-container">
        <div class="time-label">Come at</div>
        <div class="time-monitor api-time" id="api-time-bot-10">--:--</div>
      </div>
    `;
  }
}

export function handleAction(action, config, tier, index, element, gameState, showModal, triggerMorseVibration) {
  return false;
}

// 時刻をHH:MM形式でフォーマット
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 端末時刻を更新
function updateDeviceTime() {
  const deviceTimeEl = document.getElementById('device-time-top-10');
  if (!deviceTimeEl) return;
  
  const now = new Date();
  deviceTimeEl.innerText = formatTime(now);
}

// API時刻+1時間を更新
function updateApiTime() {
  const apiTimeEl = document.getElementById('api-time-bot-10');
  if (!apiTimeEl || !apiBaseTime) return;
  
  // 経過時間を計算
  const now = new Date();
  const elapsed = now.getTime() - apiBaseLocalTime.getTime();
  
  // API時刻 + 経過時間 + 1時間
  const apiCurrentTime = new Date(apiBaseTime.getTime() + elapsed + 60 * 60 * 1000);
  apiTimeEl.innerText = formatTime(apiCurrentTime);
  
  return apiCurrentTime;
}

// 時刻の一致判定（分単位）
function checkTimeMatch(gameState) {
  if (!apiBaseTime) return false;
  
  const deviceTime = new Date();
  const apiTime = updateApiTime();
  
  if (!apiTime) return false;
  
  // 時と分が一致しているかチェック
  const deviceHour = deviceTime.getHours();
  const deviceMinute = deviceTime.getMinutes();
  const apiHour = apiTime.getHours();
  const apiMinute = apiTime.getMinutes();
  
  if (deviceHour === apiHour && deviceMinute === apiMinute && !gameState.isTimeSyncCleared) {
    gameState.isTimeSyncCleared = true;
    
    // 効果音再生
    const audio = new Audio("ac.wav");
    audio.volume = 0.5;
    audio.play().catch(err => console.log("Audio play failed:", err));
    
    console.log("Time sync cleared!");
    
    // 両方の時刻を緑色に変える
    const deviceTimeEl = document.getElementById('device-time-top-10');
    const apiTimeEl = document.getElementById('api-time-bot-10');
    if (deviceTimeEl) {
      deviceTimeEl.style.color = '#33ff33';
      deviceTimeEl.style.textShadow = '0 0 10px rgba(51, 255, 51, 0.8)';
    }
    if (apiTimeEl) {
      apiTimeEl.style.color = '#33ff33';
      apiTimeEl.style.textShadow = '0 0 10px rgba(51, 255, 51, 0.8)';
    }
    
    return true;
  }
  
  return false;
}

// API時刻を取得
async function fetchApiTime() {
  try {
    const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Tokyo');
    const data = await response.json();
    
    // API時刻を取得
    const apiDateTime = new Date(data.datetime);
    apiBaseTime = apiDateTime;
    apiBaseLocalTime = new Date(); // 取得時の端末時刻
    
    console.log('API time fetched:', formatTime(apiDateTime));
    console.log('API time + 1 hour:', formatTime(new Date(apiDateTime.getTime() + 60 * 60 * 1000)));
    
    return true;
  } catch (err) {
    console.error('Failed to fetch API time:', err);
    
    // エラー時は現在時刻を使用（フォールバック）
    apiBaseTime = new Date();
    apiBaseLocalTime = new Date();
    
    return false;
  }
}

// 時刻同期パズルを初期化
export async function initTimeSync(gameState) {
  if (isActive) return;
  
  isActive = true;
  
  // API時刻を取得
  await fetchApiTime();
  
  // 初回更新
  updateDeviceTime();
  updateApiTime();
  
  // 1秒ごとに更新
  updateInterval = setInterval(() => {
    updateDeviceTime();
    updateApiTime();
    checkTimeMatch(gameState);
  }, 1000);
  
  console.log('Time sync puzzle initialized');
}

// 時刻同期パズルを停止
export function stopTimeSync() {
  if (!isActive) return;
  
  isActive = false;
  
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  
  console.log('Time sync puzzle stopped');
}
