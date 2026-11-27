// Makes the JSON of the pictures by RUNNING the algorithm. No step state is typed by hand (rule in src/AUTHORING.md).
//   node tools/viz-gen.js            check: every <figure class="viz" data-gen="NAME"> holds exactly what its generator makes
//   node tools/viz-gen.js --write SLUG [SLUG ...]   write the generated JSON into those pages only (captions in <ol class="viz-steps"> stay yours)
//   node tools/viz-gen.js --write --all             rewrite every page (only when nobody else is editing pages)
//   node tools/viz-gen.js --print NAME   print the JSON and a plain trace of each step (use it to write the captions)
// To add a picture: add a function to GEN below, put data-gen="its-name" on the figure, run with --write <your slug>.
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'src', 'pages');
const { validate } = require('../src/viz.js');

const GEN = {};

// ---------- binary-search: first index with a[i] >= 7 ----------
GEN['bs-first-yes'] = () => {
  const a = [1, 3, 4, 7, 8, 9, 12], x = 7, n = a.length, steps = [], trace = [];
  let lo = -1, hi = n;
  const snap = (mid, line, ask, note) => {
    const states = {};
    for (let i = 0; i < n; i++) if (i <= lo) states[i] = 'no'; else if (i >= hi) states[i] = 'yes';
    if (mid != null) states[mid] = 'active';
    steps.push({
      line,
      a: { states, pointers: { lo, hi, mid: mid == null ? null : mid } },
      v: { items: [['mid', mid == null ? '' : mid], ['a[mid]', mid == null ? '' : a[mid]], [`a[mid] >= ${x} ?`, ask || '']] }
    });
    trace.push(note);
  };
  snap(null, 1, '', `start: lo=${lo} hi=${hi}`);
  while (hi - lo > 1) {
    const mid = lo + Math.floor((hi - lo) / 2), yes = a[mid] >= x;
    snap(mid, 3, yes ? 'yes' : 'no', `mid=${mid}, a[mid]=${a[mid]} -> ${yes ? 'yes' : 'no'}`);
    if (yes) hi = mid; else lo = mid;
    snap(null, yes ? 4 : 5, '', yes ? `hi=${hi}` : `lo=${lo}`);
  }
  snap(null, 7, '', `stop: hi-lo=1, answer hi=${hi}`);
  return {
    spec: {
      scenes: [{ type: 'array', id: 'a', label: 'a', values: a }, { type: 'vars', id: 'v', items: [] }],
      legend: { no: 'a "no"', yes: 'a "yes"', active: 'mid: we ask here' },
      code: ['int lo = -1, hi = 7;', 'while (hi - lo > 1) {', '    int mid = lo + (hi - lo) / 2;', `    if (a[mid] >= ${x}) hi = mid;`, '    else lo = mid;', '}', '// the answer is hi'],
      steps
    }, trace
  };
};

// ---------- binary-search on the answer: machines 3, 2, 5 must make 7 items ----------
GEN['bs-answer'] = () => {
  const t = [3, 2, 5], k = 7, steps = [], trace = [];
  const made = T => t.map(x => Math.floor(T / x));
  let lo = 0, hi = Math.min(...t) * k;
  const max = hi, notes = {};
  const snap = (mid, note) => {
    const states = {};
    for (let T = 0; T <= max; T++) if (T <= lo) states[T] = 'no'; else if (T >= hi) states[T] = 'yes';
    if (mid != null) states[mid] = 'active';
    const m = mid == null ? null : made(mid), sum = m && m.reduce((p, q) => p + q, 0);
    steps.push({
      T: { states, range: [lo, hi], pointers: { lo, hi, mid: mid == null ? null : mid }, notes: { ...notes } },
      v: { items: [['T', mid == null ? '' : mid], ['items made', m ? `${m.join(' + ')} = ${sum}` : ''], [`at least ${k} ?`, m ? (sum >= k ? 'yes' : 'no') : '']] }
    });
    trace.push(note);
  };
  notes[lo] = 'no'; notes[hi] = 'yes';
  snap(null, `start: lo=${lo} (no), hi=${hi} (yes)`);
  while (hi - lo > 1) {
    const mid = lo + Math.floor((hi - lo) / 2), sum = made(mid).reduce((p, q) => p + q, 0), yes = sum >= k;
    snap(mid, `mid=${mid}: made ${made(mid).join('+')}=${sum} -> ${yes ? 'yes' : 'no'}`);
    notes[mid] = yes ? 'yes' : 'no';
    if (yes) hi = mid; else lo = mid;
    snap(null, yes ? `hi=${hi}` : `lo=${lo}`);
  }
  snap(null, `stop: answer hi=${hi}`);
  return {
    spec: {
      scenes: [{ type: 'numberline', id: 'T', min: 0, max, step: 1 }, { type: 'vars', id: 'v', items: [] }],
      legend: { no: 'not enough time', yes: 'enough time', active: 'mid: we test this time' },
      steps
    }, trace
  };
};

// ---------- graphs: one small graph for BFS and DFS ----------
const G = {
  nodes: [{ id: 1, x: 0, y: 0.65 }, { id: 2, x: 1, y: 0 }, { id: 3, x: 1, y: 1.3 }, { id: 4, x: 2, y: 0 }, { id: 5, x: 2, y: 1.3 }, { id: 6, x: 3, y: 1.3 }],
  edges: [[1, 2], [1, 3], [2, 4], [3, 5], [4, 5], [5, 6]]
};
const adj = () => {
  const g = {}; G.nodes.forEach(n => { g[n.id] = []; });
  G.edges.forEach(([a, b]) => { g[a].push(b); g[b].push(a); });
  for (const k in g) g[k].sort((a, b) => a - b);
  return g;
};
const graphScene = () => ({ type: 'graph', id: 'g', unit: 88, nodes: G.nodes, edges: G.edges.map(([from, to]) => ({ from, to })) });

GEN['bfs'] = () => {
  const g = adj(), dist = {}, q = [], steps = [], trace = [], done = new Set(), tree = [];
  const snap = (v, line, fresh, note) => {
    const states = {}, notes = {}, edgeStates = {};
    for (const n of G.nodes) {
      states[n.id] = n.id === v ? 'active' : done.has(n.id) ? 'done' : q.includes(n.id) ? 'queued' : '';
      if (dist[n.id] != null) notes[n.id] = 'dist ' + dist[n.id];
    }
    for (const [a, b] of tree) edgeStates[a + '-' + b] = a === v && fresh.includes(b) ? 'active' : 'done';
    steps.push({ line, g: { states, notes, edgeStates }, v: { items: [['v', v == null ? '' : v], ['queue', q.slice()]] } });
    trace.push(note);
  };
  dist[1] = 0; q.push(1);
  snap(null, 1, [], 'start: dist[1]=0, queue=[1]');
  while (q.length) {
    const v = q.shift(), fresh = [];
    for (const to of g[v]) {
      if (dist[to] != null) continue;
      dist[to] = dist[v] + 1; q.push(to); fresh.push(to); tree.push([v, to]);
    }
    snap(v, fresh.length ? [3, 6, 7] : [3, 5], fresh, `take ${v}: new ${fresh.join(',') || 'none'}; queue=[${q.join(' ')}]; dist=${G.nodes.map(n => dist[n.id] == null ? '.' : dist[n.id]).join(' ')}`);
    done.add(v);
  }
  snap(null, 2, [], 'queue empty: stop. dist=' + G.nodes.map(n => dist[n.id]).join(' '));
  return {
    spec: {
      scenes: [graphScene(), { type: 'vars', id: 'v', items: [] }],
      legend: { active: 'v: taken from the queue', queued: 'in the queue', done: 'finished' },
      code: ['dist[1] = 0;  q.push(1);', 'while (!q.empty()) {', '    int v = q.front();  q.pop();', '    for (int to : g[v]) {', '        if (dist[to] != -1) continue;', '        dist[to] = dist[v] + 1;', '        q.push(to);', '    }', '}'],
      steps
    }, trace
  };
};

GEN['dfs'] = () => {
  const g = adj(), visited = new Set(), finished = new Set(), stack = [], order = [], tree = [], events = [];
  (function dfs(v, from) {
    visited.add(v); stack.push(v); order.push(v); if (from) tree.push([from, v]);
    events.push({ kind: 'enter', v, from, stack: stack.slice(), order: order.slice(), finished: new Set(finished), tree: tree.slice() });
    for (const to of g[v]) if (!visited.has(to)) dfs(to, v);
    stack.pop(); finished.add(v);
    events.push({ kind: 'back', v, to: stack[stack.length - 1], stack: stack.slice(), order: order.slice(), finished: new Set(finished), tree: tree.slice() });
  })(1, 0);
  // several "go back" events in a row are shown as one step (the last one of the run)
  const shown = events.filter((e, i) => e.kind === 'enter' || !events[i + 1] || events[i + 1].kind === 'enter');
  const steps = [], trace = [];
  shown.forEach((e, i) => {
    const cur = e.stack[e.stack.length - 1], states = {}, notes = {}, edgeStates = {};
    for (const n of G.nodes) {
      states[n.id] = e.finished.has(n.id) ? 'done' : n.id === cur ? 'active' : e.stack.includes(n.id) ? 'queued' : '';
      const k = e.order.indexOf(n.id); if (k >= 0) notes[n.id] = 'visit ' + (k + 1);
    }
    for (const [a, b] of e.tree) edgeStates[a + '-' + b] = e.kind === 'enter' && b === e.v ? 'active' : 'done';
    steps.push({ line: e.kind === 'enter' ? 2 : 5, g: { states, notes, edgeStates }, v: { items: [['path', e.stack], ['visit order', e.order.join(' ')]] } });
    const backs = []; for (let j = events.indexOf(e); j >= 0 && events[j].kind === 'back'; j--) backs.unshift(events[j].v);
    trace.push(e.kind === 'enter' ? `enter ${e.v}${e.from ? ' from ' + e.from : ''}; path=[${e.stack.join(' ')}]` : `finished ${backs.join(', ')}; back at ${cur == null ? 'nothing (all done)' : cur}; path=[${e.stack.join(' ')}]`);
  });
  return {
    spec: {
      scenes: [graphScene(), { type: 'vars', id: 'v', items: [] }],
      legend: { active: 'you are here', queued: 'on the path, waiting', done: 'finished' },
      code: ['void dfs(int v) {', '    visited[v] = true;', '    for (int to : g[v])', '        if (!visited[to]) dfs(to);', '}'],
      steps
    }, trace
  };
};

// ---------- graphs: BFS on a small maze, the number in a cell = moves from the start ----------
GEN['grid-bfs'] = () => {
  const maze = ['...#.', '.#...', '.#.#.', '...#.'], R = maze.length, C = maze[0].length;
  const dist = maze.map(r => [...r].map(() => -1)), q = [[0, 0]], dx = [1, -1, 0, 0], dy = [0, 0, 1, -1];
  dist[0][0] = 0;
  while (q.length) {
    const [x, y] = q.shift();
    for (let d = 0; d < 4; d++) {
      const nx = x + dx[d], ny = y + dy[d];
      if (nx < 0 || nx >= R || ny < 0 || ny >= C) continue;
      if (maze[nx][ny] === '#' || dist[nx][ny] !== -1) continue;
      dist[nx][ny] = dist[x][y] + 1; q.push([nx, ny]);
    }
  }
  const cells = [];
  for (let x = 0; x < R; x++) for (let y = 0; y < C; y++) {
    if (maze[x][y] === '#') cells.push({ at: [x, y], text: '#', wall: true });
    else cells.push({ at: [x, y], text: dist[x][y] < 0 ? '' : dist[x][y], ...(x === 0 && y === 0 ? { state: 'active' } : x === R - 1 && y === C - 1 ? { state: 'done' } : {}) });
  }
  return {
    spec: { orient: 'grid', rows: R, cols: C, unit: 46, rowLabel: 'row x', colLabel: 'column y', legend: { active: 'start', done: 'goal' }, cells },
    trace: dist.map(r => r.map(v => (v < 0 ? '#' : v)).join(' '))
  };
};

// ---------- big-o: one loop, then a loop inside a loop, n = 4; a live step counter ----------
GEN['bigo-loops'] = () => {
  const n = 4, events = [], one = Array(n).fill(''), two = [...Array(n)].map(() => Array(n).fill(''));
  let steps = 0;
  for (let i = 0; i < n; i++) { steps++; one[i] = steps; events.push({ part: 1, i, j: null, steps, one: one.slice(), two: two.map(r => r.slice()) }); }
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { steps++; two[i][j] = steps; events.push({ part: 2, i, j, steps, one: one.slice(), two: two.map(r => r.slice()) }); }
  // shown: the first two runs of each loop one by one, then the end of the first loop and the end of each row
  const shown = events.filter(e => e.part === 1 ? e.i < 2 || e.i === n - 1 : (e.i === 0 && e.j < 2) || e.j === n - 1);
  const steps_ = [], trace = [];
  const snap = (e, line, note) => {
    const st1 = {}, st2 = {};
    if (e) {
      e.one.forEach((v, k) => { if (v !== '') st1[k] = e.part === 1 && k === e.i ? 'active' : 'done'; });
      e.two.forEach((r, a) => r.forEach((v, b) => { if (v !== '') st2[a + ',' + b] = e.part === 2 && a === e.i && b === e.j ? 'active' : 'done'; }));
    }
    steps_.push({
      line,
      one: { values: e ? e.one : Array(n).fill(''), states: st1 },
      two: { rows: e ? e.two : two.map(r => r.map(() => '')), states: st2 },
      v: { items: [['n', n], ['i', e ? e.i : ''], ['j', e && e.j != null ? e.j : ''], ['steps', e ? e.steps : 0]] }
    });
    trace.push(note);
  };
  snap(null, 1, 'start: steps=0');
  for (const e of shown) snap(e, e.part === 1 ? 3 : 6, e.part === 1 ? `loop 1: i=${e.i} steps=${e.steps}` : `loop 2: i=${e.i} j=${e.j} steps=${e.steps}`);
  return {
    spec: {
      scenes: [
        { type: 'array', id: 'one', label: 'loop 1', values: Array(n).fill('') },
        { type: 'table', id: 'two', corner: 'i \\ j', colLabels: [0, 1, 2, 3], rowLabels: ['0', '1', '2', '3'], rows: two.map(r => r.map(() => '')) },
        { type: 'vars', id: 'v', items: [] }
      ],
      legend: { active: 'this run of steps++', done: 'already counted' },
      code: ['int steps = 0;', 'for (int i = 0; i < n; i++)', '    steps++;              // loop 1', 'for (int i = 0; i < n; i++)', '    for (int j = 0; j < n; j++)', '        steps++;          // loop 2'],
      steps: steps_
    }, trace
  };
};

// ---------- big-o: a loop that halves i, n = 16 ----------
GEN['bigo-halve'] = () => {
  const n = 16, steps = [], trace = [], seen = [];
  let rounds = 0, i = n;
  const snap = (line, note) => {
    const states = {};
    seen.forEach(x => { states[x] = 'done'; });
    states[i] = 'active';
    steps.push({ line, h: { states, range: [1, i], pointers: { i } }, v: { items: [['n', n], ['i', i], ['rounds', rounds], ['i > 1 ?', i > 1 ? 'yes' : 'no: stop']] } });
    trace.push(note);
  };
  snap([1, 2], `start: i=${i} rounds=0`);
  for (; i > 1; ) { rounds++; seen.push(i); i = Math.floor(i / 2); snap([3, 2], `round ${rounds}: i=${i}`); }
  return {
    spec: {
      scenes: [{ type: 'numberline', id: 'h', min: 0, max: n, step: 1, labelStep: 2 }, { type: 'vars', id: 'v', items: [] }],
      legend: { active: 'i now', done: 'i in an earlier round' },
      code: ['int rounds = 0;', 'for (int i = n; i > 1; i /= 2)', '    rounds++;'],
      steps
    }, trace
  };
};

// ---------- stage 1 (simulation, arrays-strings, brute-force, greedy) ----------
// simulation: the tram. At each stop a people exit, then b people enter. best = most people inside.
GEN['sim-tram'] = () => {
  const stops = [[0, 3], [2, 5], [4, 2], [4, 0]], steps = [], trace = [];
  let inside = 0, best = 0;
  const snap = (line, i, a, b, note) => {
    steps.push({ line, v: { items: [['i', i == null ? '' : i], ['a (exit)', a == null ? '' : a], ['b (enter)', b == null ? '' : b], ['inside', inside], ['best', best]] } });
    trace.push(note);
  };
  snap(1, null, null, null, `start: inside=${inside} best=${best}`);
  stops.forEach(([a, b], i) => {
    inside -= a; inside += b;
    snap([3, 4, 5], i, a, b, `i=${i}: read a=${a} b=${b}; inside -= ${a}, += ${b} -> ${inside}`);
    const old = best; best = Math.max(best, inside);
    snap(6, i, a, b, `best = max(${old}, ${inside}) = ${best}`);
  });
  snap(8, null, null, null, `loop over: print best=${best}`);
  return {
    spec: {
      scenes: [{ type: 'vars', id: 'v', items: [] }],
      code: ['int inside = 0, best = 0;', 'for (int i = 0; i < n; i++) {', '    cin >> a >> b;', '    inside -= a;', '    inside += b;', '    best = max(best, inside);', '}', 'cout << best;'],
      steps
    }, trace
  };
};

// arrays-strings: one loop keeps the biggest value and its index
GEN['arr-max'] = () => {
  const a = [3, 8, 2, 9, 5], n = a.length, steps = [], trace = [];
  let best = a[0], pos = 0;
  const snap = (line, i, note) => {
    const states = {};
    for (let k = 0; k < n; k++) if (i != null && k < i && k !== pos) states[k] = 'dim';
    states[pos] = 'done';
    if (i != null && i < n) states[i] = 'active';
    steps.push({ line, a: { states, pointers: { i: i == null ? null : i } }, v: { items: [['i', i == null ? '' : i], ['a[i]', i != null && i < n ? a[i] : ''], ['best', best], ['pos', pos]] } });
    trace.push(note);
  };
  snap(1, null, `start: best=a[0]=${best} pos=0`);
  for (let i = 1; i < n; i++) {
    const bigger = a[i] > best;
    if (bigger) { best = a[i]; pos = i; }
    snap(bigger ? [3, 4] : 3, i, `i=${i}: a[i]=${a[i]} ${bigger ? '>' : 'not >'} best -> best=${best} pos=${pos}`);
  }
  snap(2, n, `i=${n}=n: loop stops; best=${best} pos=${pos}`);
  return {
    spec: {
      scenes: [{ type: 'array', id: 'a', label: 'a', values: a }, { type: 'vars', id: 'v', items: [] }],
      legend: { active: 'i: we look here', done: 'the best so far', dim: 'already looked at' },
      code: ['int best = a[0], pos = 0;', 'for (int i = 1; i < n; i++) {', '    if (a[i] > best) {', '        best = a[i]; pos = i;', '    }', '}'],
      steps
    }, trace
  };
};

// brute-force: all pairs i < j of a = [2, 5, 3, 4, 1], count the pairs with sum 7
GEN['bf-pairs'] = () => {
  const a = [2, 5, 3, 4, 1], n = a.length, target = 7, steps = [], trace = [], seen = {};
  let count = 0;
  const snap = (line, i, j, note) => {
    const rows = [], states = {};
    for (let r = 0; r < n; r++) {
      const row = [];
      for (let c = 0; c < n; c++) {
        const k = r + ',' + c;
        if (c <= r) { row.push(''); states[k] = 'dim'; }
        else if (seen[k] != null) { row.push(seen[k]); states[k] = seen[k] === target ? 'yes' : 'read'; }
        else row.push('');
      }
      rows.push(row);
    }
    if (i != null) states[i + ',' + j] = 'active';
    const sum = i == null ? '' : `${a[i]} + ${a[j]} = ${a[i] + a[j]}`;
    steps.push({ line, a: { pointers: { i: i == null ? null : i, j: j == null ? null : j } }, t: { rows, states }, v: { items: [['a[i] + a[j]', sum], ['count', count]] } });
    trace.push(note);
  };
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const s = a[i] + a[j];
    seen[i + ',' + j] = s;
    if (s === target) count++;
    snap(s === target ? [3, 4] : 3, i, j, `i=${i} j=${j}: ${a[i]}+${a[j]}=${s}${s === target ? ' = 7, count=' + count : ''}`);
  }
  snap(2, null, null, `all ${n * (n - 1) / 2} pairs done: count=${count}`);
  return {
    spec: {
      scenes: [
        { type: 'array', id: 'a', label: 'a', values: a },
        { type: 'table', id: 't', corner: 'i \\ j', colLabels: [0, 1, 2, 3, 4], rowLabels: ['0', '1', '2', '3', '4'], rows: [['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', '']] },
        { type: 'vars', id: 'v', items: [] }
      ],
      legend: { active: 'the pair (i, j) we check now', yes: 'sum is 7', read: 'checked, not 7', dim: 'j <= i: never checked' },
      code: ['int count = 0;', 'for (int i = 0; i < n; i++)', '    for (int j = i + 1; j < n; j++)', '        if (a[i] + a[j] == 7) count++;'],
      steps
    }, trace
  };
};

// greedy: meetings in one room. Sort by end, take a meeting if it starts when the last one has ended.
GEN['greedy-meetings'] = () => {
  const m = [['A', 1, 3], ['B', 2, 5], ['C', 4, 6], ['G', 0, 7], ['D', 6, 8], ['E', 5, 9], ['F', 8, 10]];
  m.sort((p, q) => p[2] - q[2]);
  const st = {}, steps = [], trace = [];
  let lastEnd = 0, taken = 0;
  const snap = (line, cur, note) => {
    const intervals = m.map(([name, s, e]) => ({ from: s, to: e, label: name, state: name === cur ? 'active' : st[name] || '' }));
    steps.push({ line, T: { intervals, pointers: { lastEnd } }, v: { items: [['lastEnd', lastEnd], ['taken', taken]] } });
    trace.push(note);
  };
  snap([1, 2], null, `sorted by end: ${m.map(x => x[0]).join(' ')}; lastEnd=0`);
  for (const [name, s, e] of m) {
    if (s >= lastEnd) { taken++; lastEnd = e; st[name] = 'done'; snap([4, 5], name, `${name} [${s},${e}]: start ${s} >= lastEnd -> take; lastEnd=${e} taken=${taken}`); }
    else { st[name] = 'dim'; snap(4, name, `${name} [${s},${e}]: start ${s} < lastEnd ${lastEnd} -> skip`); }
  }
  return {
    spec: {
      scenes: [{ type: 'numberline', id: 'T', min: 0, max: 10, step: 1 }, { type: 'vars', id: 'v', items: [] }],
      legend: { active: 'the meeting we look at', done: 'taken', dim: 'skipped: it overlaps' },
      code: ['sort(m.begin(), m.end()); // by end', 'int lastEnd = 0, taken = 0;', 'for (int i = 0; i < n; i++) {', '    if (m[i].second >= lastEnd) {', '        taken++; lastEnd = m[i].first;', '    }', '}'],
      steps
    }, trace
  };
};

// ---------- stage 2a (stl-containers, sorting, counting, prefix-sums, two-pointers) ----------
// stl-containers: a stack checks the brackets of "([]{})"
GEN['stack-brackets'] = () => {
  const s = '([]{})', CAP = 3, st = [], steps = [], trace = [], openOf = { ')': '(', ']': '[', '}': '{' };
  let good = true;
  const snap = (i, line, act, note) => {
    const states = {};
    for (let k = 0; k < s.length; k++) if (k < i) states[k] = 'done'; else if (k === i) states[k] = 'active';
    const vals = [], sst = {};
    for (let k = 0; k < CAP; k++) vals.push(k < st.length ? st[k] : '');
    if (st.length) sst[st.length - 1] = 'active';
    steps.push({
      line,
      s: { states, pointers: { c: i >= 0 && i < s.length ? i : null } },
      st: { values: vals, states: sst, pointers: { top: st.length ? st.length - 1 : null } },
      v: { items: [['c', i >= 0 && i < s.length ? s[i] : ''], ['action', act], ['good', good ? 'true' : 'false']] }
    });
    trace.push(note);
  };
  snap(-1, 1, '', 'start: empty stack');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if ('([{'.includes(c)) { st.push(c); snap(i, [2, 3], 'push ' + c, `read ${c}: push; stack=${st.join('')}`); }
    else if (!st.length || st[st.length - 1] !== openOf[c]) { good = false; snap(i, [4, 5, 6], 'no match', `read ${c}: no match`); }
    else { const t = st.pop(); snap(i, [4, 5, 7], 'top is ' + t + ': pop', `read ${c}: top ${t} fits, pop; stack=${st.join('') || 'empty'}`); }
  }
  snap(s.length, 9, good && !st.length ? 'YES' : 'NO', `end: good=${good}, stack ${st.length ? 'not empty' : 'empty'} -> ${good && !st.length ? 'YES' : 'NO'}`);
  return {
    spec: {
      scenes: [{ type: 'array', id: 's', label: 's', values: s.split('') }, { type: 'array', id: 'st', label: 'stack', values: Array(CAP).fill('') }, { type: 'vars', id: 'v', items: [] }],
      legend: { done: 'already read', active: 'c: read now / the top of the stack' },
      code: ['for (char c : s) {', "    if (c == '(' || c == '[' || c == '{')", '        st.push(c);', '    else if (st.empty() ||', '             st.top() != openOf(c))', '        good = false;', '    else st.pop();', '}', '// YES if good and st is empty'],
      steps
    }, trace
  };
};

// sorting: merge two sorted lists
GEN['merge'] = () => {
  const a = [2, 5, 8], b = [1, 3, 9], n = a.length, m = b.length, c = [], steps = [], trace = [];
  let i = 0, j = 0;
  const snap = (line, took, note) => {
    const sa = {}, sb = {}, sc = {};
    for (let k = 0; k < n; k++) if (k < i) sa[k] = 'dim'; else if (k === i && j < m) sa[k] = 'read';
    for (let k = 0; k < m; k++) if (k < j) sb[k] = 'dim'; else if (k === j && i < n) sb[k] = 'read';
    if (i >= n && j < m) sb[j] = 'read';
    if (j >= m && i < n) sa[i] = 'read';
    for (let k = 0; k < c.length; k++) sc[k] = k === c.length - 1 && took ? 'active' : 'done';
    steps.push({
      line,
      a: { states: sa, pointers: { i } },
      b: { states: sb, pointers: { j } },
      c: { values: Array.from({ length: n + m }, (_, k) => (k < c.length ? c[k] : '')), states: sc },
      v: { items: [['a[i]', i < n ? a[i] : '—'], ['b[j]', j < m ? b[j] : '—'], ['take', took || '']] }
    });
    trace.push(note);
  };
  snap(1, '', 'start i=0 j=0');
  while (i < n && j < m) {
    if (a[i] <= b[j]) { c.push(a[i]); i++; snap([2, 3, 4], 'a[i] = ' + a[i - 1], `a[i]=${a[i - 1]} <= b[j]=${b[j]}: take ${a[i - 1]} from a`); }
    else { c.push(b[j]); j++; snap([2, 5, 6], 'b[j] = ' + b[j - 1], `b[j]=${b[j - 1]} < a[i]=${a[i]}: take ${b[j - 1]} from b`); }
  }
  while (i < n) { c.push(a[i]); i++; snap(9, 'a[i] = ' + a[i - 1], `b is empty: copy ${a[i - 1]} from a`); }
  while (j < m) { c.push(b[j]); j++; snap(10, 'b[j] = ' + b[j - 1], `a is empty: copy ${b[j - 1]} from b`); }
  return {
    spec: {
      scenes: [{ type: 'array', id: 'a', label: 'a', values: a }, { type: 'array', id: 'b', label: 'b', values: b }, { type: 'array', id: 'c', label: 'c', values: Array(n + m).fill('') }, { type: 'vars', id: 'v', items: [] }],
      legend: { read: 'compared now', dim: 'already taken', active: 'just written', done: 'written' },
      code: ['int i = 0, j = 0;', 'while (i < n && j < m) {', '    if (a[i] <= b[j]) {', '        c.push_back(a[i]); i++;', '    } else {', '        c.push_back(b[j]); j++;', '    }', '}', 'while (i < n) { c.push_back(a[i]); i++; }', 'while (j < m) { c.push_back(b[j]); j++; }'],
      steps
    }, trace
  };
};

// counting: one pass fills the frequency array for "cabbage"
GEN['count-letters'] = () => {
  const s = 'cabbage', K = 7, cnt = Array(K).fill(0), steps = [], trace = [];
  const letters = Array.from({ length: K }, (_, k) => String.fromCharCode(97 + k));
  const snap = (i, note) => {
    const ss = {}, sc = {};
    for (let k = 0; k < s.length; k++) if (k < i) ss[k] = 'done'; else if (k === i) ss[k] = 'active';
    if (i >= 0 && i < s.length) sc[s.charCodeAt(i) - 97] = 'active';
    steps.push({
      line: i < 0 ? 1 : [2, 3],
      s: { states: ss, pointers: { c: i >= 0 && i < s.length ? i : null } },
      cnt: { values: cnt.slice(), states: sc },
      v: { items: [['c', i >= 0 ? s[i] : ''], ["c - 'a'", i >= 0 ? s.charCodeAt(i) - 97 : '']] }
    });
    trace.push(note);
  };
  snap(-1, 'start: all zero');
  for (let i = 0; i < s.length; i++) { cnt[s.charCodeAt(i) - 97]++; snap(i, `read ${s[i]} -> box ${s.charCodeAt(i) - 97}; cnt=${cnt.join(' ')}`); }
  return {
    spec: {
      scenes: [{ type: 'array', id: 's', label: 's', values: s.split('') }, { type: 'array', id: 'cnt', label: 'cnt', values: cnt.map(() => 0), rows: [{ label: 'letter', values: letters }] }, { type: 'vars', id: 'v', items: [] }],
      legend: { done: 'already read', active: 'the letter now and its box' },
      code: ['vector<int> cnt(26, 0);', 'for (char c : s)', "    cnt[c - 'a']++;"],
      steps
    }, trace
  };
};

// counting: pairs of equal values, "how many earlier ones match me?"
GEN['count-pairs'] = () => {
  const a = [3, 1, 3, 3, 1, 2], V = 3, cnt = Array(V + 1).fill(0), steps = [], trace = [];
  let pairs = 0;
  const snap = (j, add, note) => {
    const sa = {}, sc = {};
    for (let k = 0; k < a.length; k++) if (k < j) sa[k] = a[k] === a[j] ? 'read' : 'done'; else if (k === j) sa[k] = 'active';
    if (j >= 0 && j < a.length) sc[a[j]] = 'active';
    steps.push({
      line: j < 0 ? 1 : [3, 4],
      a: { states: sa, pointers: { j: j >= 0 && j < a.length ? j : null } },
      cnt: { values: cnt.slice(1), states: sc },
      v: { items: [['x = b[j]', j >= 0 ? a[j] : ''], ['earlier equal ones', j >= 0 ? add : ''], ['pairs', pairs]] }
    });
    trace.push(note);
  };
  snap(-1, 0, 'start');
  for (let j = 0; j < a.length; j++) {
    const add = cnt[a[j]]; pairs += add; cnt[a[j]]++;
    snap(j, add, `j=${j} x=${a[j]}: ${add} earlier equal; pairs=${pairs}; cnt=${cnt.slice(1).join(' ')}`);
  }
  return {
    spec: {
      scenes: [{ type: 'array', id: 'a', label: 'b', values: a }, { type: 'array', id: 'cnt', label: 'cnt', start: 1, values: cnt.slice(1).map(() => 0) }, { type: 'vars', id: 'v', items: [] }],
      legend: { active: 'b[j] now and its box', read: 'an earlier equal value: one pair each', done: 'already seen' },
      code: ['long long pairs = 0;', 'for (int j = 0; j < n; j++) {', '    pairs += cnt[b[j]];', '    cnt[b[j]]++;', '}'],
      steps
    }, trace
  };
};

// prefix-sums: build pre[0..5] for a[1..5] = 3 1 4 1 5 (indexes from 1)
const PRE_A = [3, 1, 4, 1, 5];
const preOf = a => a.reduce((p, x) => (p.push(p[p.length - 1] + x), p), [0]);
GEN['pre-build'] = () => {
  const a = PRE_A, n = a.length, pre = [0], steps = [], trace = [];
  const snap = (i, note) => {
    const sa = {}, sp = {};
    if (i >= 1) { sa[i] = 'read'; sp[i - 1] = 'read'; sp[i] = 'active'; } else sp[0] = 'active';
    steps.push({
      line: i < 1 ? 1 : [2, 3],
      a: { states: sa, pointers: { i: i >= 1 ? i : null }, rows: [{ label: 'pre', start: 0, values: Array.from({ length: n + 1 }, (_, k) => (k < pre.length ? pre[k] : '')), states: sp }] },
      v: { items: [['pre[i - 1]', i >= 1 ? pre[i - 1] : ''], ['a[i]', i >= 1 ? a[i - 1] : ''], ['pre[i]', i >= 1 ? pre[i] : '']] }
    });
    trace.push(note);
  };
  snap(0, 'pre[0]=0');
  for (let i = 1; i <= n; i++) { pre.push(pre[i - 1] + a[i - 1]); snap(i, `pre[${i}] = ${pre[i - 1]} + ${a[i - 1]} = ${pre[i]}`); }
  return {
    spec: {
      scenes: [{ type: 'array', id: 'a', label: 'a', start: 1, values: a, rows: [{ label: 'pre', start: 0, values: Array(n + 1).fill('') }] }, { type: 'vars', id: 'v', items: [] }],
      legend: { active: 'pre[i]: written now', read: 'the two boxes it adds' },
      code: ['pre[0] = 0;', 'for (int i = 1; i <= n; i++)', '    pre[i] = pre[i - 1] + a[i];'],
      steps
    }, trace: trace
  };
};
// prefix-sums: the query l = 2, r = 4 is pre[4] - pre[1]
GEN['pre-query'] = () => {
  const a = PRE_A, pre = preOf(a), l = 2, r = 4, sa = {}, sp = {};
  for (let k = l; k <= r; k++) sa[k] = 'active';
  for (let k = 1; k < l; k++) sa[k] = 'dim';
  sp[r] = 'read'; sp[l - 1] = 'read';
  return {
    spec: { label: 'a', start: 1, values: a, states: sa, bracket: [l, r], pointers: { l, r }, rows: [{ label: 'pre', start: 0, values: pre, states: sp }], legend: { active: 'a[2..4]: the part we want', dim: 'a[1]: the part we remove', read: 'the two boxes we use' } },
    trace: [`sum a[${l}..${r}] = pre[${r}] - pre[${l - 1}] = ${pre[r]} - ${pre[l - 1]} = ${pre[r] - pre[l - 1]}`]
  };
};
// prefix-sums: the running total as a line
GEN['pre-chart'] = () => {
  const pre = preOf(PRE_A);
  return {
    spec: {
      x: { label: 'i', name: 'i', min: 0, max: PRE_A.length },
      y: { label: 'pre[i] = a[1] + ... + a[i]', min: 0, max: 15 },
      series: [{ name: 'pre[i]', data: pre.map((v, i) => [i, v]) }]
    },
    trace: [pre.join(' ')]
  };
};
// prefix-sums: difference array, add 2 to [1, 3] and 3 to [2, 4] on 5 zeros, then one running sum
GEN['diff-array'] = () => {
  const n = 5, ups = [[1, 3, 2], [2, 4, 3]], d = Array(n + 2).fill(0), a = [], steps = [], trace = [];
  let cur = 0;
  const snap = (line, sd, sa, act, note) => {
    steps.push({
      ...(line ? { line } : {}),
      d: { values: d.slice(1), states: sd, rows: [{ label: 'a', start: 1, values: Array.from({ length: n }, (_, k) => (k < a.length ? a[k] : '')), states: sa }] },
      v: { items: [['doing', act], ['cur', a.length ? cur : '']] }
    });
    trace.push(note);
  };
  snap(undefined, {}, {}, 'start: all zero', 'start');
  for (const [l, r, v] of ups) {
    d[l] += v; d[r + 1] -= v;
    snap([1, 2], { [l]: 'active', [r + 1]: 'active' }, {}, `add ${v} to [${l}, ${r}]`, `add ${v} to [${l},${r}]: d[${l}]+=${v}, d[${r + 1}]-=${v}; d=${d.slice(1).join(' ')}`);
  }
  for (let i = 1; i <= n; i++) {
    cur += d[i]; a.push(cur);
    const sa = {}; for (let k = 1; k <= i; k++) sa[k] = k === i ? 'active' : 'done';
    snap([3, 4, 5], { [i]: 'read' }, sa, `cur += d[${i}]`, `i=${i}: cur += ${d[i]} -> ${cur}`);
  }
  return {
    spec: {
      scenes: [{ type: 'array', id: 'd', label: 'd', start: 1, values: d.slice(1).map(() => 0), rows: [{ label: 'a', start: 1, values: Array(n).fill('') }] }, { type: 'vars', id: 'v', items: [] }],
      legend: { active: 'changed now', read: 'cur adds this box', done: 'finished' },
      code: ['d[l] += v;', 'd[r + 1] -= v;', 'for (int i = 1; i <= n; i++) {', '    cur += d[i];', '    a[i] = cur;', '}'],
      steps
    }, trace
  };
};

// two-pointers: longest window with sum <= 7, counting how often l and r move
GEN['window'] = () => {
  const a = [4, 2, 1, 3, 1, 1, 5], S = 7, n = a.length, steps = [], trace = [];
  let l = 0, sum = 0, best = 0, rMoves = 0, lMoves = 0;
  const snap = (r, removed, line, note) => {
    const states = {};
    for (let k = 0; k < n; k++) if (removed.includes(k)) states[k] = 'bad'; else if (k < l) states[k] = 'dim'; else if (k === r) states[k] = 'active';
    steps.push({
      line,
      a: { states, pointers: { l, r: r < 0 ? null : r }, bracket: r >= l ? [l, r] : null },
      v: { items: [['sum', sum], ['best', best], ['r moved', rMoves], ['l moved', lMoves]] }
    });
    trace.push(note);
  };
  snap(-1, [], 1, 'start');
  for (let r = 0; r < n; r++) {
    rMoves = r + 1; sum += a[r];
    const removed = [];
    while (sum > S) { sum -= a[l]; removed.push(l); l++; lMoves++; }
    best = Math.max(best, r - l + 1);
    snap(r, removed, removed.length ? [2, 3, 4, 5, 7] : [2, 3, 7], `r=${r} add ${a[r]}${removed.length ? ', remove ' + removed.map(k => a[k]).join(', ') : ''}: window [${l},${r}] sum=${sum} len=${r - l + 1} best=${best} moves r=${rMoves} l=${lMoves}`);
  }
  return {
    spec: {
      scenes: [{ type: 'array', id: 'a', label: 'a', values: a }, { type: 'vars', id: 'v', items: [] }],
      legend: { active: 'a[r]: comes in now', bad: 'goes out now', dim: 'left behind for good' },
      code: ['int l = 0, best = 0;  long long sum = 0;', 'for (int r = 0; r < n; r++) {', '    sum += a[r];', '    while (sum > S) {', '        sum -= a[l];  l++;', '    }', '    best = max(best, r - l + 1);', '}'],
      steps
    }, trace
  };
};

// ---------- stage 2b (number-theory, modular, bits, constructive) ----------
// number-theory: Euclid on 10 and 6, drawn as a 10 x 6 rectangle cut into the biggest squares
GEN['nt-euclid'] = () => {
  let a = 10, b = 6;
  const steps = [], trace = [], cut = [];
  let x0 = 0, y0 = 0, w = a, h = b;                    // the part of the paper that is still left
  const snap = (line, r, note) => {
    const rects = cut.map(c => ({ from: c.from, to: c.to, label: c.label, state: 'done' }));
    if (w > 0 && h > 0) rects.push({ from: [x0, y0], to: [x0 + w, y0 + h], label: `${w} x ${h} left`, state: 'active' });
    steps.push({ line, p: { rects }, v: { items: [['a', a], ['b', b], ['r', r == null ? '' : r]] } });   // r = the remainder of the OLD a and b (the code's variable), so it equals the new b
    trace.push(note);
  };
  snap(1, null, `start: a=${a} b=${b}, paper ${w} x ${h}`);
  while (b !== 0) {
    const r = a % b, q = Math.floor(a / b);
    for (let k = 0; k < q; k++) {                      // cut q squares of side b from the long side
      if (w >= h) { cut.push({ from: [x0, y0], to: [x0 + h, y0 + h], label: String(h) }); x0 += h; w -= h; }
      else { cut.push({ from: [x0, y0], to: [x0 + w, y0 + w], label: String(w) }); y0 += w; h -= w; }
    }
    const oa = a, ob = b;
    a = ob; b = r;
    snap([2, 3, 4], r, `a=${oa} b=${ob}: cut ${q} square(s) ${ob}x${ob}; a % b = ${r}; now a=${a} b=${b}`);
  }
  snap(6, null, `b=0: answer a=${a}`);
  return {
    spec: {
      scenes: [{ type: 'plane', id: 'p', x: [0, 10], y: [0, 6], unit: 30, xLabel: 'x', yLabel: 'y' }, { type: 'vars', id: 'v', items: [] }],
      legend: { active: 'paper still left', done: 'a square we cut' },
      code: ['while (b != 0) {', '    long long r = a % b;', '    a = b;', '    b = r;', '}', '// the answer is a'],
      steps
    }, trace
  };
};

// number-theory: the sieve on 1..30, drawn as 5 rows of 6
GEN['nt-sieve'] = () => {
  const N = 30, C = 6, rows = [], isPrime = Array(N + 1).fill(true), steps = [], trace = [];
  isPrime[0] = isPrime[1] = false;
  for (let r = 0; r < N / C; r++) rows.push(Array.from({ length: C }, (_, c) => r * C + c + 1));
  const at = x => `${Math.floor((x - 1) / C)},${(x - 1) % C}`;
  const snap = (line, p, fresh, final, note) => {
    const states = { [at(1)]: 'dim' };
    for (let x = 2; x <= N; x++) {
      if (!isPrime[x]) states[at(x)] = 'bad';
      else if (final || (p != null && x < p)) states[at(x)] = 'done';
    }
    if (p != null) states[at(p)] = isPrime[p] ? 'active' : 'read';
    steps.push({ line, t: { states }, v: { items: [['p', p == null ? '' : p], ['p * p', p == null ? '' : p * p], ['crossed out now', fresh]] } });
    trace.push(note);
  };
  snap(1, null, [], false, 'start: all open, 1 is not prime');
  for (let p = 2; p * p <= N; p++) {
    if (!isPrime[p]) { snap(2, p, [], false, `p=${p}: already crossed out, skip`); continue; }
    const fresh = [];
    for (let x = p * p; x <= N; x += p) if (isPrime[x]) { isPrime[x] = false; fresh.push(x); }
    snap([3, 4], p, fresh, false, `p=${p}: prime; cross out from ${p * p}: ${fresh.join(' ')}`);
  }
  let p = 2; while (p * p <= N) p++;
  snap(1, null, [], true, `p=${p}: ${p * p} > ${N}, stop. primes: ${[...Array(N + 1).keys()].filter(x => isPrime[x]).join(' ')}`);
  return {
    spec: {
      scenes: [{ type: 'table', id: 't', rows }, { type: 'vars', id: 'v', items: [] }],
      legend: { active: 'p: a prime', done: 'prime', bad: 'crossed out', read: 'p: crossed out, skip', dim: 'not prime' },
      code: ['for (int p = 2; p * p <= n; p++) {', '    if (!isPrime[p]) continue;', '    for (int x = p * p; x <= n; x += p)', '        isPrime[x] = false;', '}'],
      steps
    }, trace
  };
};

// modular: fast power 3^13 % (10^9 + 7), the bits of b = 13 and the powers of 3
GEN['mod-power'] = () => {
  const M = 1000000007n, B = 13, steps = [], trace = [];
  let a = 3n, b = B, result = 1n;
  const bits = B.toString(2).split('').map(Number), K = bits.length;             // left = highest bit
  const pw = bits.map((_, i) => '3^' + (1 << (K - 1 - i)));
  const st = {};
  const snap = (line, k, note) => {
    const states = { ...st }; if (k != null) states[K - 1 - k] = 'active';
    steps.push({ line, e: { states }, v: { items: [['b', b], ['a', String(a)], ['result', String(result)]] } });
    trace.push(note);
  };
  snap([1, 2], null, `start: a=3 b=13 result=1`);
  let k = 0;
  while (b > 0) {
    const odd = b % 2 === 1, ob = b, oa = a, or = result;
    if (odd) result = result * a % M;
    a = a * a % M; b = Math.floor(b / 2);
    st[K - 1 - k] = odd ? 'done' : 'dim';
    snap(odd ? [4, 5, 6, 7] : [4, 6, 7], k, `bit ${k} of 13 is ${odd ? 1 : 0} (b=${ob} ${odd ? 'odd' : 'even'}): result ${odd ? `${or}*${oa}=${result}` : 'stays ' + result}; a=${oa}^2=${a}; b=${b}`);
    k++;
  }
  snap(9, null, `b=0: stop, result=${result}`);
  return {
    spec: {
      scenes: [
        { type: 'array', id: 'e', label: '13', index: false, values: bits, rows: [{ label: 'worth', values: pw }] },
        { type: 'vars', id: 'v', items: [] }
      ],
      legend: { active: 'the bit we look at', done: '1: multiply it in', dim: '0: skip it' },
      code: ['long long result = 1 % m;', 'a %= m;', 'while (b > 0) {', '    if (b % 2 == 1)', '        result = result * a % m;', '    a = a * a % m;', '    b /= 2;', '}', 'return result;'],
      steps
    }, trace
  };
};

// bits: 12 AND / OR / XOR 10, one bit at a time from the right
GEN['bits-ops'] = () => {
  const A = 12, B = 10, K = 4, steps = [], trace = [];
  const bit = (x, k) => (x >> k) & 1, col = k => K - 1 - k;
  const worth = Array.from({ length: K }, (_, i) => 1 << (K - 1 - i));
  const and = Array(K).fill(''), or = Array(K).fill(''), xor = Array(K).fill('');
  const snap = (k, done, note) => {
    const s = {}; if (k != null) s[col(k)] = 'active';
    steps.push({
      b: { rows: [
        { label: 'a = 12', values: worth.map((_, i) => bit(A, K - 1 - i)), states: s },
        { label: 'b = 10', values: worth.map((_, i) => bit(B, K - 1 - i)), states: s },
        { label: 'a & b', values: and.slice(), states: s }, { label: 'a | b', values: or.slice(), states: s }, { label: 'a ^ b', values: xor.slice(), states: s }] },
      v: { items: [['a & b', done ? A & B : ''], ['a | b', done ? A | B : ''], ['a ^ b', done ? A ^ B : '']] }
    });
    trace.push(note);
  };
  snap(null, false, 'start: a=1100 b=1010');
  for (let k = 0; k < K; k++) {
    const x = bit(A, k), y = bit(B, k);
    and[col(k)] = x & y; or[col(k)] = x | y; xor[col(k)] = x ^ y;
    snap(k, false, `bit ${k} (worth ${1 << k}): a=${x} b=${y} -> and ${x & y} or ${x | y} xor ${x ^ y}`);
  }
  snap(null, true, `done: a&b=${A & B} a|b=${A | B} a^b=${A ^ B}`);
  return {
    spec: {
      scenes: [{ type: 'array', id: 'b', label: 'worth', index: false, values: worth, rows: [] }, { type: 'vars', id: 'v', items: [] }],
      legend: { active: 'the bit we look at now' },
      steps
    }, trace
  };
};

// bits: one trick on x = 13 = 1101, drawn as rows x, the mask, the result (static pictures)
const bitTrick = (label, mask, f) => () => {
  const x = 13, K = 4, worth = Array.from({ length: K }, (_, i) => 1 << (K - 1 - i));
  const row = v => worth.map(w => (v & w ? 1 : 0)), r = f(x, mask), states = {};
  worth.forEach((w, i) => { if ((mask & w) !== 0) states[i] = 'active'; });
  return {
    spec: { type: 'array', label: 'worth', index: false, values: worth, legend: { active: 'the bit we change or test' },
      rows: [{ label: 'x = 13', values: row(x), states }, { label: 'mask = ' + mask, values: row(mask), states }, { label: label + ' = ' + r, values: row(r), states }] },
    trace: [`x=13 mask=${mask} ${label}=${r}`]
  };
};
GEN['bits-test'] = () => {                              // is bit 2 of 13 on? (x >> 2) & 1
  const x = 13, k = 2, K = 4, worth = Array.from({ length: K }, (_, i) => 1 << (K - 1 - i));
  const row = v => worth.map(w => (v & w ? 1 : 0)), sh = x >> k, r = sh & 1;
  return {
    spec: { type: 'array', label: 'worth', index: false, values: worth, legend: { active: 'bit 2 of x, moved to the right end' },
      rows: [{ label: 'x = 13', values: row(x), states: { [K - 1 - k]: 'active' } }, { label: 'x >> 2 = ' + sh, values: row(sh), states: { [K - 1]: 'active' } },
        { label: '(x >> 2) & 1 = ' + r, values: row(r), states: { [K - 1]: 'active' } }] },
    trace: [`x=13 x>>2=${sh} &1=${r}`]
  };
};
GEN['bits-set'] = bitTrick('x | mask', 2, (x, m) => x | m);
GEN['bits-clear'] = bitTrick('x & ~mask', 1, (x, m) => x & ~m);
GEN['bits-flip'] = bitTrick('x ^ mask', 8, (x, m) => x ^ m);

// constructive: split 1..8 into two groups with equal sums, blocks of 4: (a, a+3) to A, (a+1, a+2) to B
GEN['con-split8'] = () => {
  const n = 8, values = [], states = {};
  let sa = 0, sb = 0;
  for (let a = 1; a + 3 <= n; a += 4) [a, a + 3].forEach(x => { states[x - 1] = 'done'; sa += x; }), [a + 1, a + 2].forEach(x => { states[x - 1] = 'queued'; sb += x; });
  for (let x = 1; x <= n; x++) values.push(x);
  return {
    spec: { type: 'array', label: 'n = 8', index: false, values, states, legend: { done: `group A, sum ${sa}`, queued: `group B, sum ${sb}` } },
    trace: [`A sum ${sa}, B sum ${sb}`]
  };
};

// ---------- stage 3b (dsu, toposort, combinatorics, interactive): self-contained block ----------
(() => {
  // DSU: union by size + path compression, 6 elements; parent arrows child -> parent
  const DSU_POS = { 1: [1.5, 0], 2: [0, 1], 3: [1.5, 1], 4: [1.5, 2], 5: [3, 1], 6: [3, 2] };
  GEN['dsu-union'] = () => {
    const n = 6, parent = [0], sz = [0], steps = [], trace = [];
    for (let i = 1; i <= n; i++) { parent.push(i); sz.push(1); }
    const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const nodes = Object.keys(DSU_POS).map(k => ({ id: +k, x: DSU_POS[k][0], y: DSU_POS[k][1], at: DSU_POS[k][1] === 2 ? 'below' : 'above' }));
    let groups = n;
    const snap = (line, act, newEdge, changed, op, note) => {
      const states = {}, notes = {}, edges = [], edgeStates = {};
      for (let i = 1; i <= n; i++) {
        states[i] = act.includes(i) ? 'active' : '';
        if (parent[i] === i) notes[i] = 'size ' + sz[i];
        else edges.push({ from: i, to: parent[i] });
      }
      if (newEdge) edgeStates[newEdge + '-' + parent[newEdge]] = 'active';
      const ast = {}; changed.forEach(i => { ast[i] = 'active'; });   // states of a scene with start: 1 are keyed by the printed index
      const st = { g: { states, notes, edges, edgeStates }, p: { values: parent.slice(1), states: ast }, v: { items: [['call', op], ['groups', groups]] } };
      steps.push(line.length === 0 ? st : { line, ...st });
      trace.push(note);
    };
    snap([], [], null, [], '', 'start: parent=' + parent.slice(1).join(' '));
    const ops = [[1, 2], [3, 4], [5, 6], [2, 4], [2, 6], [1, 3]];
    ops.forEach(([a, b], k) => {
      const op = `unite(${a}, ${b})`, ra = find(a), rb = find(b);
      if (ra === rb) { snap([6, 7], [ra], null, [], op, `${op}: find(${a})=${ra}, find(${b})=${rb}: same leader -> false`); return; }
      if (k >= 3) snap(6, [ra, rb], null, [], op, `${op}: find(${a})=${ra}, find(${b})=${rb}, sizes ${sz[ra]} and ${sz[rb]}`);
      let x = ra, y = rb; if (sz[x] < sz[y]) [x, y] = [y, x];
      parent[y] = x; sz[x] += sz[y]; groups--;
      snap(k >= 3 ? [8, 9] : [6, 8, 9], [x], y, [y], op, `${op}: parent[${y}]=${x}, size ${sz[x]}; parent=${parent.slice(1).join(' ')}; groups=${groups}`);
    });
    return {
      spec: {
        scenes: [{ type: 'graph', id: 'g', unit: 80, directed: true, nodes, edges: [] },
          { type: 'array', id: 'p', label: 'parent', start: 1, values: parent.slice(1) },
          { type: 'vars', id: 'v', items: [] }],
        legend: { active: 'changes now' },
        code: ['int find(int x) {', '    if (parent[x] == x) return x;', '    return parent[x] = find(parent[x]);', '}', 'bool unite(int a, int b) {',
          '    a = find(a);  b = find(b);', '    if (a == b) return false;', '    if (sz[a] < sz[b]) swap(a, b);', '    parent[b] = a;  sz[a] += sz[b];', '    return true;', '}'],
        steps
      }, trace
    };
  };

  // DSU: path compression on a chain 5 -> 4 -> 3 -> 2 -> 1
  GEN['dsu-compress'] = () => {
    const pos = { 1: [0, 0], 2: [1.3, 0.15], 3: [2.4, 0.7], 4: [3.1, 1.6], 5: [3.3, 2.7] };
    const nodes = Object.keys(pos).map(k => ({ id: +k, x: pos[k][0], y: pos[k][1] }));
    const parent = [0, 1, 1, 2, 3, 4], steps = [], trace = [];
    const snap = (line, act, read, changed, path, note) => {
      const states = {}, edges = [], edgeStates = {};
      for (let i = 1; i <= 5; i++) {
        states[i] = act.includes(i) ? 'active' : read.includes(i) ? 'read' : '';
        if (parent[i] !== i) edges.push({ from: i, to: parent[i] });
      }
      changed.forEach(i => { edgeStates[i + '-' + parent[i]] = 'active'; });
      const ast = {}; changed.forEach(i => { ast[i] = 'active'; });   // states of a scene with start: 1 are keyed by the printed index
      const st = { g: { states, notes: { 1: 'leader' }, edges, edgeStates }, p: { values: parent.slice(1), states: ast }, v: { items: [['path', path]] } };
      steps.push(Array.isArray(line) && line.length === 0 ? st : { line, ...st });
      trace.push(note);
    };
    snap([], [5], [], [], [5], 'start: a chain, find(5)');
    // walk up (the recursion goes down to the leader)
    const path = []; for (let x = 5; ; x = parent[x]) { path.push(x); if (parent[x] === x) break; }
    snap(2, [1], path.slice(0, -1), [], path.slice(), 'walk up: ' + path.join(' -> ') + ', leader 1');
    // on the way back every vertex on the path gets parent = leader
    const back = path.slice(0, -1).reverse(); // 2, 3, 4, 5
    const leader = path[path.length - 1];
    const moved = [];
    back.forEach(x => { if (parent[x] !== leader) { parent[x] = leader; moved.push(x); } });
    snap(3, [], [], moved, [], 'on the way back: parent of ' + moved.join(',') + ' becomes ' + leader + '; parent=' + parent.slice(1).join(' '));
    snap(2, [1], [5], [], [5, 1], 'next find(5): one step 5 -> 1');
    return {
      spec: {
        scenes: [{ type: 'graph', id: 'g', unit: 80, directed: true, nodes, edges: [] },
          { type: 'array', id: 'p', label: 'parent', start: 1, values: parent.slice(1) },
          { type: 'vars', id: 'v', items: [] }],
        legend: { active: 'changes now', read: 'on the walk' },
        code: ['int find(int x) {', '    if (parent[x] == x) return x;', '    return parent[x] = find(parent[x]);', '}'],
        steps
      }, trace
    };
  };

  // Toposort: Kahn's algorithm on the "getting dressed" graph
  const TS = {
    pos: { 1: [0, 0], 2: [0, 1.1], 4: [0, 2.2], 3: [2, 0.4], 5: [2, 1.5], 6: [3.6, 2.3] },
    edges: [[1, 3], [2, 3], [2, 5], [4, 5], [4, 6], [5, 6]]
  };
  const kahn = (ids, E) => {
    const adj = {}, indeg = {}; ids.forEach(v => { adj[v] = []; indeg[v] = 0; });
    E.forEach(([a, b]) => { adj[a].push(b); indeg[b]++; });
    return { adj, indeg };
  };
  GEN['kahn'] = () => {
    const ids = [1, 2, 3, 4, 5, 6], { adj, indeg } = kahn(ids, TS.edges), steps = [], trace = [];
    const nodes = ids.map(v => ({ id: v, x: TS.pos[v][0], y: TS.pos[v][1], at: v === 1 || v === 3 ? 'above' : 'below' }));
    const q = [], order = [], removed = new Set();
    const snap = (line, v, fresh, note) => {
      const states = {}, notes = {}, edgeStates = {};
      ids.forEach(u => {
        states[u] = u === v ? 'active' : order.includes(u) ? 'done' : q.includes(u) ? 'queued' : '';
        notes[u] = 'in ' + indeg[u];
      });
      TS.edges.forEach(([a, b]) => { const k = a + '-' + b; if (removed.has(k)) edgeStates[k] = a === v && fresh ? 'active' : 'dim'; });
      steps.push({ line, g: { states, notes, edgeStates }, v: { items: [['v', v == null ? '' : v], ['queue', q.slice()], ['order', order.slice()]] } });
      trace.push(note);
    };
    ids.forEach(v => { if (indeg[v] === 0) q.push(v); });
    q.sort((a, b) => a - b);
    snap([1, 2], null, false, 'start: indeg ' + ids.map(v => v + ':' + indeg[v]).join(' ') + '; queue=[' + q.join(' ') + ']');
    while (q.length) {
      const v = q.shift(); order.push(v); const freed = [];
      adj[v].forEach(to => { indeg[to]--; removed.add(v + '-' + to); if (indeg[to] === 0) { q.push(to); freed.push(to); } });
      snap(adj[v].length ? (freed.length ? [4, 5, 7, 8] : [4, 5, 7]) : [4, 5], v, true, `take ${v}: arrows to ${adj[v].join(',') || 'none'}; free now: ${freed.join(',') || 'none'}; queue=[${q.join(' ')}]; order=${order.join(' ')}`);
    }
    snap(11, null, false, 'queue empty: order ' + order.join(' ') + ', size ' + order.length + ' = n');
    return {
      spec: {
        scenes: [{ type: 'graph', id: 'g', unit: 84, directed: true, nodes, edges: TS.edges.map(([from, to]) => ({ from, to })) },
          { type: 'vars', id: 'v', items: [] }],
        legend: { active: 'v: taken now', queued: 'free, in the queue', done: 'in the order', dim: 'arrow removed' },
        code: ['for (int v = 1; v <= n; v++)', '    if (indeg[v] == 0) q.push(v);', 'while (!q.empty()) {', '    int v = q.front();  q.pop();',
          '    order.push_back(v);', '    for (int to : adj[v]) {', '        indeg[to]--;', '        if (indeg[to] == 0) q.push(to);', '    }', '}',
          '// order.size() < n  ->  a cycle'],
        steps
      }, trace
    };
  };
  // Toposort: a graph with a cycle 2 -> 3 -> 2; the final state of Kahn's algorithm (static)
  GEN['kahn-cycle'] = () => {
    const ids = [1, 2, 3, 4], E = [[1, 2], [2, 3], [3, 4], [4, 2]], { adj, indeg } = kahn(ids, E);
    const pos = { 1: [0, 0.5], 2: [1.4, 0.5], 3: [2.6, 0], 4: [2.6, 1] };
    const q = ids.filter(v => indeg[v] === 0), order = [], removed = new Set();
    while (q.length) { const v = q.shift(); order.push(v); adj[v].forEach(to => { indeg[to]--; removed.add(v + '-' + to); if (indeg[to] === 0) q.push(to); }); }
    const states = {}, notes = {}, edgeStates = {};
    ids.forEach(v => { states[v] = order.includes(v) ? 'done' : 'bad'; notes[v] = 'in ' + indeg[v]; });
    removed.forEach(k => { edgeStates[k] = 'dim'; });
    return {
      spec: {
        directed: true, unit: 84,
        nodes: ids.map(v => ({ id: v, x: pos[v][0], y: pos[v][1], at: v === 4 ? 'below' : 'above' })),
        edges: E.map(([from, to]) => ({ from, to })), states, notes, edgeStates,
        legend: { done: 'in the order', bad: 'never free', dim: 'arrow removed' }
      },
      trace: ['order=' + order.join(' ') + ' (size ' + order.length + ' < ' + ids.length + '); left in-degrees ' + ids.map(v => v + ':' + indeg[v]).join(' ')]
    };
  };

  // Combinatorics: Pascal's triangle, each cell = the two cells above it
  GEN['pascal'] = () => {
    const N = 5, C = [], steps = [], trace = [];
    for (let n = 0; n <= N; n++) C.push(new Array(N + 1).fill(''));
    const snap = (line, act, note) => {
      const states = {};
      if (act) { const [n, r] = act; states[n + ',' + r] = 'active'; states[(n - 1) + ',' + (r - 1)] = 'read'; states[(n - 1) + ',' + r] = 'read'; }
      steps.push({ line, t: { rows: C.map(r => r.slice()), states } });
      trace.push(note);
    };
    for (let n = 0; n <= N; n++) {
      C[n][0] = C[n][n] = 1;
      if (n === 1) snap(2, null, 'rows 0 and 1: ones at both ends');
      for (let r = 1; r < n; r++) {
        C[n][r] = C[n - 1][r - 1] + C[n - 1][r];
        if (n <= 4) snap(r === 1 ? [2, 4, 5] : [4, 5], [n, r], `C(${n},${r}) = ${C[n - 1][r - 1]} + ${C[n - 1][r]} = ${C[n][r]}`);
      }
    }
    snap([2, 3, 4, 5], null, 'row 5: ' + C[N].join(' '));
    return {
      spec: {
        scenes: [{ type: 'table', id: 't', corner: 'n \\ r', colLabels: [0, 1, 2, 3, 4, 5], rowLabels: ['0', '1', '2', '3', '4', '5'], rows: C.map(() => new Array(N + 1).fill('')) }],
        legend: { active: 'C(n, r): filled now', read: 'the two cells it adds' },
        code: ['for (int n = 0; n <= 5; n++) {', '    C[n][0] = C[n][n] = 1;', '    for (int r = 1; r < n; r++)', '        C[n][r] = C[n-1][r-1]',
          '                + C[n-1][r];', '}'],
        steps
      }, trace
    };
  };

  // Interactive: guess a hidden number from 1 to 16 with "? q" -> 1 if hidden >= q
  GEN['guess'] = () => {
    const hidden = 11, N = 16, steps = [], trace = [];
    let lo = 1, hi = N + 1, asked = 0;
    const snap = (line, mid, print, reply, note) => {
      const states = {};
      for (let x = 1; x <= N + 1; x++) if (x < lo || x >= hi) states[x] = 'dim';
      if (mid != null) states[mid] = 'active';
      steps.push({ line, T: { range: [lo, hi - 1], pointers: { lo, hi, mid: mid == null ? null : mid }, states },
        v: { items: [['you print', print], ['judge answers', reply], ['questions', asked]] } });
      trace.push(note);
    };
    snap([1, 2], null, '', '', `start: hidden=${hidden}, lo=${lo}, hi=${hi}`);
    while (hi - lo > 1) {
      const mid = lo + Math.floor((hi - lo) / 2), reply = hidden >= mid ? 1 : 0; asked++;
      snap([4, 5, 6, 7], mid, '? ' + mid, reply, `ask ? ${mid} -> ${reply}`);
      if (reply === 1) lo = mid; else hi = mid;
      snap(reply ? 9 : 10, null, '? ' + mid, reply, `${reply ? 'lo' : 'hi'} = ${mid}; range ${lo}..${hi - 1}`);
    }
    snap(12, null, '! ' + lo, '', `print ! ${lo} after ${asked} questions`);
    return {
      spec: {
        scenes: [{ type: 'numberline', id: 'T', min: 1, max: N + 1 }, { type: 'vars', id: 'v', items: [] }],
        legend: { active: 'mid: we ask about it', dim: 'not possible any more' },
        code: ['int lo = 1;   // hidden >= 1: yes', 'int hi = 17;  // hidden >= 17: no', 'while (hi - lo > 1) {', '    int mid = lo + (hi - lo) / 2;',
          '    cout << "? " << mid << endl;', '    int reply;', '    cin >> reply;', '    if (reply == -1) return 0;', '    if (reply == 1) lo = mid;', '    else            hi = mid;', '}',
          'cout << "! " << lo << endl;'],
        steps
      }, trace
    };
  };
})();

// ---------- stage 3a (recursion, trees, dp, dijkstra) ----------
{
  // recursion: sum(3) = 3 + sum(2), traced call by call
  GEN['rec-sum'] = () => {
    const N = 3, stack = [], ret = {}, steps = [], trace = [];
    const nodes = [], edges = [];
    for (let k = N; k >= 0; k--) { nodes.push({ id: k, label: 'n=' + k, x: N - k, y: N - k }); if (k) edges.push({ from: k, to: k - 1, directed: true }); }
    const snap = (line, note) => {
      const states = {}, notes = {}, top = stack[stack.length - 1];
      for (let k = N; k >= 0; k--) {
        states[k] = k in ret ? 'done' : k === top ? 'active' : stack.includes(k) ? 'queued' : '';
        notes[k] = k in ret ? 'returns ' + ret[k] : k === top ? 'running' : stack.includes(k) ? 'waits' : '';
      }
      steps.push({ line, g: { states, notes }, v: { items: [['call stack', stack.map(k => `sum(${k})`)], ['last returned', Object.keys(ret).length ? ret[Math.max(...Object.keys(ret).map(Number))] : '']] } });
      trace.push(note);
    };
    (function sum(n) {
      stack.push(n);
      if (n === 0) { ret[0] = 0; stack.pop(); snap(2, 'sum(0): base case, return 0'); return 0; }   // pop first: a call that returned is off the stack
      snap(3, `sum(${n}) starts, calls sum(${n - 1}) and waits`);
      const r = n + sum(n - 1);
      ret[n] = r; stack.pop(); snap(3, `sum(${n}) = ${n} + ${r - n} = ${r}, returns`);
      return r;
    })(N);
    return {
      spec: {
        scenes: [{ type: 'graph', id: 'g', unit: 70, nodes, edges }, { type: 'vars', id: 'v', items: [] }],
        legend: { active: 'running now', queued: 'waiting for the call it made', done: 'returned' },
        code: ['int sum(int n) {', '    if (n == 0) return 0; // base', '    return n + sum(n - 1);', '}'],
        steps
      }, trace
    };
  };

  // recursion: all subsets of {1, 2, 3}, take (left) or skip (right), with backtracking
  GEN['rec-subsets'] = () => {
    const a = [1, 2, 3], n = a.length, nodes = [], edges = [];
    let leafX = 0;
    (function build(p) {                     // p = string of T (take) / S (skip)
      const id = 'r' + p, chosen = [...p].map((c, i) => (c === 'T' ? a[i] : 0)).filter(Boolean);
      const node = { id, label: chosen.length ? chosen.join('') : '{}', y: p.length * 1.5 };
      nodes.push(node);
      if (p.length === n) { node.x = leafX++; return node.x; }
      const xl = build(p + 'T'), xr = build(p + 'S');
      edges.push({ from: id, to: id + 'T', w: '+' + a[p.length] }, { from: id, to: id + 'S' });
      node.x = (xl + xr) / 2; return node.x;
    })('');
    // run the backtracking and record a snapshot at every moment
    const events = [], chosen = [], stack = [], done = new Set(), printed = [];
    const rec = (kind, line) => events.push({ kind, line, cur: stack[stack.length - 1], stack: stack.slice(), chosen: chosen.slice(), done: new Set(done), printed: printed.slice() });
    (function go(i, p) {
      stack.push('r' + p);
      if (i === n) {
        printed.push(chosen.length ? '{' + chosen.join(',') + '}' : '{}');
        rec('leaf', [2, 3]); stack.pop(); done.add('r' + p); return;
      }
      rec('enter', i === 0 ? 1 : [5, 6]);
      chosen.push(a[i]); go(i + 1, p + 'T');
      chosen.pop(); rec('undo', 7);
      go(i + 1, p + 'S');
      stack.pop(); done.add('r' + p);
    })(0, '');
    rec('end', 9);
    // shown: everything in the left half one by one; the right half (skip 1) as its first call and then all at once
    const shown = events.filter(e => e.kind !== 'undo' && (e.cur == null || e.cur === 'r' || e.cur.startsWith('rT') || e.cur === 'rS'));
    const steps = [], trace = [];
    for (const e of shown) {
      const states = {}, notes = {}, edgeStates = {};
      for (const nd of nodes) {
        states[nd.id] = e.done.has(nd.id) ? 'done' : nd.id === e.cur ? 'active' : e.stack.includes(nd.id) ? 'queued' : '';
      }
      for (const ed of edges) if (e.stack.includes(ed.to) || e.done.has(ed.to)) edgeStates[ed.from + '-' + ed.to] = e.stack.includes(ed.to) ? 'active' : 'done';
      // a skip right after an undo: the caption explains the pop_back that just ran
      const prev = events[events.indexOf(e) - 1], undone = prev && prev.kind === 'undo';
      steps.push({ line: undone && e.kind !== 'end' ? (e.kind === 'leaf' ? [7, 8, 3] : [7, 8]) : e.line, g: { states, notes, edgeStates }, v: { items: [['call stack', e.stack.map(id => `go(${id.length - 1})`)], ['chosen', e.chosen], ['printed', e.printed.join(' ')]] } });
      trace.push(`${e.kind}${undone ? ' (after undo)' : ''} at ${e.cur || '-'}: chosen=[${e.chosen}] stack=[${e.stack}] printed=${e.printed.join(' ')}`);
    }
    return {
      spec: {
        scenes: [{ type: 'graph', id: 'g', unit: 48, nodes, edges }, { type: 'vars', id: 'v', items: [] }],
        legend: { active: 'the call running now', queued: 'waiting for its call', done: 'returned' },
        code: ['void go(int i) {', '    if (i == n) {     // base case', '        print(chosen); return;', '    }', '    chosen.push_back(a[i]); // do', '    go(i + 1);', '    chosen.pop_back();  // undo', '    go(i + 1);          // skip', '}'],
        steps
      }, trace
    };
  };

  // dp: stairs, dp[i] = dp[i-1] + dp[i-2], n = 6
  GEN['dp-stairs'] = () => {
    const N = 6, dp = Array(N + 1).fill(''), steps = [], trace = [];
    const snap = (line, cur, reads, f, note) => {
      const states = {};
      dp.forEach((v, i) => { if (v !== '') states['0,' + i] = 'done'; });
      reads.forEach(i => { states['0,' + i] = 'read'; });
      cur.forEach(i => { states['0,' + i] = 'active'; });
      steps.push({ line, t: { rows: [dp.slice()], states }, v: { items: [['i', cur.length === 1 ? cur[0] : ''], ['dp[i]', f]] } });
      trace.push(note);
    };
    dp[0] = 1; dp[1] = 1;
    snap(1, [0, 1], [], '', 'base: dp[0]=1, dp[1]=1');
    for (let i = 2; i <= N; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      snap(3, [i], [i - 1, i - 2], `${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`, `i=${i}: dp=${dp[i - 1]}+${dp[i - 2]}=${dp[i]}`);
    }
    return {
      spec: {
        scenes: [{ type: 'table', id: 't', corner: 'i', colLabels: [...Array(N + 1).keys()], rowLabels: ['dp[i]'], rows: [Array(N + 1).fill('')] }, { type: 'vars', id: 'v', items: [] }],
        legend: { active: 'the cell we fill', read: 'the cells it reads', done: 'filled' },
        code: ['dp[0] = 1;  dp[1] = 1;      // base cases', 'for (int i = 2; i <= n; i++)', '    dp[i] = dp[i - 1] + dp[i - 2];'],
        steps
      }, trace
    };
  };

  // dp: min coins with coins 1, 3, 4 for sums 0..6, and greedy on the same sums
  GEN['dp-coins'] = () => {
    const coins = [1, 3, 4], N = 6, INF = 1e9, dp = [0];
    for (let x = 1; x <= N; x++) { dp[x] = INF; for (const c of coins) if (c <= x) dp[x] = Math.min(dp[x], dp[x - c] + 1); }
    const greedy = [];
    for (let x = 0; x <= N; x++) { let r = x, k = 0; for (const c of [...coins].sort((p, q) => q - p)) while (r >= c) { r -= c; k++; } greedy.push(k); }
    const states = { ['0,' + N]: 'active' };
    coins.forEach(c => { states['0,' + (N - c)] = 'read'; });
    for (let x = 0; x <= N; x++) if (greedy[x] !== dp[x]) states['1,' + x] = 'bad';
    return {
      spec: { corner: 'x', colLabels: [...Array(N + 1).keys()], rowLabels: ['dp[x]', 'greedy'], rows: [dp, greedy], states, legend: { active: 'dp[6]', read: 'dp[6-1], dp[6-3], dp[6-4]', bad: 'greedy uses more coins' } },
      trace: ['dp     ' + dp.join(' '), 'greedy ' + greedy.join(' ')]
    };
  };

  // dp: paths in a 3 x 4 grid, moves right or down
  GEN['dp-grid'] = () => {
    const R = 3, C = 4, dp = [...Array(R)].map(() => Array(C).fill('')), steps = [], trace = [];
    const snap = (line, cur, reads, f, note) => {
      const states = {};
      dp.forEach((r, i) => r.forEach((v, j) => { if (v !== '') states[i + ',' + j] = 'done'; }));
      reads.forEach(([i, j]) => { states[i + ',' + j] = 'read'; });
      cur.forEach(([i, j]) => { states[i + ',' + j] = 'active'; });
      steps.push({ line, t: { rows: dp.map(r => r.slice()), states }, v: { items: [['cell', cur.length === 1 ? `(${cur[0][0]}, ${cur[0][1]})` : ''], ['dp', f]] } });
      trace.push(note);
    };
    const edge = [];
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) if (i === 0 || j === 0) { dp[i][j] = 1; edge.push([i, j]); }
    snap(3, edge, [], '1', 'first row and first column: 1 way each');
    for (let i = 1; i < R; i++) for (let j = 1; j < C; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
      snap(5, [[i, j]], [[i - 1, j], [i, j - 1]], `${dp[i - 1][j]} + ${dp[i][j - 1]} = ${dp[i][j]}`, `(${i},${j}) = ${dp[i - 1][j]} + ${dp[i][j - 1]} = ${dp[i][j]}`);
    }
    return {
      spec: {
        scenes: [{ type: 'table', id: 't', corner: 'i \\ j', colLabels: [...Array(C).keys()], rowLabels: [...Array(R).keys()].map(String), rows: dp.map(r => r.map(() => '')) }, { type: 'vars', id: 'v', items: [] }],
        legend: { active: 'the cell we fill', read: 'above and left', done: 'filled' },
        code: ['for (int i = 0; i < 3; i++)', '    for (int j = 0; j < 4; j++) {', '        if (i == 0 || j == 0) dp[i][j] = 1;', '        else', '            dp[i][j] = dp[i-1][j] + dp[i][j-1];', '    }'],
        steps
      }, trace
    };
  };

  // dp: one knapsack item (weight 2, value 3), bag W = 4: the weight loop forward vs backward
  GEN['dp-knap'] = () => {
    const W = 4, w = 2, v = 3, start = Array(W + 1).fill(0);
    const fw = start.slice(), bw = start.slice(), log = [];
    for (let c = w; c <= W; c++) { fw[c] = Math.max(fw[c], fw[c - w] + v); log.push(`forward c=${c}: ${fw[c]}`); }
    for (let c = W; c >= w; c--) { bw[c] = Math.max(bw[c], bw[c - w] + v); log.push(`backward c=${c}: ${bw[c]}`); }
    const states = {};
    for (let c = 0; c <= W; c++) {
      if (fw[c] !== start[c]) states['1,' + c] = fw[c] > v ? 'bad' : 'done';
      if (bw[c] !== start[c]) states['2,' + c] = 'done';
    }
    return {
      spec: { corner: 'c', colLabels: [...Array(W + 1).keys()], rowLabels: ['before', 'c going up', 'c going down'], rows: [start, fw, bw], states, legend: { done: 'item taken once', bad: 'item taken twice: wrong' } },
      trace: log
    };
  };

  // dijkstra: the 5-vertex example from vertex 1
  GEN['dijkstra'] = () => {
    const nodes = [{ id: 1, x: 0, y: 1 }, { id: 2, x: 1.4, y: 0 }, { id: 3, x: 1.4, y: 2 }, { id: 4, x: 2.8, y: 1 }, { id: 5, x: 4.1, y: 1 }];
    const E = [[1, 2, 4], [1, 3, 1], [3, 2, 2], [2, 4, 5], [3, 4, 8], [4, 5, 3]];
    const g = {}; nodes.forEach(nd => { g[nd.id] = []; });
    E.forEach(([a, b, w]) => { g[a].push([b, w]); g[b].push([a, w]); });
    const dist = {}, parent = {}, fixed = new Set(), pq = [], steps = [], trace = [];
    nodes.forEach(nd => { dist[nd.id] = Infinity; });
    const pqShow = () => pq.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]).map(([d, x]) => `(${d}, ${x})`);
    const snap = (line, cur, curState, improved, taken, note) => {
      const states = {}, notes = {}, edgeStates = {};
      for (const nd of nodes) {
        const id = nd.id;
        states[id] = id === cur ? curState : fixed.has(id) ? 'done' : pq.some(p => p[1] === id) ? 'queued' : '';
        notes[id] = 'dist ' + (dist[id] === Infinity ? '∞' : dist[id]);
      }
      for (const id in parent) edgeStates[parent[id] + '-' + id] = improved.includes(Number(id)) ? 'active' : fixed.has(Number(id)) ? 'done' : '';
      for (const k in edgeStates) if (!edgeStates[k]) delete edgeStates[k];
      steps.push({ line, g: { states, notes, edgeStates }, v: { items: [['taken (d, v)', taken], ['priority queue', pqShow()]] } });
      trace.push(note);
    };
    dist[1] = 0; pq.push([0, 1]);
    snap(1, null, '', [], '', 'start: dist[1]=0, pq=(0,1)');
    while (pq.length) {
      pq.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
      const [d, v] = pq.shift();
      if (d > dist[v]) { snap(5, v, 'bad', [], `(${d}, ${v})`, `take (${d},${v}): old pair, dist[${v}]=${dist[v]}, skip`); continue; }
      fixed.add(v);
      const improved = [];
      for (const [to, w] of g[v]) if (dist[v] + w < dist[to]) { dist[to] = dist[v] + w; parent[to] = v; pq.push([dist[to], to]); improved.push(to); }
      snap(improved.length ? [3, 4, 9, 10, 11] : [3, 4, 9], v, 'active', improved, `(${d}, ${v})`, `take (${d},${v}): fix ${v}; improved ${improved.map(t => t + '->' + dist[t]).join(', ') || 'none'}; pq=${pqShow().join(' ')}`);
    }
    snap(2, null, '', [], '', 'queue empty: dist=' + nodes.map(nd => dist[nd.id]).join(' '));
    return {
      spec: {
        scenes: [{ type: 'graph', id: 'g', unit: 80, nodes, edges: E.map(([from, to, w]) => ({ from, to, w })) }, { type: 'vars', id: 'v', items: [] }],
        legend: { active: 'v: taken and fixed now', queued: 'has a pair in the queue', done: 'fixed: final distance', bad: 'old pair: skipped' },
        code: ['dist[1] = 0;  pq.push({0, 1});', 'while (!pq.empty()) {', '    long long d = pq.top().first;', '    int v = pq.top().second;  pq.pop();', '    if (d > dist[v]) continue;', '    for (auto edge : g[v]) {', '        int to = edge.first;', '        long long w = edge.second;', '        if (dist[v] + w < dist[to]) {', '            dist[to] = dist[v] + w;', '            pq.push({dist[to], to});', '        }', '    }', '}'],
        steps
      }, trace
    };
  };

  // trees: the 7-vertex tree, rooted at 1
  const TN = [{ id: 1, x: 2, y: 0 }, { id: 2, x: 1, y: 1 }, { id: 3, x: 3, y: 1 }, { id: 4, x: 0.4, y: 2 }, { id: 5, x: 1.6, y: 2 }, { id: 6, x: 3, y: 2 }, { id: 7, x: 3, y: 3 }];
  const TE = [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [6, 7]];
  const tadj = () => { const g = {}; TN.forEach(nd => { g[nd.id] = []; }); TE.forEach(([a, b]) => { g[a].push(b); g[b].push(a); }); for (const k in g) g[k].sort((p, q) => p - q); return g; };
  const treeScene = () => ({ type: 'graph', id: 'g', unit: 80, nodes: TN, edges: TE.map(([from, to]) => ({ from, to })) });

  GEN['tree-dfs'] = () => {
    const g = tadj(), depth = { 1: 0 }, sz = {}, stack = [], fin = new Set(), events = [];
    const rec = (kind, v) => events.push({ kind, v, stack: stack.slice(), depth: { ...depth }, sz: { ...sz }, fin: new Set(fin) });
    (function dfs(v, parent) {
      stack.push(v); sz[v] = 1;
      const kids = g[v].filter(t => t !== parent);
      if (kids.length) rec('enter', v);
      for (const to of kids) { depth[to] = depth[v] + 1; dfs(to, v); sz[v] += sz[to]; }
      fin.add(v); rec(kids.length ? 'finish' : 'leaf', v); stack.pop();
    })(1, 0);
    const steps = [], trace = [];
    for (const e of events) {
      const states = {}, notes = {}, edgeStates = {};
      for (const nd of TN) {
        const id = nd.id;
        states[id] = id === e.v ? 'active' : e.fin.has(id) ? 'done' : e.stack.includes(id) ? 'queued' : '';
        notes[id] = id in e.depth && (e.stack.includes(id) || e.fin.has(id)) ? 'd ' + e.depth[id] + (e.fin.has(id) ? ', s ' + e.sz[id] : '') : '';
      }
      for (const [a, b] of TE) if (e.stack.includes(b) || e.fin.has(b)) edgeStates[a + '-' + b] = e.stack.includes(b) ? 'active' : 'done';
      steps.push({ line: e.kind === 'enter' ? (e.v === 1 ? 2 : [5, 6]) : e.kind === 'leaf' ? [5, 6, 2] : 7, g: { states, notes, edgeStates }, v: { items: [['call stack', e.stack.map(x => `dfs(${x})`)], ['depth[v]', e.depth[e.v]], ['sz[v]', e.kind === 'enter' ? '' : e.sz[e.v]]] } });
      trace.push(`${e.kind} ${e.v}: depth ${e.depth[e.v]}${e.kind === 'enter' ? '' : ', size ' + e.sz[e.v]}; stack=[${e.stack}]`);
    }
    return {
      spec: {
        scenes: [treeScene(), { type: 'vars', id: 'v', items: [] }],
        legend: { active: 'v: the call we look at', queued: 'waiting for a child', done: 'finished: size known' },
        code: ['void dfs(int v, int parent) {', '    sz[v] = 1;', '    for (int to : g[v]) {', '        if (to == parent) continue;', '        depth[to] = depth[v] + 1;', '        dfs(to, v);', '        sz[v] += sz[to];', '    }', '}'],
        steps
      }, trace
    };
  };

  GEN['tree-diameter'] = () => {
    const g = tadj(), steps = [], trace = [];
    const bfs = s => { const d = { [s]: 0 }, par = { [s]: 0 }, q = [s]; while (q.length) { const v = q.shift(); for (const t of g[v]) if (!(t in d)) { d[t] = d[v] + 1; par[t] = v; q.push(t); } } return { d, par }; };
    const far = d => TN.map(nd => nd.id).reduce((b, x) => (d[x] > d[b] ? x : b));
    const snap = (start, d, best, path, note) => {
      const states = {}, notes = {}, edgeStates = {};
      for (const nd of TN) {
        states[nd.id] = nd.id === start ? 'active' : nd.id === best ? 'done' : path.includes(nd.id) ? 'done' : '';
        notes[nd.id] = 'dist ' + d[nd.id];
      }
      for (let i = 0; i + 1 < path.length; i++) edgeStates[path[i] + '-' + path[i + 1]] = 'done';
      steps.push({ g: { states, notes, edgeStates }, v: { items: [['BFS from', start], ['farthest vertex', best], ['its dist', d[best]]] } });
      trace.push(note);
    };
    const A = bfs(1), a = far(A.d);
    snap(1, A.d, a, [], `BFS from 1: dist ${TN.map(nd => A.d[nd.id]).join(' ')}; farthest a=${a} (dist ${A.d[a]})`);
    const B = bfs(a), b = far(B.d);
    snap(a, B.d, b, [], `BFS from ${a}: dist ${TN.map(nd => B.d[nd.id]).join(' ')}; farthest b=${b} (dist ${B.d[b]})`);
    const path = []; for (let x = b; x; x = B.par[x]) path.push(x);
    snap(a, B.d, b, path, `diameter path ${path.join('-')}, length ${B.d[b]}`);
    return {
      spec: {
        scenes: [treeScene(), { type: 'vars', id: 'v', items: [] }],
        legend: { active: 'start of this BFS', done: 'farthest vertex / the diameter' },
        steps
      }, trace
    };
  };
}

// ---------- output ----------
function make(name) {
  return GEN[name]();
}
// compact JSON: one step (or one list item of a long list) per line, so the pages stay readable
function pretty(spec) {
  const lines = [];
  for (const k of Object.keys(spec)) {
    const v = spec[k];
    if (Array.isArray(v) && v.length > 1 && v.every(x => x && typeof x === 'object')) lines.push(`  ${JSON.stringify(k)}: [\n${v.map(x => '    ' + JSON.stringify(x)).join(',\n')}\n  ]`);
    else lines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
  }
  return '{\n' + lines.join(',\n') + '\n}';
}
// self-check: in an array scene, a cell whose value changed since the last step must be highlighted in that step
// (when the step highlights anything at all in that scene). This catches an index shifted by one (the old dsu bug:
// states of a scene with "start": 1 are keyed by the printed index, not by the 0-based position).
function selfCheck(spec) {
  const E = [];
  if (!Array.isArray(spec.steps) || !Array.isArray(spec.scenes)) return E;
  spec.scenes.filter(sc => sc.type === 'array').forEach(sc => {
    const base = sc.start || 0;
    let prev = sc.values;
    spec.steps.forEach((st, k) => {
      const o = st[sc.id] || {}, vals = o.values || sc.values, states = 'states' in o ? o.states : sc.states;
      if (k > 0 && Array.isArray(vals) && Array.isArray(prev) && vals.length === prev.length && states) {
        const lit = new Set();
        vals.forEach((_, j) => { const v = Array.isArray(states) ? states[j] : states[j + base]; if (v) lit.add(j + base); });
        // a cell that was cleared (a pop: new value "" or null) does not count, the new top is what gets lit
        const changed = vals.map((v, j) => (v !== '' && v != null && JSON.stringify(v) !== JSON.stringify(prev[j]) ? j + base : null)).filter(x => x != null);
        const miss = changed.filter(j => !lit.has(j));
        if (lit.size && miss.length) E.push(`step ${k + 1}, scene "${sc.id}": cell(s) ${miss.join(', ')} changed but are not highlighted (highlighted: ${[...lit].join(', ')})`);
      }
      prev = vals;
    });
  });
  return E;
}
const arg = process.argv.slice(2);
if (arg[0] === '--print') {
  const r = make(arg[1]);
  console.log(pretty(r.spec)); console.log('\nTRACE'); r.trace.forEach((t, i) => console.log(`${i + 1}. ${t}`));
  selfCheck(r.spec).forEach(m => console.log('SELF-CHECK: ' + m));
  process.exit(0);
}
// --write needs the pages to touch: --write dsu recursion   (or --write --all). It never rewrites another page by accident.
const write = arg[0] === '--write', only = arg.slice(1).filter(a => !a.startsWith('--')).map(a => a.replace(/\.html$/, ''));
if (write && !only.length && !arg.includes('--all')) {
  console.log('Say which pages to write: node tools/viz-gen.js --write <slug> [<slug> ...]   (or --write --all to rewrite every page)');
  process.exit(1);
}
let n = 0, bad = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort()) {
  const file = path.join(dir, f), html = fs.readFileSync(file, 'utf8'), mine = !write || !only.length || only.includes(f.replace(/\.html$/, ''));
  const out = html.replace(/(<figure\b[^>]*\bdata-gen="([^"]+)"[^>]*>\s*<script type="application\/json">)([\s\S]*?)(<\/script>)/g, (all, a, name, old, z) => {
    n++;
    if (!GEN[name]) { console.log(`${f}: no generator "${name}" in tools/viz-gen.js`); bad++; return all; }
    const kind = /data-viz="([^"]+)"/.exec(a)[1], spec = make(name).spec, E = validate(kind, spec), now = '\n' + pretty(spec) + '\n';
    if (E.length) { console.log(`${f}: generator "${name}" makes a bad spec: ${E.join('; ')}`); bad++; return all; }
    for (const m of selfCheck(spec)) { console.log(`${f}: figure "${name}" self-check: ${m}`); bad++; }
    if (old === now) return all;
    if (!write || !mine) { console.log(`${f}: figure "${name}" is not what the generator makes. Run: node tools/viz-gen.js --write ${f.replace(/\.html$/, '')}`); bad++; return all; }
    console.log(`${f}: wrote "${name}"`);
    return a + now + z;
  });
  if (write && mine && out !== html) fs.writeFileSync(file, out);
}
console.log(`${n} generated picture(s), ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
