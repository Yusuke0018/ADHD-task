import { fetchSunTime } from './sunTimeAPI.js';

const app = {
    selectedDate: (() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    })(),

    init() {
        console.log('App initializing (simple mode)...');
        this.updateSekki();
        this.updateSunTimeDisplay();
        
        // 今日の日付を表示
        requestAnimationFrame(() => this.updateTodayDisplay());
        setTimeout(() => this.updateTodayDisplay(), 500);
        window.addEventListener('orientationchange', () => this.updateTodayDisplay());
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) this.updateTodayDisplay();
        });

        // モバイルのUI可視状態設定
        this.setupUIVisibilityToggle();
    },

    setupUIVisibilityToggle() {
        const toggle = document.getElementById('uiVisibilityToggle');
        const isMobile = window.matchMedia('(max-width: 640px)').matches;

        const setHidden = (hidden) => {
            document.body.classList.toggle('ui-hidden', hidden);
            localStorage.setItem('uiHidden', hidden ? '1' : '0');
            if (toggle) toggle.textContent = hidden ? '表示' : '全画面';
        };

        // 既存の設定を適用
        const saved = localStorage.getItem('uiHidden');
        if (saved === '1') setHidden(true);

        // 初回のモバイルは少し見せてから自動で隠す
        if (isMobile && saved === null) {
            setTimeout(() => setHidden(true), 2000);
        }

        if (toggle) {
            toggle.addEventListener('click', () => {
                const hidden = !document.body.classList.contains('ui-hidden');
                setHidden(hidden);
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
    
    // カレンダー/日付変更機能はシンプル版では未使用のため削除
};

// グローバルに公開
window.app = app;
