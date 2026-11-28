/* Headless Chrome: the blank menu stays, and a universe can open attributes and the full right panel. */
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
function shown(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  const box = el.closest('details, section, button, label') || el;
  let n = box;
  while (n) {
    if (n.tagName === 'DETAILS') n.open = true;
    n = n.parentElement;
  }
  const s = getComputedStyle(box);
  const r = box.getBoundingClientRect();
  return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
}

await page.setViewport({ width: 1280, height: 800 });
await page.goto(base + '/um/#/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForFunction(() => document.body.classList.contains('um-menu'), { timeout: 15000 });
const menu = await page.evaluate(() => {
  const labels = [...document.querySelectorAll('#um-universes [data-universe]')].map(b => b.textContent.trim());
  const tg = document.getElementById('tgL');
  const tgBox = tg ? tg.getBoundingClientRect() : { width: 0, height: 0 };
  return { labels, tgW: tgBox.width };
});

await page.goto(base + '/um/#/sante', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForSelector('#tgL', { timeout: 30000 });
await page.waitForFunction(() => document.getElementById('layers') && document.getElementById('fiche'), { timeout: 20000 });
const reach = await page.evaluate(() => {
  const ids = ['tgL', 'tgR', 'left', 'rack', 'fiche', 'modele', 'legend', 'layers', 'srcText', 'um-rg-sante', 'um-gaps', 'um-rg-couches', 'um-rg-foot', 'um-more-all', 'um-u-c2', 'um-u-sys', 'hub-nav', 'copyState', 'gwBox', 'bridget-open'];
  const display = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    display[id] = !!(el && getComputedStyle(el).display !== 'none');
  });
  const sections = [...document.querySelectorAll('#right section')];
  const noneHidden = sections.every(el => getComputedStyle(el).display !== 'none');
  const folds = [...document.querySelectorAll('#right details.um-fold')];
  const collapsed = folds.length > 0 && folds.every(d => !d.classList.contains('um-open'));
  const modeleOpen = !!document.querySelector('#modele') && getComputedStyle(document.getElementById('modele')).display !== 'none';
  const gap = document.querySelector('#seed-badge .um-gap-badge');
  const gapBox = gap ? gap.getBoundingClientRect() : { width: 0 };
  const hidden = id => {
    const el = document.getElementById(id);
    return !el || getComputedStyle(el).display === 'none';
  };
  return {
    display, noneHidden, folds: folds.map(d => d.id), collapsed, modeleOpen, gapW: gapBox.width,
    orderedOut: hidden('mFourier') && hidden('mFree') && hidden('session') && hidden('km') && hidden('um-rg-door') && hidden('um-u-mine') && hidden('um-invite-first') && !document.getElementById('tgV')
  };
});
await page.click('#um-rg-sante > summary');
const oneOpen = await page.evaluate(() => document.getElementById('um-rg-sante').classList.contains('um-open'));
const voice = await page.evaluate(async () => {
  const btn = document.getElementById('bridget-open');
  const box = btn ? btn.getBoundingClientRect() : { width: 0 };
  const line = window.BridgetDemo && window.BridgetDemo.voiceModel ? await window.BridgetDemo.voiceModel('bonjour') : '';
  const panel = document.getElementById('bridget-panel');
  return { w: box.width, line, said: (document.getElementById('bridget-caption') || {}).textContent || '', panelHidden: !panel || panel.hidden };
});
const hook = await page.evaluate(() => {
  const text = window.__umMoreText('fiche');
  const open = document.getElementById('um-rg-fiche').classList.contains('um-open');
  return { open, len: (text || '').length };
});
await page.click('#tgL');
const leftHidden = await page.evaluate(() => document.querySelector('.app').classList.contains('noL'));
await page.keyboard.press('[');
const leftBack = await page.evaluate(() => !document.querySelector('.app').classList.contains('noL') && document.getElementById('tgL').getAttribute('aria-pressed') === 'true');
await page.evaluate(() => {
  window.__umMoreText('all');
  const p = document.getElementById('bridget-panel'); if (p) p.hidden = true;
});
await shot('panel-1280.png');
await page.setViewport({ width: 390, height: 844 });
await page.evaluate(() => document.getElementById('right').scrollIntoView({ block: 'start' }));
await shot('panel-390.png');

await browser.close();
server.close();
const report = { menu, reach, oneOpen, hook, leftHidden, leftBack, voice, errors };
console.log(JSON.stringify(report, null, 2));
const menuOk = menu.labels.join('|') === 'Finance|Art|Santé|Sport' && menu.tgW === 0;
const idsShown = reach.display && Object.values(reach.display).every(Boolean);
const voiceOk = voice.w > 20 && voice.panelHidden && voice.line === 'unanswered' && voice.said.indexOf('en file') >= 0 && voice.said.indexOf('transmis') < 0;
if (errors.length || !menuOk || !idsShown || !reach.orderedOut || !reach.noneHidden || !reach.collapsed || !reach.modeleOpen || reach.gapW < 1 || !oneOpen || !hook.open || !leftHidden || !leftBack || !voiceOk) process.exit(1);
console.log('panel access checks passed');
