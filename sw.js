/* GenAI Mastery service worker. Bump VERSION after you edit any file so users get the update. */
const VERSION = 'gm-v3';
const SHELL = ['./', 'index.html', 'styles.css', 'config.js', 'app.js', 'labs.js', 'fun.js', 'ux.js', 'manifest.webmanifest',
  'fonts/Inter.woff2', 'fonts/JetBrainsMono.woff2', 'icons/icon.svg', 'icons/icon-192.png',
  ...['quiz', 'complete', 'fast', 'cheats', 'interview', 'career', 'next', 'resources', 'news', 'exam', 'projects'].map(f => `content/${f}.txt`)];
const LIVE = /hn\.algolia\.com|api\.github\.com|huggingface\.co\/api|generativelanguage\.googleapis\.com/;
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== 'gm-cdn').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return; const url = new URL(req.url);
  if (LIVE.test(url.href)) return;                                   // live data: always network
  if (url.origin === location.origin) {                              // app files: stale-while-revalidate
    e.respondWith(caches.open(VERSION).then(async c => { const hit = await c.match(req, { ignoreSearch: true });
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net; }));
    return;
  }
  if (/cdn\.jsdelivr\.net|huggingface\.co|hf\.co/.test(url.host)) {  // lab engines & models: cache-first
    e.respondWith(caches.open('gm-cdn').then(async c => (await c.match(req)) || fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; })));
  }
});
