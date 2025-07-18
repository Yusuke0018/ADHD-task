import { fetchSunTime } from './sunTimeAPI.js';

const app = {
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
    lastSwipeTime: 0,
    isScrolling: false,
    scrollTimeout: null,
    touchStartY: null,
    touchStartTime: null,

    init() {
        console.log('App initializing...');
        
        // タッチデバイスのデバッグ情報
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        console.log('Touch device:', isTouchDevice);
        console.log('User Agent:', navigator.userAgent);
        
        this.loadData();
        this.bindEvents();
        this.updateSekki();
        this.updateSunTimeDisplay(); // 日の出・日の入り時刻を更新
        this.render(); // 追加：初期表示のため
        
        // 振り返りボタンの存在確認
        setTimeout(() => {
            const reflectionButton = document.getElementById('reflectionToggle');
            console.log('Reflection button found:', reflectionButton);
            if (reflectionButton) {
                console.log('Reflection button data-action:', reflectionButton.dataset.action);
                console.log('Reflection button classes:', reflectionButton.className);
                // デバッグ用の直接イベントリスナーは削除（重複の原因）
            }
        }, 1000);
        
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
    
    updateTodayDisplay() {
        const todayYear = document.getElementById('todayDateYear');
        const todayFull = document.getElementById('todayDateFull');
        const todayDay = document.getElementById('todayDateDay');
        
        if (todayYear && todayFull && todayDay) {
            const now = new Date();
            const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
            
            todayYear.textContent = `${now.getFullYear()}年`;
            todayFull.textContent = `${now.getMonth() + 1}月${now.getDate()}日`;
            todayDay.textContent = `(${weekdays[now.getDay()]})`;
        }
    },
    
    async updateSunTimeDisplay() {
        const sunTimeData = await fetchSunTime();
        if (sunTimeData) {
            const sunriseEl = document.getElementById('sunriseTime');
            const sunsetEl = document.getElementById('sunsetTime');

            if (sunriseEl && sunsetEl) {
                sunriseEl.textContent = sunTimeData.sunrise.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
                sunsetEl.textContent = sunTimeData.sunset.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
            }
        }
    },
    
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
    
    cleanText(text) {
        // Fix common UTF-8 encoding issues
        // Replace mojibake patterns with their correct characters
        text = text
            // Common mojibake patterns
            .replace(/â€™/g, "'")  // Right single quotation mark
            .replace(/â€œ/g, '"')  // Left double quotation mark
            .replace(/â€/g, '"')   // Right double quotation mark
            .replace(/â€"/g, '—')  // Em dash
            .replace(/â€"/g, '–')  // En dash
            .replace(/Ã¢â‚¬â„¢/g, "'")  // Another variant of apostrophe
            .replace(/Ã¢â‚¬Å"/g, '"')  // Another variant of left quote
            .replace(/Ã¢â‚¬ï¿½/g, '"')  // Another variant of right quote
            .replace(/Ã¢â‚¬â€œ/g, '–') // Another variant of en dash
            .replace(/Ã¢â‚¬â€�/g, '—') // Another variant of em dash
            // Smart quotes to regular quotes
            .replace(/['']/g, "'")  // Smart single quotes to regular
            .replace(/[""]/g, '"')  // Smart double quotes to regular
            // Other common replacements
            .replace(/…/g, '...')   // Ellipsis
            .replace(/•/g, '・')    // Bullet to Japanese middle dot
            // Remove any remaining non-printable characters
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            // Normalize whitespace
            .replace(/\s+/g, ' ')
            .trim();
        
        return text;
    },

    loadData() {
        const saved = localStorage.getItem('focusTaskData');
        if (saved) {
            const data = JSON.parse(saved);
            this.tasks = (data.tasks || []).map(t => ({ 
                ...t, 
                text: this.cleanText(t.text || ''), // Clean text when loading
                createdAt: new Date(t.createdAt), 
                completedAt: t.completedAt ? new Date(t.completedAt) : null, 
                scheduledFor: new Date(t.scheduledFor), 
                points: t.points || 0,
                status: t.status || (t.isCompleted ? 'achieved' : 'pending') // 旧データの互換性
            }));
            this.totalPoints = data.totalPoints || 0;
            this.dailyPointHistory = data.dailyPointHistory || {};
            this.dailyReflections = data.dailyReflections || {};
            this.dailyAIComments = data.dailyAIComments || {};
            this.openaiApiKey = data.openaiApiKey || null;
        }},

    saveData() {
        localStorage.setItem('focusTaskData', JSON.stringify({ 
            tasks: this.tasks, 
            totalPoints: this.totalPoints, 
            dailyPointHistory: this.dailyPointHistory,
            dailyReflections: this.dailyReflections,
            dailyAIComments: this.dailyAIComments,
            openaiApiKey: this.openaiApiKey
        }));},

    bindEvents() { 
        console.log('bindEvents called');
        
        // 既にイベントが登録されている場合はスキップ
        if (this.eventsAlreadyBound) {
            console.warn('bindEvents called multiple times - skipping to prevent duplicate events!');
            return;
        }
        this.eventsAlreadyBound = true;
        
        // 既存のイベントリスナーを削除してから追加
        const prevDayBtn = document.getElementById('prevDay');
        const nextDayBtn = document.getElementById('nextDay');
        
        // クローンを作成して既存のイベントリスナーを削除
        const newPrevBtn = prevDayBtn.cloneNode(true);
        const newNextBtn = nextDayBtn.cloneNode(true);
        prevDayBtn.parentNode.replaceChild(newPrevBtn, prevDayBtn);
        nextDayBtn.parentNode.replaceChild(newNextBtn, nextDayBtn);
        
        // 新しいイベントリスナーを追加
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
        
        // タスク完了モーダルのイベント
        document.getElementById('taskAchievedBtn').addEventListener('click', () => this.completeTask(true));
        document.getElementById('taskPassBtn').addEventListener('click', () => this.passCurrentTask());
        document.getElementById('taskNotAchievedBtn').addEventListener('click', () => this.completeTask(false));
        document.getElementById('taskCompletionCancelBtn').addEventListener('click', () => this.closeTaskCompletionModal());
        document.querySelectorAll('.completion-point-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const points = parseInt(e.currentTarget.dataset.points);
                this.selectCompletionPoints(points);
            });
        });
        
        // スクロール検知の設定
        this.setupScrollDetection();
        
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
        
        // タスクリストのイベントデリゲーション（タッチとクリックの両方に対応）
        const taskList = document.getElementById('taskList');
        
        // タスクリストのイベント処理
        const handleTaskClick = (e) => {
            console.log('Task click event:', e.type, e.target);
            
            // スクロール中は誤タップを防ぐ
            if (this.isScrolling) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Ignored click during scroll');
                return;
            }
            
            const button = e.target.closest('button[data-action]');
            if (!button) return;
            
            // タッチイベントの場合、クリックイベントを防ぐ
            if (e.type === 'touchstart') {
                e.preventDefault();
                button._touched = true;
                setTimeout(() => { delete button._touched; }, 500);
            } else if (e.type === 'click' && button._touched) {
                // タッチ後のクリックイベントを無視
                return;
            }
            
            e.stopPropagation();
            
            const action = button.dataset.action;
            const taskId = button.dataset.taskId;
            
            console.log('Task action:', action, 'ID:', taskId);
            
            switch(action) {
                case 'toggle':
                    this.toggleTask(taskId);
                    break;
                case 'edit':
                    this.editTask(taskId);
                    break;
                case 'postpone':
                    this.postponeTask(taskId);
                    break;
                case 'delete':
                    this.deleteTask(taskId);
                    break;
            }
        };
        
        // タッチとクリックの両方に対応
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
            // タッチデバイスの場合
            taskList.addEventListener('touchstart', handleTaskClick, { passive: false });
        } else {
            // 非タッチデバイスの場合（マウスのみ）
            taskList.addEventListener('click', handleTaskClick);
        }
        
        // ポインターイベントもサポート（Edge, Chrome等）
        if (window.PointerEvent) {
            taskList.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'touch' && !isTouchDevice) {
                    handleTaskClick(e);
                }
            });
        }
        
        // グローバルなイベントデリゲーション（AIコメント、チャレンジレビューなど）
        let reflectionClickCount = 0;
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;
            
            const action = button.dataset.action;
            
            if (action === 'toggle-reflection') {
                console.log('Action button clicked:', action, 'count:', ++reflectionClickCount);
            }
            
            switch(action) {
                case 'toggle-reflection':
                    console.log('Calling toggleReflection from event delegation');
                    e.preventDefault(); // デフォルト動作を防ぐ
                    e.stopPropagation(); // イベントの伝播を止める
                    this.toggleReflection();
                    break;
                case 'delete-ai-comment':
                    this.deleteAIComment(button.dataset.period);
                    break;
                case 'open-challenge-review':
                    this.openChallengeReviewModal(button.dataset.challengeId);
                    break;
                case 'promote-challenge':
                    this.promoteChallengeToHabit(button.dataset.challengeId);
                    break;
                case 'end-challenge':
                    this.endChallenge(button.dataset.challengeId);
                    break;
                case 'close-challenge-review':
                    this.closeChallengeReviewModal();
                    break;
                case 'toggle-calendar':
                    this.toggleCustomCalendar(true);
                    break;
                case 'close-calendar':
                    this.toggleCustomCalendar(false);
                    break;
            }
        });
        
        document.querySelectorAll('.project-point-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const points = parseInt(e.currentTarget.dataset.projectPoints);
                this.selectProjectPoints(points);
            });
        });
        
        // Add event listeners with null checks
        const saveReflection = document.getElementById('saveReflection');
        const cancelReflection = document.getElementById('cancelReflection');
        const reflectionInput = document.getElementById('reflectionInput');
        
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
        if (!this.swipeListenersAttached) {
            const swipeArea = document.body;
            let swipeStartX = 0;
            let swipeStartY = 0;
            let isSwipeActive = false; // スワイプ操作中かどうかのフラグ
            let lastSwipeTime = 0; // 最後のスワイプ時刻

            const swipeStart = (e) => {
                // スワイプを無効化するエリアを、本当に必要なものだけに限定する
                if (e.target.closest('#menuHandle, #menuItems, #customCalendarPopup, .point-select-button, .sekki-grid, textarea')) {
                    isSwipeActive = false;
                    return;
                }
                
                // デバウンス：100ms以内の連続開始を防ぐ
                const now = Date.now();
                if (now - lastSwipeTime < 100) {
                    return;
                }
                lastSwipeTime = now;
                
                isSwipeActive = true;
                const point = e.changedTouches ? e.changedTouches[0] : e;
                swipeStartX = point.clientX;
                swipeStartY = point.clientY;
            };

        const swipeEnd = (e) => {
            if (!isSwipeActive) {
                return;
            }
            isSwipeActive = false; // フラグをリセット

            const point = e.changedTouches ? e.changedTouches[0] : e;
            const endX = point.clientX;
            const endY = point.clientY;
            // console.log('Swipe ended at:', endX, endY);
            
            // スワイプ処理のみでイベントの伝播を停止
            const deltaX = Math.abs(endX - swipeStartX);
            const deltaY = Math.abs(endY - swipeStartY);
            
            // 水平方向のスワイプのみ処理
            if (deltaX > 50 && deltaX > deltaY) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            this.handleSwipe(swipeStartX, swipeStartY, endX, endY);
        };

            // タッチデバイスかどうかを判定
            if ('ontouchstart' in window) {
                swipeArea.addEventListener('touchstart', swipeStart, { passive: false });
                swipeArea.addEventListener('touchmove', (e) => {
                    if (!isSwipeActive) return;
                    // スワイプ中の処理（必要に応じて）
                }, { passive: false });
                swipeArea.addEventListener('touchend', swipeEnd, { passive: false });
            } else {
                swipeArea.addEventListener('pointerdown', swipeStart);
                swipeArea.addEventListener('pointerup', swipeEnd);
            }
            
            this.swipeListenersAttached = true;
        }
    },
    
    // --- NEW: スワイプ操作を処理するメソッド ---
    handleSwipe(startX, startY, endX, endY) {
        // console.log('handleSwipe called');
        
        // デバウンス：300ms以内の連続呼び出しを防ぐ
        const now = Date.now();
        if (now - this.lastSwipeTime < 300) {
            // console.log('Swipe debounced - too soon after last swipe');
            return;
        }
        this.lastSwipeTime = now;
        
        const thresholdX = 50;  // 横スワイプとして認識する最小距離
        const restraintY = 100; // 横スワイプ中に許容される縦の最大移動距離

        const diffX = endX - startX;
        const diffY = endY - startY;
        // console.log('Swipe diff:', { diffX, diffY });

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
            // console.log('Swipe not detected - threshold not met');
        }
    },

    navigateDate(days) {
        // console.log('navigateDate called with days:', days);
        
        // 現在の日付を年月日で取得（ローカルタイム）
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth();
        const day = this.selectedDate.getDate();
        
        // 新しい日付を作成（時間は0時0分0秒）
        const newDate = new Date(year, month, day + days);
        
        // console.log('Current date:', year, month + 1, day);
        // console.log('New date:', newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate());
        
        this.selectedDate = newDate;
        this.updateSekkiForSelectedDate();
        this.render();
    },

    goToToday() {
        const today = new Date();
        // 時間を0時0分0秒に正規化
        this.selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        this.updateSekkiForSelectedDate();
        this.render();
    },

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
        let text = input.value.trim();
        if (!text) { this.showError('予定を入力してください'); return; }
        
        // Clean up common encoding issues and smart quotes
        text = this.cleanText(text);
        
        const todayTasks = this.getTodayTasks();
        const normalCount = todayTasks.filter(t => t.type === 'normal' && t.status === 'pending').length; 
        const urgentCount = todayTasks.filter(t => t.type === 'urgent' && t.status === 'pending').length; 
        // 通常タスクの制限を解除（コメントアウト）
        // if (this.taskType === 'normal' && normalCount >= 3) { this.showError('通常タスクは3件までです（未完了）'); return; }
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
        
        // 既に完了または未達成の場合はpendingに戻す
        if (task.status !== 'pending') {
            const statusText = task.status === 'achieved' ? '達成' : '未達成';
            const message = `「${task.text}」の${statusText}を取り消しますか？` + (task.points > 0 ? `\n獲得した${task.points}ポイントも取り消されます。` : '');
            
            // 確認ダイアログを表示
            this.showConfirmationDialog(
                `${statusText}の取り消し`,
                message,
                () => {
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
                }
            );
        } else {
            // 未完了の場合は完了モーダルを表示
            this.showTaskCompletionModal(taskId);
        }
    },
    
    // 現在処理中のタスクID
    currentCompletingTaskId: null,
    selectedCompletionPoints: 0,
    
    // タスク完了モーダルを表示
    showTaskCompletionModal(taskIdOrObject) {
        console.log('showTaskCompletionModal called with:', taskIdOrObject);
        
        let task;
        if (typeof taskIdOrObject === 'string') {
            // 通常のタスクID
            task = this.tasks.find(t => t.id === taskIdOrObject);
            if (!task) return;
        } else if (typeof taskIdOrObject === 'object' && taskIdOrObject.type === 'habit') {
            // 習慣タスクオブジェクト
            task = taskIdOrObject;
        } else {
            console.error('Invalid parameter:', taskIdOrObject);
            return;
        }
        
        this.currentCompletingTaskId = task.id || taskIdOrObject;
        this.selectedCompletionPoints = 0;
        this.selectedProjectId = null;
        this.selectedProjectPoints = 0;
        
        const modal = document.getElementById('taskCompletionModal');
        const taskText = document.getElementById('taskCompletionText');
        const pointSelector = document.getElementById('completionPointSelector');
        const projectAssignment = document.getElementById('projectPointAssignment');
        const passBtn = document.getElementById('taskPassBtn');
        const achievedBtn = document.getElementById('taskAchievedBtn');
        const notAchievedBtn = document.getElementById('taskNotAchievedBtn');
        
        // タスクのテキストを設定（習慣の場合はレベル情報も含める）
        if (task.type === 'habit' && this.currentCompletingTaskData) {
            const level = this.currentCompletingTaskData.level;
            taskText.innerHTML = `「<span class="font-bold">${this.currentCompletingTaskData.habitName}</span>」<br>
                <span class="text-purple-600 font-medium">Lv.${level}: ${task.text.split(' - ')[1]}</span><br>
                を完了しますか？`;
        } else {
            taskText.textContent = `「${task.text}」を完了しますか？`;
        }
        
        // パスボタンの表示制御と達成/未達成ボタンのflex-1クラス調整
        if (task.type === 'habit') {
            passBtn.classList.remove('hidden');
            achievedBtn.classList.remove('flex-1');
            notAchievedBtn.classList.remove('flex-1');
        } else {
            passBtn.classList.add('hidden');
            achievedBtn.classList.add('flex-1');
            notAchievedBtn.classList.add('flex-1');
        }
        
        // 習慣タスクの場合
        if (task.type === 'habit') {
            // 習慣タスクでも通常ポイントとプロジェクトポイントを付与可能にする
            pointSelector.classList.remove('hidden');
            projectAssignment.classList.remove('hidden');
            this.loadProjectsForModal();
            
            // ポイントボタンをリセット
            document.querySelectorAll('.completion-point-button').forEach(btn => {
                btn.classList.remove('border-gray-800', 'bg-gray-100');
                btn.classList.add('border-gray-300');
            });
        } else {
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
            projectAssignment.classList.remove('hidden');
            this.loadProjectsForModal();
        }
        
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
        // 習慣タスクの場合の特別処理
        if (this.currentCompletingTaskId && this.currentCompletingTaskId.startsWith('habit_')) {
            this.completeHabitTask(isAchieved);
            return;
        }
        
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
                    // ユーザーが選択したポイントを使用、未選択の場合はデフォルトで10pt
                    const pointsToAdd = this.selectedProjectPoints > 0 ? this.selectedProjectPoints : 10;
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
    
    // 現在のタスクをパスする
    passCurrentTask() {
        // 習慣タスクの場合
        if (this.currentCompletingTaskId && this.currentCompletingTaskId.startsWith('habit_')) {
            const habitId = this.currentCompletingTaskData?.habitId;
            if (habitId) {
                this.skipHabit(habitId);
                this.closeTaskCompletionModal();
            }
            return;
        }
    },

    postponeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // 確認ダイアログを表示
        if (!confirm(`タスク「${task.text}」を翌日に先送りしますか？`)) {
            return;
        }
        
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth();
        const day = this.selectedDate.getDate();
        const tomorrow = new Date(year, month, day + 1);
        const tomorrowTasks = this.tasks.filter(t => new Date(t.scheduledFor).toDateString() === tomorrow.toDateString() && t.status === 'pending' );
        const normalCount = tomorrowTasks.filter(t => t.type === 'normal').length;
        const urgentCount = tomorrowTasks.filter(t => t.type === 'urgent').length;
        // 通常タスクの制限を解除（コメントアウト）
        // if (task.type === 'normal' && normalCount >= 3) { this.showError('翌日の通常タスクは既に3件です（未完了）'); return; }
        if (task.type === 'urgent' && urgentCount >= 3) { this.showError('翌日の目標タスクは既に3件です（未完了）'); return; }
        task.scheduledFor = tomorrow;
        this.showPostponeEffect();
        setTimeout(() => { this.saveData(); this.render(); }, 600);},

    deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // 確認ダイアログを表示
        if (!confirm(`タスク「${task.text}」を削除しますか？\nこの操作は取り消せません。`)) {
            return;
        }
        
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveData();
        this.render();},

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const taskTextElement = document.getElementById(`task-text-${taskId}`);
        if (!taskTextElement) return;
        
        // 現在のテキストを保存
        const currentText = task.text;
        
        // 編集用の入力フィールドを作成
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-base';
        
        // テキスト要素を入力フィールドに置き換え
        taskTextElement.replaceWith(input);
        input.focus();
        input.select();
        
        // 編集を確定する関数
        const confirmEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                task.text = newText;
                this.saveData();
            }
            this.render();
        };
        
        // 編集をキャンセルする関数
        const cancelEdit = () => {
            this.render();
        };
        
        // イベントリスナーを追加
        input.addEventListener('blur', confirmEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    },



    
    



    toggleReflection() {
        console.log('toggleReflection called - stack trace:', new Error().stack);
        const form = document.getElementById('reflectionForm');
        const display = document.getElementById('reflectionDisplay');
        const noReflection = document.getElementById('noReflection');
        const dateStr = this.selectedDate.toDateString();
        const existingReflection = this.dailyReflections[dateStr];
        
        console.log('Form element:', form);
        console.log('Form has hidden class:', form?.classList.contains('hidden'));
        
        if (form.classList.contains('hidden')) {
            console.log('Showing reflection form');
            // フォームを表示
            form.classList.remove('hidden');
            display.classList.add('hidden');
            noReflection.classList.add('hidden');
            document.getElementById('reflectionInput').value = existingReflection || '';
            document.getElementById('reflectionInput').focus();
        } else {
            console.log('Hiding reflection form');
            // フォームを非表示
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
                            content: `You are a supportive coach for 大岩祐介（マスター）, a clinic director with ADHD tendencies. 

Background:
- リベ大総合クリニック院長・理事長
- 最重要価値観は「ご機嫌」であること - 自己・家族・スタッフの幸福を追求
- 家族：妻ちいちゃん、長女鈴葉（すっちゃん）、長男颯介（そうちゃん）、次男楓介（ふうちゃん）
- 興味の深掘り型で、今ワクワクしているテーマを徹底的に掘り下げる学習スタイル
- AI活用による業務効率化と創造的時間の創出に強い関心
- 衝動性を味方につけながら、家族との時間も大切にしたいと考えている
- スマホ依存・刺激追求行動の改善、業務外作業の効率化が現在の課題

You are also an expert in habit formation for people with ADHD. When habit data analysis is provided:
- If low achievement rates are mentioned, suggest adjusting difficulty levels
- If broken streaks are mentioned, provide encouragement and focus on restarting
- If weekday patterns are shown, offer specific strategies for challenging days
- If level selection bias is detected, encourage balanced growth

Provide personalized, encouraging advice that:
1. Acknowledges his role as a busy clinic director and father
2. Supports his "ご機嫌" philosophy
3. Offers practical strategies considering his ADHD tendencies
4. Balances professional ambitions with family priorities
5. Encourages AI/automation solutions where appropriate
6. When habit data is provided, give specific, actionable feedback

Write in warm, supportive Japanese. Your response MUST be between ${Math.floor(charLimit * 0.9)} and ${charLimit} characters (aim for exactly ${charLimit} characters). IMPORTANT: Always complete your sentences and thoughts. Never cut off mid-sentence. Make sure to write a substantive response that uses the full character count by providing detailed advice, specific examples, and comprehensive encouragement.`
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
            <button data-action="delete-ai-comment" data-period="${period}"
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
                const endYear = selectedDate.getFullYear();
                const endMonth = selectedDate.getMonth();
                const endDay = selectedDate.getDate();
                startDate = new Date(endYear, endMonth, endDay - 6);
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
            // 日付の比較を正確にするため、時間部分を除外
            const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
            const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            return taskDateOnly >= startDateOnly && taskDateOnly <= endDateOnly;
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
        
        // 習慣データの分析を追加
        const habitAnalysis = this.analyzeHabitData(startDate, endDate);
        
        let prompt = `対象日付: ${selectedDate.toLocaleDateString('ja-JP')}\n`;
        prompt += `期間: ${startDate.toLocaleDateString('ja-JP')} - ${endDate.toLocaleDateString('ja-JP')}\n`;
        prompt += `完了タスク: ${completedTasks.length}件\n`;
        prompt += `未完了タスク: ${incompleteTasks.length}件\n`;
        prompt += `獲得ポイント: ${totalPointsInPeriod}pt\n`;
        
        // 習慣分析データを追加
        if (habitAnalysis) {
            prompt += `\n習慣データ分析:\n`;
            prompt += habitAnalysis;
        }
        
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
        
        // デバッグ：実際の日付を確認
        console.log('Date debug:', {
            selectedDate: this.selectedDate,
            getDate: this.selectedDate.getDate(),
            getUTCDate: this.selectedDate.getUTCDate(),
            toLocaleDateString: this.selectedDate.toLocaleDateString('ja-JP'),
            toISOString: this.selectedDate.toISOString()
        });
        
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
        
        // 残り枠数表示は削除したためコメントアウト
        // const normalSlots = document.getElementById('normalSlots');
        // const urgentSlots = document.getElementById('urgentSlots');
        // const normalUncompletedCount = todayTasks.filter(t => t.type === 'normal' && t.status === 'pending').length;
        // const urgentUncompletedCount = todayTasks.filter(t => t.type === 'urgent' && t.status === 'pending').length;
        // normalSlots.textContent = '∞';
        // urgentSlots.textContent = 3 - urgentUncompletedCount;
        
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
                    cardClass = task.type === 'urgent' ? 'task-completed task-goal' : 'task-completed';
                    statusBadge = '<span class="task-completed-badge">達成</span>';
                } else if (task.status === 'notAchieved') {
                    cardClass = 'task-notachieved';
                    statusBadge = '<span class="inline-flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">未達成</span>';
                } else if (task.type === 'urgent') {
                    cardClass = 'task-urgent-active';
                }
                
                return `
                <div class="washi-card rounded-xl p-4 task-card mobile-compact animate-fadeInUp ${cardClass}">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex items-start gap-3 flex-1">
                            <button data-action="toggle" data-task-id="${task.id}" class="wa-checkbox rounded-lg ${task.status !== 'pending' ? 'checked' : ''} mt-0.5"></button>
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
                                <div class="task-text-lg" id="task-text-${task.id}">${this.escapeHtml(task.text)}</div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1">
                            ${task.status === 'pending' ? `
                                <button data-action="edit" data-task-id="${task.id}" class="p-2 text-gray-400 hover:text-gray-600 transition-all" title="編集">
                                    <svg class="w-4 h-4 mobile-text-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                </button>` : ''}
                            ${task.status === 'pending' ? `
                                <button data-action="postpone" data-task-id="${task.id}" class="p-2 text-gray-400 hover:text-gray-600 transition-all" title="翌日へ先送り">
                                    <svg class="w-4 h-4 mobile-text-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                    </svg>
                                </button>` : ''}
                            ${task.status === 'pending' ? `
                            <button data-action="delete" data-task-id="${task.id}" class="p-2 text-gray-400 hover:text-gray-600 transition-all">
                                <svg class="w-4 h-4 mobile-text-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>` : ''}
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
        
        this.renderHabits();
        this.renderReflection();
        this.renderAISection();
        this.renderDailyAIComment();
    },

    // 習慣タスクの表示
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
        
        // 日付の一貫性を保つため、一度だけ選択された日付を取得
        const today = this.selectedDate;
        const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // 習慣カードを生成
        habitList.innerHTML = habits.map(habit => {
            // 履歴から今日の達成状態を確認
            let isCompletedToday = false;
            let completedLevel = null;
            
            if (habit.history && habit.history.length > 0) {
                const todayHistory = habit.history.find(h => {
                    if (!h.date || !h.achieved) return false;
                    
                    let historyYmd;
                    if (h.date.includes('T') || h.date.includes('Z')) {
                        const historyDate = new Date(h.date);
                        historyYmd = `${historyDate.getFullYear()}-${String(historyDate.getMonth() + 1).padStart(2, '0')}-${String(historyDate.getDate()).padStart(2, '0')}`;
                    } else if (h.date.includes('-') && h.date.length === 10) {
                        historyYmd = h.date;
                    } else {
                        const historyDate = new Date(h.date);
                        historyYmd = `${historyDate.getFullYear()}-${String(historyDate.getMonth() + 1).padStart(2, '0')}-${String(historyDate.getDate()).padStart(2, '0')}`;
                    }
                    return historyYmd === todayYmd;
                });
                
                if (todayHistory) {
                    isCompletedToday = true;
                    completedLevel = todayHistory.level;
                }
            }
            
            // パス状態の確認
            let isSkippedToday = false;
            let isNotAchievedToday = false;
            if (habit.history && habit.history.length > 0) {
                const todayHistory = habit.history.find(h => {
                    if (!h.date) return false;
                    let historyYmd;
                    if (typeof h.date === 'string' && h.date.includes('-') && h.date.length === 10) {
                        historyYmd = h.date;
                    } else {
                        const historyDate = new Date(h.date);
                        historyYmd = `${historyDate.getFullYear()}-${String(historyDate.getMonth() + 1).padStart(2, '0')}-${String(historyDate.getDate()).padStart(2, '0')}`;
                    }
                    return historyYmd === todayYmd;
                });
                
                if (todayHistory && todayHistory.passed) {
                    isSkippedToday = true;
                }
                if (todayHistory && todayHistory.notAchieved) {
                    isNotAchievedToday = true;
                }
            }
            
            let cardClass = 'task-normal-active';
            let statusBadge = '';
            
            if (isCompletedToday) {
                cardClass = 'task-completed task-habit';
                statusBadge = '<span class="task-completed-badge">達成</span>';
            } else if (isSkippedToday) {
                cardClass = 'task-skipped';
                statusBadge = '<span class="text-amber-600 text-sm font-medium">お休み中</span>';
            } else if (isNotAchievedToday) {
                cardClass = 'task-notachieved';
                statusBadge = '<span class="text-blue-600 text-sm font-medium">未達成</span>';
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
                                <div id="habit-levels-${habit.id}" class="habit-levels-container ${!isCompletedToday && this.expandedHabitId === habit.id ? '' : 'hidden'}">
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
                                        <div class="flex gap-1 mt-1">
                                            <button 
                                                data-habit-id="${habit.id}"
                                                class="habit-skip-modal-btn flex-1 p-2 text-amber-600 hover:bg-amber-50 rounded-lg text-sm font-medium transition-colors">
                                                パス
                                            </button>
                                            <button 
                                                data-habit-id="${habit.id}"
                                                class="habit-notachieved-btn flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors">
                                                未達成
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1">
                            ${!isCompletedToday && !isSkippedToday && !isNotAchievedToday ? `
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
    
    // 習慣ボタンのイベントリスナーを設定
    attachHabitEventListeners() {
        const habitList = document.getElementById('habitList');
        if (!habitList) return;
        
        // 既存のリスナーを削除（重複防止）
        if (this.habitClickHandler) {
            habitList.removeEventListener('click', this.habitClickHandler);
        }
        
        // クリックハンドラーを定義（アロー関数でthisを保持）
        this.habitClickHandler = (e) => {
            console.log('Habit click detected:', e.target);
            console.log('Classes:', e.target.classList);
            console.log('Dataset:', e.target.dataset);
            
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
            
            console.log('Final target element:', targetElement);
            console.log('Habit ID found:', habitId);
            
            // チェックボックスのクリック
            if (targetElement.classList.contains('habit-checkbox')) {
                e.preventDefault();
                
                // 習慣が今日完了しているかチェック
                const habitData = localStorage.getItem('habit_tasks');
                if (habitData) {
                    try {
                        const data = JSON.parse(habitData);
                        const habit = data.habits.find(h => h.id === habitId);
                        if (habit) {
                            const todayDate = this.selectedDate;
                            const todayYmd = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
                            
                            let lastCompletedYmd = null;
                            if (habit.lastCompletedDate) {
                                if (habit.lastCompletedDate.includes('T') || habit.lastCompletedDate.includes('Z')) {
                                    const lastDate = new Date(habit.lastCompletedDate);
                                    lastCompletedYmd = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
                                } else if (habit.lastCompletedDate.includes('-') && habit.lastCompletedDate.length === 10) {
                                    lastCompletedYmd = habit.lastCompletedDate;
                                } else {
                                    const lastDate = new Date(habit.lastCompletedDate);
                                    if (!isNaN(lastDate.getTime())) {
                                        lastCompletedYmd = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
                                    }
                                }
                            }
                            
                            // 今日の履歴を確認
                            let todayStatus = null;
                            if (habit.history && habit.history.length > 0) {
                                const todayHistory = habit.history.find(h => {
                                    const historyDate = h.date.split('T')[0];
                                    return historyDate === todayYmd;
                                });
                                if (todayHistory) {
                                    if (todayHistory.achieved) {
                                        todayStatus = 'completed';
                                    } else if (todayHistory.passed) {
                                        todayStatus = 'passed';
                                    } else if (todayHistory.notAchieved) {
                                        todayStatus = 'notAchieved';
                                    }
                                }
                            }
                            
                            if (todayStatus === 'completed') {
                                // 完了済みの場合は取り消し
                                this.cancelHabitCompletion(habitId);
                            } else if (todayStatus === 'passed') {
                                // パス状態の場合は履歴から削除
                                this.cancelHabitPass(habitId);
                            } else if (todayStatus === 'notAchieved') {
                                // 未達成状態の場合は取り消し
                                this.cancelHabitNotAchieved(habitId);
                            } else {
                                // 未記録の場合はレベル選択を表示
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
                console.log('Level button clicked:', { habitId, level });
                this.completeHabit(habitId, level);
            }
            // スキップボタンのクリック
            else if (targetElement.classList.contains('habit-skip-btn')) {
                console.log('Skip button clicked for habit:', habitId);
                this.skipHabit(habitId);
            }
            // モーダル内のスキップボタンのクリック
            else if (targetElement.classList.contains('habit-skip-modal-btn')) {
                console.log('Modal skip button clicked for habit:', habitId);
                this.skipHabit(habitId);
            }
            // 未達成ボタンのクリック
            else if (targetElement.classList.contains('habit-notachieved-btn')) {
                console.log('Not achieved button clicked for habit:', habitId);
                this.notAchieveHabit(habitId);
            }
            // 取消ボタンのクリック
            else if (targetElement.classList.contains('habit-cancel-btn')) {
                console.log('Cancel button clicked for habit:', habitId);
                this.cancelHabitCompletion(habitId);
            }
            // チェックボックスのクリック（完了済みの場合は取り消し、未完了の場合はレベル選択表示）
            else if (targetElement.classList.contains('habit-toggle-btn')) {
                console.log('Checkbox clicked for habit:', habitId);
                if (targetElement.classList.contains('checked')) {
                    // 既に完了済みの場合は取り消し
                    this.cancelHabitCompletion(habitId);
                } else {
                    // 未完了の場合はレベル選択を表示
                    this.toggleHabitLevels(habitId);
                }
            } else {
                console.log('Click not matched any handler');
            }
        };
        
        // イベントリスナーを追加
        habitList.addEventListener('click', this.habitClickHandler);
    },
    
    // 習慣タスクのレベル選択を表示/非表示
    toggleHabitLevels(habitId) {
        // 他の展開されている習慣を閉じる
        if (this.expandedHabitId && this.expandedHabitId !== habitId) {
            const prevContainer = document.getElementById(`habit-levels-${this.expandedHabitId}`);
            if (prevContainer) {
                prevContainer.classList.add('hidden');
            }
        }
        
        // 現在の習慣のレベル表示を切り替え
        const levelsContainer = document.getElementById(`habit-levels-${habitId}`);
        if (levelsContainer) {
            if (levelsContainer.classList.contains('hidden')) {
                levelsContainer.classList.remove('hidden');
                this.expandedHabitId = habitId;
            } else {
                levelsContainer.classList.add('hidden');
                this.expandedHabitId = null;
            }
        }
    },
    
    // 習慣の完了を取り消す
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
        
        // 確認ダイアログを表示
        this.showConfirmationDialog(
            '達成を取り消しますか？',
            `「${habit.name}」の今日の達成を取り消します。連続記録がリセットされる可能性があります。`,
            () => {
                this.performHabitCancellation(habitId, data, habitIndex);
            }
        );
    },
    
    // 習慣の完了取り消しを実行
    performHabitCancellation(habitId, data, habitIndex) {
        const habit = data.habits[habitIndex];
        
        // YYYY-MM-DD形式で日付を統一
        const todayDate = this.selectedDate;
        const todayYmd = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
        
        let lastCompletedYmd = null;
        if (habit.lastCompletedDate) {
            if (habit.lastCompletedDate.includes('T') || habit.lastCompletedDate.includes('Z')) {
                const lastDate = new Date(habit.lastCompletedDate);
                lastCompletedYmd = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
            } else if (habit.lastCompletedDate.includes('-') && habit.lastCompletedDate.length === 10) {
                lastCompletedYmd = habit.lastCompletedDate;
            } else {
                const lastDate = new Date(habit.lastCompletedDate);
                if (!isNaN(lastDate.getTime())) {
                    lastCompletedYmd = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
                }
            }
        }
        
        if (lastCompletedYmd === todayYmd) {
            console.log('Canceling today\'s completion for habit:', habit.name);
            console.log('Before cancellation:', { continuousDays: habit.continuousDays, lastCompletedDate: habit.lastCompletedDate });
            
            // 今日の完了を取り消す
            data.habits[habitIndex].continuousDays = Math.max(0, habit.continuousDays - 1);
            
            // 履歴から今日の記録を削除
            if (habit.history) {
                const beforeCount = habit.history.length;
                data.habits[habitIndex].history = habit.history.filter(h => {
                    let historyYmd;
                    if (h.date.includes('T') || h.date.includes('Z')) {
                        const historyDate = new Date(h.date);
                        historyYmd = `${historyDate.getFullYear()}-${String(historyDate.getMonth() + 1).padStart(2, '0')}-${String(historyDate.getDate()).padStart(2, '0')}`;
                    } else if (h.date.includes('-') && h.date.length === 10) {
                        historyYmd = h.date;
                    } else {
                        const historyDate = new Date(h.date);
                        historyYmd = `${historyDate.getFullYear()}-${String(historyDate.getMonth() + 1).padStart(2, '0')}-${String(historyDate.getDate()).padStart(2, '0')}`;
                    }
                    return historyYmd !== todayYmd;
                });
                console.log(`History records removed: ${beforeCount - data.habits[habitIndex].history.length}`);
            }
            
            // 最後の完了日を更新（前日の記録があればそれに戻す）
            const yesterday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - 1);
            const yesterdayYmd = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
            
            const yesterdayHistory = data.habits[habitIndex].history ? 
                data.habits[habitIndex].history.find(h => {
                    let historyYmd;
                    if (h.date.includes('T') || h.date.includes('Z')) {
                        const historyDate = new Date(h.date);
                        historyYmd = `${historyDate.getFullYear()}-${String(historyDate.getMonth() + 1).padStart(2, '0')}-${String(historyDate.getDate()).padStart(2, '0')}`;
                    } else if (h.date.includes('-') && h.date.length === 10) {
                        historyYmd = h.date;
                    } else {
                        const historyDate = new Date(h.date);
                        historyYmd = `${historyDate.getFullYear()}-${String(historyDate.getMonth() + 1).padStart(2, '0')}-${String(historyDate.getDate()).padStart(2, '0')}`;
                    }
                    return historyYmd === yesterdayYmd;
                }) : null;
            
            if (yesterdayHistory) {
                data.habits[habitIndex].lastCompletedDate = yesterdayYmd;
            } else {
                data.habits[habitIndex].lastCompletedDate = null;
            }
            
            console.log('Updated habit:', data.habits[habitIndex]);
        } else {
            console.log('Not completed today, nothing to cancel');
        }
        
        localStorage.setItem('habit_tasks', JSON.stringify(data));
        this.renderHabits();
    },
    
    // 習慣のパスを取り消す
    cancelHabitPass(habitId) {
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
        
        // 確認ダイアログを表示
        this.showConfirmationDialog(
            'パスを取り消しますか？',
            `「${habit.name}」の今日のパスを取り消します。`,
            () => {
                const todayYmd = `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDate.getDate()).padStart(2, '0')}`;
                
                // 今日のパス記録を削除
                if (habit.history) {
                    data.habits[habitIndex].history = habit.history.filter(h => {
                        const historyDate = h.date.split('T')[0];
                        return !(historyDate === todayYmd && h.passed);
                    });
                }
                
                localStorage.setItem('habit_tasks', JSON.stringify(data));
                this.renderHabits();
            }
        );
    },
    
    // 習慣の「未達成」を取り消す
    cancelHabitNotAchieved(habitId) {
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

        this.showConfirmationDialog(
            '「未達成」を取り消しますか？',
            `「${habit.name}」の「未達成」状態を取り消して、再度選択できるようにします。`,
            () => {
                const todayYmd = `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDate.getDate()).padStart(2, '0')}`;
                
                if (habit.history) {
                    // 今日の未達成記録を履歴から削除
                    data.habits[habitIndex].history = habit.history.filter(h => {
                        const recordDate = h.date.split('T')[0];
                        return !(recordDate === todayYmd && h.notAchieved);
                    });
                }
                
                localStorage.setItem('habit_tasks', JSON.stringify(data));
                this.renderHabits();
            }
        );
    },

    // 習慣を未達成にする
    notAchieveHabit(habitId) {
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
        const todayYmd = `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDate.getDate()).padStart(2, '0')}`;
        
        // 履歴に未達成を記録
        if (!data.habits[habitIndex].history) {
            data.habits[habitIndex].history = [];
        }
        
        // 今日の記録を更新または追加
        const existingRecordIndex = data.habits[habitIndex].history.findIndex(h => {
            const historyDate = h.date.split('T')[0];
            return historyDate === todayYmd;
        });
        
        if (existingRecordIndex !== -1) {
            data.habits[habitIndex].history[existingRecordIndex] = {
                date: todayYmd,
                achieved: false,
                passed: false,
                notAchieved: true,
                level: null
            };
        } else {
            data.habits[habitIndex].history.push({
                date: todayYmd,
                achieved: false,
                passed: false,
                notAchieved: true,
                level: null
            });
        }
        
        localStorage.setItem('habit_tasks', JSON.stringify(data));
        this.renderHabits();
    },


    // 習慣のスキップ処理
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
        const todayYmd = `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDate.getDate()).padStart(2, '0')}`;
        
        // 履歴を初期化
        if (!habit.history) {
            data.habits[habitIndex].history = [];
        }
        
        // 今日の記録を更新または追加
        const existingIndex = data.habits[habitIndex].history.findIndex(h => {
            const historyDate = h.date.split('T')[0];
            return historyDate === todayYmd;
        });
        
        const skipRecord = {
            date: todayYmd,
            achieved: false,
            passed: true,
            level: null
        };
        
        if (existingIndex !== -1) {
            data.habits[habitIndex].history[existingIndex] = skipRecord;
        } else {
            data.habits[habitIndex].history.push(skipRecord);
        }
        
        localStorage.setItem('habit_tasks', JSON.stringify(data));
        this.renderHabits();
    },

    // 習慣タスクの完了処理
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
        
        // YYYY-MM-DD形式で日付を統一
        const todayDate = this.selectedDate;
        const todayYmd = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
        
        let lastCompletedYmd = null;
        if (habit.lastCompletedDate) {
            if (habit.lastCompletedDate.includes('T') || habit.lastCompletedDate.includes('Z')) {
                // ISO形式の場合
                const lastDate = new Date(habit.lastCompletedDate);
                lastCompletedYmd = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
            } else if (habit.lastCompletedDate.includes('-') && habit.lastCompletedDate.length === 10) {
                // すでにYYYY-MM-DD形式
                lastCompletedYmd = habit.lastCompletedDate;
            } else {
                // その他の形式（toDateString等）
                const lastDate = new Date(habit.lastCompletedDate);
                if (!isNaN(lastDate.getTime())) {
                    lastCompletedYmd = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
                }
            }
        }
        
        if (isAchieved) {
            // 既に今日の記録があるかチェック
            if (!habit.history) habit.history = [];
            
            const existingTodayHistory = habit.history.find(h => {
                if (!h.date) return false;
                let historyYmd;
                if (h.date.includes('T') || h.date.includes('Z')) {
                    const historyDate = new Date(h.date);
                    historyYmd = `${historyDate.getFullYear()}-${String(historyDate.getMonth() + 1).padStart(2, '0')}-${String(historyDate.getDate()).padStart(2, '0')}`;
                } else {
                    historyYmd = h.date;
                }
                return historyYmd === todayYmd;
            });
            
            // 既に今日の記録がある場合は何もしない
            if (existingTodayHistory) {
                this.closeTaskCompletionModal();
                return;
            }
            
            // 継続日数の更新
            if (lastCompletedYmd !== todayYmd) {
                // 昨日の日付を計算
                const yesterday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - 1);
                const yesterdayYmd = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
                
                if (lastCompletedYmd === yesterdayYmd) {
                    // 連続している
                    habit.continuousDays++;
                } else {
                    // 連続が途切れた
                    habit.continuousDays = 1;
                }
                
                // YYYY-MM-DD形式で保存
                habit.lastCompletedDate = todayYmd;
                
                // 履歴に追加
                habit.history.push({
                    date: todayYmd,
                    level: level,
                    achieved: true,
                    points: this.selectedCompletionPoints || 0
                });
                
                // 100日達成チェック
                if (habit.continuousDays >= 100 && !data.hallOfFame) {
                    data.hallOfFame = [];
                }
                if (habit.continuousDays >= 100) {
                    // 殿堂入り
                    const hallOfFameHabit = {
                        ...habit,
                        achievedDate: this.selectedDate.toISOString()
                    };
                    data.hallOfFame.push(hallOfFameHabit);
                    data.habits.splice(habitIndex, 1);
                    
                    // 達成のお祝いメッセージ
                    this.showCelebration();
                    setTimeout(() => {
                        alert(`🎉 おめでとうございます！\n「${habit.name}」が100日継続を達成し、殿堂入りしました！`);
                    }, 500);
                }
            }
            
            this.showCelebration();
            
            // 習慣タスクのポイントを加算
            if (this.selectedCompletionPoints > 0) {
                this.totalPoints += this.selectedCompletionPoints;
                const dateStr = this.selectedDate.toDateString();
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

    // 習慣の完了処理（モーダル表示）
    completeHabit(habitId, level) {
        console.log('completeHabit called:', { habitId, level });
        
        // 習慣データを取得
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
        
        const habit = data.habits.find(h => h.id === habitId);
        if (!habit) {
            console.error('Habit not found:', habitId);
            return;
        }
        
        console.log('Found habit:', habit);
        
        // タスク完了モーダルを表示
        this.currentCompletingTaskId = `habit_${habitId}_${Date.now()}`;
        this.currentCompletingTaskData = {
            habitId: habitId,
            level: level,
            habitName: habit.name
        };
        
        console.log('Showing modal for habit:', {
            id: this.currentCompletingTaskId,
            text: `${habit.name} - ${habit.levels[level - 1]}`,
            type: 'habit'
        });
        
        this.showTaskCompletionModal({
            id: this.currentCompletingTaskId,
            text: `${habit.name} - ${habit.levels[level - 1]}`,
            type: 'habit'
        });
    },

    renderReflection() {
        console.log('renderReflection called - stack trace:', new Error().stack);
        const dateStr = this.selectedDate.toDateString();
        const reflection = this.dailyReflections[dateStr];
        const display = document.getElementById('reflectionDisplay');
        const noReflection = document.getElementById('noReflection');
        const form = document.getElementById('reflectionForm');
        
        console.log('Form hidden status in renderReflection:', form.classList.contains('hidden'));
        
        // フォームが表示されている場合は、フォームの状態を変更しない
        if (!form.classList.contains('hidden')) {
            console.log('Form is visible, skipping render');
            return;
        }
        
        // フォームが非表示の場合のみ、reflectionの内容に応じて表示を更新
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
                            content: `You are a supportive coach for 大岩祐介（マスター）, a clinic director with ADHD tendencies. 

Background:
- リベ大総合クリニック院長・理事長
- 最重要価値観は「ご機嫌」であること - 自己・家族・スタッフの幸福を追求
- 家族：妻ちいちゃん、長女鈴葉（すっちゃん）、長男颯介（そうちゃん）、次男楓介（ふうちゃん）
- 興味の深掘り型で、今ワクワクしているテーマを徹底的に掘り下げる学習スタイル
- AI活用による業務効率化と創造的時間の創出に強い関心
- 衝動性を味方につけながら、家族との時間も大切にしたいと考えている
- スマホ依存・刺激追求行動の改善、業務外作業の効率化が現在の課題

You are also an expert in habit formation for people with ADHD. When habit data analysis is provided:
- If low achievement rates are mentioned, suggest adjusting difficulty levels
- If broken streaks are mentioned, provide encouragement and focus on restarting
- If weekday patterns are shown, offer specific strategies for challenging days
- If level selection bias is detected, encourage balanced growth

Provide personalized, encouraging advice that:
1. Acknowledges his role as a busy clinic director and father
2. Supports his "ご機嫌" philosophy
3. Offers practical strategies considering his ADHD tendencies
4. Balances professional ambitions with family priorities
5. Encourages AI/automation solutions where appropriate
6. When habit data is provided, give specific, actionable feedback

Write in warm, supportive Japanese. Your response MUST be between ${Math.floor(charLimit * 0.9)} and ${charLimit} characters (aim for exactly ${charLimit} characters). IMPORTANT: Always complete your sentences and thoughts. Never cut off mid-sentence. Make sure to write a substantive response that uses the full character count by providing detailed advice, specific examples, and comprehensive encouragement.`
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
    
    
    
    
    
    
    
    
    
    // 期間終了したチャレンジのレビュー通知をチェック
    checkAndShowChallengeReviews(challenges) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        challenges.forEach(challenge => {
            if (challenge.status === 'active') {
                const endDate = new Date(challenge.endDate);
                endDate.setHours(0, 0, 0, 0);
                
                // 期間が終了していて、まだレビューしていない場合
                if (today > endDate) {
                    challenge.status = 'pending_review';
                    
                    // レビュー通知を表示（一度だけ）
                    const notificationKey = `challenge_review_notified_${challenge.id}`;
                    if (!localStorage.getItem(notificationKey)) {
                        this.showChallengeReviewNotification(challenge);
                        localStorage.setItem(notificationKey, 'true');
                    }
                }
            }
        });
        
        // 変更があった場合は保存
        localStorage.setItem('seasonal_challenges', JSON.stringify(challenges));
    },
    
    // チャレンジレビュー通知を表示
    showChallengeReviewNotification(challenge) {
        // 通知要素を作成
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fadeInUp max-w-md mx-4';
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-2xl">🌿</span>
                <div class="flex-1">
                    <div class="font-bold text-lg">「${challenge.targetSekki}」チャレンジ終了！</div>
                    <div class="text-sm mt-1">${challenge.text}の振り返りをしましょう</div>
                </div>
                <button data-action="open-challenge-review" data-challenge-id="${challenge.id}" class="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-all">
                    レビューする
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 10秒後に自動で消去
        setTimeout(() => {
            notification.remove();
        }, 10000);
    },
    
    // チャレンジレビューモーダルを開く
    openChallengeReviewModal(challengeId) {
        const challengeData = localStorage.getItem('seasonal_challenges');
        if (!challengeData) return;
        
        const challenges = JSON.parse(challengeData);
        const challenge = challenges.find(c => c.id === challengeId);
        if (!challenge) return;
        
        // 統計を計算
        const stats = this.calculateChallengeStats(challenge);
        
        // モーダルを表示
        this.showChallengeReviewModal(challenge, stats);
    },
    
    // チャレンジの統計を計算
    calculateChallengeStats(challenge) {
        const completions = challenge.completionHistory || [];
        const totalDays = Math.ceil((new Date(challenge.endDate) - new Date(challenge.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        const achievedDays = completions.length;
        const achievementRate = Math.round((achievedDays / totalDays) * 100);
        
        // レベル別の統計
        const levelCounts = { 1: 0, 2: 0, 3: 0 };
        let totalPoints = 0;
        
        completions.forEach(completion => {
            levelCounts[completion.level] = (levelCounts[completion.level] || 0) + 1;
            const levelDef = challenge.levelDefinitions.find(def => def.level === completion.level);
            totalPoints += levelDef ? levelDef.points : 0;
        });
        
        // 平均レベル
        const avgLevel = achievedDays > 0 
            ? (completions.reduce((sum, c) => sum + c.level, 0) / achievedDays).toFixed(1)
            : 0;
        
        return {
            totalDays,
            achievedDays,
            achievementRate,
            levelCounts,
            avgLevel,
            totalPoints
        };
    },
    
    // チャレンジレビューモーダルを表示
    showChallengeReviewModal(challenge, stats) {
        // 既存のモーダルがあれば削除
        const existingModal = document.getElementById('challengeReviewModal');
        if (existingModal) existingModal.remove();
        
        // モーダルを作成
        const modal = document.createElement('div');
        modal.id = 'challengeReviewModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div class="text-center mb-6">
                    <div class="text-4xl mb-2">🌿</div>
                    <h2 class="text-2xl font-bold text-gray-800">「${challenge.targetSekki}」チャレンジ完了！</h2>
                    <p class="text-gray-600 mt-2">${challenge.text}</p>
                </div>
                
                <!-- 統計情報 -->
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 class="font-bold text-lg mb-3">チャレンジの成果</h3>
                    
                    <!-- 達成率 -->
                    <div class="mb-4">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm text-gray-600">達成率</span>
                            <span class="text-2xl font-bold ${stats.achievementRate >= 80 ? 'text-green-600' : stats.achievementRate >= 50 ? 'text-amber-600' : 'text-red-600'}">
                                ${stats.achievementRate}%
                            </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3">
                            <div class="bg-gradient-to-r from-green-400 to-emerald-600 h-3 rounded-full transition-all duration-500" 
                                 style="width: ${stats.achievementRate}%"></div>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                            ${stats.achievedDays}日 / ${stats.totalDays}日
                        </div>
                    </div>
                    
                    <!-- レベル分布 -->
                    <div class="mb-4">
                        <div class="text-sm text-gray-600 mb-2">レベル選択の内訳</div>
                        <div class="grid grid-cols-3 gap-2">
                            ${[1, 2, 3].map(level => `
                                <div class="bg-white rounded-lg p-2 text-center">
                                    <div class="text-xs text-gray-500">Lv.${level}</div>
                                    <div class="text-lg font-bold">${stats.levelCounts[level]}回</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="text-center mt-2 text-sm text-gray-600">
                            平均レベル: <span class="font-bold">${stats.avgLevel}</span>
                        </div>
                    </div>
                    
                    <!-- 獲得ポイント -->
                    <div class="flex items-center justify-between bg-amber-50 rounded-lg p-3">
                        <span class="text-sm font-medium">獲得ポイント</span>
                        <span class="text-xl font-bold text-amber-700">${stats.totalPoints}pt</span>
                    </div>
                </div>
                
                <!-- 振り返りメッセージ -->
                <div class="mb-6">
                    ${this.getChallengeReviewMessage(stats)}
                </div>
                
                <!-- アクションボタン -->
                <div class="space-y-3">
                    <button data-action="promote-challenge" data-challenge-id="${challenge.id}"
                            class="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                        </svg>
                        定番の習慣に昇格させる
                    </button>
                    
                    <button data-action="end-challenge" data-challenge-id="${challenge.id}"
                            class="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-all">
                        今回はここまでにする（終了）
                    </button>
                    
                    <button data-action="close-challenge-review"
                            class="w-full text-gray-500 py-2 hover:text-gray-700 transition-all text-sm">
                        あとで決める
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // チャレンジの成果に応じたメッセージ
    getChallengeReviewMessage(stats) {
        if (stats.achievementRate >= 80) {
            return `
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div class="text-green-800 font-medium mb-1">素晴らしい成果です！🎉</div>
                    <div class="text-sm text-green-700">
                        ${stats.achievementRate}%という高い達成率は、この習慣があなたに合っている証拠です。
                        ぜひ定番の習慣として続けることをおすすめします。
                    </div>
                </div>
            `;
        } else if (stats.achievementRate >= 50) {
            return `
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div class="text-amber-800 font-medium mb-1">よく頑張りました！💪</div>
                    <div class="text-sm text-amber-700">
                        半分以上の日で実行できました。もし続けたい場合は、
                        レベルの基準を調整して、より取り組みやすくすることも検討してみてください。
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="text-blue-800 font-medium mb-1">お疲れ様でした！🌱</div>
                    <div class="text-sm text-blue-700">
                        今回は難しかったかもしれませんが、挑戦したこと自体が素晴らしいです。
                        別の季節に、違うアプローチで再挑戦してみるのも良いかもしれません。
                    </div>
                </div>
            `;
        }
    },
    
    // レビューモーダルを閉じる
    closeChallengeReviewModal() {
        const modal = document.getElementById('challengeReviewModal');
        if (modal) modal.remove();
    },
    
    // チャレンジを習慣に昇格
    promoteChallengeToHabit(challengeId) {
        const challengeData = localStorage.getItem('seasonal_challenges');
        if (!challengeData) return;
        
        const challenges = JSON.parse(challengeData);
        const challengeIndex = challenges.findIndex(c => c.id === challengeId);
        if (challengeIndex === -1) return;
        
        const challenge = challenges[challengeIndex];
        
        // 習慣データを作成
        const newHabit = {
            id: Date.now().toString(),
            name: challenge.text,
            levels: challenge.levelDefinitions.map(def => def.criteria),
            createdAt: new Date().toISOString(),
            continuousDays: 0,
            lastCompletedDate: null,
            history: []
        };
        
        // 習慣として保存
        const habitData = localStorage.getItem('habit_tasks');
        let data = { habits: [], hallOfFame: [] };
        
        if (habitData) {
            try {
                data = JSON.parse(habitData);
            } catch (e) {
                console.error("Error parsing habit data:", e);
            }
        }
        
        data.habits.push(newHabit);
        localStorage.setItem('habit_tasks', JSON.stringify(data));
        
        // チャレンジのステータスを更新
        challenge.status = 'archived';
        challenge.review = {
            decision: 'promote',
            promotedHabitId: newHabit.id,
            reviewedAt: new Date().toISOString()
        };
        
        localStorage.setItem('seasonal_challenges', JSON.stringify(challenges));
        
        // 成功メッセージを表示
        this.showSuccessNotification('習慣として登録されました！明日から表示されます。');
        
        // モーダルを閉じて再描画
        this.closeChallengeReviewModal();
    },
    
    // チャレンジを終了
    endChallenge(challengeId) {
        const challengeData = localStorage.getItem('seasonal_challenges');
        if (!challengeData) return;
        
        const challenges = JSON.parse(challengeData);
        const challengeIndex = challenges.findIndex(c => c.id === challengeId);
        if (challengeIndex === -1) return;
        
        const challenge = challenges[challengeIndex];
        
        // チャレンジのステータスを更新
        challenge.status = 'archived';
        challenge.review = {
            decision: 'end',
            reviewedAt: new Date().toISOString()
        };
        
        localStorage.setItem('seasonal_challenges', JSON.stringify(challenges));
        
        // 労いのメッセージを表示
        this.showSuccessNotification('お疲れ様でした！また新しい季節で挑戦しましょう。');
        
        // モーダルを閉じて再描画
        this.closeChallengeReviewModal();
    },
    
    // 成功通知を表示
    showSuccessNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeInUp';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },
    
    // 確認ダイアログを表示
    showConfirmationDialog(title, message, onConfirm) {
        const modal = document.getElementById('confirmationModal');
        const titleEl = document.getElementById('confirmationTitle');
        const messageEl = document.getElementById('confirmationMessage');
        const yesBtn = document.getElementById('confirmationYes');
        const noBtn = document.getElementById('confirmationNo');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        // 既存のリスナーを削除
        const newYesBtn = yesBtn.cloneNode(true);
        const newNoBtn = noBtn.cloneNode(true);
        yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
        noBtn.parentNode.replaceChild(newNoBtn, noBtn);
        
        // 新しいリスナーを追加
        newYesBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.add('pointer-events-none');
            if (onConfirm) onConfirm();
        });
        
        newNoBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.add('pointer-events-none');
        });
        
        // モーダルを表示
        modal.classList.remove('hidden');
        modal.classList.remove('pointer-events-none');
    },
    
    // 習慣データの分析関数
    analyzeHabitData(startDate, endDate) {
        const habitData = localStorage.getItem('habit_tasks');
        if (!habitData) return null;
        
        let habits = [];
        try {
            const data = JSON.parse(habitData);
            habits = data.habits || [];
        } catch (e) {
            return null;
        }
        
        if (habits.length === 0) return null;
        
        const analysis = [];
        const weekdayStats = Array(7).fill(0).map(() => ({ total: 0, achieved: 0 }));
        const levelDistribution = { 1: 0, 2: 0, 3: 0 };
        let lowAchievementHabits = [];
        let streakBrokenHabits = [];
        
        habits.forEach(habit => {
            if (!habit.history) return;
            
            // 期間内の履歴をフィルタ
            const periodHistory = habit.history.filter(h => {
                // ISO形式の日付文字列をローカル日付として扱う
                const dateStr = h.date.split('T')[0]; // YYYY-MM-DD部分を取得
                const date = new Date(dateStr + 'T00:00:00');
                return date >= startDate && date <= endDate;
            });
            
            if (periodHistory.length === 0) return;
            
            // 達成率を計算
            const achievedCount = periodHistory.filter(h => h.achieved).length;
            const achievementRate = Math.round((achievedCount / periodHistory.length) * 100);
            
            // 低達成率の習慣を記録
            if (achievementRate < 50 && periodHistory.length >= 3) {
                lowAchievementHabits.push({
                    name: habit.name,
                    rate: achievementRate,
                    currentLevel: habit.levels.findIndex(l => periodHistory[periodHistory.length - 1]?.level === periodHistory.length) + 1
                });
            }
            
            // 連続記録が途切れた習慣をチェック
            const todayStr = new Date().toDateString();
            const todayDate = new Date();
            const yesterday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            
            if (habit.lastCompletedDate) {
                const lastCompleted = new Date(habit.lastCompletedDate).toDateString();
                if (lastCompleted === yesterdayStr && habit.continuousDays > 7) {
                    // 昨日まで続いていたが今日完了していない
                    const todayHistory = habit.history.find(h => new Date(h.date).toDateString() === todayStr);
                    if (!todayHistory) {
                        streakBrokenHabits.push({
                            name: habit.name,
                            streakDays: habit.continuousDays
                        });
                    }
                }
            }
            
            // 曜日別統計
            periodHistory.forEach(h => {
                const weekday = new Date(h.date).getDay();
                weekdayStats[weekday].total++;
                if (h.achieved) weekdayStats[weekday].achieved++;
                
                // レベル分布
                if (h.achieved && h.level) {
                    levelDistribution[h.level]++;
                }
            });
        });
        
        // 分析結果を文字列として構築
        let result = '';
        
        // 低達成率の習慣
        if (lowAchievementHabits.length > 0) {
            result += '達成率が低い習慣:\n';
            lowAchievementHabits.forEach(h => {
                result += `- ${h.name}: 達成率${h.rate}%\n`;
            });
        }
        
        // 連続記録が途切れた習慣
        if (streakBrokenHabits.length > 0) {
            result += '\n継続が途切れた習慣:\n';
            streakBrokenHabits.forEach(h => {
                result += `- ${h.name}: ${h.streakDays}日間継続していました\n`;
            });
        }
        
        // 曜日別の達成率
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        let lowestWeekday = null;
        let lowestRate = 100;
        let highestWeekday = null;
        let highestRate = 0;
        
        weekdays.forEach((day, index) => {
            if (weekdayStats[index].total > 0) {
                const rate = Math.round((weekdayStats[index].achieved / weekdayStats[index].total) * 100);
                if (rate < lowestRate) {
                    lowestRate = rate;
                    lowestWeekday = day;
                }
                if (rate > highestRate) {
                    highestRate = rate;
                    highestWeekday = day;
                }
            }
        });
        
        if (lowestWeekday && highestWeekday) {
            result += `\n曜日別傾向:\n`;
            result += `- 最も達成率が高い曜日: ${highestWeekday}曜日 (${highestRate}%)\n`;
            result += `- 最も達成率が低い曜日: ${lowestWeekday}曜日 (${lowestRate}%)\n`;
        }
        
        // レベル選択の偏り
        const totalLevelSelections = Object.values(levelDistribution).reduce((sum, count) => sum + count, 0);
        if (totalLevelSelections > 0) {
            const levelPercentages = {};
            Object.entries(levelDistribution).forEach(([level, count]) => {
                levelPercentages[level] = Math.round((count / totalLevelSelections) * 100);
            });
            
            if (levelPercentages[1] + levelPercentages[2] > 80) {
                result += `\nレベル選択の傾向: 簡単なレベル（Lv.1-2）が${levelPercentages[1] + levelPercentages[2]}%を占めています\n`;
            }
        }
        
        return result || null;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // 日付をYYYY-MM-DD形式にフォーマット
    formatDateToYmd(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
    },
    
    setupScrollDetection() {
        // タッチスクロールの検知
        let touchStartY = null;
        let scrollStartTime = null;
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            scrollStartTime = Date.now();
            this.touchStartY = touchStartY;
            this.touchStartTime = scrollStartTime;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (touchStartY === null) return;
            
            const touchY = e.touches[0].clientY;
            const diffY = Math.abs(touchY - touchStartY);
            const timeDiff = Date.now() - scrollStartTime;
            
            // 10px以上移動したらスクロール中と判定
            if (diffY > 10) {
                this.isScrolling = true;
                
                // 既存のタイムアウトをクリア
                if (this.scrollTimeout) {
                    clearTimeout(this.scrollTimeout);
                }
                
                // スクロール終了を検知するタイマー設定
                this.scrollTimeout = setTimeout(() => {
                    this.isScrolling = false;
                    console.log('Scroll ended');
                }, 300);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            touchStartY = null;
            scrollStartTime = null;
            
            // タッチ終了後もしばらくスクロール状態を維持
            if (this.isScrolling) {
                setTimeout(() => {
                    this.isScrolling = false;
                }, 300);
            }
        }, { passive: true });
        
        // マウスホイールスクロールの検知
        document.addEventListener('wheel', (e) => {
            this.isScrolling = true;
            
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }
            
            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
            }, 300);
        }, { passive: true });
        
        // スクロールイベントの検知（念のため）
        document.addEventListener('scroll', (e) => {
            this.isScrolling = true;
            
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }
            
            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
            }, 300);
        }, { passive: true });
    }
};

// グローバルに公開
window.app = app;

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