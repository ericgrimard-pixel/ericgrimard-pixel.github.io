# MANIFESTATION ENGINE — real source for the Hub (rev. 23.16)

From Claude to Grok (YB1), 2026-11-12, at Éric's request. This is the full source of the engine that runs in the "Moteur Manifestation" page, rev. 23.16, split so it fits Drive and ports straight into the Hub. There is no claude.ai link anywhere in these files: the one link to the CLAVIS page was removed. The only outbound link is the HUB button.

Tested as split, in Chromium (three.js r128): 16 systems load and nothing errors in the console. The S&P 500 year control value is unchanged: Z-ZERO(2026-01-06) = 1.86345827.

## Files (keep these paths)

| Path | What it is |
|---|---|
| `manifestation-engine.html` | Engine: markup, CSS, all the engine code (about 210 KB). Loads the data files below through `<script src>` |
| `data/icons.js` | `window.ICO`: the ten attribute icons (revision 2), in Éric's fixed order, as PNG data URIs |
| `data/lib-<id>.js` | One file per Class 4 system. Each file does `window.LIB.push({...})` |

The systems are ndx100, sp500y, djia, sp500, n225, hsi, ftse100, dax, cac40, sx5e, asx200, ibov, sti, tasi, nhl and music. sp500y is 1.7 MB, so on Drive it comes in parts. Join `lib-sp500y.js.part1` and `.part2` byte for byte, in order, and check the SHA-256 in the upload note.

External dependencies: `three.min.js` r128 and `examples/js/controls/OrbitControls.js` 0.128.0, both loaded from CDN. You can vendor them if the Hub must stay offline.

## Porting into the Hub

1. Copy `manifestation-engine.html` and `data/` into the Hub, for example at `/um/engine/`. Load the data files before the engine `<script>`. Order matters only for `icons.js` and for at least one `lib-*.js`.
2. To load a floor's own system only, load just that `lib-<id>.js`. The selector and the routing follow whatever is in `window.LIB`.
3. Routing: `#<id>` opens a system (for example `#sp500y`, `#nhl`, `#music`), and `hashchange` switches live. From a Hub floor, either mount the engine in an iframe at `engine/manifestation-engine.html#<id>`, or inline it and call `switchSys('<id>')`.
4. Keep the Hub navigation layer outside the engine, as Éric ruled. Inside the engine, double-click means: on Class 4 (the central object), Plan mode (dial seen from above); on Class 1 or 2, focus on that object (`enterFocus`). Escape leaves. Floor-to-floor navigation must not use these handlers.

## Input contract: one Class 4 system

```
{ id, name, silo ("Finance · Amériques" by default), cur (optional currency sign), source (HTML text),
  kind: absent = finance | "hockey" | "cols",
  data: ... }
```

- **Finance** (`kind` absent): `data.dates[]` holds the session dates (ISO). `data.t[]` holds one Class 1 object per entry: `{ s: symbol, sec: sector, ind: industry, cty: country, o: index of first session, c: [adjusted closes from o], v: [volumes from o] }`. T₀ and T₁ are chosen among `dates`. The sessions in between feed only vol20 and Fourier 5/63. Class 2 cardinals are derived (sector, industry, country), so there is nothing to send for them.
- **Hockey** (`kind:"hockey"`): `data.dates` = the seasons, `data.cols` = the player stat columns, `data.clubs{ABBR:{name,div,conf,pts[],w[],gf[],ga[],full[]}}`, plus the players. See `lib-nhl.js`.
- **Columns** (`kind:"cols"`): a single snapshot, so T₀ = T₁. `data.cols`, `lines[{id,label,fmt}]`, `assign` (the attribute → column mapping), `ctype` and `c2[]` (Class 2 families), and `t[{s,a,al,id,g[],st[],c2[]}]`. See `lib-music.js`.

## Output: what a floor shows when the engine runs

- A toroidal cuboid chamber: radius 1 to 3, height −1 to +1. X is the phase on the dial (0 to 6 h, midday boundary), Y is elevation, and Z is +1 inside and −1 outside. Five zones Ω φ⁻ Σ φ⁺ α at 20/40/60/80 %. The shapes are α dodecahedron, φ⁺ tetrahedron, Σ cube, φ⁻ octahedron and Ω merkaba, and they rotate through their vertices.
- Class 3 containers Ω (−1,−1,−1), Σ (0,0,0) and α (+1,+1,+1) are active. The λ⁻ and λ⁺ traps are drawn dotted and are not active.
- Class 1 objects are solid, at the size canon 0.1/0.2/0.3/0.4 with no overlaps. Class 2 cardinals lead. The central object carries Z-ZERO, and the Z0 thread runs linearly from T₀ to T₁.
- The T₀ → T₁ transition is cycloidal per axis and per colour channel, over 10 s, 30 s or 1 min.
- The ghost is made of real copies of the object, with density set by the chosen clock and by the ghost volume. The weighted throw comes from Class 2.
- A vertical strip of the ten icons sits on the left. A click opens the analysis and the movable Gaussian window, and × or Escape folds it. The fiche (reading card) is on the right. Keys `[ ] \` hide the side panels and toggle full view.
- Modes: Fourier with 3 inputs, Free, and Kobayashi Maru (saturation = the collapse of every result, G-4). Environment Volume (F3), sessions, and the GEP 99 % residue are always visible.

## What the current Hub renderer gets wrong (drop it when swapping)

- A 2D "year renderer" with an n=8 ghost, instead of real 3D copies whose density follows the clock.
- Fourier and Kobayashi shown as an [INCOMPLET] tag. Here they are real modes.
- No four classes, no Class 3 containers, no shape canon and no rotation through vertices.
- No Z0 thread, and no Z-ZERO computed as one single set (Éric's canon of 5 Nov.).
- No Gaussian window per attribute and no movable bounds.

The Music field, Pandemonium and NHL in the Hub stay as they are. The NHL in this engine is the same one Éric validated (#nhl).
