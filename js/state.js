// state.js - アプリケーションの状態管理とlocalStorage処理

// ===== 状態変数 =====
export const state = {
    tasks: [],
    selectedDate: (() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    })(),
    taskType: 'normal',
    totalPoints: 0,
    dailyPointHistory: {},
    dailyReflections: {},
    dailyAIComments: {},
    openaiApiKey: null,
    expandedHabitId: null,
    expandedSeasonalChallengeId: null,
    lastSwipeTime: 0
};

// ===== データの読み込み =====
export function loadData() {
    try {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            const parsed = JSON.parse(savedTasks);
            state.tasks = parsed.map(task => ({
                ...task,
                date: new Date(task.date),
                addedAt: task.addedAt ? new Date(task.addedAt) : new Date()
            }));
        }

        const savedPoints = localStorage.getItem('totalPoints');
        if (savedPoints) {
            state.totalPoints = parseInt(savedPoints, 10) || 0;
        }

        const savedDailyPoints = localStorage.getItem('dailyPointHistory');
        if (savedDailyPoints) {
            state.dailyPointHistory = JSON.parse(savedDailyPoints);
        }

        const savedReflections = localStorage.getItem('dailyReflections');
        if (savedReflections) {
            state.dailyReflections = JSON.parse(savedReflections);
        }

        const savedAIComments = localStorage.getItem('dailyAIComments');
        if (savedAIComments) {
            state.dailyAIComments = JSON.parse(savedAIComments);
        }

        const savedApiKey = localStorage.getItem('openai_api_key');
        if (savedApiKey) {
            state.openaiApiKey = savedApiKey;
        }

        // 過去7日分のポイントを自動計算
        updateDailyPointHistory();
    } catch (error) {
        console.error('データの読み込み中にエラーが発生しました:', error);
    }
}

// ===== データの保存 =====
export function saveData() {
    try {
        localStorage.setItem('tasks', JSON.stringify(state.tasks));
        localStorage.setItem('totalPoints', state.totalPoints.toString());
        localStorage.setItem('dailyPointHistory', JSON.stringify(state.dailyPointHistory));
        localStorage.setItem('dailyReflections', JSON.stringify(state.dailyReflections));
        localStorage.setItem('dailyAIComments', JSON.stringify(state.dailyAIComments));
        
        if (state.openaiApiKey) {
            localStorage.setItem('openai_api_key', state.openaiApiKey);
        }
    } catch (error) {
        console.error('データの保存中にエラーが発生しました:', error);
    }
}

// ===== 日次ポイント履歴の更新 =====
function updateDailyPointHistory() {
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!state.dailyPointHistory[dateStr]) {
            state.dailyPointHistory[dateStr] = 0;
        }
    }
}

// ===== ポイント関連の操作 =====
export function addPoints(points, date = null) {
    state.totalPoints += points;
    
    const dateStr = date ? 
        new Date(date).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
    
    if (!state.dailyPointHistory[dateStr]) {
        state.dailyPointHistory[dateStr] = 0;
    }
    state.dailyPointHistory[dateStr] += points;
    
    saveData();
}

// ===== 振り返りの操作 =====
export function saveReflection(reflection, date = null) {
    const dateStr = date ? 
        new Date(date).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
    
    state.dailyReflections[dateStr] = reflection;
    saveData();
}

export function getReflection(date = null) {
    const dateStr = date ? 
        new Date(date).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
    
    return state.dailyReflections[dateStr] || '';
}

// ===== AIコメントの操作 =====
export function saveAIComment(comment, date = null) {
    const dateStr = date ? 
        new Date(date).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
    
    state.dailyAIComments[dateStr] = comment;
    saveData();
}

export function getAIComment(date = null) {
    const dateStr = date ? 
        new Date(date).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
    
    return state.dailyAIComments[dateStr] || '';
}

export function deleteAIComment(date = null) {
    const dateStr = date ? 
        new Date(date).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
    
    delete state.dailyAIComments[dateStr];
    saveData();
}

// ===== API キーの操作 =====
export function saveApiKey(apiKey) {
    state.openaiApiKey = apiKey;
    if (apiKey) {
        localStorage.setItem('openai_api_key', apiKey);
    } else {
        localStorage.removeItem('openai_api_key');
    }
}