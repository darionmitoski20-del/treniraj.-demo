// Помошни функции за HTML и заеднички делови од изгледот.
import { get } from './store.js';

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

export function logo() {
  return '<a class="logo" href="#/">ТРЕНИРАЈ<span class="dot">●</span></a>';
}

export function stars(r) { return '★ ' + Number(r).toFixed(1); }

export function priceLabel(t) {
  if (!t.pricesPublic) return 'Цена на барање';
  const p = t.price || t.onlinePrice;
  return 'од ' + p + ' ден.';
}

export function typeLabel(type) {
  return type === 'online' ? 'Онлајн' : type === 'live' ? 'Во живо' : 'Онлајн и во живо';
}

export function photo(label, iconName = 'person', cls = '') {
  return '<div class="photo ' + cls + '">' + '<span class="photo-icon">' + icon[iconName] + '</span>' + (label ? '<span class="photo-label">' + esc(label) + '</span>' : '') + '</div>';
}

// Јавен изглед: горно мени
export function publicLayout(active, content) {
  const s = get();
  const link = (href, label, key) => '<a href="' + href + '" class="' + (active === key ? 'on' : '') + '">' + label + '</a>';
  const right = s.role
    ? '<a class="btn btn-accent btn-sm" href="' + (s.role === 'trainer' ? '#/t/home' : '#/c/home') + '">Мој простор</a>'
    : '<a href="#/signup" class="nav-link">Најава</a><a class="btn btn-accent btn-sm" href="#/signup?role=trainer">Стани тренер</a>';
  return '<header class="topbar">' + logo() +
    '<nav class="topnav">' + link('#/', 'Тренери', 'home') + link('#/map', 'Мапа', 'map') + link('#/challenges', 'Предизвици', 'challenges') + link('#/partners', 'Партнери', 'partners') + '</nav>' +
    '<div class="topbar-right">' + right + '</div></header>' +
    '<main class="page">' + content + '</main>';
}

const CLIENT_NAV = [
  ['#/c/home', 'Мој преглед', 'home'], ['#/', 'Најди тренер', 'find'], ['#/c/messages', 'Пораки', 'messages'],
  ['#/c/booking', 'Термини', 'booking'], ['#/c/progress', 'Напредок', 'progress'], ['#/c/challenges', 'Предизвици', 'challenges'],
  ['#/c/partners', 'Партнери', 'partners'], ['#/c/settings', 'Мој профил', 'settings'],
];
const TRAINER_NAV = [
  ['#/t/home', 'Преглед', 'home'], ['#/t/clients', 'Клиенти', 'clients'], ['#/t/messages', 'Пораки', 'messages'],
  ['#/t/calendar', 'Календар', 'calendar'], ['#/t/plans', 'Планови и шаблони', 'plans'], ['#/t/profile', 'Мој профил', 'profile'],
];

// Изглед за најавен корисник: странично мени (на мобилен — долу)
export function appLayout(role, active, content, opts = {}) {
  const nav = role === 'trainer' ? TRAINER_NAV : CLIENT_NAV;
  const s = get();
  const items = nav.map(([href, label, key]) => '<a href="' + href + '" class="side-link' + (active === key ? ' on' : '') + '">' + label + '</a>').join('');
  const extra = role === 'trainer'
    ? '<div class="side-card"><div class="eyebrow accent">ОСНОВАЧ · −50%</div><div class="muted small">Претплата: 500 ден. / месец</div></div>'
    : (s.client.premium
      ? '<div class="side-card"><div class="eyebrow accent">ПРЕМИУМ АКТИВЕН</div><div class="muted small">Пробен период: 14 дена</div></div>'
      : '<a class="side-card light" href="#/c/settings"><div class="eyebrow">ПРЕМИУМ</div><div class="small strong">Попусти кај тренери и напредна аналитика</div></a>');
  return '<div class="app' + (opts.full ? ' app-full' : '') + '"><aside class="side">' + logo() + '<nav class="side-nav">' + items + '</nav>' + extra + '</aside>' +
    '<main class="app-main">' + content + '</main></div>';
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
