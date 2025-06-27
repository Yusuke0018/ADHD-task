// スワイプメニューの共通機能
const swipeMenu = {
    isMenuOpen: false,
    touchStartX: 0,
    
    init() {
        const menuHandle = document.getElementById('menuHandle');
        const menuItems = document.getElementById('menuItems');
        
        if (!menuHandle || !menuItems) return;
        
        // メニューアイテムのクリックイベントを設定
        const menuLinks = menuItems.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                // メニューを閉じる
                this.closeMenu();
            });
        });
        
        // タッチイベント
        menuHandle.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
        });
        
        menuHandle.addEventListener('touchmove', (e) => {
            const touchX = e.touches[0].clientX;
            const diff = touchX - this.touchStartX;
            
            if (diff > 30 && !this.isMenuOpen) {
                this.openMenu();
            }
        });
        
        // クリックイベント
        menuHandle.addEventListener('click', () => {
            this.toggleMenu();
        });
        
        // メニュー外をクリックしたら閉じる
        document.addEventListener('click', (e) => {
            if (!menuHandle.contains(e.target) && !menuItems.contains(e.target) && this.isMenuOpen) {
                this.closeMenu();
            }
        });
        
        // ページ離脱時にメニューを閉じる
        window.addEventListener('beforeunload', () => {
            this.closeMenu();
        });
    },
    
    openMenu() {
        const menuItems = document.getElementById('menuItems');
        if (menuItems) {
            menuItems.classList.add('open');
            this.isMenuOpen = true;
        }
    },
    
    closeMenu() {
        const menuItems = document.getElementById('menuItems');
        if (menuItems) {
            menuItems.classList.remove('open');
            this.isMenuOpen = false;
        }
    },
    
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
};

// DOMContentLoadedで初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => swipeMenu.init());
} else {
    swipeMenu.init();
}