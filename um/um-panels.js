/* um-panels.js — Universal Metaphor HUB · Claude, 11 Nov. 2026 (Éric, 15 h 14: « make the panels in the hub movable or erasable
   because we do not see the engine. It's hidden behind the panels »).
   Every panel laid over the view gets a title bar that moves it and a × that erases it. A button that is always visible
   (« Panneaux ») brings them back; Escape erases them all; double-click on a title bar puts the panel back where it was.
   Positions and erased panels are remembered in this browser only.

   Use: one line at the end of the HUB page, after the panels exist:
       <script src="um-panels.js" defer></script>
   Panels: every element marked data-um-panel="Title" (recommended), plus every other visible element positioned fixed /
   absolute / sticky, at least 140 × 60 px, that is not a canvas, iframe, video or control and holds no canvas
   (<body data-um-panels="marked"> keeps only the marked ones). v2, 11 Nov. 2026, 15 h 45.
   Optional: data-um-start="hidden" on a panel makes it start erased (first visit only). */
(function () {
  'use strict';
  if (window.__umPanels) return; window.__umPanels = true;
  var KEY = 'um.hub.panels.v1';
  var st = {}; try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  var css = document.createElement('style');
  css.textContent =
    '.um-pbar{display:flex;align-items:center;gap:8px;cursor:grab;user-select:none;touch-action:none;' +
    'font:500 10.5px/1.2 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.06em;text-transform:uppercase;' +
    'color:#8b98ad;background:rgba(16,24,38,.96);border-bottom:1px solid #2b3c55;padding:5px 6px 5px 9px;margin:0 0 6px;border-radius:4px 4px 0 0}' +
    '.um-pbar:active{cursor:grabbing}.um-pbar b{flex:1;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.um-pbar button{all:unset;cursor:pointer;color:#dbe3ee;font:500 14px/1 ui-monospace,Menlo,monospace;padding:2px 7px;border:1px solid #2b3c55;border-radius:3px}' +
    '.um-pbar button:hover,.um-pbar button:focus-visible{border-color:#a6dcff;outline:none}' +
    '.um-hidden{display:none!important}' +
    '.um-recall{position:fixed;left:12px;bottom:12px;z-index:2147483000;font:500 11px/1 ui-monospace,Menlo,monospace;letter-spacing:.05em;' +
    'color:#a6dcff;background:rgba(10,16,25,.94);border:1px solid #2b3c55;border-radius:3px;padding:7px 10px;cursor:pointer}' +
    '.um-recall:hover,.um-recall:focus-visible{border-color:#a6dcff;outline:none}';
  document.head.appendChild(css);

  function autoPick() {
    var all = Array.prototype.slice.call(document.body.querySelectorAll('*'));
    var c = all.filter(function (el) {
      if (el.closest('.um-pbar,.um-recall')) return false;
      if (/^(CANVAS|IFRAME|VIDEO|IMG|SVG|BUTTON|A|INPUT|SELECT|LABEL|SCRIPT|STYLE|TEXTAREA)$/i.test(el.tagName)) return false;
      var cs = getComputedStyle(el);
      if (!/^(fixed|absolute|sticky)$/.test(cs.position) || cs.display === 'none' || cs.visibility === 'hidden') return false;
      var r = el.getBoundingClientRect();
      if (r.width < 140 || r.height < 60) return false;
      if (el.querySelector('canvas,iframe,video')) return false;
      return true;
    });
    return c.filter(function (el) { return !c.some(function (o) { return o !== el && o.contains(el); }); });
  }

  var panels = [], recall = null;
  function title(el, i) {
    var t = el.getAttribute('data-um-panel');
    if (t) return t;
    var h = el.querySelector('h1,h2,h3,h4,legend,[class*="title"]');
    return (h && h.textContent.trim().slice(0, 40)) || ('Panneau ' + (i + 1));
  }
  function keyOf(el, i) { return el.id || el.getAttribute('data-um-panel') || ('p' + i); }

  function place(el, p) {
    el.style.position = 'fixed'; el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
    el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.margin = '0'; el.style.transform = 'none';
    if (p.w) el.style.width = p.w + 'px';
  }
  function clampIn(p, el) {
    var r = el.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    p.x = Math.max(-r.width + 80, Math.min(W - 80, p.x)); p.y = Math.max(0, Math.min(H - 32, p.y)); return p;
  }
  function count() { return panels.filter(function (o) { return o.el.classList.contains('um-hidden'); }).length; }
  function refresh() {
    var n = count();
    recall.textContent = n ? ('◧ Panneaux (' + n + ' effacé' + (n > 1 ? 's' : '') + ')') : '◧ Effacer les panneaux';
    recall.setAttribute('aria-pressed', n ? 'false' : 'true');
  }
  function hide(o, on) {
    o.el.classList.toggle('um-hidden', on);
    (st[o.k] = st[o.k] || {}).hidden = on; save(); refresh();
  }

  function init() {
    /* v2: marked panels AND the unmarked panels found on the view, so a page that marks only some panels still frees the view.
       data-um-panels="marked" on <body> keeps only the marked ones. */
    var marked = Array.prototype.slice.call(document.querySelectorAll('[data-um-panel]'));
    var found = document.body.getAttribute('data-um-panels') === 'marked' ? [] : autoPick();
    var list = marked.concat(found.filter(function (el) { return marked.indexOf(el) < 0; }));
    list.forEach(function (el, i) {
      if (el.querySelector('.um-pbar')) return;
      var k = keyOf(el, i), o = { el: el, k: k, home: el.getAttribute('style') || '' };
      var bar = document.createElement('div'); bar.className = 'um-pbar';
      bar.innerHTML = '<span aria-hidden="true">⠋</span><b></b><button type="button" aria-label="Effacer ce panneau" title="Effacer (Échap : tous)">×</button>';
      bar.querySelector('b').textContent = title(el, i);
      bar.title = 'Glisser pour déplacer · double clic : remettre en place';
      el.insertBefore(bar, el.firstChild);
      bar.querySelector('button').addEventListener('click', function (e) { e.stopPropagation(); hide(o, true); });
      bar.addEventListener('dblclick', function () {
        el.setAttribute('style', o.home); if (st[k]) { delete st[k].pos; save(); }
      });
      bar.addEventListener('pointerdown', function (e) {
        if (e.target.closest('button')) return;
        var r = el.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top, w = r.width;
        bar.setPointerCapture(e.pointerId); e.preventDefault();
        function mv(ev) { var p = clampIn({ x: ev.clientX - dx, y: ev.clientY - dy, w: w }, el); place(el, p); (st[k] = st[k] || {}).pos = p; }
        function up() { bar.removeEventListener('pointermove', mv); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); save(); }
        bar.addEventListener('pointermove', mv); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
      });
      var s = st[k];
      if (s && s.pos) place(el, clampIn(s.pos, el));
      if (s && typeof s.hidden === 'boolean') el.classList.toggle('um-hidden', s.hidden);
      else if (el.getAttribute('data-um-start') === 'hidden') el.classList.add('um-hidden');
      panels.push(o);
    });
    recall = document.createElement('button'); recall.type = 'button'; recall.className = 'um-recall';
    recall.title = 'Rappeler ou effacer tous les panneaux (Échap efface)';
    recall.addEventListener('click', function () { var any = count() > 0; panels.forEach(function (o) { hide(o, !any); }); });
    document.body.appendChild(recall); refresh();
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      var t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      panels.forEach(function (o) { hide(o, true); });
    });
    window.__umPanelsList = panels.map(function (o) { return o.k; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
