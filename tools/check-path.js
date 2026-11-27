// Checks that the lessons follow the path rules in src/AUTHORING.md.
//   node tools/check-path.js            all pages
//   node tools/check-path.js <slug> …   only these pages, with every warning printed
//
// ERRORS (exit code 1) are counted only on upgraded pages: lessons that contain class="before", plus cheatsheet and home.
//   (a) math: raw $…$, LaTeX inside <pre>/<code> or inside a tooltip, a tag or a raw "<" inside \( … \), unbalanced delimiters
//   (a) Arabic written into the text: class="ar" spans, or Arabic inside brackets (Arabic belongs in tooltips only)
//   (b) structure: the required blocks, in the required order, with the right number of items
//   (c) forward links: href="#slug" to a LATER lesson outside the "Not now" box and "Learn more"
//   (e) pictures (figure.viz): at most 2 steppers per lesson, at most 12 steps per stepper (the JSON itself is checked by build.js)
//   (f) "why?" chips: exact markup, the story exists in src/whys/, at most 3 per page, never inside code, a tooltip,
//       a picture, a link, a heading or a <summary>. The stories themselves get the math and Arabic rules of (a).
// WARNINGS (never fail): (d) sentences longer than 22 words, plain-text math (<sup>, ≤, × …) that should be LaTeX,
//   LaTeX commands outside the allowed table, fewer than 6 sentence translations (.tr),
//   a stepper caption with more than 2 sentences, a stepper with fewer than 3 steps;
//   a story with fewer than 3 or more than 8 sentences, or not 2–4 sentence translations.
// On old pages (not upgraded yet) the same findings are printed as "old:" notes and do not fail.
const fs = require('fs'), path = require('path');
const { sentences } = require('./readability.js');
const src = path.join(__dirname, '..', 'src'), dir = path.join(src, 'pages');
const stages = JSON.parse(fs.readFileSync(path.join(src, 'topics.json'), 'utf8'));
// extra pages (src/extras.json) are not lessons: only the math and Arabic rules apply. One that is not written yet is skipped.
const extras = fs.existsSync(path.join(src, 'extras.json')) ? JSON.parse(fs.readFileSync(path.join(src, 'extras.json'), 'utf8')).map(e => e.slug) : [];
const MAX_STEPPERS = 2, MAX_STEPS = 12;
// "Why?" stories: <article data-key="KEY"> in src/whys/*.html (AUTHORING.md "Why? notes")
const whyDir = path.join(src, 'whys'), stories = {};
if (fs.existsSync(whyDir)) for (const f of fs.readdirSync(whyDir).filter(f => f.endsWith('.html')).sort())
  for (const m of fs.readFileSync(path.join(whyDir, f), 'utf8').matchAll(/<article data-key="([^"]*)">([\s\S]*?)<\/article>/g)) stories[m[1]] = m[2];
const MAX_CHIPS = 3, CHIP = /^<button type="button" class="why" data-why="([a-z0-9-]+)">why\?<\/button>$/;
// [opening pattern, tag]: a chip must not sit inside these elements
const NO_CHIP = [['<pre\\b', 'pre', 'code'], ['<code\\b', 'code', 'code'], ['<figure\\b', 'figure', 'a picture'], ['<span class="tr"', 'span', 'a .tr tooltip'],
  ['<span class="term"', 'span', 'a .term tooltip'], ['<a\\b', 'a', 'a link'], ['<summary\\b', 'summary', 'a <summary>'], ['<h[1-4]\\b', 'h[1-4]', 'a heading'], ['<button\\b(?![^>]*class="why")', 'button', 'a button']];
// the [start, end) of every element that opens with `open` (nested tags of the same name are counted)
function ranges(html, open, tag) {
  const out = [], tagRe = new RegExp('<(/?)(' + tag + ')\\b[^>]*>', 'g');
  for (const m of html.matchAll(new RegExp(open, 'g'))) {
    let depth = 0, end = html.length; tagRe.lastIndex = m.index;
    for (let t; (t = tagRe.exec(html));) { depth += t[1] ? -1 : 1; if (!depth) { end = t.index + t[0].length; break; } }
    out.push([m.index, end]);
  }
  return out;
}
function checkChips(html, E) {
  const chips = [...html.matchAll(/<button\b[^>]*\bdata-why=[\s\S]*?<\/button>/g)];
  if (chips.length > MAX_CHIPS) E.push(`${chips.length} "why?" chips on one page, max ${MAX_CHIPS}`);
  const inside = NO_CHIP.map(([o, t, name]) => [ranges(html, o, t), name]);
  for (const c of chips) {
    const m = CHIP.exec(c[0]);
    if (!m) { E.push(`a "why?" chip must be exactly <button type="button" class="why" data-why="KEY">why?</button>: ${short(c[0])}`); continue; }
    if (!stories[m[1]]) E.push(`"why?" chip with no story: data-why="${m[1]}" (add <article data-key="${m[1]}"> to src/whys/)`);
    for (const [rs, name] of inside) if (rs.some(([a, b]) => a < c.index && c.index < b)) E.push(`"why?" chip "${m[1]}" is inside ${name}; put it after the fact, outside`);
  }
}
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

function checkProse(html, E, W, upgraded) {
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

}
let errors = 0, warns = 0, oldNotes = 0, nUp = 0, nOld = 0, fwdAll = 0, longAll = 0;
const oldList = [];
const files = ['home', 'cheatsheet', ...extras.filter(s => fs.existsSync(path.join(dir, s + '.html'))), ...order].filter(s => !want.length || want.includes(s));
// (node tools/check-path.js whys) checks only the stories
for (const s of want) if (extras.includes(s) && !files.includes(s)) console.log(`${s}: extra page, not written yet (skipped)`);
for (const slug of files) {
  const file = path.join(dir, slug + '.html');
  if (!fs.existsSync(file)) { console.log(`${slug}: page file is missing`); errors++; continue; }
  const raw = fs.readFileSync(file, 'utf8');
  const html = raw.replace(/<script type="application\/json">[\s\S]*?<\/script>/g, '');     // the JSON of a picture is not prose
  const lesson = slug in stageOf, upgraded = !lesson || html.includes('class="before"');
  if (lesson) { if (upgraded) nUp++; else { nOld++; oldList.push(slug); } }
  const E = [], W = [];

  checkProse(html, E, W, upgraded);
  checkChips(raw, E);

  // ---------- (e) pictures ----------
  const steppers = raw.match(/<figure\b[^>]*data-viz="stepper"[\s\S]*?<\/figure>/g) || [];
  if (lesson && steppers.length > MAX_STEPPERS) E.push(`${steppers.length} steppers on one page, max ${MAX_STEPPERS}`);
  steppers.forEach((f, i) => {
    const caps = ((/<ol class="viz-steps">([\s\S]*?)<\/ol>/.exec(f) || [])[1] || '').split(/<li\b[^>]*>/).slice(1);
    if (caps.length > MAX_STEPS) E.push(`stepper ${i + 1} has ${caps.length} steps, max ${MAX_STEPS}`);
    if (caps.length < 3) W.push(`stepper ${i + 1} has only ${caps.length} step(s); use a static picture`);
    caps.forEach((c, k) => { const t = c.replace(/<\/li>[\s\S]*/, '').replace(/<code[\s\S]*?<\/code>|\\\([\s\S]*?\\\)/g, 'X').replace(/<[^>]+>/g, ''), n = (t.match(/[.!?](?=["”)]?(\s|$))/g) || []).length; if (n > 2) W.push(`stepper ${i + 1}, step ${k + 1}: ${n} sentences in the caption, write one (two short ones at most)`); });
  });

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
// ---------- (f) the "Why?" stories (all of them, or: node tools/check-path.js whys) ----------
let nStories = 0;
if (!want.length || want.includes('whys')) for (const key in stories) {
  const body = stories[key].replace(/<script type="application\/json">[\s\S]*?<\/script>/g, ''), E = [], W = [];
  nStories++;
  checkProse(body, E, W, true);
  if (/data-why=/.test(body)) E.push('a story cannot contain a "why?" chip');
  if (!/<p class="why-means"><b>What this means for you:<\/b>/.test(body)) E.push('needs a last line <p class="why-means"><b>What this means for you:</b> …</p>');
  const told = body.replace(/^\s*<h3>[\s\S]*?<\/h3>/, '').replace(/<p class="why-means">[\s\S]*?<\/p>|<table[\s\S]*?<\/table>|<figure[\s\S]*?<\/figure>|<ul[\s\S]*?<\/ul>|\\\[[\s\S]*?\\\]/g, ' ');
  const sn = sentences(told).filter(x => /[.!?]["”)]?$/.test(x.text));      // a piece that ends at a colon is part of the next sentence
  if (sn.length < 3 || sn.length > 8) W.push(`${sn.length} sentences in the story (lists and tables not counted), write 3–8`);
  for (const x of sentences(body)) if (x.words.length > MAXW) W.push(`${x.words.length} words: ${x.text.slice(0, 160)}`);
  const ntr = count(body, /class="tr"/g);
  if (ntr < 2 || ntr > 4) W.push(`${ntr} sentence translations (.tr), write 2–4`);
  errors += E.length; warns += W.length;
  if (E.length || W.length) console.log(`why story ${key}\n${[...E.map(x => '  ERROR ' + x), ...W.map(x => '  warn  ' + x)].join('\n')}`);
}
if (nStories) console.log(`\n${nStories} "Why?" stories checked`);
console.log(`\n${nUp} lesson(s) upgraded, ${nOld} old${oldList.length && !want.length ? ' (' + oldList.join(', ') + ')' : ''}`);
console.log(`${fwdAll} forward link(s), ${longAll} sentence(s) longer than ${MAXW} words, ${oldNotes} note(s) on old pages`);
console.log(`${errors} error(s) and ${warns} warning(s) on upgraded pages`);
process.exit(errors ? 1 : 0);
