// Compiles every C++ block in the lesson pages.  node tools/check-code.js [slug ...]
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const dir = path.join(__dirname, '..', 'src', 'pages');
const want = process.argv.slice(2);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cfg-'));
const un = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
let n = 0, fail = 0, skipped = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort()) {
  const slug = f.replace('.html', '');
  if (want.length && !want.includes(slug)) continue;
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  let i = 0;
  for (const m of html.matchAll(/<pre([^>]*)>\s*<code[^>]*>([\s\S]*?)<\/code>/g)) {
    i++;
    const part = (/data-part="(\w+)"/.exec(m[1]) || [])[1];
    if (/<[a-z]/i.test(m[2])) { console.log(`FAIL ${slug} #${i}: raw "<" inside code, escape it as &lt;`); fail++; continue; }
    if (part === 'main' || part === 'skip') { skipped++; continue; }
    let src = un(m[2]);
    if (part === 'global') src = '#include <bits/stdc++.h>\nusing namespace std;\n' + src;
    else if (!/\bmain\s*\(/.test(src)) { console.log(`FAIL ${slug} #${i}: no main() and no data-part attribute`); fail++; continue; }
    const file = path.join(tmp, `${slug}-${i}.cpp`);
    fs.writeFileSync(file, src);
    const args = ['-std=c++17', '-Wall', '-Wextra', '-Wno-unused', '-Wno-sign-compare'];
    const r = spawnSync('g++', part === 'global' ? [...args, '-fsyntax-only', file] : [...args, '-o', file + '.out', file], { encoding: 'utf8' });
    n++;
    if (r.status !== 0 || /warning/.test(r.stderr)) { fail += r.status !== 0; console.log(`${r.status ? 'FAIL' : 'warn'} ${slug} #${i}\n${r.stderr.split('\n').slice(0, 12).join('\n')}`); }
  }
}
console.log(`compiled ${n} blocks, ${skipped} not compiled (data-part="main"), ${fail} failed. Binaries in ${tmp}`);
process.exit(fail ? 1 : 0);
