// 称号/レベルアップの演出（DQ/FF風モーダル）
// キューで逐次表示する簡易実装。

let _queue = [];
let _showing = false;

function _icon(type) {
  if (type === 'level') {
    return '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" class="text-yellow-400"><path d="M12 2l2.39 4.84L20 8l-4 3.9.94 5.48L12 15.77 7.06 17.38 8 11.9 4 8l5.61-1.16L12 2z"/></svg>';
  }
  return '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" class="text-blue-400"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
}

function _buildContent(ev) {
  if (ev.type === 'level') {
    const title = ev.count && ev.count > 1 ? `レベルアップ ×${ev.count}` : 'レベルアップ！';
    const sub = ev.from != null ? `Lv ${ev.from} → Lv ${ev.to}` : `Lv ${ev.to}`;
    const milestone = ev.milestone ? '<div class="mt-2 text-amber-300 text-sm">節目レベル達成！</div>' : '';
    return `
      <div class="flex flex-col items-center">
        ${_icon('level')}
        <div class="mt-2 text-xl font-extrabold tracking-wider">${title}</div>
        <div class="mt-1 text-3xl font-black">${sub}</div>
        ${milestone}
      </div>
    `;
  }
  // achievement
  const cat = ev.achievement?.category || '';
  const catLabel = (
    cat === 'sum' ? '総合' : cat === 'run' ? 'ラン距離' : cat === 'walk' ? 'ウォーク距離' : cat === 'cycle' ? 'サイクル距離' : cat === 'time' ? '総時間' : cat === 'days' ? '累計日数' : 'コンボ'
  );
  const name = ev.achievement?.name || '称号';
  return `
    <div class="flex flex-col items-center">
      ${_icon('achievement')}
      <div class="mt-2 text-xl font-extrabold tracking-wider">称号を獲得！</div>
      <div class="mt-1 text-lg opacity-80">${catLabel}</div>
      <div class="mt-1 text-2xl font-black">「${name}」</div>
    </div>
  `;
}

function _render(ev, onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'levelup-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="levelup-modal">
      ${_buildContent(ev)}
      <div class="mt-6 flex items-center justify-center gap-3">
        <button class="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm">${_queue.length > 0 ? '次へ' : 'OK'}</button>
      </div>
    </div>
  `;
  const close = () => {
    overlay.removeEventListener('click', clickOuter);
    document.removeEventListener('keydown', onKey);
    try { document.body.removeChild(overlay); } catch {}
    onClose && onClose();
  };
  const clickOuter = (e) => {
    const modal = overlay.querySelector('.levelup-modal');
    if (!modal || !modal.contains(e.target) || (e.target.tagName === 'BUTTON')) close();
  };
  const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') close(); };
  overlay.addEventListener('click', clickOuter);
  document.addEventListener('keydown', onKey);
  document.body.appendChild(overlay);
  const btn = overlay.querySelector('button');
  if (btn) btn.addEventListener('click', close);
}

function _drain() {
  const next = _queue.shift();
  if (!next) { _showing = false; return; }
  _showing = true;
  _render(next, () => {
    // 次を表示
    setTimeout(_drain, 100);
  });
}

export function queueCelebrations(items) {
  if (!Array.isArray(items) || items.length === 0) return;
  _queue.push(...items);
  if (!_showing) _drain();
}

export function celebrateLevelUp(from, to, milestone = false, count = 1) {
  queueCelebrations([{ type: 'level', from, to, milestone, count }]);
}

export function celebrateAchievements(achievements) {
  const items = (achievements || []).map((a) => ({ type: 'achievement', achievement: a }));
  queueCelebrations(items);
}

export default { queueCelebrations, celebrateLevelUp, celebrateAchievements };

