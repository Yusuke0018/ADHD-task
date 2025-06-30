// ===== 修正された関数のみを含むファイル =====
// このファイルには、日付処理の問題を修正した関数のみが含まれています。
// 元のapp.jsファイルの該当部分を、これらの関数で置き換えてください。

// ===== 日付処理ユーティリティ関数（app.jsの先頭部分に追加） =====
const dateUtils = {
    // 日付をYYYY-MM-DD形式に統一する関数
    formatDateToYmd(date) {
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

// ===== 修正された renderHabits 関数 =====
// app.js の renderHabits 関数（1612行目付近）を以下で置き換え
renderHabits() {
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
        
        return `
            <div class="washi-card rounded-xl p-4 task-card mobile-compact animate-fadeInUp ${cardClass}">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex items-start gap-3 flex-1">
                        <button 
                            data-habit-id="${habit.id}"
                            class="wa-checkbox rounded-lg ${isCompletedToday ? 'checked' : ''} mt-0.5 habit-checkbox"></button>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                <span class="task-type-label bg-purple-100 text-purple-700">
                                    習慣 ${habit.continuousDays}日
                                </span>
                                ${statusBadge}
                                ${completedLevel ? `<span class="text-sm text-purple-600 font-medium">今日のLv.${completedLevel} 達成済み</span>` : ''}
                            </div>
                            <div class="task-text-lg">${habit.name}</div>
                            <div id="habit-levels-${habit.id}" class="habit-levels-container ${!isCompletedToday && !isSkippedToday && this.expandedHabitId === habit.id ? '' : 'hidden'}">
                                <div class="mt-2 space-y-1">
                                    ${habit.levels.map((level, index) => `
                                        <button 
                                            data-habit-id="${habit.id}"
                                            data-level="${index + 1}"
                                            class="habit-level-btn w-full text-left px-3 py-2 rounded-lg hover:bg-purple-100 transition-all bg-gray-50">
                                            <div class="flex items-center justify-between">
                                                <span class="font-medium">Lv.${index + 1}</span>
                                                <span class="text-sm text-gray-600">${level}</span>
                                            </div>
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1">
                        ${!isCompletedToday && !isSkippedToday ? `
                            <button 
                                data-habit-id="${habit.id}"
                                class="habit-skip-btn p-2 text-gray-400 hover:text-gray-600 transition-all" title="お休み">
                                <svg class="w-4 h-4 mobile-text-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // イベントリスナーを追加（イベントデリゲーション）
    this.attachHabitEventListeners();
},

// ===== 修正された skipHabit 関数 =====
// app.js の skipHabit 関数（1980行目付近）を以下で置き換え
skipHabit(habitId) {
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
    
    // lastCompletedDateは更新しない（お休みは完了ではないため）
    
    localStorage.setItem('habit_tasks', JSON.stringify(data));
    this.renderHabits();
},

// ===== 修正された completeHabitTask 関数 =====
// app.js の completeHabitTask 関数（2003行目付近）を以下で置き換え
completeHabitTask(isAchieved) {
    if (!this.currentCompletingTaskData) return;
    
    const { habitId, level } = this.currentCompletingTaskData;
    
    // 習慣データを取得
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
    const yesterdayYmd = dateUtils.getYesterdayYmd();
    
    if (isAchieved) {
        // 既に今日の記録があるかチェック
        if (!habit.history) habit.history = [];
        
        const existingTodayHistory = habit.history.find(h => 
            dateUtils.formatDateToYmd(h.date) === todayYmd
        );
        
        // 既に今日の記録がある場合は何もしない
        if (existingTodayHistory && existingTodayHistory.achieved) {
            this.closeTaskCompletionModal();
            return;
        }
        
        // 最後に実際に完了した日付を取得（スキップは除外）
        let lastActuallyCompletedYmd = null;
        const completedHistory = habit.history
            .filter(h => h.achieved === true)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (completedHistory.length > 0) {
            lastActuallyCompletedYmd = dateUtils.formatDateToYmd(completedHistory[0].date);
        }
        
        // 連続日数の更新
        if (lastActuallyCompletedYmd === yesterdayYmd) {
            // 昨日完了していた場合は継続
            habit.continuousDays++;
        } else {
            // スキップした日があっても、前回の実際の完了が2日前以内なら継続とみなす
            const twoDaysAgoYmd = dateUtils.getDaysAgoYmd(2);
            
            if (lastActuallyCompletedYmd === twoDaysAgoYmd) {
                // 1日スキップしたが継続とみなす
                const skippedYesterday = habit.history.some(h => 
                    dateUtils.formatDateToYmd(h.date) === yesterdayYmd && h.level === 'skipped'
                );
                
                if (skippedYesterday) {
                    // 昨日がスキップなら継続
                    habit.continuousDays++;
                } else {
                    // スキップではなく単に実行しなかった場合はリセット
                    habit.continuousDays = 1;
                }
            } else {
                // 2日以上空いたらリセット
                habit.continuousDays = 1;
            }
        }
        
        // lastCompletedDateを更新（YYYY-MM-DD形式で統一）
        habit.lastCompletedDate = todayYmd;
        
        // 履歴を更新または追加
        const existingTodayIndex = habit.history.findIndex(h => 
            dateUtils.formatDateToYmd(h.date) === todayYmd
        );
        
        if (existingTodayIndex !== -1) {
            // 既存の記録を更新（スキップから完了に変更など）
            habit.history[existingTodayIndex] = {
                date: todayYmd,
                level: level,
                achieved: true,
                points: this.selectedCompletionPoints || 0
            };
        } else {
            // 新規追加
            habit.history.push({
                date: todayYmd,
                level: level,
                achieved: true,
                points: this.selectedCompletionPoints || 0
            });
        }
        
        // 100日達成チェック
        if (habit.continuousDays >= 100 && !data.hallOfFame) {
            data.hallOfFame = [];
        }
        if (habit.continuousDays >= 100) {
            // 殿堂入り
            const hallOfFameHabit = {
                ...habit,
                achievedDate: new Date().toISOString()
            };
            data.hallOfFame.push(hallOfFameHabit);
            data.habits.splice(habitIndex, 1);
            
            // 達成のお祝いメッセージ
            this.showCelebration();
            setTimeout(() => {
                alert(`🎉 おめでとうございます！\n「${habit.name}」が100日継続を達成し、殿堂入りしました！`);
            }, 500);
        }
        
        this.showCelebration();
        
        // 習慣タスクのポイントを加算
        if (this.selectedCompletionPoints > 0) {
            this.totalPoints += this.selectedCompletionPoints;
            const dateStr = new Date().toDateString();
            if (!this.dailyPointHistory[dateStr]) {
                this.dailyPointHistory[dateStr] = 0;
            }
            this.dailyPointHistory[dateStr] += this.selectedCompletionPoints;
        }
        
        // プロジェクトにポイントを付与
        const assignToProject = document.getElementById('assignToProject').checked;
        if (assignToProject) {
            const projectId = document.getElementById('projectSelector').value;
            if (projectId && window.addPointsToProject) {
                // 習慣タスクのデフォルトポイントは10pt
                const pointsToAdd = this.selectedProjectPoints > 0 ? this.selectedProjectPoints : 10;
                window.addPointsToProject(projectId, pointsToAdd);
            }
        }
    }
    
    localStorage.setItem('habit_tasks', JSON.stringify(data));
    this.saveData(); // 通常のデータも保存（ポイント等）
    this.closeTaskCompletionModal();
    this.expandedHabitId = null; // 展開状態をリセット
    this.renderHabits();
},

// ===== 修正された cancelHabitCompletion 関数 =====
// app.js の cancelHabitCompletion 関数（1877行目付近）を以下で置き換え
cancelHabitCompletion(habitId) {
    console.log('cancelHabitCompletion called for:', habitId);
    
    const habitData = localStorage.getItem('habit_tasks');
    if (!habitData) {
        console.error('No habit data found');
        return;
    }
    
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
    
    // 今日の履歴を確認
    const todayHistoryIndex = habit.history ? 
        habit.history.findIndex(h => dateUtils.formatDateToYmd(h.date) === todayYmd) : -1;
    
    if (todayHistoryIndex !== -1 && habit.history[todayHistoryIndex].achieved) {
        console.log('Canceling today\'s completion for habit:', habit.name);
        
        // 今日の完了を取り消す
        habit.history.splice(todayHistoryIndex, 1);
        
        // 連続日数を再計算
        const completedHistory = habit.history
            .filter(h => h.achieved === true)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (completedHistory.length > 0) {
            // 最後の完了日から連続日数を再計算
            const lastCompletedDate = new Date(completedHistory[0].date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            lastCompletedDate.setHours(0, 0, 0, 0);
            
            const daysDiff = Math.floor((today - lastCompletedDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 1) {
                // 最後の完了が昨日以前なら、その日までの連続日数を計算
                let continuousDays = 1;
                for (let i = 1; i < completedHistory.length; i++) {
                    const prevDate = new Date(completedHistory[i - 1].date);
                    const currDate = new Date(completedHistory[i].date);
                    const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
                    
                    if (diff <= 2) { // スキップを考慮して2日まで許容
                        continuousDays++;
                    } else {
                        break;
                    }
                }
                habit.continuousDays = continuousDays;
            } else {
                habit.continuousDays = 0;
            }
            
            // lastCompletedDateを最後の完了日に更新
            habit.lastCompletedDate = dateUtils.formatDateToYmd(completedHistory[0].date);
        } else {
            // 完了履歴がなくなった場合
            habit.continuousDays = 0;
            habit.lastCompletedDate = null;
        }
        
        console.log('Updated habit:', habit);
    } else {
        console.log('Not completed today or skipped, nothing to cancel');
    }
    
    data.habits[habitIndex] = habit;
    localStorage.setItem('habit_tasks', JSON.stringify(data));
    this.renderHabits();
},

// ===== attachHabitEventListeners の修正部分 =====
// app.js の attachHabitEventListeners 内（1772行目付近）のイベント処理を以下で置き換え
attachHabitEventListeners() {
    const habitList = document.getElementById('habitList');
    if (!habitList) return;
    
    // 既存のリスナーを削除（重複防止）
    if (this.habitClickHandler) {
        habitList.removeEventListener('click', this.habitClickHandler);
    }
    
    // クリックハンドラーを定義（アロー関数でthisを保持）
    this.habitClickHandler = (e) => {
        // クリックされた要素またはその親要素から対象を探す
        let targetElement = e.target;
        let habitId = targetElement.dataset?.habitId;
        
        // SVGやpathをクリックした場合は、親要素を確認
        if (!habitId && targetElement.parentElement) {
            targetElement = targetElement.parentElement;
            habitId = targetElement.dataset?.habitId;
        }
        if (!habitId && targetElement.parentElement?.parentElement) {
            targetElement = targetElement.parentElement.parentElement;
            habitId = targetElement.dataset?.habitId;
        }
        
        // チェックボックスのクリック
        if (targetElement.classList.contains('habit-checkbox')) {
            e.preventDefault();
            
            // 習慣が今日完了またはスキップしているかチェック
            const habitData = localStorage.getItem('habit_tasks');
            if (habitData) {
                try {
                    const data = JSON.parse(habitData);
                    const habit = data.habits.find(h => h.id === habitId);
                    if (habit) {
                        const todayYmd = dateUtils.getTodayYmd();
                        
                        const todayHistory = habit.history ? 
                            habit.history.find(h => dateUtils.formatDateToYmd(h.date) === todayYmd) : null;
                        
                        if (todayHistory) {
                            if (todayHistory.achieved) {
                                // 完了済みの場合は取り消し
                                this.cancelHabitCompletion(habitId);
                            } else if (todayHistory.level === 'skipped') {
                                // スキップ済みの場合は何もしない（または取り消し処理を追加）
                                console.log('Habit is skipped today');
                            }
                        } else {
                            // 未完了の場合はレベル選択を表示
                            this.toggleHabitLevels(habitId);
                        }
                    }
                } catch (e) {
                    console.error('Error checking habit completion:', e);
                    this.toggleHabitLevels(habitId);
                }
            } else {
                this.toggleHabitLevels(habitId);
            }
        }
        // レベルボタンのクリック
        else if (targetElement.classList.contains('habit-level-btn') && !targetElement.disabled) {
            const level = parseInt(targetElement.dataset.level);
            this.completeHabit(habitId, level);
        }
        // スキップボタンのクリック
        else if (targetElement.classList.contains('habit-skip-btn')) {
            this.skipHabit(habitId);
        }
    };
    
    // イベントリスナーを追加
    habitList.addEventListener('click', this.habitClickHandler);
}