// プロジェクト管理用JavaScript

// グローバル変数
let projects = [];

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    renderProjects();
});

// プロジェクトフォームの表示/非表示を切り替え
function toggleProjectForm() {
    const form = document.getElementById('projectForm');
    form.classList.toggle('hidden');
    
    // フォームが表示される時はリセット
    if (!form.classList.contains('hidden')) {
        document.getElementById('createProjectForm').reset();
    }
}


// プロジェクトを作成
function createProject(event) {
    event.preventDefault();
    
    const projectName = document.getElementById('projectName').value;
    const finalGoal = document.getElementById('finalGoal').value;
    const basePoints = parseInt(document.getElementById('basePoints').value);
    
    // 新しいプロジェクトオブジェクトを作成
    const newProject = {
        id: Date.now().toString(),
        name: projectName,
        goal: finalGoal,
        tree: '🌱',  // 初期は種
        emoji: '🌱', // 互換性のため残す
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stage: 'seed', // seed, sprout, growth, bloom
        progress: 0,
        tasks: [],
        completedTasks: 0,
        level: 1,
        pt: 0,
        basePoints: basePoints, // レベルアップの基準ポイント
        ptForNextLevel: basePoints // 最初は基準ポイントと同じ
    };
    
    // プロジェクトを追加
    projects.push(newProject);
    
    // ローカルストレージに保存
    saveProjects();
    
    // プロジェクト一覧を再表示
    renderProjects();
    
    // フォームを閉じる
    toggleProjectForm();
    
    // 成功メッセージ（オプション）
    showNotification('プロジェクトを作成しました！');
}

// プロジェクトをローカルストレージから読み込み
function loadProjects() {
    const savedProjects = localStorage.getItem('hakoniwa_projects');
    if (savedProjects) {
        projects = JSON.parse(savedProjects);
    }
}

// プロジェクトをローカルストレージに保存
function saveProjects() {
    localStorage.setItem('hakoniwa_projects', JSON.stringify(projects));
}

// プロジェクト一覧を表示
function renderProjects() {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';
    
    if (projects.length === 0) {
        projectsList.innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="max-w-sm mx-auto">
                    <svg class="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h18v18H3V3z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v8m-4-4h8"></path>
                    </svg>
                    <p class="text-gray-500 text-base mb-4">進行中のプロジェクトはありません</p>
                    <button onclick="toggleProjectForm()" class="text-green-500 hover:text-green-600 font-medium text-base">
                        最初のプロジェクトを作成する
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    projects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsList.appendChild(projectCard);
    });
}

// プロジェクトカードを作成
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow relative';
    
    // レベルとptを初期化（既存プロジェクトの互換性のため）
    if (!project.level) project.level = 1;
    if (!project.pt) project.pt = 0;
    if (!project.basePoints) project.basePoints = 100;
    if (!project.ptForNextLevel) project.ptForNextLevel = project.basePoints;
    
    // レベルに応じて絵文字を更新
    updateProjectGrowth(project);
    
    const progressPercent = Math.floor((project.pt / project.ptForNextLevel) * 100);
    
    card.innerHTML = `
        <button onclick="deleteProject('${project.id}', event)" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
        
        <div class="flex items-start justify-between mb-2">
            <div class="text-3xl sm:text-4xl">${project.tree || project.emoji}</div>
            <div class="text-right">
                <div class="text-base sm:text-lg font-bold text-gray-800">LV.${project.level}</div>
            </div>
        </div>
        
        <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-1 pr-8">${project.name}</h3>
        <p class="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">${project.goal}</p>
        
        <div class="mb-2">
            <div class="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                <span>経験値</span>
                <span class="font-medium">${project.pt} / ${project.ptForNextLevel}pt</span>
            </div>
            <div class="progress-bar bg-gray-200">
                <div class="progress-bar-fill bg-green-500" style="width: ${progressPercent}%"></div>
            </div>
        </div>
        
        <div class="text-xs text-gray-400 mt-2">
            ${new Date(project.createdAt).toLocaleDateString('ja-JP')}
        </div>
    `;
    
    // プロジェクト詳細へのクリックイベント（削除ボタン以外）
    card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return; // 削除ボタンクリック時は何もしない
        // TODO: プロジェクト詳細画面への遷移
        console.log('プロジェクト詳細:', project);
    });
    
    return card;
}

// 成長段階のテキストを取得
function getStageText(stage) {
    const stages = {
        seed: '種',
        sprout: '芽生え',
        growth: '成長',
        mature: '成熟',
        bloom: '開花',
        harvest: '収穫'
    };
    return stages[stage] || '種';
}

// 成長段階のクラスを取得
function getStageClass(stage) {
    return stage || 'seed';
}

// 通知を表示（簡易版）
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// プロジェクトを削除
function deleteProject(projectId, event) {
    event.stopPropagation(); // カードのクリックイベントを防ぐ
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    if (confirm(`プロジェクト「${project.name}」を削除しますか？\nこの操作は取り消せません。`)) {
        // プロジェクトを配列から削除
        projects = projects.filter(p => p.id !== projectId);
        
        // ローカルストレージに保存
        saveProjects();
        
        // 画面を更新
        renderProjects();
        
        // 通知表示
        showNotification('プロジェクトを削除しました');
    }
}

// プロジェクトにポイントを追加してレベルアップを処理
function addPointsToProject(projectId, points) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    project.pt += points;
    
    // レベルアップ処理
    while (project.pt >= project.ptForNextLevel) {
        project.pt -= project.ptForNextLevel;
        project.level++;
        // 次のレベルに必要なポイントを計算（基準ポイント × レベル）
        const basePoints = project.basePoints || 100;
        project.ptForNextLevel = basePoints * project.level;
        
        // 成長段階と絵文字の更新
        updateProjectGrowth(project);
        
        showNotification(`${project.name}がレベル${project.level}になりました！`);
    }
    
    project.updatedAt = new Date().toISOString();
    saveProjects();
    renderProjects();
}

// プロジェクトの成長段階と絵文字を更新
function updateProjectGrowth(project) {
    if (project.level >= 20) {
        project.stage = 'harvest';
        project.tree = '🍎'; // 収穫
    } else if (project.level >= 15) {
        project.stage = 'bloom';
        project.tree = '🌸'; // 開花
    } else if (project.level >= 10) {
        project.stage = 'mature';
        project.tree = '🌲'; // 大木
    } else if (project.level >= 7) {
        project.stage = 'growth';
        project.tree = '🌳'; // 苗木
    } else if (project.level >= 4) {
        project.stage = 'sprout';
        project.tree = '🌿'; // 芽生え
    } else {
        project.stage = 'seed';
        project.tree = '🌱'; // 種
    }
}