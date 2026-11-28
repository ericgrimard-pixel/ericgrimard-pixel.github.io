/* Node tests for the seed adapter and the Class 4 ghost (option B). */
var assert = require('assert');
var seedApi = require('./seed-adapter.js');
var ghost = require('./c4-ghost-motion.js');

var failed = 0, pending = 0, started = 0;
function check(name, fn) {
  started += 1;
  function done(err) {
    if (err) { failed += 1; console.error('FAIL ' + name + '\n  ' + (err && err.message)); }
    else console.log('ok  ' + name);
    pending += 1;
    if (pending === started) finish();
  }
  try {
    var r = fn();
    if (r && typeof r.then === 'function') r.then(function () { done(); }, done);
    else done();
  } catch (e) { done(e); }
}
function finish() {
  if (failed) process.exit(1);
  var spawn = require('child_process').spawnSync;
  var path = require('path');
  var run = spawn(process.execPath, [path.join(__dirname, 'test-model-hook.mjs')], { stdio: 'inherit' });
  process.exit(run.status || 0);
}

check('null host: every hook falls back', async function () {
  var s = seedApi.createSeed();
  var d = s.activate(seedApi.createNullHost());
  assert.deepStrictEqual(d.capabilities, []);
  var none = await s.model.generate('x');
  assert.ok(String(none).indexOf('[aucun modèle]') === 0);
  s.storage.write('a', { n: 1 });
  assert.deepStrictEqual(s.storage.read('a'), { n: 1 });
  assert.deepStrictEqual(s.storage.list(), ['a']);
  assert.strictEqual(s.storage.delete('a'), true);
  assert.strictEqual(s.storage.read('a'), null);
  var sent = s.transport.send({ hi: 1 });
  assert.strictEqual(sent.loopback, true);
  assert.strictEqual(s.transport.identity().id, 'local');
  assert.deepStrictEqual(s.transport.receive(), []);
  var push = s.sync.push(2);
  assert.strictEqual(push.conflict, false);
  var clash = s.sync.push(1);
  assert.strictEqual(clash.conflict, true);
  assert.strictEqual(clash.resolved, false);
  assert.strictEqual(s.sync.pull().version, 2);
  var sig = s.keys.sign('doc');
  assert.strictEqual(sig.signed, false);
  assert.strictEqual(sig.unsigned, true);
  assert.strictEqual(sig.reason, 'no key');
});

check('partial host mixes real storage with fallback model and keys', async function () {
  var docs = new Map();
  var s = seedApi.createSeed();
  s.activate({
    describe: function () { return { name: 'partiel', version: '1', capabilities: ['storage'] }; },
    storage: {
      read: function (k) { return docs.has(k) ? docs.get(k) : null; },
      write: function (k, doc) { docs.set(k, doc); return doc; },
      list: function () { return Array.from(docs.keys()); },
      delete: function (k) { return docs.delete(k); }
    },
    model: { generate: function () { return { text: 'should not run' }; } }
  });
  s.storage.write('k', { v: 7 });
  assert.deepStrictEqual(s.storage.read('k'), { v: 7 });
  var none = await s.model.generate('p');
  assert.ok(String(none).indexOf('[aucun modèle]') === 0);
  assert.ok(s.describe().capabilities.indexOf('model') < 0);
  assert.strictEqual(s.keys.sign('p').unsigned, true);
  assert.strictEqual(s.transport.send({}).loopback, true);
});

check('host swap keeps documents', function () {
  var s = seedApi.createSeed();
  var a = seedApi.createDemoHost();
  var b = seedApi.createDemoHost();
  s.activate(a);
  s.storage.write('kept', { ok: true });
  assert.strictEqual(a.life.on, 1);
  s.swap(b);
  assert.strictEqual(a.life.off, 1);
  assert.strictEqual(b.life.on, 1);
  assert.deepStrictEqual(s.storage.read('kept'), { ok: true });
  s.pause();
  assert.strictEqual(b.life.pause, 1);
});

check('signing key stays inside the host', function () {
  var privateKey = 'secret-apk-lost-not-this';
  var s = seedApi.createSeed();
  s.activate({
    describe: function () { return { name: 'clés', version: '1', capabilities: ['keys'] }; },
    keys: {
      sign: function (payload) { return { signed: true, sig: payload + ':' + privateKey.length, unsigned: false }; },
      verify: function (payload, sig) { return { ok: sig === payload + ':' + privateKey.length }; }
    }
  });
  var sig = s.keys.sign('bonjour');
  assert.strictEqual(sig.signed, true);
  assert.strictEqual(s.keys.verify('bonjour', sig.sig).ok, true);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(s, 'privateKey'), false);
  assert.strictEqual(JSON.stringify(s.describe()).indexOf(privateKey), -1);
  assert.strictEqual(JSON.stringify(sig).indexOf(privateKey), -1);
});

check('ghost tracks motion, stays when static, starts at the object, no side line', function () {
  var path = [[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0]];
  var step = ghost.c4GhostStep(null, { obj: [1, 0, 0], path: path });
  assert.strictEqual(step.moved, true);
  assert.strictEqual(step.sideLine, false);
  assert.strictEqual(step.startsAtObject, true);
  assert.deepStrictEqual(step.line[0], [1, 0, 0]);
  assert.deepStrictEqual(step.line[step.line.length - 1], [3, 0, 0]);
  assert.ok(step.line.length < path.length);
  var still = ghost.c4GhostStep(step, { obj: [1, 0, 0], path: path });
  assert.strictEqual(still.moved, false);
  assert.deepStrictEqual(still.line, step.line);
  assert.deepStrictEqual(still.markers, step.markers);
  var next = ghost.c4GhostStep(still, { obj: [2, 0, 0], path: path });
  assert.strictEqual(next.moved, true);
  assert.deepStrictEqual(next.line[0], [2, 0, 0]);
  assert.deepStrictEqual(next.line[next.line.length - 1], [3, 0, 0]);
  assert.strictEqual(next.sideLine, false);
});

check('real provider is the only way describe() lists model', async function () {
  var s = seedApi.createSeed();
  var host = {
    describe: function () { return { name: 'avec modèle', version: '1', capabilities: ['model'] }; },
    provider: { name: 'faux', generate: async function () { return 'réponse réelle'; } }
  };
  var d = s.activate(host);
  assert.ok(d.capabilities.indexOf('model') >= 0);
  assert.strictEqual(host.model.describe().real, true);
  assert.strictEqual(await s.model.generate('salut'), 'réponse réelle');
  var bare = seedApi.createSeed();
  var lied = bare.activate({
    describe: function () { return { name: 'annonce', version: '1', capabilities: ['model'] }; }
  });
  assert.ok(lied.capabilities.indexOf('model') < 0);
  assert.ok(String(await bare.model.generate('x')).indexOf('[aucun modèle]') === 0);
});
