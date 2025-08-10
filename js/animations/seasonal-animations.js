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

    setConfig({ type, colors, count }) {
        this.type = type;
        this.colors = colors && colors.length ? colors : ['#fff'];
        const isMobile = window.innerWidth <= 768;
        const baseCount = isMobile ? Math.floor(count * 0.8) : count;

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
        const size = this.rand(typeSize[this.type].min, typeSize[this.type].max) * layer.depth;
        const speed = this.rand(typeSpeed[this.type].min, typeSpeed[this.type].max) * layer.depth;
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
            const sway = Math.sin((now / 1000) + p.y * 0.01 + p.x * 0.005) * 0.4;
            p.vx += (this.wind * 0.002 + sway * 0.002);
            p.x += p.vx * p.layer.depth;
            p.y += p.vy * (dt / 16) * 0.6;
            p.rot += p.rotSpeed * (dt / 16);

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
            this.drawParticle(p);
        }

        requestAnimationFrame(this.loop);
    }

    drawParticle(p) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        const color = p.color;
        switch (this.type) {
            case 'snow':
                this.drawSnow(ctx, p.size, color);
                break;
            case 'petal':
                this.drawPetal(ctx, p.size, color);
                break;
            case 'leaf':
                this.drawLeaf(ctx, p.size, color);
                break;
            case 'sparkle':
                this.drawSparkle(ctx, p.size, color);
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
};

const typeSpeed = {
    snow: { min: 0.3, max: 0.8 },
    petal: { min: 0.5, max: 1.2 },
    leaf: { min: 0.6, max: 1.4 },
    sparkle: { min: 0.2, max: 0.6 },
};

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
