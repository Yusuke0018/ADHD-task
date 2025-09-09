import { FX_KEYS, FX_DEFAULT_PROFILE, req, calcXp, todayStr, genId, loadJSON, saveJSON, recomputeTotals, unlockAchievementsIfReached, evalCombos, weekKey, labelType, escapeHtml, catLabel, catValue, computeStreak } from './fitness-core.js';

const $$ = sel => document.querySelector(sel);

function abnormalSpeedWarning(type, distanceKm, minutes){
  const hours = minutes/60;
  const spd = hours>0 ? distanceKm/hours : 0;
  const limit = type==='run' ? 25 : type==='walk' ? 9 : 60;
  if(spd>limit){ return `速度が高すぎます（約${spd.toFixed(1)}km/h > ${limit}km/h）。保存しますか？`; }
  return null;
}

function setDefaultDate(){
  const el = $$('#wDate'); if(!el) return;
  el.value = todayStr(new Date());
}

function renderMiniDashboard(totals, profile, activities){
  $$('#wLevel').textContent = `Lv ${profile.level}`;
  const pct = Math.min(100, Math.floor((profile.totalXp/profile.nextLevelRequiredXp)*100));
  $$('#wXpBar').style.width = pct + '%';
  $$('#wXpText').textContent = `${profile.totalXp} / ${profile.nextLevelRequiredXp} XP`;
  $$('#wWeighted').textContent = `${totals.weightedTotalKm.toFixed(2)} km`;
  $$('#wStreak').textContent = `${computeStreak(activities)} 日`;
  $$('#wRunKm').textContent = `${totals.byType.run.distanceKm.toFixed(2)} km`;
  $$('#wWalkKm').textContent = `${totals.byType.walk.distanceKm.toFixed(2)} km`;
  $$('#wCycleKm').textContent = `${totals.byType.cycle.distanceKm.toFixed(2)} km`;
}

function groupByDate(acts){
  const map = new Map();
  for(const a of acts){ if(!map.has(a.date)) map.set(a.date, []); map.get(a.date).push(a); }
  return map;
}

function monthLabel(d){ return `${d.getFullYear()}年 ${d.getMonth()+1}月`; }

function renderCalendar(current, acts, onDayClick){
  const grid = $$('#wCalendarGrid'); const label = $$('#wCalMonthLabel');
  if(!grid || !label) return;
  grid.innerHTML = '';
  label.textContent = monthLabel(current);
  const year = current.getFullYear(); const month = current.getMonth();
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // 月曜=0
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const actsByDate = groupByDate(acts);
  // ヘッダ
  const weekdays = ['月','火','水','木','金','土','日'];
  for(const w of weekdays){ const h=document.createElement('div'); h.className='text-center text-gray-500 font-medium'; h.textContent=w; grid.appendChild(h); }
  // 前空白
  for(let i=0;i<startDay;i++){ const sp = document.createElement('div'); sp.className='p-2'; grid.appendChild(sp); }
  // 日付
  for(let d=1; d<=daysInMonth; d++){
    const dateStr = todayStr(new Date(year, month, d));
    const cell = document.createElement('button');
    cell.className = 'p-2 rounded-lg bg-white/60 hover:bg-white/80 text-center focus:outline-none';
    const list = actsByDate.get(dateStr) || [];
    let dots = '';
    const tset = new Set(list.map(a=>a.type));
    if(tset.size>0){
      const dotRun = tset.has('run')? '<span class="w-2 h-2 rounded-full bg-red-500"></span>':'';
      const dotWalk = tset.has('walk')? '<span class="w-2 h-2 rounded-full bg-emerald-500"></span>':'';
      const dotCycle = tset.has('cycle')? '<span class="w-2 h-2 rounded-full bg-blue-500"></span>':'';
      dots = `<div class="mt-1 flex items-center justify-center gap-1">${dotRun}${dotWalk}${dotCycle}</div>`;
    }
    cell.innerHTML = `<div class="text-sm text-gray-800">${d}</div>${dots}`;
    cell.addEventListener('click', ()=> onDayClick(dateStr, list));
    grid.appendChild(cell);
  }
}

function renderDayDetail(dateStr, list){
  const box = $$('#wDayDetail');
  if(!box) return;
  if(!list || list.length===0){ box.innerHTML = `<div class="text-gray-500">${dateStr} の記録はありません。</div>`; return; }
  const html = list
    .sort((a,b)=> (a.time||'').localeCompare(b.time||''))
    .map(a=>{
      const spd = a.minutes>0 ? (a.distanceKm/(a.minutes/60)).toFixed(1) : '-';
      const t = labelType(a.type);
      return `<div class="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2 mb-1">
        <div class="text-sm text-gray-700">${t} ${a.distanceKm.toFixed(2)}km / ${a.minutes}分 ${a.time?`<span class='text-gray-500 ml-1'>(${a.time})</span>`:''}</div>
        <div class="text-xs text-gray-500">${spd} km/h</div>
      </div>`;
    }).join('');
  box.innerHTML = `<div class="text-sm font-semibold text-gray-800 mb-1">${dateStr}</div>${html}`;
}

document.addEventListener('DOMContentLoaded', () => {
  // 状態読み込み
  let activities = loadJSON(FX_KEYS.activities, []);
  let profile = loadJSON(FX_KEYS.profile, FX_DEFAULT_PROFILE);
  let unlocked = loadJSON(FX_KEYS.unlocked, {});
  let totals = recomputeTotals(activities);

  // UI初期化
  setDefaultDate();
  renderMiniDashboard(totals, profile, activities);
  renderNextTargets(totals, unlocked);

  // トグル
  const toggle = $$('#wToggle'); const form = $$('#wForm');
  toggle?.addEventListener('click', ()=>{
    form.classList.toggle('hidden');
    toggle.textContent = form.classList.contains('hidden') ? '入力を表示' : '入力を隠す';
  });

  // 保存
  $$('#wSave')?.addEventListener('click', ()=>{
    const type = $$('#wType').value;
    const distanceKm = parseFloat($$('#wDistance').value||'0');
    const minutes = parseInt($$('#wMinutes').value||'0',10);
    const date = $$('#wDate').value || todayStr();
    const time = $$('#wTime').value || '';
    const note = $$('#wNote').value || '';
    if(!(type==='run'||type==='walk'||type==='cycle')){ alert('種目を選択してください'); return; }
    if(!(distanceKm>0 && distanceKm<=200)){ alert('距離は0〜200kmで入力してください'); return; }
    if(!(minutes>=1 && minutes<=600)){ alert('分は1〜600で入力してください'); return; }
    const warn = profile.settings.speedAlerts ? abnormalSpeedWarning(type, distanceKm, minutes) : null;
    if(warn && !confirm(warn)) return;

    const act = { id: genId(), type, distanceKm: Math.round(distanceKm*100)/100, minutes, date, time, note, addedAt: new Date().toISOString() };
    // 直近入力を保存
    saveJSON('fitness_last_input', { type, distanceKm, minutes, time });

    // 週間目標ボーナス用の前集計
    const goals = loadJSON(FX_KEYS.goals, { run:15, walk:20, cycle:60 });
    const prevWeekStats = (()=>{
      const wk = weekKey(date);
      const agg = { run:0, walk:0, cycle:0 };
      for(const x of activities){ if(weekKey(x.date)===wk){ agg[x.type]+=x.distanceKm; } }
      return agg;
    })();
    activities.push(act);
    saveJSON(FX_KEYS.activities, activities);

    totals = recomputeTotals(activities);
    saveJSON(FX_KEYS.totals, totals);

    const gained = calcXp(type, distanceKm, minutes, profile.settings);
    // 週目標達成チェック（ボーナス最大+10%/週）
    const wk = weekKey(date);
    const nowWeekStats = (()=>{ const agg={run:0,walk:0,cycle:0}; for(const x of activities){ if(weekKey(x.date)===wk){ agg[x.type]+=x.distanceKm; } } return agg; })();
    const rewarded = loadJSON('fitness_weekly_rewards', {});
    if(!rewarded[wk]) rewarded[wk] = { run:false, walk:false, cycle:false };
    let bonusPct = 0;
    ['run','walk','cycle'].forEach(k=>{
      const target = Math.max(0, goals[k]||0);
      if(target>0 && !rewarded[wk][k] && prevWeekStats[k] < target && nowWeekStats[k] >= target){
        rewarded[wk][k] = true; bonusPct += 0.0333; // 3.33%ずつ、最大≈10%
      }
    });
    bonusPct = Math.min(0.10, bonusPct);
    const bonusXp = Math.floor(gained * bonusPct);
    if(bonusXp>0) saveJSON('fitness_weekly_rewards', rewarded);
    profile.totalXp += gained + bonusXp;
    let milestone = false;
    while(profile.totalXp >= profile.nextLevelRequiredXp){
      profile.totalXp -= profile.nextLevelRequiredXp; profile.level += 1; profile.nextLevelRequiredXp = req(profile.level);
      if([5,10,20,30,50].includes(profile.level)) milestone = true;
    }
    saveJSON(FX_KEYS.profile, profile);

    const newly = [ ...unlockAchievementsIfReached(unlocked, totals), ...evalCombos(activities, totals, unlocked) ];
    if(newly.length>0) saveJSON(FX_KEYS.unlocked, unlocked);

    renderMiniDashboard(totals, profile, activities);
    renderCalendar(currentMonth, activities, renderDayDetail);
    renderCalSummary(currentMonth, activities);
    renderNextTargets(totals, unlocked);
    $$('#wResult').textContent = `+${gained}${bonusXp?`(+${bonusXp} 週ボーナス)`:''} XP / 新規称号 ${newly.length} 件`;

    $$('#wDistance').value = '';
    $$('#wMinutes').value = '';
    $$('#wNote').value = '';
  });

  // カレンダー
  let currentMonth = new Date();
  $$('#wCalPrev')?.addEventListener('click', ()=>{ currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1, 1); renderCalendar(currentMonth, activities, renderDayDetail); $$('#wDayDetail').innerHTML=''; renderCalSummary(currentMonth, activities); });
  $$('#wCalNext')?.addEventListener('click', ()=>{ currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 1); renderCalendar(currentMonth, activities, renderDayDetail); $$('#wDayDetail').innerHTML=''; renderCalSummary(currentMonth, activities); });
  renderCalendar(currentMonth, activities, renderDayDetail);
  renderCalSummary(currentMonth, activities);

  // クイック入力
  $$('#wPlus1Km')?.addEventListener('click', ()=>{ const el=$$('#wDistance'); const v=parseFloat(el.value||'0')+1; el.value = v.toFixed(2); });
  $$('#wPlus05Km')?.addEventListener('click', ()=>{ const el=$$('#wDistance'); const v=parseFloat(el.value||'0')+0.5; el.value = v.toFixed(2); });
  $$('#wPlus10Min')?.addEventListener('click', ()=>{ const el=$$('#wMinutes'); const v=parseInt(el.value||'0',10)+10; el.value = v; });
  $$('#wPlus5Min')?.addEventListener('click', ()=>{ const el=$$('#wMinutes'); const v=parseInt(el.value||'0',10)+5; el.value = v; });
  $$('#wRecall')?.addEventListener('click', ()=>{
    const last = loadJSON('fitness_last_input', null); if(!last) { $$('#wResult').textContent='直近データがありません'; return; }
    if(last.type) $$('#wType').value = last.type;
    if(last.distanceKm!=null) $$('#wDistance').value = last.distanceKm;
    if(last.minutes!=null) $$('#wMinutes').value = last.minutes;
    if(last.time) $$('#wTime').value = last.time;
    $$('#wResult').textContent='直近の入力を反映しました';
  });

  // 種目セレクタ（プルダウン式）
  function setType(val){
    const map = { run: '#wTypeRun', walk: '#wTypeWalk', cycle: '#wTypeCycle' };
    $$('#wType').value = val;
    ['#wTypeRun','#wTypeWalk','#wTypeCycle'].forEach(sel=>{ const b=$$(sel); if(b){ b.classList.remove('active'); b.setAttribute('aria-selected','false'); }});
    const btn = $$(map[val]); if(btn){ btn.classList.add('active'); btn.setAttribute('aria-selected','true'); }
    const lbl = $$('#wTypeLabel'); if(lbl){ lbl.textContent = val==='run'?'ラン': val==='walk'?'ウォーク':'サイクル'; }
  }
  function openTypeMenu(){ const m=$$('#wTypeMenu'); const p=$$('#wTypePicker'); if(m&&p){ m.classList.remove('hidden'); p.setAttribute('aria-expanded','true'); } }
  function closeTypeMenu(){ const m=$$('#wTypeMenu'); const p=$$('#wTypePicker'); if(m&&p){ m.classList.add('hidden'); p.setAttribute('aria-expanded','false'); } }
  // 初期値
  setType($$('#wType').value || 'run');
  $$('#wTypeRun')?.addEventListener('click', ()=> { setType('run'); closeTypeMenu(); });
  $$('#wTypeWalk')?.addEventListener('click', ()=> { setType('walk'); closeTypeMenu(); });
  $$('#wTypeCycle')?.addEventListener('click', ()=> { setType('cycle'); closeTypeMenu(); });
  $$('#wTypePicker')?.addEventListener('click', ()=> openTypeMenu());
  $$('#wTypeMenuBackdrop')?.addEventListener('click', ()=> closeTypeMenu());
  $$('#wTypeMenuClose')?.addEventListener('click', ()=> closeTypeMenu());

  function renderCalSummary(current, acts){
    const box = $$('#wCalSummary'); if(!box) return;
    const wkKey = weekKey(todayStr(current));
    const weekAgg = { run:0, walk:0, cycle:0 };
    const monthAgg = { run:0, walk:0, cycle:0 };
    const y = current.getFullYear(); const m = current.getMonth();
    for(const a of acts){
      const da = new Date(a.date+'T00:00:00');
      if(da.getFullYear()===y && da.getMonth()===m){ monthAgg[a.type]+=a.distanceKm; }
      if(weekKey(a.date)===wkKey){ weekAgg[a.type]+=a.distanceKm; }
    }
    const fmt = (agg)=>`Run ${agg.run.toFixed(1)} / Walk ${agg.walk.toFixed(1)} / Cycle ${agg.cycle.toFixed(1)} km`;
    box.innerHTML = `<div class="text-gray-700">今週: ${fmt(weekAgg)}</div><div class="text-gray-700">今月: ${fmt(monthAgg)}</div>`;
  }

  function renderNextTargets(totals, unlocked){
    const wrap = $$('#wNextTargets'); if(!wrap) return;
    const data = window.FitnessAchievements; const cats=['sum','run','walk','cycle','time','days'];
    const rows = cats.map(c=>{
      const list=data[c]; const value=catValue(c, totals); const cand=list.find(a=>!unlocked[a.id] && value < a.threshold);
      if(!cand) return null;
      const remain = cand.threshold - value; const unit = c==='time'?'分': c==='days'?'日':'km';
      const remStr = c==='time'||c==='days'? Math.max(0,Math.ceil(remain))+unit : Math.max(0,remain).toFixed(2)+unit;
      return `${catLabel(c)}: 「${cand.name}」まで ${remStr}`;
    }).filter(Boolean).slice(0,3);
    wrap.innerHTML = rows.length? rows.map(x=>`<div class="mb-1">${x}</div>`).join('') : '<div class="text-gray-500">すべて達成済み！</div>';
  }
});
