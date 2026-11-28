// Usage : node build-index.mjs <dossier-publié> <url-de-base> <sortie.json>
// Exemple : node um/bridget/build-index.mjs ./um https://ericgrimard-pixel.github.io/um/ ./um/bridget/index.json
// N'indexe QUE le dossier donné (le Hub est public). Refuse tout fichier au nom sensible.
//
// Extensions v21.06 (documentées), le cœur de Claude est inchangé :
//   - Le parcours est trié, pour qu'une régénération donne le même fichier.
//   - _incoming est exclu (fichiers de staging, pas publiés).
//   - Les URL de documents / PDF / Drive (sauf la graine APK) sont retirées du texte.
//   - `built` est l'empreinte du contenu, pas l'horloge : le contrôle CI peut
//     comparer le fichier tel quel, sans commit automatique.
//   - Le panneau de gauche (tuiles, fenêtre gaussienne, fiche) et les deux coupes
//     Santé sont ajoutés : ces textes sont dans le JS ou dans des JSON, pas dans
//     des pages que le parcours HTML voit une fois les scripts retirés.
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, extname, dirname, sep } from 'node:path';

const [,, root, base, out] = process.argv;
if (!root || !base || !out) { console.error('usage: node build-index.mjs <dossier> <urlBase> <sortie.json>'); process.exit(1); }

const EXT = new Set(['.md', '.txt', '.html', '.htm']);
const SENSITIVE = /(secret|\.env|token|credential|password|passwd|private|apikey|api-key|\.pem|\.key|keystore)/i;
const MAX_BYTES = 2 * 1024 * 1024;
const CHUNK = 600;
const SKIP_DIR = new Set(['node_modules', 'bridget', '_incoming']);
const APK = '19wzqeus-_oJweHWvDFmOr-2VjlgU0KLo';
const ZNL = 'Ω Oméga, φ⁻ phi moins, Σ Sigma, φ⁺ phi plus, α Alpha';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.') || SKIP_DIR.has(e.name)) return [];
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  }).sort();
}
function decode(s) {
  return s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
function isDocUrl(u) {
  if (u.includes(APK)) return false;
  return /\.pdf(\?|#|$)/i.test(u) || /\.(docx?|pptx?|xlsx?|zip)(\?|#|$)/i.test(u) || /drive\.google\.com|docs\.google\.com/i.test(u);
}
function stripDocLinks(s) {
  return s.replace(/https?:\/\/[^\s)>\]]+/gi, (u) => (isDocUrl(u) ? '' : u));
}
function text(file, raw) {
  let body = raw;
  if (/\.html?$/i.test(file)) {
    body = raw.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }
  return stripDocLinks(body);
}
function title(file, raw) {
  const h = raw.match(/<title>([^<]+)<\/title>/i) || raw.match(/^#\s+(.+)$/m);
  return (h ? h[1] : file.split(sep).pop()).trim();
}
function chunks(t) {
  const paras = t.split(/\n\s*\n/).map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const res = []; let cur = '';
  for (const p of paras) {
    if ((cur + ' ' + p).length > CHUNK && cur) { res.push(cur); cur = p; } else cur = cur ? cur + ' ' + p : p;
  }
  if (cur) res.push(cur);
  return res.flatMap((c) => c.length <= CHUNK * 2 ? [c] : c.match(new RegExp('.{1,' + CHUNK + '}(\\s|$)', 'g')).map((s) => s.trim()));
}
function unquote(s) {
  if (!s) return '';
  const q = s[0];
  if ((q === "'" || q === '"') && s[s.length - 1] === q) return s.slice(1, -1);
  return s;
}
function visible(fragment) {
  const titles = [...fragment.matchAll(/\btitle="([^"]*)"/g)].map((m) => decode(m[1]));
  const arias = [...fragment.matchAll(/\baria-label="([^"]*)"/g)].map((m) => decode(m[1]));
  const plain = decode(fragment.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  return [...titles, ...arias, plain].filter(Boolean).join(' ');
}
function sliceFrom(html, marker, end) {
  const i = html.indexOf(marker);
  if (i < 0) return '';
  const j = html.indexOf(end, i + marker.length);
  return html.slice(i, j < 0 ? i + marker.length : j + end.length);
}
function leftPanelDocs() {
  const htmlPath = join(root, 'index.html');
  let html = '';
  try { html = readFileSync(htmlPath, 'utf8'); } catch (e) { return []; }
  const vol = sliceFrom(html, '<span class="vol"', '</span>');
  const left = sliceFrom(html, '<aside id="left">', '</aside>');
  const right = sliceFrom(html, '<aside id="right">', '</aside>');
  const sections = left.split(/<section\b/i).slice(1);
  const rack = sections[0] ? '<section' + sections[0] : '';
  const gauss = sections[1] ? '<section' + sections[1] : '';
  const docs = [];
  function add(section, selector, docTitle, body) {
    const c = chunks(stripDocLinks(body));
    if (!c.length) return;
    docs.push({
      title: docTitle,
      url: new URL(selector.startsWith('#') ? '#' + selector.slice(1) : '', base).href,
      section: section,
      selector: selector,
      chunks: c,
    });
  }
  add('volume', '#volNum', 'Panneau gauche · Facteur de volume',
    'Facteur de volume. ' + visible(vol) + ' Le facteur de volume est le nombre à côté du curseur Volume.');
  add('attributs', '#rack', 'Panneau gauche · Tuiles des attributs',
    'Tuiles des attributs, à gauche. Une icône ouvre l’analyse et les bornes. ' + visible(rack));
  add('gauss', '#gauss', 'Panneau gauche · Fenêtre gaussienne',
    'Fenêtre gaussienne. Analyse, distribution et quatre bornes. ' + visible(gauss));
  add('fiche', '#fiche', 'Fiche · panneau de lecture',
    'Fiche, panneau de lecture à droite. ' + visible(right));

  let engine = '';
  try { engine = readFileSync(join(root, 'engine', 'engine.js'), 'utf8'); } catch (e) { engine = ''; }
  const block = engine.match(/const ATTR=\[([\s\S]*?)\];/);
  if (block) {
    const re = /\{name:('[^']*'|"[^"]*"),tag:('[^']*'|"[^"]*"),levels:(ZNL|\[[^\]]*\]),?(?:desc:('[^']*'|"[^"]*"))?\}/g;
    let m, k = 0;
    while ((m = re.exec(block[1]))) {
      const name = unquote(m[1]);
      const tag = unquote(m[2]);
      const levels = m[3] === 'ZNL'
        ? ZNL
        : m[3].replace(/[[\]]/g, '').split(',').map((x) => unquote(x.trim())).filter(Boolean).join(', ');
      const desc = unquote(m[4] || '');
      const body = `Attribut ${k + 1} sur 10, tuile du panneau de gauche. ${name}. ${tag}. ${desc} Niveaux : ${levels}. La fenêtre gaussienne s’ouvre sur cette tuile.`;
      add('attr:' + k, '#rack', 'Panneau gauche · ' + name, body);
      k += 1;
    }
  }
  return docs;
}
function santeDocs() {
  const dirs = [
    ['data/sante/villes-wup2025/index.json', 'data/sante/villes-wup2025/'],
    ['data/sante/provinces-canada-statcan-13-10-0114/index.json', 'data/sante/provinces-canada-statcan-13-10-0114/'],
  ];
  const docs = [];
  for (const [rel, folder] of dirs) {
    let ix;
    try { ix = JSON.parse(readFileSync(join(root, rel), 'utf8')); } catch (e) { continue; }
    const b = ix.bridget;
    if (!b || !b.passages) continue;
    docs.push({
      title: b.title,
      url: new URL(folder, base).href,
      section: b.section || '',
      selector: b.selector || '#sys',
      chunks: b.passages.map((p) => stripDocLinks(String(p)).replace(/\s+/g, ' ').trim()).filter(Boolean),
    });
  }
  return docs;
}

const docs = []; const skipped = [];
for (const f of walk(root)) {
  const rel = relative(root, f).split(sep).join('/');
  if (rel.split('/').includes('_incoming')) { skipped.push(rel + ' (staging)'); continue; }
  if (!EXT.has(extname(f).toLowerCase())) continue;
  if (SENSITIVE.test(rel)) { skipped.push(rel + ' (nom sensible)'); continue; }
  if (statSync(f).size > MAX_BYTES) { skipped.push(rel + ' (trop gros)'); continue; }
  const raw = readFileSync(f, 'utf8');
  const c = chunks(text(f, raw));
  if (c.length) docs.push({ title: title(f, raw), url: new URL(rel, base).href, section: '', selector: '', chunks: c });
}
docs.push(...leftPanelDocs(), ...santeDocs());
docs.sort((a, b2) => (a.section + a.title + a.url).localeCompare(b2.section + b2.title + b2.url));
const built = createHash('sha256').update(JSON.stringify(docs)).digest('hex').slice(0, 16);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ version: 1, built, docs }));
console.log(`index : ${docs.length} documents, ${docs.reduce((n, d) => n + d.chunks.length, 0)} passages`);
if (skipped.length) console.log('ignorés :\n  ' + skipped.join('\n  '));
