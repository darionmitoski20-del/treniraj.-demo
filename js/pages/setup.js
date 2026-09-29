// Воведување за нов тренер: 4 чекори, па профилот е видлив за клиентите.
import * as store from '../store.js';
import { SPORTS, CITIES } from '../data.js';
import { esc, logo, toast, photo, chipRow, den } from '../ui.js';
import { trainerCard } from './public.js';

const STEPS = ['Што тренираш', 'Цени', 'За тебе', 'Преглед'];
const TYPES = [['both', 'Онлајн и во живо'], ['live', 'Само во живо'], ['online', 'Само онлајн']];
const wz = { step: 0, data: null, tid: null };

function load() {
  const s = store.get();
  if (wz.data && wz.tid === s.trainerId) return;
  const t = store.trainer(s.trainerId);
  wz.tid = s.trainerId;
  wz.step = 0;
  wz.data = { name: t.name, sports: [...t.sports], city: t.city, area: t.area || '', type: t.type, price: t.price || '', onlinePrice: t.onlinePrice || '', pricesPublic: t.pricesPublic, bio: t.bio || '', certs: (t.certs || []).join(', ') };
}

function bar(back, next, nextLabel) {
  return '<div class="wizard-bar">' + (back ? '<button type="button" class="btn btn-ghost" data-act="wBack">← Назад</button>' : '<span></span>') +
    '<button type="button" class="btn btn-accent grow" data-act="' + next + '">' + nextLabel + '</button></div>';
}

function stepBody() {
  const d = wz.data;
  if (wz.step === 0) {
    return '<h1 class="display-s">Што тренираш?</h1><p class="lead">Клиентите те наоѓаат по спорт и град.</p>' +
      '<div class="stack-s"><span class="eyebrow muted">СПОРТ (можеш повеќе)</span><div class="chips wrap-chips">' +
        SPORTS.map((sp) => '<button type="button" class="chip' + (d.sports.includes(sp) ? ' on accent-chip' : '') + '" data-act="wSport" data-val="' + sp + '" aria-pressed="' + d.sports.includes(sp) + '">' + sp + '</button>').join('') + '</div></div>' +
      '<label class="field">Град<select data-change="wField" data-val="city">' + CITIES.map((c) => '<option' + (c === d.city ? ' selected' : '') + '>' + c + '</option>').join('') + '</select></label>' +
      '<label class="field">Дел од градот (незадолжително)<input value="' + esc(d.area) + '" data-input="wField" data-val="area" placeholder="на пр. Аеродром" autocomplete="off"></label>' +
      '<div class="stack-s"><span class="eyebrow muted">КАКО ТРЕНИРАШ</span><div class="chips wrap-chips">' + TYPES.map(([v, l]) => '<button type="button" class="chip' + (d.type === v ? ' on' : '') + '" data-act="wType" data-val="' + v + '">' + l + '</button>').join('') + '</div></div>';
  }
  if (wz.step === 1) {
    return '<h1 class="display-s">Твоите цени</h1><p class="lead">Можеш да ги смениш секогаш. Првиот разговор е бесплатен за сите клиенти.</p>' +
      (d.type !== 'online' ? '<label class="field">Еден тренинг во живо (ден.)<input inputmode="numeric" value="' + esc(d.price) + '" data-input="wField" data-val="price" placeholder="на пр. 900"></label>' : '') +
      (d.type !== 'live' ? '<label class="field">Онлајн план со следење, месечно (ден.)<input inputmode="numeric" value="' + esc(d.onlinePrice) + '" data-input="wField" data-val="onlinePrice" placeholder="на пр. 2500"></label>' : '') +
      '<label class="toggle-row"><span class="grow">Прикажи ги цените јавно<br><span class="muted small">Ако е исклучено, пишува „Цена на барање“.</span></span><input type="checkbox" data-change="wPublic"' + (d.pricesPublic ? ' checked' : '') + '></label>' +
      '<div class="card note">Совет: тренерите со видлива цена добиваат повеќе барања, бидејќи клиентот веднаш знае дали му одговара.</div>';
  }
  if (wz.step === 2) {
    return '<h1 class="display-s">Кажи нешто за себе</h1><p class="lead">2–3 реченици: искуство, пристап, со кого најмногу сакаш да работиш.</p>' +
      '<label class="field">За мене<textarea rows="5" maxlength="400" data-input="wField" data-val="bio" placeholder="На пр. Сертифициран тренер со 5 години искуство. Работам со почетници и со луѓе што сакаат да ослабат без гладување.">' + esc(d.bio) + '</textarea></label>' +
      '<label class="field">Сертификати (одвои со запирка)<input value="' + esc(d.certs) + '" data-input="wField" data-val="certs" placeholder="на пр. NASM, Нутриционист ниво 2"></label>' +
      '<div class="row gap"><button type="button" class="upload square" data-act="wPhoto">+<br>Фотографија</button><button type="button" class="upload grow" data-act="wPhoto">▶ Видео до 60 сек. (незадолжително)</button></div>';
  }
  const t = previewTrainer();
  return '<h1 class="display-s">Така те гледаат клиентите</h1><p class="lead">Ако сè е во ред, објави го профилот.</p><div class="preview-card">' + trainerCard(t, 0) + '</div>' +
    '<div class="card stack-s"><h2 class="eyebrow muted">ПРОВЕРКА</h2>' +
      [['Спорт и град', d.sports.length > 0], ['Цена', !!(d.price || d.onlinePrice)], ['Опис за тебе', d.bio.trim().length >= 20], ['Фотографија (во апликацијата)', false]].map(([l, ok]) => '<div class="check-row' + (ok ? ' ok' : '') + '"><span class="gcheck">' + (ok ? '✓' : '') + '</span><span class="grow">' + l + '</span></div>').join('') + '</div>' +
    '<p class="muted small">Ќе добиеш и 2 пробни барања од клиенти за да можеш веднаш да пробаш како работи апликацијата.</p>';
}

function previewTrainer() {
  const d = wz.data; const num = (v) => parseInt(String(v).replace(/\D/g, ''), 10) || 0;
  return { id: 'preview', name: d.name, sports: d.sports, sport: d.sports[0], city: d.city, area: d.area, type: d.type, rating: 0, reviews: 0, founder: false, price: num(d.price), onlinePrice: num(d.onlinePrice), pricesPublic: d.pricesPublic };
}

export const setup = {
  title: 'Воведување',
  render() {
    load();
    const last = wz.step === STEPS.length - 1;
    const dots = STEPS.map((l, i) => '<span class="dot-step' + (i <= wz.step ? ' on' : '') + '" aria-hidden="true"></span>').join('');
    return '<div class="wizard"><header class="wizard-top">' + logo() + '<span class="grow"></span><span class="muted small strong">Чекор ' + (wz.step + 1) + ' од ' + STEPS.length + '</span></header>' +
      '<div class="dots" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="' + (wz.step + 1) + '">' + dots + '</div>' +
      '<main class="wizard-main stack">' + stepBody() + '</main>' + bar(wz.step > 0, last ? 'wFinish' : 'wNext', last ? 'ОБЈАВИ МОЈ ПРОФИЛ' : 'ПОНАТАМУ →') + '</div>';
  },
  actions: {
    wField(el) { wz.data[el.dataset.val] = el.value; },
    wSport(el) {
      const sp = el.dataset.val; const list = wz.data.sports;
      wz.data.sports = list.includes(sp) ? list.filter((x) => x !== sp) : [...list, sp];
      store.refresh();
    },
    wType(el) { wz.data.type = el.dataset.val; store.refresh(); },
    wPublic(el) { wz.data.pricesPublic = el.checked; },
    wPhoto() { toast('Во вистинската апликација тука прикачуваш слика или видео.'); },
    wBack() { wz.step = Math.max(0, wz.step - 1); store.refresh(); },
    wNext() {
      if (wz.step === 0 && !wz.data.sports.length) { toast('Избери барем еден спорт.'); return; }
      wz.step += 1; store.refresh();
    },
    wFinish() {
      const d = wz.data; const s = store.get(); const id = s.trainerId;
      const num = (v) => parseInt(String(v).replace(/\D/g, ''), 10) || 0;
      const noPrice = !num(d.price) && !num(d.onlinePrice);
      const patch = { sports: d.sports, sport: d.sports[0], city: d.city, area: d.area.trim(), type: d.type, price: d.type === 'online' ? 0 : num(d.price), onlinePrice: d.type === 'live' ? 0 : num(d.onlinePrice),
        pricesPublic: noPrice ? false : d.pricesPublic, bio: d.bio.trim(), certs: d.certs.split(',').map((x) => x.trim()).filter(Boolean), draft: false };
      const demoReq = [['c5', 'Ивана М.', 'Намалување тежина · во живо'], ['c6', 'Лука Б.', 'Кондиција · онлајн']]
        .filter(([cid]) => !s.requests.some((r) => r.clientId === cid && r.trainerId === id))
        .map(([cid, nm, goal]) => ({ id: store.uid('r'), clientId: cid, clientName: nm, trainerId: id, goal, status: 'pending' }));
      store.notify(id, 'Ново барање од Ивана М.', '#/t/clients?tab=req');
      store.notify(id, 'Профилот е објавен. Клиентите те наоѓаат во пребарувањето.', '#/trainer/' + id);
      store.set((st) => ({ ...st, requests: [...st.requests, ...demoReq], trainerOverrides: { ...st.trainerOverrides, [id]: { ...(st.trainerOverrides[id] || {}), ...patch } }, guide: { ...st.guide, seen: true, open: true, track: 'trainer' } }));
      wz.data = null;
      toast('Профилот е објавен. Добредојде!');
      location.hash = '#/t/home';
    },
  },
};

export { den, chipRow, photo };
