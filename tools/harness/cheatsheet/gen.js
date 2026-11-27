// Generates cheatsheet.html + tests.cpp from spec*.txt + tests.in.cpp, so the tested text IS the published text.
const fs = require('fs'), path = require('path');
const D = __dirname;
const spec = ['spec1.txt', 'spec2.txt', 'spec3.txt'].map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n');
const slugs = new Set(JSON.parse(fs.readFileSync(process.argv[2] + '/src/topics.json', 'utf8')).flatMap(s => s.topics.map(t => t.slug)));
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => esc(s).replace(/"/g, '&quot;');
const snips = {}, formulas = new Set(), display = [];
const die = m => { console.error('SPEC ERROR: ' + m); process.exit(1); };
const addSnip = (n, c) => { if (snips[n] !== undefined) die('duplicate snippet ' + n); snips[n] = c; };
function inline(t) {
  let out = '', last = 0, plain = '';
  const re = /\{\{(#?\w*): (.*?)\}\}|\$\$(\w*): (.*?)\$\$/g;
  for (const m of t.matchAll(re)) {
    out += esc(t.slice(last, m.index)); plain += t.slice(last, m.index); last = m.index + m[0].length;
    if (m[2] !== undefined) {
      const n = m[1];
      if (n.startsWith('#')) { if (formulas.has(n.slice(1))) die('dup formula ' + n); formulas.add(n.slice(1)); }
      else if (n) addSnip(n, m[2]); else display.push(m[2]);
      out += '<code>' + esc(m[2]) + '</code>';
    } else {
      if (m[3]) { if (formulas.has(m[3])) die('dup formula ' + m[3]); formulas.add(m[3]); }
      out += '\\( ' + esc(m[4]) + ' \\)';
    }
  }
  out += esc(t.slice(last)); plain += t.slice(last);
  if (/\{\{|\$\$|\}\}/.test(plain)) die('unparsed marker in: ' + t);
  return out;
}
const secs = []; let sec = null, card = null, code = null, table = null;
const closeTable = () => { if (table) { card.html += '    <table>\n' + table.join('\n') + '\n    </table>\n'; table = null; } };
for (const raw of spec.split('\n')) {
  const line = raw.replace(/\s+$/, '');
  if (code) {
    if (line === '<<<') {
      const src = code.lines.join('\n');
      addSnip(code.name, src);
      for (const l of code.lines) if (l.length > (card.span2 ? 76 : 62)) console.warn(`long line (${l.length}) in ${code.name}: ${l}`);
      const attr = code.part === 'full' ? '' : ` data-part="${code.part}"`;
      card.html += `<pre${attr}><code class="cpp">\n${esc(src)}\n</code></pre>\n`;
      card.kinds.push(code.part); code = null;
    } else code.lines.push(line);
    continue;
  }
  if (!line) continue;
  let m;
  if ((m = /^== (\S+) \| (s\d) \| (.+)$/.exec(line))) { closeTable(); sec = { id: m[1], cls: m[2], title: m[3], cards: [] }; secs.push(sec); card = null; }
  else if ((m = /^-- (\S+)( span2)? \| (.+)$/.exec(line))) {
    closeTable();
    if (!slugs.has(m[1])) die('bad slug ' + m[1]);
    if (/\\\(|<[a-z]|&[a-z]+;/.test(m[3])) die('tip must be plain text: ' + m[3]);
    card = { to: m[1], span2: !!m[2], tip: m[3], html: '', kinds: [] }; sec.cards.push(card);
  }
  else if ((m = /^>>> (main|global|full) (\w+)$/.exec(line))) { closeTable(); code = { part: m[1], name: m[2], lines: [] }; }
  else if ((m = /^\|([!|]) (.+)$/.exec(line))) {
    const tag = m[1] === '!' ? 'th' : 'td';
    (table = table || []).push('      <tr>' + m[2].split(' | ').map(c => `<${tag}>${inline(c)}</${tag}>`).join('') + '</tr>');
  }
  else if (/^(==|--|>>>|<<<)/.test(line)) die('bad line: ' + line);
  else { closeTable(); card.html += `    <div class="fx">${inline(line)}</div>\n`; }
}
closeTable();
let html = '<ul class="chips cjump">\n' + secs.map(s =>
  `  <li><a href="#cheatsheet" data-jump="cs-${s.id}" onclick="document.getElementById(this.getAttribute('data-jump')).scrollIntoView();return false">${esc(s.title)}</a></li>`).join('\n') + '\n</ul>\n\n';
let nCards = 0;
for (const s of secs) {
  html += `<section class="${s.cls}" id="cs-${s.id}" style="scroll-margin-top:64px">\n<h2>${esc(s.title)}</h2>\n<div class="cgrid">\n`;
  for (const c of s.cards) { nCards++; html += `  <div class="cc${c.span2 ? ' span2' : ''}" data-to="${c.to}" data-tip="${escAttr(c.tip)}">\n${c.html}  </div>\n`; }
  html += '</div>\n</section>\n\n';
}
fs.writeFileSync(path.join(D, 'cheatsheet.html'), html.trimEnd() + '\n');

// ---- tests ----
let t = fs.readdirSync(D).filter(f => /^t\d.*\.in\.cpp$/.test(f)).sort().map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n');
for (const n in snips) if (/^#include/.test(snips[n])) fs.writeFileSync(path.join(D, 'full_' + n + '.cpp'), snips[n] + '\n');
const used = new Set(), fused = new Set();
t = t.replace(/@\{(\w+)(?:\|(.*?)=>(.*?))?\}@?/g, (all, n, from, to) => {
  if (snips[n] === undefined) die('test uses unknown snippet ' + n); used.add(n);
  if (from === undefined) return snips[n];
  if (!snips[n].includes(from)) die('hook text not found in ' + n);
  return snips[n].replace(from, to);
});
for (const m of t.matchAll(/\/\/#(\w+)/g)) { if (!formulas.has(m[1])) die('test marks unknown formula ' + m[1]); fused.add(m[1]); }
const missS = Object.keys(snips).filter(n => !used.has(n)), missF = [...formulas].filter(n => !fused.has(n));
fs.writeFileSync(path.join(D, 'tests.cpp'), t);
fs.writeFileSync(path.join(D, 'snips.json'), JSON.stringify(snips, null, 1));
console.log(secs.map(s => `${s.title}: ${s.cards.length}`).join('\n'));
console.log(`\n${secs.length} sections, ${nCards} cards, ${Object.keys(snips).length} code snippets (${used.size} used in tests), ${formulas.size} formulas (${fused.size} marked in tests), ${display.length} display-only code bits`);
console.log('display-only: ' + [...new Set(display)].join(' | '));
if (missS.length) console.log('UNTESTED snippets: ' + missS.join(' '));
if (missF.length) console.log('UNTESTED formulas: ' + missF.join(' '));
process.exit(missS.length || missF.length ? 2 : 0);
