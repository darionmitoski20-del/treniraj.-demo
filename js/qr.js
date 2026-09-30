// QR-код без мрежа: користи библиотека од js/vendor (MIT).
import qrcode from './vendor/qrcode.mjs';

function make(text) { const q = qrcode(0, 'M'); q.addData(text); q.make(); return q; }

// SVG што се вклопува во ширината на контејнерот (бела подлога за скенирање)
export function qrSvg(text) {
  const q = make(text); const n = q.getModuleCount(); const m = 3; let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
  const size = n + m * 2;
  return '<svg class="qr" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="QR-код" shape-rendering="crispEdges"><rect width="' + size + '" height="' + size + '" fill="#fff"/><path d="' + d + '" fill="#111"/></svg>';
}

// PNG (data URL) за печатење на постер или визит-картичка
export function qrPng(text, px) {
  const q = make(text); const n = q.getModuleCount(); const m = 3; const cell = Math.max(4, Math.floor((px || 640) / (n + m * 2)));
  const c = document.createElement('canvas'); c.width = c.height = cell * (n + m * 2);
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#111';
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) g.fillRect((k + m) * cell, (r + m) * cell, cell, cell);
  return c.toDataURL('image/png');
}
