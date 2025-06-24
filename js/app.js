document.addEventListener('DOMContentLoaded', function() {
    // DOMが完全に読み込まれた後に実行
    setTimeout(() => {
        app.updateSekki();
        app.updateTodayDisplay();
    }, 100);
});

const app = {
    tasks: [],
    deadlineTasks: [],
    inboxItems: [],
    selectedDate: new Date(),
    taskType: 'normal',
    totalPoints: 0,
    dailyPointHistory: {},
    dailyReflections: {},
    dailyAIComments: {},
    openaiApiKey: null,

    init() {
        this.loadData();
        this.bindEvents();
        this.updateSekki();
        // スマホ対応：複数回実行して確実に表示
        this.updateTodayDisplay();
        requestAnimationFrame(() => {
            this.updateTodayDisplay();
            setTimeout(() => {
                this.updateTodayDisplay();
            }, 100);
        });
    },

    updateSekki() {
        const now = new Date();
        const year = now.getFullYear();
        const currentYearSekki = sekkiData[year] || [];
        const nextYearSekki = sekkiData[year + 1] || [];
        const allSekki = [...currentYearSekki, ...nextYearSekki];
        let currentSekki = null;
        let nextSekki = null;
        for (let i = 0; i < allSekki.length; i++) {
            if (now >= allSekki[i].date) { currentSekki = allSekki[i]; } 
            else { nextSekki = allSekki[i]; break; }
        }
        if (!currentSekki && allSekki.length > 0) {
            currentSekki = allSekki.find(s => now < s.date) || allSekki[allSekki.length -1]; 
            if (!currentSekki && sekkiData[year-1] && sekkiData[year-1].length > 0) { 
                currentSekki = sekkiData[year-1][sekkiData[year-1].length -1];
            }
        }
        if (currentSekki) {
            document.getElementById('currentSekki').textContent = currentSekki.name;
            const dateStr = currentSekki.date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
            document.getElementById('sekkiDate').textContent = `${dateStr}より`;
            const bg = document.getElementById('backgroundSeason');
            bg.className = bg.className.replace(/bg-[\u4E00-\u9FA5]+/g, '');
            bg.classList.add(`bg-${currentSekki.name}`);
            createSeasonalAnimation(currentSekki.name); 
            this.showSekkiDetail(currentSekki);
        }
        if (nextSekki) {
            const daysUntil = Math.ceil((nextSekki.date - now) / (1000 * 60 * 60 * 24));
            document.getElementById('nextSekkiInfo').textContent = `次は「${nextSekki.name}」 あと${daysUntil}日`;
        } else {
             document.getElementById('nextSekkiInfo').textContent = `次の節気情報は翌年になります`;
        }
        this.updateYearSekkiList();
        this.render();
        // 少し遅延させて確実に表示
        setTimeout(() => this.updateTodayDisplay(), 100);
     },
    
    updateYearSekkiList() {
        const year = this.selectedDate.getFullYear(); 
        const yearSekki = sekkiData[year] || [];
        const listEl = document.getElementById('yearSekkiList');
        listEl.innerHTML = '';
        yearSekki.forEach(sekki => {
            const itemEl = document.createElement('div');
            const isPast = new Date() > sekki.date && !this.isCurrentSekki(sekki, this.selectedDate); 
            const isCurrentlyDisplayedSekki = this.isCurrentSekki(sekki, this.selectedDate); 
            itemEl.className = `p-1.5 sm:p-2 rounded text-center transition-all cursor-pointer ${
                isCurrentlyDisplayedSekki ? 'bg-gray-800 text-white' : 
                isPast ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-100'
            }`;
            itemEl.innerHTML = `
                <div class="font-medium text-xs sm:text-sm">${sekki.name}</div>
                <div class="text-xs ${isCurrentlyDisplayedSekki ? 'text-gray-300' : 'text-gray-500'}">
                    ${sekki.date.getMonth() + 1}/${sekki.date.getDate()}
                </div>`;
            itemEl.addEventListener('click', () => {
                this.showSekkiDetail(sekki); 
                this.updateYearSekkiList(); 
            });
            listEl.appendChild(itemEl);
        });},
    
    showSekkiDetail(sekki) {
        document.getElementById('sekkiDetailName').textContent = sekki.name;
        document.getElementById('sekkiDetailDate').textContent = sekki.date.toLocaleDateString('ja-JP', { 
            year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'
        });
        document.getElementById('sekkiDescription').textContent = sekki.description;
        const bg = document.getElementById('backgroundSeason');
        bg.className = bg.className.replace(/bg-[\u4E00-\u9FA5]+/g, '');
        bg.classList.add(`bg-${sekki.name}`);
        createSeasonalAnimation(sekki.name);},
    
    isCurrentSekki(sekkiToCheck, referenceDate) {
        const year = referenceDate.getFullYear();
        const allSekkiForYear = sekkiData[year] || [];
        const allSekkiForPrevYear = sekkiData[year-1] || [];
        const relevantSekki = [...allSekkiForPrevYear.slice(-1), ...allSekkiForYear];
        for (let i = 0; i < relevantSekki.length; i++) {
            const currentS = relevantSekki[i];
            const nextS = relevantSekki[i + 1];
            if (referenceDate >= currentS.date) {
                if (nextS && referenceDate < nextS.date) {
                    return sekkiToCheck.name === currentS.name && sekkiToCheck.date.getTime() === currentS.date.getTime();
                } else if (!nextS) { 
                    return sekkiToCheck.name === currentS.name && sekkiToCheck.date.getTime() === currentS.date.getTime();
                }
            }
        }
        return false;},
    
    updateCalendarSekkiInfo() {
        const dateInput = document.getElementById('dateInput');
        if (!dateInput.value) return; 
        const selectedDate = new Date(dateInput.value);
        if (isNaN(selectedDate.getTime())) return; 
        const year = selectedDate.getFullYear();
        const sekkiList = [...(sekkiData[year - 1] || []), ...(sekkiData[year] || []), ...(sekkiData[year + 1] || [])].filter(s => s); 
        if (sekkiList.length === 0) {
             document.getElementById('calendarSekkiInfo').classList.add('hidden');
             return;
        }
        let currentSekkiForDate = null;
        for (let i = 0; i < sekkiList.length; i++) {
            if (selectedDate >= sekkiList[i].date) {
                currentSekkiForDate = sekkiList[i];
            } else {
                if (!currentSekkiForDate) currentSekkiForDate = sekkiList[i]; 
                break;
            }
        }
        const infoEl = document.getElementById('calendarSekkiInfo');
        if (currentSekkiForDate) {
            let message = `選択日は「${currentSekkiForDate.name}」の期間です。`;
            if (selectedDate.toDateString() === currentSekkiForDate.date.toDateString()){
                message = `この日は「${currentSekkiForDate.name}」です。`;
            } else {
                const currentIndexInYear = (sekkiData[currentSekkiForDate.date.getFullYear()] || []).findIndex(s => s.name === currentSekkiForDate.name);
                const yearSekki = sekkiData[currentSekkiForDate.date.getFullYear()] || [];
                if (selectedDate < currentSekkiForDate.date && currentIndexInYear > 0) {
                    const prevSekki = yearSekki[currentIndexInYear -1];
                    message = `「${prevSekki.name}」の期間、次の節気は「${currentSekkiForDate.name}」です。`;
                } else if (selectedDate > currentSekkiForDate.date) {
                    const nextSekkiInList = yearSekki[currentIndexInYear + 1];
                    if (nextSekkiInList && selectedDate >= nextSekkiInList.date) {
                        message = `選択日は「${nextSekkiInList.name}」の期間です。`;
                    } else {
                        message = `「${currentSekkiForDate.name}」の期間です。`;
                    }
                }
            }
            infoEl.textContent = message;
            infoEl.classList.remove('hidden');
        } else {
            infoEl.classList.add('hidden');
        }
    },

    loadData() {
        const saved = localStorage.getItem('focusTaskData');
        if (saved) {
            const data = JSON.parse(saved);
            this.tasks = (data.tasks || []).map(t => ({ ...t, createdAt: new Date(t.createdAt), completedAt: t.completedAt ? new Date(t.completedAt) : null, scheduledFor: new Date(t.scheduledFor), points: t.points || 0 }));
            this.deadlineTasks = (data.deadlineTasks || []).map(t => ({ ...t, deadline: new Date(t.deadline), createdAt: new Date(t.createdAt), completedAt: t.completedAt ? new Date(t.completedAt) : null }));
            this.inboxItems = data.inboxItems || [];
            this.totalPoints = data.totalPoints || 0;
            this.dailyPointHistory = data.dailyPointHistory || {};
            this.dailyReflections = data.dailyReflections || {};
            this.dailyAIComments = data.dailyAIComments || {};
            this.openaiApiKey = data.openaiApiKey || null;
        }},

    saveData() {
        localStorage.setItem('focusTaskData', JSON.stringify({ 
            tasks: this.tasks, 
            deadlineTasks: this.deadlineTasks, 
            inboxItems: this.inboxItems, 
            totalPoints: this.totalPoints, 
            dailyPointHistory: this.dailyPointHistory,
            dailyReflections: this.dailyReflections,
            dailyAIComments: this.dailyAIComments,
            openaiApiKey: this.openaiApiKey
        }));},

    bindEvents() { 
        document.getElementById('prevDay').addEventListener('click', () => this.navigateDate(-1));
        document.getElementById('nextDay').addEventListener('click', () => this.navigateDate(1));
        document.getElementById('todayButton').addEventListener('click', () => this.goToToday());
        // Calendar is always visible, no toggle needed
        const dateInputElement = document.getElementById('dateInput');
        dateInputElement.addEventListener('change', (e) => this.selectDate(e.target.value));
        dateInputElement.addEventListener('input', () => this.updateCalendarSekkiInfo()); 
        document.getElementById('normalType').addEventListener('click', () => this.setTaskType('normal'));
        document.getElementById('urgentType').addEventListener('click', () => this.setTaskType('urgent'));
        document.getElementById('addTask').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') {
                if (this.taskType === 'urgent' && this.selectedPoints === 0) {
                    // 目標タスクでポイント未選択の場合は何もしない
                    return;
                }
                this.addTask();
            }
        });
        document.querySelectorAll('.point-select-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const points = parseInt(e.currentTarget.dataset.points);
                this.selectPoints(points);
                // ポイント選択後、自動的にタスクを追加
                setTimeout(() => this.addTask(), 200);
            });
        });
        document.getElementById('deadlineToggle').addEventListener('click', () => this.toggleDeadlineForm());
        document.getElementById('addDeadline').addEventListener('click', () => this.addDeadlineTask());
        document.getElementById('cancelDeadline').addEventListener('click', () => this.toggleDeadlineForm(false)); 
        // Inboxボタン削除に伴いコメントアウト
        // document.getElementById('inboxToggle').addEventListener('click', () => this.toggleInbox());
        
        // スワイプメニューの初期化
        this.setupSwipeMenu();
        document.getElementById('addInbox').addEventListener('click', () => this.addInboxItem());
        document.getElementById('inboxInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') this.addInboxItem(); });
        document.getElementById('reflectionToggle').addEventListener('click', () => this.toggleReflection());
        document.getElementById('saveReflection').addEventListener('click', () => this.saveReflection());
        document.getElementById('cancelReflection').addEventListener('click', () => this.toggleReflection(false));
        document.getElementById('reflectionInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.saveReflection();
        });
        document.getElementById('aiSettingsToggle').addEventListener('click', () => this.toggleApiKeyForm());
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveApiKey());
        document.getElementById('cancelApiKey').addEventListener('click', () => this.toggleApiKeyForm(false));
        document.querySelectorAll('.ai-period-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAIPeriodClick(e.target.dataset.period));
        });
        
        // カスタムカレンダーのイベント
        document.getElementById('calendarToggle').addEventListener('click', () => this.toggleCustomCalendar());
        document.getElementById('calPrevMonth').addEventListener('click', () => this.changeCalendarMonth(-1));
        document.getElementById('calNextMonth').addEventListener('click', () => this.changeCalendarMonth(1));
        
        // 日付入力をクリックしたときもカスタムカレンダーを表示
        document.getElementById('dateInput').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleCustomCalendar(true);
        });

        // --- NEW: スワイプによる日付移動機能 ---
        const swipeArea = document.body;
        let touchStartX = 0;
        let touchStartY = 0;
        let isSwipeActive = false; // スワイプ操作中かどうかのフラグ

        swipeArea.addEventListener('touchstart', (e) => {
            // ボタンや入力、特定の操作エリアではスワイプを開始しない
            if (e.target.closest('button, input, a, .sekki-grid')) {
                isSwipeActive = false;
                return;
            }
            isSwipeActive = true;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        swipeArea.addEventListener('touchend', (e) => {
            if (!isSwipeActive) return;
            isSwipeActive = false; // フラグをリセット

            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    },
    
    // --- NEW: スワイプ操作を処理するメソッド ---
    handleSwipe(startX, startY, endX, endY) {
        const thresholdX = 50;  // 横スワイプとして認識する最小距離
        const restraintY = 100; // 横スワイプ中に許容される縦の最大移動距離

        const diffX = endX - startX;
        const diffY = endY - startY;

        // 横方向の移動がしきい値を超え、縦方向の移動が抑制範囲内かをチェック
        if (Math.abs(diffX) > thresholdX && Math.abs(diffY) < restraintY) {
            if (diffX > 0) {
                this.navigateDate(-1); // 右スワイプで前の日へ
            } else {
                this.navigateDate(1);  // 左スワイプで次の日へ
            }
        }
    },

    navigateDate(days) {
        const newDate = new Date(this.selectedDate);
        newDate.setDate(newDate.getDate() + days);
        this.selectedDate = newDate;
        this.updateSekkiForSelectedDate();
        this.render();},

    goToToday() {
        this.selectedDate = new Date();
        this.updateSekkiForSelectedDate();
        this.render();},

    selectDate(dateStr) {
        const newDate = new Date(dateStr);
        if (!isNaN(newDate.getTime())) {
            this.selectedDate = newDate;
            // Calendar always visible, no need to hide
            this.updateCalendarSekkiInfo(); 
            this.updateSekkiForSelectedDate(); 
            this.render();
        } else {
            this.showError("無効な日付形式です。");
        }},
    updateSekkiForSelectedDate() {
        const year = this.selectedDate.getFullYear();
        const allSekki = [...(sekkiData[year] || []), ...(sekkiData[year + 1] || [])];
        let currentSekkiForDisplay = null;
        let nextSekkiForDisplay = null;
        for (let i = 0; i < allSekki.length; i++) {
            if (this.selectedDate >= allSekki[i].date) { currentSekkiForDisplay = allSekki[i];} 
            else { nextSekkiForDisplay = allSekki[i]; break; }
        }
        if (!currentSekkiForDisplay && allSekki.length > 0) {
            const prevYearSekki = sekkiData[year - 1] || [];
            if (prevYearSekki.length > 0) { currentSekkiForDisplay = prevYearSekki[prevYearSekki.length -1]; } 
            else { currentSekkiForDisplay = allSekki[0]; }
        }
        if (currentSekkiForDisplay) {
            document.getElementById('currentSekki').textContent = currentSekkiForDisplay.name;
            const dateStr = currentSekkiForDisplay.date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
            document.getElementById('sekkiDate').textContent = `${dateStr}より`;
            const bg = document.getElementById('backgroundSeason');
            bg.className = bg.className.replace(/bg-[\u4E00-\u9FA5]+/g, '');
            bg.classList.add(`bg-${currentSekkiForDisplay.name}`);
            createSeasonalAnimation(currentSekkiForDisplay.name);
            this.showSekkiDetail(currentSekkiForDisplay);
        }
        if (nextSekkiForDisplay) {
            const daysUntil = Math.ceil((nextSekkiForDisplay.date - this.selectedDate) / (1000 * 60 * 60 * 24));
            document.getElementById('nextSekkiInfo').textContent = `次は「${nextSekkiForDisplay.name}」 あと${daysUntil > 0 ? daysUntil : 0}日`;
        } else {
             document.getElementById('nextSekkiInfo').textContent = `次の節気情報は翌年になります`;
        }
        this.updateYearSekkiList();},

    toggleCalendar() {
        const dateInputEl = document.getElementById('dateInput');
        // Always visible, so just update the date and focus
        dateInputEl.value = this.selectedDate.toISOString().split('T')[0];
        this.updateCalendarSekkiInfo(); 
        dateInputEl.focus();
    },

    setTaskType(type) {
        this.taskType = type;
        const normalButton = document.getElementById('normalType');
        const urgentButton = document.getElementById('urgentType');
        const pointSelector = document.getElementById('pointSelector');
        const addButton = document.getElementById('addTask');
        
        normalButton.className = `flex-1 px-4 py-2 rounded-full font-medium transition-all button-large ${ type === 'normal' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' }`;
        urgentButton.className = `flex-1 px-4 py-2 rounded-full font-medium transition-all button-large ${ type === 'urgent' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' }`;
        
        if (type === 'urgent') {
            pointSelector.classList.remove('hidden');
            addButton.classList.add('hidden');
            this.selectedPoints = 0;
            document.querySelectorAll('.point-select-button').forEach(btn => {
                btn.classList.remove('border-gray-800', 'bg-gray-100');
                btn.classList.add('border-gray-300');
            });
        } else {
            pointSelector.classList.add('hidden');
            addButton.classList.remove('hidden');
            this.selectedPoints = 0;
        }},

    selectedPoints: 0,
    
    selectPoints(points) {
        this.selectedPoints = points;
        document.querySelectorAll('.point-select-button').forEach(btn => {
            const btnPoints = parseInt(btn.dataset.points);
            if (btnPoints === points) {
                btn.classList.add('border-gray-800', 'bg-gray-100');
                btn.classList.remove('border-gray-300');
            } else {
                btn.classList.remove('border-gray-800', 'bg-gray-100');
                btn.classList.add('border-gray-300');
            }
        });
    },
    
    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();
        if (!text) { this.showError('予定を入力してください'); return; }
        
        if (this.taskType === 'urgent' && this.selectedPoints === 0) {
            this.showError('目標タスクにはポイントを設定してください');
            return;
        }
        
        const todayTasks = this.getTodayTasks();
        const normalCount = todayTasks.filter(t => t.type === 'normal' && !t.isCompleted).length; 
        const urgentCount = todayTasks.filter(t => t.type === 'urgent' && !t.isCompleted).length; 
        if (this.taskType === 'normal' && normalCount >= 3) { this.showError('通常タスクは3件までです（未完了）'); return; }
        if (this.taskType === 'urgent' && urgentCount >= 3) { this.showError('目標タスクは3件までです（未完了）'); return; }
        const newTask = { id: Date.now().toString(), text: text, type: this.taskType, points: this.taskType === 'urgent' ? this.selectedPoints : 0, createdAt: new Date(), completedAt: null, isCompleted: false, scheduledFor: new Date(this.selectedDate) };
        this.tasks.push(newTask);
        input.value = '';
        
        // リセット
        this.selectedPoints = 0;
        document.querySelectorAll('.point-select-button').forEach(btn => {
            btn.classList.remove('border-gray-800', 'bg-gray-100');
            btn.classList.add('border-gray-300');
        });
        
        this.saveData();
        this.render();},

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        if (!task.isCompleted) { 
            this.showCelebration();
            if (task.type === 'urgent' && task.points > 0) {
                this.totalPoints += task.points;
                const today = new Date().toDateString();
                if (!this.dailyPointHistory[today]) {
                    this.dailyPointHistory[today] = 0;
                }
                this.dailyPointHistory[today] += task.points;
            }
        } else {
            if (task.type === 'urgent' && task.points > 0) {
                this.totalPoints -= task.points;
                const today = new Date().toDateString();
                if (this.dailyPointHistory[today]) {
                    this.dailyPointHistory[today] -= task.points;
                }
            }
        }
        task.isCompleted = !task.isCompleted;
        task.completedAt = task.isCompleted ? new Date() : null;
        this.saveData();
        this.render();
        this.updateDailyStatusIndicators();},

    postponeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        const tomorrow = new Date(this.selectedDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowTasks = this.tasks.filter(t => new Date(t.scheduledFor).toDateString() === tomorrow.toDateString() && !t.isCompleted );
        const normalCount = tomorrowTasks.filter(t => t.type === 'normal').length;
        const urgentCount = tomorrowTasks.filter(t => t.type === 'urgent').length;
        if (task.type === 'normal' && normalCount >= 3) { this.showError('翌日の通常タスクは既に3件です（未完了）'); return; }
        if (task.type === 'urgent' && urgentCount >= 3) { this.showError('翌日の目標タスクは既に3件です（未完了）'); return; }
        task.scheduledFor = tomorrow;
        this.showPostponeEffect();
        setTimeout(() => { this.saveData(); this.render(); }, 600);},

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveData();
        this.render();},

    toggleDeadlineForm(forceHide = null) {
        const form = document.getElementById('deadlineForm');
        const activeCount = this.deadlineTasks.filter(t => !t.isCompleted).length;
        if (forceHide === false) { form.classList.add('hidden'); return; }
        if (forceHide === true) { if (activeCount < 3) form.classList.remove('hidden'); else this.showError('期限付きタスクは3件までです'); return; }
        if (form.classList.contains('hidden')) { 
            if (activeCount >= 3) { this.showError('期限付きタスクは3件までです'); return; }
            form.classList.remove('hidden');
            document.getElementById('deadlineDate').min = new Date().toISOString().split('T')[0];
            document.getElementById('deadlineText').focus();
        } else { 
            form.classList.add('hidden');
        }},

    addDeadlineTask() {
        const textEl = document.getElementById('deadlineText');
        const dateEl = document.getElementById('deadlineDate');
        const text = textEl.value.trim();
        const date = dateEl.value;
        if (!text || !date) { this.showError('内容と期限を入力してください'); return; }
        const activeCount = this.deadlineTasks.filter(t => !t.isCompleted).length;
        if (activeCount >= 3) { this.showError('期限付きタスクは3件までです'); return; }
        const newTask = { id: Date.now().toString(), text: text, deadline: new Date(date + "T23:59:59"), createdAt: new Date(), isCompleted: false, completedAt: null };
        this.deadlineTasks.push(newTask);
        textEl.value = ''; dateEl.value = '';
        this.toggleDeadlineForm(false); 
        this.saveData(); this.render();},

    toggleDeadlineTask(taskId) {
        const task = this.deadlineTasks.find(t => t.id === taskId);
        if (!task) return;
        if (!task.isCompleted) { this.showCelebration(); }
        task.isCompleted = !task.isCompleted;
        task.completedAt = task.isCompleted ? new Date() : null;
        this.saveData(); this.render();},

    deleteDeadlineTask(taskId) {
        this.deadlineTasks = this.deadlineTasks.filter(t => t.id !== taskId);
        this.saveData(); this.render();},

    setupSwipeMenu() {
        const menuHandle = document.getElementById('menuHandle');
        const menuItems = document.getElementById('menuItems');
        let isMenuOpen = false;
        let touchStartX = 0;
        
        // タッチイベント
        menuHandle.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        
        menuHandle.addEventListener('touchmove', (e) => {
            const touchX = e.touches[0].clientX;
            const diff = touchX - touchStartX;
            
            if (diff > 30 && !isMenuOpen) {
                menuItems.classList.add('open');
                isMenuOpen = true;
            }
        });
        
        // クリックイベント
        menuHandle.addEventListener('click', () => {
            if (isMenuOpen) {
                menuItems.classList.remove('open');
                isMenuOpen = false;
            } else {
                menuItems.classList.add('open');
                isMenuOpen = true;
            }
        });
        
        // メニュー外をタップしたら閉じる
        document.addEventListener('click', (e) => {
            if (!menuHandle.contains(e.target) && !menuItems.contains(e.target) && isMenuOpen) {
                menuItems.classList.remove('open');
                isMenuOpen = false;
            }
        });
    },
    
    showSettings() {
        // 設定画面を表示する機能（今後実装）
        alert('設定機能はまだ実装されていません');
    },
    
    toggleInbox() {
        const inboxSection = document.getElementById('inboxSection');
        inboxSection.classList.toggle('hidden');},

    addInboxItem() {
        const input = document.getElementById('inboxInput');
        const text = input.value.trim();
        if (!text) return;
        const newItem = { id: Date.now().toString(), text: text, createdAt: new Date() };
        this.inboxItems.push(newItem);
        input.value = '';
        this.saveData(); this.renderInbox();},

    deleteInboxItem(itemId) {
        this.inboxItems = this.inboxItems.filter(i => i.id !== itemId);
        this.saveData(); this.renderInbox();},


    toggleReflection() {
        const form = document.getElementById('reflectionForm');
        const display = document.getElementById('reflectionDisplay');
        const noReflection = document.getElementById('noReflection');
        const dateStr = this.selectedDate.toDateString();
        const existingReflection = this.dailyReflections[dateStr];
        
        if (form.classList.contains('hidden')) {
            form.classList.remove('hidden');
            display.classList.add('hidden');
            noReflection.classList.add('hidden');
            document.getElementById('reflectionInput').value = existingReflection || '';
            document.getElementById('reflectionInput').focus();
        } else {
            form.classList.add('hidden');
            if (existingReflection) {
                display.textContent = existingReflection;
                display.classList.remove('hidden');
                noReflection.classList.add('hidden');
            } else {
                display.classList.add('hidden');
                noReflection.classList.remove('hidden');
            }
        }},

    saveReflection() {
        const input = document.getElementById('reflectionInput');
        const text = input.value.trim();
        const dateStr = this.selectedDate.toDateString();
        
        if (text) {
            this.dailyReflections[dateStr] = text;
        } else {
            delete this.dailyReflections[dateStr];
        }
        
        this.saveData();
        this.toggleReflection();
        this.render();},

    toggleApiKeyForm() {
        const form = document.getElementById('apiKeyForm');
        const apiKeyInput = document.getElementById('apiKeyInput');
        
        if (form.classList.contains('hidden')) {
            form.classList.remove('hidden');
            apiKeyInput.value = this.openaiApiKey || '';
            apiKeyInput.focus();
        } else {
            form.classList.add('hidden');
        }},

    saveApiKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const apiKey = apiKeyInput.value.trim();
        
        if (apiKey) {
            this.openaiApiKey = apiKey;
        } else {
            this.openaiApiKey = null;
        }
        
        this.saveData();
        this.toggleApiKeyForm();
        this.renderAISection();},
    
    handleAIPeriodClick(period) {
        // Check if there's a saved comment for this period
        const dateStr = this.selectedDate.toDateString();
        const savedComments = this.dailyAIComments[dateStr];
        
        if (savedComments && savedComments[period]) {
            // Display saved comment
            const commentText = savedComments[period].content || savedComments[period].comment || savedComments[period];
            this.displayAIComment(commentText, period);
            this.updateAIButtonStates(period);
        } else {
            // Generate new comment with confirmation
            const periodNames = {
                'daily': 'デイリー',
                'weekly': '週間',
                'sekki': '節気',
                'monthly': '月間',
                'quarterly': '三ヶ月'
            };
            const selectedDateStr = this.selectedDate.toLocaleDateString('ja-JP');
            if (confirm(`${selectedDateStr}の${periodNames[period]}コメントを作成しますか？`)) {
                this.generateAIComment(period);
            }
        }
    },

    async generateAIComment(period) {
        if (!this.openaiApiKey) {
            this.showError('APIキーを設定してください');
            return;
        }
        
        const loadingEl = document.getElementById('aiCommentLoading');
        const contentEl = document.getElementById('aiCommentContent');
        const noApiKeyEl = document.getElementById('noApiKey');
        
        loadingEl.classList.remove('hidden');
        contentEl.classList.add('hidden');
        noApiKeyEl.classList.add('hidden');
        
        // 期間別の文字数設定
        const charLimits = {
            'daily': 400,
            'weekly': 600,
            'sekki': 800,
            'monthly': 1000,
            'quarterly': 1000
        };
        const charLimit = charLimits[period] || 400;
        
        try {
            const prompt = this.buildAIPrompt(period);
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'o3',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a supportive coach for someone with ADHD tendencies. Provide encouraging, practical advice while being understanding of ADHD challenges. Write in Japanese. Your response should be approximately ${charLimit} characters in Japanese. IMPORTANT: Always complete your sentences and thoughts. Never cut off mid-sentence. Ensure your response is a complete, coherent message.`
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });
            
            if (!response.ok) {
                throw new Error('APIリクエストが失敗しました');
            }
            
            const data = await response.json();
            const comment = data.choices[0].message.content;
            
            // Save the comment
            const dateStr = this.selectedDate.toDateString();
            if (!this.dailyAIComments[dateStr]) {
                this.dailyAIComments[dateStr] = {};
            }
            this.dailyAIComments[dateStr][period] = {
                content: comment,
                createdAt: new Date().toISOString()
            };
            this.saveData();
            
            // Display the comment
            this.displayAIComment(comment, period);
            loadingEl.classList.add('hidden');
            
            // ボタンの状態を更新
            this.updateAIButtonStates(period);
            
            // Update daily status indicators
            this.updateDailyStatusIndicators();
            
        } catch (error) {
            console.error('AI comment generation error:', error);
            this.showError('AIコメントの生成に失敗しました');
            loadingEl.classList.add('hidden');
            contentEl.classList.add('hidden');
            noApiKeyEl.classList.remove('hidden');
        }},

    displayAIComment(comment, period) {
        const contentEl = document.getElementById('aiCommentContent');
        const displayEl = document.getElementById('aiCommentDisplay');
        
        if (!contentEl) {
            console.error('AI comment content element not found');
            return;
        }
        
        // Create comment container with delete button
        const commentContainer = document.createElement('div');
        commentContainer.className = 'ai-comment-container relative';
        commentContainer.innerHTML = `
            <div class="pr-8" style="white-space: pre-wrap; word-wrap: break-word;">${this.escapeHtml(comment)}</div>
            <button onclick="app.deleteAIComment('${period}')" 
                    class="ai-comment-delete absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600 transition-all" 
                    title="削除">
                <span class="text-xl leading-none">×</span>
            </button>
        `;
        
        contentEl.innerHTML = '';
        contentEl.appendChild(commentContainer);
        contentEl.classList.remove('hidden');
        
        // Ensure loading is hidden
        const loadingEl = document.getElementById('aiCommentLoading');
        if (loadingEl) {
            loadingEl.classList.add('hidden');
        }
    },
    
    deleteAIComment(period) {
        const dateStr = this.selectedDate.toDateString();
        if (this.dailyAIComments[dateStr] && this.dailyAIComments[dateStr][period]) {
            delete this.dailyAIComments[dateStr][period];
            if (Object.keys(this.dailyAIComments[dateStr]).length === 0) {
                delete this.dailyAIComments[dateStr];
            }
            this.saveData();
            this.renderAISection();
            this.updateDailyStatusIndicators();
        }
    },
    
    updateAIButtonStates(activePeriod) {
        document.querySelectorAll('.ai-period-button').forEach(btn => {
            if (btn.dataset.period === activePeriod) {
                btn.classList.add('bg-gray-800', 'text-white');
                btn.classList.remove('bg-gray-200', 'text-gray-700');
            } else {
                btn.classList.remove('bg-gray-800', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            }
        });
    },

    buildAIPrompt(period) {
        const selectedDate = this.selectedDate;
        let startDate, endDate;
        
        switch(period) {
            case 'daily':
                startDate = endDate = selectedDate;
                break;
            case 'weekly':
                startDate = new Date(selectedDate);
                startDate.setDate(selectedDate.getDate() - 6);
                endDate = selectedDate;
                break;
            case 'sekki':
                const year = selectedDate.getFullYear();
                const yearSekki = sekkiData[year] || [];
                const currentSekki = yearSekki.find(s => selectedDate >= s.date) || yearSekki[0];
                const nextSekki = yearSekki.find(s => s.date > currentSekki.date);
                startDate = currentSekki.date;
                endDate = nextSekki ? new Date(nextSekki.date.getTime() - 1) : selectedDate;
                break;
            case 'monthly':
                startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
                break;
            case 'quarterly':
                startDate = new Date(selectedDate);
                startDate.setMonth(selectedDate.getMonth() - 3);
                endDate = selectedDate;
                break;
            default:
                startDate = endDate = selectedDate;
        }
        
        // 期間内のタスクと振り返りを収集
        const tasksInPeriod = this.tasks.filter(t => {
            const taskDate = new Date(t.scheduledFor);
            return taskDate >= startDate && taskDate <= endDate;
        });
        
        const completedTasks = tasksInPeriod.filter(t => t.isCompleted);
        const incompleteTasks = tasksInPeriod.filter(t => !t.isCompleted);
        const totalPointsInPeriod = completedTasks.filter(t => t.type === 'urgent').reduce((sum, t) => sum + (t.points || 0), 0);
        
        const reflections = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toDateString();
            if (this.dailyReflections[dateStr]) {
                reflections.push(`${d.toLocaleDateString('ja-JP')}: ${this.dailyReflections[dateStr]}`);
            }
        }
        
        let prompt = `期間: ${startDate.toLocaleDateString('ja-JP')} - ${endDate.toLocaleDateString('ja-JP')}\n`;
        prompt += `完了タスク: ${completedTasks.length}件\n`;
        prompt += `未完了タスク: ${incompleteTasks.length}件\n`;
        prompt += `獲得ポイント: ${totalPointsInPeriod}pt\n`;
        
        if (reflections.length > 0) {
            prompt += `\n振り返り:\n${reflections.join('\n')}`;
        }
        
        return prompt;},

    renderAISection() {
        const noApiKeyEl = document.getElementById('noApiKey');
        const contentEl = document.getElementById('aiCommentContent');
        const loadingEl = document.getElementById('aiCommentLoading');
        
        if (this.openaiApiKey) {
            noApiKeyEl.classList.add('hidden');
            
            // Check for saved comments for current date
            const dateStr = this.selectedDate.toDateString();
            const savedComments = this.dailyAIComments[dateStr];
            
            if (savedComments && Object.keys(savedComments).length > 0) {
                // Display the first saved comment found
                const periods = ['daily', 'weekly', 'sekki', 'monthly', 'quarterly'];
                let displayedPeriod = null;
                
                for (const period of periods) {
                    if (savedComments[period]) {
                        this.displayAIComment(savedComments[period].comment, period);
                        displayedPeriod = period;
                        break;
                    }
                }
                
                if (displayedPeriod) {
                    this.updateAIButtonStates(displayedPeriod);
                }
            } else {
                contentEl.classList.add('hidden');
                loadingEl.classList.add('hidden');
            }
        } else {
            noApiKeyEl.classList.remove('hidden');
            contentEl.classList.add('hidden');
            loadingEl.classList.add('hidden');
        }},

    getTodayTasks() {
        return this.tasks.filter(t => new Date(t.scheduledFor).toDateString() === this.selectedDate.toDateString());},

    renderDeadlineTasks() {
        const listEl = document.getElementById('deadlineList');
        const noTasksEl = document.getElementById('noDeadlineTasks');
        
        const sortedTasks = [...this.deadlineTasks].sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            return new Date(a.deadline) - new Date(b.deadline);
        });
        
        if (sortedTasks.length === 0) {
            listEl.innerHTML = '';
            noTasksEl.classList.remove('hidden');
            return;
        }
        
        noTasksEl.classList.add('hidden');
        listEl.innerHTML = sortedTasks.map(task => {
            const deadline = new Date(task.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;
            
            return `
                <div class="washi-card rounded-lg p-3 ${task.isCompleted ? 'task-completed' : 'task-normal-active'}">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex items-start gap-3 flex-1">
                            <button onclick="app.toggleDeadlineTask('${task.id}')" class="wa-checkbox rounded-lg ${task.isCompleted ? 'checked' : ''} mt-0.5"></button>
                            <div class="flex-1">
                                <div class="text-base ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}">${this.escapeHtml(task.text)}</div>
                                <div class="text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'} mt-1">
                                    期限: ${deadline.toLocaleDateString('ja-JP')} 
                                    ${!task.isCompleted ? `(${isOverdue ? '期限切れ' : `あと${daysLeft}日`})` : ''}
                                </div>
                            </div>
                        </div>
                        <button onclick="app.deleteDeadlineTask('${task.id}')" class="p-2 text-gray-400 hover:text-gray-600 transition-all">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>`;
        }).join('');},

    renderInbox() {
        const listEl = document.getElementById('inboxList');
        
        if (this.inboxItems.length === 0) {
            listEl.innerHTML = '<p class="text-center py-4 text-gray-500 text-sm">覚書はありません</p>';
            return;
        }
        
        listEl.innerHTML = this.inboxItems.map(item => `
            <div class="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-700 flex-1">${this.escapeHtml(item.text)}</span>
                <button onclick="app.deleteInboxItem('${item.id}')" class="p-1 text-gray-400 hover:text-gray-600 transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>`).join('');},

    updateTodayDisplay() {
        const today = new Date();
        const todayDateYearEl = document.getElementById('todayDateYear');
        const todayDateFullEl = document.getElementById('todayDateFull');
        const todayDateDayEl = document.getElementById('todayDateDay');
        
        // 要素が存在しない場合はリトライ
        if (!todayDateYearEl || !todayDateFullEl || !todayDateDayEl) {
            console.warn('Today display elements not found, retrying...');
            return;
        }
        
        // 強制的にスタイルを適用して表示を確実に
        const yearText = today.getFullYear() + '年';
        const monthDayText = (today.getMonth() + 1) + '月' + today.getDate() + '日';
        const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
        const dayText = weekdays[today.getDay()];
        
        todayDateYearEl.textContent = yearText;
        todayDateYearEl.style.display = 'block';
        todayDateYearEl.style.visibility = 'visible';
        
        todayDateFullEl.textContent = monthDayText;
        todayDateFullEl.style.display = 'block';
        todayDateFullEl.style.visibility = 'visible';
        
        todayDateDayEl.textContent = dayText;
        todayDateDayEl.style.display = 'block';
        todayDateDayEl.style.visibility = 'visible';
        
        // 親要素も表示を確実に
        const parentEl = todayDateYearEl.parentElement;
        if (parentEl) {
            parentEl.style.display = 'block';
            parentEl.style.visibility = 'visible';
        }
    },

    render() {
        const todayTasks = this.getTodayTasks();
        const completedCount = todayTasks.filter(t => t.isCompleted).length;
        const totalCount = todayTasks.length;
        const totalPointsToday = todayTasks.filter(t => t.isCompleted && t.type === 'urgent').reduce((sum, t) => sum + (t.points || 0), 0);
        
        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('totalCount').textContent = totalCount;
        document.getElementById('totalPointsDisplay').textContent = totalPointsToday;
        
        const dateEl = document.getElementById('currentDate');
        const dateYearEl = document.getElementById('currentDateYear');
        const dateDayEl = document.getElementById('currentDateDay');
        dateEl.textContent = this.selectedDate.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
        dateYearEl.textContent = this.selectedDate.toLocaleDateString('ja-JP', { year: 'numeric' });
        dateDayEl.textContent = this.selectedDate.toLocaleDateString('ja-JP', { weekday: 'short' });
        
        const isToday = this.selectedDate.toDateString() === new Date().toDateString();
        const todayButton = document.getElementById('todayButton');
        const calendarToggle = document.getElementById('calendarToggle');
        
        if (isToday) {
            todayButton.classList.add('hidden');
            calendarToggle.classList.add('bg-amber-50', 'border-amber-400');
        } else {
            todayButton.classList.remove('hidden');
            calendarToggle.classList.remove('bg-amber-50', 'border-amber-400');
        }
        
        // Update daily status indicators
        this.updateDailyStatusIndicators();
        
        const dateInputEl = document.getElementById('dateInput');
        dateInputEl.value = this.selectedDate.toISOString().split('T')[0];
        
        const normalSlots = document.getElementById('normalSlots');
        const urgentSlots = document.getElementById('urgentSlots');
        const normalUncompletedCount = todayTasks.filter(t => t.type === 'normal' && !t.isCompleted).length;
        const urgentUncompletedCount = todayTasks.filter(t => t.type === 'urgent' && !t.isCompleted).length;
        normalSlots.textContent = 3 - normalUncompletedCount;
        urgentSlots.textContent = 3 - urgentUncompletedCount;
        
        const taskListEl = document.getElementById('taskList');
        const noTasksEl = document.getElementById('noTasks');
        
        const sortedTasks = [...todayTasks].sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            if (a.type !== b.type) return a.type === 'urgent' ? -1 : 1;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
        
        if (sortedTasks.length === 0) {
            taskListEl.innerHTML = '';
            noTasksEl.classList.remove('hidden');
        } else {
            noTasksEl.classList.add('hidden');
            taskListEl.innerHTML = sortedTasks.map(task => `
                <div class="washi-card rounded-xl p-4 task-card mobile-compact animate-fadeInUp ${
                    task.isCompleted ? 'task-completed' : 
                    task.type === 'urgent' ? 'task-urgent-active' : 'task-normal-active'
                }">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex items-start gap-3 flex-1">
                            <button onclick="app.toggleTask('${task.id}')" class="wa-checkbox rounded-lg ${task.isCompleted ? 'checked' : ''} mt-0.5"></button>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1 flex-wrap">
                                    ${task.type === 'urgent' ? `
                                        <span class="task-type-label">
                                            目標 ${task.points ? `${task.points}pt` : ''}
                                        </span>` : 
                                        '<span class="task-type-label">通常</span>'
                                    }
                                    ${task.isCompleted ? '<span class="task-completed-badge">完了</span>' : ''}
                                </div>
                                <div class="task-text-lg ${task.isCompleted ? 'line-through' : ''}">${this.escapeHtml(task.text)}</div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1">
                            ${!task.isCompleted && !isToday ? `
                                <button onclick="app.postponeTask('${task.id}')" class="p-2 text-gray-400 hover:text-gray-600 transition-all" title="翌日へ先送り">
                                    <svg class="w-4 h-4 mobile-text-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                    </svg>
                                </button>` : ''}
                            <button onclick="app.deleteTask('${task.id}')" class="p-2 text-gray-400 hover:text-gray-600 transition-all">
                                <svg class="w-4 h-4 mobile-text-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>`).join('');
        }
        
        this.renderDeadlineTasks();
        this.renderInbox();
        this.renderReflection();
        this.renderAISection();},

    renderReflection() {
        const dateStr = this.selectedDate.toDateString();
        const reflection = this.dailyReflections[dateStr];
        const display = document.getElementById('reflectionDisplay');
        const noReflection = document.getElementById('noReflection');
        const form = document.getElementById('reflectionForm');
        
        if (!form.classList.contains('hidden')) {
            return;
        }
        
        if (reflection) {
            display.textContent = reflection;
            display.classList.remove('hidden');
            noReflection.classList.add('hidden');
        } else {
            display.classList.add('hidden');
            noReflection.classList.remove('hidden');
        }},

    showCelebration() {
        const celebration = document.getElementById('celebration');
        celebration.classList.remove('hidden');
        setTimeout(() => celebration.classList.add('hidden'), 1500);},

    showPostponeEffect() {
        const effect = document.getElementById('postponeEffect');
        effect.classList.remove('hidden');
        setTimeout(() => effect.classList.add('hidden'), 1000);},

    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
        setTimeout(() => errorEl.classList.add('hidden'), 3000);},

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    calendarMonth: new Date(),
    
    toggleCustomCalendar(show = null) {
        const popup = document.getElementById('customCalendarPopup');
        const shouldShow = show !== null ? show : popup.classList.contains('hidden');
        
        if (shouldShow) {
            popup.classList.remove('hidden');
            this.renderCalendar();
            // ポップアップ外をクリックしたら閉じる
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    this.toggleCustomCalendar(false);
                }
            });
        } else {
            popup.classList.add('hidden');
        }
    },
    
    changeCalendarMonth(direction) {
        this.calendarMonth.setMonth(this.calendarMonth.getMonth() + direction);
        this.renderCalendar();
    },
    
    renderCalendar() {
        const year = this.calendarMonth.getFullYear();
        const month = this.calendarMonth.getMonth();
        
        // 月の表示を更新
        document.getElementById('calendarMonth').textContent = 
            `${year}年${month + 1}月`;
        
        // カレンダーグリッドをクリア
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '';
        
        // 月の最初の日と最後の日を取得
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // 月の最初の日の曜日を取得（0=日曜）
        const firstDayOfWeek = firstDay.getDay();
        
        // 前月の日付を追加
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const date = new Date(year, month - 1, day);
            grid.appendChild(this.createCalendarDay(date, true));
        }
        
        // 当月の日付を追加
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            grid.appendChild(this.createCalendarDay(date, false));
        }
        
        // 次月の日付を追加（6週間表示）
        const remainingDays = 42 - grid.children.length;
        for (let day = 1; day <= remainingDays; day++) {
            const date = new Date(year, month + 1, day);
            grid.appendChild(this.createCalendarDay(date, true));
        }
    },
    
    createCalendarDay(date, isOtherMonth) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayEl.classList.add('other-month');
        }
        
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
        }
        
        if (date.toDateString() === this.selectedDate.toDateString()) {
            dayEl.classList.add('selected');
        }
        
        // 日付番号
        const numberEl = document.createElement('div');
        numberEl.className = 'calendar-day-number';
        numberEl.textContent = date.getDate();
        dayEl.appendChild(numberEl);
        
        // その日のデータを取得
        const dateStr = date.toDateString();
        const dayTasks = this.tasks.filter(t => 
            new Date(t.scheduledFor).toDateString() === dateStr
        );
        const completedTasks = dayTasks.filter(t => t.isCompleted).length;
        const totalTasks = dayTasks.length;
        const points = this.dailyPointHistory[dateStr] || 0;
        const hasAIComment = this.dailyAIComments[dateStr] && 
            Object.keys(this.dailyAIComments[dateStr]).length > 0;
        const hasReflection = this.dailyReflections[dateStr] && 
            this.dailyReflections[dateStr].trim() !== '';
        
        // 統計情報を表示
        if (totalTasks > 0 || points > 0 || hasAIComment || hasReflection) {
            const statsEl = document.createElement('div');
            statsEl.className = 'calendar-day-stats';
            
            // タスク情報
            if (totalTasks > 0) {
                const taskStat = document.createElement('div');
                taskStat.className = 'calendar-stat tasks';
                taskStat.textContent = `${completedTasks}/${totalTasks}`;
                statsEl.appendChild(taskStat);
            }
            
            // ポイント情報
            if (points > 0) {
                const pointStat = document.createElement('div');
                pointStat.className = 'calendar-stat points';
                pointStat.textContent = `${points}pt`;
                statsEl.appendChild(pointStat);
            }
            
            // インジケーター
            if (hasAIComment || hasReflection) {
                const indicators = document.createElement('div');
                indicators.className = 'calendar-indicators';
                
                if (hasAIComment) {
                    const aiIndicator = document.createElement('div');
                    aiIndicator.className = 'calendar-indicator ai';
                    aiIndicator.title = 'AIコメントあり';
                    indicators.appendChild(aiIndicator);
                }
                
                if (hasReflection) {
                    const reflIndicator = document.createElement('div');
                    reflIndicator.className = 'calendar-indicator reflection';
                    reflIndicator.title = '振り返りあり';
                    indicators.appendChild(reflIndicator);
                }
                
                statsEl.appendChild(indicators);
            }
            
            dayEl.appendChild(statsEl);
        }
        
        // クリックイベント
        dayEl.addEventListener('click', () => {
            this.selectedDate = new Date(date);
            this.updateSekkiForSelectedDate();
            this.render();
            this.toggleCustomCalendar(false);
            document.getElementById('dateInput').value = 
                this.selectedDate.toISOString().split('T')[0];
        });
        
        return dayEl;
    },
    
    updateDailyStatusIndicators() {
        const dateStr = this.selectedDate.toDateString();
        const todayTasks = this.getTodayTasks();
        const completedCount = todayTasks.filter(t => t.isCompleted).length;
        const totalCount = todayTasks.length;
        const calendarToggle = document.getElementById('calendarToggle');
        
        // Get elements
        const completionRateBadge = document.getElementById('completionRateBadge');
        const completionRateText = document.getElementById('completionRateText');
        const dailyPointsBadge = document.getElementById('dailyPointsBadge');
        const dailyPointsText = document.getElementById('dailyPointsText');
        const aiCommentBadge = document.getElementById('aiCommentBadge');
        const reflectionBadge = document.getElementById('reflectionBadge');
        
        // Hide all badges initially
        completionRateBadge.classList.add('hidden');
        dailyPointsBadge.classList.add('hidden');
        aiCommentBadge.classList.add('hidden');
        reflectionBadge.classList.add('hidden');
        calendarToggle.classList.remove('has-status-badges');
        
        let hasAnyBadge = false;
        
        // Show completion rate if there are tasks
        if (totalCount > 0) {
            const completionRate = Math.round((completedCount / totalCount) * 100);
            completionRateText.textContent = `${completionRate}%`;
            completionRateBadge.classList.remove('hidden');
            hasAnyBadge = true;
        }
        
        // Show points badge if points were earned
        const earnedPoints = this.dailyPointHistory[dateStr] || 0;
        if (earnedPoints > 0) {
            dailyPointsText.textContent = `${earnedPoints}pt`;
            dailyPointsBadge.classList.remove('hidden');
            hasAnyBadge = true;
        }
        
        // Show AI comment badge if there are comments for this day
        if (this.dailyAIComments[dateStr] && Object.keys(this.dailyAIComments[dateStr]).length > 0) {
            aiCommentBadge.classList.remove('hidden');
            hasAnyBadge = true;
        }
        
        // Show reflection badge if there's a reflection for this day
        if (this.dailyReflections[dateStr]) {
            reflectionBadge.classList.remove('hidden');
            hasAnyBadge = true;
        }
        
        // Add class to calendar toggle if any badges are shown
        if (hasAnyBadge) {
            calendarToggle.classList.add('has-status-badges');
        }
    }
};

// Initialize app
app.init();

// PWAインストールプロンプト
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // インストールボタンは表示しない
});