# How to write a lesson page

Reader: a beginner who knows basic C++ only. English is their second language (first language: Arabic).
Goal: reach Codeforces ~1600. Each page is SHORT: 2–3 screens. No proofs, no university-style text.

**Read `src/pages/binary-search.html` first. It is the reference page. Copy its structure, tone and length.**
(That page has one extra section because binary search has two forms. Normal pages do not need an extra section.)

## Files
- One lesson = one HTML fragment: `src/pages/<slug>.html` (slugs are in `src/topics.json`). No `<html>`, `<head>`, `<body>`, `<h1>`, `<style>` or `<script>`. The title is added by the site.
- Your new Arabic terms go in ONE file: `src/glossary/<your-stage>.json` (e.g. `1.json`). Same format as `00-base.json`.
  Check `00-base.json` first and reuse its keys. Do not edit any other file.
- Check your work: `node build.js` (reports missing glossary keys and pages; ignore pages that belong to other stages)
  and `node tools/check-code.js <slug> [<slug>…]` (compiles your C++).

## Language rules
- Short sentences. Common words. Present tense. Say "you". Max ~15 words per sentence.
- No idioms, no jokes that need culture, no long words when a short one exists ("use", not "utilize").
- A hard or technical word gets Arabic help: `<span class="term" data-t="KEY">word</span>`, and KEY must exist in a glossary file.
  Mark a term once or twice per page, not every time. Arabic must be correct, natural Modern Standard Arabic.
- Math: plain text and HTML only (`<sup>`, `≤`, `×`, `·`). No LaTeX.

## Page structure (same order every time)
```html
<p class="idea">One-line idea, max ~25 words.</p>

<section class="spot"><h2>Spot it</h2><ul> 3–4 signals in a statement that mean "use this" </ul></section>

<section>
  <h2>Three ways to understand it</h2>
  <div class="way"><h3><b>1 · Story</b> — short name</h3> a real-life picture, 2–4 sentences </div>
  <div class="way"><h3><b>2 · Picture</b> — short name</h3> a step-by-step trace table on a tiny example (preferred), or a small inline SVG </div>
  <div class="way"><h3><b>3 · Code</b> — short name</h3> the shortest correct C++17, with comments </div>
</section>

<p class="complexity">Speed: O(...). One line.</p>

<section class="mistakes"><h2>Common mistakes</h2><ul> max 4 items </ul></section>

<section class="practice"><h2>Practice ladder</h2><ol>
  <li><a class="cf" data-p="4A">Watermelon</a><span class="r">≈800</span></li>
</ol></section>

<section class="more"><h2>Learn more</h2><ul> 2–4 links, each with a few words on what it is </ul></section>
```
Stage 0 pages ("how to…") are advice, not algorithms: keep `.idea`, then free short sections, checklists and tables; use
`.way` boxes, `.tip-box`, `.mistakes` where they fit. Practice and Learn-more sections only where useful.

Useful classes: `<p class="note">` small grey text · `<p class="tip-box">` highlighted tip · `<td class="hi">` highlighted cell ·
tables are scrolled automatically. In SVG use `fill="none" stroke="currentColor"` or the CSS variables
(`var(--accent)`, `var(--line)`, `var(--muted)`, `var(--surface)`, `var(--ok)`, `var(--warn)`); never fixed colours. Give SVG a `viewBox`, width ≤ 640.

## Code rules
- C++17, `#include <bits/stdc++.h>`, `using namespace std;`. Beginner style: clear names, no macros, no clever tricks.
- Inside `<pre><code class="cpp">` you MUST escape `<` as `&lt;`, `>` as `&gt;`, `&` as `&amp;`.
- Each `<pre>` is one of:
  - no attribute: a **complete program** with `main` (compiled by the checker),
  - `data-part="global"`: functions / declarations that compile at global scope after the include line (compiled by the checker),
  - `data-part="main"`: a few lines that would sit inside `main` (not compiled; keep it ≤ 8 lines and be extra careful).
- The code must be correct. Test complete programs by hand on a small input. Lines ≤ 90 characters.

## Practice problems
- Links to Codeforces: `<a class="cf" data-p="CONTEST+LETTER">Name</a>` (e.g. `data-p="1352C"`); the site builds the URL.
- Pick problems from real data, never from memory: `node tools/suggest.js "<tag>" <minRating> <maxRating>` lists the most-solved
  Codeforces problems per rating for a tag (official ratings and solve counts). Start from the problems in your brief (already verified),
  then use the tool to fill gaps so the ladder climbs smoothly (e.g. 800, 900, 1000, 1100, 1200, 1300…) with 6–8 problems.
  Prefer problems with many solvers: they are the fairest for their rating. Check the tags really fit your topic.
- The site sorts each ladder by rating then solve count and prints both, so you only supply id + exact name + rating.
- `node tools/check-problems.js data/cf-problems.json` must report no issue for your pages.
- Order easy → hard. Rating as `1200` (the official rating; all links are checked with `node tools/check-problems.js`).
- Other judges are allowed as normal links when well known and stable: CSES (`https://cses.fi/problemset/task/<id>` only if sure of the id,
  else `https://cses.fi/problemset/`), AtCoder DP contest (`https://atcoder.jp/contests/dp/tasks/dp_a` … `dp_z`).

## Learn-more links (only stable, well-known pages; if not sure of the exact URL use the site's main page)
- `https://codeforces.com/edu/course/2` (Codeforces EDU: binary search, two pointers, DSU, segment tree…)
- `https://usaco.guide/` (sections: bronze, silver, gold) · `https://cp-algorithms.com/` · `https://cses.fi/book/book.pdf` (Competitive Programmer's Handbook, free)
- `https://codeforces.com/group/MWSDmqGsZm/contests` (Assiut University newcomers sheets, popular with Arabic-speaking beginners)
- `https://www.youtube.com/@ArabicCompetitiveProgramming` (Arabic video lessons by Mostafa Saad) — mention as "Arabic videos", only on core algorithm pages.
- `https://en.cppreference.com/w/cpp/container` for STL.
