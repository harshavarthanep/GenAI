/* GenAI Mastery · core app (no build step). Content lives in /content/*.txt */
'use strict';
const C = window.CONFIG;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const store = {
  get(k, d) { try { const raw = localStorage.getItem('gm.' + k); if (raw === null) return d; const v = JSON.parse(raw); if (v === null || v === undefined) return d;
    if (d !== undefined && d !== null && (typeof v !== typeof d || Array.isArray(v) !== Array.isArray(d))) return d; return v; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('gm.' + k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem('gm.' + k); } catch {} }
};
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function inl(s) {
  return esc(s).split(/(`[^`]+`)/).map(p => p.length > 1 && p[0] === '`' && p.at(-1) === '`'
    ? `<code>${p.slice(1, -1)}</code>` : p.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')).join('');
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2200); }
async function copyText(t) { try { await navigator.clipboard.writeText(t); toast('Copied to clipboard'); } catch { modal('Copy this', `<textarea readonly rows="6" onfocus="this.select()" style="font-family:'JetBrains Mono';font-size:13px">${esc(t)}</textarea><p class="small muted" style="margin-top:8px">Your browser blocked automatic copying. Select the text and copy it manually.</p>`); setTimeout(() => $('#modb textarea')?.select(), 50); } }
const LOADED = {};
function loadScript(src, ms = 20000) { return new Promise((res, rej) => { if (LOADED[src]) return res(); const s = document.createElement('script'); s.src = src;
  const t = setTimeout(() => { s.remove(); rej(new Error('Timed out loading ' + src)); }, ms);
  s.onload = () => { clearTimeout(t); LOADED[src] = 1; res(); }; s.onerror = () => { clearTimeout(t); s.remove(); rej(new Error('Could not load ' + src)); }; document.head.appendChild(s); }); }
const withTimeout = (p, ms, msg) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms))]);

/* ---------------- icons (original line icons, 24×24) ---------------- */
const ICON = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>', monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>', database: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.5"/><path d="M4.5 5.5v13c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-13M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5"/>',
  sigma: '<path d="M17 5H7l6 7-6 7h10"/>', table: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M3.5 14.5h17M9.5 9.5v10"/>',
  chart: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>', cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  brain: '<path d="M9.5 4A3 3 0 0 0 6.6 6.3 3 3 0 0 0 4.5 11a3 3 0 0 0 1.8 4.9A3 3 0 0 0 9.5 20c.8 0 1.5-.6 1.5-1.5V5.5C11 4.7 10.3 4 9.5 4zM14.5 4a3 3 0 0 1 2.9 2.3A3 3 0 0 1 19.5 11a3 3 0 0 1-1.8 4.9A3 3 0 0 1 14.5 20c-.8 0-1.5-.6-1.5-1.5V5.5c0-.8.7-1.5 1.5-1.5z"/>',
  message: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>', layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12.5 9 5 9-5M3 17l9 5 9-5"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="m14 6 3 3"/>', plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
  magnet: '<path d="M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4z"/><path d="M6 8h4M14 8h4"/>', library: '<path d="M4 4h4v16H4zM10 4h4v16h-4z"/><path d="m16 5 3.4-.9 2.6 15.4-3.4.9z"/>',
  boxes: '<path d="M3 7.5 8 5l5 2.5v5.5L8 15.5 3 13zM11 13.5l5-2.5 5 2.5V19l-5 2.5-5-2.5z"/>', bot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4M9 16h6"/><circle cx="9" cy="12.5" r=".8"/><circle cx="15" cy="12.5" r=".8"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>', rocket: '<path d="M12 3c3.6 1.8 5.5 5.4 5.5 9.5L15 15H9l-2.5-2.5C6.5 8.4 8.4 4.8 12 3z"/><circle cx="12" cy="9.5" r="1.8"/><path d="M9 15l-1.5 4.5L12 18l4.5 1.5L15 15"/>',
  shield: '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.6 7.5 9 4.3-1.4 7.5-4.5 7.5-9V6z"/><path d="m9 12 2 2 4-4"/>', home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
  zap: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>', book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5V5.5M20 18v3H6.5"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>', file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>', award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
  newspaper: '<path d="M4 5h13v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v10a2 2 0 0 1-2 2M8 9h5M8 13h5M8 17h3"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>', share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', check: '<path d="m5 12 5 5 9-10"/>',
  chev: '<path d="m9 6 6 6-6 6"/>', back: '<path d="m15 6-6 6 6 6"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', play: '<path d="M7 5v14l12-7z"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', alert: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.5 1 1.2 1 2.1h5c0-.9.3-1.6 1-2.1A6 6 0 0 0 12 3z"/>', ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/>',
  flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.5 15h9"/>', trend: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>', print: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>',
  dot: '<circle cx="12" cy="12" r="3"/>'
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ICON.dot}</svg>`;

/* ---------------- content parser ---------------- */
function parse(text) {
  const mods = []; let mod = null, cpt = null; const L = text.replace(/\r/g, '').split('\n');
  const tgt = () => (cpt ? cpt.parts : mod.items);
  const push = (type, data) => { const arr = tgt(); const last = arr[arr.length - 1];
    if (['points', 'rows', 'links'].includes(type) && last && last.type === type) last.list.push(data); else arr.push(type === 'points' || type === 'rows' || type === 'links' ? { type, list: [data] } : data); };
  for (let i = 0; i < L.length; i++) {
    const ln = L[i], s = ln.trim();
    if (!s || (s.startsWith('#') && !s.startsWith('##') && !s.startsWith('###'))) { if (s === '' ) continue; else continue; }
    if (s.startsWith('### ')) { const h = s.slice(4); const j = h.lastIndexOf('|'); const title = j > 0 ? h.slice(0, j).trim() : h.trim(); const lv = j > 0 ? h.slice(j + 1).trim() : '';
      cpt = { type: 'concept', title, level: lv, parts: [] }; mod.items.push(cpt); continue; }
    if (s.startsWith('## ')) { const [id, icon, title, tag] = s.slice(3).split('|').map(x => x.trim());
      mod = { id, icon, title, tag: tag || '', meta: {}, why: '', learn: [], items: [], practice: [], projects: [], quiz: [], iqs: [], mcq: [], countries: [] }; mods.push(mod); cpt = null; continue; }
    if (!mod) continue;
    if (s === '---') { cpt = null; continue; }
    if (s.startsWith('```')) { const lang = s.slice(3).trim() || 'text'; const buf = []; i++;
      while (i < L.length && !L[i].trim().startsWith('```')) buf.push(L[i++]);
      tgt().push({ type: lang === 'out' ? 'out' : 'code', lang, text: buf.join('\n') }); continue; }
    if (s === 'HTML:') { const buf = []; i++; while (i < L.length && L[i].trim() !== 'ENDHTML') buf.push(L[i++]); tgt().push({ type: 'html', text: buf.join('\n') }); continue; }
    if (s.startsWith('TABLE:') || s.startsWith('QR:')) { const kind = s.startsWith('QR:') ? 'qr' : 'table'; if (kind === 'qr') cpt = null;
      const cap = s.slice(s.indexOf(':') + 1).trim(); const rows = [];
      while (i + 1 < L.length && L[i + 1].trim().startsWith('|')) rows.push(L[++i].trim().replace(/^\||\|$/g, '').split(' | ').map(x => x.trim()));
      tgt().push({ type: kind, cap, rows }); continue; }
    const m = s.match(/^([A-Z]+):\s*(.*)$/); if (!m) continue; const [, k, v] = m;
    switch (k) {
      case 'WHY': mod.why = v; break; case 'LEARN': mod.learn = v.split(';').map(x => x.trim()); break;
      case 'META': { const [a, b] = v.split('='); mod.meta[a.trim()] = (b || '').trim(); break; }
      case 'PRACTICE': cpt = null; mod.practice.push(...v.split(';').map(x => x.trim())); break;
      case 'PROJECT': { cpt = null; const [t, d] = v.split('::'); mod.projects.push([t.trim(), (d || '').trim()]); break; }
      case 'QUIZ': { cpt = null; const [q, a] = v.split('=>'); mod.quiz.push([q.trim(), (a || '').trim()]); break; }
      case 'IQ': { const [q, a, e] = v.split('=>').map(x => x.trim()); const o = { type: 'iq', q, a, e }; mod.iqs.push(o); tgt().push(o); break; }
      case 'MCQ': { const [body, ans, ex] = v.split('=>'); const opts = body.split(';;').map(x => x.trim()); mod.mcq.push({ q: opts.shift(), opts, ans: +ans, ex: (ex || '').trim() }); break; }
      case 'COUNTRY': { const f = v.split(';;').map(x => x.trim()); const n = i => Math.max(0, Math.min(10, +f[i] || 0));
        mod.countries.push({ name: f[0], code: f[1], hubs: f[2], demand: n(3), safety: n(4), security: n(5), visa: n(6), gpi: f[7], english: f[8], route: f[9], url: f[10],
          portals: (f[11] || '').split(',').map(p => p.split('=').map(x => x.trim())).filter(p => p[1]), notes: f[12] || '' }); break; }
      case 'POINT': push('points', v); break;
      case 'ROW': { const [a, b] = v.split('::'); push('rows', [a.trim(), (b || '').trim()]); break; }
      case 'LINK': { const [n, u, d, t] = v.split('::').map(x => x.trim()); push('links', { n, u, d, t }); break; }
      default: if (['S', 'E', 'TIP', 'WARN', 'NOTE', 'FLOW'].includes(k)) tgt().push({ type: k, text: v });
    }
  }
  return mods;
}

/* ---------------- syntax highlight ---------------- */
const PYK = 'def|class|return|if|elif|else|for|while|in|import|from|as|try|except|finally|with|lambda|yield|True|False|None|and|or|not|break|continue|pass|async|await|raise|is|global|nonlocal|self';
const SQK = 'SELECT|FROM|WHERE|AND|OR|NOT|IN|BETWEEN|LIKE|IS|NULL|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|AS|ON|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|DEFAULT|CHECK|INDEX|VIEW|DISTINCT|CASE|WHEN|THEN|ELSE|END|WITH|OVER|PARTITION|ASC|DESC|UNION|ALL|EXISTS|BEGIN|COMMIT|ROLLBACK|INT|INTEGER|VARCHAR|DECIMAL|DATE|BOOLEAN|TEXT|SERIAL|ROWS|PRECEDING|CURRENT|ROW|UNBOUNDED|EXTENSION|IF';
const RULES = {
  python: [['com', '#[^\\n]*'], ['str', '"""[\\s\\S]*?"""|f?"[^"\\n]*"|f?\'[^\'\\n]*\''], ['kw', `\\b(?:${PYK})\\b`], ['num', '\\b\\d+(?:\\.\\d+)?\\b'], ['fn', '\\b[A-Za-z_]\\w*(?=\\()'], ['dec', '@\\w+']],
  sql: [['com', '--[^\\n]*'], ['str', "'[^'\\n]*'"], ['kw', `\\b(?:${SQK})\\b`], ['num', '\\b\\d+(?:\\.\\d+)?\\b'], ['fn', '\\b[A-Za-z_]\\w*(?=\\()']],
  bash: [['com', '#[^\\n]*'], ['str', '"[^"\\n]*"|\'[^\'\\n]*\''], ['kw', '\\b(?:pip|python|cd|mkdir|git|docker|ollama|curl|uvicorn|streamlit|ls|dir|source|export|npm|grep|find|chmod|ssh|kill|cat)\\b']],
  json: [['str', '"[^"\\n]*"'], ['kw', '\\b(?:true|false|null)\\b'], ['num', '-?\\b\\d+(?:\\.\\d+)?\\b']]
};
RULES.docker = [['com', '#[^\\n]*'], ['kw', '\\b(?:FROM|WORKDIR|COPY|RUN|CMD|EXPOSE|ENV|ARG|ENTRYPOINT)\\b'], ['str', '"[^"\\n]*"']];
function hl(code, lang) {
  const r = RULES[lang]; if (!r) return esc(code);
  const re = new RegExp(r.map(([n, p]) => `(?<${n}>${p})`).join('|'), lang === 'sql' ? 'gi' : 'g'); let out = '', last = 0;
  for (const m of code.matchAll(re)) { const g = Object.keys(m.groups).find(k => m.groups[k] !== undefined); out += esc(code.slice(last, m.index)) + `<span class="t-${g}">${esc(m[0])}</span>`; last = m.index + m[0].length; }
  return out + esc(code.slice(last));
}

/* ---------------- renderers ---------------- */
const LV = { B: 'Beginner', I: 'Intermediate', A: 'Advanced' };
const LANGN = { python: 'python', sql: 'sql', bash: 'terminal', json: 'json', text: 'prompt', docker: 'dockerfile' };
let CODES = [];
function rTable(p) {
  const [h, ...b] = p.rows; const t = `<div class="tw"><table><thead><tr>${h.map(c => `<th>${inl(c)}</th>`).join('')}</tr></thead><tbody>${b.map(r => `<tr>${r.map(c => `<td>${inl(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  return p.type === 'qr' ? `<div class="qr"><div class="tcap">Quick reference · ${inl(p.cap)}</div>${t}</div>` : `<div><div class="tcap">${inl(p.cap)}</div>${t}</div>`;
}
function rPart(p) {
  switch (p.type) {
    case 'S': return `<div class="co s"><div class="lab-h">${ic('message')}In simple words</div><p>${inl(p.text)}</p></div>`;
    case 'E': return `<div class="co e"><div class="lab-h">${ic('globe')}Real-life example</div><p>${inl(p.text)}</p></div>`;
    case 'TIP': return `<div class="co tip"><div class="lab-h">${ic('bulb')}Pro tip</div><p>${inl(p.text)}</p></div>`;
    case 'WARN': return `<div class="co warn"><div class="lab-h">${ic('alert')}Watch out</div><p>${inl(p.text)}</p></div>`;
    case 'NOTE': return `<div class="co note"><div class="lab-h">${ic('info')}Good to know</div><p>${inl(p.text)}</p></div>`;
    case 'FLOW': return `<div class="flow">${p.text.split(' > ').map(x => `<div class="fs">${inl(x.trim())}</div>`).join('')}</div>`;
    case 'code': { const id = CODES.push({ lang: p.lang, text: p.text }) - 1; const run = ['python', 'sql'].includes(p.lang) ? `<button data-run="${id}">${ic('play')}Run in lab</button>` : '';
      return `<div class="code"><div class="ch"><span class="dots"><i></i><i></i><i></i></span>${LANGN[p.lang] || p.lang}<span class="sp"></span>${run}<button data-copy="${id}">${ic('copy')}Copy</button></div><pre><code>${hl(p.text, p.lang)}</code></pre></div>`; }
    case 'out': return `<div class="out"><div class="lab-h">${ic('check')}Output</div><pre>${esc(p.text)}</pre></div>`;
    case 'table': case 'qr': return rTable(p);
    case 'html': return p.text;
    case 'points': return `<ul class="pts">${p.list.map(x => `<li>${inl(x)}</li>`).join('')}</ul>`;
    case 'rows': return `<div class="tw"><table class="kv"><tbody>${p.list.map(([a, b]) => `<tr><td>${inl(a)}</td><td>${inl(b)}</td></tr>`).join('')}</tbody></table></div>`;
    case 'links': return `<div class="links">${p.list.map(l => `<a class="lk" href="${esc(l.u)}" target="_blank" rel="noopener"><b>${esc(l.n)}${ic('ext')}</b><span>${esc(l.d)}</span>${l.t ? `<span class="tag">${esc(l.t)}</span>` : ''}</a>`).join('')}</div>`;
    case 'iq': return rIQ(p);
  }
  return '';
}
function rIQ(p, open = false) {
  return `<details class="iq"${open ? ' open' : ''}><summary><span class="q">Q</span><span>${inl(p.q)}</span>${ic('chev')}</summary><div class="iqb">
  <div class="pro"><div class="lab-h">${ic('briefcase')}Interview answer</div>${inl(p.a)}</div>${p.e ? `<div class="eli"><div class="lab-h">${ic('message')}Simple version</div>${inl(p.e)}</div>` : ''}</div></details>`;
}
function rParts(parts) {
  let out = ''; for (let k = 0; k < parts.length; k++) {
    if (parts[k].type === 'S' && parts[k + 1]?.type === 'E') { out += `<div class="pair">${rPart(parts[k])}${rPart(parts[k + 1])}</div>`; k++; } else out += rPart(parts[k]);
  } return out;
}
function rConcept(c, id) {
  return `<article class="cpt" id="${id}"><header><span class="cid">${id.replace('c-', '')}</span><h3>${inl(c.title)}</h3>${c.level ? `<span class="lv ${c.level}">${LV[c.level] || ''}</span>` : ''}</header><div class="cb">${rParts(c.parts)}</div></article>`;
}
function rModuleBody(m, prefix) {
  let n = 0, html = '';
  for (const it of m.items) html += it.type === 'concept' ? rConcept(it, `c-${prefix}.${++n}`) : (it.type === 'iq' ? '' : rPart(it));
  return html;
}
function rWrap(m, key) {
  const chk = store.get('chk', {}); let h = '';
  if (m.iqs.length) h += `<div class="wrap"><h3>Interview questions</h3>${m.iqs.map(q => rIQ(q)).join('')}</div>`;
  if (m.practice.length || m.projects.length || m.quiz.length) {
    h += `<div class="wrap"><h3>Wrap-up</h3>`;
    if (m.practice.length) h += `<div class="lab-h">${ic('target')}Practice tasks</div><ul class="chk">${m.practice.map((p, i) => { const k = `${key}:p${i}`; return `<li><input type="checkbox" data-chk="${k}" ${chk[k] ? 'checked' : ''} aria-label="done"><span>${inl(p)}</span></li>`; }).join('')}</ul>`;
    if (m.projects.length) h += m.projects.map(([t, d]) => `<div class="co note" style="margin-top:12px"><div class="lab-h">${ic('boxes')}Mini project · ${inl(t)}</div><p>${inl(d)}</p></div>`).join('');
    if (m.quiz.length) h += `<div class="lab-h" style="margin-top:14px">${ic('sparkles')}Quick quiz · tap a card to reveal</div><div class="flash">${m.quiz.map(([q, a]) => `<div class="card-f" tabindex="0"><div>${inl(q)}</div><div class="a">${inl(a)}</div><div class="hint">tap to reveal</div></div>`).join('')}</div>`;
    h += '</div>';
  }
  return h;
}

/* ---------------- data & index ---------------- */
const FILES = ['quiz', 'complete', 'fast', 'cheats', 'interview', 'career', 'next', 'resources', 'news', 'exam', 'projects'];
const D = {}; let INDEX = [];
const TRACKS = {
  fast: { name: 'Fast Track', icon: 'zap', file: 'fast', blurb: '12 focused sprints, about 6 weeks. Only the must-know concepts, interview Q&A with two-level answers, and job-ready skills.', projects: 2 },
  complete: { name: 'Complete Track', icon: 'layers', file: 'complete', blurb: '20 in-depth modules and 276 concepts from absolute zero to expert, with real-life examples, code, quizzes and projects.', projects: 4 }
};
function textOf(parts) { return parts.map(p => p.text || (p.list ? p.list.map(x => typeof x === 'string' ? x : Array.isArray(x) ? x.join(' ') : `${x.n} ${x.d}`).join(' ') : '') || (p.rows ? p.rows.flat().join(' ') : '') || (p.q ? `${p.q} ${p.a} ${p.e}` : '')).join(' '); }
function buildIndex() {
  INDEX = [];
  for (const [tk, t] of Object.entries(TRACKS)) for (const m of D[t.file]) { let n = 0;
    for (const it of m.items) if (it.type === 'concept') { n++; INDEX.push({ t: it.title, x: textOf(it.parts), r: `#/m/${tk}/${m.id}`, a: `c-${m.id}.${n}`, c: `${t.name} › ${m.title}` }); }
    for (const q of m.iqs) INDEX.push({ t: q.q, x: `${q.a} ${q.e}`, r: `#/m/${tk}/${m.id}`, c: `${t.name} › ${m.title} › interview` }); }
  for (const s of D.cheats) for (const it of s.items) if (it.type === 'concept') INDEX.push({ t: `${s.title}: ${it.title}`, x: textOf(it.parts), r: `#/sheet/${s.id}`, c: 'Cheat sheets' });
  for (const c of D.interview) for (const q of c.iqs) INDEX.push({ t: q.q, x: `${q.a} ${q.e}`, r: `#/interview/${c.id}`, c: `Interview › ${c.title}` });
  for (const c of D.career) INDEX.push({ t: c.title, x: c.items.map(i => i.type === 'concept' ? i.title + ' ' + textOf(i.parts) : textOf([i])).join(' ') + ' ' + (c.countries || []).map(k => `${k.name} ${k.hubs} ${k.route} ${k.notes}`).join(' '), r: `#/career/${c.id}`, c: 'Career' });
  for (const n of D.next) INDEX.push({ t: n.title, x: n.why + ' ' + textOf(n.items), r: '#/next', c: 'Beyond GenAI' });
  const tok = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1);
  const df = {}; INDEX.forEach(d => { d.tk = tok(d.t + ' ' + d.t + ' ' + d.x); d.len = d.tk.length; new Set(d.tk).forEach(w => df[w] = (df[w] || 0) + 1); });
  INDEX.df = df; INDEX.avg = INDEX.reduce((a, d) => a + d.len, 0) / INDEX.length; INDEX.tok = tok;
}
function searchIdx(q, k = 8) {
  if (!INDEX.tok) return []; const qt = INDEX.tok(q); if (!qt.length) return []; const N = INDEX.length;
  return INDEX.map(d => { let s = 0; const tf = {}; d.tk.forEach(w => tf[w] = (tf[w] || 0) + 1);
    for (const w of qt) { const f = tf[w] || 0; if (!f) continue; const idf = Math.log(1 + (N - INDEX.df[w] + .5) / (INDEX.df[w] + .5)); s += idf * f * 2.2 / (f + 1.2 * (.25 + .75 * d.len / INDEX.avg)); }
    if (d.t.toLowerCase().includes(q.toLowerCase())) s += 3; return [s, d]; }).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]).slice(0, k).map(x => x[1]);
}

/* ---------------- progress ---------------- */
const isDone = (tk, id) => !!store.get('done', {})[`${tk}:${id}`];
function setDone(tk, id, v) { const d = store.get('done', {}); if (v) d[`${tk}:${id}`] = Date.now(); else delete d[`${tk}:${id}`]; store.set('done', d); store.set('last', `#/m/${tk}/${id}`); }
const trackPct = tk => { const ms = D[TRACKS[tk].file]; return Math.round(100 * ms.filter(m => isDone(tk, m.id)).length / ms.length); };

/* ---------------- pages ---------------- */
const P = {};
const PRETTY = { learn: 'Learn', 'cheat-sheets': 'Cheat sheets', interview: 'Interview', labs: 'Labs', career: 'Career', 'beyond-genai': 'Explore', resources: 'Resources', projects: 'Projects', news: 'News', exam: 'Assessment', certificate: 'Certificate', verify: 'Certificate', achievements: 'Progress', settings: 'Settings', about: 'About', '404': 'Not found', error: 'Something went wrong', offline: 'Offline' };
const prettyPath = p => { const s = p.replace(/^~\//, '').split('/')[0]; return PRETTY[s] || s.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase()); };
const head = (path, title, lead = '') => `<header class="page-h"><div class="path">${esc(prettyPath(path))}</div><h1>${title}</h1>${lead ? `<p>${lead}</p>` : ''}</header>`;
P.home = () => {
  const n = D.complete.reduce((a, m) => a + m.items.filter(i => i.type === 'concept').length, 0);
  const iqn = INDEX.filter(x => x.c.includes('interview') || x.c.startsWith('Interview')).length;
  const last = store.get('last');
  const tiles = [['#/labs', 'flask', 'Practice labs', 'Run Python, SQL, RAG and prompts right in your browser. No install.'], ['#/sheets', 'file', 'Cheat sheets', `${D.cheats.length} subjects, each downloadable as a PDF.`],
    ['#/interview', 'mic', 'Interview prep', 'Industry answers plus simple versions, and system design.'], ['#/projects', 'boxes', 'Capstone projects', '10 portfolio projects, each doable with free tools.'],
    ['#/career', 'briefcase', 'Career kit', 'Global country ranking, LinkedIn, resume builder and job-search playbook.'], ['#/news', 'newspaper', 'AI news', 'Live feeds of new models, tools and research.'],
    ['#/next', 'trend', 'Beyond GenAI', 'Data engineering, MLOps, cloud, robotics and more.'], ['#/certificate', 'award', 'Certificate', 'Finish a track, pass the exam, earn your certificate.']];
  return `<section class="hero"><div class="term" id="typer"></div><h1>Learn generative AI from zero to expert.</h1>
  <p class="lead">One free, structured place to learn, practise, prepare for interviews and get hired. Pick the Fast Track to get job-ready quickly, or the Complete Track to master everything.</p>
  <div class="row"><a class="btn pri" href="${last || '#/track/fast'}">${ic('play')}${last ? 'Continue learning' : 'Start Fast Track'}</a><a class="btn" href="#/learn">${ic('layers')}Compare tracks</a></div>
  <div class="stats"><div><b>${D.complete.length + D.fast.length}</b><span>modules and sprints</span></div><div><b>${n}+</b><span>concepts explained</span></div><div><b>${iqn}+</b><span>interview questions</span></div><div><b>100%</b><span>free tools only</span></div></div></section>
  ${typeof journeyCard === 'function' ? journeyCard() : ''}<div class="sec-h"><h2>Choose your path</h2></div>${tracksHtml()}
  <div class="sec-h"><h2>Everything in one place</h2></div><div class="grid">${tiles.map(([h, i, t, d]) => `<a class="tile" href="${h}"><span class="ti">${ic(i)}</span><h3>${t}</h3><p>${d}</p></a>`).join('')}</div>`;
};
function tracksHtml() {
  return `<div class="tracks">${Object.entries(TRACKS).map(([k, t]) => { const pct = trackPct(k);
    return `<a class="track ${k === 'fast' ? 'fast' : 'full'}" href="#/track/${k}"><span class="tag ${k === 'fast' ? 'acc' : ''}">${k === 'fast' ? 'job-ready fast' : 'zero to expert'}</span><h3>${ic(t.icon)}${t.name}</h3><p class="muted small">${t.blurb}</p>
    <ul>${k === 'fast' ? '<li>Core concepts only, interview-first</li><li>System design for top companies</li><li>2 projects for the certificate</li>' : '<li>Every topic from basics to advanced</li><li>Real-life examples and runnable code</li><li>4 projects for the certificate</li>'}</ul>
    <div class="row small muted">${pct}% complete</div><div class="bar"><i style="width:${pct}%"></i></div></a>`; }).join('')}</div>`;
}
P.learn = () => head('~/learn', 'Two ways to learn', 'Both tracks share the labs, cheat sheets, interview bank and projects. You can switch any time; your progress is saved on this device.') + tracksHtml() +
  `<div class="sec-h"><h2>Which one is for me?</h2></div><div class="tw"><table><thead><tr><th></th><th>Fast Track</th><th>Complete Track</th></tr></thead><tbody>
  <tr><td>Best for</td><td>Job switchers, interview in 1–2 months</td><td>Beginners who want deep understanding</td></tr><tr><td>Time</td><td>~6 weeks, 1–2 h/day</td><td>~12–16 weeks, 1 h/day</td></tr>
  <tr><td>Style</td><td>Must-know points + interview Q&A</td><td>Story-style lessons, examples, code, quizzes</td></tr><tr><td>Coding level</td><td>Basic Python assumed after Sprint 2</td><td>Starts from "what is a computer"</td></tr>
  <tr><td>Certificate</td><td>12 sprints + exam + 2 projects</td><td>20 modules + exam + 4 projects</td></tr></tbody></table></div>`;
P.track = ([tk]) => { const t = TRACKS[tk]; if (!t) return P.notfound(); const ms = D[t.file];
  return head(`~/learn/${tk}`, t.name, t.blurb) + `<div class="row" style="margin-bottom:16px"><span class="tag acc">${trackPct(tk)}% complete</span><a class="btn sm" href="#/certificate">${ic('award')}Certificate requirements</a></div>
  <div class="mlist">${ms.map(m => `<a class="mrow ${isDone(tk, m.id) ? 'dn' : (store.get('last', '').endsWith('/' + m.id) && store.get('last', '').includes('/' + tk + '/') ? 'cur' : '')}" href="#/m/${tk}/${m.id}"><span class="n">${isDone(tk, m.id) ? ic('check') : esc(m.id.replace('F', ''))}</span><div><h3>${inl(m.title)}</h3><p>${inl(m.tag)}</p></div><span class="tag">${m.meta.time || m.items.filter(i => i.type === 'concept').length + ' concepts'}</span></a>`).join('')}</div>`; };
P.m = ([tk, id]) => { const t = TRACKS[tk]; const ms = D[t?.file] || []; const k = ms.findIndex(m => m.id === id); if (k < 0) return P.notfound(); const m = ms[k];
  store.set('last', `#/m/${tk}/${id}`); const prev = ms[k - 1], next = ms[k + 1], done = isDone(tk, id);
  return `<section class="mhero"><span class="num">${esc(id.replace('F', ''))}</span><span class="mi">${ic(m.icon)}</span><div><div class="row"><span class="tag acc">${t.name}</span>${m.meta.time ? `<span class="tag">${ic('clock')}${esc(m.meta.time)}</span>` : ''}</div><h1 style="margin-top:8px">${inl(m.title)}</h1><p>${inl(m.tag)}</p></div></section>
  <div class="intro2"><div class="panel"><div class="lab-h">${ic('target')}Why this matters</div><p class="small" style="color:var(--tx2)">${inl(m.why)}</p></div><div class="panel"><div class="lab-h">${ic('check')}You will learn</div><ul>${m.learn.map(x => `<li>${inl(x)}</li>`).join('')}</ul></div></div>
  ${rModuleBody(m, id)}${rWrap(m, `${tk}:${id}`)}
  <div class="pager"><div>${prev ? `<a class="btn" href="#/m/${tk}/${prev.id}">${ic('back')}${inl(prev.title)}</a>` : ''}</div>
  <button class="btn ${done ? '' : 'pri'}" data-done="${tk}:${id}">${ic('check')}${done ? 'Completed' : 'Mark as complete'}</button>
  <div>${next ? `<a class="btn" href="#/m/${tk}/${next.id}">${inl(next.title)}${ic('chev')}</a>` : `<a class="btn" href="#/exam">${ic('award')}Take the final exam</a>`}</div></div>`; };
P.sheets = () => head('~/cheat-sheets', 'Cheat sheets', 'One page per subject with everything you need to revise before an interview. Download any sheet as a PDF, or the complete printable handbook.') +
  `<div class="row" style="margin-bottom:18px"><a class="btn pri" href="pdf/GenAI_Mastery_Handbook.pdf" download>${ic('download')}Complete handbook (PDF)</a><a class="btn" href="pdf/GenAI_Mastery_All_Cheat_Sheets.pdf" download>${ic('download')}All cheat sheets (PDF)</a></div>
  <div class="grid">${D.cheats.map(s => `<a class="tile" href="#/sheet/${s.id}"><span class="ti">${ic(s.icon)}</span><h3>${inl(s.title)}</h3><p>${inl(s.tag)}</p></a>`).join('')}</div>`;
P.sheet = ([id]) => { const s = D.cheats.find(x => x.id === id); if (!s) return P.notfound();
  return `<div class="sheet-h">${head(`~/cheat-sheets/${id}`, inl(s.title), inl(s.tag))}</div><div class="row no-print" style="margin-bottom:18px"><a class="btn pri" href="pdf/cheat-${id}.pdf" download>${ic('download')}Download PDF</a><button class="btn" onclick="print()">${ic('print')}Print</button><a class="btn" href="#/sheets">${ic('back')}All sheets</a></div>
  ${s.items.map(it => it.type === 'concept' ? `<section class="cpt"><header><h3>${inl(it.title)}</h3></header><div class="cb">${rParts(it.parts)}</div></section>` : rPart(it)).join('')}`; };
P.interview = ([id]) => { const cats = D.interview; const cur = id ? cats.find(c => c.id === id) : null;
  const fastIQ = D.fast.flatMap(m => m.iqs.map(q => ({ ...q, src: m.title })));
  if (!cur) return head('~/interview', 'Interview preparation', 'Every answer comes in two levels: the industry-standard answer to say in the interview, and a simple version to make sure you truly understand it.') +
    `<div class="row" style="margin-bottom:16px"><a class="btn pri" href="#/drill">${ic('sparkles')}Random question drill</a><a class="btn" href="#/sheet/system">${ic('compass')}System design sheet</a></div>
    <div class="grid">${cats.map(c => `<a class="tile" href="#/interview/${c.id}"><span class="ti">${ic(c.icon)}</span><h3>${inl(c.title)}</h3><p>${inl(c.tag)}</p><span class="tag">${c.iqs.length ? c.iqs.length + ' questions' : 'guide'}</span></a>`).join('')}
    <a class="tile" href="#/interview/fast"><span class="ti">${ic('zap')}</span><h3>Fast Track questions</h3><p>All interview questions from the 12 sprints in one list.</p><span class="tag">${fastIQ.length} questions</span></a></div>`;
  return head(`~/interview/${id}`, inl(cur.title), inl(cur.tag)) + rModuleBody(cur, id) + cur.iqs.map(q => rIQ(q)).join('');
};
P.drill = () => { const all = [...D.interview.flatMap(c => c.iqs), ...D.fast.flatMap(m => m.iqs)]; const q = all[Math.floor(Math.random() * all.length)];
  return head('~/interview/drill', 'Question drill', 'Answer out loud first, then open the card to compare.') + rIQ(q) + `<div class="row"><button class="btn pri" onclick="route()">${ic('sparkles')}Next question</button><a class="btn" href="#/interview">${ic('back')}All categories</a></div>`; };
P.drill.after = () => window.gm && gm('drill');
P.career = ([id]) => { const cs = D.career; const cur = id && cs.find(c => c.id === id);
  if (!cur) return head('~/career', 'Career kit', 'Turn your skills into interviews and offers: a recruiter-ready LinkedIn, an ATS-friendly resume and a weekly job-search system.') +
    `<div class="grid">${cs.map(c => `<a class="tile" href="#/career/${c.id}"><span class="ti">${ic(c.icon)}</span><h3>${inl(c.title)}</h3><p>${inl(c.tag)}</p></a>`).join('')}<a class="tile" href="#/resume"><span class="ti">${ic('pen')}</span><h3>Resume builder</h3><p>Fill a form, see a live ATS-friendly preview, download as PDF.</p></a></div>`;
  if (cur.countries?.length && typeof countryPage === 'function') return countryPage(cur);
  return head(`~/career/${id}`, inl(cur.title), inl(cur.tag)) + `<div class="row no-print" style="margin-bottom:16px"><a class="btn pri" href="#/resume">${ic('pen')}Open resume builder</a></div>` + rModuleBody(cur, id); };
P.next = () => head('~/beyond-genai', 'Beyond GenAI: what to learn next', 'Trending fields that build on what you learned here, each with core skills and free resources.') +
  D.next.map(n => `<section class="cpt" id="${n.id}"><header><span class="ti" style="color:var(--acc)">${ic(n.icon)}</span><h3>${inl(n.title)}</h3></header><div class="cb"><p class="muted">${inl(n.tag)}</p><div class="co note"><div class="lab-h">${ic('trend')}Why it is trending</div><p>${inl(n.why)}</p></div>${rParts(n.items)}</div></section>`).join('');
P.resources = () => head('~/resources', 'Free resources', 'Everything here is free. Where a tool has a paid plan, you never need it for this course. Each subject has both a local and an online way to practise.') +
  D.resources.map(r => `<div class="sec-h"><h2>${inl(r.title)}</h2></div><p class="muted">${inl(r.tag)}</p>${r.items.map(it => it.type === 'concept' ? `<section class="cpt"><header><h3>${inl(it.title)}</h3></header><div class="cb">${rParts(it.parts)}</div></section>` : rPart(it)).join('')}`).join('');
P.projects = () => { const subs = store.get('proj', {});
  return head('~/projects', 'Capstone projects', 'Build these with free tools only. Paste your GitHub or live link when done; links count towards your certificate.') +
    D.projects.map(p => `<section class="cpt"><header><span class="ti" style="color:var(--acc)">${ic(p.icon)}</span><h3>${inl(p.title)}</h3><span class="lv ${p.meta.level?.[0] || 'B'}">${esc(p.meta.level || '')}</span></header><div class="cb"><p class="muted">${inl(p.tag)}</p>${rParts(p.items)}
    <label for="pj-${p.id}">Your project link (GitHub or live demo)</label><div class="row"><input id="pj-${p.id}" data-proj="${p.id}" type="url" inputmode="url" autocomplete="url" placeholder="https://github.com/you/project" value="${esc(subs[p.id] || '')}" style="flex:1;min-width:220px" aria-describedby="pje-${p.id}">${subs[p.id] ? `<span class="tag ok">${ic('check')}Submitted</span>` : ''}</div><div class="field-err" id="pje-${p.id}" role="alert"></div></div></section>`).join(''); };
P.about = () => head('~/about', 'About & support', `Created by ${esc(C.author)}. A free, all-in-one place to learn generative AI and related technologies.`) +
  `<div class="grid"><div class="panel"><div class="lab-h">${ic('mail')}Support</div><p>Questions, corrections or ideas? Email the author.</p><a class="btn pri" href="mailto:${esc(C.supportEmail)}?subject=${encodeURIComponent(C.appName + ' support')}">${ic('mail')}${esc(C.supportEmail)}</a></div>
  <div class="panel"><div class="lab-h">${ic('share')}Share</div><p>Help a friend learn AI for free.</p><button class="btn" data-act="share">${ic('share')}Share app</button></div>
  <div class="panel"><div class="lab-h">${ic('download')}Install</div><p>Install as an app on phone, tablet, foldable or desktop. Works offline after first visit (labs need internet once to download their engines).</p><button class="btn" data-act="install">${ic('download')}Install app</button></div></div>
  <div class="sec-h"><h2>Honest notes</h2></div><ul class="pts"><li>Progress, resume data and API keys are stored only in this browser (localStorage). Nothing is sent to any server by this app.</li><li>The certificate is a course-completion certificate issued by the author. It is not an accredited university qualification.</li><li>AI tools and model names change quickly. Always check official documentation for the latest details.</li><li>© ${new Date().getFullYear()} ${esc(C.author)}. All rights reserved.</li></ul>`;
P.settings = () => head('~/settings', 'Settings', 'Theme, optional AI connection and your saved data.') +
  `<div class="grid"><div class="panel"><div class="lab-h">${ic('sun')}Theme</div><div class="row">${['system', 'dark', 'light'].map(t => `<button class="btn sm ${store.get('theme', 'dark') === t ? 'pri' : ''}" data-theme-set="${t}">${t}</button>`).join('')}</div></div>
  ${typeof fxSettings === 'function' ? fxSettings() : ''}<div class="panel"><div class="lab-h">${ic('sparkles')}Optional: AI answers (free Gemini key)</div><p class="small muted">Everything works without this. To get AI explanations in Ask, the Prompt Lab and the RAG Lab, create a free API key in Google AI Studio (aistudio.google.com) and paste it here. The key stays on this device. Free-tier requests may be used by Google to improve its products, so never send private data.</p>
  <label for="k">Gemini API key</label><input id="k" type="password" autocomplete="off" value="${esc(store.get('key', ''))}" placeholder="AIza…"><label for="mdl">Model name</label><input id="mdl" value="${esc(store.get('model', C.geminiModel))}"><div class="row" style="margin-top:10px"><button class="btn pri sm" id="saveKey">${ic('check')}Save</button><button class="btn sm" id="testKey">${ic('play')}Test</button><button class="btn sm" id="delKey">${ic('x')}Remove</button></div></div>
  <div class="panel"><div class="lab-h">${ic('download')}Your data</div><p class="small muted">Back up progress, projects and resume, or move them to another device.</p><div class="row"><button class="btn sm" id="exp">${ic('download')}Export</button><label class="btn sm" style="margin:0">${ic('file')}Import<input type="file" id="imp" accept="application/json" hidden></label><button class="btn sm" id="rst">${ic('x')}Reset all</button></div></div></div>`;
P.notfound = () => head('~/404', 'Page not found', 'That page does not exist.') + `<a class="btn pri" href="#/">${ic('home')}Go home</a>`;

/* ---------------- shell, router ---------------- */
const NAV = [['Learn', [['#/', 'home', 'Home'], ['#/learn', 'layers', 'Tracks'], ['#/track/fast', 'zap', 'Fast Track'], ['#/track/complete', 'book', 'Complete Track']]],
  ['Practise', [['#/labs', 'flask', 'Labs'], ['#/projects', 'boxes', 'Projects'], ['#/exam', 'target', 'Final exam']]],
  ['Revise', [['#/sheets', 'file', 'Cheat sheets'], ['#/interview', 'mic', 'Interview prep']]],
  ['Grow', [['#/achievements', 'award', 'Achievements'], ['#/career', 'briefcase', 'Career kit'], ['#/resume', 'pen', 'Resume builder'], ['#/next', 'trend', 'Beyond GenAI'], ['#/news', 'newspaper', 'AI news'], ['#/resources', 'globe', 'Free resources'], ['#/certificate', 'award', 'Certificate']]],
  ['App', [['#/settings', 'gear', 'Settings'], ['#/about', 'info', 'About & support']]]];
function shell() {
  document.body.insertAdjacentHTML('afterbegin', `<div class="app"><aside class="side" id="side"><a class="brand" href="#/"><span class="logo">${ic('mark')}</span><span><b>${esc(C.appName)}</b><small>by ${esc(C.author)}</small></span></a>
  <nav class="nav">${NAV.map(([g, items]) => `<div class="grp">${g}</div>${items.map(([h, i, t]) => `<a href="${h}" data-nav="${h}">${ic(i)}${t}</a>`).join('')}`).join('')}</nav>
  <div class="foot">© ${new Date().getFullYear()} ${esc(C.author)}<br><a href="mailto:${esc(C.supportEmail)}">${esc(C.supportEmail)}</a></div></aside>
  <div class="main"><header class="top"><button class="icon-btn menu-btn" data-act="menu" aria-label="Menu">${ic('menu')}</button><div class="crumb" id="crumb"></div><a class="mini" id="miniXP" href="#/achievements" aria-label="Streak and XP" hidden></a>
  <button class="search-btn" data-act="ask" aria-label="Ask the guide">${ic('search')}<span>Ask or search anything</span><kbd>/</kbd></button>
  <button class="icon-btn" data-act="theme" aria-label="Toggle theme" id="themeBtn"></button><button class="icon-btn" data-act="share" aria-label="Share">${ic('share')}</button></header>
  <div id="readbar" aria-hidden="true"></div><main class="view" id="view"></main></div></div>
  <nav class="tabbar">${[['#/', 'home', 'Home'], ['#/learn', 'layers', 'Learn'], ['#/labs', 'flask', 'Labs'], ['#/sheets', 'file', 'Sheets'], ['menu', 'more', 'More']].map(([h, i, t]) => h === 'menu' ? `<a href="#" data-act="menu">${ic(i)}${t}</a>` : `<a href="${h}" data-nav="${h}">${ic(i)}${t}</a>`).join('')}</nav>
  <div class="modal" id="ask" hidden><div class="dialog" role="dialog" aria-label="Ask the guide"><div class="dh">${ic('search')}<input id="askq" placeholder="Ask a question, e.g. what is a vector database?" autocomplete="off"><button class="icon-btn" data-act="close">${ic('x')}</button></div><div class="db" id="askr"></div></div></div>
  <div class="modal" id="mod" hidden><div class="dialog"><div class="dh"><b id="modt" style="flex:1"></b><button class="icon-btn" data-act="close">${ic('x')}</button></div><div class="db" id="modb"></div></div></div>
  <button class="btn sm pri selask" id="selask">${ic('sparkles')}Ask about this</button><div class="toast" id="toast" role="status"></div>`);
}
function applyTheme() { const t = store.get('theme', 'dark'); const dark = t === 'dark' || (t === 'system' && !matchMedia('(prefers-color-scheme: light)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'; const b = $('#themeBtn'); if (b) b.innerHTML = ic(dark ? 'sun' : 'moon');
  $('meta[name=theme-color]')?.setAttribute('content', dark ? '#070b16' : '#f3f6fb'); }
let ROUTE_N = 0;
async function route() {
  const my = ++ROUTE_N;
  const h = location.hash || '#/'; const [path, qs] = h.slice(2).split('?'); const parts = path.split('/').filter(Boolean); const name = parts[0] || 'home';
  CODES = []; $$('.modal').forEach(m => m.hidden = true); $('#selask') && ($('#selask').style.display = 'none'); document.body.classList.remove('print-resume', 'print-cert'); $('#side')?.classList.remove('open'); $('.scrim')?.remove();
  const fn = P[name] || P.notfound; const v = $('#view');
  try { const out = await fn(parts.slice(1), new URLSearchParams(qs || '')); if (my !== ROUTE_N) return; if (typeof out === 'string') v.innerHTML = out; } catch (e) { if (my !== ROUTE_N) return; console.error(e); v.innerHTML = head('~/error', 'Something went wrong', esc(e.message)) + `<a class="btn pri" href="#/">${ic('home')}Go home</a>`; }
  $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === '#/' + (parts[0] ? parts.slice(0, parts[0] === 'track' ? 2 : 1).join('/') : '') || (a.dataset.nav === '#/' && name === 'home')));
  $('#crumb') && ($('#crumb').innerHTML = typeof crumbFor === 'function' ? crumbFor(parts) : esc(parts.join(' / ') || 'Home'));
  const anchor = new URLSearchParams(qs || '').get('a'); if (anchor) setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' }), 60); else if (!name.startsWith('print')) scrollTo(0, 0);
  if (name === 'home') typer(); try { if (P[name]?.after) P[name].after(parts.slice(1)); } catch (e) { console.error('page init', e); }
  document.title = `${parts.length ? parts.at(-1) + ' · ' : ''}${C.appName}`;
  const rb = $('#readbar'); if (rb) { rb.style.display = name === 'm' ? 'block' : 'none'; rb.style.transform = 'scaleX(0)'; } typeof refreshMini === 'function' && refreshMini();
}
function typer() { const el = $('#typer'); if (!el) return; const s = '$ learn genai --from zero --to expert --tools free'; let i = 0;
  const reduce = typeof reducedMotion === 'function' ? reducedMotion() : matchMedia('(prefers-reduced-motion: reduce)').matches; if (reduce) { el.innerHTML = esc(s) + '<span class="cur"></span>'; return; }
  (function t() { if (!el.isConnected) return; el.innerHTML = esc(s.slice(0, i)) + '<span class="cur"></span>'; if (i++ < s.length) setTimeout(t, 28); })(); }

/* ---------------- ask the guide (offline search + optional AI) ---------------- */
function openAsk(q = '') { $('#ask').hidden = false; const inp = $('#askq'); inp.value = q; inp.focus(); renderAsk(q); }
function renderAsk(q) {
  const box = $('#askr'); if (!q.trim()) { box.innerHTML = `<p class="muted small">Search every lesson, cheat sheet and interview answer. Results point you to the exact section.${store.get('key') ? ' Press Enter for an AI explanation grounded in this course.' : ' Add a free Gemini key in Settings to also get AI explanations.'}</p>`; return; }
  const hits = searchIdx(q); box._hits = hits;
  box.innerHTML = `${store.get('key') ? `<div class="row" style="margin-bottom:10px"><button class="btn sm pri" id="aiExplain">${ic('sparkles')}Explain with AI (uses these sources)</button></div><div id="aiOut"></div>` : ''}
  ${hits.length ? hits.map(d => `<a class="hit" href="${d.r}${d.a ? '?a=' + d.a : ''}"><span class="hc">${esc(d.c)}</span><b>${esc(d.t)}</b><p>${esc(d.x.replace(/\*\*|`/g, '').slice(0, 190))}…</p></a>`).join('') : '<p class="muted">No matches. Try different words.</p>'}`;
}
async function aiExplain(q) {
  const hits = $('#askr')._hits || []; const out = $('#aiOut'); out.innerHTML = `<div class="ai-ans muted">Thinking…</div>`;
  const ctx = hits.slice(0, 5).map((d, i) => `[${i + 1}] ${d.c} — ${d.t}\n${d.x.slice(0, 1200)}`).join('\n\n');
  const prompt = `You are a friendly GenAI tutor for the course "${C.appName}". Using ONLY the course sources below, answer the learner's question.
Give: 1) a simple explanation a beginner understands, 2) the industry-standard explanation, 3) a real-life example. Cite sources like [1]. If the sources do not cover it, say so briefly and give a short general answer marked "general knowledge".
<sources>
${ctx}
</sources>
Question: ${q}`;
  try { const a = await gemini(prompt); out.innerHTML = `<div class="ai-ans">${md(a)}</div>`; } catch (e) { out.innerHTML = `<div class="co warn"><p>${esc(e.message)}</p></div>`; }
}
function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').split(/\n{2,}/).map(b => /^\s*[-*] /m.test(b) ? `<ul class="pts">${b.split('\n').filter(x => x.trim()).map(x => `<li>${x.replace(/^\s*[-*]\s/, '')}</li>`).join('')}</ul>` : `<p>${b.replace(/\n/g, '<br>')}</p>`).join(''); }
async function gemini(prompt) {
  const key = store.get('key'); if (!key) throw new Error('Add a free Gemini API key in Settings first.');
  const model = store.get('model', C.geminiModel);
  let r; try { r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }) }); } catch { throw new Error('Could not reach Google AI. Check your internet connection and try again. Everything else in the app still works offline.'); }
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(`Gemini error ${r.status}: ${j.error?.message || 'check your key and model name in Settings'}`);
  return j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '(empty answer)';
}

/* ---------------- share, install, modal ---------------- */
function modal(title, body) { $('#modt').textContent = title; $('#modb').innerHTML = body; $('#mod').hidden = false; }
async function share() {
  const url = C.siteUrl || location.href.split('#')[0]; const text = `${C.appName}: learn generative AI free, from zero to expert.`;
  if (navigator.share && matchMedia('(max-width: 900px)').matches) { try { await navigator.share({ title: C.appName, text, url }); return; } catch {} }
  const u = encodeURIComponent(url), tx = encodeURIComponent(text);
  modal('Share this app', `<div class="row"><input value="${esc(url)}" readonly style="flex:1"><button class="btn pri" id="cpLink">${ic('copy')}Copy</button></div>
  <div class="row" style="margin-top:12px"><a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/?text=${tx}%20${u}">WhatsApp</a><a class="btn sm" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${u}">LinkedIn</a><a class="btn sm" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${tx}&url=${u}">X</a><a class="btn sm" href="mailto:?subject=${encodeURIComponent(C.appName)}&body=${tx}%20${u}">Email</a></div>
  <div id="qr" style="margin-top:16px;display:grid;place-items:center"></div>`);
  $('#cpLink').onclick = () => copyText(url);
  try { await loadScript(C.cdn.qrcode, 8000); const q = qrcode(0, 'M'); q.addData(url); q.make(); $('#qr').innerHTML = q.createSvgTag({ cellSize: 5, margin: 2, scalable: true }); $('#qr svg').style.cssText = 'width:200px;height:200px;background:#fff;border-radius:10px'; } catch { $('#qr').innerHTML = ''; }
}
let deferredInstall = null; addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });
async function install() { if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; return; }
  modal('Install the app', `<ul class="pts"><li><b>Android / Chrome / Edge:</b> browser menu → Install app (or Add to Home screen).</li><li><b>iPhone / iPad (Safari):</b> Share button → Add to Home Screen.</li><li><b>Desktop Chrome / Edge:</b> click the install icon in the address bar.</li></ul>`); }

/* ---------------- global events ---------------- */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act],[data-copy],[data-run],[data-done],[data-theme-set],.card-f'); if (!a) return;
  if (a.classList.contains('card-f')) return a.classList.toggle('show');
  if (a.dataset.copy) return copyText(CODES[+a.dataset.copy].text);
  if (a.dataset.run) { const c = CODES[+a.dataset.run]; sessionStorage.setItem('gm.labcode', c.text); location.hash = `#/lab/${c.lang}`; return; }
  if (a.dataset.done) { const [tk, id] = a.dataset.done.split(':'); const now = !isDone(tk, id); setDone(tk, id, now); route(); if (now && window.gm) gm('module', { tk, id }); else toast(now ? 'Marked complete' : 'Marked incomplete'); return; }
  if (a.dataset.themeSet) { store.set('theme', a.dataset.themeSet); applyTheme(); return route(); }
  const act = a.dataset.act; if (act !== 'menu') e.preventDefault();
  if (act === 'ask') openAsk(); if (act === 'share') share(); if (act === 'install') install();
  if (act === 'close') { a.closest('.modal').hidden = true; }
  if (act === 'theme') { const now = document.documentElement.dataset.theme; store.set('theme', now === 'dark' ? 'light' : 'dark'); applyTheme(); }
  if (act === 'menu') { e.preventDefault(); const s = $('#side'); s.classList.add('open'); const sc = document.createElement('div'); sc.className = 'scrim'; sc.onclick = () => { s.classList.remove('open'); sc.remove(); }; document.body.appendChild(sc); }
});
document.addEventListener('change', e => {
  const t = e.target; if (t.dataset.chk) { const c = store.get('chk', {}); c[t.dataset.chk] = t.checked; store.set('chk', c); window.gm && gm('practice', { key: t.dataset.chk, on: t.checked }); }
  if (t.dataset.proj) { const p = store.get('proj', {}); const v = t.value.trim(); const er = document.getElementById('pje-' + t.dataset.proj); let okU = !v; try { okU = okU || ['http:', 'https:'].includes(new URL(v).protocol); } catch {} t.setAttribute('aria-invalid', okU ? 'false' : 'true'); if (er) { er.textContent = okU ? '' : 'Enter a full link, for example https://github.com/your-name/project'; er.classList.toggle('on', !okU); } if (!okU) return; if (v) p[t.dataset.proj] = v; else delete p[t.dataset.proj]; store.set('proj', p); toast('Project link saved'); if (v && window.gm) gm('project', { id: t.dataset.proj }); }
});
document.addEventListener('keydown', e => {
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openAsk(); }
  if (e.key === 'Escape') $$('.modal').forEach(m => m.hidden = true);
  if (e.target.id === 'askq' && e.key === 'Enter' && store.get('key')) aiExplain(e.target.value);
  if (e.target.classList?.contains('card-f') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.target.classList.toggle('show'); }
});
document.addEventListener('input', e => { if (e.target.id === 'askq') renderAsk(e.target.value); });
document.addEventListener('click', e => { if (e.target.id === 'aiExplain') aiExplain($('#askq').value); if (e.target.classList?.contains('modal')) e.target.hidden = true; });
// select text in a lesson → "Ask about this"
document.addEventListener('selectionchange', () => { clearTimeout(window._selT); window._selT = setTimeout(() => {
  const b = $('#selask'); if (!b) return; const s = getSelection(); const txt = s.toString().trim();
  if (txt.length < 3 || txt.length > 300 || !s.rangeCount || !$('#view').contains(s.anchorNode)) { b.style.display = 'none'; return; }
  const r = s.getRangeAt(0).getBoundingClientRect(); b.style.display = 'inline-flex'; b.style.top = `${scrollY + r.bottom + 8}px`; b.style.left = `${Math.max(8, Math.min(innerWidth - 180, scrollX + r.left))}px`; b._txt = txt; }, 250); });
document.addEventListener('mousedown', e => { if (e.target.closest('#selask')) { e.preventDefault(); const b = $('#selask'); openAsk(b._txt); b.style.display = 'none'; } });
document.addEventListener('touchend', e => { if (e.target.closest('#selask')) { e.preventDefault(); const b = $('#selask'); openAsk(b._txt); b.style.display = 'none'; } });
P.settings.after = () => {
  $('#saveKey').onclick = () => { store.set('key', $('#k').value.trim()); store.set('model', $('#mdl').value.trim() || C.geminiModel); toast('Saved on this device'); };
  $('#delKey').onclick = () => { store.del('key'); $('#k').value = ''; toast('Key removed'); };
  $('#testKey').onclick = async () => { store.set('key', $('#k').value.trim()); store.set('model', $('#mdl').value.trim() || C.geminiModel); try { const a = await gemini('Reply with exactly: connected'); toast('Gemini says: ' + a.slice(0, 40)); } catch (e) { toast(e.message.slice(0, 90)); } };
  $('#exp').onclick = () => { const data = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('gm.') && k !== 'gm.key') data[k] = localStorage.getItem(k); }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' })); a.download = 'genai-mastery-backup.json'; a.click(); };
  $('#imp').onchange = async e => { try { const data = JSON.parse(await e.target.files[0].text()); Object.entries(data).forEach(([k, v]) => k.startsWith('gm.') && localStorage.setItem(k, v)); toast('Imported'); route(); } catch { toast('Not a valid backup file'); } };
  $('#rst').onclick = () => { if (confirm('Delete all progress, projects and resume data on this device?')) { Object.keys(localStorage).filter(k => k.startsWith('gm.')).forEach(k => localStorage.removeItem(k)); toast('Reset'); route(); } };
};

/* ---------------- printable documents for PDFs ---------------- */
function rSheetDoc(s) { return `<div class="sheet-h"><header class="page-h"><div class="path">Cheat sheet</div><h1>${inl(s.title)}</h1><p>${inl(s.tag)}</p></header></div>${s.items.map(it => it.type === 'concept' ? `<section class="cpt"><header><h3>${inl(it.title)}</h3></header><div class="cb">${rParts(it.parts)}</div></section>` : rPart(it)).join('')}`; }
function cover(title, sub) { return `<section class="pcover"><div class="path">Learn generative AI · zero to expert</div><h1>${title}</h1><p>${sub}</p><div class="rule"></div><div class="by"><small>created by</small>${esc(C.author)}</div></section>`; }
P.print = ([kind, id]) => {
  document.documentElement.dataset.theme = 'light'; let html = '';
  if (kind === 'cheat') { const s = D.cheats.find(x => x.id === id); html = `<div class="pdoc cheat">${rSheetDoc(s)}</div>`; }
  else if (kind === 'cheats') html = `<div class="pdoc">${cover('GenAI <span>Cheat Sheets</span>', `${D.cheats.length} subject cheat sheets for fast revision and interview preparation.`)}${D.cheats.map(rSheetDoc).join('')}</div>`;
  else { const sec = (t, inner) => `<section class="psec"><h1>${t}</h1>${inner}</section>`;
    const trackDoc = tk => D[TRACKS[tk].file].map(m => `<section class="mhero"><span class="num">${esc(m.id.replace('F', ''))}</span><span class="mi">${ic(m.icon)}</span><div><h1>${inl(m.title)}</h1><p>${inl(m.tag)}</p></div></section>
      <div class="intro2"><div class="panel"><div class="lab-h">Why this matters</div><p class="small">${inl(m.why)}</p></div><div class="panel"><div class="lab-h">You will learn</div><ul>${m.learn.map(x => `<li>${inl(x)}</li>`).join('')}</ul></div></div>${rModuleBody(m, m.id)}${rWrap(m, 'print')}`).join('');
    const parts = [['Fast Track', trackDoc('fast')], ['Complete Track', trackDoc('complete')], ['Cheat Sheets', D.cheats.map(rSheetDoc).join('')],
      ['Interview Bank', D.interview.map(c => `<h2 style="margin:8mm 0 3mm">${inl(c.title)}</h2>${rModuleBody(c, c.id)}${c.iqs.map(q => rIQ(q, true)).join('')}`).join('')],
      ['Capstone Projects', D.projects.map(p => `<section class="cpt"><header><h3>${inl(p.title)}</h3><span class="lv">${esc(p.meta.level || '')}</span></header><div class="cb"><p class="muted">${inl(p.tag)}</p>${rParts(p.items)}</div></section>`).join('')],
      ['Career Kit', D.career.map(c => `<h2 style="margin:8mm 0 3mm">${inl(c.title)}</h2>${c.countries?.length ? countryTable(c.countries) + countryCards(rankCountries(c.countries, CW_PRESETS.Balanced)) : ''}${rModuleBody(c, c.id)}`).join('')],
      ['Beyond GenAI', D.next.map(n => `<section class="cpt"><header><h3>${inl(n.title)}</h3></header><div class="cb"><p>${inl(n.why)}</p>${rParts(n.items)}</div></section>`).join('')],
      ['Free Resources', D.resources.map(r => `<h2 style="margin:8mm 0 3mm">${inl(r.title)}</h2>${r.items.map(it => it.type === 'concept' ? `<section class="cpt"><header><h3>${inl(it.title)}</h3></header><div class="cb">${rParts(it.parts)}</div></section>` : rPart(it)).join('')}`).join('')]];
    html = `<div class="pdoc">${cover('GenAI <span>Mastery</span>', 'The complete handbook: Fast Track, Complete Track, cheat sheets, interview bank, projects, career kit and free resources. Learn generative AI from zero to expert.')}
      <section class="psec ptoc"><h1>Contents</h1>${parts.map(([t], i) => `<a href="#ps${i}"><span>${String(i + 1).padStart(2, '0')} · ${t}</span><span class="pg" data-pg="ps${i}"></span></a>`).join('')}
      <p class="small muted" style="margin-top:8mm">© ${new Date().getFullYear()} ${esc(C.author)}. All rights reserved. No part of this handbook may be resold or redistributed without written permission. Product names are trademarks of their owners. Free tools only; paid plans are never required. Always check official documentation for the latest model names.</p></section>
      ${parts.map(([t, inner], i) => `<section class="psec" id="ps${i}"><span class="small muted">Part ${String(i + 1).padStart(2, '0')}</span><h1>${t}</h1>${inner}</section>`).join('')}</div>`; }
  $('#view').innerHTML = html; $$('details').forEach(d => d.open = true); window.__printReady = true;
};

/* ---------------- boot ---------------- */
async function boot() {
  shell(); applyTheme(); matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyTheme);
  typeof applyFx === 'function' && applyFx();
  $('#view').innerHTML = '<p class="muted mono">loading content…</p>';
  const res = await Promise.allSettled(FILES.map(async f => { const r = await fetch(`content/${f}.txt`); if (!r.ok) throw new Error(`${f}.txt (${r.status})`); D[f] = parse(await r.text()); }));
  const failed = res.map((r, i) => r.status === 'rejected' ? FILES[i] : null).filter(Boolean);
  if (failed.length) { $('#view').innerHTML = head('~/offline', 'Could not load the course content', `Check your internet connection and try again. Missing: ${esc(failed.join(', '))}. Once loaded, the app works offline.`) + `<button class="btn pri" onclick="location.reload()">${ic('trend')}Try again</button>`; return; }
  try { typeof uxInit === 'function' && uxInit(); } catch (e) { console.error(e); }
  try { buildIndex(); } catch (e) { console.error(e); INDEX = []; INDEX.tok = s => []; }
  addEventListener('hashchange', route); await route();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
boot();
