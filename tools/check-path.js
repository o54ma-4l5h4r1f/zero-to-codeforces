// Checks that the lessons follow the path rules in src/AUTHORING.md.
//   node tools/check-path.js            all pages
//   node tools/check-path.js <slug> …   only these pages, with every warning printed
//
// ERRORS (exit code 1) are counted only on upgraded pages: lessons that contain class="before", plus cheatsheet and home.
//   (a) math: raw $…$, LaTeX inside <pre>/<code> or inside a tooltip, a tag or a raw "<" inside \( … \), unbalanced delimiters
//   (a) Arabic written into the text: class="ar" spans, or Arabic inside brackets (Arabic belongs in tooltips only)
//   (b) structure: the required blocks, in the required order, with the right number of items
//   (c) forward links: href="#slug" to a LATER lesson outside the "Not now" box and "Learn more"
// WARNINGS (never fail): (d) sentences longer than 22 words, plain-text math (<sup>, ≤, × …) that should be LaTeX,
//   LaTeX commands outside the allowed table, fewer than 6 sentence translations (.tr).
// On old pages (not upgraded yet) the same findings are printed as "old:" notes and do not fail.
const fs = require('fs'), path = require('path');
const { sentences } = require('./readability.js');
const src = path.join(__dirname, '..', 'src'), dir = path.join(src, 'pages');
const stages = JSON.parse(fs.readFileSync(path.join(src, 'topics.json'), 'utf8'));
const order = [], stageOf = {};
for (const st of stages) for (const t of st.topics) { stageOf[t.slug] = st.id; order.push(t.slug); }
const want = process.argv.slice(2);
const MAXW = 22, MIN_TR = 6;

const ALLOWED = new Set(('le ge ne lt gt cdot times frac lfloor rfloor lceil rceil sum bmod sqrt log dots approx pm to min max gcd text').split(' '));
// block name -> [marker in the HTML, exact heading or null]
const BLOCKS = {
  idea: ['<p class="idea"', null], before: ['<aside class="before"', 'Before this lesson'], spot: ['<section class="spot"', null],
  ways: ['<div class="way"', null], worked: ['<section class="worked"', 'Solve one together'], complexity: ['<p class="complexity"', null],
  myths: ['<section class="myths"', 'Wrong ideas people get'], mistakes: ['<section class="mistakes"', 'Common mistakes'],
  notnow: ['<aside class="notnow"', 'Not now'], check: ['<section class="check"', 'Check yourself'],
  practice: ['<section class="practice"', null], more: ['<section class="more"', null]
};
const ORDER = Object.keys(BLOCKS);
const REQUIRED = stage => stage === 0 ? ['idea', 'before', 'worked', 'myths', 'check']
  : stage === 4 ? ['idea', 'before', 'check']
  : ['idea', 'before', 'spot', 'ways', 'worked', 'complexity', 'myths', 'notnow', 'check', 'practice', 'more'];

const block = (html, name) => {            // the whole element of a block ('' if absent); blocks are never nested in themselves
  const i = html.indexOf(BLOCKS[name][0]); if (i < 0) return '';
  const tag = /^<(\w+)/.exec(BLOCKS[name][0])[1], j = html.indexOf('</' + tag + '>', i);
  return html.slice(i, j < 0 ? html.length : j);
};
const count = (s, re) => (s.match(re) || []).length;
const short = s => s.replace(/\s+/g, ' ').trim().slice(0, 110);

let errors = 0, warns = 0, oldNotes = 0, nUp = 0, nOld = 0, fwdAll = 0, longAll = 0;
const oldList = [];
const files = ['home', 'cheatsheet', ...order].filter(s => !want.length || want.includes(s));
for (const slug of files) {
  const file = path.join(dir, slug + '.html');
  if (!fs.existsSync(file)) { console.log(`${slug}: page file is missing`); errors++; continue; }
  const html = fs.readFileSync(file, 'utf8');
  const lesson = slug in stageOf, upgraded = !lesson || html.includes('class="before"');
  if (lesson) { if (upgraded) nUp++; else { nOld++; oldList.push(slug); } }
  const E = [], W = [];

  // ---------- (a) math ----------
  const codeParts = html.match(/<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>/g) || [];
  for (const c of codeParts) {
    const m = /\\[()[\]]|\\(le|ge|ne|cdot|times|frac|lfloor|rfloor|lceil|rceil|sum|bmod|sqrt|log|dots|approx|pm|text)\b/.exec(c);
    if (m) E.push(`LaTeX "${m[0]}" inside code: ${short(c)}`);
  }
  for (const m of html.matchAll(/data-(?:tip|ar)="([^"]*)"/g))
    if (/\\[()[\]]/.test(m[1])) E.push(`LaTeX inside a tooltip (tooltips are plain text): ${short(m[1])}`);
  const noCode = html.replace(/<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>|<svg[\s\S]*?<\/svg>/g, ' ');
  let rest = noCode.replace(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g, (all, a, b) => {
    const tex = a !== undefined ? a : b;
    if (/</.test(tex)) E.push(`a tag or raw "<" inside math (write &lt; and keep tags outside): ${short(all)}`);
    if (/\$|\\\(|\\\[/.test(tex)) E.push(`broken math delimiters: ${short(all)}`);
    for (const c of tex.matchAll(/\\([a-zA-Z]+)/g)) if (!ALLOWED.has(c[1])) W.push(`LaTeX command \\${c[1]} is not in the allowed table: ${short(all)}`);
    return ' X ';
  });
  if (/\\[()[\]]/.test(rest)) E.push(`unbalanced math delimiter near: ${short(rest.slice(Math.max(0, rest.search(/\\[()[\]]/) - 40)))}`);
  const prose = rest.replace(/<[^>]+>/g, ' ');
  for (const m of prose.matchAll(/\$\$|\$[^$\n]{1,60}\$/g)) E.push(`raw "$" math, use \\( … \\): ${short(m[0])}`);
  if (upgraded) for (const m of prose.matchAll(/[^.\n]{0,30}(?:[≤≥×√∑⌊⌋⌈⌉⁰¹²³⁴-⁹ⁿᵏ]|\d\^\d)[^.\n]{0,20}/g)) W.push(`plain-text math, use LaTeX: ${short(m[0])}`);
  if (upgraded && /<su[pb]>/.test(rest)) W.push('<sup>/<sub> found, use LaTeX ^ and _');

  // ---------- (a) Arabic only in tooltips ----------
  if (/class="ar"/.test(html)) E.push('class="ar" span: Arabic must not be written into the text, use .term or .tr');
  for (const m of prose.matchAll(/[(（][^()（）]*[؀-ۿ][^()（）]*[)）]/g)) E.push(`Arabic in brackets in the text: ${short(m[0])}`);

  if (lesson) {
    // ---------- (b) structure ----------
    const me = order.indexOf(slug), stage = stageOf[slug], S = [];
    const pos = {}; for (const b of ORDER) pos[b] = html.indexOf(BLOCKS[b][0]);
    for (const b of REQUIRED(stage)) if (pos[b] < 0) S.push(`missing block: ${b} (${BLOCKS[b][0]}…)`);
    let last = null;
    for (const b of ORDER) {
      if (pos[b] < 0) continue;
      if (last && pos[b] < pos[last]) S.push(`wrong order: "${b}" must come after "${last}"`);
      else last = b;
      if (b !== 'ways' && html.indexOf(BLOCKS[b][0], pos[b] + 1) >= 0) S.push(`block "${b}" appears more than once`);
      const h = BLOCKS[b][1];
      if (h && !block(html, b).includes(`<h2>${h}</h2>`)) S.push(`block "${b}" needs the heading <h2>${h}</h2>`);
    }
    if (pos.ways >= 0 && stage >= 1 && stage <= 3 && count(html, /<div class="way"/g) < 3) S.push('"Three ways" needs 3 .way boxes (story, picture, code)');
    const bf = block(html, 'before'), wk = block(html, 'worked'), my = block(html, 'myths'), mi = block(html, 'mistakes'),
      nn = block(html, 'notnow'), ck = block(html, 'check');
    if (bf) {
      const n = count(bf, /<li\b/g);
      if (n < 1 || n > 3) S.push(`"before" has ${n} items, needs 1–3`);
      if (me > 0 && count(bf, /href="#/g) < n) S.push('"before": every item needs a link to an earlier lesson');
    }
    if (wk) {
      const st = wk.indexOf('<ol class="steps"');
      if (!wk.includes('class="statement"')) S.push('"worked" needs <p class="statement">');
      if (st < 0) S.push('"worked" needs <ol class="steps">');
      if (stage >= 1 && stage <= 3 && wk.indexOf('<pre', st) < 0) S.push('"worked" needs the code after the steps');
      if (st >= 0 && wk.slice(0, st).includes('<pre')) S.push('"worked": think first, the code comes last (after the steps)');
    }
    if (my) {
      const a = count(my, /class="think"><b>You may think:<\/b>/g), b = count(my, /class="truth"><b>The truth:<\/b>/g);
      if (a < 2 || a > 4 || a !== b) S.push(`"myths" has ${a} "You may think" and ${b} "The truth", needs 2–4 pairs`);
    }
    if (mi && count(mi, /<li\b/g) > 3) S.push(`"mistakes" has ${count(mi, /<li\b/g)} items, max 3 (move wrong ideas to "myths")`);
    if (nn) {
      const n = count(nn, /<li\b/g);
      if (n < 1 || n > 3) S.push(`"notnow" has ${n} items, needs 1–3`);
      if (count(nn, /href="#/g) < n) S.push('"notnow": every item needs a link (a later lesson or #what-next)');
      for (const m of nn.matchAll(/href="#([^"]+)"/g)) if (order.includes(m[1]) && order.indexOf(m[1]) <= me) S.push(`"notnow" links back to #${m[1]}; it is for later lessons`);
    }
    if (ck) {
      const n = count(ck, /<details>\s*<summary>Answer<\/summary>/g);
      if (n !== 3 || count(ck, /<details/g) !== 3) S.push(`"check" has ${n} hidden answers, needs exactly 3 (<details><summary>Answer</summary>…)`);
    }
    if (upgraded) E.push(...S);

    // ---------- (c) forward links ----------
    const body = html.replace(/<aside class="notnow"[\s\S]*?<\/aside>|<section class="more"[\s\S]*?<\/section>/g, ' ');
    const fwd = [...new Set([...body.matchAll(/href="#([^"]+)"/g)].map(m => m[1]).filter(s => order.indexOf(s) > me))];
    fwdAll += fwd.length;
    for (const s of fwd) E.push(`forward link to a later lesson #${s} (move it into the "Not now" box)`);

    // ---------- (d) long sentences, translations ----------
    const long = sentences(html).filter(x => x.words.length > MAXW);
    longAll += long.length;
    for (const x of long) W.push(`${x.words.length} words: ${x.text.slice(0, 160)}`);
    const ntr = count(html, /class="tr"/g);
    if (upgraded && ntr < MIN_TR) W.push(`only ${ntr} sentence translations (.tr), add at least ${MIN_TR}`);
  }

  if (upgraded) { errors += E.length; warns += W.length; } else oldNotes += E.length + W.length;
  if (E.length || W.length) {
    const lim = want.length || upgraded ? 1e9 : 4, lines = [...E.map(x => (upgraded ? '  ERROR ' : '  old:  ') + x), ...W.map(x => (upgraded ? '  warn  ' : '  old:  ') + x)];
    console.log(`${slug}${upgraded ? '' : ' (old page, not upgraded yet)'}\n${lines.slice(0, lim).join('\n')}${lines.length > lim ? `\n  … ${lines.length - lim} more (run: node tools/check-path.js ${slug})` : ''}`);
  }
}
console.log(`\n${nUp} lesson(s) upgraded, ${nOld} old${oldList.length && !want.length ? ' (' + oldList.join(', ') + ')' : ''}`);
console.log(`${fwdAll} forward link(s), ${longAll} sentence(s) longer than ${MAXW} words, ${oldNotes} note(s) on old pages`);
console.log(`${errors} error(s) and ${warns} warning(s) on upgraded pages`);
process.exit(errors ? 1 : 0);
