// Состојба на демото, зачувана во localStorage на прелистувачот.
import { TRAINERS, DEMO_REQUESTS, DEMO_CLIENTS, SEED_REVIEWS, PARTNERS, PARTNER_STATS, SEED_RECIPES, TEMPLATES } from './data.js';

const KEY = 'trenirai-demo-v6';

function initialState() {
  return {
    role: null,                 // null | 'client' | 'trainer'
    accent: '#FF5A1F',
    lang: 'МК',
    client: { id: 'c1', name: 'Ана Костова', email: 'ana@primer.mk', city: 'Скопје',
      share: { goal: true, level: true, injuries: false, progress: true, photos: false },
      goal: 'Намалување тежина', goalKg: 8, premium: false, emailReminders: true },
    trainerId: 't1',            // демо тренерот
    trainerOverrides: {},       // измени од „Мој профил“
    partnerId: 'p1',            // демо партнерот (бизнис)
    partnerOverrides: {},
    partnerStats: JSON.parse(JSON.stringify(PARTNER_STATS)),
    requests: DEMO_REQUESTS.map((r) => ({ ...r })),
    // активни соработки клиент–тренер
    links: [
      { clientId: 'c1', trainerId: 't1', since: 'јуни' },
      { clientId: 'c1', trainerId: 't3', since: 'јули' },
      ...DEMO_CLIENTS.map((c) => ({ clientId: c.id, trainerId: 't1', since: c.since })),
    ],
    // пораки: key = clientId|trainerId
    threads: {
      'c1|t1': [
        { from: 't1', text: 'Здраво Ана! Ти го прикачив планот за оваа недела.', at: ts(-3) },
        { from: 't1', kind: 'video', text: 'Техника: чучњеви', at: ts(-3) },
        { from: 't1', kind: 'plan', planId: 'pl1', text: 'План — недела 4 · 3 дена, 9 вежби', at: ts(-2) },
        { from: 'c1', text: 'Супер, фала! Ќе ти пратам снимка за корекција.', at: ts(-1) },
      ],
      'c1|t3': [ { from: 't3', text: 'Нов план за исхрана е во прилог. Пиј повеќе вода!', at: ts(-5) }, { from: 't3', kind: 'recipe', recipeId: 'rc4', text: 'Салата со туна и леб од интегрално брашно', at: ts(-4) } ],
      'c2|t1': [
        { from: 'c2', text: 'Ти праќам снимка од мртво кревање, дали е добра техниката?', at: ts(-1) },
        { from: 'c2', kind: 'video', text: 'Мртво кревање — снимка од клиент', at: ts(-1) },
      ],
      'c3|t1': [ { from: 'c3', text: 'Благодарам за планот!', at: ts(-4) } ],
      'c4|t1': [ { from: 'c4', text: 'Истрчав 12 км!', at: ts(-2) } ],
    },
    bookings: [
      { id: 'b1', clientId: 'c1', clientName: 'Ана К.', trainerId: 't1', day: 2, time: '09:00', type: 'Во живо' },
      { id: 'b2', clientId: 'c2', clientName: 'Никола Д.', trainerId: 't1', day: 0, time: '17:00', type: 'Видео повик' },
      { id: 'b3', clientId: 'c4', clientName: 'Теодора Ј.', trainerId: 't1', day: 2, time: '12:00', type: 'Видео повик' },
      { id: 'b4', clientId: 'c3', clientName: 'Дарко С.', trainerId: 't1', day: 3, time: '08:00', type: 'Видео повик' },
    ],
    availability: { cancelHours: 24, deposit: false },
    progress: [
      { week: 1, weight: 78.0, waist: 90, workouts: 3 }, { week: 2, weight: 77.2, waist: 89, workouts: 3 },
      { week: 3, weight: 76.8, waist: 88, workouts: 4 }, { week: 4, weight: 75.9, waist: 87, workouts: 4 },
      { week: 5, weight: 75.5, waist: 86, workouts: 3 }, { week: 6, weight: 74.6, waist: 85, workouts: 4 },
    ],
    trainerComment: 'Одлична работа оваа недела! Продолжи со истото темпо.',
    challenges: { ch1: { joined: true, done: 11, today: false } },
    plans: { selectedTpl: 'tpl1', selectedDay: 0, custom: {} },
    customTrainers: [],         // тренери што се регистрирале во демото
    // месечни претплати: кога истекува и колку чини (expiresAt = null значи чека прва уплата)
    subs: [
      { id: 's1', trainerId: 't1', clientId: 'c1', price: 3000, expiresAt: ts(3) },
      { id: 's2', trainerId: 't1', clientId: 'c2', price: 3000, expiresAt: ts(2) },
      { id: 's3', trainerId: 't1', clientId: 'c3', price: 2500, expiresAt: ts(-5) },
      { id: 's4', trainerId: 't1', clientId: 'c4', price: 3500, expiresAt: ts(24) },
    ],
    // евидентирани плаќања (парите се плаќаат надвор од апликацијата)
    payments: [
      { id: 'py1', trainerId: 't1', clientId: 'c1', amount: 3000, method: 'bank', at: ts(-18) },
      { id: 'py2', trainerId: 't1', clientId: 'c1', amount: 3000, method: 'bank', at: ts(-48) },
      { id: 'py3', trainerId: 't1', clientId: 'c2', amount: 3000, method: 'cash', at: ts(-28) },
      { id: 'py4', trainerId: 't1', clientId: 'c3', amount: 2500, method: 'bank', at: ts(-35) },
      { id: 'py5', trainerId: 't1', clientId: 'c4', amount: 3500, method: 'bank', at: ts(-6) },
    ],
    // испратени планови со содржина; done = штиклирани вежби („ден:вежба“)
    sentPlans: [
      { id: 'pl1', trainerId: 't1', clientId: 'c1', name: 'План — недела 4', at: ts(-2),
        days: TEMPLATES[0].days.map((d) => d.map((r) => [...r, false])), done: { '0:0': true, '0:1': true, '0:2': true } },
    ],
    reviews: SEED_REVIEWS.map((r) => ({ ...r })),
    recipes: JSON.parse(JSON.stringify(SEED_RECIPES)),
    sharedRecipes: [{ recipeId: 'rc4', clientId: 'c1', trainerId: 't3', at: ts(-4) }, { recipeId: 'rc1', clientId: 'c1', trainerId: 't1', at: ts(-6) }],
    notifications: [
      { id: 'n1', to: 't1', text: 'Ново барање од Ивана М.', href: '#/t/clients', at: ts(-0.1), read: false },
      { id: 'n2', to: 't1', text: 'Никола Д. ти прати снимка за корекција', href: '#/t/messages/c2', at: ts(-0.2), read: false },
      { id: 'n3', to: 'c1', text: 'Елена Трајковска ти прати нов план за исхрана', href: '#/c/messages/t3', at: ts(-0.3), read: false },
    ],
    // водич за прв пат
    guide: { seen: false, track: 'trainer', open: true, done: {} },
  };
}

function ts(daysAgo) { return Date.now() + daysAgo * 86400000; }

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initialState(), ...JSON.parse(raw) };
  } catch (e) { /* приватен режим: продолжи без зачувување */ }
  return initialState();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* игнорирај */ }
}

export function get() { return state; }

export function set(patch) {
  state = typeof patch === 'function' ? patch(state) : { ...state, ...patch };
  save();
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function reset() { state = initialState(); runReminders(); save(); listeners.forEach((fn) => fn(state)); }

// Повторно прикажи ја страната (за локални промени на изгледот)
export function refresh() { listeners.forEach((fn) => fn(state)); }

// ---- Помошни прашања ----

export function trainer(id) {
  const base = TRAINERS.find((t) => t.id === id) || (state.customTrainers || []).find((t) => t.id === id);
  if (!base) return null;
  const t = { ...base, ...(state.trainerOverrides[id] || {}) };
  // новите оценки од демото се додаваат на почетниот просек
  const fresh = (state.reviews || []).filter((r) => r.trainerId === id && !r.seed);
  if (fresh.length) {
    const sum = base.rating * base.reviews + fresh.reduce((a, r) => a + r.stars, 0);
    t.reviews = base.reviews + fresh.length;
    t.rating = Math.round((sum / t.reviews) * 10) / 10;
  }
  return t;
}

export function reviewsFor(trainerId) {
  return (state.reviews || []).filter((r) => r.trainerId === trainerId).sort((a, b) => b.at - a.at);
}


// ---- Известувања ----
export function meId() { return state.role === 'trainer' ? state.trainerId : state.role === 'client' ? state.client.id : state.role === 'partner' ? state.partnerId : null; }

// ---- Партнери ----
export function partner(id) { const b = PARTNERS.find((p) => p.id === id); return b ? { ...b, ...(state.partnerOverrides[id] || {}) } : null; }
export function allPartners() { return PARTNERS.map((p) => partner(p.id)); }
export function trackPartner(id, field) {
  if (!state.partnerStats[id]) return;
  state = { ...state, partnerStats: { ...state.partnerStats, [id]: { ...state.partnerStats[id], [field]: state.partnerStats[id][field] + 1 } } };
  save();
}

export function notify(to, text, href) {
  state = { ...state, notifications: [{ id: uid('n'), to, text, href, at: Date.now(), read: false }, ...(state.notifications || [])].slice(0, 60) };
  save();
}

export function myNotifications() { const id = meId(); return (state.notifications || []).filter((n) => n.to === id); }
export function unreadCount() { return myNotifications().filter((n) => !n.read).length; }
export function markAllRead() {
  const id = meId();
  if (!unreadCount()) return;
  set((s) => ({ ...s, notifications: s.notifications.map((n) => (n.to === id ? { ...n, read: true } : n)) }));
}

// ---- Водич ----
export function markStep(step) {
  if (state.guide.done[step]) return;
  state = { ...state, guide: { ...state.guide, done: { ...state.guide.done, [step]: true } } };
  save();
}

// Само тренери со завршен профил се видливи за клиентите
export function allTrainers() { return [...TRAINERS, ...(state.customTrainers || [])].map((t) => trainer(t.id)).filter((t) => !t.draft); }

// Нов тренер од регистрација: празен профил што се пополнува во воведувањето
export function createTrainer(name) {
  const id = uid('tn');
  const t = { id, name, sport: 'Фитнес', sports: ['Фитнес'], city: 'Скопје', area: '', type: 'both', rating: 0, reviews: 0, goalsReached: 0, price: 0, onlinePrice: 0,
    pricesPublic: true, founder: false, accepting: true, lat: 41.9965, lng: 21.4314, bio: '', certs: [], badges: [], draft: true, isNew: true };
  state = { ...state, customTrainers: [...(state.customTrainers || []), t], trainerId: id, role: 'trainer' };
  save();
  return id;
}

// ---- Претплати и плаќања ----
const DAY = 86400000;
const DEMO_PAYINFO = { bank: { on: true, holder: 'Марија Стојанова', bank: 'Стопанска банка', account: '200-0000000000-00', iban: 'MK07 2000 0000 0000 000', purpose: 'Претплата — име и презиме' }, cash: { on: true, note: 'Готовина на првиот тренинг во месецот.' } };
export function payInfo(trainerId) {
  const t = trainer(trainerId);
  return (t && t.payInfo) || (trainerId === 't1' ? DEMO_PAYINFO : { bank: { on: false, holder: '', bank: '', account: '', iban: '', purpose: 'Претплата — име и презиме' }, cash: { on: false, note: '' } });
}
export function subsOf(trainerId) { return (state.subs || []).filter((x) => x.trainerId === trainerId); }
export function subsOfClient(clientId) { return (state.subs || []).filter((x) => x.clientId === clientId); }
export function subFor(clientId, trainerId) { return (state.subs || []).find((x) => x.clientId === clientId && x.trainerId === trainerId) || null; }
export function daysLeft(sub) { return sub.expiresAt == null ? null : Math.ceil((sub.expiresAt - Date.now()) / DAY); }
// 'new' чека прва уплата, 'overdue' истечена, 'soon' истекува за 7 дена или помалку, 'ok' во ред
export function subState(sub) {
  const d = daysLeft(sub);
  return d === null ? 'new' : d < 0 ? 'overdue' : d <= 7 ? 'soon' : 'ok';
}
export function paymentsOf(trainerId) { return (state.payments || []).filter((p) => p.trainerId === trainerId).sort((a, b) => b.at - a.at); }
export function monthEarnings(trainerId) {
  const from = Date.now() - 30 * DAY;
  return paymentsOf(trainerId).filter((p) => p.at >= from).reduce((a, p) => a + p.amount, 0);
}
export function unpaidSubs(trainerId) { return subsOf(trainerId).filter((x) => ['new', 'overdue'].includes(subState(x))); }
export function unpaidTotal(trainerId) { return unpaidSubs(trainerId).reduce((a, x) => a + x.price, 0); }
// претплати за обнова: задоцнети, нови и оние што истекуваат за 7 дена (најитните први)
export function dueSubs(trainerId) {
  const rank = (x) => (daysLeft(x) === null ? -1000 : daysLeft(x));
  return subsOf(trainerId).filter((x) => subState(x) !== 'ok').sort((a, b) => rank(a) - rank(b));
}
export function addSub(clientId, trainerId, price) {
  if (subFor(clientId, trainerId)) return;
  state = { ...state, subs: [...(state.subs || []), { id: uid('s'), trainerId, clientId, price, expiresAt: null }] };
  save();
}
// Тренерот означува платено: претплатата се продолжува 30 дена од денешен ден (или од истекот ако сè уште важи)
export function recordPayment(subId, method, amount) {
  const sub = (state.subs || []).find((x) => x.id === subId);
  if (!sub) return null;
  const base = sub.expiresAt && sub.expiresAt > Date.now() ? sub.expiresAt : Date.now();
  const expiresAt = base + 30 * DAY;
  const pay = { id: uid('py'), trainerId: sub.trainerId, clientId: sub.clientId, amount, method, at: Date.now() };
  state = { ...state, payments: [pay, ...(state.payments || [])], subs: state.subs.map((x) => (x.id === subId ? { ...x, expiresAt, price: amount || x.price, remindedFor: null } : x)) };
  save();
  return expiresAt;
}
// Подсетник 3 дена пред истекот (и по истекот), еднаш по период
export function runReminders() {
  let changed = false; const add = [];
  const subs = (state.subs || []).map((x) => {
    const d = daysLeft(x);
    if (d === null || d > 3 || x.remindedFor === x.expiresAt) return x;
    const tr = trainer(x.trainerId); const first = tr ? tr.name.split(' ')[0] : 'тренерот';
    const when = d < 0 ? 'истече' : d === 0 ? 'истекува денес' : d === 1 ? 'истекува утре' : 'истекува за ' + d + ' дена';
    add.push({ id: uid('n'), to: x.clientId, text: 'Претплатата кај ' + first + ' ' + when + ' (' + x.price.toLocaleString('de-DE') + ' ден.). Види како да платиш.', href: '#/c/payments', at: Date.now(), read: false });
    add.push({ id: uid('n'), to: x.trainerId, text: 'Претплатата на ' + clientName(x.clientId) + ' ' + when + '.', href: '#/t/payments', at: Date.now(), read: false });
    changed = true;
    return { ...x, remindedFor: x.expiresAt };
  });
  if (changed) { state = { ...state, subs, notifications: [...add, ...(state.notifications || [])].slice(0, 60) }; save(); }
}

// ---- Планови ----
export function plan(id) { return (state.sentPlans || []).find((p) => p.id === id); }
export function planProgress(p) {
  const total = p.days.reduce((n, d) => n + d.length, 0);
  return { done: Object.keys(p.done).filter((k) => p.done[k]).length, total };
}
export function plansFor(clientId, trainerId) {
  return (state.sentPlans || []).filter((p) => p.clientId === clientId && (!trainerId || p.trainerId === trainerId)).sort((a, b) => b.at - a.at);
}

export function threadKey(clientId, trainerId) { return clientId + '|' + trainerId; }

export function thread(clientId, trainerId) { return state.threads[threadKey(clientId, trainerId)] || []; }

export function addMessage(clientId, trainerId, msg) {
  const key = threadKey(clientId, trainerId);
  const fromTrainer = msg.from === trainerId;
  const to = fromTrainer ? clientId : trainerId;
  const fromName = fromTrainer ? (trainer(trainerId) || {}).name : clientName(clientId);
  const what = msg.kind === 'recipe' ? ' ти прати рецепт: ' + msg.text : msg.kind === 'plan' ? ' ти прати нов план' : msg.kind === 'video' ? ' ти прати снимка' : ': „' + String(msg.text).slice(0, 40) + (String(msg.text).length > 40 ? '…' : '') + '“';
  notify(to, fromName + what, fromTrainer ? '#/c/messages/' + trainerId : '#/t/messages/' + clientId);
  set((s) => ({ ...s, threads: { ...s.threads, [key]: [...(s.threads[key] || []), { at: Date.now(), ...msg }] } }));
}

export function recipe(id) { return (state.recipes || []).find((r) => r.id === id); }

export function clientName(id) {
  if (id === state.client.id) { const p = state.client.name.split(' '); return p[0] + (p[1] ? ' ' + p[1][0] + '.' : ''); }
  const d = DEMO_CLIENTS.find((c) => c.id === id);
  if (d) return d.name;
  const r = state.requests.find((x) => x.clientId === id);
  return r ? r.clientName : 'Клиент';
}

export function clientTrainers(clientId) {
  return state.links.filter((l) => l.clientId === clientId).map((l) => trainer(l.trainerId)).filter(Boolean);
}

export function pendingRequestFrom(clientId, trainerId) {
  return state.requests.find((r) => r.clientId === clientId && r.trainerId === trainerId && ['pending', 'asked'].includes(r.status));
}
// Тренерот ги отвори барањата: клиентот гледа „Видено“ (без нов приказ, само зачувано + известување)
export function markRequestsSeen(trainerId) {
  const now = Date.now(); const add = [];
  const requests = state.requests.map((r) => {
    if (r.trainerId !== trainerId || r.status !== 'pending' || r.seenAt || !r.form) return r;
    add.push({ id: uid('n'), to: r.clientId, text: trainer(trainerId).name.split(' ')[0] + ' го виде твоето барање', href: '#/c/home', at: now, read: false });
    return { ...r, seenAt: now };
  });
  if (add.length) { state = { ...state, requests, notifications: [...add, ...(state.notifications || [])].slice(0, 60) }; save(); }
}

export function isLinked(clientId, trainerId) {
  return state.links.some((l) => l.clientId === clientId && l.trainerId === trainerId);
}

export function uid(prefix) { return prefix + Math.random().toString(36).slice(2, 8); }
