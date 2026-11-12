/* v20.27 — short trailing-sequence ghost for financial floors
 *
 * Éric (voice, 2026-11-12, America/Toronto): a GHOST on BOTH interpretations
 * of the financial floors. The ghost is the last sequence of the movement —
 * a short trailing segment, like a motion trail. Short is good: it gives an
 * idea of the movement. NOT Fourier-related. Not the v19 volume-spaced
 * trail (volGh / volGhObj / arc-length trail along the whole path).
 *
 * Both interpretations (Hub evidence — see FLOOR-SHORT-GHOST-SPEC.md):
 *   - "year"     : séance-by-séance walk (trailFullYear, door #sp500y / "2026 · année").
 *                  Last N séances behind the current τ.
 *   - "twopass"  : single cycloidal T0→T1 segment (trailTwoPass, door #sp500 /
 *                  "deux séances", __MARKET_Z0_TWOPASS). Last N virtual frames
 *                  behind the current t ∈ [0,1] on that segment.
 *
 * No invented market data: samples only existing getPos(i) values and the
 * engine's already-used interpolant (cyc / ZL) between known seats. Missing
 * seats are skipped. At T0 / t=0 the tail is empty.
 *
 * Length: N = 8 (in the 6–12 range). Decay: linear fade 0.08 (oldest) → 0.45
 * (newest ghost), always behind the live object (α = 1). For twopass the
 * virtual frame count along T0→T1 is 64, so the tail spans 8/64 ≈ 12.5 % of
 * the segment (short regardless of playSubsteps, which is only 8 in floor mode).
 *
 * This file is pure and DOM-free so it can be unit-tested in Node and reused
 * by Claude's artifact engine. app.js paints with paintFloorShortGhosts().
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FloorShortGhost = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
  const N = 8;
  const TWOPASS_FRAMES = 64;
  const FADE_MIN = 0.08;
  const FADE_MAX = 0.45;
  const YEAR_TOKENS = ['year', 'annee', 'année', 'an', 'fullYear'];
  const TWOPASS_TOKENS = ['twopass', 't0t1', 't0-t1', 'seances', 'séances', 'deux-seances', 'deux-séances', '2seances'];

  function fade(i, n) {
    if (!(n > 0)) return 0;
    const t = (i + 1) / n; // 1/n … 1, i=0 oldest
    return FADE_MIN + (FADE_MAX - FADE_MIN) * t;
  }

  function applyFades(pts) {
    const n = pts.length;
    pts.forEach((g, i) => { g.fade = fade(i, n); });
    return pts;
  }

  function isYear(kind) {
    const k = String(kind == null ? '' : kind).toLowerCase();
    return YEAR_TOKENS.includes(k) || k === 'year';
  }

  function interpOf(flagOrKind) {
    if (flagOrKind === false) return 'year';
    if (flagOrKind === true) return 'twopass';
    return isYear(flagOrKind) ? 'year' : 'twopass';
  }

  function parseInterpretation(parts, query) {
    let found = null;
    const consider = (raw) => {
      if (raw == null || raw === '') return;
      const t = String(raw).toLowerCase();
      if (YEAR_TOKENS.includes(t)) found = 'year';
      else if (TWOPASS_TOKENS.includes(t)) found = 'twopass';
    };
    if (query && typeof query === 'object') {
      const q = query;
      const get = typeof q.get === 'function'
        ? (k) => q.get(k)
        : (k) => q[k];
      consider(get('view') || get('interp') || get('interpretation'));
    }
    if (Array.isArray(parts)) parts.forEach(consider);
    return found;
  }

  function defaultCyc(p0, p1, t) {
    if (!p0) return p1 || null;
    if (!p1 || !(t > 0)) return p0;
    if (t >= 1) return p1;
    return [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];
  }

  function firstPos(getPos, S0, S1) {
    let i0 = S0, p0 = getPos(i0);
    while (!p0 && i0 < S1) { i0++; p0 = getPos(i0); }
    return { i0, p0, p1: getPos(S1) };
  }

  function tCurTwoPass(playing, progress, parkedAt) {
    if (playing) return Math.max(0, Math.min(1, +progress || 0));
    if (parkedAt === 'T1' || parkedAt === 1) return 1;
    if (parkedAt === 'T0' || parkedAt === 0) return 0;
    const n = +parkedAt;
    if (isFinite(n)) return Math.max(0, Math.min(1, n));
    return 1; // floor views land on T1
  }

  function pointsTwoPass(args) {
    const getPos = args.getPos;
    const cycFn = args.cycFn || defaultCyc;
    const S0 = args.S0, S1 = args.S1;
    const { i0, p0, p1 } = firstPos(getPos, S0, S1);
    if (!p0 || !p1) return []; // no T0 or no T1 → no movement to trail; do not invent
    const tCur = tCurTwoPass(args.playing, args.progress, args.parkedAt);
    if (tCur <= 0) return [];
    const frames = Math.max(N, args.frames || TWOPASS_FRAMES);
    const dt = 1 / frames;
    const pts = [];
    for (let k = N; k >= 1; k--) {
      const t = tCur - k * dt;
      if (t < 0) continue; // before T0: skip, do not invent
      const p = t === 0 ? p0 : (t >= 1 ? p1 : cycFn(p0, p1, t, i0, S1));
      if (p) pts.push({ p: [p[0], p[1]], t, kind: 'twopass' });
    }
    return applyFades(pts);
  }

  function pointsYear(args) {
    const getPos = args.getPos;
    const S0 = args.S0, S1 = args.S1;
    const c = args.c, u = args.u || 0;
    const tau = c + u;
    if (!(tau > S0)) return [];
    const pts = [];
    const from = Math.max(S0, Math.floor(tau) - N);
    for (let i = from; i < tau && i <= S1; i++) {
      if (i !== Math.floor(i)) continue;
      const p = getPos(i);
      if (!p) continue; // missing séance: skip, do not invent
      pts.push({ p: [p[0], p[1]], t: i, seance: i, kind: 'year' });
    }
    return applyFades(pts.slice(-N));
  }

  function points(mode, args) {
    return interpOf(mode) === 'year' ? pointsYear(args) : pointsTwoPass(args);
  }

  /* Class-4 rides the linear fil Z0(τ)=ZL(τ), not the cycloidal floater rule. */
  function pointsC4TwoPass(args) {
    const ZL = args.ZL;
    const S0 = args.S0, S1 = args.S1;
    if (typeof ZL !== 'function') return [];
    const tCur = tCurTwoPass(args.playing, args.progress, args.parkedAt);
    if (tCur <= 0) return [];
    const frames = Math.max(N, args.frames || TWOPASS_FRAMES);
    const dt = 1 / frames;
    const pts = [];
    for (let k = N; k >= 1; k--) {
      const t = tCur - k * dt;
      if (t < 0) continue;
      const tau = S0 + t * (S1 - S0);
      const p = ZL(tau);
      if (p) pts.push({ p: [p[0], p[1]], t, tau, kind: 'twopass-c4' });
    }
    return applyFades(pts);
  }

  function pointsC4Year(args) {
    const ZL = args.ZL;
    const S0 = args.S0, S1 = args.S1;
    const c = args.c, u = args.u || 0;
    const tau = c + u;
    if (typeof ZL !== 'function' || !(tau > S0)) return [];
    const pts = [];
    const from = Math.max(S0, Math.floor(tau) - N);
    for (let i = from; i < tau && i <= S1; i++) {
      if (i !== Math.floor(i)) continue;
      const p = ZL(i);
      if (!p) continue;
      pts.push({ p: [p[0], p[1]], t: i, tau: i, kind: 'year-c4' });
    }
    return applyFades(pts.slice(-N));
  }

  return {
    VERSION: 'v20.27',
    N, TWOPASS_FRAMES, FADE_MIN, FADE_MAX,
    fade, interpOf, isYear, parseInterpretation,
    points, pointsTwoPass, pointsYear,
    pointsC4TwoPass, pointsC4Year, defaultCyc, tCurTwoPass
  };
}));
