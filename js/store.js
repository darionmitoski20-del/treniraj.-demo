// Состојба на демото, зачувана во localStorage на прелистувачот.
import { TRAINERS, DEMO_REQUESTS, DEMO_CLIENTS } from './data.js';

const KEY = 'trenirai-demo-v1';

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
        { from: 't1', kind: 'plan', text: 'План — недела 4 · 5 тренинзи', at: ts(-2) },
        { from: 'c1', text: 'Супер, фала! Ќе ти пратам снимка за корекција.', at: ts(-1) },
      ],
      'c1|t3': [ { from: 't3', text: 'Нов план за исхрана е во прилог. Пиј повеќе вода!', at: ts(-5) } ],
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

export function reset() { state = initialState(); save(); listeners.forEach((fn) => fn(state)); }

// Повторно прикажи ја страната (за локални промени на изгледот)
export function refresh() { listeners.forEach((fn) => fn(state)); }

// ---- Помошни прашања ----

export function trainer(id) {
  const base = TRAINERS.find((t) => t.id === id);
  if (!base) return null;
  return { ...base, ...(state.trainerOverrides[id] || {}) };
}

export function allTrainers() { return TRAINERS.map((t) => trainer(t.id)); }

export function threadKey(clientId, trainerId) { return clientId + '|' + trainerId; }

export function thread(clientId, trainerId) { return state.threads[threadKey(clientId, trainerId)] || []; }

export function addMessage(clientId, trainerId, msg) {
  const key = threadKey(clientId, trainerId);
  set((s) => ({ ...s, threads: { ...s.threads, [key]: [...(s.threads[key] || []), { at: Date.now(), ...msg }] } }));
}

export function clientTrainers(clientId) {
  return state.links.filter((l) => l.clientId === clientId).map((l) => trainer(l.trainerId)).filter(Boolean);
}

export function pendingRequestFrom(clientId, trainerId) {
  return state.requests.find((r) => r.clientId === clientId && r.trainerId === trainerId && r.status === 'pending');
}

export function isLinked(clientId, trainerId) {
  return state.links.some((l) => l.clientId === clientId && l.trainerId === trainerId);
}

export function uid(prefix) { return prefix + Math.random().toString(36).slice(2, 8); }
