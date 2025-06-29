// タッチイベントのデバッグヘルパー
(function() {
    let debugMode = true; // デバッグモードの有効/無効
    let touchLog = [];
    
    // デバッグ情報を画面に表示
    function createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'touch-debug-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            font-size: 12px;
            max-width: 300px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 10000;
            font-family: monospace;
            border-radius: 5px;
        `;
        document.body.appendChild(panel);
        return panel;
    }
    
    function log(message) {
        if (!debugMode) return;
        
        const time = new Date().toLocaleTimeString();
        touchLog.push(`[${time}] ${message}`);
        
        // 最新の10件のみ保持
        if (touchLog.length > 10) {
            touchLog.shift();
        }
        
        const panel = document.getElementById('touch-debug-panel') || createDebugPanel();
        panel.innerHTML = touchLog.join('<br>');
    }
    
    // グローバルなタッチイベントリスナー
    document.addEventListener('touchstart', function(e) {
        const target = e.target;
        const button = target.closest('button');
        log(`Touch: ${target.tagName}.${target.className}`);
        if (button) {
            log(`Button found: ${button.dataset.action || 'no-action'}`);
        }
    }, true);
    
    document.addEventListener('click', function(e) {
        const target = e.target;
        const button = target.closest('button');
        log(`Click: ${target.tagName}.${target.className}`);
        if (button) {
            log(`Button clicked: ${button.dataset.action || 'no-action'}`);
        }
    }, true);
    
    // タッチイベントの詳細情報
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            log(`Pos: ${Math.round(touch.clientX)},${Math.round(touch.clientY)}`);
        }
    }, true);
    
    // window.touchDebugでデバッグモードの切り替え
    window.touchDebug = {
        enable: () => { debugMode = true; log('Debug enabled'); },
        disable: () => { debugMode = false; },
        clear: () => { touchLog = []; }
    };
})();