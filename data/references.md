# Community references (Codeforces blogs, read via the CF API on 2026-11-27)

93 blog entries fetched with `blogEntry.view` (most with `blogEntry.comments`); about 45 read in substance, the rest skimmed for title, votes and links. Votes = entry rating on the fetch date. "c:N" = votes on a comment. External links (PDFs, videos, sheets) were **not opened**; only their URLs as written in the blog are recorded.

## 1. Practice advice with evidence

1. **Solve problems at or slightly above your level, not easy ones.** Geothermal: "around or slightly above your skill level", aim to solve 30–70% unaided (118845, 206; 101561 c:160). Radewoosh: don't solve the easiest problems and expect progress (91114, 1899). CP-31 author: start at your rating −200 *on that sheet* (139079, 58).
2. **Honest effort matters more than hours or problem count.** "Pretending to solve for n minutes, then reading the editorial" is the main trap (98621, 1292; 91114 c:385).
3. **Time before the editorial: no consensus.** 10 min for easy problems (53341, 181); no fixed limit, read only the first unknown part (118845); problems should take "20 minutes to a few hours" (81358 c:63); never read, return in a month (98806, 1117). Geothermal explicitly rejects "never read" (101561 c:160); TheScrasse: "Editorials are not evil" (123882, 172).
4. **After an editorial, implement it yourself** (101561 c:160; 118845; 123882).
5. **Upsolve after every contest** (113785, 1119; 81358 c:45; 118845).
6. **Virtual contests are good practice** if taken seriously and upsolved (99660, 726; 91114 c:103; 53341). Um_nik: contests train speed, archives train solving (98806).
7. **Learn an algorithm only when problems demand it.** First C++ basics, STL, big-O (118845). "Learn approaches, not algorithms" (101549, 268); most failures are not missing advanced topics (98806; 92248, 1965).
8. **Learn to stress test** — "worth an immediate >100 rating points" (118845 c:8; 133289, 263).
9. **Math helps greys/greens** (counting, number theory): 118882 (248); 101561 c:86.
10. **Disagreement — by topic or by rating?** By topic for beginners, CF archive is bad for them (101549; 111099, 283); by rating/difficulty (101561 c:160, stated for stronger users; 139079). "Just solve problems" (47516, 628) is called insufficient for greys (101549; 101561).

## 2. Recommended resources

"Blogs" = entries where the name/URL appears (automatic text match over the 93 entries, including comments; treat counts as approximate).

| Resource | URL as written | Recommended in | Count | Topic / level |
|---|---|---|---|---|
| CSES Problem Set | https://cses.fi/ | 111099, 101561, 118882, 97058, 57445 | ~18 | Standard problems, beginner+ |
| Competitive Programmer's Handbook | https://cses.fi/book/book.pdf (https://cses.fi/book.html in 50728) | 50728 (1161), 118845, 118882, 97058, 101649 | ~7 | Book; first 8 chapters for beginners (118882) |
| AtCoder Beginner Contests | https://kenkoooo.com/atcoder/#/table/ | 111099, 53341, 113785 | ~16 | Educational problems; ABC-C/D for 1100–1600 (53341) |
| USACO Guide | https://usaco.guide/ | 111099, 118845, 101549 c:31, 101561 | ~9 | Topic-ordered lessons |
| cp-algorithms | cp-algorithms.com | 118845 | ~12 | Algorithm reference |
| Codeforces EDU (ITMO) | https://codeforces.com/edu/course/2/lesson/6 , /lesson/9 | 81729 (710), 87248 (553), 101561 c:18 | ~7 | Binary search, two pointers |
| Errichto 100 Easy Problems | https://codeforces.com/group/yg7WhsFsAp/contests | 97058 (251) | 1 | Sheet, up to 1400 |
| TheScrasse roadmap | https://drive.google.com/file/d/16Jydn250Ue7K7hOfzLxw4p5jFF4ZCqWT/view?usp=sharing | 111099 (283) | 1 | ~100 problems, grey→blue |
| CP-31 sheet | https://www.tle-eliminators.com/cp-sheet | 139079 (58) | 1 | 31 problems per rating, 800–1900 |
| A2OJ ladders | http://a2oj.com/Ladders.jsp | 16443 (136), 47442 (195), 56795 (134) | ~11 | Ladders; **site shut down** (71249, 1793) |
| Mostafa Saad lists | https://bit.ly/37MSCjV | 79231 (470) | ~3 | Graded problem lists |
| Competitive Programming 3/4 | cpbook.net | 118845, 101561 c:160 | ~7 | Book, applications |
| Errichto "How to practice?" | https://github.com/Errichto/youtube/wiki/How-to-practice%3F | 118845 | 1 | Practice guide |
| Timus | https://timus.online/ | 98806, 101561 c:32 | ~12 | Archive without editorials |
| clist problem picker | https://clist.by/problems/ | 118845 | 1 | Choosing difficulty |
| AoPS / Alcumus | https://artofproblemsolving.com/store/list/aops-curriculum | 118882, 101561 c:160 | 3 | Math basics |
| YouKn0wWho topic list | https://youkn0wwho.academy/topic-list | 95106 (4383) | 1 | Topic index; levels start at 1600 |
| Sports Programming (kostka) | link not captured | 109275 (760) | 1 | Free book |

Not recommended: USACO training pages (101549 c:57, Geothermal).

## 3. Best explanation per topic (entries opened through the API)

| Topic | Id | Exact title | Author | Votes |
|---|---|---|---|---|
| Binary search | 81729 | EDU: Binary Search | pashka | 710 |
| (also) | 67509 | The most comprehensive Binary Search lecture | Errichto | 233 |
| Two pointers | 87248 | EDU: Two Pointers Method | pashka | 553 |
| Prefix sums | 88474 | Video about prefix sums, difference array and the power of half-closed intervals | peltorator | 365 |
| Number theory basics | 91707 | [Tutorial] Number theory — Storing information about multiples/divisors | TheScrasse | 105 (not beginner level; no true beginner entry found) |
| Modular arithmetic / inverse | 72527 | Modular Arithmetic for Beginners | Spheniscine | 46 |
| Bit manipulation | 73490 | Bitwise operations for beginners | Errichto | 206 |
| DP for beginners | 67679 | DP Tutorial and Problem List | Ahnaf.Shahriar.Asif | 301 |
| (also) | 80064 | Beginner Friendly Series on Dynamic Programming | kartik8800 | 120 |
| Graphs BFS/DFS | 16221 | Algorithm Gym :: Graph Algorithms | PrinceOfPersia | 356 |
| Dijkstra | 132653 | Common mistakes on Dijkstra algorithm and how to hack them | djm03178 | 401 |
| DSU | 120381 | Introduction to Disjoint Set Data Structure \| DSU | kartik8800 | 46 |
| Trees | 81527 | Algorithms Thread 8: Tree Basics (+ Gym Contest) | SecondThread | 1924 |
| Topological sort | none found | | | |
| Combinatorics | 110376 | [Educational] Combinatorics Study Notes (1) | Black_Fate | 139 |
| Interactive problems | 45307 | Interactive Problems: Guide for Participants | MikeMirzayanov | 293 |
| Stress testing / debugging | 81841 | Stress Testing Tutorial | C137 | 82 |
| (also) | 133289 | How to Solve Questions [Dominater Version] (section 4) | Dominater069 | 263 |
| C++ STL | 74684 | C++ tips and tricks | Golovanov399 | 756 (tricks, not an introduction; no beginner STL entry found) |
| Common beginner mistakes | 111217 | [Tutorial] Common Mistakes in Competitive Programming and How to Avoid Them | YouKn0wWho | 634 |
| How to practice | 91114 | My opinion on how to practice competitive programming | Radewoosh | 1899 |
| (also) | 98621 | Self-deception: maybe why you're still grey after practicing every day | -is-this-fft- | 1292 |
| Using the site | 99660 | How to use Codeforces [GUIDE] | SlavicG | 726 |

## 4. Topics up to 1600

**Said to matter**
- C++ basics, STL containers, big-O before anything else (118845).
- Ad-hoc, STL, binary search, DP, number theory, graphs — the six areas of the grey→blue roadmap (111099).
- Strings, arrays, math, binary search, with prefix sums / sliding window in hints, for ≤1400 (97058).
- Basic logic over breadth of topics at low ratings (97426, 236); counting and number theory maths (118882).
- One coach's order: STL → DP → ad-hoc/number theory → graphs incl. Dijkstra (101649, 186).

**Said NOT to be needed yet**
- YouKn0wWho's list starts its easiest level at 1600–1899; "If you are a beginner then just learn basic topics" (95106). Errichto on it: "many topics are very advanced" (95106 c:137).
- Segment tree: an author was expert without understanding it (101549); Geothermal lost time on segment tree, centroid, HLD too early (118882).
- Treap, Mo's algorithm for greys — named as a typical mistake (101549).
- Pointers, memory management, OOP in C++ (118845).

Unverified: no entry gave an explicit "topics for exactly 1600" list; DSU, topological sort and interactive problems were not discussed as sub-1600 requirements in anything read.
