// node gen.js ref.src out.html   (run.sh writes src/pages/cpp-reference.html; edit ref.src, never the page by hand)
const fs = require('fs');
const [src, out] = process.argv.slice(2);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escA = s => esc(s).replace(/"/g, '&quot;');
const lines = fs.readFileSync(src, 'utf8').split('\n');
let html = '', sec = -1, card = null, block = null;
const flushBlock = () => {
  if (!block) return;
  while (block.lines.length && !block.lines[block.lines.length - 1].trim()) block.lines.pop();
  if (block.kind === 'html') html += block.lines.join('\n') + '\n';
  else {
    const attr = block.kind === 'full' ? '' : ` data-part="${block.kind}"`;
    const cls = block.kind === 'skip' && block.lines.some(l => /^g\+\+/.test(l)) ? '' : ' class="cpp"';
    html += `<pre${attr}><code${cls}>\n${esc(block.lines.join('\n'))}\n</code></pre>\n`;
  }
  block = null;
};
const flushCard = () => { flushBlock(); if (card) html += '  </div>\n'; card = null; };
const flushSec = () => { flushCard(); if (sec >= 0) html += '</div>\n</section>\n\n'; };
for (const l of lines) {
  let m;
  if ((m = /^=== (.*)$/.exec(l))) {
    flushSec(); sec++;
    html += `<section class="s${sec % 5}">\n<h2>${esc(m[1])}</h2>\n<div class="cgrid">\n`;
  } else if ((m = /^--- (.*?)\| (.*)$/.exec(l))) {
    flushCard();
    const to = (/to=([\w-]+)/.exec(m[1]) || [])[1], span = /span2/.test(m[1]);
    html += `  <div class="cc${span ? ' span2' : ''}"${to ? ` data-to="${to}"` : ''} data-tip="${escA(m[2].trim())}">\n`;
    card = true;
  } else if ((m = /^\[(full|global|main|skip|html)\]$/.exec(l))) {
    flushBlock(); block = { kind: m[1], lines: [] };
  } else if (block) block.lines.push(l);
  else if (l.trim()) throw new Error('stray line: ' + l);
}
flushSec();
fs.writeFileSync(out, html.trimEnd() + '\n');
console.log('wrote', out, html.split('\n').length, 'lines');
