# GenAI Mastery — by Harsha Varthan E P

Free, installable (PWA) platform to learn Generative AI from zero to expert.

## Publish on GitHub Pages
1. Create a new public repository (e.g. `genai-mastery`) and upload **everything in this folder** (keep the folder structure).
2. Repository → Settings → Pages → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)` → Save.
3. Wait 1–2 minutes and open `https://<username>.github.io/<repo>/`.
4. Edit `config.js`: set `supportEmail`, `siteUrl` (your Pages URL) and `certSalt`. Commit.

## Edit content (no coding needed)
All lessons live in `content/*.txt` as plain text. Edit them on GitHub and commit; the site updates automatically.
- `fast.txt` Fast Track · `complete.txt` Complete Track · `cheats.txt` cheat sheets · `interview.txt` interview bank
- `career.txt`, `next.txt`, `resources.txt`, `news.txt`, `projects.txt`, `exam.txt`
Format: `## id | icon | Title | tagline`, `### Concept | B/I/A`, then lines like `S:` simple words, `E:` example, `TIP:`, `WARN:`, `NOTE:`, `POINT:`, `ROW: term :: meaning`, `IQ: question => interview answer => simple answer`, `LINK: name :: url :: description :: tag`, code blocks with ``` fences.

After editing, open `sw.js` and change `VERSION` (e.g. `gm-v2`) so installed apps refresh.

## PDFs
`pdf/` holds the handbook and cheat-sheet PDFs. To regenerate after edits: `pip install playwright pdfplumber pypdf && playwright install chromium && python build_pdfs.py`.

## Notes
- Labs load free open-source engines from jsDelivr (Pyodide, sql.js, Transformers.js) on first use.
- The optional AI features use the learner's own free Google AI Studio key, stored only in their browser.
- Certificates are course-completion certificates issued by the author (not accredited qualifications).
