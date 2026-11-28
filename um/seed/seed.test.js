/* Node tests for the seed adapter and the Class 4 ghost (option B). */
var assert = require('assert');
var seedApi = require('./seed-adapter.js');
var ghost = require('./c4-ghost-motion.js');

var failed = 0;
function check(name, fn) {
  try { fn(); console.log('ok  ' + name); }
  catch (e) { failed += 1; console.error('FAIL ' + name + '\n  ' + e.message); }
}

check('null host: every hook falls back', function () {
  var s = seedApi.createSeed();
  var d = s.activate(seedApi.createNullHost());
  assert.deepStrictEqual(d.capabilities, []);
  assert.strictEqual(s.model.generate('x').text, 'no model');
  assert.strictEqual(s.model.generate('x').stub, true);
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

check('partial host mixes real storage with fallback model and keys', function () {
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
  assert.strictEqual(s.model.generate('p').text, 'no model');
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

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('all seed and ghost tests passed');
