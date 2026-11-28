/* Headless Chrome: the hub opens on a blank universe menu, and the four universes are not scene objects. */
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
  for (const c of ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']) {
    if (fs.existsSync(c)) return c;
  }
  try { return execSync('command -v google-chrome || command -v chromium || command -v chromium-browser', { encoding: 'utf8' }).trim().split('\n')[0]; }
  catch (e) { return null; }
}

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(root, rel);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.statusCode = 404; res.end('no'); return;
  }
  res.setHeader('content-type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const base = 'http://127.0.0.1:' + port;
const chrome = chromePath();
if (!chrome) { console.error('no chrome'); process.exit(1); }
const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const shotDir = process.env.UM_SHOT_DIR || '';
async function shot(name) {
  if (!shotDir) return;
  fs.mkdirSync(shotDir, { recursive: true });
  await page.screenshot({ path: path.join(shotDir, name) });
}
async function settle() {
  const p = document.getElementById('bridget-panel');
  if (p) p.hidden = true;
  const live = document.getElementById('bridget-live');
  if (live) live.dataset.on = '0';
}

await page.setViewport({ width: 1280, height: 800 });
const resp = await page.goto(base + '/um/#/', { waitUntil: 'domcontentloaded', timeout: 120000 });
if (!resp || resp.status() >= 400) { console.error('page status', resp && resp.status()); process.exit(1); }
await page.waitForFunction(() => document.body.classList.contains('um-menu') && document.querySelectorAll('#um-universes [data-universe]').length === 4, { timeout: 30000 });
const menu = await page.evaluate(() => {
  const labels = [...document.querySelectorAll('#um-universes [data-universe]')].map(b => b.textContent.trim());
  const outside = [...document.body.querySelectorAll('*')].filter(el => {
    if (el.closest('#um-universes') || el.querySelector('#um-universes')) return false;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4 && r.bottom > 0 && r.right > 0;
  }).map(el => el.id || el.className || el.tagName).slice(0, 12);
  return { labels, outside, canvas: !!document.querySelector('#stage canvas') };
});
await page.evaluate(settle);
await shot('menu-1280.png');
await page.setViewport({ width: 390, height: 844 });
await shot('menu-390.png');
await page.setViewport({ width: 1280, height: 800 });

const opened = [];
for (const key of ['finance', 'art', 'sante', 'sport']) {
  await page.click('#um-universes [data-universe="' + key + '"]');
  await page.waitForFunction(k => {
    const b = document.querySelector('#um-universes [data-universe="' + k + '"]');
    return document.body.classList.contains('um-menu') === false && b && b.getAttribute('aria-current') === 'true';
  }, { timeout: 60000 }, key);
  const info = await page.evaluate(k => {
    const gap = document.getElementById('um-universe-gap');
    let sideHits = 0;
    const world = window.__umSides || [];
    return {
      key: k,
      hash: location.hash,
      sys: (document.getElementById('sys') || {}).value || '',
      sides: world.length,
      objects: window.__umUniverseObjects || 0,
      gap: !!(gap && !gap.hidden && gap.textContent.indexOf('Univers vide') === 0),
      canvas: !!document.querySelector('#stage canvas'),
      sideHits: sideHits
    };
  }, key);
  opened.push(info);
  await page.evaluate(settle);
  await shot('univers-' + key + '-1280.png');
  await page.setViewport({ width: 390, height: 844 });
  await shot('univers-' + key + '-390.png');
  await page.setViewport({ width: 1280, height: 800 });
}

await page.goto(base + '/um/#/finance', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForFunction(() => {
  const b = document.querySelector('#um-universes [data-universe="finance"]');
  const names = [...document.querySelectorAll('#hub-nav [data-down]')].map(el => el.textContent.trim());
  const want = ['Amérique du Nord', 'Europe', 'Asie-Pacifique', 'Moyen-Orient et Afrique', 'Amérique latine'];
  return b && b.getAttribute('aria-current') === 'true' && !document.body.classList.contains('um-menu') && want.every(n => names.indexOf(n) >= 0);
}, { timeout: 60000 });
const fields = await page.evaluate(() => [...document.querySelectorAll('#hub-nav [data-down]')].map(el => el.textContent.trim()));

await browser.close();
server.close();
const report = { menu, opened, fields, errors };
console.log(JSON.stringify(report, null, 2));
const orderOk = menu.labels.join('|') === 'Finance|Art|Santé|Sport';
const clean = menu.outside.length === 0 && !menu.canvas;
const each = opened.length === 4 && opened.every(o => o.sides === 0 && o.objects === 0 && o.canvas);
const hashes = { finance: '#/finance', art: '#/art', sante: '#/sante', sport: '#/sport' };
const hashOk = opened.every(o => o.hash === hashes[o.key]);
const five = ['Amérique du Nord', 'Europe', 'Asie-Pacifique', 'Moyen-Orient et Afrique', 'Amérique latine'];
const fieldsOk = five.every(n => fields.indexOf(n) >= 0);
if (errors.length || !orderOk || !clean || !each || !hashOk || !fieldsOk || opened.some(o => o.gap)) process.exit(1);
console.log('universe menu checks passed');
