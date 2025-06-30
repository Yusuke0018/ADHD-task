// dateUtils.js - 日付操作、二十四節気の計算、カレンダー関連のロジック

import { sekkiData } from './data/sekki-data.js';
import { state } from './state.js';

// ===== 日付処理ユーティリティ関数 =====
export const dateUtils = {
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

// ===== 二十四節気関連関数 =====
export function updateSekki() {
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
        currentSekki = allSekki.find(s => now < s.date) || allSekki[allSekki.length - 1]; 
        if (!currentSekki && sekkiData[year - 1] && sekkiData[year - 1].length > 0) { 
            currentSekki = sekkiData[year - 1][sekkiData[year - 1].length - 1];
        }
    }
    
    if (currentSekki) {
        document.getElementById('currentSekki').textContent = currentSekki.name;
        const dateStr = currentSekki.date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
        document.getElementById('sekkiDate').textContent = `${dateStr}より`;
        const bg = document.getElementById('backgroundSeason');
        bg.className = bg.className.replace(/bg-[\u4E00-\u9FA5]+/g, '');
        bg.classList.add(`bg-${currentSekki.name}`);
        
        // 季節のアニメーション（外部ファイルから呼び出し）
        if (typeof createSeasonalAnimation === 'function') {
            createSeasonalAnimation(currentSekki.name);
        }
        
        showSekkiDetail(currentSekki);
    }
    
    if (nextSekki) {
        const daysUntil = Math.ceil((nextSekki.date - now) / (1000 * 60 * 60 * 24));
        document.getElementById('nextSekkiInfo').textContent = `次は「${nextSekki.name}」 あと${daysUntil}日`;
    } else {
        document.getElementById('nextSekkiInfo').textContent = `次の節気情報は翌年になります`;
    }
    
    updateYearSekkiList();
}

export function updateYearSekkiList() {
    const year = state.selectedDate.getFullYear(); 
    const yearSekki = sekkiData[year] || [];
    const listEl = document.getElementById('yearSekkiList');
    listEl.innerHTML = '';
    
    yearSekki.forEach(sekki => {
        const itemEl = document.createElement('div');
        const isPast = new Date() > sekki.date && !isCurrentSekki(sekki, state.selectedDate); 
        const isCurrentlyDisplayedSekki = isCurrentSekki(sekki, state.selectedDate); 
        
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
            showSekkiDetail(sekki); 
            updateYearSekkiList(); 
        });
        
        listEl.appendChild(itemEl);
    });
}

export function showSekkiDetail(sekki) {
    document.getElementById('sekkiDetailName').textContent = sekki.name;
    document.getElementById('sekkiDetailDate').textContent = sekki.date.toLocaleDateString('ja-JP', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'
    });
    document.getElementById('sekkiDescription').textContent = sekki.description;
    const bg = document.getElementById('backgroundSeason');
    bg.className = bg.className.replace(/bg-[\u4E00-\u9FA5]+/g, '');
    bg.classList.add(`bg-${sekki.name}`);
    
    // 季節のアニメーション（外部ファイルから呼び出し）
    if (typeof createSeasonalAnimation === 'function') {
        createSeasonalAnimation(sekki.name);
    }
}

export function isCurrentSekki(sekkiToCheck, referenceDate) {
    const year = referenceDate.getFullYear();
    const allSekkiForYear = sekkiData[year] || [];
    const allSekkiForPrevYear = sekkiData[year - 1] || [];
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
}

export function updateCalendarSekkiInfo() {
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
        
        // 選択日が節気の日付と同じかチェック
        const isExactSekkiDate = sekkiList.some(s => 
            s.date.getFullYear() === selectedDate.getFullYear() &&
            s.date.getMonth() === selectedDate.getMonth() &&
            s.date.getDate() === selectedDate.getDate()
        );
        
        if (isExactSekkiDate) {
            message = `この日は「${currentSekkiForDate.name}」の始まりです。`;
        }
        
        infoEl.textContent = message;
        infoEl.classList.remove('hidden');
    } else {
        infoEl.classList.add('hidden');
    }
}

// ===== 日付ナビゲーション関数 =====
export function navigateDate(direction) {
    const newDate = new Date(state.selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    state.selectedDate = newDate;
}

export function goToToday() {
    const today = new Date();
    state.selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

// ===== 今日の表示更新 =====
export function updateTodayDisplay() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayName = dayNames[today.getDay()];
    
    // 年表示
    const yearEl = document.getElementById('todayDateYear');
    if (yearEl) yearEl.textContent = `${year}年`;
    
    // 日付表示
    const dateEl = document.getElementById('todayDateFull');
    if (dateEl) dateEl.textContent = `${month}月${date}日`;
    
    // 曜日表示
    const dayEl = document.getElementById('todayDateDay');
    if (dayEl) dayEl.textContent = `（${dayName}）`;
}