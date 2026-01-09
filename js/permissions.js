// js/permissions.js
// 権限管理システム

// 全ての権限をリクエスト
export async function requestAllPermissions() {
  const results = {
    gyro: false,
    microphone: false,
    camera: false,
    clipboard: false,
    notification: false,
    bluetooth: false,
    nfc: false,
    vibration: false
  };
  
  let messages = [];
  
  // 1. ジャイロセンサー（iOS 13+のみ）
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      const response = await DeviceOrientationEvent.requestPermission();
      results.gyro = response === 'granted';
      messages.push(`Gyro: ${response}`);
    } else {
      results.gyro = true; // 権限不要な環境
      messages.push('Gyro: Auto-granted (no permission needed)');
    }
  } catch (err) {
    messages.push(`Gyro: Failed - ${err.message}`);
  }
  
  // 2. マイク
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    results.microphone = true;
    messages.push('Microphone: Granted');
    stream.getTracks().forEach(track => track.stop()); // すぐに停止
  } catch (err) {
    messages.push(`Microphone: Failed - ${err.message}`);
  }
  
  // 3. カメラ
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    results.camera = true;
    messages.push('Camera: Granted');
    stream.getTracks().forEach(track => track.stop()); // すぐに停止
  } catch (err) {
    messages.push(`Camera: Failed - ${err.message}`);
  }
  
  // 4. クリップボード（読み取り）
  try {
    await navigator.clipboard.readText();
    results.clipboard = true;
    messages.push('Clipboard: Granted');
  } catch (err) {
    // 空の場合もエラーになるので、それは成功とみなす
    if (err.name === 'NotAllowedError') {
      messages.push(`Clipboard: Denied`);
    } else {
      results.clipboard = true;
      messages.push('Clipboard: Granted');
    }
  }
  
  // 5. 通知
  try {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      results.notification = permission === 'granted';
      messages.push(`Notification: ${permission}`);
    } else {
      messages.push('Notification: Not supported');
    }
  } catch (err) {
    messages.push(`Notification: Failed - ${err.message}`);
  }
  
  // 6. Bluetooth
  try {
    if ('bluetooth' in navigator) {
      // Bluetoothデバイスを要求（ユーザーがキャンセルする可能性あり）
      try {
        await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [] // 全てのサービスを許可
        });
        results.bluetooth = true;
        messages.push('Bluetooth: Granted');
      } catch (err) {
        if (err.name === 'NotFoundError') {
          messages.push('Bluetooth: No device selected (cancelled)');
        } else {
          messages.push(`Bluetooth: ${err.message}`);
        }
      }
    } else {
      messages.push('Bluetooth: Not supported');
    }
  } catch (err) {
    messages.push(`Bluetooth: Failed - ${err.message}`);
  }
  
  // 7. NFC
  try {
    if ('NDEFReader' in window) {
      // NFCの読み取りを開始（権限要求）
      const ndef = new NDEFReader();
      await ndef.scan();
      results.nfc = true;
      messages.push('NFC: Granted');
    } else {
      messages.push('NFC: Not supported');
    }
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      messages.push('NFC: Denied');
    } else {
      messages.push(`NFC: ${err.message}`);
    }
  }
  
  // 8. 振動（権限不要）
  try {
    if ('vibrate' in navigator) {
      results.vibration = true;
      messages.push('Vibration: Available');
    } else {
      messages.push('Vibration: Not supported');
    }
  } catch (err) {
    messages.push(`Vibration: Failed - ${err.message}`);
  }
  
  return { results, messages };
}

// 権限ウィンドウを表示
export function showPermissionWindow() {
  const existing = document.getElementById('permission-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'permission-modal';
  modal.className = 'permission-modal';
  modal.innerHTML = `
    <div class="permission-window">
      <div class="permission-header">
        <span>SYSTEM PERMISSIONS</span>
        <button class="sys-close" onclick="closePermissionWindow()">×</button>
      </div>
      <div class="permission-body">
        <div class="permission-description">
          このアプリケーションは以下の権限を使用します：<br>
          <br>
          • ジャイロセンサー（傾き検知）<br>
          • マイク（音声レベル検知）<br>
          • カメラ（将来の機能用）<br>
          • クリップボード（データ操作）<br>
          • 通知（イベント通知）<br>
          • Bluetooth（デバイス連携）<br>
          • NFC（近距離通信）<br>
          • 振動（ハプティックフィードバック）<br>
        </div>
        <button class="permission-btn" id="request-all-btn">全ての権限を許可</button>
        <div class="permission-log" id="permission-log"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'flex';
  
  // ボタンイベント
  document.getElementById('request-all-btn').addEventListener('click', async () => {
    const btn = document.getElementById('request-all-btn');
    const log = document.getElementById('permission-log');
    
    btn.disabled = true;
    btn.innerText = '許可を要求中...';
    log.innerHTML = '処理中...<br>';
    
    const { results, messages } = await requestAllPermissions();
    
    log.innerHTML = messages.map(msg => `<div class="log-line">${msg}</div>`).join('');
    
    btn.innerText = '完了';
    setTimeout(() => {
      btn.disabled = false;
      btn.innerText = '再試行';
    }, 2000);
  });
}

// 権限ウィンドウを閉じる
window.closePermissionWindow = function() {
  const modal = document.getElementById('permission-modal');
  if (modal) modal.remove();
};
