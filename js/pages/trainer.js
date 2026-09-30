// Страни за најавен тренер.
import * as store from '../store.js';
import { planKindOf, features, kindsOf, KINDS, KIND_IDS, PLAN_KINDS, ALL_TEMPLATES } from '../kinds.js';
import { DEMO_CLIENTS, DAY_SHORT, DAY_NAMES, SPORTS, SLOT_TIMES, DEMO_PROGRESS } from '../data.js';
import { esc, initials, appLayout, toast, modal, closeModal, chipRow, lineChart, den, greeting } from '../ui.js';
import { chatBubbles, composer, send, attachVideo, scrollChat } from './chat.js';
import { shortName } from './public.js';
import { recipeActions } from './recipes.js';
import { subLine, subText, subTag, payActions, fmtDate } from './pay.js';

const tid = () => store.get().trainerId;

function clientInfo(id) {
  const s = store.get();
  if (id === s.client.id) {
    const pr = s.progress; const lost = pr[0].weight - pr[pr.length - 1].weight;
    return { id, name: shortName(s.client.name), goal: s.client.goal, type: 'Во живо', progress: Math.min(100, Math.round((lost / s.client.goalKg) * 100)), since: 'јуни' };
  }
  const d = DEMO_CLIENTS.find((c) => c.id === id);
  if (d) return d;
  const r = s.requests.find((x) => x.clientId === id);
  return r ? { id, name: r.clientName, goal: r.goal.split(' · ')[0], type: r.goal.includes('онлајн') ? 'Онлајн' : 'Во живо', progress: 0, since: 'нов клиент' } : { id, name: 'Клиент', goal: '', type: '', progress: 0, since: '' };
}

function myClients() {
  return store.get().links.filter((l) => l.trainerId === tid()).map((l) => clientInfo(l.clientId));
}

function pendingRequests() { return store.get().requests.filter((r) => r.trainerId === tid() && ['pending', 'asked'].includes(r.status)); }

function accept(id) {
  const req = store.get().requests.find((x) => x.id === id);
  store.markStep('req');
  store.notify(req.clientId, store.trainer(req.trainerId).name + ' го прифати твоето барање', '#/c/messages/' + req.trainerId);
  store.set((s) => {
    const r = s.requests.find((x) => x.id === id);
    const links = s.links.some((l) => l.clientId === r.clientId && l.trainerId === r.trainerId) ? s.links : [...s.links, { clientId: r.clientId, trainerId: r.trainerId, since: 'нов' }];
    const key = store.threadKey(r.clientId, r.trainerId);
    const welcome = { from: r.trainerId, text: 'Здраво! Го прифатив твоето барање. Кога ти одговара прв разговор?', at: Date.now() };
    return { ...s, links, requests: s.requests.map((x) => (x.id === id ? { ...x, status: 'accepted' } : x)), threads: { ...s.threads, [key]: [...(s.threads[key] || []), welcome] } };
  });
  const tr = store.trainer(req.trainerId); const price = tr.onlinePrice || (tr.price ? tr.price * 4 : 3000);
  store.addSub(req.clientId, req.trainerId, price);
  toast('Барањето е прифатено. Клиентот доби порака.');
}
function decline(id) {
  const req = store.get().requests.find((x) => x.id === id);
  store.notify(req.clientId, store.trainer(req.trainerId).name + ' моментално нема место. Пробај друг тренер.', '#/');
  store.set((s) => ({ ...s, requests: s.requests.map((x) => (x.id === id ? { ...x, status: 'declined' } : x)) }));
  toast('Барањето е одбиено.');
}

const ASK_IDEAS = ['Колку пати неделно можеш да тренираш?', 'Имаш ли претходно искуство или повреда?', 'Кога ти одговара прв разговор?'];
const reqActions = {
  accept(el) { accept(el.dataset.val); },
  decline(el) { decline(el.dataset.val); },
  askOpen(el) {
    const r = store.get().requests.find((x) => x.id === el.dataset.val); if (!r) return;
    modal('<h2 class="h2">Прашање до ' + esc(r.clientName) + '</h2><form class="stack" data-submit="askSend"><input type="hidden" name="rid" value="' + r.id + '">' +
      '<div class="chips wrap-chips">' + ASK_IDEAS.map((q) => '<button type="button" class="chip" data-act="askIdea" data-val="' + esc(q) + '">' + esc(q) + '</button>').join('') + '</div>' +
      '<label class="field">Твое прашање<textarea id="ask-text" name="q" rows="3" maxlength="240" placeholder="Напиши кратко прашање…"></textarea></label>' +
      '<p class="muted small">Барањето останува кај тебе додека клиентот не одговори.</p><button type="submit" class="btn btn-accent">ПРАТИ ПРАШАЊЕ</button></form>');
  },
  askIdea(el) { const ta = document.getElementById('ask-text'); if (ta) ta.value = el.dataset.val; },
  askSend(form) {
    const q = form.q.value.trim(); if (!q) { toast('Напиши прашање.'); return; }
    const rid = form.rid.value; const r = store.get().requests.find((x) => x.id === rid); if (!r) return;
    store.set((st) => ({ ...st, requests: st.requests.map((x) => (x.id === rid ? { ...x, status: 'asked', question: q, answer: '', seenAt: x.seenAt || Date.now() } : x)) }));
    store.notify(r.clientId, store.trainer(r.trainerId).name.split(' ')[0] + ' ти прати прашање за барањето', '#/c/home');
    closeModal(); toast('Прашањето е испратено.');
  },
};

function requestRows(list) {
  if (!list.length) return '<div class="muted small pad">Нема нови барања.</div>';
  return list.map((r) => {
    const f = r.form;
    const lines = f
      ? [f.goal + ' · ' + f.level + ' · ' + f.mode.toLowerCase(),
         'Денови: ' + f.days.join(', ') + ' · ' + f.times.join(', ').toLowerCase(),
         ...f.extra.map(([q, a]) => q.replace(' (незадолжително)', '') + ': ' + a),
         f.limits ? 'Ограничувања: ' + f.limits : ''].filter(Boolean)
      : [r.goal];
    return '<div class="list-row req"><span class="avatar">' + initials(r.clientName) + '</span><span class="grow"><span class="strong">' + esc(r.clientName) + '</span>' +
      lines.map((l) => '<span class="muted small block">' + esc(l) + '</span>').join('') +
      (r.msg ? '<span class="muted small block">„' + esc(r.msg) + '“</span>' : '') +
      (r.status === 'asked' ? '<span class="tag tag-accent-outline">' + (r.answer ? 'КЛИЕНТОТ ОДГОВОРИ' : 'ЧЕКАШ ОДГОВОР') + '</span><span class="small block">Ти: „' + esc(r.question) + '“</span>' + (r.answer ? '<span class="small block strong">Клиент: „' + esc(r.answer) + '“</span>' : '') : '') +
      '</span><span class="row gap-s wrap req-btns"><button type="button" class="btn btn-ghost btn-sm" data-act="askOpen" data-val="' + r.id + '">Прати прашање</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="decline" data-val="' + r.id + '">Одбиј</button><button type="button" class="btn btn-light btn-sm" data-act="accept" data-val="' + r.id + '">Прифати</button></span></div>';
  }).join('');
}

// ---------- Преглед ----------
export const home = {
  title: 'Преглед',
  mount() { store.markRequestsSeen(tid()); },
  render() {
    const s = store.get(); const t = store.trainer(tid());
    const clients = myClients(); const reqs = pendingRequests();
    const week = s.bookings.filter((b) => b.trainerId === t.id);
    const todayIdx = (new Date().getDay() + 6) % 7;
    const todays = week.filter((b) => b.day === todayIdx).sort((a, b) => a.time.localeCompare(b.time));
    const earnings = store.monthEarnings(t.id);
    const unpaid = store.unpaidTotal(t.id);
    const expiring = store.dueSubs(t.id).slice(0, 5);
    const reached = t.isNew ? 0 : clients.filter((c) => c.progress >= 80).length + 12;
    const goalCard = t.isNew
      ? '<div class="card light"><div class="eyebrow">СЛЕДНО ДОСТИГНУВАЊЕ</div><div class="h3 upper">Прва ѕвезда</div><div class="bar"><div style="width:0%"></div></div><div class="small strong">Добиј ја првата оценка од клиент · награда: беџ на профилот</div></div>'
      : '<div class="card light"><div class="eyebrow">СЛЕДНО ДОСТИГНУВАЊЕ</div><div class="h3 upper">Мајстор за резултати</div><div class="bar"><div style="width:' + Math.round((reached / 20) * 100) + '%"></div></div><div class="small strong">' + reached + ' од 20 клиенти ја постигнале целта · награда: 30 дена истакнување</div></div>';
    const expBlock = expiring.length ? '<div class="card"><h2 class="eyebrow muted">ПРЕТПЛАТИ ЗА ОБНОВА</h2>' + expiring.map((sb) =>
      '<a class="list-row" href="#/t/payments"><span class="avatar">' + initials(store.clientName(sb.clientId)) + '</span><span class="grow"><span class="strong">' + esc(store.clientName(sb.clientId)) + '</span><span class="muted small">' + den(sb.price) + ' ден. · ' + subText(sb) + '</span></span>' + subTag(sb) + '</a>').join('') + '<a class="link accent strong small" href="#/t/payments">Сите наплати →</a></div>' : '';
    const content = '<div class="page-head"><h1 class="display-s">' + greeting() + ', ' + esc(t.name.split(' ')[0]) + '</h1>' +
      '<label class="pill"><input type="checkbox" data-change="accepting"' + (t.accepting ? ' checked' : '') + '> Примам нови клиенти</label></div>' +
      '<div class="grid-4"><div class="card accent-card"><div class="eyebrow">ЗАРАБОТКА / 30 ДЕНА</div><div class="display-xs">' + den(earnings) + ' ден.</div><div class="small strong">' + (unpaid ? den(unpaid) + ' ден. чекаат плаќање' : 'нема неплатени претплати') + '</div></div>' +
        '<div class="card"><div class="eyebrow muted">АКТИВНИ КЛИЕНТИ</div><div class="display-xs">' + clients.length + '</div><div class="muted small">+ ' + reqs.length + ' нови барања</div></div>' +
        '<div class="card"><div class="eyebrow muted">ТЕРМИНИ</div><div class="display-xs">' + week.length + '</div><div class="muted small">оваа недела</div></div>' +
        '<div class="card"><div class="eyebrow muted">ПРЕГЛЕДИ</div><div class="display-xs">' + (t.isNew ? 0 : 312) + '</div><div class="muted small">на профилот овој месец</div></div></div>' +
      '<div class="row gap stack-m"><section class="card grow"><h2 class="eyebrow muted">НОВИ БАРАЊА</h2>' + requestRows(reqs) + (!clients.length && !reqs.length ? '<div class="muted small pad">Сподели го линкот до профилот во „Клиенти → Покани клиент“.</div>' : '') + '</section>' +
      '<section class="stack w-320">' + expBlock + '<div class="card"><h2 class="eyebrow muted">ДЕНЕС</h2>' + (todays.length ? todays.map((b) => '<div class="kv"><span class="accent strong">' + b.time + '</span><span>' + esc(b.clientName) + ' · ' + esc(b.type.toLowerCase()) + '</span></div>').join('') : '<div class="muted small">Немаш термини денес.</div>') + '<a class="link accent small strong" href="#/t/calendar">Календар →</a></div>' +
        goalCard + (t.isNew ? '' : '<div class="card row gap"><span class="display-xs accent">#1</span><span class="small"><span class="strong">Месечна ранг листа</span><br><span class="muted">Тренер на месецот</span></span></div>') + '</section></div>';
    return appLayout('trainer', 'home', content);
  },
  actions: { ...reqActions, accepting(el) { setOverride({ accepting: el.checked }); toast(el.checked ? 'Профилот прима нови клиенти.' : 'Профилот е означен „Не прима нови“.'); } },
};

function setOverride(patch) {
  store.set((s) => ({ ...s, trainerOverrides: { ...s.trainerOverrides, [s.trainerId]: { ...(s.trainerOverrides[s.trainerId] || {}), ...patch } } }));
}

function pkgLine(cid) { return subLine(cid, tid()); }

// ---------- Клиенти ----------
const cState = { tab: 'Активни', q: '' };
export const clients = {
  title: 'Клиенти',
  mount() { store.markRequestsSeen(tid()); },
  render(p, query) {
    if (query.tab === 'req' && !cState.fromQuery) { cState.tab = 'Барања'; cState.fromQuery = true; }
    const s = store.get();
    const reqs = pendingRequests();
    const q = cState.q.toLowerCase();
    const list = myClients().filter((c) => !q || c.name.toLowerCase().includes(q));
    const nextFor = (cid) => { const b = s.bookings.find((x) => x.clientId === cid && x.trainerId === tid()); return b ? DAY_SHORT[b.day] + ', ' + b.time : 'не е закажан'; };
    let body;
    if (cState.tab === 'Активни') {
      body = '<div class="table"><div class="tr th"><span>КЛИЕНТ</span><span>ЦЕЛ И НАПРЕДОК</span><span>ТИП</span><span>СЛЕДЕН ТЕРМИН</span><span></span></div>' +
        (list.length ? list.map((c) => '<div class="tr"><span class="row gap-s"><span class="avatar">' + initials(c.name) + '</span><span><span class="strong">' + esc(c.name) + '</span><br><span class="muted small">' + pkgLine(c.id) + '</span></span></span>' +
          '<span class="stack-s"><span class="strong small">' + esc(c.goal) + '</span><span class="bar thin"><span style="width:' + c.progress + '%"></span></span></span><span class="muted">' + esc(c.type) + '</span><span class="strong">' + nextFor(c.id) + '</span>' +
          '<a class="btn btn-ghost btn-sm" href="#/t/clients/' + c.id + '">Напредок</a></div>').join('') : '<div class="muted pad">Нема клиенти.</div>') + '</div>';
    } else if (cState.tab === 'Барања') {
      body = '<section class="card">' + requestRows(reqs) + '</section>';
    } else {
      const old = s.requests.filter((r) => r.trainerId === tid() && r.status === 'declined');
      body = '<section class="card">' + (old.length ? old.map((r) => '<div class="list-row dim"><span class="avatar">' + initials(r.clientName) + '</span><span class="grow strong">' + esc(r.clientName) + '</span><span class="muted small">одбиено</span></div>').join('') : '<div class="muted small">Архивата е празна. Завршените соработки остануваат тука само за читање.</div>') + '</section>';
    }
    const content = '<div class="page-head"><h1 class="display-s">Клиенти</h1><label class="field-inline"><span class="sr">Барај</span><input id="c-q" type="search" placeholder="Барај клиент…" value="' + esc(cState.q) + '" data-input="cq"></label><button type="button" class="btn btn-accent btn-sm" data-act="invite">+ ПОКАНИ КЛИЕНТ</button></div>' +
      '<div class="chips">' + chipRow(['Активни', 'Барања', 'Архива'], cState.tab, 'cTab') + (reqs.length ? '<span class="tag tag-accent">' + reqs.length + ' нови</span>' : '') + '</div>' + body;
    return appLayout('trainer', 'clients', content);
  },
  actions: {
    ...reqActions,
    cTab(el) { cState.tab = el.dataset.val; store.refresh(); },
    cq(el) { cState.q = el.value; store.refresh(); },
    invite() {
      const link = location.origin + location.pathname + '#/trainer/' + tid();
      modal('<h2 class="h2">Покани клиенти</h2><p class="muted">Прати го овој линк на клиентите што веќе ги тренираш:</p><div class="code-box small">' + esc(link) + '</div><button type="button" class="btn btn-accent" data-act="copyLink" data-val="' + esc(link) + '">КОПИРАЈ ЛИНК</button>');
    },
    copyLink(el) { try { navigator.clipboard.writeText(el.dataset.val); } catch (e) { /* */ } closeModal(); toast('Линкот е копиран.'); },
  },
};

// ---------- Пораки ----------
export const messages = {
  title: 'Пораки',
  render(p) {
    const list = myClients();
    if (!list.length) return appLayout('trainer', 'messages', '<div class="empty">Немаш клиенти уште.</div>');
    const c = list.find((x) => x.id === p.id) || list[0];
    const threads = list.map((x) => { const th = store.thread(x.id, tid()); const last = th[th.length - 1];
      const unread = last && last.from !== tid();
      return '<a class="thread' + (x.id === c.id ? ' on' : '') + '" href="#/t/messages/' + x.id + '"><span class="avatar">' + initials(x.name) + '</span><span class="grow ellipsis"><span class="strong">' + esc(x.name) + '</span><span class="muted small ellipsis">' + esc(last ? last.text : 'Нема пораки') + '</span></span>' + (unread ? '<span class="dot-accent"></span>' : '') + '</a>'; }).join('');
    const content = '<div class="chat-layout two"><section class="threads"><h1 class="h2 upper">Пораки</h1>' + threads + '</section>' +
      '<section class="chat"><header class="chat-head"><div class="grow"><div class="strong">' + esc(c.name) + '</div><div class="muted small">' + esc(c.goal) + ' · ' + esc(c.type.toLowerCase()) + '</div></div>' +
        '<a class="btn btn-accent btn-sm" href="#/t/clients/' + c.id + '">Напредок</a><a class="btn btn-ghost btn-sm" href="#/t/plans?c=' + c.id + '">Прати план</a>' + (myFeatures().recipes ? '<a class="btn btn-ghost btn-sm" href="#/t/recipes?c=' + c.id + '">Прати рецепт</a>' : '') + '<button type="button" class="btn btn-accent btn-sm" data-act="videoCall">Видео повик</button></header>' +
        '<div class="chat-body">' + chatBubbles(store.thread(c.id, tid()), tid()) + '</div>' + composer('sendMsg', 'attach') + '</section></div>';
    return appLayout('trainer', 'messages', content, { full: true });
  },
  mount() { scrollChat(); },
  actions: {
    sendMsg(form, ev, cur) { const cid = activeClient(cur); if (form.text.value.trim()) store.markStep('msg'); send(cid, tid(), tid(), form.text.value, cid); },
    attach(el, ev, cur) { attachVideo(activeClient(cur), tid(), tid()); },
    videoCall() { toast('Во вистинската апликација тука се отвора видео повик.'); },
    ...recipeActions,
  },
};
function activeClient(cur) { const list = myClients(); return (list.find((x) => x.id === cur.params.id) || list[0]).id; }

// ---------- Календар ----------
export const calendar = {
  title: 'Календар',
  render() {
    const s = store.get();
    const bookings = s.bookings.filter((b) => b.trainerId === tid());
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const todayIdx = (new Date().getDay() + 6) % 7;
    const cols = DAY_SHORT.map((d, i) => {
      const evs = bookings.filter((b) => b.day === i).map((b) => { const h = parseInt(b.time, 10);
        return '<button type="button" class="ev ' + (b.type === 'Во живо' ? 'live' : 'online') + '" style="top:' + ((h - 8) * 44 + 2) + 'px" data-act="evOpen" data-val="' + b.id + '"><span class="strong">' + esc(b.clientName) + '</span><span class="small">' + b.time + '</span></button>'; }).join('');
      return '<div class="cal-col' + (i === 6 ? ' closed' : '') + '">' + evs + '</div>';
    }).join('');
    const list = DAY_NAMES.map((dn, i) => {
      const items = bookings.filter((b) => b.day === i).sort((a, b) => a.time.localeCompare(b.time));
      if (!items.length && i !== todayIdx) return '';
      return '<section class="cal-day' + (i === todayIdx ? ' today' : '') + '"><h3>' + dn.toUpperCase() + (i === todayIdx ? ' · ДЕНЕС' : '') + '</h3>' +
        (items.length ? items.map((b) => '<button type="button" class="cal-item" data-act="evOpen" data-val="' + b.id + '"><span class="cal-time">' + b.time + '</span><span class="cal-dot' + (b.type === 'Во живо' ? '' : ' online') + '"></span><span class="grow"><span class="strong block">' + esc(b.clientName) + '</span><span class="muted small">' + esc(b.type) + '</span></span><span class="muted">›</span></button>').join('') : '<p class="muted small">Нема термини.</p>') + '</section>';
    }).join('');
    const content = '<div class="page-head"><h1 class="display-s">Календар</h1><span class="muted strong">Оваа недела</span></div>' +
      '<div class="cal-list m-show">' + list + '</div>' +
      '<div class="legend hide-m"><span><i class="lg live"></i>Во живо</span><span><i class="lg online"></i>Онлајн / видео</span><span><i class="lg closed"></i>Неработен ден</span></div>' +
      '<div class="booking"><div class="cal grow hide-m"><div class="cal-head"><span></span>' + DAY_SHORT.map((d, i) => '<span class="' + (i === todayIdx ? 'accent' : '') + '">' + d + '</span>').join('') + '</div>' +
        '<div class="cal-body"><div class="cal-hours">' + hours.map((h) => '<span>' + String(h).padStart(2, '0') + '</span>').join('') + '</div>' + cols + '</div></div>' +
      '<aside class="stack w-300"><button type="button" class="btn btn-accent" data-act="addSlot">+ ДОДАДИ ТЕРМИН</button>' +
        '<section class="card"><h2 class="eyebrow muted">РАБОТНО ВРЕМЕ</h2><div class="kv"><span>Пон – Пет</span><span class="strong">08 – 20</span></div><div class="kv"><span>Сабота</span><span class="strong">08 – 12</span></div><div class="kv"><span>Недела</span><span class="muted">Слободно</span></div></section>' +
        '<section class="card stack-s"><h2 class="eyebrow muted">ПРАВИЛО ЗА ОТКАЖУВАЊЕ</h2><label class="field">Клиентот може да откаже најдоцна<select data-change="cancelHours">' + [[24, '24 часа пред'], [12, '12 часа пред'], [0, 'Секогаш']].map(([v, l]) => '<option value="' + v + '"' + (s.availability.cancelHours === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label>' +
        '<label class="check"><input type="checkbox" data-change="deposit"' + (s.availability.deposit ? ' checked' : '') + '> Барај депозит при закажување</label></section>' +
        '<section class="card note">Клиентите добиваат потсетник во апликацијата и на email пред секој термин.</section></aside></div>';
    return appLayout('trainer', 'calendar', content);
  },
  actions: {
    cancelHours(el) { store.set((s) => ({ ...s, availability: { ...s.availability, cancelHours: Number(el.value) } })); toast('Правилото е зачувано.'); },
    deposit(el) { store.set((s) => ({ ...s, availability: { ...s.availability, deposit: el.checked } })); },
    evOpen(el) {
      const b = store.get().bookings.find((x) => x.id === el.dataset.val);
      modal('<h2 class="h2">' + esc(b.clientName) + '</h2><p class="muted">' + DAY_NAMES[b.day] + ', ' + b.time + ' · ' + esc(b.type.toLowerCase()) + '</p><div class="row gap"><button type="button" class="btn btn-accent" data-act="evDone" data-val="' + b.id + '">Означи како одржан</button><div class="row gap"><a class="btn btn-ghost grow" href="#/t/messages/' + b.clientId + '">Порака</a><button type="button" class="btn btn-danger grow" data-act="evCancel" data-val="' + b.id + '">Откажи термин</button></div>');
    },
    evDone(el) {
      const b = store.get().bookings.find((x) => x.id === el.dataset.val); if (!b) return;
      store.set((st) => ({ ...st, bookings: st.bookings.filter((x) => x.id !== b.id) }));
      closeModal();
      toast('Терминот е одбележан како одржан.');
    },
    evCancel(el) { store.set((s) => ({ ...s, bookings: s.bookings.filter((b) => b.id !== el.dataset.val) })); closeModal(); toast('Терминот е откажан и клиентот е известен.'); },
    addSlot() {
      if (!myClients().length) { toast('Прво прифати клиент за да му закажеш термин.'); return; }
      const opts = myClients().map((c) => '<option value="' + c.id + '">' + esc(c.name) + '</option>').join('');
      modal('<h2 class="h2">Нов термин</h2><form class="stack" data-submit="saveSlot"><label class="field">Клиент<select name="c">' + opts + '</select></label><div class="grid-2 gap-s"><label class="field">Ден<select name="d">' + DAY_NAMES.slice(0, 6).map((d, i) => '<option value="' + i + '">' + d + '</option>').join('') + '</select></label>' +
        '<label class="field">Час<select name="t">' + SLOT_TIMES.map((t) => '<option>' + t + '</option>').join('') + '</select></label></div><label class="field">Тип<select name="type"><option>Во живо</option><option>Видео повик</option></select></label><button class="btn btn-accent" type="submit">ЗАЧУВАЈ</button></form>');
    },
    saveSlot(form) {
      const c = clientInfo(form.c.value);
      store.markStep('cal');
      store.notify(c.id, 'Нов термин: ' + DAY_NAMES[Number(form.d.value)] + ', ' + form.t.value, '#/c/booking');
      store.set((s) => ({ ...s, bookings: [...s.bookings, { id: store.uid('b'), clientId: c.id, clientName: c.name, trainerId: tid(), day: Number(form.d.value), time: form.t.value, type: form.type.value }] }));
      closeModal(); toast('Терминот е додаден.');
    },
  },
};

// ---------- Планови и шаблони ----------
const planState = { pk: null, tpl: null, day: 0, rows: null, name: null };
function myFeatures() { return features(store.trainer(tid())); }
function ensurePlan() {
  const f = myFeatures();
  if (!planState.pk || !f.planKinds.includes(planState.pk)) { planState.pk = f.planKinds[0]; planState.tpl = null; planState.rows = null; planState.day = 0; }
  if (!planState.rows) {
    const t = ALL_TEMPLATES.find((x) => x.id === planState.tpl && x.pk === planState.pk) || ALL_TEMPLATES.find((x) => x.pk === planState.pk);
    planState.tpl = t.id; planState.rows = t.days.map((d) => d.map((r) => [...r, false])); planState.name = t.name; planState.day = 0;
  }
  return PLAN_KINDS[planState.pk];
}
function currentRows() { ensurePlan(); return planState.rows; }
export const plans = {
  title: 'Планови',
  render(p, q) {
    const pk = ensurePlan(); const f = myFeatures();
    const rows = planState.rows;
    const dayRows = rows[planState.day] || [];
    const list = myClients();
    const kindSwitch = f.planKinds.length > 1 ? '<div class="chips">' + f.planKinds.map((k) => '<button type="button" class="chip' + (k === planState.pk ? ' on accent-chip' : '') + '" data-act="pKind" data-val="' + k + '">' + PLAN_KINDS[k].label + '</button>').join('') + '</div>' : '';
    const content = '<div class="plans"><section class="tpl-list"><h1 class="h2 upper">Шаблони</h1>' +
      ALL_TEMPLATES.filter((t) => t.pk === planState.pk).map((t) => '<button type="button" class="tpl' + (t.id === planState.tpl ? ' on' : '') + '" data-act="tpl" data-val="' + t.id + '"><span class="strong">' + esc(t.name) + '</span><span class="small">' + esc(t.meta) + '</span></button>').join('') + '</section>' +
      '<section class="grow stack">' + kindSwitch + '<div class="page-head"><div><div class="eyebrow accent">ГРАДИТЕЛ: ' + esc(pk.label.toUpperCase()) + '</div><label class="sr" for="plan-name">Име на планот</label><input id="plan-name" class="title-input" value="' + esc(planState.name) + '" data-input="pName"></div><button type="button" class="btn btn-ghost btn-sm" data-act="saveTpl">Зачувај како шаблон</button></div>' +
      '<div class="chips">' + rows.map((_, i) => '<button type="button" class="chip' + (i === planState.day ? ' on' : '') + '" data-act="pDay" data-val="' + i + '">' + pk.dayWord + ' ' + (i + 1) + '</button>').join('') + '<button type="button" class="chip dashed" data-act="addDay">+ ' + pk.dayWord + '</button></div>' +
      '<div class="table plan-table' + (planState.pk === 'gym' ? '' : ' pk-x') + '"><div class="tr th"><span>#</span>' + pk.cols.map((c) => '<span>' + c + '</span>').join('') + '<span>' + pk.media[0] + '</span><span></span></div>' +
        dayRows.map((r, i) => '<div class="tr"><span class="accent strong">' + (i + 1) + '</span>' +
          pk.cols.map((c, j) => '<input aria-label="' + esc(c) + '" placeholder="' + esc(c.toLowerCase()) + '" value="' + esc(r[j]) + '" data-input="cell" data-val="' + i + ':' + j + '">').join('') +
          '<button type="button" class="link small ' + (r[4] ? 'accent' : 'muted') + '" data-act="vid" data-val="' + i + '">' + (r[4] ? '▶ Прикачено' : pk.media[1]) + '</button>' +
          '<button type="button" class="link muted" data-act="delRow" data-val="' + i + '" aria-label="Избриши ред">✕</button></div>').join('') +
        '<div class="pad"><button type="button" class="link accent strong" data-act="addRow">' + pk.add + '</button></div></div>' +
      '<form class="card light row gap wrap" data-submit="sendPlan"><div class="grow"><div class="strong">Испрати го планот на клиент</div><div class="small">Клиентот го добива во четот.</div></div>' +
        '<label class="sr" for="plan-client">Клиент</label><select id="plan-client" name="c">' + list.map((c) => '<option value="' + c.id + '"' + (q.c === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select><button class="btn btn-dark" type="submit">ИСПРАТИ</button></form></section></div>';
    return appLayout('trainer', 'plans', content);
  },
  actions: {
    pKind(el) { planState.pk = el.dataset.val; planState.tpl = null; planState.rows = null; store.refresh(); },
    tpl(el) { planState.tpl = el.dataset.val; planState.rows = null; planState.day = 0; store.refresh(); },
    pDay(el) { planState.day = Number(el.dataset.val); store.refresh(); },
    addDay() { currentRows().push([]); planState.day = planState.rows.length - 1; store.refresh(); },
    pName(el) { planState.name = el.value; },
    cell(el) { const [r, c] = el.dataset.val.split(':').map(Number); currentRows()[planState.day][r][c] = el.value; },
    addRow() { const pk = ensurePlan(); planState.rows[planState.day].push([...pk.def, false]); store.refresh(); },
    delRow(el) { currentRows()[planState.day].splice(Number(el.dataset.val), 1); store.refresh(); },
    vid(el) { const r = currentRows()[planState.day][Number(el.dataset.val)]; r[4] = !r[4]; store.refresh(); if (r[4]) toast('Во демото прикачувањето е симулирано.'); },
    saveTpl() { toast('Шаблонот „' + planState.name + '“ е зачуван.'); },
    sendPlan(form) {
      const cid = form.c.value;
      if (!cid) { toast('Прво прифати клиент за да му испратиш план.'); return; }
      const c = clientInfo(cid); const pk = ensurePlan();
      const days = currentRows().filter((d) => d.length).map((d) => d.map((r) => [String(r[0]), String(r[1]), String(r[2]), String(r[3]), !!r[4]]));
      const count = days.reduce((n, d) => n + d.length, 0);
      if (!count) { toast('Додади барем една ставка.'); return; }
      const plan = { id: store.uid('pl'), trainerId: tid(), clientId: cid, name: planState.name || 'План', pk: planState.pk, at: Date.now(), days, done: {} };
      store.markStep('plan');
      store.set((st) => ({ ...st, sentPlans: [plan, ...st.sentPlans] }));
      store.addMessage(cid, tid(), { from: tid(), kind: 'plan', planId: plan.id, text: plan.name + ' · ' + days.length + ' × ' + pk.dayWord.toLowerCase() + ', ' + count + ' ' + pk.item });
      toast('Планот е испратен: ' + c.name);
    },
  },
};

// ---------- Мој профил ----------
export const profile = {
  title: 'Мој профил',
  render() {
    const t = store.trainer(tid());
    const content = '<div class="page-head"><h1 class="display-s">Мој профил</h1><a class="btn btn-ghost btn-sm" href="#/trainer/' + t.id + '">Види како клиент</a></div>' +
      '<form class="booking" data-submit="saveProfile"><div class="stack grow"><div class="row gap"><button type="button" class="upload square" data-act="pickPhoto" data-val="trainer">' + (t.photo ? '✓<br>Смени' : '+<br>Главна фотографија') + '</button><button type="button" class="upload grow" data-act="upPhoto">▶ Видео презентација · до 60 сек.</button></div>' +
      '<section class="card grid-2 gap-s"><label class="field">Име и презиме<input name="name" value="' + esc(t.name) + '"></label><label class="field">Локација на тренирање<input name="area" value="' + esc(t.city + (t.area ? ', ' + t.area : '')) + '"></label>' +
        '<label class="field span-2">За мене<textarea name="bio" rows="3">' + esc(t.bio) + '</textarea></label>' +
        '<div class="span-2 stack-s"><span class="eyebrow muted">МОЈ ТИП НА ТРЕНЕР (го прилагодува менито и плановите)</span><div class="chips wrap-chips">' + KIND_IDS.map((k) => '<button type="button" class="chip' + (kindsOf(t).includes(k) ? ' on accent-chip' : '') + '" data-act="toggleKind" data-val="' + k + '" aria-pressed="' + kindsOf(t).includes(k) + '">' + KINDS[k].label + '</button>').join('') + '</div></div>' +
        '<div class="span-2 stack-s"><span class="eyebrow muted">СПОРТОВИ</span><div class="chips">' + SPORTS.map((sp) => '<button type="button" class="chip' + (t.sports.includes(sp) ? ' on accent-chip' : '') + '" data-act="toggleSport" data-val="' + sp + '">' + sp + '</button>').join('') + '</div></div>' +
        '<label class="field">Тип<select name="type">' + [['both', 'Онлајн и во живо'], ['live', 'Само во живо'], ['online', 'Само онлајн']].map(([v, l]) => '<option value="' + v + '"' + (t.type === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label></section>' +
      '<section class="card row gap wrap"><span class="eyebrow muted grow">СЕРТИФИКАТИ</span>' + t.certs.map((c) => '<span class="tag tag-outline">' + esc(c) + '</span>').join('') + '<button type="button" class="chip dashed" data-act="upPhoto">+ Прикачи</button></section></div>' +
      '<aside class="stack w-340"><section class="card stack-s"><div class="row"><h2 class="eyebrow muted grow">УСЛУГИ И ЦЕНИ</h2><label class="check small"><input type="checkbox" name="pricesPublic"' + (t.pricesPublic ? ' checked' : '') + '> Прикажи јавно</label></div>' +
        '<label class="field">Тренинг во живо (ден.)<input name="price" inputmode="numeric" value="' + (t.price || '') + '"></label><label class="field">Онлајн план, месечно (ден.)<input name="onlinePrice" inputmode="numeric" value="' + (t.onlinePrice || '') + '"></label><div class="kv"><span>Прв разговор</span><span class="accent strong">Бесплатно</span></div></section>' +
        '<section class="card light stack-s"><div class="eyebrow">ИСТАКНИ ГО ПРОФИЛОТ</div><div class="small strong">Биди прв во пребарувањето за твојот спорт и град.</div><button type="button" class="btn btn-dark btn-sm" data-act="boost">ИСТАКНИ · 7 ДЕНА</button></section>' +
        '<button type="submit" class="btn btn-accent btn-lg">ЗАЧУВАЈ ПРОМЕНИ</button></aside></form>';
    return appLayout('trainer', 'profile', content);
  },
  actions: {
    upPhoto() { toast('Во вистинската апликација тука прикачуваш фајл.'); },
    boost() { toast('Во демото истакнувањето е симулирано: профилот е прв 7 дена.'); },
    toggleKind(el) {
      const t = store.trainer(tid()); const k = el.dataset.val; const cur = kindsOf(t);
      const next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k];
      if (!next.length) { toast('Избери барем еден тип.'); return; }
      setOverride({ kinds: next });
      toast('Менито и плановите се прилагодени.');
    },
    toggleSport(el) {
      const t = store.trainer(tid()); const sp = el.dataset.val;
      const next = t.sports.includes(sp) ? t.sports.filter((x) => x !== sp) : [...t.sports, sp];
      if (!next.length) { toast('Избери барем еден спорт.'); return; }
      setOverride({ sports: next, sport: next[0] });
    },
    saveProfile(form) {
      const num = (v) => { const n = parseInt(String(v).replace(/\D/g, ''), 10); return isNaN(n) ? 0 : n; };
      const [city, ...area] = form.area.value.split(',');
      store.markStep('profile');
      setOverride({ name: form.name.value, bio: form.bio.value, type: form.type.value, pricesPublic: form.pricesPublic.checked, price: num(form.price.value), onlinePrice: num(form.onlinePrice.value), city: city.trim() || 'Скопје', area: area.join(',').trim() });
      toast('Профилот е зачуван. Клиентите веќе ги гледаат промените.');
    },
  },
};


// ---------- Детали за клиент: напредок ----------
function clientProgress(id) {
  const s = store.get();
  if (id === s.client.id) {
    return { shared: s.client.share.progress, share: s.client.share, goal: s.client.goal, goalLabel: '−' + s.client.goalKg + ' кг', level: 'Почетник', injuries: 'Болки во долниот дел на грбот понекогаш', data: s.progress, comment: s.trainerComment };
  }
  const d = DEMO_PROGRESS[id];
  if (d) return { shared: true, share: { goal: true, level: true, injuries: true, progress: true }, ...d, comment: (s.clientComments || {})[id] || '' };
  return { shared: false, share: {}, data: [] };
}

function pkgSection(cid) {
  const sub = store.subFor(cid, tid());
  const plans = store.plansFor(cid, tid());
  const pays = store.paymentsOf(tid()).filter((p) => p.clientId === cid).slice(0, 4);
  const packageCard = '<section class="card stack-s"><div class="row gap"><h2 class="eyebrow muted grow">ПРЕТПЛАТА</h2>' + (sub ? subTag(sub) : '') + '</div>' +
    (sub ? '<div class="row gap baseline"><span class="display-xs">' + den(sub.price) + ' ден.</span><span class="muted">месечно</span></div><div class="strong">' + subText(sub) + '</div>' +
      '<div class="row gap-s wrap"><button type="button" class="btn btn-accent btn-sm" data-act="payOpen" data-val="' + sub.id + '">Означи платено</button>' + (store.subState(sub) === 'ok' ? '' : '<button type="button" class="btn btn-ghost btn-sm" data-act="payRemind" data-val="' + sub.id + '">Потсети</button>') + '</div>' +
      (pays.length ? '<div class="stack-s"><span class="eyebrow muted">ПОСЛЕДНИ ПЛАЌАЊА</span>' + pays.map((p) => '<div class="kv"><span class="muted">' + fmtDate(p.at) + '</span><span class="grow">' + (p.method === 'cash' ? 'Готовина' : 'Банка') + '</span><span class="strong">' + den(p.amount) + ' ден.</span></div>').join('') + '</div>' : '')
      : '<p class="muted">Клиентот нема претплата. Создај ја за да следиш кога плаќа и кога истекува.</p><button type="button" class="btn btn-accent btn-sm" data-act="subNew" data-val="' + cid + '">+ Создај претплата</button>') +
    '<p class="muted small">Парите се плаќаат директно; тука само го евидентираш.</p></section>';
  const planCards = plans.length ? '<section class="card stack-s"><h2 class="eyebrow muted">ИСПРАТЕНИ ПЛАНОВИ</h2>' + plans.map((pl) => { const pg = store.planProgress(pl);
    return '<a class="list-row" href="#/t/plan/' + pl.id + '"><span class="grow"><span class="strong">' + esc(pl.name) + '</span><span class="muted small">' + pg.done + ' од ' + pg.total + ' ' + planKindOf(pl).item + ' одработени</span><span class="bar thin"><span style="width:' + Math.round((pg.done / Math.max(pg.total, 1)) * 100) + '%"></span></span></span><span class="muted">›</span></a>'; }).join('') + '</section>' : '';
  return packageCard + planCards;
}

let cMetric = 'weight';
export const clientDetail = {
  title: 'Напредок на клиент',
  render(p) {
    const c = clientInfo(p.id);
    const pr = clientProgress(p.id);
    const s = store.get();
    const next = s.bookings.filter((b) => b.clientId === p.id && b.trainerId === tid()).sort((a, b) => a.day - b.day)[0];
    const head = '<div class="page-head"><div class="row gap-s"><a class="btn btn-ghost btn-icon" href="#/t/clients" aria-label="Назад кон клиенти">←</a><span class="avatar lg accent-bg">' + initials(c.name) + '</span>' +
      '<div><h1 class="display-s">' + esc(c.name) + '</h1><div class="muted small">' + esc(c.type || '') + ' · од ' + esc(c.since || '') + (next ? ' · следен термин ' + DAY_SHORT[next.day] + ' ' + next.time : '') + '</div></div></div></div>' +
      '<div class="row gap-s wrap"><a class="btn btn-ghost btn-sm" href="#/t/messages/' + p.id + '">Порака</a><a class="btn btn-ghost btn-sm" href="#/t/plans?c=' + p.id + '">Прати план</a>' + (myFeatures().recipes ? '<a class="btn btn-ghost btn-sm" href="#/t/recipes?c=' + p.id + '">Прати рецепт</a>' : '') + '</div>';
    if (!pr.data.length || !pr.shared) {
      return appLayout('trainer', 'clients', head + '<div class="booking"><div class="stack grow"><div class="empty">' + (pr.data.length ? 'Клиентот избрал да не го споделува напредокот.' : 'Клиентот сè уште нема внесено напредок.') + '<br><button type="button" class="btn btn-accent btn-sm" style="margin-top:12px" data-act="askProgress" data-val="' + p.id + '">Замоли го да внесе напредок</button></div></div><aside class="stack w-330">' + pkgSection(p.id) + '</aside></div>');
    }
    const data = pr.data;
    const first = data[0], last = data[data.length - 1];
    const d = (k) => last[k] - first[k];
    const sign = (v, dec = 1) => (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v).toFixed(dec);
    const avgW = (data.reduce((a, x) => a + x.workouts, 0) / data.length).toFixed(1);
    const m = { weight: ['Килажа', 'кг'], waist: ['Струк', 'cm'], workouts: ['Тренинзи', ''] };
    const vals = data.map((x) => x[cMetric]);
    const info = [];
    if (pr.share.goal) info.push(['Цел', esc(pr.goal) + ' · ' + esc(pr.goalLabel)]);
    if (pr.share.level) info.push(['Ниво', esc(pr.level)]);
    if (pr.share.injuries && pr.injuries) info.push(['Повреди', esc(pr.injuries)]);
    const content = head +
      '<div class="grid-4 stats-row4"><div class="card accent-card"><div class="eyebrow">КИЛАЖА</div><div class="display-xs">' + last.weight.toFixed(1) + ' кг</div><div class="small strong">' + sign(d('weight')) + ' кг за ' + data.length + ' нед.</div></div>' +
        '<div class="card"><div class="eyebrow muted">СТРУК</div><div class="display-xs">' + last.waist + ' cm</div><div class="muted small">' + sign(d('waist'), 0) + ' cm</div></div>' +
        '<div class="card"><div class="eyebrow muted">ТРЕНИНЗИ</div><div class="display-xs">' + avgW + '</div><div class="muted small">просечно неделно</div></div>' +
        '<div class="card"><div class="eyebrow muted">ЦЕЛ</div><div class="display-xs">' + c.progress + '%</div><div class="bar thin"><span style="width:' + c.progress + '%"></span></div></div></div>' +
      '<div class="booking"><div class="stack grow"><section class="card"><div class="chips">' + Object.entries(m).map(([k, v]) => '<button type="button" class="chip' + (k === cMetric ? ' on' : '') + '" data-act="cMetric" data-val="' + k + '">' + v[0] + '</button>').join('') + '</div>' +
        lineChart(vals) + '<div class="axis">' + data.map((x) => '<span>Н' + x.week + '</span>').join('') + '</div></section>' +
        '<section class="card"><h2 class="eyebrow muted">ВНЕСУВАЊА</h2><div class="ptable"><div class="ptr th"><span>НЕДЕЛА</span><span>КИЛАЖА</span><span>СТРУК</span><span>ТРЕНИНЗИ</span></div>' +
          data.slice().reverse().map((x, i, arr) => { const prev = arr[i + 1]; const dw = prev ? x.weight - prev.weight : 0;
            return '<div class="ptr"><span class="strong">Нед ' + x.week + '</span><span>' + x.weight.toFixed(1) + (prev ? ' <span class="' + (dw <= 0 ? 'down' : 'up') + '">' + sign(dw) + '</span>' : '') + '</span><span>' + x.waist + '</span><span>' + x.workouts + '</span></div>'; }).join('') + '</div></section></div>' +
      '<aside class="stack w-330">' + pkgSection(p.id) + (info.length ? '<section class="card"><h2 class="eyebrow muted">ЗА КЛИЕНТОТ</h2>' + info.map(([k, v]) => '<div class="kv"><span class="muted">' + k + '</span><span class="strong right">' + v + '</span></div>').join('') + '<p class="muted small">Клиентот одлучува што споделува.</p></section>' : '') +
        '<form class="card stack-s" data-submit="saveComment"><input type="hidden" name="cid" value="' + p.id + '"><label class="field">Коментар за напредокот<textarea name="text" rows="4" placeholder="Што оди добро, што да се смени…">' + esc(pr.comment || '') + '</textarea></label><button type="submit" class="btn btn-accent">ИСПРАТИ КОМЕНТАР</button><p class="muted small">Клиентот го гледа коментарот во „Напредок“ и добива известување.</p></form></aside></div>';
    return appLayout('trainer', 'clients', content);
  },
  actions: {
    cMetric(el) { cMetric = el.dataset.val; store.refresh(); },
    ...payActions,
    askProgress(el) { store.addMessage(el.dataset.val, tid(), { from: tid(), text: 'Те молам внеси го напредокот за оваа недела (килажа и мерки) за да го следиме заедно.' }); toast('Пораката е испратена.'); },
    saveComment(form) {
      const cid = form.cid.value; const text = form.text.value.trim(); if (!text) return;
      const s = store.get();
      store.notify(cid, store.trainer(tid()).name.split(' ')[0] + ' остави коментар за твојот напредок', '#/c/progress');
      if (cid === s.client.id) store.set({ trainerComment: text });
      else store.set((st) => ({ ...st, clientComments: { ...(st.clientComments || {}), [cid]: text } }));
      toast('Коментарот е испратен.');
    },
  },
};
