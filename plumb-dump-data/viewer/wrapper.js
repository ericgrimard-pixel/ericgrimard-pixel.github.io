/* v2.00 sandbox viewer chrome — wrapper only. Does not patch engine.js. */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function text(el, s) {
    el.textContent = s == null ? '' : String(s);
  }

  /* Same typenames the engine uses for finance Class 2 (CTYPE).
     Other kinds take the ty string from data.c2 / data.ctype, never invented. */
  var FIN_CTYPE = {
    sec: { label: 'Secteur', key: 'sec' },
    cty: { label: 'Pays', key: 'cty' },
    ind: { label: 'Industrie', key: 'ind' }
  };

  function currentLib(probe) {
    var id = probe && probe.sys;
    var LIB = window.LIB || [];
    for (var i = 0; i < LIB.length; i++) if (LIB[i] && LIB[i].id === id) return LIB[i];
    return LIB[0] || null;
  }

  /* Engine Class 2 for the current system — not invented.
     Finance: the engine builds CARDS from sec/cty/ind in this exact order.
     cols / hockey: DATA.c2, in file order (gcCards / hkCards). */
  function class2List(probe) {
    var lib = currentLib(probe);
    if (!lib || !lib.data) return [];
    var data = lib.data;
    var out = [];
    if (lib.kind === 'cols' || lib.kind === 'hockey') {
      var raw = data.c2 || [];
      for (var i = 0; i < raw.length; i++) {
        var c = raw[i] || {};
        out.push({
          idx: i,
          ty: c.ty || '',
          name: c.name || c.short || '',
          label: typelabel(lib, c.ty, c.name || c.short || '')
        });
      }
      return out;
    }
    /* finance (kind absent): same grouping + sort as the frozen engine */
    var TK = data.t || [];
    var types = ['sec', 'cty', 'ind'];
    var idx = 0;
    types.forEach(function (ty) {
      var key = FIN_CTYPE[ty].key;
      var g = {};
      TK.forEach(function (t) {
        var nm = t && t[key] != null ? String(t[key]) : '';
        (g[nm] = g[nm] || []).push(true);
      });
      Object.keys(g)
        .sort(function (a, b) {
          return g[b].length - g[a].length || a.localeCompare(b);
        })
        .forEach(function (nm) {
          out.push({
            idx: idx,
            ty: ty,
            name: nm,
            label: typelabel(lib, ty, nm)
          });
          idx += 1;
        });
    });
    return out;
  }

  function typelabel(lib, ty, name) {
    var lab = '';
    if (ty && FIN_CTYPE[ty]) lab = FIN_CTYPE[ty].label;
    else if (lib && lib.data && lib.data.ctype && lib.data.ctype[ty] && lib.data.ctype[ty].label) {
      lab = lib.data.ctype[ty].label;
    } else if (ty) lab = ty;
    var n = name == null ? '' : String(name);
    if (lab && n) return lab + ' · ' + n;
    return n || lab || '';
  }

  function kindWord(k) {
    if (k === 1) return 'Classe 1';
    if (k === 2) return 'Classe 2';
    if (k === 3) return 'Classe 3';
    if (k === 4) return 'Classe 4';
    if (k === 5) return 'Z0';
    return 'Classe ' + k;
  }

  function probeNow() {
    if (typeof window.__umProbe !== 'function') return null;
    try { return window.__umProbe(); } catch (err) { return null; }
  }

  /* Engine hook: window.__umSelect is select() (fiche, trails, card).
     That is the same path as the fiche's data-sel chips. */
  function openRef(ref) {
    if (typeof window.__umSelect === 'function') window.__umSelect(ref);
  }

  function installDock() {
    var right = document.getElementById('right');
    if (!right || document.getElementById('pdd-dock')) return;

    var dock = document.createElement('section');
    dock.id = 'pdd-dock';
    dock.className = 'panel pdd-dock';
    dock.innerHTML =
      '<h2>Classe 2</h2>' +
      '<label class="pdd-c2-lab" for="pdd-c2">' +
      '<span class="pdd-lab">Objets accessibles</span>' +
      '<select id="pdd-c2" aria-label="Objets de Classe 2 accessibles" disabled><option value="">aucune Classe 2</option></select>' +
      '</label>' +
      '<h2>Scène</h2>' +
      '<div id="pdd-scene" class="pdd-scene" role="list" aria-label="Objets présents dans la scène"></div>';

    var rclose = right.querySelector('.rclose');
    if (rclose && rclose.nextSibling) right.insertBefore(dock, rclose.nextSibling);
    else if (rclose) right.appendChild(dock);
    else right.insertBefore(dock, right.firstChild);

    var sel = document.getElementById('pdd-c2');
    sel.addEventListener('change', function () {
      if (sel.disabled || sel.value === '') return;
      openRef({ kind: 2, idx: +sel.value });
    });

    document.getElementById('pdd-scene').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-pdd-kind]');
      if (!b) return;
      var kind = +b.getAttribute('data-pdd-kind');
      var side = b.getAttribute('data-pdd-side') || '';
      var idxRaw = b.getAttribute('data-pdd-idx');
      var name = b.getAttribute('data-pdd-name') || '';
      if (side) {
        openRef({ kind: 4, side: side, label: name });
        return;
      }
      if (kind === 4 && (idxRaw === '' || idxRaw == null)) {
        openRef({ kind: 4 });
        return;
      }
      openRef({ kind: kind, idx: +idxRaw });
    });
  }

  var lastC2Sig = null;
  var lastSceneSig = null;

  function fillC2(probe) {
    var sel = document.getElementById('pdd-c2');
    if (!sel) return;
    var list = class2List(probe);
    var sig = list.map(function (c) { return c.idx + ':' + c.ty + ':' + c.name; }).join('|');
    var current = (probe && probe.sel && probe.sel.kind === 2) ? String(probe.sel.idx) : '';
    if (sig !== lastC2Sig) {
      lastC2Sig = sig;
      sel.innerHTML = '';
      if (!list.length) {
        var none = document.createElement('option');
        none.value = '';
        text(none, 'aucune Classe 2');
        sel.appendChild(none);
        sel.disabled = true;
        sel.setAttribute('aria-disabled', 'true');
      } else {
        sel.disabled = false;
        sel.removeAttribute('aria-disabled');
        var ph = document.createElement('option');
        ph.value = '';
        text(ph, 'Choisir une Classe 2…');
        sel.appendChild(ph);
        list.forEach(function (c) {
          var opt = document.createElement('option');
          opt.value = String(c.idx);
          text(opt, c.label || c.name || ('#' + c.idx));
          sel.appendChild(opt);
        });
      }
    }
    if (!sel.disabled && current && sel.value !== current) {
      if (sel.querySelector('option[value="' + current + '"]')) sel.value = current;
    }
  }

  /* Active Class 3 containers the frozen engine always places (C3ON / C3SYM).
     The two λ traps are placed but not activated; they are still in the scene. */
  var C3_NAMES = ['Ω', 'λ⁻', 'Σ', 'λ⁺', 'α'];

  function sceneItems(probe) {
    var items = [];
    var i;
    /* Prefer the engine probe when the page actually exposes it (engine.js).
       The frozen HTML snapshot used by this sandbox only exposes __umSelect,
       so we otherwise list from the same data the engine used to build the scene. */
    if (probe && Array.isArray(probe.visible) && probe.visible.length) {
      for (i = 0; i < probe.visible.length; i++) {
        var o = probe.visible[i];
        items.push({
          kind: o.kind,
          idx: o.idx,
          side: '',
          name: o.name || '',
          door: !!o.door
        });
      }
      var sides = probe.sides || [];
      for (i = 0; i < sides.length; i++) {
        var s = sides[i];
        items.push({
          kind: 4,
          idx: '',
          side: s.id || '',
          name: s.name || s.id || '',
          door: !!s.door
        });
      }
      return items;
    }
    var lib = currentLib(probe);
    if (!lib) return items;
    items.push({ kind: 4, idx: '', side: '', name: lib.name || lib.id || 'Classe 4', door: false });
    for (i = 0; i < C3_NAMES.length; i++) {
      items.push({ kind: 3, idx: i, side: '', name: C3_NAMES[i], door: false });
    }
    var c2 = class2List(probe);
    for (i = 0; i < c2.length; i++) {
      items.push({ kind: 2, idx: c2[i].idx, side: '', name: c2[i].label || c2[i].name, door: false });
    }
    var tk = (lib.data && lib.data.t) || [];
    for (i = 0; i < tk.length; i++) {
      var row = tk[i] || {};
      items.push({ kind: 1, idx: i, side: '', name: row.s || row.id || ('#' + i), door: false });
    }
    return items;
  }

  function fillScene(probe) {
    var box = document.getElementById('pdd-scene');
    if (!box) return;
    var items = sceneItems(probe);
    var sig = items.map(function (o) {
      return o.kind + ':' + (o.side || o.idx) + ':' + o.name;
    }).join('|');
    var selKey = probe && probe.sel
      ? (probe.sel.kind + ':' + (probe.sel.side || probe.sel.idx))
      : '';
    if (sig !== lastSceneSig) {
      lastSceneSig = sig;
      box.innerHTML = '';
      if (!items.length) {
        var empty = document.createElement('p');
        empty.className = 'pdd-empty';
        text(empty, 'Aucun objet dans la scène pour l’instant.');
        box.appendChild(empty);
      } else {
        items.forEach(function (o) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('data-pdd-kind', String(o.kind));
          if (o.side) b.setAttribute('data-pdd-side', o.side);
          if (o.idx !== '' && o.idx != null) b.setAttribute('data-pdd-idx', String(o.idx));
          b.setAttribute('data-pdd-name', o.name);
          b.setAttribute('role', 'listitem');
          var k = document.createElement('em');
          k.className = 'pdd-k';
          text(k, kindWord(o.kind));
          var n = document.createElement('span');
          n.className = 'pdd-n';
          text(n, o.name || ('#' + o.idx));
          b.appendChild(k);
          b.appendChild(n);
          if (o.door) b.title = (o.name || '') + ' · porte';
          box.appendChild(b);
        });
      }
    }
    Array.prototype.forEach.call(box.querySelectorAll('button[data-pdd-kind]'), function (b) {
      var kind = +b.getAttribute('data-pdd-kind');
      var side = b.getAttribute('data-pdd-side') || '';
      var idx = b.getAttribute('data-pdd-idx');
      var key = side ? (kind + ':' + side) : (kind + ':' + (idx === null ? '' : idx));
      /* Class 4 central object is {kind:4} with no idx in select() */
      if (!side && kind === 4 && (idx === '' || idx == null)) key = '4:';
      var on = selKey === key || selKey === (kind + ':' + (idx || ''));
      if (kind === 4 && !side && probe && probe.sel && probe.sel.kind === 4 && !probe.sel.side) on = true;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function sync() {
    var p = probeNow();
    fillC2(p);
    fillScene(p);
  }

  ready(function () {
    var header = document.querySelector('header');
    if (header) header.classList.add('pdd-compact');

    var h1 = document.querySelector('.brand h1');
    var sub = document.getElementById('sub');
    if (h1 && sub) {
      var subtext = (sub.textContent || '').trim();
      if (subtext) {
        h1.setAttribute('title', subtext + ' · sandbox door-v2.00 (frozen engine unmodified)');
        if (!document.title || document.title.indexOf('sandbox') === -1) {
          document.title = (document.title || 'Manifestation') + ' · ' + subtext;
        }
      }
    }

    var fourier = document.getElementById('mFourier');
    if (fourier) {
      var full = (fourier.textContent || '').trim();
      if (full) {
        fourier.setAttribute('title', full);
        fourier.textContent = 'Fourier';
      }
    }

    var soul = document.querySelector('a.soul');
    if (soul) {
      soul.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
      }, true);
      soul.setAttribute('href', '#');
      soul.setAttribute('title', 'Hub link hidden in the v2 sandbox viewer (never the live hub).');
      soul.setAttribute('tabindex', '-1');
      soul.setAttribute('aria-hidden', 'true');
    }

    installDock();
    sync();
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(function () {
        sync();
        requestAnimationFrame(sync);
      });
    }
    var n = 0;
    var tick = function () {
      sync();
      n += 1;
      if (n < 40) setTimeout(tick, 250);
      else setInterval(sync, 1000);
    };
    setTimeout(tick, 50);

    var sys = document.getElementById('sys');
    if (sys) sys.addEventListener('change', function () {
      lastC2Sig = '';
      lastSceneSig = '';
      setTimeout(sync, 50);
    });
    var fiche = document.getElementById('fiche');
    if (fiche && window.MutationObserver) {
      new MutationObserver(function () { sync(); }).observe(fiche, { childList: true, subtree: true });
    }
  });
})();
