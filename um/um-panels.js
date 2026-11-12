/* um-panels.js — Universal Metaphor HUB.
   v20.37 — every window is disposable: movable, closable, and re-openable from the Panneaux menu.
   Positions and erased panels are remembered in this browser only.

   Use: one line at the end of the HUB page, after the panels exist:
       <script src="um-panels.js" defer></script>
   Panels: every element marked data-um-panel="Title" (recommended), known Hub chrome (controls,
   Classe 4, attribute dialog, gate, retour), plus every other visible element positioned fixed /
   absolute / sticky, at least 140 × 60 px, that is not a canvas, video or control and holds no canvas
   (<body data-um-panels="marked"> keeps only the marked ones).
   Optional: data-um-start="hidden" on a panel makes it start erased (first visit only).
   A persistent « Panneaux » button opens a menu listing each window so a closed one can be restored alone. */
(function () {
  'use strict';
  if (window.__umPanels) return; window.__umPanels = true;
  var KEY = 'um.hub.panels.v2';
  var st = {}; try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  var KNOWN = ['ui', 'c4panel', 'pop', 'retour-hub-bar', 'right-window', 'nhl-info-panel'];
  var TITLES = {
    ui: 'Contrôles',
    c4panel: 'Classe 4',
    pop: 'Attribut',
    'retour-hub-bar': 'Retour',
    'right-window': 'Fenêtre',
    'nhl-info-panel': 'Info LNH'
  };

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
    '.um-recall:hover,.um-recall:focus-visible{border-color:#a6dcff;outline:none}' +
    '.um-panel-menu{position:fixed;left:12px;bottom:46px;z-index:2147483000;width:min(320px,calc(100vw - 24px));max-height:min(60vh,420px);overflow:auto;' +
    'background:rgba(10,16,25,.97);border:1px solid #2b3c55;border-radius:6px;box-shadow:0 12px 36px rgba(0,0,0,.55);padding:8px;color:#dbe3ee;' +
    'font:12px/1.35 ui-monospace,Menlo,monospace}' +
    '.um-panel-menu[hidden]{display:none!important}' +
    '.um-panel-menu .um-menu-actions{display:flex;gap:6px;margin:0 0 8px}' +
    '.um-panel-menu .um-menu-actions button,.um-panel-menu .um-menu-list button{all:unset;cursor:pointer;box-sizing:border-box}' +
    '.um-panel-menu .um-menu-actions button{flex:1;text-align:center;padding:6px 8px;border:1px solid #2b3c55;border-radius:3px;color:#a6dcff}' +
    '.um-panel-menu .um-menu-list{list-style:none;margin:0;padding:0;display:grid;gap:4px}' +
    '.um-panel-menu .um-menu-list button{display:flex;justify-content:space-between;gap:8px;width:100%;padding:6px 8px;border:1px solid #1a2636;border-radius:3px;background:#0d1520;color:#dbe3ee}' +
    '.um-panel-menu .um-menu-list button:hover,.um-panel-menu button:focus-visible{border-color:#a6dcff;outline:none}' +
    '.um-panel-menu .um-menu-list button[aria-pressed="false"]{opacity:.72}' +
    '.um-panel-menu .um-state{flex:none;color:#8b98ad;font-size:10px;letter-spacing:.06em;text-transform:uppercase}';
  document.head.appendChild(css);

  var MEDIA = /^(CANVAS|VIDEO|IMG|SVG|BUTTON|A|INPUT|SELECT|LABEL|SCRIPT|STYLE|TEXTAREA)$/i;
  function isEmbeddedFrame(tag) {
    return tag === ['I', 'F', 'R', 'A', 'M', 'E'].join('');
  }
  function skipBox(el) {
    return MEDIA.test(el.tagName) || isEmbeddedFrame(el.tagName);
  }
  function holdsMedia(el) {
    if (el.querySelector('canvas,video')) return true;
    var nodes = el.getElementsByTagName('*');
    for (var i = 0; i < nodes.length; i++) { if (isEmbeddedFrame(nodes[i].tagName)) return true; }
    return false;
  }
  function autoPick() {
    var all = Array.prototype.slice.call(document.body.querySelectorAll('*'));
    var c = all.filter(function (el) {
      if (el.closest('.um-pbar,.um-recall,.um-panel-menu')) return false;
      if (el.id === 'cv' || el.id === 'popcv' || el.id === 'um-societe-musique') return false;
      if (skipBox(el)) return false;
      var cs = getComputedStyle(el);
      if (!/^(fixed|absolute|sticky)$/.test(cs.position) || cs.display === 'none' || cs.visibility === 'hidden') return false;
      var r = el.getBoundingClientRect();
      if (r.width < 140 || r.height < 60) return false;
      if (!el.hasAttribute('data-um-panel') && holdsMedia(el)) return false;
      return true;
    });
    return c.filter(function (el) { return !c.some(function (o) { return o !== el && o.contains(el); }); });
  }

  var panels = [], recall = null, menu = null;
  function title(el, i) {
    var t = el.getAttribute('data-um-panel');
    if (t) return t;
    if (TITLES[el.id]) return TITLES[el.id];
    var h = el.querySelector('h1,h2,h3,h4,legend,[class*="title"]');
    return (h && h.textContent.trim().slice(0, 40)) || ('Panneau ' + (i + 1));
  }
  function keyOf(el, i) { return el.id || el.getAttribute('data-um-panel') || ('p' + i); }
  function byKey(k) {
    for (var i = 0; i < panels.length; i++) if (panels[i].k === k) return panels[i];
    return null;
  }

  function place(el, p) {
    el.style.setProperty('position', 'fixed', 'important');
    el.style.setProperty('left', p.x + 'px', 'important');
    el.style.setProperty('top', p.y + 'px', 'important');
    el.style.setProperty('right', 'auto', 'important');
    el.style.setProperty('bottom', 'auto', 'important');
    el.style.setProperty('margin', '0', 'important');
    el.style.setProperty('transform', 'none', 'important');
    if (p.w) el.style.setProperty('width', p.w + 'px', 'important');
  }
  function clampIn(p, el) {
    var r = el.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    p.x = Math.max(-r.width + 80, Math.min(W - 80, p.x)); p.y = Math.max(0, Math.min(H - 32, p.y)); return p;
  }
  function isClosed(o) {
    if (o.el.classList.contains('um-hidden')) return true;
    try { return getComputedStyle(o.el).display === 'none'; } catch (e) { return false; }
  }
  function count() { return panels.filter(isClosed).length; }
  function refresh() {
    var n = count();
    recall.textContent = n ? ('◧ Panneaux (' + n + ' fermé' + (n > 1 ? 's' : '') + ')') : '◧ Panneaux';
    recall.setAttribute('aria-expanded', menu.hidden ? 'false' : 'true');
    if (!menu.hidden) renderMenu();
    window.__umPanelsList = panels.map(function (o) { return o.k; });
  }
  function hide(o, on) {
    if (on) {
      o.el.classList.add('um-hidden');
      o.el.style.setProperty('display', 'none', 'important');
      if (o.el.id === 'pop') o.el.classList.remove('open');
    } else {
      o.el.classList.remove('um-hidden');
      o.el.style.removeProperty('display');
      if (o.el.id === 'ui') document.body.classList.remove('ui-collapsed');
      if (o.el.id === 'pop') o.el.classList.add('open');
      if (o.el.hasAttribute('hidden')) o.el.removeAttribute('hidden');
    }
    (st[o.k] = st[o.k] || {}).hidden = on; save(); refresh();
  }

  function renderMenu() {
    var actions = menu.querySelector('.um-menu-actions');
    var list = menu.querySelector('.um-menu-list');
    list.textContent = '';
    if (!panels.length) {
      var empty = document.createElement('li');
      empty.textContent = 'Aucun panneau';
      list.appendChild(empty);
      actions.hidden = true;
      return;
    }
    actions.hidden = false;
    panels.forEach(function (o) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-um-key', o.k);
      var closed = isClosed(o);
      b.setAttribute('aria-pressed', closed ? 'false' : 'true');
      var name = document.createElement('span');
      name.textContent = title(o.el, 0);
      var state = document.createElement('span');
      state.className = 'um-state';
      state.textContent = closed ? 'fermé' : 'ouvert';
      b.appendChild(name); b.appendChild(state);
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        hide(o, !isClosed(o));
      });
      li.appendChild(b); list.appendChild(li);
    });
  }

  function candidates() {
    var marked = Array.prototype.slice.call(document.querySelectorAll('[data-um-panel]'));
    var known = KNOWN.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var found = document.body.getAttribute('data-um-panels') === 'marked' ? [] : autoPick();
    var list = [];
    function add(el) {
      if (!el || list.indexOf(el) >= 0) return;
      if (el.closest('.um-pbar,.um-recall,.um-panel-menu')) return;
      if (el.tagName === 'CANVAS' || el.id === 'um-societe-musique') return;
      list.push(el);
    }
    marked.forEach(add); known.forEach(add); found.forEach(add);
    return list.filter(function (el) {
      return !list.some(function (o) { return o !== el && o.contains(el); });
    });
  }

  function adopt(el) {
    if (!el) return;
    var existing = null;
    for (var n = 0; n < panels.length; n++) if (panels[n].el === el) existing = panels[n];
    if (existing) {
      if (el.querySelector(':scope > .um-pbar')) return;
      panels = panels.filter(function (o) { return o.el !== el; });
    } else if (el.querySelector(':scope > .um-pbar')) return;
    var i = panels.length;
    var k = keyOf(el, i), o = { el: el, k: k, home: el.getAttribute('style') || '' };
    var bar = document.createElement('div'); bar.className = 'um-pbar';
    bar.innerHTML = '<span aria-hidden="true">⠋</span><b></b><button type="button" aria-label="Fermer ce panneau" title="Fermer">×</button>';
    bar.querySelector('b').textContent = title(el, i);
    bar.title = 'Glisser pour déplacer · double clic : remettre en place';
    el.insertBefore(bar, el.firstChild);
    bar.querySelector('button').addEventListener('click', function (e) { e.stopPropagation(); hide(o, true); });
    bar.addEventListener('dblclick', function (e) {
      e.preventDefault();
      el.setAttribute('style', o.home);
      if (st[k]) { delete st[k].pos; save(); }
    });
    bar.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      var r = el.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top, w = r.width;
      try { bar.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
      function mv(ev) { var p = clampIn({ x: ev.clientX - dx, y: ev.clientY - dy, w: w }, el); place(el, p); (st[k] = st[k] || {}).pos = p; }
      function up() { bar.removeEventListener('pointermove', mv); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); save(); }
      bar.addEventListener('pointermove', mv); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
    });
    var s = st[k];
    if (s && s.pos) place(el, clampIn(s.pos, el));
    if (s && typeof s.hidden === 'boolean') {
      if (s.hidden) { o.el.classList.add('um-hidden'); o.el.style.setProperty('display', 'none', 'important'); }
    } else if (el.getAttribute('data-um-start') === 'hidden') {
      el.classList.add('um-hidden');
      el.style.setProperty('display', 'none', 'important');
    }
    panels.push(o);
  }

  function scan() {
    candidates().forEach(adopt);
    refresh();
  }

  function init() {
    recall = document.createElement('button'); recall.type = 'button'; recall.className = 'um-recall';
    recall.title = 'Ouvrir la liste des panneaux. Échap ferme le menu, puis les panneaux.';
    recall.setAttribute('aria-haspopup', 'true');
    menu = document.createElement('div'); menu.className = 'um-panel-menu'; menu.hidden = true;
    menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', 'Panneaux');
    menu.innerHTML = '<div class="um-menu-actions"><button type="button" data-act="show">Tout rouvrir</button><button type="button" data-act="hide">Tout fermer</button></div><ul class="um-menu-list"></ul>';
    menu.addEventListener('click', function (e) { e.stopPropagation(); });
    menu.querySelector('[data-act="show"]').addEventListener('click', function () { panels.forEach(function (o) { hide(o, false); }); });
    menu.querySelector('[data-act="hide"]').addEventListener('click', function () { panels.forEach(function (o) { hide(o, true); }); });
    recall.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
      refresh();
    });
    document.addEventListener('click', function () { if (!menu.hidden) { menu.hidden = true; refresh(); } });
    document.body.appendChild(menu);
    document.body.appendChild(recall);
    scan();
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      var t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (!menu.hidden) { menu.hidden = true; refresh(); return; }
      panels.forEach(function (o) { hide(o, true); });
    });
    var queued = false;
    var obs = new MutationObserver(function () {
      if (queued) return; queued = true;
      setTimeout(function () { queued = false; scan(); }, 250);
    });
    obs.observe(document.body, { childList: true, subtree: true });
    window.__umPanelsApi = { hide: hide, panels: panels, scan: scan, byKey: byKey };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
