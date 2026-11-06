/* GenAI Mastery · learning experience: onboarding, dashboard, continue-where-you-left-off,
   lesson outline, module quizzes, spaced-repetition review, mock interviews, form validation. */
'use strict';
ICON.mark = '<circle cx="6" cy="7" r="2.2"/><circle cx="18" cy="7" r="2.2"/><circle cx="12" cy="17.5" r="2.2"/><path d="M8.2 7h7.6M7.1 9l3.8 6.5M16.9 9l-3.8 6.5"/>';
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const hashId = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return 'q' + (h >>> 0).toString(36); };
const DAY = 864e5, dayNum = (t = Date.now()) => Math.floor((t - new Date().getTimezoneOffset() * 6e4) / DAY);

/* ---------- data merge ---------- */
function uxInit() {
  const byId = Object.fromEntries((D.quiz || []).map(q => [q.id, q.mcq]));
  for (const tk of ['fast', 'complete']) for (const m of D[TRACKS[tk].file]) m.mcq = byId[m.id] || [];
}

/* ---------- crumbs & labels ---------- */
const NICE = { learn: 'Learn', track: 'Learn', m: 'Learn', labs: 'Labs', lab: 'Labs', sheets: 'Cheat sheets', sheet: 'Cheat sheets', interview: 'Interview', drill: 'Interview', review: 'Interview', mock: 'Interview', practice: 'Interview',
  career: 'Career', resume: 'Career', next: 'Explore', resources: 'Resources', projects: 'Projects', news: 'News', exam: 'Assessment', certificate: 'Certificate', verify: 'Certificate', achievements: 'Progress', settings: 'Settings', about: 'About' };
function crumbFor(parts) {
  const [a, b, c] = parts; const sep = '<span class="sep">/</span>'; if (!a) return '<b>Home</b>';
  const find = (arr, id) => (arr || []).find(x => x.id === id);
  if (a === 'm' && TRACKS[b]) { const m = find(D[TRACKS[b].file], c); return `<a href="#/track/${b}">${TRACKS[b].name}</a>${sep}<b>${esc(m?.title || '')}</b>`; }
  if (a === 'track' && TRACKS[b]) return `<a href="#/learn">Learn</a>${sep}<b>${TRACKS[b].name}</b>`;
  if (a === 'sheet') return `<a href="#/sheets">Cheat sheets</a>${sep}<b>${esc(find(D.cheats, b)?.title || '')}</b>`;
  if (a === 'interview' && b) return `<a href="#/interview">Interview</a>${sep}<b>${esc(find(D.interview, b)?.title || (b === 'fast' ? 'Fast Track questions' : ''))}</b>`;
  if (a === 'career' && b) return `<a href="#/career">Career</a>${sep}<b>${esc(find(D.career, b)?.title || '')}</b>`;
  if (a === 'lab' && b) return `<a href="#/labs">Labs</a>${sep}<b>${esc({ python: 'Python', sql: 'SQL', rag: 'RAG', prompt: 'Prompt' }[b] || 'Python')} Lab</b>`;
  if (['review', 'mock', 'practice', 'drill'].includes(a)) return `<a href="#/interview">Interview</a>${sep}<b>${{ review: 'Flashcards', mock: 'Mock interview', practice: 'Question practice', drill: 'Drill' }[a]}</b>`;
  if (a === 'resume') return `<a href="#/career">Career</a>${sep}<b>Resume builder</b>`;
  return `<b>${esc(NICE[a] || a)}</b>`;
}

/* ---------- onboarding & dashboard ---------- */
const GOALS = { job: ['briefcase', 'Get hired in AI soon', 'Interview-focused, job-ready in about 6 weeks.', 'fast'], learn: ['book', 'Understand AI deeply', 'Every concept from absolute zero, at your own pace.', 'complete'], both: ['layers', 'Both', 'Start with the Fast Track, then go deeper.', 'fast'] };
const TIMES = { 15: ['15 minutes a day', 'A concept a day keeps momentum.'], 30: ['30 minutes a day', 'Steady progress, about one module a week.'], 60: ['1 hour or more', 'Fastest path to job-ready.'] };
let OB = { step: 0, goal: null, time: null };
function onboarding() {
  const opts = OB.step === 0 ? GOALS : TIMES; const sel = OB.step === 0 ? OB.goal : OB.time;
  return `<section class="onboard"><div class="steps-dots"><i class="on"></i><i class="${OB.step ? 'on' : ''}"></i></div>
    <h1>${OB.step === 0 ? 'What brings you here?' : 'How much time can you give each day?'}</h1>
    <p class="muted" style="margin-top:10px">${OB.step === 0 ? 'We’ll set up the right path. You can switch any time.' : 'Small, consistent sessions work best. Your progress saves automatically.'}</p>
    ${Object.entries(opts).map(([k, v]) => OB.step === 0 ? `<button class="opt ${sel === k ? 'on' : ''}" data-ob="${k}"><span class="ti">${ic(v[0])}</span><span><b>${v[1]}</b><span>${v[2]}</span></span></button>`
      : `<button class="opt ${sel === k ? 'on' : ''}" data-ob="${k}"><span class="ti">${ic('clock')}</span><span><b>${v[0]}</b><span>${v[1]}</span></span></button>`).join('')}
    <div class="row" style="margin-top:22px;justify-content:space-between"><button class="btn ghost" data-ob="skip">Skip for now</button>
    <div class="row">${OB.step ? '<button class="btn" data-ob="back">Back</button>' : ''}<button class="btn pri" data-ob="next" ${sel ? '' : 'disabled'}>${OB.step ? 'Start learning' : 'Continue'}</button></div></div>
    <p class="small muted" style="margin-top:28px">Fast Track and Complete Track · browser labs · cheat sheets · interview practice · certificate</p></section>`;
}
document.addEventListener('click', e => { const b = e.target.closest('[data-ob]'); if (!b) return; const v = b.dataset.ob;
  if (v === 'skip') { store.set('goal', 'skip'); return route(); }
  if (v === 'back') OB.step = 0; else if (v === 'next') { if (OB.step === 0) OB.step = 1; else { store.set('goal', OB.goal); store.set('daily', +OB.time); store.set('track', GOALS[OB.goal][3]); toast('You’re all set'); OB = { step: 0, goal: null, time: null }; return route(); } }
  else if (OB.step === 0) OB.goal = v; else OB.time = v; $('#view').innerHTML = onboarding(); });

function lastInfo() {
  const last = store.get('last', ''); const m = /^#\/m\/(fast|complete)\/([\w]+)/.exec(last); if (!m) return null;
  const [, tk, id] = m; const mod = D[TRACKS[tk].file].find(x => x.id === id); if (!mod) return null;
  const total = mod.items.filter(i => i.type === 'concept').length || 1; const seen = Object.keys(store.get('seen', {})[`${tk}:${id}`] || {}).length;
  return { tk, id, mod, pct: Math.min(100, Math.round(100 * seen / total)), done: isDone(tk, id) };
}
function greeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
function dashboard() {
  const L = lastInfo(); const tk = store.get('track', 'fast'); const first = D[TRACKS[tk].file][0]; const due = dueCount(); const daily = store.get('daily', 30);
  let cont;
  if (L && L.done) { const ms = D[TRACKS[L.tk].file]; const nx = ms[ms.findIndex(x => x.id === L.id) + 1];
    cont = nx ? `<a class="cont" href="#/m/${L.tk}/${nx.id}"><div><div class="k">Up next · ${TRACKS[L.tk].name}</div><h3>${inl(nx.title)}</h3><div class="small muted">${inl(nx.tag)}</div></div><span class="go">${ic('chev')}</span></a>`
      : `<a class="cont" href="#/exam"><div><div class="k">Track complete</div><h3>Take the final assessment</h3><div class="small muted">Pass with 70% to unlock your certificate.</div></div><span class="go">${ic('chev')}</span></a>`; }
  else if (L) cont = `<a class="cont" href="#/m/${L.tk}/${L.id}"><div><div class="k">Continue · ${TRACKS[L.tk].name}</div><h3>${inl(L.mod.title)}</h3><div class="bar"><i style="width:${L.pct}%"></i></div><div class="small muted" style="margin-top:6px">${L.pct}% read · picks up where you stopped</div></div><span class="go">${ic('play')}</span></a>`;
  else cont = `<a class="cont" href="#/m/${tk}/${first.id}"><div><div class="k">Start here · ${TRACKS[tk].name}</div><h3>${inl(first.title)}</h3><div class="small muted">${inl(first.tag)}</div></div><span class="go">${ic('play')}</span></a>`;
  const tiles = [['#/labs', 'flask', 'Practice labs', 'Python, SQL, RAG and prompts in your browser.'], ['#/sheets', 'file', 'Cheat sheets', `${D.cheats.length} subjects, each as a PDF.`], ['#/interview', 'mic', 'Interview prep', 'Flashcards, mock interviews and system design.'],
    ['#/projects', 'boxes', 'Projects', 'Ten portfolio projects using free tools.'], ['#/career', 'briefcase', 'Career', 'Country ranking, LinkedIn, resume, job search.'], ['#/certificate', 'award', 'Certificate', 'Finish a track and pass the assessment.']];
  return `<header class="hello"><h1>${greeting()}.</h1><p>${L ? 'Pick up right where you left off.' : 'Your learning path is ready. Start with the first lesson.'}</p></header>${cont}
    <div class="today"><a href="#/review"><b>${due}</b><span>flashcards due today</span></a><a href="#/practice"><b>${ic('target')}</b><span>Practice questions</span></a><a href="#/achievements"><b>${daily}<span style="font-size:13px;font-weight:500"> min</span></b><span>daily goal · ${typeof streakNow === 'function' ? streakNow() : 0}-day streak</span></a></div>
    ${typeof journeyCard === 'function' ? journeyCard() : ''}<div class="sec-h"><h2>Your tracks</h2><a href="#/learn">Compare</a></div>${tracksHtml()}
    <div class="sec-h"><h2>Explore</h2></div><div class="grid">${tiles.map(([h, i, t, d]) => `<a class="tile" href="${h}"><span class="ti">${ic(i)}</span><h3>${t}</h3><p>${d}</p></a>`).join('')}</div>`;
}
const P_home_orig = P.home;
P.home = () => { const goal = store.get('goal'); const any = Object.keys(store.get('done', {})).length || store.get('last'); return !goal && !any ? onboarding() : dashboard(); };

/* ---------- lesson page: outline, read tracking, resume scroll, quiz ---------- */
let IO = null, MODKEY = null, saveT = null;
const P_m_after = P.m.after;
P.m.after = ([tk, id]) => {
  const v = $('#view'); const t = TRACKS[tk]; if (!t) return; const m = D[t.file].find(x => x.id === id); if (!m) return; MODKEY = `${tk}:${id}`;
  const pager = $('.pager', v);
  if (pager) pager.insertAdjacentHTML('beforebegin', `${m.mcq?.length ? quizHTML(MODKEY, m.mcq) : ''}<p class="small muted" style="margin-top:24px">Last reviewed ${esc(C.reviewed || '')}. Found something unclear or incorrect? <a href="mailto:${esc(C.supportEmail)}?subject=${encodeURIComponent('Feedback: ' + m.title)}">Let us know</a>.</p>`);
  const seenAll = store.get('seen', {}); const seen = seenAll[MODKEY] || {}; const cpts = $$('.cpt[id]', v);
  if (cpts.length > 2) { const wrap = document.createElement('div'); wrap.className = 'mod-layout'; const main = document.createElement('div'); while (v.firstChild) main.appendChild(v.firstChild);
    const toc = document.createElement('nav'); toc.className = 'toc'; toc.setAttribute('aria-label', 'On this page');
    toc.innerHTML = `<b>On this page</b>${cpts.map(c => `<a href="#" data-to="${c.id}" class="${seen[c.id] ? 'seen' : ''}"><span class="d"></span>${esc(c.querySelector('h3').textContent)}</a>`).join('')}${m.mcq?.length ? '<a href="#" data-to="quiz"><span class="d"></span>Check your understanding</a>' : ''}`;
    wrap.append(main, toc); v.appendChild(wrap); }
  IO?.disconnect(); IO = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { const s = store.get('seen', {}); (s[MODKEY] ||= {})[e.target.id] = 1; store.set('seen', s);
    $$('.toc a').forEach(a => { a.classList.toggle('on', a.dataset.to === e.target.id); if (a.dataset.to === e.target.id) a.classList.add('seen'); }); } }, { rootMargin: '-25% 0px -60% 0px' });
  cpts.forEach(c => IO.observe(c));
  const pos = store.get('pos', {})[MODKEY]; if (pos && !location.hash.includes('?a=')) setTimeout(() => scrollTo({ top: pos, behavior: 'instant' }), 40);
  if (P_m_after) P_m_after([tk, id]);
};
addEventListener('scroll', () => { if (!MODKEY || !location.hash.startsWith('#/m/')) return; clearTimeout(saveT); saveT = setTimeout(() => { const p = store.get('pos', {}); p[MODKEY] = Math.round(scrollY); store.set('pos', p); }, 250); }, { passive: true });
document.addEventListener('click', e => { const a = e.target.closest('[data-to]'); if (!a) return; e.preventDefault(); document.getElementById(a.dataset.to)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });

/* ---------- quiz component ---------- */
function quizHTML(key, list, title = 'Check your understanding', id = 'quiz') {
  const best = store.get('qz', {})[key]; const qs = list.map(q => ({ ...q, order: shuffle(q.opts.map((o, j) => j)) }));
  window._qz = window._qz || {}; window._qz[key] = qs;
  return `<section class="quiz" id="${id}" data-qk="${esc(key)}"><div class="qh"><h3>${esc(title)}</h3><span class="small muted">${qs.length} questions${best != null ? ` · best ${best}%` : ''}</span></div>
    ${qs.map((q, n) => `<div class="qitem" data-n="${n}"><b>${n + 1}. ${inl(q.q)}</b>${q.order.map((j, k) => `<button class="qopt" data-j="${j}"><span class="k">${'ABCD'[k]}</span><span>${inl(q.opts[j])}</span></button>`).join('')}<div class="qexp">${inl(q.ex)}</div></div>`).join('')}
    <div class="qres"></div></section>`;
}
document.addEventListener('click', e => {
  const o = e.target.closest('.qopt'); if (!o || o.disabled) return; const item = o.closest('.qitem'), sec = o.closest('.quiz'); const key = sec.dataset.qk; const q = window._qz[key][+item.dataset.n];
  $$('.qopt', item).forEach(b => { b.disabled = true; if (+b.dataset.j === q.ans) b.classList.add('right'); }); if (+o.dataset.j !== q.ans) o.classList.add('wrong');
  item.classList.add('done'); item.dataset.ok = +o.dataset.j === q.ans ? 1 : 0;
  const items = $$('.qitem', sec); if (items.every(i => i.classList.contains('done'))) {
    const ok = items.filter(i => i.dataset.ok === '1').length, pct = Math.round(100 * ok / items.length); const qz = store.get('qz', {}); qz[key] = Math.max(qz[key] || 0, pct); store.set('qz', qz);
    $('.qres', sec).innerHTML = `<div class="qscore"><b>${ok}/${items.length}</b><div><div>${pct >= 80 ? 'Excellent. You’ve got this.' : pct >= 60 ? 'Good. Review the explanations for the ones you missed.' : 'Worth another read. The explanations above show where to focus.'}</div><div class="row" style="margin-top:8px"><button class="btn sm" data-qretry="${esc(key)}">Try again</button></div></div></div>`;
    window.gm && gm('quiz', { key, pct });
  }
});
document.addEventListener('click', e => { const r = e.target.closest('[data-qretry]'); if (!r) return; const sec = r.closest('.quiz'); const key = r.dataset.qretry;
  const list = window._qz[key]; const title = $('h3', sec).textContent; sec.outerHTML = quizHTML(key, list, title, sec.id); $('#' + sec.id)?.scrollIntoView({ behavior: 'smooth' }); });

/* ---------- question practice ---------- */
P.practice = (_, qs) => {
  const src = qs.get('s') || 'all'; const pool = []; const opts = [['all', 'All topics'], ['fast', 'Fast Track sprints'], ['complete', 'Complete Track modules'], ['exam', 'Assessment bank']];
  for (const tk of ['fast', 'complete']) if (src === 'all' || src === tk) D[TRACKS[tk].file].forEach(m => (m.mcq || []).forEach(q => pool.push(q)));
  if (src === 'all' || src === 'exam') pool.push(...(D.exam[0]?.mcq || []));
  const set = shuffle(pool).slice(0, 10);
  return head('~/interview', 'Question practice', 'Ten random questions with instant feedback and explanations. Do a set whenever you have five minutes.') +
    `<div class="row" style="margin-bottom:6px">${opts.map(([k, n]) => `<a class="btn sm ${k === src ? 'pri' : ''}" href="#/practice?s=${k}">${n}</a>`).join('')}<button class="btn sm ghost" onclick="route()">${ic('trend')}New set</button></div>
    ${quizHTML('practice-' + src, set, `${opts.find(o => o[0] === src)[1]} · ${pool.length} in bank`)}`;
};

/* ---------- spaced-repetition flashcards ---------- */
const BOXES = [0, 1, 3, 7, 16, 35];
function deck() { const out = []; const add = (q, src) => out.push({ id: hashId(q.q), q, src });
  D.fast.forEach(m => m.iqs.forEach(q => add(q, m.title))); D.interview.forEach(c => c.iqs.forEach(q => add(q, c.title))); return out; }
function dueList() { const s = store.get('srs', {}); const today = dayNum(); const nw = store.get('srsNew', { d: 0, n: 0 }); const newLeft = Math.max(0, 15 - (nw.d === today ? nw.n : 0));
  const d = deck(); const due = d.filter(c => s[c.id] && s[c.id].due <= today); const fresh = d.filter(c => !s[c.id]).slice(0, newLeft); return [...due, ...fresh]; }
function dueCount() { try { return dueList().length; } catch { return 0; } }
let RV = { list: [], i: 0, shown: false, done: 0 };
P.review = () => { RV = { list: dueList(), i: 0, shown: false, done: 0 }; return head('~/interview', 'Flashcards', 'Spaced repetition: cards you find hard come back sooner, easy ones later. About 10 minutes a day keeps every answer fresh.') + `<div class="rv" id="rv">${rvCard()}</div>`; };
function rvCard() {
  const c = RV.list[RV.i]; if (!c) { const s = store.get('srs', {}); const next = Math.min(...Object.values(s).map(x => x.due).filter(x => x > dayNum()), Infinity);
    if (RV.done && window.gm) gm('review');
    return `<div class="rv-card" style="align-items:center;justify-content:center;text-align:center"><span class="badge" style="--s:56px">${ic('check')}</span><div class="q">All caught up</div><p class="muted">${RV.done ? `You reviewed ${RV.done} cards.` : 'No cards due right now.'} ${isFinite(next) ? `Next cards are due in ${next - dayNum()} day${next - dayNum() === 1 ? '' : 's'}.` : ''}</p><div class="row"><a class="btn pri" href="#/mock">Try a mock interview</a><a class="btn" href="#/practice">Practice questions</a></div></div>`; }
  const st = store.get('srs', {})[c.id];
  return `<div class="rv-meta"><span>${RV.i + 1} of ${RV.list.length}</span><span>${st ? `Box ${st.box + 1} of ${BOXES.length}` : 'New card'} · ${esc(c.src)}</span></div>
    <div class="rv-card"><div class="q">${inl(c.q.q)}</div>${RV.shown ? `<div class="iqb" style="padding:0"><div class="pro"><div class="lab-h">${ic('briefcase')}Interview answer</div>${inl(c.q.a)}</div>${c.q.e ? `<div class="eli"><div class="lab-h">${ic('message')}Simple version</div>${inl(c.q.e)}</div>` : ''}</div>`
      : '<p class="muted small">Say your answer out loud first, then reveal.</p>'}</div>
    <div class="rv-actions">${RV.shown ? `<button class="btn" data-rv="0">Again</button><button class="btn" data-rv="1">Good</button><button class="btn pri" data-rv="2">Easy</button>` : `<button class="btn pri" data-rv="show">Show answer</button>`}</div>`;
}
document.addEventListener('click', e => { const b = e.target.closest('[data-rv]'); if (!b) return; const c = RV.list[RV.i]; if (!c) return;
  if (b.dataset.rv === 'show') RV.shown = true; else { const s = store.get('srs', {}); const today = dayNum(); const cur = s[c.id];
    if (!cur) { const nw = store.get('srsNew', { d: 0, n: 0 }); store.set('srsNew', { d: today, n: (nw.d === today ? nw.n : 0) + 1 }); }
    const g = +b.dataset.rv; const box = g === 0 ? 0 : Math.min(BOXES.length - 1, (cur?.box ?? -1) + g); s[c.id] = { box, due: today + (g === 0 ? 0 : BOXES[box]) }; store.set('srs', s);
    if (g === 0) RV.list.push(c); RV.i++; RV.shown = false; RV.done++; }
  $('#rv').innerHTML = rvCard(); });

/* ---------- mock interview ---------- */
let MK = null, MKT = null;
P.mock = () => { clearInterval(MKT); MK = null; const cats = D.interview.filter(c => c.iqs.length);
  return head('~/interview', 'Mock interview', 'Answer out loud, as you would in a real interview. Then compare with the model answer and rate yourself honestly. Weak answers go into your flashcards.') +
    `<div class="panel" id="mk"><label for="mkn">Number of questions</label><select id="mkn"><option>5</option><option selected>8</option><option>12</option></select>
    <label for="mkc">Focus</label><select id="mkc"><option value="all">Mixed (recommended)</option><option value="fast">Fast Track sprints</option>${cats.map(c => `<option value="${c.id}">${esc(c.title)}</option>`).join('')}</select>
    <div class="row" style="margin-top:16px"><button class="btn pri" id="mkgo">${ic('play')}Start interview</button><span class="small muted">About 2 minutes per question.</span></div></div>`; };
P.mock.after = () => { $('#mkgo').onclick = () => { const c = $('#mkc').value, n = +$('#mkn').value; let pool = [];
  if (c === 'all' || c === 'fast') D.fast.forEach(m => pool.push(...m.iqs)); if (c === 'all') D.interview.forEach(x => pool.push(...x.iqs)); else if (c !== 'fast') pool = D.interview.find(x => x.id === c).iqs.slice();
  MK = { qs: shuffle(pool).slice(0, n), i: 0, shown: false, rate: [], t0: Date.now() }; mkDraw(); }; };
function mkDraw() { clearInterval(MKT); const box = $('#mk'); if (!box || !MK) return; box.className = 'rv';
  if (MK.i >= MK.qs.length) { const score = MK.rate.reduce((a, r) => a + r, 0), max = MK.rate.length * 2; const weak = MK.qs.filter((q, i) => MK.rate[i] === 0);
    const s = store.get('srs', {}); weak.forEach(q => { s[hashId(q.q)] = { box: 0, due: dayNum() }; }); store.set('srs', s); window.gm && gm('mock');
    box.innerHTML = `<div class="rv-card"><div class="q">Interview complete</div><div class="qscore"><b>${Math.round(100 * score / max)}%</b><div>${score >= max * .75 ? 'Strong performance. You are close to interview-ready on this set.' : score >= max * .5 ? 'Solid base. Review the weaker answers below.' : 'Good practice. Focus on the weak answers and try again tomorrow.'}<div class="small muted">${Math.round((Date.now() - MK.t0) / 60000)} min total</div></div></div>
      ${weak.length ? `<div class="lab-h" style="margin-top:6px">${ic('target')}Added to your flashcards</div><ul class="pts">${weak.map(q => `<li>${inl(q.q)}</li>`).join('')}</ul>` : ''}
      <div class="row"><a class="btn pri" href="#/mock" onclick="route()">New interview</a><a class="btn" href="#/review">Review flashcards</a></div></div>`; return; }
  const q = MK.qs[MK.i]; const t0 = Date.now();
  box.innerHTML = `<div class="rv-meta"><span>Question ${MK.i + 1} of ${MK.qs.length}</span><span class="timer" id="mkt">0:00</span></div><div class="rv-card"><div class="q">${inl(q.q)}</div>
    ${MK.shown ? `<div class="iqb" style="padding:0"><div class="pro"><div class="lab-h">${ic('briefcase')}Model answer</div>${inl(q.a)}</div>${q.e ? `<div class="eli"><div class="lab-h">${ic('message')}Simple version</div>${inl(q.e)}</div>` : ''}</div><p class="small muted">How did your answer compare?</p>` : '<p class="muted small">Take your time. Structure: definition, how it works, an example, a trade-off.</p>'}</div>
    <div class="rv-actions">${MK.shown ? '<button class="btn" data-mk="0">Weak</button><button class="btn" data-mk="1">Okay</button><button class="btn pri" data-mk="2">Strong</button>' : '<button class="btn pri" data-mk="show">I’ve answered · show model answer</button>'}</div>`;
  if (!MK.shown) MKT = setInterval(() => { const el = $('#mkt'); if (!el) return clearInterval(MKT); const s = Math.floor((Date.now() - t0) / 1000); el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; if (s >= 120) el.style.color = 'var(--warn)'; }, 500);
}
document.addEventListener('click', e => { const b = e.target.closest('[data-mk]'); if (!b || !MK) return; if (b.dataset.mk === 'show') MK.shown = true; else { MK.rate.push(+b.dataset.mk); MK.i++; MK.shown = false; } mkDraw(); });

/* ---------- interview hub: add practice modes ---------- */
const P_interview_orig = P.interview;
P.interview = (parts, qs) => { const html = P_interview_orig(parts, qs); if (parts[0]) return html; const due = dueCount();
  const modes = `<div class="today" style="margin:0 0 30px"><a href="#/review"><b>${due}</b><span>Flashcards due · spaced repetition</span></a><a href="#/mock"><b>${ic('mic')}</b><span>Mock interview · timed, self-rated</span></a><a href="#/practice"><b>${ic('target')}</b><span>Question practice · instant feedback</span></a></div>`;
  return html.replace('</header>', '</header>' + modes).replace(/<div class="row" style="margin-bottom:16px"><a class="btn pri" href="#\/drill">[\s\S]*?<\/div>/, ''); };

/* ---------- form validation ---------- */
const RULES_V = { name: [v => v.trim().length >= 2, 'Enter your full name.'], email: [v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), 'Enter a valid email address, e.g. name@example.com'],
  phone: [v => !v || /^[+()\d\s-]{7,20}$/.test(v.trim()), 'Use digits, spaces and an optional + country code.'], summary: [v => v.length <= 450, 'Keep the summary under 450 characters (2–3 lines).'],
  headline: [v => v.length <= 120, 'Keep the headline under 120 characters.'] };
function vField(el, rule) { const [fn, msg] = rule; const ok = fn(el.value); el.setAttribute('aria-invalid', ok ? 'false' : 'true'); let err = el.nextElementSibling;
  if (!err || !err.classList?.contains('field-err')) { err = document.createElement('div'); err.className = 'field-err'; err.setAttribute('role', 'alert'); el.after(err); } err.textContent = ok ? '' : msg; err.classList.toggle('on', !ok); return ok; }
document.addEventListener('focusout', e => { const k = e.target.dataset?.k; if (k && RULES_V[k]) vField(e.target, RULES_V[k]); });
document.addEventListener('input', e => { const k = e.target.dataset?.k; if (k && RULES_V[k] && e.target.getAttribute('aria-invalid') === 'true') vField(e.target, RULES_V[k]);
  if (k === 'summary') { const c = e.target.parentElement.querySelector('.count'); if (c) c.textContent = `${e.target.value.length}/450`; } });
function resumeValid() { let ok = true, firstBad = null; for (const [k, rule] of Object.entries(RULES_V)) { const el = $(`[data-k="${k}"]`); if (el && !vField(el, rule)) { ok = false; firstBad = firstBad || el; } }
  if (!ok) { firstBad.focus(); toast('Please fix the highlighted fields first'); } return ok; }
P.resume.after = (orig => () => { orig(); const s = $('[data-k="summary"]'); if (s) s.insertAdjacentHTML('beforebegin', `<span class="count">${s.value.length}/450</span>`);
  const n = $('[data-k="name"]'); n?.previousElementSibling?.insertAdjacentHTML('beforeend', '<span class="req-star" aria-hidden="true">*</span>'); })(P.resume.after);
