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

    // ===== 日付処理ユーティリティ関数 =====
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
    },

    // 2つの日付の差分（日数）を計算
    getDaysDifference(dateYmd1, dateYmd2) {
        const date1 = new Date(dateYmd1);
        const date2 = new Date(dateYmd2);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    init() {
        // console.log('App initializing...');
        
        // タッチデバイスのデバッグ情報
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        // console.log('Touch device:', isTouchDevice);
        // console.log('User Agent:', navigator.userAgent);
        
        this.loadData();
        this.bindEvents();
        this.updateSekki();
        this.render(); // 追加：初期表示のため
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