// Главен влез: рутирање, прикажување и настани.
import * as store from './store.js';
import { closeModal, toast } from './ui.js';
import * as pub from './pages/public.js';
import * as client from './pages/client.js';
import * as trainer from './pages/trainer.js';

const routes = [
  ['/', pub.home], ['/map', pub.map], ['/trainer/:id', pub.trainerProfile], ['/signup', pub.signup],
  ['/quiz', pub.quiz], ['/partners', pub.partners], ['/challenges', pub.challenges],
  ['/c/home', client.home, 'client'], ['/c/messages', client.messages, 'client'], ['/c/messages/:id', client.messages, 'client'],
  ['/c/booking', client.booking, 'client'], ['/c/progress', client.progress, 'client'], ['/c/challenges', client.challenges, 'client'],
  ['/c/partners', client.partners, 'client'], ['/c/settings', client.settings, 'client'],
  ['/t/home', trainer.home, 'trainer'], ['/t/clients', trainer.clients, 'trainer'], ['/t/messages', trainer.messages, 'trainer'],
  ['/t/messages/:id', trainer.messages, 'trainer'], ['/t/calendar', trainer.calendar, 'trainer'], ['/t/plans', trainer.plans, 'trainer'],
  ['/t/profile', trainer.profile, 'trainer'],
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
  root.innerHTML = r.page.render(r.params, r.query) + demoBar(s);
  document.documentElement.style.setProperty('--accent', s.accent);
  if (r.page.mount) r.page.mount(root, r.params, r.query);
  if (same && focusId) { const el = document.getElementById(focusId); if (el) { el.focus(); if (el.setSelectionRange && el.value) el.setSelectionRange(el.value.length, el.value.length); } }
  if (same && !scrollTop) window.scrollTo(0, y); else window.scrollTo(0, 0);
  const title = r.page.title ? (typeof r.page.title === 'function' ? r.page.title(r.params) : r.page.title) : '';
  document.title = (title ? title + ' · ' : '') + 'Тренирај';
}

function demoBar(s) {
  const btn = (role, label) => '<button type="button" data-act="demoRole" data-val="' + role + '" class="' + (s.role === role ? 'on' : '') + '">' + label + '</button>';
  return '<div class="demobar" role="group" aria-label="Демо контроли"><span class="demobar-tag">ДЕМО</span>' +
    btn('client', 'Клиент') + btn('trainer', 'Тренер') + btn('', 'Гостин') +
    '<button type="button" data-act="demoReset" title="Врати ги пробните податоци">↺</button></div>';
}

const globalActions = {
  demoRole(el) {
    const role = el.dataset.val || null;
    store.set({ role });
    location.hash = role === 'trainer' ? '#/t/home' : role === 'client' ? '#/c/home' : '#/';
  },
  demoReset() {
    if (confirm('Да се вратат сите пробни податоци на почеток?')) { store.reset(); location.hash = '#/'; toast('Демото е ресетирано'); }
  },
  closeModal() { closeModal(); },
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
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeModal(); });

window.addEventListener('hashchange', () => { closeModal(); render(true); });
store.subscribe(() => render(false));
render(true);
