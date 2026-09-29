// Главен влез: рутирање, прикажување и настани.
import * as store from './store.js';
import { closeModal, toast, modal, esc } from './ui.js';
import * as pub from './pages/public.js';
import * as client from './pages/client.js';
import * as trainer from './pages/trainer.js';
import * as social from './pages/social.js';

// Чекори на водичот. Секој чекор се штиклира сам кога ќе се направи дејството.
const STEPS = {
  trainer: [
    ['req', 'Прифати ново барање од клиент', '#/t/clients?tab=req', 'trainer'],
    ['msg', 'Одговори на порака од клиент', '#/t/messages/c2', 'trainer'],
    ['plan', 'Испрати план за тренинг', '#/t/plans', 'trainer'],
    ['cal', 'Додај термин во календарот', '#/t/calendar', 'trainer'],
    ['post', 'Објави совет за клиентите', '#/t/posts', 'trainer'],
    ['profile', 'Смени цена или опис во профилот', '#/t/profile', 'trainer'],
    ['asClient', 'Види како изгледа за клиентот', '#/c/home', 'client'],
  ],
  client: [
    ['find', 'Отвори профил на тренер', '#/', null],
    ['request', 'Испрати барање до тренер', '#/', 'client'],
    ['book', 'Закажи термин', '#/c/booking', 'client'],
    ['progress', 'Внеси напредок', '#/c/progress', 'client'],
    ['review', 'Остави оценка на тренер', '#/trainer/t1', 'client'],
  ],
};
let welcomeShown = false;

const routes = [
  ['/', pub.home], ['/map', pub.map], ['/trainer/:id', pub.trainerProfile], ['/signup', pub.signup],
  ['/quiz', pub.quiz], ['/partners', pub.partners], ['/challenges', pub.challenges],
  ['/c/home', client.home, 'client'], ['/c/messages', client.messages, 'client'], ['/c/messages/:id', client.messages, 'client'],
  ['/c/booking', client.booking, 'client'], ['/c/progress', client.progress, 'client'], ['/c/challenges', client.challenges, 'client'],
  ['/c/partners', client.partners, 'client'], ['/c/settings', client.settings, 'client'],
  ['/t/home', trainer.home, 'trainer'], ['/t/clients', trainer.clients, 'trainer'], ['/t/messages', trainer.messages, 'trainer'],
  ['/t/messages/:id', trainer.messages, 'trainer'], ['/t/calendar', trainer.calendar, 'trainer'], ['/t/plans', trainer.plans, 'trainer'],
  ['/t/profile', trainer.profile, 'trainer'], ['/t/posts', social.trainerPosts, 'trainer'], ['/t/notifications', social.trainerNotifications, 'trainer'],
  ['/c/feed', social.clientFeed, 'client'], ['/c/notifications', social.clientNotifications, 'client'],
];

let current = null;
const root = document.getElementById('app');

function parse() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(qs || ''));
  for (const [pattern, page, role] of routes) {
    const pp = pattern.split('/'), ap = path.split('/');
    if (pp.length !== ap.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < pp.length; i++) {
      if (pp[i].startsWith(':')) params[pp[i].slice(1)] = decodeURIComponent(ap[i]);
      else if (pp[i] !== ap[i]) { ok = false; break; }
    }
    if (ok) return { page, params, query, role, path };
  }
  return { page: pub.notFound, params: {}, query, path };
}

function render(scrollTop) {
  const r = parse();
  const s = store.get();
  if (r.role && s.role !== r.role) {
    location.hash = s.role === 'trainer' ? '#/t/home' : s.role === 'client' ? '#/c/home' : '#/signup' + (r.role === 'trainer' ? '?role=trainer' : '');
    return;
  }
  const same = current && current.path === r.path;
  current = r;
  const focusId = document.activeElement && document.activeElement.id;
  const y = window.scrollY;
  root.innerHTML = r.page.render(r.params, r.query) + guidePanel(s) + demoBar(s);
  document.documentElement.style.setProperty('--accent', s.accent);
  if (r.page.mount) r.page.mount(root, r.params, r.query);
  const on = root.querySelector('.side-nav .side-link.on');
  if (on) { const nav = on.parentElement; if (nav.scrollWidth > nav.clientWidth) nav.scrollLeft = on.offsetLeft - nav.clientWidth / 2 + on.offsetWidth / 2; }
  if (!s.guide.seen && !welcomeShown) { welcomeShown = true; showWelcome(); }
  if (same && focusId) { const el = document.getElementById(focusId); if (el) { el.focus(); if (el.setSelectionRange && el.value) el.setSelectionRange(el.value.length, el.value.length); } }
  if (same && !scrollTop) window.scrollTo(0, y); else window.scrollTo(0, 0);
  const title = r.page.title ? (typeof r.page.title === 'function' ? r.page.title(r.params) : r.page.title) : '';
  document.title = (title ? title + ' · ' : '') + 'Тренирај';
}

function roleLabel(role) { return role === 'trainer' ? 'Тренер' : role === 'client' ? 'Клиент' : 'Гостин'; }

function guideProgress(s) {
  const steps = STEPS[s.guide.track];
  return [steps.filter(([id]) => s.guide.done[id]).length, steps.length];
}

function demoBar(s) {
  const btn = (role, label) => '<button type="button" data-act="demoRole" data-val="' + role + '" class="d-only ' + (s.role === (role || null) ? 'on' : '') + '">' + label + '</button>';
  const [d, n] = guideProgress(s);
  return '<div class="demobar" role="group" aria-label="Демо контроли"><span class="demobar-tag">ДЕМО</span>' +
    btn('trainer', 'Тренер') + btn('client', 'Клиент') + btn('', 'Гостин') +
    '<button type="button" class="m-only on" data-act="demoMenu">' + roleLabel(s.role) + ' ▾</button>' +
    '<button type="button" data-act="guideToggle" class="guide-btn' + (s.guide.open ? ' on' : '') + '" aria-expanded="' + s.guide.open + '">Водич ' + d + '/' + n + '</button>' +
    '<button type="button" class="d-only" data-act="demoReset" title="Врати ги пробните податоци" aria-label="Врати ги пробните податоци">↺</button></div>';
}

function guidePanel(s) {
  if (!s.guide.seen || !s.guide.open) return '';
  const steps = STEPS[s.guide.track];
  const [d, n] = guideProgress(s);
  const firstOpen = steps.findIndex(([id]) => !s.guide.done[id]);
  const other = s.guide.track === 'trainer' ? 'client' : 'trainer';
  const rows = steps.map(([id, label], i) => {
    const done = s.guide.done[id];
    return '<li class="gstep' + (done ? ' done' : '') + (i === firstOpen ? ' next' : '') + '"><span class="gcheck">' + (done ? '✓' : i + 1) + '</span><span class="grow">' + esc(label) + '</span>' +
      (done ? '' : '<button type="button" class="link accent strong small" data-act="guideGo" data-val="' + i + '">Оди →</button>') + '</li>';
  }).join('');
  const next = firstOpen >= 0
    ? '<div class="gnext"><span class="gcheck">' + (firstOpen + 1) + '</span><span class="grow strong">' + esc(steps[firstOpen][1]) + '</span><button type="button" class="btn btn-accent btn-sm" data-act="guideGo" data-val="' + firstOpen + '">Оди →</button></div>'
    : '<div class="gnext"><span class="grow">Ги виде сите главни делови. Фала што проба!</span></div>';
  return '<aside class="guide" aria-label="Водич низ демото"><header class="row gap-s"><div class="grow"><div class="eyebrow accent">ВОДИЧ ' + (s.guide.track === 'trainer' ? 'ЗА ТРЕНЕРИ' : 'ЗА КЛИЕНТИ') + ' · ' + d + '/' + n + '</div>' +
    (d === n ? '<div class="strong">Браво, го помина целото демо!</div>' : '') + '</div>' +
    '<button type="button" class="link muted" data-act="guideToggle" aria-label="Затвори водич">✕</button></header>' +
    '<div class="bar thin"><span style="width:' + Math.round((d / n) * 100) + '%"></span></div>' + next +
    (s.guide.expanded ? '<ol class="gsteps">' + rows + '</ol>' : '') +
    '<div class="row gap"><button type="button" class="link muted small" data-act="guideExpand" aria-expanded="' + !!s.guide.expanded + '">' + (s.guide.expanded ? 'Скриј ги чекорите' : 'Сите чекори') + '</button><span class="grow"></span>' +
    '<button type="button" class="link muted small" data-act="guideTrack" data-val="' + other + '">Водич ' + (other === 'trainer' ? 'за тренери' : 'за клиенти') + '</button></div></aside>';
}

function showWelcome() {
  modal('<div class="eyebrow accent">ДОБРЕДОЈДЕ</div><h2 class="h1">Ова е демо на Тренирај</h2>' +
    '<p class="muted">Платформа каде сите тренери во Македонија се на едно место. Клиентите наоѓаат тренер, праќаат барање, се допишуваат, закажуваат термини и го следат напредокот.</p>' +
    '<p class="muted small">Податоците се измислени и се чуваат само во твојот прелистувач. Слободно кликај сè.</p>' +
    '<div class="stack-s"><button type="button" class="btn btn-accent btn-lg" data-act="welcome" data-val="trainer">ТРЕНЕР СУМ — ПОКАЖИ МИ</button>' +
    '<button type="button" class="btn btn-ghost btn-lg" data-act="welcome" data-val="client">Барам тренер</button>' +
    '<button type="button" class="link muted small" data-act="welcome" data-val="">Само ќе разгледам</button></div>');
}

function goStep(step) {
  const [, , href, role] = step;
  const s = store.get();
  if (role && s.role !== role) {
    if (role === 'client' && s.role === 'trainer') store.markStep('asClient');
    store.set({ role });
  }
  location.hash = href;
}

const globalActions = {
  demoRole(el) {
    const role = el.dataset.val || null;
    if (role === 'client' && store.get().role === 'trainer') store.markStep('asClient');
    store.set({ role });
    closeModal();
    location.hash = role === 'trainer' ? '#/t/home' : role === 'client' ? '#/c/home' : '#/';
  },
  demoReset() {
    if (confirm('Да се вратат сите пробни податоци на почеток?')) { closeModal(); store.reset(); welcomeShown = false; location.hash = '#/'; toast('Демото е ресетирано'); }
  },
  demoMenu() {
    const s = store.get();
    const b = (role, label, sub) => '<button type="button" class="role-btn' + (s.role === (role || null) ? ' on' : '') + '" data-act="demoRole" data-val="' + role + '"><span class="strong">' + label + '</span><span class="small">' + sub + '</span></button>';
    modal('<div class="eyebrow accent">ДЕМО</div><h2 class="h2">Гледај како</h2><div class="stack-s">' + b('trainer', 'Тренер', 'Марија Стојанова, фитнес') + b('client', 'Клиент', 'Ана Костова') + b('', 'Гостин', 'Непријавен посетител') + '</div>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="demoReset">↺ Врати ги пробните податоци</button>');
  },
  guideToggle() { store.set((s) => ({ ...s, guide: { ...s.guide, seen: true, open: !s.guide.open } })); },
  guideExpand() { store.set((s) => ({ ...s, guide: { ...s.guide, expanded: !s.guide.expanded } })); },
  guideTrack(el) { store.set((s) => ({ ...s, guide: { ...s.guide, track: el.dataset.val, open: true } })); },
  guideGo(el) { goStep(STEPS[store.get().guide.track][Number(el.dataset.val)]); },
  welcome(el) {
    const track = el.dataset.val;
    closeModal();
    if (!track) { store.set((s) => ({ ...s, guide: { ...s.guide, seen: true, open: false } })); return; }
    store.set((s) => ({ ...s, role: track === 'trainer' ? 'trainer' : s.role, guide: { ...s.guide, seen: true, open: true, track } }));
    location.hash = track === 'trainer' ? '#/t/home' : '#/';
  },
  closeModal() {
    const welcomeOpen = document.querySelector('#modal [data-act="welcome"]');
    closeModal();
    if (welcomeOpen) store.set((s) => ({ ...s, guide: { ...s.guide, seen: true, open: false } }));
  },
  go(el) { location.hash = el.dataset.href; },
};

function dispatch(type, ev) {
  const el = ev.target.closest('[data-' + type + ']');
  if (!el) return;
  const name = el.dataset[type];
  const fn = (current && current.page.actions && current.page.actions[name]) || globalActions[name];
  if (fn) {
    if (type === 'act' && (el.tagName === 'A' && !el.getAttribute('href'))) ev.preventDefault();
    fn(el, ev, current);
  }
}

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (el && el.tagName === 'BUTTON' && el.type === 'submit') return; // формите се обработуваат на submit
  dispatch('act', ev);
});
document.addEventListener('change', (ev) => dispatch('change', ev));
document.addEventListener('input', (ev) => dispatch('input', ev));
document.addEventListener('submit', (ev) => {
  const form = ev.target.closest('form[data-submit]');
  if (!form) return;
  ev.preventDefault();
  const fn = current && current.page.actions && current.page.actions[form.dataset.submit];
  if (fn) fn(form, ev, current);
});
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  const welcomeOpen = document.querySelector('#modal [data-act="welcome"]');
  closeModal();
  if (welcomeOpen) store.set((s) => ({ ...s, guide: { ...s.guide, seen: true, open: false } }));
});

window.addEventListener('hashchange', () => { closeModal(); render(true); });
store.subscribe(() => render(false));
render(true);
