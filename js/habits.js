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