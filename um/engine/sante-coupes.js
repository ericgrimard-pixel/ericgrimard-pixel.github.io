/* v21.06 — lacunes visibles des deux coupes Santé (Classe 2).
   Ne touche pas engine.js. Lit le champ `coupe` posé par sante-villes.js et
   sante-provinces.js. Aucun appel externe : tout est déjà dans la bibliothèque.
   Les drapeaux suivent la règle des champs clairsemés : badge, couverture, lacune. */
(function () {
  'use strict';
  var css = document.createElement('style');
  css.id = 'sante-coupe-css';
  css.textContent = '#sante-coupe{position:absolute;z-index:6;left:8px;top:8px;width:min(440px,calc(100% - 16px));max-height:min(42vh,360px);overflow:auto;box-sizing:border-box;padding:10px 12px;background:rgba(8,12,18,.94);color:#f4f7fb;border:2px solid #e8c872;border-radius:10px;font:600 13px/1.4 system-ui,sans-serif;box-shadow:0 10px 28px rgba(0,0,0,.4)}'
    + '#sante-coupe h3{margin:0 0 6px;font:600 15px/1.3 Georgia,serif;color:#e8c872}'
    + '#sante-coupe p{margin:4px 0}'
    + '#sante-coupe .gap{display:inline-block;margin-right:6px;padding:1px 6px;border-radius:3px;font:700 10px/1.3 system-ui,sans-serif;letter-spacing:.02em}'
    + '#sante-coupe .gap[data-tag="INCOMPLET"]{background:#e0533f;color:#fff}'
    + '#sante-coupe .gap[data-tag="À VÉRIFIER"]{background:#e8c872;color:#05080d}'
    + '#sante-coupe select{width:100%;margin-top:6px;min-height:36px;font:600 13px/1.3 system-ui,sans-serif;color:#05080d;background:#fff;border:1px solid #e8c872;border-radius:6px}'
    + '@media (max-width:600px){#sante-coupe{top:auto;bottom:8px;max-height:34vh;font-size:12.5px}}';
  document.head.appendChild(css);

  var shown = '';
  function lib() {
    return (typeof LIB !== 'undefined' && LIB) || window.LIB || [];
  }
  function current() {
    var sel = document.getElementById('sys');
    var id = sel && sel.value;
    var all = lib();
    for (var i = 0; i < all.length; i++) if (all[i] && all[i].id === id) return all[i];
    return null;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(x) {
    if (x == null || x === '') return '—';
    var n = Number(x);
    if (!isFinite(n)) return '—';
    return n.toFixed(1).replace('.', ',');
  }
  function render() {
    var s = current();
    var id = s && s.coupe ? s.id : '';
    var stage = document.getElementById('stage');
    var el = document.getElementById('sante-coupe');
    if (!id || !stage) {
      if (el) el.remove();
      shown = '';
      return;
    }
    if (id === shown && el) return;
    shown = id;
    if (!el) {
      el = document.createElement('aside');
      el.id = 'sante-coupe';
      el.setAttribute('aria-label', 'Lacunes de la coupe');
      stage.appendChild(el);
    }
    var c = s.coupe;
    var html = '<h3>' + esc(s.name) + '</h3>';
    html += '<p>Couverture <b>' + esc(c.coverage) + '</b> (' + String(c.coveragePct).replace('.', ',') + ' %).</p>';
    (c.flags || []).forEach(function (f) {
      html += '<p><span class="gap" data-tag="' + esc(f.tag) + '">' + esc(f.tag) + '</span>' + esc(f.text) + '</p>';
    });
    if (c.worldBounds) {
      html += '<p>Fenêtres monde (q20 / q40 / q60 / q80), milliers : ' + c.worldBounds.map(num).join(' / ') + '.</p>';
    }
    if (c.note) html += '<p>' + esc(c.note) + '</p>';
    if (c.countries && c.countries.length) {
      html += '<label>Fenêtre pays <select id="sante-coupe-pays" aria-label="Pays de la coupe villes">';
      html += '<option value="">Choisir un pays (code ISO3)</option>';
      c.countries.forEach(function (row) {
        html += '<option value="' + esc(row.iso3) + '">' + esc(row.iso3) + ' · ' + esc(row.zone) + ' · ' + row.n + ' villes</option>';
      });
      html += '</select></label><p id="sante-coupe-detail"></p>';
    }
    el.innerHTML = html;
    var pick = document.getElementById('sante-coupe-pays');
    var detail = document.getElementById('sante-coupe-detail');
    if (pick && detail) {
      pick.onchange = function () {
        var iso = pick.value;
        var row = null;
        for (var i = 0; i < c.countries.length; i++) if (c.countries[i].iso3 === iso) row = c.countries[i];
        if (!row) { detail.textContent = ''; return; }
        detail.textContent = row.iso3 + ' · ' + row.zone + ' · ' + row.n + ' villes · '
          + row.both + ' aux deux prises · ' + row.one + ' avec une seule · ' + row.none + ' sans prise. '
          + 'Médiane (milliers) ' + num(row.med0) + ' → ' + num(row.med1) + '. '
          + 'Fenêtres pays, bornes q20 q40 q60 q80 : ' + (row.bornes || '[INCOMPLET]') + '.';
      };
    }
  }
  render();
  setInterval(render, 500);
})();
