// Рецепти: тренерот ги прави и ги праќа, клиентот ги добива во четот и во „Рецепти“.
import * as store from '../store.js';
import { DEMO_CLIENTS } from '../data.js';
import { esc, appLayout, toast, modal, closeModal, chipRow } from '../ui.js';

const CATS = ['Појадок', 'Ручек', 'Вечера', 'Ужина'];

function macros(r) {
  return '<div class="macros">' + [['kcal', r.kcal, ''], ['Протеини', r.protein, 'г'], ['Јаглехидрати', r.carbs, 'г'], ['Масти', r.fat, 'г']]
    .map(([l, v, u]) => '<div class="macro"><span class="macro-v">' + (v || 0) + u + '</span><span class="macro-l">' + l + '</span></div>').join('') + '</div>';
}

// Целосен приказ на рецепт (за модал / долен лист)
export function recipeView(r) {
  const t = store.trainer(r.trainerId);
  return '<div class="eyebrow accent">РЕЦЕПТ · ' + esc(r.cat.toUpperCase()) + '</div><h2 class="h2">' + esc(r.name) + '</h2>' +
    '<div class="muted small">' + r.mins + ' мин · ' + r.servings + (r.servings === 1 ? ' порција' : ' порции') + (t ? ' · од ' + esc(t.name) : '') + '</div>' +
    '<div class="photo recipe-photo"><span class="photo-icon">🍽</span></div>' + macros(r) +
    '<h3 class="eyebrow muted">СОСТОЈКИ</h3><ul class="ingr">' + r.ingredients.map(([a, n]) => '<li><span class="strong">' + esc(a) + '</span> ' + esc(n) + '</li>').join('') + '</ul>' +
    '<h3 class="eyebrow muted">ПОДГОТОВКА</h3><ol class="steps">' + r.steps.map((st) => '<li>' + esc(st) + '</li>').join('') + '</ol>' +
    '<button type="button" class="btn btn-accent" data-act="closeModal">ЗАТВОРИ</button>';
}

// ---- Клиент: омилени, белешки, порции ----
const cr = { cat: 'Сите', q: '', serv: 0, day: (new Date().getDay() + 6) % 7 };
const DAYS = ['Пон', 'Вто', 'Сре', 'Чет', 'Пет', 'Саб', 'Нед'];
const DAYS_L = ['Понеделник', 'Вторник', 'Среда', 'Четврток', 'Петок', 'Сабота', 'Недела'];
const MEALS = ['Појадок', 'Ручек', 'Вечера', 'Ужина'];
const dayKcal = (day) => MEALS.reduce((a, m) => a + ((store.recipe(day[m]) || {}).kcal || 0), 0);
const favs = () => store.get().recipeFav || [];
const noteOf = (id) => (store.get().recipeNotes || {})[id] || '';

function scale(amount, k) {
  const m = /^(\d+(?:[.,]\d+)?)(.*)$/.exec(String(amount).trim());
  if (!m || k === 1) return amount;
  const v = parseFloat(m[1].replace(',', '.')) * k;
  const out = Math.round(v * 10) / 10;
  return String(out).replace('.', ',') + m[2];
}

function clientRecipeView(r) {
  const t = store.trainer(r.trainerId);
  const serv = cr.serv || r.servings, k = serv / (r.servings || 1), fav = favs().includes(r.id);
  return '<div class="row between"><div class="eyebrow accent">РЕЦЕПТ · ' + esc(r.cat.toUpperCase()) + '</div><button type="button" class="heart' + (fav ? ' on' : '') + '" data-act="rcFav" data-val="' + r.id + '" aria-label="' + (fav ? 'Тргни од омилени' : 'Додај во омилени') + '" aria-pressed="' + fav + '">' + (fav ? '♥' : '♡') + '</button></div>' +
    '<h2 class="h2">' + esc(r.name) + '</h2><div class="muted small">' + r.mins + ' мин' + (t ? ' · од ' + esc(t.name) : '') + '</div>' +
    macros(r) + '<div class="muted small">Вредностите се по порција.</div>' +
    '<div class="serv-row"><span class="strong">Порции</span><div class="row gap"><button type="button" class="btn btn-ghost serv-b" data-act="rcServ" data-val="-1" aria-label="Помалку порции">−</button><span class="strong big" aria-live="polite">' + serv + '</span><button type="button" class="btn btn-ghost serv-b" data-act="rcServ" data-val="1" aria-label="Повеќе порции">+</button></div></div>' +
    '<h3 class="eyebrow muted">СОСТОЈКИ</h3><ul class="ingr">' + r.ingredients.map(([a, n]) => '<li><span class="strong">' + esc(scale(a, k)) + '</span> ' + esc(n) + '</li>').join('') + '</ul>' +
    '<h3 class="eyebrow muted">ПОДГОТОВКА</h3><ol class="steps">' + r.steps.map((st) => '<li>' + esc(st) + '</li>').join('') + '</ol>' +
    '<label class="field">Моја белешка<textarea rows="2" maxlength="300" placeholder="На пр. стави помалку сол, го сакаат децата…" data-input="rcNote" data-val="' + r.id + '">' + esc(noteOf(r.id)) + '</textarea></label>' +
    '<button type="button" class="btn btn-accent" data-act="closeModal">ЗАТВОРИ</button>';
}

export const recipeActions = {
  openRecipe(el) {
    const r = store.recipe(el.dataset.val);
    if (!r) { toast('Рецептот повеќе не постои.'); return; }
    if (store.get().role === 'client') { cr.serv = r.servings; cr.open = r.id; modal(clientRecipeView(r)); }
    else modal(recipeView(r));
  },
};

export function recipeCard(r, extra = '') {
  return '<button type="button" class="card rcard" data-act="openRecipe" data-val="' + r.id + '"><div class="rcard-top"><span class="tag tag-outline">' + esc(r.cat.toUpperCase()) + '</span><span class="muted small">' + r.mins + ' мин</span></div>' +
    '<span class="strong big">' + esc(r.name) + '</span><span class="muted small">' + r.kcal + ' kcal · ' + r.protein + ' г протеини</span>' + extra + '</button>';
}

// ---------- Тренер: градител на рецепти ----------
const rs = { sel: 'rc1', draft: null, tab: 'План за исхрана' };
const mpd = { clientId: '', name: 'Неделен план за исхрана', target: 2000, day: 0, days: Array.from({ length: 7 }, () => ({})) };
function draft() {
  const r = store.recipe(rs.sel) || store.get().recipes.find((x) => x.trainerId === store.get().trainerId);
  if (!rs.draft || rs.draft.id !== (r && r.id)) rs.draft = r ? JSON.parse(JSON.stringify(r)) : null;
  return rs.draft;
}
function myClients() {
  const s = store.get();
  return s.links.filter((l) => l.trainerId === s.trainerId).map((l) => ({ id: l.clientId, name: store.clientName(l.clientId) }));
}

export const trainerRecipes = {
  title: 'План за исхрана',
  render(p, q) {
    const s = store.get();
    const mine = s.recipes.filter((r) => r.trainerId === s.trainerId);
    const d = draft();
    const field = (label, key, attrs = '') => '<label class="field">' + label + '<input value="' + esc(d[key]) + '" data-input="rField" data-val="' + key + '" ' + attrs + '></label>';
    const editor = !d ? '<div class="empty">Немаш рецепти. Направи прв.</div>' :
      '<section class="grow stack"><div><div class="eyebrow accent">РЕЦЕПТ</div><label class="sr" for="r-name">Име на рецептот</label><input id="r-name" class="title-input" value="' + esc(d.name) + '" data-input="rField" data-val="name"></div>' +
      '<div class="chips">' + chipRow(CATS, d.cat, 'rCat') + '</div>' +
      '<div class="card stack-s"><div class="grid-2 gap-s">' + field('Време (мин)', 'mins', 'inputmode="numeric"') + field('Порции', 'servings', 'inputmode="numeric"') + '</div>' +
        '<div class="grid-4 gap-s macro-inputs">' + field('kcal', 'kcal', 'inputmode="numeric"') + field('Протеини (г)', 'protein', 'inputmode="numeric"') + field('Јаглех. (г)', 'carbs', 'inputmode="numeric"') + field('Масти (г)', 'fat', 'inputmode="numeric"') + '</div></div>' +
      '<div class="card stack-s"><h2 class="eyebrow muted">СОСТОЈКИ</h2>' +
        d.ingredients.map(([a, n], i) => '<div class="ingr-row"><input aria-label="Количина" placeholder="Количина" value="' + esc(a) + '" data-input="rIngr" data-val="' + i + ':0"><input aria-label="Состојка" placeholder="Состојка" value="' + esc(n) + '" data-input="rIngr" data-val="' + i + ':1"><button type="button" class="link muted" data-act="rDelIngr" data-val="' + i + '" aria-label="Избриши состојка">✕</button></div>').join('') +
        '<button type="button" class="link accent strong" data-act="rAddIngr">+ Додади состојка</button></div>' +
      '<div class="card stack-s"><h2 class="eyebrow muted">ПОДГОТОВКА</h2><label class="sr" for="r-steps">Чекори, по еден во секој ред</label><textarea id="r-steps" rows="5" data-input="rSteps" placeholder="Секој чекор во нов ред">' + esc(d.steps.join('\n')) + '</textarea>' +
        '<button type="button" class="upload" data-act="rPhoto">+ Фотографија од јадењето</button></div>' +
      '<div class="row gap wrap"><button type="button" class="btn btn-ghost grow" data-act="rPreview">Преглед</button><button type="button" class="btn btn-ghost grow" data-act="rSave">Зачувај</button></div>' +
      '<form class="card light row gap wrap send-card" data-submit="rSend"><div class="grow"><div class="strong">Испрати го рецептот на клиент</div><div class="small">Клиентот го добива во четот и во „Рецепти“.</div></div>' +
        '<label class="sr" for="r-client">Клиент</label><select id="r-client" name="c">' + myClients().map((c) => '<option value="' + c.id + '"' + (q.c === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select><button class="btn btn-dark" type="submit">ИСПРАТИ</button></form></section>';
    if (rs.tab !== 'Рецепти') return appLayout('trainer', 'recipes', '<div class="chips">' + chipRow(['План за исхрана', 'Рецепти'], rs.tab, 'rTab') + '</div>' + mealPlanner());
    const content = '<div class="chips">' + chipRow(['План за исхрана', 'Рецепти'], rs.tab, 'rTab') + '</div><div class="plans"><section class="tpl-list"><h1 class="h2 upper">Рецепти</h1>' +
      '<button type="button" class="tpl new" data-act="rNew"><span class="strong">+ Нов рецепт</span></button>' +
      mine.map((r) => '<button type="button" class="tpl' + (d && r.id === d.id ? ' on' : '') + '" data-act="rSel" data-val="' + r.id + '"><span class="strong">' + esc(r.name) + '</span><span class="small">' + esc(r.cat) + ' · ' + r.kcal + ' kcal</span></button>').join('') + '</section>' + editor + '</div>';
    return appLayout('trainer', 'recipes', content);
  },
  actions: {
    ...recipeActions,
    rTab(el) { rs.tab = el.dataset.val; store.refresh(); },
    mpClient(el) { mpd.clientId = el.value; },
    mpName(el) { mpd.name = el.value; },
    mpTarget(el) { mpd.target = parseInt(el.value, 10) || 0; store.refresh(); },
    mpDay(el) { mpd.day = Number(el.dataset.val); store.refresh(); },
    mpPick(el) { mpd.days[mpd.day][el.dataset.val] = el.value || null; store.refresh(); },
    mpCopy() { const src = mpd.days[mpd.day]; mpd.days = mpd.days.map(() => ({ ...src })); store.refresh(); toast('Денот е копиран на сите денови.'); },
    mpClear() { mpd.days = Array.from({ length: 7 }, () => ({})); store.refresh(); },
    mpSend(form) {
      const s = store.get(); const cid = form.c.value;
      if (!cid) { toast('Избери клиент.'); return; }
      if (!mpd.days.some((d) => Object.values(d).some(Boolean))) { toast('Додади барем еден оброк.'); return; }
      const mp = { id: store.uid('mp'), trainerId: s.trainerId, clientId: cid, name: mpd.name || 'План за исхрана', target: mpd.target, days: JSON.parse(JSON.stringify(mpd.days)), at: Date.now() };
      store.set((st) => ({ ...st, mealPlans: [mp, ...(st.mealPlans || [])] }));
      store.notify(cid, 'Нов план за исхрана од твојот тренер: ' + mp.name, '#/c/recipes');
      store.refresh();
      toast('Планот е испратен: ' + store.clientName(cid));
    },
    rSel(el) { rs.sel = el.dataset.val; rs.draft = null; store.refresh(); },
    rNew() {
      const s = store.get();
      const r = { id: store.uid('rc'), trainerId: s.trainerId, name: 'Нов рецепт', cat: 'Ручек', mins: 15, servings: 1, kcal: 0, protein: 0, carbs: 0, fat: 0, ingredients: [['', '']], steps: [] };
      rs.sel = r.id; rs.draft = null;
      store.set((st) => ({ ...st, recipes: [r, ...st.recipes] }));
      setTimeout(() => { const n = document.getElementById('r-name'); if (n) { n.focus(); n.select(); } }, 50);
    },
    rField(el) { const k = el.dataset.val; const num = ['mins', 'servings', 'kcal', 'protein', 'carbs', 'fat'].includes(k); draft()[k] = num ? (parseInt(el.value, 10) || 0) : el.value; },
    rCat(el) { draft().cat = el.dataset.val; save(false); },
    rIngr(el) { const [i, c] = el.dataset.val.split(':').map(Number); draft().ingredients[i][c] = el.value; },
    rAddIngr() { draft().ingredients.push(['', '']); save(false); },
    rDelIngr(el) { draft().ingredients.splice(Number(el.dataset.val), 1); save(false); },
    rSteps(el) { draft().steps = el.value.split('\n').map((x) => x.trim()).filter(Boolean); },
    rPhoto() { toast('Во вистинската апликација тука прикачуваш фотографија.'); },
    rPreview() { modal(recipeView(clean(draft()))); },
    rSave() { save(true); },
    rSend(form) {
      save(false);
      const r = clean(draft()); const cid = form.c.value; const s = store.get();
      store.markStep('recipe');
      store.set((st) => ({ ...st, sharedRecipes: [{ recipeId: r.id, clientId: cid, trainerId: s.trainerId, at: Date.now() }, ...st.sharedRecipes.filter((x) => !(x.recipeId === r.id && x.clientId === cid))] }));
      store.addMessage(cid, s.trainerId, { from: s.trainerId, kind: 'recipe', recipeId: r.id, text: r.name });
      toast('Рецептот е испратен: ' + store.clientName(cid));
    },
  },
};

function mealPlanner() {
  const s = store.get();
  const mine = s.recipes.filter((r) => r.trainerId === s.trainerId);
  const cl = myClients();
  if (!mpd.clientId && cl[0]) mpd.clientId = cl[0].id;
  const d = mpd.days[mpd.day], kc = dayKcal(d);
  const diff = mpd.target ? kc - mpd.target : 0;
  const status = !mpd.target ? '' : Math.abs(diff) <= mpd.target * 0.05 ? '<span class="accent strong">✓ во рамките на целта</span>' : diff > 0 ? '<span class="strong">+' + diff + ' kcal над целта</span>' : '<span class="strong">' + (-diff) + ' kcal под целта</span>';
  const meal = (m) => '<label class="field">' + m + '<select data-change="mpPick" data-val="' + m + '"><option value="">— без —</option>' +
    [...mine.filter((r) => r.cat === m), ...mine.filter((r) => r.cat !== m)].map((r) => '<option value="' + r.id + '"' + (d[m] === r.id ? ' selected' : '') + '>' + esc(r.name) + ' · ' + r.kcal + ' kcal' + (r.cat !== m ? ' (' + r.cat + ')' : '') + '</option>').join('') + '</select></label>';
  return '<div class="stack"><div><h1 class="h2 upper">План за исхрана</h1><p class="muted">Состави оброци по денови според целта за калории. Клиентот го гледа во „Рецепти“.</p></div>' +
    '<div class="card stack-s"><div class="grid-2 gap-s"><label class="field">Име<input value="' + esc(mpd.name) + '" data-input="mpName"></label><label class="field">Цел (kcal/ден)<input inputmode="numeric" value="' + mpd.target + '" data-change="mpTarget"></label></div></div>' +
    '<div class="chips">' + DAYS.map((n, i) => '<button type="button" class="chip' + (i === mpd.day ? ' on' : '') + '" data-act="mpDay" data-val="' + i + '">' + n + ' · ' + (dayKcal(mpd.days[i]) || '—') + '</button>').join('') + '</div>' +
    '<div class="card stack-s"><div class="row between"><h2 class="strong">' + DAYS_L[mpd.day] + '</h2><div class="strong">' + kc + (mpd.target ? ' / ' + mpd.target : '') + ' kcal</div></div><div>' + status + '</div>' + MEALS.map(meal).join('') +
    '<div class="row gap wrap"><button type="button" class="btn btn-ghost grow" data-act="mpCopy">Копирај на сите денови</button><button type="button" class="btn btn-ghost grow" data-act="mpClear">Исчисти</button></div></div>' +
    '<form class="card light row gap wrap send-card" data-submit="mpSend"><div class="grow"><div class="strong">Испрати го планот на клиент</div></div><label class="sr" for="mp-client">Клиент</label><select id="mp-client" name="c" data-change="mpClient">' + cl.map((c) => '<option value="' + c.id + '"' + (mpd.clientId === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select><button class="btn btn-dark" type="submit">ИСПРАТИ</button></form></div>';
}

function clean(d) { return { ...d, ingredients: d.ingredients.filter(([a, n]) => (a + n).trim()) }; }
function save(showToast) {
  const d = clean(draft());
  store.set((s) => ({ ...s, recipes: s.recipes.map((r) => (r.id === d.id ? d : r)) }));
  rs.draft = null;
  if (showToast) toast('Рецептот е зачуван.');
}

// ---------- Клиент: добиени рецепти ----------
const FILTERS = ['Сите', '♥ Омилени', ...CATS, 'Многу протеини', 'Под 400 kcal', 'Брзо (до 20 мин)'];

function visible() {
  const s = store.get(), q = cr.q.trim().toLowerCase(), f = cr.cat;
  return s.sharedRecipes.filter((x) => x.clientId === s.client.id).sort((a, b) => b.at - a.at)
    .map((x) => ({ x, r: store.recipe(x.recipeId) })).filter(({ r }) => {
      if (!r) return false;
      if (q && !(r.name + ' ' + r.ingredients.map((i) => i[1]).join(' ')).toLowerCase().includes(q)) return false;
      if (f === '♥ Омилени') return favs().includes(r.id);
      if (CATS.includes(f)) return r.cat === f;
      if (f === 'Многу протеини') return r.protein >= 30;
      if (f === 'Под 400 kcal') return r.kcal < 400;
      if (f === 'Брзо (до 20 мин)') return r.mins <= 20;
      return true;
    });
}

function list() {
  const items = visible();
  if (!items.length) {
    return '<div class="empty">' + (cr.cat === '♥ Омилени' && !cr.q ? 'Сè уште немаш омилени. Допри го ♡ на рецепт.' : 'Нема рецепти што одговараат.') + '</div>';
  }
  return '<div class="rlist">' + items.map(({ x, r }) => {
    const fav = favs().includes(r.id), note = noteOf(r.id);
    return '<div class="rrow"><button type="button" class="rrow-main" data-act="openRecipe" data-val="' + r.id + '"><span class="strong">' + esc(r.name) + (note ? ' <span class="muted" title="Имаш белешка">✎</span>' : '') + '</span>' +
      '<span class="muted small">' + esc(r.cat) + ' · ' + r.mins + ' мин · ' + r.kcal + ' kcal · ' + r.protein + ' г протеини · од ' + esc((store.trainer(x.trainerId) || {}).name || '') + '</span></button>' +
      '<button type="button" class="heart' + (fav ? ' on' : '') + '" data-act="rcFav" data-val="' + r.id + '" aria-label="' + (fav ? 'Тргни од омилени' : 'Додај во омилени') + '" aria-pressed="' + fav + '">' + (fav ? '♥' : '♡') + '</button></div>';
  }).join('') + '</div>';
}

function myPlan() {
  const s = store.get();
  return (s.mealPlans || []).filter((m) => m.clientId === s.client.id).sort((x, y) => y.at - x.at)[0] || null;
}

function menu() {
  const mp = myPlan();
  if (!mp) return '<section class="card stack-s menu"><h2 class="eyebrow muted">МОЈ ПЛАН ЗА ИСХРАНА</h2><div class="muted small">Тренерот сè уште не ти пратил план за исхрана. Кога ќе ти го прати, ќе го видиш тука по денови.</div></section>';
  const t = store.trainer(mp.trainerId), d = mp.days[cr.day] || {}, kc = dayKcal(d), pct = mp.target ? Math.min(100, Math.round(kc / mp.target * 100)) : 0;
  return '<section class="card stack-s menu"><div><h2 class="eyebrow muted">МОЈ ПЛАН ЗА ИСХРАНА</h2><div class="strong">' + esc(mp.name) + '</div><div class="muted small">од ' + esc(t ? t.name : 'тренер') + (mp.target ? ' · цел ' + mp.target + ' kcal на ден' : '') + '</div></div>' +
    '<div class="chips">' + DAYS.map((n, i) => '<button type="button" class="chip' + (i === cr.day ? ' on' : '') + '" data-act="rcDay" data-val="' + i + '">' + n + '</button>').join('') + '</div>' +
    '<div class="strong">' + DAYS_L[cr.day] + (cr.day === (new Date().getDay() + 6) % 7 ? ' <span class="muted small">· денес</span>' : '') + '</div>' +
    MEALS.map((m) => { const r = store.recipe(d[m]); return '<div class="rrow">' + (r ? '<button type="button" class="rrow-main" data-act="openRecipe" data-val="' + r.id + '"><span class="muted small">' + m.toUpperCase() + '</span><span class="strong">' + esc(r.name) + '</span><span class="muted small">' + r.kcal + ' kcal · ' + r.protein + ' г протеини</span></button>' : '<div class="rrow-main"><span class="muted small">' + m.toUpperCase() + '</span><span class="muted">—</span></div>') + '</div>'; }).join('') +
    '<div class="kbar" role="img" aria-label="' + kc + ' од ' + (mp.target || 0) + ' kcal"><div class="kbar-fill" style="width:' + pct + '%"></div></div><div class="strong">Вкупно: ' + kc + ' kcal' + (mp.target ? ' <span class="muted small">од ' + mp.target + '</span>' : '') + '</div></section>';
}

export const clientRecipes = {
  title: 'План за исхрана',
  render() {
    const content = '<div class="page-head"><div><h1 class="display-s">План за исхрана</h1><p class="muted">Планот за исхрана и рецептите од твојот тренер.</p></div></div>' +
      '<label class="sr" for="rc-q">Барај рецепт или состојка</label><input id="rc-q" class="search" type="search" placeholder="Барај рецепт или состојка…" value="' + esc(cr.q) + '" data-input="rcSearch">' +
      menu() + '<div class="chips">' + chipRow(FILTERS, cr.cat, 'crCat') + '</div><div id="rc-list">' + list() + '</div>';
    return appLayout('client', 'recipes', content);
  },
  actions: {
    ...recipeActions,
    crCat(el) { cr.cat = el.dataset.val; store.refresh(); },
    rcSearch(el) { cr.q = el.value; const box = document.getElementById('rc-list'); if (box) box.innerHTML = list(); },
    rcFav(el) {
      const id = el.dataset.val;
      store.set((st) => { const f = st.recipeFav || []; return { ...st, recipeFav: f.includes(id) ? f.filter((x) => x !== id) : [...f, id] }; });
      if (document.getElementById('modal') && cr.open === id) modal(clientRecipeView(store.recipe(id)));
    },
    rcServ(el) {
      const r = store.recipe(cr.open); if (!r) return;
      cr.serv = Math.min(12, Math.max(1, (cr.serv || r.servings) + Number(el.dataset.val)));
      modal(clientRecipeView(r));
    },
    rcDay(el) { cr.day = Number(el.dataset.val); store.refresh(); },
    rcNote(el) {
      const id = el.dataset.val, v = el.value;
      store.set((st) => ({ ...st, recipeNotes: { ...(st.recipeNotes || {}), [id]: v } }));
    },
  },
};

export { DEMO_CLIENTS, closeModal };
