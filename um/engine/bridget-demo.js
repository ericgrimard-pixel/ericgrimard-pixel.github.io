/* Brigitte — single entry, Guide & Host, Hub v21.06 (Miriamphobots).
   Loaded by um/index.html and um/engine/manifestation-engine.html.
   Does not modify the Manifestation Engine. Listeners that must survive a
   system switch pass their own AbortSignal, because the engine ties every
   other listener to the current boot.
   #/world, ?host=bridget, ?from=world, or a .world arrival opens this same entry.
   Motto: One seed, infinite roots, perpetual harvest.
   v21.06 : les questions passent par Bridget.createEngine (um/bridget/bridget-hub.js)
   et l'index du panneau de gauche. La voix, le salut et la couche d'action de v21.05
   restent. escalate reste éteint. Aucun appel hors du site. */
(function () {
  if (window.BridgetDemo && window.BridgetDemo.version === 'v21.07') return;

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
  var captionHook = null;
  var skipCaptionHook = false;
  var hitEl = null;
  var life = new AbortController();

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
      '#bridget-stop{pointer-events:auto;font:700 1.05rem/1 system-ui,sans-serif;color:#05080d;background:#e8c872;border:2px solid #fff;border-radius:8px;min-height:48px;padding:8px 14px;cursor:pointer}',
      '#bridget-open{flex:0 0 auto;align-self:center;font:700 1.5rem/1.15 system-ui,sans-serif !important;min-height:56px;padding:12px 22px !important;color:#05080d !important;background:#e8c872 !important;border:3px solid #fff !important;border-radius:12px !important;letter-spacing:.01em;z-index:90}',
      '#bridget-panel{position:fixed;z-index:76;right:max(8px,env(safe-area-inset-right));width:min(440px,calc(100vw - 16px));max-height:min(58vh,560px);display:flex;flex-direction:column;background:#05080d;color:#fff;border:3px solid #e8c872;border-radius:14px;box-shadow:0 16px 40px rgba(0,0,0,.5);font:600 1.15rem/1.45 system-ui,sans-serif}',
      '#bridget-panel[hidden]{display:none !important}',
      '#bridget-log{flex:1 1 auto;overflow:auto;padding:12px 14px;min-height:7.5rem}',
      '#bridget-log p{margin:0 0 8px}',
      '#bridget-log .me{color:#a6dcff}',
      '#bridget-chips,#bridget-choice{display:flex;flex-wrap:wrap;gap:8px;padding:0 12px 8px}',
      '#bridget-chips button,#bridget-choice button,#bridget-form button,#bridget-halt{font:700 1.05rem/1.2 system-ui,sans-serif;min-height:48px;padding:8px 12px;color:#05080d;background:#e8c872;border:2px solid #fff;border-radius:10px;cursor:pointer}',
      '#bridget-form{display:flex;gap:8px;padding:0 12px 8px}',
      '#bridget-input{flex:1 1 auto;min-width:0;min-height:48px;font:600 1.15rem/1.3 system-ui,sans-serif;color:#05080d;background:#fff;border:2px solid #e8c872;border-radius:10px;padding:8px 10px}',
      '#bridget-ver{margin:0;padding:0 14px 12px;font:600 .8rem/1.3 ui-monospace,monospace;color:#8b98ad}',
      '#bridget-ver[data-state="update"]{color:#ffcf8a}',
      '#bridget-ver[data-state="error"]{color:#ffb4a6}',
      '#bridget-refresh{margin:0 14px 10px;align-self:flex-start;font:600 .85rem/1.2 ui-monospace,monospace;min-height:36px;padding:4px 8px;color:#05080d;background:#8b98ad;border:0;border-radius:8px;cursor:pointer}',
      '#bridget-refresh[hidden]{display:none !important}',
      '.bridget-hit{outline:4px solid #e8c872 !important;outline-offset:3px;box-shadow:0 0 0 6px #05080d}',
      '@media (max-width:600px){#bridget-open{font-size:1.35rem !important;min-height:52px;padding:10px 16px !important}#bridget-panel{left:max(8px,env(safe-area-inset-left));width:auto;max-height:min(52vh,520px)}}',
      '@media (prefers-reduced-motion:reduce){#bridget-cursor.pulse{animation:none}.bridget-hit{transition:none}}',
      '@media (forced-colors:active){#bridget-open,#bridget-panel{border:3px solid ButtonText}#bridget-panel{background:Canvas;color:CanvasText}}'
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

  function highlight(el) {
    if (hitEl && hitEl.classList) hitEl.classList.remove('bridget-hit');
    hitEl = (el && el.classList) ? el : null;
    if (!hitEl) return;
    hitEl.classList.add('bridget-hit');
    var inPanel = hitEl.closest && hitEl.closest('#bridget-panel');
    if (inPanel) return;
    try {
      hitEl.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    } catch (e) {}
  }

  function caption(text) {
    ensureChrome();
    if (text) captionEl.textContent = text;
    liveEl.setAttribute('data-on', '1');
    speak(text);
    if (!skipCaptionHook && captionHook && text) captionHook(text);
  }

  function listen(target, type, fn, capture) {
    target.addEventListener(type, fn, { capture: !!capture, signal: life.signal });
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
      var aimed = resolveTarget(target);
      if (aimed) highlight(aimed);
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
      hub: meta && meta.content || 'v21.07',
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
    if (action === 'fn' && typeof step.run === 'function') {
      if (label) caption(label);
      return Promise.resolve(step.run());
    }
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
    if (!(list[0] && (list[0].label || list[0].caption))) caption('Je m’en occupe.');
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
        var btn = document.getElementById('bridget-open');
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
    var btn = document.getElementById('bridget-open');
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

  var api = {
    version: 'v21.07',
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

  api.motto = 'One seed, infinite roots, perpetual harvest.';
  window.BridgetDemo = api;
  window.BrigitteDemo = api;

  var hostActive = false;
  var manifestStamp = '';
  var manifestEtag = '';
  var manifestTimer = 0;
  var greeted = false;
  var mode = 'do';
  var docEngine = null;
  var panelEl = null;
  var logEl = null;
  var choiceEl = null;
  var inputEl = null;
  var verEl = null;
  var refreshEl = null;
  var lastExplain = '';
  var lastTarget = null;
  var kb = {
    rules: null,
    manifest: null,
    passages: [],
    motto: api.motto,
    family: 'Miriamphobots',
    hub_version: 'v21.07',
    lineage: 'v20.99 -> v21.00 -> v21.01 -> v21.02 -> v21.03 -> v21.04 -> v21.05 -> v21.06 -> v21.07'
  };
  var GREETING = 'Je suis Brigitte.';
  var CLEAR_Q = "Est-ce que c'est clair pour toi ?";
  var STOPWORDS = ['le','la','les','un','une','des','du','de','au','aux','et','ou','a','en','dans','sur','pour','par','que','qui','quoi','est','ce','je','tu','me','te','mon','ma','ton','ta','avec','sans','plus','tout','tous','cette','cet','cela','dans','moi','toi'];

  function blankParams(s) {
    return new URLSearchParams(s && s.charAt(0) === '?' ? s.slice(1) : (s || ''));
  }

  function normalizeHostUrl() {
    try {
      var hash = location.hash || '';
      var q = hash.indexOf('?');
      var hashPath = q >= 0 ? hash.slice(0, q) : hash;
      var hp = blankParams(q >= 0 ? hash.slice(q + 1) : '');
      var sp = blankParams(location.search);
      var changed = q >= 0;
      hp.forEach(function (v, k) {
        if (!sp.has(k)) { sp.set(k, v); changed = true; }
      });
      var onWorld = hashPath === '#/world' || hashPath === '#world';
      var inEngine = /\/engine\//.test(location.pathname || '');
      var ref = '';
      try { ref = document.referrer || ''; } catch (e) { ref = ''; }
      var refHit = /(?:^|[?#&])host=bridget|(?:^|[?#&])from=world|#\/world|\.world(?:$|[?#])/.test(ref);
      var stored = false;
      try { stored = sessionStorage.getItem('um-bridget-host') === '1'; } catch (e2) {}
      var activate = onWorld || sp.get('host') === 'bridget' || sp.get('from') === 'world' || sp.get('demo') === 'ready' || refHit || (!inEngine && stored);
      if (activate && sp.get('host') !== 'bridget') { sp.set('host', 'bridget'); changed = true; }
      if (activate) { try { sessionStorage.setItem('um-bridget-host', '1'); } catch (e3) {} }
      if (changed) {
        var next = location.pathname + (sp.toString() ? '?' + sp.toString() : '') + hashPath;
        if (next !== location.pathname + location.search + location.hash) history.replaceState(history.state, '', next);
      }
      hostActive = activate || hostWanted();
      return activate;
    } catch (err) {
      return false;
    }
  }

  function hostWanted() {
    var hash = location.hash || '';
    var q = hash.indexOf('?');
    var hashPath = q >= 0 ? hash.slice(0, q) : hash;
    var sp = blankParams(location.search);
    if (hashPath === '#/world' || hashPath === '#world') return true;
    if (sp.get('host') === 'bridget' || sp.get('from') === 'world' || sp.get('demo') === 'ready') return true;
    if (/\/engine\//.test(location.pathname || '')) return false;
    try { if (sessionStorage.getItem('um-bridget-host') === '1') return true; } catch (e) {}
    return false;
  }

  function assetPaths() {
    var path = location.pathname || '';
    if (/\/engine\//.test(path)) {
      return { manifest: 'bridget-manifest.json', rules: 'rules.json', engine: 'manifestation-engine.html?host=bridget', portal: '../bridget/' };
    }
    if (/\/bridget\//.test(path)) {
      return { manifest: '../engine/bridget-manifest.json', rules: '../engine/rules.json', engine: '../engine/manifestation-engine.html?host=bridget', portal: './' };
    }
    return { manifest: 'engine/bridget-manifest.json', rules: 'engine/rules.json', engine: 'engine/manifestation-engine.html?host=bridget', portal: 'bridget/' };
  }

  function sha256Hex(buf) {
    if (!window.crypto || !crypto.subtle) return Promise.resolve('');
    return crypto.subtle.digest('SHA-256', buf).then(function (hash) {
      var bytes = new Uint8Array(hash);
      var hex = '';
      for (var i = 0; i < bytes.length; i++) hex += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
      return hex;
    }, function () { return ''; });
  }

  function pageVersion() {
    var meta = document.querySelector('meta[name="um-build"]');
    return (meta && meta.content) || api.version;
  }

  function rememberHost() {
    try { sessionStorage.setItem('um-bridget-host', '1'); } catch (e) {}
  }

  function preserveLinks() {
    listen(document, 'click', function (ev) {
      var node = ev.target;
      if (!node || !node.closest) return;
      var a = node.closest('a[href]');
      if (!a) return;
      var raw = a.getAttribute('href') || '';
      if (!raw || raw.indexOf('mailto:') === 0 || raw.indexOf('javascript:') === 0) return;
      var worldLink = a.classList.contains('world') || /#\/world|[?&]host=bridget|[?&]from=world|\.world(?:$|[?#])/.test(raw);
      if (!hostActive && !worldLink) return;
      if (raw.charAt(0) === '#') {
        var hq = raw.indexOf('?');
        if (hq < 0) return;
        var hashPath = raw.slice(0, hq) || '#/world';
        if (hashPath === '#world') hashPath = '#/world';
        var hp = blankParams(raw.slice(hq + 1));
        var sp = blankParams(location.search);
        hp.forEach(function (v, k) { if (!sp.has(k)) sp.set(k, v); });
        if (!sp.get('host')) sp.set('host', 'bridget');
        rememberHost();
        var search = sp.toString();
        var sameSearch = ('?' + search) === location.search;
        a.href = sameSearch ? hashPath : ('?' + search + hashPath);
        return;
      }
      var url;
      try { url = new URL(raw, location.href); } catch (e) { return; }
      if (url.origin !== location.origin) return;
      var hash = url.hash || '';
      var uq = hash.indexOf('?');
      var hashPath2 = uq >= 0 ? hash.slice(0, uq) : hash;
      if (uq >= 0) {
        blankParams(hash.slice(uq + 1)).forEach(function (v, k) {
          if (!url.searchParams.has(k)) url.searchParams.set(k, v);
        });
      }
      if (worldLink && (hashPath2 === '#/world' || hashPath2 === '#world' || !hashPath2)) hashPath2 = '#/world';
      url.hash = hashPath2;
      if (!url.searchParams.get('host')) url.searchParams.set('host', 'bridget');
      rememberHost();
      var next = url.pathname + url.search + url.hash;
      if (a.href !== url.href) a.href = next;
    }, true);
  }

  function fold(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, ' and ')
      .replace(/['’]/g, ' ')
      .replace(/[^a-z0-9+.%]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function stripLead(q) {
    var out = fold(q);
    var guard = 0;
    while (guard < 4) {
      var next = out.replace(/^(le|la|les|un|une|du|des|au|aux|mon|ma|ce|cet|cette|l)\s+/, '');
      if (next === out) break;
      out = next;
      guard++;
    }
    return out;
  }

  function pushLine(who, text) {
    if (!logEl || !text) return;
    var last = logEl.lastElementChild;
    if (last && last.getAttribute('data-who') === who && last.textContent === text) return;
    var p = document.createElement('p');
    p.className = who === 'me' ? 'me' : 'she';
    p.setAttribute('data-who', who);
    p.textContent = text;
    logEl.appendChild(p);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function say(text) {
    if (!text) return;
    skipCaptionHook = true;
    caption(text);
    skipCaptionHook = false;
    pushLine('she', text);
  }

  captionHook = function (text) { pushLine('she', text); };

  function hideChoice() {
    if (!choiceEl) return;
    choiceEl.textContent = '';
  }

  function showChoice(items) {
    if (!choiceEl) return;
    choiceEl.textContent = '';
    items.forEach(function (item) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = item.label;
      if (item.id) b.id = item.id;
      b.onclick = function (ev) {
        if (ev) { ev.preventDefault(); ev.stopPropagation(); }
        hideChoice();
        item.run();
      };
      choiceEl.appendChild(b);
    });
  }

  function finishClear() {
    hideChoice();
  }

  function onYes() {
    hideChoice();
    say('Parfait. Je reste là.');
    return { ok: true, executed: false };
  }

  function onReexplain() {
    hideChoice();
    var text = lastExplain
      ? ('Je le redis simplement. ' + lastExplain)
      : 'Je n’ai pas encore de geste à redire. Demande-moi quelque chose, ou dis « aide ».';
    var target = lastTarget;
    if (target) {
      return perform([
        { action: 'moveCursor', target: target, label: text }
      ], snapshotState(), { quietDiff: true }).then(function () { return { ok: true, executed: true }; });
    }
    say(text);
    return Promise.resolve({ ok: true, executed: true });
  }

  function placePanel() {
    if (!panelEl || panelEl.hidden) return;
    var btn = document.getElementById('bridget-open');
    var top = 8;
    if (btn && btn.getBoundingClientRect) {
      var r = btn.getBoundingClientRect();
      top = Math.max(8, Math.round(r.bottom + 6));
    }
    panelEl.style.top = top + 'px';
    var room = window.innerHeight - top - 12;
    var cap = Math.round(window.innerHeight * (window.innerWidth < 700 ? 0.52 : 0.58));
    panelEl.style.maxHeight = Math.max(220, Math.min(room, cap)) + 'px';
  }

  function openPanel() {
    ensurePanel();
    panelEl.hidden = false;
    var btn = document.getElementById('bridget-open');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    placePanel();
  }

  function listenNow() {
    openPanel();
    if (!greeted) { greeted = true; say(GREETING); }
    if (inputEl) {
      try { inputEl.focus(); } catch (e) {}
    }
    var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    startMic(Rec);
  }

  function closePanel() {
    if (!panelEl) return;
    panelEl.hidden = true;
    var btn = document.getElementById('bridget-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function ensurePanel() {
    if (panelEl) return;
    ensureChrome();
    var btn = document.getElementById('bridget-open');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'bridget-open';
      btn.type = 'button';
      btn.textContent = 'Brigitte';
      var header = document.querySelector('header') || document.body;
      header.insertBefore(btn, header.firstChild);
    }
    btn.setAttribute('data-bridget-entry', '1');
    btn.setAttribute('aria-controls', 'bridget-panel');
    if (!btn.getAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
    btn.onclick = function (ev) {
      if (ev) { ev.preventDefault(); ev.stopPropagation(); }
      listenNow();
    };

    panelEl = document.createElement('section');
    panelEl.id = 'bridget-panel';
    panelEl.hidden = true;
    panelEl.setAttribute('role', 'dialog');
    panelEl.setAttribute('aria-label', 'Conversation');

    var bar = document.createElement('div');
    bar.style.cssText = 'display:flex;justify-content:flex-end;padding:8px 8px 0';
    var halt = document.createElement('button');
    halt.id = 'bridget-halt';
    halt.type = 'button';
    halt.textContent = 'Stop';
    halt.setAttribute('aria-label', 'Arrêter');
    halt.onclick = function (ev) {
      if (ev) { ev.preventDefault(); ev.stopPropagation(); }
      api.stop();
      say('Je m’arrête.');
    };
    bar.appendChild(halt);

    logEl = document.createElement('div');
    logEl.id = 'bridget-log';
    logEl.setAttribute('role', 'log');
    logEl.setAttribute('aria-live', 'polite');

    choiceEl = document.createElement('div');
    choiceEl.id = 'bridget-choice';
    choiceEl.hidden = true;

    var form = document.createElement('form');
    form.id = 'bridget-form';
    inputEl = document.createElement('input');
    inputEl.id = 'bridget-input';
    inputEl.type = 'text';
    inputEl.setAttribute('aria-label', 'Ta demande');
    inputEl.placeholder = 'j’ai besoin de …';
    inputEl.autocomplete = 'off';
    var mic = document.createElement('button');
    mic.id = 'bridget-mic';
    mic.type = 'button';
    mic.textContent = 'Micro';
    var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) {
      mic.disabled = true;
      mic.title = 'Le micro n’est pas disponible ici. Écris ta demande.';
    }
    mic.onclick = function (ev) {
      if (ev) { ev.preventDefault(); ev.stopPropagation(); }
      startMic(Rec);
    };
    var send = document.createElement('button');
    send.id = 'bridget-send';
    send.type = 'submit';
    send.textContent = 'Envoyer';
    form.appendChild(inputEl);
    form.appendChild(mic);
    form.appendChild(send);
    form.onsubmit = function (ev) {
      if (ev) ev.preventDefault();
      var value = inputEl.value;
      inputEl.value = '';
      ask(value);
    };

    verEl = document.createElement('p');
    verEl.id = 'bridget-ver';
    verEl.setAttribute('role', 'status');
    verEl.setAttribute('data-state', 'check');
    verEl.textContent = pageVersion() + ' · vérification · ETag / SHA-256';
    refreshEl = document.createElement('button');
    refreshEl.id = 'bridget-refresh';
    refreshEl.type = 'button';
    refreshEl.hidden = true;
    refreshEl.textContent = 'Actualiser';
    refreshEl.onclick = function () { location.reload(); };

    panelEl.appendChild(bar);
    panelEl.appendChild(logEl);
    panelEl.appendChild(choiceEl);
    panelEl.appendChild(form);
    panelEl.appendChild(refreshEl);
    panelEl.appendChild(verEl);
    document.body.appendChild(panelEl);
  }

  function startMic(Rec) {
    if (!Rec) {
      say('Le micro n’est pas disponible ici. Écris ta demande.');
      return;
    }
    var rec;
    try { rec = new Rec(); } catch (e) {
      say('Le micro ne démarre pas. Écris ta demande.');
      return;
    }
    rec.lang = 'fr-CA';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = function (ev) {
      var said = '';
      try { said = ev.results[0][0].transcript || ''; } catch (e2) { said = ''; }
      if (inputEl && said) inputEl.value = said;
      if (said) ask(said);
    };
    rec.onerror = function () { say('Je n’ai pas entendu. Tu peux écrire ta demande.'); };
    try {
      rec.start();
      say('Je t’écoute.');
    } catch (err) {
      say('Le micro ne démarre pas. Écris ta demande.');
    }
  }

  function listSystems() {
    var map = {};
    var sel = document.getElementById('sys');
    if (sel && sel.options) {
      for (var i = 0; i < sel.options.length; i++) {
        var o = sel.options[i];
        if (!o.value || o.disabled) continue;
        map[o.value] = { id: o.value, name: (o.textContent || o.value).replace(/\s+/g, ' ').trim() };
      }
    }
    if (window.LIB && window.LIB.forEach) {
      window.LIB.forEach(function (s) {
        if (!s || !s.id || !s.data) return;
        if (!map[s.id]) map[s.id] = { id: s.id, name: s.name || s.id };
      });
    }
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  function aliasesFor(id, name) {
    var list = [];
    var known = {
      djia: ['djia', 'dow', 'dow jones', 'dow jones industrial', 'dow jones industrial average'],
      sp500: ['sp500', 'sp 500', 's and p 500', 's and p', 'standard and poor', 'standard and poors'],
      sp500y: ['sp500y', 's and p 500 annee', 's and p 500 annee complete'],
      ndx100: ['ndx100', 'nasdaq', 'nasdaq 100', 'nasdaq100'],
      n225: ['n225', 'nikkei', 'nikkei 225'],
      hsi: ['hsi', 'hang seng'],
      ftse100: ['ftse', 'ftse 100', 'ftse100'],
      dax: ['dax', 'dax 40'],
      cac40: ['cac', 'cac 40', 'cac40'],
      sx5e: ['euro stoxx', 'eurostoxx', 'sx5e', 'stoxx 50'],
      world: ['world', 'monde', 'accueil du hub'],
      'sante-villes': ['villes du monde', 'les villes du monde', 'sante villes', 'wup 2025', 'wup'],
      'sante-provinces': ['provinces du canada', 'les provinces du canada', 'provinces canada', 'esperance de vie', 'statcan']
    };
    (known[id] || []).forEach(function (a) { list.push(a); });
    var fname = fold(name);
    if (fname) list.push(fname);
    var fid = fold(id);
    if (fid) list.push(fid);
    return list;
  }

  function matchSystem(phrase) {
    var q = stripLead(phrase);
    if (!q) return null;
    var best = null;
    var bestScore = 0;
    listSystems().forEach(function (sys) {
      var score = 0;
      aliasesFor(sys.id, sys.name).forEach(function (alias) {
        if (!alias) return;
        if (q === alias) score = Math.max(score, 100 + Math.min(alias.length, 40));
        else if (alias.length >= 4 && q.indexOf(alias) >= 0) score = Math.max(score, 76 + Math.min(alias.length, 24));
        else if (alias.length >= 4 && alias.indexOf(q) >= 0 && q.length >= 4) score = Math.max(score, 72 + Math.min(q.length, 20) - Math.min(alias.length - q.length, 15));
      });
      if (score > bestScore) { bestScore = score; best = sys; }
    });
    if (!best || bestScore < 72) return null;
    return best;
  }

  function skipEl(el) {
    if (!el || !el.closest) return true;
    return !!el.closest('#bridget-panel, #bridget-live, #bridget-cursor, #bridget-open');
  }

  function labelOf(el) {
    if (!el) return '';
    var aria = el.getAttribute && el.getAttribute('aria-label');
    var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    var title = el.getAttribute && el.getAttribute('title');
    return (aria || text || title || el.id || '').replace(/\s+/g, ' ').trim().slice(0, 140);
  }

  function scoreText(q, label) {
    var L = fold(label);
    if (!q || !L) return 0;
    if (L === q) return 100;
    if (L.indexOf(q) >= 0) return 68 + Math.min(q.length, 24);
    var tokens = q.split(' ').filter(function (t) { return t && STOPWORDS.indexOf(t) < 0; });
    if (!tokens.length) tokens = q.split(' ').filter(Boolean);
    var hit = 0;
    tokens.forEach(function (t) { if (t.length > 1 && L.indexOf(t) >= 0) hit++; });
    if (!hit) return 0;
    return 18 + hit * 16;
  }

  function bestTarget(phrase) {
    var q = stripLead(phrase);
    if (!q) return null;
    var best = null;
    var aliases = [
      { id: 'volNum', rank: 8, text: 'seuil facteur de volume' },
      { id: 'vol', rank: 5, text: 'seuil curseur volume environnement' },
      { id: 'resetCut', rank: 3, text: 'seuil bornes 20 40 60 80' },
      { id: 'gauss', rank: 4, text: 'fenetre gaussienne analyse' },
      { id: 'play', rank: 4, text: 'lecture pause joue' },
      { id: 'tgL', rank: 2, text: 'attributs panneau gauche' },
      { id: 'tgR', rank: 2, text: 'fiche panneau droit' },
      { id: 'tgV', rank: 2, text: 'vue pleine' },
      { id: 'km', rank: 3, text: 'kobayashi maru' },
      { id: 'ghost', rank: 3, text: 'fantome' },
      { id: 'sys', rank: 2, text: 'systeme classe 4 selecteur' },
      { id: 'mFourier', rank: 2, text: 'mode fourier' },
      { id: 'mFree', rank: 2, text: 'mode libre' }
    ];
    aliases.forEach(function (a) {
      var el = document.getElementById(a.id);
      if (!el) return;
      var score = scoreText(q, a.text) + a.rank;
      if (!best || score > best.score) best = { el: el, label: labelOf(el) || a.text, score: score };
    });
    var nodes = document.querySelectorAll('button, a, label, summary, h1, h2, h3, option, [aria-label], input, select');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (skipEl(el)) continue;
      var label = labelOf(el);
      var score = scoreText(q, label);
      if (el.tagName === 'OPTION' && el.parentElement) {
        var parentScore = score;
        if (parentScore > 0 && (!best || parentScore > best.score)) {
          best = { el: el.parentElement, label: label, score: parentScore };
        }
        continue;
      }
      if (score > 0 && (!best || score > best.score)) best = { el: el, label: label, score: score };
    }
    if (!best || best.score < 24) return null;
    return best;
  }

  function reveal(el) {
    if (!el || !el.closest) return;
    var app = document.querySelector('.app');
    if (el.closest('#left') && app && app.classList.contains('noL')) {
      var left = document.getElementById('tgL');
      if (left) left.click();
    }
    if (el.closest('#right') && app && app.classList.contains('noR')) {
      var right = document.getElementById('tgR');
      if (right) right.click();
    }
    var fly = document.querySelector('#left > .panel:last-child');
    if (fly && fly.contains(el) && app && !app.classList.contains('gOpen')) {
      var tile = document.querySelector('#rack .tile');
      if (tile) tile.click();
    }
  }

  function actionDiff(diff) {
    if (!diff) return diff;
    var changes = (diff.changes || []).filter(function (c) {
      var p = c.path || '';
      if (p === 'zz' || p.indexOf('telemetry.') === 0 || p === 'telemetry') return false;
      if (p === 'controls.scrub.value' || p === 'controls.date.value') return false;
      return true;
    });
    return {
      changed: changes.length > 0,
      count: changes.length,
      paths: changes.map(function (c) { return c.path; }),
      changes: changes,
      summary: changes.length ? changes.slice(0, 12).map(function (c) { return c.path; }).join(', ') : 'aucun changement observé'
    };
  }

  function narrateDiff(diff, before, after) {
    if (!diff || !diff.changed) return 'Rien n’a bougé.';
    function ctl(state, id, field) {
      var c = state && state.controls && state.controls[id];
      return c ? c[field] : null;
    }
    var bits = [];
    var bSys = ctl(before, 'sys', 'value');
    var aSys = ctl(after, 'sys', 'value');
    if (bSys !== aSys) bits.push('le système affiché est maintenant ' + (aSys || 'un autre'));
    var bVol = ctl(before, 'volNum', 'value');
    var aVol = ctl(after, 'volNum', 'value');
    if (bVol !== aVol) bits.push('le seuil (facteur de volume) est passé de ' + bVol + ' à ' + aVol);
    var bSlider = ctl(before, 'vol', 'value');
    var aSlider = ctl(after, 'vol', 'value');
    if (bSlider !== aSlider && bVol === aVol) bits.push('le curseur de volume est passé de ' + bSlider + ' à ' + aSlider);
    if (before && after && before.gOpen !== after.gOpen) bits.push(after.gOpen ? 'la fenêtre gaussienne est ouverte' : 'la fenêtre gaussienne est fermée');
    var bDur = ctl(before, 'dur', 'value');
    var aDur = ctl(after, 'dur', 'value');
    if (bDur !== aDur) bits.push('la durée est passée de ' + bDur + ' s à ' + aDur + ' s');
    if (!bits.length) bits.push(diff.count + (diff.count > 1 ? ' détails ont bougé' : ' détail a bougé'));
    return 'Avant / après : ' + bits.join(' ; ') + '.';
  }

  function perform(steps, before, opts) {
    before = before || snapshotState();
    return runSequence(steps).then(function (seq) {
      if (seq.stopped) return { ok: false, stopped: true, executed: false };
      var failed = (seq.log || []).some(function (step) { return step.result && step.result.ok === false && step.result.stopped !== true; });
      var after = snapshotState();
      var diff = actionDiff(observeDiff(before, after));
      var line = narrateDiff(diff, before, after);
      var said = (seq.log || []).map(function (step) { return step.label; }).filter(Boolean).join(' ');
      lastExplain = (said ? said + ' ' : '') + line;
      if (!(opts && opts.quietDiff)) say(failed ? ('Je n’ai pas pu finir ce geste. ' + line) : line);
      return { ok: !failed, executed: true, diff: diff, stopped: false };
    });
  }

  function helpText() {
    return 'Je peux t’aider ici, sans quitter le moteur. Dis-moi par exemple : « ouvre la fenêtre gaussienne », « ferme la fiche », « clique Kobayashi », « décoche Fantôme », « montre-moi le DJIA » (ou un autre système de la liste), « trouve le seuil », « mets le seuil à 1,5 », « joue », « pause », « cache les panneaux », « qu’est-ce que je vois ? », « guide-moi », « aide ». Les quatre puces choisissent le mode : une question, un guide, un geste, ou une recherche. Stop ou Échap m’arrête.';
  }

  function viewText() {
    var sys = document.getElementById('sys');
    var name = sys && sys.selectedOptions && sys.selectedOptions[0] ? sys.selectedOptions[0].textContent.replace(/\s+/g, ' ').trim() : 'le système courant';
    var zz = document.getElementById('zzNow');
    var app = document.querySelector('.app');
    var play = document.getElementById('play');
    var fourier = document.getElementById('mFourier');
    var parts = [];
    parts.push('Tu regardes ' + name + '.');
    parts.push('Z-ZERO est ' + ((zz && zz.textContent) || 'pas encore affiché') + '.');
    parts.push(app && app.classList.contains('gOpen') ? 'La fenêtre gaussienne est ouverte.' : 'La fenêtre gaussienne est fermée.');
    parts.push(app && app.classList.contains('noL') ? 'Les attributs sont cachés.' : 'Les attributs sont affichés.');
    parts.push(app && app.classList.contains('noR') ? 'La fiche est cachée.' : 'La fiche est affichée.');
    parts.push(play && play.getAttribute('aria-label') === 'Pause' ? 'La lecture est en cours.' : 'La lecture est en pause.');
    parts.push(fourier && fourier.getAttribute('aria-pressed') === 'true' ? 'Le mode est Fourier.' : 'Le mode est Libre.');
    return parts.join(' ');
  }

  function explainView(before) {
    var text = viewText();
    lastExplain = text;
    lastTarget = '#stage';
    return perform([
      { action: 'moveCursor', selector: '#stage', label: text }
    ], before, { quietDiff: true });
  }

  function guideSteps(before) {
    var sys = document.getElementById('sys');
    var name = sys && sys.selectedOptions && sys.selectedOptions[0] ? sys.selectedOptions[0].textContent.replace(/\s+/g, ' ').trim() : 'ce système';
    var vol = document.getElementById('volNum');
    var cur = vol ? parseFloat(vol.value) : 1;
    if (!isFinite(cur) || cur <= 0) cur = 1;
    var next = Math.abs(cur - 1) < 0.05 ? '1.5' : '1';
    lastTarget = '#volNum';
    return perform([
      { action: 'moveCursor', selector: '#sys', label: 'Étape 1. Tu es sur ' + name + '. Le sélecteur de système est ici.' },
      { action: 'openWindow', selector: '#gauss', label: 'Étape 2. J’ouvre la fenêtre gaussienne, pour l’analyse et les bornes.' },
      { action: 'moveCursor', selector: '#play', label: 'Étape 3. Lecture fait avancer T₀ vers T₁. Pause ramène le calme.' },
      { action: 'setThreshold', selector: '#volNum', value: next, label: 'Étape 4. Je règle le seuil, le facteur de volume, à ' + next + '.' }
    ], before);
  }

  function runFind(phrase, before) {
    var hit = bestTarget(phrase);
    if (!hit) {
      say('Je ne vois pas « ' + phrase + ' » dans les panneaux. Dis un autre mot, ou « aide ».');
      return Promise.resolve({ ok: false, executed: false });
    }
    lastTarget = hit.el.id ? '#' + hit.el.id : hit.el;
    var label = 'Je te montre « ' + hit.label + ' ».';
    var el = hit.el;
    return perform([
      { action: 'fn', label: label, run: function () { reveal(el); return moveCursor(el); } }
    ], before);
  }

  function showSystem(sys, before) {
    lastTarget = '#sys';
    return perform([
      { action: 'selectAnalysis', selector: '#sys', value: sys.id, label: 'Je te montre ' + sys.name + '.' }
    ], before);
  }

  function doPlay(pause, before) {
    var play = document.getElementById('play');
    var playing = !!(play && play.getAttribute('aria-label') === 'Pause');
    lastTarget = '#play';
    if (pause && !playing) {
      return perform([{ action: 'moveCursor', selector: '#play', label: 'La lecture est déjà en pause. Le bouton est ici.' }], before);
    }
    if (!pause && playing) {
      return perform([{ action: 'moveCursor', selector: '#play', label: 'La lecture tourne déjà. Le bouton pause est ici.' }], before);
    }
    return perform([{ action: 'clickButton', selector: '#play', label: pause ? 'Je mets en pause.' : 'Je lance la lecture.' }], before);
  }

  function doPanels(q, before) {
    if (/vue pleine/.test(q)) {
      lastTarget = '#tgV';
      return perform([{ action: 'clickButton', selector: '#tgV', label: 'Je bascule la vue pleine.' }], before);
    }
    var show = /affiche|montre|ouvre/.test(q) && !/cache|masque|ferme/.test(q);
    var app = document.querySelector('.app');
    var leftOn = !(app && app.classList.contains('noL'));
    var rightOn = !(app && app.classList.contains('noR'));
    var steps = [];
    if (!show) {
      if (leftOn) steps.push({ action: 'clickButton', selector: '#tgL', label: 'Je cache les attributs.' });
      if (rightOn) steps.push({ action: 'clickButton', selector: '#tgR', label: 'Je cache la fiche.' });
    } else {
      if (!leftOn) steps.push({ action: 'clickButton', selector: '#tgL', label: 'J’affiche les attributs.' });
      if (!rightOn) steps.push({ action: 'clickButton', selector: '#tgR', label: 'J’affiche la fiche.' });
    }
    if (!steps.length) {
      say(show ? 'Les panneaux sont déjà affichés.' : 'Les panneaux sont déjà cachés.');
      return Promise.resolve({ ok: true, executed: false });
    }
    lastTarget = '#tgL';
    return perform(steps, before);
  }

  function doThreshold(n, q, before) {
    if (/borne|gauss/.test(q)) {
      lastTarget = '#resetCut';
      return perform([
        { action: 'openWindow', selector: '#gauss', label: 'J’ouvre la fenêtre des bornes.' },
        { action: 'clickButton', selector: '#resetCut', label: 'Je rétablis les bornes 20 / 40 / 60 / 80.' }
      ], before);
    }
    var useSlider = /curseur/.test(q) || n > 16 || n < 0;
    if (useSlider) {
      lastTarget = '#vol';
      return perform([{ action: 'setThreshold', selector: '#vol', value: String(n), label: 'Je place le curseur de volume à ' + n + '.' }], before);
    }
    var v = Math.max(0.05, n);
    lastTarget = '#volNum';
    return perform([{ action: 'setThreshold', selector: '#volNum', value: String(v), label: 'Je mets le seuil, le facteur de volume, à ' + v + '.' }], before);
  }

  function doOpenClose(q, before) {
    var close = /ferme|cache|masque/.test(q);
    if (/vue pleine/.test(q)) return doPanels(q, before);
    if (/panneau/.test(q)) return doPanels(q, before);
    if (/attribut/.test(q)) return doPanels((close ? 'cache' : 'affiche') + ' les panneaux attributs', before);
    if (/fiche|carte/.test(q)) {
      var app = document.querySelector('.app');
      var rightOn = !(app && app.classList.contains('noR'));
      if (close && !rightOn) {
        say('La fiche est déjà cachée.');
        return Promise.resolve({ ok: true, executed: false });
      }
      if (!close && rightOn) {
        say('La fiche est déjà affichée.');
        return Promise.resolve({ ok: true, executed: false });
      }
      lastTarget = '#tgR';
      return perform([{ action: 'clickButton', selector: '#tgR', label: close ? 'Je ferme la fiche.' : 'J’ouvre la fiche.' }], before);
    }
    if (/gauss|fenetre|analyse|borne/.test(q)) {
      var app2 = document.querySelector('.app');
      var open = !!(app2 && app2.classList.contains('gOpen'));
      if (close) {
        if (!open) {
          say('La fenêtre gaussienne est déjà fermée.');
          return Promise.resolve({ ok: true, executed: false });
        }
        lastTarget = '#gClose';
        return perform([{ action: 'clickButton', selector: '#gClose', label: 'Je ferme la fenêtre gaussienne.' }], before);
      }
      lastTarget = '#gauss';
      return perform([{ action: 'openWindow', selector: '#gauss', label: 'J’ouvre la fenêtre gaussienne.' }], before);
    }
    say('Je peux ouvrir ou fermer la fenêtre gaussienne, les attributs, la fiche, ou la vue pleine.');
    return Promise.resolve({ ok: false, executed: false });
  }

  function doClick(q, before) {
    var uncheck = /^decoche/.test(q);
    var check = /^coche/.test(q);
    var rest = stripLead(q.replace(/^(clique sur|clique|coche|decoche|clic)\s+/, ''));
    var table = [
      ['kobayashi', '#km'],
      ['fantome', '#ghost'],
      ['fourier', '#mFourier'],
      ['libre', '#mFree'],
      ['session', '#session'],
      ['pause', '#play'],
      ['lecture', '#play'],
      ['joue', '#play'],
      ['attribut', '#tgL'],
      ['fiche', '#tgR'],
      ['vue pleine', '#tgV']
    ];
    var sel = '';
    for (var i = 0; i < table.length; i++) {
      if (rest.indexOf(table[i][0]) >= 0) { sel = table[i][1]; break; }
    }
    var el = sel ? document.querySelector(sel) : null;
    if (!el) {
      var found = bestTarget(rest);
      if (!found) {
        say('Je ne vois pas quoi cliquer. Nomme un bouton : Kobayashi, Fantôme, Lecture, Fourier, Libre.');
        return Promise.resolve({ ok: false, executed: false });
      }
      sel = found.el.id ? '#' + found.el.id : found.el;
      el = found.el;
    }
    if (el && (el.type === 'checkbox' || el.getAttribute('aria-pressed'))) {
      var on = el.type === 'checkbox' ? !!el.checked : el.getAttribute('aria-pressed') === 'true';
      if (uncheck && !on) {
        lastTarget = sel;
        return perform([{ action: 'moveCursor', selector: sel, label: 'C’est déjà décoché.' }], before);
      }
      if (check && on) {
        lastTarget = sel;
        return perform([{ action: 'moveCursor', selector: sel, label: 'C’est déjà coché.' }], before);
      }
    }
    lastTarget = sel;
    return perform([{ action: 'clickButton', selector: sel, label: (uncheck ? 'Je décoche ' : 'Je clique ') + rest + '.' }], before);
  }

  function lineageText(rules) {
    var list = rules && rules.base_lineage;
    if (list && list.join) return list.join(' -> ');
    return kb.lineage;
  }

  function bridgetIndexUrl() {
    var path = location.pathname || '';
    if (/\/engine\//.test(path)) return '../bridget/index.json';
    if (/\/bridget\//.test(path)) return 'index.json';
    return 'bridget/index.json';
  }

  function loadDocEngine() {
    if (!window.Bridget || !window.Bridget.load) return;
    window.Bridget.load(bridgetIndexUrl()).then(function (engine) {
      docEngine = engine;
    }).catch(function () { docEngine = null; });
  }

  function preferPanel(result) {
    if (!result || !result.answered || !result.passages || !result.passages.length) return result;
    var top = result.passages[0];
    var left = null;
    result.passages.forEach(function (p) {
      var s = p.section || '';
      var panel = s.indexOf('attr:') === 0 || s === 'gauss' || s === 'volume' || s === 'fiche' || s === 'attributs';
      if (panel && !left) left = p;
    });
    if (left && top && left !== top && left.score >= top.score * 0.8) {
      result.passages = [left].concat(result.passages.filter(function (p) { return p !== left; }));
    }
    return result;
  }

  function showFromDoc(hit, before) {
    var section = hit.section || '';
    if (section.indexOf('system:') === 0) {
      var id = section.slice(7);
      var sys = null;
      listSystems().forEach(function (s) { if (s.id === id) sys = s; });
      if (sys) return showSystem(sys, before);
    }
    if (section.indexOf('attr:') === 0) {
      var k = parseInt(section.slice(5), 10);
      lastTarget = '#rack';
      return perform([{
        action: 'fn',
        label: 'Je te montre ' + (hit.title || 'cette tuile') + '.',
        run: function () {
          var app = document.querySelector('.app');
          if (app && app.classList.contains('noL')) {
            var tg = document.getElementById('tgL');
            if (tg) tg.click();
          }
          var tiles = document.querySelectorAll('#rack .tile');
          var tile = tiles[k];
          if (tile) {
            var open = app && app.classList.contains('gOpen') && tile.getAttribute('aria-expanded') === 'true';
            if (!open) tile.click();
          }
          return moveCursor(tile || document.getElementById('gauss'));
        }
      }], before);
    }
    var selector = hit.selector || '#gauss';
    lastTarget = selector;
    return perform([{
      action: 'openWindow',
      selector: selector,
      label: 'Je te montre ' + (hit.title || 'cette section') + '.'
    }], before);
  }

  function offerMontre(hit) {
    showChoice([{
      id: 'bridget-montre',
      label: 'Montre-moi',
      run: function () {
        showFromDoc(hit, snapshotState()).then(function (res) {
          if (res && res.executed && !res.stopped) finishClear();
        });
      }
    }]);
  }

  function answerAndShow(q, before) {
    if (!docEngine) {
      say('Je lis encore la documentation.');
      return Promise.resolve({ ok: true, executed: false });
    }
    var found = preferPanel(docEngine.ask(q));
    if (found && found.answered && found.passages.length) {
      var p = found.passages[0];
      var body = String(p.text || '').replace(/\s+/g, ' ').trim();
      if (body.length > 420) body = body.slice(0, 417) + '…';
      say(body + ' Source : ' + (p.title || 'la documentation') + '.');
      if (p.section || p.selector) return showFromDoc(p, before);
      return Promise.resolve({ ok: true, executed: false });
    }
    var sys = matchSystem(q);
    if (sys) return showSystem(sys, before);
    say('Je n’ai pas cette réponse dans la documentation du Hub.');
    return Promise.resolve({ ok: true, executed: false });
  }

  function answerWithIndex(q) {
    if (docEngine) {
      var found = preferPanel(docEngine.ask(q));
      if (found && found.answered && found.passages.length) {
        var p = found.passages[0];
        var body = String(p.text || '').replace(/\s+/g, ' ').trim();
        if (body.length > 420) body = body.slice(0, 417) + '…';
        var cite = p.title || 'la documentation';
        say(body + ' Source : ' + cite + '.');
        if (p.section || p.selector) offerMontre(p);
        return Promise.resolve({ ok: true, executed: false });
      }
    }
    var local = answerQuestion(q);
    if (local && local.indexOf('Je ne trouve pas de réponse précise') === 0 && !docEngine) {
      say('Je lis encore la documentation du panneau de gauche.');
      return Promise.resolve({ ok: true, executed: false });
    }
    if (local && local.indexOf('Je ne trouve pas de réponse précise') === 0) {
      say('Je n’ai pas cette réponse dans la documentation du Hub.');
      return Promise.resolve({ ok: true, executed: false });
    }
    say(local);
    return Promise.resolve({ ok: true, executed: false });
  }

  function answerQuestion(q) {
    var rules = kb.rules || {};
    var tablets = rules.canon_tablets || {};
    var topics = [
      { keys: ['devise', 'motto', 'harvest', 'seed'], text: 'La devise est : ' + (rules.motto || kb.motto) },
      { keys: ['famille', 'miriamphobot'], text: 'La famille est Miriamphobots. Je m’appelle Brigitte.' },
      { keys: ['version', 'lignee', 'lineage'], text: 'Le HUB est en ' + (rules.hub_version || kb.hub_version) + '. Lignée : ' + lineageText(rules) + '.' },
      { keys: ['regle 8', 'fractal', 'telescop'], text: tablets.rule_8 ? ('Règle 8, ' + tablets.rule_8.name + '. ' + tablets.rule_8.statement) : 'Règle 8 : un détail agit sur le tout, à chaque échelle.' },
      { keys: ['regle 9', 'entropie'], text: tablets.rule_9 ? ('Règle 9, ' + tablets.rule_9.name + '. ' + tablets.rule_9.statement) : 'Règle 9 : l’excès est absorbé à chaque niveau. La peau reste contenue.' },
      { keys: ['classe 4', 'z zero', 'z-zero', 'zzero'], text: rules.classes && rules.classes['4'] ? ('La Classe 4 est l’objet central. ' + (rules.classes['4'].z_zero ? rules.classes['4'].z_zero.definition : '')) : 'La Classe 4 est l’objet central. Il porte Z-ZERO.' },
      { keys: ['classe 1'], text: rules.classes && rules.classes['1'] ? rules.classes['1'].what : 'La Classe 1, ce sont les objets solides.' },
      { keys: ['classe 2'], text: rules.classes && rules.classes['2'] ? rules.classes['2'].what : 'La Classe 2, ce sont les cardinaux qui mènent.' },
      { keys: ['classe 3'], text: rules.classes && rules.classes['3'] ? rules.classes['3'].what : 'La Classe 3, ce sont les conteneurs.' },
      { keys: ['apk', 'actualis', 'etag', 'sha'], text: 'L’actualisation se fait par ETag et SHA-256 du manifeste. Aucune réinstallation d’APK.' },
      { keys: ['graine', 'sandbox', 'cristal'], text: 'La graine minimale est sur les deux téléphones d’Éric. Pas de bac à sable de 4 Go, pas de cristaux d’agent.' }
    ];
    for (var i = 0; i < topics.length; i++) {
      var topic = topics[i];
      for (var k = 0; k < topic.keys.length; k++) {
        if (q.indexOf(topic.keys[k]) >= 0) return topic.text;
      }
    }
    var tokens = q.split(' ').filter(function (t) { return t.length > 3 && STOPWORDS.indexOf(t) < 0; });
    var passages = (kb.passages || []).concat(enginePassages());
    var best = null;
    var bestS = 0;
    passages.forEach(function (p) {
      var hay = fold((p.text || '') + ' ' + (p.path || ''));
      var s = 0;
      tokens.forEach(function (t) { if (hay.indexOf(t) >= 0) s++; });
      if (s > bestS) { bestS = s; best = p; }
    });
    if (best && bestS >= 2) return 'D’après ce que je lis : ' + best.text;
    var near = bestTarget(q);
    if (near) return 'Je ne trouve pas de réponse précise. Le plus proche dans le moteur, c’est « ' + near.label + ' ». Dis « trouve ' + stripLead(q) + ' » et je te le montre.';
    return 'Je ne trouve pas de réponse précise dans les règles, le manifeste, ni dans les libellés du moteur. Dis-moi quoi trouver, ou « aide ».';
  }

  function addPassages(node, path, bucket) {
    if (node == null) return;
    if (typeof node === 'string') {
      if (node.length > 18) bucket.push({ path: path, text: node.slice(0, 420) });
      return;
    }
    if (typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(function (v, i) { addPassages(v, path + '.' + i, bucket); });
      return;
    }
    Object.keys(node).forEach(function (key) {
      addPassages(node[key], path ? path + '.' + key : key, bucket);
    });
  }

  function enginePassages() {
    var out = [];
    var nodes = document.querySelectorAll('button, label, h1, h2, h3, option, [aria-label]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (skipEl(el)) continue;
      var text = labelOf(el);
      if (text.length > 2) out.push({ path: 'moteur.' + (el.id || el.tagName.toLowerCase()), text: text });
    }
    var fiche = document.getElementById('fiche');
    if (fiche) {
      var ft = (fiche.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 420);
      if (ft) out.push({ path: 'moteur.fiche', text: ft });
    }
    return out;
  }

  function loadKnowledge() {
    var paths = assetPaths();
    return Promise.all([
      fetch(paths.rules, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('rules'); return r.json(); }).catch(function () { return null; }),
      fetch(paths.manifest, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('manifest'); return r.json(); }).catch(function () { return null; })
    ]).then(function (pair) {
      kb.rules = pair[0];
      kb.manifest = pair[1];
      kb.passages = [];
      if (pair[0]) {
        addPassages(pair[0], 'rules', kb.passages);
        if (pair[0].motto) kb.motto = pair[0].motto;
        if (pair[0].hub_version) kb.hub_version = pair[0].hub_version;
        if (pair[0].family) kb.family = pair[0].family;
      }
      if (pair[1]) addPassages(pair[1], 'manifest', kb.passages);
    });
  }

  function objectFrom(q) {
    var m = q.match(/^(?:montre moi|montre|affiche moi|affiche|ouvre|va sur|passe a|selectionne)\s+(.+)$/);
    return stripLead(m ? m[1] : q);
  }

  function looksLikeQuestion(q) {
    return /^(qui |quoi |quel |quelle |quels |quelles |comment |pourquoi |c est |qu est ce|est ce que|est-ce )/.test(q) || q.indexOf('c est quoi') >= 0;
  }

  function route(raw, q, before) {
    var need = q.match(/^(?:j ai besoin(?: de| d| du| des)?|i need(?: a| the| to)?)\s+(.+)$/);
    if (need) {
      var rest = stripLead(need[1]);
      var sysNeed = matchSystem(rest);
      if (sysNeed) return showSystem(sysNeed, before);
      return answerAndShow(rest, before);
    }
    if (/^(aide|help)$/.test(q) || q.indexOf('que peux tu') === 0 || q.indexOf('qu est ce que tu peux') === 0) {
      say(helpText());
      return Promise.resolve({ ok: true, executed: false });
    }
    if (/que je vois|que vois|qu est ce que je regarde|ou suis je/.test(q)) return explainView(before);
    if (/guide moi|^guide$|fais le tour|visite guidee/.test(q)) return guideSteps(before);
    if (/^(pause|mets en pause|stop lecture)$/.test(q)) return doPlay(true, before);
    if (/^(joue|lecture|play|mets en lecture|lance la lecture)$/.test(q)) return doPlay(false, before);
    if (/panneau/.test(q) && /cache|masque|ferme|affiche|montre|ouvre/.test(q)) return doPanels(q, before);
    var numMatch = q.match(/(-?\d+(?:[.,]\d+)?)/);
    if (numMatch && /seuil|volume|facteur|borne/.test(q) && /met|regle|place|mets|seuil a|volume a/.test(q)) {
      return doThreshold(parseFloat(numMatch[1].replace(',', '.')), q, before);
    }
    if (/^(ouvre|ferme|cache|masque|affiche)\b/.test(q)) return doOpenClose(q, before);
    if (/^(clique|coche|decoche|clic)\b/.test(q)) return doClick(q, before);

    var findMode = /^trouve\b|^cherche\b|^montre moi ou\b|^ou est\b/.test(q) || (mode === 'find' && !/^(montre|affiche|ouvre)\b/.test(q));
    if (findMode) {
      var phrase = stripLead(q.replace(/^(trouve|cherche|montre moi ou est|montre moi ou|ou est)\s+/, ''));
      var asSystem = matchSystem(phrase);
      if (asSystem) return showSystem(asSystem, before);
      return runFind(phrase, before);
    }

    var sys = matchSystem(objectFrom(q));
    if (sys && /montre|affiche|ouvre|va |passe |selectionne/.test(q)) return showSystem(sys, before);

    if (mode === 'question' || looksLikeQuestion(q)) {
      return answerWithIndex(q);
    }
    if (sys) return showSystem(sys, before);
    var near = bestTarget(stripLead(q));
    if (near && near.score >= 84 && mode !== 'question') return runFind(stripLead(q), before);
    say(answerQuestion(q));
    return Promise.resolve({ ok: true, executed: false });
  }

  function ask(text) {
    var raw = String(text || '').trim();
    if (!raw) return Promise.resolve({ ok: false, empty: true });
    if (running) api.stop();
    ensurePanel();
    openPanel();
    pushLine('me', raw);
    hideChoice();
    var q = fold(raw);
    if (q === 'oui' || q === 'oui merci' || q === 'c est clair') return Promise.resolve(onYes());
    if (q === 'reexplique' || q === 'reexplique moi' || q === 'redis' || q === 'plus simplement') {
      return Promise.resolve(onReexplain()).then(function (res) {
        if (res && res.executed && !res.stopped) finishClear();
        return res;
      });
    }
    return Promise.resolve(route(raw, q, snapshotState())).then(function (res) {
      if (res && res.executed && !res.stopped) finishClear();
      return res || { ok: true };
    }, function (err) {
      say('Je n’ai pas pu finir. ' + (err && err.message ? err.message : 'Une erreur est survenue.'));
      return { ok: false };
    });
  }

  function setMode(next) {
    mode = next;
    openPanel();
    if (next === 'question') { say('Pose ta question. Je réponds depuis la documentation du panneau de gauche.'); return; }
    if (next === 'guide') { runGuide(); return; }
    if (next === 'do') { say('Dis-moi quoi faire. Par exemple : montre-moi le DJIA, ou ouvre la fenêtre gaussienne.'); return; }
    if (next === 'find') { say('Dis-moi quoi trouver. Par exemple : le seuil.'); return; }
  }

  function runGuide() {
    if (running) api.stop();
    openPanel();
    return guideSteps(snapshotState()).then(function (res) {
      if (res && res.executed && !res.stopped) finishClear();
      return res;
    });
  }

  function paintVer(state, data) {
    if (!verEl) return;
    var live = data && data.hub_version ? data.hub_version : pageVersion();
    var label = live + (state === 'update' ? ' · nouvelle version' : state === 'error' ? ' · manifeste indisponible' : ' · à jour');
    verEl.textContent = label + ' · ETag / SHA-256 · sans réinstallation d’APK';
    verEl.setAttribute('data-state', state);
    if (refreshEl) refreshEl.hidden = state !== 'update';
  }

  function checkManifest() {
    var paths = assetPaths();
    var url = paths.manifest + (paths.manifest.indexOf('?') >= 0 ? '&' : '?') + 'cb=' + Date.now();
    var headers = { 'Accept': 'application/json' };
    if (manifestEtag) headers['If-None-Match'] = manifestEtag;
    return fetch(url, { cache: 'no-store', headers: headers }).then(function (res) {
      var etag = res.headers.get('ETag') || '';
      if (res.status === 304) { paintVer('current', { hub_version: pageVersion() }); return null; }
      if (!res.ok) throw new Error('manifest');
      return res.arrayBuffer().then(function (buf) {
        return sha256Hex(buf).then(function (hex) {
          var text = '';
          try { text = new TextDecoder().decode(buf); } catch (e) { text = ''; }
          var data = {};
          try { data = JSON.parse(text); } catch (e2) { data = {}; }
          var stamp = (data.hub_version || '') + '|' + hex;
          var newer = data.hub_version && data.hub_version !== pageVersion();
          if (!manifestStamp) {
            manifestStamp = stamp;
            manifestEtag = etag;
            paintVer(newer ? 'update' : 'current', data);
            return data;
          }
          var moved = (etag && manifestEtag && etag !== manifestEtag) || stamp !== manifestStamp || newer;
          paintVer(moved ? 'update' : 'current', data);
          return data;
        });
      });
    }).catch(function () { paintVer('error'); });
  }

  api.ask = ask;
  api.open = openPanel;
  api.greet = function () {
    openPanel();
    if (!greeted) { greeted = true; say(GREETING); }
  };

  listen(document, 'keydown', function (e) {
    if (e.key !== 'Escape' || !running) return;
    e.preventDefault();
    e.stopPropagation();
    api.stop();
    say('Je m’arrête.');
  }, true);

  listen(window, 'hashchange', function () {
    normalizeHostUrl();
    if (hostWanted()) listenNow();
  }, true);
  listen(window, 'popstate', function () {
    normalizeHostUrl();
    if (hostWanted()) listenNow();
  }, true);
  listen(window, 'resize', placePanel);
  listen(window, 'scroll', placePanel, true);

  function lockSession() {
    var b = document.getElementById('session');
    if (!b) return;
    b.disabled = true;
    b.setAttribute('aria-hidden', 'true');
    b.tabIndex = -1;
    if (b.dataset.v2107) return;
    b.dataset.v2107 = '1';
    b.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);
  }

  function scrubSessionNote() {
    var fiche = document.getElementById('fiche');
    if (!fiche) return;
    fiche.querySelectorAll('p.note').forEach(function (p) {
      var t = p.textContent || '';
      if (t.indexOf('session') !== -1 || t.indexOf('relevé') !== -1) p.remove();
    });
  }

  function watchFiche() {
    var fiche = document.getElementById('fiche');
    if (!fiche || fiche.dataset.v2107) return;
    fiche.dataset.v2107 = '1';
    scrubSessionNote();
    new MutationObserver(scrubSessionNote).observe(fiche, { childList: true, subtree: true });
  }

  function boot() {
    ensurePanel();
    lockSession();
    watchFiche();
    preserveLinks();
    normalizeHostUrl();
    if (hostWanted()) listenNow();
    loadKnowledge();
    loadDocEngine();
    checkManifest();
    if (manifestTimer) clearInterval(manifestTimer);
    manifestTimer = setInterval(checkManifest, 30000);
    listen(document, 'visibilitychange', function () {
      if (!document.hidden) checkManifest();
    });
  }

  if (document.body) boot();
  else listen(document, 'DOMContentLoaded', boot);
})();
