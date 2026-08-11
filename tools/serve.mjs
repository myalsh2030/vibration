// خادم ثابت بسيط لتصفح الموقع محليًا (خادم بايثون يفشل مع أسماء أجهزة عربية على ويندوز)
// الاستخدام: node tools/serve.mjs [مسار جذر الموقع] [منفذ]
import http from 'http';
import { readFile } from 'fs/promises';
import { join, extname, normalize, resolve } from 'path';

const ROOT = resolve(process.argv[2] || '.');
const PORT = Number(process.argv[3]) || 8123;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2', '.md': 'text/markdown; charset=utf-8',
};

http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = normalize(join(ROOT, p));
    const rootNorm = normalize(ROOT).replace(/\\/g, '/');
    if (!file.replace(/\\/g, '/').startsWith(rootNorm)) { res.writeHead(403); res.end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(PORT, '127.0.0.1', () => console.log(`serving ${ROOT} on http://127.0.0.1:${PORT}`));
