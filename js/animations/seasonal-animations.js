// 実際の季節を月から判定する関数
function getActualSeason(date) {
    const month = date.getMonth() + 1; // 0-11 を 1-12 に変換
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
}

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
        frost.style.top = 60 + Math.random() * 40 + '%';
        frost.style.animationDelay = Math.random() * 4 + 's';
        frost.style.transform = `scale(${0.7 + Math.random() * 0.6})`;
        container.appendChild(frost);
    }
}

function createBareBranches(container, count) {
    for (let i = 0; i < count; i++) {
        const branch = document.createElement('div');
        branch.className = 'bare-branch';
        branch.style.left = Math.random() * 80 + 10 + '%';
        branch.style.bottom = Math.random() * 50 + '%';
        branch.style.animationDelay = Math.random() * 8 + 's';
        branch.style.transform = `scale(${0.8 + Math.random() * 0.4})`;
        container.appendChild(branch);
    }
}

function createLightSnow(container, count) {
    for (let i = 0; i < count; i++) {
        const snow = document.createElement('div');
        snow.className = 'light-snow';
        snow.style.left = Math.random() * 100 + '%';
        snow.style.animationDelay = Math.random() * 6 + 's';
        snow.style.animationDuration = (5 + Math.random() * 3) + 's';
        container.appendChild(snow);
    }
}

function createHeavySnow(container, count) {
    for (let i = 0; i < count; i++) {
        const snow = document.createElement('div');
        snow.className = 'heavy-snow';
        snow.style.left = Math.random() * 100 + '%';
        snow.style.animationDelay = Math.random() * 4 + 's';
        snow.style.animationDuration = (3 + Math.random() * 2) + 's';
        snow.style.transform = `scale(${0.8 + Math.random() * 0.4})`;
        container.appendChild(snow);
    }
}

function createCandleFlame(container, count) {
    const candle = document.createElement('div');
    candle.className = 'candle-flame';
    candle.style.left = '50%';
    candle.style.bottom = '30%';
    candle.style.transform = 'translateX(-50%)';
    container.appendChild(candle);
}

function createYuzu(container, count) {
    for (let i = 0; i < count; i++) {
        const yuzu = document.createElement('div');
        yuzu.className = 'yuzu interactive-element';
        yuzu.style.left = Math.random() * 80 + 10 + '%';
        yuzu.style.top = 40 + Math.random() * 40 + '%';
        yuzu.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(yuzu);
    }
}

// Setup interactive elements
function setupInteractiveElements(container) {
    const elements = container.querySelectorAll('.interactive-element');
    elements.forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            this.style.opacity = '0';
            setTimeout(() => {
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            }, 500);
        });
        
        el.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.opacity = '0';
            setTimeout(() => {
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            }, 500);
        }, { passive: false });
    });
}

// Create ripple effect
function createRippleEffect(e, button) {
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