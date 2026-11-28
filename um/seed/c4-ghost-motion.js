/* Class 4 ghost, option B. Plain JS, no server.
   The line starts on the object and runs toward T₁. There is no side line.
   A static object does not move the line; the T₀ and T₁ markers stay. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.UM_C4_GHOST = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function dist(a, b) {
    var dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  function copy(p) { return [p[0], p[1], p[2]]; }
  /* Points of the centred path from the object toward the T₁ end. */
  function forwardLine(path, obj) {
    var best = 0, bd = Infinity, i;
    for (i = 0; i < path.length; i++) {
      var d = dist(path[i], obj);
      if (d < bd) { bd = d; best = i; }
    }
    var line = [copy(obj)];
    for (i = best + 1; i < path.length; i++) line.push(copy(path[i]));
    if (line.length < 2) line.push(copy(path[path.length - 1]));
    return line;
  }
  function c4GhostStep(prev, sample) {
    var eps = sample.eps == null ? 1e-4 : sample.eps;
    var path = sample.path;
    var obj = sample.obj;
    var markers = [copy(path[0]), copy(path[path.length - 1])];
    var moved = !prev || !prev.obj || dist(prev.obj, obj) > eps;
    if (!moved) {
      return {
        obj: copy(prev.obj),
        line: prev.line.map(copy),
        markers: prev.markers.map(copy),
        moved: false,
        sideLine: false,
        startsAtObject: dist(prev.line[0], prev.obj) < 1e-6
      };
    }
    var line = forwardLine(path, obj);
    return {
      obj: copy(obj),
      line: line,
      markers: markers,
      moved: true,
      sideLine: false,
      startsAtObject: dist(line[0], obj) < 1e-6
    };
  }
  return { dist: dist, forwardLine: forwardLine, c4GhostStep: c4GhostStep };
});
