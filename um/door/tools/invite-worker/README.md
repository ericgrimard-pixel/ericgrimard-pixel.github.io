# um-invite — invite endpoint (hub v20.87)

Server-side enforcement at the invite endpoint for the Hub's admin-only **Guest** line.

- One bearer token per admin: Éric Grimard, Gary Kivenko, Samuel Le Flaguais.
- The Worker stores only the **SHA-256 hex** of each token, as Worker secrets. It compares in constant time.
- Basic rate limit, per isolate: 20 requests per minute per IP, and 5 failed authentications per 10 minutes per IP (answers 429).
- CORS: only `https://ericgrimard-pixel.github.io`. Any other origin gets 403 and no CORS header.
- **Per-admin scoping:** each ledger key starts with the admin id taken from the token. An admin can only list, edit, archive or purge their own invitees.
- **IMMUTABLE RULE** (Éric, 22 Nov 2026, 01:24): if the invitee ends the session or deletes their data (`POST /card/purge?t=`):
  - the record, its files and the card pointer are deleted at once;
  - only bare-hash tombstones remain, holding no data;
  - keep-alive, fees or re-creation on that record or card token answer **410**;
  - no admin control can override this.
- Routes:
  - `POST /invite` with `{"to", "lang", "meetings":{zoom,meet,teams,link}, "when"}`, bearer token;
  - `GET /ledger`, `PATCH /ledger/<id>` (`keep`, `keep_alive`, `fee`, `archived`, `notes`), `DELETE /ledger/<id>?confirm=<id>`, all with a bearer token;
  - `GET /card?t=`, `POST /card/choice?t=`, `POST /card/purge?t=`, which carry the opaque card token only. The card never receives fee, keep-alive, notes or label fields.
- `POST /invite` with `{"to": "...", "lang": "..."}`:
  - it validates the request and records the prepared invite (KV `INVITES`, optional);
  - it answers `202 {"status":"held — send gate closed", ...}`.
- **It sends no email and makes no outbound request.** The send gate stays closed until Éric approves the templates.
- Nothing here touches the client environment, the door intake, or the Manifestation protocol.
- No token and no secret value is in this repository.

## Status

**Not deployed** (22 Nov 2026). It has been tested locally only:

- `node test.mjs`: 38 checks pass, covering tokens, CORS, per-admin scoping, the card and invitee purge with tombstones, and rate limits.
- `wrangler dev --local` smoke test: valid → 202, wrong → 401, missing → 401, other origin → 403, preflight → 204, repeated failures → 429.

## What's needed to go live

1. **A Cloudflare account** owned by Universal Metaphor; the free plan is enough. Éric creates it. No agent creates accounts.
2. **One way to authenticate wrangler** on the deploying machine:
   - Interactive: `wrangler login`.
   - Or an API token from *My Profile → API Tokens → Create Token → template "Edit Cloudflare Workers"*. It needs these permissions:
     - Account · Workers Scripts · Edit
     - Account · Workers KV Storage · Edit
     - User · Memberships · Read
   - Export it as `CLOUDFLARE_API_TOKEN` (and `CLOUDFLARE_ACCOUNT_ID`).
3. **Three Worker secrets**, each the SHA-256 hex of that admin's Hub key. Use the hashes, never the keys themselves:
   - `ADMIN_SHA256_ERIC`
   - `ADMIN_SHA256_GARY`
   - `ADMIN_SHA256_SAMUEL`

   Since v20.88 the keys are base64url (256-bit), one per admin, and Éric is the master. The three hashes are public, in one place: `um/door/admin/fingerprints.js`. The keys stay on the box, outside the repo.

## Deploy steps

```sh
cd um/door/tools/invite-worker
npm test                                   # 38 checks, must all pass
wrangler kv namespace create INVITES       # required for the ledger and the card
#   paste the printed id into wrangler.toml ([[kv_namespaces]]) and uncomment it
wrangler secret put ADMIN_SHA256_ERIC      # paste the hash when prompted
wrangler secret put ADMIN_SHA256_GARY
wrangler secret put ADMIN_SHA256_SAMUEL
wrangler deploy                            # prints https://um-invite.<subdomain>.workers.dev
```

Then put that URL plus `/invite` into `UM_INVITE_ENDPOINT` in three places: the Guest block in `um/engine/hub-nav.js`, `um/door/card/index.html` and `um/door/admin/invites/index.html`. Bump the `?v=` in `um/index.html`, and push.

Until that constant is set, the Guest line shows **"endpoint non déployé [INCOMPLET]"** and only prepares the invite in the page.

## Revoking a key

Run `wrangler secret put ADMIN_SHA256_<NAME>` with a new hash, or delete the secret. Also remove the hash from the `ADM` list in `hub-nav.js` and the `cle` page.

## Honest limit

GitHub Pages is static. The Hub's admin check only **hides** the Guest line; anyone can read the public JS. The real enforcement is this Worker, once it is deployed.
