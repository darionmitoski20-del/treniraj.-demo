// Страни за партнер (бизнис): преглед и уредување на профилот.
import * as store from '../store.js';
import { PARTNER_CATEGORIES, CITIES } from '../data.js';
import { esc, initials, appLayout, toast } from '../ui.js';

const pid = () => store.get().partnerId;
const fmtUntil = (iso) => (iso ? iso.split('-').reverse().join('.') : 'без рок');

function completeness(p) {
  const items = [
    ['Опис на бизнисот', !!p.desc], ['Адреса и локација на мапа', !!(p.address && p.lat) || p.city === 'Онлајн'], ['Работно време', !!p.hours],
    ['Веб-сајт или Instagram', !!(p.website || p.instagram)], ['Телефон или email', !!(p.phone || p.email)], ['Понуда за корисниците (по избор)', !!p.offer, true],
  ];
  const required = items.filter((i) => !i[2]);
  return { items, pct: Math.round((required.filter((i) => i[1]).length / required.length) * 100) };
}

export const home = {
  title: 'Преглед',
  render() {
    const p = store.partner(pid());
    const st = store.get().partnerStats[pid()] || { views: 0, couponViews: 0, clicks: 0 };
    const c = completeness(p);
    const content = '<div class="page-head"><div><div class="muted small strong">ПАРТНЕР</div><h1 class="display-s">' + esc(p.name) + '</h1></div></div>' +
      '<div class="grid-3 stats-row"><div class="card accent-card"><div class="eyebrow">ПРЕГЛЕДИ НА ПРОФИЛОТ</div><div class="display-xs">' + st.views.toLocaleString('mk-MK') + '</div><div class="small strong">овој месец</div></div>' +
        '<div class="card"><div class="eyebrow muted">КЛИКОВИ НА КОНТАКТ</div><div class="display-xs">' + st.clicks + '</div><div class="muted small">веб, Instagram, телефон</div></div>' +
        '<div class="card"><div class="eyebrow muted">ОТВОРЕНИ КОДОВИ</div><div class="display-xs">' + (p.offer ? st.couponViews : '—') + '</div><div class="muted small">' + (p.offer ? esc(p.offer) + ' · важи до ' + fmtUntil(p.offerUntil) : p.expiredOffer ? 'понудата истече' : 'немаш активна понуда') + '</div></div></div>' +
      '<div class="row gap stack-m"><section class="card grow"><div class="row gap"><h2 class="eyebrow muted grow">ПРОФИЛОТ Е ' + c.pct + '% ПОПОЛНЕТ</h2><a class="btn btn-accent btn-sm" href="#/p/profile">Уреди</a></div>' +
        '<div class="bar"><div style="width:' + c.pct + '%"></div></div>' +
        c.items.map(([label, ok, opt]) => '<div class="check-row' + (ok ? ' ok' : '') + '"><span class="gcheck">' + (ok ? '✓' : '') + '</span><span class="grow">' + label + '</span>' + (!ok && !opt ? '<a class="link accent small strong" href="#/p/profile">Додај</a>' : '') + '</div>').join('') + '</section>' +
      '<section class="stack w-320"><a class="card light" href="#/partner/' + p.id + '"><div class="eyebrow">ТАКА ТЕ ГЛЕДААТ КЛИЕНТИТЕ</div><div class="row gap-s"><span class="avatar">' + initials(p.name) + '</span><span><span class="strong block">' + esc(p.name) + '</span><span class="small">' + esc(p.category) + ' · ' + esc(p.city) + '</span></span></div><span class="small strong">Отвори јавен профил →</span></a>' +
        '<div class="card note"><span class="strong">Совет:</span> партнерите со купон добиваат во просек 3 пати повеќе кликови. Купонот не е задолжителен.</div></section></div>';
    return appLayout('partner', 'home', content);
  },
};

let draftPin = null;
export const profile = {
  title: 'Уреди профил',
  render() {
    const p = store.partner(pid());
    draftPin = draftPin || (p.lat ? { lat: p.lat, lng: p.lng } : null);
    const opt = (arr, cur) => arr.map((o) => '<option' + (o === cur ? ' selected' : '') + '>' + esc(o) + '</option>').join('');
    const field = (label, name, val, attrs = '') => '<label class="field">' + label + '<input name="' + name + '" value="' + esc(val || '') + '" ' + attrs + '></label>';
    const content = '<div class="page-head"><h1 class="display-s">Уреди профил</h1><a class="btn btn-ghost btn-sm" href="#/partner/' + p.id + '">Види јавно</a></div>' +
      '<form class="stack form-page" data-submit="save">' +
      '<section class="card stack-s"><h2 class="eyebrow muted">ОСНОВНО</h2>' +
        '<div class="row gap"><button type="button" class="upload square" data-act="pickPhoto" data-val="partner">+<br>Лого / слика</button><button type="button" class="upload grow" data-act="upload">+ Фотографии од просторот</button></div>' +
        field('Име на бизнисот', 'name', p.name, 'required') +
        '<label class="field">Категорија<select name="category">' + opt(PARTNER_CATEGORIES, p.category) + '</select></label>' +
        '<label class="field">Опис<textarea name="desc" rows="3" maxlength="300" placeholder="Што нудите, по што сте различни…">' + esc(p.desc || '') + '</textarea></label></section>' +
      '<section class="card stack-s"><h2 class="eyebrow muted">ЛОКАЦИЈА</h2>' +
        '<label class="field">Град<select name="city">' + opt(CITIES, p.city) + '</select></label>' +
        field('Адреса', 'address', p.address, 'autocomplete="street-address" placeholder="ул. и број"') +
        field('Работно време', 'hours', p.hours, 'placeholder="Пон–Пет 08–20"') +
        '<div class="field">Точка на мапа<span class="muted small nocaps">Допри на мапата за да ја поставиш локацијата.</span></div><div id="pickmap" class="pmap"></div></section>' +
      '<section class="card stack-s"><h2 class="eyebrow muted">КОНТАКТ И ЛИНКОВИ</h2>' +
        field('Веб-сајт', 'website', p.website, 'inputmode="url" autocomplete="url" placeholder="primer.mk"') +
        field('Instagram', 'instagram', p.instagram, 'placeholder="корисничко име, без @"') +
        field('Телефон', 'phone', p.phone, 'type="tel" inputmode="tel" autocomplete="tel" placeholder="07x xxx xxx"') +
        field('Email', 'email', p.email, 'type="email" inputmode="email" autocomplete="email"') + '</section>' +
      '<section class="card stack-s"><h2 class="eyebrow muted">ПОНУДА ЗА НОВИ КЛИЕНТИ</h2>' +
        (p.expiredOffer ? '<div class="card note">Претходната понуда („' + esc(p.expiredOffer) + '“) истече и е исклучена. Постави нова.</div>' : '') +
        '<label class="toggle-row"><span class="grow">Имам активна понуда</span><input type="checkbox" name="hasOffer" data-change="toggleOffer"' + (p.offer ? ' checked' : '') + '></label>' +
        '<div id="offer-fields" class="stack-s"' + (p.offer ? '' : ' hidden') + '>' +
          '<label class="field">Тип на понуда<select name="offerType" data-change="offerType"><option value="discount"' + (p.offerType !== 'trial' ? ' selected' : '') + '>Попуст во % (купон)</option><option value="trial"' + (p.offerType === 'trial' ? ' selected' : '') + '>Пробен ден / тренинг</option></select></label>' +
          '<div id="offer-amt"' + (p.offerType === 'trial' ? ' hidden' : '') + '>' + field('Попуст (%)', 'offerAmount', p.offerAmount, 'type="number" inputmode="numeric" min="1" max="90" placeholder="20"') + '</div>' +
          field('На што важи (по избор)', 'offerNote', p.offerNote, 'placeholder="на првиот месец членарина"') +
          field('Код што го кажува клиентот на каса', 'code', p.code, 'placeholder="TRENIRAJ20" autocapitalize="characters"') +
          field('Важи до', 'offerUntil', p.offerUntil, 'type="date" min="' + store.isoIn(0) + '"') +
          '<button type="button" class="upload" data-act="pickPhoto" data-val="offer">' + (p.offerImage ? '✓ Сликата е додадена · промени' : '+ Слика за понудата') + '</button>' +
        '</div>' +
        '<p class="muted small">Една активна понуда одеднаш. Важи еднаш по клиент. Кога ќе истече, се исклучува сама и добиваш известување.</p></section>' +
      '<div class="save-bar"><button type="submit" class="btn btn-accent btn-lg">ЗАЧУВАЈ ПРОМЕНИ</button></div></form>';
    return appLayout('partner', 'edit', content);
  },
  mount() {
    const el = document.getElementById('pickmap');
    if (!el) return;
    if (!window.L) { el.innerHTML = '<div class="muted small pad">Мапата не можеше да се вчита.</div>'; return; }
    const L = window.L;
    const start = draftPin || { lat: 41.9965, lng: 21.4314 };
    const m = L.map(el, { scrollWheelZoom: false }).setView([start.lat, start.lng], draftPin ? 15 : 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap, © CARTO', maxZoom: 19 }).addTo(m);
    const icon = L.divIcon({ className: '', html: '<span class="pin on">●</span>', iconSize: [40, 40], iconAnchor: [20, 40] });
    let marker = draftPin ? L.marker([draftPin.lat, draftPin.lng], { icon }).addTo(m) : null;
    m.on('click', (e) => {
      draftPin = { lat: +e.latlng.lat.toFixed(5), lng: +e.latlng.lng.toFixed(5) };
      if (marker) marker.setLatLng(e.latlng); else marker = L.marker(e.latlng, { icon }).addTo(m);
    });
  },
  actions: {
    upload() { toast('Во вистинската апликација тука прикачуваш слики.'); },
    offerType(el) { const f = document.getElementById('offer-amt'); if (f) f.hidden = el.value === 'trial'; },
    toggleOffer(el) { const f = document.getElementById('offer-fields'); if (f) f.hidden = !el.checked; },
    save(form) {
      const v = (n) => (form[n] ? form[n].value.trim() : '');
      const on = form.hasOffer.checked;
      if (on && !v('offerUntil')) { toast('Внеси рок до кога важи понудата.'); return; }
      if (on && form.offerType.value === 'discount' && !(Number(v('offerAmount')) > 0)) { toast('Внеси колкав е попустот (%).'); return; }
      const patch = { name: v('name') || store.partner(pid()).name, category: v('category'), desc: v('desc'), city: v('city'), address: v('address'), hours: v('hours'),
        website: v('website').replace(/^https?:\/\//, ''), instagram: v('instagram').replace(/^@/, ''), phone: v('phone'), email: v('email'),
        offerType: on ? form.offerType.value : '', offerAmount: on ? v('offerAmount') : '', offerNote: on ? v('offerNote') : '', offerUntil: on ? v('offerUntil') : '',
        offerNotified: null, code: on ? (v('code') || 'TRENIRAJ').toUpperCase() : '' };
      if (draftPin) { patch.lat = draftPin.lat; patch.lng = draftPin.lng; }
      store.set((s) => ({ ...s, partnerOverrides: { ...s.partnerOverrides, [s.partnerId]: { ...(s.partnerOverrides[s.partnerId] || {}), ...patch } } }));
      toast('Зачувано! Клиентите веќе ги гледаат промените.');
    },
  },
};
