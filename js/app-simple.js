import { fetchSunTime } from './sunTimeAPI.js';

const app = {
    selectedDate: (() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    })(),

    init() {
        console.log('App initializing...');
        
        this.bindEvents();
        this.updateSekki();
        this.updateSunTimeDisplay();
        
        // 今日の日付を表示
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

    bindEvents() {
        // 日付変更ボタン
        const prevDay = document.getElementById('prevDay');
        const nextDay = document.getElementById('nextDay');
        const todayButton = document.getElementById('todayButton');
        const calendarToggle = document.getElementById('calendarToggle');
        const dateInput = document.getElementById('dateInput');
        const calPrevMonth = document.getElementById('calPrevMonth');
        const calNextMonth = document.getElementById('calNextMonth');

        if (prevDay) {
            prevDay.addEventListener('click', () => this.changeDate(-1));
        }
        if (nextDay) {
            nextDay.addEventListener('click', () => this.changeDate(1));
        }
        if (todayButton) {
            todayButton.addEventListener('click', () => this.goToToday());
        }
        if (calendarToggle) {
            calendarToggle.addEventListener('click', () => this.toggleCalendar());
        }
        if (dateInput) {
            dateInput.addEventListener('change', (e) => this.setDate(new Date(e.target.value)));
        }
        if (calPrevMonth) {
            calPrevMonth.addEventListener('click', () => this.changeCalendarMonth(-1));
        }
        if (calNextMonth) {
            calNextMonth.addEventListener('click', () => this.changeCalendarMonth(1));
        }

        // カレンダーを閉じる
        document.querySelectorAll('[data-action="close-calendar"]').forEach(btn => {
            btn.addEventListener('click', () => this.closeCalendar());
        });

        // カレンダー外クリックで閉じる
        const customCalendarPopup = document.getElementById('customCalendarPopup');
        if (customCalendarPopup) {
            customCalendarPopup.addEventListener('click', (e) => {
                if (e.target === customCalendarPopup) {
                    this.closeCalendar();
                }
            });
        }
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
            if (now >= allSekki[i].date) { 
                currentSekki = allSekki[i]; 
            } else { 
                nextSekki = allSekki[i]; 
                break; 
            }
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
        });
    },
    
    showSekkiDetail(sekki) {
        document.getElementById('sekkiDetailName').textContent = sekki.name;
        document.getElementById('sekkiDetailDate').textContent = sekki.date.toLocaleDateString('ja-JP', { 
            year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'
        });
        document.getElementById('sekkiDescription').textContent = sekki.description;
        const bg = document.getElementById('backgroundSeason');
        bg.className = bg.className.replace(/bg-[\u4E00-\u9FA5]+/g, '');
        bg.classList.add(`bg-${sekki.name}`);
        createSeasonalAnimation(sekki.name);
    },
    
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
        return false;
    },
    
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
        
        this.updateDateDisplay();
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
        
        if (currentSekkiForDate) {
            const info = document.getElementById('calendarSekkiInfo');
            info.innerHTML = `この日の節気：<strong>${currentSekkiForDate.name}</strong>`;
            info.classList.remove('hidden');
        }
    },
    
    changeDate(days) {
        this.selectedDate = new Date(this.selectedDate.getTime() + days * 24 * 60 * 60 * 1000);
        this.updateDateDisplay();
        this.checkIfToday();
    },
    
    setDate(newDate) {
        this.selectedDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
        this.updateDateDisplay();
        this.checkIfToday();
        this.hideCalendar();
    },
    
    goToToday() {
        const today = new Date();
        this.selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        this.updateDateDisplay();
        this.checkIfToday();
    },
    
    updateDateDisplay() {
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth() + 1;
        const date = this.selectedDate.getDate();
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const day = weekdays[this.selectedDate.getDay()];
        
        document.getElementById('currentDateYear').textContent = `${year}年`;
        document.getElementById('currentDate').textContent = `${month}月${date}日`;
        document.getElementById('currentDateDay').textContent = `(${day})`;
        
        // カレンダー入力の更新
        const dateInput = document.getElementById('dateInput');
        if (dateInput) {
            const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            dateInput.value = formattedDate;
        }
    },
    
    checkIfToday() {
        const today = new Date();
        const isToday = this.selectedDate.toDateString() === today.toDateString();
        const todayButton = document.getElementById('todayButton');
        
        if (todayButton) {
            if (isToday) {
                todayButton.classList.add('hidden');
            } else {
                todayButton.classList.remove('hidden');
            }
        }
    },
    
    toggleCalendar() {
        const calendarInput = document.getElementById('calendarInput');
        const customCalendarPopup = document.getElementById('customCalendarPopup');
        
        if (calendarInput.classList.contains('hidden')) {
            this.showCalendar();
        } else {
            this.hideCalendar();
        }
    },
    
    showCalendar() {
        const calendarInput = document.getElementById('calendarInput');
        const customCalendarPopup = document.getElementById('customCalendarPopup');
        
        calendarInput.classList.remove('hidden');
        this.updateCalendarSekkiInfo();
        
        // カスタムカレンダーを表示
        if (customCalendarPopup) {
            customCalendarPopup.classList.remove('hidden');
            this.renderCalendar();
        }
    },
    
    hideCalendar() {
        const calendarInput = document.getElementById('calendarInput');
        calendarInput.classList.add('hidden');
        this.closeCalendar();
    },
    
    closeCalendar() {
        const customCalendarPopup = document.getElementById('customCalendarPopup');
        if (customCalendarPopup) {
            customCalendarPopup.classList.add('hidden');
        }
    },
    
    renderCalendar() {
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth();
        
        // カレンダーの月表示を更新
        const calendarMonth = document.getElementById('calendarMonth');
        if (calendarMonth) {
            calendarMonth.textContent = `${year}年${month + 1}月`;
        }
        
        // カレンダーグリッドを生成
        const calendarGrid = document.getElementById('calendarGrid');
        if (calendarGrid) {
            calendarGrid.innerHTML = '';
            
            const firstDay = new Date(year, month, 1).getDay();
            const lastDate = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            
            // 空白セルを追加
            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('div');
                calendarGrid.appendChild(emptyCell);
            }
            
            // 日付セルを追加
            for (let date = 1; date <= lastDate; date++) {
                const dateCell = document.createElement('button');
                const cellDate = new Date(year, month, date);
                const isToday = cellDate.toDateString() === today.toDateString();
                const isSelected = cellDate.toDateString() === this.selectedDate.toDateString();
                const dayOfWeek = cellDate.getDay();
                
                dateCell.className = `p-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected ? 'bg-gray-800 text-white' :
                    isToday ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                    dayOfWeek === 0 ? 'text-red-500 hover:bg-gray-100' :
                    dayOfWeek === 6 ? 'text-blue-500 hover:bg-gray-100' :
                    'text-gray-700 hover:bg-gray-100'
                }`;
                
                dateCell.textContent = date;
                dateCell.addEventListener('click', () => {
                    this.setDate(cellDate);
                    this.closeCalendar();
                });
                
                calendarGrid.appendChild(dateCell);
            }
        }
    },
    
    changeCalendarMonth(direction) {
        const newMonth = this.selectedDate.getMonth() + direction;
        const newYear = this.selectedDate.getFullYear() + Math.floor(newMonth / 12);
        this.selectedDate = new Date(newYear, (newMonth + 12) % 12, 1);
        this.renderCalendar();
    }
};

// グローバルに公開
window.app = app;