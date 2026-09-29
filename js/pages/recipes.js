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

export const recipeActions = {
  openRecipe(el) { const r = store.recipe(el.dataset.val); if (r) modal(recipeView(r)); else toast('Рецептот повеќе не постои.'); },
};

export function recipeCard(r, extra = '') {
  return '<button type="button" class="card rcard" data-act="openRecipe" data-val="' + r.id + '"><div class="rcard-top"><span class="tag tag-outline">' + esc(r.cat.toUpperCase()) + '</span><span class="muted small">' + r.mins + ' мин</span></div>' +
    '<span class="strong big">' + esc(r.name) + '</span><span class="muted small">' + r.kcal + ' kcal · ' + r.protein + ' г протеини</span>' + extra + '</button>';
}

// ---------- Тренер: градител на рецепти ----------
const rs = { sel: 'rc1', draft: null };
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
  title: 'Рецепти',
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
    const content = '<div class="plans"><section class="tpl-list"><h1 class="h2 upper">Рецепти</h1>' +
      '<button type="button" class="tpl new" data-act="rNew"><span class="strong">+ Нов рецепт</span></button>' +
      mine.map((r) => '<button type="button" class="tpl' + (d && r.id === d.id ? ' on' : '') + '" data-act="rSel" data-val="' + r.id + '"><span class="strong">' + esc(r.name) + '</span><span class="small">' + esc(r.cat) + ' · ' + r.kcal + ' kcal</span></button>').join('') + '</section>' + editor + '</div>';
    return appLayout('trainer', 'recipes', content);
  },
  actions: {
    ...recipeActions,
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

function clean(d) { return { ...d, ingredients: d.ingredients.filter(([a, n]) => (a + n).trim()) }; }
function save(showToast) {
  const d = clean(draft());
  store.set((s) => ({ ...s, recipes: s.recipes.map((r) => (r.id === d.id ? d : r)) }));
  rs.draft = null;
  if (showToast) toast('Рецептот е зачуван.');
}

// ---------- Клиент: добиени рецепти ----------
const cr = { cat: 'Сите' };
export const clientRecipes = {
  title: 'Рецепти',
  render() {
    const s = store.get();
    const shared = s.sharedRecipes.filter((x) => x.clientId === s.client.id).sort((a, b) => b.at - a.at)
      .map((x) => ({ x, r: store.recipe(x.recipeId) })).filter(({ r }) => r && (cr.cat === 'Сите' || r.cat === cr.cat));
    const content = '<div class="page-head"><div><h1 class="display-s">Рецепти</h1><p class="muted">Рецептите што ти ги пратиле твоите тренери.</p></div></div>' +
      '<div class="chips">' + chipRow(['Сите', ...CATS], cr.cat, 'crCat') + '</div>' +
      (shared.length ? '<div class="grid-3">' + shared.map(({ x, r }) => recipeCard(r, '<span class="muted small">од ' + esc(store.trainer(x.trainerId).name) + '</span>')).join('') + '</div>'
        : '<div class="empty">Сè уште немаш рецепти' + (cr.cat !== 'Сите' ? ' за ' + cr.cat.toLowerCase() : '') + '.</div>');
    return appLayout('client', 'recipes', content);
  },
  actions: { ...recipeActions, crCat(el) { cr.cat = el.dataset.val; store.refresh(); } },
};

export { DEMO_CLIENTS, closeModal };
