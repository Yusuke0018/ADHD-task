// ui.js - DOMの操作、UIの描画・更新、通知やアニメーションの表示など、画面表示に関するすべて

import { state, getReflection, getAIComment } from './state.js';
import { dateUtils } from './dateUtils.js';
import { getTasksForDate, getTaskStats } from './taskManager.js';

// 習慣データとプロジェクトデータのインポート（外部ファイルから）
let habitTasks = [];

// 外部ファイルの読み込み確認
try {
    if (typeof window !== 'undefined' && window.habitTasks) {
        habitTasks = window.habitTasks;
    }
} catch (e) {
    console.log('習慣データの読み込みに失敗:', e);
}

// ===== メイン描画関数 =====
export function render() {
    updateTodayDisplay();
    updateDateDisplay();
    renderTasks();
    renderHabits();
    updatePointsDisplay();
    renderReflection();
    renderDailyAIComment();
    updateDailyStatusIndicators();
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

// ===== 日付表示の更新 =====
export function updateDateDisplay() {
    const year = state.selectedDate.getFullYear();
    const month = state.selectedDate.getMonth() + 1;
    const date = state.selectedDate.getDate();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayName = dayNames[state.selectedDate.getDay()];
    
    // 現在の日付表示
    const yearEl = document.getElementById('currentDateYear');
    if (yearEl) yearEl.textContent = `${year}年`;
    
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = `${month}月${date}日`;
    
    const dayEl = document.getElementById('currentDateDay');
    if (dayEl) dayEl.textContent = `（${dayName}）`;
    
    // 今日へ戻るボタンの表示制御
    const today = new Date();
    const isToday = dateUtils.formatDateToYmd(state.selectedDate) === dateUtils.formatDateToYmd(today);
    const todayButton = document.getElementById('todayButton');
    if (todayButton) {
        if (isToday) {
            todayButton.classList.add('hidden');
        } else {
            todayButton.classList.remove('hidden');
        }
    }
    
    // カレンダー入力の更新
    const dateInput = document.getElementById('dateInput');
    if (dateInput) {
        dateInput.value = dateUtils.formatDateToYmd(state.selectedDate);
    }
}

// ===== タスクの描画 =====
export function renderTasks() {
    const tasks = getTasksForDate(state.selectedDate);
    const taskList = document.getElementById('taskList');
    const noTasks = document.getElementById('noTasks');
    
    if (!taskList) return;
    
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        if (noTasks) noTasks.classList.remove('hidden');
        return;
    }
    
    if (noTasks) noTasks.classList.add('hidden');
    
    tasks.forEach((task, index) => {
        const taskEl = createTaskElement(task, index);
        taskList.appendChild(taskEl);
    });
}

function createTaskElement(task, index) {
    const taskEl = document.createElement('div');
    const isUrgent = task.type === 'urgent';
    const completedClass = task.completed ? 'opacity-60' : '';
    const urgentClass = isUrgent ? 'border-l-4 border-red-500 bg-red-50' : '';
    
    taskEl.className = `washi-card rounded-2xl p-4 sm:p-6 animate-fadeInUp ${completedClass} ${urgentClass}`;
    taskEl.style.animationDelay = `${0.1 + index * 0.05}s`;
    
    taskEl.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1">
                <button onclick="window.app.toggleTask(${task.id})" 
                        class="w-6 h-6 rounded-full border-2 ${
                            task.completed 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-300 hover:border-green-400'
                        } transition-all flex items-center justify-center">
                    ${task.completed ? 
                        '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' 
                        : ''
                    }
                </button>
                
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-base sm:text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}">${task.text}</span>
                        ${isUrgent ? '<span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">目標</span>' : ''}
                    </div>
                    <div class="text-xs text-gray-500">
                        ${task.points || 1}pt
                        ${task.addedAt ? ` • ${task.addedAt.toLocaleDateString('ja-JP')} 追加` : ''}
                    </div>
                </div>
            </div>
            
            <div class="flex items-center gap-2">
                <button onclick="window.app.postponeTask(${task.id})" 
                        class="p-2 text-gray-400 hover:text-gray-600 transition-all" 
                        title="明日へ">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                </button>
                <button onclick="window.app.editTask(${task.id})" 
                        class="p-2 text-gray-400 hover:text-gray-600 transition-all" 
                        title="編集">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                </button>
                <button onclick="window.app.deleteTask(${task.id})" 
                        class="p-2 text-red-400 hover:text-red-600 transition-all" 
                        title="削除">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    return taskEl;
}

// ===== 習慣の描画 =====
export function renderHabits() {
    const habitList = document.getElementById('habitList');
    const noHabits = document.getElementById('noHabits');
    
    if (!habitList) return;
    
    habitList.innerHTML = '';
    
    // 外部ファイルから習慣データを取得
    try {
        const savedHabits = localStorage.getItem('habit_tasks');
        habitTasks = savedHabits ? JSON.parse(savedHabits) : [];
    } catch (e) {
        habitTasks = [];
    }
    
    const activeHabits = habitTasks.filter(habit => habit.active !== false);
    
    if (activeHabits.length === 0) {
        if (noHabits) noHabits.classList.remove('hidden');
        return;
    }
    
    if (noHabits) noHabits.classList.add('hidden');
    
    activeHabits.forEach(habit => {
        const habitEl = createHabitElement(habit);
        habitList.appendChild(habitEl);
    });
}

function createHabitElement(habit) {
    const today = dateUtils.formatDateToYmd(state.selectedDate);
    const isCompleted = habit.completedDates && habit.completedDates.includes(today);
    
    const habitEl = document.createElement('div');
    habitEl.className = `habit-item p-3 bg-purple-50 rounded-lg border ${isCompleted ? 'border-purple-300 bg-purple-100' : 'border-purple-200'}`;
    
    habitEl.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button onclick="window.app.toggleHabit('${habit.id}', '${today}')" 
                        class="w-5 h-5 rounded-full border-2 ${
                            isCompleted 
                                ? 'bg-purple-500 border-purple-500' 
                                : 'border-purple-300 hover:border-purple-400'
                        } transition-all flex items-center justify-center">
                    ${isCompleted ? 
                        '<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' 
                        : ''
                    }
                </button>
                <span class="text-sm font-medium text-purple-800">${habit.name}</span>
            </div>
            <div class="text-xs text-purple-600">${habit.level || 1}段階</div>
        </div>
    `;
    
    return habitEl;
}


// ===== ポイント表示の更新 =====
export function updatePointsDisplay() {
    const stats = getTaskStats(state.selectedDate);
    
    // 完了数/総数の表示
    const completedCountEl = document.getElementById('completedCount');
    const totalCountEl = document.getElementById('totalCount');
    
    if (completedCountEl) completedCountEl.textContent = stats.completed;
    if (totalCountEl) totalCountEl.textContent = stats.total;
    
    // 総ポイントの表示
    const totalPointsEl = document.getElementById('totalPointsDisplay');
    if (totalPointsEl) totalPointsEl.textContent = state.totalPoints;
}

// ===== 振り返りの描画 =====
export function renderReflection() {
    const reflection = getReflection(state.selectedDate);
    const displayEl = document.getElementById('reflectionDisplay');
    const noReflectionEl = document.getElementById('noReflection');
    const inputEl = document.getElementById('reflectionInput');
    
    if (reflection) {
        if (displayEl) {
            displayEl.textContent = reflection;
            displayEl.classList.remove('hidden');
        }
        if (noReflectionEl) noReflectionEl.classList.add('hidden');
        if (inputEl) inputEl.value = reflection;
    } else {
        if (displayEl) displayEl.classList.add('hidden');
        if (noReflectionEl) noReflectionEl.classList.remove('hidden');
        if (inputEl) inputEl.value = '';
    }
}

// ===== デイリーAIコメントの描画 =====
export function renderDailyAIComment() {
    const comment = getAIComment(state.selectedDate);
    const contentEl = document.getElementById('dailyAIContent');
    const emptyEl = document.getElementById('dailyAIEmpty');
    const textEl = document.getElementById('dailyAIText');
    
    if (comment) {
        if (textEl) textEl.textContent = comment;
        if (contentEl) contentEl.classList.remove('hidden');
        if (emptyEl) emptyEl.classList.add('hidden');
    } else {
        if (contentEl) contentEl.classList.add('hidden');
        if (emptyEl) emptyEl.classList.remove('hidden');
    }
}

// ===== デイリーステータスインジケーターの更新 =====
export function updateDailyStatusIndicators() {
    const stats = getTaskStats(state.selectedDate);
    const reflection = getReflection(state.selectedDate);
    const aiComment = getAIComment(state.selectedDate);
    
    // 完了率バッジ
    const completionBadge = document.getElementById('completionRateBadge');
    const completionText = document.getElementById('completionRateText');
    
    if (stats.total > 0) {
        if (completionText) completionText.textContent = `${stats.completionRate}%`;
        if (completionBadge) completionBadge.classList.remove('hidden');
    } else {
        if (completionBadge) completionBadge.classList.add('hidden');
    }
    
    // ポイントバッジ
    const pointsBadge = document.getElementById('dailyPointsBadge');
    const pointsText = document.getElementById('dailyPointsText');
    
    if (stats.totalPoints > 0) {
        if (pointsText) pointsText.textContent = stats.totalPoints;
        if (pointsBadge) pointsBadge.classList.remove('hidden');
    } else {
        if (pointsBadge) pointsBadge.classList.add('hidden');
    }
    
    // AIコメントバッジ
    const aiCommentBadge = document.getElementById('aiCommentBadge');
    if (aiComment) {
        if (aiCommentBadge) aiCommentBadge.classList.remove('hidden');
    } else {
        if (aiCommentBadge) aiCommentBadge.classList.add('hidden');
    }
    
    // 振り返りバッジ
    const reflectionBadge = document.getElementById('reflectionBadge');
    if (reflection) {
        if (reflectionBadge) reflectionBadge.classList.remove('hidden');
    } else {
        if (reflectionBadge) reflectionBadge.classList.add('hidden');
    }
}

// ===== セレブレーション表示 =====
export function showCelebration() {
    const celebration = document.getElementById('celebration');
    if (!celebration) return;
    
    celebration.classList.remove('hidden');
    
    // 3秒後に自動的に非表示
    setTimeout(() => {
        celebration.classList.add('hidden');
    }, 3000);
}

// ===== エラー表示 =====
export function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    if (!errorEl) return;
    
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    
    // 5秒後に自動的に非表示
    setTimeout(() => {
        errorEl.classList.add('hidden');
    }, 5000);
}

// ===== 先送りエフェクト表示 =====
export function showPostponeEffect() {
    const effect = document.getElementById('postponeEffect');
    if (!effect) return;
    
    effect.classList.remove('hidden');
    
    // 2秒後に自動的に非表示
    setTimeout(() => {
        effect.classList.add('hidden');
    }, 2000);
}

// ===== カレンダー関連 =====
export function toggleCustomCalendar() {
    const popup = document.getElementById('customCalendarPopup');
    if (!popup) return;
    
    const isHidden = popup.classList.contains('hidden');
    
    if (isHidden) {
        renderCalendar();
        popup.classList.remove('hidden');
        popup.classList.remove('pointer-events-none');
    } else {
        popup.classList.add('hidden');
        popup.classList.add('pointer-events-none');
    }
}

export function renderCalendar() {
    const currentDate = new Date(state.selectedDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // カレンダーヘッダーの更新
    const monthEl = document.getElementById('calendarMonth');
    if (monthEl) {
        monthEl.textContent = `${year}年${month + 1}月`;
    }
    
    // カレンダーグリッドの生成
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // 月初の曜日を取得
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    
    // 月末日を取得
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    // 前月の空セル
    for (let i = 0; i < startDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'p-2';
        grid.appendChild(emptyCell);
    }
    
    // 日付セル
    for (let day = 1; day <= lastDay; day++) {
        const dayCell = document.createElement('button');
        const cellDate = new Date(year, month, day);
        const isToday = dateUtils.formatDateToYmd(cellDate) === dateUtils.formatDateToYmd(new Date());
        const isSelected = dateUtils.formatDateToYmd(cellDate) === dateUtils.formatDateToYmd(currentDate);
        
        dayCell.className = `p-2 text-sm rounded transition-all ${
            isSelected ? 'bg-blue-500 text-white' :
            isToday ? 'bg-blue-100 text-blue-800 font-bold' :
            'hover:bg-gray-100'
        }`;
        
        dayCell.textContent = day;
        dayCell.addEventListener('click', () => {
            state.selectedDate = cellDate;
            toggleCustomCalendar();
            render();
        });
        
        grid.appendChild(dayCell);
    }
}