// 習慣管理機能
const habitManager = {
    habits: [],
    hallOfFameHabits: [],
    editingHabitId: null,
    deletingHabitId: null,

    // 初期化
    init() {
        console.log('habitManager.init() called');
        // まず配列を初期化
        this.habits = [];
        this.hallOfFameHabits = [];
        // その後データを読み込む
        this.loadHabits();
        this.render();
    },

    // データ読み込み
    loadHabits() {
        console.log('Loading habits data...');
        const storedData = localStorage.getItem('habit_tasks');
        console.log('Raw stored data:', storedData);
        
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                this.habits = data.habits || [];
                this.hallOfFameHabits = data.hallOfFame || [];
                
                // 既存データに最大連続日数を追加（初回のみ）
                this.habits.forEach(habit => {
                    if (habit.maxContinuousDays === undefined) {
                        habit.maxContinuousDays = habit.continuousDays || 0;
                    }
                });
                
                console.log('Loaded habits:', {
                    habitsCount: this.habits.length,
                    habits: this.habits,
                    hallOfFameCount: this.hallOfFameHabits.length
                });
            } catch (e) {
                console.error("Error parsing habit data from localStorage:", e);
                this.habits = [];
                this.hallOfFameHabits = [];
            }
        } else {
            // データが存在しない場合は空配列で初期化
            console.log('No habit data found in localStorage');
            this.habits = [];
            this.hallOfFameHabits = [];
        }
    },

    // データ保存
    saveData() {
        console.log('Saving habits data:', {
            habitsCount: this.habits.length,
            habits: this.habits,
            hallOfFameCount: this.hallOfFameHabits.length
        });
        
        const data = {
            habits: this.habits,
            hallOfFame: this.hallOfFameHabits
        };
        localStorage.setItem('habit_tasks', JSON.stringify(data));
        
        // 保存後の確認
        const saved = localStorage.getItem('habit_tasks');
        console.log('Saved data verification:', saved);
    },

    // 習慣追加モーダル表示
    showAddModal() {
        this.editingHabitId = null;
        document.getElementById('modalTitle').textContent = '新しい習慣を追加';
        document.getElementById('habitForm').reset();
        document.getElementById('habitModal').classList.remove('hidden');
    },

    // 習慣編集モーダル表示
    showEditModal(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        this.editingHabitId = habitId;
        document.getElementById('modalTitle').textContent = '習慣を編集';
        document.getElementById('habitName').value = habit.name;
        document.getElementById('level1').value = habit.levels[0];
        document.getElementById('level2').value = habit.levels[1];
        document.getElementById('level3').value = habit.levels[2];
        document.getElementById('habitModal').classList.remove('hidden');
    },

    // モーダルを閉じる
    closeModal() {
        document.getElementById('habitModal').classList.add('hidden');
        document.getElementById('habitForm').reset();
        this.editingHabitId = null;
    },

    // 習慣保存
    saveHabit(event) {
        event.preventDefault();
        
        // 保存前に最新のデータを再読み込み
        this.loadHabits();
        
        const habitData = {
            name: document.getElementById('habitName').value,
            levels: [
                document.getElementById('level1').value,
                document.getElementById('level2').value,
                document.getElementById('level3').value
            ]
        };

        if (this.editingHabitId) {
            // 編集
            const index = this.habits.findIndex(h => h.id === this.editingHabitId);
            if (index !== -1) {
                this.habits[index] = {
                    ...this.habits[index],
                    ...habitData
                };
            }
        } else {
            // 新規追加
            const newHabit = {
                id: Date.now().toString(),
                ...habitData,
                createdAt: new Date().toISOString(),
                continuousDays: 0,
                maxContinuousDays: 0,
                lastCompletedDate: null,
                history: []
            };
            console.log('Adding new habit:', newHabit);
            console.log('Current habits before add:', this.habits);
            this.habits.push(newHabit);
            console.log('Current habits after add:', this.habits);
        }

        this.saveData();
        this.render();
        this.closeModal();
    },
    
    // 習慣を完了する
    completeHabit(habitId, level) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const habitIndex = this.habits.findIndex(h => h.id === habitId);
        if (habitIndex === -1) return;
        
        const habit = this.habits[habitIndex];
        
        // 履歴に完了を記録
        if (!habit.history) {
            habit.history = [];
        }
        
        // 今日の記録を更新または追加
        const existingRecordIndex = habit.history.findIndex(h => h.date === dateStr);
        if (existingRecordIndex !== -1) {
            habit.history[existingRecordIndex] = {
                date: dateStr,
                achieved: true,
                passed: false,
                level: level
            };
        } else {
            habit.history.push({
                date: dateStr,
                achieved: true,
                passed: false,
                level: level
            });
        }
        
        // 継続日数を更新
        this.updateContinuousDays(habit);
        
        this.saveData();
        this.render();
    },
    
    // 習慣をパスする
    passHabit(habitId) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const habitIndex = this.habits.findIndex(h => h.id === habitId);
        if (habitIndex === -1) return;
        
        const habit = this.habits[habitIndex];
        
        // 履歴にパスを記録
        if (!habit.history) {
            habit.history = [];
        }
        
        // 今日の記録を更新または追加
        const existingRecordIndex = habit.history.findIndex(h => h.date === dateStr);
        if (existingRecordIndex !== -1) {
            habit.history[existingRecordIndex] = {
                date: dateStr,
                achieved: false,
                passed: true,
                level: null
            };
        } else {
            habit.history.push({
                date: dateStr,
                achieved: false,
                passed: true,
                level: null
            });
        }
        
        // 継続日数を更新
        this.updateContinuousDays(habit);
        
        this.saveData();
        this.render();
    },
    
    // 習慣を未達成にする
    notAchieveHabit(habitId) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const habitIndex = this.habits.findIndex(h => h.id === habitId);
        if (habitIndex === -1) return;
        
        const habit = this.habits[habitIndex];
        
        // 履歴に未達成を記録
        if (!habit.history) {
            habit.history = [];
        }
        
        // 今日の記録を更新または追加
        const existingRecordIndex = habit.history.findIndex(h => h.date === dateStr);
        if (existingRecordIndex !== -1) {
            habit.history[existingRecordIndex] = {
                date: dateStr,
                achieved: false,
                passed: false,
                notAchieved: true,
                level: null
            };
        } else {
            habit.history.push({
                date: dateStr,
                achieved: false,
                passed: false,
                notAchieved: true,
                level: null
            });
        }
        
        // 継続日数を更新
        this.updateContinuousDays(habit);
        
        this.saveData();
        this.render();
    },
    
    // 継続日数を更新
    updateContinuousDays(habit) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let continuousDays = 0;
        let lastAchievedDate = null;
        
        // 履歴を日付順にソート
        const sortedHistory = habit.history.sort((a, b) => new Date(a.date) - new Date(b.date));

        for (const record of sortedHistory) {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);
            
            if (record.achieved) {
                if (lastAchievedDate) {
                    // 最後の達成日との差を計算
                    const diffDays = (recordDate - lastAchievedDate) / (1000 * 60 * 60 * 24);
                    if (diffDays === 1) {
                        continuousDays++;
                    } else if (diffDays > 1) {
                        // 途切れた場合はリセット
                        continuousDays = 1;
                    }
                    // 同じ日の達成はカウントしない
                } else {
                    continuousDays = 1;
                }
                lastAchievedDate = recordDate;
            } else if (record.passed) {
                if (lastAchievedDate) {
                    const diffDays = (recordDate - lastAchievedDate) / (1000 * 60 * 60 * 24);
                    if (diffDays > 1) {
                        // パスの前が未達成ならリセット
                        continuousDays = 0;
                        lastAchievedDate = null;
                    }
                    // パスした日は `lastAchievedDate` を更新しない
                }
            } else {
                // 未達成の場合はリセット
                continuousDays = 0;
                lastAchievedDate = null;
            }
        }

        habit.continuousDays = continuousDays;
        
        // 最大連続日数を更新
        if (!habit.maxContinuousDays || continuousDays > habit.maxContinuousDays) {
            habit.maxContinuousDays = continuousDays;
        }
        
        habit.lastCompletedDate = new Date().toISOString();
    },

    // 削除確認モーダル表示
    showDeleteModal(habitId) {
        this.deletingHabitId = habitId;
        document.getElementById('deleteModal').classList.remove('hidden');
    },

    // 削除確認モーダルを閉じる
    closeDeleteModal() {
        document.getElementById('deleteModal').classList.add('hidden');
        this.deletingHabitId = null;
    },

    // 習慣削除
    confirmDelete() {
        if (this.deletingHabitId) {
            this.habits = this.habits.filter(h => h.id !== this.deletingHabitId);
            this.saveData();
            this.render();
        }
        this.closeDeleteModal();
    },

    // 習慣カード作成
    createHabitCard(habit, isHallOfFame = false) {
        const card = document.createElement('div');
        
        if (isHallOfFame) {
            card.className = 'washi-card rounded-xl p-4 hover:shadow-lg transition-shadow duration-300';
            card.innerHTML = `
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h3 class="text-lg font-medium text-gray-800 mb-2">${habit.name}</h3>
                        <div class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            <span>100日達成！</span>
                        </div>
                        <div class="text-sm text-gray-500 mt-1">
                            達成日: ${new Date(habit.achievedDate).toLocaleDateString('ja-JP')}
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 今日の状態を確認
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const todayRecord = habit.history ? habit.history.find(h => h.date === dateStr) : null;
            
            // カードのクラスを設定
            let cardClass = 'washi-card rounded-xl p-4 hover:shadow-lg transition-shadow duration-300';
            if (todayRecord) {
                if (todayRecord.achieved) {
                    cardClass += ' task-completed';
                } else if (todayRecord.notAchieved) {
                    cardClass += ' task-notachieved';
                }
                // パスの場合はスタイルを適用しない
            }
            card.className = cardClass;
            
            // 週間進捗カレンダーを作成
            const weekProgressHtml = this.createWeekProgress(habit);
            
            card.innerHTML = `
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h3 class="text-lg font-medium text-gray-800 mb-2">${habit.name}</h3>
                        <div class="space-y-1 text-sm text-gray-600">
                            <div>Lv.1: ${habit.levels[0]}</div>
                            <div>Lv.2: ${habit.levels[1]}</div>
                            <div>Lv.3: ${habit.levels[2]}</div>
                        </div>
                        <div class="mt-3 flex items-center gap-4 text-sm">
                            <span class="text-purple-600 font-medium">継続: ${habit.continuousDays}日</span>
                            <span class="text-gray-600">最大: ${habit.maxContinuousDays || 0}日</span>
                        </div>
                        <!-- 週間進捗カレンダー -->
                        <div class="mt-4">
                            ${weekProgressHtml}
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        ${this.createTodayActionButtons(habit)}
                        <button onclick="habitManager.showEditModal('${habit.id}')" class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                        </button>
                        <button onclick="habitManager.showDeleteModal('${habit.id}')" class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }
        
        return card;
    },

    // 今日の操作ボタンを作成
    createTodayActionButtons(habit) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // 今日の記録を確認
        const todayRecord = habit.history && habit.history.find(h => h.date === dateStr);
        
        if (!todayRecord) {
            // 今日の記録がない場合は完了ボタンとパスボタンを表示
            return `
                <div class="flex flex-col gap-1">
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                        <div class="text-xs text-gray-600 mb-1 text-center">今日の達成</div>
                        <div class="flex gap-1">
                            <button onclick="habitManager.completeHabit('${habit.id}', 1)" class="flex-1 p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium transition-colors">
                                Lv.1
                            </button>
                            <button onclick="habitManager.completeHabit('${habit.id}', 2)" class="flex-1 p-2 bg-green-200 hover:bg-green-300 text-green-700 rounded text-xs font-medium transition-colors">
                                Lv.2
                            </button>
                            <button onclick="habitManager.completeHabit('${habit.id}', 3)" class="flex-1 p-2 bg-green-300 hover:bg-green-400 text-green-700 rounded text-xs font-medium transition-colors">
                                Lv.3
                            </button>
                        </div>
                        <div class="flex gap-1 mt-1">
                            <button onclick="habitManager.passHabit('${habit.id}')" class="flex-1 p-2 text-amber-600 hover:bg-amber-50 rounded text-xs font-medium transition-colors">
                                パス
                            </button>
                            <button onclick="habitManager.notAchieveHabit('${habit.id}')" class="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors">
                                未達成
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // 記録がある場合は空を返す
        return '';
    },

    // 週間進捗カレンダーを作成
    createWeekProgress(habit) {
        const today = new Date();
        const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];
        let html = '<div class="grid grid-cols-7 gap-1 text-center">';
        
        // 今日から過去6日間の進捗を表示
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            // その日の記録を確認
            let status = '未';
            let statusClass = 'bg-gray-200 text-gray-700';
            let additionalClass = '';
            let textSize = 'text-lg';
            
            if (habit.history && habit.history.length > 0) {
                const dayRecord = habit.history.find(h => {
                    if (!h.date) return false;
                    let recordDate = h.date;
                    // YYYY-MM-DD形式に統一
                    if (h.date.includes('T')) {
                        recordDate = h.date.split('T')[0];
                    } else if (h.date.includes('-') && h.date.length > 10) {
                        // YYYY-MM-DD以降に時刻情報がある場合
                        recordDate = h.date.substring(0, 10);
                    }
                    
                    return recordDate === dateStr;
                });
                
                if (dayRecord) {
                    // デバッグ用ログ
                    console.log(`Day ${i} (${dateStr}):`, dayRecord);
                    
                    if (dayRecord.achieved) {
                        status = '完';
                        statusClass = 'bg-green-500 text-white';
                    } else if (dayRecord.passed) {
                        status = 'ー';
                        statusClass = 'bg-gray-300 text-gray-600';
                        textSize = 'text-2xl';  // ハイフンを大きく表示
                    } else if (dayRecord.notAchieved) {
                        status = '未';
                        statusClass = 'bg-blue-200 text-blue-800 border-2 border-blue-400';
                    }
                }
            }
            
            const isToday = i === 0;
            const borderClass = isToday ? 'ring-2 ring-purple-500' : '';
            
            html += `
                <div class="flex flex-col items-center">
                    <div class="text-xs text-gray-600 mb-1">${dayLabels[date.getDay()]}</div>
                    <div class="w-10 h-10 rounded-lg ${statusClass} ${borderClass} flex items-center justify-center ${textSize} font-bold">
                        ${status}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">${date.getDate()}</div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    },

    // 描画
    render() {
        console.log('habitManager.render() called with habits:', this.habits);
        
        const activeContainer = document.getElementById('activeHabits');
        const hallOfFameContainer = document.getElementById('hallOfFameHabits');
        
        // 要素が存在しない場合は早期リターン
        if (!activeContainer || !hallOfFameContainer) {
            console.log('Habit containers not found, skipping render');
            return;
        }
        
        console.log('Rendering habits, count:', this.habits.length);
        
        // 進行中の習慣
        activeContainer.innerHTML = '';
        if (this.habits.length === 0) {
            activeContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p>習慣がまだ登録されていません</p>
                </div>
            `;
        } else {
            this.habits.forEach(habit => {
                activeContainer.appendChild(this.createHabitCard(habit));
            });
        }
        
        // 殿堂入り習慣
        hallOfFameContainer.innerHTML = '';
        if (this.hallOfFameHabits.length === 0) {
            hallOfFameContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p>100日継続した習慣がここに表示されます</p>
                </div>
            `;
        } else {
            this.hallOfFameHabits.forEach(habit => {
                hallOfFameContainer.appendChild(this.createHabitCard(habit, true));
            });
        }
    }
};

