// Usage : node build-index.mjs <dossier-publié> <url-de-base> <sortie.json>
// Exemple : node build-index.mjs ./um https://ericgrimard-pixel.github.io/um/ ./um/bridget/index.json
// N'indexe QUE le dossier donné (le Hub est public). Refuse tout fichier au nom sensible.
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, extname, dirname, sep } from 'node:path';

const [,, root, base, out] = process.argv;
if (!root || !base || !out) { console.error('usage: node build-index.mjs <dossier> <urlBase> <sortie.json>'); process.exit(1); }

const EXT = new Set(['.md', '.txt', '.html', '.htm']);
const SENSITIVE = /(secret|\.env|token|credential|password|passwd|private|apikey|api-key|\.pem|\.key|keystore)/i;
const MAX_BYTES = 2 * 1024 * 1024;
const CHUNK = 600;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'bridget') return [];
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
function text(file, raw) {
  if (/\.html?$/i.test(file)) {
    return raw.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }
  return raw;
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

const docs = []; const skipped = [];
for (const f of walk(root)) {
  const rel = relative(root, f).split(sep).join('/');
  if (!EXT.has(extname(f).toLowerCase())) continue;
  if (SENSITIVE.test(rel)) { skipped.push(rel + ' (nom sensible)'); continue; }
  if (statSync(f).size > MAX_BYTES) { skipped.push(rel + ' (trop gros)'); continue; }
  const raw = readFileSync(f, 'utf8');
  const c = chunks(text(f, raw));
  if (c.length) docs.push({ title: title(f, raw), url: new URL(rel, base).href, chunks: c });
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ version: 1, built: new Date().toISOString(), docs }));
console.log(`index : ${docs.length} documents, ${docs.reduce((n, d) => n + d.chunks.length, 0)} passages`);
if (skipped.length) console.log('ignorés :\n  ' + skipped.join('\n  '));
