/* Visual kit: pictures and step-by-step animations for the lessons. No library: plain JS + inline SVG.
   Authors write   a figure with class "viz", data-viz="KIND", an aria-label and the JSON spec in a script tag of type application/json.
   The full spec of every KIND is in src/AUTHORING.md ("Pictures and animations").
   This one file runs in two places:
     - in the browser (window.CFG_VIZ.enhance draws every figure of a page),
     - in node (build.js and tools/check-path.js call validate() so a bad spec fails the build). */
(function (root) {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function isN(v) { return typeof v === 'number' && isFinite(v); }
  function isO(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function r1(v) { return Math.round(v * 10) / 10; }

  /* ---------- states: one small vocabulary for every scene. Each has a colour AND a second cue (border style + mark). ---------- */
  var STATES = { active: 'current', done: 'done', bad: 'no', queued: 'waiting', read: 'read from', dim: 'not needed' };
  var ALIAS = { current: 'active', yes: 'done', visited: 'done', good: 'done', no: 'bad', wait: 'queued', queue: 'queued', off: 'dim' };
  var MARK = { done: '✓', bad: '×', queued: '…' };
  function st(s) { return s ? (ALIAS[s] || s) : ''; }
  function cls(s) { s = st(s); return s ? ' st-' + s : ''; }
  function okState(s) { return s === '' || s == null || !!STATES[st(s)]; }

  var FN = {                                   /* built-in chart functions; each returns log10(steps) so 2^n never overflows */
    '1': function () { return 0; },
    'log n': function (n) { return Math.log10(Math.max(1, Math.log2(n))); },
    'sqrt n': function (n) { return Math.log10(n) / 2; },
    'n': function (n) { return Math.log10(n); },
    'n log n': function (n) { return Math.log10(n * Math.max(1, Math.log2(n))); },
    'n^2': function (n) { return 2 * Math.log10(n); },
    'n^3': function (n) { return 3 * Math.log10(n); },
    '2^n': function (n) { return n * Math.log10(2); },
    'n!': function (n) { var s = 0; for (var i = 2; i <= Math.min(n, 5000); i++) s += Math.log10(i); return n > 5000 ? Infinity : s; }
  };
  var SCENE_TYPES = ['array', 'table', 'graph', 'numberline', 'clock', 'vars', 'chart', 'plane'];

  /* =====================================================================================================
     VALIDATION (pure: no DOM). Returns a list of messages; empty = fine.
     ===================================================================================================== */
  function statesOk(E, where, states) {
    if (states == null) return;
    var vals = Array.isArray(states) ? states : isO(states) ? Object.keys(states).map(function (k) { return states[k]; }) : null;
    if (!vals) { E.push(where + ' must be an object or an array'); return; }
    vals.forEach(function (v) { if (!okState(v)) E.push(where + ': unknown state "' + v + '" (use ' + Object.keys(STATES).join(', ') + ')'); });
  }
  function pointersOk(E, where, p) {
    if (p == null) return;
    if (!isO(p)) { E.push(where + ' must be an object like {"lo": 0, "hi": 6}'); return; }
    for (var k in p) if (p[k] !== null && !isN(p[k])) E.push(where + '.' + k + ' must be a number or null');
  }
  function pairOk(v) { return Array.isArray(v) && v.length === 2 && isN(v[0]) && isN(v[1]); }
  var CHECK = {
    array: function (s, E) {
      if (!Array.isArray(s.values) || !s.values.length) E.push('array: "values" must be a list with at least one value');
      statesOk(E, 'array.states', s.states); pointersOk(E, 'array.pointers', s.pointers);
      if (s.rows != null && !Array.isArray(s.rows)) E.push('array: "rows" must be a list');
      (Array.isArray(s.rows) ? s.rows : []).forEach(function (r, i) {
        if (!isO(r) || !Array.isArray(r.values)) E.push('array.rows[' + i + '] needs "values"'); else statesOk(E, 'array.rows[' + i + '].states', r.states);
      });
      if (s.bracket != null && !pairOk(s.bracket)) E.push('array: "bracket" must be [from, to]');
    },
    table: function (s, E) {
      if (!Array.isArray(s.rows) || !s.rows.length || !s.rows.every(Array.isArray)) { E.push('table: "rows" must be a list of rows (each row is a list)'); return; }
      var w = s.rows[0].length;
      if (!s.rows.every(function (r) { return r.length === w; })) E.push('table: every row needs the same number of cells');
      if (s.colLabels && s.colLabels.length !== w) E.push('table: "colLabels" needs ' + w + ' items');
      if (s.rowLabels && s.rowLabels.length !== s.rows.length) E.push('table: "rowLabels" needs ' + s.rows.length + ' items');
      statesOk(E, 'table.states', s.states);
      if (isO(s.states)) for (var k in s.states) {
        var m = /^(\d+),(\d+)$/.exec(k);
        if (!m || +m[1] >= s.rows.length || +m[2] >= w) E.push('table.states: key "' + k + '" must be "row,col" inside the table');
      }
    },
    graph: function (s, E) {
      if (!Array.isArray(s.nodes) || !s.nodes.length) { E.push('graph: "nodes" must be a list'); return; }
      var ids = {};
      s.nodes.forEach(function (n, i) {
        if (!isO(n) || n.id == null || !isN(n.x) || !isN(n.y)) E.push('graph.nodes[' + i + '] needs "id", "x", "y"');
        else if (ids[n.id]) E.push('graph: node id "' + n.id + '" is used twice'); else ids[n.id] = 1;
      });
      var ek = {};
      (s.edges || []).forEach(function (e, i) {
        if (!isO(e) || !ids[e.from] || !ids[e.to]) E.push('graph.edges[' + i + '] needs "from" and "to" that are node ids');
        else { ek[e.from + '-' + e.to] = 1; if (!(s.directed || e.directed)) ek[e.to + '-' + e.from] = 1; }
      });
      statesOk(E, 'graph.states', s.states); statesOk(E, 'graph.edgeStates', s.edgeStates);
      if (isO(s.states)) for (var k in s.states) if (!ids[k]) E.push('graph.states: "' + k + '" is not a node id');
      if (isO(s.notes)) for (var k2 in s.notes) if (!ids[k2]) E.push('graph.notes: "' + k2 + '" is not a node id');
      if (isO(s.edgeStates)) for (var k3 in s.edgeStates) if (!ek[k3]) E.push('graph.edgeStates: "' + k3 + '" is not an edge (write "from-to")');
    },
    numberline: function (s, E) {
      if (!isN(s.min) || !isN(s.max) || s.max <= s.min) { E.push('numberline: needs numbers "min" < "max"'); return; }
      var step = s.step == null ? 1 : s.step;
      if (!isN(step) || step <= 0) E.push('numberline: "step" must be a positive number');
      else if ((s.max - s.min) / step > 60) E.push('numberline: more than 60 ticks; use a bigger "step"');
      pointersOk(E, 'numberline.pointers', s.pointers); statesOk(E, 'numberline.states', s.states);
      if (s.range != null && !pairOk(s.range)) E.push('numberline: "range" must be [from, to]');
      (s.intervals || []).forEach(function (v, i) {
        if (!isO(v) || !isN(v.from) || !isN(v.to)) E.push('numberline.intervals[' + i + '] needs "from" and "to"'); else if (!okState(v.state)) E.push('numberline.intervals[' + i + ']: unknown state "' + v.state + '"');
      });
    },
    clock: function (s, E) {
      if (!isN(s.mod) || s.mod < 2 || s.mod > 24 || s.mod % 1) E.push('clock: "mod" must be a whole number from 2 to 24');
      if (s.at != null && !isN(s.at)) E.push('clock: "at" must be a number');
      statesOk(E, 'clock.states', s.states);
    },
    vars: function (s, E) {
      if (!Array.isArray(s.items) || !s.items.every(function (it) { return Array.isArray(it) && it.length === 2 && typeof it[0] === 'string'; }))
        E.push('vars: "items" must be a list of ["name", value] pairs');
    },
    chart: function (s, E) {
      ['x', 'y'].forEach(function (a) {
        var ax = s[a];
        if (!isO(ax) || !isN(ax.min) || !isN(ax.max) || ax.max <= ax.min) E.push('chart: "' + a + '" needs numbers "min" < "max"');
        else if (ax.log && ax.min <= 0) E.push('chart: "' + a + '.min" must be above 0 on a log scale');
      });
      if (!Array.isArray(s.series) || !s.series.length) { E.push('chart: "series" must be a list'); return; }
      if (s.series.length > 5) E.push('chart: at most 5 series');
      s.series.forEach(function (q, i) {
        if (!isO(q) || typeof q.name !== 'string' || !q.name) { E.push('chart.series[' + i + '] needs a "name"'); return; }
        if (q.fn != null) { if (!FN[q.fn]) E.push('chart.series[' + i + ']: unknown fn "' + q.fn + '" (use ' + Object.keys(FN).join(', ') + ')'); }
        else if (!Array.isArray(q.data) || q.data.length < 2 || !q.data.every(pairOk)) E.push('chart.series[' + i + '] needs "fn" or "data": [[x, y], …] with 2+ points');
      });
      if (s.ref != null && (!isO(s.ref) || !isN(s.ref.y))) E.push('chart: "ref" needs a number "y"');
    },
    plane: function (s, E) {
      var grid = s.orient === 'grid';
      if (s.orient != null && s.orient !== 'grid' && s.orient !== 'math') E.push('plane: "orient" is "math" or "grid"');
      if (grid) { if (!isN(s.rows) || !isN(s.cols) || s.rows < 1 || s.cols < 1 || s.rows > 30 || s.cols > 30) E.push('plane (grid): needs "rows" and "cols" (1 to 30)'); }
      else ['x', 'y'].forEach(function (a) {
        if (!pairOk(s[a]) || s[a][1] <= s[a][0]) E.push('plane: "' + a + '" must be [min, max]'); else if (s[a][1] - s[a][0] > 40) E.push('plane: "' + a + '" spans more than 40 units');
      });
      [['points', ['at']], ['cells', ['at']], ['segments', ['from', 'to']], ['rects', ['from', 'to']]].forEach(function (d) {
        if (s[d[0]] != null && !Array.isArray(s[d[0]])) { E.push('plane: "' + d[0] + '" must be a list'); return; }
        (s[d[0]] || []).forEach(function (o, i) {
          d[1].forEach(function (f) { if (!isO(o) || !pairOk(o[f])) E.push('plane.' + d[0] + '[' + i + '] needs "' + f + '": [a, b]'); });
          if (isO(o) && !okState(o.state)) E.push('plane.' + d[0] + '[' + i + ']: unknown state "' + o.state + '"');
        });
      });
      (s.paths || []).forEach(function (o, i) {
        if (!isO(o) || !Array.isArray(o.points) || o.points.length < 2 || !o.points.every(pairOk)) E.push('plane.paths[' + i + '] needs "points": [[a, b], …]');
        else if (!okState(o.state)) E.push('plane.paths[' + i + ']: unknown state "' + o.state + '"');
      });
    }
  };
  function merge(base, over) {                  /* a step replaces whole top-level fields of the scene */
    var o = {}, k;
    for (k in base) o[k] = base[k];
    if (isO(over)) for (k in over) o[k] = over[k];
    return o;
  }
  function sceneId(sc) { return sc.id || sc.type; }
  /* kind = the data-viz value; spec = the parsed JSON; nCaptions = number of <li> in <ol class="viz-steps"> (stepper only, may be omitted) */
  function validate(kind, spec, nCaptions) {
    var E = [];
    if (!isO(spec)) return ['the spec must be a JSON object'];
    if (kind !== 'stepper') {
      if (SCENE_TYPES.indexOf(kind) < 0) return ['unknown data-viz "' + kind + '" (use stepper, ' + SCENE_TYPES.join(', ') + ')'];
      CHECK[kind](spec, E);
      return E;
    }
    if (!Array.isArray(spec.scenes) || !spec.scenes.length) return ['stepper: "scenes" must be a list with at least one scene'];
    if (!Array.isArray(spec.steps) || !spec.steps.length) return ['stepper: "steps" must be a list with at least one step'];
    var ids = {};
    spec.scenes.forEach(function (sc, i) {
      if (!isO(sc) || SCENE_TYPES.indexOf(sc.type) < 0) { E.push('stepper.scenes[' + i + ']: "type" must be one of ' + SCENE_TYPES.join(', ')); return; }
      if (sc.type === 'chart') E.push('stepper.scenes[' + i + ']: a chart cannot be a stepper scene');
      var id = sceneId(sc);
      if (id === 'line') E.push('stepper: a scene cannot have the id "line"');
      if (ids[id]) E.push('stepper: two scenes share the id "' + id + '"; give each an "id"'); ids[id] = sc;
    });
    if (E.length) return E;
    if (spec.code != null && (!Array.isArray(spec.code) || !spec.code.every(function (l) { return typeof l === 'string'; }))) E.push('stepper: "code" must be a list of strings (one per line)');
    var nCode = Array.isArray(spec.code) ? spec.code.length : 0;
    if (nCaptions != null && nCaptions !== spec.steps.length) E.push('stepper: ' + spec.steps.length + ' steps in the JSON but ' + nCaptions + ' captions in <ol class="viz-steps">');
    spec.steps.forEach(function (stp, i) {
      if (!isO(stp)) { E.push('stepper.steps[' + i + '] must be an object'); return; }
      for (var k in stp) {
        if (k === 'line') {
          var ls = Array.isArray(stp.line) ? stp.line : [stp.line];
          ls.forEach(function (l) { if (!isN(l) || l < 1 || l > nCode || l % 1) E.push('stepper.steps[' + i + '].line: ' + JSON.stringify(l) + ' is not a line of "code" (1 to ' + nCode + ')'); });
        } else if (!ids[k]) E.push('stepper.steps[' + i + ']: "' + k + '" is not a scene id');
        else if (!isO(stp[k])) E.push('stepper.steps[' + i + '].' + k + ' must be an object');
      }
      for (var id in ids) { var e2 = []; CHECK[ids[id].type](merge(ids[id], stp[id]), e2); e2.forEach(function (m) { E.push('step ' + (i + 1) + ', ' + m); }); }
    });
    return E.slice(0, 8);
  }

  /* =====================================================================================================
     SCENES. layout(all) looks at every step so the picture keeps one size; draw(state, L) returns SVG/HTML text.
     ===================================================================================================== */
  function svg(w, h, label, body, extra) {
    w = Math.ceil(w); h = Math.ceil(h);
    return '<svg class="viz-svg' + (extra || '') + '" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" style="max-width:' + w + 'px;min-width:' + Math.round(Math.min(w, Math.max(240, w * 0.8))) +
      'px" role="img" aria-label="' + esc(label) + '">' + body + '</svg>';
  }
  function stateAt(states, i, base) { return !states ? '' : Array.isArray(states) ? states[i - base] : states[i]; }
  function txt(v) { return v == null ? '' : String(v); }
  /* pointers under a row of slots: every name of every step keeps its place in the SVG, so it can slide */
  function ptrLevels(p) {
    var by = {}, lv = {}, max = 0;
    for (var k in (p || {})) if (isN(p[k])) { by[p[k]] = (by[p[k]] || 0) + 1; lv[k] = by[p[k]] - 1; max = Math.max(max, by[p[k]]); }
    return { lv: lv, max: max };
  }
  function ptrNames(all) { var o = []; all.forEach(function (s) { for (var k in (s.pointers || {})) if (o.indexOf(k) < 0) o.push(k); }); return o; }
  function drawPtrs(names, p, xOf, y) {
    var L = ptrLevels(p), h = '';
    names.forEach(function (k) {
      var on = p && isN(p[k]);
      h += '<g class="ptr' + (on ? '' : ' off') + '" style="transform:translate(' + r1(on ? xOf(p[k]) : xOf.mid) + 'px,' + (y + (on ? L.lv[k] : 0) * 30) + 'px)">' +
        '<path d="M0 1l-6 9h12z"/><text y="24" text-anchor="middle">' + esc(k) + '</text></g>';
    });
    return h;
  }

  var SC = {};
  /* ----- array ----- */
  function arrRows(s) {
    var base = s.start || 0;
    return [{ label: s.label, values: s.values, states: s.states, start: base }].concat((s.rows || []).map(function (r) {
      return { label: r.label, values: r.values, states: r.states, start: r.start == null ? base : r.start };
    }));
  }
  SC.array = {
    layout: function (all, avail) {
      var L = { lo: Infinity, hi: -Infinity, chars: 1, lab: 0, stack: 0, rows: 1 };
      all.forEach(function (s) {
        var rows = arrRows(s); L.rows = Math.max(L.rows, rows.length);
        rows.forEach(function (r) {
          L.lo = Math.min(L.lo, r.start); L.hi = Math.max(L.hi, r.start + r.values.length - 1);
          r.values.forEach(function (v) { L.chars = Math.max(L.chars, txt(v).length); });
          if (r.label) L.lab = Math.max(L.lab, txt(r.label).length);
        });
        for (var k in (s.pointers || {})) if (isN(s.pointers[k])) { L.lo = Math.min(L.lo, s.pointers[k]); L.hi = Math.max(L.hi, s.pointers[k]); }
        L.stack = Math.max(L.stack, ptrLevels(s.pointers).max);
      });
      L.names = ptrNames(all);
      L.ch = 38; L.lw = L.lab ? L.lab * 8.4 + 14 : 4;
      /* cells get narrower in a narrow box (a phone), down to the width the longest value needs */
      L.cw = Math.floor(Math.max(Math.max(28, L.chars * 9 + 8), Math.min(Math.max(42, L.chars * 9 + 18), ((avail || 600) - L.lw - 4) / (L.hi - L.lo + 1))));
      return L;
    },
    draw: function (s, L) {
      var rows = arrRows(s), n = L.hi - L.lo + 1, W = L.lw + n * L.cw + 4, top = s.index === false ? 4 : 20, h = '', i, k;
      var xOf = function (i) { return L.lw + (i - L.lo + 0.5) * L.cw; }; xOf.mid = xOf((L.lo + L.hi) / 2);
      if (s.index !== false) for (i = L.lo; i <= L.hi; i++) h += '<text class="idx" x="' + r1(xOf(i)) + '" y="13" text-anchor="middle">' + i + '</text>';
      for (k = 0; k < L.rows; k++) {
        var r = rows[k], y = top + k * (L.ch + 8);
        h += '<text class="rlab" x="' + (L.lw - 8) + '" y="' + (y + L.ch / 2 + 5) + '" text-anchor="end">' + esc(r ? txt(r.label) : '') + '</text>';
        for (i = L.lo; i <= L.hi; i++) {
          var inside = r && i >= r.start && i < r.start + r.values.length, state = inside ? stateAt(r.states, i, r.start) : '', x = xOf(i) - L.cw / 2;
          h += '<g class="cell' + (inside ? cls(state) : k === 0 ? ' ghost' : ' none') + '"><rect class="box" x="' + r1(x + 2) + '" y="' + y + '" width="' + (L.cw - 4) + '" height="' + L.ch + '" rx="5"/>' +
            '<text class="val" x="' + r1(xOf(i)) + '" y="' + (y + L.ch / 2 + 5) + '" text-anchor="middle">' + esc(inside ? txt(r.values[i - r.start]) : '') + '</text>' +
            '<text class="bdg" x="' + r1(x + L.cw - 5) + '" y="' + (y + 11.5) + '" text-anchor="end">' + (MARK[st(state)] || '') + '</text></g>';
        }
      }
      var b = s.bracket, yb = top + L.rows * (L.ch + 8) - 4;
      h += '<rect class="brk' + (b ? '' : ' off') + '" x="' + r1(xOf(b ? b[0] : L.lo) - L.cw / 2) + '" y="' + (top - 3) + '" width="' + (b ? (b[1] - b[0] + 1) * L.cw : L.cw) + '" height="' + (L.ch + 6) + '" rx="7"/>';
      h += drawPtrs(L.names, s.pointers, xOf, yb);
      return svg(W, yb + L.stack * 30 + (L.stack ? 0 : 0), SC.array.say(s), h);
    },
    say: function (s) {
      var t = (s.label ? s.label + ': ' : 'Array: ') + s.values.join(' ') + '.';
      for (var k in (s.pointers || {})) if (isN(s.pointers[k])) t += ' ' + k + ' is at index ' + s.pointers[k] + '.';
      return t;
    }
  };
  /* ----- table (2D grid, for DP and for the sieve) ----- */
  SC.table = {
    layout: function (all) {
      var L = { chars: 1, rl: 0 };
      all.forEach(function (s) {
        s.rows.forEach(function (r) { r.forEach(function (v) { L.chars = Math.max(L.chars, txt(v).length); }); });
        (s.colLabels || []).forEach(function (v) { L.chars = Math.max(L.chars, txt(v).length); });
        (s.rowLabels || []).concat(s.corner ? [s.corner] : []).forEach(function (v) { L.rl = Math.max(L.rl, txt(v).length); });
      });
      L.cw = Math.max(40, L.chars * 9 + 16); L.ch = 34; L.lw = L.rl ? L.rl * 8.4 + 14 : 2;
      return L;
    },
    draw: function (s, L) {
      var top = s.colLabels || s.corner ? 22 : 2, h = '', R = s.rows.length, C = s.rows[0].length;
      if (s.corner) h += '<text class="idx" x="' + (L.lw - 8) + '" y="14" text-anchor="end">' + esc(s.corner) + '</text>';
      (s.colLabels || []).forEach(function (v, c) { h += '<text class="idx" x="' + r1(L.lw + (c + 0.5) * L.cw) + '" y="14" text-anchor="middle">' + esc(txt(v)) + '</text>'; });
      for (var r = 0; r < R; r++) {
        if (s.rowLabels) h += '<text class="idx" x="' + (L.lw - 8) + '" y="' + (top + r * L.ch + L.ch / 2 + 5) + '" text-anchor="end">' + esc(txt(s.rowLabels[r])) + '</text>';
        for (var c = 0; c < C; c++) {
          var state = s.states ? s.states[r + ',' + c] : '', x = L.lw + c * L.cw, y = top + r * L.ch;
          h += '<g class="cell' + cls(state) + '"><rect class="box" x="' + (x + 1.5) + '" y="' + (y + 1.5) + '" width="' + (L.cw - 3) + '" height="' + (L.ch - 3) + '" rx="4"/>' +
            '<text class="val" x="' + r1(x + L.cw / 2) + '" y="' + (y + L.ch / 2 + 5) + '" text-anchor="middle">' + esc(txt(s.rows[r][c])) + '</text>' +
            '<text class="bdg" x="' + (x + L.cw - 5) + '" y="' + (y + 12) + '" text-anchor="end">' + (MARK[st(state)] || '') + '</text></g>';
        }
      }
      return svg(L.lw + C * L.cw + 3, top + R * L.ch + 3, 'Table with ' + R + ' rows and ' + C + ' columns.', h);
    }
  };
  /* ----- graph (also trees and DSU) ----- */
  SC.graph = {
    layout: function (all) {
      var s = all[0], xs = s.nodes.map(function (n) { return n.x; }), ys = s.nodes.map(function (n) { return n.y; });
      var L = { x0: Math.min.apply(0, xs), x1: Math.max.apply(0, xs), y0: Math.min.apply(0, ys), y1: Math.max.apply(0, ys) };
      L.u = Math.min(s.unit || 76, L.x1 > L.x0 ? 500 / (L.x1 - L.x0) : 76); L.r = 17; L.px = 40; L.py = 42;
      return L;
    },
    draw: function (s, L) {
      var P = {}, h = '', R = L.r, midY = (L.y0 + L.y1) / 2;
      s.nodes.forEach(function (n) { P[n.id] = [L.px + (n.x - L.x0) * L.u, L.py + (n.y - L.y0) * L.u]; });
      (s.edges || []).forEach(function (e) {
        var a = P[e.from], b = P[e.to], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
        var dir = s.directed || e.directed, es = s.edgeStates || {}, state = es[e.from + '-' + e.to] || (dir ? '' : es[e.to + '-' + e.from]);
        var x1 = a[0] + ux * R, y1 = a[1] + uy * R, x2 = b[0] - ux * (R + (dir ? 3 : 0)), y2 = b[1] - uy * (R + (dir ? 3 : 0));
        h += '<g class="edge' + cls(state) + '"><line x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(dir ? x2 - ux * 7 : x2) + '" y2="' + r1(dir ? y2 - uy * 7 : y2) + '"/>';
        if (dir) h += '<path class="head" d="M' + r1(x2) + ' ' + r1(y2) + 'L' + r1(x2 - ux * 11 - uy * 5.5) + ' ' + r1(y2 - uy * 11 + ux * 5.5) + 'L' + r1(x2 - ux * 11 + uy * 5.5) + ' ' + r1(y2 - uy * 11 - ux * 5.5) + 'z"/>';
        if (e.w != null) h += '<text class="wt halo" x="' + r1((a[0] + b[0]) / 2 - uy * 11) + '" y="' + r1((a[1] + b[1]) / 2 + ux * 11 + 4.5) + '" text-anchor="middle">' + esc(txt(e.w)) + '</text>';
        h += '</g>';
      });
      s.nodes.forEach(function (n) {
        var p = P[n.id], state = s.states ? s.states[n.id] : '', note = s.notes ? s.notes[n.id] : '', up = n.at ? n.at === 'above' : n.y < midY;
        h += '<g class="node' + cls(state) + '"><circle class="ring" cx="' + r1(p[0]) + '" cy="' + r1(p[1]) + '" r="' + (R + 4.5) + '"/><circle class="box" cx="' + r1(p[0]) + '" cy="' + r1(p[1]) + '" r="' + R + '"/>' +
          '<text class="val" x="' + r1(p[0]) + '" y="' + r1(p[1] + 5) + '" text-anchor="middle">' + esc(txt(n.label == null ? n.id : n.label)) + '</text>' +
          '<text class="bdg halo" x="' + r1(p[0] + R + 3) + '" y="' + r1(p[1] - R + 6) + '" text-anchor="middle">' + (MARK[st(state)] || '') + '</text>' +
          '<text class="note halo" x="' + r1(p[0]) + '" y="' + r1(up ? p[1] - R - 10 : p[1] + R + 20) + '" text-anchor="middle">' + esc(txt(note)) + '</text></g>';
      });
      return svg(L.px * 2 + (L.x1 - L.x0) * L.u, L.py * 2 + (L.y1 - L.y0) * L.u, SC.graph.say(s), h);
    },
    say: function (s) {
      var t = 'Graph with ' + s.nodes.length + ' vertices and ' + (s.edges || []).length + ' edges: ' + (s.edges || []).map(function (e) { return e.from + (s.directed || e.directed ? ' to ' : '-') + e.to; }).join(', ') + '.';
      s.nodes.forEach(function (n) {
        var a = s.states && s.states[n.id], b = s.notes && s.notes[n.id];
        if (a || b) t += ' ' + n.id + ': ' + [a ? STATES[st(a)] : '', b || ''].filter(Boolean).join(', ') + '.';
      });
      return t;
    }
  };
  /* ----- number line ----- */
  SC.numberline = {
    layout: function (all, avail) {
      var s = all[0], step = s.step || 1, cnt = Math.round((s.max - s.min) / step), L = { stack: 0, iv: 0, notes: false };
      L.sp = Math.max(17, Math.min(46, (Math.min(avail || 600, 600) - 48) / cnt)); L.step = step; L.cnt = cnt; L.names = ptrNames(all);
      all.forEach(function (q) {
        L.stack = Math.max(L.stack, ptrLevels(q.pointers).max); L.iv = Math.max(L.iv, (q.intervals || []).length);
        if (q.notes && Object.keys(q.notes).length) L.notes = true;
      });
      return L;
    },
    draw: function (s, L) {
      var pad = 24, W = pad * 2 + L.cnt * L.sp, h = '', yIv = 6, y0 = yIv + L.iv * 22 + (L.notes ? 20 : 0) + 14, i;
      var xOf = function (v) { return pad + (v - s.min) / L.step * L.sp; }; xOf.mid = xOf((s.min + s.max) / 2);
      var every = Math.max(s.labelStep ? Math.round(s.labelStep / L.step) : 1, Math.ceil((txt(s.max).length * 7 + 7) / L.sp));
      for (i = 0; i < L.iv; i++) {
        var v = (s.intervals || [])[i], on = !!v;
        h += '<g class="ivl' + (on ? cls(v.state) : ' off') + '"><rect class="box" x="' + r1(on ? xOf(v.from) : pad) + '" y="' + (yIv + i * 22) + '" width="' + r1(on ? Math.max(3, xOf(v.to) - xOf(v.from)) : 3) + '" height="16" rx="4"/>' +
          '<text class="val" x="' + r1(on ? (xOf(v.from) + xOf(v.to)) / 2 : pad) + '" y="' + (yIv + i * 22 + 12.5) + '" text-anchor="middle">' + esc(on ? txt(v.label) : '') + '</text></g>';
      }
      h += '<line class="axis" x1="' + (pad - 12) + '" y1="' + y0 + '" x2="' + (W - pad + 12) + '" y2="' + y0 + '"/>';
      var rg = s.range;
      h += '<line class="rng' + (rg ? '' : ' off') + '" x1="' + r1(xOf(rg ? rg[0] : s.min)) + '" y1="' + y0 + '" x2="' + r1(xOf(rg ? rg[1] : s.min)) + '" y2="' + y0 + '"/>';
      for (i = 0; i <= L.cnt; i++) {
        var val = Math.round((s.min + i * L.step) * 1e6) / 1e6, x = xOf(val), state = s.states ? s.states[val] : '', note = s.notes ? s.notes[val] : '';
        h += '<g class="tick' + cls(state) + '"><line x1="' + r1(x) + '" y1="' + (y0 - 5) + '" x2="' + r1(x) + '" y2="' + (y0 + 5) + '"/><circle class="box" cx="' + r1(x) + '" cy="' + y0 + '" r="5.5"/>' +
          '<text class="note" x="' + r1(x) + '" y="' + (y0 - 13) + '" text-anchor="middle">' + esc(txt(note)) + '</text>' +
          '<text class="idx" x="' + r1(x) + '" y="' + (y0 + 21) + '" text-anchor="middle">' + (i % every === 0 || i === L.cnt && L.cnt % every > every / 2 ? val : '') + '</text></g>';
      }
      (s.markers || []).forEach(function (m) {
        h += '<g class="mk' + cls(m.state) + '"><circle class="box" cx="' + r1(xOf(m.at)) + '" cy="' + y0 + '" r="6"/><text class="note" x="' + r1(xOf(m.at)) + '" y="' + (y0 - 13) + '" text-anchor="middle">' + esc(txt(m.label)) + '</text></g>';
      });
      h += drawPtrs(L.names, s.pointers, xOf, y0 + 26);
      var t = 'Number line from ' + s.min + ' to ' + s.max + '.';
      for (var k in (s.pointers || {})) if (isN(s.pointers[k])) t += ' ' + k + ' is at ' + s.pointers[k] + '.';
      return svg(W, y0 + 28 + L.stack * 30, t, h);
    }
  };
  /* ----- clock (numbers 0 … mod-1 on a circle, for "a mod m") ----- */
  SC.clock = {
    draw: function (s) {
      var R = 82, c = 112, h = '<circle class="face" cx="' + c + '" cy="' + c + '" r="' + R + '"/>', m = s.mod, i;
      for (i = 0; i < m; i++) {
        var a = i / m * 2 * Math.PI, x = c + Math.sin(a) * R, y = c - Math.cos(a) * R, state = s.states ? s.states[i] : '';
        h += '<g class="node' + cls(state) + '"><circle class="ring" cx="' + r1(x) + '" cy="' + r1(y) + '" r="17"/><circle class="box" cx="' + r1(x) + '" cy="' + r1(y) + '" r="13"/>' +
          '<text class="val" x="' + r1(x) + '" y="' + r1(y + 4.5) + '" text-anchor="middle">' + i + '</text></g>';
      }
      var at = isN(s.at) ? ((s.at % m) + m) % m : null;
      h += '<g class="hand' + (at == null ? ' off' : '') + '" style="transform:rotate(' + r1((at || 0) / m * 360) + 'deg);transform-origin:' + c + 'px ' + c + 'px"><line x1="' + c + '" y1="' + c + '" x2="' + c + '" y2="' + (c - R + 20) + '"/>' +
        '<path d="M' + c + ' ' + (c - R + 14) + 'l-6 10h12z"/></g><circle class="hub" cx="' + c + '" cy="' + c + '" r="4"/>';
      h += '<text class="note" x="' + c + '" y="' + (c * 2 + 12) + '" text-anchor="middle">' + esc(txt(s.label)) + '</text>';
      return svg(c * 2, c * 2 + (s.label ? 22 : 0), 'Clock with the numbers 0 to ' + (m - 1) + '.' + (at == null ? '' : ' The hand is at ' + at + '.'), h);
    }
  };
  /* ----- vars: a strip of "name = value"; a list value is drawn as boxes (a queue, a stack) ----- */
  SC.vars = {
    html: true,
    draw: function (s, L, prev) {
      var old = {}; if (prev) prev.items.forEach(function (it) { old[it[0]] = JSON.stringify(it[1]); });
      return '<div class="viz-vars">' + s.items.map(function (it) {
        var v = it[1], ch = prev && old[it[0]] !== JSON.stringify(v);
        var val = Array.isArray(v) ? (v.length ? v.map(function (x) { return '<span class="vbox">' + esc(txt(x)) + '</span>'; }).join('') : '<span class="vnone">empty</span>') : '<span class="vval">' + esc(v == null || v === '' ? '—' : txt(v)) + '</span>';
        return '<span class="var' + (ch ? ' chg' : '') + '"><span class="vname">' + esc(it[0]) + '</span><span class="veq">=</span>' + val + '</span>';
      }).join('') + '</div>';
    }
  };
  /* ----- coordinate plane ----- */
  SC.plane = {
    layout: function (all) {
      var s = all[0], g = s.orient === 'grid', L = { grid: g };
      L.xa = g ? [0, s.cols] : s.x; L.ya = g ? [0, s.rows] : s.y;
      L.u = Math.max(22, Math.min(s.unit || 46, 500 / (L.xa[1] - L.xa[0])));
      L.ml = 46; L.mt = g ? 44 : 22; L.mr = g ? 12 : 34; L.mb = g ? 10 : 40;
      return L;
    },
    draw: function (s, L) {
      var g = L.grid, u = L.u, nx = L.xa[1] - L.xa[0], ny = L.ya[1] - L.ya[0], W = L.ml + nx * u + L.mr, H = L.mt + ny * u + L.mb, h = '', i;
      /* math: [x, y], y grows up, a point sits on a grid crossing.  grid: [row, col], rows grow down, a point sits in the middle of a cell. */
      var P = g ? function (p) { return [L.ml + (p[1] + 0.5) * u, L.mt + (p[0] + 0.5) * u]; }
        : function (p) { return [L.ml + (p[0] - L.xa[0]) * u, L.mt + (L.ya[1] - p[1]) * u]; };
      var cellXY = g ? function (p) { return [L.ml + p[1] * u, L.mt + p[0] * u]; } : function (p) { var q = P(p); return [q[0], q[1] - u]; };
      (s.cells || []).forEach(function (c) {
        var q = cellXY(c.at);
        h += '<g class="cell' + cls(c.state) + (c.wall ? ' wall' : '') + '"><rect class="box" x="' + r1(q[0] + 1) + '" y="' + r1(q[1] + 1) + '" width="' + r1(u - 2) + '" height="' + r1(u - 2) + '"/>' +
          '<text class="val" x="' + r1(q[0] + u / 2) + '" y="' + r1(q[1] + u / 2 + 5) + '" text-anchor="middle">' + esc(txt(c.text)) + '</text>' +
          '<text class="bdg" x="' + r1(q[0] + u - 4) + '" y="' + r1(q[1] + 12) + '" text-anchor="end">' + (MARK[st(c.state)] || '') + '</text></g>';
      });
      for (i = 0; i <= nx; i++) h += '<line class="gl" x1="' + r1(L.ml + i * u) + '" y1="' + L.mt + '" x2="' + r1(L.ml + i * u) + '" y2="' + r1(L.mt + ny * u) + '"/>';
      for (i = 0; i <= ny; i++) h += '<line class="gl" x1="' + L.ml + '" y1="' + r1(L.mt + i * u) + '" x2="' + r1(L.ml + nx * u) + '" y2="' + r1(L.mt + i * u) + '"/>';
      var ex = Math.ceil(24 / u), ey = Math.ceil(16 / u);
      if (g) {
        for (i = 0; i < nx; i += ex) h += '<text class="idx" x="' + r1(L.ml + (i + 0.5) * u) + '" y="' + (L.mt - 7) + '" text-anchor="middle">' + i + '</text>';
        for (i = 0; i < ny; i += ey) h += '<text class="idx" x="' + (L.ml - 8) + '" y="' + r1(L.mt + (i + 0.5) * u + 4.5) + '" text-anchor="end">' + i + '</text>';
        h += '<text class="axn" x="' + r1(L.ml + nx * u / 2) + '" y="13" text-anchor="middle">' + esc(s.colLabel || 'column') + ' →</text>';
        h += '<text class="axn" transform="translate(13 ' + r1(L.mt + ny * u / 2) + ') rotate(-90)" text-anchor="middle">← ' + esc(s.rowLabel || 'row') + '</text>';
      } else {
        var ax = Math.max(L.xa[0], Math.min(0, L.xa[1])), ay = Math.max(L.ya[0], Math.min(0, L.ya[1])), o = P([ax, ay]);
        h += '<line class="axis" x1="' + L.ml + '" y1="' + r1(o[1]) + '" x2="' + r1(L.ml + nx * u + 12) + '" y2="' + r1(o[1]) + '"/><path class="ah" d="M' + r1(L.ml + nx * u + 18) + ' ' + r1(o[1]) + 'l-9 -5v10z"/>';
        h += '<line class="axis" x1="' + r1(o[0]) + '" y1="' + r1(L.mt + ny * u) + '" x2="' + r1(o[0]) + '" y2="' + (L.mt - 12) + '"/><path class="ah" d="M' + r1(o[0]) + ' ' + (L.mt - 18) + 'l-5 9h10z"/>';
        for (i = L.xa[0]; i <= L.xa[1]; i++) if ((i - L.xa[0]) % ex === 0 || i === 0) h += '<text class="idx" x="' + r1(P([i, 0])[0]) + '" y="' + r1(o[1] + 17) + '" text-anchor="middle">' + i + '</text>';
        for (i = L.ya[0]; i <= L.ya[1]; i++) if (i !== ay && ((i - L.ya[0]) % ey === 0 || i === 0)) h += '<text class="idx" x="' + r1(o[0] - 8) + '" y="' + r1(P([0, i])[1] + 4.5) + '" text-anchor="end">' + i + '</text>';
        h += '<text class="axn" x="' + r1(L.ml + nx * u + 22) + '" y="' + r1(o[1] + 17) + '" text-anchor="middle">' + esc(s.xLabel || 'x') + '</text>';
        h += '<text class="axn" x="' + r1(o[0] - 12) + '" y="' + (L.mt - 10) + '" text-anchor="end">' + esc(s.yLabel || 'y') + '</text>';
      }
      (s.rects || []).forEach(function (r) {
        var a = P(r.from), b = P(r.to), k = g ? u / 2 : 0, x = Math.min(a[0], b[0]) - k, y = Math.min(a[1], b[1]) - k, w = Math.abs(a[0] - b[0]) + 2 * k, hh = Math.abs(a[1] - b[1]) + 2 * k;
        h += '<g class="rct' + cls(r.state) + '"><rect class="box" x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(hh) + '"/>' +
          '<text class="note halo" x="' + r1(x + 6) + '" y="' + r1(y + 16) + '">' + esc(txt(r.label)) + '</text></g>';
      });
      function arrow(a, b) {
        var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
        return '<path class="head" d="M' + r1(b[0]) + ' ' + r1(b[1]) + 'L' + r1(b[0] - ux * 10 - uy * 5) + ' ' + r1(b[1] - uy * 10 + ux * 5) + 'L' + r1(b[0] - ux * 10 + uy * 5) + ' ' + r1(b[1] - uy * 10 - ux * 5) + 'z"/>';
      }
      var lines = (s.segments || []).map(function (q) { return { points: [q.from, q.to], label: q.label, state: q.state, arrow: q.arrow, gap: q.gap }; }).concat(s.paths || []);
      lines.forEach(function (q) {
        var pts = q.points.map(P), n = pts.length;
        if (q.gap) {                                      /* shorten both ends, so an arrow does not sit on top of a point or a cell text */
          var a0 = pts[0], b0 = pts[n - 1], dx = b0[0] - a0[0], dy = b0[1] - a0[1], d = Math.sqrt(dx * dx + dy * dy) || 1;
          pts[0] = [a0[0] + dx / d * q.gap, a0[1] + dy / d * q.gap]; pts[n - 1] = [b0[0] - dx / d * q.gap, b0[1] - dy / d * q.gap];
        }
        var mid = n === 2 ? [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2] : pts[Math.floor(n / 2)];
        h += '<g class="seg' + cls(q.state) + '"><polyline points="' + pts.map(function (p) { return r1(p[0]) + ',' + r1(p[1]); }).join(' ') + '"/>' + (q.arrow ? arrow(pts[n - 2], pts[n - 1]) : '') +
          '<text class="note halo" x="' + r1(mid[0] + 7) + '" y="' + r1(mid[1] - 7) + '">' + esc(txt(q.label)) + '</text></g>';
      });
      (s.points || []).forEach(function (p) {
        var q = P(p.at), left = p.labelAt === 'left', below = p.labelAt === 'below';
        h += '<g class="pt' + cls(p.state) + '"><circle class="box" cx="' + r1(q[0]) + '" cy="' + r1(q[1]) + '" r="5.5"/>' +
          '<text class="note halo" x="' + r1(q[0] + (left ? -9 : below ? 0 : 9)) + '" y="' + r1(q[1] + (below ? 20 : -8)) + '" text-anchor="' + (left ? 'end' : below ? 'middle' : 'start') + '">' + esc(txt(p.label)) + '</text></g>';
      });
      var say = g ? 'Grid with ' + s.rows + ' rows and ' + s.cols + ' columns. Rows grow down, columns grow to the right.' : 'Coordinate plane. x grows to the right, y grows up.';
      (s.points || []).forEach(function (p) { say += ' ' + (p.label || 'Point') + ' at ' + p.at.join(', ') + '.'; });
      return svg(W, H, say, h, ' plane');
    }
  };
  /* ----- chart: line chart with real axes. Its size follows the box, so it is drawn again when the window changes. ----- */
  /* plain text with powers, as in tooltips: "n^2", "10^8 steps". richS draws the power raised in SVG, richH in HTML. */
  function richS(t) { return esc(t).replace(/\^(\w+)/g, '<tspan class="sup" dy="-5">$1</tspan><tspan dy="5">\u200b</tspan>'); }
  function richH(t) { return esc(t).replace(/\^(\w+)/g, '<sup>$1</sup>'); }
  function sup(k) { return richS('10^' + k); }
  function num(v) {                               /* a number for people, as HTML */
    if (!isFinite(v)) return 'too big to write';
    if (Math.abs(v) < 1e4) return String(+v.toPrecision(v >= 100 ? 4 : 2));
    var k = Math.floor(Math.log10(v) + 1e-9), m = Math.round(v / Math.pow(10, k) * 10) / 10;
    if (m >= 10) { m = 1; k++; }
    return (m === 1 ? '' : m + ' · ') + '10<sup>' + k + '</sup>';
  }
  function numL(l) { return l > 300 ? '10<sup>' + Math.round(l) + '</sup>' : num(Math.pow(10, l)); }
  function axis(a, px) {                          /* scale + ticks for one axis; px = length in pixels */
    var lg = !!a.log, lo = lg ? Math.log10(a.min) : a.min, hi = lg ? Math.log10(a.max) : a.max, ticks = [], minor = [], i;
    if (lg) {
      var e = Math.max(1, Math.ceil((hi - lo) / Math.max(2, Math.floor(px / 46))));
      for (i = Math.ceil(lo - 1e-9); i <= hi + 1e-9; i++) { if ((i - Math.ceil(lo - 1e-9)) % e === 0) ticks.push({ v: i, t: i < 4 && i >= 0 ? String(Math.pow(10, i)) : sup(i) }); else minor.push(i); }
    } else {
      var raw = (hi - lo) / Math.max(2, Math.floor(px / 60)), p = Math.pow(10, Math.floor(Math.log10(raw))), stp = [1, 2, 5, 10].filter(function (m) { return m * p >= raw; })[0] * p;
      for (i = Math.ceil(lo / stp - 1e-9); i * stp <= hi + 1e-9; i++) ticks.push({ v: i * stp, t: String(+(i * stp).toPrecision(10)) });
    }
    return { lg: lg, lo: lo, hi: hi, ticks: ticks, minor: minor, pos: function (v) { return (v - lo) / (hi - lo) * px; } };
  }
  var DASH = ['', '7 4', '2 3', '10 3 2 3', '1 4'];
  SC.chart = {
    responsive: true,
    draw: function (s, L, prev, host) {
      var W = Math.max(288, Math.min(640, (host && host.clientWidth) || 600)), small = W < 440, H = Math.round(Math.max(250, Math.min(380, W * 0.66)));
      var longest = Math.max.apply(0, s.series.map(function (q) { return q.name.replace(/\^/g, '').length; }));
      var ml = small ? 40 : 52, mr = Math.max(28, longest * 7.6 + 14), mt = 30, mb = 44, pw = W - ml - mr, ph = H - mt - mb;
      var X = axis(s.x, pw), Y = axis(s.y, ph), h = '', id = 'vc' + (++uid);
      var sx = function (v) { return ml + X.pos(v); }, sy = function (v) { return mt + ph - Y.pos(v); };
      /* nice x values for the readout */
      var xs = [], i, k;
      if (X.lg) { for (k = Math.floor(X.lo); k <= X.hi; k++) [1, 1.5, 2, 3, 5, 7].forEach(function (m) { var v = Math.log10(m) + k; if (v >= X.lo - 1e-9 && v <= X.hi + 1e-9) xs.push(v); }); }
      else for (i = 0; i <= 40; i++) xs.push(X.lo + (X.hi - X.lo) * i / 40);
      var real = function (v) { return X.lg ? Math.pow(10, v) : v; };
      var series = s.series.map(function (q, qi) {
        var f;                                        /* f(x in axis units) -> log10(y) */
        if (q.fn) f = function (v) { return FN[q.fn](real(v)); };
        else {
          var d = q.data.slice().sort(function (a, b) { return a[0] - b[0]; });
          f = function (v) {
            var x = real(v); if (x < d[0][0] - 1e-9 || x > d[d.length - 1][0] + 1e-9) return NaN;
            for (var j = 1; j < d.length; j++) if (x <= d[j][0] + 1e-9) { var t = (x - d[j - 1][0]) / ((d[j][0] - d[j - 1][0]) || 1); return Math.log10(d[j - 1][1] + (d[j][1] - d[j - 1][1]) * t); }
            return NaN;
          };
        }
        var yv = function (l) { return Y.lg ? l : Math.pow(10, l); };       /* log10(y) -> axis units */
        var pts = [], n = 120, end = null;
        var grid = q.fn ? null : q.data.map(function (p) { return X.lg ? Math.log10(p[0]) : p[0]; });
        for (i = 0; i <= (grid ? grid.length - 1 : n); i++) {
          var v = grid ? grid[i] : X.lo + (X.hi - X.lo) * i / n, l = f(v), y = yv(l);
          if (isNaN(l) || v < X.lo - 1e-9 || v > X.hi + 1e-9) continue;
          if (y > Y.hi) {                                                    /* leaves the top: stop at the crossing */
            if (pts.length) { var a = pts[pts.length - 1], t = (Y.hi - a[1]) / (y - a[1]); pts.push([a[0] + (v - a[0]) * t, Y.hi]); end = 'top'; }
            break;
          }
          pts.push([v, Math.max(y, Y.lo)]);
        }
        return { q: q, f: f, pts: pts, end: end, c: qi % 5 };
      });
      h += '<defs><clipPath id="' + id + '"><rect x="' + ml + '" y="' + (mt - 2) + '" width="' + pw + '" height="' + (ph + 4) + '"/></clipPath></defs>';
      Y.minor.forEach(function (v) { h += '<line class="gl minor" x1="' + ml + '" x2="' + (ml + pw) + '" y1="' + r1(sy(v)) + '" y2="' + r1(sy(v)) + '"/>'; });
      Y.ticks.forEach(function (t) { h += '<line class="gl" x1="' + ml + '" x2="' + (ml + pw) + '" y1="' + r1(sy(t.v)) + '" y2="' + r1(sy(t.v)) + '"/><text class="idx" x="' + (ml - 7) + '" y="' + r1(sy(t.v) + 4.5) + '" text-anchor="end">' + t.t + '</text>'; });
      X.ticks.forEach(function (t) { h += '<line class="gl" y1="' + mt + '" y2="' + (mt + ph) + '" x1="' + r1(sx(t.v)) + '" x2="' + r1(sx(t.v)) + '"/><text class="idx" x="' + r1(sx(t.v)) + '" y="' + (mt + ph + 18) + '" text-anchor="middle">' + t.t + '</text>'; });
      h += '<path class="axis" d="M' + ml + ' ' + mt + 'V' + (mt + ph) + 'H' + (ml + pw) + '"/>';
      h += '<text class="axn" x="' + (ml + pw / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + richS(s.x.label || 'x') + '</text>';
      h += '<text class="axn" x="' + (ml - (small ? 34 : 44)) + '" y="' + (mt - 16) + '" text-anchor="start">' + richS(s.y.label || 'y') + ' ↑</text>';
      if (s.ref) {
        var ry = sy(Y.lg ? Math.log10(s.ref.y) : s.ref.y);
        h += '<g class="ref"><line x1="' + ml + '" x2="' + (ml + pw) + '" y1="' + r1(ry) + '" y2="' + r1(ry) + '"/><text class="halo" x="' + (ml + pw - 6) + '" y="' + r1(ry - 6) + '" text-anchor="end">' + richS(s.ref.label || '') + '</text></g>';
      }
      /* lines + a name at the end of each line (never colour alone: dash pattern + name + legend) */
      var labs = [];
      series.forEach(function (q) {
        if (!q.pts.length) return;
        h += '<path class="ln c' + q.c + '" clip-path="url(#' + id + ')"' + (DASH[q.c] ? ' stroke-dasharray="' + DASH[q.c] + '"' : '') + ' d="M' + q.pts.map(function (p) { return r1(sx(p[0])) + ' ' + r1(sy(p[1])); }).join('L') + '"/>';
        var e = q.pts[q.pts.length - 1];
        labs.push({ q: q, x: sx(e[0]), y: sy(e[1]), top: q.end === 'top' && sx(e[0]) < ml + pw - 30 });
      });
      var right = labs.filter(function (l) { return !l.top; }).sort(function (a, b) { return a.y - b.y; });
      right.forEach(function (l, j) { l.ly = Math.max(l.y + 4.5, j ? right[j - 1].ly + 14 : mt + 8); });
      labs.forEach(function (l) {
        h += l.top ? '<text class="sname halo" x="' + r1(l.x + 6) + '" y="' + (mt + 12) + '">' + richS(l.q.q.name) + '</text>'
          : '<text class="sname" x="' + r1(Math.max(l.x, ml + pw) + 5) + '" y="' + r1(l.ly) + '">' + richS(l.q.q.name) + '</text>';
      });
      h += '<g class="cross" visibility="hidden"><line y1="' + mt + '" y2="' + (mt + ph) + '"/>' + series.map(function (q) { return '<circle class="dot c' + q.c + '" r="4.5"/>'; }).join('') + '</g>';
      h += '<rect class="hit" x="' + ml + '" y="' + mt + '" width="' + pw + '" height="' + ph + '"/>';
      var legend = '<div class="viz-legend">' + series.map(function (q) {
        return '<span class="li"><svg class="viz-svg key" width="30" height="10" viewBox="0 0 30 10" aria-hidden="true"><line class="ln c' + q.c + '" x1="1" y1="5" x2="29" y2="5"' + (DASH[q.c] ? ' stroke-dasharray="' + DASH[q.c] + '"' : '') + '/></svg><span>' + richH(q.q.name) + '</span></span>';
      }).join('') + (s.ref ? '<span class="li"><svg class="viz-svg key ref" width="30" height="10" viewBox="0 0 30 10" aria-hidden="true"><line x1="1" y1="5" x2="29" y2="5"/></svg><span>' + richH(s.ref.label || 'limit') + '</span></span>' : '') + '</div>';
      var say = 'Line chart. ' + (s.x.label || 'x') + ' from ' + s.x.min + ' to ' + s.x.max + '. Lines: ' + s.series.map(function (q) { return q.name; }).join(', ') + '. Use the left and right arrow keys to read values.';
      var out = '<svg class="viz-svg chart" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" tabindex="0" aria-label="' + esc(say) + '">' + h + '</svg>' + legend +
        '<p class="viz-readout" aria-live="polite">Point at the chart (or tap it) to read the numbers.</p>';
      SC.chart.last = { xs: xs, series: series, sx: sx, sy: sy, real: real, Y: Y, s: s, mt: mt, ph: ph };
      return out;
    },
    wire: function (host) {
      var C = SC.chart.last, el = host.querySelector('svg.chart'), cross = el.querySelector('.cross'), out = host.querySelector('.viz-readout'), cur = -1;
      function show(i) {
        cur = Math.max(0, Math.min(C.xs.length - 1, i));
        var v = C.xs[cur], x = C.sx(v), dots = cross.querySelectorAll('.dot'), parts = [];
        cross.setAttribute('visibility', 'visible');
        cross.querySelector('line').setAttribute('x1', r1(x)); cross.querySelector('line').setAttribute('x2', r1(x));
        C.series.forEach(function (q, j) {
          var l = q.f(v), y = C.Y.lg ? l : Math.pow(10, l), inside = !isNaN(l) && y <= C.Y.hi + 1e-9 && y >= C.Y.lo - 1e-9;
          dots[j].setAttribute('visibility', inside ? 'inherit' : 'hidden');
          if (inside) { dots[j].setAttribute('cx', r1(x)); dots[j].setAttribute('cy', r1(C.sy(y))); }
          if (!isNaN(l)) parts.push('<span class="rv"><b>' + richH(q.q.name) + '</b> ≈ ' + numL(l) + (C.s.ref && C.s.ref.over && Math.pow(10, l) > C.s.ref.y ? ' <i>' + esc(C.s.ref.over) + '</i>' : '') + '</span>');
        });
        out.innerHTML = '<span class="rx">' + esc(C.s.x.name || 'x') + ' = ' + num(Math.round(C.real(v) * 1e6) / 1e6) + '</span> ' + parts.join(' ');
      }
      function at(e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) * (el.viewBox.baseVal.width / r.width), best = 0, bd = 1e9;
        C.xs.forEach(function (v, i) { var d = Math.abs(C.sx(v) - x); if (d < bd) { bd = d; best = i; } });
        show(best);
      }
      el.addEventListener('pointermove', at); el.addEventListener('pointerdown', at);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { show(cur < 0 ? Math.floor(C.xs.length / 2) : cur + (e.key === 'ArrowRight' ? 1 : -1)); e.preventDefault(); e.stopPropagation(); }
      });
    }
  };
  var uid = 0;

  /* =====================================================================================================
     BROWSER PART
     ===================================================================================================== */
  /* change the old picture into the new one node by node, so CSS transitions can run (colours fade, pointers slide) */
  function sync(a, b) {
    if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) { a.parentNode.replaceChild(b, a); return; }
    if (a.nodeType === 3) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
    if (a.nodeType !== 1) return;
    var i, at = b.attributes;
    for (i = a.attributes.length - 1; i >= 0; i--) if (!b.hasAttribute(a.attributes[i].name)) a.removeAttribute(a.attributes[i].name);
    for (i = 0; i < at.length; i++) if (a.getAttribute(at[i].name) !== at[i].value) a.setAttribute(at[i].name, at[i].value);
    if (a.childNodes.length !== b.childNodes.length) { a.innerHTML = b.innerHTML; return; }
    for (i = a.childNodes.length - 1; i >= 0; i--) sync(a.childNodes[i], b.childNodes[i]);
  }
  function paint(host, html) {
    if (!host.firstChild) { host.innerHTML = html; return; }
    var t = document.createElement('div'); t.innerHTML = html;
    if (t.childNodes.length !== host.childNodes.length) { host.innerHTML = html; return; }
    for (var i = host.childNodes.length - 1; i >= 0; i--) sync(host.childNodes[i], t.childNodes[i]);
  }
  function el(tag, c, text) { var e = document.createElement(tag); if (c) e.className = c; if (text != null) e.textContent = text; return e; }
  function usedStates(all) {                    /* every state name that appears anywhere in these scene states */
    var u = {};
    function add(v) { if (typeof v === 'string' && STATES[st(v)]) u[st(v)] = 1; }
    (function walk(v) {
      if (Array.isArray(v)) v.forEach(walk);
      else if (isO(v)) for (var k in v) {
        if (k === 'state') add(v[k]);
        else if (k === 'states' || k === 'edgeStates') { if (Array.isArray(v[k])) v[k].forEach(add); else if (isO(v[k])) for (var j in v[k]) add(v[k][j]); }
        else walk(v[k]);
      }
    })(all);
    return Object.keys(STATES).filter(function (k) { return u[k]; });
  }
  function legendBox(all, names) {
    if (names === false) return null;
    var u = usedStates(all); if (!u.length) return null;
    var d = el('div', 'viz-legend');
    d.innerHTML = u.map(function (k) {
      return '<span class="li"><svg class="viz-svg key" width="22" height="18" viewBox="0 0 22 18" aria-hidden="true"><g class="cell st-' + k + '"><rect class="box" x="2" y="2" width="18" height="14" rx="3"/>' +
        '<text class="bdg" x="20" y="9" text-anchor="end">' + (MARK[k] || '') + '</text></g></svg>' + esc((names && (names[k] || names[Object.keys(ALIAS).filter(function (a) { return ALIAS[a] === k && names[a]; })[0]])) || STATES[k]) + '</span>';
    }).join('');
    return d;
  }
  function sceneBox(type) { var b = el('div', 'viz-scroll viz-' + type); b.tabIndex = -1; return b; }
  var live = [];                                /* every drawn figure; it is laid out again when its box changes width */
  function drawStatic(fig, kind, spec) {
    var S = SC[kind], box = sceneBox(kind), stage = el('div', 'viz-stage');
    stage.appendChild(box); fig.insertBefore(stage, fig.firstChild);
    var go = function () { box.innerHTML = S.draw(spec, S.layout ? S.layout([spec], box.clientWidth) : null, null, box); if (S.wire) S.wire(box); };
    go();
    live.push({ fig: fig, w: box.clientWidth, box: box, go: go });
    var lg = legendBox([spec], spec.legend); if (lg) stage.appendChild(lg);
  }
  function drawStepper(fig, spec, opt) {
    var ol = fig.querySelector('ol.viz-steps'), caps = ol ? [].slice.call(ol.children) : [], N = spec.steps.length;
    if (caps.length !== N) throw new Error('stepper: ' + N + ' steps in the JSON but ' + caps.length + ' captions in <ol class="viz-steps">');
    var scenes = spec.scenes.map(function (sc) {
      var all = spec.steps.map(function (s) { return merge(sc, s[sceneId(sc)]); }), S = SC[sc.type];
      return { S: S, all: all, L: null, box: sceneBox(sc.type) };
    });
    var stage = el('div', 'viz-stage'), body = el('div', 'viz-body'), col = el('div', 'viz-scenes'), lines = [];
    scenes.forEach(function (s) { col.appendChild(s.box); });
    body.appendChild(col);
    if (spec.code) {
      var pre = el('pre', 'viz-code'); pre.setAttribute('aria-label', 'Code. The marked line is the one that runs in this step.');
      spec.code.forEach(function (l) { var d = el('div', 'ln'); d.innerHTML = (opt.hl ? opt.hl(l) : esc(l)) || ' '; pre.appendChild(d); lines.push(d); });
      body.appendChild(pre);
    }
    stage.appendChild(body);
    var lg = legendBox(scenes.map(function (s) { return s.all; }), spec.legend); if (lg) stage.appendChild(lg);
    fig.insertBefore(stage, fig.firstChild);
    function relayout() { scenes.forEach(function (s) { s.L = s.S.layout ? s.S.layout(s.all, col.clientWidth) : null; s.box.innerHTML = ''; }); }
    relayout();
    live.push({ fig: fig, w: col.clientWidth, box: col, go: function () { relayout(); show(i); } });
    ol.setAttribute('aria-live', 'polite');
    var ctl = el('div', 'viz-ctl'), i = 0, timer = 0, still = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function btn(label, text, fn) { var b = el('button', 'btn', text); b.type = 'button'; b.setAttribute('aria-label', label); b.onclick = fn; ctl.appendChild(b); return b; }
    var bR = btn('Restart: go to the first step', '⏮', function () { stop(); show(0); });
    var bB = btn('One step back', '◀ Back', function () { stop(); show(i - 1); });
    var bP = btn('Play all steps', '▶ Play', function () { if (timer) stop(); else play(); });
    var bN = btn('Next step', 'Next ▶', function () { stop(); show(i + 1); });
    var cnt = el('span', 'viz-count'); ctl.appendChild(cnt);
    if (still) bP.hidden = true;                 /* reduced motion: the reader moves every step by hand */
    ol.after(ctl);
    function show(k) {
      i = Math.max(0, Math.min(N - 1, k));
      scenes.forEach(function (s) { paint(s.box, s.S.draw(s.all[i], s.L, i ? s.all[i - 1] : null, s.box)); });
      var on = spec.steps[i].line, set = on == null ? [] : Array.isArray(on) ? on : [on];
      lines.forEach(function (d, j) { d.classList.toggle('on', set.indexOf(j + 1) >= 0); });
      if (lines.length && set.length && lines[set[0] - 1].offsetParent) {
        var p = lines[0].parentNode, d0 = lines[set[0] - 1];
        if (d0.offsetTop < p.scrollTop || d0.offsetTop + d0.offsetHeight > p.scrollTop + p.clientHeight) p.scrollTop = d0.offsetTop - 20;
      }
      caps.forEach(function (li, j) { li.classList.toggle('on', j === i); });
      cnt.textContent = (i + 1) + ' / ' + N;
      bB.disabled = bR.disabled = i === 0; bN.disabled = i === N - 1;
      fig.setAttribute('data-step', i + 1);
    }
    function stop() { clearInterval(timer); timer = 0; bP.textContent = '▶ Play'; bP.setAttribute('aria-label', 'Play all steps'); }
    function play() {
      if (i === N - 1) show(0);
      bP.textContent = '❚❚ Pause'; bP.setAttribute('aria-label', 'Pause');
      timer = setInterval(function () { if (!fig.isConnected || i === N - 1) { stop(); return; } show(i + 1); if (i === N - 1) stop(); }, spec.speed || 1900);
    }
    fig.tabIndex = 0;
    fig.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('svg.chart')) return;
      var k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowLeft' || k === 'Home' || k === 'End') {
        stop(); show(k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'Home' ? 0 : N - 1); e.preventDefault();
      }
    });
    show(0);
  }
  function fail(fig, kind, msgs) {
    var b = el('div', 'viz-err'); b.setAttribute('role', 'alert');
    b.innerHTML = '<b>Picture error' + (kind ? ' (' + esc(kind) + ')' : '') + '.</b><ul>' + msgs.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>';
    fig.insertBefore(b, fig.firstChild); fig.classList.add('viz-bad');
  }
  function enhance(rootEl, opt) {
    opt = opt || {};
    live = live.filter(function (c) { return c.fig.isConnected; });
    rootEl.querySelectorAll('figure.viz').forEach(function (fig) {
      if (fig.getAttribute('data-viz-on')) return;
      fig.setAttribute('data-viz-on', '1');
      var kind = fig.getAttribute('data-viz') || '', sc = fig.querySelector('script[type="application/json"]'), spec;
      if (!fig.getAttribute('role')) fig.setAttribute('role', 'group');
      try {
        if (!sc) throw new Error('no <script type="application/json"> inside the figure');
        try { spec = JSON.parse(sc.textContent); } catch (e) { throw new Error('the JSON does not parse: ' + e.message); }
        var ol = fig.querySelector('ol.viz-steps'), E = validate(kind, spec, kind === 'stepper' ? (ol ? ol.children.length : 0) : null);
        if (E.length) { fail(fig, kind, E); return; }
        fig.classList.add('viz-' + kind);
        if (kind === 'stepper') drawStepper(fig, spec, opt); else drawStatic(fig, kind, spec);
      } catch (e) { fail(fig, kind, [e.message]); }
    });
  }
  if (typeof window !== 'undefined') {
    var rz = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rz);
      rz = setTimeout(function () { live.forEach(function (c) { if (c.fig.isConnected && c.box.clientWidth !== c.w) { c.w = c.box.clientWidth; c.go(); } }); }, 150);
    });
    window.CFG_VIZ = { enhance: enhance, validate: validate, STATES: STATES };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { validate: validate, STATES: STATES, FN: Object.keys(FN), SCENE_TYPES: SCENE_TYPES };
})(typeof window !== 'undefined' ? window : this);
