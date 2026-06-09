import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3333;
const ROOT = __dirname;

const MIME = {
  html: 'text/html; charset=utf-8',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  ico: 'image/x-icon',
  woff2: 'font/woff2',
  woff: 'font/woff',
  txt: 'text/plain',
  xml: 'application/xml',
};

// ── Live-Reload via Server-Sent Events ─────────────────────────────────────
const liveReloadClients = new Set();

const LIVE_RELOAD_SCRIPT = `
<script>
(function(){
  const es = new EventSource('/__livereload');
  es.onmessage = () => location.reload();
  es.onerror = () => { es.close(); setTimeout(() => location.reload(), 2000); };
})();
</script>
</body>`;

// Watch project files and notify all connected clients
const IGNORE = /node_modules|\.git|playwright-report|test-results/;
fs.watch(ROOT, { recursive: true }, (_, filename) => {
  if (!filename || IGNORE.test(filename)) return;
  for (const res of liveReloadClients) {
    try { res.write('data: reload\n\n'); } catch (_) {}
  }
});

// ── HTTP Server ────────────────────────────────────────────────────────────
http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Live-reload SSE endpoint
  if (urlPath === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(': connected\n\n');
    liveReloadClients.add(res);
    req.on('close', () => liveReloadClients.delete(res));
    return;
  }

  // Redirect / to /de/index.html (like Vercel)
  if (urlPath === '/') {
    res.writeHead(302, { Location: '/de/index.html' });
    res.end();
    return;
  }

  let filePath = path.join(ROOT, urlPath);

  // If no extension, try adding .html or index.html
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found: ' + urlPath);
    return;
  }

  const ext = path.extname(filePath).slice(1).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  // Inject live-reload script into HTML responses
  if (ext === 'html') {
    let html = fs.readFileSync(filePath, 'utf-8');
    html = html.includes('</body>')
      ? html.replace('</body>', LIVE_RELOAD_SCRIPT)
      : html + LIVE_RELOAD_SCRIPT;
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(html);
    return;
  }

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}).listen(PORT, () => {
  console.log(`\n  SafeNet Dev Server → http://localhost:${PORT}\n  Live-Reload aktiv – Dateien werden automatisch neu geladen.\n`);
});
