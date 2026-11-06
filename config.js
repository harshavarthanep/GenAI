/* ===== EDIT THESE BEFORE PUBLISHING ===== */
window.CONFIG = {
  appName: 'GenAI Mastery',
  author: 'Harsha Varthan E P',
  supportEmail: 'support@example.com',          // ← put your support email here
  siteUrl: '',                                   // ← e.g. 'https://yourname.github.io/genai-mastery/' (used for share links, QR codes and certificate verification)
  reviewed: 'November 2026',                    // shown on every lesson as 'Last reviewed'
  geminiModel: 'gemini-2.5-flash-lite',          // default model for the optional free Gemini key (check aistudio.google.com for current names)
  certSalt: 'change-this-to-your-own-secret-word', // ← change once before launch; changing it later invalidates old certificate IDs
  cdn: {
    pyodide: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/',
    sqljs: 'https://cdn.jsdelivr.net/npm/sql.js@1.15.1/dist/',
    transformers: 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1',
    qrcode: 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js'
  }
};
