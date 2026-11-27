// Builds src/training.json: the 1000-problem training set, chosen from real Codeforces data.
// node tools/make-training.js        (needs data/cf-problems.json)
// Rule: for each track, spread its quota evenly over the rating steps and take the most-solved problems at each step.
const fs = require('fs'), path = require('path');
const R = p => path.join(__dirname, '..', p);
const api = JSON.parse(fs.readFileSync(R('data/cf-problems.json'), 'utf8')).result;
const tracks = JSON.parse(fs.readFileSync(R('src/training-tracks.json'), 'utf8'));
const TOTAL = 1000;
const solved = {}; for (const s of api.problemStatistics) solved[s.contestId + s.index] = s.solvedCount;
const all = api.problems.filter(p => p.rating && !p.tags.includes('*special') && p.tags.length)
  .map(p => ({ id: p.contestId + p.index, name: p.name, r: p.rating, s: solved[p.contestId + p.index] || 0, tags: p.tags }));
// Topics that are too advanced for this guide: a problem with one of these tags is never picked.
const ADV = new Set(['fft', 'flows', 'geometry', 'string suffix structures', 'matrices', 'chinese remainder theorem', 'graph matchings',
  '2-sat', 'divide and conquer', 'meet-in-the-middle', 'schedules', 'ternary search', 'expression parsing', 'games', 'probabilities', 'hashing']);
const used = new Set();
// Rare tags pick first, so a problem lands in its most specific track.
const count = t => all.filter(p => p.tags.includes(t)).length;
const order = [...tracks].sort((a, b) => count(a.tag) - count(b.tag));
const out = {};
for (const t of order) {
  const steps = []; for (let r = t.lo; r <= t.hi; r += 100) steps.push(r);
  const pool = all.filter(p => p.tags.includes(t.tag) && !used.has(p.id) && !p.tags.some(x => ADV.has(x)) && p.tags.length <= 4)
    .sort((a, b) => b.s - a.s);
  const picked = [];
  // round-robin over rating steps so every step gets a fair share
  const by = steps.map(r => pool.filter(p => p.r === r));
  for (let k = 0; picked.length < t.n && by.some(l => l.length > k); k++)
    for (const l of by) if (l[k] && picked.length < t.n) picked.push(l[k]);
  picked.forEach(p => used.add(p.id));
  out[t.slug] = picked.sort((a, b) => a.r - b.r || b.s - a.s);
}
// Mixed set: the most-solved problems not used yet, 800..1600, same number at each step.
const need = TOTAL - Object.values(out).reduce((n, l) => n + l.length, 0);
const mixed = []; const msteps = []; for (let r = 800; r <= 1600; r += 100) msteps.push(r);
const mby = msteps.map(r => all.filter(p => p.r === r && !used.has(p.id) && !p.tags.some(x => ADV.has(x))).sort((a, b) => b.s - a.s));
for (let k = 0; mixed.length < need; k++) for (const l of mby) if (l[k] && mixed.length < need) mixed.push(l[k]);
mixed.sort((a, b) => a.r - b.r || b.s - a.s);
const pack = (l, tag) => l.map(p => [p.id, p.name, p.r, p.s, p.tags.filter(x => x !== tag).join(', ')]);
const result = { tracks: tracks.map(t => ({ slug: t.slug, tag: t.tag, twists: t.twists, problems: pack(out[t.slug], t.tag) })), mixed: pack(mixed, '') };
fs.writeFileSync(R('src/training.json'), JSON.stringify(result));
for (const t of result.tracks) console.log(t.slug.padEnd(16), String(t.problems.length).padStart(3), 'of', tracks.find(x => x.slug === t.slug).n);
console.log('mixed'.padEnd(16), String(mixed.length).padStart(3));
console.log('TOTAL', result.tracks.reduce((n, t) => n + t.problems.length, 0) + mixed.length, '|', (fs.statSync(R('src/training.json')).size / 1024).toFixed(0), 'KB');
