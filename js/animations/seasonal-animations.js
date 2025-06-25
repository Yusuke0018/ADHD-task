const SEKKI_ANIMATIONS = {
    // 冬
    '小寒': { type: 'snow', count: 30, colors: ['#FFFFFF', '#E0FFFF', '#F0F8FF'] },
    '大寒': { type: 'snow', count: 50, colors: ['#FFFFFF', '#DDEEFF', '#C6E2FF'] },
    '立冬': { type: 'leaf', count: 20, colors: ['#A0522D', '#8B4513', '#D2691E'] },
    '小雪': { type: 'snow', count: 20, colors: ['#FFFFFF', '#F5F5F5', '#E6E6FA'] },
    '大雪': { type: 'snow', count: 40, colors: ['#FFFFFF', '#FFFAFA', '#F0FFFF'] },
    '冬至': { type: 'sparkle', count: 40, colors: ['#FFD700', '#FFA500', '#FFFAF0'] },

    // 春
    '立春': { type: 'petal', count: 25, colors: ['#FFB6C1', '#FFC0CB', '#FF69B4'] },
    '雨水': { type: 'petal', count: 30, colors: ['#ADD8E6', '#B0E0E6', '#87CEFA'] }, // 雨粒を花びらで表現
    '啓蟄': { type: 'leaf', count: 20, colors: ['#9ACD32', '#ADFF2F', '#7CFC00'] },
    '春分': { type: 'petal', count: 35, colors: ['#FFC0CB', '#FFB6C1', '#DB7093'] },
    '清明': { type: 'petal', count: 30, colors: ['#AFEEEE', '#E0FFFF', '#00CED1'] },
    '穀雨': { type: 'petal', count: 40, colors: ['#87CEEB', '#ADD8E6', '#B0C4DE'] }, // 雨粒を花びらで表現

    // 夏
    '立夏': { type: 'leaf', count: 30, colors: ['#32CD32', '#00FF00', '#7FFF00'] },
    '小満': { type: 'sparkle', count: 30, colors: ['#FFFF00', '#FFFACD', '#FFD700'] },
    '芒種': { type: 'leaf', count: 40, colors: ['#556B2F', '#6B8E23', '#808000'] },
    '夏至': { type: 'sparkle', count: 50, colors: ['#FF4500', '#FFD700', '#FFA500'] },
    '小暑': { type: 'sparkle', count: 40, colors: ['#4682B4', '#5F9EA0', '#00BFFF'] },
    '大暑': { type: 'sparkle', count: 60, colors: ['#FF6347', '#FF4500', '#FF0000'] },

    // 秋
    '立秋': { type: 'leaf', count: 25, colors: ['#CD853F', '#D2B48C', '#F4A460'] },
    '処暑': { type: 'leaf', count: 30, colors: ['#DAA520', '#B8860B', '#CD853F'] },
    '白露': { type: 'sparkle', count: 20, colors: ['#F0F8FF', '#F8F8FF', '#FFFFFF'] },
    '秋分': { type: 'leaf', count: 35, colors: ['#DC143C', '#B22222', '#FF4500'] },
    '寒露': { type: 'leaf', count: 30, colors: ['#6A5ACD', '#836FFF', '#9370DB'] },
    '霜降': { type: 'sparkle', count: 25, colors: ['#E6E6FA', '#D8BFD8', '#DDA0DD'] },
};

function getAnimationClass(type) {
    switch (type) {
        case 'snow': return 'snow-flake';
        case 'petal': return 'petal';
        case 'sparkle': return 'light-particle';
        case 'leaf': return 'autumn-leaf';
        default: return '';
    }
}

function createSeasonalAnimation(sekki) {
    const animationContainer = document.getElementById('seasonAnimation');
    if (!animationContainer) return;
    animationContainer.innerHTML = '';

    const config = SEKKI_ANIMATIONS[sekki];
    if (!config) return;

    const isMobile = window.innerWidth <= 768;
    const count = isMobile ? Math.floor(config.count * 0.7) : config.count;

    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        const animationClass = getAnimationClass(config.type);
        el.className = `animated-element ${animationClass}`;

        const size = Math.random() * (isMobile ? 12 : 20) + 5;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;

        el.style.left = `${Math.random() * 100}vw`;
        el.style.setProperty('--x-start', `${Math.random() * 100}vw`);
        el.style.setProperty('--x-end', `${Math.random() * 100}vw`);

        const duration = Math.random() * 5 + 8; // 8s to 13s
        el.style.animationDuration = `${duration}s`;
        el.style.animationDelay = `${Math.random() * duration}s`;

        if (config.colors && config.colors.length > 0) {
            el.style.backgroundColor = config.colors[Math.floor(Math.random() * config.colors.length)];
        }
        
        // 葉っぱの色をグラデーションにする
        if (config.type === 'leaf') {
            const color1 = config.colors[Math.floor(Math.random() * config.colors.length)];
            const color2 = config.colors[Math.floor(Math.random() * config.colors.length)];
            el.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
        }

        animationContainer.appendChild(el);
    }
}
