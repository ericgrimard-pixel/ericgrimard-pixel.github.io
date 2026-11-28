/* um/seed/test-bridget-hub.mjs — tests de bridget-hub.mjs (Claude, 28 nov 2026). node test-bridget-hub.mjs */
import assert from 'node:assert/strict';
import { createBridget, tokenize } from './bridget-hub.mjs';

const E = [
  { id: 'a', title: 'INDEX VIVANT — CLAVIS × Esmeralda', text: 'Le Canon 07 dit qu’un pas n’est gardé que si le résidu ne monte pas. Les seize vigilants sont toujours éveillés.' },
  { id: 'b', title: 'Graine 0.2 Bridget', text: 'La graine reste passive. Elle ne s’active que sur demande d’Éric.' },
  { id: 'c', title: 'Étagères v0', text: 'Databao Agent couvre les chiffres, en analyse.' },
  { id: 'd', title: 'Notes diverses' },
];
const realModel = (reply, log) => ({ describe: () => ({ real: true }), async generate(p, o) { if (log) log.push({ p, o }); return typeof reply === 'function' ? reply(p) : reply; } });
const nullModel = { describe: () => ({ real: false }), async generate() { return '[aucun modèle] x'; } };
let ok = 0;
const t = async (name, f) => { try { await f(); ok++; console.log('ok  ', name); } catch (e) { console.log('FAIL', name, '\n    ', e.message); process.exitCode = 1; } };

await t('tokenize : accents, mots vides', () => assert.deepEqual(tokenize('Le résidu des Étagères'), ['residu', 'etageres']));

await t('répond avec un modèle, cite les passages, titre en tête', async () => {
  const log = [];
  const b = createBridget({ model: realModel('Le pas est gardé si le résidu ne monte pas [1].', log), getEntries: async () => E });
  const r = await b.ask('Quand un pas est-il gardé, selon le résidu ?');
  assert.equal(r.status, 'answered'); assert.equal(r.sources[0].id, 'a');
  assert.match(log[0].p, /\[1\] INDEX VIVANT/); assert.match(log[0].p, /Question :/);
  assert.equal(log[0].o.temperature, 0.2);
});

await t('sans modèle : passages seulement, aucun faux texte', async () => {
  const b = createBridget({ model: nullModel, getEntries: async () => E });
  const r = await b.ask('graine passive demande');
  assert.equal(r.status, 'extractive'); assert.match(r.text, /Aucun modèle branché/); assert.equal(r.sources[0].id, 'b');
});

await t('modèle injoignable : repli extractif avec le code', async () => {
  const m = { describe: () => ({ real: true }), async generate() { const e = new Error('x'); e.code = 'UNREACHABLE'; throw e; } };
  const r = await createBridget({ model: m, getEntries: async () => E }).ask('chiffres analyse Databao');
  assert.equal(r.status, 'extractive'); assert.match(r.text, /UNREACHABLE/);
});

await t('aucun passage : escalade vers Claude, le modèle n’est pas appelé', async () => {
  const log = [], sent = [];
  const b = createBridget({ model: realModel('x', log), getEntries: async () => E, transport: { send: async m => sent.push(m) }, genId: () => 'q1', now: () => 5 });
  const r = await b.ask('Quelle est la capitale de la Mongolie ?');
  assert.equal(r.status, 'unanswered'); assert.equal(log.length, 0); assert.equal(sent.length, 1);
  assert.equal(sent[0].kind, 'POUR_CLAUDE'); assert.match(r.text, /n° q1/); assert.equal((await b.pending()).length, 1);
});

await t('le modèle répond INSUFFISANT : escalade avec les sources essayées', async () => {
  const b = createBridget({ model: realModel('INSUFFISANT'), getEntries: async () => E, genId: () => 'q2' });
  const r = await b.ask('seize vigilants éveillés');
  assert.equal(r.status, 'unanswered'); assert.equal(r.escalation.reason, 'MODELE_INSUFFISANT'); assert.deepEqual(r.escalation.tried[0], 'a');
});

await t('transport en panne : ne plante pas, la question reste en file', async () => {
  const b = createBridget({ model: nullModel, getEntries: async () => E, transport: { send: async () => { throw new Error('hors ligne'); } }, genId: () => 'q3' });
  const r = await b.ask('Combien de tigres au Népal ?');
  assert.equal(r.status, 'unanswered'); assert.equal(r.escalation.sent, false); assert.match(r.text, /reste dans ma file/);
  assert.equal((await b.pending()).length, 1);
});

await t('pas de balayage : au plus maxReads lectures, en commençant par le meilleur titre', async () => {
  const many = Array.from({ length: 40 }, (_, i) => ({ id: 'f' + i, title: i < 6 ? 'Rapport Bridget ' + i : 'Autre ' + i }));
  const read = [];
  const b = createBridget({ model: nullModel, getEntries: async () => many, fetchText: async e => { read.push(e.id); return 'Bridget lit le Drive.'; }, maxReads: 3 });
  await b.ask('Bridget Rapport');
  assert.equal(read.length, 3);
});

await t('search + lecture : trouve un PDF dont le titre ne dit rien (une seule lecture)', async () => {
  let reads = 0;
  const b = createBridget({ model: realModel('Un minimum [1].'), getEntries: async () => [], search: async () => [{ id: 'p1', title: 'Document 12' }],
    fetchText: async () => { reads++; return 'Le cristal garde un minimum d’images, de sons, de chiffres et de texte.'; } });
  const r = await b.ask('Que garde le cristal ?');
  assert.equal(r.status, 'answered'); assert.equal(r.sources[0].id, 'p1'); assert.equal(r.sources[0].titleOnly, false); assert.equal(reads, 1);
});

await t('une lecture ratée ne bloque pas', async () => {
  const b = createBridget({ model: nullModel, getEntries: async () => [{ id: 'z', title: 'Cristal note' }], fetchText: async () => { throw new Error('403'); } });
  const r = await b.ask('cristal note');
  assert.equal(r.status, 'extractive'); assert.equal(r.sources[0].titleOnly, true);
});

await t('resolve : la réponse de Claude ferme la question et persiste', async () => {
  const store = {}; const storage = { get: async k => store[k], set: async (k, v) => { store[k] = JSON.parse(JSON.stringify(v)); } };
  const b = createBridget({ model: nullModel, getEntries: async () => E, storage, genId: () => 'q9' });
  await b.ask('Quelle heure est-il à Tokyo ?');
  assert.equal(store['bridget.queue'].length, 1);
  const r = await b.resolve('q9', 'Voici.', 'Claude');
  assert.equal(r.status, 'answered'); assert.equal((await b.pending()).length, 0);
  assert.equal(await b.resolve('inconnu', 'x'), null); assert.equal(await b.resolve('q9', '  '), null);
  const b2 = createBridget({ model: nullModel, getEntries: async () => E, storage });
  assert.equal((await b2.get('q9')).answer, 'Voici.');
});

await t('question vide ou trop courte : invalide, rien n’est appelé', async () => {
  const log = []; const b = createBridget({ model: realModel('x', log), getEntries: async () => E });
  assert.equal((await b.ask('   ')).status, 'invalid'); assert.equal((await b.ask('le la')).status, 'invalid'); assert.equal((await b.ask(null)).status, 'invalid');
  assert.equal(log.length, 0);
});

await t('index indisponible : escalade avec la raison', async () => {
  const b = createBridget({ model: nullModel, getEntries: async () => { throw new Error('x'); }, genId: () => 'q7' });
  const r = await b.ask('graine passive'); assert.equal(r.escalation.reason, 'INDEX_INDISPONIBLE');
});

console.log(ok + ' tests réussis' + (process.exitCode ? ' — des échecs' : ''));
