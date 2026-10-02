// Страни за најавен клиент.
import { subText, subTag } from './pay.js';
import { planKindOf } from '../kinds.js';
import * as store from '../store.js';
import { CHALLENGES, LEADERBOARD_OTHERS, DAY_NAMES, DAY_SHORT, SLOT_TIMES } from '../data.js';
import { esc, initials, appLayout, toast, modal, closeModal, lineChart, chipRow, stars, den } from '../ui.js';
import { chatBubbles, composer, send, scrollChat, convList, pinBar, setCtx, chatActions } from './chat.js';
import { partnersContent, partnerActions, shortName } from './public.js';
import { reviewActions } from './social.js';
import { recipeActions } from './recipes.js';

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
    const next = store.upcomingBookings((b) => b.clientId === c.id)[0];
    const pending = s.requests.filter((r) => r.clientId === c.id && r.status === 'pending');
    const first = s.progress[0], last = s.progress[s.progress.length - 1];
    const lost = first && last ? Math.max(0, first.weight - last.weight) : 0;
    const pct = Math.min(100, Math.round((lost / c.goalKg) * 100));
    const ch = s.challenges.ch1;
    const nextT = next && store.trainer(next.trainerId);
    const nextCard = next
      ? '<section class="card accent-card grow"><div class="eyebrow">СЛЕДЕН ТРЕНИНГ</div><div class="display-xs">' + store.dateLabel(next.date, true) + ' · ' + next.time + '</div><div class="strong">Со ' + esc(nextT.name) + ' · ' + esc(next.type.toLowerCase()) + '</div>' +
        '<div class="row gap-s"><a class="btn btn-dark btn-sm" href="#/c/messages/' + next.trainerId + '">Отвори чет</a><a class="btn btn-outline-dark btn-sm" href="#/c/booking">Мои термини</a></div></section>'
      : '<section class="card accent-card grow"><div class="eyebrow">НЕМАШ ЗАКАЖАН ТРЕНИНГ</div><div class="display-xs">Договори со тренерот</div><a class="btn btn-dark btn-sm" href="#/c/messages">Отвори чет</a></section>';
    const pkgCards = trainers.map((t) => ({ t, sb: store.subFor(c.id, t.id) })).filter((x) => x.sb).map(({ t, sb }) => {
      const st = store.subState(sb);
      return '<section class="card grow stack-s' + (st === 'ok' ? '' : ' accent-line') + '"><div class="row gap"><div class="eyebrow muted grow">МОЈА ПРЕТПЛАТА · ' + esc(t.name.toUpperCase()) + '</div>' + subTag(sb) + '</div>' +
        '<div class="display-xs">' + subText(sb) + '</div><div class="muted small">' + den(sb.price) + ' ден. месечно</div>' +
        '<a class="link accent strong small" href="#/c/payments">' + (st === 'ok' ? 'Мои плаќања →' : 'Како да платам →') + '</a></section>';
    }).join('');
    const allPlans = store.plansFor(c.id);
    const activePlan = allPlans.find((pl) => { const g = store.planProgress(pl); return g.done < g.total; }) || allPlans[0];
    const planCard = activePlan ? (function () { const g = store.planProgress(activePlan); const pct = Math.round((g.done / Math.max(g.total, 1)) * 100);
      return '<a class="card light w-320" href="#/c/plan/' + activePlan.id + '"><div class="eyebrow">АКТИВЕН ПЛАН</div><div class="h3 upper">' + esc(activePlan.name) + '</div><div class="bar"><div style="width:' + pct + '%"></div></div><div class="small strong">' + g.done + ' од ' + g.total + ' ' + planKindOf(activePlan).item + ' · ' + (g.done === g.total ? 'завршен ✓' : 'отвори и штиклирај →') + '</div></a>'; })() : '';
    const extraRow = (pkgCards || planCard) ? '<div class="row gap stack-m">' + pkgCards + planCard + '</div>' : '';
    const unreadFor = (tid) => { const th = store.thread(c.id, tid); const lastMsg = th[th.length - 1]; return lastMsg && lastMsg.from !== c.id; };
    const reqList = s.requests.filter((r) => r.clientId === c.id && ['pending', 'asked', 'declined'].includes(r.status)).sort((a, b) => (b.sentAt || 0) - (a.sentAt || 0));
    const step = (label, on) => '<span class="rq-step' + (on ? ' on' : '') + '"><span class="gcheck">' + (on ? '✓' : '') + '</span>' + label + '</span>';
    const reqCard = reqList.length ? '<section class="card stack-s"><h2 class="eyebrow muted">МОИ БАРАЊА</h2>' + reqList.map((r) => {
      const t = store.trainer(r.trainerId); const done = r.status === 'declined';
      return '<div class="stack-s rq-item"><div class="row gap"><span class="avatar dashed">' + initials(t.name) + '</span><span class="grow"><span class="strong block">' + esc(t.name) + '</span><span class="muted small">' + esc(r.goal) + '</span></span></div>' +
        '<div class="rq-steps">' + step('Испратено', true) + step('Видено', !!r.seenAt || r.status !== 'pending') + step(done ? 'Одбиено' : 'Одговор', done) + '</div>' +
        (r.status === 'asked' ? '<div class="card note stack-s"><span class="strong">' + esc(t.name.split(' ')[0]) + ' те праша:</span> „' + esc(r.question) + '“' +
          (r.answer ? '<span class="tag tag-outline">ОДГОВОРИ: ' + esc(r.answer) + '</span>' : '<form class="stack-s" data-submit="reqAnswer"><input type="hidden" name="rid" value="' + r.id + '"><label class="sr" for="ans-' + r.id + '">Одговор</label><textarea id="ans-' + r.id + '" name="a" rows="2" maxlength="240" placeholder="Твој одговор…"></textarea><button type="submit" class="btn btn-accent btn-sm">ИСПРАТИ ОДГОВОР</button></form>') + '</div>' : '') +
        (done ? '<div class="muted small">Овој тренер моментално не е достапен. <a class="link accent strong" href="#/">Најди друг →</a></div>' : '') + '</div>';
    }).join('') + '</section>' : '';
    const content = '<div class="page-head"><div><div class="muted small strong">' + todayLabel() + '</div><h1 class="display-s">Здраво, ' + esc(c.name.split(' ')[0]) + '</h1></div>' +
      '<div class="pill"><span class="avatar sm accent-bg">' + (ch ? ch.done : 0) + '</span>дена активност по ред</div></div>' +
      '<div class="row gap stack-m">' + nextCard +
      '<section class="card w-320"><div class="eyebrow muted">ЦЕЛ: −' + c.goalKg + ' КГ</div><div class="display-xs">' + pct + '<span class="muted">%</span></div><div class="bar"><div style="width:' + pct + '%"></div></div><div class="muted small">Изгубени ' + lost.toFixed(1) + ' кг од почетокот</div><a class="link accent strong" href="#/c/progress">+ Внеси напредок →</a></section></div>' +
      reqCard + extraRow + '<div class="row gap stack-m"><section class="card grow"><h2 class="eyebrow muted">МОИ ТРЕНЕРИ</h2>' +
        trainers.map((t) => '<a class="list-row" href="#/c/messages/' + t.id + '"><span class="avatar">' + initials(t.name) + '</span><span class="grow"><span class="strong">' + esc(t.name) + '</span><span class="muted small">' + esc(t.sport) + (unreadFor(t.id) ? ' · нова порака' : '') + '</span></span>' + (unreadFor(t.id) ? '<span class="dot-accent"></span>' : '') + '</a>').join('') +
        '<a class="btn btn-ghost btn-sm" href="#/">+ Најди уште тренер</a></section>' +
      '<section class="stack w-320">' +
        (ch && ch.joined ? '<a class="card light" href="#/c/challenges"><div class="eyebrow">АКТИВЕН ПРЕДИЗВИК</div><div class="h3 upper">30 дена движење</div><div class="small strong">Ден ' + ch.done + ' од 30' + (ch.today ? ' · денес ✓' : ' · денес уште не') + '</div></a>' : '<a class="card light" href="#/c/challenges"><div class="eyebrow">ПРЕДИЗВИЦИ</div><div class="h3 upper">Приклучи се</div></a>') +
        '<a class="card" href="#/partner/p3"><div class="eyebrow muted">КУПОН ОД ПАРТНЕР</div><div class="strong">' + esc(store.partner('p3').name) + (store.partner('p3').offer ? ' · ' + esc(store.partner('p3').offer) : '') + '</div><span class="link accent strong small">Сите партнери →</span></a></section></div>';
    return appLayout('client', 'home', content);
  },
  actions: {
    reqAnswer(form) {
      const a = form.a.value.trim(); if (!a) { toast('Напиши одговор.'); return; }
      const r = store.get().requests.find((x) => x.id === form.rid.value); if (!r) return;
      store.set((st) => ({ ...st, requests: st.requests.map((x) => (x.id === r.id ? { ...x, answer: a } : x)) }));
      store.notify(r.trainerId, store.clientName(r.clientId) + ' одговори на твоето прашање', '#/t/clients?tab=req');
      toast('Одговорот е испратен.');
    },
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
    const next = store.upcomingBookings((b) => b.clientId === c.id && b.trainerId === t.id)[0];
    const hasChat = !!p.id && store.isLinked(c.id, p.id);
    setCtx({ cid: c.id, tid: t.id, from: c.id, auto: t.id });
    const list = convList(trainers.map((x) => { const th = store.thread(c.id, x.id); return { id: x.id, name: x.name, sub: x.sport, last: th[th.length - 1] }; }), t.id, '#/c/messages/', c.id);
    const pr = s.progress;
    const content = '<div class="chat-layout ' + (hasChat ? 'has-chat' : 'no-chat') + '"><section class="threads"><h1 class="h2 upper">Пораки</h1>' + list + '</section>' +
      '<section class="chat"><header class="chat-head"><a class="btn btn-ghost btn-icon chat-back" href="#/c/messages" aria-label="Назад кон разговори">←</a><span class="avatar">' + initials(t.name) + '</span><div class="grow"><div class="strong">' + esc(t.name) + '</div><div class="accent small strong">' + (next ? 'Термин: ' + store.whenLabel(next) : 'Нема закажан термин') + '</div></div>' +
        '<a class="btn btn-ghost btn-sm" href="#/c/booking">Термини</a><button type="button" class="btn btn-ghost btn-sm hide-m" data-act="reviewOpen" data-val="' + t.id + '">★ Оцени</button><button type="button" class="btn btn-accent btn-sm" data-act="videoCall">Видео повик</button></header>' +
        pinBar({ cid: c.id, tid: t.id, goal: c.goal, next: next ? store.whenLabel(next) : '', editable: false }) + '<div class="chat-body">' + chatBubbles(store.thread(c.id, t.id), c.id) + '</div>' + composer('sendMsg') + '</section>' +
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
    videoCall() { toast('Во вистинската апликација тука се отвора видео повик.'); },
    ...chatActions,
    ...reviewActions,
    ...recipeActions,
  },
};
function activeTid(cur) {
  const c = me(); const trainers = store.clientTrainers(c.id);
  return cur.params.id && store.isLinked(c.id, cur.params.id) ? cur.params.id : trainers[0].id;
}

// ---------- Мои термини ----------
// Термините ги договара тренерот со клиентот во четот и ги внесува тој. Клиентот ги гледа тука.
export const booking = {
  title: 'Термини',
  mount() { store.markStep('book'); },
  render() {
    const s = store.get(); const c = me();
    const trainers = store.clientTrainers(c.id);
    if (!trainers.length) return appLayout('client', 'booking', '<div class="empty">Прво најди тренер. <a class="accent" href="#/">Најди тренер →</a></div>');
    const mine = store.upcomingBookings((b) => b.clientId === c.id);
    const today = store.isoIn(0);
    const card = (b, i) => { const t = store.trainer(b.trainerId);
      return '<section class="card stack-s' + (i === 0 ? ' accent-line' : '') + '"><div class="row gap"><div class="grow"><div class="eyebrow ' + (i === 0 ? 'accent' : 'muted') + '">' + (b.date === today ? 'ДЕНЕС' : i === 0 ? 'СЛЕДЕН ТЕРМИН' : 'ТЕРМИН') + '</div><div class="display-xs">' + store.dateLabel(b.date, true) + '</div><div class="strong">' + b.time + ' · ' + esc(b.type.toLowerCase()) + '</div></div><span class="avatar">' + initials(t.name) + '</span></div>' +
        '<div class="muted small">Со ' + esc(t.name) + '</div>' +
        '<div class="row gap-s wrap"><a class="btn btn-ghost btn-sm grow" href="#/c/messages/' + t.id + '">Договори промена во чет</a><button type="button" class="btn btn-ghost btn-sm" data-act="bCancel" data-val="' + b.id + '">Откажи</button></div></section>'; };
    const list = mine.length ? mine.map(card).join('') :
      '<section class="card stack-s"><div class="strong">Уште немаш закажан термин.</div><div class="muted small">Договори се со тренерот во четот, а тој ќе го внесе терминот тука и ќе добиеш известување.</div>' +
      trainers.map((t) => '<a class="btn btn-accent btn-sm" href="#/c/messages/' + t.id + '">Чет со ' + esc(t.name.split(' ')[0]) + '</a>').join('') + '</section>';
    const content = '<div class="page-head"><h1 class="display-s">Мои термини</h1></div>' +
      '<div class="booking"><div class="stack grow">' + list + '</div>' +
      '<aside class="stack w-330"><section class="card note"><span class="strong">Како се закажува</span><br>Термините ги договараш со тренерот во четот. Кога ќе се договорите, тој го внесува терминот и тука го гледаш со датум и час.</section>' +
        '<section class="card note"><span class="strong">Правило за откажување</span><br>Бесплатно откажување најдоцна ' + s.availability.cancelHours + ' часа пред терминот.' + (s.availability.deposit ? ' Се бара депозит.' : '') + '</section>' +
        '<section class="card note"><span class="strong">Плаќање</span><br>Се договарате директно со тренерот.</section></aside></div>';
    return appLayout('client', 'booking', content);
  },
  actions: {
    bCancel(el) {
      const b = store.get().bookings.find((x) => x.id === el.dataset.val); if (!b) return;
      store.set((st) => ({ ...st, bookings: st.bookings.filter((x) => x.id !== b.id) }));
      store.notify(b.trainerId, shortName(me().name) + ' го откажа терминот ' + store.whenLabel(b), '#/t/calendar');
      toast('Терминот е откажан, тренерот е известен.');
    },
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
      store.markStep('progress');
      if (form.share.checked) store.clientTrainers(me().id).forEach((t) => store.notify(t.id, shortName(me().name) + ' внесе нов напредок', '#/t/clients'));
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
