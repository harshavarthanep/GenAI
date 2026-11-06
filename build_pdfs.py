"""Regenerate pdf/*.pdf from the live app's print routes. Run from this folder."""
import http.server, threading, functools, re, pathlib, sys, pdfplumber
from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter
ROOT = pathlib.Path(__file__).parent; PORT = 8765
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Q, directory=str(ROOT)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
ids = re.findall(r'^## (\S+) \|', (ROOT / 'content/cheats.txt').read_text(encoding='utf-8'), re.M)
def meta(path, title):
    r = PdfReader(str(path)); w = PdfWriter(clone_from=r); w.add_metadata({'/Title': title, '/Author': 'Harsha Varthan E P', '/Creator': 'Harsha Varthan E P', '/Producer': 'GenAI Mastery'})
    with open(path, 'wb') as f: w.write(f)
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page()
    def render(route, out, fill=None):
        pg.goto(f'http://127.0.0.1:{PORT}/index.html{route}'); pg.wait_for_function('window.__printReady === true', timeout=60000)
        pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(400)
        if fill: pg.evaluate('m => { for (const [k, v] of Object.entries(m)) { const e = document.querySelector(`[data-pg="${k}"]`); if (e) e.textContent = v; } }', fill)
        pg.pdf(path=str(out), print_background=True, prefer_css_page_size=True)
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'; found = {}
    for i in (ids if what in ('all', 'cheats') else []):
        render(f'#/print/cheat/{i}', ROOT / f'pdf/cheat-{i}.pdf'); meta(ROOT / f'pdf/cheat-{i}.pdf', f'GenAI Mastery cheat sheet: {i}')
    if what in ('all', 'cheats'): render('#/print/cheats', ROOT / 'pdf/GenAI_Mastery_All_Cheat_Sheets.pdf'); meta(ROOT / 'pdf/GenAI_Mastery_All_Cheat_Sheets.pdf', 'GenAI Mastery: All Cheat Sheets')
    if what in ('all', 'handbook'):
        hb = ROOT / 'pdf/GenAI_Mastery_Handbook.pdf'; render('#/print/handbook', hb)
        import subprocess
        pages = subprocess.run(['pdftotext', '-layout', str(hb), '-'], capture_output=True, text=True).stdout.split('\f')
        for n, t in enumerate(pages, 1):
            for m in re.findall(r'Part (\d\d)', t): found.setdefault(f'ps{int(m)-1}', str(n))
        render('#/print/handbook', hb, found); meta(hb, 'GenAI Mastery: The Complete Handbook')
    br.close()
srv.shutdown(); print('done', what, found)
