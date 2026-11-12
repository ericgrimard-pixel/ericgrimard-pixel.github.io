/* um-engine.js — the real Manifestation engine in the HUB · Claude, 11 Nov. 2026 (Éric, 15 h 14: « the hub should just link to the
   real engine, as simple as that. And as we build the hub, it's just gonna be another new object in the engine for the hub »;
   15 h 36: « it's still not the real engine in the hub »).
   v20.31, 12 nov 2026 — Hub opens on World. Société · Musique stays listed in the panel.
   recorded Hub Navigation Rule (foundational, permanent): Hub navigation is its own layer, distinct from the manifestation engine.
   Double-clicks differ: Hub starts with group of 5 macro-zones; double-click Class 2 plunges in (siblings become Class 2 of larger group) down to single floor;
   in floor, double-click central object pops up one level; two clicks up to emerge from Class 4, one click down into Class 2.
   Applied Classe 4 founding rules (size factor, single solid object at origin, Class 3 solids, collapse rules, uniform application).
   Classe 4 rules applied (applyC4 / SZ / SOLIDMAT).
   One line in the HUB page, BEFORE um-panels.js:
       <script src="um-engine.js" defer></script>
       <script src="um-panels.js" defer></script>
   This script loads js/data-finance-zones.js by itself, so the short um/index.html loader does not need a new tag.
   It adds the panel « Manifestation · moteur réel »: one door per floor already in the Hub.
   Each door opens that floor in the page (#/floor/… or #/sports/nhl). Nothing here opens an external page.
   Where: inside <div id="um-engine"></div> if the page has one, otherwise floating at the top left (movable and erasable with
   um-panels.js).
   Optional: <script>window.UM_HIDE='#selector'</script> before it hides the HUB's own reproduction of the engine.

   CLASSE 4 — RÈGLES FONDATRICES (applied 12 nov 2026 from Claude note):
   1. Taille : Classe 1 = base (rayon 0,1), Classe 2 = 2 fois (0,2), Classe 3 = 3 fois (0,3), Classe 4 = 4 fois (0,4). La Classe 4 se lit comme le plus grand objet du système. Même facteur de densité pour toutes les classes, et la molette de volume les met à l'échelle ensemble.
   2. Classe 4 = UN seul objet solide, fixe au centre (0, 0, 0). Pas de cage filaire en plus du corps.
   3. Classe 3 (Ω, Σ, α, etc.) : objets solides, opaques, hors brume, pour ressortir. Les pièges λ non activés restent des contours.
   4. Effondrement de la Classe 4 : seulement les attributs physiques (forme, étirement, couleur, saturation) et angulaires (avant-arrière, rotation, centre-extérieur). X, Y, Z ne sont pas effondrés. Chaque attribut = moyenne sur le même ensemble que Z0 (Classe 1, plus Classe 2 et conteneurs Classe 3 si cochés). Sans donnée : objet masqué, rien d'inventé.
   5. Mêmes règles pour tous les systèmes.
   HUB NAVIGATION RULE — FOUNDATIONAL and PERMANENT (recorded 12 nov 2026 01:13 EST from Éric):
   The Hub's navigation is its own layer. It is distinct from the manifestation engine's navigation. The double-clicks are different in the two applications.
   - In the Hub, you start with the smallest possible group, which is 5: the five financial macro-zones.
   - When you double-click a Class 2 object, you plunge into it. All the others become Class 2 of that larger group, and you can dive down to the level of one single floor.
   - Then, in that floor's environment, double-clicking the central object pops you up one level.
   - Two clicks up to emerge from a Class 4 object. One click down into a Class 2 object.
   Do not merge Hub and engine double-click behaviors.
   v20.31 — World is the opening view. A price series opens its floor in the Hub (year and T0→T1).
   A door with no series is not a link. */
(function () {
  'use strict';
  if (window.__umEngine) return; window.__umEngine = true;
  /* In-hub routes. [primary, other interpretation]. No external URL. */
  var LOCAL_FLOOR = {
    sp500y: ['#/floor/AMF/index/SPX/year', '#/floor/AMF/index/SPX/t0t1'],
    ndx100: ['#/floor/AMF/index/NDX/year', '#/floor/AMF/index/NDX/t0t1'],
    sp500: ['#/floor/AMF/index/SPX/t0t1', '#/floor/AMF/index/SPX/year'],
    n225: ['#/floor/ASF/index/N225/year', '#/floor/ASF/index/N225/t0t1'],
    hsi: ['#/floor/ASF/index/HSI/year', '#/floor/ASF/index/HSI/t0t1'],
    asx200: ['#/floor/OCF/index/ASX200/year', '#/floor/OCF/index/ASX200/t0t1'],
    sti: ['#/floor/ASF/index/STI/year', '#/floor/ASF/index/STI/t0t1'],
    sx5e: ['#/floor/EUF/index/SX5E/year', '#/floor/EUF/index/SX5E/t0t1'],
    ftse100: ['#/floor/EUF/index/FTSE100/year', '#/floor/EUF/index/FTSE100/t0t1'],
    dax: ['#/floor/EUF/index/DAX/year', '#/floor/EUF/index/DAX/t0t1'],
    cac40: ['#/floor/EUF/index/CAC40/year', '#/floor/EUF/index/CAC40/t0t1'],
    tasi: ['#/floor/ASF/index/TASI/year', '#/floor/ASF/index/TASI/t0t1'],
    ibov: ['#/floor/AMF/index/IBOV/year', '#/floor/AMF/index/IBOV/t0t1'],
    nhl: ['#/sports/nhl', null]
  };

  /* Fallback only if js/data-finance-zones.js cannot be loaded. Keep in sync with FINANCE_ZONES. */
  var FALLBACK_FLOORS = [
    ['Finance · Amérique du Nord', [
      ['sp500y', 'S&P 500 2026 · année', true],
      ['ndx100', 'Nasdaq-100 2026 · année', false],
      ['djia', 'Dow Jones 2026 · année', false],
      ['sp500', 'S&P 500 · deux séances', false]
    ]],
    ['Finance · Asie-Pacifique', [
      ['n225', 'Nikkei 225', true],
      ['hsi', 'Hang Seng', false],
      ['asx200', 'S&P/ASX 200', false],
      ['sti', 'Straits Times', false]
    ]],
    ['Finance · Europe', [
      ['sx5e', 'EURO STOXX 50', true],
      ['ftse100', 'FTSE 100', false],
      ['dax', 'DAX 40', false],
      ['cac40', 'CAC 40', false]
    ]],
    ['Finance · Moyen-Orient et Afrique', [
      ['tasi', 'Tadawul (TASI)', true]
    ]],
    ['Finance · Amérique latine', [
      ['ibov', 'Ibovespa · deux séances', true]
    ]],
    ['Sport · Hockey', [
      ['nhl', 'LNH 2024-25 → 2025-26', false]
    ]],
    ['Société · Musique', [
      ['music', 'Musique · Spotify 2021', false]
    ]]
  ];

  function floorsFromZones(z) {
    if (!z || !z.zones || !z.order) return FALLBACK_FLOORS;
    var out = [];
    z.order.forEach(function (id) {
      var zone = z.zones[id];
      if (!zone) return;
      var doors = [];
      (zone.floors || []).forEach(function (f) {
        if (!f || !f.anchor) return; /* no door for [INCOMPLET] series */
        doors.push([f.anchor, f.label, !!f.cardinal]);
      });
      if (doors.length) out.push([zone.group_title || zone.name, doors]);
    });
    (z.sports || []).forEach(function (g) {
      var doors = (g[1] || []).map(function (f) { return [f[0], f[1], false]; });
      if (doors.length) out.push([g[0], doors]);
    });
    // Always append Société · Musique if not already present
    var hasMusic = out.some(function(g) { return g[0].indexOf('Musique') >= 0; });
    if (!hasMusic) {
      out.push(['Société · Musique', [['music', 'Musique · Spotify 2021', false]]]);
    }
    return out.length ? out : FALLBACK_FLOORS;
  }

  var css = document.createElement('style');
  css.textContent =
    '#um-engine-panel{font:13px/1.4 "IBM Plex Sans","Segoe UI",system-ui,sans-serif;color:#dbe3ee;background:rgba(10,16,25,.97);' +
    'border:1px solid #2b3c55;border-radius:5px;padding:0 12px 12px;width:300px;max-height:calc(100vh - 24px);overflow:auto;box-sizing:border-box;' +
    'box-shadow:0 12px 36px rgba(0,0,0,.55)}' +
    '#um-engine-panel.um-float{position:fixed;left:12px;top:12px;z-index:2147482000}' +
    '#um-engine-panel .um-main{display:block;margin:10px 0 8px;padding:10px 12px;border-radius:4px;text-decoration:none;color:#07080c;' +
    'background:linear-gradient(135deg,#e8c872,#f0d78a 45%,#c9a84a);font:500 14px/1.2 "IBM Plex Sans",system-ui,sans-serif}' +
    '#um-engine-panel .um-main small{display:block;font:400 11px/1.3 ui-monospace,Menlo,monospace;opacity:.8;margin-top:3px}' +
    '#um-engine-panel h4{margin:10px 0 4px;font:500 10.5px/1.2 ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:#8b98ad}' +
    '#um-engine-panel ul{list-style:none;margin:0;padding:0;display:grid;gap:3px}' +
    '#um-engine-panel li a{display:flex;justify-content:space-between;gap:8px;padding:5px 8px;border:1px solid #1a2636;border-radius:3px;' +
    'color:#dbe3ee;text-decoration:none;background:#0d1520}' +
    '#um-engine-panel li a:hover,#um-engine-panel li a:focus-visible{border-color:#a6dcff;outline:none}' +
    '#um-engine-panel li.um-door-row{display:flex;gap:3px;align-items:stretch}' +
    '#um-engine-panel li.um-door-row>a:first-child{flex:1}' +
    '#um-engine-panel a.um-interp{flex:none;align-items:center;color:#e8c872;font:500 10px/1.2 ui-monospace,Menlo,monospace}' +
    '#um-engine-panel li span.um-nodata{display:flex;justify-content:space-between;gap:8px;padding:5px 8px;border:1px dashed #1a2636;border-radius:3px;color:#5c6a82;background:#0d1520}' +
    '#um-engine-panel li a.um-cardinal-door{border-color:#6a5a2c}' +
    '#um-engine-panel li a code{font:11px ui-monospace,Menlo,monospace;color:#5c6a82}' +
    '#um-engine-panel .um-cardinal{flex:none;font:500 9px/1.2 ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;' +
    'color:#07080c;background:linear-gradient(135deg,#e8c872,#c9a84a);border-radius:2px;padding:2px 5px}';
  document.head.appendChild(css);

  function init(FLOORS) {
    if (window.UM_HIDE) try { document.querySelectorAll(window.UM_HIDE).forEach(function (el) { el.style.setProperty('display', 'none', 'important'); }); } catch (e) {}
    var host = document.getElementById('um-engine');
    var p = document.createElement('section');
    p.id = 'um-engine-panel'; p.setAttribute('data-um-panel', 'Manifestation · moteur réel');
    if (!host) p.className = 'um-float';
    var h = '<a class="um-main" href="#/world">Ouvrir le monde' +
            '<small>World · cinq macro-zones</small></a>';
    FLOORS.forEach(function (g) {
      h += '<h4>' + g[0] + '</h4><ul>';
      g[1].forEach(function (f) {
        var cardinal = !!f[2];
        var local = LOCAL_FLOOR[f[0]];
        var label = String(f[1]).replace(/&/g, '&amp;') +
             (cardinal ? ' <em class="um-cardinal">cardinal</em>' : '');
        if (local && local[0].indexOf('http') !== 0) {
          var alt = local[1] ? '<a class="um-interp" href="' + local[1] + '">' +
            (local[0].indexOf('/t0t1') >= 0 ? 'année' : 'T0→T1') + '</a>' : '';
          h += '<li class="um-door-row"><a class="' + (cardinal ? 'um-cardinal-door' : '') + '" href="' + local[0] +
               '"><span>' + label + '</span><code>#' + f[0] + '</code></a>' + alt + '</li>';
        } else {
          h += '<li><span class="um-nodata"><span>' + label + '</span><code>pas de série</code></span></li>';
        }
      });
      h += '</ul>';
    });
    p.innerHTML = h;
    (host || document.body).appendChild(p);
    window.__umEngineDoors = FLOORS.reduce(function (n, g) { return n + g[1].length; }, 0);
    window.__umEngineFloors = FLOORS;
  }

  function boot() {
    init(floorsFromZones(window.FINANCE_ZONES));
  }

  function start() {
    if (window.FINANCE_ZONES) { boot(); return; }
    var s = document.createElement('script');
    s.src = 'js/data-finance-zones.js?v=20.31';
    s.onload = boot;
    s.onerror = function () { init(FALLBACK_FLOORS); };
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
