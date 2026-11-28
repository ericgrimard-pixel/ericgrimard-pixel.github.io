/* v21.09 — the four universes are a bar. The blank menu shows only that bar. */
(function () {
  var ORDER = [
    { key: 'finance', sys: 'world' },
    { key: 'art', sys: 'art' },
    { key: 'sante', sys: 'health' },
    { key: 'sport', sys: 'sports' }
  ];
  function raw() {
    return (location.hash || '').replace(/^#/, '').replace(/^\//, '').split('?')[0].toLowerCase();
  }
  function isMenu(h) {
    return !h || h === 'menu' || h === 'accueil';
  }
  function universeKey(sysId) {
    var by = window.UM_FLOOR_BY;
    var id = sysId;
    var n = 0;
    while (id && n++ < 24) {
      if (id === 'world') return 'finance';
      if (id === 'art' || id === 'music') return 'art';
      if (id === 'health' || String(id).indexOf('sante') === 0) return 'sante';
      if (id === 'sports' || id === 'nhl' || id === 'football' || String(id).indexOf('fb-') === 0) return 'sport';
      var f = by && by[id];
      if (!f || !f.parent) break;
      id = f.parent;
    }
    return '';
  }
  function currentSys() {
    var sel = document.getElementById('sys');
    return sel && sel.value ? sel.value : '';
  }
  function showGap(on) {
    var el = document.getElementById('um-universe-gap');
    if (!el) return;
    el.hidden = !on;
  }
  function emptySys(id) {
    var lib = (typeof LIB !== 'undefined' && LIB) || [];
    var s = null;
    for (var i = 0; i < lib.length; i++) if (lib[i] && lib[i].id === id) { s = lib[i]; break; }
    if (!s || !s.data || !s.data.t || !s.data.t.length || s.empty) return true;
    return false;
  }
  function paint() {
    var h = raw();
    var menu = isMenu(h);
    document.body.classList.toggle('um-menu', menu);
    var key = menu ? '' : universeKey(currentSys());
    document.querySelectorAll('#um-universes [data-universe]').forEach(function (b) {
      if (key && b.getAttribute('data-universe') === key) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
    showGap(!menu && emptySys(currentSys()));
  }
  function openKey(key) {
    var spec = ORDER.filter(function (x) { return x.key === key; })[0];
    if (!spec || typeof switchSys !== 'function') return;
    document.body.classList.remove('um-menu');
    switchSys(spec.sys);
    paint();
  }
  var bar = document.getElementById('um-universes');
  if (bar) bar.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-universe]');
    if (b) { openKey(b.getAttribute('data-universe')); return; }
    if (ev.target.closest('#um-menu-back')) {
      location.hash = '/';
      document.body.classList.add('um-menu');
      paint();
    }
  });
  addEventListener('hashchange', function () { setTimeout(paint, 0); });
  paint();
})();
