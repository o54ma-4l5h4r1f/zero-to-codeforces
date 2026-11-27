// Most-solved Codeforces problems for a tag and rating range (real data from the official API).
// node tools/suggest.js "<tag>" <minRating> <maxRating> [howManyPerRating=4]
// Tags: implementation, math, greedy, strings, brute force, sortings, constructive algorithms, number theory, binary search,
//       two pointers, dp, bitmasks, data structures, graphs, dfs and similar, shortest paths, trees, dsu, combinatorics, interactive
const fs = require('fs'), path = require('path');
const r = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'cf-problems.json'), 'utf8')).result;
const solved = {}; for (const s of r.problemStatistics) solved[s.contestId + s.index] = s.solvedCount;
const [tag, lo, hi, per = 4] = process.argv.slice(2);
const rows = r.problems.filter(p => p.rating >= +lo && p.rating <= +hi && p.tags.includes(tag))
  .map(p => ({ id: p.contestId + p.index, name: p.name, rating: p.rating, solved: solved[p.contestId + p.index] || 0, tags: p.tags.join(', ') }));
for (let x = +lo; x <= +hi; x += 100) {
  for (const p of rows.filter(p => p.rating === x).sort((a, b) => b.solved - a.solved).slice(0, +per))
    console.log(`${p.rating}  ${p.id.padEnd(7)} solved ${String(p.solved).padStart(6)}  ${p.name}  [${p.tags}]`);
}
