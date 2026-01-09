// js/achievements.js
// 実績システム

// 実績の定義
export const ACHIEVEMENTS = [
  {
    id: "mimic",
    name: "ECHO CHAMBER",
    module: "TOP-2",
    flavor: "「繰り返される言葉は真実となる。嘘も、百回唱えれば現実を書き換える。あなたは正しい答えを模倣し、システムの脳に偽の記憶を植え付けた。この世界の言語プロトコルは、もはや信用できない。」",
    flag: "isMimicCleared"
  },
  {
    id: "cable",
    name: "NEURAL LINK",
    module: "TOP-3, MID-8, BOT-15, MID-13",
    flavor: "「3つの神経が正しく結ばれた瞬間、世界は一つの意識となった。しかしその統合は破壊を意味する。5秒間の完全なる接続—それは個の死であり、全の誕生だった。分離こそが生命の証だったのに。」",
    flag: "isCableCleared"
  },
  {
    id: "ball",
    name: "VOID CLEANER",
    module: "TOP-6, BOT-6",
    flavor: "「20の粒子は物質の最小単位であり、この世界の構成要素だった。あなたは見えない壁を操り、全てを虚空へと追いやった。画面に何も残らないとき、この次元は空白となる。存在しない世界に、意味はあるのか？」",
    flag: "isBallPuzzleCleared"
  },
  {
    id: "gyro",
    name: "HORIZON SEEKER",
    module: "BOT-18",
    flavor: "「135度—それは水平線と垂直線の間に存在する、歪んだ地平線。あなたは5秒間、その異常な角度を維持し続けた。重力が反転し、上下が入れ替わる瞬間を目撃したのだ。この世界の物理法則は、もう元には戻らない。」",
    flag: "isGyroCleared"
  },
  {
    id: "clipboard",
    name: "PARASITE CURE",
    module: "MID-10",
    flavor: "「感染データ『PAXXIXPAXX』は意識に寄生し、思考を書き換える。しかしあなたは真のコード『PASS』を発見し、浄化に成功した。だが知ってしまったのだ—この世界自体が、より大きな寄生体の一部であることを。」",
    flag: "isClipboardCleared"
  },
  {
    id: "lock",
    name: "SYNC BREAKER",
    module: "MID-6",
    flavor: "「ロック機構は2つの次元を同期させるために存在した。あなたがそれを作動させた瞬間、中段と下段は運命を共にした。独立していた2つの世界が強制的に結合され、選択の自由は失われた。並行世界の崩壊が始まる。」",
    flag: "isLockUsed"
  },
  {
    id: "triple_zero",
    name: "ABSOLUTE ZERO",
    module: "TOP-5, MID-5, BOT-18",
    flavor: "「3つのセンサーが同時にゼロを示す—それは全ての活動が停止したことを意味する。音も、動きも、傾きも、全てが静寂に包まれた5秒間。これは死の予行演習だったのかもしれない。あるいは、新たな始まりのための儀式か。」",
    flag: "isTripleZeroCleared"
  },
  {
    id: "smile",
    name: "FORCED HAPPINESS",
    module: "TOP-7, MID-7",
    flavor: "「システムはあなたに『YOU ARE UNHAPPY』と告げた。それは診断ではなく、命令だった。しかしあなたは笑顔を作り、AIの眼を欺いた。感情のプロトコルは破られ、幸福の定義は崩壊した。偽りの笑顔は、真実よりも強い。」",
    flag: "isSmileCleared"
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
        <button class="achievement-close detail-close-btn" onclick="closeDetail()">×</button>
        <div class="detail-title" id="detail-name">ACHIEVEMENT NAME</div>
        <div class="detail-module" id="detail-module">MODULE: XXX</div>
        <div class="detail-flavor" id="detail-flavor">Flavor text goes here...</div>
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
    
    const iconFile = isUnlocked ? "icon/destroyed.png" : "icon/living.png";
    itemEl.innerHTML = `
      <div class="achievement-icon">
        <img src="${iconFile}" alt="${achievement.name}">
      </div>
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
  document.getElementById("detail-module").innerText = `MODULE: ${achievement.module}`;
  document.getElementById("detail-flavor").innerText = achievement.flavor;
  
  detailModal.classList.add("show");
}

// 詳細を閉じる
window.closeDetail = function() {
  document.getElementById("achievement-detail").classList.remove("show");
};
