/* GenAI Mastery · labs, exam, certificate, resume builder, news */
'use strict';

/* ================= LABS HUB ================= */
P.labs = () => head('~/labs', 'Practice labs', 'Real tools running inside your browser: no installation, no account, free. They also work on mobile. The first run downloads the engine once; after that it is cached.') +
  `<div class="grid">${[['python', 'code', 'Python Lab', 'Full Python 3 with NumPy, Pandas and scikit-learn, powered by Pyodide (WebAssembly).'],
    ['sql', 'database', 'SQL Lab', 'SQLite with a ready-made food-delivery and HR database, plus 8 interview challenges with auto-checking.'],
    ['rag', 'library', 'RAG Lab', 'Chunk text, create real embeddings in your browser, and run semantic search. Optional AI answers.'],
    ['prompt', 'pen', 'Prompt Lab', 'Build prompts with the R-T-C-F-R formula, then copy to any free chatbot or run with a free Gemini key.']]
    .map(([id, i, t, d]) => `<a class="tile" href="#/lab/${id}"><span class="ti">${ic(i)}</span><h3>${t}</h3><p>${d}</p></a>`).join('')}</div>
  <div class="sec-h"><h2>Prefer installing locally?</h2></div><p class="muted">Every subject has a free local option too. See <a href="#/resources">Free resources → Where to practise</a> for both options side by side.</p>`;
P.lab = ([kind]) => (LAB[kind] || LAB.python).html();
P.lab.after = ([kind]) => (LAB[kind] || LAB.python).init();
const LAB = {};

/* ---------- Python (Pyodide) ---------- */
const PY_EX = {
  'Hello AI': 'name = "Harsha"\nprint(f"Vanakkam {name}! Welcome to the Python Lab")\nfor i in range(1, 4):\n    print("step", i)',
  'Data types & dicts': 'order = {"id": 101, "food": "Biryani", "price": 280.5, "delivered": True}\nfor k, v in order.items():\n    print(k, "→", v, type(v).__name__)',
  'Two-sum (interview)': 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n\nprint(two_sum([2, 7, 11, 15], 9))',
  'Pandas analysis': 'import pandas as pd\ndf = pd.DataFrame({"city": ["Chennai","Mumbai","Chennai","Pune"], "amt": [450, 620, 210, 300]})\nprint(df.groupby("city")["amt"].agg(["count","sum","mean"]))\nprint(df.sort_values("amt", ascending=False).head(2))',
  'Machine learning': 'from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report\nX, y = load_iris(return_X_y=True)\nXtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42)\nm = RandomForestClassifier(n_estimators=100).fit(Xtr, ytr)\nprint(classification_report(yte, m.predict(Xte)))',
  'Gradient descent': 'x, lr = 0.0, 0.1\nfor step in range(30):\n    grad = 2 * (x - 3)\n    x -= lr * grad\n    if step % 5 == 0: print(step, round(x, 4))\nprint("minimum near", round(x, 3))',
  'Cosine similarity': 'import numpy as np\ndef cos(a, b): return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))\nking, queen, apple = np.array([0.9, 0.8, 0.1]), np.array([0.85, 0.82, 0.15]), np.array([0.1, 0.2, 0.95])\nprint("king~queen", round(cos(king, queen), 3))\nprint("king~apple", round(cos(king, apple), 3))',
  'Input (asks you)': 'age = int(input("Your age? "))\nprint("Next year you will be", age + 1)'
};
let PY = null;
LAB.python = {
  html: () => head('~/labs/python', 'Python Lab', 'Write and run Python here. Packages such as numpy, pandas and scikit-learn load automatically when you import them. `input()` opens a prompt box.') +
    `<div class="row" style="margin-bottom:10px"><select id="pyex" style="max-width:260px">${Object.keys(PY_EX).map(k => `<option>${k}</option>`).join('')}</select><button class="btn pri" id="pyrun">${ic('play')}Run</button><button class="btn" id="pyclr">${ic('x')}Clear output</button><span class="muted small">Ctrl/⌘ + Enter to run</span></div>
    <div class="lab"><textarea class="ed" id="pyed" spellcheck="false" aria-label="Python code"></textarea><pre class="term-out" id="pyout" aria-live="polite"><span class="sys">Output appears here.</span></pre></div>
    <p class="small muted" style="margin-top:10px">Powered by Pyodide. Local option: install Python from python.org and use VS Code. Online options: Google Colab, Kaggle Notebooks.</p>`,
  init() {
    const ed = $('#pyed'), out = $('#pyout'); const saved = sessionStorage.getItem('gm.labcode'); sessionStorage.removeItem('gm.labcode');
    ed.value = saved || store.get('py.code', PY_EX['Hello AI']); tabKeys(ed);
    $('#pyex').onchange = e => { ed.value = PY_EX[e.target.value]; };
    const log = (t, cls = '') => { if (out.querySelector('.sys:only-child')) out.innerHTML = ''; out.insertAdjacentHTML('beforeend', cls ? `<span class="${cls}">${esc(t)}</span>\n` : esc(t) + '\n'); out.scrollTop = out.scrollHeight; };
    const run = async () => { store.set('py.code', ed.value); $('#pyrun').disabled = true;
      try { if (!PY) { log('Loading Python engine (first time only, ~10 MB)…', 'sys'); await loadScript(C.cdn.pyodide + 'pyodide.js', 30000); PY = await withTimeout(loadPyodide({ indexURL: C.cdn.pyodide }), 90000, 'Timed out loading the Python engine');
          PY.runPython('import builtins, js\nbuiltins.input = lambda p="": (js.prompt(p) or "")'); log('Python ready.', 'sys'); }
        PY.setStdout({ batched: s => log(s) }); PY.setStderr({ batched: s => log(s, 'err') });
        await PY.loadPackagesFromImports(ed.value, { messageCallback: m => log(m, 'sys') });
        const r = await PY.runPythonAsync(ed.value); if (r !== undefined && r !== null) log(String(r)); window.gm && gm('py');
      } catch (e) { const m = String(e.message || e); log(/load|fetch|network/i.test(m) && !PY ? 'Could not download the Python engine. Check your internet connection and press Run again. (Offline? Try Google Colab later, or install Python locally.)' : m.split('\n').slice(-6).join('\n'), 'err'); PY = PY || null; } finally { $('#pyrun').disabled = false; } };
    $('#pyrun').onclick = run; $('#pyclr').onclick = () => { out.innerHTML = ''; };
    ed.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); } });
  }
};
function tabKeys(ed) { ed.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); const s = ed.selectionStart; ed.setRangeText('    ', s, ed.selectionEnd, 'end'); } }); }

/* ---------- SQL (sql.js) ---------- */
const SEED = `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, email TEXT);
INSERT INTO customers VALUES (1,'Asha','Chennai','asha@mail.com'),(2,'Ravi','Bengaluru','ravi@mail.com'),(3,'Meena','Chennai','meena@mail.com'),(4,'John','Mumbai','john@mail.com'),(5,'Priya','Pune','asha@mail.com'),(6,'Karthik','Chennai','karthik@mail.com');
CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER, restaurant TEXT, amount REAL, order_date TEXT);
INSERT INTO orders VALUES (101,1,'A2B',450,'2026-09-01'),(102,1,'Dominos',620,'2026-09-03'),(103,2,'Meghana',380,'2026-09-03'),(104,3,'A2B',210,'2026-09-05'),(105,7,'KFC',540,'2026-09-06'),(106,5,'Dominos',300,'2026-09-08'),(107,6,'A2B',720,'2026-09-10'),(108,2,'KFC',260,'2026-10-02'),(109,1,'Meghana',510,'2026-10-04'),(110,3,'Dominos',330,'2026-10-07');
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER, manager_id INTEGER);
INSERT INTO employees VALUES (1,'Lakshmi','Engineering',250000,NULL),(2,'Arun','Engineering',180000,1),(3,'Divya','Engineering',180000,1),(4,'Sanjay','Engineering',120000,2),(5,'Fatima','Sales',150000,NULL),(6,'Vikram','Sales',90000,5),(7,'Nisha','Sales',110000,5),(8,'Rahul','HR',95000,NULL),(9,'Anita','HR',70000,8);
CREATE TABLE logins (user_id INTEGER, d TEXT);
INSERT INTO logins VALUES (1,'2026-11-01'),(1,'2026-11-02'),(1,'2026-11-03'),(2,'2026-11-01'),(2,'2026-11-03'),(3,'2026-11-02'),(3,'2026-11-03'),(3,'2026-11-04'),(3,'2026-11-05');`;
const CHAL = [
  ['Revenue per city', 'Total order amount per customer city, highest first. Columns: city, revenue.', "SELECT c.city, SUM(o.amount) AS revenue FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.city ORDER BY revenue DESC;"],
  ['Customers with no orders', 'Names of customers who never ordered.', 'SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.order_id IS NULL;'],
  ['Second highest salary', 'The second highest distinct salary.', 'WITH r AS (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) rk FROM employees) SELECT DISTINCT salary FROM r WHERE rk = 2;'],
  ['Top 2 earners per department', 'dept, name, salary of the top 2 earners in each department (ties by name).', 'SELECT dept, name, salary FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC, name) rn FROM employees) WHERE rn <= 2;'],
  ['Running total', 'order_id, amount and running total of amount ordered by order_id.', 'SELECT order_id, amount, SUM(amount) OVER (ORDER BY order_id) AS running_total FROM orders;'],
  ['Restaurants over ₹1,000', 'Restaurants whose total revenue is more than 1000. Columns: restaurant, revenue.', 'SELECT restaurant, SUM(amount) AS revenue FROM orders GROUP BY restaurant HAVING SUM(amount) > 1000;'],
  ['Duplicate emails', 'Emails used by more than one customer, with the count.', 'SELECT email, COUNT(*) AS n FROM customers GROUP BY email HAVING COUNT(*) > 1;'],
  ['Employee and manager', 'Each employee name with their manager name (NULL if none). Columns: employee, manager.', 'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON m.id = e.manager_id;']
];
let SQLDB = null;
LAB.sql = {
  html: () => head('~/labs/sql', 'SQL Lab', 'Real SQLite running in your browser. Tables: customers, orders, employees, logins. Try the challenges: your result is checked automatically.') +
    `<div class="lab"><div><div class="row" style="margin-bottom:8px"><button class="btn pri" id="sqrun">${ic('play')}Run</button><button class="btn" id="sqschema">${ic('table')}Show tables</button><button class="btn" id="sqreset">${ic('x')}Reset data</button></div>
    <textarea class="ed" id="sqed" spellcheck="false" style="min-height:220px" aria-label="SQL query"></textarea><div id="sqmsg" class="small" style="margin:8px 0"></div><div id="sqres"></div></div>
    <div><div class="lab-h">${ic('target')}Challenges</div><div class="chal" id="chal"></div><div id="chdesc" class="co note" style="margin-top:10px;display:none"></div></div></div>
    <p class="small muted" style="margin-top:10px">Powered by sql.js. Local option: SQLite + DB Browser for SQLite. Online: SQLBolt, SQLite Online, DB Fiddle.</p>`,
  async init() {
    const ed = $('#sqed'), msg = $('#sqmsg'), res = $('#sqres'); const saved = sessionStorage.getItem('gm.labcode'); sessionStorage.removeItem('gm.labcode');
    ed.value = saved || store.get('sql.code', 'SELECT * FROM orders LIMIT 5;'); tabKeys(ed); let cur = -1; const solved = store.get('sql.solved', {});
    const drawChal = () => { if (!$('#chal')) return; $('#chal').innerHTML = CHAL.map(([t], i) => `<button class="${i === cur ? 'on' : ''}" data-ch="${i}"><span class="mono muted">${String(i + 1).padStart(2, '0')}</span>${t}${solved[i] ? `<span class="ok">${ic('check')}</span>` : ''}</button>`).join(''); };
    drawChal(); msg.textContent = 'Loading SQLite…';
    try { if (!SQLDB) { await loadScript(C.cdn.sqljs + 'sql-wasm.js'); const SQL = await withTimeout(initSqlJs({ locateFile: f => C.cdn.sqljs + f }), 30000, 'Timed out loading SQLite'); SQLDB = new SQL.Database(); SQLDB.run(SEED); } msg.textContent = 'Ready. Write a query and press Run (Ctrl/⌘ + Enter).'; }
    catch (e) { if (!msg.isConnected) return; msg.innerHTML = `<span style="color:var(--err)">Could not load SQLite: ${esc(e.message)}</span>`; return; }
    const table = r => `<div class="res-t"><table><thead><tr>${r.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${r.values.map(v => `<tr>${v.map(x => `<td>${x === null ? '<span class="muted">NULL</span>' : esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    const norm = r => (r[0]?.values || []).map(v => JSON.stringify(v.map(x => typeof x === 'number' ? Math.round(x * 100) / 100 : x))).sort().join('|');
    const run = () => { store.set('sql.code', ed.value);
      try { const t0 = performance.now(); const r = SQLDB.exec(ed.value); res.innerHTML = r.length ? r.map(table).join('') : '<p class="muted small">Query ran. No rows returned.</p>';
        msg.innerHTML = `<span class="muted">${r[0]?.values.length ?? 0} rows · ${(performance.now() - t0).toFixed(1)} ms</span>`;
        if (cur >= 0) { const ok = norm(r) === norm(SQLDB.exec(CHAL[cur][2])); msg.innerHTML += ok ? ` <span class="tag ok">${ic('check')}Correct!</span>` : ' <span class="tag">Not matching yet. Check the columns and filters.</span>';
          if (ok) { solved[cur] = 1; store.set('sql.solved', solved); drawChal(); window.gm && gm('sql', { i: cur }); } }
      } catch (e) { res.innerHTML = ''; msg.innerHTML = `<span style="color:var(--err)">${esc(e.message)}</span>`; } };
    $('#sqrun').onclick = run; ed.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); } });
    $('#sqschema').onclick = () => { ed.value = "SELECT name, sql FROM sqlite_master WHERE type = 'table';"; run(); };
    $('#sqreset').onclick = async () => { SQLDB.close(); const SQL = await initSqlJs({ locateFile: f => C.cdn.sqljs + f }); SQLDB = new SQL.Database(); SQLDB.run(SEED); toast('Data reset'); };
    $('#chal').onclick = e => { const b = e.target.closest('[data-ch]'); if (!b) return; cur = +b.dataset.ch; drawChal(); const d = $('#chdesc'); d.style.display = 'block';
      d.innerHTML = `<div class="lab-h">${ic('target')}${esc(CHAL[cur][0])}</div><p>${esc(CHAL[cur][1])}</p><button class="btn sm" id="showsol">${ic('bulb')}Show solution</button>`;
      $('#showsol').onclick = () => { ed.value = CHAL[cur][2]; }; };
  }
};

/* ---------- RAG (Transformers.js embeddings, TF-IDF fallback) ---------- */
const RAG_DOC = `Leave policy. Employees get 18 days of paid leave per year. Unused leave up to 10 days can be carried forward to the next year. Sick leave is 12 days per year and needs a doctor's note after 2 consecutive days.

Work from home. Employees may work from home 2 days a week with manager approval. During the first 3 months of probation, work from home needs HR approval.

Medical insurance. Insurance covers the employee, spouse and up to 2 children for up to ₹5 lakh per year. Parents can be added at extra cost during the enrolment window in April.

Expenses. Travel expenses must be submitted within 30 days with receipts. Meals during travel are reimbursed up to ₹1,000 per day in metro cities.

Learning budget. Every employee gets ₹30,000 per year for courses, books and certifications related to their role.`;
let EMB = null;
LAB.rag = {
  html: () => head('~/labs/rag', 'RAG Lab', 'See retrieval-augmented generation step by step. Paste any text, chunk it, embed it in your browser with a real embedding model (all-MiniLM-L6-v2), then search by meaning.') +
    `<div class="lab"><div><label for="rdoc">1 · Your document</label><textarea id="rdoc" class="ed" style="min-height:240px;white-space:pre-wrap"></textarea>
    <div class="row" style="margin-top:8px"><label style="margin:0">Chunk size (words) <input id="rsize" type="number" value="45" min="10" max="400" style="width:90px"></label><label style="margin:0">Overlap <input id="rover" type="number" value="10" min="0" max="100" style="width:80px"></label></div>
    <div class="row" style="margin-top:10px"><button class="btn pri" id="rbuild">${ic('layers')}2 · Chunk + embed</button><span id="rstat" class="small muted"></span></div></div>
    <div><label for="rq">3 · Ask a question</label><div class="row"><input id="rq" value="Can I add my parents to insurance?" style="flex:1"><button class="btn pri" id="rsearch">${ic('search')}Retrieve</button></div>
    <div id="rhits" style="margin-top:12px"></div><div id="rgen"></div></div></div>`,
  init() {
    $('#rdoc').value = store.get('rag.doc', RAG_DOC); let chunks = [], vecs = [], mode = '';
    const chunk = (t, n, o) => { const w = t.split(/\s+/).filter(Boolean); const out = []; for (let i = 0; i < w.length; i += Math.max(1, n - o)) { out.push(w.slice(i, i + n).join(' ')); if (i + n >= w.length) break; } return out; };
    const tfidf = (docs) => { const tk = s => s.toLowerCase().replace(/[^a-z0-9₹\s]/g, ' ').split(/\s+/).filter(x => x.length > 2); const D2 = docs.map(tk); const df = {}; D2.forEach(d => new Set(d).forEach(w => df[w] = (df[w] || 0) + 1));
      const vocab = Object.keys(df); const vec = d => { const v = vocab.map(w => { const f = d.filter(x => x === w).length; return f ? f * Math.log((docs.length + 1) / df[w]) : 0; }); const n = Math.hypot(...v) || 1; return v.map(x => x / n); };
      return { enc: s => vec(tk(s)), vs: D2.map(vec) }; };
    let tf = null; const cos = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
    $('#rbuild').onclick = async () => { store.set('rag.doc', $('#rdoc').value); chunks = chunk($('#rdoc').value, +$('#rsize').value, +$('#rover').value); const st = $('#rstat'); st.textContent = `${chunks.length} chunks. Loading embedding model (first time ~25 MB)…`;
      try { if (!EMB) { const T = await withTimeout(import(C.cdn.transformers), 25000, 'timeout'); EMB = await withTimeout(T.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'), 90000, 'timeout'); }
        const o = await withTimeout(EMB(chunks, { pooling: 'mean', normalize: true }), 60000, 'timeout'); vecs = o.tolist(); mode = 'embeddings (all-MiniLM-L6-v2, 384 dimensions)'; }
      catch (e) { console.warn(e); tf = tfidf(chunks); vecs = tf.vs; mode = 'TF-IDF fallback (embedding model could not load)'; }
      st.innerHTML = `<span class="tag ok">${ic('check')}${chunks.length} chunks indexed</span> <span class="small muted">${mode}</span>`; window.gm && gm('rag'); };
    $('#rsearch').onclick = async () => { if (!vecs.length) await $('#rbuild').onclick(); const q = $('#rq').value;
      let qv; if (mode.startsWith('embed')) qv = (await EMB([q], { pooling: 'mean', normalize: true })).tolist()[0]; else qv = tf.enc(q);
      const hits = chunks.map((c, i) => [cos(qv, vecs[i]), c, i]).sort((a, b) => b[0] - a[0]).slice(0, 3);
      $('#rhits').innerHTML = `<div class="lab-h">${ic('library')}Top 3 chunks by cosine similarity</div>` + hits.map(([s, c, i]) => `<div class="score"><span class="mono">#${i + 1}</span><div class="bar"><i style="width:${Math.max(4, s * 100)}%"></i></div><span class="mono">${s.toFixed(3)}</span></div><div class="co s" style="margin:-2px 0 10px"><p class="small">${esc(c)}</p></div>`).join('');
      const prompt = `Answer the question using ONLY the context. If the answer is not in the context, say "I don't know". Cite chunk numbers.\n\n<context>\n${hits.map(([, c, i]) => `[chunk ${i + 1}] ${c}`).join('\n')}\n</context>\n\nQuestion: ${q}`;
      $('#rgen').innerHTML = `<div class="lab-h">${ic('pen')}4 · Grounded prompt (augmentation)</div><div class="code"><div class="ch">prompt<span class="sp"></span><button id="rcp">${ic('copy')}Copy</button></div><pre>${esc(prompt)}</pre></div>
      <div class="row" style="margin-top:10px">${store.get('key') ? `<button class="btn pri" id="rai">${ic('sparkles')}5 · Generate answer (Gemini)</button>` : `<span class="small muted">Paste this into any free chatbot, or add a free Gemini key in Settings to generate here.</span>`}</div><div id="rans" style="margin-top:10px"></div>`;
      $('#rcp').onclick = () => copyText(prompt); if ($('#rai')) $('#rai').onclick = async () => { $('#rans').innerHTML = '<div class="ai-ans muted">Generating…</div>'; try { $('#rans').innerHTML = `<div class="ai-ans">${md(await gemini(prompt))}</div>`; } catch (e) { $('#rans').innerHTML = `<div class="co warn"><p>${esc(e.message)}</p></div>`; } }; };
  }
};

/* ---------- Prompt Lab ---------- */
const PTPL = {
  'Email reply': ['Senior customer success manager', 'Write a reply to the customer email below.', 'Customer: ordered a blue kurta, received red; support silent for 3 days.', 'Under 120 words, 3 short paragraphs.', 'Apologise once, give a clear next step, no promises of refunds beyond policy.'],
  'Explain a concept': ['Friendly AI tutor', 'Explain embeddings.', 'The learner has no programming background.', '1 simple analogy, 3 bullet points, 1 real-life example.', 'No jargon without explaining it.'],
  'Extract JSON': ['Data extraction engine', 'Extract invoice fields from the text.', 'Text: "Rmax Networks | Inv #RX-2291 | 03 Nov 2026 | Total ₹11,800 incl. GST ₹1,800"', 'Return ONLY JSON: {"vendor": str, "invoice_no": str, "date": "YYYY-MM-DD", "total": number, "gst": number}', 'Use null for missing values. No extra text.'],
  'LinkedIn post': ['LinkedIn ghostwriter for AI engineers', 'Write a post about the RAG chatbot I built.', 'Project: chatbot over 120 HR documents, 91% accuracy on a 50-question test, built with Chroma and FastAPI.', 'Hook line, 4 short lines, 3 hashtags.', 'Humble, specific, no buzzwords.']
};
LAB.prompt = {
  html: () => head('~/labs/prompt', 'Prompt Lab', 'Build a professional prompt with Role, Task, Context, Format and Rules. Then copy it into any free chatbot, or run it here with a free Gemini key.') +
    `<div class="lab"><div><select id="ptpl">${Object.keys(PTPL).map(k => `<option>${k}</option>`).join('')}</select>${['Role', 'Task', 'Context', 'Format', 'Rules'].map((f, i) => `<label for="pf${i}">${f}</label><textarea id="pf${i}" rows="${i === 2 ? 3 : 2}"></textarea>`).join('')}</div>
    <div><div class="lab-h">${ic('pen')}Assembled prompt</div><div class="code"><div class="ch">prompt<span class="sp"></span><button id="pcp">${ic('copy')}Copy</button></div><pre id="pprev"></pre></div>
    <div class="row" style="margin-top:10px"><a class="btn sm" data-open="https://claude.ai/new">Open Claude</a><a class="btn sm" data-open="https://gemini.google.com/app">Open Gemini</a><a class="btn sm" data-open="https://chatgpt.com/">Open ChatGPT</a><a class="btn sm" data-open="https://aistudio.google.com/">Open AI Studio</a></div>
    <div class="row" style="margin-top:10px">${store.get('key') ? `<button class="btn pri" id="prun">${ic('sparkles')}Run with Gemini</button>` : '<span class="small muted">Open buttons copy the prompt first, then open the free chat site.</span>'}</div><div id="pout" style="margin-top:10px"></div></div></div>`,
  init() {
    const f = i => $('#pf' + i); const build = () => `<role>You are a ${f(0).value.trim()}.</role>\n<task>${f(1).value.trim()}</task>\n<context>\n${f(2).value.trim()}\n</context>\n<format>${f(3).value.trim()}</format>\n<rules>${f(4).value.trim()}</rules>`;
    const set = k => { PTPL[k].forEach((v, i) => f(i).value = v); upd(); }; const upd = () => { $('#pprev').textContent = build(); };
    $('#ptpl').onchange = e => set(e.target.value); $$('[id^=pf]').forEach(t => t.oninput = upd); set('Email reply');
    $('#pcp').onclick = () => { copyText(build()); window.gm && gm('prompt'); };
    $$('[data-open]').forEach(a => a.onclick = async e => { e.preventDefault(); await copyText(build()); window.gm && gm('prompt'); open(a.dataset.open, '_blank', 'noopener'); });
    if ($('#prun')) $('#prun').onclick = async () => { $('#pout').innerHTML = '<div class="ai-ans muted">Running…</div>'; try { $('#pout').innerHTML = `<div class="ai-ans">${md(await gemini(build()))}</div>`; } catch (e) { $('#pout').innerHTML = `<div class="co warn"><p>${esc(e.message)}</p></div>`; } };
  }
};

/* ================= FINAL EXAM ================= */
P.exam = () => { const bank = D.exam[0].mcq; const best = store.get('exam', {});
  const pick = [...bank.keys()].sort(() => Math.random() - .5).slice(0, 25); window._exam = pick;
  return head('~/exam', 'Final assessment', `25 random questions from a bank of ${bank.length}. Score 70% or more to unlock your certificate. You can retake it any time.`) +
    (best.best != null ? `<div class="row" style="margin-bottom:14px"><span class="tag ${best.best >= 70 ? 'ok' : ''}">Best score: ${best.best}%</span>${best.passedAt ? `<span class="tag ok">${ic('check')}Passed</span>` : ''}</div>` : '') +
    `<form id="examf">${pick.map((qi, n) => { const q = bank[qi]; return `<div class="mcq" data-q="${qi}"><b>${n + 1}. ${inl(q.q)}</b>${shuffle(q.opts.map((o, j) => [o, j])).map(([o, j]) => `<label><input type="radio" name="q${qi}" value="${j}"> ${inl(o)}</label>`).join('')}<div class="ex">${inl(q.ex)}</div></div>`; }).join('')}
    <div class="row"><button class="btn pri" type="submit">${ic('check')}Submit answers</button><span id="exres"></span></div></form>`; };
P.exam.after = () => { $('#examf').onsubmit = e => { e.preventDefault(); const bank = D.exam[0].mcq; let ok = 0;
  $$('.mcq').forEach(el => { const qi = +el.dataset.q, q = bank[qi]; const sel = el.querySelector('input:checked'); el.classList.add('done');
    el.querySelectorAll('label').forEach(l => { const j = +l.querySelector('input').value; if (j === q.ans) l.classList.add('right'); else if (sel && +sel.value === j) l.classList.add('wrong'); });
    if (sel && +sel.value === q.ans) ok++; });
  const pct = Math.round(100 * ok / window._exam.length); const s = store.get('exam', {}); s.best = Math.max(s.best || 0, pct); if (pct >= 70 && !s.passedAt) s.passedAt = Date.now(); store.set('exam', s);
  $('#exres').innerHTML = `<span class="tag ${pct >= 70 ? 'ok' : ''}">${ok}/${window._exam.length} · ${pct}% ${pct >= 70 ? '· passed' : '· 70% needed'}</span>${pct >= 70 ? ` <a class="btn sm pri" href="#/certificate">${ic('award')}Get certificate</a>` : ''}`;
  $('#exres').scrollIntoView({ behavior: 'smooth', block: 'center' }); window.gm && gm('exam', { pct }); }; };

/* ================= CERTIFICATE ================= */
async function certId(name, track, date) { const b = new TextEncoder().encode(`${name.trim().toLowerCase()}|${track}|${date}|${C.certSalt}`);
  const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', b))].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase(); return `GM-${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}`; }
function reqs(tk) { const t = TRACKS[tk]; const ms = D[t.file]; const done = ms.filter(m => isDone(tk, m.id)).length; const ex = store.get('exam', {}); const pj = Object.keys(store.get('proj', {})).length;
  return [[`Complete all ${ms.length} ${tk === 'fast' ? 'sprints' : 'modules'} (${done}/${ms.length})`, done === ms.length, `#/track/${tk}`], [`Pass the final exam with 70%+ (best ${ex.best ?? 0}%)`, !!ex.passedAt, '#/exam'], [`Submit ${t.projects} project links (${pj}/${t.projects})`, pj >= t.projects, '#/projects']]; }
P.certificate = () => { const tk = store.get('certTrack', 'fast');
  return head('~/certificate', 'Your certificate', 'Earn a verifiable course-completion certificate by finishing a track, passing the final exam and submitting your projects.') +
    `<div class="row" style="margin-bottom:14px">${Object.entries(TRACKS).map(([k, t]) => `<button class="btn sm ${k === tk ? 'pri' : ''}" data-ct="${k}">${ic(t.icon)}${t.name}</button>`).join('')}</div>
    ${reqs(tk).map(([t, ok, h]) => `<a class="req ${ok ? 'ok' : ''}" href="${h}">${ic(ok ? 'check' : 'dot')}<span>${t}</span>${ic('chev')}</a>`).join('')}
    <label for="cname">Full name as it should appear</label><div class="row"><input id="cname" maxlength="60" value="${esc(store.get('certName', ''))}" placeholder="e.g. Harsha Varthan E P" style="flex:1;min-width:220px"><button class="btn pri" id="cgen">${ic('award')}Generate certificate</button></div><div class="field-err" id="cnerr" role="alert"></div>
    <div class="cert-wrap" style="margin-top:16px"><canvas id="ccv" width="1754" height="1240" style="display:none"></canvas></div><div class="row no-print" id="cact" style="margin-top:12px;display:none"><button class="btn pri" id="cpng">${ic('download')}Download PNG</button><button class="btn" id="cpdf">${ic('print')}Save as PDF</button><button class="btn" id="cshare">${ic('share')}Copy verify link</button></div>
    <p class="small muted" style="margin-top:14px">This is a course-completion certificate issued by ${esc(C.author)}. Anyone can confirm it on the verify page using the name, track, date and certificate ID.</p>`; };
P.certificate.after = () => {
  $$('[data-ct]').forEach(b => b.onclick = () => { store.set('certTrack', b.dataset.ct); route(); });
  $('#cgen').onclick = async () => { const tk = store.get('certTrack', 'fast'); const name = $('#cname').value.trim().replace(/\s+/g, ' '); const cn = $('#cname'); const okN = /^[\p{L}][\p{L} .'-]{1,59}$/u.test(name); cn.setAttribute('aria-invalid', okN ? 'false' : 'true'); $('#cnerr').textContent = okN ? '' : 'Enter your full name using letters only (2–60 characters).'; $('#cnerr').classList.toggle('on', !okN); if (!okN) return cn.focus();
    if (!reqs(tk).every(r => r[1])) return toast('Complete all three requirements first');
    store.set('certName', name); const issued = store.get('certIssued', {}); const date = issued[tk] || new Date().toISOString().slice(0, 10); issued[tk] = date; store.set('certIssued', issued);
    const id = await certId(name, tk, date); const url = `${C.siteUrl || location.href.split('#')[0]}#/verify?n=${encodeURIComponent(name)}&t=${tk}&d=${date}&id=${id}`;
    const opts = { name, track: TRACKS[tk].name, date, id, url }; await drawCert($('#ccv'), opts); $('#ccv').style.display = 'block'; $('#cact').style.display = 'flex'; addQR($('#ccv'), url); window.gm && gm('cert');
    $('#cpng').onclick = () => { const a = document.createElement('a'); a.href = $('#ccv').toDataURL('image/png'); a.download = `GenAI_Mastery_Certificate_${name.replace(/\s+/g, '_')}.png`; a.click(); };
    $('#cpdf').onclick = () => { const v = $('#view'); v.insertAdjacentHTML('beforeend', `<div class="print-target"><img src="${$('#ccv').toDataURL('image/png')}" alt="certificate"></div>`); document.body.classList.add('print-cert'); setTimeout(() => { print(); document.body.classList.remove('print-cert'); $('.print-target')?.remove(); }, 200); };
    $('#cshare').onclick = () => copyText(url); };
};
async function drawCert(cv, o) {
  await withTimeout(document.fonts.ready, 3000, 'fonts').catch(() => {}); const x = cv.getContext('2d'), W = cv.width, H = cv.height;
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#141414'; x.fillRect(0, 0, 150, H); // side band
  x.strokeStyle = 'rgba(255,255,255,.10)'; x.lineWidth = 1; for (let y = 40; y < H; y += 40) { x.beginPath(); x.moveTo(20, y); x.lineTo(130, y); x.stroke(); }
  const g = '#141414'; x.fillStyle = g; x.fillRect(150, 0, W - 150, 10); x.fillRect(150, H - 10, W - 150, 10);
  x.strokeStyle = '#d8dfeb'; x.lineWidth = 2; x.strokeRect(200, 60, W - 260, H - 120);
  const L = 270; x.fillStyle = '#6c6e70'; x.font = '600 26px Inter'; x.fillText('GENAI MASTERY', L, 160);
  x.fillStyle = '#0c1424'; x.font = '700 76px Inter'; x.fillText('Certificate of Completion', L, 260);
  x.fillStyle = '#5f6b85'; x.font = '400 30px Inter'; x.fillText('This certifies that', L, 350);
  x.fillStyle = '#0c1424'; let fs = 96; x.font = `700 ${fs}px Inter`; while (x.measureText(o.name).width > W - L - 300 && fs > 50) { fs -= 4; x.font = `700 ${fs}px Inter`; } x.fillText(o.name, L, 470);
  x.fillStyle = g; x.fillRect(L, 500, Math.min(x.measureText(o.name).width, W - L - 300), 5);
  x.fillStyle = '#34405a'; x.font = '400 32px Inter'; x.fillText(`has successfully completed the ${o.track} of`, L, 580);
  x.fillStyle = '#0c1424'; x.font = '600 44px Inter'; x.fillText(`${C.appName}: Generative AI from Zero to Expert`, L, 645);
  x.fillStyle = '#5f6b85'; x.font = '400 26px Inter'; x.fillText('including all modules, the final assessment (70%+) and hands-on capstone projects.', L, 700);
  x.fillStyle = '#0c1424'; x.font = '600 30px Inter'; x.fillText(C.author, L, 930); x.fillStyle = '#5f6b85'; x.font = '400 22px Inter'; x.fillText('Course author', L, 965);
  x.strokeStyle = '#0c1424'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(L, 890); x.lineTo(L + 420, 890); x.stroke();
  x.fillStyle = '#0c1424'; x.font = '600 30px Inter'; x.fillText(new Date(o.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), L + 560, 930);
  x.fillStyle = '#5f6b85'; x.font = '400 22px Inter'; x.fillText('Date of issue', L + 560, 965); x.beginPath(); x.moveTo(L + 560, 890); x.lineTo(L + 900, 890); x.stroke();
  x.fillStyle = '#6c6e70'; x.font = '500 22px "JetBrains Mono"'; x.fillText(`Certificate ID ${o.id}`, L, 1100);
}
async function addQR(cv, url) { const x = cv.getContext('2d'), W = cv.width, H = cv.height;
  try { await loadScript(C.cdn.qrcode, 8000); const q = qrcode(0, 'M'); q.addData(url); q.make(); const n = q.getModuleCount(), s = Math.floor(230 / n), X0 = W - 120 - n * s, Y0 = H - 140 - n * s;
    x.fillStyle = '#0c1424'; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) x.fillRect(X0 + c * s, Y0 + r * s, s, s);
    x.fillStyle = '#5f6b85'; x.font = '400 18px Inter'; x.fillText('Scan to verify', X0, Y0 + n * s + 28); } catch { x.fillStyle = '#5f6b85'; x.font = '400 18px Inter'; x.fillText('Verify at the certificate page using the ID', W - 520, H - 110); }
}
P.verify = async (_, q) => { const n = q.get('n') || '', t = q.get('t') || '', d = q.get('d') || '', id = q.get('id') || '';
  const ok = n && TRACKS[t] && id === await certId(n, t, d);
  return head('~/verify', 'Verify a certificate', 'Checks that the certificate details match the ID issued by this platform.') +
    `<div class="panel"><form id="vf" class="grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))"><div><label>Name</label><input name="n" value="${esc(n)}"></div><div><label>Track</label><select name="t"><option value="fast" ${t === 'fast' ? 'selected' : ''}>Fast Track</option><option value="complete" ${t === 'complete' ? 'selected' : ''}>Complete Track</option></select></div><div><label>Date (YYYY-MM-DD)</label><input name="d" value="${esc(d)}"></div><div><label>Certificate ID</label><input name="id" value="${esc(id)}"></div></form>
    <div class="row" style="margin-top:12px"><button class="btn pri" id="vbtn">${ic('shield')}Verify</button>${n ? (ok ? `<span class="tag ok">${ic('check')}Valid certificate: ${esc(n)}, ${TRACKS[t].name}, ${esc(d)}</span>` : '<span class="tag" style="color:var(--err)">Details do not match an issued ID</span>') : ''}</div></div>`; };
P.verify.after = () => { $('#vbtn').onclick = () => { const f = new FormData($('#vf')); location.hash = `#/verify?${new URLSearchParams(f)}`; }; };

/* ================= RESUME BUILDER ================= */
const RS0 = { name: '', headline: '', email: '', phone: '', location: '', links: '', summary: '', skills: '', exp: [], proj: [], edu: [], certs: '' };
const RS_EX = { name: 'Priya Raman', headline: 'GenAI Engineer · RAG · Agents · Python', email: 'priya@email.com', phone: '+91 90000 00000', location: 'Chennai, India', links: 'linkedin.com/in/priya · github.com/priya · priya.dev',
  summary: 'GenAI engineer who builds grounded, measurable LLM applications. Shipped 5 projects including a RAG assistant with 91% answer accuracy and a research agent with tool calling.',
  skills: 'Languages: Python, SQL, JavaScript (basic)\nGenAI: Prompt engineering, RAG, embeddings, agents, tool calling, evaluation, LoRA\nFrameworks: LangChain, LangGraph, LlamaIndex, Hugging Face\nData & Ops: Pandas, PostgreSQL, pgvector, Chroma, FastAPI, Streamlit, Docker, Git',
  exp: [{ t: 'Analyst, PMO Operations', o: 'Company Name', d: 'Jul 2024 – Present', b: 'Automated weekly reporting with Python and an LLM summariser, cutting preparation from 5 hours to 40 minutes\nBuilt a SQL dashboard tracking 40+ projects, improving on-time delivery visibility for 6 managers' }],
  proj: [{ t: 'HR Policy RAG Assistant', o: 'github.com/priya/hr-rag', d: '2026', b: 'Indexed 120 policy documents with hybrid search and reranking; 91% accuracy on a 50-question golden set\nAdded citations, PII masking and an "I don\'t know" fallback; deployed on Hugging Face Spaces' },
    { t: 'Research Agent', o: 'github.com/priya/research-agent', d: '2026', b: 'LangGraph agent with search and reader tools producing cited briefs; step and cost limits with full tracing' }],
  edu: [{ t: 'B.E. Computer Science', o: 'University Name', d: '2019 – 2023', b: '' }], certs: 'GenAI Mastery — Complete Track (2026)' };
P.resume = () => head('~/career/resume', 'Resume builder', 'Single-column, ATS-friendly resume. Everything is saved on this device. Use the XYZ bullet formula: accomplished X, measured by Y, by doing Z.') +
  `<div class="row no-print" style="margin-bottom:14px"><button class="btn pri" id="rprint">${ic('download')}Download PDF</button><button class="btn" id="rex">${ic('sparkles')}Load example</button><button class="btn" id="rjson">${ic('file')}Export JSON</button><label class="btn" style="margin:0">${ic('file')}Import JSON<input type="file" id="rimp" accept="application/json" hidden></label><button class="btn" id="rclr">${ic('x')}Clear</button></div>
  <div class="rb"><form id="rform" class="no-print"></form><div class="paper-wrap print-target"><div class="resume-paper" id="rpaper"></div></div></div>`;
P.resume.after = () => {
  let R = { ...RS0, ...store.get('resume', RS0) }; const F = $('#rform');
  const fld = (k, l, ta) => `<label>${l}</label>${ta ? `<textarea data-k="${k}" rows="${ta}">${esc(R[k])}</textarea>` : `<input data-k="${k}" value="${esc(R[k])}">`}`;
  const lst = (k, l, ph) => `<fieldset><legend>${l}</legend>${R[k].map((e, i) => `<div class="ent"><div class="grid" style="grid-template-columns:1fr 1fr;gap:8px"><div><label>${ph[0]}</label><input data-l="${k}" data-i="${i}" data-f="t" value="${esc(e.t)}"></div><div><label>${ph[1]}</label><input data-l="${k}" data-i="${i}" data-f="o" value="${esc(e.o)}"></div></div><label>Dates</label><input data-l="${k}" data-i="${i}" data-f="d" value="${esc(e.d)}"><label>Bullets (one per line)</label><textarea data-l="${k}" data-i="${i}" data-f="b" rows="3">${esc(e.b)}</textarea><button type="button" class="btn sm" data-del="${k}:${i}" style="margin-top:6px">${ic('x')}Remove</button></div>`).join('')}<button type="button" class="btn sm" data-add="${k}" style="margin-top:10px">${ic('dot')}Add ${l.toLowerCase().replace(/s$/, '')}</button></fieldset>`;
  const form = () => { F.innerHTML = `<fieldset><legend>Header</legend>${fld('name', 'Full name')}${fld('headline', 'Headline')}<div class="grid" style="grid-template-columns:1fr 1fr;gap:8px"><div>${fld('email', 'Email')}</div><div>${fld('phone', 'Phone')}</div></div>${fld('location', 'Location')}${fld('links', 'Links (separate with ·)')}</fieldset>
    <fieldset><legend>Summary</legend>${fld('summary', '2–3 lines', 3)}</fieldset><fieldset><legend>Skills</legend>${fld('skills', 'One group per line, e.g. "GenAI: RAG, agents"', 4)}</fieldset>
    ${lst('exp', 'Experience', ['Title', 'Company'])}${lst('proj', 'Projects', ['Project', 'Link'])}${lst('edu', 'Education', ['Degree', 'Institution'])}<fieldset><legend>Certifications</legend>${fld('certs', 'One per line', 2)}</fieldset>`; };
  const bl = s => s.split('\n').map(x => x.trim()).filter(Boolean);
  const paper = () => { const sec = (t, h) => h ? `<h2>${t}</h2>${h}` : ''; const ent = a => a.map(e => `<div class="it"><div class="top2">${esc(e.t)}${e.o ? ` — ${esc(e.o)}` : ''}<span>${esc(e.d)}</span></div>${bl(e.b).length ? `<ul>${bl(e.b).map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}</div>`).join('');
    $('#rpaper').innerHTML = `<h1>${esc(R.name || 'Your Name')}</h1><div class="hl">${esc(R.headline)}</div><div class="ct">${[R.email, R.phone, R.location, R.links].filter(Boolean).map(esc).join(' · ')}</div>
    ${sec('Summary', R.summary ? `<p>${esc(R.summary)}</p>` : '')}${sec('Skills', bl(R.skills).map(s => { const [a, ...b] = s.split(':'); return b.length ? `<div><b>${esc(a)}:</b>${esc(b.join(':'))}</div>` : `<div>${esc(s)}</div>`; }).join(''))}
    ${sec('Experience', ent(R.exp))}${sec('Projects', ent(R.proj))}${sec('Education', ent(R.edu))}${sec('Certifications', bl(R.certs).map(c => `<div>${esc(c)}</div>`).join(''))}`; };
  const save = () => { store.set('resume', R); paper(); if (R.name && (R.exp.length || R.proj.length) && window.gm) gm('resume'); }; form(); paper();
  F.oninput = e => { const t = e.target; if (t.dataset.k) R[t.dataset.k] = t.value; else if (t.dataset.l) R[t.dataset.l][+t.dataset.i][t.dataset.f] = t.value; save(); };
  F.onclick = e => { const a = e.target.closest('[data-add],[data-del]'); if (!a) return; if (a.dataset.add) R[a.dataset.add].push({ t: '', o: '', d: '', b: '' }); else { const [k, i] = a.dataset.del.split(':'); R[k].splice(+i, 1); } save(); form(); };
  $('#rex').onclick = () => { R = JSON.parse(JSON.stringify(RS_EX)); save(); form(); };
  $('#rclr').onclick = () => { if (confirm('Clear the resume?')) { R = JSON.parse(JSON.stringify(RS0)); save(); form(); } };
  $('#rprint').onclick = () => { if (typeof resumeValid === 'function' && !resumeValid()) return; document.body.classList.add('print-resume'); const old = document.title; document.title = (R.name || 'Resume').replace(/\s+/g, '_') + '_Resume'; setTimeout(() => { print(); document.body.classList.remove('print-resume'); document.title = old; }, 100); };
  $('#rjson').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(R, null, 1)], { type: 'application/json' })); a.download = 'resume.json'; a.click(); };
  $('#rimp').onchange = async e => { try { R = { ...RS0, ...JSON.parse(await e.target.files[0].text()) }; save(); form(); } catch { toast('Invalid file'); } };
};

/* ================= NEWS ================= */
P.news = () => head('~/news', 'AI news & new tools', 'Live feeds refresh automatically (cached for 1 hour). Curated launches and trusted sources are below. Always open the original source to confirm details.') +
  `<div class="sec-h"><h2>Live: trending AI stories</h2><span class="small muted mono">Hacker News</span></div><div class="feed" id="f-hn"><p class="muted small">Loading…</p></div>
  <div class="sec-h"><h2>Live: new trending AI repositories</h2><span class="small muted mono">GitHub</span></div><div class="feed" id="f-gh"><p class="muted small">Loading…</p></div>
  <div class="sec-h"><h2>Live: trending open models</h2><span class="small muted mono">Hugging Face</span></div><div class="feed" id="f-hf"><p class="muted small">Loading…</p></div>
  ${D.news.map(n => `<div class="sec-h"><h2>${inl(n.title)}</h2></div><p class="muted small">${inl(n.tag)}</p>${n.items.map(rPart).join('')}`).join('')}`;
P.news.after = () => {
  const cached = async (k, url, map) => { const c = store.get('feed.' + k); if (c && Date.now() - c.t < 3600e3) return c.v; const r = await fetch(url); if (!r.ok) throw new Error(r.status); const v = map(await r.json()); store.set('feed.' + k, { t: Date.now(), v }); return v; };
  const show = (id, items, src) => { if (!$(id)) return; $(id).innerHTML = items.length ? items.map(i => `<a href="${esc(i.u)}" target="_blank" rel="noopener">${esc(i.t)}<span>${esc(i.m)}</span></a>`).join('') : '<p class="muted small">Nothing new right now.</p>'; };
  const fail = (id, src) => { if (!$(id)) return; $(id).innerHTML = `<p class="muted small">Could not load the live feed. <a href="${src}" target="_blank" rel="noopener">Open the source</a></p>`; };
  const week = Math.floor(Date.now() / 1000) - 7 * 86400, month = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  cached('hn', `https://hn.algolia.com/api/v1/search?query=AI&tags=story&numericFilters=created_at_i>${week},points>80&hitsPerPage=12`, j => j.hits.map(h => ({ t: h.title, u: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, m: `${h.points} pts` })))
    .then(v => show('#f-hn', v)).catch(() => fail('#f-hn', 'https://news.ycombinator.com'));
  cached('gh', `https://api.github.com/search/repositories?q=topic:llm+created:>${month}&sort=stars&order=desc&per_page=10`, j => j.items.map(r => ({ t: `${r.full_name}: ${r.description || ''}`.slice(0, 140), u: r.html_url, m: `★ ${r.stargazers_count}` })))
    .then(v => show('#f-gh', v)).catch(() => fail('#f-gh', 'https://github.com/topics/llm'));
  cached('hf', 'https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=12', j => j.map(m => ({ t: m.id || m.modelId, u: `https://huggingface.co/${m.id || m.modelId}`, m: m.pipeline_tag || 'model' })))
    .then(v => show('#f-hf', v)).catch(() => fail('#f-hf', 'https://huggingface.co/models?sort=trending'));
};
