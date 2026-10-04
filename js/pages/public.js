// Јавни страни: почетна, мапа, профил на тренер, регистрација, квиз, партнери, предизвици.
import { DEMO_PHOTOS } from '../photos.js';
import { kindLabels, kindsOf, REQ_GOALS, REQ_LEVELS, REQ_QUESTIONS, REQ_MODES, REQ_TIMES } from '../kinds.js';
import { DAY_SHORT as DAYS } from '../data.js';
import * as store from '../store.js';
import { SPORTS, CITIES, CHALLENGES, LEADERBOARD_OTHERS, PARTNER_CATEGORIES } from '../data.js';
import { esc, initials, icon, logo, publicLayout, appLayout, chipRow, photo, trainerPhoto, partnerPhoto, stars, priceLabel, typeLabel, toast, modal, closeModal, osmLayer } from '../ui.js';
import { reviewsBlock, reviewActions } from './social.js';
import { items as contactItems } from '../contacts.js';

// ---------- Почетна / пребарување ----------
const search = { sport: 'Сите', city: 'Сите', type: 'Сите', q: '' };

function filterTrainers() {
  const q = search.q.trim().toLowerCase();
  return store.allTrainers()
    .filter((t) => search.sport === 'Сите' || t.sports.includes(search.sport))
    .filter((t) => search.city === 'Сите' || t.city === search.city)
    .filter((t) => search.type === 'Сите' || (search.type === 'Онлајн' ? t.type !== 'live' : t.type !== 'online'))
    .filter((t) => !q || (t.name + ' ' + t.sports.join(' ') + ' ' + t.city).toLowerCase().includes(q))
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
}

export function trainerCard(t, rank) {
  return '<a class="tcard" href="#/trainer/' + t.id + '">' +
    '<div class="tcard-photo">' + photo('', 'person', '', trainerPhoto(t)) +
      (rank ? '<span class="tcard-rank">#' + rank + '</span>' : '') +
      (t.founder ? '<span class="tag tag-light tcard-tag">ОСНОВАЧ</span>' : '') + '</div>' +
    '<div class="tcard-body"><span class="strong">' + esc(t.name) + '</span>' +
    '<span class="muted small">' + esc(t.sports.join(', ')) + ' · ' + esc(t.city) + '</span>' +
    '<span class="tcard-foot"><span class="strong">' + stars(t.rating) + (t.reviews ? ' <span class="muted small">(' + t.reviews + ')</span>' : '') + '</span><span class="muted small">' + esc(priceLabel(t)) + '</span></span></div></a>';
}

export const home = {
  title: 'Најди тренер',
  render() {
    const list = filterTrainers();
    const opts = (arr, cur) => ['Сите', ...arr].map((o) => '<option' + (o === cur ? ' selected' : '') + '>' + esc(o) + '</option>').join('');
    const searchForm = '<form class="searchbar" data-submit="doSearch">' +
        '<label>СПОРТ<select name="sport">' + opts(SPORTS, search.sport) + '</select></label>' +
        '<label>ГРАД<select name="city">' + opts(CITIES, search.city) + '</select></label>' +
        '<label>ТИП<select name="type">' + ['Сите', 'Онлајн', 'Во живо'].map((o) => '<option' + (o === search.type ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></label>' +
        '<button type="submit" class="btn btn-accent">' + icon.search + ' БАРАЈ</button></form>';
    const quizLink = '<a class="quiz-link" href="#/quiz">Не си сигурен? <span class="accent">Направи квиз од 5 прашања →</span></a>';
    const hero = '<section class="hero">' +
      '<div class="hero-text"><div class="eyebrow accent line">СИТЕ ТРЕНЕРИ ВО МАКЕДОНИЈА</div>' +
      '<h1 class="display">Тренирај<br>со <span class="accent">најдобрите.</span></h1>' +
      '<p class="lead">Најди тренер, договори термин и следи го напредокот — сè на едно место.</p>' +
      searchForm + quizLink + '</div>' +
      '<div class="hero-visual">' + photo('ФОТО: ТРЕНЕР ВО АКЦИЈА', 'dumbbell', 'photo-hero', ['img/hero.jpg', DEMO_PHOTOS.hero]) +
        '<div class="float-card"><span class="avatar">МС</span><span><span class="strong">Марија Стојанова</span><span class="muted-dark small">Фитнес · ★ 4.9</span></span><span class="tag tag-dark">ТРЕНЕР НА МЕСЕЦОТ</span></div>' +
        '<div class="sticker">Прв разговор бесплатно</div></div></section>';
    const ticker = '<div class="ticker" aria-hidden="true">' + SPORTS.map((s) => '<span>' + s.toUpperCase() + '</span><span>✦</span>').join('') + '</div>';
    const results = '<section class="section" id="results"><div class="section-head"><h2 class="h2">Тренери <span class="muted">(' + list.length + ')</span></h2>' +
      '<label class="field-inline"><span class="sr">Барај по име</span><input id="f-q" type="search" placeholder="Барај по име…" value="' + esc(search.q) + '" data-input="fQ"></label>' +
      '<a class="btn btn-ghost btn-sm" href="#/map">Мапа</a></div>' +
      (search.city !== 'Сите' || search.type !== 'Сите' ? '<div class="row gap-s wrap"><span class="muted small">Филтри:</span>' + (search.city !== 'Сите' ? '<span class="tag tag-outline">' + esc(search.city) + '</span>' : '') + (search.type !== 'Сите' ? '<span class="tag tag-outline">' + esc(search.type) + '</span>' : '') + '<button type="button" class="link accent small" data-act="clearFilters">Исчисти</button></div>' : '') +
      '<div class="chips">' + chipRow(['Сите', ...SPORTS], search.sport, 'chipSport') + '</div>' +
      (list.length ? '<div class="grid-4">' + list.map((t, i) => trainerCard(t, i + 1)).join('') + '</div>'
        : '<div class="empty">Нема тренери за овој избор. Пробај друг спорт или град.</div>') + '</section>';
    // Клиентот го бара тренерот во самата апликација (со долната лента / менито), без рекламниот дел; гостинот ја гледа почетната
    if (store.get().role === 'client') return appLayout('client', 'find', '<div class="page-head"><h1 class="display-s">Најди тренер</h1></div>' + searchForm + quizLink + results);
    return publicLayout('home', hero + ticker + results);
  },
  actions: {
    doSearch(form) {
      search.sport = form.sport.value; search.city = form.city.value; search.type = form.type.value;
      store.refresh();
      setTimeout(() => { const r = document.getElementById('results'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30);
    },
    fQ(el) { search.q = el.value; store.refresh(); },
    chipSport(el) { search.sport = el.dataset.val; store.refresh(); },
    clearFilters() { search.sport = 'Сите'; search.city = 'Сите'; search.type = 'Сите'; search.q = ''; store.refresh(); },
  },
};

// ---------- Мапа ----------
let mapSel = 't1';
export const map = {
  title: 'Мапа',
  render() {
    const trainers = store.allTrainers().filter((t) => t.city !== 'Онлајн');
    const partners = store.allPartners().filter((p) => p.lat);
    const sel = store.trainer(mapSel) || trainers[0];
    const list = trainers.map((t) => '<button type="button" class="list-row' + (t.id === sel.id ? ' on' : '') + '" data-act="mapPick" data-val="' + t.id + '">' +
      '<span class="avatar">' + initials(t.name) + '</span><span class="grow"><span class="strong">' + esc(t.name) + '</span><span class="muted small">' + esc(t.sport) + ' · ' + esc(t.city) + ' · ' + stars(t.rating) + '</span></span></button>').join('') +
      partners.map((p) => '<a class="list-row" href="#/partner/' + p.id + '"><span class="avatar light">' + initials(p.name) + '</span><span class="grow"><span class="strong">' + esc(p.name) + '</span><span class="muted small">Партнер · ' + esc(p.category) + (p.offer ? ' · ' + esc(p.offer) : '') + '</span></span></a>').join('');
    const content = '<div class="map-layout"><section class="map-list"><h1 class="h2">Тренери на мапа</h1><p class="muted small">Тренерите што работат само онлајн не се на мапата.</p>' + list + '</section>' +
      '<section class="map-wrap"><div id="map" class="map"></div>' +
      '<div class="map-card"><span class="avatar">' + initials(sel.name) + '</span><span class="grow"><span class="strong">' + esc(sel.name) + '</span><span class="muted-dark small">' + esc(sel.sport) + ' · ' + esc(sel.city) + ', ' + esc(sel.area) + '</span></span><a class="btn btn-dark btn-sm" href="#/trainer/' + sel.id + '">Профил</a></div></section></div>';
    return publicLayout('map', content);
  },
  mount() {
    const el = document.getElementById('map');
    if (!el) return;
    if (!window.L) { el.innerHTML = '<div class="empty">Мапата не можеше да се вчита. Провери ја интернет врската.</div>'; return; }
    const L = window.L;
    const sel = store.trainer(mapSel);
    const m = L.map(el, { zoomControl: true }).setView([sel.lat, sel.lng], sel.city === 'Скопје' ? 13 : 12);
    osmLayer(L).addTo(m);
    store.allTrainers().filter((t) => t.city !== 'Онлајн').forEach((t) => {
      const on = t.id === sel.id;
      const ic = L.divIcon({ className: '', html: '<span class="pin' + (on ? ' on' : '') + '">' + initials(t.name) + '</span>', iconSize: [40, 40], iconAnchor: [20, 40] });
      L.marker([t.lat, t.lng], { icon: ic }).addTo(m).on('click', () => { mapSel = t.id; store.refresh(); });
    });
    store.allPartners().filter((p) => p.lat).forEach((p) => {
      const ic = L.divIcon({ className: '', html: '<span class="pin partner">%</span>', iconSize: [36, 36], iconAnchor: [18, 36] });
      L.marker([p.lat, p.lng], { icon: ic }).addTo(m).on('click', () => { location.hash = '#/partner/' + p.id; });
    });
  },
  actions: { mapPick(el) { mapSel = el.dataset.val; store.refresh(); } },
};

// ---------- Профил на тренер ----------
export const trainerByLink = {
  title: 'Тренер',
  render(p) {
    const t = store.trainerBySlug(p.slug);
    if (!t) return notFound.render();
    location.replace('#/trainer/' + t.id);
    return '';
  },
};

// „Резултати на клиенти“ е по избор: без слики (или ако тренерот ги скрил) секцијата воопшто не се појавува
function resultsCard(t) {
  const list = store.shownResults(t);
  if (!list.length) return '';
  return '<div class="card"><h2 class="eyebrow muted">РЕЗУЛТАТИ НА КЛИЕНТИ</h2><div class="res-grid">' +
    list.map((r, i) => (r.src
      ? '<button type="button" class="res-tile" data-act="resultView" data-tid="' + esc(t.id) + '" data-val="' + i + '" aria-label="Зголеми го резултатот ' + (i + 1) + '"><img src="' + esc(r.src) + '" alt="Резултат на клиент ' + (i + 1) + '" loading="lazy"></button>'
      : '<div class="res-tile">' + photo('ПРЕД/ПОТОА', 'person', 'photo-sm', '') + '</div>')).join('') +
    '</div><p class="muted small">Објавено со дозвола од клиентите.</p></div>';
}

// „Контакт и врски“ е по избор: ако ништо не е внесено, картичката воопшто не се појавува.
// Телефонот и е-поштата можат да се дадат само на клиентите на тренерот (onlyClients).
function contactCard(t, canPriv, isOwner) {
  const all = contactItems(t.contact);
  const shown = all.filter((i) => canPriv || !i.priv);
  const locked = all.length > shown.length;
  if (!shown.length && !locked) return '';
  const demo = !!(t.contact && t.contact.demo);
  const pill = (i) => {
    const inner = '<span class="cl-ic" aria-hidden="true">' + i.ic + '</span><span class="cl-t">' + esc(i.text) + '</span>' + (i.sub ? '<span class="cl-sub">' + esc(i.sub) + '</span>' : '');
    return demo
      ? '<button type="button" class="cl" data-act="contactDemo" data-val="' + esc(i.demo) + '">' + inner + '</button>'
      : '<a class="cl" href="' + esc(i.href) + '"' + (i.href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + inner + '</a>';
  };
  return '<div class="card"><h2 class="eyebrow muted">КОНТАКТ И ВРСКИ</h2>' +
    (shown.length ? '<div class="cl-wrap">' + shown.map(pill).join('') + '</div>' : '') +
    (locked ? '<p class="muted small">🔒 Телефонот и е-поштата ги гледаат само клиентите на тренерот. Испрати барање за да се поврзете.</p>' : '') +
    (isOwner && t.contact && t.contact.onlyClients ? '<p class="muted small">Ти ги гледаш сите. Телефонот и е-поштата ги гледаат само твоите клиенти.</p>' : '') + '</div>';
}

export const trainerProfile = {
  title: (p) => (store.trainer(p.id) || {}).name || 'Тренер',
  render(p) {
    const t = store.trainer(p.id);
    if (!t) return notFound.render();
    const s = store.get();
    const cid = s.client.id;
    const linked = s.role === 'client' && store.isLinked(cid, t.id);
    const pending = s.role === 'client' && store.pendingRequestFrom(cid, t.id);
    let cta;
    if (s.role === 'trainer') cta = '<div class="note">Ова е приказ за клиентите.</div>';
    else if (linked) cta = '<a class="btn btn-accent btn-lg grow" href="#/c/messages/' + t.id + '">ОТВОРИ ЧЕТ</a><a class="btn btn-ghost btn-icon" href="#/c/booking?t=' + t.id + '" aria-label="Закажи термин">📅</a>';
    else if (pending) cta = '<button type="button" class="btn btn-ghost btn-lg grow" disabled>БАРАЊЕТО ЧЕКА ОДГОВОР</button>';
    else if (!t.accepting) cta = '<button type="button" class="btn btn-ghost btn-lg grow" data-act="waitlist" data-val="' + t.id + '">ВНЕСИ МЕ НА ЛИСТА НА ЧЕКАЊЕ</button>';
    else cta = '<button type="button" class="btn btn-accent btn-lg grow" data-act="request" data-val="' + t.id + '">ИСПРАТИ БАРАЊЕ</button>';
    const services = [];
    if (t.type !== 'online' && t.price) services.push(['Тренинг во живо', t.pricesPublic ? t.price + ' ден.' : 'На барање']);
    if (t.type !== 'live' && t.onlinePrice) services.push(['Онлајн план + следење (месец)', t.pricesPublic ? t.onlinePrice + ' ден.' : 'На барање']);
    if (!services.length) services.push(['Тренинг', 'На барање']);
    services.push(['Прв разговор', '<span class="accent">Бесплатно</span>']);
    const svc = '<div class="card"><h2 class="eyebrow muted">УСЛУГИ</h2>' + services.map(([a, b]) => '<div class="kv"><span>' + a + '</span><span class="strong">' + b + '</span></div>').join('') + '</div>';
    const rc = resultsCard(t);
    const isOwner = s.role === 'trainer' && s.trainerId === t.id;
    const canPriv = !(t.contact && t.contact.onlyClients) || isOwner || linked;
    const content = '<div class="profile">' +
      '<aside class="profile-side">' + '<div class="profile-photo">' + photo('ФОТО / ВИДЕО', 'person', 'photo-tall', trainerPhoto(t)) +
        (t.monthTop ? '<span class="tag tag-accent profile-top">ТРЕНЕР НА МЕСЕЦОТ</span>' : '') +
        '<button type="button" class="round-play" data-act="video" aria-label="Пушти видео презентација">' + icon.play + '</button></div>' +
        '<div class="row gap' + (s.role === 'trainer' ? '' : ' cta-bar') + '">' + cta + '</div>' +
        '<div class="status ' + (t.accepting ? 'ok' : 'no') + '">' + (t.accepting ? 'Прима нови клиенти · прв разговор бесплатно' : 'Моментално не прима нови клиенти') + '</div></aside>' +
      '<section class="profile-main">' +
        '<div class="row gap-s wrap">' + t.badges.map((b, i) => '<span class="tag ' + (i === 0 ? 'tag-light' : 'tag-outline') + '">' + esc(b.toUpperCase()) + '</span>').join('') + '</div>' +
        '<h1 class="display-s">' + esc(t.name) + '</h1>' +
        '<div class="muted">' + esc(t.sports.join(', ')) + ' · ' + esc(t.city) + (t.area ? ', ' + esc(t.area) : '') + ' · ' + typeLabel(t.type) + '</div><div class="eyebrow accent">' + esc(kindLabels(t).join(' + ').toUpperCase()) + '</div>' +
        '<div class="stats-3"><div class="stat"><div class="stat-num accent">' + (t.rating ? t.rating.toFixed(1) : '—') + '</div><div class="muted small">просечна оценка</div></div>' +
          '<div class="stat"><div class="stat-num">' + t.reviews + '</div><div class="muted small">оценки</div></div>' +
          '<div class="stat"><div class="stat-num">' + t.goalsReached + '</div><div class="muted small">постигнати цели</div></div></div>' +
        '<div class="card"><h2 class="eyebrow muted">ЗА МЕНЕ</h2><p>' + esc(t.bio) + '</p><div class="row gap-s wrap">' + t.certs.map((c) => '<span class="tag tag-outline">' + esc(c) + '</span>').join('') + '</div></div>' +
        (rc ? '<div class="grid-2">' + svc + rc + '</div>' : svc) +
        contactCard(t, canPriv, isOwner) +
        reviewsBlock(t.id, linked) +
      '</section></div>';
    return s.role === 'client' ? appLayout('client', 'find', content, { back: '#/', noTabs: true }) : publicLayout('home', content);
  },
  mount() { if (store.get().role !== 'trainer') store.markStep('find'); },
  actions: {
    ...reviewActions,
    resultView(el) {
      const t = store.trainer(el.dataset.tid); const r = t && store.shownResults(t)[Number(el.dataset.val)];
      if (!r || !r.src) return;
      modal('<img class="res-big" src="' + esc(r.src) + '" alt="Резултат на клиент"><p class="muted small">Објавено со дозвола од клиентот.</p><button type="button" class="btn btn-ghost" data-act="closeModal">ЗАТВОРИ</button>');
    },
    contactDemo(el) { toast('Демо-профил: во вистинската апликација ' + el.dataset.val + '.'); },
    request(el) {
      const s = store.get();
      if (s.role !== 'client') { location.hash = '#/signup?next=' + encodeURIComponent('/trainer/' + el.dataset.val); return; }
      rq.tid = el.dataset.val; rq.step = 0;
      rq.d = { goal: '', level: '', mode: '', days: [], times: [], extra: {}, limits: '', msg: '' };
      renderReq();
    },
    rqPick(el) {
      const [f, v] = el.dataset.val.split('|');
      if (f.startsWith('x:')) rq.d.extra[f.slice(2)] = rq.d.extra[f.slice(2)] === v ? '' : v;
      else if (Array.isArray(rq.d[f])) rq.d[f] = rq.d[f].includes(v) ? rq.d[f].filter((x) => x !== v) : [...rq.d[f], v];
      else rq.d[f] = v;
      renderReq();
    },
    rqText(el) { rq.d[el.dataset.val] = el.value; },
    rqBack() { rq.step = Math.max(0, rq.step - 1); renderReq(); },
    rqNext() {
      const d = rq.d;
      if (rq.step === 0 && !(d.goal && d.level && d.mode)) { toast('Избери цел, ниво и начин.'); return; }
      if (rq.step === 1 && !(d.days.length && d.times.length)) { toast('Избери барем еден ден и време.'); return; }
      rq.step += 1; renderReq();
    },
    rqSend() {
      const s = store.get(); const d = rq.d;
      const tid = rq.tid; const rid = store.uid('r'); const t = store.trainer(tid);
      const extra = questionsFor(t).map((q) => [q.q, d.extra[q.id]]).filter(([, a]) => a);
      store.markStep('request');
      store.notify(tid, 'Ново барање од ' + shortName(s.client.name), '#/t/clients?tab=req');
      const req = { id: rid, clientId: s.client.id, clientName: shortName(s.client.name), trainerId: tid, goal: d.goal + ' · ' + d.mode.toLowerCase(), msg: d.msg.trim(), status: 'pending', sentAt: Date.now(), seenAt: null,
        form: { goal: d.goal, level: d.level, mode: d.mode, days: d.days, times: d.times, extra, limits: d.limits.trim() } };
      store.set((st) => ({ ...st, requests: [...st.requests, req] }));
      closeModal();
      if (tid === s.trainerId) {
        toast('Испратено! Префрли се во улога „Тренер“ за да го видиш барањето од другата страна.');
      } else {
        toast('Барањето е испратено. Ќе видиш кога тренерот ќе го отвори и ќе одговори.');
        // другите тренери во демото го гледаат и одговараат сами по неколку секунди
        setTimeout(() => {
          const cur = store.get().requests.find((r) => r.id === rid);
          if (!cur || cur.status !== 'pending') return;
          store.notify(s.client.id, t.name.split(' ')[0] + ' го виде твоето барање', '#/c/home');
          store.set((st) => ({ ...st, requests: st.requests.map((r) => (r.id === rid ? { ...r, seenAt: Date.now() } : r)) }));
        }, 2000);
        setTimeout(() => {
          const cur = store.get().requests.find((r) => r.id === rid);
          if (!cur || !['pending', 'asked'].includes(cur.status)) return;
          store.notify(s.client.id, t.name + ' го прифати твоето барање', '#/c/messages/' + tid);
          const key = store.threadKey(s.client.id, tid);
          store.set((st) => ({ ...st,
            requests: st.requests.map((r) => (r.id === rid ? { ...r, status: 'accepted' } : r)),
            links: [...st.links, { clientId: s.client.id, trainerId: tid, since: 'нов' }],
            threads: { ...st.threads, [key]: [...(st.threads[key] || []), { from: tid, text: 'Здраво! Го прифатив барањето. Кога ти одговара бесплатен прв разговор?', at: Date.now() }] } }));
          store.addSub(s.client.id, tid, t.onlinePrice || (t.price ? t.price * 4 : 3000));
          toast(t.name + ' го прифати твоето барање!');
        }, 6000);
      }
    },
    waitlist() { toast('Те ставивме на листата на чекање. Ќе те известиме кога ќе се ослободи место.'); },
    video() { toast('Во вистинската апликација тука се пушта видео презентацијата на тренерот.'); },
  },
};

export function shortName(n) { const p = String(n).split(' '); return p[0] + (p[1] ? ' ' + p[1][0] + '.' : ''); }

// ---------- Барање до тренер: анкета во 3 чекори ----------
const rq = { tid: null, step: 0, d: null };
function questionsFor(t) {
  const out = [];
  kindsOf(t).forEach((k) => (REQ_QUESTIONS[k] || []).forEach((q) => { if (out.length < 2 && !out.some((x) => x.id === q.id)) out.push(q); }));
  return out;
}
function goalsFor(t) { return [...new Set(kindsOf(t).flatMap((k) => REQ_GOALS[k] || []))].slice(0, 6); }
function rqChips(field, list, sel) {
  return '<div class="chips wrap-chips">' + list.map((v) => { const on = Array.isArray(sel) ? sel.includes(v) : sel === v;
    return '<button type="button" class="chip' + (on ? ' on accent-chip' : '') + '" data-act="rqPick" data-val="' + esc(field + '|' + v) + '" aria-pressed="' + on + '">' + esc(v) + '</button>'; }).join('') + '</div>';
}
function renderReq() {
  const t = store.trainer(rq.tid); const d = rq.d; const last = rq.step === 2;
  let body;
  if (rq.step === 0) {
    body = '<div class="stack-s"><span class="eyebrow muted">ЦЕЛ</span>' + rqChips('goal', goalsFor(t), d.goal) + '</div>' +
      '<div class="stack-s"><span class="eyebrow muted">НИВО НА ИСКУСТВО</span>' + rqChips('level', REQ_LEVELS, d.level) + '</div>' +
      '<div class="stack-s"><span class="eyebrow muted">КАКО САКАШ ДА ТРЕНИРАШ</span>' + rqChips('mode', REQ_MODES, d.mode) + '</div>';
  } else if (rq.step === 1) {
    body = '<div class="stack-s"><span class="eyebrow muted">КОИ ДЕНОВИ ТИ ОДГОВАРААТ</span>' + rqChips('days', DAYS.map((x) => x[0] + x.slice(1).toLowerCase()), d.days) + '</div>' +
      '<div class="stack-s"><span class="eyebrow muted">КОЕ ВРЕМЕ</span>' + rqChips('times', REQ_TIMES, d.times) + '</div>';
  } else {
    body = questionsFor(t).map((q) => '<div class="stack-s"><span class="eyebrow muted">' + esc(q.q.toUpperCase()) + '</span>' + rqChips('x:' + q.id, q.opts, d.extra[q.id]) + '</div>').join('') +
      '<label class="field">Повреди или ограничувања (незадолжително)<textarea rows="2" data-input="rqText" data-val="limits" placeholder="на пр. болка во колено">' + esc(d.limits) + '</textarea></label>' +
      '<p class="muted small">Ова го гледа само ' + esc(t.name.split(' ')[0]) + ' и го споделуваш по желба.</p>' +
      '<label class="field">Порака (незадолжително)<textarea rows="2" data-input="rqText" data-val="msg" placeholder="Кажи нешто за себе…">' + esc(d.msg) + '</textarea></label>';
  }
  modal('<div class="row gap"><h2 class="h2 grow">Барање до ' + esc(t.name.split(' ')[0]) + '</h2><span class="muted small strong">' + (rq.step + 1) + ' / 3</span></div>' +
    '<div class="dots">' + [0, 1, 2].map((i) => '<span class="dot-step' + (i <= rq.step ? ' on' : '') + '"></span>').join('') + '</div>' +
    '<div class="stack">' + body + '</div>' +
    '<div class="row gap">' + (rq.step ? '<button type="button" class="btn btn-ghost" data-act="rqBack">← Назад</button>' : '<button type="button" class="btn btn-ghost" data-act="closeModal">Откажи</button>') +
      '<button type="button" class="btn btn-accent grow" data-act="' + (last ? 'rqSend' : 'rqNext') + '">' + (last ? 'ИСПРАТИ БАРАЊЕ' : 'ПОНАТАМУ →') + '</button></div>');
}

// ---------- Регистрација ----------
let signupRole = null;
export const signup = {
  title: 'Регистрација',
  render(p, q) {
    const role = signupRole || (q.role === 'trainer' || q.role === 'partner' ? q.role : 'client');
    const roleBtn = (r, title, sub) => '<button type="button" class="role-btn' + (role === r ? ' on' : '') + '" data-act="signRole" data-val="' + r + '"><span class="strong">' + title + '</span><span class="small">' + sub + '</span></button>';
    return '<div class="split">' +
      '<section class="split-visual">' + logo() + '<div class="split-copy"><h1 class="display-s">Првиот чекор<br>е <span class="accent">најтешкиот.</span></h1><p class="lead">Направи профил за 30 секунди.</p></div>' + photo('', 'dumbbell', 'photo-fill') + '</section>' +
      '<section class="split-form"><h2 class="h1">Регистрација</h2><div class="grid-3 gap-s roles">' + roleBtn('client', 'Барам тренер', 'Бесплатно') + roleBtn('trainer', 'Тренер сум', '30 дена бесплатно') + roleBtn('partner', 'Имам бизнис', 'Теретана, продавница…') + '</div>' +
      '<form class="stack" data-submit="doSignup"><input type="hidden" name="role" value="' + role + '"><input type="hidden" name="next" value="' + esc(q.next || '') + '">' +
      '<label class="field">' + (role === 'partner' ? 'Име на бизнисот' : 'Име и презиме') + '<input name="name" required autocomplete="' + (role === 'partner' ? 'organization' : 'name') + '" value="' + (role === 'trainer' ? '' : role === 'partner' ? 'Фит Зона Аеродром' : 'Ана Костова') + '"' + (role === 'trainer' ? ' placeholder="Твоето име и презиме"' : '') + '></label>' +
      '<label class="field">Email<input name="email" type="email" inputmode="email" autocomplete="email" required value="' + (role === 'trainer' ? '' : role === 'partner' ? 'info@fitzona.mk' : 'ana@primer.mk') + '"' + (role === 'trainer' ? ' placeholder="твој@email.mk"' : '') + '></label>' +
      '<label class="field">Лозинка<input name="pass" type="password" required autocomplete="new-password" value="demo1234"></label>' +
      '<label class="check"><input type="checkbox" required checked> Потврдувам дека имам 18+ години и ги прифаќам условите</label>' +
      '<button type="submit" class="btn btn-accent btn-lg">' + (role === 'trainer' ? 'ЗАПОЧНИ 30 ДЕНА БЕСПЛАТНО →' : role === 'partner' ? 'НАПРАВИ ПРОФИЛ ЗА БИЗНИСОТ →' : 'ПРОДОЛЖИ →') + '</button></form>' +
      '<p class="muted small center">Демо: полињата се пополнети однапред, само кликни.</p></section></div>';
  },
  actions: {
    signRole(el) { signupRole = el.dataset.val; store.refresh(); },
    doSignup(form) {
      const f = new FormData(form);
      const role = f.get('role');
      signupRole = null;
      if (role === 'client') {
        store.set((s) => ({ ...s, role: 'client', client: { ...s.client, name: f.get('name'), email: f.get('email') } }));
        const next = f.get('next');
        location.hash = next ? '#' + next : '#/quiz';
      } else if (role === 'partner') {
        store.set({ role: 'partner' });
        location.hash = '#/p/profile';
      } else {
        store.createTrainer(f.get('name'));
        store.set((s) => ({ ...s, guide: { ...s.guide, seen: true, open: true, track: 'trainer' } }));
        location.hash = '#/t/setup';
      }
      toast('Добредојде во ТренирајБе!');
    },
  },
};

// ---------- Квиз ----------
const QUIZ = [
  { q: 'Која е твојата главна цел?', o: ['Да ослабам', 'Да изградам мускули', 'Подобра кондиција', 'Подготовка за натпревар'] },
  { q: 'Кој спорт те интересира?', o: ['Фитнес', 'Трчање', 'Борилачки', 'Исхрана'] },
  { q: 'Колку искуство имаш?', o: ['Почетник сум', 'Малку тренирам', 'Редовно тренирам', 'Натпреварувач'] },
  { q: 'Како сакаш да тренираш?', o: ['Во живо', 'Онлајн', 'Комбинирано', 'Не ми е важно'] },
  { q: 'Колкав е твојот месечен буџет?', o: ['До 2.000 ден.', '2.000–4.000 ден.', 'Над 4.000 ден.', 'Сè уште не знам'] },
];
const quizState = { step: 0, answers: {} };

function quizResults() {
  const sport = QUIZ[1].o[quizState.answers[1] ?? 0];
  const how = quizState.answers[3] ?? 3;
  return store.allTrainers().map((t) => {
    let score = 60;
    if (t.sports.includes(sport)) score += 25;
    if (how === 0 && t.type !== 'online') score += 8;
    if (how === 1 && t.type !== 'live') score += 8;
    if (how >= 2) score += 5;
    score += Math.round((t.rating - 4.5) * 10);
    if (!t.accepting) score -= 15;
    return { t, score: Math.min(score, 99) };
  }).sort((a, b) => b.score - a.score).slice(0, 3);
}

export const quiz = {
  title: 'Квиз',
  render() {
    const done = quizState.step >= QUIZ.length;
    const pct = done ? 100 : Math.round(((quizState.step + 1) / QUIZ.length) * 100);
    let body;
    if (!done) {
      const cur = QUIZ[quizState.step];
      const letters = ['A', 'B', 'C', 'D'];
      body = '<div class="eyebrow accent center">ПРАШАЊЕ ' + (quizState.step + 1) + ' ОД ' + QUIZ.length + '</div><h1 class="display-s center">' + esc(cur.q) + '</h1>' +
        '<div class="grid-2 quiz-grid">' + cur.o.map((o, i) => '<button type="button" class="quiz-opt' + (quizState.answers[quizState.step] === i ? ' on' : '') + '" data-act="qPick" data-val="' + i + '"><span class="quiz-letter">' + letters[i] + '</span>' + esc(o) + '</button>').join('') + '</div>' +
        '<div class="row gap center-row"><button type="button" class="btn btn-ghost" data-act="qBack"' + (quizState.step === 0 ? ' disabled' : '') + '>← Назад</button><button type="button" class="btn btn-accent" data-act="qNext"' + (quizState.answers[quizState.step] == null ? ' disabled' : '') + '>ДАЛЕЈ →</button></div>';
    } else {
      const res = quizResults();
      body = '<div class="eyebrow accent center">ГОТОВО</div><h1 class="display-s center">3 тренери за тебе</h1>' +
        '<div class="grid-3 quiz-res">' + res.map((r, i) => '<a class="card match' + (i === 0 ? ' best' : '') + '" href="#/trainer/' + r.t.id + '"><span class="eyebrow ' + (i === 0 ? 'accent' : 'muted') + '">' + r.score + '% СОВПАЃАЊЕ</span><span class="strong big">' + esc(r.t.name) + '</span><span class="muted small">' + esc(r.t.sport) + ' · ' + esc(r.t.city) + ' · ' + stars(r.t.rating) + '</span></a>').join('') + '</div>' +
        '<div class="row gap center-row"><button type="button" class="btn btn-ghost" data-act="qRestart">Повтори</button><a class="btn btn-accent" href="#/">Сите тренери</a></div>';
    }
    return '<div class="quiz"><header class="topbar">' + logo() + '<span class="grow"></span><a class="nav-link" href="#/">Прескокни</a></header>' +
      '<div class="progressbar"><div style="width:' + pct + '%"></div></div><main class="quiz-main">' + body + '</main></div>';
  },
  actions: {
    qPick(el) { quizState.answers[quizState.step] = Number(el.dataset.val); store.refresh(); },
    qNext() { quizState.step += 1; store.refresh(); },
    qBack() { quizState.step = Math.max(0, quizState.step - 1); store.refresh(); },
    qRestart() { quizState.step = 0; quizState.answers = {}; store.refresh(); },
  },
};

// ---------- Партнери ----------
const partnerState = { cat: 'Сите' };

function partnerCard(p) {
  const s = store.get();
  return '<article class="card pcard"><a class="row gap-s plink" href="#/partner/' + p.id + '"><span class="avatar">' + initials(p.name) + '</span><div class="grow"><div class="strong">' + esc(p.name) + '</div><div class="muted small">' + esc(p.category) + ' · ' + esc(p.city) + '</div></div></a>' +
    '<p class="muted small pdesc">' + esc(p.desc || '') + '</p>' +
    '<div class="row gap-s wrap">' + (p.address ? '<span class="chip-s">📍 ' + esc(p.city) + '</span>' : '') + (p.website ? '<span class="chip-s">Веб-сајт</span>' : '') + (p.instagram ? '<span class="chip-s">Instagram</span>' : '') + (p.phone ? '<span class="chip-s">Телефон</span>' : '') + '</div>' +
    (p.offer ? '<div class="coupon-row"><span class="small strong">' + esc(p.offer) + '</span><button type="button" class="link accent" data-act="coupon" data-val="' + p.id + '">ПОНУДА →</button></div>'
      : '<a class="coupon-row plain" href="#/partner/' + p.id + '"><span class="small strong">Види профил</span><span class="accent strong">→</span></a>') +
    (s.role === 'partner' && p.id === s.partnerId ? '<span class="tag tag-accent">ТВОЈ ПРОФИЛ</span>' : '') + '</article>';
}

export function partnersContent() {
  const all = store.allPartners();
  const cats = ['Сите', ...PARTNER_CATEGORIES];
  const list = all.filter((p) => partnerState.cat === 'Сите' || p.category === partnerState.cat);
  const feat = all.find((p) => p.featured);
  return '<div class="section-head"><h1 class="display-s">Партнери</h1><div class="chips">' + chipRow(cats, partnerState.cat, 'pCat') + '</div></div>' +
    '<div class="partners-layout"><div class="stack">' +
    '<section class="featured"><div class="featured-photo">' + photo('', 'dumbbell', '', partnerPhoto(feat)) + '</div><div class="featured-body"><div class="eyebrow">ИЗДВОЕН ПАРТНЕР</div><a class="h2 upper plink" href="#/partner/' + feat.id + '">' + esc(feat.name) + '</a><div class="strong small">' + esc(feat.category) + ' · ' + esc(feat.city) + (feat.address ? ', ' + esc(feat.address) : '') + '</div></div>' +
    '<div class="featured-cta">' + (feat.offer ? '<div class="coupon"><div class="small strong">' + esc(feat.offer) + '</div></div><button type="button" class="btn btn-dark" data-act="coupon" data-val="' + feat.id + '">ПОКАЖИ КОД</button>' : '') + '<a class="btn btn-outline-dark btn-sm" href="#/partner/' + feat.id + '">ПРОФИЛ</a></div></section>' +
    (list.length ? '<div class="grid-3">' + list.map(partnerCard).join('') + '</div>' : '<div class="empty">Нема партнери во оваа категорија.</div>') + '</div>' +
    '<aside class="stack"><section class="card light"><h2 class="h3 upper">Имаш бизнис во спортот?</h2><p class="small">Направи профил со локација, контакт и понуди. Клиентите и тренерите на ТренирајБе ќе те најдат.</p><div class="small strong">Месечна претплата · купоните се незадолжителни</div><a class="btn btn-dark" href="#/signup?role=partner">СТАНИ ПАРТНЕР</a></section>' +
    '<section class="card"><h2 class="eyebrow muted">ПАРТНЕРОТ ДОБИВА</h2>' + ['Профил со опис, фото и локација на мапа', 'Веб-сајт, Instagram и контакт', 'Купони за корисниците (по избор)', 'Статистика: прегледи, кликови, купони'].map((x) => '<div class="check-line"><span class="accent">✓</span>' + x + '</div>').join('') + '</section></aside></div>';
}

function contactLinks(p) {
  const rows = [];
  if (p.address || p.city) rows.push(['📍', 'Адреса', (p.address ? p.address + ', ' : '') + p.city, null]);
  if (p.hours) rows.push(['🕒', 'Работно време', p.hours, null]);
  if (p.website) rows.push(['🌐', 'Веб-сајт', p.website, 'web']);
  if (p.instagram) rows.push(['📷', 'Instagram', '@' + p.instagram.replace(/^@/, ''), 'insta']);
  if (p.phone) rows.push(['📞', 'Телефон', p.phone, 'phone']);
  if (p.email) rows.push(['✉️', 'Email', p.email, 'email']);
  return rows.map(([ic, label, val, kind]) => '<div class="contact-row"><span class="contact-ic" aria-hidden="true">' + ic + '</span><span class="grow"><span class="muted small block">' + label + '</span>' +
    (kind ? '<button type="button" class="link strong" data-act="pClick" data-val="' + p.id + '" data-kind="' + kind + '">' + esc(val) + '</button>' : '<span class="strong">' + esc(val) + '</span>') + '</span></div>').join('');
}

const seenPartners = new Set();
export const partnerProfile = {
  title: (p) => (store.partner(p.id) || {}).name || 'Партнер',
  render(prm) {
    const p = store.partner(prm.id);
    if (!p) return notFound.render();
    const s = store.get();
    const content = '<div class="profile">' +
      '<aside class="profile-side"><div class="profile-photo">' + photo('ФОТО / ЛОГО', 'dumbbell', 'photo-tall', partnerPhoto(p)) + (p.featured ? '<span class="tag tag-accent profile-top">ИЗДВОЕН ПАРТНЕР</span>' : '') + '</div>' +
        (p.offer ? '<section class="card accent-card stack-s"><div class="eyebrow">ПОНУДИ ЗА КОРИСНИЦИТЕ НА ТРЕНИРАЈБЕ</div>' + (p.offerImage ? '<img class="offer-img" src="' + p.offerImage + '" alt="">' : '') + '<div class="display-xs">' + esc(p.offer) + '</div>' + (p.offerUntil ? '<div class="small strong">Важи до ' + p.offerUntil.split('-').reverse().join('.') + ' · еднаш по клиент</div>' : '') + '<button type="button" class="btn btn-dark" data-act="coupon" data-val="' + p.id + '">ПОКАЖИ КОД</button></section>' : '') +
        (s.role === 'partner' && s.partnerId === p.id ? '<a class="btn btn-ghost" href="#/p/profile">Уреди го профилот</a>' : '') + '</aside>' +
      '<section class="profile-main"><div class="row gap-s wrap"><span class="tag tag-light">' + esc(p.category.toUpperCase()) + '</span><span class="tag tag-outline">ПАРТНЕР</span></div>' +
        '<h1 class="display-s">' + esc(p.name) + '</h1><div class="muted">' + esc(p.city) + (p.address ? ', ' + esc(p.address) : '') + '</div>' +
        (p.desc ? '<div class="card"><h2 class="eyebrow muted">ЗА НАС</h2><p>' + esc(p.desc) + '</p></div>' : '') +
        '<div class="grid-2"><div class="card"><h2 class="eyebrow muted">КОНТАКТ</h2>' + contactLinks(p) + '</div>' +
        '<div class="card"><h2 class="eyebrow muted">ЛОКАЦИЈА</h2>' + (p.lat ? '<div id="pmap" class="pmap"></div>' : '<p class="muted">' + (p.city === 'Онлајн' ? 'Работи онлајн, со достава низ Македонија.' : 'Локацијата не е внесена.') + '</p>') + '</div></div>' +
      '</section></div>';
    if (s.role === 'client') return appLayout('client', 'partners', content);
    if (s.role === 'partner') return appLayout('partner', 'view', content);
    return publicLayout('partners', content);
  },
  mount(root, prm) {
    const s = store.get();
    if (!(s.role === 'partner' && s.partnerId === prm.id) && !seenPartners.has(prm.id)) { seenPartners.add(prm.id); store.trackPartner(prm.id, 'views'); }
    const el = document.getElementById('pmap'); const p = store.partner(prm.id);
    if (!el || !p || !p.lat) return;
    if (!window.L) { el.innerHTML = '<div class="muted small pad">Мапата не можеше да се вчита.</div>'; return; }
    const L = window.L;
    const m = L.map(el, { zoomControl: false, attributionControl: true, dragging: false, scrollWheelZoom: false }).setView([p.lat, p.lng], 15);
    osmLayer(L).addTo(m);
    L.marker([p.lat, p.lng], { icon: L.divIcon({ className: '', html: '<span class="pin on">' + initials(p.name) + '</span>', iconSize: [40, 40], iconAnchor: [20, 40] }) }).addTo(m);
  },
  actions: {},
};

export const partnerActions = {
  pCat(el) { partnerState.cat = el.dataset.val; store.refresh(); },
  coupon(el) {
    const p = store.partner(el.dataset.val); if (!p || !p.offer) return;
    const cid = (store.get().client && store.get().client.id) || 'guest';
    const first = store.takeCoupon(p.id, cid);
    modal('<div class="eyebrow accent">ТВОЈА ПОНУДА</div><h2 class="h2">' + esc(p.name) + '</h2><p class="muted">' + esc(p.offer) + (p.offerUntil ? ' · важи до ' + p.offerUntil.split('-').reverse().join('.') : '') + '</p><div class="code-box">' + esc(p.code) + '</div><p class="muted small">Кажи го кодот на касата. Важи еднаш по клиент' + (first ? '.' : ' — веќе си го отворил овој код.') + '</p><button type="button" class="btn btn-accent" data-act="copyCode" data-val="' + esc(p.code) + '">КОПИРАЈ КОД</button>');
  },
  copyCode(el) { try { navigator.clipboard.writeText(el.dataset.val); } catch (e) { /* */ } toast('Кодот е копиран'); },
  pClick(el) {
    store.trackPartner(el.dataset.val, 'clicks');
    const kind = el.dataset.kind;
    toast(kind === 'web' ? 'Во вистинската апликација ова го отвора веб-сајтот.' : kind === 'insta' ? 'Во вистинската апликација ова го отвора Instagram профилот.' : kind === 'phone' ? 'На телефон ова директно повикува.' : 'Ова отвора нова email порака.');
  },
};
partnerProfile.actions = partnerActions;

export const partners = {
  title: 'Партнери',
  render() {
    const s = store.get();
    if (s.role === 'partner') return appLayout('partner', 'all', partnersContent());
    return publicLayout('partners', '<div class="section">' + partnersContent() + '</div>');
  },
  actions: partnerActions,
};

// ---------- Предизвици (јавно) ----------
export const challenges = {
  title: 'Предизвици',
  render() {
    const content = '<div class="section"><h1 class="display-s">Предизвици</h1><p class="lead">Тренирај заедно со другите и искачи се на ранг листата.</p><div class="grid-4">' +
      CHALLENGES.map((c) => '<article class="card"><span class="tag ' + (c.paid ? 'tag-light' : 'tag-accent-outline') + '">' + (c.paid ? 'КОТИЗАЦИЈА ' + c.fee + ' ДЕН.' : 'БЕСПЛАТЕН') + '</span><h2 class="h3 upper">' + esc(c.name) + '</h2><p class="muted small">' + esc(c.desc) + ' · ' + c.days + ' дена</p><a class="btn btn-ghost btn-sm" href="#/signup?next=/c/challenges">Приклучи се</a></article>').join('') + '</div></div>';
    return publicLayout('challenges', content);
  },
};

export const notFound = {
  title: 'Не постои',
  render() { return publicLayout('', '<div class="section center"><h1 class="display-s">404</h1><p class="lead">Оваа страна не постои.</p><a class="btn btn-accent" href="#/">Кон почетна</a></div>'); },
};

export { LEADERBOARD_OTHERS };
