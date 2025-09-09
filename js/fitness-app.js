// フィットネス機能本体（UI + ロジック）

const FX_KEYS = {
  activities: 'fitness_activities',
  profile: 'fitness_profile',
  totals: 'fitness_totals',
  unlocked: 'fitness_unlocked'
};

const FX_DEFAULT_PROFILE = {
  level: 1,
  totalXp: 0,
  nextLevelRequiredXp: req(1),
  settings: { distanceWeight: 12, timeWeight: 5, speedAlerts: true }
};

// XP必要量
function req(L){ return Math.round(120 + 30 * Math.pow(L, 1.2)); }

// XP計算（ラン>=2倍）
function calcXp(type, distanceKm, minutes, settings = FX_DEFAULT_PROFILE.settings){
  const base = settings.distanceWeight * Math.pow(distanceKm, 0.9) + settings.timeWeight * Math.sqrt(Math.max(0, minutes));
  const k = type === 'run' ? 2.4 : type === 'walk' ? 1.2 : 1.0;
  return Math.round(base * k);
}

function todayStr(d = new Date()){
  const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return dt.toISOString().slice(0,10);
}

function genId(){ return 'a' + Math.random().toString(36).slice(2,8) + Date.now().toString(36); }

// ストレージ
function loadJSON(key, fallback){ try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
function saveJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

// Totals再計算（単純実装）
function recomputeTotals(acts){
  const byType = { run: {distanceKm:0, minutes:0, count:0}, walk:{distanceKm:0, minutes:0, count:0}, cycle:{distanceKm:0, minutes:0, count:0} };
  const daySet = new Set();
  let totalMinutes = 0;
  for(const a of acts){
    if(!byType[a.type]) continue;
    byType[a.type].distanceKm += a.distanceKm;
    byType[a.type].minutes += a.minutes;
    byType[a.type].count += 1;
    totalMinutes += a.minutes;
    daySet.add(a.date);
  }
  const weightedTotalKm = +(2.5*byType.run.distanceKm + 1.25*byType.walk.distanceKm + byType.cycle.distanceKm).toFixed(2);
  return { byType, weightedTotalKm, totalMinutes, uniqueDays: daySet.size };
}

// 称号解放
function unlockAchievementsIfReached(unlocked, totals){
  const newly = [];
  const data = window.FitnessAchievements;
  const now = new Date().toISOString();

  function tryUnlock(list, value){
    for(const ach of list){
      if(unlocked[ach.id]) continue;
      if(value >= ach.threshold){ unlocked[ach.id] = now; newly.push(ach); }
    }
  }

  tryUnlock(data.sum, totals.weightedTotalKm);
  tryUnlock(data.run, totals.byType.run.distanceKm);
  tryUnlock(data.walk, totals.byType.walk.distanceKm);
  tryUnlock(data.cycle, totals.byType.cycle.distanceKm);
  tryUnlock(data.time, totals.totalMinutes);
  tryUnlock(data.days, totals.uniqueDays);
  return newly;
}

// UI
const $ = sel => document.querySelector(sel);

function setDateDefault(){
  const el = $('#fxDate');
  const d = new Date();
  el.value = todayStr(d);
}

function abnormalSpeedWarning(type, distanceKm, minutes){
  const hours = minutes/60;
  const spd = hours>0 ? distanceKm/hours : 0;
  const limit = type==='run' ? 25 : type==='walk' ? 9 : 60;
  if(spd>limit){ return `速度が高すぎます（約${spd.toFixed(1)}km/h > ${limit}km/h）。保存しますか？`; }
  return null;
}

function renderDashboard(totals, profile){
  $('#fxLevel').textContent = `Lv ${profile.level}`;
  const xpPct = Math.min(100, Math.floor((profile.totalXp/profile.nextLevelRequiredXp)*100));
  $('#fxXpBar').style.width = xpPct + '%';
  $('#fxXpText').textContent = `${profile.totalXp} / ${profile.nextLevelRequiredXp} XP`;

  $('#fxWeighted').textContent = `${totals.weightedTotalKm.toFixed(2)} km`;
  $('#fxTotalMin').textContent = `${totals.totalMinutes} 分`;
  $('#fxDays').textContent = `${totals.uniqueDays} 日`;
  $('#fxRunKm').textContent = `${totals.byType.run.distanceKm.toFixed(2)} km`;
  $('#fxWalkKm').textContent = `${totals.byType.walk.distanceKm.toFixed(2)} km`;
  $('#fxCycleKm').textContent = `${totals.byType.cycle.distanceKm.toFixed(2)} km`;
}

function renderHistory(acts){
  const wrap = $('#fxHistory');
  wrap.innerHTML = '';
  const sorted = [...acts].sort((a,b)=> (a.date>b.date?-1: a.date<b.date?1:0) || b.addedAt.localeCompare(a.addedAt));
  for(const a of sorted.slice(0,200)){
    const spd = a.minutes>0 ? (a.distanceKm/(a.minutes/60)).toFixed(1) : '-';
    const el = document.createElement('div');
    el.className = 'flex items-center justify-between bg-white/60 rounded-lg px-3 py-2';
    el.innerHTML = `
      <div class="text-sm text-gray-700">
        <span class="font-medium">${labelType(a.type)}</span>
        <span class="ml-2">${a.distanceKm.toFixed(2)}km / ${a.minutes}分</span>
        <span class="ml-2 text-gray-500">${a.date}</span>
        ${a.note?`<span class="ml-2 text-gray-500">${escapeHtml(a.note)}</span>`:''}
      </div>
      <div class="text-xs text-gray-500">${spd} km/h</div>
    `;
    wrap.appendChild(el);
  }
}

function labelType(t){ return t==='run'?'ラン': t==='walk'?'ウォーク':'サイクル'; }
function escapeHtml(s){ return s.replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

function renderTitles(unlocked, totals){
  const data = window.FitnessAchievements;
  const cats = ['sum','run','walk','cycle','time','days'];
  const summary = cats.map(c=>{
    const total = data[c].length; const got = data[c].filter(a=>unlocked[a.id]).length;
    return `${catLabel(c)}: ${got}/${total}`;
  }).join(' ｜ ');
  $('#fxTitlesSummary').textContent = summary;

  // 次に近い目標（各カテゴリ1つ）
  const nexts = cats.map(c=>{
    const list = data[c];
    const value = catValue(c, totals);
    const candidate = list.find(a=>!unlocked[a.id] && value < a.threshold);
    if(candidate){
      const remain = (candidate.threshold - value);
      const remainStr = c==='time'? `${Math.max(0,Math.ceil(remain))}分` : c==='days'? `${Math.max(0,Math.ceil(remain))}日` : `${Math.max(0,remain).toFixed(2)}km`;
      return `${catLabel(c)} 次の称号「${candidate.name}」まで ${remainStr}`;
    }
    return `${catLabel(c)} は全て解放済み！`;
  });
  $('#fxNextTargets').innerHTML = nexts.map(x=>`<div class="mb-1">${x}</div>`).join('');
}

function catLabel(c){ return c==='sum'?'総合': c==='run'?'ラン距離': c==='walk'?'ウォーク距離': c==='cycle'?'サイクル距離': c==='time'?'総時間': '累計日数'; }
function catValue(c, totals){
  switch(c){
    case 'sum': return totals.weightedTotalKm; 
    case 'run': return totals.byType.run.distanceKm; 
    case 'walk': return totals.byType.walk.distanceKm; 
    case 'cycle': return totals.byType.cycle.distanceKm; 
    case 'time': return totals.totalMinutes; 
    case 'days': return totals.uniqueDays; 
  }
}

function showLevelUp(level){
  const overlay = document.getElementById('levelUpOverlay');
  const txt = document.getElementById('levelUpText');
  txt.textContent = `Level Up! Lv ${level}`;
  overlay.classList.remove('hidden');
  setTimeout(()=> overlay.classList.add('hidden'), 1400);
}

function exportData(acts, profile, totals, unlocked){
  const data = { exportDate: new Date().toISOString(), activities: acts, profile, totals, unlocked };
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `fitness-export-${todayStr()}.json`; a.click();
  URL.revokeObjectURL(url);
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  setDateDefault();

  let activities = loadJSON(FX_KEYS.activities, []);
  let profile = loadJSON(FX_KEYS.profile, FX_DEFAULT_PROFILE);
  let unlocked = loadJSON(FX_KEYS.unlocked, {});
  let totals = recomputeTotals(activities);

  renderDashboard(totals, profile);
  renderHistory(activities);
  renderTitles(unlocked, totals);

  document.getElementById('fxSave').addEventListener('click', () => {
    const type = document.getElementById('fxType').value;
    const distanceKm = parseFloat(document.getElementById('fxDistance').value || '0');
    const minutes = parseInt(document.getElementById('fxMinutes').value || '0', 10);
    const date = document.getElementById('fxDate').value || todayStr();
    const note = document.getElementById('fxNote').value || '';

    // 入力チェック
    if(!(type==='run'||type==='walk'||type==='cycle')){ alert('種目を選択してください'); return; }
    if(!(distanceKm>0 && distanceKm<=200)){ alert('距離は0〜200kmで入力してください'); return; }
    if(!(minutes>=1 && minutes<=600)){ alert('分は1〜600の範囲で入力してください'); return; }

    const warn = profile.settings.speedAlerts ? abnormalSpeedWarning(type, distanceKm, minutes) : null;
    if(warn && !confirm(warn)) return;

    const act = { id: genId(), type, distanceKm: Math.round(distanceKm*100)/100, minutes, date, note, addedAt: new Date().toISOString() };
    activities.push(act);
    saveJSON(FX_KEYS.activities, activities);

    // 再計算
    totals = recomputeTotals(activities);
    saveJSON(FX_KEYS.totals, totals);

    // XP/レベル
    const gained = calcXp(type, distanceKm, minutes, profile.settings);
    let levelUps = 0;
    profile.totalXp += gained;
    while(profile.totalXp >= profile.nextLevelRequiredXp){
      profile.totalXp -= profile.nextLevelRequiredXp;
      profile.level += 1; levelUps += 1;
      profile.nextLevelRequiredXp = req(profile.level);
    }
    saveJSON(FX_KEYS.profile, profile);

    // 称号
    const newly = unlockAchievementsIfReached(unlocked, totals);
    if(newly.length>0){ saveJSON(FX_KEYS.unlocked, unlocked); }

    // UI更新
    renderDashboard(totals, profile);
    renderHistory(activities);
    renderTitles(unlocked, totals);

    // 結果表示
    document.getElementById('fxResult').textContent = `+${gained} XP を獲得しました。` + (newly.length? ` 新たな称号を ${newly.length} 件解放！` : '');
    if(levelUps>0) showLevelUp(profile.level);

    // 入力欄の距離・分だけクリア
    document.getElementById('fxDistance').value = '';
    document.getElementById('fxMinutes').value = '';
    document.getElementById('fxNote').value = '';
  });

  document.getElementById('fxExport').addEventListener('click', ()=> exportData(activities, profile, totals, unlocked));
});

