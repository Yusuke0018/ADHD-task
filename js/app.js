// ページ読み込み完了後の処理
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        app.updateSekki();
        app.updateTodayDisplay();
    });
} else {
    // 既に読み込み完了している場合
    app.updateSekki();
    app.updateTodayDisplay();
}

const app = {
    tasks: [],
    deadlineTasks: [],
    selectedDate: new Date(),
    taskType: 'normal',
    totalPoints: 0,
    dailyPointHistory: {},
    dailyReflections: {},
    dailyAIComments: {},
    openaiApiKey: null,

    init() {
        console.log('App initializing...');
        this.loadData();
        this.bindEvents();
        this.updateSekki();
        // スマホ対応：確実に表示
        requestAnimationFrame(() => {
            this.updateTodayDisplay();
        });
        setTimeout(() => this.updateTodayDisplay(), 500);
        window.addEventListener('orientationchange', () => this.updateTodayDisplay());
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateTodayDisplay();
            }
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
            this.tasks = (data.tasks || []).map(t => ({ 
                ...t, 
                createdAt: new Date(t.createdAt), 
                completedAt: t.completedAt ? new Date(t.completedAt) : null, 
                scheduledFor: new Date(t.scheduledFor), 
                points: t.points || 0,
                status: t.status || (t.isCompleted ? 'achieved' : 'pending') // 旧データの互換性
            }));
            this.deadlineTasks = (data.deadlineTasks || []).map(t => ({ ...t, deadline: new Date(t.deadline), createdAt: new Date(t.createdAt), completedAt: t.completedAt ? new Date(t.completedAt) : null }));
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
 
            totalPoints: this.totalPoints, 
            dailyPointHistory: this.dailyPointHistory,
            dailyReflections: this.dailyReflections,
            dailyAIComments: this.dailyAIComments,
            openaiApiKey: this.openaiApiKey
        }));},

    bindEvents() { 
        console.log('bindEvents called');
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
                this.addTask();
            }
        });
        document.getElementById('deadlineToggle').addEventListener('click', () => this.toggleDeadlineForm());
        document.getElementById('addDeadline').addEventListener('click', () => this.addDeadlineTask());
        document.getElementById('cancelDeadline').addEventListener('click', () => this.toggleDeadlineForm(false)); 
        
        // タスク完了モーダルのイベント
        document.getElementById('taskAchievedBtn').addEventListener('click', () => this.completeTask(true));
        document.getElementById('taskNotAchievedBtn').addEventListener('click', () => this.completeTask(false));
        document.getElementById('taskCompletionCancelBtn').addEventListener('click', () => this.closeTaskCompletionModal());
        document.querySelectorAll('.completion-point-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const points = parseInt(e.currentTarget.dataset.points);
                this.selectCompletionPoints(points);
            });
        });
        
        // プロジェクトポイント付与のイベント
        document.getElementById('assignToProject').addEventListener('change', (e) => {
            const selectionArea = document.getElementById('projectSelectionArea');
            if (e.target.checked) {
                const projects = this.loadProjectsForModal();
                if (projects.length === 0) {
                    e.target.checked = false;
                    this.showError('まずプロジェクトを作成してください');
                    return;
                }
                selectionArea.classList.remove('hidden');
                if (projects.length === 1) {
                    document.getElementById('projectSelector').value = projects[0].id;
                }
            } else {
                selectionArea.classList.add('hidden');
                this.selectedProjectId = null;
                this.selectedProjectPoints = 0;
            }
        });
        
        document.querySelectorAll('.project-point-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const points = parseInt(e.currentTarget.dataset.projectPoints);
                this.selectProjectPoints(points);
            });
        });
        
        // スワイプメニューの初期化
        this.setupSwipeMenu();
        
        // Add event listeners with null checks
        const reflectionToggle = document.getElementById('reflectionToggle');
        const saveReflection = document.getElementById('saveReflection');
        const cancelReflection = document.getElementById('cancelReflection');
        const reflectionInput = document.getElementById('reflectionInput');
        
        if (reflectionToggle) reflectionToggle.addEventListener('click', () => this.toggleReflection());
        if (saveReflection) saveReflection.addEventListener('click', () => this.saveReflection());
        if (cancelReflection) cancelReflection.addEventListener('click', () => this.toggleReflection(false));
        if (reflectionInput) {
            reflectionInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) this.saveReflection();
            });
        }
        const aiSettingsToggle = document.getElementById('aiSettingsToggle');
        const saveApiKey = document.getElementById('saveApiKey');
        const cancelApiKey = document.getElementById('cancelApiKey');
        
        if (aiSettingsToggle) aiSettingsToggle.addEventListener('click', () => this.toggleApiKeyForm());
        if (saveApiKey) saveApiKey.addEventListener('click', () => this.saveApiKey());
        if (cancelApiKey) cancelApiKey.addEventListener('click', () => this.toggleApiKeyForm(false));
        
        document.querySelectorAll('.ai-period-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAIPeriodClick(e.target.dataset.period));
        });
        
        // カスタムカレンダーのイベント
        const calendarToggle = document.getElementById('calendarToggle');
        const calPrevMonth = document.getElementById('calPrevMonth');
        const calNextMonth = document.getElementById('calNextMonth');
        const dateInput = document.getElementById('dateInput');
        
        if (calendarToggle) calendarToggle.addEventListener('click', () => this.toggleCustomCalendar());
        if (calPrevMonth) calPrevMonth.addEventListener('click', () => this.changeCalendarMonth(-1));
        if (calNextMonth) calNextMonth.addEventListener('click', () => this.changeCalendarMonth(1));
        
        // 日付入力をクリックしたときもカスタムカレンダーを表示
        if (dateInput) {
            dateInput.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCustomCalendar(true);
            });
        }

        // --- NEW: スワイプによる日付移動機能 ---
        const swipeArea = document.body;
        console.log('Setting up swipe listeners on:', swipeArea);
        let swipeStartX = 0;
        let swipeStartY = 0;
        let isSwipeActive = false; // スワイプ操作中かどうかのフラグ

        const swipeStart = (e) => {
            console.log('swipeStart triggered', e.type);
            // スワイプを無効化するエリアを、本当に必要なものだけに限定する
            if (e.target.closest('#menuHandle, #menuItems, #customCalendarPopup, .point-select-button, .sekki-grid, textarea')) {
                console.log('Swipe blocked by element');
                isSwipeActive = false;
                return;
            }
            isSwipeActive = true;
            const point = e.changedTouches ? e.changedTouches[0] : e;
            swipeStartX = point.clientX;
            swipeStartY = point.clientY;
            console.log('Swipe started at:', swipeStartX, swipeStartY);
        };

        const swipeEnd = (e) => {
            console.log('swipeEnd triggered', e.type);
            if (!isSwipeActive) {
                console.log('Swipe was not active');
                return;
            }
            isSwipeActive = false; // フラグをリセット

            const point = e.changedTouches ? e.changedTouches[0] : e;
            const endX = point.clientX;
            const endY = point.clientY;
            console.log('Swipe ended at:', endX, endY);
            this.handleSwipe(swipeStartX, swipeStartY, endX, endY);
        };

        swipeArea.addEventListener('touchstart', swipeStart, { passive: false });
        swipeArea.addEventListener('touchend', swipeEnd, { passive: false });
        swipeArea.addEventListener('pointerdown', swipeStart);
        swipeArea.addEventListener('pointerup', swipeEnd);
    },
    
    // --- NEW: スワイプ操作を処理するメソッド ---
    handleSwipe(startX, startY, endX, endY) {
        console.log('handleSwipe called');
        const thresholdX = 50;  // 横スワイプとして認識する最小距離
        const restraintY = 100; // 横スワイプ中に許容される縦の最大移動距離

        const diffX = endX - startX;
        const diffY = endY - startY;
        console.log('Swipe diff:', { diffX, diffY });

        // 横方向の移動がしきい値を超え、縦方向の移動が抑制範囲内かをチェック
        if (Math.abs(diffX) > thresholdX && Math.abs(diffY) < restraintY) {
            console.log('Swipe detected!');
            if (diffX > 0) {
                console.log('Right swipe - navigating to previous day');
                this.navigateDate(-1); // 右スワイプで前の日へ
            } else {
                console.log('Left swipe - navigating to next day');
                this.navigateDate(1);  // 左スワイプで次の日へ
            }
        } else {
            console.log('Swipe not detected - threshold not met');
        }
    },

    navigateDate(days) {
        console.log('navigateDate called with days:', days);
        console.log('Current selectedDate:', this.selectedDate);
        const newDate = new Date(this.selectedDate);
        newDate.setDate(newDate.getDate() + days);
        console.log('New date:', newDate);
        this.selectedDate = newDate;
        this.updateSekkiForSelectedDate();
        this.render();
        console.log('After render, selectedDate:', this.selectedDate);
    },

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


    setTaskType(type) {
        this.taskType = type;
        const normalButton = document.getElementById('normalType');
        const urgentButton = document.getElementById('urgentType');
        
        normalButton.className = `flex-1 px-4 py-2 rounded-full font-medium transition-all button-large ${ type === 'normal' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' }`;
        urgentButton.className = `flex-1 px-4 py-2 rounded-full font-medium transition-all button-large ${ type === 'urgent' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' }`;
    },

    
    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();
        if (!text) { this.showError('予定を入力してください'); return; }
        
        const todayTasks = this.getTodayTasks();
        const normalCount = todayTasks.filter(t => t.type === 'normal' && t.status === 'pending').length; 
        const urgentCount = todayTasks.filter(t => t.type === 'urgent' && t.status === 'pending').length; 
        if (this.taskType === 'normal' && normalCount >= 3) { this.showError('通常タスクは3件までです（未完了）'); return; }
        if (this.taskType === 'urgent' && urgentCount >= 3) { this.showError('目標タスクは3件までです（未完了）'); return; }
        
        const newTask = { 
            id: Date.now().toString(), 
            text: text, 
            type: this.taskType, 
            points: 0, // ポイントは完了時に設定
            createdAt: new Date(), 
            completedAt: null, 
            status: 'pending', // pending, achieved, notAchieved
            scheduledFor: new Date(this.selectedDate) 
        };
        this.tasks.push(newTask);
        input.value = '';
        
        this.saveData();
        this.render();
    },

    // タスククリック時の処理
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // 既に完了している場合はpendingに戻す
        if (task.status !== 'pending') {
            if (task.type === 'urgent' && task.points > 0) {
                this.totalPoints -= task.points;
                const dateStr = new Date(task.scheduledFor).toDateString();
                if (this.dailyPointHistory[dateStr]) {
                    this.dailyPointHistory[dateStr] -= task.points;
                }
            }
            // プロジェクトポイントを戻す
            if (task.projectId && task.projectPoints && window.addPointsToProject) {
                window.addPointsToProject(task.projectId, -task.projectPoints);
            }
            task.status = 'pending';
            task.completedAt = null;
            task.points = 0;
            task.projectId = null;
            task.projectPoints = 0;
            this.saveData();
            this.render();
            this.updateDailyStatusIndicators();
        } else {
            // 未完了の場合は完了モーダルを表示
            this.showTaskCompletionModal(taskId);
        }
    },
    
    // 現在処理中のタスクID
    currentCompletingTaskId: null,
    selectedCompletionPoints: 0,
    
    // タスク完了モーダルを表示
    showTaskCompletionModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        this.currentCompletingTaskId = taskId;
        this.selectedCompletionPoints = 0;
        this.selectedProjectId = null;
        this.selectedProjectPoints = 0;
        
        const modal = document.getElementById('taskCompletionModal');
        const taskText = document.getElementById('taskCompletionText');
        const pointSelector = document.getElementById('completionPointSelector');
        const projectAssignment = document.getElementById('projectPointAssignment');
        
        taskText.textContent = `「${task.text}」を完了しますか？`;
        
        // 目標タスクの場合はポイント選択を表示
        if (task.type === 'urgent') {
            pointSelector.classList.remove('hidden');
            document.querySelectorAll('.completion-point-button').forEach(btn => {
                btn.classList.remove('border-gray-800', 'bg-gray-100');
                btn.classList.add('border-gray-300');
            });
        } else {
            pointSelector.classList.add('hidden');
        }
        
        // プロジェクトポイント付与セクションを表示
        projectAssignment.classList.remove('hidden');
        this.loadProjectsForModal();
        
        // チェックボックスをリセット
        document.getElementById('assignToProject').checked = false;
        document.getElementById('projectSelectionArea').classList.add('hidden');
        
        // プロジェクトポイントボタンをリセット
        document.querySelectorAll('.project-point-button').forEach(btn => {
            btn.classList.remove('border-blue-500', 'bg-blue-50');
            btn.classList.add('border-gray-300');
        });
        
        modal.classList.remove('hidden');
        modal.classList.remove('pointer-events-none');
    },
    
    // ポイント選択（完了時）
    selectCompletionPoints(points) {
        this.selectedCompletionPoints = points;
        document.querySelectorAll('.completion-point-button').forEach(btn => {
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
    
    // プロジェクトポイント選択
    selectProjectPoints(points) {
        this.selectedProjectPoints = points;
        document.querySelectorAll('.project-point-button').forEach(btn => {
            const btnPoints = parseInt(btn.dataset.projectPoints);
            if (btnPoints === points) {
                btn.classList.add('border-blue-500', 'bg-blue-50');
                btn.classList.remove('border-gray-300');
            } else {
                btn.classList.remove('border-blue-500', 'bg-blue-50');
                btn.classList.add('border-gray-300');
            }
        });
    },
    
    // モーダル用にプロジェクトを読み込む
    loadProjectsForModal() {
        const projectSelector = document.getElementById('projectSelector');
        projectSelector.innerHTML = '<option value="">プロジェクトを選択</option>';

        const savedProjects = localStorage.getItem('hakoniwa_projects');
        const projects = savedProjects ? JSON.parse(savedProjects) : [];

        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.tree || project.emoji} ${project.name}`;
            projectSelector.appendChild(option);
        });

        return projects;
    },
    
    // タスクを完了する
    completeTask(isAchieved) {
        const task = this.tasks.find(t => t.id === this.currentCompletingTaskId);
        if (!task) return;
        
        // 目標タスクでポイントが未選択の場合
        if (isAchieved && task.type === 'urgent' && this.selectedCompletionPoints === 0) {
            this.showError('ポイントを選択してください');
            return;
        }
        
        // プロジェクトにポイントを付与する場合の検証
        const assignToProject = document.getElementById('assignToProject').checked;
        if (assignToProject && isAchieved) {
            const projectSelector = document.getElementById('projectSelector');
            if (!projectSelector.value) {
                this.showError('プロジェクトを選択してください');
                return;
            }
            // 通常タスクの場合はプロジェクトポイントのチェックをスキップ
            if (task.type === 'urgent' && this.selectedProjectPoints === 0) {
                this.showError('プロジェクトポイントを選択してください');
                return;
            }
        }
        
        // デバッグログを追加
        console.log('completeTask called:', {
            taskId: task.id,
            isAchieved,
            assignToProject,
            selectedProjectId: document.getElementById('projectSelector')?.value,
            selectedProjectPoints: this.selectedProjectPoints
        });
        
        task.status = isAchieved ? 'achieved' : 'notAchieved';
        task.completedAt = new Date();
        
        if (isAchieved) {
            this.showCelebration();
            if (task.type === 'urgent') {
                task.points = this.selectedCompletionPoints;
                this.totalPoints += task.points;
                const dateStr = new Date(task.scheduledFor).toDateString();
                if (!this.dailyPointHistory[dateStr]) {
                    this.dailyPointHistory[dateStr] = 0;
                }
                this.dailyPointHistory[dateStr] += task.points;
            }
            
            // プロジェクトにポイントを付与
            if (assignToProject) {
                const projectId = document.getElementById('projectSelector').value;
                if (window.addPointsToProject) {
                    // 通常タスクの場合はデフォルトポイント（10pt）を付与
                    const pointsToAdd = task.type === 'urgent' ? this.selectedProjectPoints : 10;
                    window.addPointsToProject(projectId, pointsToAdd);
                    // タスクにプロジェクト情報を記録
                    task.projectId = projectId;
                    task.projectPoints = pointsToAdd;
                }
            }
        }
        
        // デバッグ用：タスクの最終状態を確認
        console.log('Task final state:', {
            id: task.id,
            status: task.status,
            projectId: task.projectId,
            projectPoints: task.projectPoints,
            points: task.points
        });
        
        this.closeTaskCompletionModal();
        this.saveData();
        this.render();
        this.updateDailyStatusIndicators();
    },
    
    // モーダルを閉じる
    closeTaskCompletionModal() {
        const modal = document.getElementById('taskCompletionModal');
        modal.classList.add('hidden');
        modal.classList.add('pointer-events-none');
        this.currentCompletingTaskId = null;
        this.selectedCompletionPoints = 0;
        this.selectedProjectId = null;
        this.selectedProjectPoints = 0;
        
        // プロジェクトポイントボタンのリセット
        document.querySelectorAll('.project-point-button').forEach(btn => {
            btn.classList.remove('border-blue-500', 'bg-blue-50');
            btn.classList.add('border-gray-300');
        });
        
        // プロジェクト進捗のチェックボックスをリセット
        const assignToProject = document.getElementById('assignToProject');
        if (assignToProject) {
            assignToProject.checked = false;
            // プロジェクト選択エリアを非表示にする
            const projectSelectionArea = document.getElementById('projectSelectionArea');
            if (projectSelectionArea) {
                projectSelectionArea.classList.add('hidden');
            }
        }
        
        // ポイントボタンのリセット
        document.querySelectorAll('.completion-point-button').forEach(btn => {
            btn.classList.remove('border-blue-500', 'bg-blue-50');
            btn.classList.add('border-gray-300');
        });
    },

    postponeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        const tomorrow = new Date(this.selectedDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowTasks = this.tasks.filter(t => new Date(t.scheduledFor).toDateString() === tomorrow.toDateString() && t.status === 'pending' );
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
        
        const completedTasks = tasksInPeriod.filter(t => t.status === 'achieved');
        const incompleteTasks = tasksInPeriod.filter(t => t.status === 'pending' || t.status === 'notAchieved');
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
        const contentEl = document.getElementById('aiCommentContent');
        // この関数が必要とする主要なDOM要素がなければ、何もせずに処理を終了する
        if (!contentEl) {
            return;
        }
        
        const noApiKeyEl = document.getElementById('noApiKey');
        const loadingEl = document.getElementById('aiCommentLoading');
        
        if (this.openaiApiKey && noApiKeyEl) {
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
                if (loadingEl) loadingEl.classList.add('hidden');
            }
        } else {
            if (noApiKeyEl) noApiKeyEl.classList.remove('hidden');
            contentEl.classList.add('hidden');
            if (loadingEl) loadingEl.classList.add('hidden');
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


    updateTodayDisplay(retry = 0) {
        const today = new Date();
        const todayDateYearEl = document.getElementById('todayDateYear');
        const todayDateFullEl = document.getElementById('todayDateFull');
        const todayDateDayEl = document.getElementById('todayDateDay');
        
        // 要素が存在しない場合は処理をスキップ
        if (!todayDateYearEl || !todayDateFullEl || !todayDateDayEl) {
            if (retry < 5) {
                setTimeout(() => this.updateTodayDisplay(retry + 1), 200);
            }
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
        const achievedCount = todayTasks.filter(t => t.status === 'achieved').length;
        const totalCount = todayTasks.length;
        const totalPointsToday = todayTasks.filter(t => t.status === 'achieved' && t.type === 'urgent').reduce((sum, t) => sum + (t.points || 0), 0);
        
        document.getElementById('completedCount').textContent = achievedCount;
        document.getElementById('totalCount').textContent = totalCount;
        document.getElementById('totalPointsDisplay').textContent = totalPointsToday;
        
        const dateEl = document.getElementById('currentDate');
        const dateYearEl = document.getElementById('currentDateYear');
        const dateDayEl = document.getElementById('currentDateDay');
        console.log('Updating date display elements:', { dateEl, dateYearEl, dateDayEl });
        console.log('Selected date in render:', this.selectedDate);
        
        if (dateEl) dateEl.textContent = this.selectedDate.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
        if (dateYearEl) dateYearEl.textContent = this.selectedDate.toLocaleDateString('ja-JP', { year: 'numeric' });
        if (dateDayEl) dateDayEl.textContent = this.selectedDate.toLocaleDateString('ja-JP', { weekday: 'short' });
        
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
        const normalUncompletedCount = todayTasks.filter(t => t.type === 'normal' && t.status === 'pending').length;
        const urgentUncompletedCount = todayTasks.filter(t => t.type === 'urgent' && t.status === 'pending').length;
        normalSlots.textContent = 3 - normalUncompletedCount;
        urgentSlots.textContent = 3 - urgentUncompletedCount;
        
        const taskListEl = document.getElementById('taskList');
        const noTasksEl = document.getElementById('noTasks');
        
        const sortedTasks = [...todayTasks].sort((a, b) => {
            // pendingが最初、その後achieved、最後にnotAchieved
            const statusOrder = { pending: 0, achieved: 1, notAchieved: 2 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
            if (a.type !== b.type) return a.type === 'urgent' ? -1 : 1;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
        
        if (sortedTasks.length === 0) {
            taskListEl.innerHTML = '';
            noTasksEl.classList.remove('hidden');
        } else {
            noTasksEl.classList.add('hidden');
            taskListEl.innerHTML = sortedTasks.map(task => {
                // デバッグ用：プロジェクトに関連したタスクのステータスを確認
                if (task.projectId) {
                    console.log('Task with project:', {
                        id: task.id,
                        text: task.text,
                        status: task.status,
                        projectId: task.projectId,
                        projectPoints: task.projectPoints
                    });
                }
                
                let cardClass = 'task-normal-active';
                let statusBadge = '';
                
                if (task.status === 'achieved') {
                    cardClass = 'task-completed';
                    statusBadge = '<span class="task-completed-badge">達成</span>';
                } else if (task.status === 'notAchieved') {
                    cardClass = 'bg-gray-200 border-gray-400';
                    statusBadge = '<span class="inline-flex items-center gap-1 bg-gray-600 text-white px-2 py-1 rounded text-xs font-bold">未達成</span>';
                } else if (task.type === 'urgent') {
                    cardClass = 'task-urgent-active';
                }
                
                return `
                <div class="washi-card rounded-xl p-4 task-card mobile-compact animate-fadeInUp ${cardClass}">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex items-start gap-3 flex-1">
                            <button onclick="app.toggleTask('${task.id}')" class="wa-checkbox rounded-lg ${task.status !== 'pending' ? 'checked' : ''} mt-0.5"></button>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1 flex-wrap">
                                    ${task.type === 'urgent' ? `
                                        <span class="task-type-label">
                                            目標 ${task.points > 0 ? `${task.points}pt` : ''}
                                        </span>` : 
                                        '<span class="task-type-label">通常</span>'
                                    }
                                    ${statusBadge}
                                </div>
                                <div class="task-text-lg ${task.status !== 'pending' ? 'line-through' : ''}">${this.escapeHtml(task.text)}</div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1">
                            ${task.status === 'pending' && !isToday ? `
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
                </div>`;
            }).join('');
        }
        
        this.renderDeadlineTasks();
        this.renderReflection();
        this.renderAISection();
        this.renderDailyAIComment();},

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

    renderDailyAIComment() {
        const dateStr = this.selectedDate.toDateString();
        const savedComments = this.dailyAIComments[dateStr];
        const dailyComment = savedComments && savedComments.daily;
        
        const emptyEl = document.getElementById('dailyAIEmpty');
        const contentEl = document.getElementById('dailyAIContent');
        const textEl = document.getElementById('dailyAIText');
        
        if (dailyComment) {
            // コメントがある場合
            const commentText = dailyComment.content || dailyComment.comment || dailyComment;
            textEl.textContent = commentText;
            emptyEl.classList.add('hidden');
            contentEl.classList.remove('hidden');
        } else {
            // コメントがない場合
            emptyEl.classList.remove('hidden');
            contentEl.classList.add('hidden');
        }
    },
    
    async generateDailyAIComment() {
        if (!this.openaiApiKey) {
            alert('APIキーを設定してください。左メニューの設定から設定できます。');
            return;
        }
        
        const loadingEl = document.getElementById('dailyAILoading');
        const emptyEl = document.getElementById('dailyAIEmpty');
        const contentEl = document.getElementById('dailyAIContent');
        
        loadingEl.classList.remove('hidden');
        emptyEl.classList.add('hidden');
        contentEl.classList.add('hidden');
        
        try {
            const prompt = this.buildAIPrompt('daily');
            const charLimit = 400;
            
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
            
            // コメントを保存
            const dateStr = this.selectedDate.toDateString();
            if (!this.dailyAIComments[dateStr]) {
                this.dailyAIComments[dateStr] = {};
            }
            this.dailyAIComments[dateStr].daily = {
                content: comment,
                createdAt: new Date().toISOString()
            };
            this.saveData();
            
            // 表示を更新
            this.renderDailyAIComment();
            this.updateDailyStatusIndicators();
            
        } catch (error) {
            console.error('AI comment generation error:', error);
            this.showError('AIコメントの生成に失敗しました');
            emptyEl.classList.remove('hidden');
        } finally {
            loadingEl.classList.add('hidden');
        }
    },
    
    deleteDailyAIComment() {
        const dateStr = this.selectedDate.toDateString();
        if (this.dailyAIComments[dateStr] && this.dailyAIComments[dateStr].daily) {
            delete this.dailyAIComments[dateStr].daily;
            if (Object.keys(this.dailyAIComments[dateStr]).length === 0) {
                delete this.dailyAIComments[dateStr];
            }
            this.saveData();
            this.renderDailyAIComment();
            this.updateDailyStatusIndicators();
        }
    },

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
            popup.classList.remove('pointer-events-none');
            this.renderCalendar();
            // ポップアップ外をクリックしたら閉じる
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    this.toggleCustomCalendar(false);
                }
            });
        } else {
            popup.classList.add('hidden');
            popup.classList.add('pointer-events-none');
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
        const completedTasks = dayTasks.filter(t => t.status === 'achieved').length;
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
        const completedCount = todayTasks.filter(t => t.status === 'achieved').length;
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

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    // DOM is already ready
    app.init();
}

// PWAインストールプロンプト
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // インストールボタンは表示しない
});