/* um-engine.js — the real Manifestation engine in the HUB · Claude, 11 Nov. 2026 (Éric, 15 h 14: « the hub should just link to the
   real engine, as simple as that. And as we build the hub, it's just gonna be another new object in the engine for the hub »;
   15 h 36: « it's still not the real engine in the hub »).
   v20.27, 12 nov 2026 — five finance macro-zones, one Class-2 cardinal each, ordered by WFE Aug 2026 market cap
   (see js/data-finance-zones.js). New floor in the HUB = one entry in FINANCE_ZONES (the engine gets the new system
   and its anchor first).
   One line in the HUB page, BEFORE um-panels.js:
       <script src="um-engine.js" defer></script>
       <script src="um-panels.js" defer></script>
   This script loads js/data-finance-zones.js by itself, so the short um/index.html loader does not need a new tag.
   It adds the panel « Manifestation · moteur réel »: one door per Class 4 system of the engine; each door opens the real engine
   at its anchor. The engine link never changes, so the HUB always opens the latest revision.
   Where: inside <div id="um-engine"></div> if the page has one, otherwise floating at the top left (movable and erasable with
   um-panels.js).
   Optional: <script>window.UM_HIDE='#selector'</script> before it hides the HUB's own reproduction of the engine. */
(function () {
  'use strict';
  if (window.__umEngine) return; window.__umEngine = true;
  var ENGINE = 'https://claude.ai/artifact/Mr4cUjAuszjdrQU8U6YRig';

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
    var h = '<a class="um-main" href="' + ENGINE + '" target="_blank" rel="noopener">Ouvrir le moteur réel ↗' +
            '<small>Manifestation · le corps · Universal Metaphor</small></a>';
    FLOORS.forEach(function (g) {
      h += '<h4>' + g[0] + '</h4><ul>';
      g[1].forEach(function (f) {
        var cardinal = !!f[2];
        h += '<li><a class="' + (cardinal ? 'um-cardinal-door' : '') + '" href="' + ENGINE + '#' + f[0] +
             '" target="_blank" rel="noopener"><span>' + String(f[1]).replace(/&/g, '&amp;') +
             (cardinal ? ' <em class="um-cardinal">cardinal</em>' : '') +
             '</span><code>#' + f[0] + '</code></a></li>';
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
    s.src = 'js/data-finance-zones.js';
    s.onload = boot;
    s.onerror = function () { init(FALLBACK_FLOORS); };
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
