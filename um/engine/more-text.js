/* v21.10 — the long right-panel text is for Brigitte, on demand.
   Nothing is removed. Sections stay in the DOM (not display:none) and start collapsed
   behind a visible « Plus de texte » control. Gap badges stay in the summaries. */
(function () {
  function textOf(el) {
    return (el && (el.innerText || el.textContent) || '').replace(/\s+/g, ' ').trim();
  }
  function isModele(el) {
    return !!(el && (el.id === 'modele' || el.closest && el.closest('#modele')));
  }
  function isNav(el) {
    if (!el) return false;
    if (el.id === 'um-rg-couches' || el.id === 'layers' || el.id === 'um-rg-btns' || el.id === 'um-more-all') return true;
    if (el.querySelector && el.querySelector('#layers') && !el.querySelector('#fiche') && !el.querySelector('#srcText') && !el.querySelector('#legend')) return true;
    return false;
  }
  function flag(sum, root) {
    if (!sum || sum.querySelector('.um-gap-badge')) return;
    if (root && root.querySelector('.um-gap-badge')) {
      sum.insertAdjacentHTML('beforeend', ' <span class="um-gap-badge">LACUNE / GAP</span>');
    }
  }
  function markSummary(sum, root) {
    if (!sum || sum.dataset.umMore === '1') { flag(sum, root); return; }
    sum.dataset.umMore = '1';
    sum.insertAdjacentHTML('afterbegin', '<span class="um-more-label">Plus de texte · </span>');
    flag(sum, root);
  }
  function ensureDetails(el) {
    if (!el || isModele(el)) return null;
    if (el.tagName === 'DETAILS') {
      markSummary(el.querySelector(':scope > summary'), el);
      return el;
    }
    var parent = el.closest('details');
    if (parent && parent.closest('#right')) {
      markSummary(parent.querySelector(':scope > summary'), parent);
      return parent;
    }
    var d = el.previousElementSibling;
    if (!(d && d.classList && d.classList.contains('um-more') && d.contains(el))) {
      d = document.createElement('details');
      d.className = 'um-more';
      d.id = 'um-more-' + (el.id || 'bloc');
      var s = document.createElement('summary');
      s.textContent = '';
      el.parentNode.insertBefore(d, el);
      d.appendChild(s);
      d.appendChild(el);
    }
    markSummary(d.querySelector(':scope > summary'), d);
    return d;
  }
  function placeGlobal() {
    var R = document.getElementById('right');
    if (!R) return null;
    var b = document.getElementById('um-more-all');
    if (!b) {
      b = document.createElement('button');
      b.type = 'button';
      b.id = 'um-more-all';
      b.textContent = 'Plus de texte';
      b.addEventListener('click', function () { window.__umMoreText('all'); });
    }
    if (R.firstChild !== b) R.insertBefore(b, R.firstChild);
    return b;
  }
  function collapse() {
    placeGlobal();
    var nodes = document.querySelectorAll('#right section.panel, #right details');
    nodes.forEach(function (el) {
      if (isModele(el) || isNav(el)) return;
      var d = ensureDetails(el);
      if (d) { d.open = true; d.classList.add('um-fold'); if (!d.dataset.umUser) d.classList.remove('um-open'); }
    });
  }
  function openChain(el) {
    var n = el;
    while (n) {
      if (n.tagName === 'DETAILS') { n.dataset.umUser = '1'; n.open = true; n.classList.add('um-fold', 'um-open'); }
      n = n.parentElement;
    }
  }
  window.__umMoreText = function (sectionId) {
    var R = document.getElementById('right');
    if (!R) return '';
    if (!sectionId || sectionId === 'all' || sectionId === '*') {
      var parts = [];
      R.querySelectorAll('details').forEach(function (d) {
        if (isModele(d)) return;
        d.dataset.umUser = '1';
        d.open = true;
        d.classList.add('um-fold', 'um-open');
        parts.push(textOf(d));
      });
      var modele = document.getElementById('modele');
      if (modele) parts.push(textOf(modele));
      return parts.join('\n');
    }
    var el = document.getElementById(sectionId);
    if (!el) return '';
    openChain(el.tagName === 'DETAILS' ? el : (el.closest('details') || ensureDetails(el) || el));
    if (sectionId === 'fiche' || sectionId === 'um-rg-fiche') {
      var tg = document.getElementById('tgR');
      if (tg) tg.setAttribute('aria-pressed', 'true');
      var app = document.querySelector('.app');
      if (app) app.classList.remove('noR');
    }
    return textOf(el);
  };
  window.__umMoreText.sections = function () {
    return Array.prototype.map.call(document.querySelectorAll('#right section, #right details'), function (el) {
      return el.id;
    }).filter(Boolean);
  };
  function onFicheToggle() {
    setTimeout(function () {
      var app = document.querySelector('.app');
      var hidden = !!(app && app.classList.contains('noR'));
      var d = document.getElementById('um-rg-fiche');
      if (!d) {
        var fiche = document.getElementById('fiche');
        d = fiche && fiche.closest('details');
      }
      if (!d) return;
      if (hidden) { d.classList.remove('um-open'); delete d.dataset.umUser; }
      else window.__umMoreText('fiche');
    }, 0);
  }
  function onSummary(e) {
    var sum = e.target.closest && e.target.closest('#right details.um-fold > summary');
    if (!sum) return;
    e.preventDefault();
    var d = sum.parentElement;
    d.open = true;
    if (d.classList.contains('um-open')) { d.classList.remove('um-open'); delete d.dataset.umUser; }
    else { d.dataset.umUser = '1'; d.classList.add('um-open'); }
  }
  function boot() {
    collapse();
    var R = document.getElementById('right');
    if (R && !R.dataset.umMoreBound) {
      R.dataset.umMoreBound = '1';
      R.addEventListener('click', onSummary);
    }
    var tg = document.getElementById('tgR');
    if (tg && !tg.dataset.umMoreBound) {
      tg.dataset.umMoreBound = '1';
      tg.addEventListener('click', onFicheToggle);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 0);
  setTimeout(boot, 400);
})();
