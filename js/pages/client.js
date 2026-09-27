// Страни за најавен клиент.
import * as store from '../store.js';
import { CHALLENGES, LEADERBOARD_OTHERS, DAY_NAMES, DAY_SHORT, SLOT_TIMES, PARTNERS } from '../data.js';
import { esc, initials, appLayout, toast, modal, closeModal, lineChart, chipRow, stars } from '../ui.js';
import { chatBubbles, composer, send, attachVideo, scrollChat } from './chat.js';
import { partnersContent, partnerActions, shortName } from './public.js';

const me = () => store.get().client;

function todayLabel() {
  const d = new Date();
  const months = ['јануари', 'февруари', 'март', 'април', 'мај', 'јуни', 'јули', 'август', 'септември', 'октомври', 'ноември', 'декември'];
  return DAY_NAMES[(d.getDay() + 6) % 7] + ', ' + d.getDate() + ' ' + months[d.getMonth()];
}

// ---------- Мој преглед ----------
export const home = {
  title: 'Мој преглед',
  render() {
    const s = store.get();
    const c = me();
    const trainers = store.clientTrainers(c.id);
    const next = s.bookings.filter((b) => b.clientId === c.id).sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))[0];
    const pending = s.requests.filter((r) => r.clientId === c.id && r.status === 'pending');
    const first = s.progress[0], last = s.progress[s.progress.length - 1];
    const lost = first && last ? Math.max(0, first.weight - last.weight) : 0;
    const pct = Math.min(100, Math.round((lost / c.goalKg) * 100));
    const ch = s.challenges.ch1;
    const nextT = next && store.trainer(next.trainerId);
    const nextCard = next
      ? '<section class="card accent-card grow"><div class="eyebrow">СЛЕДЕН ТРЕНИНГ</div><div class="display-xs">' + DAY_NAMES[next.day] + ', ' + next.time + '</div><div class="strong">Со ' + esc(nextT.name) + ' · ' + esc(next.type.toLowerCase()) + '</div>' +
        '<div class="row gap-s"><a class="btn btn-dark btn-sm" href="#/c/messages/' + next.trainerId + '">Отвори чет</a><a class="btn btn-outline-dark btn-sm" href="#/c/booking?t=' + next.trainerId + '">Промени термин</a></div></section>'
      : '<section class="card accent-card grow"><div class="eyebrow">НЕМАШ ЗАКАЖАН ТРЕНИНГ</div><div class="display-xs">Закажи го следниот</div><a class="btn btn-dark btn-sm" href="#/c/booking">Закажи термин</a></section>';
    const unreadFor = (tid) => { const th = store.thread(c.id, tid); const lastMsg = th[th.length - 1]; return lastMsg && lastMsg.from !== c.id; };
    const content = '<div class="page-head"><div><div class="muted small strong">' + todayLabel() + '</div><h1 class="display-s">Здраво, ' + esc(c.name.split(' ')[0]) + '</h1></div>' +
      '<div class="pill"><span class="avatar sm accent-bg">' + (ch ? ch.done : 0) + '</span>дена активност по ред</div></div>' +
      '<div class="row gap stack-m">' + nextCard +
      '<section class="card w-320"><div class="eyebrow muted">ЦЕЛ: −' + c.goalKg + ' КГ</div><div class="display-xs">' + pct + '<span class="muted">%</span></div><div class="bar"><div style="width:' + pct + '%"></div></div><div class="muted small">Изгубени ' + lost.toFixed(1) + ' кг од почетокот</div><a class="link accent strong" href="#/c/progress">+ Внеси напредок →</a></section></div>' +
      '<div class="row gap stack-m"><section class="card grow"><h2 class="eyebrow muted">МОИ ТРЕНЕРИ</h2>' +
        trainers.map((t) => '<a class="list-row" href="#/c/messages/' + t.id + '"><span class="avatar">' + initials(t.name) + '</span><span class="grow"><span class="strong">' + esc(t.name) + '</span><span class="muted small">' + esc(t.sport) + (unreadFor(t.id) ? ' · нова порака' : '') + '</span></span>' + (unreadFor(t.id) ? '<span class="dot-accent"></span>' : '') + '</a>').join('') +
        pending.map((r) => { const t = store.trainer(r.trainerId); return '<div class="list-row dim"><span class="avatar dashed">' + initials(t.name) + '</span><span class="grow"><span class="strong">' + esc(t.name) + '</span><span class="muted small">' + esc(t.sport) + ' · барањето чека одговор</span></span></div>'; }).join('') +
        '<a class="btn btn-ghost btn-sm" href="#/">+ Најди уште тренер</a></section>' +
      '<section class="stack w-320">' +
        (ch && ch.joined ? '<a class="card light" href="#/c/challenges"><div class="eyebrow">АКТИВЕН ПРЕДИЗВИК</div><div class="h3 upper">30 дена движење</div><div class="small strong">Ден ' + ch.done + ' од 30' + (ch.today ? ' · денес ✓' : ' · денес уште не') + '</div></a>' : '<a class="card light" href="#/c/challenges"><div class="eyebrow">ПРЕДИЗВИЦИ</div><div class="h3 upper">Приклучи се</div></a>') +
        '<section class="card"><div class="eyebrow muted">КУПОН ОД ПАРТНЕР</div><div class="strong">' + esc(PARTNERS[2].name) + ' · ' + esc(PARTNERS[2].offer) + '</div><a class="link accent strong small" href="#/c/partners">Сите партнери →</a></section></section></div>';
    return appLayout('client', 'home', content);
  },
};

// ---------- Пораки ----------
export const messages = {
  title: 'Пораки',
  render(p) {
    const c = me();
    const trainers = store.clientTrainers(c.id);
    if (!trainers.length) return appLayout('client', 'messages', '<div class="empty">Сè уште немаш тренер. <a class="accent" href="#/">Најди тренер →</a></div>');
    const t = store.trainer(p.id) && store.isLinked(c.id, p.id) ? store.trainer(p.id) : trainers[0];
    const s = store.get();
    const next = s.bookings.find((b) => b.clientId === c.id && b.trainerId === t.id);
    const list = trainers.map((x) => { const th = store.thread(c.id, x.id); const last = th[th.length - 1];
      return '<a class="thread' + (x.id === t.id ? ' on' : '') + '" href="#/c/messages/' + x.id + '"><span class="avatar' + (x.id === t.id ? ' accent-bg' : '') + '">' + initials(x.name) + '</span><span class="grow ellipsis"><span class="strong">' + esc(x.name) + '</span><span class="muted small ellipsis">' + esc(last ? last.text : x.sport) + '</span></span></a>'; }).join('');
    const pr = s.progress;
    const content = '<div class="chat-layout"><section class="threads"><h1 class="h2 upper">Пораки</h1>' + list + '</section>' +
      '<section class="chat"><header class="chat-head"><div class="grow"><div class="strong">' + esc(t.name) + '</div><div class="accent small strong">' + (next ? 'Термин: ' + DAY_NAMES[next.day] + ', ' + next.time : 'Нема закажан термин') + '</div></div>' +
        '<a class="btn btn-ghost btn-sm" href="#/c/booking?t=' + t.id + '">Закажи</a><button type="button" class="btn btn-accent btn-sm" data-act="videoCall">Видео повик</button></header>' +
        '<div class="chat-body">' + chatBubbles(store.thread(c.id, t.id), c.id) + '</div>' + composer('sendMsg', 'attach') + '</section>' +
      '<aside class="chat-side"><h2 class="h3 upper">Мој напредок</h2><div class="card"><div class="eyebrow muted">ТЕЖИНА</div><div class="display-xs">' + pr[pr.length - 1].weight.toFixed(1) + ' кг</div>' + lineChart(pr.map((x) => x.weight), { w: 280, h: 90 }) + '</div>' +
        '<div class="card"><div class="strong small">Коментар од тренерот</div><p class="muted small">' + esc(s.trainerComment) + '</p></div><a class="btn btn-accent" href="#/c/progress">+ ВНЕСИ НАПРЕДОК</a></aside></div>';
    return appLayout('client', 'messages', content, { full: true });
  },
  mount(root, p) { scrollChat(); messages._tid = p.id; },
  actions: {
    sendMsg(form, ev, cur) {
      const c = me(); const tid = activeTid(cur);
      send(c.id, tid, c.id, form.text.value, tid);
    },
    attach(el, ev, cur) { const c = me(); attachVideo(c.id, activeTid(cur), c.id); },
    videoCall() { toast('Во вистинската апликација тука се отвора видео повик.'); },
  },
};
function activeTid(cur) {
  const c = me(); const trainers = store.clientTrainers(c.id);
  return cur.params.id && store.isLinked(c.id, cur.params.id) ? cur.params.id : trainers[0].id;
}

// ---------- Закажи термин ----------
const book = { tid: null, day: 2, slot: null, type: 'Во живо' };
export const booking = {
  title: 'Термини',
  render(p, q) {
    const s = store.get(); const c = me();
    const trainers = store.clientTrainers(c.id);
    if (!trainers.length) return appLayout('client', 'booking', '<div class="empty">Прво најди тренер. <a class="accent" href="#/">Најди тренер →</a></div>');
    if (q.t && store.isLinked(c.id, q.t) && book.tid !== q.t && !book._fromQuery) { book.tid = q.t; book._fromQuery = true; }
    if (!book.tid || !store.isLinked(c.id, book.tid)) book.tid = trainers[0].id;
    const t = store.trainer(book.tid);
    const taken = (day, time) => s.bookings.some((b) => b.trainerId === t.id && b.day === day && b.time === time);
    const freeCount = (d) => (d === 6 ? 0 : SLOT_TIMES.filter((tm) => !taken(d, tm)).length - (d === 5 ? 6 : 0));
    const days = DAY_SHORT.map((lbl, i) => { const n = Math.max(0, freeCount(i)); const on = book.day === i;
      return '<button type="button" class="day' + (on ? ' on' : '') + (n ? '' : ' off') + '" data-act="bDay" data-val="' + i + '"' + (n ? '' : ' disabled') + '><span class="small strong">' + lbl + '</span><span class="small">' + (n ? n + ' слободни' : 'полно') + '</span></button>'; }).join('');
    const slots = SLOT_TIMES.slice(0, book.day === 5 ? 4 : SLOT_TIMES.length).map((tm) => { const tk = taken(book.day, tm); const on = book.slot === tm;
      return '<button type="button" class="slot' + (on ? ' on' : '') + (tk ? ' off' : '') + '" data-act="bSlot" data-val="' + tm + '"' + (tk ? ' disabled' : '') + '>' + tm + (tk ? '<span class="small"> · зафатено</span>' : '') + '</button>'; }).join('');
    const mine = s.bookings.filter((b) => b.clientId === c.id);
    const types = t.type === 'online' ? ['Видео повик'] : t.type === 'live' ? ['Во живо'] : ['Во живо', 'Видео повик'];
    if (!types.includes(book.type)) book.type = types[0];
    const price = book.type === 'Во живо' ? t.price : Math.round((t.onlinePrice || 1500) / 4);
    const disc = s.client.premium ? Math.round(price * 0.1) : 0;
    const content = '<div class="page-head"><h1 class="display-s">Закажи термин</h1><label class="field-inline">Тренер<select data-change="bTrainer">' + trainers.map((x) => '<option value="' + x.id + '"' + (x.id === t.id ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select></label></div>' +
      '<div class="booking"><div class="stack grow"><div class="days">' + days + '</div>' +
      '<section class="card"><h2 class="eyebrow muted">СЛОБОДНИ ТЕРМИНИ · ' + DAY_NAMES[book.day].toUpperCase() + '</h2><div class="slots">' + slots + '</div></section>' +
      '<section class="card row gap wrap"><span class="eyebrow muted grow">ТИП НА ТРЕНИНГ</span>' + chipRow(types, book.type, 'bType') + '</section>' +
      (mine.length ? '<section class="card"><h2 class="eyebrow muted">МОИ ЗАКАЖАНИ ТЕРМИНИ</h2>' + mine.map((b) => '<div class="kv"><span>' + DAY_NAMES[b.day] + ', ' + b.time + ' · ' + esc(store.trainer(b.trainerId).name) + ' · ' + esc(b.type.toLowerCase()) + '</span><button type="button" class="link muted" data-act="bCancel" data-val="' + b.id + '">Откажи</button></div>').join('') + '</section>' : '') + '</div>' +
      '<aside class="stack w-330"><section class="card light"><div class="eyebrow">ТВОЈОТ ТЕРМИН</div><div class="display-xs">' + DAY_NAMES[book.day] + '<br>' + (book.slot || '—:—') + '</div><div class="strong small">' + esc(t.name) + ' · ' + esc(book.type.toLowerCase()) + '</div>' +
        '<div class="kv dark"><span>Цена</span><span>' + (t.pricesPublic ? price + ' ден.' : 'по договор') + '</span></div>' + (disc && t.pricesPublic ? '<div class="kv dark"><span>Премиум попуст</span><span>−' + disc + ' ден.</span></div>' : '') +
        '<button type="button" class="btn btn-dark btn-lg" data-act="bConfirm"' + (book.slot ? '' : ' disabled') + '>ПОТВРДИ ТЕРМИН</button></section>' +
        '<section class="card note"><span class="strong">Правило за откажување</span><br>Бесплатно откажување најдоцна ' + s.availability.cancelHours + ' часа пред терминот.' + (s.availability.deposit ? ' Се бара депозит.' : '') + '</section>' +
        '<section class="card note"><span class="strong">Плаќање</span><br>Се договарате директно со тренерот.</section></aside></div>';
    return appLayout('client', 'booking', content);
  },
  actions: {
    bTrainer(el) { book.tid = el.value; book.slot = null; store.refresh(); },
    bDay(el) { book.day = Number(el.dataset.val); book.slot = null; store.refresh(); },
    bSlot(el) { book.slot = el.dataset.val; store.refresh(); },
    bType(el) { book.type = el.dataset.val; store.refresh(); },
    bConfirm() {
      const c = me();
      store.set((s) => ({ ...s, bookings: [...s.bookings, { id: store.uid('b'), clientId: c.id, clientName: shortName(c.name), trainerId: book.tid, day: book.day, time: book.slot, type: book.type }] }));
      toast('Терминот е закажан: ' + DAY_NAMES[book.day] + ', ' + book.slot + '. Ќе добиеш потсетник.');
      book.slot = null;
    },
    bCancel(el) { store.set((s) => ({ ...s, bookings: s.bookings.filter((b) => b.id !== el.dataset.val) })); toast('Терминот е откажан.'); },
  },
};

// ---------- Напредок ----------
let metric = 'weight';
export const progress = {
  title: 'Напредок',
  render() {
    const s = store.get(); const pr = s.progress;
    const m = { weight: ['Тежина', 'кг'], waist: ['Струк', 'cm'], workouts: ['Тренинзи', ''] };
    const vals = pr.map((x) => x[metric]);
    const first = vals[0], last = vals[vals.length - 1];
    const diff = metric === 'workouts' ? 'вкупно ' + vals.reduce((a, b) => a + b, 0) + ' тренинзи' : (last - first <= 0 ? '−' : '+') + Math.abs(last - first).toFixed(1) + ' ' + m[metric][1] + ' од почеток';
    const content = '<div class="page-head"><h1 class="display-s">Мој напредок</h1><div class="chips">' +
      Object.entries(m).map(([k, v]) => '<button type="button" class="chip' + (k === metric ? ' on' : '') + '" data-act="metric" data-val="' + k + '">' + v[0] + '</button>').join('') + '</div></div>' +
      '<div class="booking"><div class="stack grow"><section class="card"><div class="row gap wrap baseline"><span class="display-s">' + (metric === 'weight' ? last.toFixed(1) : last) + ' ' + m[metric][1] + '</span><span class="accent strong">' + diff + '</span><span class="grow"></span><span class="muted small strong">последни ' + pr.length + ' недели</span></div>' +
        lineChart(vals) + '<div class="axis">' + pr.map((x) => '<span>Нед ' + x.week + '</span>').join('') + '</div></section>' +
        '<section class="card row gap"><span class="avatar">МС</span><span class="grow small"><span class="strong">Марија:</span> <span class="muted">' + esc(s.trainerComment) + '</span></span></section></div>' +
      '<aside class="w-330"><form class="card light stack" data-submit="addProgress"><h2 class="h3 upper">Ново внесување</h2>' +
        '<label class="field light">Тежина (кг)<input name="weight" inputmode="decimal" required placeholder="' + pr[pr.length - 1].weight + '"></label>' +
        '<div class="grid-2 gap-s"><label class="field light">Струк (cm)<input name="waist" inputmode="decimal" placeholder="' + pr[pr.length - 1].waist + '"></label><label class="field light">Тренинзи<input name="workouts" inputmode="numeric" placeholder="3"></label></div>' +
        '<button type="button" class="upload" data-act="photoNote">+ Фотографија (приватно)</button>' +
        '<label class="check dark"><input type="checkbox" name="share" ' + (s.client.share.progress ? 'checked' : '') + '> Сподели со тренерите</label>' +
        '<button type="submit" class="btn btn-accent btn-lg">ЗАЧУВАЈ</button></form></aside></div>';
    return appLayout('client', 'progress', content);
  },
  actions: {
    metric(el) { metric = el.dataset.val; store.refresh(); },
    photoNote() { toast('Во вистинската апликација тука прикачуваш фотографија.'); },
    addProgress(form) {
      const num = (v, d) => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? d : n; };
      store.set((s) => { const last = s.progress[s.progress.length - 1];
        return { ...s, progress: [...s.progress, { week: last.week + 1, weight: num(form.weight.value, last.weight), waist: num(form.waist.value, last.waist), workouts: Math.round(num(form.workouts.value, last.workouts)) }] }; });
      toast('Напредокот е зачуван' + (form.share.checked ? ' и споделен со тренерите.' : '.'));
    },
  },
};

// ---------- Предизвици ----------
export const challenges = {
  title: 'Предизвици',
  render() {
    const s = store.get(); const c = me();
    const active = CHALLENGES.find((x) => s.challenges[x.id] && s.challenges[x.id].joined);
    let hero = '';
    let board = '';
    if (active) {
      const st = s.challenges[active.id];
      const rows = [...LEADERBOARD_OTHERS.map((o) => ({ ...o })), { name: shortName(c.name) + ' (ти)', done: st.done, me: true }].sort((a, b) => b.done - a.done);
      const myRank = rows.findIndex((r) => r.me) + 1;
      hero = '<section class="featured accent-card"><div class="featured-body grow"><div class="eyebrow">ТВОЈ АКТИВЕН ПРЕДИЗВИК</div><div class="display-xs">' + esc(active.name) + '</div><div class="small strong">' + esc(active.desc) + '</div>' +
        '<div class="bar dark"><div style="width:' + Math.round((st.done / active.days) * 100) + '%"></div></div><div class="small strong">Ден ' + st.done + ' од ' + active.days + '</div></div>' +
        '<div class="center"><div class="display-s">#' + myRank + '</div><div class="small strong">твое место</div></div>' +
        '<button type="button" class="btn btn-dark btn-lg" data-act="doneToday" data-val="' + active.id + '"' + (st.today ? ' disabled' : '') + '>' + (st.today ? 'ОДРАБОТЕНО ✓' : 'ОДРАБОТЕНО ДЕНЕС') + '</button></section>';
      board = '<aside class="card w-330"><h2 class="eyebrow muted">РАНГ ЛИСТА · ' + esc(active.name.toUpperCase()) + '</h2>' +
        rows.map((r, i) => '<div class="rank' + (r.me ? ' me' : '') + '"><span class="rank-n">#' + (i + 1) + '</span><span class="grow strong">' + esc(r.name) + '</span><span class="strong">' + r.done + ' дена</span></div>').join('') + '</aside>';
    }
    const others = CHALLENGES.filter((x) => !active || x.id !== active.id).map((x) => '<article class="card"><span class="tag ' + (x.paid ? 'tag-light' : 'tag-accent-outline') + '">' + (x.paid ? 'КОТИЗАЦИЈА ' + x.fee + ' ДЕН.' : 'БЕСПЛАТЕН') + '</span><h3 class="h3 upper">' + esc(x.name) + '</h3><p class="muted small">' + esc(x.desc) + ' · ' + x.days + ' дена</p>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="join" data-val="' + x.id + '">' + (x.paid ? 'Пријави се' : 'Приклучи се') + '</button></article>').join('');
    const content = '<h1 class="display-s">Предизвици</h1><div class="booking"><div class="stack grow">' + hero + '<h2 class="eyebrow muted">ПРИКЛУЧИ СЕ</h2><div class="grid-3">' + others + '</div></div>' + board + '</div>';
    return appLayout('client', 'challenges', content);
  },
  actions: {
    doneToday(el) { const id = el.dataset.val; store.set((s) => ({ ...s, challenges: { ...s.challenges, [id]: { ...s.challenges[id], done: s.challenges[id].done + 1, today: true } } })); toast('Браво! Денот е запишан.'); },
    join(el) {
      const ch = CHALLENGES.find((x) => x.id === el.dataset.val);
      const doJoin = () => store.set((s) => { const next = {}; Object.keys(s.challenges).forEach((k) => { next[k] = { ...s.challenges[k], joined: false }; }); next[ch.id] = { joined: true, done: 0, today: false }; return { ...s, challenges: next }; });
      if (ch.paid) { modal('<h2 class="h2">' + esc(ch.name) + '</h2><p class="muted">Котизација: ' + ch.fee + ' ден. Во демото плаќањето е симулирано.</p><button type="button" class="btn btn-accent" data-act="payJoin" data-val="' + ch.id + '">ПЛАТИ И ПРИКЛУЧИ СЕ</button>'); challenges._pending = doJoin; return; }
      doJoin(); toast('Се приклучи на „' + ch.name + '“. Среќно!');
    },
    payJoin() { closeModal(); if (challenges._pending) challenges._pending(); toast('Пријавата е успешна.'); },
  },
};

// ---------- Партнери ----------
export const partners = {
  title: 'Партнери',
  render() { return appLayout('client', 'partners', partnersContent()); },
  actions: partnerActions,
};

// ---------- Мој профил и поставки ----------
export const settings = {
  title: 'Мој профил',
  render() {
    const s = store.get(); const c = s.client;
    const shares = [['goal', 'Мојата цел'], ['level', 'Ниво на искуство'], ['injuries', 'Повреди и ограничувања'], ['progress', 'Внесен напредок (тежина, мерки)'], ['photos', 'Фотографии од напредокот']];
    const content = '<h1 class="display-s">Мој профил</h1><div class="booking"><div class="stack grow">' +
      '<form class="card row gap wrap" data-submit="saveMe"><span class="avatar lg accent-bg">' + initials(c.name) + '</span><div class="grow stack-s"><label class="field">Име и презиме<input name="name" value="' + esc(c.name) + '"></label><label class="field">Email<input name="email" type="email" value="' + esc(c.email) + '"></label></div><button class="btn btn-ghost" type="submit">Зачувај</button></form>' +
      '<section class="card"><h2 class="eyebrow muted">ШТО СПОДЕЛУВАМ СО ТРЕНЕРИТЕ</h2><p class="muted small">Ти одлучуваш. Тренерите ги гледаат само ставките што ќе ги вклучиш.</p>' +
        shares.map(([k, l]) => '<label class="toggle-row"><span class="grow">' + l + '</span><input type="checkbox" data-change="share" data-val="' + k + '"' + (c.share[k] ? ' checked' : '') + '></label>').join('') + '</section></div>' +
      '<aside class="stack w-360"><section class="card light"><div class="row"><span class="h3 grow">ПРЕМИУМ</span><span class="tag tag-accent">' + (c.premium ? 'АКТИВЕН' : '14 ДЕНА БЕСПЛАТНО') + '</span></div>' +
        ['Попусти кај тренерите', 'Готови програми за тренинг', 'Напредна аналитика', 'Без реклами'].map((x) => '<div class="check-line strong small">✓ ' + x + '</div>').join('') +
        '<button type="button" class="btn btn-dark" data-act="premium">' + (c.premium ? 'ОТКАЖИ ПРЕМИУМ' : 'ПРОБАЈ ПРЕМИУМ · 250 ден./месец') + '</button></section>' +
      '<section class="card"><h2 class="eyebrow muted">ПОСТАВКИ</h2><label class="toggle-row"><span class="grow">Јазик</span><select data-change="lang">' + ['МК', 'SQ', 'EN'].map((l) => '<option' + (s.lang === l ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label>' +
        '<label class="toggle-row"><span class="grow">Email потсетници за термини</span><input type="checkbox" data-change="reminders"' + (c.emailReminders ? ' checked' : '') + '></label>' +
        '<label class="toggle-row"><span class="grow">Боја на апликацијата</span><input type="color" value="' + s.accent + '" data-change="accent" aria-label="Боја"></label></section>' +
      '<section class="card row gap"><button type="button" class="btn btn-ghost btn-sm grow" data-act="export">Преземи мои податоци</button><button type="button" class="btn btn-danger btn-sm grow" data-act="deleteMe">Избриши профил</button></section></aside></div>';
    return appLayout('client', 'settings', content);
  },
  actions: {
    saveMe(form) { store.set((s) => ({ ...s, client: { ...s.client, name: form.name.value || s.client.name, email: form.email.value || s.client.email } })); toast('Профилот е зачуван.'); },
    share(el) { const k = el.dataset.val; store.set((s) => ({ ...s, client: { ...s.client, share: { ...s.client.share, [k]: el.checked } } })); },
    premium() { store.set((s) => ({ ...s, client: { ...s.client, premium: !s.client.premium } })); toast(store.get().client.premium ? 'Премиум е активен — 14 дена бесплатно.' : 'Премиум е откажан.'); },
    lang(el) { store.set({ lang: el.value }); toast(el.value === 'МК' ? 'Јазик: македонски' : 'Во демото само македонскиот е преведен.'); },
    reminders(el) { store.set((s) => ({ ...s, client: { ...s.client, emailReminders: el.checked } })); },
    accent(el) { store.set({ accent: el.value }); },
    export() {
      const s = store.get();
      const data = { profil: s.client, napredok: s.progress, termini: s.bookings.filter((b) => b.clientId === s.client.id) };
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      a.download = 'moi-podatoci-trenirai.json'; a.click();
    },
    deleteMe() { if (confirm('Профилот ќе биде избришан по 30 дена. Во демото ова ги враќа сите податоци на почеток. Продолжи?')) { store.reset(); location.hash = '#/'; } },
  },
};

export { stars };
