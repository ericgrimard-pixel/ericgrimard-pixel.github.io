// node test.mjs — exercises worker.js locally (Node 20+). Throwaway tokens generated here; never real ones.
import worker, { _test } from './worker.js';
import { randomBytes, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const tok = () => randomBytes(32).toString('base64url');
const H = t => createHash('sha256').update(t).digest('hex');
const T = { eric: tok(), gary: tok(), samuel: tok() };
class MemKV { constructor() { this.m = new Map(); }
  async get(k, t) { const v = this.m.get(k); return v === undefined ? null : (t === 'json' ? JSON.parse(v) : v); }
  async put(k, v) { this.m.set(k, v); } async delete(k) { this.m.delete(k); }
  async list({ prefix = '' } = {}) { return { keys: [...this.m.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }; } }
const KV = new MemKV();
const env = { ADMIN_SHA256_ERIC: H(T.eric), ADMIN_SHA256_GARY: H(T.gary), ADMIN_SHA256_SAMUEL: H(T.samuel), INVITES: KV };
const O = 'https://ericgrimard-pixel.github.io';
let ip = 0;
const req = (o = {}) => new Request('https://um-invite.example.workers.dev' + (o.path || '/invite'), {
  method: o.method || 'POST',
  headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': o.ip || ('10.0.' + (++ip >> 8) + '.' + (ip & 255)), ...(o.origin === null ? {} : { Origin: o.origin || O }), ...(o.auth ? { Authorization: o.auth } : {}) },
  body: ['POST', 'PATCH'].includes(o.method || 'POST') ? JSON.stringify(o.body || { to: 'EXEMPLE invité', lang: 'fr' }) : undefined,
});
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { (c ? pass++ : fail++); console.log((c ? 'PASS ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); };
const f = r => worker.fetch(r, env);
const B = k => 'Bearer ' + T[k];

console.log('— token check at the invite endpoint');
let r = await f(req({ auth: B('gary'), body: { to: 'EXEMPLE A', lang: 'fr', meetings: { zoom: 'https://zoom.us/j/EXEMPLE', meet: 'http://insecure.example', teams: 'https://evil.example/x' } } })); let j = await r.json();
ok(r.status === 202 && j.status === 'held — send gate closed' && j.issuer === 'Gary Kivenko' && /^[0-9a-f]{32}$/.test(j.card_token), 'valid token (Gary) → 202 held + opaque card token');
ok(r.headers.get('Access-Control-Allow-Origin') === O, 'CORS header on allowed origin');
const garyRec = j.id, garyCard = j.card_token;
r = await f(req({ auth: B('samuel'), body: { to: 'EXEMPLE B' } })); j = await r.json(); ok(r.status === 202 && j.issuer === 'Samuel Le Flaguais', 'valid token (Samuel) → 202');
const samRec = j.id;
r = await f(req({ auth: B('eric'), body: { to: 'EXEMPLE C' } })); j = await r.json(); ok(r.status === 202 && j.issuer === 'Éric Grimard', 'valid token (Éric) → 202');
r = await f(req({ auth: 'Bearer ' + tok() })); ok(r.status === 401, 'wrong token → 401');
r = await f(req({ auth: 'Bearer ' + H(T.gary) })); ok(r.status === 401, 'hash used as token → 401');
r = await f(req({})); ok(r.status === 401 && (await r.json()).error === 'missing token', 'missing token → 401');
r = await f(req({ auth: B('gary'), origin: 'https://evil.example' })); ok(r.status === 403 && !r.headers.get('Access-Control-Allow-Origin'), 'other origin → 403, no CORS header');
r = await f(req({ auth: B('gary'), origin: null })); ok(r.status === 403, 'no Origin → 403');
r = await f(req({ method: 'OPTIONS' })); ok(r.status === 204 && r.headers.get('Access-Control-Allow-Origin') === O, 'preflight from allowed origin → 204');
r = await f(req({ method: 'OPTIONS', origin: 'https://evil.example' })); ok(r.status === 403, 'preflight from other origin → 403');
r = await f(req({ auth: B('gary'), body: { to: '' } })); ok(r.status === 400, 'empty "to" → 400');

console.log('— per-admin scoping');
r = await f(req({ method: 'GET', path: '/ledger', auth: B('gary') })); j = await r.json();
ok(r.status === 200 && j.records.length === 1 && j.records[0].id === garyRec, 'Gary sees only his own invitee', j.records.map(x => x.label).join(','));
r = await f(req({ method: 'GET', path: '/ledger', auth: B('samuel') })); j = await r.json();
ok(j.records.length === 1 && j.records[0].label === 'EXEMPLE B', 'Samuel sees only his own invitee');
r = await f(req({ method: 'PATCH', path: '/ledger/' + samRec, auth: B('gary'), body: { notes: 'x' } })); ok(r.status === 404, "Gary cannot edit Samuel's record → 404");
r = await f(req({ method: 'DELETE', path: '/ledger/' + samRec + '?confirm=' + samRec, auth: B('gary') })); ok(r.status === 404, "Gary cannot purge Samuel's record → 404");
r = await f(req({ method: 'GET', path: '/ledger', auth: B('samuel') })); ok((await r.json()).records.length === 1, "Samuel's record intact");

console.log('— admin controls');
r = await f(req({ method: 'PATCH', path: '/ledger/' + garyRec, auth: B('gary'), body: { keep_alive: { on: true, days: 90 }, fee: { amount: 0, period: 'mois', status: 'EXEMPLE' }, notes: 'EXEMPLE note' } })); j = await r.json();
ok(r.status === 200 && j.keep_alive.on && j.keep_alive.days === 90 && j.fee.period === 'mois', 'keep-alive + fee set by owner');
r = await f(req({ method: 'PATCH', path: '/ledger/' + garyRec, auth: B('gary'), body: { keep: ['label', 'status', 'invited_at'] } })); j = await r.json();
ok(j.notes === '' && Object.keys(j.meetings).length === 0, 'field toggles: unkept fields are dropped');
r = await f(req({ method: 'DELETE', path: '/ledger/' + samRec, auth: B('samuel') })); ok(r.status === 409, 'admin purge without confirm → 409');

console.log('— invitation card (opaque token only)');
r = await f(req({ method: 'GET', path: '/card?t=' + garyCard })); j = await r.json();
ok(r.status === 200 && j.issuer === 'Gary Kivenko' && !('fee' in j) && !('keep_alive' in j) && !('notes' in j) && !('label' in j), 'card shows issuer fields only — no fee, keep-alive, notes or label');
r = await f(req({ path: '/card/choice?t=' + garyCard, body: { mode: 'video' } })); ok(r.status === 200, 'invitee choice recorded');
r = await f(req({ method: 'GET', path: '/card?t=' + randomBytes(16).toString('hex') })); ok(r.status === 401, 'unknown card token → 401');

console.log('— IMMUTABLE: invitee purge');
await KV.put(`files:gary-kivenko:${garyRec}:a.csv`, 'EXEMPLE');
r = await f(req({ path: '/card/purge?t=' + garyCard, body: {} })); j = await r.json();
ok(r.status === 200 && j.status === "Supprimé — rien n'est conservé", 'invitee purge → confirmation');
ok(!(await KV.get(`ledger:gary-kivenko:${garyRec}`)) && !(await KV.get(`files:gary-kivenko:${garyRec}:a.csv`)) && !(await KV.get('card:' + H(garyCard))), 'record, files and card pointer gone');
const leftovers = [...KV.m.entries()].filter(([k, v]) => k.startsWith('tomb:') );
ok(leftovers.length === 2 && leftovers.every(([k, v]) => v === '1' && /^tomb:(card|rec):[0-9a-f]{64}$/.test(k)), 'only bare-hash tombstones remain (no data)');
ok(![...KV.m.values()].some(v => String(v).includes('EXEMPLE A') || String(v).includes('EXEMPLE note')), 'no copy of the purged data anywhere in storage');
r = await f(req({ method: 'PATCH', path: '/ledger/' + garyRec, auth: B('gary'), body: { keep_alive: { on: true, days: 365 } } })); ok(r.status === 410, 'keep-alive after invitee purge → 410 refused');
r = await f(req({ method: 'PATCH', path: '/ledger/' + garyRec, auth: B('gary'), body: { fee: { amount: 10, period: 'mois', status: 'dû' } } })); ok(r.status === 410, 'fee on purged record → 410 refused');
r = await f(req({ auth: B('gary'), body: { to: 'EXEMPLE A', card_token: garyCard } })); ok(r.status === 410, 're-create on the purged card token → 410 refused');
r = await f(req({ method: 'GET', path: '/card?t=' + garyCard })); ok(r.status === 410, 'card on purged token → 410');
r = await f(req({ method: 'GET', path: '/ledger', auth: B('gary') })); ok((await r.json()).records.length === 0, "purged record absent from the admin's ledger");

console.log('— rate limits');
let codes = [];
for (let i = 0; i < 7; i++) { const x = await f(req({ ip: '10.9.9.9', auth: 'Bearer ' + tok() })); codes.push(x.status); }
ok(codes.slice(0, 5).every(c => c === 401) && codes.slice(5).every(c => c === 429), 'failed-auth rate limit (5 / 10 min) → 429', codes.join(','));
r = await f(req({ ip: '10.9.9.9', auth: B('gary') })); ok(r.status === 429, 'locked IP stays 429 even with a valid token');
codes = [];
for (let i = 0; i < 22; i++) { const x = await f(req({ ip: '10.8.8.8', auth: B('eric'), body: { to: 'EXEMPLE ' + i } })); codes.push(x.status); }
ok(codes.slice(0, 20).every(c => c === 202) && codes.slice(20).every(c => c === 429), 'volume rate limit (20 / min) → 429', codes.slice(18).join(','));

console.log('— hygiene');
r = await f(req({ auth: 'Bearer short' })); ok(r.status === 401, 'too-short key → 401');
ok(_test.ctEqual('ab', 'ab') && !_test.ctEqual('ab', 'ac') && !_test.ctEqual('ab', 'abc'), 'constant-time compare basics');
const src = readFileSync(new URL('./worker.js', import.meta.url), 'utf8');
ok(!/\bfetch\s*\(/.test(src.replace(/async fetch\(request, env\)/, '')) && !/mailchannels|sendgrid|smtp|resend/i.test(src), 'no outbound fetch / mail API in worker.js');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
