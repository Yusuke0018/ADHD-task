// 修正を適用するNode.jsスクリプト
const fs = require('fs');

// 元のapp.jsを読み込む
let appContent = fs.readFileSync('app.js', 'utf8');

// 1. 日付ユーティリティを追加（app定義の前に挿入）
const dateUtilsCode = `
// ===== 日付処理ユーティリティ関数 =====
const dateUtils = {
    // 日付をYYYY-MM-DD形式に統一する関数
    formatDateToYmd(date) {
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        
        return \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;
    },

    // 今日の日付を取得
    getTodayYmd() {
        return this.formatDateToYmd(new Date());
    },

    // 昨日の日付を取得
    getYesterdayYmd() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return this.formatDateToYmd(yesterday);
    },

    // N日前の日付を取得
    getDaysAgoYmd(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return this.formatDateToYmd(date);
    }
};

`;

// const app = { の前に挿入
appContent = appContent.replace(/const app = \{/, dateUtilsCode + 'const app = {');

// 2. renderHabits関数を修正
const renderHabitsStart = appContent.indexOf('renderHabits() {');
const renderHabitsEnd = appContent.indexOf('attachHabitEventListeners();', renderHabitsStart) + 'attachHabitEventListeners();'.length + 10;

const newRenderHabits = `renderHabits() {
        const habitList = document.getElementById('habitList');
        const noHabitsEl = document.getElementById('noHabits');
        
        // 習慣データを取得
        const habitData = localStorage.getItem('habit_tasks');
        if (!habitData) {
            habitList.innerHTML = '';
            noHabitsEl.classList.remove('hidden');
            return;
        }
        
        let habits = [];
        try {
            const data = JSON.parse(habitData);
            habits = data.habits || [];
        } catch (e) {
            console.error('Error parsing habit data:', e);
            habitList.innerHTML = '';
            noHabitsEl.classList.remove('hidden');
            return;
        }
        
        if (habits.length === 0) {
            habitList.innerHTML = '';
            noHabitsEl.classList.remove('hidden');
            return;
        }
        
        noHabitsEl.classList.add('hidden');
        
        // 今日の日付を統一フォーマットで取得
        const todayYmd = dateUtils.getTodayYmd();
        
        // 習慣カードを生成
        habitList.innerHTML = habits.map(habit => {
            // 履歴から今日の状態を確認
            let isCompletedToday = false;
            let isSkippedToday = false;
            let completedLevel = null;
            
            if (habit.history && habit.history.length > 0) {
                const todayHistory = habit.history.find(h => {
                    return dateUtils.formatDateToYmd(h.date) === todayYmd;
                });
                
                if (todayHistory) {
                    if (todayHistory.achieved) {
                        isCompletedToday = true;
                        completedLevel = todayHistory.level;
                    } else if (todayHistory.level === 'skipped') {
                        isSkippedToday = true;
                    }
                }
            }
            
            let cardClass = 'task-normal-active';
            let statusBadge = '';
            
            if (isCompletedToday) {
                cardClass = 'task-completed';
                statusBadge = '<span class="task-completed-badge">達成</span>';
            } else if (isSkippedToday) {
                cardClass = 'task-skipped';
                statusBadge = '<span class="text-gray-500 text-sm">お休み中</span>';
            }
            
            return \`
                <div class="washi-card rounded-xl p-4 task-card mobile-compact animate-fadeInUp \${cardClass}">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex items-start gap-3 flex-1">
                            <button 
                                data-habit-id="\${habit.id}"
                                class="wa-checkbox rounded-lg \${isCompletedToday ? 'checked' : ''} mt-0.5 habit-checkbox"></button>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1 flex-wrap">
                                    <span class="task-type-label bg-purple-100 text-purple-700">
                                        習慣 \${habit.continuousDays}日
                                    </span>
                                    \${statusBadge}
                                    \${completedLevel ? \`<span class="text-sm text-purple-600 font-medium">今日のLv.\${completedLevel} 達成済み</span>\` : ''}
                                </div>
                                <div class="task-text-lg">\${habit.name}</div>
                                <div id="habit-levels-\${habit.id}" class="habit-levels-container \${!isCompletedToday && !isSkippedToday && this.expandedHabitId === habit.id ? '' : 'hidden'}">
                                    <div class="mt-2 space-y-1">
                                        \${habit.levels.map((level, index) => \`
                                            <button 
                                                data-habit-id="\${habit.id}"
                                                data-level="\${index + 1}"
                                                class="habit-level-btn w-full text-left px-3 py-2 rounded-lg hover:bg-purple-100 transition-all bg-gray-50">
                                                <div class="flex items-center justify-between">
                                                    <span class="font-medium">Lv.\${index + 1}</span>
                                                    <span class="text-sm text-gray-600">\${level}</span>
                                                </div>
                                            </button>
                                        \`).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1">
                            \${!isCompletedToday && !isSkippedToday ? \`
                                <button 
                                    data-habit-id="\${habit.id}"
                                    class="habit-skip-btn p-2 text-gray-400 hover:text-gray-600 transition-all" title="お休み">
                                    <svg class="w-4 h-4 mobile-text-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                                    </svg>
                                </button>
                            \` : ''}
                        </div>
                    </div>
                </div>
            \`;
        }).join('');
        
        // イベントリスナーを追加（イベントデリゲーション）
        this.attachHabitEventListeners();
    }`;

appContent = appContent.substring(0, renderHabitsStart) + newRenderHabits + appContent.substring(renderHabitsEnd);

// 3. skipHabit関数を修正
const skipHabitRegex = /skipHabit\(habitId\)\s*\{[\s\S]*?localStorage\.setItem\('habit_tasks'[^}]*\}\s*,/;
const newSkipHabit = `skipHabit(habitId) {
        const habitData = localStorage.getItem('habit_tasks');
        if (!habitData) return;
        
        let data;
        try {
            data = JSON.parse(habitData);
        } catch (e) {
            console.error('Error parsing habit data:', e);
            return;
        }
        
        const habitIndex = data.habits.findIndex(h => h.id === habitId);
        if (habitIndex === -1) return;
        
        const habit = data.habits[habitIndex];
        const todayYmd = dateUtils.getTodayYmd();
        
        // 履歴に「お休み」として記録
        if (!habit.history) habit.history = [];
        
        // 今日の記録があるか確認
        const existingTodayIndex = habit.history.findIndex(h => 
            dateUtils.formatDateToYmd(h.date) === todayYmd
        );
        
        if (existingTodayIndex !== -1) {
            // 既存の記録を更新
            habit.history[existingTodayIndex] = {
                date: todayYmd,
                level: 'skipped',
                achieved: false,
                points: 0
            };
        } else {
            // 新規追加
            habit.history.push({
                date: todayYmd,
                level: 'skipped',
                achieved: false,
                points: 0
            });
        }
        
        data.habits[habitIndex] = habit;
        localStorage.setItem('habit_tasks', JSON.stringify(data));
        this.renderHabits();
    },`;

appContent = appContent.replace(skipHabitRegex, newSkipHabit);

// 4. 修正版を保存
fs.writeFileSync('app.js', appContent, 'utf8');
console.log('修正を適用しました！');