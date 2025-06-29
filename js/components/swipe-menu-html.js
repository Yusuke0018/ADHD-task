// スワイプメニューの共通HTML生成
function getSwipeMenuHTML() {
    return `
    <!-- スワイプメニュー -->
    <div id="swipeMenu" class="fixed left-0 top-0 bottom-0 w-8 z-50">
        <!-- メニューオープンエリア -->
        <div id="menuHandle" class="absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-32 cursor-pointer">
            <div class="w-full h-full bg-gradient-to-r from-gray-800 to-transparent opacity-30 rounded-r-full"></div>
        </div>
        
        <!-- メニューアイテム -->
        <div id="menuItems" class="fixed left-0 top-1/2 transform -translate-y-1/2 -translate-x-full transition-transform duration-300">
            <div class="bg-gray-800 rounded-r-2xl shadow-2xl p-2 space-y-2">
                <a href="index.html" class="menu-item block w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center transition-all hover:bg-blue-500" title="ホーム">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                </a>
                <a href="statistics.html" class="menu-item block w-12 h-12 bg-green-600 rounded-full flex items-center justify-center transition-all hover:bg-green-500" title="統計">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </a>
                <a href="ai-comments.html" class="menu-item block w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center transition-all hover:bg-indigo-500" title="AIコメント">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                </a>
                <button onclick="${window.location.pathname.includes('habits.html') ? 'if(window.app)' : ''} app.toggleCustomCalendar(true)" class="menu-item block w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center transition-all hover:bg-amber-500" title="カレンダー">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </button>
                <a href="projects.html" class="menu-item block w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center transition-all hover:bg-orange-500" title="プロジェクト">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 22v-8h6v8"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01"></path>
                        <circle cx="12" cy="16" r="1" fill="currentColor"></circle>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v4"></path>
                    </svg>
                </a>
                <a href="habits.html" class="menu-item block w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center transition-all hover:bg-purple-500" title="習慣">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </a>
                <a href="settings.html" class="menu-item block w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center transition-all hover:bg-gray-500" title="設定">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                </a>
            </div>
        </div>
    </div>`;
}

// スワイプメニューの初期化スクリプト
function initSwipeMenu() {
    const menuHandle = document.getElementById('menuHandle');
    const menuItems = document.getElementById('menuItems');
    
    if (menuHandle && menuItems) {
        menuHandle.addEventListener('click', () => {
            menuItems.classList.toggle('open');
        });
        
        // メニュー外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#swipeMenu')) {
                menuItems.classList.remove('open');
            }
        });
    }
}

// DOMロード時に自動的にメニューを挿入（body直下に追加）
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // 既存のメニューがあれば削除
        const existingMenu = document.getElementById('swipeMenu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // 新しいメニューを挿入
        document.body.insertAdjacentHTML('afterbegin', getSwipeMenuHTML());
        
        // 初期化
        initSwipeMenu();
    });
}