// Контакт и врски на тренер: чистење на внесот и правење безбедни линкови.
// Секој линк се гради само од проверена вредност, никогаш директно од внесениот текст.

const MK = '389';

// 070 111 222 -> +38970111222
export function phoneIntl(raw) {
  const s = String(raw || '').trim();
  const d = s.replace(/\D/g, '');
  if (!d) return '';
  if (s.startsWith('+')) return '+' + d;
  if (d.startsWith('00')) return '+' + d.slice(2);
  if (d.startsWith('0')) return '+' + MK + d.slice(1);
  if (d.startsWith(MK)) return '+' + d;
  return '+' + MK + d;
}

// Ако внесеното е линк до дадена страница, ја враќа патеката по доменот; инаку null (значи: не е линк).
function afterHost(v, hosts) {
  const m = v.match(new RegExp('^(?:https?:\\/\\/)?(?:www\\.|m\\.|web\\.|mobile\\.)?(?:' + hosts + ')(?:\\/(.*))?$', 'i'));
  return m ? (m[1] || '') : null;
}

// Проверува еден внес. Враќа { v } (чиста вредност, може празна) или { err } (порака за корисникот).
export function clean(kind, raw) {
  const v = String(raw ?? '').trim();
  if (!v) return { v: '' };
  const bad = (err) => ({ err });
  if (kind === 'phone') {
    return /^\+?\d{6,15}$/.test(v.replace(/[\s().\-/]/g, '')) ? { v: v.replace(/\s+/g, ' ') } : bad('Телефонот не изгледа правилно (на пр. 070 123 456).');
  }
  if (kind === 'email') {
    return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(v) ? { v } : bad('Е-поштата не изгледа правилно.');
  }
  if (kind === 'instagram' || kind === 'tiktok') {
    const ig = kind === 'instagram';
    const p = afterHost(v, ig ? 'instagram\\.com|instagr\\.am' : 'tiktok\\.com');
    const h = (p === null ? v : p).split(/[/?#]/)[0].replace(/^@/, '');
    return (ig ? /^[A-Za-z0-9._]{1,30}$/ : /^[A-Za-z0-9._]{1,24}$/).test(h) ? { v: h } : bad((ig ? 'Instagram' : 'TikTok') + ': внеси корисничко име (на пр. ime.prezime) или линк до профилот.');
  }
  if (kind === 'facebook') {
    const p = afterHost(v, 'facebook\\.com|fb\\.com|fb\\.me');
    let s = (p === null ? v : p).replace(/^@/, '');
    const id = s.match(/^profile\.php\?(?:.*&)?id=(\d{5,20})/i);
    if (id) return { v: 'profile.php?id=' + id[1] };
    s = s.split(/[?#]/)[0].replace(/\/+$/, '');
    return /^[A-Za-z0-9._\-]+(\/[A-Za-z0-9._%\-]+){0,3}$/.test(s) && !s.includes('..') ? { v: s } : bad('Facebook: стави линк до страната или профилот (facebook.com/ime).');
  }
  if (kind === 'youtube') {
    const p = afterHost(v, 'youtube\\.com');
    let s = (p === null ? v : p).split(/[?#]/)[0].replace(/\/+$/, '');
    if (p === null && /^@?[A-Za-z0-9._\-]+$/.test(s)) s = '@' + s.replace(/^@/, '');
    return /^(@[A-Za-z0-9._\-]{2,40}|(c|channel|user)\/[A-Za-z0-9._%\-]{2,60})$/.test(s) ? { v: s } : bad('YouTube: стави линк до каналот (youtube.com/@ime) или само @ime.');
  }
  if (kind === 'website') {
    const s = v.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    return /^(?:[\p{L}\p{N}\-]+\.)+\p{L}{2,}(?::\d{2,5})?(?:\/[^\s"'<>]*)?$/iu.test(s) ? { v: s } : bad('Веб-страната не изгледа правилно (на пр. primer.mk).');
  }
  return { v };
}

export const KINDS_ORDER = ['phone', 'email', 'instagram', 'facebook', 'tiktok', 'youtube', 'website'];

// Што е внесено и валидно (секоја вредност повторно се проверува, па и стари/изменети податоци се безбедни)
export function filled(c) {
  c = c || {};
  const out = {};
  KINDS_ORDER.forEach((k) => { const r = clean(k, c[k]); if (!r.err && r.v) out[k] = r.v; });
  if (out.phone) { if (c.viber) out.viber = true; if (c.whatsapp) out.whatsapp = true; }
  return out;
}

// Линкови за прикажување. priv = телефон и е-пошта (тренерот може да ги даде само на своите клиенти).
export function items(c) {
  const f = filled(c); const out = [];
  const intl = f.phone ? phoneIntl(f.phone) : '';
  if (f.phone) out.push({ k: 'phone', ic: '📞', text: f.phone, href: 'tel:' + intl, priv: true, demo: 'ова повикува' });
  if (f.viber) out.push({ k: 'viber', ic: '💬', text: 'Viber', href: 'viber://chat?number=' + encodeURIComponent(intl), priv: true, demo: 'ова го отвора разговорот на Viber' });
  if (f.whatsapp) out.push({ k: 'whatsapp', ic: '💬', text: 'WhatsApp', href: 'https://wa.me/' + intl.slice(1), priv: true, demo: 'ова го отвора разговорот на WhatsApp' });
  if (f.email) out.push({ k: 'email', ic: '✉️', text: f.email, href: 'mailto:' + f.email, priv: true, demo: 'ова отвора нова е-пошта' });
  if (f.instagram) out.push({ k: 'instagram', ic: '📷', text: 'Instagram', sub: '@' + f.instagram, href: 'https://instagram.com/' + f.instagram, demo: 'ова го отвора Instagram профилот' });
  if (f.facebook) out.push({ k: 'facebook', ic: '👥', text: 'Facebook', href: 'https://facebook.com/' + f.facebook, demo: 'ова ја отвора Facebook страната' });
  if (f.tiktok) out.push({ k: 'tiktok', ic: '🎵', text: 'TikTok', sub: '@' + f.tiktok, href: 'https://tiktok.com/@' + f.tiktok, demo: 'ова го отвора TikTok профилот' });
  if (f.youtube) out.push({ k: 'youtube', ic: '▶️', text: 'YouTube', href: 'https://youtube.com/' + f.youtube, demo: 'ова го отвора YouTube каналот' });
  if (f.website) out.push({ k: 'website', ic: '🌐', text: f.website.replace(/^www\./i, ''), href: 'https://' + f.website, demo: 'ова ја отвора веб-страната' });
  return out;
}
