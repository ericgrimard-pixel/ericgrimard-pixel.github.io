# Short trailing-sequence ghost — spec for the Hub floors

Date: 2026-11-12, America/Toronto (EST, UTC-5)
Hub version: v20.31 (five cardinal floors drawn in the Hub + short ghost)
Source of the request: Éric, voice. Apply a GHOST on BOTH interpretations of the financial floors. Not Fourier. A simple trailing-sequence ghost: the last sequence of the movement, a short trailing segment like a motion trail. Short is good — it gives an idea of the movement.

The live renderer is the Hub canvas (`um/index.html`, `um/js/app.js`).
Opening `/um/` lands on `#/floor/AMF/index/SPX/year`. The door panel opens
the five cardinals in place: `#/floor/AMF/index/SPX/year` and `/t0t1`,
`#/floor/ASF/index/N225/year` and `/t0t1`, `#/floor/EUF/index/SX5E/year`
and `/t0t1`, `#/floor/ASF/index/TASI/year` and `/t0t1`,
`#/floor/AMF/index/IBOV/year` and `/t0t1`. Math lives in
`um/js/floor-short-ghost.js`; `um/js/app.js` paints it with
`paintFloorShortGhosts`.

## What “both interpretations” means

1. **Year** — séance-by-séance walk of the already-embedded series
   (Hub: `trailFullYear`, door `#sp500y` labelled “2026 · année”).
   Current parameter is τ = c + u along the
   trading-day index.
2. **Two-session / T0→T1** — a single cycloidal segment between the two
   market frames (Hub: `trailTwoPass`, `__MARKET_Z0_TWOPASS`, doors `#sp500`
   “deux séances”, and the other T0/T1 world-index doors). Current parameter
   is t ∈ [0, 1] on that one segment. Frames: T0 = 2026-01-02, T1 = 2026-11-04.

These are two readings of the same floor data, not Libre vs Fourier, and not
the v19 volume-spaced activity trail (`volGh` / `volGhObj`). Do not hook this
ghost to the Fourier gate. Libre / Fourier may keep their own modes; the
short ghost is a positional motion trail in both floor interpretations.

Evidence in the Hub: `um/um-engine.js` lists both readings for each cardinal
(année and T0→T1). `trail()` dispatches on `__MARKET_Z0_TWOPASS`.

## Visual rule (identical in both interpretations)

For each moving element that the floor already draws (Class 2 objects,
visible / selected Class 1 titles, deployed constituents, the living Class 4
on the fil Z0, Class-4 boxes if present):

- Keep the last **N = 8** samples of that element’s trajectory
  (range asked: 6–12; 8 is short and readable).
- Draw them **behind** the current position, **not** in place of it.
- Opacity decays toward the tail:
  `fade_i = 0.08 + 0.37 × (i+1)/n`  (i = 0 is the oldest visible ghost,
  n ≤ 8). Newest ghost α ≈ 0.45; live object stays at full opacity.
- If the engine has a system-volume slider, multiply fade by it. Do **not**
  require the v19 `volGh` / `volGhObj` knobs — this trail should be visible
  so the floor itself shows how things just moved.
- Radius of a ghost disc is about half the live disc of the same element.
- Colour = the element’s existing colour.
- Draw the ghosts after the grid / Z0 fil and **before** the live objects.

## Sampling (no invented market data)

**Year.** Let τ = c + u be the current play head. Collect existing positions
at integer séances i with `floor(τ) − 8 ≤ i < τ`. Skip a séance if that
element has no position there. If fewer than 8 prior séances exist (start of
the year), draw only what exists. At T0 the tail is empty.

**T0→T1.** Let t_cur be the progress along the single cycloidal segment
(0 at T0, 1 at T1). Imagine 64 virtual frames along that segment. The ghost
is the last 8 frames strictly behind t_cur, i.e. a window of 8/64 ≈ 12.5 %
of the segment. Sample with the same interpolant the live object already
uses (Hub: `cyc` for Class 1 / 2 floaters; linear `ZL(τ)` for Class 4, which
rides the fil). If either endpoint is missing, draw nothing for that
element. At t_cur = 0 the tail is empty. When parked at T1, the tail is the
last 12.5 % of the T0→T1 segment — a short arrival trail, not the whole path.

Do not invent prices, séances, or intermediate “true” market prints. Only
replay the path the engine already interpolates between known seats.

## What not to do

- Do not replace or remove the existing v19 volumetric activity ghosts if
  they are still used for click-to-deploy. This is a separate, always-on
  short motion trail.
- Do not treat this as a Fourier / Kobayashi construction.
- Do not apply it to the Music silo or to sports / NHL (no Z0 finance floor).
- Do not fabricate missing series (e.g. JSE40, SSE) just to have a trail.

## Acceptance checks

- Opening `#sp500y` (year) and `#sp500` (two séances) both show a short
  fading tail behind each moving element while playing, and a short arrival
  tail when parked at T1.
- The year tail follows daily seats; the two-session tail follows the single
  T0→T1 cycloid (or the engine’s equivalent). They must not look identical
  mid-play (year jumps seat-to-seat; two-pass is one long arc).
- At T0 / start, no tail.
- Live objects remain sharp and on top of their ghosts.
