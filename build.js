// Builds the static site from src/.  Run:  node build.js
// Output: index.html (open it in a browser) and build/artifact.html (same page without the outer document tags).
const fs = require('fs'), path = require('path');
const S = p => path.join(__dirname, 'src', p);
const read = p => fs.readFileSync(S(p), 'utf8');

const stages = JSON.parse(read('topics.json'));
const glossary = {};
for (const f of fs.readdirSync(S('glossary')).filter(f => f.endsWith('.json')).sort()) {
  const part = JSON.parse(read('glossary/' + f));
  for (const k in part) { if (!glossary[k]) glossary[k] = part[k]; }
}
const pages = {}, problems = [];
const slugs = ['home', 'cheatsheet'].concat(...stages.map(s => s.topics.map(t => t.slug)));
let bad = 0;
for (const slug of slugs) {
  const f = S('pages/' + slug + '.html');
  if (!fs.existsSync(f)) { console.warn('MISSING page:', slug); bad++; continue; }
  const html = fs.readFileSync(f, 'utf8');
  pages[slug] = html;
  for (const m of html.matchAll(/data-t="([^"]+)"/g)) if (!glossary[m[1]]) { console.warn(`MISSING glossary key "${m[1]}" in ${slug}`); bad++; }
  for (const m of html.matchAll(/data-to="([^"]+)"/g)) if (!slugs.includes(m[1])) { console.warn(`BAD data-to "${m[1]}" in ${slug}`); bad++; }
  for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!slugs.includes(m[1]) && m[1] !== 'glossary') { console.warn(`BAD link #${m[1]} in ${slug}`); bad++; }
  for (const m of html.matchAll(/data-p="([^"]+)"/g)) problems.push(slug + ' ' + m[1]);
}
// Real difficulty data from the Codeforces API (rating + how many people solved it), if the file is present.
const cf = {}, cfFile = path.join(__dirname, 'data', 'cf-problems.json');
if (fs.existsSync(cfFile)) {
  const r = JSON.parse(fs.readFileSync(cfFile, 'utf8')).result, sc = {};
  for (const s of r.problemStatistics) sc[s.contestId + s.index] = s.solvedCount;
  const used = new Set(problems.map(x => x.split(' ')[1]));
  for (const p of r.problems) { const id = p.contestId + p.index; if (used.has(id)) cf[id] = [p.rating || 0, sc[id] || 0]; }
  for (const id of used) if (!cf[id]) { console.warn('UNKNOWN Codeforces problem:', id); bad++; }
}
const data = 'window.CFG_DATA = ' + JSON.stringify({ stages, glossary, pages, cf }).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\u0021--') + ';';
const body = read('shell.html')
  .replace('/*CSS*/', () => read('style.css'))
  .replace('/*DATA*/', () => data)
  .replace('/*JS*/', () => read('app.js'));
fs.mkdirSync(path.join(__dirname, 'build'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'build', 'artifact.html'), body);
fs.writeFileSync(path.join(__dirname, 'index.html'),
  '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n' + body + '</body>\n</html>\n');
console.log(`built ${Object.keys(pages).length}/${slugs.length} pages, ${Object.keys(glossary).length} glossary terms, ${problems.length} problem links, ${(body.length / 1024).toFixed(0)} KB, ${bad} problems`);
process.exit(bad ? 1 : 0);
