# MANIFESTATION ENGINE — Hub v21.11

Canonical lineage: `v20.99 -> v21.00 -> v21.01 -> v21.02 -> v21.03 -> v21.04 -> v21.05 -> v21.06 -> v21.07 -> v21.08 -> v21.09 -> v21.10 -> v21.11`. Next free number: `v21.12`.

## Ce qui est nouveau en v21.11 (à démontrer)

1. « ＋ Créer » au bas de la rangée Classe 2, comme en v20.91.1. On choisit des objets réels de Classe 1 et de Classe 2, on nomme, on enregistre. La création reste sous « Mes créations · Classe 2 », avec ✦, après rechargement.

## Ce qui est nouveau en v21.10 (à démontrer)

1. Volume sur les fantômes de Classe 1 et de Classe 2. Ouvrir `/um/#/sante`. Avancer le curseur vers le milieu pour que les objets aient bougé. Les copies derrière les objets de Classe 1 et de Classe 2 grossissent avec Volume (Tous, puis Classe 2), comme les objets de cette portée. Fantôme + les grossit encore, sans changer les objets. Le curseur « Volume du fantôme » (`#gvol`) change le nombre de copies et leur clarté.
2. Attributs. Dans un univers, cliquer une tuile de `#rack` ouvre `#gauss` (distribution et quatre bornes déplaçables). `#thr` et `#thrW` (Lancer) suivent le bouton Fantôme. « ◧ Attributs » (`#tgL`, `[`) et « Fiche ◨ » (`#tgR`, `]`) sont visibles. Le sélecteur `#sys` reste dans la barre.

## Ce qui est nouveau en v21.09 (à démontrer)

1. Crochet modèle chargé. Ouvrir https://ericgrimard-pixel.github.io/um/ . Dans le panneau de droite, bloc Modèle, la ligne doit dire « Crochet modèle : chargé ».
2. Réglage du modèle. Dans ce même bloc, le menu est « aucun ». Cliquer Tester. La réponse visible est le texte « [aucun modèle] … ». Pour un modèle réel : choisir Ollama local, compatible OpenAI ou HTTP générique, remplir l'adresse, Enregistrer, puis Tester. La réponse ou l'erreur typée s'affiche. La clé API reste dans le navigateur (localStorage), masquée, jamais écrite dans le dépôt. Une page GitHub Pages en https qui appelle un Ollama local en http peut être bloquée par CORS ou le contenu mixte. Sur la machine d'Ollama : `OLLAMA_ORIGINS=https://ericgrimard-pixel.github.io`, puis redémarrer Ollama.
3. Barre sans onglets. La bande Fourier / Libre, Kobayashi, Ouvrir la session, et les boutons Attributs / Fiche / Vue pleine ne sont plus dans la page. Restent Brigitte, le sélecteur, les tuiles, lecture, T₀, le curseur, T₁, la durée, Fantôme, Volume avec Tous / Classe 2 / Choix, Fantôme − / +, Z-ZERO, le résidu, les badges de lacune, et le bloc Modèle.
4. Menu des univers. Ouvrir https://ericgrimard-pixel.github.io/um/ sans ancre. L'écran est vide, sauf la barre Finance, Art, Santé, Sport, dans cet ordre. Cliquer Finance (`/um/#/finance`) ouvre la galaxie finance, sans les objets Art, Sports et Santé dans la scène. Cliquer Art (`/um/#/art`) ouvre la musique Spotify 2021. Cliquer Sport (`/um/#/sport`) ouvre la LNH et le football. Cliquer Santé (`/um/#/sante`) ouvre l'étage Santé : sa série propre est vide, le badge « Univers vide — à remplir » est visible ; les coupes réelles (villes, provinces) restent dans le sélecteur. Menu ramène à l'écran vide. Dans un univers, la même barre reste, l'univers courant est surligné, et le bloc Modèle est dans le panneau de droite.

## v21.08

The ghost seed (`um/seed/`) plugs a host in with `seed.activate(adapter)`. There is no server inside the seed. A missing hook falls back to a local stand-in. Claude's model hook is `adapter.model = createModelHook({ provider })`. With no provider the result is `[aucun modèle]`, and `describe()` lists `model` only when that hook is real. No provider is connected: the host chooses one. The Class 4 ghost is option B: it starts on the object and runs toward T₁, with no side line, and it stays put when the object is still. The Z0 path stays centred on the singularité.

Real: local seed, fallbacks, ghost option B, singularité. Stub: no real model (`no model`). Missing: no mother node, and no signing key (the original APK key is lost).

## v21.07 changelog

Minimal bar: the system selector, the tiles, T₀/T₁, Fantôme, Volume − / +, the Tous / Classe 2 / Choix scope, and Fantôme − / + stay on screen. Session, Fourier / Libre, filet and acteurs stay in the DOM because `engine.js` binds them, and are not shown. Volume − / + scales only the meshes of objects and ghosts around fixed positions. The factor multiplies each object's canon size and its hierarchy size. Tous and Classe 2 keep separate factors. Fantôme − / + uses the same scopes plus Choix. Gap badges stay. One Brigitte button opens listening (fr-CA mic and a focused field). « j’ai besoin de … » answers and shows the section in the same step. `escalate` stays off. λ⁻ and λ⁺ are active containers. The Class 4 trajectory ghost is the Z0 path recentred on the singularité.

## v21.06 changelog

The live Hub (`/um/`, `engine.js`) is moteur v2 · rév. 23.17 + relatif 23.20. The standalone page is `/um/engine/manifestation-engine.html` (paroi du microcosme 0,94 ; the Hub engine folds the same chamber to 0,74). Both keep the central object on the transposed Z0 path, anchor `[0, 0, 0]`, and containment `skin < 1`. `engine.js` is unchanged in v21.06 (same bytes as v21.05).

Brigitte stays the single top entry. Questions go through `um/bridget/bridget-hub.js` (`Bridget.createEngine` / `Bridget.load`) and `um/bridget/index.json`, built by `um/bridget/build-index.mjs`. The index covers the left rack, the Gaussian window, the fiche, and the two new health cuts. An answer cites its section and offers « Montre-moi », which uses the v21.05 command layer. Voice (fr-CA) stays: Éric ordered it for this Hub; Claude’s note had reserved voice for the phone. `escalate` stays off. No Drive, mail, or contacts.

Two Class-2 health systems, same `LIB` path as the other systems, `engine.js` untouched:

| System | Data |
|---|---|
| Santé — Villes du monde (WUP 2025, T₀ 1990 → T₁ 2024) | `um/data/sante/villes-wup2025/` · CSV SHA-256 `11fb42ead42163c32f54ab998cddebdd78b86162cc5aee17a64fc92b84defdf5` · 2 024 403 bytes. Class 1 in the engine is the country median (one mesh per object). All 16 768 cities stay in the CSV and `cities.json`. |
| Santé — Provinces du Canada (StatCan 13-10-0114, espérance de vie) | `um/data/sante/provinces-canada-statcan-13-10-0114/` · CSV SHA-256 `f9c1c9163bc32ab18c01f8406ba42e7168d187b6daf944e4f6ba75bacf0f962a` · 20 205 bytes. |

Visible gaps: [INCOMPLET] 4 790 cities with no reading and 5 164 with one; 15 territories not in the 196; coverage 179/196. [INCOMPLET] Î.-P.-É. and the territories absent; [À VÉRIFIER] T₁ centred on 2023 rather than 2024; coverage 9/13. `um/data/sante/xyz/` is byte-identical.

Regenerate the derived files with `python3 um/tools/build-sante-coupes.py`. Regenerate the Bridget index with `node um/bridget/build-index.mjs ./um https://ericgrimard-pixel.github.io/um/ ./um/bridget/index.json`. GitHub Actions checks that `index.json` matches, and does not commit.

Brigitte (Miriamphobots) is the single entry at the top of the Hub and of the standalone engine. Motto: `One seed, infinite roots, perpetual harvest.` On open she says « Je suis Brigitte, je suis là pour toutes tes questions. » `#/world`, `?host=bridget`, `?from=world` and a `.world` arrival open that same panel. She reads `rules.json`, acts through `bridget-demo.js` (`window.BridgetDemo`, alias `window.BrigitteDemo`), and is checked by `bridget-manifest.json` (ETag and SHA-256, no APK reinstall, shown inside her panel). The one-tap portal is `/um/bridget/`. The minimal seed on Éric's two phones (`eric.grimard@universalmetaphor.ca`, `grimeric13@gmail.com`) has no 4 GB sandbox and no agent crystals; those arrive only with extensions.

## v21.05 changelog

Document access points removed from the Hub UI. The files themselves stay in the repo. `um/data/` is untouched.

| File | Element / label | Target |
|---|---|---|
| `um/engine/hub-nav.js` | `#um-door-turniton` — TURN IT ON — PDF ↗ | `https://drive.google.com/file/d/1TVyS9q9Pt88BS8aoKTCYGbYGn28FWHYp/view` |
| `um/engine/hub-nav.js` | `#um-turniton` — TURN IT ON — PDF ↗ | `https://drive.google.com/file/d/1TVyS9q9Pt88BS8aoKTCYGbYGn28FWHYp/view` |
| `um/engine/hub-nav.js` | `#um-door-bp-en` — TURN IT ON — Board Paper (EN) ↗ | `https://drive.google.com/file/d/1Xv-SpOGl5q6UUL9W12KLGbk3nVpOv7V5/view` |
| `um/engine/hub-nav.js` | `#um-door-wp-en` — TURN IT ON — White Paper (EN) v2 ↗ | `https://drive.google.com/file/d/1TVyS9q9Pt88BS8aoKTCYGbYGn28FWHYp/view` |
| `um/engine/hub-nav.js` | `#um-bp-en` — TURN IT ON — Board Paper (EN) ↗ | `https://drive.google.com/file/d/1Xv-SpOGl5q6UUL9W12KLGbk3nVpOv7V5/view` |
| `um/engine/hub-nav.js` | `#um-wp-en` — TURN IT ON — White Paper (EN) v2 ↗ | `https://drive.google.com/file/d/1TVyS9q9Pt88BS8aoKTCYGbYGn28FWHYp/view` |
| `um/derniere-version.html` | card — TURN IT ON — Executive White Paper — v2 | `https://drive.google.com/file/d/1TVyS9q9Pt88BS8aoKTCYGbYGn28FWHYp/view` |
| `um/derniere-version.html` | card — Board Paper (English) — v2 | `https://drive.google.com/file/d/1Xv-SpOGl5q6UUL9W12KLGbk3nVpOv7V5/view` |
| `um/derniere-version.html` | card — Dossier du kit d’allumage mobile | `https://drive.google.com/drive/folders/16GFRMOAuK05lgdfcVMk3T-eS4RVU8o_a` |
| `um/derniere-version.html` | card — origin-kit-allumage-mobile-2026-11-24.zip | `https://drive.google.com/file/d/1le0v8SKByZthHxW0TYl_EAh-yzWb2A0F/view` |
| `um/derniere-version.html` | card — Origin Tesseract — Mobile Spark v3 | `https://drive.google.com/file/d/1AgxckBv0EwzGnVUFplWBABMIDYDNi1-_/view` |

Kept: the Drive link `bridget-seed-0.1.0.apk` (`https://drive.google.com/file/d/19wzqeus-_oJweHWvDFmOr-2VjlgU0KLo/view`) on `/um/bridget/` and on `um/derniere-version.html`. It is the installable seed app, not a document.

Brigitte: one top button, greeting on open, one panel (transcript, text input, mic in fr-CA when the browser has it, four mode chips). Local French commands drive `window.BridgetDemo` and `window.__umSelect` / `#sys` / `switchSys` / panel toggles / Gaussian window / play / hash. Each executed step is said, shown with the cursor, then compared before/after. She asks « Est-ce que c'est clair pour toi ? » with Oui / Réexplique. Stop and Escape interrupt. `prefers-reduced-motion` skips the cursor animation. ETag and SHA-256 stay inside the panel.

The notes below are the original rev. 23.16 handoff. They stay. The running code has moved forward with the lineage; 23.16 is not the live revision.

---

# MANIFESTATION ENGINE — real source for the Hub (rev. 23.16)

Handed to Grok (YB1), 2026-11-12, at Éric's request. This is the full source of the engine that runs in the "Moteur Manifestation" page, rev. 23.16, split so it fits Drive and ports straight into the Hub. The CLAVIS page link was removed. The only outbound link is the HUB button.

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
3. Routing: `#<id>` opens a system (for example `#sp500y`, `#nhl`, `#music`), and `hashchange` switches live. From a Hub floor, inline the engine and call `switchSys('<id>')`.
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
