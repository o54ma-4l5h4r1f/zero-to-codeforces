// node harness.js page.html [card number]  -> compiles + runs every card, checks the values claimed in comments. Use run.sh.
const fs = require('fs'), path = require('path'), os = require('os'), { spawn } = require('child_process');
const run = (cmd, args, input) => new Promise(res => { const p = spawn(cmd, args); let o = '', e = ''; p.stdout.on('data', d => o += d); p.stderr.on('data', d => e += d); const t = setTimeout(() => p.kill('SIGKILL'), 60000); p.on('close', (status, signal) => { clearTimeout(t); res({ status, signal, stdout: o, stderr: e }); }); p.stdin.on('error', () => {}); p.stdin.end(input || ''); });
const jobs = [];
const file = process.argv[2], only = process.argv[3];
const html = fs.readFileSync(file, 'utf8');
const un = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const work = path.join(__dirname, '..', '..', '..', 'build', 'harness', 'cpp-reference'); fs.mkdirSync(work, { recursive: true });   // git-ignored
const HELP = fs.readFileSync(path.join(__dirname, 'helpers.h'), 'utf8');
const cstr = s => '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
const splitComment = l => { let q = null; for (let i = 0; i < l.length; i++) { const c = l[i];
  if (q) { if (c === '\\') i++; else if (c === q) q = null; } else if (c === '"' || c === "'") q = c;
  else if (c === '/' && l[i + 1] === '/') return [l.slice(0, i), l.slice(i + 2).trim()]; } return [l, null]; };
const VAL = /^(-?[\d.]+( -?[\d.]+)*|".*"|'.'|true|false)$/;
const cards = html.split(/<div class="cc/).slice(1);
let pass = 0, failN = 0, checksTotal = 0, fragTotal = 0, unchecked = [], longl = [];
cards.forEach((c, ci) => { jobs.push(async () => {
  const n = ci + 1; if (only && +only !== n) return;
  const span = /^ span2/.test(c);
  const blocks = [...c.matchAll(/<pre([^>]*)>\s*<code[^>]*>([\s\S]*?)<\/code>/g)].map(m => ({ kind: (/data-part="(\w+)"/.exec(m[1]) || [, 'full'])[1], code: un(m[2]).replace(/^\n/, '').replace(/\n$/, '') }));
  for (const b of blocks) for (const l of b.code.split('\n')) { if (l.length > 80) longl.push(`card ${n}: ${l.length} chars: ${l}`); else if (!span && l.length > 52) longl.push(`card ${n} (narrow) ${l.length}: ${l}`); }
  const live = blocks.filter(b => b.kind !== 'skip'); if (!live.length) return;
  let stdin = [], exp = [], id = 0;
  const inst = (b) => b.code.split('\n').map(l => {
    const [code, com] = splitComment(l); if (com === null || !code.trim()) return l;
    if (/^input:/.test(com)) { stdin.push(com.replace(/^input:\s*/, '')); return l; }
    if (b.kind !== 'main' && !/^\s/.test(l)) return l;
    const ct = code.trimEnd(); if (!ct.endsWith(';')) return l;
    const want = com.replace(/\s{2,}\(.*\)$/, '');
    let m;
    if (/\bcout\b/.test(ct)) { exp.push(want); return `{ _zCap _c(${id++}); ${ct} }`; }
    if ((m = /^(\w+) =(?: (.*))?$/.exec(want))) { exp.push(m[2] || ''); return `${ct} _zchk(${id++}, ${m[1]});`; }
    if (!VAL.test(want)) return l;
    m = /^\s*(?:[\w:<>, ]+?[\s&*]+)?(\w+)\s*(?:[-+*\/%&|^]|<<|>>)?=(?!=)[^;]*;$/.exec(ct) || /^\s*(\w+)(?:\+\+|--);$/.exec(ct) || /^\s*(?:\+\+|--)(\w+);$/.exec(ct)
      || /^\s*[\w:<>, ]+?\s+(\w+)\([^;]*\);$/.exec(ct) || /^\s*[\w:<>, ]+?\s+(\w+);$/.exec(ct);
    if (!m) { unchecked.push(`card ${n}: ${l.trim()}`); return l; }
    exp.push(want); return `${ct} _zchk(${id++}, ${m[1]});`;
  }).join('\n');
  let src;
  const full = live.find(b => b.kind === 'full');
  const mk = () => `static const vector<string> _zexp = {${exp.map(cstr).join(', ')}};\n` + HELP + `\n#line 1 "card"\n`;
  if (full) { const body = inst(full); src = body.replace(/using namespace std;\n/, s => s + mk()); }
  else {
    const g = live.filter(b => b.kind === 'global').map(inst).join('\n');
    const ms = live.filter(b => b.kind === 'main').map(inst);
    const hasMain = /\bmain\s*\(/.test(g);
    src = '#include <bits/stdc++.h>\nusing namespace std;\n' + '@@' + g.replace(/^#include.*$/gm, '') + '\n' + (hasMain ? '' : 'int main() {\n' + ms.map(x => '{\n' + x + '\n}').join('\n') + '\nreturn 0;\n}\n');
    src = src.replace('@@', mk());
  }
  fragTotal += live.length; checksTotal += exp.length;
  const f = path.join(work, `c${n}.cpp`); fs.writeFileSync(f, src);
  const cc = await run('g++', ['-std=c++17', '-Wall', '-Wextra', '-Wno-unused', '-g', '-fsanitize=undefined,address', '-fno-sanitize-recover=undefined', f, '-o', f + '.out']);
  const head = `card ${n} [${live.map(b => b.kind).join('+')}] checks=${exp.length}`;
  if (cc.status !== 0) { failN++; console.log(`COMPILE FAIL ${head}\n${cc.stderr.split('\n').slice(0, 14).join('\n')}`); return; }
  if (/warning/.test(cc.stderr)) console.log(`WARN ${head}\n${cc.stderr.split('\n').slice(0, 8).join('\n')}`);
  const r = await run(f + '.out', [], stdin.join('\n') + '\n');
  if (r.status !== 0) { failN++; console.log(`RUN FAIL ${head} status=${r.status} signal=${r.signal}\n${(r.stderr || '').split('\n').slice(0, 14).join('\n')}`); return; }
  pass++;
  if (process.env.V) console.log(`ok ${head} | out: ${JSON.stringify(r.stdout.slice(0, 120))}`);
}); });
(async () => { let qi = 0; await Promise.all(Array.from({ length: Math.max(2, os.cpus().length) }, async () => { while (qi < jobs.length) await jobs[qi++](); }));
console.log(`\ncards with code: ${pass + failN}, passed ${pass}, failed ${failN}; fragments ${fragTotal}; value checks ${checksTotal}`);
if (unchecked.length) console.log('UNCHECKED value-like comments:\n' + unchecked.join('\n'));
if (longl.length) console.log('LONG lines:\n' + longl.join('\n'));
process.exitCode = failN ? 1 : 0;
})();
