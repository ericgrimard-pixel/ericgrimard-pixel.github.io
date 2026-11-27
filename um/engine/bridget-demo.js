/* Brigitte — active demonstration layer, Hub v21.03 (Miriamphobots).
   Loaded by um/index.html and um/engine/manifestation-engine.html.
   Does not modify the Manifestation Engine. Listeners use DOM properties so the
   engine's boot AbortSignal cannot drop them on a system switch. */
(function () {
  if (window.BridgetDemo && window.BridgetDemo.version === 'v21.03') return;

  var pace = { move: 480, pulse: 180, step: 240 };
  var generation = 0;
  var runToken = 0;
  var running = false;
  var cursorPos = null;
  var sleeps = [];
  var cursorEl = null;
  var liveEl = null;
  var captionEl = null;
  var reduceMotion = false;

  try {
    reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { reduceMotion = false; }

  function sleep(ms) {
    return new Promise(function (resolve) {
      var gen = generation;
      var item = { resolve: resolve };
      item.t = setTimeout(function () {
        var i = sleeps.indexOf(item);
        if (i >= 0) sleeps.splice(i, 1);
        resolve(gen === generation);
      }, ms);
      sleeps.push(item);
    });
  }

  function clearSleeps() {
    sleeps.splice(0).forEach(function (item) {
      clearTimeout(item.t);
      item.resolve(false);
    });
  }

  function ensureChrome() {
    if (cursorEl && liveEl) return;
    var style = document.createElement('style');
    style.id = 'bridget-demo-style';
    style.textContent = [
      '#bridgetDemo{font:500 11px/1.2 var(--f-mono,ui-monospace,monospace);letter-spacing:.02em;color:var(--core,#e8c872);border-color:#4a3f22}',
      '#bridget-cursor{position:fixed;z-index:80;width:48px;height:48px;margin:-24px 0 0 -24px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 3px #05080d,0 0 0 6px #e8c872;background:transparent;pointer-events:none;display:none}',
      '#bridget-cursor::after{content:"";position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#e8c872;box-shadow:0 0 0 2px #05080d}',
      '#bridget-cursor[data-on="1"]{display:block}',
      '#bridget-cursor.pulse{animation:bridget-pulse .22s ease-out}',
      '@keyframes bridget-pulse{0%{transform:scale(1)}50%{transform:scale(1.35)}100%{transform:scale(1)}}',
      '@media (prefers-reduced-motion:reduce){#bridget-cursor.pulse{animation:none}}',
      '@media (forced-colors:active){#bridget-cursor{border:3px solid CanvasText;box-shadow:0 0 0 3px Canvas,0 0 0 6px Highlight}}',
      '#bridget-live{position:fixed;z-index:81;left:50%;bottom:max(12px,env(safe-area-inset-bottom));transform:translateX(-50%);display:none;align-items:center;gap:10px;max-width:min(640px,calc(100vw - 24px));padding:8px 10px 8px 12px;background:#05080d;color:#fff;border:2px solid #e8c872;border-radius:6px;font:600 15px/1.35 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.45);pointer-events:none}',
      '#bridget-live[data-on="1"]{display:flex}',
      '#bridget-caption{flex:1 1 auto}',
      '#bridget-stop{pointer-events:auto;font:600 14px/1 system-ui,sans-serif;color:#05080d;background:#e8c872;border:2px solid #fff;border-radius:4px;padding:8px 12px;cursor:pointer}'
    ].join('');
    document.head.appendChild(style);

    cursorEl = document.createElement('div');
    cursorEl.id = 'bridget-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursorEl);

    liveEl = document.createElement('div');
    liveEl.id = 'bridget-live';
    liveEl.setAttribute('role', 'status');
    liveEl.setAttribute('aria-live', 'polite');
    captionEl = document.createElement('span');
    captionEl.id = 'bridget-caption';
    var stopBtn = document.createElement('button');
    stopBtn.id = 'bridget-stop';
    stopBtn.type = 'button';
    stopBtn.textContent = 'Stop';
    stopBtn.setAttribute('aria-label', 'Arrêter la démonstration');
    stopBtn.onclick = function (ev) {
      if (ev) { ev.preventDefault(); ev.stopPropagation(); }
      api.stop();
    };
    liveEl.appendChild(captionEl);
    liveEl.appendChild(stopBtn);
    document.body.appendChild(liveEl);
  }

  function placeCursor(x, y) {
    ensureChrome();
    cursorPos = { x: x, y: y };
    cursorEl.style.left = x + 'px';
    cursorEl.style.top = y + 'px';
    cursorEl.setAttribute('data-on', '1');
  }

  function caption(text) {
    ensureChrome();
    if (text) captionEl.textContent = text;
    liveEl.setAttribute('data-on', '1');
    speak(text);
  }

  function hideChrome() {
    if (cursorEl) cursorEl.setAttribute('data-on', '0');
    if (liveEl) liveEl.setAttribute('data-on', '0');
    if (captionEl) captionEl.textContent = '';
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  }

  function speak(text) {
    try {
      if (!text || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
      if (navigator.webdriver) return;
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'fr-CA';
      u.rate = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function resolveTarget(target) {
    if (target == null) return null;
    if (typeof target === 'string') {
      if (target.charAt(0) === '#' || target.charAt(0) === '.' || target.charAt(0) === '[') {
        return document.querySelector(target);
      }
      return document.getElementById(target) || document.querySelector(target);
    }
    if (target.nodeType === 1) return target;
    return null;
  }

  function isPoint(target) {
    return !!target && typeof target === 'object' && target.nodeType !== 1 &&
      typeof target.x === 'number' && typeof target.y === 'number';
  }

  function pointOf(target) {
    if (isPoint(target)) return { x: target.x, y: target.y };
    var el = resolveTarget(target);
    if (!el || !el.getBoundingClientRect) return null;
    var r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return { x: r.left, y: r.top };
    return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 28) };
  }

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    if (el.hidden) return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    var cs;
    try { cs = getComputedStyle(el); } catch (e) { return false; }
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    var rects = el.getClientRects();
    return rects.length > 0 && rects[0].width > 0 && rects[0].height > 0;
  }

  function moveCursor(target, label) {
    var gen = generation;
    return new Promise(function (resolve) {
      ensureChrome();
      if (label) caption(label);
      var to = pointOf(target);
      if (!to) {
        resolve({ ok: false, reason: 'target-not-found', target: target });
        return;
      }
      var from = cursorPos || { x: Math.round(window.innerWidth / 2), y: 72 };
      var dur = reduceMotion ? 0 : pace.move;
      var t0 = performance.now();
      function frame(now) {
        if (gen !== generation) {
          resolve({ ok: false, stopped: true });
          return;
        }
        var u = dur ? Math.min(1, (now - t0) / dur) : 1;
        var e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        placeCursor(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e);
        if (u < 1) requestAnimationFrame(frame);
        else resolve({ ok: true, x: to.x, y: to.y });
      }
      requestAnimationFrame(frame);
    });
  }

  function pulse() {
    if (!cursorEl) return sleep(0);
    cursorEl.classList.add('pulse');
    return sleep(reduceMotion ? 0 : pace.pulse).then(function (still) {
      if (cursorEl) cursorEl.classList.remove('pulse');
      return still;
    });
  }

  function clickButton(selector, label) {
    var gen = generation;
    var el = resolveTarget(selector);
    if (!el) return Promise.resolve({ ok: false, reason: 'not-found', selector: selector });
    return moveCursor(el, label).then(function () {
      if (gen !== generation) return { ok: false, stopped: true };
      return pulse().then(function () {
        if (gen !== generation) return { ok: false, stopped: true };
        try { el.click(); } catch (err) {
          return { ok: false, error: String(err && err.message || err), selector: selector };
        }
        return { ok: true, selector: selector, pressed: el.getAttribute('aria-pressed') };
      });
    });
  }

  function openKnown(id, el) {
    var app = document.querySelector('.app');
    var fly = document.querySelector('#left > .panel:last-child');
    var gauss = id === 'gauss' || id === 'asel' || id === 'gk' || id === 'gtitle' || id === 'gClose' ||
      (fly && el && (el === fly || fly.contains(el)));
    if (gauss && app && !app.classList.contains('gOpen')) {
      var tile = document.querySelector('#rack .tile');
      if (tile) return tile;
    }
    if (app && app.classList.contains('noL') && (id === 'left' || id === 'rack' || (el && el.closest && el.closest('#left') && !gauss))) {
      return document.getElementById('tgL');
    }
    if (app && app.classList.contains('noR') && (id === 'right' || id === 'fiche' || (el && el.closest && el.closest('#right')))) {
      return document.getElementById('tgR');
    }
    if (el && (el.tagName === 'BUTTON' || el.getAttribute('role') === 'tab')) {
      var pressed = el.getAttribute('aria-pressed');
      var expanded = el.getAttribute('aria-expanded');
      if (pressed === 'false' || expanded === 'false' || el.hidden) return el;
    }
    return null;
  }

  function openWindow(selectorOrId, label) {
    var gen = generation;
    var el = resolveTarget(selectorOrId);
    var id = (el && el.id) || String(selectorOrId == null ? '' : selectorOrId).replace(/^#/, '');
    var opener = openKnown(id, el);
    var aim = opener || el || selectorOrId;
    return moveCursor(aim, label).then(function () {
      if (gen !== generation) return { ok: false, stopped: true };
      return pulse().then(function () {
        if (gen !== generation) return { ok: false, stopped: true };
        if (opener) {
          try { opener.click(); } catch (err) {
            return { ok: false, error: String(err && err.message || err), selector: selectorOrId };
          }
        } else if (el && el.hidden) {
          el.hidden = false;
        }
        var subject = el || opener;
        var visible = subject ? isVisible(subject) : false;
        if (!visible && id === 'gauss') {
          var canvas = document.getElementById('gauss');
          visible = !!(document.querySelector('.app') && document.querySelector('.app').classList.contains('gOpen') && canvas && isVisible(canvas));
          subject = canvas || subject;
        }
        if (!visible && (id === 'fiche' || id === 'right')) {
          var fiche = document.getElementById('fiche');
          visible = !!(fiche && isVisible(fiche));
          subject = fiche || subject;
        }
        return { ok: !!visible, visible: !!visible, selector: selectorOrId, id: subject && subject.id || id };
      });
    });
  }

  function writeControl(el, value) {
    var gen = generation;
    if (!el) return Promise.resolve({ ok: false, reason: 'not-found' });
    return moveCursor(el).then(function () {
      if (gen !== generation) return { ok: false, stopped: true };
      return pulse().then(function () {
        if (gen !== generation) return { ok: false, stopped: true };
        var before = 'value' in el ? String(el.value) : null;
        if (el.tagName === 'SELECT') {
          var want = String(value);
          var found = false;
          for (var i = 0; i < el.options.length; i++) {
            if (el.options[i].value === want || el.options[i].text === want) { found = true; break; }
          }
          if (!found && el.options.length) {
            return { ok: false, reason: 'option-not-found', selector: el.id, value: want };
          }
        }
        el.value = String(value);
        try {
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (err) {
          return { ok: false, error: String(err && err.message || err) };
        }
        return { ok: true, selector: el.id ? '#' + el.id : null, before: before, after: String(el.value) };
      });
    });
  }

  function selectAnalysis(selector, value, label) {
    var el = resolveTarget(selector);
    if (!el) return Promise.resolve({ ok: false, reason: 'not-found', selector: selector });
    if (label) caption(label);
    return writeControl(el, value);
  }

  function setThreshold(selector, value, label) {
    var el = resolveTarget(selector);
    if (!el) return Promise.resolve({ ok: false, reason: 'not-found', selector: selector });
    if (label) caption(label);
    return writeControl(el, value);
  }

  function controlRecord(el) {
    return {
      id: el.id,
      tag: el.tagName.toLowerCase(),
      type: el.type || null,
      value: 'value' in el ? String(el.value) : null,
      checked: el.type === 'checkbox' || el.type === 'radio' ? !!el.checked : null,
      pressed: el.getAttribute('aria-pressed'),
      expanded: el.getAttribute('aria-expanded'),
      disabled: !!el.disabled,
      hidden: !!el.hidden
    };
  }

  function panelLabel(el) {
    if (el.id) return el.id;
    var h = el.querySelector && el.querySelector('h2');
    return h ? String(h.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48) : (el.className || 'panel');
  }

  function snapshotState() {
    var controls = {};
    var nodes = document.querySelectorAll('input, select, textarea, button');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el.id || el.id.indexOf('bridget') === 0) continue;
      controls[el.id] = controlRecord(el);
    }
    var panels = [];
    var panelNodes = document.querySelectorAll('aside, .panel, #stage, #left, #right, #fiche');
    for (var p = 0; p < panelNodes.length; p++) {
      panels.push({ id: panelLabel(panelNodes[p]), visible: isVisible(panelNodes[p]) });
    }
    var telemetry = null;
    if (window.__C4LIVE) {
      try { telemetry = JSON.parse(JSON.stringify(window.__C4LIVE)); }
      catch (e) { telemetry = { present: true }; }
    }
    var meta = document.querySelector('meta[name="um-build"]');
    var sub = document.getElementById('sub');
    var zz = document.getElementById('zzNow');
    var app = document.querySelector('.app');
    return {
      hub: meta && meta.content || 'v21.03',
      version: meta && meta.content || null,
      engineRev: sub ? sub.textContent : null,
      page: location.pathname + location.hash,
      zz: zz ? zz.textContent : null,
      gOpen: !!(app && app.classList.contains('gOpen')),
      panels: panels,
      controls: controls,
      telemetry: telemetry
    };
  }

  function observeDiff(beforeState, afterState) {
    var changes = [];
    function walk(a, b, path) {
      if (a === b) return;
      var aObj = a !== null && typeof a === 'object';
      var bObj = b !== null && typeof b === 'object';
      if (!aObj || !bObj || Array.isArray(a) || Array.isArray(b)) {
        if (JSON.stringify(a) === JSON.stringify(b)) return;
        changes.push({ path: path, before: a === undefined ? null : a, after: b === undefined ? null : b });
        return;
      }
      var keys = Object.keys(a);
      Object.keys(b).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); });
      keys.forEach(function (k) {
        walk(a[k], b[k], path ? path + '.' + k : k);
      });
    }
    walk(beforeState || {}, afterState || {}, '');
    return {
      changed: changes.length > 0,
      count: changes.length,
      paths: changes.map(function (c) { return c.path; }),
      changes: changes,
      summary: changes.length ? changes.slice(0, 12).map(function (c) { return c.path; }).join(', ') : 'aucun changement observé'
    };
  }

  function stepAction(step) {
    if (!step) return Promise.resolve({ ok: false, reason: 'empty-step' });
    if (typeof step === 'function') return Promise.resolve(step());
    var action = step.action || step.op || step.type;
    var label = step.label || step.caption || '';
    if (action === 'moveCursor') return moveCursor(step.target || step.selector, label);
    if (action === 'clickButton') return clickButton(step.selector || step.target, label);
    if (action === 'openWindow') return openWindow(step.selector || step.target || step.id, label);
    if (action === 'selectAnalysis') return selectAnalysis(step.selector, step.value, label);
    if (action === 'setThreshold') return setThreshold(step.selector, step.value, label);
    if (action === 'snapshot' || action === 'snapshotState') return Promise.resolve(snapshotState());
    if (action === 'wait') return sleep(step.ms == null ? pace.step : step.ms).then(function (still) {
      return { ok: still, stopped: !still };
    });
    return Promise.resolve({ ok: false, reason: 'unknown-action', action: action });
  }

  function runSequence(steps) {
    var gen = ++generation;
    var list = Array.isArray(steps) ? steps : [];
    var log = [];
    running = true;
    ensureChrome();
    caption('Démonstration Brigitte');
    var chain = Promise.resolve();
    list.forEach(function (step) {
      chain = chain.then(function (prev) {
        if (prev && prev.stopped) return prev;
        if (gen !== generation) return { stopped: true, log: log };
        return Promise.resolve().then(function () { return stepAction(step); }).then(function (result) {
          log.push({
            action: step && (step.action || step.op || step.type) || 'step',
            label: step && (step.label || step.caption) || '',
            result: result
          });
          if (gen !== generation || (result && result.stopped)) return { stopped: true, log: log };
          return sleep(pace.step).then(function (still) {
            return still ? null : { stopped: true, log: log };
          });
        }, function (err) {
          log.push({ action: 'error', result: { ok: false, error: String(err && err.message || err) } });
          return null;
        });
      });
    });
    return chain.then(function (end) {
      var stopped = !!(end && end.stopped) || gen !== generation;
      if (gen === generation) {
        running = false;
        hideChrome();
        var btn = document.getElementById('bridgetDemo');
        if (btn) btn.setAttribute('aria-pressed', 'false');
      }
      return { stopped: stopped, log: log };
    });
  }

  function stop() {
    generation++;
    running = false;
    clearSleeps();
    hideChrome();
    var btn = document.getElementById('bridgetDemo');
    if (btn) btn.setAttribute('aria-pressed', 'false');
    return { stopped: true };
  }

  function runSampleDemo() {
    var before = snapshotState();
    var vol = document.getElementById('vol');
    var dur = document.getElementById('dur');
    var free = document.getElementById('mFree');
    var fourier = document.getElementById('mFourier');
    var volNext = vol && Number(vol.value) > 40 ? 0 : 80;
    var durNext = dur && dur.value === '30' ? '10' : '30';
    var modeSel = (free && free.getAttribute('aria-pressed') === 'true' && fourier && !fourier.disabled) ? '#mFourier' : '#mFree';
    var modeName = modeSel === '#mFourier' ? 'Fourier' : 'Libre';
    return runSequence([
      { action: 'clickButton', selector: modeSel, label: 'Brigitte clique le mode ' + modeName + '.' },
      { action: 'setThreshold', selector: '#vol', value: volNext, label: 'Brigitte règle le volume de l’environnement.' },
      { action: 'selectAnalysis', selector: '#dur', value: durNext, label: 'Brigitte choisit la durée de la vue T₀ → T₁.' },
      { action: 'openWindow', selector: '#gauss', label: 'Brigitte ouvre la fenêtre d’analyse.' }
    ]).then(function (seq) {
      var after = snapshotState();
      var diff = observeDiff(before, after);
      var out = {
        ok: !seq.stopped && diff.changed,
        stopped: seq.stopped,
        before: before,
        after: after,
        diff: diff,
        log: seq.log
      };
      api.last = out;
      try {
        console.log('[BridgetDemo] observed diff', {
          changed: diff.changed,
          count: diff.count,
          summary: diff.summary,
          paths: diff.paths.slice(0, 24)
        });
      } catch (e) {}
      return out;
    });
  }

  function mountTrigger() {
    var btn = document.getElementById('bridgetDemo');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'bridgetDemo';
      btn.type = 'button';
      btn.textContent = 'Démo Brigitte';
      btn.title = 'Démonstration guidée : Brigitte agit dans le moteur, pas à pas';
      var host = document.querySelector('.readouts') || document.querySelector('header') || document.body;
      host.appendChild(btn);
    }
    btn.onclick = function (ev) {
      if (ev) { ev.preventDefault(); ev.stopPropagation(); }
      if (running) { api.stop(); return; }
      stop();
      var token = ++runToken;
      running = true;
      btn.setAttribute('aria-pressed', 'true');
      runSampleDemo().then(function () {
        if (token === runToken) {
          running = false;
          btn.setAttribute('aria-pressed', 'false');
        }
      }, function () {
        if (token === runToken) {
          running = false;
          btn.setAttribute('aria-pressed', 'false');
        }
      });
    };
  }

  var api = {
    version: 'v21.03',
    family: 'Miriamphobots',
    moveCursor: moveCursor,
    clickButton: clickButton,
    openWindow: openWindow,
    selectAnalysis: selectAnalysis,
    setThreshold: setThreshold,
    snapshotState: snapshotState,
    observeDiff: observeDiff,
    runSequence: runSequence,
    stop: stop,
    runSampleDemo: runSampleDemo,
    setPace: function (partial) {
      if (partial) {
        if (partial.move != null) pace.move = partial.move;
        if (partial.pulse != null) pace.pulse = partial.pulse;
        if (partial.step != null) pace.step = partial.step;
      }
      return { move: pace.move, pulse: pace.pulse, step: pace.step };
    }
  };

  window.BridgetDemo = api;
  window.BrigitteDemo = api;

  if (document.body) mountTrigger();
  else setTimeout(mountTrigger, 0);
})();
