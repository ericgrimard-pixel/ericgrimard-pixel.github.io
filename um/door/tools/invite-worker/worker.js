/* Universal Metaphor — invite endpoint + per-admin invitee ledger (hub v20.87). Cloudflare Worker.
   - Server-side enforcement at the invite endpoint: one bearer token per admin (Éric, Gary, Samuel). Only the
     SHA-256 hex of each token is stored (Worker secrets); comparison in constant time.
   - Per-admin scoping: every ledger key starts with the admin id taken from the token. An admin reads, edits,
     archives and purges ONLY their own invitees.
   - Invitation card: an opaque card token (random, 128 bits) is the only thing in the invitee's link. The card
     reads issuer-set fields (issuer name, meeting links, date) and records the invitee's preferred channel.
     Fee and keep-alive fields are never returned to the card.
   - IMMUTABLE RULE (Éric, 22 Nov 2026 01:24): if the INVITEE ends the session or deletes their data, the record and
     its files are purged at once. Zero retention, no archive, no fee path, no backup. Only a bare hash tombstone is
     kept, so keep-alive, fee or re-creation on that record or card token is refused (410). No admin control overrides it.
   - Sends NO email and makes NO outbound request. Status of every invite: "held — send gate closed". */

const ALLOWED_ORIGIN = 'https://ericgrimard-pixel.github.io';
const ADMINS = [
  { id: 'eric-grimard', name: 'Éric Grimard', secret: 'ADMIN_SHA256_ERIC' },
  { id: 'gary-kivenko', name: 'Gary Kivenko', secret: 'ADMIN_SHA256_GARY' },
  { id: 'samuel-le-flaguais', name: 'Samuel Le Flaguais', secret: 'ADMIN_SHA256_SAMUEL' },
];
const VISIBLE_FROM = 'data@universalmetaphor.ca';
const HELD = 'held — send gate closed';
const MODES = ['email', 'ai', 'video', 'phone', 'later'];
const LIMIT_OK = { max: 20, windowMs: 60_000 };
const LIMIT_FAIL = { max: 5, windowMs: 10 * 60_000 };
const MEET_RX = {
  zoom: /^https:\/\/([a-z0-9-]+\.)?zoom\.us\/[^\s]*$/i,
  meet: /^https:\/\/meet\.google\.com\/[^\s]*$/i,
  teams: /^https:\/\/(teams\.microsoft\.com|teams\.live\.com)\/[^\s]*$/i,
  link: /^https:\/\/[^\s]+$/i,
};

const hits = new Map();
function limited(key, rule, now) {
  const h = hits.get(key);
  if (!h || now - h.start >= rule.windowMs) { hits.set(key, { start: now, n: 1 }); return false; }
  h.n += 1; return h.n > rule.max;
}
function peek(key, rule, now) { const h = hits.get(key); return !!h && now - h.start < rule.windowMs && h.n >= rule.max; }
function cors(origin) {
  if (origin !== ALLOWED_ORIGIN) return {};
  return { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '600', 'Vary': 'Origin' };
}
function json(status, body, origin, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors(origin), ...extra } });
}
async function sha256hex(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
function ctEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0;
}
async function whoIs(token, env) {
  if (!/^[A-Za-z0-9_-]{22,128}$/.test(token)) return null; /* base64url keys (v20.88), ≥128-bit */
  const h = await sha256hex(token);
  let found = null;
  for (const a of ADMINS) { const want = String(env[a.secret] || '').trim().toLowerCase(); if (want.length === 64 && ctEqual(h, want) && !found) found = a; }
  return found;
}
const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
function meetings(m) {
  const out = {}; if (!m || typeof m !== 'object') return out;
  for (const k of Object.keys(MEET_RX)) { const v = str(m[k], 500); if (v && MEET_RX[k].test(v)) out[k] = v; }
  return out;
}
function randToken() { const b = new Uint8Array(16); crypto.getRandomValues(b); return [...b].map(x => x.toString(16).padStart(2, '0')).join(''); }
const recKey = (adminId, id) => `ledger:${adminId}:${id}`;
const recTomb = async (adminId, id) => 'tomb:rec:' + await sha256hex(adminId + ':' + id);
/* Invitee purge: record, its files and the card pointer are deleted; only bare hashes remain as tombstones. */
async function purge(KV, adminId, id, cardHash) {
  await KV.delete(recKey(adminId, id));
  let cursor; do { const l = await KV.list({ prefix: `files:${adminId}:${id}:`, cursor }); for (const k of l.keys) await KV.delete(k.name); cursor = l.list_complete ? null : l.cursor; } while (cursor);
  if (cardHash) { await KV.delete('card:' + cardHash); await KV.put('tomb:card:' + cardHash, '1'); }
  await KV.put(await recTomb(adminId, id), '1');
}
const KEEPABLE = ['label', 'invited_at', 'status', 'mode', 'meetings', 'files', 'card', 'notes'];

/* Only issuer-set, non-client fields go to the card. Never fee, keep-alive, notes, label or invitee contact. */
function cardView(rec) {
  return { issuer: rec.issuer_name, visible_from: VISIBLE_FROM, reply_to: 'issuer', lang: rec.lang || 'fr',
    meetings: rec.meetings || {}, when: rec.when || null, duration_min: rec.duration_min || null, status: HELD };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const ip = request.headers.get('CF-Connecting-IP') || 'local';
    const now = Date.now();
    const path = url.pathname;
    const KV = env.INVITES;

    if (request.method === 'OPTIONS') {
      if (origin !== ALLOWED_ORIGIN) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (!/^\/(invite|card|card\/choice|card\/purge|ledger(\/[0-9a-f-]{36})?)$/.test(path)) return json(404, { error: 'not found' }, origin);
    if (origin !== ALLOWED_ORIGIN) return json(403, { error: 'origin not allowed' }, origin);
    if (peek('fail:' + ip, LIMIT_FAIL, now) || limited('all:' + ip, LIMIT_OK, now)) return json(429, { error: 'rate limited' }, origin, { 'Retry-After': '60' });

    /* ---- card (invitee side): opaque card token only ---- */
    if (path === '/card' || path === '/card/choice' || path === '/card/purge') {
      const t = url.searchParams.get('t') || '';
      if (!/^[0-9a-f]{32}$/.test(t)) { limited('fail:' + ip, LIMIT_FAIL, now); return json(401, { error: 'invalid card token' }, origin); }
      if (!KV) return json(503, { error: 'ledger not configured' }, origin);
      const th = await sha256hex(t);
      if (await KV.get('tomb:card:' + th)) return json(410, { error: 'purged', status: 'Supprimé — rien n\'est conservé' }, origin);
      const ptr = await KV.get('card:' + th, 'json');
      if (!ptr) { limited('fail:' + ip, LIMIT_FAIL, now); return json(401, { error: 'invalid card token' }, origin); }
      const rec = await KV.get(recKey(ptr.admin, ptr.id), 'json');
      if (path === '/card/purge' && request.method === 'POST') { /* invitee-initiated: overrides every admin control */
        await purge(KV, ptr.admin, ptr.id, th);
        return json(200, { purged: true, status: 'Supprimé — rien n\'est conservé' }, origin);
      }
      if (!rec || rec.archived) return json(410, { error: 'invitation closed' }, origin);
      if (path === '/card' && request.method === 'GET') return json(200, cardView(rec), origin);
      if (path === '/card/choice' && request.method === 'POST') {
        let b; try { b = await request.json(); } catch { return json(400, { error: 'bad json' }, origin); }
        const mode = str(b.mode, 10); if (!MODES.includes(mode)) return json(400, { error: 'mode' }, origin);
        rec.mode = mode; rec.mode_detail = str(b.detail, 200); rec.mode_at = new Date(now).toISOString();
        await KV.put(recKey(ptr.admin, ptr.id), JSON.stringify(rec));
        return json(200, { status: 'noted', reply_to: 'issuer', issuer: rec.issuer_name }, origin);
      }
      return json(405, { error: 'method not allowed' }, origin);
    }

    /* ---- admin side: bearer token ---- */
    const m = (request.headers.get('Authorization') || '').match(/^Bearer\s+(\S+)$/);
    if (!m) { limited('fail:' + ip, LIMIT_FAIL, now); return json(401, { error: 'missing token' }, origin, { 'WWW-Authenticate': 'Bearer' }); }
    const admin = await whoIs(m[1], env);
    if (!admin) { limited('fail:' + ip, LIMIT_FAIL, now); return json(401, { error: 'invalid token' }, origin, { 'WWW-Authenticate': 'Bearer' }); }

    if (path === '/invite') {
      if (request.method !== 'POST') return json(405, { error: 'method not allowed' }, origin, { Allow: 'POST, OPTIONS' });
      let body; try { body = await request.json(); } catch { return json(400, { error: 'bad json' }, origin); }
      const to = str(body.to, 200); if (!to) return json(400, { error: 'field "to" required (max 200 chars)' }, origin);
      if (typeof body.card_token === 'string' && /^[0-9a-f]{32}$/.test(body.card_token) && await KV?.get('tomb:card:' + await sha256hex(body.card_token)))
        return json(410, { error: 'purged by the invitee — re-creation refused' }, origin);
      const id = crypto.randomUUID(); const card = randToken();
      const rec = { id, admin: admin.id, issuer_name: admin.name, status: HELD, label: to, lang: str(body.lang, 40),
        meetings: meetings(body.meetings), when: str(body.when, 40) || null, duration_min: Number(body.duration_min) > 0 ? Math.min(600, Number(body.duration_min) | 0) : null,
        invited_at: new Date(now).toISOString(), keep: KEEPABLE.slice(), keep_alive: { on: false, days: 0 }, fee: { amount: null, period: '', status: '' },
        archived: false, notes: '' };
      if (KV) { await KV.put(recKey(admin.id, id), JSON.stringify(rec)); await KV.put('card:' + await sha256hex(card), JSON.stringify({ admin: admin.id, id })); }
      return json(202, { status: HELD, id, issuer: admin.name, visible_from: VISIBLE_FROM, recorded: !!KV, card_token: KV ? card : null }, origin);
    }

    if (!KV) return json(503, { error: 'ledger not configured' }, origin);
    if (path === '/ledger' && request.method === 'GET') {
      const out = []; let cursor;
      do { const l = await KV.list({ prefix: `ledger:${admin.id}:`, cursor }); for (const k of l.keys) { const r = await KV.get(k.name, 'json'); if (r) out.push(r); } cursor = l.list_complete ? null : l.cursor; } while (cursor);
      return json(200, { admin: admin.name, records: out }, origin);
    }
    const id = path.split('/')[2];
    const key = recKey(admin.id, id); // scoped: another admin's id can never be reached
    if (await KV.get(await recTomb(admin.id, id))) return json(410, { error: 'purged by the invitee — no keep-alive, no fee, no re-creation' }, origin);
    const rec = await KV.get(key, 'json');
    if (!rec) return json(404, { error: 'not found' }, origin);
    if (request.method === 'PATCH') {
      let b; try { b = await request.json(); } catch { return json(400, { error: 'bad json' }, origin); }
      if (Array.isArray(b.keep)) rec.keep = b.keep.filter(k => KEEPABLE.includes(k));
      if (b.keep_alive && typeof b.keep_alive === 'object') rec.keep_alive = { on: !!b.keep_alive.on, days: Math.max(0, Math.min(3650, Number(b.keep_alive.days) | 0)) };
      if (b.fee && typeof b.fee === 'object') rec.fee = { amount: b.fee.amount === null || b.fee.amount === '' ? null : Number(b.fee.amount), period: str(b.fee.period, 20), status: str(b.fee.status, 20) };
      if ('archived' in b) rec.archived = !!b.archived;
      if ('notes' in b) rec.notes = str(b.notes, 2000);
      if ('label' in b) rec.label = str(b.label, 200);
      for (const k of KEEPABLE) if (!rec.keep.includes(k) && k in rec && !['card'].includes(k)) { if (k === 'meetings') rec.meetings = {}; else if (k !== 'label') rec[k] = k === 'notes' ? '' : null; }
      await KV.put(key, JSON.stringify(rec));
      return json(200, rec, origin);
    }
    if (request.method === 'DELETE') {
      if (url.searchParams.get('confirm') !== id) return json(409, { error: 'purge needs confirm=<id>' }, origin);
      await KV.delete(key);
      let cursor; do { const l = await KV.list({ prefix: `files:${admin.id}:${id}:`, cursor }); for (const k of l.keys) await KV.delete(k.name); cursor = l.list_complete ? null : l.cursor; } while (cursor);
      return json(200, { purged: id }, origin);
    }
    return json(405, { error: 'method not allowed' }, origin);
  },
};
export const _test = { ctEqual, sha256hex, hits, ALLOWED_ORIGIN, HELD, cardView };
