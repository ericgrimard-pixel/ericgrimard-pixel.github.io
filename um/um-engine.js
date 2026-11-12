/* um-engine.js — the real Manifestation engine in the HUB · Claude, 11 Nov. 2026 (Éric, 15 h 14: « the hub should just link to the
   real engine, as simple as that. And as we build the hub, it's just gonna be another new object in the engine for the hub »;
   15 h 36: « it's still not the real engine in the hub »).
   One line in the HUB page, BEFORE um-panels.js:
       <script src="um-engine.js" defer></script>
       <script src="um-panels.js" defer></script>
   It adds the panel « Manifestation · moteur réel »: one door per Class 4 system of the engine; each door opens the real engine
   at its anchor. The engine link never changes, so the HUB always opens the latest revision.
   Where: inside <div id="um-engine"></div> if the page has one, otherwise floating at the top left (movable and erasable with
   um-panels.js).
   Optional: <script>window.UM_HIDE='#selector'</script> before it hides the HUB's own reproduction of the engine.
   New floor in the HUB = one new line in FLOORS (the engine gets the new system and its anchor first). */
(function () {
  'use strict';
  if (window.__umEngine) return; window.__umEngine = true;
  var ENGINE = 'https://claude.ai/artifact/Mr4cUjAuszjdrQU8U6YRig';
  var FLOORS = [
    ['Finance · Amériques', [['ndx100', 'Nasdaq-100 2026 · année'], ['sp500y', 'S&P 500 2026 · année'], ['djia', 'Dow Jones 2026 · année'],
                             ['sp500', 'S&P 500 · deux séances'], ['ibov', 'Ibovespa · deux séances']]],
    ['Finance · Asie-Pacifique', [['n225', 'Nikkei 225'], ['hsi', 'Hang Seng'], ['asx200', 'S&P/ASX 200'], ['sti', 'Straits Times']]],
    ['Finance · Europe', [['ftse100', 'FTSE 100'], ['dax', 'DAX 40'], ['cac40', 'CAC 40'], ['sx5e', 'EURO STOXX 50']]],
    ['Finance · Moyen-Orient', [['tasi', 'Tadawul (TASI)']]],
    ['Sport · Hockey', [['nhl', 'LNH 2024-25 → 2025-26']]]
  ];

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
    '#um-engine-panel li a code{font:11px ui-monospace,Menlo,monospace;color:#5c6a82}';
  document.head.appendChild(css);

  function init() {
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
        h += '<li><a href="' + ENGINE + '#' + f[0] + '" target="_blank" rel="noopener"><span>' + f[1].replace(/&/g, '&') +
             '</span><code>#' + f[0] + '</code></a></li>';
      });
      h += '</ul>';
    });
    p.innerHTML = h;
    (host || document.body).appendChild(p);
    window.__umEngineDoors = FLOORS.reduce(function (n, g) { return n + g[1].length; }, 0);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
