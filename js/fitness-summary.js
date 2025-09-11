import { FX_KEYS, loadJSON, saveJSON, req, catLabel } from './fitness-core.js';

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const CATS = ['all','sum','run','walk','cycle','time','days','combo'];
const CAT_LABEL = {
  all: 'すべて', sum: '総合', run: 'ラン距離', walk: 'ウォーク距離', cycle: 'サイクル距離', time: '総時間', days: '累計日数', combo: 'コンボ'
};
const CAT_COLOR = {
  sum: '#8b5cf6', run: '#ef4444', walk: '#10b981', cycle: '#3b82f6', time: '#f59e0b', days: '#6b7280', combo: '#d946ef'
};

let state = { filter: 'all', sort: 'recent' };
let profileCache = null;

function renderLevel(profile){
  const level = profile?.level ?? 1;
  const need = profile?.nextLevelRequiredXp ?? req(level);
  const xp = Math.max(0, profile?.totalXp ?? 0);
  const pct = need>0 ? Math.min(100, Math.floor((xp/need)*100)) : 0;
  $('#sumLevel').textContent = `Lv ${level}`;
  $('#sumXpBar').style.width = pct + '%';
  $('#sumXpText').textContent = `${xp} / ${need} XP`;
}

function flattenAchievements(){
  const d = window.FitnessAchievements;
  const cats = ['sum','run','walk','cycle','time','days','combo'];
  return cats.flatMap(c => d[c].map(a => ({...a, category:c})));
}

function fmtDate(iso){ try { return iso ? iso.slice(0,10) : ''; } catch { return ''; } }

function renderFilters(unlocked){
  const wrap = $('#earnedFilters'); if(!wrap) return;
  const all = flattenAchievements();
  const unlockedIds = new Set(Object.keys(unlocked||{}).filter(k=>unlocked[k]));
  const counts = { all: 0, sum:0, run:0, walk:0, cycle:0, time:0, days:0, combo:0 };
  for(const a of all){ if(unlockedIds.has(a.id)){ counts.all++; counts[a.category]++; } }
  wrap.innerHTML = CATS.map(c => {
    const active = state.filter===c ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    const pill = counts[c] || 0;
    return `<button data-filter="${c}" class="px-3 py-1 rounded-full text-xs font-semibold ${active}">
      ${CAT_LABEL[c]}<span class="ml-1 text-[10px] opacity-80">${pill}</span>
    </button>`;
  }).join('');
}

function renderProgress(unlocked){
  const box = $('#earnedProgress'); if(!box) return;
  const d = window.FitnessAchievements;
  const cats = ['sum','run','walk','cycle','time','days','combo'];
  const unlockedIds = new Set(Object.keys(unlocked||{}).filter(k=>unlocked[k]));
  const rows = cats.map(c => {
    const total = d[c].length; const got = d[c].filter(a=>unlockedIds.has(a.id)).length;
    const pct = total>0 ? Math.round((got/total)*100) : 0;
    const bar = `<div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden"><div class="h-2" style="width:${pct}%; background:${CAT_COLOR[c]}"></div></div>`;
    return `<div class="p-2 rounded-xl border border-gray-200 bg-white">
      <div class="flex items-center justify-between">
        <div class="text-xs font-semibold text-gray-700">${CAT_LABEL[c]}</div>
        <div class="text-xs text-gray-500">${got} / ${total}</div>
      </div>
      <div class="mt-1">${bar}</div>
    </div>`;
  });
  box.innerHTML = rows.join('');
}

function renderEarned(unlocked){
  const listEl = $('#earnedList');
  const emptyEl = $('#earnedEmpty');
  const countEl = $('#earnedCount');
  const all = flattenAchievements();
  const unlockedIds = new Set(Object.keys(unlocked||{}).filter(k=>unlocked[k]));
  let got = all.filter(a => unlockedIds.has(a.id));
  if(state.filter!=='all'){ got = got.filter(a=>a.category===state.filter); }

  // sort
  if(state.sort==='recent'){
    got.sort((a,b)=> (unlocked[b.id]||'').localeCompare(unlocked[a.id]||''));
  }else if(state.sort==='category'){
    const order = ['sum','run','walk','cycle','time','days','combo'];
    got.sort((a,b)=> order.indexOf(a.category)-order.indexOf(b.category) || (a.threshold-b.threshold));
  }else if(state.sort==='threshold'){
    got.sort((a,b)=> (a.threshold-b.threshold));
  }else if(state.sort==='name'){
    got.sort((a,b)=> a.name.localeCompare(b.name));
  }

  const totalCount = all.filter(a=>unlockedIds.has(a.id)).length;
  countEl.textContent = totalCount>0 ? `${totalCount} 件` : '';

  if(got.length===0){
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');

  // favorites
  const fav = new Set((profileCache?.equippedIds)||[]);

  listEl.innerHTML = got.map(a => {
    const date = fmtDate(unlocked[a.id]);
    const color = CAT_COLOR[a.category] || '#4b5563';
    const starred = fav.has(a.id);
    return `
      <div class="relative group p-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
        <span class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style="background:${color}"></span>
        <div class="flex items-center justify-between">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" style="background:${color}; color:white">${CAT_LABEL[a.category]}</span>
          <button class="ach-fav" title="お気に入り" data-id="${a.id}">
            <svg width="20" height="20" viewBox="0 0 24 24" ${starred? 'fill="#f59e0b"' : 'fill="none"'} stroke="#f59e0b" stroke-width="1.8">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </button>
        </div>
        <div class="mt-2 text-gray-900 font-semibold">${a.name}</div>
        <div class="mt-1 text-xs text-gray-500">${date}</div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  profileCache = loadJSON(FX_KEYS.profile, { level:1, totalXp:0, nextLevelRequiredXp: req(1), equippedIds: [] });
  const unlocked = loadJSON(FX_KEYS.unlocked, {});
  renderLevel(profileCache);
  renderFilters(unlocked);
  renderProgress(unlocked);
  renderEarned(unlocked);

  // フィルタ切替
  $('#earnedFilters')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if(!btn) return;
    state.filter = btn.getAttribute('data-filter');
    renderFilters(unlocked);
    renderEarned(unlocked);
  });

  // 並び替え
  $('#earnedSort')?.addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderEarned(unlocked);
  });

  // お気に入り切替（委譲）
  $('#earnedList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button.ach-fav');
    if(!btn) return;
    const id = btn.getAttribute('data-id');
    const set = new Set(profileCache.equippedIds || []);
    if(set.has(id)) set.delete(id); else set.add(id);
    profileCache.equippedIds = Array.from(set);
    saveJSON(FX_KEYS.profile, profileCache);
    renderEarned(unlocked);
  });
});
