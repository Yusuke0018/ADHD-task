// フィットネス機能本体（UI + ロジック）

const FX_KEYS = {
  activities: 'fitness_activities',
  profile: 'fitness_profile',
  totals: 'fitness_totals',
  unlocked: 'fitness_unlocked',
  goals: 'fitness_weekly_goals'
};

const FX_DEFAULT_PROFILE = {
  level: 1,
  totalXp: 0,
  nextLevelRequiredXp: req(1),
  settings: { distanceWeight: 12, timeWeight: 5, speedAlerts: true },
  equippedIds: []
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

// 週キー（ISO月曜開始）
function weekKey(isoDate){
  const d = new Date(isoDate + 'T00:00:00');
  const day = d.getDay(); // 0=Sun..6=Sat
  const diffToMon = (day + 6) % 7; // Mon=0
  d.setDate(d.getDate() - diffToMon);
  return d.toISOString().slice(0,10);
}

// コンボ判定
function evalCombos(activities, totals, unlocked){
  const newly = [];
  const combos = window.FitnessAchievements.combo;
  const now = new Date().toISOString();

  // 前計算: 日別集計、日別タイプ集合、週別集計
  const byDay = {};
  const typesByDay = {};
  const weekAgg = {};
  for(const a of activities){
    // 日別
    if(!byDay[a.date]) byDay[a.date] = { distance:0, minutes:0, byType:{run:0,walk:0,cycle:0}, earlyMinutes:0 };
    byDay[a.date].distance += a.distanceKm;
    byDay[a.date].minutes += a.minutes;
    byDay[a.date].byType[a.type] += a.distanceKm;
    // 6時まで
    if(a.time){
      const [hh,mm] = a.time.split(':').map(Number);
      if(hh<6 || (hh===6 && mm===0)) byDay[a.date].earlyMinutes += a.minutes;
    }
    // タイプ集合
    if(!typesByDay[a.date]) typesByDay[a.date] = new Set();
    typesByDay[a.date].add(a.type);
    // 週別
    const wk = weekKey(a.date);
    if(!weekAgg[wk]) weekAgg[wk] = { run:0, walk:0, cycle:0, minutes:0 };
    weekAgg[wk][a.type] += a.distanceKm;
    weekAgg[wk].minutes += a.minutes;
  }

  function unlockByCode(code){
    const ach = combos.find(c=>c.code===code);
    if(ach && !unlocked[ach.id]){ unlocked[ach.id]=now; newly.push(ach); }
  }

  // daily_all_three
  for(const d in typesByDay){ if(typesByDay[d].size===3){ unlockByCode('daily_all_three'); break; } }
  // daily_before6_60min
  for(const d in byDay){ if(byDay[d].earlyMinutes>=60){ unlockByCode('daily_before6_60min'); break; } }
  // daily_30km
  for(const d in byDay){ if(byDay[d].distance>=30){ unlockByCode('daily_30km'); break; } }
  // daily_6h (360min)
  for(const d in byDay){ if(byDay[d].minutes>=360){ unlockByCode('daily_6h'); break; } }
  // daily_180min
  for(const d in byDay){ if(byDay[d].minutes>=180){ unlockByCode('daily_180min'); break; } }
  // daily_two_types_10km（任意の2種目で各10km以上）
  for(const d in byDay){
    const t = byDay[d].byType;
    const pairs = [(t.run>=10 && t.walk>=10),(t.run>=10 && t.cycle>=10),(t.walk>=10 && t.cycle>=10)];
    if(pairs.some(Boolean)){ unlockByCode('daily_two_types_10km'); break; }
  }
  // weekly_run20_walk20 / weekly_walk40_run30
  for(const w in weekAgg){
    const wa = weekAgg[w];
    if(wa.run>=20 && wa.walk>=20) unlockByCode('weekly_run20_walk20');
    if(wa.walk>=40 && wa.run>=30) unlockByCode('weekly_walk40_run30');
  }
  // sum_titles_10（総合称号10個以上）
  const sumList = window.FitnessAchievements.sum;
  const sumUnlocked = sumList.filter(a=>unlocked[a.id]).length;
  if(sumUnlocked>=10) unlockByCode('sum_titles_10');
  // top_any_category_completed（各カテゴリ最上位称号を1つ以上）
  const topIds = [
    'sum_'+String(window.FitnessAchievements.sum.length).padStart(4,'0'),
    'run_'+String(window.FitnessAchievements.run.length).padStart(4,'0'),
    'walk_'+String(window.FitnessAchievements.walk.length).padStart(4,'0'),
    'cycle_'+String(window.FitnessAchievements.cycle.length).padStart(4,'0'),
    'time_'+String(window.FitnessAchievements.time.length).padStart(4,'0'),
    'days_'+String(window.FitnessAchievements.days.length).padStart(4,'0')
  ];
  if(topIds.some(id=>unlocked[id])) unlockByCode('top_any_category_completed');

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
  const cats = ['sum','run','walk','cycle','time','days','combo'];
  const summary = cats.map(c=>{
    const total = data[c].length; const got = data[c].filter(a=>unlocked[a.id]).length;
    return `${catLabel(c)}: ${got}/${total}`;
  }).join(' ｜ ');
  $('#fxTitlesSummary').textContent = summary;

  // 次に近い目標（各カテゴリ1つ）
  const nexts = ['sum','run','walk','cycle','time','days'].map(c=>{
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

function isMilestone(level){ return [5,10,20,30,50].includes(level); }

function showLevelUp(level){
  const overlay = document.getElementById('levelUpOverlay');
  const txt = document.getElementById('levelUpText');
  txt.textContent = `Level Up! Lv ${level}`;
  overlay.classList.remove('hidden');
  setTimeout(()=> overlay.classList.add('hidden'), 1400);
}

function showLevelUpLarge(level){
  const overlay = document.getElementById('levelUpOverlayLarge');
  const txt = document.getElementById('levelUpTextLarge');
  txt.textContent = `Lv ${level} 到達！`;
  overlay.classList.remove('hidden');
  setTimeout(()=> overlay.classList.add('hidden'), 2200);
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
  let goals = loadJSON(FX_KEYS.goals, { run:15, walk:20, cycle:60 });

  renderDashboard(totals, profile);
  renderHistory(activities);
  renderTitles(unlocked, totals);
  renderGoals(activities, goals);

  document.getElementById('fxSave').addEventListener('click', () => {
    const type = document.getElementById('fxType').value;
    const distanceKm = parseFloat(document.getElementById('fxDistance').value || '0');
    const minutes = parseInt(document.getElementById('fxMinutes').value || '0', 10);
    const date = document.getElementById('fxDate').value || todayStr();
    const time = document.getElementById('fxTime').value || '';
    const note = document.getElementById('fxNote').value || '';

    // 入力チェック
    if(!(type==='run'||type==='walk'||type==='cycle')){ alert('種目を選択してください'); return; }
    if(!(distanceKm>0 && distanceKm<=200)){ alert('距離は0〜200kmで入力してください'); return; }
    if(!(minutes>=1 && minutes<=600)){ alert('分は1〜600の範囲で入力してください'); return; }

    const warn = profile.settings.speedAlerts ? abnormalSpeedWarning(type, distanceKm, minutes) : null;
    if(warn && !confirm(warn)) return;

    const act = { id: genId(), type, distanceKm: Math.round(distanceKm*100)/100, minutes, date, time, note, addedAt: new Date().toISOString() };
    activities.push(act);
    saveJSON(FX_KEYS.activities, activities);

    // 再計算
    totals = recomputeTotals(activities);
    saveJSON(FX_KEYS.totals, totals);

    // XP/レベル
    const gained = calcXp(type, distanceKm, minutes, profile.settings);
    let levelUps = 0; let reachedMilestone = false;
    profile.totalXp += gained;
    while(profile.totalXp >= profile.nextLevelRequiredXp){
      profile.totalXp -= profile.nextLevelRequiredXp;
      profile.level += 1; levelUps += 1; if(isMilestone(profile.level)) reachedMilestone = true;
      profile.nextLevelRequiredXp = req(profile.level);
    }
    saveJSON(FX_KEYS.profile, profile);

    // 称号
    const newly = [
      ...unlockAchievementsIfReached(unlocked, totals),
      ...evalCombos(activities, totals, unlocked)
    ];
    if(newly.length>0){ saveJSON(FX_KEYS.unlocked, unlocked); }

    // UI更新
    renderDashboard(totals, profile);
    renderHistory(activities);
    renderTitles(unlocked, totals);
    renderGoals(activities, goals);

    // 結果表示
    document.getElementById('fxResult').textContent = `+${gained} XP を獲得しました。` + (newly.length? ` 新たな称号を ${newly.length} 件解放！` : '');
    if(levelUps>0){
      if(reachedMilestone) showLevelUpLarge(profile.level); else showLevelUp(profile.level);
    }

    // 入力欄の距離・分だけクリア
    document.getElementById('fxDistance').value = '';
    document.getElementById('fxMinutes').value = '';
    document.getElementById('fxNote').value = '';
  });

  document.getElementById('fxExport').addEventListener('click', ()=> exportData(activities, profile, totals, unlocked));

  // 装備バッジUI
  const equipWrap = document.getElementById('fxEquipList');
  const equipBtn = document.getElementById('fxToggleEquip');
  equipBtn.addEventListener('click', ()=>{
    if(equipWrap.classList.contains('hidden')){ renderEquipList(); equipWrap.classList.remove('hidden'); } else { equipWrap.classList.add('hidden'); }
  });
  renderEquipped();

  function allAchievements(){
    const d = window.FitnessAchievements; return ['sum','run','walk','cycle','time','days','combo'].flatMap(c=> d[c].map(a=> ({...a, category:c})) );
  }

  function renderEquipped(){
    const box = document.getElementById('fxEquipped');
    box.innerHTML = '';
    const ids = profile.equippedIds || [];
    const map = new Map(allAchievements().map(a=>[a.id,a]));
    for(const id of ids){ if(!map.has(id)) continue; const a = map.get(id);
      const tag = document.createElement('span');
      tag.className = 'px-2 py-1 rounded-full text-xs bg-blue-600 text-white';
      tag.textContent = a.name;
      box.appendChild(tag);
    }
    if(ids.length===0){ box.innerHTML = '<div class="text-sm text-gray-500">未装備</div>'; }
  }

  function renderEquipList(){
    const ids = profile.equippedIds || [];
    const unlockedIds = new Set(Object.keys(unlocked).filter(k=>unlocked[k]));
    const list = allAchievements().filter(a=> unlockedIds.has(a.id) && a.category!=='combo'); // comboは装備対象外にする
    list.sort((a,b)=> a.category===b.category? a.threshold-b.threshold : a.category.localeCompare(b.category));
    equipWrap.innerHTML = list.map(a=>{
      const checked = ids.includes(a.id) ? 'checked' : '';
      const disabled = !checked && ids.length>=5 ? 'disabled' : '';
      return `<label class="flex items-center gap-2 text-sm py-1">
        <input type="checkbox" data-equip-id="${a.id}" ${checked} ${disabled}>
        <span class="text-gray-800">${a.name}</span>
        <span class="ml-auto text-xs text-gray-500">${catLabel(a.category)}</span>
      </label>`;
    }).join('');
    equipWrap.querySelectorAll('input[type="checkbox"]').forEach(chk=>{
      chk.addEventListener('change', (e)=>{
        const id = e.target.getAttribute('data-equip-id');
        let ids = profile.equippedIds || [];
        if(e.target.checked){ if(!ids.includes(id)){ ids = [...ids, id].slice(0,5); } }
        else { ids = ids.filter(x=> x!==id); }
        profile.equippedIds = ids; saveJSON(FX_KEYS.profile, profile);
        renderEquipped(); renderEquipList();
      });
    });
  }

  // 週間目標
  function currentWeekKey(){ return weekKey(todayStr()); }
  function weekStats(acts){
    const wk = currentWeekKey();
    const agg = { run:0, walk:0, cycle:0 };
    for(const a of acts){ if(weekKey(a.date)===wk){ agg[a.type]+=a.distanceKm; } }
    return agg;
  }
  function renderGoals(acts, goals){
    const v = document.getElementById('fxGoalsView');
    const s = weekStats(acts);
    const items = [ ['ラン', 'run', '#ef4444'], ['ウォーク','walk','#10b981'], ['サイクル','cycle','#3b82f6'] ];
    v.innerHTML = items.map(([label,key,color])=>{
      const target = Math.max(0, goals[key]||0);
      const val = s[key]||0;
      const pct = target>0? Math.min(100, Math.floor((val/target)*100)) : 0;
      const done = target>0 && val>=target;
      return `<div>
        <div class="flex items-center justify-between text-sm mb-1">
          <div class="text-gray-700">${label}</div>
          <div class="text-gray-600">${val.toFixed(1)} / ${target} km ${done?'<span class=\'ml-2 text-green-600\'>達成</span>':''}</div>
        </div>
        <div class="h-2 bg-gray-200 rounded"><div class="h-2 rounded" style="width:${pct}%; background:${color}"></div></div>
      </div>`;
    }).join('');

    // 編集フォームの値反映
    document.getElementById('fxGoalRun').value = goals.run;
    document.getElementById('fxGoalWalk').value = goals.walk;
    document.getElementById('fxGoalCycle').value = goals.cycle;
  }

  const goalsBtn = document.getElementById('fxGoalsEdit');
  const goalsForm = document.getElementById('fxGoalsEditForm');
  goalsBtn.addEventListener('click', ()=>{
    goalsForm.classList.toggle('hidden');
  });
  document.getElementById('fxGoalsCancel').addEventListener('click', ()=>{
    goalsForm.classList.add('hidden');
  });
  document.getElementById('fxGoalsSave').addEventListener('click', ()=>{
    const run = Math.max(0, parseFloat(document.getElementById('fxGoalRun').value||'0'));
    const walk = Math.max(0, parseFloat(document.getElementById('fxGoalWalk').value||'0'));
    const cycle = Math.max(0, parseFloat(document.getElementById('fxGoalCycle').value||'0'));
    goals = { run, walk, cycle };
    saveJSON(FX_KEYS.goals, goals);
    goalsForm.classList.add('hidden');
    renderGoals(activities, goals);
  });
});
