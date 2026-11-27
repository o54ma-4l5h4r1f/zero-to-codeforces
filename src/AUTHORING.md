# How to write a lesson page

Reader: a beginner who knows basic C++ only. First language: Arabic. English is weak (about level B1).
Goal: reach Codeforces ~1600 by following the lessons **in order**, without getting lost.
Each page is SHORT: about 3 screens. No proofs, no university-style text.

**Reference pages. Read them first and copy their structure, tone and length:**
- `src/pages/binary-search.html` — an algorithm lesson (stages 1–3), with two steppers.
- `src/pages/graphs-bfs-dfs.html` — an algorithm lesson with graph steppers and grid figures.
- `src/pages/complexity.html` — an advice lesson (stage 0), with a chart.
- `src/pages/cheatsheet.html` — formulas in LaTeX, code in code.

A page is "upgraded" when it follows this file. The checker knows an upgraded page by `class="before"`.

## 1. Files and checks
- One lesson = one HTML fragment: `src/pages/<slug>.html`. Slugs and the lesson order are in `src/topics.json`.
  No `<html>`, `<head>`, `<body>`, `<h1>`, `<style>` or `<script>`. The site adds the title.
  The one exception: the JSON spec of a picture, `<script type="application/json">` inside `<figure class="viz">` (section 11).
- New Arabic words go in ONE file: `src/glossary/<your-stage>.json` (for example `1.json`), same format as `00-base.json`.
  Look in all glossary files first and reuse keys. A key must exist in one file only. Do not edit other shared files.
  Glossary Arabic follows the term list of section 5.
- Run all of these before you finish. All must be clean for your pages:

```sh
node build.js                          # 0 problems (glossary keys, links, empty translations)
node tools/check-code.js <slug>        # your C++ compiles, 0 failed
node tools/check-problems.js           # every practice link is real, name and rating match
node tools/check-path.js <slug>        # structure, LaTeX, forward links, long sentences, picture limits: 0 errors
node tools/viz-gen.js                  # generated pictures still match their generator (section 11.5)
                                       # to rewrite YOUR figures: node tools/viz-gen.js --write <slug>  (never another page)
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
  <div class="way"><h3><b>2 · Picture</b> — short name</h3> a stepper or a figure on a tiny example (section 11); a short table only if it adds something </div>
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

**"Change it to fit" (algorithm lessons).** Use the one allowed extra section for this: `<section>` with `<h2>Change it to fit</h2>`,
placed where the extra section goes (after "Three ways", before "Solve one together"). It shows 2–4 small variants of the same tool,
each as "the problem changes like this → you change this line / this idea", with the changed line of code shown.
State which form is the DEFAULT to use. The guide `choose-a-tool` links to these sections.

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
tables scroll on their own.
Pictures are made with the visual kit (section 11). Hand-written SVG is a last resort for a shape the kit cannot draw. In it use `fill="none" stroke="currentColor"` or the CSS variables
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
- Write it in natural logical order: `10^9`, `a / b`, `-7 % 5`, `pre[r] - pre[l-1]`. The app shows every Latin, number and code run
  left-to-right inside the Arabic (each run is isolated in `<bdi dir="ltr">`), so never reverse anything by hand.
  Write arrows in words: «من a إلى b», not `a → b` and never `b ← a`.
- Terms (fixed; the glossary uses them too): edge = ضلع · path = مسار · greedy algorithm = خوارزمية جشعة · monotonic = مطّرد ·
  string = سلسلة نصية · prefix sums = المجاميع التراكمية · range = مجال · number = عدد, digit = رقم · judge = الحَكَم ·
  verdict = نتيجة الحُكم · chart = رسم توضيحي · coin = عملة · one pass = مرور واحد · brute force = تجربة كل الاحتمالات ·
  priority queue = طابور الأولوية · stress test = اختبار الضغط. Container names (`map`, `set`, `vector`) stay in Latin letters.
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
9. **The order.** Stage 3 ends with the optional lessons: `dsu`, `toposort`, `interactive`. No required lesson may depend on them;
   a required lesson that mentions DSU or toposort links them from "Not now" only. Add a new optional lesson after these, never between
   required ones. `priority_queue` is taught where it is first needed (`dijkstra`); earlier lessons do not assume it.

### 6.1 Cross-lesson rules (every page says the same thing)
Lessons were written by different people. These facts are fixed so no two pages contradict each other. `tools/check-path.js`
checks the ones marked (checked).

- **Integer division** in C++ goes toward zero: `-7 / 2` is `-3`. Say "drops the fraction". It "rounds down" only for positive numbers;
  if you write "rounds down", say "for positive numbers" in the same sentence. (checked: warning)
- **Sort big → small:** the ONE default form is `sort(a.rbegin(), a.rend())`. `greater<int>()` may be mentioned once, as an equal form,
  on a page that also shows the default form. (checked: error if `sort(…, greater<…>())` appears and `rbegin` does not)
- **Fast power:** the ONE form is `power(a, b, m)` with three arguments. (checked: warning on a two-argument `power(…)` call)
- **Prefix sums:** positions count from 1, `pre[0] = 0`, the sum of `a[l..r]` is `pre[r] - pre[l-1]`. Every page that shows the formula
  uses this form, the cheat sheet too. (checked: warning on `pre[r + 1] - pre[l]`)
- **Globals:** allowed for arrays and vectors that functions such as `dfs` share. They must be reset in every test case; say so.
- **New C++ syntax** (`auto`, `auto [a, b]`, `&`, `const &`, lambdas, iterators): at its first use in a lesson, one plain sentence
  and a link to `#cpp-reference`.
- **Deep recursion:** say it is fine on Codeforces' large stack, and that it can crash on your own computer's 8 MB stack.
- **"Before this lesson"** links only to EARLIER lessons in `src/topics.json`. (checked: error)

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

## 10. Cheat sheet (`src/pages/cheatsheet.html`) and extra pages
- Cards only: `<div class="cc" data-to="slug" data-tip="plain-text description">`. No description text inside a card; it goes in `data-tip`.
- Formulas are LaTeX inside `<div class="fx">`. C++ expressions are `<code>` inside `.fx`, or a `<pre>` code card. Never mix the two in one expression.
- Extra pages (`src/extras.json`: `{slug, title, wide}`) are reference pages, not lessons. They get a quick link at the top of the sidebar,
  the route `#slug`, the link checks and the math rules. A page listed there but not written yet is a build warning, and no link is shown.
- `choose-a-tool` ("Which tool?") is the guide the student runs before and during every problem. It is not a lesson and has no lesson
  blocks. Its parts, in order: the 7-step thinking routine (`.worked` box) · limits → allowed cost table · signal → tool table ·
  confusable pairs with the deciding question · a static SVG flowchart (limits → what is asked → 2–3 candidates) · "When your first
  idea fails" moves · "Then change the tool to fit" (links the lessons' "Change it to fit" sections) · which-tool drills
  (`<section class="check">`, NOT `.practice`, so the site does not re-sort them; the tool is only inside `<details>`) · a pocket version.
  Every table row carries its stage number (`<span class="eyebrow sN">N</span>`). When a lesson's "Spot it" changes, update the matching row.

## 11. Pictures and animations (the visual kit, `src/viz.js`)
A picture is a `<figure class="viz">` with a JSON spec. The site draws it as inline SVG: to scale, in the theme colours, light and dark.
No library, no hand-drawn SVG for these shapes. `node build.js` parses and checks every spec and **fails** on a bad one.
A bad spec in the browser shows an orange "Picture error" box that names the problem.

**See them live:** `complexity` (chart), `binary-search` (array stepper + number-line stepper), `graphs-bfs-dfs` (two graph steppers, two grids).

### 11.1 The markup (exact)
```html
<figure class="viz" data-viz="KIND" aria-label="One full sentence: what the picture shows.">
  <script type="application/json">
  { …the spec… }
  </script>
  <!-- only for data-viz="stepper": one <li> per step, in order -->
  <ol class="viz-steps">
    <li>Caption of step 1. It is normal lesson HTML: <code>code</code>, \( math \), <span class="tr" data-ar="…">a translated sentence</span>.</li>
    <li>…</li>
  </ol>
  <figcaption>What to notice. Shown under the picture, always.</figcaption>
</figure>
```
- `KIND` is `stepper`, or one static scene: `array`, `table`, `graph`, `numberline`, `clock`, `vars`, `plane`, `chart`.
- `aria-label` (8+ characters) and a `<figcaption>` with text are required. This JSON `<script>` is the only `<script>` allowed in a page.
- The JSON is strict: double quotes, no comments, no trailing comma. Text inside the JSON is plain text: no tags, no LaTeX.
  Write a power as `n^2` or `10^8` in chart names and labels; the chart raises it.
- Captions are real HTML, so math, `.term`, `.tr`, the build checks and the readability checks all work on them. Arabic stays in `data-ar`.
- A figure may sit inside a `.way` box, a plain `<section>`, or a step of "Solve one together".

### 11.2 States (the same six names in every scene)
| State | Also accepted | Looks like | Default legend text |
|---|---|---|---|
| `active` | `current` | accent colour, thick border (a graph vertex also gets a ring) | current |
| `done` | `yes`, `visited`, `good` | green, solid border, a ✓ mark | done |
| `bad` | `no` | orange, long dashes, a × mark | no |
| `queued` | `wait`, `queue` | purple, short dots, a … mark | waiting |
| `read` | | accent colour, dashed border, no fill | read from |
| `dim` | `off` | faded, dotted | not needed |

Every state has a colour **and** a border style or mark, so it never depends on colour alone. A legend with the states you used is added under the picture.
Give the legend your own words with `"legend": { "active": "mid: we ask here", "no": "a \"no\"" }` at the top of the spec. `"legend": false` hides it.

### 11.3 `stepper`: the core
```json
{
  "scenes": [ { "type": "array", "id": "a", "label": "a", "values": [1, 3, 4, 7] },
              { "type": "vars", "id": "v", "items": [] } ],
  "code": ["int lo = -1, hi = 4;", "while (hi - lo > 1) {", "    …", "}"],
  "legend": { "active": "mid" },
  "steps": [
    { "line": 1,      "a": { "pointers": { "lo": -1, "hi": 4 } },                        "v": { "items": [["mid", ""]] } },
    { "line": [2, 3], "a": { "pointers": { "lo": -1, "hi": 4, "mid": 1 }, "states": { "1": "active" } }, "v": { "items": [["mid", 1]] } }
  ]
}
```
- `scenes`: one or more scenes, drawn one under the other. Each has a `type` and the fixed part of its spec. `id` defaults to the type; give ids when two scenes share a type. A `chart` cannot be a scene.
- `steps[i]`: for each scene id, the fields that are different in this step. A field you give **replaces** that whole field of the scene. Steps do not add up: every step is written in full, starting from the scene.
- `line` (optional): the line or lines of `code` that run in this step, counted from 1.
- `code` (optional): C++ lines, shown beside the scene (under it on a phone). Raw text, not HTML-escaped. Keep lines under 44 characters.
- The number of steps must equal the number of `<li>` captions.
- The reader gets: Restart, Back, Play / Pause, Next, a counter "3 / 8", and the keys ← → Home End when the figure has focus. Buttons are 40px high.
  With "reduce motion" on, there is no Play button and nothing slides. On paper: the picture of the step on screen and all captions as a numbered list.

### 11.4 Scenes
All fields except the ones marked **required** are optional.

**`array`**: boxes with index numbers.
```json
{ "label": "a", "values": [3, 1, 4, 1, 5], "states": { "1": "active", "2": "active" },
  "pointers": { "l": 1, "r": 2 }, "bracket": [1, 2],
  "rows": [ { "label": "pre", "values": [0, 3, 4, 8, 9, 14] } ] }
```
`values` **required** · `label` name at the left · `start` first index (default 0) · `index: false` hides the index numbers ·
`states` by index (`{"3": "done"}`) or a list as long as `values` · `pointers` named arrows under the cells; `null` hides one; a pointer may stand one step outside (`-1` or `n`), the picture then shows an empty dotted cell ·
`bracket: [from, to]` a frame around a window of cells · `rows` more rows under the first (prefix sums, a second array), each `{label, values, states, start}`.

**`table`**: a 2D grid (DP table, the sieve, all pairs).
```json
{ "corner": "item \\ w", "colLabels": [0, 1, 2, 3], "rowLabels": ["1", "2"],
  "rows": [[0, 0, 5, 5], [0, 4, 5, 9]], "states": { "1,3": "active", "0,3": "read", "0,2": "read" } }
```
`rows` **required** (same length each; `null` or `""` is an empty cell) · `states` with keys `"row,col"` from 0. Use `active` for the cell you fill and `read` for the cells it reads.

**`graph`**: vertices and edges. Also for trees, call trees and DSU.
```json
{ "nodes": [ { "id": "A", "x": 0, "y": 0 }, { "id": "B", "x": 2, "y": 0 }, { "id": "C", "x": 2, "y": 1 } ],
  "edges": [ { "from": "A", "to": "B", "w": 4 }, { "from": "B", "to": "C", "directed": true } ],
  "states": { "A": "done", "B": "active" }, "notes": { "A": "dist 0", "B": "dist 4" }, "edgeStates": { "A-B": "active" } }
```
`nodes` **required**: `id`, `x`, `y` (your own units, `y` grows down; one unit is `unit` pixels, default 76, made smaller when the graph is wide), `label` (default: the id), `at: "above" | "below"` for the place of its note ·
`edges`: `from`, `to`, `w` (a weight, drawn beside the line), `directed` (an arrow); `"directed": true` at the top makes every edge directed ·
`states` by node id · `notes` a short text beside a vertex (`dist 2`, `visit 3`) · `edgeStates` with keys `"from-to"` (`active` thick accent, `done` thick green, `dim` dotted).

**`numberline`**: a line of numbers (binary search on the answer, ranges, overflow, intervals).
```json
{ "min": 0, "max": 10, "range": [2, 7], "pointers": { "lo": 2, "hi": 7 },
  "states": { "2": "no", "7": "yes" }, "notes": { "2": "no", "7": "yes" },
  "intervals": [ { "from": 1, "to": 4, "label": "A", "state": "done" } ], "markers": [ { "at": 5, "label": "x" } ] }
```
`min`, `max` **required** · `step` between ticks (default 1, at most 60 ticks) · `labelStep` print a number every so many · `range` a thick bar on the line ·
`pointers` as in `array` · `states` a coloured dot on a tick · `notes` a word above a tick · `intervals` bars above the line `{from, to, label, state}` · `markers` extra dots `{at, label, state}`.

**`clock`**: the numbers 0 … mod-1 on a circle, for remainders.
```json
{ "mod": 7, "at": 3, "label": "10 mod 7 = 3", "states": { "3": "active" } }
```
`mod` **required** (2 to 24) · `at` where the hand points (any whole number, it is wrapped) · `label` a line under the clock.

**`vars`**: a strip of "name = value".
```json
{ "items": [ ["sum", 12], ["queue", [2, 3]], ["best", ""] ] }
```
`items` **required**: pairs. A list value is drawn as boxes, front first (a queue, a stack, a path). `""` shows "—". In a stepper, a value that changed in this step gets a frame.

**`plane`**: a coordinate plane. Two orientations; pick the one the lesson's code uses.
```json
{ "x": [0, 7], "y": [0, 5],
  "points": [ { "at": [1, 1], "label": "A" }, { "at": [5, 4], "label": "B" } ],
  "segments": [ { "from": [1, 1], "to": [5, 4], "label": "straight", "state": "dim" } ],
  "paths": [ { "points": [[1, 1], [5, 1], [5, 4]], "label": "4 + 3 = 7", "state": "active", "arrow": true } ],
  "rects": [ { "from": [2, 2], "to": [4, 5], "label": "R" } ] }
```
```json
{ "orient": "grid", "rows": 3, "cols": 5, "rowLabel": "row x", "colLabel": "column y",
  "cells": [ { "at": [1, 2], "text": "x,y", "state": "active" }, { "at": [0, 0], "text": "#", "wall": true } ] }
```
- Math orientation (default): `x: [min, max]` and `y: [min, max]` **required**. A pair is `[x, y]`. `y` grows **up**. Points sit on grid crossings. `xLabel`, `yLabel` name the axes.
- Grid orientation (`"orient": "grid"`): `rows`, `cols` **required**. A pair is `[row, col]`, as in `grid[row][col]`. Rows grow **down**. A pair names a cell; points and lines go through cell centres. `rowLabel`, `colLabel` name the axes.
- `points` `{at, label, state, labelAt: "left" | "below"}` · `segments` `{from, to, label, state, arrow, gap}` · `paths` `{points, label, state, arrow}` ·
  `rects` `{from, to, label, state}` (two corners; in a grid: two corner cells) · `cells` `{at, text, state, wall}` one filled unit square · `unit` pixels per unit (default 46).

**`chart`**: a line chart with real axes (static only).
```json
{ "x": { "label": "n = size of the input", "name": "n", "min": 1, "max": 1000000, "log": true },
  "y": { "label": "steps", "min": 1, "max": 1000000000000, "log": true },
  "series": [ { "name": "n", "fn": "n" }, { "name": "n^2", "fn": "n^2" }, { "name": "mine", "data": [[1, 2], [10, 300]] } ],
  "ref": { "y": 100000000, "label": "10^8 steps = about 1 second", "over": "too slow" } }
```
`x`, `y` **required**: `min`, `max`, `label`, `log` (a log scale; `min` must be above 0); `x.name` is the short name in the readout ·
`series` **required**, at most 5: a `name` and either `fn` (one of `1`, `log n`, `sqrt n`, `n`, `n log n`, `n^2`, `n^3`, `2^n`, `n!`) or `data` (2+ points `[x, y]`) ·
`ref` one horizontal line with a `label`; `over` is a word the readout adds to every value above the line.
Each line has its own colour and its own dash pattern, its name at its end, and a legend. Point at the chart, tap it, or use ← → on it: the readout under it gives the value of every line.
**Always add a "How to read this chart" sentence** in the figcaption, most of all for a log scale ("each grid line is 10 times the line before").

### 11.5 The states are computed, never typed
Every step of a stepper, and every number in a picture that an algorithm produces, comes from **running the algorithm**.
- Add a generator function to `tools/viz-gen.js` (see `GEN['bfs']`). It runs the algorithm, records one state per step and returns `{ spec, trace }`.
- Put `data-gen="name"` on the figure and write `<script type="application/json">{}</script>`.
- `node tools/viz-gen.js --write <slug>` fills in the JSON of that page only (`--write --all` rewrites every page: only when nobody else is editing). It also self-checks that, in an array scene, the cells that changed are the cells that are highlighted. `node tools/viz-gen.js --print name` shows a plain trace of each step: write the captions from it.
- `node tools/viz-gen.js` (no argument) checks that every generated figure still matches its generator. Run it before you finish.
- A picture with no algorithm in it (the 4 neighbours of a cell, a chart of built-in functions) is written by hand and has no `data-gen`.

### 11.6 Which one, and when not
| You want to show | Use |
|---|---|
| An algorithm that changes state step by step | `stepper` with the fitting scene, a `vars` strip, and `code` |
| A fixed shape: a graph, a grid, a range, a window | the static scene (`graph`, `plane`, `numberline`, `array`) |
| How fast something grows, or a comparison of numbers | `chart` |
| Exact values the reader will look up again | a normal HTML table, not a picture |

Limits (checked by `tools/check-path.js` where marked):
- At most **2 steppers** per lesson (error). Static figures are not limited, but one idea = one picture.
- At most **12 steps** per stepper (error). 6–9 is best. Merge boring steps (see the last step of the DFS stepper). Fewer than 3 steps: use a static picture (warning).
- **One sentence per step.** A second short sentence is allowed, three get a warning. The caption says what changed and why.
- Use a tiny example: 5–8 array cells, 5–7 vertices, a number line of at most 20 ticks. It must fit a phone (390px). Wide scenes scroll inside their own box.
- A stepper replaces the long trace table. Keep a short static table only where it adds something the stepper does not show (the yes/no row in binary-search).
- **Do not animate** advice pages (how-codeforces-works, how-to-practice, read-a-problem, debugging, what-next), reference tables, the cheat sheet, or the extra pages. A chart or a static figure is fine there when it carries the point (the growth chart in `complexity`).
- No picture for decoration. If the text is as clear without it, leave it out.

### 11.7 The visual each lesson should get
| Lesson | Visual |
|---|---|
| how-codeforces-works, read-a-problem, how-to-practice, debugging, what-next | none (advice). At most one static figure. |
| cpp-template | none |
| complexity | `chart`: n, n log n, n^2, 2^n against the 10^8 line (done) |
| overflow | `numberline`: the range of `int` with a marker that falls off the end; static |
| simulation | `stepper` + `vars` (and `array` if the state is a row of things): follow the statement step by step |
| arrays-strings | `array` stepper: one loop with a pointer `i` and a running max in `vars` |
| stl-basics | none, or one static `array` for "sort then look" |
| basic-math | `numberline`: a range `[l, r]` and the multiples of k in it |
| brute-force | `table`: all pairs (i, j) as a grid, the checked half marked |
| greedy | `numberline` stepper with `intervals`: pick the interval that ends first |
| stl-containers | `vars` stepper: a stack and a queue as boxes, push and pop |
| sorting | `array` stepper: the merge of two sorted halves (two pointers, a second row for the result) |
| counting | `array` + second row `cnt`: one pass fills the frequency row |
| prefix-sums | `array` stepper with row `pre` and a running total in `vars`; a `chart` only if it compares n·q with n + q |
| two-pointers | `array` stepper with pointers `l`, `r` and `bracket` as the window |
| binary-search | `array` stepper (lo, hi, mid + code) and `numberline` stepper on the answer (done) |
| number-theory | `table` stepper: the sieve grid, multiples crossed out with `bad` |
| modular | static `clock` for "a mod m"; `vars` stepper for fast power |
| bits | `array` of bit boxes (index = power of two, `start` so that bit 0 is on the right side of your choice) with a second row for the mask |
| constructive | none, or one static `array` of the built answer |
| recursion | `graph` stepper: the call tree, `queued` = waiting calls, `done` = returned |
| graphs-bfs-dfs | BFS and DFS `graph` steppers + grid `plane` (done) |
| trees | `graph` stepper: DFS that fills subtree sizes or depths in `notes` |
| dp | `table` stepper: `active` cell and the `read` cells it uses, with `code` |
| dijkstra | `graph` stepper with weights, `notes` = dist, a `vars` priority queue |
| dsu | `graph` stepper: union joins two trees; `notes` = leader |
| toposort | directed `graph` stepper: `notes` = in-degree, queue in `vars` |
| combinatorics | static `table`: Pascal's triangle, or a `plane` grid path |
| interactive | `numberline` stepper: the judge's answers narrow the range |
| cheatsheet, extra pages | none |

## 12. "Why?" notes
A "Why?" note is the short true story behind a fact a curious reader may question: why `int` stops at 2 147 483 647,
why \( 10^9 + 7 \), why `endl` is slow. A small "why?" chip beside the fact opens the story in a card. The page `#why` lists every story.

**Markup (exact).** Put the chip right after the fact, in the same sentence or table cell:
```html
… is 2 147 483 647. <button type="button" class="why" data-why="int-max">why?</button>
```
- At most **3 chips per page** (error). Use them only where a page states a number or rule a student would question.
- Never inside `<pre>`, `<code>`, a `.tr` or `.term` span, a `<figure>`, a link, a heading or a `<summary>` (error). After a `.tr`, put it outside the `</span>`.
- The site adds the accessible name ("Why? " + the story title). Do not add `aria-label` or other attributes.

**Where the stories live.** One theme per file: `src/whys/<NN-theme>.html`, starting with `<h2>Theme name</h2>`. Each story:
```html
<article data-key="int-max">
<h3>Why is the biggest <code>int</code> 2 147 483 647?</h3>
<p>3–8 short sentences, numbers first. 2–4 of them inside a .tr with data-ar.</p>
<!-- optional: one small picture (a figure.viz from section 11, or a short table) and one \[ … \] line -->
<p class="why-means"><b>What this means for you:</b> one line the student can act on.</p>
</article>
```
- The key is lower-case words joined by `-`. Reuse an existing story before you write a new one: `grep data-key src/whys/*.html`.
- All page rules apply inside a story: LaTeX (section 3), easy language (section 4), `.tr`/`.term` (section 5), pictures (section 11, static only).
- `node build.js` **fails** on a chip whose key has no story and **warns** on a story no page uses (it still shows on `#why`).
  `node tools/check-path.js` checks the chips on every page; `node tools/check-path.js whys` checks only the stories (length, `.tr`, math).

**Truth rules.**
- Every number in a story is exact and checked: limits, sizes, timings, overflow results, `%` on negatives, floating-point output.
  If code can settle it, run the code and copy the real output. Say where a timing comes from ("on one laptop", "on Linux").
- History and names: only what is well established. A traditional story that cannot be checked is written as "the story goes…" or left out.
  Never invent a date, a quote or an anecdote.
- A story is **never required** to follow a lesson. A lesson must make full sense with every chip removed, and a story never teaches a tool the lesson needs.
