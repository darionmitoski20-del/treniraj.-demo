// План: клиентот го отвора („Мој план“ во менито или од четот) и штиклира, тренерот гледа што е одработено.
import * as store from '../store.js';
import { DAY_NAMES } from '../data.js';
import { esc, initials, appLayout, toast } from '../ui.js';
import { planKindOf } from '../kinds.js';

// Кој план е „активен“: започнат и недовршен, па закажан (најскор), па последниот
export function activePlan(plans) {
  const today = store.isoIn(0);
  const unfinished = (p) => { const g = store.planProgress(p); return g.done < g.total; };
  const started = plans.filter((p) => unfinished(p) && !(p.startDate && p.startDate > today));
  if (started.length) return started[0];
  const upcoming = plans.filter((p) => p.startDate && p.startDate > today).sort((a, b) => a.startDate.localeCompare(b.startDate));
  return upcoming[0] || plans[0];
}

function emptyPlans() {
  return appLayout('client', 'plan', '<div class="page-head"><h1 class="display-s">Мој план</h1></div>' +
    '<div class="empty">Сè уште немаш план.<br><span class="small">Кога тренерот ќе ти испрати план, ќе го најдеш тука и ќе штиклираш како напредуваш.</span>' +
    '<div class="row gap-s center-row wrap" style="margin-top:14px"><a class="btn btn-accent btn-sm" href="#/c/messages">Пораки</a><a class="btn btn-ghost btn-sm" href="#/">Најди тренер</a></div></div>');
}

// планот што е отворен кај клиентот (и кога страницата е „Мој план“ без број во адресата)
let shownPlan = null;
const planId = () => shownPlan || location.hash.split('?')[0].split('/').pop();

function notFoundPage(role) {
  return appLayout(role, 'home', '<div class="empty">Овој план не постои или е избришан.<br><a class="btn btn-accent btn-sm" style="margin-top:12px" href="' + (role === 'trainer' ? '#/t/home' : '#/c/home') + '">Назад</a></div>');
}

function mediaBlock(pl, key, interactive) {
  const m = (pl.media || {})[key];
  if (!m) return interactive ? '<button type="button" class="link accent small strong" data-act="exMedia" data-val="' + key + '">📷 Прикачи слика или снимка од техника</button>' : '';
  const body = m.t === 'img' ? '<img class="ex-media" src="' + m.d + '" alt="Слика од клиентот">' : '<span class="chip-s">▶ снимка: ' + esc(m.n || 'видео') + '</span>';
  return '<div class="ex-tools">' + body + (interactive ? '<button type="button" class="link muted small" data-act="exMediaDel" data-val="' + key + '">Избриши</button>' : '<span class="muted small">Од клиентот за проверка на техника</span>') + '</div>';
}

function exerciseRow(r, dayIdx, exIdx, done, interactive, pk, pl, locked) {
  const key = dayIdx + ':' + exIdx;
  const detail = pk.detail(r);
  const inner = '<span class="ex-check" aria-hidden="true">' + (done ? '✓' : '') + '</span><span class="grow"><span class="strong block">' + esc(r[0]) + '</span><span class="muted small">' + esc(detail) + '</span></span>' +
    (r[4] ? '<span class="chip-s">▶ снимка</span>' : '');
  const main = interactive
    ? '<button type="button" class="ex' + (done ? ' done' : '') + (locked ? ' locked' : '') + '" role="checkbox" aria-checked="' + done + '" data-act="toggleEx" data-val="' + key + '">' + inner + '</button>'
    : '<div class="ex static' + (done ? ' done' : '') + '">' + inner + '</div>';
  const tools = mediaBlock(pl, key, interactive);
  return '<div class="ex-wrap">' + main + (tools ? '<div class="ex-under">' + tools + '</div>' : '') + '</div>';
}

function planPage(role) {
  const interactive = role === 'client';
  return {
    title: interactive ? 'Мој план' : 'План',
    render(p) {
      const s = store.get();
      const mine = interactive ? store.plansFor(s.client.id) : [];
      let pl;
      if (interactive && !p.id) { if (!mine.length) return emptyPlans(); pl = activePlan(mine); } else pl = store.plan(p.id);
      if (!pl) return notFoundPage(role);
      if (interactive && pl.clientId !== s.client.id) return notFoundPage(role);
      if (interactive) shownPlan = pl.id;
      const pg = store.planProgress(pl); const pk = planKindOf(pl);
      const pct = Math.round((pg.done / Math.max(pg.total, 1)) * 100);
      const trainer = store.trainer(pl.trainerId);
      const back = '#/t/clients/' + pl.clientId;
      const who = interactive ? 'од ' + esc(trainer.name) : 'за ' + esc(store.clientName(pl.clientId));
      const today = store.isoIn(0); const locked = !!(pl.startDate && pl.startDate > today);
      const sizes = pl.weekSizes && pl.weekSizes.length ? pl.weekSizes : null;
      const weekOf = (i) => { if (!sizes) return -1; let acc = 0; for (let w = 0; w < sizes.length; w++) { acc += sizes[w]; if (i < acc) return w; } return sizes.length - 1; };
      const weekStart = (w) => { if (!pl.startDate) return ''; const d = new Date(pl.startDate + 'T12:00:00'); d.setDate(d.getDate() + w * 7); return d.toISOString().slice(0, 10).split('-').reverse().join('.'); };
      const finished = pg.done === pg.total && pg.total > 0;
      const nextIdx = interactive && !locked && !finished ? pl.days.findIndex((d, i) => d.some((_, j) => !pl.done[i + ':' + j])) : -1;
      let lastW = -2;
      const days = pl.days.map((d, i) => {
        const dn = d.filter((_, j) => pl.done[i + ':' + j]).length;
        const w = weekOf(i); let head = '';
        if (w !== lastW && sizes) { head = '<h2 class="week-head">НЕДЕЛА ' + (w + 1) + (pl.startDate ? '<span class="muted small"> · од ' + weekStart(w) + '</span>' : '') + '</h2>'; }
        lastW = w;
        const inWeek = sizes ? i - sizes.slice(0, w).reduce((a, n) => a + n, 0) : i;
        return head + '<section class="card stack-s' + (i === nextIdx ? ' next' : '') + '"><div class="row gap"><h2 class="eyebrow muted grow">' + pk.dayWord.toUpperCase() + ' ' + (inWeek + 1) + (i === nextIdx ? ' · СЛЕДНО' : '') + '</h2><span class="tag ' + (dn === d.length ? 'tag-accent' : 'tag-outline') + '">' + dn + '/' + d.length + (dn === d.length ? ' ✓' : '') + '</span></div>' +
          d.map((r, j) => exerciseRow(r, i, j, !!pl.done[i + ':' + j], interactive, pk, pl, locked)).join('') + '</section>';
      }).join('');
      const banner = locked ? '<section class="card accent-line"><div class="eyebrow accent">ЗАКАЖАН ПЛАН</div><div class="strong">Почнува на ' + pl.startDate.split('-').reverse().join('.') + '</div><div class="muted small">' + (interactive ? 'Можеш да го разгледаш однапред, а штиклирањето се отвора тој ден.' : 'Клиентот го гледа планот, штиклира од тој ден.') + '</div></section>' : '';
      const tabs = mine.length > 1 ? '<nav class="plan-tabs" aria-label="Мои планови">' + mine.map((x) => { const g = store.planProgress(x); const fin = g.total > 0 && g.done === g.total; const sch = x.startDate && x.startDate > today;
        return '<a class="chip' + (x.id === pl.id ? ' on' : '') + '" href="#/c/plan/' + x.id + '"' + (x.id === pl.id ? ' aria-current="page"' : '') + '>' + esc(x.name) + '<span class="chip-n">' + (fin ? '✓' : sch ? 'закажан' : g.done + '/' + g.total) + '</span></a>'; }).join('') + '</nav>' : '';
      const content = '<div class="page-head"><div class="row gap-s">' + (interactive ? '' : '<a class="btn btn-ghost btn-icon" href="' + back + '" aria-label="Назад">←</a>') + '<div><h1 class="display-s">' + esc(pl.name) + '</h1><div class="muted small">' + who + '</div></div></div></div>' + tabs +
        '<section class="card accent-card"><div class="eyebrow">' + (interactive ? 'ТВОЈ НАПРЕДОК' : 'ОДРАБОТЕНО') + '</div><div class="display-xs">' + pg.done + ' од ' + pg.total + ' ' + pk.item + '</div><div class="bar dark"><div style="width:' + pct + '%"></div></div>' +
        '<div class="small strong">' + (finished ? 'Планот е завршен. Браво!' : interactive ? pk.tick : 'Клиентот штиклира кога ќе заврши ставка.') + '</div></section>' +
        banner + '<div class="plan-days">' + days + '</div>' +
        (interactive ? '<div class="row gap-s wrap"><a class="btn btn-ghost" href="#/c/messages/' + pl.trainerId + '">Прашај го тренерот</a></div>' : '<div class="row gap-s wrap"><a class="btn btn-ghost" href="#/t/messages/' + pl.clientId + '">Прати порака</a><a class="btn btn-ghost" href="#/t/clients/' + pl.clientId + '">Напредок на клиентот</a></div>');
      return appLayout(role, interactive ? 'plan' : 'clients', content);
    },
    actions: interactive ? {
      exMedia(el) {
        const id = planId();
        const pl = store.plan(id); if (!pl) return; const key = el.dataset.val;
        const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*,video/*';
        const save = (m) => {
          const [di, ei] = key.split(':').map(Number); const ex = pl.days[di] && pl.days[di][ei];
          try { store.set((st) => ({ ...st, sentPlans: st.sentPlans.map((x) => (x.id === id ? { ...x, media: { ...(x.media || {}), [key]: m } } : x)) })); }
          catch (e) { toast('Сликата е преголема за демото.'); return; }
          store.notify(pl.trainerId, store.clientName(pl.clientId) + ' прикачи ' + (m.t === 'img' ? 'слика' : 'снимка') + ' за „' + (ex ? ex[0] : 'вежба') + '“', '#/t/plan/' + pl.id);
          toast(m.t === 'img' ? 'Сликата е додадена. Тренерот е известен.' : 'Снимката е додадена (во демото е симулирано). Тренерот е известен.');
        };
        inp.onchange = () => {
          const f = inp.files && inp.files[0]; if (!f) return;
          if (f.type.startsWith('video/')) { save({ t: 'vid', n: f.name.slice(0, 40) }); return; }
          const img = new Image(); const url = URL.createObjectURL(f);
          img.onload = () => {
            const k = Math.min(1, 600 / Math.max(img.width, img.height));
            const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
            save({ t: 'img', d: c.toDataURL('image/jpeg', 0.75) });
          };
          img.onerror = () => toast('Оваа слика не може да се отвори.');
          img.src = url;
        };
        inp.click();
      },
      exMediaDel(el) {
        const id = planId(); const key = el.dataset.val;
        store.set((st) => ({ ...st, sentPlans: st.sentPlans.map((x) => { if (x.id !== id) return x; const m = { ...(x.media || {}) }; delete m[key]; return { ...x, media: m }; }) }));
      },
      toggleEx(el) {
        const id = planId();
        const pl = store.plan(id); if (!pl) return;
        if (pl.startDate && pl.startDate > store.isoIn(0)) { toast('Планот почнува на ' + pl.startDate.split('-').reverse().join('.') + '. Тогаш се отвора штиклирањето.'); return; }
        const key = el.dataset.val; const [di] = key.split(':').map(Number);
        const now = !pl.done[key];
        const done = { ...pl.done, [key]: now };
        if (!now) delete done[key];
        const day = pl.days[di];
        const dayAll = day.every((_, j) => done[di + ':' + j]);
        const wasDayAll = day.every((_, j) => pl.done[di + ':' + j]);
        const totalDone = Object.keys(done).filter((k) => done[k]).length;
        const totalAll = pl.days.reduce((n, d) => n + d.length, 0);
        const cname = store.clientName(pl.clientId);
        if (now) {
          store.markStep('planCheck');
          if (totalDone === totalAll) { store.notify(pl.trainerId, cname + ' го заврши целиот план „' + pl.name + '“', '#/t/plan/' + pl.id); toast('Планот е завршен. Браво!'); }
          else if (dayAll && !wasDayAll) { store.notify(pl.trainerId, cname + ' го заврши: ' + planKindOf(pl).dayWord + ' ' + (di + 1) + ' од „' + pl.name + '“', '#/t/plan/' + pl.id); toast(planKindOf(pl).dayWord + ' ' + (di + 1) + ' е готов!'); }
        }
        store.set((st) => ({ ...st, sentPlans: st.sentPlans.map((x) => (x.id === id ? { ...x, done } : x)) }));
      },
    } : {},
  };
}

export const clientPlan = planPage('client');
export const trainerPlan = planPage('trainer');
export { DAY_NAMES, initials };
