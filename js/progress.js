// Рекорди во вежби и цели: заеднички за клиент и тренер.
import * as store from './store.js';
import { DEMO_PROGRESS } from './data.js';
import { esc, toast, chipRow, lineChart } from './ui.js';

export const EXERCISES = ['Чучањ', 'Бенч прес', 'Мртво дизање', 'Потисок над глава', 'Веслање', 'Потег кон градите'];
const MS = ['јан', 'фев', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'нов', 'дек'];
const num = (v) => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; };
const dayMs = 86400000;

export function dueLabel(iso) { if (!iso) return ''; const d = new Date(iso + 'T12:00:00'); return d.getDate() + ' ' + MS[d.getMonth()]; }
export function daysLeft(iso) { return Math.ceil((new Date(iso + 'T23:59:59').getTime() - Date.now()) / dayMs); }
export function agoLabel(at) {
  if (!at) return 'нема внес';
  const d = Math.floor((Date.now() - at) / dayMs);
  return d <= 0 ? 'денес' : d === 1 ? 'вчера' : 'пред ' + d + ' дена';
}

// ---- Податоци ----
export const liftsOf = (cid) => (store.get().lifts || []).filter((l) => l.clientId === cid).sort((a, b) => a.at - b.at);
export function bests(cid) {
  const by = {};
  liftsOf(cid).forEach((l) => { (by[l.ex] = by[l.ex] || []).push(l); });
  return Object.entries(by).map(([ex, arr]) => {
    const best = arr.reduce((m, x) => (x.kg >= m.kg ? x : m), arr[0]);
    return { ex, arr, best, first: arr[0], last: arr[arr.length - 1], gain: best.kg - arr[0].kg };
  }).sort((a, b) => b.last.at - a.last.at);
}
export function weightData(cid) {
  const s = store.get();
  if (cid === s.client.id) return s.progress;
  return (DEMO_PROGRESS[cid] || {}).data || [];
}
export const goalsOf = (cid) => (store.get().goals || []).filter((g) => g.clientId === cid && g.status !== 'declined');
export function lastActivity(cid) {
  const s = store.get();
  return Math.max((s.progressAt || {})[cid] || 0, ...liftsOf(cid).map((l) => l.at), 0);
}

export function goalPct(g) {
  if (g.status === 'done') return 100;
  if (g.kind === 'free') return 0;
  if (g.kind === 'weight') {
    const d = weightData(g.clientId); if (!d.length) return 0;
    const start = g.start != null ? g.start : d[0].weight, cur = d[d.length - 1].weight;
    if (start === g.target) return 100;
    return Math.max(0, Math.min(100, Math.round(((cur - start) / (g.target - start)) * 100)));
  }
  const b = bests(g.clientId).find((x) => x.ex === g.ex); if (!b) return 0;
  const start = g.start != null ? g.start : b.first.kg;
  if (g.target <= start) return b.best.kg >= g.target ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round(((b.best.kg - start) / (g.target - start)) * 100)));
}
export function goalTitle(g) {
  return g.kind === 'weight' ? 'Тежина ' + g.target + ' кг' : g.kind === 'lift' ? g.ex + ' ' + g.target + ' кг' : g.text;
}
function goalNow(g) {
  if (g.kind === 'weight') { const d = weightData(g.clientId); return d.length ? 'сега ' + d[d.length - 1].weight.toFixed(1) + ' кг' : ''; }
  if (g.kind === 'lift') { const b = bests(g.clientId).find((x) => x.ex === g.ex); return b ? 'најдобро ' + b.best.kg + ' кг' : 'сè уште нема внес'; }
  return '';
}
export const isReached = (g) => g.status === 'done' || (g.kind !== 'free' && goalPct(g) >= 100);

// ---- Приказ ----
let gKind = 'lift';

export function goalList(cid, role) {
  const gs = goalsOf(cid).sort((a, b) => (a.due || '').localeCompare(b.due || ''));
  if (!gs.length) return '<div class="muted small">Сè уште нема цели.</div>';
  return gs.map((g) => {
    const pct = goalPct(g), reached = isReached(g), left = g.due ? daysLeft(g.due) : null;
    const tag = g.status === 'proposed' ? '<span class="tag tag-outline">чека одобрување</span>' : reached ? '<span class="tag tag-accent">✓ постигната</span>'
      : left != null && left < 0 ? '<span class="tag tag-outline">истече</span>' : left != null ? '<span class="muted small">уште ' + left + (left === 1 ? ' ден' : ' дена') + '</span>' : '';
    let act = '';
    if (g.status === 'proposed' && role === 'trainer') act = '<div class="row gap-s wrap"><button type="button" class="btn btn-accent btn-sm" data-act="pgOk" data-val="' + g.id + '">Одобри</button><button type="button" class="btn btn-ghost btn-sm" data-act="pgNo" data-val="' + g.id + '">Одбиј</button></div>';
    else if (g.kind === 'free' && g.status === 'active') act = '<button type="button" class="btn btn-ghost btn-sm" data-act="pgDone" data-val="' + g.id + '">Означи како постигната</button>';
    return '<div class="card stack-s goal"><div class="row between"><span class="strong">' + esc(goalTitle(g)) + '</span>' + tag + '</div>' +
      '<div class="bar thin"><span style="width:' + pct + '%"></span></div>' +
      '<div class="muted small">' + (g.kind === 'free' ? '' : pct + '% · ' + goalNow(g) + ' · ') + (g.due ? 'до ' + dueLabel(g.due) + ' · ' : '') + (g.by === 'client' ? 'предложена од клиентот' : 'поставена од тренерот') + '</div>' + act + '</div>';
  }).join('');
}

export function goalForm(cid, role) {
  const kinds = [['weight', 'Тежина'], ['lift', 'Вежба'], ['free', 'Друга']];
  const fields = gKind === 'weight' ? '<label class="field">Целна тежина (кг)<input name="target" inputmode="decimal" required></label>'
    : gKind === 'lift' ? '<div class="grid-2 gap-s"><label class="field">Вежба<input name="ex" list="ex-list" required placeholder="Бенч прес"></label><label class="field">Цел (кг)<input name="target" inputmode="decimal" required></label></div>'
    : '<label class="field">Цел<input name="text" required maxlength="80" placeholder="На пр. 10 склекови по ред"></label>';
  return '<form class="card stack-s" data-submit="pgAddGoal"><h2 class="eyebrow muted">' + (role === 'trainer' ? 'ПОСТАВИ ЦЕЛ' : 'ПРЕДЛОЖИ ЦЕЛ') + '</h2><input type="hidden" name="cid" value="' + cid + '">' +
    '<div class="chips">' + kinds.map(([k, l]) => '<button type="button" class="chip' + (k === gKind ? ' on' : '') + '" data-act="pgKind" data-val="' + k + '">' + l + '</button>').join('') + '</div>' + fields +
    '<label class="field">Рок<input type="date" name="due" min="' + store.isoIn(0) + '" value="' + store.isoIn(30) + '" required></label>' +
    '<button type="submit" class="btn btn-accent">' + (role === 'trainer' ? 'ПОСТАВИ ЦЕЛ' : 'ПРЕДЛОЖИ НА ТРЕНЕРОТ') + '</button>' +
    '<datalist id="ex-list">' + EXERCISES.map((e) => '<option value="' + esc(e) + '">').join('') + '</datalist></form>';
}

export function liftList(cid) {
  const bs = bests(cid);
  if (!bs.length) return '<div class="empty">Сè уште нема внесени рекорди.</div>';
  return bs.map((b) => '<section class="card stack-s"><div class="row between"><span class="strong">' + esc(b.ex) + '</span><span class="display-xs">' + b.best.kg + ' кг' + (b.best.reps > 1 ? ' <span class="muted small">× ' + b.best.reps + '</span>' : '') + '</span></div>' +
    (b.arr.length > 1 ? lineChart(b.arr.map((x) => x.kg), { w: 320, h: 70 }) : '') +
    '<div class="muted small">' + (b.gain > 0 ? '<span class="accent strong">+' + b.gain + ' кг</span> од првиот внес · ' : '') + b.arr.length + (b.arr.length === 1 ? ' внес' : ' внесувања') + ' · последен ' + agoLabel(b.last.at) + '</div></section>').join('');
}

export function liftForm(cid) {
  return '<form class="card light stack" data-submit="pgAddLift"><h2 class="h3 upper">Нов внес</h2><input type="hidden" name="cid" value="' + cid + '">' +
    '<label class="field light">Вежба<input name="ex" list="ex-list" required placeholder="Чучањ"></label>' +
    '<div class="grid-2 gap-s"><label class="field light">Килограми<input name="kg" inputmode="decimal" required></label><label class="field light">Повторувања<input name="reps" inputmode="numeric" placeholder="1"></label></div>' +
    '<button type="submit" class="btn btn-accent btn-lg">ЗАЧУВАЈ</button><datalist id="ex-list">' + EXERCISES.map((e) => '<option value="' + esc(e) + '">').join('') + '</datalist></form>';
}

// ---- Акции ----
const role = () => store.get().role;
const tidOf = () => store.get().trainerId;
export const progActions = {
  pgKind(el) { gKind = el.dataset.val; store.refresh(); },
  pgAddLift(form) {
    const cid = form.cid.value, ex = form.ex.value.trim(), kg = num(form.kg.value), reps = Math.max(1, Math.round(num(form.reps.value)) || 1);
    if (!ex || kg <= 0) { toast('Внеси вежба и килограми.'); return; }
    const prev = bests(cid).find((b) => b.ex === ex);
    const pr = prev && kg > prev.best.kg;
    store.set((s) => ({ ...s, lifts: [...(s.lifts || []), { id: store.uid('lf'), clientId: cid, ex, kg, reps, at: Date.now() }] }));
    if (store.get().client.share.progress) store.clientTrainers(cid).forEach((t) => store.notify(t.id, store.clientName(cid) + (pr ? ' постави нов рекорд: ' : ' внесе: ') + ex + ' ' + kg + ' кг', '#/t/clients/' + cid));
    toast(pr ? '🏆 Нов рекорд! ' + ex + ' ' + kg + ' кг' : 'Внесот е зачуван.');
  },
  pgAddGoal(form) {
    const cid = form.cid.value, by = role() === 'trainer' ? 'trainer' : 'client';
    const g = { id: store.uid('gl'), clientId: cid, kind: gKind, due: form.due.value, by, status: by === 'trainer' ? 'active' : 'proposed', at: Date.now() };
    if (gKind === 'free') g.text = form.text.value.trim(); else g.target = num(form.target.value);
    if (gKind === 'lift') g.ex = form.ex.value.trim();
    if ((gKind === 'free' && !g.text) || (gKind !== 'free' && g.target <= 0) || (gKind === 'lift' && !g.ex)) { toast('Пополни ја целта.'); return; }
    if (gKind === 'weight') { const d = weightData(cid); if (d.length) g.start = d[d.length - 1].weight; }
    if (gKind === 'lift') { const b = bests(cid).find((x) => x.ex === g.ex); g.start = b ? b.best.kg : 0; }
    store.set((s) => ({ ...s, goals: [...(s.goals || []), g] }));
    if (by === 'trainer') { store.notify(cid, 'Тренерот ти постави нова цел: ' + goalTitle(g), '#/c/progress'); toast('Целта е поставена.'); }
    else { store.clientTrainers(cid).forEach((t) => store.notify(t.id, store.clientName(cid) + ' предлага цел: ' + goalTitle(g), '#/t/clients/' + cid)); toast('Предлогот е испратен на тренерот.'); }
  },
  pgOk(el) {
    const g = (store.get().goals || []).find((x) => x.id === el.dataset.val); if (!g) return;
    store.set((s) => ({ ...s, goals: s.goals.map((x) => (x.id === g.id ? { ...x, status: 'active' } : x)) }));
    store.notify(g.clientId, 'Тренерот ја одобри целта: ' + goalTitle(g), '#/c/progress'); toast('Целта е одобрена.');
  },
  pgNo(el) {
    const g = (store.get().goals || []).find((x) => x.id === el.dataset.val); if (!g) return;
    store.set((s) => ({ ...s, goals: s.goals.map((x) => (x.id === g.id ? { ...x, status: 'declined' } : x)) }));
    store.notify(g.clientId, 'Тренерот предлага друга цел од: ' + goalTitle(g) + '. Прати му порака.', '#/c/messages'); toast('Предлогот е одбиен.');
  },
  pgDone(el) {
    store.set((s) => ({ ...s, goals: s.goals.map((x) => (x.id === el.dataset.val ? { ...x, status: 'done' } : x)) }));
    toast('Целта е постигната. Браво!');
  },
};

export { chipRow };
