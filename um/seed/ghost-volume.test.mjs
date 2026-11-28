/* Headless Chrome: Volume and Fantôme change Class 1 and Class 2 ghost scale. Art shows the gap. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

function loadPuppeteer() {
  const candidates = [process.env.PUPPETEER_CORE, '/tmp/chrome-driver/package.json'].filter(Boolean);
  for (const pkg of candidates) {
    if (!fs.existsSync(pkg)) continue;
    try { return createRequire(pkg)('puppeteer-core'); } catch (e) {}
  }
  return createRequire(import.meta.url)('puppeteer-core');
}
const puppeteer = loadPuppeteer();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const c of ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium']) {
    if (fs.existsSync(c)) return c;
  }
  return execSync('command -v google-chrome || command -v chromium', { encoding: 'utf8' }).trim().split('\n')[0];
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(root, rel);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; res.end('no'); return; }
  res.setHeader('content-type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e.message || e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const shotDir = process.env.UM_SHOT_DIR || '';
async function shot(name) {
  if (!shotDir) return;
  fs.mkdirSync(shotDir, { recursive: true });
  await page.screenshot({ path: path.join(shotDir, name) });
}
async function quiet() {
  await page.evaluate(() => {
    const p = document.getElementById('bridget-panel'); if (p) p.hidden = true;
    const live = document.getElementById('bridget-live'); if (live) live.dataset.on = '0';
  });
}
function near(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)); }

await page.setViewport({ width: 1280, height: 800 });
await page.goto(base + '/um/#/sante', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForFunction(() => document.getElementById('scrub'), { timeout: 30000 });
await page.$eval('#scrub', el => { el.value = '650'; el.dispatchEvent(new Event('input', { bubbles: true })); });
await page.waitForFunction(() => window.__umGhostMetrics && window.__umGhostMetrics.c1n > 0 && window.__umGhostMetrics.c2n > 0, { timeout: 20000 });
await quiet();
const before = await page.evaluate(() => window.__umGhostMetrics);
await shot('ghost-x1-1280.png');
await page.setViewport({ width: 390, height: 844 });
await shot('ghost-x1-390.png');
await page.setViewport({ width: 1280, height: 800 });

await page.$eval('#volNum', el => { el.value = '2'; el.dispatchEvent(new Event('change', { bubbles: true })); });
await page.waitForFunction(() => window.__umGhostMetrics && window.__umGhostMetrics.volAll > 1.9, { timeout: 10000 });
const vol2 = await page.evaluate(() => window.__umGhostMetrics);
await quiet();
await shot('ghost-x2-1280.png');
await page.setViewport({ width: 390, height: 844 });
await shot('ghost-x2-390.png');
await page.setViewport({ width: 1280, height: 800 });

await page.click('#vol-scope-c2');
await page.$eval('#volNum', el => { el.value = '2'; el.dispatchEvent(new Event('change', { bubbles: true })); });
await page.waitForFunction(() => window.__umGhostMetrics && window.__umGhostMetrics.volC2 > 1.9, { timeout: 10000 });
const c2 = await page.evaluate(() => window.__umGhostMetrics);

await page.click('#vol-scope-all');
await page.$eval('#volNum', el => { el.value = '1'; el.dispatchEvent(new Event('change', { bubbles: true })); });
await page.click('#gvolPlus');
await page.waitForFunction(() => window.__umGhostMetrics && window.__umGhostMetrics.gAll > 1.2, { timeout: 10000 });
const fantome = await page.evaluate(() => window.__umGhostMetrics);
const nBefore = fantome.c1n;
await page.$eval('#gvol', el => { el.value = '200'; el.dispatchEvent(new Event('change', { bubbles: true })); });
await page.waitForFunction(() => window.__umGhostMetrics && window.__umGhostMetrics.gvol > 3, { timeout: 10000 });
const dense = await page.evaluate(() => window.__umGhostMetrics);

await browser.close();
server.close();
const report = { before, vol2, c2, fantome, dense, errors };
console.log(JSON.stringify(report, null, 2));
const volOk = near(vol2.c1Scale, before.c1Scale * 2, 0.05) && near(vol2.c2Scale, before.c2Scale * 2, 0.05);
const c2Ok = near(c2.c1Scale, vol2.c1Scale, 0.08) && near(c2.c2Scale, vol2.c2Scale * 2, 0.08);
const fanOk = near(fantome.c1Scale, before.c1Scale * fantome.gAll, 0.08) && near(fantome.c2Scale, before.c2Scale * fantome.gAll * fantome.volC2, 0.08);
const denOk = dense.c1n >= nBefore && dense.gvol > 3;
if (errors.length || !volOk || !c2Ok || !fanOk || !denOk) process.exit(1);
console.log('ghost volume checks passed');
