# Zero to Codeforces

A short, ordered problem-solving guide for beginners who know basic C++: from the first submission to about Codeforces 1600.
Simple English, Arabic meanings on hover for hard words, every idea explained three ways (story, picture, code), and a cheat sheet.

The whole site is one static file: `index.html`. Open it in a browser, or host it anywhere.

## Layout

| Path | What it is |
|---|---|
| `src/topics.json` | The curriculum: stages and lesson order |
| `src/pages/<slug>.html` | One lesson per file (HTML fragment) |
| `src/pages/cheatsheet.html` | The cheat sheet cards |
| `src/glossary/*.json` | English → Arabic word list |
| `src/style.css`, `src/app.js`, `src/shell.html` | Look and behaviour |
| `src/AUTHORING.md` | Rules for writing a lesson |
| `data/cf-problems.json` | Snapshot of the Codeforces problem list (ratings and solve counts) |
| `build.js` | Puts everything into `index.html` |
| `tools/` | Checks: C++ compiles, problem links are real, problem suggestions |

## Commands

```sh
node build.js                                  # build index.html
node tools/check-code.js                       # compile every C++ block (needs g++)
node tools/check-problems.js                   # check every practice link against the snapshot
node tools/suggest.js "binary search" 1000 1400   # most-solved problems for a tag
curl -o data/cf-problems.json https://codeforces.com/api/problemset.problems   # refresh the snapshot
```

Practice ladders are sorted by official rating, then by how many people solved the problem.

## Hosting

`.github/workflows/pages.yml` runs the checks, builds the site and deploys it to GitHub Pages on every push to `main`.
