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
// Extra pages: not lessons. They get a quick link at the top of the sidebar. A page that is not written yet is a warning only.
const extras = fs.existsSync(S('extras.json')) ? JSON.parse(read('extras.json')) : [];
const lessonSlugs = ['home', 'cheatsheet'].concat(...stages.map(s => s.topics.map(t => t.slug)));
const slugs = lessonSlugs.concat(extras.map(e => e.slug));          // every valid link target
const viz = require('./src/viz.js');                                 // the same validator the browser uses
let bad = 0, warned = 0, nViz = 0;
// "Why?" notes: the stories behind facts. One theme per file src/whys/<NN-name>.html, see AUTHORING.md "Why? notes".
// A page marks a fact with <button type="button" class="why" data-why="KEY">why?</button>.
const whys = { themes: [], stories: {}, used: {} };
const whyDir = S('whys');
if (fs.existsSync(whyDir)) for (const f of fs.readdirSync(whyDir).filter(f => f.endsWith('.html')).sort()) {
  const html = fs.readFileSync(path.join(whyDir, f), 'utf8');
  const th = /<h2>([\s\S]*?)<\/h2>/.exec(html), theme = { title: th ? th[1].trim() : f, keys: [] };
  if (!th) { console.warn(`WHY src/whys/${f}: needs one <h2>Theme name</h2> at the top`); bad++; }
  for (const m of html.matchAll(/<article data-key="([^"]*)">([\s\S]*?)<\/article>/g)) {
    const key = m[1], t = /^\s*<h3>([\s\S]*?)<\/h3>/.exec(m[2]);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(key)) { console.warn(`WHY src/whys/${f}: bad key "${key}" (use lower-case words with -)`); bad++; continue; }
    if (whys.stories[key]) { console.warn(`WHY src/whys/${f}: key "${key}" is used twice`); bad++; continue; }
    if (!t) { console.warn(`WHY ${key}: the story must start with <h3>Title</h3>`); bad++; continue; }
    if (!/<p class="why-means"><b>What this means for you:<\/b>/.test(m[2])) { console.warn(`WHY ${key}: needs a last line <p class="why-means"><b>What this means for you:</b> …</p>`); bad++; }
    if (/data-why=/.test(m[2])) { console.warn(`WHY ${key}: a story cannot contain a "why?" chip`); bad++; }
    whys.stories[key] = { title: t[1].trim(), body: m[2].slice(t[0].length).trim(), theme: theme.title };
    theme.keys.push(key);
  }
  if (/<article\b/.test(html.replace(/<article data-key="[^"]*">/g, ''))) { console.warn(`WHY src/whys/${f}: write each story as <article data-key="KEY"> exactly`); bad++; }
  if (theme.keys.length) whys.themes.push(theme);
}
for (const e of extras) if (!e.slug || !e.title || lessonSlugs.includes(e.slug) || /^train|^glossary$/.test(e.slug)) { console.warn('BAD entry in src/extras.json:', JSON.stringify(e)); bad++; }
function checkHtml(slug, html) {
  for (const m of html.matchAll(/data-t="([^"]+)"/g)) if (!glossary[m[1]]) { console.warn(`MISSING glossary key "${m[1]}" in ${slug}`); bad++; }
  // sentence translations: <span class="tr" data-ar="…">. The Arabic must be there; a quote inside it is written &quot;
  for (const m of html.matchAll(/<[^<>]*\bclass="tr"[^<>]*>/g)) {
    const ar = /\bdata-ar="([^"]*)"/.exec(m[0]);
    if (!ar || !/[\u0600-\u06FF]/.test(ar[1])) { console.warn(`EMPTY or missing data-ar in ${slug}: ${m[0].slice(0, 80)}`); bad++; }
  }
  for (const m of html.matchAll(/data-to="([^"]+)"/g)) if (!slugs.includes(m[1])) { console.warn(`BAD data-to "${m[1]}" in ${slug}`); bad++; }
  for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!slugs.includes(m[1]) && m[1] !== 'glossary' && !/^train/.test(m[1])) { console.warn(`BAD link #${m[1]} in ${slug}`); bad++; }
  for (const m of html.matchAll(/data-p="([^"]+)"/g)) problems.push(slug + ' ' + m[1]);
  // pictures: <figure class="viz" data-viz="…" aria-label="…"> with a JSON spec, see AUTHORING.md "Pictures and animations"
  const figs = html.match(/<figure\b[^>]*>[\s\S]*?<\/figure>/g) || [];
  if (figs.length !== (html.match(/<figure\b/g) || []).length) { console.warn(`VIZ ${slug}: a <figure> is not closed`); bad++; }
  figs.forEach((fig, i) => {
    const open = /^<figure\b[^>]*>/.exec(fig)[0], kind = (/\bdata-viz="([^"]*)"/.exec(open) || [])[1], E = [];
    if (!/\bclass="viz"/.test(open)) return;
    nViz++;
    if (!kind) E.push('no data-viz="…" attribute');
    if (!/\baria-label="[^"]{8,}"/.test(open)) E.push('needs aria-label="…": one sentence that says what the picture shows');
    if (!/<figcaption>[\s\S]*?\S[\s\S]*?<\/figcaption>/.test(fig)) E.push('needs a <figcaption> with text');
    const js = /<script type="application\/json">([\s\S]*?)<\/script>/.exec(fig);
    if (!js) E.push('needs <script type="application/json">…</script> with the spec');
    else if (kind) {
      let spec = null;
      try { spec = JSON.parse(js[1]); } catch (e) { E.push('the JSON does not parse: ' + e.message); }
      const ol = /<ol class="viz-steps">([\s\S]*?)<\/ol>/.exec(fig);
      if (kind === 'stepper' && !ol) E.push('a stepper needs <ol class="viz-steps"> with one <li> caption per step');
      if (spec) E.push(...viz.validate(kind, spec, kind === 'stepper' && ol ? (ol[1].match(/<li\b/g) || []).length : null));
    }
    for (const m of E) { console.warn(`VIZ ${slug}, figure ${i + 1}${kind ? ' (' + kind + ')' : ''}: ${m}`); bad++; }
  });
}
for (const slug of slugs) {
  const f = S('pages/' + slug + '.html');
  if (!fs.existsSync(f)) {
    if (lessonSlugs.includes(slug)) { console.warn('MISSING page:', slug); bad++; }
    else { console.warn(`warning: extra page "${slug}" is in src/extras.json but src/pages/${slug}.html is not written yet (no link is shown)`); warned++; }
    continue;
  }
  const html = fs.readFileSync(f, 'utf8');
  pages[slug] = html;
  checkHtml(slug, html);
  for (const m of html.matchAll(/data-why="([^"]*)"/g)) {
    if (!whys.stories[m[1]]) { console.warn(`MISSING why story "${m[1]}" in ${slug} (add <article data-key="${m[1]}"> to a file in src/whys/)`); bad++; }
    else (whys.used[m[1]] = whys.used[m[1]] || []).includes(slug) || whys.used[m[1]].push(slug);
  }
}
// the stories get the same checks as a page (glossary keys, Arabic, links, pictures); a story no page uses is a warning
for (const k in whys.stories) {
  checkHtml('why story ' + k, whys.stories[k].title + '\n' + whys.stories[k].body);
  if (!whys.used[k]) { console.warn(`warning: why story "${k}" is not used by any page yet (it is still listed on #why)`); warned++; }
}
// "used" in lesson order, so the #why page links the first lesson that tells the fact
for (const k in whys.used) whys.used[k].sort((a, b) => slugs.indexOf(a) - slugs.indexOf(b));
// Real difficulty data from the Codeforces API (rating + how many people solved it), if the file is present.
const cf = {}, cfFile = path.join(__dirname, 'data', 'cf-problems.json');
if (fs.existsSync(cfFile)) {
  const r = JSON.parse(fs.readFileSync(cfFile, 'utf8')).result, sc = {};
  for (const s of r.problemStatistics) sc[s.contestId + s.index] = s.solvedCount;
  const used = new Set(problems.map(x => x.split(' ')[1]));
  for (const p of r.problems) { const id = p.contestId + p.index; if (used.has(id)) cf[id] = [p.rating || 0, sc[id] || 0]; }
  for (const id of used) if (!cf[id]) { console.warn('UNKNOWN Codeforces problem:', id); bad++; }
}
for (const f of ['viz.js', 'app.js']) if (/<\/script|<!--/i.test(read(f))) { console.warn(`src/${f} contains "</script" or "<!--": it would end the inline script of the page`); bad++; }
const trainFile = S('training.json');
const training = fs.existsSync(trainFile) ? JSON.parse(fs.readFileSync(trainFile, 'utf8')) : null;
const data = 'window.CFG_DATA = ' + JSON.stringify({ stages, glossary, pages, cf, training, extras: extras.filter(e => pages[e.slug]), whys }).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--') + ';';
const body = read('shell.html')
  .replace('/*CSS*/', () => read('style.css'))
  .replace('/*DATA*/', () => data)
  .replace('/*JS*/', () => read('viz.js') + '\n' + read('app.js'));
fs.mkdirSync(path.join(__dirname, 'build'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'build', 'artifact.html'), body);
fs.writeFileSync(path.join(__dirname, 'index.html'),
  '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n' + body + '</body>\n</html>\n');
fs.writeFileSync(path.join(__dirname, 'build', 'problems.txt'), problems.join('\n') + '\n');
console.log(`built ${Object.keys(pages).length}/${slugs.length} pages, ${Object.keys(glossary).length} glossary terms, ${problems.length} problem links, ${nViz} pictures, ${Object.keys(whys.stories).length} why stories, ${(body.length / 1024).toFixed(0)} KB, ${bad} problems` + (warned ? `, ${warned} warning(s)` : ''));
process.exit(bad ? 1 : 0);
