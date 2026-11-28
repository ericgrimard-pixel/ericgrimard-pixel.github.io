/* um/seed/bridget-hub.mjs — Bridget dans le Hub : répond depuis la liste des fichiers, escalade à Claude.
 * Claude, 28 nov 2026. Aucun secret, aucune adresse, aucun appel réseau propre : tout est injecté par l'hôte.
 *
 * const b = createBridget({ model, getEntries, search, fetchText, transport, storage, now, genId, k, maxReads, minCoverage })
 *   model      : { generate(prompt, opts), describe() }  (le crochet « model » v21.08) — facultatif
 *   getEntries : async () -> [{ id, title, url?, text? }]  (la liste du panneau de gauche)
 *   search     : async (question) -> [{ id, title, url?, text? }]  (recherche du Drive par YB1) — facultatif
 *   fetchText  : async (entry) -> string  (une lecture d'un document) — facultatif
 *   transport  : { send(msg) }  (envoi vers ÉCHANGE, pour Claude) — facultatif
 *   storage    : { get(key), set(key, value) } asynchrone — facultatif (repli : mémoire)
 * await b.ask(question, { signal, maxTokens }) -> { status, text, sources, escalation? }
 *   status ∈ 'answered' | 'extractive' | 'unanswered' | 'invalid'
 * b.pending() / b.resolve(id, text, by) / b.get(id)
 * Règles : une recherche puis au plus maxReads lectures, jamais de balayage. Rien ne plante : chaque échec est
 * dit honnêtement. Aucun faux texte : sans modèle, Bridget montre les passages trouvés, pas une réponse inventée. */

const STOP = new Set(('le la les un une des du de et ou au aux en dans sur pour par avec est sont que qui quoi quel quelle ' +
  'quels quelles ce cet cette ces il elle on je tu nous vous ils elles ne pas plus se sa son ses mon ma mes ton ta tes ' +
  'the of and to in is are what which who how').split(' '));

export function norm(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
export function tokenize(s) { return norm(s).split(/[^a-z0-9]+/).filter(t => t.length > 1 && !STOP.has(t)); }

const count = a => { const m = new Map(); for (const t of a) m.set(t, (m.get(t) || 0) + 1); return m; };

function rank(entries, qtoks, texts) {
  const docs = entries.map(e => ({ e, tt: new Set(tokenize(e.title)), tf: count(tokenize(texts.has(e.id) ? texts.get(e.id) : (e.text || ''))) }));
  const N = docs.length;
  const df = qtoks.map(t => docs.filter(d => d.tt.has(t) || d.tf.has(t)).length);
  const out = [];
  for (const d of docs) {
    let score = 0, hit = 0;
    qtoks.forEach((t, i) => {
      const inT = d.tt.has(t), n = d.tf.get(t) || 0;
      if (!inT && !n) return;
      hit++;
      score += Math.log(1 + (N - df[i] + 0.5) / (df[i] + 0.5)) * ((inT ? 3 : 0) + (n ? 1 + Math.log(n) : 0));
    });
    if (hit) out.push({ entry: d.e, score, coverage: hit / qtoks.length });
  }
  return out.sort((a, b) => b.score - a.score);
}

function bestPassages(text, qtoks, take = 2, maxLen = 320) {
  if (!text) return [];
  const sents = String(text).split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  const wins = []; let cur = '';
  for (const s of sents) {
    if (cur && cur.length + s.length + 1 > maxLen) { wins.push(cur); cur = ''; }
    cur = cur ? cur + ' ' + s : s;
    if (cur.length > maxLen) { wins.push(cur.slice(0, maxLen)); cur = ''; }
  }
  if (cur) wins.push(cur);
  const scored = wins.map(w => { const set = new Set(tokenize(w)); return { w, s: qtoks.filter(t => set.has(t)).length }; }).filter(x => x.s > 0);
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, take).map(x => x.w);
}

const SYSTEM = 'Tu es Bridget. Réponds seulement à partir des passages numérotés. Cite les numéros entre crochets, par exemple [1]. ' +
  'Si les passages ne suffisent pas pour répondre, réponds exactement : INSUFFISANT.';

export function createBridget({ model, getEntries, search, fetchText, transport, storage, now = Date.now, genId, k = 4,
  maxReads = 3, maxChars = 20000, minCoverage = 0.5 } = {}) {
  let n = 0;
  const newId = genId || (() => 'q-' + now() + '-' + (++n));
  let queue = null;
  async function load() {
    if (queue) return;
    queue = [];
    if (storage && typeof storage.get === 'function') {
      try { const v = await storage.get('bridget.queue'); if (Array.isArray(v)) queue = v; } catch (_) { /* repli : mémoire */ }
    }
  }
  async function persist() {
    if (!storage || typeof storage.set !== 'function') return false;
    try { await storage.set('bridget.queue', queue); return true; } catch (_) { return false; }
  }
  async function escalate(question, reason, sources) {
    await load();
    const rec = { id: newId(), question, reason, tried: sources.map(s => s.id), createdAt: now(), status: 'pending' };
    queue.push(rec);
    rec.persisted = await persist();
    rec.sent = false;
    if (transport && typeof transport.send === 'function') {
      try { await transport.send({ kind: 'POUR_CLAUDE', record: { ...rec } }); rec.sent = true; }
      catch (e) { rec.sendError = String((e && e.message) || e); }
    }
    return rec;
  }
  function unansweredText(rec) {
    return 'Je n’ai pas trouvé de réponse dans les fichiers. ' + (rec.sent
      ? 'J’ai transmis ta question à Claude (n° ' + rec.id + ').'
      : 'Ta question reste dans ma file (n° ' + rec.id + ') ; Claude la verra quand elle sera transmise.');
  }

  async function ask(question, opts = {}) {
    const q = typeof question === 'string' ? question.trim() : '';
    const qtoks = [...new Set(tokenize(q))];
    if (!q || !qtoks.length) return { status: 'invalid', text: 'Pose une question plus précise.', sources: [] };

    let entries = [];
    try { entries = (await getEntries()) || []; } catch (_) { entries = []; }
    const fromSearch = new Set();
    if (typeof search === 'function') {
      try {
        const extra = (await search(q)) || [];
        const have = new Set(entries.map(e => e && e.id));
        for (const e of extra) if (e) { fromSearch.add(e.id); if (!have.has(e.id)) { entries.push(e); have.add(e.id); } }
      } catch (_) { /* la recherche est un plus */ }
    }
    entries = entries.filter(e => e && e.id != null && typeof e.title === 'string');

    const texts = new Map();
    const keep = r => r.coverage >= minCoverage;
    let ranked = rank(entries, qtoks, texts).filter(keep);
    if (typeof fetchText === 'function') {
      /* une lecture pour les meilleurs titres, puis pour ce que la recherche du Drive a trouvé sur le contenu */
      const seen = new Set(ranked.map(r => r.entry.id));
      const need = [...ranked.map(r => r.entry), ...entries.filter(e => fromSearch.has(e.id) && !seen.has(e.id))]
        .filter(e => !e.text).slice(0, maxReads);
      for (const e of need) {
        try { const t = await fetchText(e); if (typeof t === 'string') texts.set(e.id, t.slice(0, maxChars)); } catch (_) { /* une lecture ratée ne bloque rien */ }
      }
      if (texts.size) ranked = rank(entries, qtoks, texts).filter(keep);
    }

    const top = ranked.slice(0, k);
    if (!top.length) {
      const rec = await escalate(q, entries.length ? 'AUCUN_PASSAGE' : 'INDEX_INDISPONIBLE', []);
      return { status: 'unanswered', text: unansweredText(rec), sources: [], escalation: rec };
    }
    const sources = [], blocks = [];
    top.forEach((r, i) => {
      const text = texts.has(r.entry.id) ? texts.get(r.entry.id) : r.entry.text;
      const ps = bestPassages(text, qtoks);
      blocks.push('[' + (i + 1) + '] ' + r.entry.title + '\n' + (ps.length ? ps.join(' … ') : '(titre seulement)'));
      sources.push({ n: i + 1, id: r.entry.id, title: r.entry.title, url: r.entry.url || null, score: +r.score.toFixed(3), titleOnly: !ps.length });
    });
    const extractive = note => ({
      status: 'extractive',
      text: (note ? note + '\n' : '') + 'Passages les plus proches :\n' + blocks.join('\n'),
      sources,
    });

    let real = false;
    try { real = !!(model && typeof model.describe === 'function' && model.describe().real); } catch (_) { real = false; }
    if (!real) return extractive('Aucun modèle branché : je montre les passages, sans réponse rédigée.');
    let out;
    try {
      out = await model.generate(blocks.join('\n\n') + '\n\nQuestion : ' + q,
        { system: SYSTEM, maxTokens: opts.maxTokens || 400, temperature: 0.2, signal: opts.signal });
    } catch (e) {
      return extractive('Modèle indisponible (' + ((e && e.code) || 'ERREUR') + ') : voici les passages.');
    }
    const t = String(out || '').trim();
    if (!t || /^insuffisant\b/i.test(t)) {
      const rec = await escalate(q, 'MODELE_INSUFFISANT', sources);
      return { status: 'unanswered', text: unansweredText(rec), sources, escalation: rec };
    }
    if (t.startsWith('[aucun modèle]')) return extractive('Aucun modèle branché : je montre les passages, sans réponse rédigée.');
    return { status: 'answered', text: t, sources };
  }

  async function pending() { await load(); return queue.filter(r => r.status === 'pending').map(r => ({ ...r })); }
  async function get(id) { await load(); const r = queue.find(x => x.id === id); return r ? { ...r } : null; }
  async function resolve(id, text, by = 'Claude') {
    await load();
    const r = queue.find(x => x.id === id);
    if (!r || typeof text !== 'string' || !text.trim()) return null;
    r.status = 'answered'; r.answer = text.trim(); r.answeredBy = by; r.answeredAt = now();
    await persist();
    return { ...r };
  }
  return Object.freeze({ ask, pending, get, resolve });
}
