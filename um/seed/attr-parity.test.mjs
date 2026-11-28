/* Headless: attributes, Gaussian bounds, Lancer, and the shared click dispatcher. */
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
  for (const c of ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium']) if (fs.existsSync(c)) return c;
  return execSync('command -v google-chrome || command -v chromium', { encoding: 'utf8' }).trim().split('\n')[0];
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
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
const ids = ['left', 'rack', 'gauss', 'asel', 'ztab', 'resetCut', 'thr', 'thrW', 'thrBox', 'vol', 'volNum', 'mFourier', 'mFree', 'session', 'tgL', 'tgR'];

await page.setViewport({ width: 1280, height: 800 });
await page.goto(base + '/um/#/sante', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForSelector('#rack .tile', { timeout: 30000 });
await page.evaluate(() => { try { localStorage.setItem('um.noL', '0'); } catch (e) {} });
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForSelector('#tgL', { timeout: 30000 });
const reopen = await page.evaluate(() => {
  const hidden = document.querySelector('.app').classList.contains('noL');
  const btn = document.getElementById('tgL').getBoundingClientRect();
  return { hidden, btnW: btn.width };
});
if (reopen.hidden) await page.click('#tgL');
await page.click('#rack .tile');
await page.waitForFunction(() => document.querySelector('.app').classList.contains('gOpen'), { timeout: 10000 });
const gauss = await page.evaluate((ids) => {
  const box = document.getElementById('gauss').getBoundingClientRect();
  const hiddenOk = ['mFourier', 'mFree', 'session', 'thr', 'thrW', 'thrBox'];
  const present = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) { present[id] = false; return; }
    present[id] = hiddenOk.indexOf(id) >= 0 ? true : getComputedStyle(el).display !== 'none';
  });
  return {
    present,
    open: document.querySelector('.app').classList.contains('gOpen'),
    w: box.width, h: box.height,
    rows: document.querySelectorAll('#ztab tr').length,
    lock: document.getElementById('lockmsg').textContent
  };
}, ids);
await page.evaluate(() => { const p = document.getElementById('bridget-panel'); if (p) p.hidden = true; });
await shot('gauss-1280.png');
await page.setViewport({ width: 390, height: 844 });
await shot('gauss-390.png');
await page.setViewport({ width: 1280, height: 800 });

const bounds = await page.evaluate(() => {
  const before = document.getElementById('lockmsg').textContent;
  const gc = document.getElementById('gauss');
  const r = gc.getBoundingClientRect();
  const down = new PointerEvent('pointerdown', { bubbles: true, clientX: r.left + r.width * 0.4, clientY: r.top + 30, pointerId: 1 });
  gc.dispatchEvent(down);
  gc.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: r.left + r.width * 0.55, clientY: r.top + 30, pointerId: 1 }));
  gc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: r.left + r.width * 0.55, clientY: r.top + 30, pointerId: 1 }));
  const thr = document.getElementById('thr');
  thr.value = '5';
  thr.dispatchEvent(new Event('change', { bubbles: true }));
  const thrW = document.getElementById('thrW');
  thrW.value = 'eq';
  thrW.dispatchEvent(new Event('change', { bubbles: true }));
  return { before, after: document.getElementById('lockmsg').textContent, thr: window.__umThr, thrW: window.__umThrW };
});

const parity = await page.evaluate(() => {
  if (window.__umMoreText) window.__umMoreText('fiche');
  const btn = document.querySelector('#fiche [data-sel], #um-u-c2 [data-c2]');
  if (!btn || !window.__umAct) return { ok: false, reason: 'missing', fiche: (document.getElementById('fiche') || {}).textContent ? (document.getElementById('fiche').textContent || '').slice(0, 80) : '' };
  const parts = btn.dataset.sel ? btn.dataset.sel.split(':').map(Number) : [2, +btn.dataset.c2];
  const seen = [];
  const orig = window.__umAct;
  window.__umAct = function (cmd) { seen.push(JSON.parse(JSON.stringify(cmd))); return orig(cmd); };
  const direct = orig({ clicks: 1, kind: parts[0], idx: parts[1] });
  btn.click();
  btn.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
  const idn = orig({ action: 'identify', kind: parts[0], idx: parts[1] });
  const more = orig({ action: 'more', id: 'fiche' });
  window.__umAct = orig;
  const panel = seen.filter(c => c.clicks === 1 || c.clicks === 2);
  return {
    direct: { action: direct.action, kind: direct.kind, idx: direct.idx },
    panel: panel.map(c => ({ clicks: c.clicks, kind: c.kind, idx: c.idx })),
    identify: idn && idn.action,
    more: typeof more.text === 'string' && more.text.length > 0
  };
});

const brigitte = await page.evaluate(async () => {
  if (!window.BridgetDemo || !window.BridgetDemo.ask) return { ok: false };
  await window.BridgetDemo.ask('mets le volume à 1.5');
  return { vol: document.getElementById('volNum').value, hook: typeof window.__umAct === 'function' };
});

await browser.close();
server.close();
const report = { reopen, gauss, bounds, parity, brigitte, errors };
console.log(JSON.stringify(report, null, 2));
const idsOk = Object.values(gauss.present).every(Boolean);
const gaussOk = gauss.open && gauss.w > 40 && gauss.h > 40 && gauss.rows >= 5;
const thrOk = bounds.thr === 5 && bounds.thrW === 'eq';
const same = parity.panel && parity.panel.some(c => c.clicks === 1 && c.kind === parity.direct.kind && c.idx === parity.direct.idx)
  && parity.panel.some(c => c.clicks === 2 && c.kind === parity.direct.kind && c.idx === parity.direct.idx);
const actOk = parity.identify === 'identify' && parity.more;
const volOk = brigitte.hook && String(brigitte.vol).indexOf('1.5') === 0;
const toggleOk = reopen.btnW > 0;
if (errors.length || !idsOk || !gaussOk || !thrOk || !same || !actOk || !volOk || !toggleOk) process.exit(1);
console.log('attribute parity checks passed');
