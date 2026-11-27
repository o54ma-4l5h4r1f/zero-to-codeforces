# Zero to Codeforces

A short, ordered problem-solving guide for beginners who know basic C++: from the first submission to about Codeforces 1600.
Simple English, Arabic meanings on hover or tap for hard words and hard sentences, math drawn with KaTeX, every idea explained three ways (story, picture, code), step-by-step animations and charts, and a cheat sheet.

The site is one static file: `index.html`. Open it in a browser, or host it anywhere.

## Layout

| Path | What it is |
|---|---|
| `src/topics.json` | The curriculum: stages and lesson order |
| `src/pages/<slug>.html` | One lesson per file (HTML fragment) |
| `src/pages/cheatsheet.html` | The cheat sheet cards. Generated: edit `tools/harness/cheatsheet/spec*.txt`, then run its harness |
| `src/pages/cpp-reference.html` | The C++ reference cards. Generated: edit `tools/harness/cpp-reference/ref.src`, then run its harness |
| `src/glossary/*.json` | English → Arabic word list (one file per stage; a key lives in one file only) |
| `src/whys/*.html` | "Why?" notes: the short true stories behind facts (why 2 147 483 647, why 10^9 + 7…), one theme per file. A lesson opens one with a "why?" chip; the page `#why` lists them all (AUTHORING.md, section 12) |
| `src/extras.json` | Extra pages that are not lessons (`{slug, title, wide}`), shown as quick links in the sidebar: C++ reference, Which tool?, Why? |
| `src/style.css`, `src/app.js`, `src/shell.html` | Look and behaviour |
| `src/viz.js` | The visual kit: steppers, arrays, tables, graphs, number lines, planes and charts drawn from a JSON spec (see AUTHORING.md, section 11) |
| `src/AUTHORING.md` | Rules for writing a lesson |
| `docs/community-references.md` | Practice advice and resources collected from Codeforces discussions, with blog ids |
| `src/training-tracks.json` | The training tracks: tag, rating range, size and the list of twists for each idea |
| `src/training.json` | The 1000-problem training set (generated, do not edit by hand) |
| `data/cf-problems.json` | Snapshot of the Codeforces problem list (ratings and solve counts) |
| `build.js` | Puts everything into `index.html` |
| `tools/` | Checks: C++ compiles, problem links are real, lessons follow the path rules, problem suggestions |
| `tools/harness/` | Generators + test harnesses for the cheat sheet and the C++ reference: the tested text is the published text |

## Commands

```sh
node build.js                                  # build index.html (also checks the JSON of every picture)
node tools/check-code.js                       # compile every C++ block (needs g++)
node tools/check-problems.js data/cf-problems.json   # check every practice link
node tools/make-training.js                    # rebuild the 1000-problem training set from the snapshot
node tools/check-path.js                       # path rules: block order, LaTeX, forward links, long sentences, picture limits, "why?" chips (see src/AUTHORING.md)
node tools/check-path.js whys                  # only the "Why?" stories: length, Arabic help, math
node tools/viz-gen.js                          # check that generated pictures match their generator (and that the highlighted cells are the ones that changed)
node tools/viz-gen.js --write recursion dsu    # regenerate the pictures of these pages only (--write --all: every page); --print NAME for a trace
bash tools/harness/cheatsheet/run.sh           # cheat sheet: write src/pages/cheatsheet.html from spec*.txt, compile and run its tests (~30 s, needs g++)
bash tools/harness/cpp-reference/run.sh        # C++ reference: write src/pages/cpp-reference.html from ref.src, compile and run every card (~30 s)
node tools/readability.js                      # list long sentences and long words in the lessons
node tools/suggest.js "binary search" 1000 1400       # most-solved problems for a tag
curl -o data/cf-problems.json https://codeforces.com/api/problemset.problems   # refresh the snapshot
```

On screen, the Codeforces problems of each practice ladder are sorted by official rating, then by how many people solved them (most first). Problems from other sites (CSES, AtCoder) have no rating and keep the place the lesson gives them. The harnesses write their work files to `build/harness/` (git-ignored).

## Hosting

`.github/workflows/pages.yml` builds the site and deploys it to GitHub Pages on every push to `main`.
In the repository settings, set **Pages → Source** to **GitHub Actions**.
