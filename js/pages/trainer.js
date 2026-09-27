// Страни за најавен тренер.
import * as store from '../store.js';
import { DEMO_CLIENTS, TEMPLATES, DAY_SHORT, DAY_NAMES, SPORTS, SLOT_TIMES } from '../data.js';
import { esc, initials, appLayout, toast, modal, closeModal, chipRow } from '../ui.js';
import { chatBubbles, composer, send, attachVideo, scrollChat } from './chat.js';
import { shortName } from './public.js';

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

function pendingRequests() { return store.get().requests.filter((r) => r.trainerId === tid() && r.status === 'pending'); }

function accept(id) {
  store.set((s) => {
    const r = s.requests.find((x) => x.id === id);
    const links = s.links.some((l) => l.clientId === r.clientId && l.trainerId === r.trainerId) ? s.links : [...s.links, { clientId: r.clientId, trainerId: r.trainerId, since: 'нов' }];
    const key = store.threadKey(r.clientId, r.trainerId);
    const welcome = { from: r.trainerId, text: 'Здраво! Го прифатив твоето барање. Кога ти одговара прв разговор?', at: Date.now() };
    return { ...s, links, requests: s.requests.map((x) => (x.id === id ? { ...x, status: 'accepted' } : x)), threads: { ...s.threads, [key]: [...(s.threads[key] || []), welcome] } };
  });
  toast('Барањето е прифатено. Клиентот доби порака.');
}
function decline(id) {
  store.set((s) => ({ ...s, requests: s.requests.map((x) => (x.id === id ? { ...x, status: 'declined' } : x)) }));
  toast('Барањето е одбиено.');
}

const reqActions = { accept(el) { accept(el.dataset.val); }, decline(el) { decline(el.dataset.val); } };

function requestRows(list) {
  if (!list.length) return '<div class="muted small pad">Нема нови барања.</div>';
  return list.map((r) => '<div class="list-row"><span class="avatar">' + initials(r.clientName) + '</span><span class="grow"><span class="strong">' + esc(r.clientName) + '</span><span class="muted small">' + esc(r.goal) + (r.msg ? ' · „' + esc(r.msg) + '“' : '') + '</span></span>' +
    '<button type="button" class="btn btn-ghost btn-sm" data-act="decline" data-val="' + r.id + '">Одбиј</button><button type="button" class="btn btn-light btn-sm" data-act="accept" data-val="' + r.id + '">Прифати</button></div>').join('');
}

// ---------- Преглед ----------
export const home = {
  title: 'Преглед',
  render() {
    const s = store.get(); const t = store.trainer(tid());
    const clients = myClients(); const reqs = pendingRequests();
    const week = s.bookings.filter((b) => b.trainerId === t.id);
    const today = new Date().getDay(); const todayIdx = (today + 6) % 7;
    const todays = week.filter((b) => b.day === todayIdx).sort((a, b) => a.time.localeCompare(b.time));
    const earnings = week.reduce((sum, b) => sum + (b.type === 'Во живо' ? t.price : Math.round((t.onlinePrice || 1500) / 4)), 0) * 4;
    const reached = clients.filter((c) => c.progress >= 80).length + 12;
    const content = '<div class="page-head"><h1 class="display-s">Добро утро, ' + esc(t.name.split(' ')[0]) + '</h1>' +
      '<label class="pill"><input type="checkbox" data-change="accepting"' + (t.accepting ? ' checked' : '') + '> Примам нови клиенти</label></div>' +
      '<div class="grid-4"><div class="card accent-card"><div class="eyebrow">ЗАРАБОТКА / МЕСЕЦ</div><div class="display-xs">~' + earnings.toLocaleString('mk-MK') + ' ден.</div><div class="small strong">проценка од термините</div></div>' +
        '<div class="card"><div class="eyebrow muted">АКТИВНИ КЛИЕНТИ</div><div class="display-xs">' + clients.length + '</div><div class="muted small">+ ' + reqs.length + ' нови барања</div></div>' +
        '<div class="card"><div class="eyebrow muted">ТЕРМИНИ</div><div class="display-xs">' + week.length + '</div><div class="muted small">оваа недела</div></div>' +
        '<div class="card"><div class="eyebrow muted">ПРЕГЛЕДИ</div><div class="display-xs">312</div><div class="muted small">на профилот овој месец</div></div></div>' +
      '<div class="row gap stack-m"><section class="card grow"><h2 class="eyebrow muted">НОВИ БАРАЊА</h2>' + requestRows(reqs) + '</section>' +
      '<section class="stack w-320"><div class="card"><h2 class="eyebrow muted">ДЕНЕС</h2>' + (todays.length ? todays.map((b) => '<div class="kv"><span class="accent strong">' + b.time + '</span><span>' + esc(b.clientName) + ' · ' + esc(b.type.toLowerCase()) + '</span></div>').join('') : '<div class="muted small">Немаш термини денес.</div>') + '<a class="link accent small strong" href="#/t/calendar">Календар →</a></div>' +
        '<div class="card light"><div class="eyebrow">СЛЕДНО ДОСТИГНУВАЊЕ</div><div class="h3 upper">Мајстор за резултати</div><div class="bar"><div style="width:' + Math.round((reached / 20) * 100) + '%"></div></div><div class="small strong">' + reached + ' од 20 клиенти ја постигнале целта · награда: 30 дена истакнување</div></div>' +
        '<div class="card row gap"><span class="display-xs accent">#1</span><span class="small"><span class="strong">Месечна ранг листа</span><br><span class="muted">Тренер на месецот</span></span></div></section></div>';
    return appLayout('trainer', 'home', content);
  },
  actions: { ...reqActions, accepting(el) { setOverride({ accepting: el.checked }); toast(el.checked ? 'Профилот прима нови клиенти.' : 'Профилот е означен „Не прима нови“.'); } },
};

function setOverride(patch) {
  store.set((s) => ({ ...s, trainerOverrides: { ...s.trainerOverrides, [s.trainerId]: { ...(s.trainerOverrides[s.trainerId] || {}), ...patch } } }));
}

// ---------- Клиенти ----------
const cState = { tab: 'Активни', q: '' };
export const clients = {
  title: 'Клиенти',
  render() {
    const s = store.get();
    const reqs = pendingRequests();
    const q = cState.q.toLowerCase();
    const list = myClients().filter((c) => !q || c.name.toLowerCase().includes(q));
    const nextFor = (cid) => { const b = s.bookings.find((x) => x.clientId === cid && x.trainerId === tid()); return b ? DAY_SHORT[b.day] + ', ' + b.time : 'не е закажан'; };
    let body;
    if (cState.tab === 'Активни') {
      body = '<div class="table"><div class="tr th"><span>КЛИЕНТ</span><span>ЦЕЛ И НАПРЕДОК</span><span>ТИП</span><span>СЛЕДЕН ТЕРМИН</span><span></span></div>' +
        (list.length ? list.map((c) => '<div class="tr"><span class="row gap-s"><span class="avatar">' + initials(c.name) + '</span><span><span class="strong">' + esc(c.name) + '</span><br><span class="muted small">од ' + esc(c.since) + '</span></span></span>' +
          '<span class="stack-s"><span class="strong small">' + esc(c.goal) + '</span><span class="bar thin"><span style="width:' + c.progress + '%"></span></span></span><span class="muted">' + esc(c.type) + '</span><span class="strong">' + nextFor(c.id) + '</span>' +
          '<a class="btn btn-ghost btn-sm" href="#/t/messages/' + c.id + '">Отвори</a></div>').join('') : '<div class="muted pad">Нема клиенти.</div>') + '</div>';
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
        '<a class="btn btn-ghost btn-sm" href="#/t/plans?c=' + c.id + '">Прати план</a><button type="button" class="btn btn-accent btn-sm" data-act="videoCall">Видео повик</button></header>' +
        '<div class="chat-body">' + chatBubbles(store.thread(c.id, tid()), tid()) + '</div>' + composer('sendMsg', 'attach') + '</section></div>';
    return appLayout('trainer', 'messages', content, { full: true });
  },
  mount() { scrollChat(); },
  actions: {
    sendMsg(form, ev, cur) { const cid = activeClient(cur); send(cid, tid(), tid(), form.text.value, null); },
    attach(el, ev, cur) { attachVideo(activeClient(cur), tid(), tid()); },
    videoCall() { toast('Во вистинската апликација тука се отвора видео повик.'); },
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
    const content = '<div class="page-head"><h1 class="display-s">Календар</h1><span class="muted strong">Оваа недела</span></div>' +
      '<div class="legend"><span><i class="lg live"></i>Во живо</span><span><i class="lg online"></i>Онлајн / видео</span><span><i class="lg closed"></i>Неработен ден</span></div>' +
      '<div class="booking"><div class="cal grow"><div class="cal-head"><span></span>' + DAY_SHORT.map((d, i) => '<span class="' + (i === todayIdx ? 'accent' : '') + '">' + d + '</span>').join('') + '</div>' +
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
      modal('<h2 class="h2">' + esc(b.clientName) + '</h2><p class="muted">' + DAY_NAMES[b.day] + ', ' + b.time + ' · ' + esc(b.type.toLowerCase()) + '</p><div class="row gap"><a class="btn btn-ghost" href="#/t/messages/' + b.clientId + '">Порака</a><button type="button" class="btn btn-danger" data-act="evCancel" data-val="' + b.id + '">Откажи термин</button></div>');
    },
    evCancel(el) { store.set((s) => ({ ...s, bookings: s.bookings.filter((b) => b.id !== el.dataset.val) })); closeModal(); toast('Терминот е откажан и клиентот е известен.'); },
    addSlot() {
      const opts = myClients().map((c) => '<option value="' + c.id + '">' + esc(c.name) + '</option>').join('');
      modal('<h2 class="h2">Нов термин</h2><form class="stack" data-submit="saveSlot"><label class="field">Клиент<select name="c">' + opts + '</select></label><div class="grid-2 gap-s"><label class="field">Ден<select name="d">' + DAY_NAMES.slice(0, 6).map((d, i) => '<option value="' + i + '">' + d + '</option>').join('') + '</select></label>' +
        '<label class="field">Час<select name="t">' + SLOT_TIMES.map((t) => '<option>' + t + '</option>').join('') + '</select></label></div><label class="field">Тип<select name="type"><option>Во живо</option><option>Видео повик</option></select></label><button class="btn btn-accent" type="submit">ЗАЧУВАЈ</button></form>');
    },
    saveSlot(form) {
      const c = clientInfo(form.c.value);
      store.set((s) => ({ ...s, bookings: [...s.bookings, { id: store.uid('b'), clientId: c.id, clientName: c.name, trainerId: tid(), day: Number(form.d.value), time: form.t.value, type: form.type.value }] }));
      closeModal(); toast('Терминот е додаден.');
    },
  },
};

// ---------- Планови и шаблони ----------
const planState = { tpl: 'tpl1', day: 0, rows: null, name: null };
function currentRows() {
  if (!planState.rows) { const t = TEMPLATES.find((x) => x.id === planState.tpl); planState.rows = t.days.map((d) => d.map((r) => [...r, false])); planState.name = t.name; }
  return planState.rows;
}
export const plans = {
  title: 'Планови и шаблони',
  render(p, q) {
    const rows = currentRows();
    const dayRows = rows[planState.day] || [];
    const list = myClients();
    const content = '<div class="plans"><section class="tpl-list"><h1 class="h2 upper">Шаблони</h1>' +
      TEMPLATES.map((t) => '<button type="button" class="tpl' + (t.id === planState.tpl ? ' on' : '') + '" data-act="tpl" data-val="' + t.id + '"><span class="strong">' + esc(t.name) + '</span><span class="small">' + esc(t.meta) + '</span></button>').join('') + '</section>' +
      '<section class="grow stack"><div class="page-head"><div><div class="eyebrow accent">ГРАДИТЕЛ НА ПЛАН</div><label class="sr" for="plan-name">Име на планот</label><input id="plan-name" class="title-input" value="' + esc(planState.name) + '" data-input="pName"></div><button type="button" class="btn btn-ghost btn-sm" data-act="saveTpl">Зачувај како шаблон</button></div>' +
      '<div class="chips">' + rows.map((_, i) => '<button type="button" class="chip' + (i === planState.day ? ' on' : '') + '" data-act="pDay" data-val="' + i + '">Ден ' + (i + 1) + '</button>').join('') + '<button type="button" class="chip dashed" data-act="addDay">+ Ден</button></div>' +
      '<div class="table plan-table"><div class="tr th"><span>#</span><span>ВЕЖБА</span><span>СЕРИИ</span><span>ПОВТОР.</span><span>ПАУЗА</span><span>ВИДЕО</span><span></span></div>' +
        dayRows.map((r, i) => '<div class="tr"><span class="accent strong">' + (i + 1) + '</span>' +
          '<input aria-label="Вежба" value="' + esc(r[0]) + '" data-input="cell" data-val="' + i + ':0">' +
          '<input aria-label="Серии" value="' + esc(r[1]) + '" data-input="cell" data-val="' + i + ':1">' +
          '<input aria-label="Повторувања" value="' + esc(r[2]) + '" data-input="cell" data-val="' + i + ':2">' +
          '<input aria-label="Пауза" value="' + esc(r[3]) + '" data-input="cell" data-val="' + i + ':3">' +
          '<button type="button" class="link small ' + (r[4] ? 'accent' : 'muted') + '" data-act="vid" data-val="' + i + '">' + (r[4] ? '▶ Прикачено' : '+ Снимка') + '</button>' +
          '<button type="button" class="link muted" data-act="delRow" data-val="' + i + '" aria-label="Избриши ред">✕</button></div>').join('') +
        '<div class="pad"><button type="button" class="link accent strong" data-act="addRow">+ Додади вежба</button></div></div>' +
      '<form class="card light row gap wrap" data-submit="sendPlan"><div class="grow"><div class="strong">Испрати го планот на клиент</div><div class="small">Клиентот го добива во четот.</div></div>' +
        '<label class="sr" for="plan-client">Клиент</label><select id="plan-client" name="c">' + list.map((c) => '<option value="' + c.id + '"' + (q.c === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select><button class="btn btn-dark" type="submit">ИСПРАТИ</button></form></section></div>';
    return appLayout('trainer', 'plans', content);
  },
  actions: {
    tpl(el) { planState.tpl = el.dataset.val; planState.rows = null; planState.day = 0; store.refresh(); },
    pDay(el) { planState.day = Number(el.dataset.val); store.refresh(); },
    addDay() { currentRows().push([]); planState.day = planState.rows.length - 1; store.refresh(); },
    pName(el) { planState.name = el.value; },
    cell(el) { const [r, c] = el.dataset.val.split(':').map(Number); currentRows()[planState.day][r][c] = el.value; },
    addRow() { currentRows()[planState.day].push(['Нова вежба', 3, '10', '60 сек', false]); store.refresh(); },
    delRow(el) { currentRows()[planState.day].splice(Number(el.dataset.val), 1); store.refresh(); },
    vid(el) { const r = currentRows()[planState.day][Number(el.dataset.val)]; r[4] = !r[4]; store.refresh(); if (r[4]) toast('Во демото снимката е симулирана.'); },
    saveTpl() { toast('Шаблонот „' + planState.name + '“ е зачуван.'); },
    sendPlan(form) {
      const cid = form.c.value; const c = clientInfo(cid);
      const count = currentRows().reduce((n, d) => n + d.length, 0);
      store.addMessage(cid, tid(), { from: tid(), kind: 'plan', text: planState.name + ' · ' + currentRows().length + ' дена, ' + count + ' вежби' });
      toast('Планот е испратен на ' + c.name + '.');
    },
  },
};

// ---------- Мој профил ----------
export const profile = {
  title: 'Мој профил',
  render() {
    const t = store.trainer(tid());
    const content = '<div class="page-head"><h1 class="display-s">Мој профил</h1><a class="btn btn-ghost btn-sm" href="#/trainer/' + t.id + '">Види како клиент</a></div>' +
      '<form class="booking" data-submit="saveProfile"><div class="stack grow"><div class="row gap"><button type="button" class="upload square" data-act="upPhoto">+<br>Главна фотографија</button><button type="button" class="upload grow" data-act="upPhoto">▶ Видео презентација · до 60 сек.</button></div>' +
      '<section class="card grid-2 gap-s"><label class="field">Име и презиме<input name="name" value="' + esc(t.name) + '"></label><label class="field">Локација на тренирање<input name="area" value="' + esc(t.city + (t.area ? ', ' + t.area : '')) + '"></label>' +
        '<label class="field span-2">За мене<textarea name="bio" rows="3">' + esc(t.bio) + '</textarea></label>' +
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
    toggleSport(el) {
      const t = store.trainer(tid()); const sp = el.dataset.val;
      const next = t.sports.includes(sp) ? t.sports.filter((x) => x !== sp) : [...t.sports, sp];
      if (!next.length) { toast('Избери барем еден спорт.'); return; }
      setOverride({ sports: next, sport: next[0] });
    },
    saveProfile(form) {
      const num = (v) => { const n = parseInt(String(v).replace(/\D/g, ''), 10); return isNaN(n) ? 0 : n; };
      const [city, ...area] = form.area.value.split(',');
      setOverride({ name: form.name.value, bio: form.bio.value, type: form.type.value, pricesPublic: form.pricesPublic.checked, price: num(form.price.value), onlinePrice: num(form.onlinePrice.value), city: city.trim() || 'Скопје', area: area.join(',').trim() });
      toast('Профилот е зачуван. Клиентите веќе ги гледаат промените.');
    },
  },
};
