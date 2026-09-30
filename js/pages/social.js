// Известувања и оценки — заеднички за клиент и тренер.
import * as store from '../store.js';
import { esc, initials, appLayout, toast, modal, closeModal, starRow, ago, chipRow } from '../ui.js';

// ---------- Известувања ----------
function notificationsPage(role) {
  return {
    title: 'Известувања',
    render() {
      const list = store.myNotifications();
      const content = '<div class="page-head"><h1 class="display-s">Известувања</h1></div>' +
        (list.length ? '<div class="card notif-list">' + list.map((n) => '<a class="notif' + (n.read ? '' : ' unread') + '" href="' + esc(n.href || '#') + '"><span class="notif-dot"></span><span class="grow">' + esc(n.text) + '</span><span class="muted small nowrap">' + ago(n.at) + '</span></a>').join('') + '</div>'
          : '<div class="empty">Немаш известувања.</div>') +
        '<p class="muted small">Во вистинската апликација важните известувања (нови барања, термини) стигнуваат и на email.</p>';
      return appLayout(role, 'notif', content);
    },
    mount() { setTimeout(() => store.markAllRead(), 1200); },
  };
}
export const clientNotifications = notificationsPage('client');
export const trainerNotifications = notificationsPage('trainer');

// ---------- Оценки ----------
export function reviewsBlock(trainerId, canReview) {
  const list = store.reviewsFor(trainerId);
  const c = store.get().client;
  const mine = list.find((r) => r.clientId === c.id);
  return '<div class="card"><div class="row gap"><h2 class="eyebrow muted grow">ОЦЕНКИ</h2>' +
    (canReview ? '<button type="button" class="btn btn-ghost btn-sm" data-act="reviewOpen" data-val="' + trainerId + '">' + (mine ? 'Измени ја мојата оценка' : '★ Остави оценка') + '</button>' : '') + '</div>' +
    (list.length ? '<div class="grid-2">' + list.slice(0, 4).map((r) => '<div class="review"><div class="strong">' + starRow(r.stars) + ' ' + esc(r.clientName) + (r.clientId === c.id ? ' <span class="muted small">(ти)</span>' : '') + '</div><p class="muted">' + esc(r.text || '') + '</p><span class="muted small">' + ago(r.at) + '</span></div>').join('') + '</div>'
      : '<p class="muted">Сè уште нема оценки.</p>') + '</div>';
}

let reviewStars = 5;
export const reviewActions = {
  reviewOpen(el) {
    const t = store.trainer(el.dataset.val);
    const c = store.get().client;
    const mine = store.reviewsFor(t.id).find((r) => r.clientId === c.id);
    reviewStars = mine ? mine.stars : 5;
    modal('<h2 class="h2">Оцени го/ја ' + esc(t.name) + '</h2><form class="stack" data-submit="reviewSave"><input type="hidden" name="tid" value="' + t.id + '">' +
      '<div class="star-pick" role="radiogroup" aria-label="Оценка">' + [1, 2, 3, 4, 5].map((n) => '<button type="button" class="star-btn' + (n <= reviewStars ? ' on' : '') + '" data-act="reviewStar" data-val="' + n + '" role="radio" aria-checked="' + (n === reviewStars) + '" aria-label="' + n + ' ѕвезди">★</button>').join('') + '</div>' +
      '<label class="field">Коментар<textarea name="text" rows="3" maxlength="300" placeholder="Што ти се допаѓа кај тренингот?">' + esc(mine ? mine.text : '') + '</textarea></label>' +
      '<p class="muted small">Оценката е јавна и се гледа на профилот на тренерот.</p><button type="submit" class="btn btn-accent">ЗАЧУВАЈ ОЦЕНКА</button></form>');
  },
  reviewStar(el) {
    reviewStars = Number(el.dataset.val);
    document.querySelectorAll('.star-btn').forEach((b) => { const n = Number(b.dataset.val); b.classList.toggle('on', n <= reviewStars); b.setAttribute('aria-checked', String(n === reviewStars)); });
  },
  reviewSave(form) {
    const tid = form.tid.value;
    const c = store.get().client;
    const text = form.text.value.trim();
    store.markStep('review');
    store.notify(tid, store.clientName(c.id) + ' те оцени со ' + reviewStars + ' ѕвезди', '#/trainer/' + tid);
    store.set((s) => ({ ...s, reviews: [{ id: store.uid('rv'), trainerId: tid, clientId: c.id, clientName: store.clientName(c.id), stars: reviewStars, text, at: Date.now() }, ...s.reviews.filter((r) => !(r.trainerId === tid && r.clientId === c.id))] }));
    closeModal();
    toast('Благодариме! Оценката е објавена.');
  },
};
