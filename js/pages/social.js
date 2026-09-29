// Објави (фид), известувања и оценки — заеднички за клиент и тренер.
import * as store from '../store.js';
import { esc, initials, appLayout, toast, modal, closeModal, starRow, ago, chipRow } from '../ui.js';

// ---------- Објави ----------
export function postCard(p, opts = {}) {
  const s = store.get();
  const t = store.trainer(p.trainerId);
  const me = store.meId();
  const liked = me && p.likes.includes(me);
  return '<article class="card post">' +
    '<header class="row gap-s"><a class="avatar" href="#/trainer/' + t.id + '">' + initials(t.name) + '</a><div class="grow"><a class="strong" href="#/trainer/' + t.id + '">' + esc(t.name) + '</a>' +
    '<span class="muted small block">' + esc(t.sport) + ' · ' + ago(p.at) + '</span></div><span class="tag tag-outline">' + esc(p.tag.toUpperCase()) + '</span></header>' +
    '<p class="post-text">' + esc(p.text) + '</p>' +
    '<footer class="row gap">' + (s.role === 'client' || s.role === 'trainer'
      ? '<button type="button" class="like' + (liked ? ' on' : '') + '" data-act="like" data-val="' + p.id + '" aria-pressed="' + (liked ? 'true' : 'false') + '">♥ ' + p.likes.length + '</button>'
      : '<span class="muted small">♥ ' + p.likes.length + '</span>') +
    (opts.mine ? '<span class="grow"></span><button type="button" class="link muted small" data-act="delPost" data-val="' + p.id + '">Избриши</button>' : '') + '</footer></article>';
}

export const postActions = {
  like(el) {
    const me = store.meId(); if (!me) return;
    const id = el.dataset.val;
    store.set((s) => ({ ...s, posts: s.posts.map((p) => (p.id !== id ? p : { ...p, likes: p.likes.includes(me) ? p.likes.filter((x) => x !== me) : [...p.likes, me] })) }));
  },
  delPost(el) { store.set((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== el.dataset.val) })); toast('Објавата е избришана.'); },
};

const feedState = { tag: 'Сите' };
export const clientFeed = {
  title: 'Објави',
  render() {
    const posts = store.postsBy().filter((p) => feedState.tag === 'Сите' || p.tag === feedState.tag);
    const content = '<div class="page-head"><div><h1 class="display-s">Објави</h1><p class="muted">Совети и новости од тренерите на Тренирај.</p></div><div class="chips">' + chipRow(['Сите', 'Совет', 'Новост', 'Предизвик'], feedState.tag, 'fTag') + '</div></div>' +
      '<div class="feed">' + (posts.length ? posts.map((p) => postCard(p)).join('') : '<div class="empty">Нема објави од овој тип.</div>') + '</div>';
    return appLayout('client', 'feed', content);
  },
  actions: { ...postActions, fTag(el) { feedState.tag = el.dataset.val; store.refresh(); } },
};

export const trainerPosts = {
  title: 'Објави',
  render() {
    const tid = store.get().trainerId;
    const mine = store.postsBy(tid);
    const likes = mine.reduce((a, p) => a + p.likes.length, 0);
    const content = '<div class="page-head"><div><h1 class="display-s">Објави</h1><p class="muted">Твоите објави ги гледаат сите клиенти во фидот и на твојот профил.</p></div></div>' +
      '<div class="booking"><div class="stack grow">' +
      '<form class="card stack-s" data-submit="newPost"><label class="field">Нова објава<textarea id="post-text" name="text" rows="3" maxlength="400" required placeholder="Совет за исхрана, слободни термини, нов предизвик…"></textarea></label>' +
      '<div class="row gap wrap"><label class="field-inline">Тип<select name="tag"><option>Совет</option><option>Новост</option><option>Предизвик</option></select></label><span class="grow"></span><button type="submit" class="btn btn-accent">ОБЈАВИ</button></div></form>' +
      '<h2 class="eyebrow muted">МОИ ОБЈАВИ (' + mine.length + ')</h2><div class="feed">' + (mine.length ? mine.map((p) => postCard(p, { mine: true })).join('') : '<div class="empty">Сè уште немаш објави. Првата објава те прави повидлив во пребарувањето.</div>') + '</div></div>' +
      '<aside class="stack w-300"><div class="card"><div class="eyebrow muted">ВКУПНО ЛАЈКОВИ</div><div class="display-xs accent">' + likes + '</div><div class="muted small">на ' + mine.length + ' објави</div></div>' +
      '<div class="card note"><span class="strong">Совет:</span> тренерите што објавуваат барем еднаш неделно добиваат повеќе барања од клиенти.</div></aside></div>';
    return appLayout('trainer', 'posts', content);
  },
  actions: {
    ...postActions,
    newPost(form) {
      const text = form.text.value.trim(); if (!text) return;
      const tid = store.get().trainerId;
      store.markStep('post');
      store.set((s) => ({ ...s, posts: [{ id: store.uid('po'), trainerId: tid, tag: form.tag.value, text, at: Date.now(), likes: [] }, ...s.posts] }));
      toast('Објавено! Клиентите веќе ја гледаат во фидот.');
      // симулиран лајк од клиент за да се види дека е жива
      setTimeout(() => { store.set((s) => ({ ...s, posts: s.posts.map((p, i) => (i === 0 && p.trainerId === tid ? { ...p, likes: [...p.likes, 'c2'] } : p)) })); }, 2500);
    },
  },
};

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
