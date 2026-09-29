// План за тренинг: клиентот го отвора и штиклира вежби, тренерот гледа што е одработено.
import * as store from '../store.js';
import { DAY_NAMES } from '../data.js';
import { esc, initials, appLayout, toast } from '../ui.js';
import { planKindOf } from '../kinds.js';

function notFoundPage(role) {
  return appLayout(role, 'home', '<div class="empty">Овој план не постои или е избришан.<br><a class="btn btn-accent btn-sm" style="margin-top:12px" href="' + (role === 'trainer' ? '#/t/home' : '#/c/home') + '">Назад</a></div>');
}

function exerciseRow(r, dayIdx, exIdx, done, interactive, pk) {
  const key = dayIdx + ':' + exIdx;
  const detail = pk.detail(r);
  const inner = '<span class="ex-check" aria-hidden="true">' + (done ? '✓' : '') + '</span><span class="grow"><span class="strong block">' + esc(r[0]) + '</span><span class="muted small">' + esc(detail) + '</span></span>' +
    (r[4] ? '<span class="chip-s">▶ снимка</span>' : '');
  return interactive
    ? '<button type="button" class="ex' + (done ? ' done' : '') + '" role="checkbox" aria-checked="' + done + '" data-act="toggleEx" data-val="' + key + '">' + inner + '</button>'
    : '<div class="ex static' + (done ? ' done' : '') + '">' + inner + '</div>';
}

function planPage(role) {
  const interactive = role === 'client';
  return {
    title: 'План',
    render(p) {
      const pl = store.plan(p.id);
      if (!pl) return notFoundPage(role);
      const s = store.get();
      if (interactive && pl.clientId !== s.client.id) return notFoundPage(role);
      const pg = store.planProgress(pl); const pk = planKindOf(pl);
      const pct = Math.round((pg.done / Math.max(pg.total, 1)) * 100);
      const trainer = store.trainer(pl.trainerId);
      const back = interactive ? '#/c/messages/' + pl.trainerId : '#/t/clients/' + pl.clientId;
      const who = interactive ? 'од ' + esc(trainer.name) : 'за ' + esc(store.clientName(pl.clientId));
      const days = pl.days.map((d, i) => {
        const dn = d.filter((_, j) => pl.done[i + ':' + j]).length;
        return '<section class="card stack-s"><div class="row gap"><h2 class="eyebrow muted grow">' + pk.dayWord.toUpperCase() + ' ' + (i + 1) + '</h2><span class="tag ' + (dn === d.length ? 'tag-accent' : 'tag-outline') + '">' + dn + '/' + d.length + (dn === d.length ? ' ✓' : '') + '</span></div>' +
          d.map((r, j) => exerciseRow(r, i, j, !!pl.done[i + ':' + j], interactive, pk)).join('') + '</section>';
      }).join('');
      const finished = pg.done === pg.total && pg.total > 0;
      const content = '<div class="page-head"><div class="row gap-s"><a class="btn btn-ghost btn-icon" href="' + back + '" aria-label="Назад">←</a><div><h1 class="display-s">' + esc(pl.name) + '</h1><div class="muted small">' + who + '</div></div></div></div>' +
        '<section class="card accent-card"><div class="eyebrow">' + (interactive ? 'ТВОЈ НАПРЕДОК' : 'ОДРАБОТЕНО') + '</div><div class="display-xs">' + pg.done + ' од ' + pg.total + ' ' + pk.item + '</div><div class="bar dark"><div style="width:' + pct + '%"></div></div>' +
        '<div class="small strong">' + (finished ? 'Планот е завршен. Браво!' : interactive ? pk.tick : 'Клиентот штиклира кога ќе заврши ставка.') + '</div></section>' +
        '<div class="plan-days">' + days + '</div>' +
        (interactive ? '<div class="row gap-s wrap"><a class="btn btn-ghost" href="#/c/messages/' + pl.trainerId + '">Прашај го тренерот</a></div>' : '<div class="row gap-s wrap"><a class="btn btn-ghost" href="#/t/messages/' + pl.clientId + '">Прати порака</a><a class="btn btn-ghost" href="#/t/clients/' + pl.clientId + '">Напредок на клиентот</a></div>');
      return appLayout(role, interactive ? 'messages' : 'clients', content);
    },
    actions: interactive ? {
      toggleEx(el) {
        const id = location.hash.split('/').pop().split('?')[0];
        const pl = store.plan(id); if (!pl) return;
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
