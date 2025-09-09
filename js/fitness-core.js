// フィットネス共通ロジック（widget/app共有）

export const FX_KEYS = {
  activities: 'fitness_activities',
  profile: 'fitness_profile',
  totals: 'fitness_totals',
  unlocked: 'fitness_unlocked',
  goals: 'fitness_weekly_goals'
};

export const FX_DEFAULT_PROFILE = {
  level: 1,
  totalXp: 0,
  nextLevelRequiredXp: req(1),
  settings: { distanceWeight: 12, timeWeight: 5, speedAlerts: true },
  equippedIds: []
};

export function req(L){ return Math.round(120 + 30 * Math.pow(L, 1.2)); }

export function calcXp(type, distanceKm, minutes, settings = FX_DEFAULT_PROFILE.settings){
  const base = settings.distanceWeight * Math.pow(distanceKm, 0.9) + settings.timeWeight * Math.sqrt(Math.max(0, minutes));
  const k = type === 'run' ? 2.4 : type === 'walk' ? 1.2 : 1.0;
  return Math.round(base * k);
}

export function todayStr(d = new Date()){
  const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return dt.toISOString().slice(0,10);
}

export function genId(){ return 'a' + Math.random().toString(36).slice(2,8) + Date.now().toString(36); }

export function loadJSON(key, fallback){ try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
export function saveJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

export function recomputeTotals(acts){
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

export function unlockAchievementsIfReached(unlocked, totals){
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

export function weekKey(isoDate){
  const d = new Date(isoDate + 'T00:00:00');
  const day = d.getDay();
  const diffToMon = (day + 6) % 7; // Mon=0
  d.setDate(d.getDate() - diffToMon);
  return d.toISOString().slice(0,10);
}

export function evalCombos(activities, totals, unlocked){
  const newly = [];
  const combos = window.FitnessAchievements.combo;
  const now = new Date().toISOString();
  const byDay = {};
  const typesByDay = {};
  const weekAgg = {};
  for(const a of activities){
    if(!byDay[a.date]) byDay[a.date] = { distance:0, minutes:0, byType:{run:0,walk:0,cycle:0}, earlyMinutes:0 };
    byDay[a.date].distance += a.distanceKm;
    byDay[a.date].minutes += a.minutes;
    byDay[a.date].byType[a.type] += a.distanceKm;
    if(a.time){
      const [hh,mm] = a.time.split(':').map(Number);
      if(hh<6 || (hh===6 && mm===0)) byDay[a.date].earlyMinutes += a.minutes;
    }
    if(!typesByDay[a.date]) typesByDay[a.date] = new Set();
    typesByDay[a.date].add(a.type);
    const wk = weekKey(a.date);
    if(!weekAgg[wk]) weekAgg[wk] = { run:0, walk:0, cycle:0, minutes:0 };
    weekAgg[wk][a.type] += a.distanceKm;
    weekAgg[wk].minutes += a.minutes;
  }
  function unlockByCode(code){
    const ach = combos.find(c=>c.code===code);
    if(ach && !unlocked[ach.id]){ unlocked[ach.id]=now; newly.push(ach); }
  }
  for(const d in typesByDay){ if(typesByDay[d].size===3){ unlockByCode('daily_all_three'); break; } }
  for(const d in byDay){ if(byDay[d].earlyMinutes>=60){ unlockByCode('daily_before6_60min'); break; } }
  for(const d in byDay){ if(byDay[d].distance>=30){ unlockByCode('daily_30km'); break; } }
  for(const d in byDay){ if(byDay[d].minutes>=360){ unlockByCode('daily_6h'); break; } }
  for(const d in byDay){ if(byDay[d].minutes>=180){ unlockByCode('daily_180min'); break; } }
  for(const d in byDay){
    const t = byDay[d].byType; const ok = (t.run>=10 && t.walk>=10) || (t.run>=10 && t.cycle>=10) || (t.walk>=10 && t.cycle>=10);
    if(ok){ unlockByCode('daily_two_types_10km'); break; }
  }
  for(const w in weekAgg){
    const wa = weekAgg[w];
    if(wa.run>=20 && wa.walk>=20) unlockByCode('weekly_run20_walk20');
    if(wa.walk>=40 && wa.run>=30) unlockByCode('weekly_walk40_run30');
  }
  const sumList = window.FitnessAchievements.sum; const sumUnlocked = sumList.filter(a=>unlocked[a.id]).length;
  if(sumUnlocked>=10) unlockByCode('sum_titles_10');
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

export function computeStreak(activities){
  if(activities.length===0) return 0;
  const days = new Set(activities.map(a=>a.date));
  let streak = 0; let d = new Date();
  while(true){
    const key = todayStr(d);
    if(days.has(key)) { streak += 1; d.setDate(d.getDate()-1); }
    else break;
  }
  return streak;
}

export function labelType(t){ return t==='run'?'ラン': t==='walk'?'ウォーク':'サイクル'; }
export function escapeHtml(s){ return s.replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
export function catLabel(c){ return c==='sum'?'総合': c==='run'?'ラン距離': c==='walk'?'ウォーク距離': c==='cycle'?'サイクル距離': c==='time'?'総時間': c==='days'?'累計日数':'コンボ'; }
export function catValue(c, totals){
  switch(c){
    case 'sum': return totals.weightedTotalKm; 
    case 'run': return totals.byType.run.distanceKm; 
    case 'walk': return totals.byType.walk.distanceKm; 
    case 'cycle': return totals.byType.cycle.distanceKm; 
    case 'time': return totals.totalMinutes; 
    case 'days': return totals.uniqueDays; 
    default: return 0;
  }
}

