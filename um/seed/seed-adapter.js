/* Pluggable ghost seed. No hard dependency on a server, a runtime or a backend.
   The host is plugged in with seed.activate(adapter). A missing hook falls back
   to a local stand-in. The private key, when there is one, stays inside the host. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.UM_SEED = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var HOOKS = ['storage', 'model', 'transport', 'sync', 'keys', 'lifecycle'];

  function createSeed() {
    var mem = new Map();
    var version = 0;
    var host = null;
    var active = false;
    var paused = false;

    function declared() {
      if (!host || typeof host.describe !== 'function') return [];
      var d = host.describe() || {};
      return Array.isArray(d.capabilities) ? d.capabilities.slice() : [];
    }
    function enabled(name) {
      return declared().indexOf(name) >= 0 && host && host[name];
    }

    var fallback = {
      storage: {
        read: function (k) { return mem.has(k) ? mem.get(k) : null; },
        write: function (k, doc) { mem.set(k, doc); return doc; },
        list: function () { return Array.from(mem.keys()); },
        delete: function (k) { return mem.delete(k); }
      },
      model: {
        generate: function () { return { text: 'no model', stub: true }; }
      },
      transport: {
        send: function (msg) { return { loopback: true, msg: msg, from: 'local' }; },
        receive: function () { return []; },
        identity: function () { return { id: 'local', name: 'boucle locale' }; }
      },
      sync: {
        push: function (v) {
          if (v < version) return { conflict: true, local: version, remote: v, resolved: false };
          version = v;
          return { conflict: false, version: version, resolved: false };
        },
        pull: function () { return { version: version, conflict: false, resolved: false }; }
      },
      keys: {
        sign: function () { return { signed: false, unsigned: true, reason: 'no key' }; },
        verify: function () { return { ok: false, unsigned: true, reason: 'no key' }; }
      }
    };

    function storage() { return enabled('storage') ? host.storage : fallback.storage; }
    function remember(k, doc) { mem.set(k, doc); }

    var seed = {
      activate: function (adapter) {
        host = adapter || {};
        active = true;
        paused = false;
        if (enabled('lifecycle') && host.lifecycle.onActivate) host.lifecycle.onActivate();
        return seed.describe();
      },
      swap: function (adapter) {
        if (enabled('lifecycle') && host.lifecycle.onDeactivate) host.lifecycle.onDeactivate();
        host = adapter || {};
        paused = false;
        if (enabled('lifecycle') && host.lifecycle.onActivate) host.lifecycle.onActivate();
        return seed.describe();
      },
      pause: function () {
        paused = true;
        if (enabled('lifecycle') && host.lifecycle.onPause) host.lifecycle.onPause();
      },
      describe: function () {
        var d = (host && typeof host.describe === 'function') ? (host.describe() || {}) : {};
        var caps = Array.isArray(d.capabilities) ? d.capabilities.filter(function (c) { return HOOKS.indexOf(c) >= 0; }) : [];
        return {
          name: d.name || 'null',
          version: d.version || '0',
          capabilities: caps,
          active: active,
          paused: paused,
          family: 'Miriamphobots'
        };
      },
      storage: {
        read: function (k) {
          if (enabled('storage')) {
            var v = host.storage.read(k);
            if (v != null) return v;
          }
          return mem.has(k) ? mem.get(k) : null;
        },
        write: function (k, doc) { remember(k, doc); return storage().write(k, doc); },
        list: function () { return storage().list(); },
        delete: function (k) {
          var had = mem.delete(k);
          if (enabled('storage')) return host.storage.delete(k);
          return had;
        }
      },
      model: {
        generate: function (prompt, opts) {
          if (!enabled('model')) return fallback.model.generate(prompt, opts);
          return host.model.generate(prompt, opts);
        }
      },
      transport: {
        send: function (msg) { return (enabled('transport') ? host.transport : fallback.transport).send(msg); },
        receive: function () { return (enabled('transport') ? host.transport : fallback.transport).receive(); },
        identity: function () { return (enabled('transport') ? host.transport : fallback.transport).identity(); }
      },
      sync: {
        push: function (v) {
          if (!enabled('sync')) return fallback.sync.push(v);
          var r = host.sync.push(v);
          if (r && r.conflict) return r;
          return r;
        },
        pull: function () { return (enabled('sync') ? host.sync : fallback.sync).pull(); }
      },
      keys: {
        sign: function (payload) {
          if (!enabled('keys')) return fallback.keys.sign(payload);
          return host.keys.sign(payload);
        },
        verify: function (payload, sig) {
          if (!enabled('keys')) return fallback.keys.verify(payload, sig);
          return host.keys.verify(payload, sig);
        }
      }
    };
    return seed;
  }

  function createNullHost() {
    return {
      describe: function () { return { name: 'null', version: '0', capabilities: [] }; }
    };
  }

  function createDemoHost() {
    var docs = new Map();
    var ver = 1;
    var life = { on: 0, pause: 0, off: 0 };
    return {
      life: life,
      describe: function () {
        return { name: 'démo', version: 'v21.08', capabilities: ['storage', 'transport', 'sync', 'lifecycle'] };
      },
      storage: {
        read: function (k) { return docs.has(k) ? docs.get(k) : null; },
        write: function (k, doc) { docs.set(k, doc); return doc; },
        list: function () { return Array.from(docs.keys()); },
        delete: function (k) { return docs.delete(k); }
      },
      transport: {
        send: function (msg) { return { ok: true, msg: msg, from: 'démo' }; },
        receive: function () { return []; },
        identity: function () { return { id: 'demo', name: 'Miriamphobots' }; }
      },
      sync: {
        push: function (v) {
          if (v < ver) return { conflict: true, local: ver, remote: v, resolved: false };
          ver = v;
          return { conflict: false, version: ver, resolved: false };
        },
        pull: function () { return { version: ver, conflict: false, resolved: false }; }
      },
      lifecycle: {
        onActivate: function () { life.on += 1; },
        onPause: function () { life.pause += 1; },
        onDeactivate: function () { life.off += 1; }
      }
    };
  }

  return {
    HOOKS: HOOKS,
    createSeed: createSeed,
    createNullHost: createNullHost,
    createDemoHost: createDemoHost
  };
});
