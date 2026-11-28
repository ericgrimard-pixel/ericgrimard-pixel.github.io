/* Headless Chrome: the model hook loads in the browser, and a local fake server can be plugged in. */
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
  if (url.pathname === '/fake-model') {
    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', () => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ text: 'réponse du faux modèle' }));
    });
    return;
  }
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
await page.setViewport({ width: 1280, height: 800 });
const resp = await page.goto(base + '/um/#/world', { waitUntil: 'domcontentloaded', timeout: 120000 });
if (!resp || resp.status() >= 400) { console.error('page status', resp && resp.status()); process.exit(1); }
await page.waitForFunction(() => window.UMSeed && window.UMSeed.ready, { timeout: 90000 });
const loaded = await page.evaluate(async () => {
  const api = await window.UMSeed.ready;
  window.UMSeed.modelApi = api;
  const hook = document.getElementById('model-hook-status').textContent;
  const desc = window.__umSeed ? window.__umSeed.describe() : null;
  return {
    hook: hook,
    hasCreate: !!(api && api.createModelHook && api.httpProvider),
    caps: desc ? desc.capabilities : [],
    gone: !!(document.getElementById('hub-nav') && document.getElementById('hub-up') && document.getElementById('tgL') && document.getElementById('tgR') && document.getElementById('km') && document.getElementById('sys').closest('header'))
  };
});
await page.$eval('#model-test', el => { el.scrollIntoView({ block: 'center' }); el.click(); });
await page.waitForFunction(() => (document.getElementById('model-reply').textContent || '').indexOf('[aucun modèle]') === 0, { timeout: 15000 });
const none = await page.$eval('#model-reply', el => el.textContent);
const shotDir = process.env.UM_SHOT_DIR || '';
async function shot(name, el) {
  if (!shotDir) return;
  fs.mkdirSync(shotDir, { recursive: true });
  const target = el || page;
  await target.screenshot({ path: path.join(shotDir, name) });
}
await page.evaluate(() => {
  const p = document.getElementById('bridget-panel');
  if (p) p.hidden = true;
  const live = document.getElementById('bridget-live');
  if (live) live.dataset.on = '0';
  const block = document.getElementById('modele');
  if (block) block.scrollIntoView({ block: 'center' });
});
await shot('after-1280.png');
const modele = await page.$('#modele');
const modes = await page.$('header .modes');
await shot('modele-aucun-1280.png', modele);
await shot('bar-1280.png', modes);
await page.setViewport({ width: 390, height: 844 });
await page.evaluate(() => {
  const block = document.getElementById('modele');
  if (block) block.scrollIntoView({ block: 'start' });
});
await shot('after-390.png');
await shot('modele-aucun-390.png', await page.$('#modele'));
await shot('bar-390.png', await page.$('header .modes'));
await page.setViewport({ width: 1280, height: 800 });
await page.select('#model-preset', 'http');
await page.$eval('#model-url', (el, url) => { el.value = url; }, base + '/fake-model');
await page.$eval('#model-save', el => { el.scrollIntoView({ block: 'center' }); el.click(); });
await page.$eval('#model-test', el => { el.scrollIntoView({ block: 'center' }); el.click(); });
await page.waitForFunction(() => (document.getElementById('model-reply').textContent || '').indexOf('réponse du faux modèle') >= 0, { timeout: 15000 });
const plugged = await page.evaluate(() => ({
  reply: document.getElementById('model-reply').textContent,
  status: document.getElementById('model-status').textContent,
  caps: window.__umSeed.describe().capabilities
}));
await page.evaluate(() => {
  const p = document.getElementById('bridget-panel');
  if (p) p.hidden = true;
  const block = document.getElementById('modele');
  if (block) block.scrollIntoView({ block: 'center' });
});
await shot('modele-test-1280.png', await page.$('#modele'));
await browser.close();
server.close();
const report = { loaded, none, plugged, errors };
console.log(JSON.stringify(report, null, 2));
if (errors.length || !loaded.hasCreate || loaded.hook.indexOf('chargé') < 0 || none.indexOf('[aucun modèle]') !== 0 || plugged.caps.indexOf('model') < 0 || plugged.reply.indexOf('réponse du faux modèle') < 0 || !loaded.gone) {
  process.exit(1);
}
console.log('browser model checks passed');
