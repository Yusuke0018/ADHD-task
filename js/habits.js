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
        card.className = 'washi-card rounded-xl p-4 hover:shadow-lg transition-shadow duration-300';
        
        if (isHallOfFame) {
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
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
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

// 季節のチャレンジ管理機能
const seasonalChallengeManager = {
    challenges: [],
    editingChallengeId: null,
    
    // 初期化
    init() {
        console.log('seasonalChallengeManager.init() called');
        this.loadChallenges();
        this.checkActiveChallenges(); // アクティブなチャレンジを確認
        this.render();
    },
    
    // データ読み込み
    loadChallenges() {
        console.log('Loading seasonal challenges...');
        const storedData = localStorage.getItem('seasonal_challenges');
        
        if (storedData) {
            try {
                this.challenges = JSON.parse(storedData);
                console.log('Loaded challenges:', this.challenges.length);
                console.log('Challenge data:', this.challenges);
            } catch (e) {
                console.error("Error parsing seasonal challenges:", e);
                this.challenges = [];
            }
        } else {
            console.log('No seasonal_challenges data in localStorage');
            this.challenges = [];
            // デバッグ用：テストデータを作成
            console.log('Creating test challenge data for debugging...');
            this.createTestChallenge();
        }
    },
    
    // テスト用チャレンジを作成（デバッグ用）
    createTestChallenge() {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1); // 昨日から開始
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 14); // 2週間後まで
        
        const testChallenge = {
            id: `test_challenge_${Date.now()}`,
            name: 'テスト季節チャレンジ',
            text: 'テスト季節チャレンジ',
            description: 'デバッグ用のテストチャレンジです',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status: 'active',
            completionHistory: [],
            levelDefinitions: [
                { level: 1, criteria: 'テストレベル1' },
                { level: 2, criteria: 'テストレベル2' },
                { level: 3, criteria: 'テストレベル3' }
            ]
        };
        
        this.challenges = [testChallenge];
        this.saveData();
        console.log('Test challenge created:', testChallenge);
    },
    
    // データ保存
    saveData() {
        console.log('Saving seasonal challenges:', this.challenges.length);
        localStorage.setItem('seasonal_challenges', JSON.stringify(this.challenges));
    },
    
    // 次の節気を取得
    getNextSekki() {
        const now = new Date();
        const year = now.getFullYear();
        const nextYear = year + 1;
        
        // sekkiDataがグローバルで利用可能と仮定
        if (typeof sekkiData === 'undefined') {
            console.log('sekkiData not available, using default');
            return {
                name: '立春',
                date: new Date(year, 1, 4) // 仮の日付
            };
        }
        
        const currentYearSekki = sekkiData[year] || [];
        const nextYearSekki = sekkiData[nextYear] || [];
        const allSekki = [...currentYearSekki, ...nextYearSekki];
        
        // 今日以降の最初の節気を探す
        for (let sekki of allSekki) {
            if (sekki.date > now) {
                return sekki;
            }
        }
        
        // 見つからない場合は翌年の最初の節気
        return nextYearSekki[0] || currentYearSekki[0];
    },
    
    // 節気の選択肢を取得（現在の節気と次の節気のみ）
    getAvailableSekkiOptions() {
        const now = new Date();
        const year = now.getFullYear();
        const nextYear = year + 1;
        
        if (typeof sekkiData === 'undefined') {
            return [];
        }
        
        const currentYearSekki = sekkiData[year] || [];
        const nextYearSekki = sekkiData[nextYear] || [];
        const allSekki = [...currentYearSekki, ...nextYearSekki];
        
        // 現在の節気を探す
        let currentSekki = null;
        let nextSekki = null;
        
        for (let i = 0; i < allSekki.length; i++) {
            if (allSekki[i].date <= now) {
                currentSekki = allSekki[i];
            } else {
                nextSekki = allSekki[i];
                break;
            }
        }
        
        // 現在の節気と次の節気のみを返す
        const result = [];
        if (currentSekki) {
            result.push(currentSekki);
        }
        if (nextSekki) {
            result.push(nextSekki);
        }
        
        return result;
    },
    
    // 節気の終了日を計算
    getSekkiEndDate(sekkiDate, sekkiName) {
        const year = sekkiDate.getFullYear();
        const nextYear = year + 1;
        
        if (typeof sekkiData === 'undefined') {
            // デフォルトで15日後
            const endDate = new Date(sekkiDate);
            endDate.setDate(endDate.getDate() + 15);
            return endDate;
        }
        
        const currentYearSekki = sekkiData[year] || [];
        const nextYearSekki = sekkiData[nextYear] || [];
        const allSekki = [...currentYearSekki, ...nextYearSekki];
        
        // 現在の節気のインデックスを探す
        const currentIndex = allSekki.findIndex(s => s.name === sekkiName && s.date.getTime() === sekkiDate.getTime());
        
        if (currentIndex !== -1 && currentIndex < allSekki.length - 1) {
            // 次の節気の前日を返す
            const nextSekki = allSekki[currentIndex + 1];
            const endDate = new Date(nextSekki.date);
            endDate.setDate(endDate.getDate() - 1);
            return endDate;
        }
        
        // デフォルトで15日後
        const endDate = new Date(sekkiDate);
        endDate.setDate(endDate.getDate() + 15);
        return endDate;
    },
    
    // チャレンジ追加モーダル表示
    showAddChallengeModal() {
        this.editingChallengeId = null;
        document.getElementById('challengeModalTitle').textContent = '季節のチャレンジを設定';
        document.getElementById('challengeForm').reset();
        
        // 節気選択肢を設定
        this.updateSekkiOptions();
        
        document.getElementById('challengeModal').classList.remove('hidden');
    },
    
    // 節気選択肢を更新
    updateSekkiOptions() {
        const selectElement = document.getElementById('targetSekki');
        if (!selectElement) return;
        
        selectElement.innerHTML = '';
        
        const options = this.getAvailableSekkiOptions();
        const nextSekki = this.getNextSekki();
        
        options.forEach((sekki, index) => {
            const option = document.createElement('option');
            const startDate = sekki.date.toLocaleDateString('ja-JP');
            const endDate = this.getSekkiEndDate(sekki.date, sekki.name).toLocaleDateString('ja-JP');
            
            option.value = JSON.stringify({
                name: sekki.name,
                startDate: sekki.date.toISOString(),
                endDate: this.getSekkiEndDate(sekki.date, sekki.name).toISOString()
            });
            
            const periodLabel = index === 0 ? '【現在】' : '【次回】';
            option.textContent = `${periodLabel} ${sekki.name} (${startDate}〜${endDate})`;
            
            // 次の節気をデフォルト選択（index=1が次の節気）
            if (index === 1) {
                option.selected = true;
            }
            
            selectElement.appendChild(option);
        });
    },
    
    // モーダルを閉じる
    closeChallengeModal() {
        document.getElementById('challengeModal').classList.add('hidden');
        document.getElementById('challengeForm').reset();
        this.editingChallengeId = null;
    },
    
    // チャレンジ保存
    saveChallenge(event) {
        event.preventDefault();
        
        const sekkiData = JSON.parse(document.getElementById('targetSekki').value);
        
        if (this.editingChallengeId) {
            // 編集モード
            const existingChallenge = this.challenges.find(c => c.id === this.editingChallengeId);
            if (existingChallenge) {
                // 既存のチャレンジを更新
                existingChallenge.text = document.getElementById('challengeName').value;
                existingChallenge.targetSekki = sekkiData.name;
                existingChallenge.startDate = sekkiData.startDate;
                existingChallenge.endDate = sekkiData.endDate;
                existingChallenge.levelDefinitions = [
                    {
                        level: 1,
                        criteria: document.getElementById('challengeLevel1').value,
                        points: 1
                    },
                    {
                        level: 2,
                        criteria: document.getElementById('challengeLevel2').value,
                        points: 2
                    },
                    {
                        level: 3,
                        criteria: document.getElementById('challengeLevel3').value,
                        points: 3
                    }
                ];
                console.log('Challenge updated:', existingChallenge);
            }
        } else {
            // 新規作成モード
            const challengeData = {
                id: `seasonal_${new Date(sekkiData.startDate).toISOString().split('T')[0]}_${Date.now()}`,
                text: document.getElementById('challengeName').value,
                targetSekki: sekkiData.name,
                startDate: sekkiData.startDate,
                endDate: sekkiData.endDate,
                levelDefinitions: [
                    {
                        level: 1,
                        criteria: document.getElementById('challengeLevel1').value,
                        points: 1
                    },
                    {
                        level: 2,
                        criteria: document.getElementById('challengeLevel2').value,
                        points: 2
                    },
                    {
                        level: 3,
                        criteria: document.getElementById('challengeLevel3').value,
                        points: 3
                    }
                ],
                completionHistory: [],
                status: 'active',
                review: {
                    decision: null,
                    promotedHabitId: null
                }
            };
            
            this.challenges.push(challengeData);
            console.log('New challenge created:', challengeData);
        }
        
        this.saveData();
        this.render();
        this.closeChallengeModal();
    },
    
    // チャレンジカード作成
    createChallengeCard(challenge) {
        const card = document.createElement('div');
        card.className = 'washi-card rounded-xl p-4 hover:shadow-lg transition-shadow duration-300 border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50';
        
        const startDate = new Date(challenge.startDate).toLocaleDateString('ja-JP');
        const endDate = new Date(challenge.endDate).toLocaleDateString('ja-JP');
        const daysRemaining = Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        const totalDays = Math.ceil((new Date(challenge.endDate) - new Date(challenge.startDate)) / (1000 * 60 * 60 * 24));
        const daysElapsed = totalDays - daysRemaining;
        
        card.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-sm font-bold text-green-700 bg-green-200 px-2 py-1 rounded">
                            🌿 ${challenge.targetSekki}チャレンジ
                        </span>
                        ${challenge.status === 'pending_review' ? 
                            '<span class="text-sm font-bold text-amber-700 bg-amber-200 px-2 py-1 rounded">レビュー待ち</span>' : 
                            ''}
                    </div>
                    <h3 class="text-lg font-medium text-gray-800 mb-2">${challenge.text}</h3>
                    <div class="space-y-1 text-sm text-gray-600">
                        <div>Lv.1: ${challenge.levelDefinitions[0].criteria}</div>
                        <div>Lv.2: ${challenge.levelDefinitions[1].criteria}</div>
                        <div>Lv.3: ${challenge.levelDefinitions[2].criteria}</div>
                    </div>
                    <div class="mt-3 text-sm">
                        <div class="text-gray-600">期間: ${startDate} 〜 ${endDate}</div>
                        ${challenge.status === 'active' ? 
                            `<div class="text-green-600 font-medium mt-1">
                                進捗: ${daysElapsed}/${totalDays}日 (残り${daysRemaining}日)
                            </div>` : 
                            ''}
                        ${challenge.status === 'pending_review' ? 
                            `<div class="mt-3">
                                <button onclick="app.openChallengeReviewModal('${challenge.id}')" 
                                        class="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all text-sm font-medium">
                                    振り返りを開始
                                </button>
                            </div>` : 
                            ''}
                    </div>
                </div>
                <div class="flex flex-col gap-2 ml-3">
                    <button onclick="seasonalChallengeManager.editChallenge('${challenge.id}')" 
                            class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="編集">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="seasonalChallengeManager.deleteChallenge('${challenge.id}')" 
                            class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="削除">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    },
    
    // アクティブなチャレンジをチェック
    checkActiveChallenges() {
        const now = new Date();
        let hasChanges = false;
        
        this.challenges.forEach(challenge => {
            const startDate = new Date(challenge.startDate);
            const endDate = new Date(challenge.endDate);
            
            // 開始日が来ていて、まだアクティブでないチャレンジをアクティブに
            if (now >= startDate && now <= endDate && challenge.status !== 'active' && challenge.status !== 'pending_review') {
                challenge.status = 'active';
                hasChanges = true;
            }
            // アクティブなチャレンジで期間が終了したものをレビュー待ちに変更
            else if (challenge.status === 'active' && now > endDate) {
                challenge.status = 'pending_review';
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            this.saveData();
            this.render();
        }
    },
    
    // 描画
    render() {
        console.log('seasonalChallengeManager.render() called');
        const container = document.getElementById('seasonalChallenges');
        if (!container) {
            console.error('seasonalChallenges container not found');
            return;
        }
        
        console.log('Total challenges loaded:', this.challenges.length);
        console.log('All challenges:', this.challenges);
        
        // アクティブなチャレンジをチェック
        this.checkActiveChallenges();
        
        // アクティブまたはレビュー待ちのチャレンジのみ表示
        const visibleChallenges = this.challenges.filter(c => {
            const isVisible = c.status === 'active' || c.status === 'pending_review';
            console.log(`Challenge "${c.name || c.text}" - Status: ${c.status}, Visible: ${isVisible}`);
            return isVisible;
        });
        
        console.log('Visible challenges:', visibleChallenges.length, visibleChallenges);
        
        container.innerHTML = '';
        
        if (visibleChallenges.length === 0) {
            console.log('No visible challenges - showing empty state');
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p>季節のチャレンジが設定されていません</p>
                </div>
            `;
        } else {
            console.log('Rendering visible challenges');
            visibleChallenges.forEach(challenge => {
                container.appendChild(this.createChallengeCard(challenge));
            });
        }
    },
    
    // チャレンジを編集
    editChallenge(challengeId) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        if (!challenge) {
            console.error('Challenge not found:', challengeId);
            return;
        }
        
        // 編集モードでモーダルを開く
        this.editingChallengeId = challengeId;
        document.getElementById('challengeModalTitle').textContent = '季節のチャレンジを編集';
        
        // フォームに既存の値を設定
        document.getElementById('challengeName').value = challenge.text || challenge.name || '';
        
        // レベル定義も設定
        if (challenge.levelDefinitions) {
            const level1Field = document.getElementById('challengeLevel1');
            const level2Field = document.getElementById('challengeLevel2');
            const level3Field = document.getElementById('challengeLevel3');
            
            if (level1Field && challenge.levelDefinitions[0]) {
                level1Field.value = challenge.levelDefinitions[0].criteria || '';
            }
            if (level2Field && challenge.levelDefinitions[1]) {
                level2Field.value = challenge.levelDefinitions[1].criteria || '';
            }
            if (level3Field && challenge.levelDefinitions[2]) {
                level3Field.value = challenge.levelDefinitions[2].criteria || '';
            }
        }
        
        // 節気選択肢を設定
        this.updateSekkiOptions();
        
        // 既存の節気を選択（可能であれば）
        const sekkiSelect = document.getElementById('targetSekki');
        if (sekkiSelect && challenge.targetSekki) {
            for (let option of sekkiSelect.options) {
                try {
                    const optionData = JSON.parse(option.value);
                    if (optionData.name === challenge.targetSekki) {
                        option.selected = true;
                        break;
                    }
                } catch (e) {
                    // JSON解析エラーは無視
                }
            }
        }
        
        document.getElementById('challengeModal').classList.remove('hidden');
    },
    
    // チャレンジを削除
    deleteChallenge(challengeId) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        if (!challenge) {
            console.error('Challenge not found:', challengeId);
            return;
        }
        
        const challengeName = challenge.text || challenge.name || 'このチャレンジ';
        if (confirm(`「${challengeName}」を削除しますか？この操作は取り消せません。`)) {
            // チャレンジを配列から削除
            this.challenges = this.challenges.filter(c => c.id !== challengeId);
            
            // データを保存
            this.saveData();
            
            // 再描画
            this.render();
            
            console.log('Challenge deleted:', challengeId);
        }
    }
};