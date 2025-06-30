// ===== ADHD-Task管理アプリケーション - メインファイル =====

// モジュールのインポート
import { dateUtils } from './utils/dateUtils.js';
import { storageManager } from './utils/storageManager.js';
import { sekkiManager } from './managers/sekkiManager.js';
import { taskManager } from './managers/taskManager.js';
import { uiManager } from './managers/uiManager.js';
import { reflectionManager } from './managers/reflectionManager.js';

// 外部データのインポート
import { sekkiData } from './data/sekki-data.js';

// ページ読み込み完了後の処理
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        app.updateSekki();
        uiManager.updateTodayDisplay();
    });
} else {
    // 既に読み込み完了している場合
    app.updateSekki();
    uiManager.updateTodayDisplay();
}

const app = {
    // アプリケーション状態
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
    expandedSeasonalChallengeId: null,
    lastSwipeTime: 0,

    // 初期化
    init() {
        storageManager.loadData(this);
        this.bindEvents();
        this.updateSekki();
        this.render();
        
        // スマホ対応：確実に表示
        requestAnimationFrame(() => {
            uiManager.updateTodayDisplay();
        });
        setTimeout(() => uiManager.updateTodayDisplay(), 500);
        window.addEventListener('orientationchange', () => uiManager.updateTodayDisplay());
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                uiManager.updateTodayDisplay();
            }
        });
    },

    // 節気更新
    updateSekki() {
        const result = sekkiManager.updateSekki(sekkiData);
        this.render();
        setTimeout(() => uiManager.updateTodayDisplay(), 100);
    },

    updateYearSekkiList() {
        sekkiManager.updateYearSekkiList(sekkiData, this.selectedDate);
    },

    showSekkiDetail(sekki) {
        sekkiManager.showSekkiDetail(sekki);
    },

    isCurrentSekki(sekkiToCheck, referenceDate) {
        return sekkiManager.isCurrentSekki(sekkiToCheck, referenceDate, sekkiData);
    },

    updateCalendarSekkiInfo() {
        sekkiManager.updateCalendarSekkiInfo(sekkiData);
    },

    updateSekkiForSelectedDate() {
        sekkiManager.updateSekkiForSelectedDate(this.selectedDate, sekkiData);
    },

    // イベントバインディング
    bindEvents() {
        // タスクタイプ変更
        document.getElementById('normalType')?.addEventListener('click', () => taskManager.setTaskType(this, 'normal'));
        document.getElementById('urgentType')?.addEventListener('click', () => taskManager.setTaskType(this, 'urgent'));
        
        // タスク追加
        document.getElementById('addTaskBtn')?.addEventListener('click', () => taskManager.addTask(this, uiManager, storageManager));
        document.getElementById('taskInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                taskManager.addTask(this, uiManager, storageManager);
            }
        });

        // 日付ナビゲーション
        document.getElementById('prevDay')?.addEventListener('click', () => this.navigateDate(-1));
        document.getElementById('nextDay')?.addEventListener('click', () => this.navigateDate(1));
        document.getElementById('todayBtn')?.addEventListener('click', () => this.goToToday());

        // 振り返り機能
        document.getElementById('addReflectionBtn')?.addEventListener('click', () => reflectionManager.toggleReflection(this));
        document.getElementById('saveReflectionBtn')?.addEventListener('click', () => reflectionManager.saveReflection(this, storageManager));
        document.getElementById('cancelReflectionBtn')?.addEventListener('click', () => reflectionManager.toggleReflection(this));

        // タスク完了モーダル
        document.getElementById('achievedBtn')?.addEventListener('click', () => taskManager.completeTask(this, true, uiManager, storageManager));
        document.getElementById('notAchievedBtn')?.addEventListener('click', () => taskManager.completeTask(this, false, uiManager, storageManager));
        document.getElementById('cancelCompletionBtn')?.addEventListener('click', () => taskManager.closeTaskCompletionModal());

        // ポイント選択ボタン
        document.querySelectorAll('.completion-point-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const points = parseInt(btn.dataset.points);
                taskManager.selectCompletionPoints(points);
            });
        });

        // プロジェクトポイント選択ボタン
        document.querySelectorAll('.project-point-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const points = parseInt(btn.dataset.projectPoints);
                taskManager.selectProjectPoints(points);
            });
        });

        // プロジェクト進捗チェックボックス
        document.getElementById('assignToProject')?.addEventListener('change', (e) => {
            const projectSelectionArea = document.getElementById('projectSelectionArea');
            if (e.target.checked) {
                projectSelectionArea.classList.remove('hidden');
            } else {
                projectSelectionArea.classList.add('hidden');
            }
        });
    },

    // 日付ナビゲーション
    navigateDate(days) {
        const newDate = new Date(this.selectedDate);
        newDate.setDate(newDate.getDate() + days);
        this.selectedDate = newDate;
        this.updateSekkiForSelectedDate();
        this.render();
    },

    goToToday() {
        const today = new Date();
        this.selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        this.updateSekkiForSelectedDate();
        this.render();
    },

    selectDate(dateString) {
        this.selectedDate = new Date(dateString);
        this.updateSekkiForSelectedDate();
        this.render();
    },

    // タスク管理（デリゲート）
    setTaskType(type) {
        taskManager.setTaskType(this, type);
    },

    addTask() {
        taskManager.addTask(this, uiManager, storageManager);
    },

    getTodayTasks() {
        return taskManager.getTodayTasks(this);
    },

    toggleTask(taskId) {
        taskManager.toggleTask(this, taskId, uiManager, storageManager);
    },

    showTaskCompletionModal(taskId) {
        taskManager.showTaskCompletionModal(this, taskId);
    },

    completeTask(isAchieved) {
        taskManager.completeTask(this, isAchieved, uiManager, storageManager);
    },

    closeTaskCompletionModal() {
        taskManager.closeTaskCompletionModal();
    },

    postponeTask(taskId) {
        taskManager.postponeTask(this, taskId, uiManager, storageManager);
    },

    deleteTask(taskId) {
        taskManager.deleteTask(this, taskId, storageManager);
    },

    editTask(taskId) {
        taskManager.editTask(this, taskId, storageManager);
    },

    // 振り返り機能（デリゲート）
    toggleReflection() {
        reflectionManager.toggleReflection(this);
    },

    saveReflection() {
        reflectionManager.saveReflection(this, storageManager);
    },

    renderReflection() {
        reflectionManager.renderReflection(this);
    },

    // UI機能（デリゲート）
    showError(message) {
        uiManager.showError(message);
    },

    showCelebration() {
        uiManager.showCelebration();
    },

    showSuccessNotification(message) {
        uiManager.showSuccessNotification(message);
    },

    showPostponeEffect() {
        uiManager.showPostponeEffect();
    },

    updateTodayDisplay() {
        uiManager.updateTodayDisplay();
    },

    updateDailyStatusIndicators() {
        uiManager.updateDailyStatusIndicators(this);
    },

    // メイン描画関数
    render() {
        // 選択された日付の表示を更新
        const selectedDateDisplay = document.getElementById('selectedDate');
        if (selectedDateDisplay) {
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
            };
            selectedDateDisplay.textContent = this.selectedDate.toLocaleDateString('ja-JP', options);
        }

        // タスクの描画
        uiManager.renderTasks(this);

        // 振り返りの描画
        this.renderReflection();

        // 日次ステータスインジケーターの更新
        this.updateDailyStatusIndicators();

        // TODO: 習慣、チャレンジ、AI、カレンダーの描画
        // これらは後で実装予定
    },

    // データ管理（デリゲート）
    loadData() {
        storageManager.loadData(this);
    },

    saveData() {
        storageManager.saveData(this);
    },

    cleanText(text) {
        return storageManager.cleanText(text);
    }
};

// グローバルアクセス用
window.app = app;

// アプリケーション初期化
app.init();

// デフォルトエクスポート
export default app;