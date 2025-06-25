// プロジェクト管理用JavaScript

// グローバル変数
let projects = [];
let hallOfFameProjects = [];

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    renderProjects();
    renderHallOfFame();
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
    
    const savedHallOfFame = localStorage.getItem('hakoniwa_hall_of_fame');
    if (savedHallOfFame) {
        hallOfFameProjects = JSON.parse(savedHallOfFame);
    }
}

// プロジェクトをローカルストレージに保存
function saveProjects() {
    localStorage.setItem('hakoniwa_projects', JSON.stringify(projects));
    localStorage.setItem('hakoniwa_hall_of_fame', JSON.stringify(hallOfFameProjects));
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
        <button onclick="deleteProject('${project.id}', event)" class="delete-btn absolute bottom-2 right-2 text-gray-400 hover:text-red-500 transition-all p-2 opacity-0 hover:opacity-100 z-10">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
        </button>
        
        <div class="flex items-start justify-between mb-2">
            <div class="tree-icon text-3xl sm:text-4xl">${project.tree || project.emoji}</div>
            <div class="text-right">
                <div class="level-badge">
                    <span>LV.${project.level}</span>
                </div>
            </div>
        </div>
        
        <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-1">${project.name}</h3>
        <p class="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">${project.goal}</p>
        
        <div class="mb-2">
            <div class="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                <span>経験値</span>
                <span class="font-medium">${project.pt} / ${project.ptForNextLevel}pt</span>
            </div>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
            </div>
        </div>
        
        ${getGrowthMessage(project.level)}
        
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
    
    // ホバー時に削除ボタンを表示
    card.addEventListener('mouseenter', () => {
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) deleteBtn.style.opacity = '1';
    });
    
    card.addEventListener('mouseleave', () => {
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) deleteBtn.style.opacity = '0';
    });
    
    return card;
}

// 成長メッセージを取得
function getGrowthMessage(level) {
    const messages = {
        1: '<div class="growth-message">🌱 種から芽が出るのを待っています...</div>',
        2: '<div class="growth-message">🌿 小さな芽が顔を出しました！</div>',
        3: '<div class="growth-message">🌿 すくすくと成長中です</div>',
        4: '<div class="growth-message">🌳 立派な苗木になってきました</div>',
        5: '<div class="growth-message">🌳 枝葉を広げて成長中！</div>',
        6: '<div class="growth-message">🌲 大木へと成長しています</div>',
        7: '<div class="growth-message">🌲 もうすぐ花が咲きそうです</div>',
        8: '<div class="growth-message">🌸 美しい花が咲き始めました！</div>',
        9: '<div class="growth-message">🌸 満開まであと少し！</div>'
    };
    return messages[level] || '';
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
        
        // レベル10に達したら殿堂入り
        if (project.level === 10) {
            showNotification(`🎉 ${project.name}が完成しました！殿堂入りです！`);
            moveToHallOfFame(project);
            return; // 殿堂入り後は処理を終了
        } else {
            showNotification(`${project.name}がレベル${project.level}になりました！`);
        }
    }
    
    project.updatedAt = new Date().toISOString();
    saveProjects();
    renderProjects();
}

// プロジェクトの成長段階と絵文字を更新
function updateProjectGrowth(project) {
    if (project.level >= 10) {
        project.stage = 'harvest';
        project.tree = '🍎'; // 収穫（殿堂入り）
    } else if (project.level >= 8) {
        project.stage = 'bloom';
        project.tree = '🌸'; // 開花
    } else if (project.level >= 6) {
        project.stage = 'mature';
        project.tree = '🌲'; // 大木
    } else if (project.level >= 4) {
        project.stage = 'growth';
        project.tree = '🌳'; // 苗木
    } else if (project.level >= 2) {
        project.stage = 'sprout';
        project.tree = '🌿'; // 芽生え
    } else {
        project.stage = 'seed';
        project.tree = '🌱'; // 種
    }
}

// プロジェクトを殿堂入りに移動
function moveToHallOfFame(project) {
    // 完了日時を記録
    project.completedAt = new Date().toISOString();
    
    // 殿堂入りリストに追加
    hallOfFameProjects.push(project);
    
    // 通常のプロジェクトリストから削除
    projects = projects.filter(p => p.id !== project.id);
    
    // 保存と再描画
    saveProjects();
    renderProjects();
    renderHallOfFame();
}

// 殿堂入りプロジェクトを表示
function renderHallOfFame() {
    const hallOfFameSection = document.getElementById('hallOfFameSection');
    const hallOfFameList = document.getElementById('hallOfFameList');
    
    if (hallOfFameProjects.length === 0) {
        hallOfFameSection.classList.add('hidden');
        return;
    }
    
    hallOfFameSection.classList.remove('hidden');
    hallOfFameList.innerHTML = '';
    
    // 完了日時の新しい順にソート
    const sortedProjects = [...hallOfFameProjects].sort((a, b) => 
        new Date(b.completedAt) - new Date(a.completedAt)
    );
    
    sortedProjects.forEach(project => {
        const card = createHallOfFameCard(project);
        hallOfFameList.appendChild(card);
    });
}

// 殿堂入りプロジェクトカードを作成
function createHallOfFameCard(project) {
    const card = document.createElement('div');
    card.className = 'hall-of-fame-card bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg shadow-md p-4 sm:p-6 border border-yellow-200';
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-2">
            <div class="tree-icon text-3xl sm:text-4xl">🍎</div>
            <div class="text-right">
                <div class="text-sm font-medium text-amber-600">完成 🏆</div>
                <div class="level-badge" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);">
                    <span>LV.10</span>
                </div>
            </div>
        </div>
        
        <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-1">${project.name}</h3>
        <p class="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">${project.goal}</p>
        
        <div class="growth-message" style="color: #dc2626;">🎉 見事な大樹に成長しました！</div>
        
        <div class="text-xs text-gray-500 mt-2">
            <div>開始: ${new Date(project.createdAt).toLocaleDateString('ja-JP')}</div>
            <div>完成: ${new Date(project.completedAt).toLocaleDateString('ja-JP')}</div>
            <div class="mt-1 font-medium text-amber-600">
                育成期間: ${Math.ceil((new Date(project.completedAt) - new Date(project.createdAt)) / (1000 * 60 * 60 * 24))}日
            </div>
        </div>
    `;
    
    return card;
}