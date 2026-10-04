// Помошни функции за HTML и заеднички делови од изгледот.
import { DEMO_PHOTOS } from './photos.js';
import { features, kindLabels } from './kinds.js';
import { get, unreadCount, trainer, clientTrainers, waitingThreads } from './store.js';

export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function initials(name) {
  return String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export const icon = {
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  video: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3z"/></svg>',
  chat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  file: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg>',
  person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
  menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
};

// Знак на брендот ТренирајБе: портокалов балон за разговор со бучалка. Исти облик како favicon.svg.
export const markSvg = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><rect x="8" y="12" width="84" height="60" rx="24" fill="#FF5A1F"/><path d="M26 70 L20 94 L48 70 Z" fill="#FF5A1F"/><rect x="32" y="39.5" width="36" height="5" rx="2.5" fill="#fff"/><rect x="25" y="30" width="8" height="24" rx="4" fill="#fff"/><rect x="67" y="30" width="8" height="24" rx="4" fill="#fff"/><rect x="17" y="35" width="6" height="14" rx="3" fill="#fff"/><rect x="77" y="35" width="6" height="14" rx="3" fill="#fff"/></svg>';

export function logo() {
  return '<a class="logo" href="#/">' + markSvg + '<span>ТРЕНИРАЈ<b>БЕ</b></span></a>';
}

export function stars(r) { return r ? '★ ' + Number(r).toFixed(1) : 'Нов'; }

// Цена со точка: 10800 -> 10.800
export function den(n) { return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

export function greeting() { const h = new Date().getHours(); return h < 12 ? 'Добро утро' : h < 18 ? 'Добар ден' : 'Добра вечер'; }

export function starRow(n) { return '<span class="stars" aria-label="' + n + ' од 5">' + '★'.repeat(n) + '<span class="dimstar">' + '★'.repeat(5 - n) + '</span></span>'; }

export function ago(at) {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return 'сега';
  if (m < 60) return 'пред ' + m + ' мин';
  const h = Math.round(m / 60);
  if (h < 24) return 'пред ' + h + ' ч';
  const d = Math.round(h / 24);
  return d === 1 ? 'вчера' : 'пред ' + d + ' дена';
}

export function priceLabel(t) {
  if (!t.pricesPublic) return 'Цена на барање';
  const p = t.price || t.onlinePrice;
  return 'од ' + p + ' ден.';
}

export function typeLabel(type) {
  return type === 'online' ? 'Онлајн' : type === 'live' ? 'Во живо' : 'Онлајн и во живо';
}

export function photo(label, iconName = 'person', cls = '', src = '') {
  // Ако сликата постои (прикачена или во папката img/) се прикажува преку местото за слика; ако не постои, останува местото.
  const [s1, s2] = Array.isArray(src) ? src : [src, ''];
  src = s1 || s2; const alt = s1 ? s2 : '';
  const img = src ? '<img class="photo-img" src="' + esc(src) + '"' + (alt ? ' data-alt="' + esc(alt) + '"' : '') + ' alt="" loading="lazy" onerror="if(this.dataset.alt){this.src=this.dataset.alt;this.removeAttribute(\'data-alt\')}else{this.remove()}">' : '';
  return '<div class="photo ' + cls + '">' + '<span class="photo-icon">' + icon[iconName] + '</span>' + (label && !src ? '<span class="photo-label">' + esc(label) + '</span>' : '') + img + '</div>';
}
// Редослед: прикачена слика, па слика од папката img/, па пробна слика
export const trainerPhoto = (t) => (!t ? '' : t.photo ? t.photo : t.id && t.id !== 'preview' ? ['img/trainers/' + t.id + '.jpg', DEMO_PHOTOS[t.id] || ''] : '');
export const partnerPhoto = (p) => (!p ? '' : p.photo ? p.photo : p.id ? ['img/partners/' + p.id + '.jpg', DEMO_PHOTOS[p.id] || ''] : '');

// Надворешни куки што ги поставува app.js (на пр. бројач на водичот)
export const hooks = { guideLabel: () => 'Водич' };

const hamburger = '<button type="button" class="burger" data-act="menuOpen" aria-label="Отвори мени" aria-controls="drawer">' +
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg></button>';

function homeFor(role) { return role === 'trainer' ? '#/t/home' : role === 'client' ? '#/c/home' : role === 'partner' ? '#/p/home' : '#/'; }

// Демо контроли (промена на улога, водич, ресет): во менито ☰ и во „Повеќе“ на клиентот
function demoControls() {
  const s = get();
  const roleBtn = (role, label) => '<button type="button" class="seg' + (s.role === (role || null) ? ' on' : '') + '" data-act="demoRole" data-val="' + role + '">' + label + '</button>';
  return '<div class="eyebrow accent">ДЕМО · ГЛЕДАЈ КАКО</div><div class="segs">' + roleBtn('trainer', 'Тренер') + roleBtn('client', 'Клиент') + roleBtn('partner', 'Партнер') + roleBtn('', 'Гостин') + '</div>' +
    '<div class="row gap-s"><button type="button" class="btn btn-ghost btn-sm grow" data-act="guideToggle">' + esc(hooks.guideLabel()) + '</button><button type="button" class="btn btn-ghost btn-sm" data-act="demoReset" aria-label="Врати ги пробните податоци">↺</button></div>';
}

// Мени за телефон (хамбургер): линкови + демо контроли
function drawer(links, active, who) {
  return '<div class="drawer" id="drawer"><div class="drawer-back" data-act="menuClose"></div>' +
    '<nav class="drawer-panel" aria-label="Мени"><div class="drawer-head">' + logo() + '<button type="button" class="burger" data-act="menuClose" aria-label="Затвори мени">✕</button></div>' +
    (who ? '<div class="drawer-who">' + who + '</div>' : '') +
    '<div class="drawer-links">' + links.map(([href, label, key, badge]) => '<a href="' + href + '" class="drawer-link' + (active === key ? ' on' : '') + '">' + label + (badge ? '<span class="badge">' + badge + '</span>' : '') + '</a>').join('') + '</div>' +
    '<div class="drawer-demo">' + demoControls() + '</div>' +
    '</nav></div>';
}

// Јавен изглед: горно мени
export function publicLayout(active, content) {
  const s = get();
  const link = (href, label, key) => '<a href="' + href + '" class="' + (active === key ? 'on' : '') + '">' + label + '</a>';
  const right = s.role
    ? '<a class="btn btn-accent btn-sm" href="' + homeFor(s.role) + '">Мој простор</a>'
    : '<a href="#/signup" class="nav-link">Најава</a><a class="btn btn-accent btn-sm" href="#/signup?role=trainer">Стани тренер</a>';
  const links = [['#/', 'Тренери', 'home'], ['#/map', 'Мапа', 'map'], ['#/challenges', 'Предизвици', 'challenges'], ['#/partners', 'Партнери', 'partners']];
  const extra = s.role ? [[homeFor(s.role), 'Мој простор →', 'mine']] : [['#/signup', 'Најава', 'login'], ['#/signup?role=trainer', 'Стани тренер', 'st'], ['#/signup?role=partner', 'Стани партнер', 'sp']];
  return '<header class="topbar">' + hamburger + logo() +
    '<nav class="topnav">' + links.map(([h, l, k]) => link(h, l, k)).join('') + '</nav>' +
    '<div class="topbar-right">' + right + '</div></header>' + drawer([...links, ...extra], active, '') +
    '<main class="page">' + content + '</main>';
}

// Мени на клиентот. Истиот редослед и истите групи се на компјутер (странично мени) и на телефон (долна лента + „Повеќе“).
const CLIENT_NAV = [
  ['#/c/home', 'Мој преглед', 'home'], ['#/c/plan', 'Мој план', 'plan'], ['#/c/messages', 'Пораки', 'messages'], ['#/c/booking', 'Термини', 'booking'],
  ['#/c/progress', 'Напредок', 'progress'], ['#/c/recipes', 'План за исхрана', 'recipes'], ['#/c/challenges', 'Предизвици', 'challenges'],
  ['#/', 'Најди тренер', 'find'], ['#/c/partners', 'Партнери', 'partners'],
  ['#/c/payments', 'Плаќања', 'payments'], ['#/c/settings', 'Мој профил', 'settings'],
];
const CLIENT_GROUPS = [
  [null, ['home', 'plan', 'messages', 'booking']],
  ['ПРОГРЕС И ИСХРАНА', ['progress', 'recipes', 'challenges']],
  ['ТРЕНЕРИ И ПОНУДИ', ['find', 'partners']],
  ['СМЕТКА', ['payments', 'settings']],
];
const TRAINER_NAV = [
  ['#/t/home', 'Преглед', 'home'], ['#/t/clients', 'Клиенти', 'clients'], ['#/t/payments', 'Наплата', 'payments'], ['#/t/messages', 'Пораки', 'messages'],
  ['#/t/calendar', 'Календар', 'calendar'], ['#/t/plans', 'Планови и шаблони', 'plans'], ['#/t/recipes', 'План за исхрана', 'recipes'],
  ['#/t/profile', 'Мој профил', 'profile'],
];
const PARTNER_NAV = [
  ['#/p/home', 'Преглед', 'home'], ['#/p/profile', 'Уреди профил', 'edit'], ['#/partner/p1', 'Мој јавен профил', 'view'], ['#/partners', 'Сите партнери', 'all'],
];

function trainerNav(s) {
  const f = features(trainerOf(s));
  let nav = TRAINER_NAV.filter(([, , k]) => k !== 'recipes' || f.recipes).map(([h, l, k]) => [h, k === 'plans' ? f.plansLabel : l, k]);
  if (f.recipesFirst) {
    const r = nav.find(([, , k]) => k === 'recipes'); const pi = nav.findIndex(([, , k]) => k === 'plans');
    nav = nav.filter((x) => x !== r); nav.splice(pi, 0, r);
  }
  return nav;
}

function trainerOf(s) {
  return trainer(s.trainerId) || { name: 'Марија Стојанова', founder: true };
}

export function bell(role, n) {
  if (role === 'partner') return '';
  return '<a class="bell" href="#/' + (role === 'trainer' ? 't' : 'c') + '/notifications" aria-label="Известувања' + (n ? ', ' + n + ' нови' : '') + '">' +
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>' +
    (n ? '<span class="badge">' + n + '</span>' : '') + '</a>';
}

// ---- Клиент на телефон: долна лента + „Повеќе“ ----
// Иконите се 24×24, линија (боја од текстот).
const svg24 = (d) => '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + '</svg>';
const NAV_ICONS = {
  home: svg24('<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  plan: svg24('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 14l2 2 4-4"/>'),
  messages: svg24('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>'),
  booking: svg24('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  more: svg24('<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>'),
  progress: svg24('<path d="M3 17l5-5 4 4 9-10"/><path d="M15 6h6v6"/>'),
  recipes: svg24('<path d="M12 8c-2-3-7-2-7 3 0 5 3 10 7 10s7-5 7-10c0-5-5-6-7-3z"/><path d="M12 8c0-2 1-3 3-4"/>'),
  payments: svg24('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1"/>'),
  challenges: svg24('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 21h8"/>'),
  partners: svg24('<path d="M4 4h8l8 8-8 8-8-8z"/><circle cx="8.5" cy="8.5" r="1.2"/>'),
  find: svg24('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  settings: svg24('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>'),
};
const TAB_LABEL = { home: 'Преглед', plan: 'План', messages: 'Пораки', booking: 'Термини', find: 'Тренери' };
const navItem = (key) => CLIENT_NAV.find(([, , k]) => k === key);

// Најчестото е на еден допир; останатото е под „Повеќе“.
// Ако клиентот уште нема тренер, наместо „План“ стои „Тренери“ (а „Мој план“ оди под „Повеќе“).
function clientTabs(active, waiting, s) {
  const keys = clientTrainers(s.client.id).length ? ['home', 'plan', 'messages', 'booking'] : ['home', 'find', 'messages', 'booking'];
  const tiles = CLIENT_NAV.filter(([, , k]) => !keys.includes(k) && k !== 'settings');
  const moreOn = !keys.includes(active) && (active === 'settings' || tiles.some(([, , k]) => k === active));
  const tab = (k) => {
    const n = k === 'messages' ? waiting : 0;
    return '<a class="tab' + (active === k ? ' on' : '') + '" href="' + navItem(k)[0] + '" data-act="moreClose"' + (active === k ? ' aria-current="page"' : '') +
      (n ? ' aria-label="' + TAB_LABEL[k] + ', ' + n + (n === 1 ? ' нова порака' : ' нови пораки') + '"' : '') + '>' +
      '<span class="tab-ic">' + NAV_ICONS[k] + (n ? '<span class="badge">' + n + '</span>' : '') + '</span>' + TAB_LABEL[k] + '</a>';
  };
  const tile = ([href, label, key]) => '<a class="more-tile' + (active === key ? ' on' : '') + '" href="' + href + '" data-act="moreClose"><span class="more-ic">' + NAV_ICONS[key] + '</span><span>' + label + '</span></a>';
  return '<nav class="tabbar" aria-label="Главна навигација">' + keys.map(tab).join('') +
    '<button type="button" class="tab tab-more' + (moreOn ? ' on' : '') + '" data-act="moreToggle" aria-haspopup="dialog" aria-expanded="false" aria-controls="more-sheet"><span class="tab-ic">' + NAV_ICONS.more + '</span>Повеќе</button></nav>' +
    '<div class="more" id="more-sheet" role="dialog" aria-modal="true" aria-label="Повеќе"><div class="more-back" data-act="moreClose"></div><div class="more-panel" tabindex="-1"><div class="more-grab" aria-hidden="true"></div>' +
    '<a class="more-me' + (active === 'settings' ? ' on' : '') + '" href="#/c/settings" data-act="moreClose"><span class="avatar accent-bg">' + initials(s.client.name) + '</span><span class="grow"><span class="strong block">' + esc(s.client.name) + '</span><span class="muted small">Мој профил и поставки</span></span><span class="more-go" aria-hidden="true">›</span></a>' +
    '<div class="more-tiles">' + tiles.map(tile).join('') + '</div>' +
    '<div class="more-demo">' + demoControls() + '</div></div></div>';
}

// Изглед за најавен корисник: странично мени на компјутер; на телефон клиентот има долна лента, тренерот и партнерот хамбургер мени.
// opts.full — цела висина (чет); opts.back — стрелка „назад“ наместо знакот (клиент); opts.noTabs — без долна лента (на пр. кога на дното има главно копче).
export function appLayout(role, active, content, opts = {}) {
  const s = get();
  const isClient = role === 'client';
  const nav = role === 'trainer' ? trainerNav(s) : role === 'partner' ? PARTNER_NAV.map(([h, l, k]) => [k === 'view' ? '#/partner/' + s.partnerId : h, l, k]) : CLIENT_NAV;
  const unread = role === 'partner' ? 0 : unreadCount();
  const waiting = isClient ? waitingThreads(s.client.id) : 0;
  const badge = (key) => { const n = key === 'notif' ? unread : key === 'messages' ? waiting : 0; return n ? '<span class="badge">' + n + '</span>' : ''; };
  const sideLink = ([href, label, key]) => '<a href="' + href + '" class="side-link' + (active === key ? ' on' : '') + '">' + label + badge(key) + '</a>';
  const items = isClient
    ? CLIENT_GROUPS.map(([head, keys]) => (head ? '<div class="side-group">' + head + '</div>' : '') + keys.map((k) => sideLink(navItem(k))).join('')).join('')
    : nav.map(sideLink).join('');
  let extra, who = '';
  if (role === 'trainer') {
    const tr = trainerOf(s);
    extra = ''; // без кутија за претплата во менито на тренерот
    who = '<span class="avatar accent-bg">' + initials(tr.name) + '</span><span><span class="strong block">' + esc(tr.name) + '</span><span class="muted small">' + esc(kindLabels(tr)[0]) + (tr.founder ? ' · Основач' : '') + '</span></span>';
  } else if (role === 'partner') {
    extra = '<div class="side-card"><div class="eyebrow accent">ПАРТНЕР · АКТИВЕН</div><div class="muted small">Месечна претплата</div></div>';
    who = '<span class="avatar accent-bg">ФЗ</span><span><span class="strong block">Фит Зона Аеродром</span><span class="muted small">Партнер · Теретана</span></span>';
  } else {
    extra = ''; // без кутија „Премиум“ во менито на клиентот
  }
  const current = nav.find(([, , k]) => k === active);
  const title = current ? current[1] : active === 'notif' ? 'Известувања' : 'ТренирајБе';
  const lead = !isClient ? hamburger
    : opts.back ? '<a class="burger m-back" href="' + esc(opts.back) + '" aria-label="Назад">←</a>'
    : '<a class="m-logo" href="#/c/home" aria-label="ТренирајБе — мој преглед">' + markSvg + '</a>';
  return '<div class="app' + (opts.full ? ' app-full' : '') + '"><aside class="side"><div class="side-top">' + logo() + bell(role, unread) + '</div><nav class="side-nav" aria-label="Мени">' + items + '</nav>' + extra + '</aside>' +
    '<div class="m-top">' + lead + '<span class="m-title">' + esc(title) + '</span>' + bell(role, unread) + '</div>' +
    (isClient ? '' : drawer(nav.map(([h, l, k]) => [h, l, k, k === 'notif' ? unread : 0]), active, who)) +
    '<main class="app-main">' + content + '</main>' + (isClient && !opts.noTabs ? clientTabs(active, waiting, s) : '') + '</div>';
}

// Подлога на мапите: OpenStreetMap (бесплатно, без клуч). Изворот мора да стои на мапата („© OpenStreetMap contributors“).
export function osmLayer(L) {
  return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19,
  });
}

export function chipRow(options, current, action) {
  return options.map((o) => '<button type="button" class="chip' + (o === current ? ' on' : '') + '" data-act="' + action + '" data-val="' + esc(o) + '">' + esc(o) + '</button>').join('');
}

export function toast(text) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
  el.textContent = text;
  el.className = 'show';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ''; }, 2600);
}

// Избор на слика од уредот: се намалува (најголема страна maxPx) и се враќа како JPEG (data URL), само за демото
export function pickImage(maxPx, done) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => {
    const f = inp.files && inp.files[0]; if (!f) return;
    const img = new Image(); const url = URL.createObjectURL(f);
    img.onload = () => {
      const k = Math.min(1, maxPx / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      done(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => toast('Оваа слика не може да се отвори.');
    img.src = url;
  };
  inp.click();
}

export function modal(html) {
  closeModal();
  const wrap = document.createElement('div');
  wrap.id = 'modal';
  wrap.innerHTML = '<div class="modal-back" data-act="closeModal"></div><div class="modal-box" role="dialog" aria-modal="true">' + html + '</div>';
  document.body.appendChild(wrap);
}

export function closeModal() { const m = document.getElementById('modal'); if (m) m.remove(); }

export function lineChart(values, { w = 700, h = 240, accent = 'var(--accent)' } = {}) {
  if (!values.length) return '';
  const min = Math.min(...values), max = Math.max(...values);
  const pad = 16, span = max - min || 1;
  const pts = values.map((v, i) => [pad + (i * (w - pad * 2)) / Math.max(values.length - 1, 1), pad + ((max - v) / span) * (h - pad * 2)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const dots = pts.map((p, i) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i === pts.length - 1 ? 7 : 5) + '" fill="' + (i === pts.length - 1 ? accent : 'var(--bg)') + '" stroke="' + accent + '" stroke-width="3"/>').join('');
  return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" role="img" aria-label="Графикон на напредок">' +
    '<path d="M0 ' + h / 3 + 'H' + w + 'M0 ' + (2 * h) / 3 + 'H' + w + '" stroke="var(--line)" stroke-width="1"/>' +
    '<path d="' + d + '" fill="none" stroke="' + accent + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' + dots + '</svg>';
}
