// Finds hard-to-read prose in lessons: long sentences and long words.  node tools/readability.js [slug ...]
// Also used by tools/check-path.js:  require('./readability.js').sentences(html)
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'src', 'pages');
const MAXW = 18;
const allow = new Set(('codeforces programming competitive participation interactive understand different difference something everything '
  + 'information instruction sometimes otherwise connected component components subsequence subproblem permutation combination '
  + 'neighbour neighbours statement statements dictionary complexity constraints algorithm algorithms educational increasing '
  + 'approximately priority_queue unordered_map accumulate max_element min_element lower_bound upper_bound next_permutation').split(' '));

// The prose of a page as a list of { text, words }. Code, pictures, formulas, the practice ladder and Learn more are left out.
// A formula \( ... \) or a piece of code counts as one word.
function sentences(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<code[\s\S]*?<\/code>/g, ' X ')
    .replace(/\\\[[\s\S]*?\\\]/g, ' X. ').replace(/\\\([\s\S]*?\\\)/g, ' X ')
    .replace(/<section class="(practice|more)"[\s\S]*?<\/section>/g, ' ')
    .replace(/<\/(p|li|td|th|h2|h3|div|summary|figcaption)>|<(ul|ol|table|details)\b[^>]*>/g, '. ').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ');
  const out = [];
  for (const s of text.split(/(?<=[.!?:]["”)]?)\s+/)) {
    const words = s.trim().split(/\s+/).filter(w => /[a-zA-Z]/.test(w));
    if (words.length) out.push({ text: s.trim().replace(/\s+/g, ' '), words });
  }
  return out;
}
module.exports = { sentences };

if (require.main === module) {
  const want = process.argv.slice(2);
  let total = 0, sents = 0;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort()) {
    const slug = f.replace('.html', '');
    if (slug === 'cheatsheet' || (want.length && !want.includes(slug))) continue;
    const out = [];
    for (const { text, words } of sentences(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      sents++;
      const long = words.filter(w => { const x = w.toLowerCase().replace(/[^a-z_]/g, ''); return x.length >= 12 && !allow.has(x); });
      if (words.length > MAXW) out.push(`  ${words.length} words: ${text.slice(0, 150)}`);
      else if (long.length) out.push(`  long word "${long[0]}": ${text.slice(0, 110)}`);
    }
    total += out.length;
    if (out.length) console.log(`${slug} (${out.length})\n${want.length ? out.join('\n') : out.slice(0, 2).join('\n')}`);
  }
  console.log(`\n${total} flagged of ${sents} sentences (limit ${MAXW} words)`);
}
