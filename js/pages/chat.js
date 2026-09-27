// Разговор меѓу клиент и тренер — заеднички за двете страни.
import * as store from '../store.js';
import { esc, initials, icon, toast } from '../ui.js';

const AUTO = [
  'Одлично! Продолжи така 💪', 'Добро прашање — ќе ти одговорам подетално по тренинг.', 'Фала за снимката, ќе ја погледнам денес.',
  'Не заборавај да внесеш напредок оваа недела.', 'Утре во исто време?',
];

const MONTHS = ['јан', 'фев', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'ное', 'дек'];
export function timeLabel(at) {
  const d = new Date(at), now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return d.toDateString() === now.toDateString() ? pad(d.getHours()) + ':' + pad(d.getMinutes()) : d.getDate() + ' ' + MONTHS[d.getMonth()];
}

export function chatBubbles(msgs, meId) {
  if (!msgs.length) return '<div class="empty">Сè уште нема пораки. Напиши прва порака.</div>';
  return msgs.map((m) => {
    const mine = m.from === meId;
    if (m.kind === 'video') {
      return '<div class="msg-card ' + (mine ? 'mine' : '') + '"><div class="msg-video"><span class="round-play">' + icon.play + '</span></div>' +
        '<div class="msg-card-body"><span class="strong">' + esc(m.text) + '</span>' +
        (m.notes ? m.notes.map((n) => '<div class="note-line"><span class="accent strong">' + esc(n[0]) + '</span> ' + esc(n[1]) + '</div>').join('') : '') + '</div></div>';
    }
    if (m.kind === 'plan') {
      return '<div class="msg-file ' + (mine ? 'mine' : '') + '">' + icon.file + '<span class="strong">' + esc(m.text) + '</span></div>';
    }
    return '<div class="bubble ' + (mine ? 'mine' : '') + '">' + esc(m.text) + '<span class="bubble-time">' + timeLabel(m.at) + '</span></div>';
  }).join('');
}

export function composer(action, attachAction) {
  return '<form class="composer" data-submit="' + action + '">' +
    '<button type="button" class="btn btn-ghost btn-icon" data-act="' + attachAction + '" aria-label="Прикачи снимка">+</button>' +
    '<label class="grow"><span class="sr">Порака</span><input id="chat-input" name="text" autocomplete="off" placeholder="Напиши порака…"></label>' +
    '<button type="submit" class="btn btn-light">ИСПРАТИ</button></form>';
}

export function send(clientId, trainerId, fromId, text, autoFrom) {
  const t = String(text || '').trim();
  if (!t) return;
  store.addMessage(clientId, trainerId, { from: fromId, text: t });
  if (autoFrom) {
    setTimeout(() => {
      store.addMessage(clientId, trainerId, { from: autoFrom, text: AUTO[Math.floor(Math.random() * AUTO.length)] });
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
