/* GenAI Mastery · motivation layer: XP, levels, streaks, badges, celebrations, country ranking.
   Every effect can be switched off in Settings → Motivation & effects. */
'use strict';
const FX_DEFAULT = { confetti: true, sound: true, haptics: true, quotes: true, xp: true, motion: true };
const fx = () => ({ ...FX_DEFAULT, ...store.get('fx', {}) });
const today = () => new Date().toLocaleDateString('en-CA');
const reducedMotion = () => !fx().motion || matchMedia('(prefers-reduced-motion: reduce)').matches;
function applyFx() { document.documentElement.classList.toggle('no-motion', !fx().motion); }

/* ---------- levels ---------- */
const LEVELS = [[0, 'Curious Beginner'], [150, 'Prompt Rookie'], [400, 'Token Tinkerer'], [800, 'Python Pathfinder'], [1400, 'Vector Voyager'],
  [2200, 'RAG Ranger'], [3200, 'Agent Architect'], [4500, 'LLM Engineer'], [6200, 'GenAI Grandmaster']];
function levelOf(xp) { let i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
  const [base, name] = LEVELS[i], next = LEVELS[i + 1]?.[0]; return { i, name, base, next, pct: next ? Math.round(100 * (xp - base) / (next - base)) : 100 }; }

/* ---------- badges ---------- */
const BADGES = {
  first: ['First step', 'Completed your first module', 'play'], five: ['On a roll', 'Completed 5 modules', 'zap'], halfway: ['Halfway hero', 'Reached 50% of a track', 'target'],
  fastdone: ['Fast finisher', 'Completed the Fast Track', 'rocket'], fulldone: ['Deep diver', 'Completed the Complete Track', 'layers'],
  python: ['Python pioneer', 'Ran code in the Python Lab', 'code'], sql1: ['SQL sleuth', 'Solved a SQL challenge', 'database'], sqlall: ['Query master', 'Solved all 8 SQL challenges', 'award'],
  rag: ['RAG builder', 'Built a vector index in the RAG Lab', 'library'], prompt: ['Prompt smith', 'Crafted a prompt in the Prompt Lab', 'pen'],
  exam: ['Certified mind', 'Passed the final exam', 'check'], ace: ['Exam ace', 'Scored 90% or more in the exam', 'sparkles'],
  proj1: ['Builder', 'Submitted your first project', 'boxes'], proj4: ['Portfolio pro', 'Submitted 4 projects', 'briefcase'],
  streak3: ['Warming up', '3-day learning streak', 'flame'], streak7: ['Unstoppable', '7-day learning streak', 'flame'], streak30: ['Habit legend', '30-day learning streak', 'flame'],
  resume: ['Job-ready', 'Built your resume', 'file'], cert: ['Graduate', 'Earned your certificate', 'award']
};
ICON.flame = '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.6 3.6-8.3.4 1.8 1.4 3 2.6 3.6.2-2.9 1.6-5.3 3.8-7.1-.3 2.9 1 4.9 2.3 6.8 1 1.5 1.7 3 1.7 4.9 0 3.7-3 6.3-7.5 6.3z"/><path d="M12 21c-1.7 0-3-1.2-3-3 0-1.6 1.2-2.6 1.8-3.9.8 1.2 2.4 1.6 3.3 3 .5.8.4 1.6.4 1.6 0 1.4-1.1 2.3-2.5 2.3z"/>';
ICON.trophy = '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4v3h-4z"/>';
function badgeSvg(id, size = 64, locked = false) { const b = BADGES[id]; return `<span class="badge ${locked ? 'locked' : ''}" style="--s:${size}px" title="${esc(b[0])}">${ic(b[2])}</span>`; }

/* ---------- quotes (original) ---------- */
const BOOSTS = ['Every expert you admire once ran their first "Hello, world".', 'One concept a day is 365 concepts a year. Small steps compound.',
  'You do not need to be a genius. You need to be consistent.', 'Confusion is not failure. It is the feeling of your brain upgrading.',
  'The best time to start learning AI was yesterday. The second best time is this module.', 'Build something small today. Portfolios are made of small wins.',
  'Bugs are proof you are trying things. Fix one and you have learned two things.', 'Interviewers hire people who can explain simply. You are practising that right now.',
  'You are not behind. You are exactly where your next step begins.', 'Curiosity beats talent when talent stops being curious.',
  'Ship it, learn from it, improve it. That is how every great AI product was built.', 'Today’s practice is tomorrow’s confidence in the interview room.',
  'Learning AI is a marathon with checkpoints. Celebrate each one.', 'The tools are free. The knowledge is here. The only missing piece is you showing up.',
  'Your future self is grateful for the 30 minutes you invest today.', 'Done is better than perfect. Mark it complete and keep moving.',
  'Teach what you just learned to someone. That is when it really sticks.', 'Every module you finish makes the next one easier.',
  'You are building skills that companies around the world are hiring for.', 'Progress, not perfection.'];
const boostOfDay = () => BOOSTS[Math.floor(Date.now() / 864e5) % BOOSTS.length];
const CHEERS = ['Brilliant work!', 'Module conquered!', 'Level-headed and levelling up!', 'Another one down!', 'You are on fire!', 'Superb progress!', 'Knowledge unlocked!'];

/* ---------- state ---------- */
function addXP(n) { const xp = store.get('xp', 0) + n; const before = levelOf(xp - n).i; store.set('xp', xp); return levelOf(xp).i > before ? levelOf(xp) : null; }
function once(key) { const k = store.get('xpkeys', {}); if (k[key]) return false; k[key] = 1; store.set('xpkeys', k); return true; }
function touchStreak() { const s = store.get('streak', { last: '', n: 0, best: 0 }); const t = today(); if (s.last === t) return null;
  const y = new Date(Date.now() - 864e5).toLocaleDateString('en-CA'); s.n = s.last === y ? s.n + 1 : 1; s.last = t; s.best = Math.max(s.best || 0, s.n); store.set('streak', s); return s.n; }
function streakNow() { const s = store.get('streak', { last: '', n: 0 }); const y = new Date(Date.now() - 864e5).toLocaleDateString('en-CA'); return (s.last === today() || s.last === y) ? s.n : 0; }
function award(id) { const b = store.get('badges', {}); if (b[id]) return false; b[id] = Date.now(); store.set('badges', b); return true; }

/* ---------- effects ---------- */
function confetti(power = 1) {
  if (!fx().confetti || reducedMotion()) return; const cv = document.createElement('canvas'); cv.className = 'confetti'; document.body.appendChild(cv);
  const dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; const x = cv.getContext('2d'); x.scale(dpr, dpr);
  const cols = document.documentElement.dataset.theme === 'light' ? ['#141414', '#6c6e70', '#2453d6', '#b9bab6', '#1f8a55'] : ['#ececea', '#85878a', '#7f9cff', '#4a4c50', '#6fcf97']; const N = Math.round(140 * power);
  const P = Array.from({ length: N }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35, vx: (Math.random() - .5) * 13 * power, vy: -Math.random() * 13 - 4,
    r: Math.random() * 6 + 3, a: Math.random() * 6.28, va: (Math.random() - .5) * .3, c: cols[Math.floor(Math.random() * cols.length)], sq: Math.random() > .5 }));
  const t0 = performance.now(), dur = 2200 + 800 * power;
  (function f(t) { const k = (t - t0) / dur; x.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of P) { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; x.save(); x.globalAlpha = Math.max(0, 1 - k); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c;
      if (p.sq) x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); else { x.beginPath(); x.arc(0, 0, p.r / 2.4, 0, 6.28); x.fill(); } x.restore(); }
    if (k < 1) requestAnimationFrame(f); else cv.remove(); })(t0);
}
let AC = null;
function chime(kind = 'small') {
  if (!fx().sound) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const notes = kind === 'big' ? [523, 659, 784, 1047, 1319] : kind === 'mid' ? [659, 784, 1047] : [784, 1047];
    notes.forEach((f, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.value = f; const t = AC.currentTime + i * .09;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .5); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + .55); }); } catch {}
}
function buzz(p = [30, 40, 30]) { if (fx().haptics && navigator.vibrate) try { navigator.vibrate(p); } catch {} }
function xpToast(n, why) { if (!fx().xp) return; toast(`+${n} XP · ${why}`); }

/* ---------- celebration modal ---------- */
function celebrate({ title, msg, xp = 0, badges = [], level = null, big = false, actions = '' }) {
  confetti(big ? 1.6 : 1); chime(big ? 'big' : 'mid'); buzz(big ? [40, 60, 40, 60, 80] : [30, 40, 30]);
  const bh = badges.map(id => `<div class="cel-badge">${badgeSvg(id, 58)}<b>${esc(BADGES[id][0])}</b><span>${esc(BADGES[id][1])}</span></div>`).join('');
  modal('', `<div class="cel ${big ? 'big' : ''}"><div class="cel-ic">${ic(big ? 'trophy' : 'check')}</div><h2>${esc(title)}</h2><p>${esc(msg)}</p>
    ${fx().xp && xp ? `<div class="cel-xp mono">+${xp} XP</div>` : ''}${level && fx().xp ? `<div class="cel-lv">Level up! You are now a <b>${esc(level.name)}</b></div>` : ''}
    ${bh ? `<div class="cel-badges">${bh}</div>` : ''}${fx().quotes ? `<p class="cel-q">“${esc(BOOSTS[Math.floor(Math.random() * BOOSTS.length)])}”</p>` : ''}
    <div class="row" style="justify-content:center;margin-top:14px">${actions}<button class="btn" data-act="close">${ic('check')}Continue</button></div></div>`);
}

/* ---------- event handling ---------- */
function checkBadges(extra = []) {
  const got = [...extra]; const done = Object.keys(store.get('done', {})).length; const pj = Object.keys(store.get('proj', {})).length; const st = streakNow();
  const rules = { first: done >= 1, five: done >= 5, halfway: trackPct('fast') >= 50 || trackPct('complete') >= 50, fastdone: trackPct('fast') === 100, fulldone: trackPct('complete') === 100,
    proj1: pj >= 1, proj4: pj >= 4, streak3: st >= 3, streak7: st >= 7, streak30: st >= 30, sqlall: Object.keys(store.get('sql.solved', {})).length >= 8 };
  for (const [id, ok] of Object.entries(rules)) if (ok && award(id)) got.push(id);
  return [...new Set(got)];
}
function gm(type, d = {}) {
  try {
    const st = touchStreak(); let xp = 0, why = '', badges = [];
    const daily = (k, n) => { if (once(`${k}:${today()}`)) { xp += n; } };
    switch (type) {
      case 'module': {
        if (once(`mod:${d.tk}:${d.id}`)) xp += 100; badges = checkBadges(); const lvl = addXP(xp); const t = TRACKS[d.tk]; const ms = D[t.file]; const k = ms.findIndex(m => m.id === d.id); const nx = ms[k + 1];
        const trackDone = trackPct(d.tk) === 100;
        celebrate({ title: trackDone ? `${t.name} complete!` : CHEERS[Math.floor(Math.random() * CHEERS.length)], big: trackDone || !!lvl, xp, level: lvl, badges,
          msg: trackDone ? 'You finished the whole track. Take the final exam and claim your certificate.' : `You completed “${ms[k].title}”. ${trackPct(d.tk)}% of the ${t.name} done.`,
          actions: trackDone ? `<a class="btn pri" href="#/exam" data-act="close-go">${ic('award')}Take the final exam</a>` : nx ? `<a class="btn pri" href="#/m/${d.tk}/${nx.id}" data-act="close-go">${ic('chev')}Next: ${esc(nx.title)}</a>` : '' });
        return;
      }
      case 'practice': if (d.on && once(`chk:${d.key}`)) { xp = 10; why = 'practice task done'; } break;
      case 'py': daily('py', 10); why = 'code run'; if (award('python')) badges.push('python'); break;
      case 'sql': if (once(`sql:${d.i}`)) { xp = 25; why = 'SQL challenge solved'; } if (award('sql1')) badges.push('sql1'); break;
      case 'rag': daily('rag', 20); why = 'vector index built'; if (award('rag')) badges.push('rag'); break;
      case 'prompt': daily('prompt', 10); why = 'prompt crafted'; if (award('prompt')) badges.push('prompt'); break;
      case 'drill': daily('drill', 5); why = 'interview drill'; break;
      case 'quiz': if (d.pct >= 60 && once(`quiz:${d.key}`)) { xp = 30; why = 'quiz passed'; } break;
      case 'mock': daily('mock', 20); why = 'mock interview'; break;
      case 'review': daily('review', 10); why = 'flashcard review'; break;
      case 'project': if (once(`proj:${d.id}`)) { xp = 150; why = 'project submitted'; } break;
      case 'resume': if (award('resume')) badges.push('resume'); break;
      case 'exam': { if (d.pct >= 70) { if (once('exam:pass')) xp += 300; if (award('exam')) badges.push('exam'); if (d.pct >= 90 && award('ace')) badges.push('ace');
          badges = checkBadges(badges); const lvl = addXP(xp); celebrate({ title: 'You passed!', msg: `You scored ${d.pct}% in the final assessment. Your certificate is one step away.`, xp, badges, level: lvl, big: true,
            actions: `<a class="btn pri" href="#/certificate" data-act="close-go">${ic('award')}Get certificate</a>` }); return; }
        toast(`${d.pct}%: so close. Review the explanations and try again.`); return; }
      case 'cert': if (once('cert')) xp = 500; if (award('cert')) badges.push('cert'); badges = checkBadges(badges);
        celebrate({ title: 'Congratulations, graduate!', msg: 'Your certificate is ready. Share it on LinkedIn and add it to your resume.', xp, badges, level: addXP(xp), big: true,
          actions: `<a class="btn pri" target="_blank" rel="noopener" href="https://www.linkedin.com/feed/?shareActive=true">${ic('share')}Share on LinkedIn</a>` }); return;
    }
    badges = checkBadges(badges); const lvl = xp ? addXP(xp) : null;
    if (lvl || badges.length) celebrate({ title: lvl ? 'Level up!' : 'Badge unlocked!', msg: lvl ? `You reached ${lvl.name}. Keep going!` : 'You earned a new achievement.', xp, badges, level: lvl, big: !!lvl });
    else if (xp) { xpToast(xp, why); if (fx().confetti && !reducedMotion() && xp >= 25) confetti(.35); chime('small'); }
    if (st && [3, 7, 14, 30, 50, 100].includes(st) && !badges.length && !lvl) setTimeout(() => celebrate({ title: `${st}-day streak!`, msg: 'Consistency is your superpower. See you tomorrow.' }), 400);
    refreshMini();
  } catch (e) { console.warn('motivation layer', e); }
}
window.gm = gm;
document.addEventListener('click', e => { if (e.target.closest('[data-act="close-go"]')) $('#mod').hidden = true; });

/* ---------- UI: home journey card, mini status, achievements page ---------- */
function journeyCard() {
  if (!fx().xp && !fx().quotes) return ''; const xp = store.get('xp', 0), L = levelOf(xp), st = streakNow(), nb = Object.keys(store.get('badges', {})).length;
  return `<section class="journey">${fx().xp ? `<div class="jr-main"><div class="ring" style="--p:${L.pct}"><span>${L.i + 1}</span></div><div><div class="mono small" style="color:var(--acc)">level ${L.i + 1} · ${xp} XP</div><h3>${esc(L.name)}</h3>
    <div class="bar" style="margin-top:8px;max-width:320px"><i style="width:${L.pct}%"></i></div><div class="small muted" style="margin-top:4px">${L.next ? `${L.next - xp} XP to ${esc(LEVELS[L.i + 1][1])}` : 'Maximum level reached'}</div></div></div>
    <div class="jr-stats"><div class="${st ? 'hot' : ''}">${ic('flame')}<b>${st}</b><span>day streak</span></div><a href="#/achievements">${ic('award')}<b>${nb}/${Object.keys(BADGES).length}</b><span>badges</span></a></div>` : ''}
    ${fx().quotes ? `<div class="jr-q">${ic('bulb')}<span><b>Daily boost</b>${esc(boostOfDay())}</span></div>` : ''}</section>`;
}
function refreshMini() { const el = $('#miniXP'); if (!el) return; if (!fx().xp) { el.hidden = true; return; } el.hidden = false; const st = streakNow();
  el.innerHTML = `${ic('flame')}<b>${st}</b><span class="sep"></span>${ic('zap')}<b>${store.get('xp', 0)}</b>`; el.classList.toggle('hot', st > 0); }
P.achievements = () => { const b = store.get('badges', {}); const xp = store.get('xp', 0), L = levelOf(xp), s = store.get('streak', { best: 0 });
  return head('~/achievements', 'Your achievements', 'Every badge marks real progress. Collect them all on your way to GenAI Grandmaster.') + journeyCard() +
    `<div class="sec-h"><h2>Badges · ${Object.keys(b).length}/${Object.keys(BADGES).length}</h2><span class="small muted mono">best streak ${s.best || 0} days</span></div>
    <div class="badges-grid">${Object.entries(BADGES).map(([id, [n, d]]) => `<div class="bdg ${b[id] ? 'got' : ''}">${badgeSvg(id, 54, !b[id])}<b>${esc(n)}</b><span>${esc(d)}</span>${b[id] ? `<em class="mono">${new Date(b[id]).toLocaleDateString()}</em>` : ''}</div>`).join('')}</div>
    <div class="sec-h"><h2>Levels</h2></div><div class="tw"><table><thead><tr><th>Level</th><th>Title</th><th>XP needed</th></tr></thead><tbody>${LEVELS.map(([x, n], i) => `<tr${i === L.i ? ' style="background:var(--acc-bg)"' : ''}><td>${i + 1}</td><td>${esc(n)}</td><td>${x}</td></tr>`).join('')}</tbody></table></div>
    <div class="sec-h"><h2>How to earn XP</h2></div><div class="tw"><table><tbody>${[['Complete a module or sprint', 100], ['Score 60%+ on a module quiz', 30], ['Mock interview (daily)', 20], ['Tick a practice task', 10], ['Solve a SQL challenge', 25], ['Submit a project link', 150], ['Pass the final exam', 300], ['Earn your certificate', 500], ['Daily lab practice (Python, RAG, prompts)', '5–20 / day']].map(([a, b]) => `<tr><td>${a}</td><td class="mono">+${b}</td></tr>`).join('')}</tbody></table></div>`; };

/* ---------- settings section ---------- */
function fxSettings() { const f = fx(); const L = [['confetti', 'Confetti celebrations', 'Bursts of confetti when you complete modules, pass exams and unlock badges'], ['sound', 'Celebration sounds', 'A short chime for achievements'],
  ['haptics', 'Vibration (mobile)', 'Gentle vibration on achievements'], ['quotes', 'Motivational messages', 'Daily boost and encouragement'], ['xp', 'XP, levels, streaks and badges', 'Gamified progress tracking'], ['motion', 'Animations', 'Typing effect, transitions and motion']];
  return `<div class="panel" style="grid-column:1/-1"><div class="lab-h">${ic('sliders')}Motivation & effects</div><div class="toggles">${L.map(([k, t, d]) => `<label class="tg"><span><b>${t}</b><small>${d}</small></span><input type="checkbox" data-fx="${k}" ${f[k] ? 'checked' : ''}><i></i></label>`).join('')}</div>
  <div class="row" style="margin-top:10px"><button class="btn sm" id="fxAll">${ic('check')}Turn all on</button><button class="btn sm" id="fxNone">${ic('x')}Turn all off</button><button class="btn sm" id="fxTest">${ic('sparkles')}Preview celebration</button></div></div>`; }
document.addEventListener('change', e => { const k = e.target.dataset?.fx; if (!k) return; const f = fx(); f[k] = e.target.checked; store.set('fx', f); applyFx(); refreshMini(); toast(`${e.target.closest('.tg').querySelector('b').textContent}: ${e.target.checked ? 'on' : 'off'}`); });
document.addEventListener('click', e => { if (e.target.closest('#fxAll,#fxNone')) { const on = !!e.target.closest('#fxAll'); store.set('fx', Object.fromEntries(Object.keys(FX_DEFAULT).map(k => [k, on]))); applyFx(); route(); }
  if (e.target.closest('#fxTest')) celebrate({ title: 'This is a celebration!', msg: 'You will see this when you finish modules, pass the exam or unlock badges.', xp: 0 }); });

/* ---------- country ranking ---------- */
const CW_PRESETS = { Balanced: [35, 25, 20, 20], 'Highest demand': [70, 10, 10, 10], 'Safety first': [20, 50, 20, 10], 'Job security': [20, 20, 50, 10], 'Easiest visa': [25, 15, 10, 50] };
function rankCountries(list, w) { const s = w.reduce((a, b) => a + b, 0) || 1; return list.map(c => ({ ...c, score: Math.round(10 * (c.demand * w[0] + c.safety * w[1] + c.security * w[2] + c.visa * w[3]) / s) }))
  .sort((a, b) => b.score - a.score || b.demand - a.demand); }
function countryTable(list, w = CW_PRESETS.Balanced) {
  const bar = v => `<span class="mbar"><i style="width:${v * 10}%"></i></span><span class="mono small">${v}</span>`;
  return `<div class="tw"><table class="ctab"><thead><tr><th>#</th><th>Country</th><th>Score</th><th>AI demand</th><th>Safety</th><th>Job security</th><th>Visa access</th></tr></thead><tbody>${rankCountries(list, w).map((c, i) => `<tr>
    <td class="mono">${i + 1}</td><td><span class="cc mono">${esc(c.code)}</span><b>${esc(c.name)}</b><div class="small muted">${esc(c.hubs)}</div></td><td><b class="mono score">${c.score}</b></td><td>${bar(c.demand)}</td><td>${bar(c.safety)}${c.gpi ? `<div class="small muted mono">GPI #${esc(c.gpi)}</div>` : ''}</td><td>${bar(c.security)}</td><td>${bar(c.visa)}</td></tr>`).join('')}</tbody></table></div>`;
}
function countryCards(list) {
  return `<div class="ccards">${list.map(c => `<section class="cpt ccard"><header><span class="cc mono">${esc(c.code)}</span><h3>${esc(c.name)}</h3><span class="tag acc mono">${c.score}</span></header><div class="cb">
    <p class="small" style="color:var(--tx2)">${esc(c.notes)}</p><table class="kv"><tbody><tr><td>Hubs</td><td>${esc(c.hubs)}</td></tr><tr><td>Work language</td><td>${esc(c.english)}</td></tr>
    <tr><td>Visa route</td><td>${esc(c.route)} · <a href="${esc(c.url)}" target="_blank" rel="noopener">official site</a></td></tr>
    <tr><td>Job portals</td><td>${c.portals.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`).join(' · ')}</td></tr></tbody></table></div></section>`).join('')}</div>`;
}
function countryPage(cur) {
  const w = store.get('cw', CW_PRESETS.Balanced); const list = cur.countries;
  return head('~/career/c-global', inl(cur.title), inl(cur.tag)) + `<div class="panel cw no-print"><div class="lab-h">${ic('sliders')}What matters most to you?</div>
    <div class="row" style="margin-bottom:8px">${Object.keys(CW_PRESETS).map(k => `<button class="btn sm" data-cwp="${k}">${k}</button>`).join('')}</div>
    <div class="cw-s">${['AI job demand', 'Safety', 'Job security', 'Visa access'].map((n, i) => `<label>${n} <span class="mono" id="cwv${i}">${w[i]}%</span><input type="range" min="0" max="100" step="5" value="${w[i]}" data-cw="${i}"></label>`).join('')}</div></div>
    <div id="ctab">${countryTable(list, w)}</div>${rModuleBody({ ...cur, items: cur.items.filter(i => i.type !== 'concept') }, cur.id)}
    <div class="sec-h"><h2>Country guides</h2></div><div id="ccards">${countryCards(rankCountries(list, w))}</div>${cur.items.filter(i => i.type === 'concept').map((c, n) => rConcept(c, `c-g.${n + 1}`)).join('')}`;
}
document.addEventListener('input', e => { const i = e.target.dataset?.cw; if (i === undefined) return; const w = store.get('cw', CW_PRESETS.Balanced).slice(); w[+i] = +e.target.value; store.set('cw', w);
  $('#cwv' + i).textContent = w[i] + '%'; const cur = D.career.find(c => c.countries?.length); $('#ctab').innerHTML = countryTable(cur.countries, w); $('#ccards').innerHTML = countryCards(rankCountries(cur.countries, w)); });
document.addEventListener('click', e => { const p = e.target.closest('[data-cwp]'); if (!p) return; store.set('cw', CW_PRESETS[p.dataset.cwp]); route(); });

/* ---------- scroll progress on lesson pages ---------- */
addEventListener('scroll', () => { const b = $('#readbar'); if (!b) return; const h = document.documentElement; const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight); b.style.transform = `scaleX(${Math.min(1, p)})`; }, { passive: true });
