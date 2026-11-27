// Checks every Codeforces practice link against the official list.
// node tools/check-problems.js [data/cf-problems.json]   (from https://codeforces.com/api/problemset.problems)
const fs = require('fs'), path = require('path');
const file = process.argv[2] || path.join(__dirname, '..', 'data', 'cf-problems.json');
const api = JSON.parse(fs.readFileSync(file, 'utf8')).result.problems;
const by = {}; for (const p of api) by[p.contestId + p.index] = p;
const dir = path.join(__dirname, '..', 'src', 'pages');
const norm = s => s.toLowerCase().replace(/&amp;/g, '&').replace(/[^a-z0-9]+/g, '');
let n = 0, bad = 0;
for (const f of fs.readdirSync(dir).sort()) {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  for (const m of html.matchAll(/data-p="([^"]+)">([^<]*)<\/a>\s*(?:<span class="r">([^<]*)<\/span>)?/g)) {
    n++;
    const p = by[m[1]], shown = parseInt((m[3] || '').replace(/\D/g, '')) || null;
    if (!p) { bad++; console.log(`${f}: ${m[1]} NOT FOUND ("${m[2]}")`); continue; }
    const issues = [];
    if (norm(p.name) !== norm(m[2])) issues.push(`name is "${p.name}", page says "${m[2]}"`);
    if (p.rating && m[3] && shown !== p.rating) issues.push(`rating is ${p.rating}, page says ${m[3]}`);
    if (issues.length) { bad++; console.log(`${f}: ${m[1]} ${issues.join('; ')}  [tags: ${p.tags.join(', ')}]`); }
  }
}
console.log(`${n} links checked, ${bad} with issues`);
process.exit(bad ? 1 : 0);
