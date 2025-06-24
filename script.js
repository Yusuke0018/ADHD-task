// 実際の季節を月から判定する関数
function getActualSeason(date) {
    const month = date.getMonth() + 1; // 0-11 を 1-12 に変換
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
}

document.addEventListener('DOMContentLoaded', function() {
    app.updateSekki();
    app.updateTodayDisplay();
});

const sekkiData = { // Sekki data remains the same
    2025: [
        { name: '小寒', date: new Date('2025-01-05T11:33:00'), season: 'winter', description: '寒さが最も厳しくなる前の時期。この日から寒の入りとなります。' },
        { name: '大寒', date: new Date('2025-01-20T05:00:00'), season: 'winter', description: '一年で最も寒さが厳しい時期。寒稽古など、寒さを利用した行事が行われます。' },
        { name: '立春', date: new Date('2025-02-03T23:10:00'), season: 'spring', description: '暦の上での春の始まり。梅の花が咲き始め、徐々に暖かくなり始めます。' },
        { name: '雨水', date: new Date('2025-02-18T19:07:00'), season: 'spring', description: '雪が雨に変わり、積もった雪が溶け始める頃。農耕の準備を始める目安です。' },
        { name: '啓蟄', date: new Date('2025-03-05T17:07:00'), season: 'spring', description: '冬ごもりしていた虫が、春の暖かさを感じて地中から姿を現す頃。' },
        { name: '春分', date: new Date('2025-03-20T18:01:00'), season: 'spring', description: '昼と夜の長さがほぼ等しくなる日。自然をたたえ生物をいつくしむ日です。' },
        { name: '清明', date: new Date('2025-04-04T21:49:00'), season: 'spring', description: '万物が清らかで明るく、生き生きとした様子を見せる頃。花見の季節です。' },
        { name: '穀雨', date: new Date('2025-04-20T04:56:00'), season: 'spring', description: '春の雨が降り、穀物の成長を助ける頃。種まきの好機とされています。' },
        { name: '立夏', date: new Date('2025-05-05T14:57:00'), season: 'summer', description: '暦の上での夏の始まり。新緑が美しく、過ごしやすい気候になります。' },
        { name: '小満', date: new Date('2025-05-21T03:55:00'), season: 'summer', description: '陽気が良くなり、万物が成長して天地に満ち始める頃。麦の穂が実り始めます。' },
        { name: '芒種', date: new Date('2025-06-05T18:57:00'), season: 'summer', description: '稲などの穀物の種をまく時期。梅雨入りの頃でもあります。' },
        { name: '夏至', date: new Date('2025-06-21T11:42:00'), season: 'summer', description: '一年で最も昼が長く夜が短い日。本格的な夏の到来を告げます。' },
        { name: '小暑', date: new Date('2025-07-07T05:05:00'), season: 'summer', description: '暑さが本格的になる頃。梅雨明けが近づき、蝉が鳴き始めます。' },
        { name: '大暑', date: new Date('2025-07-22T22:29:00'), season: 'summer', description: '一年で最も暑さが厳しい時期。夏の土用の時期でもあります。' },
        { name: '立秋', date: new Date('2025-08-07T14:52:00'), season: 'autumn', description: '暦の上での秋の始まり。まだ暑いですが、朝夕は涼しくなり始めます。' },
        { name: '処暑', date: new Date('2025-08-23T05:34:00'), season: 'autumn', description: '暑さが和らぐ頃。朝晩の涼しさに秋の気配を感じ始めます。' },
        { name: '白露', date: new Date('2025-09-07T17:52:00'), season: 'autumn', description: '草花に朝露が宿り始める頃。日中は暖かくても朝晩は冷え込みます。' },
        { name: '秋分', date: new Date('2025-09-23T03:19:00'), season: 'autumn', description: '昼と夜の長さがほぼ等しくなる日。秋彼岸の中日でもあります。' },
        { name: '寒露', date: new Date('2025-10-08T09:41:00'), season: 'autumn', description: '露が冷たく感じられる頃。秋が深まり、紅葉が美しくなります。' },
        { name: '霜降', date: new Date('2025-10-23T12:51:00'), season: 'autumn', description: '露が霜に変わり始める頃。朝晩の冷え込みが厳しくなります。' },
        { name: '立冬', date: new Date('2025-11-07T13:04:00'), season: 'winter', description: '暦の上での冬の始まり。日差しが弱まり、冬の気配を感じ始めます。' },
        { name: '小雪', date: new Date('2025-11-22T10:36:00'), season: 'winter', description: '雪が降り始める頃。まだ積もるほどではない、わずかな雪を指します。' },
        { name: '大雪', date: new Date('2025-12-07T06:05:00'), season: 'winter', description: '本格的に雪が降り始める頃。山々は雪に覆われ、平地でも雪が降ります。' },
        { name: '冬至', date: new Date('2025-12-22T00:03:00'), season: 'winter', description: '一年で最も昼が短く夜が長い日。ゆず湯に入り、かぼちゃを食べる風習があります。' }
    ],
    2026: [ // Data for 2026 remains for future-proofing
        { name: '小寒', date: new Date('2026-01-05T17:24:00'), season: 'winter', description: '寒さが最も厳しくなる前の時期。この日から寒の入りとなります。' },
        { name: '大寒', date: new Date('2026-01-20T10:46:00'), season: 'winter', description: '一年で最も寒さが厳しい時期。寒稽古など、寒さを利用した行事が行われます。' },
        { name: '立春', date: new Date('2026-02-04T05:03:00'), season: 'spring', description: '暦の上での春の始まり。梅の花が咲き始め、徐々に暖かくなり始めます。' },
        { name: '雨水', date: new Date('2026-02-19T00:51:00'), season: 'spring', description: '雪が雨に変わり、積もった雪が溶け始める頃。農耕の準備を始める目安です。' },
        { name: '啓蟄', date: new Date('2026-03-05T22:58:00'), season: 'spring', description: '冬ごもりしていた虫が、春の暖かさを感じて地中から姿を現す頃。' },
        { name: '春分', date: new Date('2026-03-20T23:41:00'), season: 'spring', description: '昼と夜の長さがほぼ等しくなる日。自然をたたえ生物をいつくしむ日です。' },
        { name: '清明', date: new Date('2026-04-05T03:35:00'), season: 'spring', description: '万物が清らかで明るく、生き生きとした様子を見せる頃。花見の季節です。' },
        { name: '穀雨', date: new Date('2026-04-20T10:31:00'), season: 'spring', description: '春の雨が降り、穀物の成長を助ける頃。種まきの好機とされています。' },
        { name: '立夏', date: new Date('2026-05-05T20:41:00'), season: 'summer', description: '暦の上での夏の始まり。新緑が美しく、過ごしやすい気候になります。' },
        { name: '小満', date: new Date('2026-05-21T09:28:00'), season: 'summer', description: '陽気が良くなり、万物が成長して天地に満ち始める頃。麦の穂が実り始めます。' },
        { name: '芒種', date: new Date('2026-06-06T00:40:00'), season: 'summer', description: '稲などの穀物の種をまく時期。梅雨入りの頃でもあります。' },
        { name: '夏至', date: new Date('2026-06-21T17:16:00'), season: 'summer', description: '一年で最も昼が長く夜が短い日。本格的な夏の到来を告げます。' },
        { name: '小暑', date: new Date('2026-07-07T10:50:00'), season: 'summer', description: '暑さが本格的になる頃。梅雨明けが近づき、蝉が鳴き始めます。' },
        { name: '大暑', date: new Date('2026-07-23T04:07:00'), season: 'summer', description: '一年で最も暑さが厳しい時期。夏の土用の時期でもあります。' },
        { name: '立秋', date: new Date('2026-08-07T20:38:00'), season: 'autumn', description: '暦の上での秋の始まり。まだ暑いですが、朝夕は涼しくなり始めます。' },
        { name: '処暑', date: new Date('2026-08-23T11:16:00'), season: 'autumn', description: '暑さが和らぐ頃。朝晩の涼しさに秋の気配を感じ始めます。' },
        { name: '白露', date: new Date('2026-09-07T23:41:00'), season: 'autumn', description: '草花に朝露が宿り始める頃。日中は暖かくても朝晩は冷え込みます。' },
        { name: '秋分', date: new Date('2026-09-23T09:04:00'), season: 'autumn', description: '昼と夜の長さがほぼ等しくなる日。秋彼岸の中日でもあります。' },
        { name: '寒露', date: new Date('2026-10-08T15:31:00'), season: 'autumn', description: '露が冷たく感じられる頃。秋が深まり、紅葉が美しくなります。' },
        { name: '霜降', date: new Date('2026-10-23T18:38:00'), season: 'autumn', description: '露が霜に変わり始める頃。朝晩の冷え込みが厳しくなります。' },
        { name: '立冬', date: new Date('2026-11-07T18:54:00'), season: 'winter', description: '暦の上での冬の始まり。日差しが弱まり、冬の気配を感じ始めます。' },
        { name: '小雪', date: new Date('2026-11-22T16:24:00'), season: 'winter', description: '雪が降り始める頃。まだ積もるほどではない、わずかな雪を指します。' },
        { name: '大雪', date: new Date('2026-12-07T11:55:00'), season: 'winter', description: '本格的に雪が降り始める頃。山々は雪に覆われ、平地でも雪が降ります。' },
        { name: '冬至', date: new Date('2026-12-22T05:53:00'), season: 'winter', description: '一年で最も昼が短く夜が長い日。ゆず湯に入り、かぼちゃを食べる風習があります。' }
    ]
};

function createSeasonalAnimation(sekki) {
    const animationEl = document.getElementById('seasonAnimation');
    if (!animationEl) { console.error('Animation element not found'); return; }
    animationEl.innerHTML = '';
    
    const isMobile = window.innerWidth < 640;
    
    switch(sekki) {
        case '小寒': // 小寒 - Minor Cold
            createIceCrystals(animationEl, isMobile ? 15 : 30);
            break;
        case '大寒': // 大寒 - Major Cold
            createIcicles(animationEl, isMobile ? 8 : 15);
            break;
        case '立春': // 立春 - Beginning of Spring
            createPlumBlossoms(animationEl, isMobile ? 10 : 20);
            break;
        case '雨水': // 雨水 - Rain Water
            createSpringRain(animationEl, isMobile ? 20 : 40);
            break;
        case '啓蟄': // 啓蟄 - Awakening of Insects
            createInsects(animationEl, isMobile ? 5 : 10);
            break;
        case '春分': // 春分 - Spring Equinox
            createSwallows(animationEl, isMobile ? 3 : 6);
            break;
        case '清明': // 清明 - Clear and Bright
            createSakuraAndLeaves(animationEl, isMobile ? 15 : 30);
            break;
        case '穀雨': // 穀雨 - Grain Rain
            createGrainRain(animationEl, isMobile ? 25 : 50);
            break;
        case '立夏': // 立夏 - Beginning of Summer
            createFreshGreen(animationEl, isMobile ? 10 : 20);
            break;
        case '小満': // 小満 - Grain Buds
            createWheatField(animationEl, isMobile ? 15 : 30);
            break;
        case '芒種': // 芒種 - Grain in Ear
            createRiceSeedlings(animationEl, isMobile ? 20 : 40);
            break;
        case '夏至': // 夏至 - Summer Solstice
            createCumulonimbus(animationEl, isMobile ? 3 : 5);
            break;
        case '小暑': // 小暑 - Minor Heat
            createWindChimes(animationEl, isMobile ? 5 : 10);
            break;
        case '大暑': // 大暑 - Major Heat
            createHeatWaves(animationEl, isMobile ? 10 : 20);
            break;
        case '立秋': // 立秋 - Beginning of Autumn
            createSunsetClouds(animationEl, isMobile ? 3 : 6);
            createDragonflies(animationEl, isMobile ? 5 : 10);
            break;
        case '処暑': // 処暑 - End of Heat
            createRiceEars(animationEl, isMobile ? 15 : 30);
            break;
        case '白露': // 白露 - White Dew
            createDewDrops(animationEl, isMobile ? 20 : 40);
            break;
        case '秋分': // 秋分 - Autumn Equinox
            createRedSpiderLilies(animationEl, isMobile ? 8 : 15);
            break;
        case '寒露': // 寒露 - Cold Dew
            createWildGeese(animationEl, isMobile ? 2 : 4);
            break;
        case '霜降': // 霜降 - Frost Descent
            createAutumnLeaves(animationEl, isMobile ? 15 : 30);
            createFrost(animationEl, isMobile ? 10 : 20);
            break;
        case '立冬': // 立冬 - Beginning of Winter
            createBareBranches(animationEl, isMobile ? 5 : 10);
            break;
        case '小雪': // 小雪 - Minor Snow
            createLightSnow(animationEl, isMobile ? 20 : 40);
            break;
        case '大雪': // 大雪 - Major Snow
            createHeavySnow(animationEl, isMobile ? 25 : 50);
            break;
        case '冬至': // 冬至 - Winter Solstice
            createCandleFlame(animationEl, 1);
            createYuzu(animationEl, isMobile ? 3 : 6);
            break;
        default:
            // Fallback to current season's default animation
            const season = getActualSeason(new Date());
            if (season === 'spring') createSakuraAndLeaves(animationEl, isMobile ? 15 : 30);
            else if (season === 'summer') createFreshGreen(animationEl, isMobile ? 20 : 40);
            else if (season === 'autumn') createAutumnLeaves(animationEl, isMobile ? 15 : 30);
            else createLightSnow(animationEl, isMobile ? 20 : 40);
    }
    
    // Add interactive handlers
    setupInteractiveElements(animationEl);
}

// Individual animation creation functions
function createIceCrystals(container, count) {
    for (let i = 0; i < count; i++) {
        const crystal = document.createElement('div');
        crystal.className = 'ice-crystal interactive-element';
        crystal.style.left = Math.random() * 100 + '%';
        crystal.style.animationDelay = Math.random() * 5 + 's';
        crystal.style.animationDuration = (8 + Math.random() * 4) + 's';
        container.appendChild(crystal);
    }
}

function createIcicles(container, count) {
    for (let i = 0; i < count; i++) {
        const icicle = document.createElement('div');
        icicle.className = 'icicle';
        icicle.style.left = (i / count) * 100 + '%';
        icicle.style.height = (30 + Math.random() * 30) + 'px';
        icicle.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(icicle);
        
        // Occasionally drop water
        if (Math.random() > 0.7) {
            setTimeout(() => {
                const drop = document.createElement('div');
                drop.className = 'water-drop';
                drop.style.left = icicle.style.left;
                drop.style.top = icicle.offsetTop + icicle.offsetHeight + 'px';
                drop.style.animationDelay = '0s';
                container.appendChild(drop);
            }, Math.random() * 5000);
        }
    }
}

function createPlumBlossoms(container, count) {
    for (let i = 0; i < count; i++) {
        const blossom = document.createElement('div');
        blossom.className = 'plum-blossom interactive-element';
        blossom.style.left = Math.random() * 100 + '%';
        blossom.style.top = Math.random() * 100 + '%';
        blossom.style.animationDelay = Math.random() * 6 + 's';
        container.appendChild(blossom);
    }
}

function createSpringRain(container, count) {
    for (let i = 0; i < count; i++) {
        const rain = document.createElement('div');
        rain.className = 'rain-drop';
        rain.style.left = Math.random() * 100 + '%';
        rain.style.animationDelay = Math.random() * 2 + 's';
        rain.style.animationDuration = (1.5 + Math.random()) + 's';
        container.appendChild(rain);
    }
    
    // Add sprouts
    for (let i = 0; i < count / 4; i++) {
        const sprout = document.createElement('div');
        sprout.className = 'sprout';
        sprout.style.left = Math.random() * 100 + '%';
        sprout.style.bottom = '0';
        sprout.style.animationDelay = (2 + Math.random() * 3) + 's';
        container.appendChild(sprout);
    }
}

function createInsects(container, count) {
    for (let i = 0; i < count / 2; i++) {
        const mound = document.createElement('div');
        mound.className = 'soil-mound';
        mound.style.left = Math.random() * 80 + 10 + '%';
        mound.style.bottom = Math.random() * 30 + '%';
        mound.style.animationDelay = Math.random() * 4 + 's';
        container.appendChild(mound);
    }
    
    for (let i = 0; i < count; i++) {
        const insect = document.createElement('div');
        insect.className = 'insect interactive-element';
        insect.style.bottom = Math.random() * 50 + '%';
        insect.style.animationDelay = Math.random() * 6 + 's';
        container.appendChild(insect);
    }
}

function createSwallows(container, count) {
    for (let i = 0; i < count; i++) {
        const swallow = document.createElement('div');
        swallow.className = 'swallow';
        swallow.style.top = 20 + Math.random() * 60 + '%';
        swallow.style.animationDelay = Math.random() * 8 + 's';
        swallow.style.animationDuration = (6 + Math.random() * 4) + 's';
        container.appendChild(swallow);
    }
}

function createSakuraAndLeaves(container, count) {
    for (let i = 0; i < count * 0.7; i++) {
        const petal = document.createElement('div');
        petal.className = 'sakura-petal interactive-element';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDelay = Math.random() * 5 + 's';
        petal.style.animationDuration = (4 + Math.random() * 3) + 's';
        container.appendChild(petal);
    }
    
    for (let i = 0; i < count * 0.3; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'young-leaf';
        leaf.style.left = Math.random() * 100 + '%';
        leaf.style.top = Math.random() * 100 + '%';
        leaf.style.animationDelay = Math.random() * 6 + 's';
        container.appendChild(leaf);
    }
}

function createGrainRain(container, count) {
    for (let i = 0; i < count; i++) {
        const rain = document.createElement('div');
        rain.className = 'grain-rain';
        rain.style.left = Math.random() * 100 + '%';
        rain.style.animationDelay = Math.random() * 1.5 + 's';
        container.appendChild(rain);
        
        // Create ripples where rain hits
        if (Math.random() > 0.8) {
            setTimeout(() => {
                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                ripple.style.left = rain.style.left;
                ripple.style.bottom = '10%';
                ripple.style.animationDelay = '0s';
                container.appendChild(ripple);
            }, Math.random() * 3000);
        }
    }
}

function createFreshGreen(container, count) {
    for (let i = 0; i < count; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'fresh-green';
        leaf.style.left = Math.random() * 100 + '%';
        leaf.style.top = Math.random() * 60 + '%';
        leaf.style.animationDelay = Math.random() * 4 + 's';
        leaf.style.transform = `scale(${0.8 + Math.random() * 0.4})`;
        container.appendChild(leaf);
    }
    
    // Add frogs
    for (let i = 0; i < Math.max(1, count / 5); i++) {
        const frog = document.createElement('div');
        frog.className = 'frog interactive-element';
        frog.style.left = Math.random() * 80 + 10 + '%';
        frog.style.bottom = Math.random() * 30 + '%';
        frog.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(frog);
    }
}

function createWheatField(container, count) {
    for (let i = 0; i < count; i++) {
        const wheat = document.createElement('div');
        wheat.className = 'wheat-stalk';
        const grain = document.createElement('div');
        grain.className = 'wheat-grain';
        wheat.appendChild(grain);
        
        wheat.style.left = (i / count) * 100 + '%';
        wheat.style.bottom = Math.random() * 40 + '%';
        wheat.style.animationDelay = (i / count) * 0.5 + 's';
        wheat.style.height = (35 + Math.random() * 15) + 'px';
        container.appendChild(wheat);
    }
}

function createRiceSeedlings(container, count) {
    // Create water reflection effect
    const water = document.createElement('div');
    water.className = 'water-reflection';
    water.style.bottom = '20%';
    container.appendChild(water);
    
    for (let i = 0; i < count; i++) {
        const seedling = document.createElement('div');
        seedling.className = 'rice-seedling';
        seedling.style.left = (i / count) * 100 + '%';
        seedling.style.bottom = '20%';
        seedling.style.animationDelay = Math.random() * 4 + 's';
        seedling.style.height = (25 + Math.random() * 10) + 'px';
        container.appendChild(seedling);
    }
}

function createCumulonimbus(container, count) {
    for (let i = 0; i < count; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cumulonimbus';
        cloud.style.left = 20 + (i * 60 / count) + '%';
        cloud.style.top = 10 + Math.random() * 20 + '%';
        cloud.style.animationDelay = i * 2 + 's';
        cloud.style.transform = `scale(${0.8 + Math.random() * 0.4})`;
        container.appendChild(cloud);
        
        // Add lightning
        if (Math.random() > 0.5) {
            const lightning = document.createElement('div');
            lightning.className = 'lightning';
            lightning.style.left = '50%';
            lightning.style.top = '80%';
            lightning.style.animationDelay = (i * 2 + 1) + 's';
            cloud.appendChild(lightning);
        }
    }
}

function createWindChimes(container, count) {
    for (let i = 0; i < count; i++) {
        const chime = document.createElement('div');
        chime.className = 'wind-chime interactive-element';
        chime.style.left = (i / count) * 80 + 10 + '%';
        chime.style.top = Math.random() * 30 + '%';
        chime.style.animationDelay = Math.random() * 3 + 's';
        chime.style.animationDuration = (2.5 + Math.random() * 1) + 's';
        container.appendChild(chime);
    }
}

function createHeatWaves(container, count) {
    for (let i = 0; i < count / 2; i++) {
        const wave = document.createElement('div');
        wave.className = 'heat-wave';
        wave.style.bottom = (i / (count/2)) * 100 + '%';
        wave.style.animationDelay = i * 0.3 + 's';
        container.appendChild(wave);
    }
    
    for (let i = 0; i < count / 2; i++) {
        const cicada = document.createElement('div');
        cicada.className = 'cicada';
        cicada.style.left = Math.random() * 100 + '%';
        cicada.style.top = Math.random() * 50 + '%';
        cicada.style.animationDelay = Math.random() * 1 + 's';
        container.appendChild(cicada);
    }
}

function createSunsetClouds(container, count) {
    for (let i = 0; i < count; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'sunset-cloud';
        cloud.style.top = 20 + Math.random() * 30 + '%';
        cloud.style.animationDelay = i * 3 + 's';
        cloud.style.animationDuration = (8 + Math.random() * 4) + 's';
        cloud.style.transform = `scale(${0.7 + Math.random() * 0.6})`;
        container.appendChild(cloud);
    }
}

function createDragonflies(container, count) {
    for (let i = 0; i < count; i++) {
        const dragonfly = document.createElement('div');
        dragonfly.className = 'dragonfly interactive-element';
        dragonfly.style.top = 30 + Math.random() * 40 + '%';
        dragonfly.style.animationDelay = Math.random() * 5 + 's';
        dragonfly.style.animationDuration = (4 + Math.random() * 2) + 's';
        container.appendChild(dragonfly);
    }
}

function createRiceEars(container, count) {
    for (let i = 0; i < count; i++) {
        const rice = document.createElement('div');
        rice.className = 'rice-ear';
        rice.style.left = (i / count) * 100 + '%';
        rice.style.bottom = Math.random() * 40 + '%';
        rice.style.animationDelay = (i / count) * 0.3 + 's';
        rice.style.height = (40 + Math.random() * 20) + 'px';
        container.appendChild(rice);
    }
}

function createDewDrops(container, count) {
    for (let i = 0; i < count; i++) {
        const dew = document.createElement('div');
        dew.className = 'dew-drop interactive-element';
        dew.style.left = Math.random() * 100 + '%';
        dew.style.top = 40 + Math.random() * 40 + '%';
        dew.style.animationDelay = Math.random() * 3 + 's';
        dew.style.transform = `scale(${0.6 + Math.random() * 0.8})`;
        container.appendChild(dew);
    }
}

function createRedSpiderLilies(container, count) {
    for (let i = 0; i < count; i++) {
        const lily = document.createElement('div');
        lily.className = 'red-spider-lily';
        lily.style.left = Math.random() * 80 + 10 + '%';
        lily.style.bottom = Math.random() * 30 + '%';
        lily.style.animationDelay = Math.random() * 6 + 's';
        container.appendChild(lily);
    }
}

function createWildGeese(container, count) {
    for (let i = 0; i < count; i++) {
        const geese = document.createElement('div');
        geese.className = 'wild-geese';
        geese.style.top = 10 + i * 20 + '%';
        geese.style.animationDelay = i * 4 + 's';
        geese.style.animationDuration = (10 + Math.random() * 4) + 's';
        container.appendChild(geese);
    }
}

function createAutumnLeaves(container, count) {
    for (let i = 0; i < count; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'autumn-leaf interactive-element';
        leaf.style.left = Math.random() * 100 + '%';
        leaf.style.animationDelay = Math.random() * 5 + 's';
        leaf.style.animationDuration = (4 + Math.random() * 3) + 's';
        leaf.style.transform = `scale(${0.7 + Math.random() * 0.6}) rotate(${Math.random() * 360}deg)`;
        container.appendChild(leaf);
    }
}

function createFrost(container, count) {
    for (let i = 0; i < count; i++) {
        const frost = document.createElement('div');
        frost.className = 'frost';
        frost.style.left = Math.random() * 100 + '%';
        frost.style.top = Math.random() * 100 + '%';
        frost.style.animationDelay = Math.random() * 4 + 's';
        frost.style.transform = `scale(${0.5 + Math.random() * 1})`;
        container.appendChild(frost);
    }
}

function createBareBranches(container, count) {
    for (let i = 0; i < count; i++) {
        const branch = document.createElement('div');
        branch.className = 'bare-branch';
        branch.style.left = Math.random() * 80 + 10 + '%';
        branch.style.top = Math.random() * 50 + '%';
        branch.style.animationDelay = Math.random() * 8 + 's';
        branch.style.transform = `scale(${0.8 + Math.random() * 0.4})`;
        container.appendChild(branch);
    }
}

function createLightSnow(container, count) {
    for (let i = 0; i < count; i++) {
        const snow = document.createElement('div');
        snow.className = 'light-snow interactive-element';
        snow.style.left = Math.random() * 100 + '%';
        snow.style.animationDelay = Math.random() * 6 + 's';
        snow.style.animationDuration = (5 + Math.random() * 3) + 's';
        container.appendChild(snow);
    }
}

function createHeavySnow(container, count) {
    for (let i = 0; i < count; i++) {
        const snow = document.createElement('div');
        snow.className = 'heavy-snow interactive-element';
        snow.style.left = Math.random() * 100 + '%';
        snow.style.animationDelay = Math.random() * 4 + 's';
        snow.style.animationDuration = (3 + Math.random() * 2) + 's';
        snow.style.transform = `scale(${0.8 + Math.random() * 0.4})`;
        container.appendChild(snow);
    }
}

function createCandleFlame(container, count) {
    const flame = document.createElement('div');
    flame.className = 'candle-flame';
    flame.style.left = '50%';
    flame.style.bottom = '30%';
    flame.style.transform = 'translateX(-50%)';
    container.appendChild(flame);
}

function createYuzu(container, count) {
    for (let i = 0; i < count; i++) {
        const yuzu = document.createElement('div');
        yuzu.className = 'yuzu interactive-element';
        yuzu.style.left = 30 + Math.random() * 40 + '%';
        yuzu.style.bottom = 20 + Math.random() * 20 + '%';
        yuzu.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(yuzu);
    }
}

function setupInteractiveElements(container) {
    const interactiveEls = container.querySelectorAll('.interactive-element');
    
    interactiveEls.forEach(el => {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = '';
                this.style.animationPlayState = 'running';
            }, 100);
            
            // Create a visual effect on click
            const effect = document.createElement('div');
            effect.style.position = 'absolute';
            effect.style.width = '50px';
            effect.style.height = '50px';
            effect.style.borderRadius = '50%';
            effect.style.background = 'rgba(255,255,255,0.5)';
            effect.style.left = e.offsetX - 25 + 'px';
            effect.style.top = e.offsetY - 25 + 'px';
            effect.style.pointerEvents = 'none';
            effect.style.animation = 'ripple 0.6s ease-out';
            this.appendChild(effect);
            
            setTimeout(() => effect.remove(), 600);
        });
    });
}

function createRipple(e) {
    const button = e.currentTarget;
    if (button.disabled) return;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left - size / 2;
    const y = clientY - rect.top - size / 2;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) { existingRipple.remove(); }
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
}

const app = {
    tasks: [],
    deadlineTasks: [],
    inboxItems: [],
    selectedDate: new Date(),
    taskType: 'normal',
    totalPoints: 0,
    dailyPointHistory: {},
    dailyReflections: {},
    openaiApiKey: null,

    init() {
        this.loadData();
        this.bindEvents();
        this.updateSekki();
        // DOMが完全に読み込まれてから実行
        requestAnimationFrame(() => {
            this.updateTodayDisplay();
        });
    },

    updateSekki() { /* Same as before */
        const now = new Date();
        const year = now.getFullYear();
        const currentYearSekki = sekkiData[year] || [];
        const nextYearSekki = sekkiData[year + 1] || [];
        const allSekki = [...currentYearSekki, ...nextYearSekki];
        let currentSekki = null;
        let nextSekki = null;
        for (let i = 0; i < allSekki.length; i++) {
            if (now >= allSekki[i].date) { currentSekki = allSekki[i]; } 
            else { nextSekki = allSekki[i]; break; }
        }
        if (!currentSekki && allSekki.length > 0) {
            currentSekki = allSekki.find(s => now < s.date) || allSekki[allSekki.length -1]; 
            if (!currentSekki && sekkiData[year-1] && sekkiData[year-1].length > 0) { 
                currentSekki = sekkiData[year-1][sekkiData[year-1].length -1];
            }
        }
        if (currentSekki) {
            document.getElementById('currentSekki').textContent = currentSekki.name;
            const dateStr = currentSekki.date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
            document.getElementById('sekkiDate').textContent = `${dateStr}より`;
            const bg = document.getElementById('backgroundSeason');
            bg.className = bg.className.replace(/bg-[\u4E00-\u9FA5]+/g, '');
            bg.classList.add(`bg-${currentSekki.name}`);
            createSeasonalAnimation(currentSekki.name); 
            this.showSekkiDetail(currentSekki);
        }
        if (nextSekki) {
            const daysUntil = Math.ceil((nextSekki.date - now) / (1000 * 60 * 60 * 24));
            document.getElementById('nextSekkiInfo').textContent = `次は「${nextSekki.name}」 あと${daysUntil}日`;
        } else {
             document.getElementById('nextSekkiInfo').textContent = `次の節気情報は翌年になります`;
        }
        this.updateYearSekkiList();
        this.render();
        // 少し遅延させて確実に表示
        setTimeout(() => this.updateTodayDisplay(), 100);
     },
    
    updateYearSekkiList() { /* Same as before */
        const year = this.selectedDate.getFullYear(); 
        const yearSekki = sekkiData[year] || [];
        const listEl = document.getElementById('yearSekkiList');
        listEl.innerHTML = '';
        yearSekki.forEach(sekki => {
            const itemEl = document.createElement('div');
            const isPast = new Date() > sekki.date && !this.isCurrentSekki(sekki, this.selectedDate); 
            const isCurrentlyDisplayedSekki = this.isCurrentSekki(sekki, this.selectedDate); 
            itemEl.className = `p-1.5 sm:p-2 rounded text-center transition-all cursor-pointer ${
                isCurrentlyDisplayedSekki ? 'bg-gray-800 text-white' : 
                isPast ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-100'
            }`;
            itemEl.innerHTML = `
                <div class="font-medium text-xs sm:text-sm">${sekki.name}</div>
                <div class="text-xs ${isCurrentlyDisplayedSekki ? 'text-gray-300' : 'text-gray-500'}">
                    ${sekki.date.getMonth() + 1}/${sekki.date.getDate()}
                </div>`;
            itemEl.addEventListener('click', () => {
                this.showSekkiDetail(sekki); 
                this.updateYearSekkiList(); 
            });
            listEl.appendChild(itemEl);
        });},
    
    showSekkiDetail(sekki) { /* Same as before */
        document.getElementById('sekkiDetailName').textContent = sekki.name;
        document.getElementById('sekkiDetailDate').textContent = sekki.date.toLocaleDateString('ja-JP', { 
            year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'
        });
        document.getElementById('sekkiDescription').textContent = sekki.description;
        const bg = document.getElementById('backgroundSeason');
        bg.className = bg.className.replace(/bg-[\u4E00-\u9FA5]+/g, '');
        bg.classList.add(`bg-${sekki.name}`);
        createSeasonalAnimation(sekki.name);},
    
    isCurrentSekki(sekkiToCheck, referenceDate) { /* Same as before */
        const year = referenceDate.getFullYear();
        const allSekkiForYear = sekkiData[year] || [];
        const allSekkiForPrevYear = sekkiData[year-1] || [];
        const relevantSekki = [...allSekkiForPrevYear.slice(-1), ...allSekkiForYear];
        for (let i = 0; i < relevantSekki.length; i++) {
            const currentS = relevantSekki[i];
            const nextS = relevantSekki[i + 1];
            if (referenceDate >= currentS.date) {
                if (nextS && referenceDate < nextS.date) {
                    return sekkiToCheck.name === currentS.name && sekkiToCheck.date.getTime() === currentS.date.getTime();
                } else if (!nextS) { 
                    return sekkiToCheck.name === currentS.name && sekkiToCheck.date.getTime() === currentS.date.getTime();
                }
            }
        }
        return false;},
    
    updateCalendarSekkiInfo() { /* Same as before */
        const dateInput = document.getElementById('dateInput');
        if (!dateInput.value) return; 
        const selectedDate = new Date(dateInput.value);
        if (isNaN(selectedDate.getTime())) return; 
        const year = selectedDate.getFullYear();
        const sekkiList = [...(sekkiData[year - 1] || []), ...(sekkiData[year] || []), ...(sekkiData[year + 1] || [])].filter(s => s); 
        if (sekkiList.length === 0) {
             document.getElementById('calendarSekkiInfo').classList.add('hidden');
             return;
        }
        let currentSekkiForDate = null;
        for (let i = 0; i < sekkiList.length; i++) {
            if (selectedDate >= sekkiList[i].date) {
                currentSekkiForDate = sekkiList[i];
            } else {
                if (!currentSekkiForDate) currentSekkiForDate = sekkiList[i]; 
                break;
            }
        }
        const infoEl = document.getElementById('calendarSekkiInfo');
        if (currentSekkiForDate) {
            let message = `選択日は「${currentSekkiForDate.name}」の期間です。`;
            if (selectedDate.toDateString() === currentSekkiForDate.date.toDateString()){
                message = `この日は「${currentSekkiForDate.name}」です。`;
            } else {
                const currentIndexInYear = (sekkiData[currentSekkiForDate.date.getFullYear()] || []).findIndex(s => s.name === currentSekkiForDate.name);
                const yearSekki = sekkiData[currentSekkiForDate.date.getFullYear()] || [];
                if (selectedDate < currentSekkiForDate.date && currentIndexInYear > 0) {
                    const prevSekki = yearSekki[currentIndexInYear -1];
                    message = `「${prevSekki.name}」の期間、次の節気は「${currentSekkiForDate.name}」です。`;
                } else if (selectedDate > currentSekkiForDate.date) {
                    const nextSekkiInList = yearSekki[currentIndexInYear + 1];
                    if (nextSekkiInList && selectedDate >= nextSekkiInList.date) {
                        message = `選択日は「${nextSekkiInList.name}」の期間です。`;
                    } else {
                        message = `「${currentSekkiForDate.name}」の期間です。`;
                    }
                }
            }
            infoEl.textContent = message;
            infoEl.classList.remove('hidden');
        } else {
            infoEl.classList.add('hidden');
        }
    },

    loadData() { /* Same as before */
        const saved = localStorage.getItem('focusTaskData');
        if (saved) {
            const data = JSON.parse(saved);
            this.tasks = (data.tasks || []).map(t => ({ ...t, createdAt: new Date(t.createdAt), completedAt: t.completedAt ? new Date(t.completedAt) : null, scheduledFor: new Date(t.scheduledFor), points: t.points || 0 }));
            this.deadlineTasks = (data.deadlineTasks || []).map(t => ({ ...t, deadline: new Date(t.deadline), createdAt: new Date(t.createdAt), completedAt: t.completedAt ? new Date(t.completedAt) : null }));
            this.inboxItems = data.inboxItems || [];
            this.totalPoints = data.totalPoints || 0;
            this.dailyPointHistory = data.dailyPointHistory || {};
            this.dailyReflections = data.dailyReflections || {};
            this.openaiApiKey = data.openaiApiKey || null;
        }},

    saveData() { /* Same as before */
        localStorage.setItem('focusTaskData', JSON.stringify({ 
            tasks: this.tasks, 
            deadlineTasks: this.deadlineTasks, 
            inboxItems: this.inboxItems, 
            totalPoints: this.totalPoints, 
            dailyPointHistory: this.dailyPointHistory,
            dailyReflections: this.dailyReflections,
            openaiApiKey: this.openaiApiKey
        }));},

    bindEvents() { 
        document.getElementById('prevDay').addEventListener('click', () => this.navigateDate(-1));
        document.getElementById('nextDay').addEventListener('click', () => this.navigateDate(1));
        document.getElementById('todayButton').addEventListener('click', () => this.goToToday());
        // Calendar is always visible, no toggle needed
        const dateInputElement = document.getElementById('dateInput');
        dateInputElement.addEventListener('change', (e) => this.selectDate(e.target.value));
        dateInputElement.addEventListener('input', () => this.updateCalendarSekkiInfo()); 
        document.getElementById('normalType').addEventListener('click', () => this.setTaskType('normal'));
        document.getElementById('urgentType').addEventListener('click', () => this.setTaskType('urgent'));
        document.getElementById('addTask').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') {
                if (this.taskType === 'urgent' && this.selectedPoints === 0) {
                    // 目標タスクでポイント未選択の場合は何もしない
                    return;
                }
                this.addTask();
            }
        });
        document.querySelectorAll('.point-select-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const points = parseInt(e.currentTarget.dataset.points);
                this.selectPoints(points);
                // ポイント選択後、自動的にタスクを追加
                setTimeout(() => this.addTask(), 200);
            });
        });
        document.getElementById('deadlineToggle').addEventListener('click', () => this.toggleDeadlineForm());
        document.getElementById('addDeadline').addEventListener('click', () => this.addDeadlineTask());
        document.getElementById('cancelDeadline').addEventListener('click', () => this.toggleDeadlineForm(false)); 
        document.getElementById('inboxToggle').addEventListener('click', () => this.toggleInbox());
        document.getElementById('addInbox').addEventListener('click', () => this.addInboxItem());
        document.getElementById('inboxInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') this.addInboxItem(); });
        document.getElementById('statsToggle').addEventListener('click', () => this.toggleStats());
        document.getElementById('resetStats').addEventListener('click', () => this.resetStats());
        document.getElementById('reflectionToggle').addEventListener('click', () => this.toggleReflection());
        document.getElementById('saveReflection').addEventListener('click', () => this.saveReflection());
        document.getElementById('cancelReflection').addEventListener('click', () => this.toggleReflection(false));
        document.getElementById('reflectionInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.saveReflection();
        });
        document.getElementById('aiSettingsToggle').addEventListener('click', () => this.toggleApiKeyForm());
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveApiKey());
        document.getElementById('cancelApiKey').addEventListener('click', () => this.toggleApiKeyForm(false));
        document.querySelectorAll('.ai-period-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.generateAIComment(e.target.dataset.period));
        });

        // --- NEW: スワイプによる日付移動機能 ---
        const swipeArea = document.body;
        let touchStartX = 0;
        let touchStartY = 0;
        let isSwipeActive = false; // スワイプ操作中かどうかのフラグ

        swipeArea.addEventListener('touchstart', (e) => {
            // ボタンや入力、特定の操作エリアではスワイプを開始しない
            if (e.target.closest('button, input, a, .sekki-grid')) {
                isSwipeActive = false;
                return;
            }
            isSwipeActive = true;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        swipeArea.addEventListener('touchend', (e) => {
            if (!isSwipeActive) return;
            isSwipeActive = false; // フラグをリセット

            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    },
    
    // --- NEW: スワイプ操作を処理するメソッド ---
    handleSwipe(startX, startY, endX, endY) {
        const thresholdX = 50;  // 横スワイプとして認識する最小距離
        const restraintY = 100; // 横スワイプ中に許容される縦の最大移動距離

        const diffX = endX - startX;
        const diffY = endY - startY;

        // 横方向の移動がしきい値を超え、縦方向の移動が抑制範囲内かをチェック
        if (Math.abs(diffX) > thresholdX && Math.abs(diffY) < restraintY) {
            if (diffX > 0) {
                this.navigateDate(-1); // 右スワイプで前の日へ
            } else {
                this.navigateDate(1);  // 左スワイプで次の日へ
            }
        }
    },

    navigateDate(days) { /* Same as before */
        const newDate = new Date(this.selectedDate);
        newDate.setDate(newDate.getDate() + days);
        this.selectedDate = newDate;
        this.updateSekkiForSelectedDate();
        this.render();},

    goToToday() { /* Same as before */
        this.selectedDate = new Date();
        this.updateSekkiForSelectedDate();
        this.render();},

    selectDate(dateStr) { /* Same as before */
        const newDate = new Date(dateStr);
        if (!isNaN(newDate.getTime())) {
            this.selectedDate = newDate;
            // Calendar always visible, no need to hide
            this.updateCalendarSekkiInfo(); 
            this.updateSekkiForSelectedDate(); 
            this.render();
        } else {
            this.showError("無効な日付形式です。");
        }},
    updateSekkiForSelectedDate() { /* Same as before */
        const year = this.selectedDate.getFullYear();
        const allSekki = [...(sekkiData[year] || []), ...(sekkiData[year + 1] || [])];
        let currentSekkiForDisplay = null;
        let nextSekkiForDisplay = null;
        for (let i = 0; i < allSekki.length; i++) {
            if (this.selectedDate >= allSekki[i].date) { currentSekkiForDisplay = allSekki[i];} 
            else { nextSekkiForDisplay = allSekki[i]; break; }
        }
        if (!currentSekkiForDisplay && allSekki.length > 0) {
            const prevYearSekki = sekkiData[year - 1] || [];
            if (prevYearSekki.length > 0) { currentSekkiForDisplay = prevYearSekki[prevYearSekki.length -1]; } 
            else { currentSekkiForDisplay = allSekki[0]; }
        }
        if (currentSekkiForDisplay) {
            document.getElementById('currentSekki').textContent = currentSekkiForDisplay.name;
            const dateStr = currentSekkiForDisplay.date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
            document.getElementById('sekkiDate').textContent = `${dateStr}より`;
            const bg = document.getElementById('backgroundSeason');
            bg.className = bg.className.replace(/bg-[\u4E00-\u9FA5]+/g, '');
            bg.classList.add(`bg-${currentSekkiForDisplay.name}`);
            createSeasonalAnimation(currentSekkiForDisplay.name);
            this.showSekkiDetail(currentSekkiForDisplay);
        }
        if (nextSekkiForDisplay) {
            const daysUntil = Math.ceil((nextSekkiForDisplay.date - this.selectedDate) / (1000 * 60 * 60 * 24));
            document.getElementById('nextSekkiInfo').textContent = `次は「${nextSekkiForDisplay.name}」 あと${daysUntil > 0 ? daysUntil : 0}日`;
        } else {
             document.getElementById('nextSekkiInfo').textContent = `次の節気情報は翌年になります`;
        }
        this.updateYearSekkiList();},

    toggleCalendar() { /* Same as before */
        const dateInputEl = document.getElementById('dateInput');
        // Always visible, so just update the date and focus
        dateInputEl.value = this.selectedDate.toISOString().split('T')[0];
        this.updateCalendarSekkiInfo(); 
        dateInputEl.focus();
    },

    setTaskType(type) { /* Same as before */
        this.taskType = type;
        const normalButton = document.getElementById('normalType');
        const urgentButton = document.getElementById('urgentType');
        const pointSelector = document.getElementById('pointSelector');
        const addButton = document.getElementById('addTask');
        
        normalButton.className = `flex-1 px-4 py-2 rounded-full font-medium transition-all button-large ${ type === 'normal' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' }`;
        urgentButton.className = `flex-1 px-4 py-2 rounded-full font-medium transition-all button-large ${ type === 'urgent' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' }`;
        
        if (type === 'urgent') {
            pointSelector.classList.remove('hidden');
            addButton.classList.add('hidden');
            this.selectedPoints = 0;
            document.querySelectorAll('.point-select-button').forEach(btn => {
                btn.classList.remove('border-gray-800', 'bg-gray-100');
                btn.classList.add('border-gray-300');
            });
        } else {
            pointSelector.classList.add('hidden');
            addButton.classList.remove('hidden');
            this.selectedPoints = 0;
        }},

    selectedPoints: 0,
    
    selectPoints(points) {
        this.selectedPoints = points;
        document.querySelectorAll('.point-select-button').forEach(btn => {
            const btnPoints = parseInt(btn.dataset.points);
            if (btnPoints === points) {
                btn.classList.add('border-gray-800', 'bg-gray-100');
                btn.classList.remove('border-gray-300');
            } else {
                btn.classList.remove('border-gray-800', 'bg-gray-100');
                btn.classList.add('border-gray-300');
            }
        });
    },
    
    addTask() { /* Same as before */
        const input = document.getElementById('taskInput');
        const text = input.value.trim();
        if (!text) { this.showError('予定を入力してください'); return; }
        
        if (this.taskType === 'urgent' && this.selectedPoints === 0) {
            this.showError('目標タスクにはポイントを設定してください');
            return;
        }
        
        const todayTasks = this.getTodayTasks();
        const normalCount = todayTasks.filter(t => t.type === 'normal' && !t.isCompleted).length; 
        const urgentCount = todayTasks.filter(t => t.type === 'urgent' && !t.isCompleted).length; 
        if (this.taskType === 'normal' && normalCount >= 3) { this.showError('通常タスクは3件までです（未完了）'); return; }
        if (this.taskType === 'urgent' && urgentCount >= 3) { this.showError('目標タスクは3件までです（未完了）'); return; }
        const newTask = { id: Date.now().toString(), text: text, type: this.taskType, points: this.taskType === 'urgent' ? this.selectedPoints : 0, createdAt: new Date(), completedAt: null, isCompleted: false, scheduledFor: new Date(this.selectedDate) };
        this.tasks.push(newTask);
        input.value = '';
        
        // リセット
        this.selectedPoints = 0;
        document.querySelectorAll('.point-select-button').forEach(btn => {
            btn.classList.remove('border-gray-800', 'bg-gray-100');
            btn.classList.add('border-gray-300');
        });
        
        this.saveData();
        this.render();},

    toggleTask(taskId) { /* Same as before */
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        if (!task.isCompleted) { 
            this.showCelebration();
            if (task.type === 'urgent' && task.points > 0) {
                this.totalPoints += task.points;
                const today = new Date().toDateString();
                if (!this.dailyPointHistory[today]) {
                    this.dailyPointHistory[today] = 0;
                }
                this.dailyPointHistory[today] += task.points;
            }
        } else {
            if (task.type === 'urgent' && task.points > 0) {
                this.totalPoints -= task.points;
                const today = new Date().toDateString();
                if (this.dailyPointHistory[today]) {
                    this.dailyPointHistory[today] -= task.points;
                }
            }
        }
        task.isCompleted = !task.isCompleted;
        task.completedAt = task.isCompleted ? new Date() : null;
        this.saveData();
        this.render();},

    postponeTask(taskId) { /* Same as before */
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        const tomorrow = new Date(this.selectedDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowTasks = this.tasks.filter(t => new Date(t.scheduledFor).toDateString() === tomorrow.toDateString() && !t.isCompleted );
        const normalCount = tomorrowTasks.filter(t => t.type === 'normal').length;
        const urgentCount = tomorrowTasks.filter(t => t.type === 'urgent').length;
        if (task.type === 'normal' && normalCount >= 3) { this.showError('翌日の通常タスクは既に3件です（未完了）'); return; }
        if (task.type === 'urgent' && urgentCount >= 3) { this.showError('翌日の目標タスクは既に3件です（未完了）'); return; }
        task.scheduledFor = tomorrow;
        this.showPostponeEffect();
        setTimeout(() => { this.saveData(); this.render(); }, 600);},

    deleteTask(taskId) { /* Same as before */
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveData();
        this.render();},

    toggleDeadlineForm(forceHide = null) { /* Same as before */
        const form = document.getElementById('deadlineForm');
        const activeCount = this.deadlineTasks.filter(t => !t.isCompleted).length;
        if (forceHide === false) { form.classList.add('hidden'); return; }
        if (forceHide === true) { if (activeCount < 3) form.classList.remove('hidden'); else this.showError('期限付きタスクは3件までです'); return; }
        if (form.classList.contains('hidden')) { 
            if (activeCount >= 3) { this.showError('期限付きタスクは3件までです'); return; }
            form.classList.remove('hidden');
            document.getElementById('deadlineDate').min = new Date().toISOString().split('T')[0];
            document.getElementById('deadlineText').focus();
        } else { 
            form.classList.add('hidden');
        }},

    addDeadlineTask() { /* Same as before */
        const textEl = document.getElementById('deadlineText');
        const dateEl = document.getElementById('deadlineDate');
        const text = textEl.value.trim();
        const date = dateEl.value;
        if (!text || !date) { this.showError('内容と期限を入力してください'); return; }
        const activeCount = this.deadlineTasks.filter(t => !t.isCompleted).length;
        if (activeCount >= 3) { this.showError('期限付きタスクは3件までです'); return; }
        const newTask = { id: Date.now().toString(), text: text, deadline: new Date(date + "T23:59:59"), createdAt: new Date(), isCompleted: false, completedAt: null };
        this.deadlineTasks.push(newTask);
        textEl.value = ''; dateEl.value = '';
        this.toggleDeadlineForm(false); 
        this.saveData(); this.render();},

    toggleDeadlineTask(taskId) { /* Same as before */
        const task = this.deadlineTasks.find(t => t.id === taskId);
        if (!task) return;
        if (!task.isCompleted) { this.showCelebration(); }
        task.isCompleted = !task.isCompleted;
        task.completedAt = task.isCompleted ? new Date() : null;
        this.saveData();
        this.render();},
    
    // --- NEW: Delete Deadline Task ---
    deleteDeadlineTask(taskId) {
        this.deadlineTasks = this.deadlineTasks.filter(t => t.id !== taskId);
        this.saveData();
        this.render();
    },

    toggleInbox() { /* Same as before */
        const inboxSection = document.getElementById('inboxSection');
        inboxSection.classList.toggle('hidden');
        if(!inboxSection.classList.contains('hidden')) { document.getElementById('inboxInput').focus(); }},

    addInboxItem() { /* Same as before */
        const input = document.getElementById('inboxInput');
        const text = input.value.trim();
        if (!text) return;
        this.inboxItems.push({ id: Date.now().toString(), text: text });
        input.value = ''; this.saveData(); this.render(); },
    
    deleteInboxItem(itemId) { /* Same as before */
        this.inboxItems = this.inboxItems.filter(item => item.id !== itemId);
        this.saveData(); this.render();},

    getTodayTasks() { /* Same as before */
        const dateStr = this.selectedDate.toDateString();
        return this.tasks.filter(t => new Date(t.scheduledFor).toDateString() === dateStr);},

    getDaysUntilDeadline(deadline) { /* Same as before */
        const today = new Date(); today.setHours(0, 0, 0, 0); 
        const deadlineDate = new Date(deadline); deadlineDate.setHours(0, 0, 0, 0);
        const diffTime = deadlineDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));},

    formatDate(date) { /* Same as before */
        const today = new Date(); today.setHours(0,0,0,0);
        const compDate = new Date(date); compDate.setHours(0,0,0,0);
        if (compDate.toDateString() === today.toDateString()) return '本日';
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        if (compDate.toDateString() === tomorrow.toDateString()) return '明日';
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        if (compDate.toDateString() === yesterday.toDateString()) return '昨日';
        return `${compDate.getMonth() + 1}月${compDate.getDate()}日`;
    },
    
    formatDateDetails(date) {
        const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
        const today = new Date();
        today.setHours(0,0,0,0);
        const compDate = new Date(date);
        compDate.setHours(0,0,0,0);
        
        return {
            year: compDate.getFullYear() + '年',
            date: this.formatDate(date),
            day: weekdays[compDate.getDay()],
            isToday: compDate.toDateString() === today.toDateString()
        };
    },
    
    updateTodayDisplay() {
        const today = new Date();
        const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
        const yearEl = document.getElementById('todayDateYear');
        const fullEl = document.getElementById('todayDateFull');
        const dayEl = document.getElementById('todayDateDay');
        
        if (yearEl) yearEl.textContent = today.getFullYear() + '年';
        if (fullEl) fullEl.textContent = (today.getMonth() + 1) + '月' + today.getDate() + '日';
        if (dayEl) dayEl.textContent = weekdays[today.getDay()];
    },

    showError(message) { /* Same as before */
        const elem = document.getElementById('errorMessage');
        elem.textContent = message; elem.classList.remove('hidden');
        setTimeout(() => elem.classList.add('hidden'), 3000);},

    showCelebration() { /* Same as before */
        const elem = document.getElementById('celebration');
        elem.classList.remove('hidden');
        setTimeout(() => elem.classList.add('hidden'), 1500);},

    showPostponeEffect() { /* Same as before */
        const elem = document.getElementById('postponeEffect');
        elem.classList.remove('hidden');
        setTimeout(() => elem.classList.add('hidden'), 1500);},

    toggleStats() {
        const statsSection = document.getElementById('statsSection');
        statsSection.classList.toggle('hidden');
        if (!statsSection.classList.contains('hidden')) {
            this.renderWeeklyStats();
        }
    },
    
    renderWeeklyStats() {
        const weeklyStatsEl = document.getElementById('weeklyStats');
        weeklyStatsEl.innerHTML = '';
        
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            const points = this.dailyPointHistory[dateStr] || 0;
            const dayName = i === 0 ? '今日' : i === 1 ? '昨日' : date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
            
            const dayEl = document.createElement('div');
            dayEl.className = 'flex items-center justify-between p-2 rounded-lg ' + (i === 0 ? 'bg-amber-50' : 'bg-gray-50');
            dayEl.innerHTML = `
                <span class="text-sm text-gray-700">${dayName}</span>
                <div class="flex items-center gap-2">
                    <div class="h-2 bg-gray-200 rounded-full" style="width: 100px;">
                        <div class="h-full bg-amber-500 rounded-full transition-all" style="width: ${Math.min(points * 10, 100)}%;"></div>
                    </div>
                    <span class="text-sm font-medium text-gray-700 w-12 text-right">${points}pt</span>
                </div>
            `;
            weeklyStatsEl.appendChild(dayEl);
        }
    },
    
    resetStats() {
        if (confirm('すべてのポイント統計をリセットしますか？')) {
            this.totalPoints = 0;
            this.dailyPointHistory = {};
            this.saveData();
            this.render();
            this.renderWeeklyStats();
        }
    },
    
    toggleReflection(forceHide = null) {
        const form = document.getElementById('reflectionForm');
        const toggle = document.getElementById('reflectionToggle');
        
        if (forceHide === false) {
            form.classList.add('hidden');
            return;
        }
        
        form.classList.toggle('hidden');
        if (!form.classList.contains('hidden')) {
            const dateStr = this.selectedDate.toDateString();
            const reflection = this.dailyReflections[dateStr] || '';
            document.getElementById('reflectionInput').value = reflection;
            document.getElementById('reflectionInput').focus();
        }
    },
    
    saveReflection() {
        const input = document.getElementById('reflectionInput');
        const text = input.value.trim();
        const dateStr = this.selectedDate.toDateString();
        
        if (text) {
            this.dailyReflections[dateStr] = text;
        } else {
            delete this.dailyReflections[dateStr];
        }
        
        this.saveData();
        this.toggleReflection(false);
        this.render();
    },
    
    toggleApiKeyForm(forceHide = null) {
        const form = document.getElementById('apiKeyForm');
        
        if (forceHide === false) {
            form.classList.add('hidden');
            return;
        }
        
        form.classList.toggle('hidden');
        if (!form.classList.contains('hidden')) {
            document.getElementById('apiKeyInput').value = this.openaiApiKey || '';
            document.getElementById('apiKeyInput').focus();
        }
    },
    
    saveApiKey() {
        const input = document.getElementById('apiKeyInput');
        const key = input.value.trim();
        
        if (key) {
            this.openaiApiKey = key;
        } else {
            this.openaiApiKey = null;
        }
        
        this.saveData();
        this.toggleApiKeyForm(false);
        this.render();
    },
    
    async generateAIComment(period) {
        if (!this.openaiApiKey) {
            this.showError('APIキーを設定してください');
            return;
        }
        
        const periodNames = {
            daily: 'デイリー',
            weekly: '週間',
            sekki: '節気間',
            monthly: '月間',
            quarterly: '3ヶ月'
        };
        
        if (!confirm(`${periodNames[period]}のAIコメントを生成しますか？`)) {
            return;
        }
        
        const loading = document.getElementById('aiCommentLoading');
        const content = document.getElementById('aiCommentContent');
        const noApiKey = document.getElementById('noApiKey');
        
        loading.classList.remove('hidden');
        content.classList.add('hidden');
        noApiKey.classList.add('hidden');
        
        try {
            const prompt = this.buildAIPrompt(period);
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-o3',
                    messages: [{
                        role: 'system',
                        content: 'You are a supportive coach for someone with ADHD tendencies. Provide encouraging, practical advice while being understanding of ADHD challenges. Write in Japanese. IMPORTANT: Always complete your sentences and thoughts. Never cut off mid-sentence. Ensure your response is a complete, coherent message.'
                    }, {
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.7,
                    max_tokens: period === 'quarterly' ? 3000 : period === 'monthly' ? 1500 : period === 'sekki' ? 1200 : period === 'weekly' ? 900 : 600
                })
            });
            
            if (!response.ok) {
                throw new Error('APIリクエストが失敗しました');
            }
            
            const data = await response.json();
            const message = data.choices[0].message.content;
            
            content.textContent = message;
            content.classList.remove('hidden');
            loading.classList.add('hidden');
            
            // ボタンのハイライト
            document.querySelectorAll('.ai-period-button').forEach(btn => {
                if (btn.dataset.period === period) {
                    btn.classList.add('bg-gray-800', 'text-white');
                    btn.classList.remove('bg-gray-200', 'text-gray-700');
                } else {
                    btn.classList.remove('bg-gray-800', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                }
            });
            
        } catch (error) {
            console.error('AI comment generation failed:', error);
            this.showError('AIコメントの生成に失敗しました');
            loading.classList.add('hidden');
            noApiKey.classList.remove('hidden');
        }
    },
    
    buildAIPrompt(period) {
        const now = new Date();
        const stats = this.gatherStatsForPeriod(period);
        const currentSekki = document.getElementById('currentSekki').textContent;
        const season = getActualSeason(now);
        
        let prompt = `現在は${currentSekki}の時期で、${season === 'spring' ? '春' : season === 'summer' ? '夏' : season === 'autumn' ? '秋' : '冬'}です。\n\n`;
        
        switch(period) {
            case 'daily':
                prompt += `今日のタスク実績:\n`;
                prompt += `- 通常タスク: ${stats.normalCompleted}/${stats.normalTotal}完了\n`;
                prompt += `- 目標タスク: ${stats.goalCompleted}/${stats.goalTotal}完了 (獲得ポイント: ${stats.pointsToday}pt)\n`;
                if (stats.todayReflection) {
                    prompt += `振り返り: ${stats.todayReflection}\n`;
                }
                if (stats.daysToNextSekki <= 3) {
                    prompt += `※${stats.daysToNextSekki}日後に${stats.nextSekkiName}に変わります\n`;
                }
                prompt += `\nADHD傾向がある私に、今日の振り返りと明日へのアドバイスを400文字程度でお願いします。${stats.daysToNextSekki <= 3 ? '節気の変わり目を意識したアドバイスも含めてください。' : ''}必ず最後まで完結した文章でお願いします。`;
                break;
                
            case 'weekly':
                prompt += `今週のタスク実績:\n`;
                prompt += `- 通常タスク: ${stats.normalCompleted}/${stats.normalTotal}完了\n`;
                prompt += `- 目標タスク: ${stats.goalCompleted}/${stats.goalTotal}完了\n`;
                prompt += `- 獲得ポイント: ${stats.totalPoints}pt\n`;
                prompt += `- 期限付きタスク: ${stats.deadlineCompleted}完了\n`;
                if (stats.weeklyReflections && stats.weeklyReflections.length > 0) {
                    prompt += `今週の振り返りテーマ: ${stats.weeklyReflections.join('、')}\n`;
                }
                prompt += `\nADHD傾向がある私に、今週の振り返りと来週へのアドバイスを600文字程度でお願いします。現在の${currentSekki}の季節感を意識したアドバイスを含めてください。必ず最後まで完結した文章でお願いします。`;
                break;
                
            case 'sekki':
                prompt += `${currentSekki}期間（${stats.sekkiStartDate}〜現在）のタスク実績:\n`;
                prompt += `- 実施日数: ${stats.activeDays}日\n`;
                prompt += `- 総ポイント: ${stats.totalPoints}pt\n`;
                prompt += `- 平均完了率: ${stats.avgCompletionRate}%\n`;
                prompt += `- 最も達成した目標タイプ: ${stats.topGoalTheme || 'まだデータがありません'}\n`;
                prompt += `\n${currentSekki}という節気の特徴と季節の変化を踏まえて、ADHD傾向がある私に季節に合わせた生活のアドバイスを800文字程度でお願いします。節気の意味や季節の風物詩、体調管理のポイントなども含めてください。必ず最後まで完結した文章でお願いします。`;
                break;
                
            case 'monthly':
                prompt += `今月のタスク実績:\n`;
                prompt += `- 実施日数: ${stats.activeDays}日\n`;
                prompt += `- 総ポイント: ${stats.totalPoints}pt\n`;
                prompt += `- 目標達成率: ${stats.goalCompletionRate}%\n`;
                prompt += `- 最も多かった振り返りテーマ: ${stats.commonReflectionTheme || '特になし'}\n`;
                prompt += `- 今月含まれる節気: ${stats.monthSekki.join('、')}\n`;
                prompt += `\nADHD傾向がある私に、今月の総括と来月の目標設定についてアドバイスを1000文字程度でお願いします。今月通過した節気の変化も踏まえた分析を含めてください。必ず最後まで完結した文章でお願いします。`;
                break;
                
            case 'quarterly':
                prompt += `過去3ヶ月のタスク実績:\n`;
                prompt += `- 実施日数: ${stats.activeDays}日\n`;
                prompt += `- 総ポイント: ${stats.totalPoints}pt\n`;
                prompt += `- 平均ポイント/日: ${stats.avgPointsPerDay}pt\n`;
                prompt += `- 最高連続日数: ${stats.maxStreak}日\n`;
                prompt += `- 成長傾向: ${stats.growthTrend}\n`;
                prompt += `- 3ヶ月間に経験した節気: ${stats.quarterSekki.join('、')}\n`;
                prompt += `- 季節の変化: ${stats.seasonalTransition}\n`;
                prompt += `\nADHD傾向がある私に、3ヶ月間の成長と今後の長期目標についてアドバイスを2000文字程度でお願いします。季節の移り変わりとともにどのような変化があったか、季節ごとのアドバイスも含めてください。必ず最後まで完結した文章でお願いします。`;
                break;
        }
        
        return prompt;
    },
    
    gatherStatsForPeriod(period) {
        const now = new Date();
        const stats = {};
        
        // 次の節気までの日数を計算
        const year = now.getFullYear();
        const allSekki = [...(sekkiData[year] || []), ...(sekkiData[year + 1] || [])];
        let nextSekki = null;
        for (const sekki of allSekki) {
            if (sekki.date > now) {
                nextSekki = sekki;
                break;
            }
        }
        if (nextSekki) {
            stats.daysToNextSekki = Math.ceil((nextSekki.date - now) / (1000 * 60 * 60 * 24));
            stats.nextSekkiName = nextSekki.name;
        }
        
        switch(period) {
            case 'daily':
                const todayTasks = this.getTodayTasks();
                stats.normalCompleted = todayTasks.filter(t => t.type === 'normal' && t.isCompleted).length;
                stats.normalTotal = todayTasks.filter(t => t.type === 'normal').length;
                stats.goalCompleted = todayTasks.filter(t => t.type === 'urgent' && t.isCompleted).length;
                stats.goalTotal = todayTasks.filter(t => t.type === 'urgent').length;
                stats.pointsToday = this.dailyPointHistory[now.toDateString()] || 0;
                stats.todayReflection = this.dailyReflections[now.toDateString()] || '';
                break;
                
            case 'weekly':
                stats.normalCompleted = 0;
                stats.normalTotal = 0;
                stats.goalCompleted = 0;
                stats.goalTotal = 0;
                stats.totalPoints = 0;
                stats.deadlineCompleted = 0;
                
                for (let i = 0; i < 7; i++) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toDateString();
                    const dayTasks = this.tasks.filter(t => new Date(t.scheduledFor).toDateString() === dateStr);
                    
                    stats.normalCompleted += dayTasks.filter(t => t.type === 'normal' && t.isCompleted).length;
                    stats.normalTotal += dayTasks.filter(t => t.type === 'normal').length;
                    stats.goalCompleted += dayTasks.filter(t => t.type === 'urgent' && t.isCompleted).length;
                    stats.goalTotal += dayTasks.filter(t => t.type === 'urgent').length;
                    stats.totalPoints += this.dailyPointHistory[dateStr] || 0;
                }
                
                stats.deadlineCompleted = this.deadlineTasks.filter(t => 
                    t.isCompleted && 
                    new Date(t.completedAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                ).length;
                break;
                
            case 'sekki':
                // 現在の節気の開始日を取得
                const currentSekkiData = this.getCurrentSekkiData();
                if (currentSekkiData) {
                    stats.sekkiStartDate = currentSekkiData.date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
                }
                
            case 'monthly':
            case 'quarterly':
                const days = period === 'sekki' ? 15 : period === 'monthly' ? 30 : 90;
                stats.activeDays = 0;
                stats.totalPoints = 0;
                let totalTasks = 0;
                let completedTasks = 0;
                let goalTasks = 0;
                let completedGoals = 0;
                const reflectionThemes = [];
                const weeklyReflectionSet = new Set();
                
                for (let i = 0; i < days; i++) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toDateString();
                    const dayTasks = this.tasks.filter(t => new Date(t.scheduledFor).toDateString() === dateStr);
                    
                    if (dayTasks.length > 0) stats.activeDays++;
                    totalTasks += dayTasks.length;
                    completedTasks += dayTasks.filter(t => t.isCompleted).length;
                    goalTasks += dayTasks.filter(t => t.type === 'urgent').length;
                    completedGoals += dayTasks.filter(t => t.type === 'urgent' && t.isCompleted).length;
                    stats.totalPoints += this.dailyPointHistory[dateStr] || 0;
                    
                    // 振り返りの収集
                    if (this.dailyReflections[dateStr]) {
                        reflectionThemes.push(this.dailyReflections[dateStr]);
                        if (period === 'weekly' && i < 7) {
                            weeklyReflectionSet.add(this.dailyReflections[dateStr].substring(0, 20) + '...');
                        }
                    }
                }
                
                if (period === 'weekly') {
                    stats.weeklyReflections = Array.from(weeklyReflectionSet).slice(0, 3);
                }
                
                stats.avgCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                stats.goalCompletionRate = goalTasks > 0 ? Math.round((completedGoals / goalTasks) * 100) : 0;
                stats.avgPointsPerDay = stats.activeDays > 0 ? (stats.totalPoints / stats.activeDays).toFixed(1) : 0;
                
                // 期間中の節気を収集
                if (period === 'monthly' || period === 'quarterly') {
                    const sekkiSet = new Set();
                    const startDate = new Date(now);
                    startDate.setDate(startDate.getDate() - days);
                    
                    for (const sekki of allSekki) {
                        if (sekki.date >= startDate && sekki.date <= now) {
                            sekkiSet.add(sekki.name);
                        }
                    }
                    
                    if (period === 'monthly') {
                        stats.monthSekki = Array.from(sekkiSet);
                    } else {
                        stats.quarterSekki = Array.from(sekkiSet);
                        
                        // 季節の変化を分析
                        const startSeason = getActualSeason(startDate);
                        const endSeason = getActualSeason(now);
                        if (startSeason === endSeason) {
                            stats.seasonalTransition = `${this.getSeasonName(startSeason)}の期間`;
                        } else {
                            stats.seasonalTransition = `${this.getSeasonName(startSeason)}から${this.getSeasonName(endSeason)}へ`;
                        }
                    }
                }
                
                if (period === 'quarterly') {
                    // 連続日数計算
                    let currentStreak = 0;
                    stats.maxStreak = 0;
                    
                    for (let i = 0; i < days; i++) {
                        const date = new Date(now);
                        date.setDate(date.getDate() - i);
                        const dayTasks = this.tasks.filter(t => 
                            new Date(t.scheduledFor).toDateString() === date.toDateString() && 
                            t.isCompleted
                        );
                        
                        if (dayTasks.length > 0) {
                            currentStreak++;
                            stats.maxStreak = Math.max(stats.maxStreak, currentStreak);
                        } else {
                            currentStreak = 0;
                        }
                    }
                    
                    // 成長傾向分析
                    const firstMonthPoints = this.calculateMonthPoints(2);
                    const lastMonthPoints = this.calculateMonthPoints(0);
                    
                    if (lastMonthPoints > firstMonthPoints * 1.2) {
                        stats.growthTrend = '上昇傾向';
                    } else if (lastMonthPoints < firstMonthPoints * 0.8) {
                        stats.growthTrend = '下降傾向';
                    } else {
                        stats.growthTrend = '安定';
                    }
                }
                break;
        }
        
        return stats;
    },
    
    calculateMonthPoints(monthsAgo) {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
        let points = 0;
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            points += this.dailyPointHistory[d.toDateString()] || 0;
        }
        
        return points;
    },
    
    getCurrentSekkiData() {
        const now = new Date();
        const year = now.getFullYear();
        const allSekki = [...(sekkiData[year - 1] || []), ...(sekkiData[year] || []), ...(sekkiData[year + 1] || [])];
        let currentSekki = null;
        
        for (const sekki of allSekki) {
            if (now >= sekki.date) {
                currentSekki = sekki;
            } else {
                break;
            }
        }
        
        return currentSekki;
    },
    
    getSeasonName(season) {
        return season === 'spring' ? '春' : season === 'summer' ? '夏' : season === 'autumn' ? '秋' : '冬';
    },
    
    render() {
        const selectedDateTasks = this.getTodayTasks(); 
        const completedCount = selectedDateTasks.filter(t => t.isCompleted).length;
        const isToday = this.selectedDate.toDateString() === new Date().toDateString();

        const dateDetails = this.formatDateDetails(this.selectedDate);
        document.getElementById('currentDateYear').textContent = dateDetails.year;
        document.getElementById('currentDate').textContent = dateDetails.date;
        document.getElementById('currentDateDay').textContent = dateDetails.day;
        
        // Highlight today's date
        const calendarToggle = document.getElementById('calendarToggle');
        if (dateDetails.isToday) {
            calendarToggle.classList.add('bg-amber-50', 'border-amber-400');
            calendarToggle.classList.remove('border-gray-300');
        } else {
            calendarToggle.classList.remove('bg-amber-50', 'border-amber-400');
            calendarToggle.classList.add('border-gray-300');
        }
        document.getElementById('todayButton').classList.toggle('hidden', isToday);
        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('totalCount').textContent = selectedDateTasks.length;
        document.getElementById('totalPointsDisplay').textContent = this.totalPoints;
        document.getElementById('totalPointsStats').textContent = this.totalPoints;

        const activeNormalCount = selectedDateTasks.filter(t => t.type === 'normal' && !t.isCompleted).length;
        const activeUrgentCount = selectedDateTasks.filter(t => t.type === 'urgent' && !t.isCompleted).length;
        document.getElementById('normalSlots').textContent = Math.max(0, 3 - activeNormalCount);
        document.getElementById('urgentSlots').textContent = Math.max(0, 3 - activeUrgentCount);
        document.getElementById('normalType').disabled = (3 - activeNormalCount) <= 0;
        document.getElementById('urgentType').disabled = (3 - activeUrgentCount) <= 0;

        const taskList = document.getElementById('taskList');
        taskList.innerHTML = ''; 
        
        selectedDateTasks.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)).forEach((task, index) => { 
            const taskEl = document.createElement('div');
            let taskSpecificClass = '';
            if (task.isCompleted) { taskSpecificClass = 'task-completed'; } 
            else if (task.type === 'urgent') { taskSpecificClass = 'task-urgent-active'; } 
            else { taskSpecificClass = 'task-normal-active'; }
            taskEl.className = `washi-card task-card rounded-xl p-4 mobile-compact transition-all animate-fadeInUp ${taskSpecificClass}`;
            taskEl.style.animationDelay = `${index * 0.05}s`; 
            
            taskEl.innerHTML = `
                <div class="flex items-center gap-3">
                    <button data-task-id="${task.id}" class="task-toggle-button flex-shrink-0 wa-checkbox ${task.isCompleted ? 'checked' : ''} flex items-center justify-center rounded-md"></button>
                    <div class="flex-1 min-w-0">
                        <p class="task-text-lg break-words">${task.text}</p> <!-- Removed specific color classes here, handled by parent -->
                        <div class="flex items-center gap-3 mt-1">
                            <span class="task-type-label"> <!-- Styling now comes from parent context -->
                                ${task.type === 'urgent' ? `【目標】${task.points ? ` ${task.points}pt` : ''}` : '【通常】'}
                            </span>
                            ${task.completedAt ? `<span class="task-completed-badge"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>完了!</span>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        ${!task.isCompleted ? `
                            <button data-task-id="${task.id}" class="task-postpone-button p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center" title="明日へ">
                                <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        ` : ''}
                        <button data-task-id="${task.id}" class="task-delete-button p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all text-xl leading-none min-w-[44px] min-h-[44px] flex items-center justify-center" title="削除">×</button>
                    </div>
                </div>
            `;
            taskList.appendChild(taskEl);
        });

        document.getElementById('noTasks').classList.toggle('hidden', selectedDateTasks.length > 0);

        const deadlineList = document.getElementById('deadlineList');
        deadlineList.innerHTML = '';
        this.deadlineTasks
            .sort((a,b) => { /* Sort logic unchanged */
                if (a.isCompleted && !b.isCompleted) return 1;
                if (!a.isCompleted && b.isCompleted) return -1;
                const daysA = this.getDaysUntilDeadline(a.deadline);
                const daysB = this.getDaysUntilDeadline(b.deadline);
                if (daysA !== daysB) return daysA - daysB;
                return new Date(a.createdAt) - new Date(b.createdAt);
            })
            .forEach(task => {
            const daysLeft = this.getDaysUntilDeadline(task.deadline);
            const isUrgent = daysLeft <= 3 && daysLeft >=0 && !task.isCompleted; 
            const isOverdue = daysLeft < 0 && !task.isCompleted;
            const taskEl = document.createElement('div');
            taskEl.className = `p-3 rounded-lg border transition-all ${ task.isCompleted ? 'border-gray-300 bg-gray-50 opacity-60' : isOverdue ? 'border-red-400 bg-red-50' : isUrgent ? 'border-orange-400 bg-orange-50' : 'border-gray-300 bg-gray-50' }`;
            taskEl.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <p class="text-sm sm:text-base font-medium break-words ${task.isCompleted ? 'text-green-700' : 'text-gray-800'}">${task.text}</p>
                        <p class="text-xs sm:text-sm mt-1 ${ task.isCompleted ? 'text-gray-500' : isOverdue ? 'text-red-700 font-medium' : isUrgent ? 'text-orange-700 font-medium' : 'text-gray-600' }">
                            ${task.isCompleted ? `✓ 完了済み (${new Date(task.completedAt).toLocaleDateString('ja-JP', {month:'numeric', day:'numeric'})})` : isOverdue ? `${Math.abs(daysLeft)}日超過` : daysLeft === 0 ? '本日まで' : `あと${daysLeft}日`}
                            ・期限: ${new Date(task.deadline).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                        </p>
                    </div>
                    <!-- Action buttons for deadline tasks -->
                    <div class="flex items-center gap-1 ml-2">
                        <button data-task-id="${task.id}" class="deadline-task-toggle-button flex-shrink-0 wa-checkbox ${task.isCompleted ? 'checked' : ''} flex items-center justify-center rounded-md" style="min-width: 36px; min-height: 36px; width: 36px; height: 36px;"></button>
                        <!-- NEW: Delete button for deadline task -->
                        <button data-task-id="${task.id}" class="deadline-task-delete-button p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all text-lg leading-none" title="削除">×</button>
                    </div>
                </div>
            `;
            deadlineList.appendChild(taskEl);
        });

        const activeDeadlines = this.deadlineTasks.filter(t => !t.isCompleted).length;
        document.getElementById('noDeadlineTasks').classList.toggle('hidden', this.deadlineTasks.length > 0);
        const deadlineToggleButton = document.getElementById('deadlineToggle');
        deadlineToggleButton.disabled = activeDeadlines >= 3;
        deadlineToggleButton.querySelector('svg').style.opacity = activeDeadlines >= 3 ? '0.3' : '1';

        const inboxList = document.getElementById('inboxList');
        inboxList.innerHTML = '';
        this.inboxItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg text-gray-700 border border-gray-200 text-sm';
            itemEl.innerHTML = `
                <span class="break-all">${item.text}</span>
                <button data-item-id="${item.id}" class="inbox-item-delete-button ml-2 p-1 text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
            `;
            inboxList.appendChild(itemEl);
        });
        
        // 振り返り表示
        const dateStr = this.selectedDate.toDateString();
        const reflection = this.dailyReflections[dateStr];
        const reflectionDisplay = document.getElementById('reflectionDisplay');
        const noReflection = document.getElementById('noReflection');
        
        if (reflection) {
            reflectionDisplay.textContent = reflection;
            reflectionDisplay.classList.remove('hidden');
            noReflection.classList.add('hidden');
        } else {
            reflectionDisplay.classList.add('hidden');
            noReflection.classList.remove('hidden');
        }
        
        // AIコメント表示
        const aiCommentDisplay = document.getElementById('aiCommentDisplay');
        const noApiKey = document.getElementById('noApiKey');
        const aiCommentContent = document.getElementById('aiCommentContent');
        const aiCommentLoading = document.getElementById('aiCommentLoading');
        
        if (this.openaiApiKey) {
            noApiKey.classList.add('hidden');
            if (!aiCommentContent.textContent && !aiCommentLoading.classList.contains('hidden')) {
                aiCommentContent.classList.add('hidden');
            }
        } else {
            noApiKey.classList.remove('hidden');
            aiCommentContent.classList.add('hidden');
            aiCommentLoading.classList.add('hidden');
        }
        
        this.bindDynamicEvents();
    },

    bindDynamicEvents() {
        document.querySelectorAll('.task-toggle-button').forEach(button => { button.addEventListener('click', (e) => this.toggleTask(e.currentTarget.dataset.taskId)); });
        document.querySelectorAll('.task-postpone-button').forEach(button => { button.addEventListener('click', (e) => this.postponeTask(e.currentTarget.dataset.taskId)); });
        document.querySelectorAll('.task-delete-button').forEach(button => { button.addEventListener('click', (e) => this.deleteTask(e.currentTarget.dataset.taskId)); });
        
        document.querySelectorAll('.deadline-task-toggle-button').forEach(button => { button.addEventListener('click', (e) => this.toggleDeadlineTask(e.currentTarget.dataset.taskId)); });
        // --- NEW: Bind delete for deadline tasks ---
        document.querySelectorAll('.deadline-task-delete-button').forEach(button => {
            button.addEventListener('click', (e) => this.deleteDeadlineTask(e.currentTarget.dataset.taskId));
        });

        document.querySelectorAll('.inbox-item-delete-button').forEach(button => { button.addEventListener('click', (e) => this.deleteInboxItem(e.currentTarget.dataset.itemId)); });
        document.querySelectorAll('button:not([data-ripple-bound])').forEach(button => {
            button.style.position = 'relative'; 
            button.style.overflow = 'hidden';  
            button.addEventListener('click', createRipple);
            button.setAttribute('data-ripple-bound', 'true'); 
        });
    }
};
app.init();

// Initialize calendar input on load
const dateInputEl = document.getElementById('dateInput');
dateInputEl.value = app.selectedDate.toISOString().split('T')[0];
app.updateCalendarSekkiInfo();

// Service Workerの登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => console.log('ServiceWorker registration successful:', registration.scope))
            .catch(err => console.log('ServiceWorker registration failed:', err));
    });
}

// PWAインストールプロンプト
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // インストールボタンは表示しない
});