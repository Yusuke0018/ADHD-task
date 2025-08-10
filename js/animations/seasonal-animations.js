const SEKKI_ANIMATIONS = {
    // 冬: 雪 + きらめき
    '小寒': { types: ['snow','sparkle'], count: 36, colors: ['#FFFFFF', '#E0FFFF', '#F0F8FF'] },
    '大寒': { types: ['snow','sparkle'], count: 56, colors: ['#FFFFFF', '#DDEEFF', '#C6E2FF'] },
    '立冬': { types: ['leaf','sparkle'], count: 28, colors: ['#A0522D', '#8B4513', '#D2691E'] },
    '小雪': { types: ['snow'], count: 28, colors: ['#FFFFFF', '#F5F5F5', '#E6E6FA'] },
    '大雪': { types: ['snow'], count: 52, colors: ['#FFFFFF', '#FFFAFA', '#F0FFFF'] },
    '冬至': { types: ['sparkle','snow'], count: 44, colors: ['#FFD700', '#FFA500', '#FFFAF0'] },

    // 春: 花びら + 若葉 + 時々きらめき
    '立春': { types: ['petal','sparkle'], count: 34, colors: ['#FFB6C1', '#FFC0CB', '#FF69B4'] },
    '雨水': { types: ['raindrop','petal'], count: 42, colors: ['#ADD8E6', '#B0E0E6', '#87CEFA'] },
    '啓蟄': { types: ['leaf','petal'], count: 30, colors: ['#9ACD32', '#ADFF2F', '#7CFC00'] },
    '春分': { types: ['petal','sparkle'], count: 40, colors: ['#FFC0CB', '#FFB6C1', '#DB7093'] },
    '清明': { types: ['petal','bubble'], count: 36, colors: ['#AFEEEE', '#E0FFFF', '#00CED1'] },
    '穀雨': { types: ['raindrop','leaf'], count: 48, colors: ['#87CEEB', '#ADD8E6', '#B0C4DE'] },

    // 夏: 葉 + ホタル + 強いきらめき
    '立夏': { types: ['leaf','sparkle'], count: 34, colors: ['#32CD32', '#00FF00', '#7FFF00'] },
    '小満': { types: ['sparkle','firefly'], count: 40, colors: ['#FFFF00', '#FFFACD', '#FFD700'] },
    '芒種': { types: ['leaf','seed'], count: 44, colors: ['#556B2F', '#6B8E23', '#808000'] },
    '夏至': { types: ['sparkle','firefly'], count: 54, colors: ['#FF4500', '#FFD700', '#FFA500'] },
    '小暑': { types: ['sparkle','firefly'], count: 46, colors: ['#4682B4', '#5F9EA0', '#00BFFF'] },
    '大暑': { types: ['sparkle','firefly'], count: 64, colors: ['#FF6347', '#FF4500', '#FF0000'] },

    // 秋: 落ち葉 + 露（バブル/きらめき）
    '立秋': { types: ['leaf','sparkle'], count: 32, colors: ['#CD853F', '#D2B48C', '#F4A460'] },
    '処暑': { types: ['leaf','seed'], count: 38, colors: ['#DAA520', '#B8860B', '#CD853F'] },
    '白露': { types: ['bubble','sparkle'], count: 28, colors: ['#F0F8FF', '#F8F8FF', '#FFFFFF'] },
    '秋分': { types: ['leaf','sparkle'], count: 42, colors: ['#DC143C', '#B22222', '#FF4500'] },
    '寒露': { types: ['raindrop','leaf'], count: 36, colors: ['#6A5ACD', '#836FFF', '#9370DB'] },
    '霜降': { types: ['sparkle','snow'], count: 30, colors: ['#E6E6FA', '#D8BFD8', '#DDA0DD'] },
};

// キャンバスベースの滑らかな季節アニメーション
class SeasonAnimator {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.inset = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.container.innerHTML = '';
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.type = 'snow';
        this.types = null; // ['snow','petal',...] が入る場合あり
        this.colors = ['#fff'];
        this.running = false;
        this.wind = 0; // 風（-1.5〜1.5程度）
        this.transitionAlpha = 0; // フェードイン用
        this.lastTime = 0;
        this.resize = this.resize.bind(this);
        this.loop = this.loop.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();
        this.startWindGusts();
    }

    startWindGusts() {
        // 5〜10秒ごとに風をゆっくり変化させる
        setInterval(() => {
            const target = (Math.random() - 0.5) * 3; // -1.5〜1.5
            const start = this.wind;
            const duration = 3000 + Math.random() * 3000;
            const startTime = performance.now();
            const tick = () => {
                const t = Math.min(1, (performance.now() - startTime) / duration);
                // イージング
                const eased = t * (2 - t);
                this.wind = start + (target - start) * eased;
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }, 5000 + Math.random() * 5000);
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = Math.floor(rect.width * dpr);
        this.canvas.height = Math.floor(rect.height * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setConfig({ type, types, colors, count }) {
        this.type = type || null;
        this.types = Array.isArray(types) && types.length ? types : null;
        this.colors = colors && colors.length ? colors : ['#fff'];
        const isMobile = window.innerWidth <= 768;
        const baseCount = isMobile ? Math.min(Math.floor(count * 1.2), 90) : count;
        this.sizeMultiplier = isMobile ? 1.25 : 1.0;

        // レイヤー別のパーティクルを生成（奥行きを表現）
        const layers = [
            { depth: 0.5, opacity: 0.5, count: Math.floor(baseCount * 0.4) },
            { depth: 1.0, opacity: 0.8, count: Math.floor(baseCount * 0.45) },
            { depth: 1.6, opacity: 1.0, count: Math.floor(baseCount * 0.3) },
        ];

        const particles = [];
        layers.forEach(layer => {
            for (let i = 0; i < layer.count; i++) {
                particles.push(this.makeParticle(layer));
            }
        });
        this.particles = particles;
        this.transitionAlpha = 0; // フェードインの開始
        if (!this.running) {
            this.running = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.loop);
        }
    }

    makeParticle(layer) {
        const w = this.canvas.clientWidth || this.container.clientWidth;
        const h = this.canvas.clientHeight || this.container.clientHeight;
        const chosenType = this.types ? this.types[Math.floor(Math.random()*this.types.length)] : (this.type || 'snow');
        const size = this.rand(typeSize[chosenType].min, typeSize[chosenType].max) * layer.depth * (this.sizeMultiplier || 1);
        const speed = this.rand(typeSpeed[chosenType].min, typeSpeed[chosenType].max) * layer.depth;
        const angle = Math.random() * Math.PI * 2;
        return {
            layer,
            x: Math.random() * w,
            y: Math.random() * h,
            vx: Math.cos(angle) * 0.1, // 初期の水平微動
            vy: speed,
            size,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: this.rand(-0.02, 0.02) * layer.depth,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            life: this.rand(0.2, 1),
            type: chosenType,
            mode: pickModeForType(chosenType),
        };
    }

    loop(now) {
        if (!this.running) return;
        const dt = Math.min(50, now - this.lastTime);
        this.lastTime = now;

        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, w, h);

        // フェードイン
        if (this.transitionAlpha < 1) {
            this.transitionAlpha = Math.min(1, this.transitionAlpha + dt / 800);
        }
        this.ctx.globalAlpha = this.transitionAlpha;

        for (let p of this.particles) {
            // 風とゆらぎ
            const t = now / 1000;
            const sway = Math.sin(t + p.y * 0.01 + p.x * 0.005) * 0.4;
            // モード別の動き
            switch (p.mode) {
                case 'swirl': {
                    const r = 12 + p.size * 0.8;
                    p.vx = Math.cos(t + p.y * 0.005) * 0.3 + this.wind * 0.002;
                    p.vy = Math.sin(t * 0.7) * 0.2 + Math.abs(p.vy) * 0.6;
                    p.x += p.vx * p.layer.depth;
                    p.y += (p.vy + 0.2) * (dt / 16) * 0.8;
                    p.rot += p.rotSpeed * (dt / 16) + 0.01;
                    break;
                }
                case 'wander': { // ホタルなどの徘徊
                    const turn = Math.sin(t * 0.8 + p.x * 0.01) * 0.02;
                    p.vx += (this.wind * 0.001 + turn);
                    p.vy += Math.cos(t * 1.1 + p.y * 0.01) * 0.01;
                    p.x += p.vx * 0.8;
                    p.y += p.vy * 0.8;
                    p.rot += p.rotSpeed * 0.5;
                    break;
                }
                case 'rise': { // バブル上昇
                    p.vx += (this.wind * 0.001 + Math.sin(t + p.x * 0.01) * 0.002);
                    p.x += p.vx * p.layer.depth;
                    p.y -= Math.abs(p.vy) * 0.5; // 上へ
                    p.rot += p.rotSpeed * 0.3;
                    break;
                }
                case 'fall':
                default: {
                    p.vx += (this.wind * 0.002 + sway * 0.002);
                    p.x += p.vx * p.layer.depth;
                    p.y += p.vy * (dt / 16) * 0.6;
                    p.rot += p.rotSpeed * (dt / 16);
                }
            }

            // 画面外に出たら再配置（上から降ってくる）
            if (p.y - p.size > h) {
                p.y = -p.size;
                p.x = Math.random() * w;
                p.vx = (Math.random() - 0.5) * 0.2;
            }
            if (p.x < -p.size) p.x = w + p.size;
            if (p.x > w + p.size) p.x = -p.size;

            // レイヤーごとの透明度
            this.ctx.globalAlpha = this.transitionAlpha * p.layer.opacity;
            this.drawParticle(p, now);
        }

        requestAnimationFrame(this.loop);
    }

    drawParticle(p, now) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        const color = p.color;
        switch (p.type || this.type) {
            case 'snow':
                Math.random() < 0.15 ? this.drawSnowStar(ctx, p.size, color) : this.drawSnow(ctx, p.size, color);
                break;
            case 'petal':
                this.drawPetal(ctx, p.size, color);
                break;
            case 'leaf':
                this.drawLeaf(ctx, p.size, color);
                break;
            case 'sparkle': {
                const blink = 0.75 + 0.25 * (0.5 + 0.5*Math.sin(now/300 + p.x*0.02));
                ctx.globalAlpha *= blink;
                this.drawSparkle(ctx, p.size, color);
                break;
            }
            case 'raindrop':
                this.drawRaindrop(ctx, p.size, color);
                break;
            case 'firefly': {
                const blink = 0.6 + 0.4 * (0.5 + 0.5*Math.sin(now/500 + p.y*0.03));
                ctx.globalAlpha *= blink;
                this.drawFirefly(ctx, p.size, color);
                break;
            }
            case 'bubble':
                this.drawBubble(ctx, p.size, color);
                break;
            case 'seed':
                this.drawSeed(ctx, p.size, color);
                break;
            default:
                this.drawSnow(ctx, p.size, color);
        }
        ctx.restore();
    }

    drawSnow(ctx, r, color) {
        // やわらかい発光の雪
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grd.addColorStop(0, color);
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPetal(ctx, s, color) {
        // 楕円の花びらを2枚重ねて柔らかい形に
        ctx.fillStyle = color;
        this.drawEllipse(ctx, 0, 0, s * 0.6, s * 1.2, 0);
        ctx.globalAlpha *= 0.8;
        this.drawEllipse(ctx, 0, -s * 0.1, s * 0.5, s * 1.0, Math.PI / 6);
    }

    drawLeaf(ctx, s, color) {
        // シンプルな葉っぱ形状（菱形に丸み）
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(s * 0.8, -s * 0.2, 0, s);
        ctx.quadraticCurveTo(-s * 0.8, -s * 0.2, 0, -s);
        ctx.closePath();
        ctx.fill();
    }

    drawSparkle(ctx, s, color) {
        // きらめく粒（十字のグロー）
        ctx.fillStyle = color;
        ctx.globalAlpha *= 0.9;
        this.drawGlow(ctx, 0, 0, s * 1.4, color, 0.35);
        ctx.globalAlpha *= 0.9;
        this.drawGlow(ctx, 0, 0, s * 0.8, color, 0.6);
        ctx.fillRect(-s * 0.05, -s, s * 0.1, s * 2);
        ctx.fillRect(-s, -s * 0.05, s * 2, s * 0.1);
    }

    drawSnowStar(ctx, s, color) {
        ctx.strokeStyle = this.hexToRgba(color, 0.9);
        ctx.lineWidth = Math.max(1, s * 0.12);
        for (let i=0;i<3;i++) {
            ctx.rotate(Math.PI/3);
            ctx.beginPath();
            ctx.moveTo(-s, 0);
            ctx.lineTo(s, 0);
            ctx.stroke();
        }
    }

    drawRaindrop(ctx, s, color) {
        ctx.strokeStyle = this.hexToRgba(color, 0.8);
        ctx.lineWidth = Math.max(1, s * 0.12);
        ctx.beginPath();
        ctx.moveTo(0, -s*1.6);
        ctx.lineTo(0, s*1.6);
        ctx.stroke();
    }

    drawFirefly(ctx, s, color) {
        this.drawGlow(ctx, 0, 0, s*2.0, color, 0.35);
        this.drawGlow(ctx, 0, 0, s*1.2, color, 0.6);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0,0, Math.max(1, s*0.4), 0, Math.PI*2);
        ctx.fill();
    }

    drawBubble(ctx, s, color) {
        ctx.strokeStyle = this.hexToRgba(color, 0.5);
        ctx.lineWidth = Math.max(1, s * 0.1);
        ctx.beginPath();
        ctx.arc(0,0, s, 0, Math.PI*2);
        ctx.stroke();
    }

    drawSeed(ctx, s, color) {
        // 綿毛のような種
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, s*0.2, s*0.25, s*0.5, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = this.hexToRgba(color, 0.7);
        ctx.lineWidth = Math.max(1, s*0.08);
        ctx.beginPath();
        ctx.moveTo(0, -s*0.8);
        ctx.lineTo(0, s*0.2);
        ctx.stroke();
    }

    drawEllipse(ctx, x, y, rx, ry, rot) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.scale(1, ry / rx);
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.restore();
        ctx.fill();
    }

    drawGlow(ctx, x, y, r, color, alpha = 0.5) {
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        const rgba = this.hexToRgba(color, alpha);
        grd.addColorStop(0, rgba);
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    hexToRgba(hex, a) {
        if (hex.startsWith('rgb')) return hex; // already rgb(a)
        const c = hex.replace('#', '');
        const bigint = parseInt(c.length === 3 ? c.split('').map(ch => ch + ch).join('') : c, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r},${g},${b},${a})`;
    }

    rand(min, max) { return Math.random() * (max - min) + min; }
}

const typeSize = {
    snow: { min: 1.8, max: 3.6 },
    petal: { min: 4, max: 10 },
    leaf: { min: 4, max: 10 },
    sparkle: { min: 1.5, max: 3.5 },
    raindrop: { min: 3, max: 5 },
    firefly: { min: 1.5, max: 3.2 },
    bubble: { min: 3, max: 7 },
    seed: { min: 3, max: 6 },
};

const typeSpeed = {
    snow: { min: 0.3, max: 0.8 },
    petal: { min: 0.5, max: 1.2 },
    leaf: { min: 0.6, max: 1.4 },
    sparkle: { min: 0.2, max: 0.6 },
    raindrop: { min: 1.6, max: 3.0 },
    firefly: { min: 0.05, max: 0.15 },
    bubble: { min: 0.15, max: 0.35 },
    seed: { min: 0.4, max: 0.9 },
};

function pickModeForType(t) {
    switch (t) {
        case 'petal':
        case 'leaf':
        case 'seed': {
            return Math.random() < 0.5 ? 'swirl' : 'fall';
        }
        case 'bubble':
            return 'rise';
        case 'firefly':
            return 'wander';
        case 'raindrop':
        case 'snow':
        default:
            return 'fall';
    }
}

function createSeasonalAnimation(sekki) {
    const container = document.getElementById('seasonAnimation');
    if (!container) return;
    if (!window._seasonAnimator) {
        window._seasonAnimator = new SeasonAnimator(container);
    }
    const cfg = SEKKI_ANIMATIONS[sekki];
    if (!cfg) return;
    window._seasonAnimator.setConfig(cfg);
}
