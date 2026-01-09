// js/achievements.js
// 実績システム

// 実績の定義
export const ACHIEVEMENTS = [
  {
    id: "mimic",
    name: "ECHO CHAMBER",
    description: "正しい答えを模倣し、システムを欺いた",
    flag: "isMimicCleared",
    icon: "🌍"
  },
  {
    id: "cable",
    name: "NEURAL LINK",
    description: "3つの神経を正しく接続し、5秒間維持した",
    flag: "isCableCleared",
    icon: "🌎"
  },
  {
    id: "ball",
    name: "VOID CLEANER",
    description: "全ての粒子を虚空へ押し出した",
    flag: "isBallPuzzleCleared",
    icon: "🌏"
  },
  {
    id: "gyro",
    name: "HORIZON SEEKER",
    description: "135度の地平線を5秒間見つめ続けた",
    flag: "isGyroCleared",
    icon: "🌐"
  },
  {
    id: "clipboard",
    name: "PARASITE CURE",
    description: "感染データを浄化し、PASSを発見した",
    flag: "isClipboardCleared",
    icon: "🌍"
  },
  {
    id: "lock",
    name: "SYNC BREAKER",
    description: "ロック機構を使用し、次元を同期させた",
    flag: "isLockUsed",
    icon: "🌎"
  },
  {
    id: "triple_zero",
    name: "ABSOLUTE ZERO",
    description: "3つのセンサーを同時にゼロにし、5秒間維持した",
    flag: "isTripleZeroCleared",
    icon: "🌏"
  }
];

// 実績ウィンドウを開く
export function openAchievements(gameState) {
  const modal = document.getElementById("achievement-modal");
  if (!modal) {
    createAchievementModal();
  }
  
  updateAchievementList(gameState);
  document.getElementById("achievement-modal").classList.add("show");
}

// 実績ウィンドウを閉じる
export function closeAchievements() {
  document.getElementById("achievement-modal").classList.remove("show");
}

// グローバルに公開
window.openAchievements = openAchievements;
window.closeAchievements = closeAchievements;

// 実績モーダルを作成
function createAchievementModal() {
  const modal = document.createElement("div");
  modal.id = "achievement-modal";
  modal.className = "achievement-modal";
  
  modal.innerHTML = `
    <div class="achievement-window">
      <div class="achievement-header">
        <span class="achievement-title">PARALLEL WORLDS</span>
        <button class="achievement-close" onclick="closeAchievements()">×</button>
      </div>
      <div class="achievement-list" id="achievement-list">
        <!-- 実績リストがここに動的に生成される -->
      </div>
    </div>
    <div class="achievement-detail-modal" id="achievement-detail">
      <div class="achievement-detail-window">
        <div class="achievement-detail-header">
          <span id="detail-name"></span>
          <button class="achievement-close" onclick="closeDetail()">×</button>
        </div>
        <div class="achievement-detail-body">
          <div class="detail-icon" id="detail-icon">🌍</div>
          <div class="detail-desc" id="detail-desc"></div>
          <div class="detail-status" id="detail-status"></div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// 実績リストを更新
function updateAchievementList(gameState) {
  const listEl = document.getElementById("achievement-list");
  if (!listEl) return;
  
  listEl.innerHTML = "";
  
  ACHIEVEMENTS.forEach(achievement => {
    const isUnlocked = gameState[achievement.flag] || false;
    const itemEl = document.createElement("div");
    itemEl.className = `achievement-item ${isUnlocked ? "unlocked" : "locked"}`;
    
    itemEl.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-status">${isUnlocked ? "DESTROYED" : "LIVING"}</div>
      <div class="achievement-name">${achievement.name}</div>
    `;
    
    if (isUnlocked) {
      itemEl.addEventListener("click", () => {
        showDetail(achievement, gameState);
      });
    }
    
    listEl.appendChild(itemEl);
  });
}

// 詳細を表示
function showDetail(achievement, gameState) {
  const detailModal = document.getElementById("achievement-detail");
  document.getElementById("detail-name").innerText = achievement.name;
  document.getElementById("detail-icon").innerText = achievement.icon;
  document.getElementById("detail-desc").innerText = achievement.description;
  document.getElementById("detail-status").innerText = "STATUS: DESTROYED";
  
  detailModal.classList.add("show");
}

// 詳細を閉じる
window.closeDetail = function() {
  document.getElementById("achievement-detail").classList.remove("show");
};
