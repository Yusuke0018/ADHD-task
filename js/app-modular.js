// app.js - アプリケーションの初期化と、イベントリスナー（bindEvents）の設定に特化した司令塔

import { state, loadData, saveData, saveReflection, getReflection } from './state.js';
import { updateSekki, navigateDate, goToToday, updateTodayDisplay, updateCalendarSekkiInfo } from './dateUtils.js';
import { generateDailyAIComment, deleteDailyAIComment, setApiKey } from './api.js';
import { addTask, toggleTask, completeTask, postponeTask, deleteTask, editTask } from './taskManager.js';
import { render, showCelebration, showError, showPostponeEffect, toggleCustomCalendar, renderCalendar } from './ui.js';

// ===== メインアプリケーションオブジェクト =====
const app = {
    init() {
        console.log('App initializing...');
        
        // タッチデバイスのデバッグ情報
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        console.log('Touch device:', isTouchDevice);
        
        // 1. データを読み込む
        loadData();
        
        // 2. イベントリスナーを設定する
        this.bindEvents();
        
        // 3. UIを初期描画する
        updateSekki();
        render();
        
        // スマホ対応：確実に表示
        requestAnimationFrame(() => {
            updateTodayDisplay();
        });
        setTimeout(() => updateTodayDisplay(), 500);
        window.addEventListener('orientationchange', () => updateTodayDisplay());
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                updateTodayDisplay();
            }
        });
    },

    bindEvents() {
        // タスク追加
        const addTaskBtn = document.getElementById('addTask');
        const taskInput = document.getElementById('taskInput');
        
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                const text = taskInput?.value?.trim();
                if (text) {
                    addTask(text);
                    if (taskInput) taskInput.value = '';
                    render();
                }
            });
        }
        
        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const text = taskInput.value.trim();
                    if (text) {
                        addTask(text);
                        taskInput.value = '';
                        render();
                    }
                }
            });
        }
        
        // タスクタイプ切り替え
        const normalTypeBtn = document.getElementById('normalType');
        const urgentTypeBtn = document.getElementById('urgentType');
        
        if (normalTypeBtn) {
            normalTypeBtn.addEventListener('click', () => {
                state.taskType = 'normal';
                this.updateTaskTypeUI();
            });
        }
        
        if (urgentTypeBtn) {
            urgentTypeBtn.addEventListener('click', () => {
                state.taskType = 'urgent';
                this.updateTaskTypeUI();
            });
        }
        
        // 日付ナビゲーション
        const prevDayBtn = document.getElementById('prevDay');
        const nextDayBtn = document.getElementById('nextDay');
        const todayBtn = document.getElementById('todayButton');
        
        if (prevDayBtn) {
            prevDayBtn.addEventListener('click', () => {
                navigateDate(-1);
                render();
            });
        }
        
        if (nextDayBtn) {
            nextDayBtn.addEventListener('click', () => {
                navigateDate(1);
                render();
            });
        }
        
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                goToToday();
                render();
            });
        }
        
        // カレンダー関連
        const calendarToggle = document.getElementById('calendarToggle');
        const dateInput = document.getElementById('dateInput');
        
        if (calendarToggle) {
            calendarToggle.addEventListener('click', () => {
                toggleCustomCalendar();
            });
        }
        
        if (dateInput) {
            dateInput.addEventListener('change', (e) => {
                const selectedDate = new Date(e.target.value);
                if (!isNaN(selectedDate.getTime())) {
                    state.selectedDate = selectedDate;
                    render();
                    updateCalendarSekkiInfo();
                }
            });
        }
        
        // 振り返り機能
        const reflectionToggle = document.getElementById('reflectionToggle');
        const reflectionForm = document.getElementById('reflectionForm');
        const saveReflectionBtn = document.getElementById('saveReflection');
        const cancelReflectionBtn = document.getElementById('cancelReflection');
        const reflectionInput = document.getElementById('reflectionInput');
        
        if (reflectionToggle) {
            reflectionToggle.addEventListener('click', () => {
                if (reflectionForm) {
                    const isHidden = reflectionForm.classList.contains('hidden');
                    if (isHidden) {
                        reflectionForm.classList.remove('hidden');
                        if (reflectionInput) {
                            reflectionInput.focus();
                            reflectionInput.value = getReflection(state.selectedDate);
                        }
                    } else {
                        reflectionForm.classList.add('hidden');
                    }
                }
            });
        }
        
        if (saveReflectionBtn) {
            saveReflectionBtn.addEventListener('click', () => {
                const reflection = reflectionInput?.value?.trim();
                if (reflection) {
                    saveReflection(reflection, state.selectedDate);
                    if (reflectionForm) reflectionForm.classList.add('hidden');
                    render();
                }
            });
        }
        
        if (cancelReflectionBtn) {
            cancelReflectionBtn.addEventListener('click', () => {
                if (reflectionForm) reflectionForm.classList.add('hidden');
                if (reflectionInput) reflectionInput.value = '';
            });
        }
        
        // タスク完了モーダル
        this.bindCompletionModalEvents();
        
        // カレンダーポップアップ
        this.bindCalendarEvents();
        
        // スワイプメニュー
        this.bindSwipeMenuEvents();
    },
    
    updateTaskTypeUI() {
        const normalBtn = document.getElementById('normalType');
        const urgentBtn = document.getElementById('urgentType');
        
        if (normalBtn && urgentBtn) {
            if (state.taskType === 'normal') {
                normalBtn.className = 'flex-1 px-4 py-2 rounded-full font-medium transition-all bg-gray-800 text-white button-large';
                urgentBtn.className = 'flex-1 px-4 py-2 rounded-full font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 button-large';
            } else {
                normalBtn.className = 'flex-1 px-4 py-2 rounded-full font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 button-large';
                urgentBtn.className = 'flex-1 px-4 py-2 rounded-full font-medium transition-all bg-red-600 text-white button-large';
            }
        }
    },
    
    bindCompletionModalEvents() {
        const modal = document.getElementById('taskCompletionModal');
        const achievedBtn = document.getElementById('taskAchievedBtn');
        const notAchievedBtn = document.getElementById('taskNotAchievedBtn');
        const cancelBtn = document.getElementById('taskCompletionCancelBtn');
        
        if (achievedBtn) {
            achievedBtn.addEventListener('click', () => {
                const taskId = modal?.dataset?.taskId;
                if (taskId) {
                    const points = this.getSelectedPoints();
                    completeTask(parseInt(taskId), points);
                    this.hideCompletionModal();
                    showCelebration();
                    render();
                }
            });
        }
        
        if (notAchievedBtn) {
            notAchievedBtn.addEventListener('click', () => {
                this.hideCompletionModal();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideCompletionModal();
            });
        }
        
        // ポイント選択ボタン
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('completion-point-button')) {
                document.querySelectorAll('.completion-point-button').forEach(btn => {
                    btn.classList.remove('border-blue-500', 'bg-blue-50');
                    btn.classList.add('border-gray-300');
                });
                e.target.classList.remove('border-gray-300');
                e.target.classList.add('border-blue-500', 'bg-blue-50');
            }
        });
    },
    
    bindCalendarEvents() {
        const prevMonth = document.getElementById('calPrevMonth');
        const nextMonth = document.getElementById('calNextMonth');
        const closeCalendar = document.querySelector('[data-action=\"close-calendar\"]');
        
        if (prevMonth) {
            prevMonth.addEventListener('click', () => {
                const currentDate = new Date(state.selectedDate);
                currentDate.setMonth(currentDate.getMonth() - 1);
                state.selectedDate = currentDate;
                renderCalendar();
            });
        }
        
        if (nextMonth) {
            nextMonth.addEventListener('click', () => {
                const currentDate = new Date(state.selectedDate);
                currentDate.setMonth(currentDate.getMonth() + 1);
                state.selectedDate = currentDate;
                renderCalendar();
            });
        }
        
        if (closeCalendar) {
            closeCalendar.addEventListener('click', () => {
                toggleCustomCalendar();
            });
        }
        
        // カレンダートグル（スワイプメニューから）
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action=\"toggle-calendar\"]')) {
                toggleCustomCalendar();
            }
        });
    },
    
    bindSwipeMenuEvents() {
        const menuHandle = document.getElementById('menuHandle');
        const menuItems = document.getElementById('menuItems');
        
        if (menuHandle) {
            menuHandle.addEventListener('click', () => {
                if (menuItems) {
                    menuItems.classList.toggle('open');
                }
            });
        }
        
        // メニュー外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#swipeMenu') && menuItems) {
                menuItems.classList.remove('open');
            }
        });
    },
    
    getSelectedPoints() {
        const selectedBtn = document.querySelector('.completion-point-button.border-blue-500');
        return selectedBtn ? parseInt(selectedBtn.dataset.points) : 2;
    },
    
    showCompletionModal(task) {
        const modal = document.getElementById('taskCompletionModal');
        const taskText = document.getElementById('taskCompletionText');
        const pointSelector = document.getElementById('completionPointSelector');
        
        if (modal && taskText) {
            modal.dataset.taskId = task.id;
            taskText.textContent = `「${task.text}」を完了しますか？`;
            
            if (task.type === 'urgent' && pointSelector) {
                pointSelector.classList.remove('hidden');
            } else if (pointSelector) {
                pointSelector.classList.add('hidden');
            }
            
            modal.classList.remove('hidden', 'pointer-events-none');
        }
    },
    
    hideCompletionModal() {
        const modal = document.getElementById('taskCompletionModal');
        if (modal) {
            modal.classList.add('hidden', 'pointer-events-none');
            delete modal.dataset.taskId;
        }
        
        // ポイント選択をリセット
        document.querySelectorAll('.completion-point-button').forEach(btn => {
            btn.classList.remove('border-blue-500', 'bg-blue-50');
            btn.classList.add('border-gray-300');
        });
    },
    
    // ===== グローバルに公開する関数 =====
    toggleTask(taskId) {
        const result = toggleTask(taskId);
        if (result.requiresModal) {
            this.showCompletionModal(result.task);
        } else {
            if (result.task.completed) {
                showCelebration();
            }
            render();
        }
    },
    
    postponeTask(taskId) {
        postponeTask(taskId);
        showPostponeEffect();
        render();
    },
    
    deleteTask(taskId) {
        if (confirm('このタスクを削除しますか？')) {
            deleteTask(taskId);
            render();
        }
    },
    
    editTask(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            const newText = prompt('タスクを編集:', task.text);
            if (newText && newText.trim() && newText.trim() !== task.text) {
                editTask(taskId, newText.trim());
                render();
            }
        }
    },
    
    // AI関連
    generateDailyAIComment() {
        generateDailyAIComment().then(() => {
            render();
        }).catch((error) => {
            showError(`AIコメントの生成に失敗しました: ${error.message}`);
        });
    },
    
    deleteDailyAIComment() {
        deleteDailyAIComment();
        render();
    },
    
    // 習慣・チャレンジ関連（プレースホルダー）
    toggleHabit(habitId, date) {
        // 習慣の切り替え処理（habits.jsと連携）
        console.log('Toggle habit:', habitId, date);
    },
    
    toggleSeasonalChallenge(challengeId, date) {
        // 季節のチャレンジの切り替え処理
        console.log('Toggle seasonal challenge:', challengeId, date);
    }
};

// ===== アプリケーションの初期化 =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    app.init();
    
    // デバッグ用：グローバルに公開
    window.app = app;
    window.debugApp = () => {
        console.log('Habit data:', localStorage.getItem('habit_tasks'));
        console.log('App state:', {
            tasks: state.tasks,
            totalPoints: state.totalPoints
        });
    };
});

// 既存のスクリプトとの互換性のため、グローバルオブジェクトとしても公開
window.app = app;

export default app;