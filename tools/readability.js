// Finds hard-to-read prose in lessons: long sentences and long words.  node tools/readability.js [slug ...]
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'src', 'pages'), want = process.argv.slice(2);
const MAXW = 18;
const allow = new Set(('codeforces programming competitive participation interactive understand different difference something everything '
  + 'information instruction sometimes otherwise connected component components subsequence subproblem permutation combination '
  + 'neighbour neighbours statement statements dictionary complexity constraints algorithm algorithms educational increasing '
  + 'approximately priority_queue unordered_map accumulate max_element min_element lower_bound upper_bound next_permutation').split(' '));
let total = 0, sents = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort()) {
  const slug = f.replace('.html', '');
  if (slug === 'cheatsheet' || (want.length && !want.includes(slug))) continue;
  let html = fs.readFileSync(path.join(dir, f), 'utf8')
    .replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<code[\s\S]*?<\/code>/g, ' X ')
    .replace(/<section class="(practice|more)"[\s\S]*?<\/section>/g, ' ')
    .replace(/<\/(p|li|td|th|h2|h3|div)>/g, '. ').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ');
  const out = [];
  for (const s of html.split(/(?<=[.!?:])\s+/)) {
    const words = s.trim().split(/\s+/).filter(w => /[a-zA-Z]/.test(w));
    if (!words.length) continue; sents++;
    const long = words.filter(w => { const x = w.toLowerCase().replace(/[^a-z_]/g, ''); return x.length >= 12 && !allow.has(x); });
    if (words.length > MAXW) out.push(`  ${words.length} words: ${s.trim().slice(0, 150)}`);
    else if (long.length) out.push(`  long word "${long[0]}": ${s.trim().slice(0, 110)}`);
  }
  total += out.length;
  if (out.length) console.log(`${slug} (${out.length})\n${want.length ? out.join('\n') : out.slice(0, 2).join('\n')}`);
}
console.log(`\n${total} flagged of ${sents} sentences (limit ${MAXW} words)`);
