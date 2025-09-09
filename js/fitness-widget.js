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
    const has = actsByDate.has(dateStr);
    const dot = has ? '<span class="block mx-auto mt-1 w-2 h-2 rounded-full bg-blue-500"></span>' : '';
    cell.innerHTML = `<div class="text-sm text-gray-800">${d}</div>${dot}`;
    cell.addEventListener('click', ()=> onDayClick(dateStr, actsByDate.get(dateStr)||[]));
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
    activities.push(act);
    saveJSON(FX_KEYS.activities, activities);

    totals = recomputeTotals(activities);
    saveJSON(FX_KEYS.totals, totals);

    const gained = calcXp(type, distanceKm, minutes, profile.settings);
    profile.totalXp += gained;
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
    $$('#wResult').textContent = `+${gained} XP / 新規称号 ${newly.length} 件`;

    $$('#wDistance').value = '';
    $$('#wMinutes').value = '';
    $$('#wNote').value = '';
  });

  // カレンダー
  let currentMonth = new Date();
  $$('#wCalPrev')?.addEventListener('click', ()=>{ currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1, 1); renderCalendar(currentMonth, activities, renderDayDetail); $$('#wDayDetail').innerHTML=''; });
  $$('#wCalNext')?.addEventListener('click', ()=>{ currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 1); renderCalendar(currentMonth, activities, renderDayDetail); $$('#wDayDetail').innerHTML=''; });
  renderCalendar(currentMonth, activities, renderDayDetail);
});

