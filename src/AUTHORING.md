# How to write a lesson page

Reader: a beginner who knows basic C++ only. English is their second language (first language: Arabic).
Goal: reach Codeforces ~1600. Each page is SHORT: 2–3 screens. No proofs, no university-style text.

**Read `src/pages/binary-search.html` first. It is the reference page. Copy its structure, tone and length.**

## Files
- One lesson = one HTML fragment: `src/pages/<slug>.html` (slugs are in `src/topics.json`). No `<html>`, `<head>`, `<body>`, `<h1>`, `<style>` or `<script>`. The title is added by the site.
- Arabic terms live in `src/glossary/*.json` (`"key": { "en", "ar", "note" }`). Reuse existing keys. When two files define a key, the first file (by name) wins.
- Check your work: `node build.js` (missing glossary keys, bad links) and `node tools/check-code.js <slug>` (compiles your C++).

## Language rules
- Short sentences. Common words. Present tense. Say "you". Max ~15 words per sentence.
- No idioms, no jokes that need culture, no long words when a short one exists ("use", not "utilize").
- A hard word gets Arabic help: `<span class="term" data-t="KEY">word</span>`. Mark a term once or twice per page, not every time. Arabic must be correct Modern Standard Arabic.
- Math: plain text and HTML only (`<sup>`, `≤`, `×`, `·`). No LaTeX.

## Page structure (same order every time)
```html
<p class="idea">One-line idea, max ~25 words.</p>
<section class="spot"><h2>Spot it</h2><ul> 3–4 signals in a statement that mean "use this" </ul></section>
<section>
  <h2>Three ways to understand it</h2>
  <div class="way"><h3><b>1 · Story</b> — short name</h3> a real-life picture, 2–4 sentences </div>
  <div class="way"><h3><b>2 · Picture</b> — short name</h3> a step-by-step trace table on a tiny example, or a small inline SVG </div>
  <div class="way"><h3><b>3 · Code</b> — short name</h3> the shortest correct C++17, with comments </div>
</section>
<p class="complexity">Speed: O(...). One line.</p>
<section class="mistakes"><h2>Common mistakes</h2><ul> max 4 items </ul></section>
<section class="practice"><h2>Practice ladder</h2><ol>
  <li><a class="cf" data-p="4A">Watermelon</a><span class="r">800</span></li>
</ol></section>
<section class="more"><h2>Learn more</h2><ul> 2–4 links, each with a few words on what it is </ul></section>
```
Stage 0 pages ("how to…") are advice: keep `.idea`, then short sections, checklists and tables.

Useful classes: `.note` small grey text · `.tip-box` highlighted tip · `td.hi` highlighted cell. In SVG use `currentColor`
or the CSS variables (`var(--accent)`, `var(--line)`, `var(--muted)`, `var(--surface)`); never fixed colours.

## Code rules
- C++17, `#include <bits/stdc++.h>`, `using namespace std;`. Beginner style: clear names, no macros.
- Inside `<pre><code class="cpp">` escape `<` as `&lt;`, `>` as `&gt;`, `&` as `&amp;`.
- Each `<pre>` is one of: no attribute = complete program with `main` (compiled); `data-part="global"` = declarations that compile at global scope (compiled); `data-part="main"` = a few lines from inside `main` (not compiled, keep ≤ 8 lines).

## Practice problems
- Codeforces links: `<a class="cf" data-p="1352C">Exact name</a><span class="r">1200</span>`; the site builds the URL.
- Pick problems from data, not memory: `node tools/suggest.js "<tag>" <min> <max>` lists the most-solved problems per rating. Ladders climb smoothly, 6–8 problems.
- The site sorts each ladder by rating then solve count and shows both. `node tools/check-problems.js` must pass.
- Other judges as plain links: CSES (`https://cses.fi/problemset/task/<id>`), AtCoder DP contest (`https://atcoder.jp/contests/dp/tasks/dp_a`).
