// Наплата: тренерот ги следи претплатите и плаќањата, клиентот гледа како да плати.
import * as store from '../store.js';
import { esc, initials, appLayout, toast, modal, closeModal, den } from '../ui.js';

const MONTHS = ['јан', 'фев', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'ное', 'дек'];
export const fmtDate = (t) => { const d = new Date(t); return d.getDate() + ' ' + MONTHS[d.getMonth()]; };
const METHOD = { bank: 'Банка', cash: 'Готовина' };
const tid = () => store.get().trainerId;

export function subText(sub) {
  const d = store.daysLeft(sub);
  if (d === null) return 'чека прва уплата';
  if (d < 0) return 'истечена пред ' + -d + (d === -1 ? ' ден' : ' дена');
  if (d === 0) return 'истекува денес';
  if (d === 1) return 'истекува утре';
  if (d <= 7) return 'истекува за ' + d + ' дена';
  return 'важи до ' + fmtDate(sub.expiresAt);
}
export function subTag(sub) {
  const st = store.subState(sub);
  const cls = st === 'ok' ? 'tag-outline' : st === 'soon' ? 'tag-accent-outline' : 'tag-accent';
  const label = st === 'ok' ? 'ПЛАТЕНО' : st === 'soon' ? 'СКОРО ИСТЕКУВА' : st === 'overdue' ? 'ЗАДОЦНЕТО' : 'ЧЕКА УПЛАТА';
  return '<span class="tag ' + cls + '">' + label + '</span>';
}
export function subLine(cid, trainerId) {
  const sub = store.subFor(cid, trainerId);
  return sub ? subText(sub) : 'без претплата';
}

// ---- Делови што ги користат и страницата „Наплата“ и деталите за клиент ----
export const payActions = {
  payOpen(el) {
    const sub = store.get().subs.find((x) => x.id === el.dataset.val); if (!sub) return;
    const info = store.payInfo(sub.trainerId);
    const cash = info.cash.on || !info.bank.on;
    modal('<h2 class="h2">Означи платено</h2><p class="muted">' + esc(store.clientName(sub.clientId)) + ' · ' + subText(sub) + '</p>' +
      '<form class="stack" data-submit="payConfirm"><input type="hidden" name="sub" value="' + sub.id + '">' +
      '<label class="field">Износ (ден.)<input name="amount" inputmode="numeric" value="' + sub.price + '"></label>' +
      '<div class="stack-s"><span class="eyebrow muted">КАКО ПЛАТИЛ</span><div class="chips"><label class="chip-radio"><input type="radio" name="method" value="bank"' + (cash ? '' : ' checked') + '> Банка</label><label class="chip-radio"><input type="radio" name="method" value="cash"' + (cash ? ' checked' : '') + '> Готовина</label></div></div>' +
      '<p class="muted small">Претплатата се продолжува за 30 дена и клиентот добива потврда.</p><button type="submit" class="btn btn-accent">ПОТВРДИ ПЛАЌАЊЕ</button></form>');
  },
  payConfirm(form) {
    const id = form.sub.value; const sub = store.get().subs.find((x) => x.id === id); if (!sub) return;
    const amount = parseInt(String(form.amount.value).replace(/\D/g, ''), 10) || sub.price;
    const exp = store.recordPayment(id, form.method.value, amount);
    store.markStep('paid');
    store.notify(sub.clientId, 'Плаќањето на ' + den(amount) + ' ден. е потврдено. Претплатата важи до ' + fmtDate(exp) + '.', '#/c/payments');
    closeModal(); store.refresh(); toast('Платено: ' + store.clientName(sub.clientId) + ' до ' + fmtDate(exp) + '.');
  },
  payRemind(el) {
    const sub = store.get().subs.find((x) => x.id === el.dataset.val); if (!sub) return;
    const first = store.trainer(sub.trainerId).name.split(' ')[0];
    store.addMessage(sub.clientId, sub.trainerId, { from: sub.trainerId, text: 'Здраво! Само те потсетувам дека претплатата (' + den(sub.price) + ' ден.) ' + subText(sub) + '. Податоците за плаќање ги имаш во „Плаќања“.' });
    store.notify(sub.clientId, first + ' те потсети за претплатата', '#/c/payments');
    store.refresh();
    toast('Потсетникот е испратен.');
  },
  subNew(el) {
    const cid = el.dataset.val; const t = store.trainer(tid());
    const price = t.onlinePrice || (t.price ? t.price * 4 : 3000);
    modal('<h2 class="h2">Претплата за ' + esc(store.clientName(cid)) + '</h2><form class="stack" data-submit="subSave"><input type="hidden" name="cid" value="' + cid + '">' +
      '<label class="field">Месечна цена (ден.)<input name="price" inputmode="numeric" value="' + price + '"></label>' +
      '<p class="muted small">Претплатата почнува кога ќе означиш дека клиентот платил.</p><button type="submit" class="btn btn-accent">СОЗДАЈ</button></form>');
  },
  subSave(form) {
    const price = parseInt(String(form.price.value).replace(/\D/g, ''), 10) || 0;
    if (!price) { toast('Внеси цена.'); return; }
    store.addSub(form.cid.value, tid(), price);
    closeModal(); store.refresh(); toast('Претплатата е создадена. Означи платено кога ќе плати.');
  },
};

// ---- Страна: Наплата (тренер) ----
let filter = 'Сите';
const FILTERS = ['Сите', 'Задоцнети', 'Истекуваат', 'Платени'];

function row(sub) {
  const st = store.subState(sub);
  return '<div class="list-row pay-row"><span class="avatar">' + initials(store.clientName(sub.clientId)) + '</span><span class="grow"><a class="strong plink" href="#/t/clients/' + sub.clientId + '">' + esc(store.clientName(sub.clientId)) + '</a><span class="muted small block">' + den(sub.price) + ' ден. · ' + subText(sub) + '</span></span>' + subTag(sub) +
    '<span class="row gap-s">' + (st === 'ok' ? '' : '<button type="button" class="btn btn-ghost btn-sm" data-act="payRemind" data-val="' + sub.id + '">Потсети</button>') +
    '<button type="button" class="btn ' + (st === 'ok' ? 'btn-ghost' : 'btn-accent') + ' btn-sm" data-act="payOpen" data-val="' + sub.id + '">Платено</button></span></div>';
}

function payForm() {
  const i = store.payInfo(tid());
  return '<form class="card stack-s" data-submit="savePay"><h2 class="eyebrow muted">НАЧИНИ НА ПЛАЌАЊЕ (ги гледа клиентот)</h2>' +
    '<label class="toggle-row"><span class="grow strong">Банкарска сметка</span><input type="checkbox" name="bankOn"' + (i.bank.on ? ' checked' : '') + '></label>' +
    '<div class="grid-2 gap-s"><label class="field">Име на сметката<input name="holder" value="' + esc(i.bank.holder) + '" autocomplete="off"></label><label class="field">Банка<input name="bank" value="' + esc(i.bank.bank) + '" autocomplete="off"></label>' +
    '<label class="field">Број на сметка<input name="account" inputmode="numeric" value="' + esc(i.bank.account) + '" autocomplete="off"></label><label class="field">IBAN (по желба)<input name="iban" value="' + esc(i.bank.iban) + '" autocomplete="off"></label></div>' +
    '<label class="field">Цел на плаќање<input name="purpose" value="' + esc(i.bank.purpose) + '" autocomplete="off"></label>' +
    '<label class="toggle-row"><span class="grow strong">Готовина</span><input type="checkbox" name="cashOn"' + (i.cash.on ? ' checked' : '') + '></label>' +
    '<label class="field">Упатство за готовина<input name="cashNote" value="' + esc(i.cash.note) + '" placeholder="на пр. на првиот тренинг во месецот"></label>' +
    '<p class="muted small">Внеси само податоци што сакаш да ги видат твоите клиенти. Не внесувај лозинки или PIN на картичка.</p>' +
    '<button type="submit" class="btn btn-accent">ЗАЧУВАЈ</button></form>';
}

export const trainerPay = {
  title: 'Наплата',
  render() {
    const t = store.trainer(tid());
    const all = store.subsOf(t.id);
    const list = all.filter((x) => {
      const st = store.subState(x);
      return filter === 'Сите' || (filter === 'Задоцнети' && ['overdue', 'new'].includes(st)) || (filter === 'Истекуваат' && st === 'soon') || (filter === 'Платени' && st === 'ok');
    }).sort((a, b) => (store.daysLeft(a) ?? -999) - (store.daysLeft(b) ?? -999));
    const late = store.unpaidSubs(t.id); const soon = all.filter((x) => store.subState(x) === 'soon');
    const hist = store.paymentsOf(t.id).slice(0, 8);
    const content = '<div class="page-head"><h1 class="display-s">Наплата</h1></div>' +
      '<div class="grid-4"><div class="card accent-card"><div class="eyebrow">ЗАРАБОТЕНО / 30 ДЕНА</div><div class="display-xs">' + den(store.monthEarnings(t.id)) + ' ден.</div></div>' +
        '<div class="card"><div class="eyebrow muted">ЧЕКААТ ПЛАЌАЊЕ</div><div class="display-xs">' + den(store.unpaidTotal(t.id)) + ' ден.</div><div class="muted small">' + late.length + (late.length === 1 ? ' клиент' : ' клиенти') + '</div></div>' +
        '<div class="card"><div class="eyebrow muted">ИСТЕКУВААТ ЗА 7 ДЕНА</div><div class="display-xs">' + soon.length + '</div></div>' +
        '<div class="card"><div class="eyebrow muted">АКТИВНИ ПРЕТПЛАТИ</div><div class="display-xs">' + all.filter((x) => ['ok', 'soon'].includes(store.subState(x))).length + '</div></div></div>' +
      '<div class="booking"><div class="stack grow"><section class="card stack-s"><div class="chips">' + FILTERS.map((f) => '<button type="button" class="chip' + (f === filter ? ' on' : '') + '" data-act="payFilter" data-val="' + f + '">' + f + '</button>').join('') + '</div>' +
        (list.length ? list.map(row).join('') : '<div class="empty">Нема клиенти во оваа група.</div>') + '</section>' +
        '<section class="card stack-s"><h2 class="eyebrow muted">ПОСЛЕДНИ ПЛАЌАЊА</h2>' + (hist.length ? hist.map((p) => '<div class="kv"><span class="muted">' + fmtDate(p.at) + '</span><span class="grow">' + esc(store.clientName(p.clientId)) + '</span><span class="muted small">' + METHOD[p.method] + '</span><span class="strong">' + den(p.amount) + ' ден.</span></div>').join('') : '<div class="muted small">Уште нема евидентирани плаќања.</div>') + '</section></div>' +
      '<aside class="stack w-340">' + payForm() + '</aside></div>';
    return appLayout('trainer', 'payments', content);
  },
  actions: {
    ...payActions,
    payFilter(el) { filter = el.dataset.val; store.refresh(); },
    savePay(form) {
      const g = (n) => form[n].value.trim();
      const info = { bank: { on: form.bankOn.checked, holder: g('holder'), bank: g('bank'), account: g('account'), iban: g('iban'), purpose: g('purpose') || 'Претплата — име и презиме' }, cash: { on: form.cashOn.checked, note: g('cashNote') } };
      if (info.bank.on && !info.bank.account && !info.bank.iban) { toast('Внеси број на сметка или IBAN.'); return; }
      store.set((s) => ({ ...s, trainerOverrides: { ...s.trainerOverrides, [s.trainerId]: { ...(s.trainerOverrides[s.trainerId] || {}), payInfo: info } } }));
      store.markStep('payinfo');
      toast('Начините на плаќање се зачувани. Клиентите ги гледаат.');
    },
  },
};

// ---- Страна: Плаќања (клиент) ----
function copyRow(label, value) {
  if (!value) return '';
  return '<div class="kv copy-row"><span class="muted">' + label + '</span><span class="grow strong break">' + esc(value) + '</span><button type="button" class="btn btn-ghost btn-sm" data-act="copyText" data-val="' + esc(value) + '">Копирај</button></div>';
}

export const clientPay = {
  title: 'Плаќања',
  render() {
    const s = store.get(); const c = s.client;
    const subs = store.subsOfClient(c.id);
    const cards = subs.map((sub) => {
      const t = store.trainer(sub.trainerId); const i = store.payInfo(sub.trainerId);
      const st = store.subState(sub); const mine = store.get().payments.filter((p) => p.clientId === c.id && p.trainerId === sub.trainerId).sort((a, b) => b.at - a.at);
      const purpose = (i.bank.purpose || '').replace('име и презиме', c.name);
      const how = (i.bank.on ? '<div class="stack-s"><span class="eyebrow muted">БАНКАРСКА СМЕТКА</span>' + copyRow('Име', i.bank.holder) + copyRow('Банка', i.bank.bank) + copyRow('Сметка', i.bank.account) + copyRow('IBAN', i.bank.iban) + copyRow('Износ', den(sub.price) + ' ден.') + copyRow('Цел', purpose) + '</div>' : '') +
        (i.cash.on ? '<div class="stack-s"><span class="eyebrow muted">ГОТОВИНА</span><div class="small">' + esc(i.cash.note || 'Плати му на тренерот лично.') + '</div></div>' : '') +
        (!i.bank.on && !i.cash.on ? '<div class="muted small">Тренерот уште не внел начин на плаќање. <a class="link accent strong" href="#/c/messages/' + t.id + '">Прашај го →</a></div>' : '');
      return '<section class="card stack-s' + (st === 'overdue' || st === 'new' ? ' accent-line' : '') + '"><div class="row gap"><span class="avatar">' + initials(t.name) + '</span><span class="grow"><span class="strong block">' + esc(t.name) + '</span><span class="muted small">Месечна претплата · ' + den(sub.price) + ' ден.</span></span>' + subTag(sub) + '</div>' +
        '<div class="display-xs">' + subText(sub) + '</div>' + how +
        '<p class="muted small">Кога ќе платиш, ' + esc(t.name.split(' ')[0]) + ' го потврдува плаќањето и претплатата се продолжува 30 дена.</p>' +
        (mine.length ? '<div class="stack-s"><span class="eyebrow muted">МОИ ПЛАЌАЊА</span>' + mine.map((p) => '<div class="kv"><span class="muted">' + fmtDate(p.at) + '</span><span class="grow">' + METHOD[p.method] + '</span><span class="strong">' + den(p.amount) + ' ден.</span></div>').join('') + '</div>' : '') + '</section>';
    }).join('');
    return appLayout('client', 'payments', '<div class="page-head"><h1 class="display-s">Плаќања</h1></div>' + (cards || '<div class="empty">Немаш активна претплата. Кога тренер ќе ја создаде, ќе ја видиш тука.</div>'));
  },
  actions: {
    copyText(el) {
      const v = el.dataset.val;
      const done = () => toast('Копирано.');
      try { navigator.clipboard.writeText(v).then(done, () => toast(v)); } catch (e) { toast(v); }
    },
  },
};
