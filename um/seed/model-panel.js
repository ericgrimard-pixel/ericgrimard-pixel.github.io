/* Modèle settings. Config stays in localStorage. The API key is never logged. */
(function () {
  var KEY = 'um.model';
  var NONE = '[aucun modèle] Aucun fournisseur de modèle n\'est branché sur cet hôte.';
  function $(id) { return document.getElementById(id); }
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '') || {}; } catch (e) { return {}; }
  }
  function write(cfg) {
    var stored = { preset: cfg.preset || 'aucun', url: cfg.url || '', name: cfg.name || '', key: cfg.key || '' };
    localStorage.setItem(KEY, JSON.stringify(stored));
  }
  function fill(cfg) {
    if ($('model-preset')) $('model-preset').value = cfg.preset || 'aucun';
    if ($('model-url')) $('model-url').value = cfg.url || '';
    if ($('model-name')) $('model-name').value = cfg.name || '';
    if ($('model-key')) $('model-key').value = cfg.key || '';
  }
  function fromForm() {
    return {
      preset: $('model-preset') ? $('model-preset').value : 'aucun',
      url: $('model-url') ? $('model-url').value.trim() : '',
      name: $('model-name') ? $('model-name').value.trim() : '',
      key: $('model-key') ? $('model-key').value : ''
    };
  }
  function providerFor(cfg, api) {
    if (!cfg || cfg.preset === 'aucun' || !cfg.url || !api || !api.httpProvider) return undefined;
    var headers = {};
    if (cfg.key) headers.authorization = 'Bearer ' + cfg.key;
    if (cfg.preset === 'ollama') {
      return api.httpProvider({
        name: 'ollama',
        url: cfg.url,
        headers: headers,
        toBody: function (r) { return { model: cfg.name || 'llama3', prompt: r.prompt, system: r.system, stream: !!r.stream }; },
        fromJson: function (j) { return (j && (j.response || j.text)) || ''; },
        fromChunk: function (line) { try { var j = JSON.parse(line); return (j && (j.response || j.text)) || null; } catch (e) { return null; } }
      });
    }
    if (cfg.preset === 'openai') {
      return api.httpProvider({
        name: 'openai',
        url: cfg.url,
        headers: headers,
        toBody: function (r) {
          var msgs = [];
          if (r.system) msgs.push({ role: 'system', content: r.system });
          msgs.push({ role: 'user', content: r.prompt });
          return { model: cfg.name || 'gpt', messages: msgs, stream: !!r.stream, temperature: r.temperature, max_tokens: r.maxTokens };
        },
        fromJson: function (j) {
          return (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
        },
        fromChunk: function (line) {
          try {
            var j = JSON.parse(line);
            return (j && j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content) || null;
          } catch (e) { return null; }
        }
      });
    }
    return api.httpProvider({ name: 'http', url: cfg.url, headers: headers });
  }
  function status(hookLoaded, cfg, tested) {
    var hook = $('model-hook-status');
    var line = $('model-status');
    if (hook) hook.textContent = 'Crochet modèle : ' + (hookLoaded ? 'chargé' : 'non chargé');
    var plugged = cfg && cfg.preset !== 'aucun' && cfg.url;
    if (line) line.textContent = plugged ? ('Modèle : ' + cfg.preset + ' @ ' + cfg.url) : 'Modèle : aucun (repli)';
    var badge = $('seed-badge');
    if (!badge) return;
    var modelBit = !plugged ? 'configurable, aucun fournisseur' : (tested ? 'réel, test réussi' : 'configurable, pas encore testé');
    badge.innerHTML = '<span class="um-gap-badge">RÉEL</span> graine locale · fantôme option B'
      + ' <span class="um-gap-badge">' + (tested && plugged ? 'RÉEL' : 'CONFIGURABLE') + '</span> modèle : ' + modelBit
      + ' <span class="um-gap-badge">MANQUANT</span> nœud mère · clé de signature (clé APK d\'origine perdue)';
  }
  function activate(cfg) {
    var seedApi = window.UMSeed || window.UM_SEED;
    if (!seedApi) return Promise.resolve(null);
    if (!window.__umSeed) window.__umSeed = seedApi.createSeed();
    var provider = providerFor(cfg, seedApi.modelApi);
    var adapter = {
      provider: provider,
      describe: function () {
        return { name: 'hub', version: 'v21.09', capabilities: provider ? ['model'] : [] };
      }
    };
    var out = window.__umSeed.activate(adapter);
    return Promise.resolve(out);
  }
  function boot() {
    var seedApi = window.UMSeed || window.UM_SEED;
    var ready = (seedApi && seedApi.ready) ? seedApi.ready : Promise.resolve(null);
    var cfg = read();
    fill(cfg);
    ready.then(function (api) {
      if (seedApi) seedApi.modelApi = api;
      status(!!(api && api.createModelHook), cfg, false);
      return activate(cfg);
    }).catch(function () { status(false, cfg, false); });
    var save = $('model-save');
    if (save) save.addEventListener('click', function () {
      cfg = fromForm();
      write(cfg);
      status(!!(seedApi && seedApi.modelApi && seedApi.modelApi.createModelHook), cfg, false);
      activate(cfg);
    });
    var test = $('model-test');
    if (test) test.addEventListener('click', function () {
      cfg = fromForm();
      write(cfg);
      var reply = $('model-reply');
      activate(cfg).then(function () {
        return window.__umSeed.model.generate('Dis bonjour en une ligne.');
      }).then(function (text) {
        if (reply) reply.textContent = String(text);
        var ok = String(text).indexOf('[aucun modèle]') !== 0;
        status(true, cfg, ok && cfg.preset !== 'aucun' && !!cfg.url);
      }).catch(function (e) {
        var code = e && e.code ? e.code : 'PROVIDER';
        var msg = e && e.message ? e.message : String(e);
        if (reply) reply.textContent = code + ' — ' + msg;
        status(true, cfg, false);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
