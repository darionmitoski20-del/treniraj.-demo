// Разговор меѓу клиент и тренер — заеднички за двете страни.
import { planKindOf } from '../kinds.js';
import * as store from '../store.js';
import { esc, initials, icon, toast, modal, closeModal } from '../ui.js';

const AUTO = [
  'Одлично! Продолжи така 💪', 'Добро прашање — ќе ти одговорам подетално по тренинг.', 'Фала за снимката, ќе ја погледнам денес.',
  'Не заборавај да внесеш напредок оваа недела.', 'Утре во исто време?',
];

const AUTO_CLIENT = [
  'Фала! Ќе го пробам уште денес.', 'Супер, се гледаме на тренинг 💪', 'Може ли малку полесно за почеток?', 'Јасно, ќе ти пратам снимка по тренинг.', 'Одлично, фала за советот!',
];

const MONTHS = ['јан', 'фев', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'ное', 'дек'];
export function timeLabel(at) {
  const d = new Date(at), now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return d.toDateString() === now.toDateString() ? pad(d.getHours()) + ':' + pad(d.getMinutes()) : d.getDate() + ' ' + MONTHS[d.getMonth()];
}

const fmtSecs = (n) => Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
export function chatBubbles(msgs, meId) {
  if (!msgs.length) return '<div class="empty">Сè уште нема пораки. Напиши прва порака.</div>';
  return msgs.map((m) => {
    const mine = m.from === meId;
    if (m.kind === 'video') {
      return '<div class="msg-card ' + (mine ? 'mine' : '') + '"><div class="msg-video"><span class="round-play">' + icon.play + '</span></div>' +
        '<div class="msg-card-body"><span class="strong">' + esc(m.text) + '</span>' +
        (m.notes ? m.notes.map((n) => '<div class="note-line"><span class="accent strong">' + esc(n[0]) + '</span> ' + esc(n[1]) + '</div>').join('') : '') + '</div></div>';
    }
    if (m.kind === 'recipe') {
      const r = store.recipe(m.recipeId);
      return '<button type="button" class="msg-recipe ' + (mine ? 'mine' : '') + '" data-act="openRecipe" data-val="' + esc(m.recipeId) + '"><span class="msg-recipe-ic" aria-hidden="true">🍽</span><span class="grow"><span class="eyebrow accent block">РЕЦЕПТ</span><span class="strong block">' + esc(m.text) + '</span>' +
        (r ? '<span class="muted small">' + r.mins + ' мин · ' + r.kcal + ' kcal · ' + r.protein + ' г протеини</span>' : '') + '</span><span class="accent strong">Отвори →</span></button>';
    }
    if (m.kind === 'plan') {
      const pl = m.planId ? store.plan(m.planId) : null;
      if (!pl) return '<div class="msg-file ' + (mine ? 'mine' : '') + '">' + icon.file + '<span class="strong">' + esc(m.text) + '</span></div>';
      const pg = store.planProgress(pl);
      return '<a class="msg-recipe ' + (mine ? 'mine' : '') + '" href="' + (pl.trainerId === meId ? '#/t/plan/' : '#/c/plan/') + pl.id + '"><span class="msg-recipe-ic" aria-hidden="true">' + icon.file + '</span><span class="grow"><span class="eyebrow accent block">ПЛАН</span><span class="strong block">' + esc(pl.name) + '</span>' +
        '<span class="muted small">' + pg.done + ' од ' + pg.total + ' ' + planKindOf(pl).item + ' одработени</span></span><span class="accent strong">Отвори →</span></a>';
    }
    if (m.kind === 'voice') {
      let seed = Math.floor(m.at || 7); const bars = Array.from({ length: 26 }, () => { seed = (seed * 9301 + 49297) % 233280; return '<i style="height:' + (20 + Math.round((seed / 233280) * 80)) + '%"></i>'; }).join('');
      return '<div class="voice ' + (mine ? 'mine' : '') + '" style="--dur:' + m.secs + 's"><button type="button" class="vplay" data-act="voicePlay" data-secs="' + m.secs + '" aria-label="Пушти гласовна порака"><span class="vp">▶</span></button><span class="wave"><span class="wave-base">' + bars + '</span><span class="wave-fill">' + bars + '</span></span><span class="vtime">' + fmtSecs(m.secs) + '</span></div>';
    }
    if (m.kind === 'image') {
      return '<div class="msg-img ' + (mine ? 'mine' : '') + '"><img src="' + m.d + '" alt="Слика" data-act="imgOpen"><span class="bubble-time">' + timeLabel(m.at) + '</span></div>';
    }
    if (m.kind === 'file') {
      return '<div class="msg-file ' + (mine ? 'mine' : '') + '">' + icon.file + '<span class="grow"><span class="strong block">' + esc(m.name) + '</span><span class="muted small">' + esc(m.size || '') + ' · ' + timeLabel(m.at) + '</span></span></div>';
    }
    return '<div class="bubble ' + (mine ? 'mine' : '') + '">' + esc(m.text) + '<span class="bubble-time">' + timeLabel(m.at) + '</span></div>';
  }).join('');
}

export function composer(action) {
  return '<form class="composer" data-submit="' + action + '">' +
    '<button type="button" class="btn btn-ghost btn-icon" data-act="attachMenu" aria-label="Прикачи">+</button>' +
    '<label class="grow"><span class="sr">Порака</span><input id="chat-input" name="text" autocomplete="off" placeholder="Напиши порака…"></label>' +
    '<button type="button" class="btn btn-ghost btn-icon" data-act="micStart" aria-label="Гласовна порака">🎤</button>' +
    '<button type="submit" class="btn btn-light">ИСПРАТИ</button></form>' +
    '<div class="rec-bar" id="rec-bar" hidden><span class="rec-dot"></span><span class="strong">Снимам</span><span id="rec-t" class="grow">0:00</span><button type="button" class="btn btn-ghost btn-sm" data-act="micCancel">Откажи</button><button type="button" class="btn btn-accent btn-sm" data-act="micSend">ИСПРАТИ</button></div>';
}

export function send(clientId, trainerId, fromId, text, autoFrom) {
  const t = String(text || '').trim();
  if (!t) return;
  store.addMessage(clientId, trainerId, { from: fromId, text: t });
  if (autoFrom) {
    setTimeout(() => {
      const pool = autoFrom === clientId ? AUTO_CLIENT : AUTO;
      store.addMessage(clientId, trainerId, { from: autoFrom, text: pool[Math.floor(Math.random() * pool.length)] });
    }, 1400);
  }
}

export function attachVideo(clientId, trainerId, fromId) {
  store.addMessage(clientId, trainerId, { from: fromId, kind: 'video', text: 'Снимка од тренинг' });
  toast('Во демото снимката е симулирана. Во апликацијата се прикачува вистинско видео.');
}

export function scrollChat() {
  const el = document.querySelector('.chat-body');
  if (el) el.scrollTop = el.scrollHeight;
}

export { initials };


// ---- Заеднички дејства: контекст на отворениот разговор ----
let ctx = null;
export function setCtx(c) { ctx = c; }
const PREVIEW = { voice: '🎤 Гласовна порака', image: '🖼 Слика', file: '📄 Документ', video: '🎥 Снимка', plan: '📋 План', recipe: '🍽 Рецепт' };
function post(msg) {
  if (!ctx) return;
  store.addMessage(ctx.cid, ctx.tid, { from: ctx.from, ...msg });
  if (ctx.auto) setTimeout(() => {
    const pool = ctx.auto === ctx.cid ? AUTO_CLIENT : AUTO;
    store.addMessage(ctx.cid, ctx.tid, { from: ctx.auto, text: pool[Math.floor(Math.random() * pool.length)] });
  }, 1600);
}
let rec = null;
function stopRec() { if (rec) { clearInterval(rec.timer); rec = null; } const bar = document.getElementById('rec-bar'); const f = document.querySelector('.composer'); if (bar) bar.hidden = true; if (f) f.hidden = false; }
let vTimer = null;

export const chatActions = {
  attachMenu() {
    modal('<h2 class="h2">Прикачи</h2><div class="stack-s"><button type="button" class="role-btn" data-act="pickImage"><span class="strong">🖼 Слика</span><span class="small">Храна, тело, наод, држење</span></button><button type="button" class="role-btn" data-act="pickFile"><span class="strong">📄 Документ</span><span class="small">PDF, Word, Excel (во демото се праќа само името)</span></button><button type="button" class="role-btn" data-act="chatVideo"><span class="strong">🎥 Снимка</span><span class="small">Видео од тренинг за проверка на техника</span></button></div>');
  },
  chatVideo() { closeModal(); if (ctx) attachVideo(ctx.cid, ctx.tid, ctx.from); },
  pickImage() {
    closeModal();
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      const img = new Image(); const url = URL.createObjectURL(f);
      img.onload = () => {
        const k = Math.min(1, 720 / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        try { post({ kind: 'image', d: c.toDataURL('image/jpeg', 0.78), text: 'Слика' }); } catch (e) { toast('Сликата е преголема за демото.'); }
      };
      img.onerror = () => toast('Оваа слика не може да се отвори.');
      img.src = url;
    };
    inp.click();
  },
  pickFile() {
    closeModal();
    const inp = document.createElement('input'); inp.type = 'file';
    inp.onchange = () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      const size = f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' МБ' : Math.max(1, Math.round(f.size / 1024)) + ' КБ';
      post({ kind: 'file', name: f.name.slice(0, 60), size, text: f.name });
      toast('Во демото се праќа само името на документот.');
    };
    inp.click();
  },
  imgOpen(el) { modal('<img class="img-full" src="' + el.getAttribute('src') + '" alt="Слика">'); },
  micStart() {
    const bar = document.getElementById('rec-bar'); const f = document.querySelector('.composer'); if (!bar || !f) return;
    stopRec(); f.hidden = true; bar.hidden = false;
    rec = { start: Date.now(), timer: setInterval(() => { const t = document.getElementById('rec-t'); if (!t) { stopRec(); return; } t.textContent = fmtSecs(Math.round((Date.now() - rec.start) / 1000)); }, 500) };
    document.getElementById('rec-t').textContent = '0:00';
  },
  micCancel() { stopRec(); },
  micSend() {
    if (!rec) return; const secs = Math.min(120, Math.max(1, Math.round((Date.now() - rec.start) / 1000))); stopRec();
    post({ kind: 'voice', secs, text: 'Гласовна порака' });
    toast('Во демото гласовната порака е симулирана (без вистински звук).');
  },
  voicePlay(el) {
    const v = el.closest('.voice'); if (!v) return; const secs = Number(el.dataset.secs) || 3;
    document.querySelectorAll('.voice.playing').forEach((x) => x.classList.remove('playing'));
    clearTimeout(vTimer);
    if (v.classList.contains('was')) { v.classList.remove('was'); return; }
    void v.offsetWidth; v.classList.add('playing', 'was');
    vTimer = setTimeout(() => { v.classList.remove('playing', 'was'); }, secs * 1000);
  },
  pinEdit() {
    if (!ctx) return; const pin = store.pinOf(ctx.cid, ctx.tid);
    modal('<h2 class="h2">Закачена порака</h2><p class="muted small">Клиентот ја гледа секогаш на врвот од разговорот. На пример: цел за месецот или договор за неделата.</p><form class="stack" data-submit="pinSave"><label class="field">Порака<textarea name="t" rows="3" maxlength="200" placeholder="Оваа недела: 3 тренинзи + 8.000 чекори дневно">' + esc(pin ? pin.text : '') + '</textarea></label><button class="btn btn-accent" type="submit">ЗАКАЧИ</button>' + (pin ? '<button type="button" class="btn btn-ghost" data-act="pinClear">Тргни</button>' : '') + '</form>');
  },
  pinSave(form) {
    if (!ctx) return; const t = form.t.value.trim(); store.setPin(ctx.cid, ctx.tid, t);
    if (t) store.notify(ctx.cid, (store.trainer(ctx.tid) || {}).name + ' закачи порака во разговорот', '#/c/messages/' + ctx.tid);
    closeModal(); toast(t ? 'Пораката е закачена.' : 'Закачената порака е тргната.');
  },
  pinClear() { if (!ctx) return; store.setPin(ctx.cid, ctx.tid, ''); closeModal(); toast('Закачената порака е тргната.'); },
};

// Лента со закачена порака, цел и следен термин
export function pinBar({ cid, tid, goal, next, editable }) {
  const pin = store.pinOf(cid, tid);
  const meta = [goal ? 'Цел: ' + esc(goal) : '', next ? 'Следен термин: ' + esc(next) : ''].filter(Boolean).join(' · ');
  if (!pin && !meta && !editable) return '';
  return '<div class="pinbar"><span class="pin-ic" aria-hidden="true">📌</span><span class="grow">' + (pin ? '<span class="strong block pin-text">' + esc(pin.text) + '</span>' : editable ? '<span class="muted small block">Закачи порака за клиентот</span>' : '') + (meta ? '<span class="muted small block pin-meta">' + meta + '</span>' : '') + '</span>' +
    (editable ? '<button type="button" class="btn btn-ghost btn-sm" data-act="pinEdit">' + (pin ? 'Уреди' : 'Закачи') + '</button>' : '') + '</div>';
}

// Листа на разговори: последна порака, време, непрочитано
export function convList(items, activeId, hrefBase, meId) {
  const sorted = [...items].sort((a, b) => ((b.last && b.last.at) || 0) - ((a.last && a.last.at) || 0));
  return sorted.map((x) => {
    const l = x.last; const unread = l && l.from !== meId;
    const prev = !l ? (x.sub || 'Нема пораки') : (l.from === meId ? 'Ти: ' : '') + (PREVIEW[l.kind] ? (l.kind === 'file' ? '📄 ' + l.name : PREVIEW[l.kind]) : l.text);
    return '<a class="thread' + (x.id === activeId ? ' on' : '') + (unread ? ' unread' : '') + '" href="' + hrefBase + x.id + '"><span class="avatar' + (x.id === activeId ? ' accent-bg' : '') + '">' + initials(x.name) + '</span>' +
      '<span class="grow ellipsis"><span class="thread-top"><span class="strong ellipsis">' + esc(x.name) + '</span>' + (l ? '<span class="thread-time">' + timeLabel(l.at) + '</span>' : '') + '</span>' +
      '<span class="muted small ellipsis">' + esc(prev) + '</span></span>' + (unread ? '<span class="dot-accent"></span>' : '') + '</a>';
  }).join('');
}
