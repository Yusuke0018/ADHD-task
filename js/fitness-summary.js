import { FX_KEYS, loadJSON, req, catLabel } from './fitness-core.js';

const $ = sel => document.querySelector(sel);

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

function renderEarned(unlocked){
  const listEl = $('#earnedList');
  const emptyEl = $('#earnedEmpty');
  const countEl = $('#earnedCount');
  const all = flattenAchievements();
  const unlockedIds = new Set(Object.keys(unlocked||{}).filter(k=>unlocked[k]));
  const got = all.filter(a => unlockedIds.has(a.id));
  if(got.length===0){
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    countEl.textContent = '';
    return;
  }
  emptyEl.classList.add('hidden');
  countEl.textContent = `${got.length} 件`;
  got.sort((a,b)=> a.category===b.category ? (a.threshold - b.threshold) : a.category.localeCompare(b.category));
  listEl.innerHTML = got.map(a => {
    const cat = catLabel(a.category);
    return `<div class="flex items-center gap-2 p-2 rounded-lg border border-gray-200">
      <span class="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-white">${cat}</span>
      <span class="text-sm text-gray-800">${a.name}</span>
    </div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const profile = loadJSON(FX_KEYS.profile, { level:1, totalXp:0, nextLevelRequiredXp: req(1) });
  const unlocked = loadJSON(FX_KEYS.unlocked, {});
  renderLevel(profile);
  renderEarned(unlocked);
});

