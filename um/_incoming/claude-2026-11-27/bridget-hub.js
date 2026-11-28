/* Bridget — module Hub. Lecture seule. Aucune clé, aucun appel réseau externe.
   Elle ne lit que index.json (la documentation publiée du Hub, même origine).
   Elle ne répond que depuis cet index ; sinon elle le dit (Canon 04). */
(function (root) {
  'use strict';

  var STOP = new Set(('le la les un une des de du d l et ou en a au aux ce ces cet cette qui que quoi dont ' +
    'est sont etre pour par sur dans avec sans se sa son ses leur leurs il elle ils elles on nous vous je tu ' +
    'me te y ne pas plus ni si qu quel quelle quels quelles quand comment pourquoi combien the of and to in is are for on with how what').split(' '));

  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function tok(s) { return norm(s).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 1 && !STOP.has(w); }); }
  function safeUrl(u) {
    try { var p = new URL(u, root.location ? root.location.href : 'https://x.invalid/'); return (p.protocol === 'https:' || p.protocol === 'http:') ? u : '#'; }
    catch (e) { return '#'; }
  }

  function createEngine(index, opts) {
    opts = opts || {};
    var minCoverage = opts.minCoverage == null ? 0.6 : opts.minCoverage;
    var minScore = opts.minScore == null ? 0 : opts.minScore;
    var chunks = [], df = Object.create(null), total = 0;

    (index.docs || []).forEach(function (doc) {
      (doc.chunks || []).forEach(function (text) {
        var terms = tok(text), tf = Object.create(null);
        terms.forEach(function (t) { tf[t] = (tf[t] || 0) + 1; });
        Object.keys(tf).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
        chunks.push({ doc: doc, text: text, tf: tf, len: terms.length || 1 });
        total += terms.length || 1;
      });
    });
    var avg = chunks.length ? total / chunks.length : 1;

    function ask(question) {
      var q = Array.from(new Set(tok(question)));
      if (!q.length || !chunks.length) return { answered: false, score: 0, passages: [] };
      var N = chunks.length, k1 = 1.2, b = 0.75;
      var scored = chunks.map(function (c) {
        var s = 0, hit = 0;
        q.forEach(function (t) {
          var f = c.tf[t]; if (!f) return; hit++;
          var idf = Math.log(1 + (N - df[t] + 0.5) / (df[t] + 0.5));
          s += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * c.len / avg));
        });
        return { chunk: c, score: s, coverage: hit / q.length };
      }).filter(function (r) { return r.score > 0; })
        .sort(function (a, b2) { return b2.score - a.score; });
      var top = scored.slice(0, 3);
      var best = top[0];
      var answered = !!best && best.coverage >= minCoverage && best.score >= minScore;
      return {
        answered: answered,
        score: best ? best.score : 0,
        passages: (answered ? top : []).map(function (r) {
          return { title: r.chunk.doc.title, url: r.chunk.doc.url, text: r.chunk.text, score: r.score };
        })
      };
    }
    return { ask: ask, size: chunks.length };
  }

  function load(indexUrl, opts) {
    return fetch(indexUrl, { credentials: 'omit', cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('index ' + r.status); return r.json(); })
      .then(function (idx) { return createEngine(idx, opts); });
  }

  /* Montage : balisage sans style (hérite du CSS du Hub). Tout texte passe par textContent. */
  function mount(el, opts) {
    opts = opts || {};
    var escalate = opts.escalate || null; // { issueUrl: 'https://github.com/.../issues/new' } — absent par défaut
    var engine = null;
    function h(tag, text, attrs) {
      var n = document.createElement(tag);
      if (text != null) n.textContent = text;
      if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      return n;
    }
    var form = h('form', null, { 'aria-label': 'Poser une question à Bridget' });
    var input = h('input', null, { type: 'text', 'aria-label': 'Votre question', autocomplete: 'off', maxlength: '300' });
    var btn = h('button', 'Demander à Bridget', { type: 'submit' });
    var out = h('div', null, { 'aria-live': 'polite' });
    form.appendChild(input); form.appendChild(btn);
    el.appendChild(form); el.appendChild(out);

    load(opts.indexUrl || 'bridget/index.json', opts).then(function (e) { engine = e; })
      .catch(function () { out.textContent = 'Bridget ne peut pas lire la documentation du Hub pour l\u2019instant.'; });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var q = input.value.trim();
      out.textContent = '';
      if (!q) return;
      if (!engine) { out.textContent = 'Bridget n\u2019est pas encore prête.'; return; }
      var r = engine.ask(q);
      if (!r.answered) {
        out.appendChild(h('p', 'Je n\u2019ai pas cette réponse dans la documentation du Hub.'));
        if (escalate && escalate.issueUrl) {
          var href = escalate.issueUrl + '?title=' + encodeURIComponent('Question pour Bridget') +
                     '&body=' + encodeURIComponent(q);
          var a = h('a', 'Transmettre cette question à l\u2019équipe', { href: safeUrl(href), rel: 'noopener', target: '_blank' });
          out.appendChild(a);
        }
        return;
      }
      r.passages.forEach(function (p) {
        var box = h('blockquote'); box.appendChild(h('p', p.text));
        var cite = h('a', p.title, { href: safeUrl(p.url), rel: 'noopener' });
        var foot = h('footer'); foot.appendChild(cite); box.appendChild(foot);
        out.appendChild(box);
      });
    });
  }

  root.Bridget = { createEngine: createEngine, load: load, mount: mount };
})(typeof window !== 'undefined' ? window : globalThis);
