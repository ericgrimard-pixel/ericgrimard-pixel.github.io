/* um/seed/model-hook.mjs — point d'ancrage « model » de la graine fantôme (v21.08).
 * Claude, 27 nov 2026. Neutre vis-à-vis du fournisseur : aucune adresse, aucun service, aucun secret ici.
 * Le fournisseur est injecté par l'hôte à l'activation ; une clé éventuelle est fournie par l'hôte à l'exécution.
 *
 * Contrat :
 *   const model = createModelHook({ provider, timeoutMs });
 *   await model.generate(prompt, { stream, maxTokens, temperature, system, signal })
 *     -> string                          si stream est faux
 *     -> AsyncIterable<string>           si stream est vrai
 *   model.describe() -> { capability: 'model' | null, provider: string|null, real: boolean }
 *   Erreurs : ModelError, avec code ∈ { NO_MODEL, UNREACHABLE, TIMEOUT, ABORTED, BAD_REQUEST, PROVIDER }.
 *   Rien ne plante la graine : chaque échec rejette une ModelError, jamais une exception brute.
 *
 * Un fournisseur est un objet { name, async generate(req) } où req = { prompt, stream, maxTokens, temperature, system, signal }
 * et generate renvoie une chaîne, ou un itérable asynchrone de chaînes quand req.stream est vrai.
 */

export class ModelError extends Error {
  constructor(code, message, cause) {
    super(message);
    this.name = 'ModelError';
    this.code = code;
    if (cause !== undefined) this.cause = cause;
  }
}

export const NO_MODEL_TEXT = '[aucun modèle] Aucun fournisseur de modèle n\'est branché sur cet hôte.';

/* Modèle nul : le repli. Il renvoie un résultat explicite « aucun modèle », jamais un faux texte. */
export const nullProvider = Object.freeze({
  name: null,
  isNull: true,
  async generate(req) {
    if (req.stream) return (async function* () { yield NO_MODEL_TEXT; })();
    return NO_MODEL_TEXT;
  },
});

function checkOpts(prompt, opts) {
  if (typeof prompt !== 'string') throw new ModelError('BAD_REQUEST', 'prompt doit être une chaîne');
  const o = opts || {};
  const out = {
    stream: !!o.stream,
    maxTokens: o.maxTokens,
    temperature: o.temperature,
    system: o.system,
    signal: o.signal,
  };
  if (out.maxTokens !== undefined && !(Number.isInteger(out.maxTokens) && out.maxTokens > 0))
    throw new ModelError('BAD_REQUEST', 'maxTokens doit être un entier positif');
  if (out.temperature !== undefined && !(typeof out.temperature === 'number' && out.temperature >= 0 && out.temperature <= 2))
    throw new ModelError('BAD_REQUEST', 'temperature doit être un nombre entre 0 et 2');
  if (out.system !== undefined && typeof out.system !== 'string')
    throw new ModelError('BAD_REQUEST', 'system doit être une chaîne');
  return out;
}

/* Combine le signal de l'appelant et le délai maximal en un seul AbortSignal ; dit lequel a tiré. */
function guard(callerSignal, timeoutMs) {
  const ctl = new AbortController();
  let why = null, timer = null;
  const onCaller = () => { if (!why) { why = 'ABORTED'; ctl.abort(); } };
  if (callerSignal) {
    if (callerSignal.aborted) onCaller();
    else callerSignal.addEventListener('abort', onCaller, { once: true });
  }
  if (timeoutMs > 0) timer = setTimeout(() => { if (!why) { why = 'TIMEOUT'; ctl.abort(); } }, timeoutMs);
  const done = () => { clearTimeout(timer); if (callerSignal) callerSignal.removeEventListener('abort', onCaller); };
  const fail = () => why === 'TIMEOUT'
    ? new ModelError('TIMEOUT', `délai dépassé (${timeoutMs} ms)`)
    : new ModelError('ABORTED', 'annulé par l\'appelant');
  /* rejette dès que le signal tire, même si le fournisseur ignore le signal */
  const raced = (p) => new Promise((res, rej) => {
    Promise.resolve(p).catch(() => {}); /* un rejet tardif du fournisseur n'est jamais « non géré » */
    if (ctl.signal.aborted) return rej(fail());
    const onAbort = () => rej(fail());
    ctl.signal.addEventListener('abort', onAbort, { once: true });
    p.then(v => { ctl.signal.removeEventListener('abort', onAbort); res(v); },
           e => { ctl.signal.removeEventListener('abort', onAbort); rej(e); });
  });
  return { signal: ctl.signal, done, fail, raced, fired: () => why };
}

function wrapErr(e, g) {
  if (e instanceof ModelError) return e;
  if (g.fired()) return g.fail();
  if (e && e.name === 'AbortError') return new ModelError('ABORTED', 'annulé', e);
  const msg = (e && e.message) || String(e);
  if (e && (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND' || e.code === 'UNREACHABLE' || /fetch failed|network|ECONNREFUSED|ENOTFOUND/i.test(msg)))
    return new ModelError('UNREACHABLE', 'fournisseur injoignable : ' + msg, e);
  return new ModelError('PROVIDER', 'erreur du fournisseur : ' + msg, e);
}

export function createModelHook({ provider, timeoutMs = 60000 } = {}) {
  const p = provider && typeof provider.generate === 'function' ? provider : nullProvider;
  const real = !p.isNull;

  async function generate(prompt, opts) {
    let req;
    try { req = checkOpts(prompt, opts); } catch (e) { throw e instanceof ModelError ? e : wrapErr(e, { fired: () => null }); }
    const g = guard(req.signal, timeoutMs);
    const preq = { prompt, stream: req.stream, maxTokens: req.maxTokens, temperature: req.temperature, system: req.system, signal: g.signal };
    if (!req.stream) {
      try {
        const out = await g.raced(Promise.resolve().then(() => p.generate(preq)));
        if (typeof out !== 'string') throw new ModelError('PROVIDER', 'le fournisseur n\'a pas renvoyé de texte');
        return out;
      } catch (e) { throw wrapErr(e, g); }
      finally { g.done(); }
    }
    let src;
    try {
      src = await g.raced(Promise.resolve().then(() => p.generate(preq)));
      if (typeof src === 'string') { const s = src; src = (async function* () { yield s; })(); }
      if (!src || typeof src[Symbol.asyncIterator] !== 'function') throw new ModelError('PROVIDER', 'le fournisseur n\'a pas renvoyé de flux');
    } catch (e) { g.done(); throw wrapErr(e, g); }
    const it = src[Symbol.asyncIterator]();
    return (async function* () {
      try {
        while (true) {
          let r;
          try { r = await g.raced(it.next()); } catch (e) { throw wrapErr(e, g); }
          if (r.done) return;
          if (typeof r.value !== 'string') throw new ModelError('PROVIDER', 'morceau de flux non textuel');
          yield r.value;
        }
      } finally {
        g.done();
        if (typeof it.return === 'function') { try { await it.return(); } catch (_) { /* rien */ } }
      }
    })();
  }

  function describe() {
    return { capability: real ? 'model' : null, provider: real ? (p.name || 'sans nom') : null, real };
  }

  return Object.freeze({ generate, describe });
}

/* Connecteur générique HTTP. Aucun point de terminaison par défaut : l'hôte fournit url, en-têtes
 * (clé comprise, à l'exécution) et les deux fonctions qui traduisent la requête et la réponse.
 *   httpProvider({ url, headers, toBody(req) -> objet JSON, fromJson(json) -> texte,
 *                  fromChunk(ligne) -> texte|null (flux, une ligne de texte par événement), fetchImpl })
 * En flux, le corps est lu ligne par ligne ; les lignes « data: … » (SSE) sont acceptées. */
export function httpProvider({ name = 'http', url, headers = {}, toBody, fromJson, fromChunk, fetchImpl } = {}) {
  if (!url) throw new ModelError('BAD_REQUEST', 'httpProvider : url requise (fournie par l\'hôte)');
  const f = fetchImpl || (typeof fetch === 'function' ? fetch : null);
  if (!f) throw new ModelError('BAD_REQUEST', 'httpProvider : aucune fonction fetch disponible');
  const body = toBody || (r => ({ prompt: r.prompt, system: r.system, max_tokens: r.maxTokens, temperature: r.temperature, stream: r.stream }));
  const parse = fromJson || (j => (typeof j === 'string' ? j : (j && (j.text ?? j.output ?? j.completion)) ?? ''));
  const chunk = fromChunk || (line => { try { const j = JSON.parse(line); return typeof j === 'string' ? j : (j.text ?? j.delta ?? null); } catch { return line; } });
  return {
    name,
    async generate(req) {
      let res;
      try {
        res = await f(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body(req)), signal: req.signal });
      } catch (e) {
        if (e && e.name === 'AbortError') throw e;
        throw new ModelError('UNREACHABLE', 'fournisseur injoignable : ' + ((e && e.message) || e), e);
      }
      if (!res.ok) throw new ModelError('PROVIDER', `réponse HTTP ${res.status}`);
      if (!req.stream) return String(parse(await res.json()));
      const reader = res.body.getReader(), dec = new TextDecoder();
      return (async function* () {
        let buf = '';
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            let i;
            while ((i = buf.indexOf('\n')) >= 0) {
              let line = buf.slice(0, i).replace(/\r$/, ''); buf = buf.slice(i + 1);
              if (line.startsWith('data:')) line = line.slice(5).trim();
              if (!line || line === '[DONE]') continue;
              const t = chunk(line); if (t) yield t;
            }
          }
          const last = buf.trim();
          if (last && last !== '[DONE]') { const t = chunk(last.startsWith('data:') ? last.slice(5).trim() : last); if (t) yield t; }
        } finally { try { reader.releaseLock(); } catch { /* rien */ } }
      })();
    },
  };
}

/* Faux fournisseur pour les tests : déterministe, sans réseau. */
export function fakeProvider({ name = 'faux', chunks = ['Bon', 'jour', ' Éric'], delayMs = 0, fail = null, hang = false } = {}) {
  const wait = (ms, signal) => new Promise((res, rej) => {
    if (signal && signal.aborted) return rej(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    const t = setTimeout(res, ms);
    if (signal) signal.addEventListener('abort', () => { clearTimeout(t); rej(Object.assign(new Error('aborted'), { name: 'AbortError' })); }, { once: true });
  });
  const calls = [];
  return {
    name, calls,
    async generate(req) {
      calls.push({ ...req, signal: undefined });
      if (fail === 'unreachable') throw Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:1'), { code: 'ECONNREFUSED' });
      if (fail) throw new Error(String(fail));
      if (hang) await new Promise(() => {});
      const parts = req.maxTokens ? chunks.slice(0, req.maxTokens) : chunks;
      if (!req.stream) { if (delayMs) await wait(delayMs, req.signal); return parts.join(''); }
      return (async function* () { for (const c of parts) { if (delayMs) await wait(delayMs, req.signal); yield c; } })();
    },
  };
}
