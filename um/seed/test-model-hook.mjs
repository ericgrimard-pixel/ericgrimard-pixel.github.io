/* node test-model-hook.mjs — tests du point d'ancrage « model » (v21.08). Aucun réseau externe : serveur local seulement. */
import assert from 'node:assert/strict';
import http from 'node:http';
import { createModelHook, httpProvider, fakeProvider, nullProvider, ModelError, NO_MODEL_TEXT } from './model-hook.mjs';

const results = [];
async function t(name, fn) {
  try { await fn(); results.push(['OK', name]); }
  catch (e) { results.push(['ÉCHEC', name + ' — ' + (e && e.stack || e)]); }
}
const collect = async it => { const out = []; for await (const c of it) out.push(c); return out; };
const rejectsCode = async (p, code) => {
  try { await p; } catch (e) { assert.ok(e instanceof ModelError, 'erreur non typée : ' + e); assert.equal(e.code, code); return e; }
  assert.fail('aucune erreur, attendu ' + code);
};

/* serveur local : /json (texte), /sse (flux), /slow (ne répond jamais), /500 */
const server = http.createServer((req, res) => {
  let body = ''; req.on('data', d => body += d); req.on('end', () => {
    const b = body ? JSON.parse(body) : {};
    if (req.url === '/json') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ text: 'écho:' + b.prompt + '|sys:' + (b.system || '') + '|max:' + b.max_tokens + '|t:' + b.temperature, auth: req.headers.authorization || null })); }
    else if (req.url === '/sse') { res.setHeader('content-type', 'text/event-stream'); const parts = ['un', 'deux', 'trois']; let i = 0;
      const tick = () => { if (i < parts.length) { res.write('data: ' + JSON.stringify({ delta: parts[i++] }) + '\n\n'); setTimeout(tick, 5); } else { res.end('data: [DONE]\n\n'); } }; tick(); }
    else if (req.url === '/slow') { /* ne répond pas */ }
    else { res.statusCode = 500; res.end('{}'); }
  });
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

// 1. réponse en texte
await t('1. texte (faux fournisseur)', async () => {
  const m = createModelHook({ provider: fakeProvider() });
  assert.equal(await m.generate('salut'), 'Bonjour Éric');
});
await t('1b. texte (connecteur HTTP local)', async () => {
  const m = createModelHook({ provider: httpProvider({ url: base + '/json', headers: { authorization: 'Bearer fourni-par-hote' } }) });
  const out = await m.generate('allo', { system: 'S', maxTokens: 5, temperature: 0.3 });
  assert.equal(out, 'écho:allo|sys:S|max:5|t:0.3');
});

// 2. flux reconstitué
await t('2. flux en morceaux (faux)', async () => {
  const m = createModelHook({ provider: fakeProvider({ delayMs: 2 }) });
  const parts = await collect(await m.generate('x', { stream: true }));
  assert.deepEqual(parts, ['Bon', 'jour', ' Éric']); assert.equal(parts.join(''), 'Bonjour Éric');
});
await t('2b. flux SSE (connecteur HTTP local)', async () => {
  const m = createModelHook({ provider: httpProvider({ url: base + '/sse' }) });
  const parts = await collect(await m.generate('x', { stream: true }));
  assert.deepEqual(parts, ['un', 'deux', 'trois']);
});

// 3. options respectées
await t('3. options transmises et validées', async () => {
  const f = fakeProvider({ chunks: ['a', 'b', 'c', 'd'] });
  const m = createModelHook({ provider: f });
  assert.equal(await m.generate('p', { maxTokens: 2, temperature: 0.7, system: 'sys' }), 'ab');
  const c = f.calls.at(-1);
  assert.equal(c.prompt, 'p'); assert.equal(c.maxTokens, 2); assert.equal(c.temperature, 0.7); assert.equal(c.system, 'sys'); assert.equal(c.stream, false);
  await rejectsCode(m.generate('p', { maxTokens: -1 }), 'BAD_REQUEST');
  await rejectsCode(m.generate('p', { temperature: 9 }), 'BAD_REQUEST');
  await rejectsCode(m.generate(42), 'BAD_REQUEST');
});

// 4. annulation par signal
await t('4. annulation avant et pendant (texte et flux)', async () => {
  const m = createModelHook({ provider: fakeProvider({ delayMs: 50 }) });
  const a = new AbortController(); a.abort();
  await rejectsCode(m.generate('x', { signal: a.signal }), 'ABORTED');
  const b = new AbortController(); setTimeout(() => b.abort(), 10);
  await rejectsCode(m.generate('x', { signal: b.signal }), 'ABORTED');
  const c = new AbortController();
  const it = await m.generate('x', { stream: true, signal: c.signal });
  const got = [];
  await rejectsCode((async () => { for await (const p of it) { got.push(p); c.abort(); } })(), 'ABORTED');
  assert.deepEqual(got, ['Bon']);
});
await t('4b. annulation d\'une requête HTTP en cours', async () => {
  const m = createModelHook({ provider: httpProvider({ url: base + '/slow' }) });
  const a = new AbortController(); setTimeout(() => a.abort(), 20);
  await rejectsCode(m.generate('x', { signal: a.signal }), 'ABORTED');
});

// 5. délai dépassé, injoignable, erreur fournisseur — erreurs typées, la graine continue
await t('5a. délai dépassé (fournisseur qui ignore le signal)', async () => {
  const m = createModelHook({ provider: fakeProvider({ hang: true }), timeoutMs: 30 });
  await rejectsCode(m.generate('x'), 'TIMEOUT');
  await rejectsCode((async () => collect(await m.generate('x', { stream: true })))(), 'TIMEOUT');
});
await t('5b. délai dépassé (HTTP lent)', async () => {
  const m = createModelHook({ provider: httpProvider({ url: base + '/slow' }), timeoutMs: 40 });
  await rejectsCode(m.generate('x'), 'TIMEOUT');
});
await t('5c. injoignable (faux et port fermé)', async () => {
  await rejectsCode(createModelHook({ provider: fakeProvider({ fail: 'unreachable' }) }).generate('x'), 'UNREACHABLE');
  await rejectsCode(createModelHook({ provider: httpProvider({ url: 'http://127.0.0.1:1/x' }), timeoutMs: 3000 }).generate('x'), 'UNREACHABLE');
});
await t('5d. erreur du fournisseur (HTTP 500, exception)', async () => {
  await rejectsCode(createModelHook({ provider: httpProvider({ url: base + '/500' }) }).generate('x'), 'PROVIDER');
  await rejectsCode(createModelHook({ provider: fakeProvider({ fail: 'boum' }) }).generate('x'), 'PROVIDER');
});
await t('5e. la graine ne plante pas : appels suivants normaux', async () => {
  const m = createModelHook({ provider: fakeProvider() });
  await rejectsCode(m.generate('x', { maxTokens: 0 }), 'BAD_REQUEST');
  assert.equal(await m.generate('x'), 'Bonjour Éric');
});

// 6. repli sur le modèle nul
await t('6. aucun fournisseur → modèle nul explicite', async () => {
  for (const m of [createModelHook(), createModelHook({ provider: null }), createModelHook({ provider: {} })]) {
    assert.equal(await m.generate('x'), NO_MODEL_TEXT);
    assert.deepEqual(await collect(await m.generate('x', { stream: true })), [NO_MODEL_TEXT]);
  }
  assert.equal(nullProvider.isNull, true);
});

// 7. describe() ne déclare model que s'il est réel
await t('7. describe() ne déclare model que s\'il est réel', async () => {
  assert.deepEqual(createModelHook().describe(), { capability: null, provider: null, real: false });
  assert.deepEqual(createModelHook({ provider: fakeProvider({ name: 'faux' }) }).describe(), { capability: 'model', provider: 'faux', real: true });
  assert.equal(createModelHook({ provider: httpProvider({ url: base + '/json', name: 'local' }) }).describe().capability, 'model');
});

// 8. aucun secret, aucune adresse dans le module
await t('8. aucun point de terminaison ni secret dans le code', async () => {
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('./model-hook.mjs', import.meta.url), 'utf8');
  assert.ok(!/https?:\/\/[a-z0-9]/i.test(src), 'URL codée en dur trouvée');
  assert.ok(!/sk-[A-Za-z0-9]{8,}|api[_-]?key\s*[:=]\s*['"][^'"]+/i.test(src), 'secret trouvé');
});

server.close();
for (const [s, n] of results) console.log(s.padEnd(6), n);
const bad = results.filter(r => r[0] !== 'OK').length;
console.log(`\n${results.length - bad}/${results.length} réussis`);
process.exit(bad ? 1 : 0);
