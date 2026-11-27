# How to write a lesson page

Reader: a beginner who knows basic C++ only. First language: Arabic. English is weak (about level B1).
Goal: reach Codeforces ~1600 by following the lessons **in order**, without getting lost.
Each page is SHORT: about 3 screens. No proofs, no university-style text.

**Reference pages. Read them first and copy their structure, tone and length:**
- `src/pages/binary-search.html` — an algorithm lesson (stages 1–3).
- `src/pages/complexity.html` — an advice lesson (stage 0).
- `src/pages/cheatsheet.html` — formulas in LaTeX, code in code.

A page is "upgraded" when it follows this file. The checker knows an upgraded page by `class="before"`.

## 1. Files and checks
- One lesson = one HTML fragment: `src/pages/<slug>.html`. Slugs and the lesson order are in `src/topics.json`.
  No `<html>`, `<head>`, `<body>`, `<h1>`, `<style>` or `<script>`. The site adds the title.
- New Arabic words go in ONE file: `src/glossary/<your-stage>.json` (for example `1.json`), same format as `00-base.json`.
  Look in all glossary files first and reuse keys. Do not edit other shared files.
- Run all of these before you finish. All must be clean for your pages:

```sh
node build.js                          # 0 problems (glossary keys, links, empty translations)
node tools/check-code.js <slug>        # your C++ compiles, 0 failed
node tools/check-problems.js           # every practice link is real, name and rating match
node tools/check-path.js <slug>        # structure, LaTeX, forward links, long sentences: 0 errors
node tools/readability.js <slug>       # extra list of long sentences and long words
```

## 2. Section order (same on every page)

Algorithm lessons (stages 1–3) have ALL of these blocks, in this order. `.mistakes` is the only optional one.

```html
<p class="idea">The one-line idea, max 25 words, inside a .tr (see section 5).</p>

<aside class="before"><h2>Before this lesson</h2><ul>
  <li>You know what a sorted array is → <a href="#sorting">Sorting</a></li>      <!-- 1–3 items, each links to an EARLIER lesson -->
</ul></aside>

<section class="spot"><h2>Spot it</h2><ul> 3–4 signals in a statement that mean "use this" </ul></section>

<section>
  <h2>Three ways to understand it</h2>
  <div class="way"><h3><b>1 · Story</b> — short name</h3> a real-life picture, 2–4 sentences </div>
  <div class="way"><h3><b>2 · Picture</b> — short name</h3> a step-by-step trace table on a tiny example (or a small inline SVG) </div>
  <div class="way"><h3><b>3 · Code</b> — short name</h3> the shortest correct C++17, with comments </div>
</section>

<!-- at most ONE extra plain <section> here, only if the topic has a second form (see binary-search) -->

<section class="worked"><h2>Solve one together</h2>
  <p class="statement"><b>Problem.</b> One small problem in your own words, with its limits.</p>
  <ol class="steps">
    <li><b>What is asked?</b> …</li>
    <li><b>A small example by hand.</b> … numbers, a small table …</li>
    <li><b>The idea.</b> …</li>
    <li><b>Why is it fast enough?</b> … count the steps for the biggest n, compare with \( 10^8 \) …</li>
  </ol>
  <pre><code class="cpp"> the full program, LAST </code></pre>
</section>

<p class="complexity">Speed: \( O(\dots) \). One line.</p>

<section class="myths"><h2>Wrong ideas people get</h2><ul>      <!-- 2–4 items -->
  <li>
    <p class="think"><b>You may think:</b> <span class="tr" data-ar="…">the wrong idea.</span></p>
    <p class="truth"><b>The truth:</b> <span class="tr" data-ar="…">the right idea.</span> One more short sentence if needed.</p>
  </li>
</ul></section>

<section class="mistakes"><h2>Common mistakes</h2><ul> coding slips only, max 3 </ul></section>

<aside class="notnow"><h2>Not now</h2><ul>      <!-- 1–3 items -->
  <li><b>Tempting side topic.</b> Why to skip it now. When to come back: <a href="#later-slug">Later lesson</a> (or <a href="#what-next">After 1600</a>).</li>
</ul></aside>

<section class="check"><h2>Check yourself</h2><ol>      <!-- exactly 3 questions -->
  <li><span class="tr" data-ar="…">A short question?</span>
    <details><summary>Answer</summary><p>The short answer, with the reason.</p></details></li>
</ol></section>

<section class="practice"><h2>Practice ladder</h2><ol>
  <li><a class="cf" data-p="4A">Watermelon</a><span class="r">800</span></li>
</ol></section>

<section class="more"><h2>Learn more</h2><ul> 2–4 links, each with a few words on what it is </ul></section>
```

The headings of the five new blocks are fixed text: "Before this lesson", "Solve one together", "Wrong ideas people get", "Not now", "Check yourself".

**Advice lessons (stage 0)** keep the same order but are freer. Required: `.idea`, `.before`, `.worked`, `.myths`, `.check`.
Other blocks (`.spot`, `.way` boxes, `.complexity`, `.mistakes`, `.notnow`, `.practice`, `.more`) and free short sections,
checklists and tables are used where they help. Free sections go between `.before` and `.myths`.
The first lesson of the guide writes one `.before` item without a link ("You need only basic C++.").
Stage 4 (`what-next`) needs only `.idea`, `.before`, `.check`.

**Keep it short.** The new blocks replace weight, they do not add it:
- A wrong belief ("it works on any array") goes to "Wrong ideas". A typing or coding slip ("wrong start value") stays in "Common mistakes", max 3.
- The big example of the page lives in "Solve one together", not also in "Three ways".
- "Before", "Not now" and "Check yourself" are a few lines each.

Useful classes: `<p class="note">` small grey text · `<p class="tip-box">` highlighted tip · `<td class="hi">` highlighted cell ·
tables scroll on their own. In SVG use `fill="none" stroke="currentColor"` or the CSS variables
(`var(--accent)`, `var(--line)`, `var(--muted)`, `var(--surface)`, `var(--ok)`, `var(--warn)`); never fixed colours. Give SVG a `viewBox`, width ≤ 640.

## 3. Math is LaTeX
The site draws math with KaTeX. Write `\( … \)` inside a line and `\[ … \]` for a formula on its own line. Never `$`.

- Use LaTeX for EVERY formula, sum, inequality, power, Big-O, floor/ceil, mod and for single math letters in a sentence:
  `\( n \le 2 \cdot 10^5 \)`, `\( O(n \log n) \)`, "for every `\( i \)`". Do not use `<sup>`, `<sub>`, `≤`, `≥`, `×`, `√`, `²`, `10^5` in prose.
- **Code is not math.** If it could be a piece of C++, it goes in `<code>`: `<code>a[i] &gt;= 7</code>`, `<code>lo + (hi - lo) / 2</code>`,
  `<code>dp[i] = dp[i-1] + dp[i-2]</code>`, names like `<code>ok</code>`, `<code>long long</code>`. Never put LaTeX inside `<code>` or `<pre>`, and never put code names inside LaTeX.
- Keep it simple. If KaTeX does not load, the reader sees your raw text, and it must still be readable. Only these commands:

| Write | Shows | Write | Shows |
|---|---|---|---|
| `\le` `\ge` `\ne` | ≤ ≥ ≠ | `\lfloor x \rfloor` | round down |
| `&lt;` `&gt;` | < > (HTML-escaped) | `\lceil x \rceil` | round up |
| `\cdot` | multiply: `2 \cdot 10^5` | `\sum` | sum sign |
| `\times` | multiply, between words: `t \times` (steps) | `a \bmod m` | remainder |
| `\frac{a}{b}` | fraction | `\sqrt{n}` | square root |
| `x^2` `10^{18}` | power (braces for 2+ characters) | `\log n` | logarithm |
| `a_i` `t_{i+1}` | index | `\dots` | … |
| `\approx` `\pm` `\to` | ≈ ± → | `\min` `\max` `\gcd` | named functions |
| `\text{steps}` | a word inside a formula | | |

- No HTML tags inside math: `\( <b>n</b> \)` breaks. Put the tag outside: `<b>\( n \)</b>`. Write `<` as `&lt;`.
- One formula = one piece of text. Do not split it over tags or lines.
- Inline math must be short (it must fit on a phone, 390px wide). A long formula goes in `\[ … \]`; it scrolls inside its own box.
- Tooltips are plain text: no LaTeX in `data-tip` and `data-ar`. Write `10^8` and `O(n log n)` there.
- Explain every symbol at first use on the page, in words and with a number: "`\( \lfloor 8 / 3 \rfloor = 2 \)`: we round down".

## 4. Easy language (checkable)
1. A sentence has at most 15 words. The checker warns above 22. A formula or a piece of code counts as one word.
2. One idea per sentence. Split at "and", "because", "which", "so that".
3. Common words, present tense, say "you". "use", not "utilize". No idioms, no jokes that need culture.
4. Never write "obviously", "simply", "just", "clearly", "easy to see", "of course", "trivial".
5. **Numbers before letters.** Show a concrete example with real numbers before any formula or any letter like \( n \).
6. Every symbol and every new word is explained at its first use on the page. A technical word gets Arabic help (section 5).
7. Use the same word for the same thing on the whole page. Do not switch between "array", "list" and "sequence".
8. Say what to DO. "Write `lo + (hi - lo) / 2`", not "care should be taken with the midpoint".

## 5. Arabic help: on hover or tap only
Arabic never appears inside the text, and never in brackets. It lives in tooltips (hover, keyboard focus, tap).
The "ع" button in the sidebar turns the sentence underlines off and on.

**Words:** `<span class="term" data-t="KEY">word</span>`. KEY must exist in a glossary file (`en`, `ar`, `note`).
Mark a technical word at its first use on the page, once or twice per page, not every time.

**Sentences and phrases:** `<span class="tr" data-ar="الترجمة العربية">English sentence or phrase.</span>`
Add a `.tr` to any sentence that a B1-level reader may not fully get:
- the one-line `.idea` (always);
- the sentence that carries the key idea of a section;
- sentences with a condition or a negation: "only if", "unless", "at most", "at least", "no two …", "never … before";
- every "You may think" and every "The truth" in "Wrong ideas people get";
- every "Check yourself" question.

Rules for a `.tr`:
- About 8–15 per lesson (the checker warns under 6). Wrap one sentence, or two short ones that belong together.
  Never a whole paragraph, never code blocks, never a table.
- The Arabic is natural Modern Standard Arabic. Translate the meaning, not word by word.
- Keep C++ names, variable names and numbers in Latin letters inside the Arabic: `استخدم lower_bound`, `n ≤ 5000`, `10^9`.
- `data-ar` is plain text: no tags, no LaTeX. A quote mark inside it is written `&quot;` (or use «…»). It must not be empty: the build fails.
- A `.tr` may contain `<code>`, `<b>`, math and a `.term`. On the `.term` the reader sees the word; on the rest, the sentence.

## 6. No rabbit holes
The reader follows the lessons in the order of `src/topics.json`. A lesson must never send them away or leave a wrong picture.

1. **Only earlier ideas.** A lesson uses only ideas from EARLIER lessons in `src/topics.json`, plus basic C++ (variables, `if`, loops, functions, `vector`, `cin`/`cout`).
   If it must mention a later idea, it says "you learn this later" and links forward **inside the "Not now" box only**.
   Outside "Not now" and "Learn more", a link to a later lesson is an error.
2. **"Before this lesson" is honest.** List the 1–3 earlier lessons this page really needs, and link them.
3. **One way.** Do not teach two ways to do the same thing. If you must show two (a template and a library call), the page says which ONE to use and when
   ("Which one do I use?" in binary-search).
4. **Mark every simplification.** If a sentence is not fully true, say so in the same place: "true for now; the exception is in <lesson>", or "a safe estimate, not an exact law".
   A forward link for the exception goes in "Not now".
5. **Exact C++.** Every claim about C++ is exact: what a function returns, when it is undefined, what overflows and when, what the cost is.
   Not sure? Test it or leave it out. "`lower_bound` gives the first index with `a[i] >= x`", not "finds x".
6. **Not now.** Name the 1–3 side topics a curious reader will want to chase from this page. Say why to skip them at this level and when to come back.
7. **No loose ends.** Do not use a word, symbol or function you did not explain. Do not write "there are other ways" without naming the one to use.
8. **Outside links** only in "Learn more" (and in practice items). The lesson is complete without them.

## 7. Code rules
- C++17, `#include <bits/stdc++.h>`, `using namespace std;`. Beginner style: clear names, no macros, no clever tricks.
- Inside `<pre><code class="cpp">` you MUST escape `<` as `&lt;`, `>` as `&gt;`, `&` as `&amp;`.
- Each `<pre>` is one of:
  - no attribute: a **complete program** with `main` (compiled by the checker),
  - `data-part="global"`: functions / declarations that compile at global scope after the include line (compiled by the checker),
  - `data-part="main"`: a few lines that would sit inside `main` (not compiled; keep it ≤ 8 lines and be extra careful).
- The code must be correct. Test complete programs by hand on a small input. Lines ≤ 90 characters.
- The code of "Solve one together" is a complete program and uses only tools from this lesson and earlier lessons.

## 8. Practice problems
- Links to Codeforces: `<a class="cf" data-p="CONTEST+LETTER">Name</a>` (e.g. `data-p="1352C"`); the site builds the URL.
- Keep an existing, verified ladder as it is when you upgrade a page.
- Pick new problems from real data, never from memory: `node tools/suggest.js "<tag>" <minRating> <maxRating>` lists the most-solved
  Codeforces problems per rating for a tag (official ratings and solve counts). The ladder climbs smoothly
  (e.g. 800, 900, 1000, 1100, 1200, 1300…) with 6–8 problems. Prefer problems with many solvers. Check the tags really fit your topic.
- You supply id + exact name + official rating (`<span class="r">1200</span>`). The site sorts each ladder by rating, then solve count, and prints both.
- `node tools/check-problems.js` must report no issue for your pages.
- Other judges are allowed as normal links when well known and stable: CSES (`https://cses.fi/problemset/task/<id>` only if sure of the id,
  else `https://cses.fi/problemset/`), AtCoder DP contest (`https://atcoder.jp/contests/dp/tasks/dp_a` … `dp_z`).
- More problems per idea live in the training set (`src/training-tracks.json` → `node tools/make-training.js`); the site links it under each lesson.

## 9. Learn-more links (only stable, well-known pages; if not sure of the exact URL use the site's main page)
Keep existing, verified links when you upgrade a page.
- `https://codeforces.com/edu/course/2` (Codeforces EDU: binary search, two pointers, DSU, segment tree…)
- `https://usaco.guide/` (sections: bronze, silver, gold) · `https://cp-algorithms.com/` · `https://cses.fi/book/book.pdf` (Competitive Programmer's Handbook, free)
- `https://codeforces.com/group/MWSDmqGsZm/contests` (Assiut University newcomers sheets, popular with Arabic-speaking beginners)
- `https://www.youtube.com/@ArabicCompetitiveProgramming` (Arabic video lessons by Mostafa Saad) — mention as "Arabic videos", only on core algorithm pages.
- `https://en.cppreference.com/w/cpp/container` for STL.

## 10. Cheat sheet (`src/pages/cheatsheet.html`)
- Cards only: `<div class="cc" data-to="slug" data-tip="plain-text description">`. No description text inside a card; it goes in `data-tip`.
- Formulas are LaTeX inside `<div class="fx">`. C++ expressions are `<code>` inside `.fx`, or a `<pre>` code card. Never mix the two in one expression.
