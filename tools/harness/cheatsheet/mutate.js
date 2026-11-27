// Mutation check: break each published snippet in a small way and make sure the harness notices.
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
// Run run.sh first (it writes snips.json). Usage: node tools/harness/cheatsheet/mutate.js [mutants per snippet] [snippet]
const D = __dirname, GEN = path.join(D, '..', '..', '..', 'build', 'harness', 'cheatsheet'), OUT = path.join(GEN, 'mutants'); fs.mkdirSync(OUT, { recursive: true });
const snips = JSON.parse(fs.readFileSync(path.join(GEN, 'snips.json'), 'utf8'));
const tpl = fs.readdirSync(D).filter(f => /^t\d.*\.in\.cpp$/.test(f)).sort().map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n');
const OPS = [[' + 1', ' + 2'], [' - 1', ' - 2'], ['<=', '<'], ['>=', '>'], [' < ', ' <= '], [' > ', ' >= '], ['==', '!='], ['!=', '=='], ['&&', '||'], ['||', '&&'],
  [' + ', ' - '], [' - ', ' + '], [' * ', ' + '], [' / ', ' % '], [' % ', ' / '], ['min(', 'max('], ['max(', 'min('], ['.begin()', '.begin() + 1'], ['rbegin', 'begin'],
  ['++', '--'], ['<<', '>>'], [' & ', ' | '], [' | ', ' & '], [' ^ ', ' | '], ["'a'", "'b'"], ["'0'", "'1'"], ['true', 'false'], ['false', 'true'],
  ['0', '1'], ['1', '2'], ['2', '3'], ['3', '4'], ['7', '8'], ['10', '11'], ['60', '61'], ['size()', 'size() + 1'], ['upper', 'lower'], ['lower', 'upper'], ['floor', 'ceil'], ['ceil', 'floor'],
  ['front', 'back'], ['back()', 'front()'], ['gcd', 'lcm'], ['lcm', 'gcd'], ['abs(', '('], ['(x)', '(x + 1)'], [' x', ' (x + 1)'], ['(a', '(1 + a'], ['s', 't']];
const PER = +process.argv[2] || 2, only = process.argv[3];
if (process.env.EXTRA) OPS.unshift(['(long long)x', 'llround(x)'], ['(double)a', 'a'], ['stoll(s)', 'stoll(s) + 1'], ['stoi(s)', 'stoi(s) + 1'], ['clamp(x, lo, hi)', 'clamp(x, lo, hi + 1)'], ['swap(a, b)', 'swap(a, a)'],
  ['if (b > c) swap(b, c);', ''], ['y - 1e-9', 'y + 1'], ['isalpha', 'isdigit'], ['isdigit', 'isalpha'], ['isalnum', 'isalpha'], ["'A'", "'B'"], ["' '", "'a'"], ['(int)c', '(int)c + 1'], ['empty', 'size'],
  ['substr(pos', 'substr(0'], ['ss >> word', 'ss >> word >> word'], ['auto &x', 'auto x'], ['cin.ignore();', ''], ['else if (x > m2) m2 = x;', ''], ['a(n, 5)', 'a(n, 4)'], ['auto &row', 'auto row'], ['b[c][r]', 'b[r][c]'],
  ['isqrt(n)', 'isqrt(n + 1)'], ['x >> k', 'x >> (k + 1)'], ['sqrtl(n)', 'sqrtl(n) + 3'], ['long long r = sqrtl(n);', 'long long r = sqrtl(n); r -= 3;'], ['28', '29'], ['days[2] = 29', 'days[2] = 28'], ['"YES"', '"NO"'], ['" "', '""'],
  ['.6f', '.5f'], ['INT_MAX', 'INT_MIN'], ['INT_MIN', 'INT_MAX'], ['LLONG_MAX', 'LLONG_MIN'], ['LLONG_MIN', 'LLONG_MAX'], ['prime[j] = false', 'prime[i] = false'], ['j += i', 'j += i + 1'], ['a.rbegin(), a.rend()', 'a.begin(), a.end()'],
  ['reverse(a.begin(), a.end());', ''], ['x.first > y.first', 'x.first < y.first'], ['x.second < y.second', 'x.second > y.second'], ['p[b] = a', 'p[a] = a'], ['p[x] = find(p[x])', 'p[x] = p[x]'], ['return false', 'return true'], ['"? "', '"! "'], ['cin >> reply', 'cin >> reply >> reply'], ['0LL', '1LL'], ['*max_element', '*min_element']);

const jobs = [];
for (const n of Object.keys(snips)) {
  if (only && !only.split(',').includes(n)) continue;
  if (/^#include/.test(snips[n])) continue;
  let k = 0;
  for (const [a, b] of OPS) { if (k >= PER) break; const i = snips[n].indexOf(a); if (i < 0) continue; jobs.push({ n, a, b, src: snips[n].slice(0, i) + b + snips[n].slice(i + a.length) }); k++; }
  if (!k) jobs.push({ n, a: '(none)', b: '', src: null });
}
const res = []; let idx = 0, running = 0;
function build(j) { return tpl.replace(/@\{(\w+)(?:\|(.*?)=>(.*?))?\}@?/g, (all, n, from, to) => { let s = n === j.n ? j.src : snips[n]; if (from !== undefined && s.includes(from)) s = s.replace(from, to); return s; }); }
function next() {
  while (running < 14 && idx < jobs.length) {
    const j = jobs[idx], id = idx++;
    if (!j.src) { res.push({ ...j, r: 'NO-MUTANT' }); continue; }
    running++;
    const f = path.join(OUT, `m${id}.cpp`); fs.writeFileSync(f, build(j));
    const c = spawn('g++', ['-std=c++17', '-O1', '-w', '-o', f + '.out', f]);
    c.on('close', code => {
      if (code !== 0) { done(j, 'compile-fail', f); return; }
      const p = spawn('timeout', ['150', f + '.out'], { stdio: 'ignore', env: { ...process.env, FASTFAIL: '1' } });
      p.on('close', c2 => done(j, c2 === 0 ? 'SURVIVED' : 'killed', f));
    });
  }
  if (!running && idx >= jobs.length) finish();
}
function done(j, r, f) { res.push({ ...j, r }); running--; try { fs.unlinkSync(f); fs.unlinkSync(f + '.out'); } catch (e) {} next(); }
function finish() {
  const cnt = {}; for (const x of res) cnt[x.r] = (cnt[x.r] || 0) + 1;
  let out = JSON.stringify(cnt) + '\n';
  for (const x of res.filter(x => x.r === 'SURVIVED' || x.r === 'NO-MUTANT')) out += `${x.r} ${x.n}: "${x.a}" -> "${x.b}"  ::  ${(x.src || snips[x.n]).split('\n').join(' ⏎ ').slice(0, 150)}\n`;
  const killedNames = new Set(res.filter(x => x.r === 'killed').map(x => x.n));
  const never = [...new Set(res.map(x => x.n))].filter(n => !killedNames.has(n));
  out += 'snippets with no killed mutant: ' + never.join(' ') + '\n';
  fs.writeFileSync(path.join(GEN, 'mutation.log'), out); console.log(out);
}
next();
