# Community references for the Codeforces beginner guide (→1600, C++)

Method: Codeforces JSON API only (`blogEntry.view`, `blogEntry.comments`, `user.blogEntries`), 2026-11-27. Opened: **93 blog entries**, **30 comment threads**, 99 author listings. "(N)" = blog votes at fetch time; "c+N" = votes of one comment. **No external site was opened** (cses.fi, usaco.guide, atcoder.jp, YouTube, Google Drive, a2oj…): every external URL below is "seen in discussion, not opened". Linked PDFs/videos (E869120's PDF, TheScrasse's roadmap file, galen_colin's videos) were not read.

## 1. Practice advice with evidence

1. **Practise slightly above your level, not on easy problems.** 17842 (563), 118882 (248), 91114 (1899). Official scale, 62865 (3188): problem rating = your rating → ~50% solve chance in a round; 200 below → 75%; 400 below → 90%. 116371 (307): pick a range where you solve ~30–40% alone. One cyan report: "a lot of 1300–1500s" (101561, c+15).
2. **Honest effort matters more than the method** — "pretending to solve for n minutes, then reading the editorial" is the main trap. 98621 (1292), backed by 98806 (1117) and 129125 (207).
3. **Time before the editorial — real disagreement.** Never read / come back in a month: 98806, 98621 (author later clarified editorials are not evil). Read once truly stuck: Errichto 10–30 min without ideas (66909, c+25); 15 min of serious thinking (116371); 10 min for Div2 A level (53341, 181). Editorials defended in 98621 comments (c+126, c+105, c+56). Common ground: no fixed timer while you still have ideas; implement after reading.
4. **Upsolve after every contest** — at least the first problem you failed. 113785 (1119, "Upsolve to your next level"), 66909 c+25, 86330 c+42, 128616 (112).
5. **Take live contests; do virtual ones for those you miss.** 116371, 53341, 113785. Contests train speed, the archive trains solving (98806). Caveat: virtuals done as a chore stop helping (98621).
6. **Do not practise by topic / do not look at tags** once the topic is learned; recognising the technique is the skill. 113785, 116371, pllk in 57445 (c+13), 65133 (76, recommends "blind order"). Counterpoint: 111099 (283) groups problems by topic, then ends with mixed sections.
7. **Learn an algorithm when a problem needs it; approaches before algorithms.** 116371, 101549 (268), 118882.
8. **Math thinking is the usual bottleneck for grey/green.** 118882, 101561 (313; c+160, c+86). Disputed: 101549 claims a coach is nearly required; Geothermal disagrees (101561).
9. **Stress-test** (brute force + random small tests) instead of staring at code. 133289 (263, §4), 98806 c+23, 113785.
10. **Recent Div2 A/B reward guessing from samples** — do not practise only on them. 111099, 101420 (330).

## 2. Recommended resources

Count = number of opened threads (of 93 entries + 30 comment threads) mentioning it.

| Resource | URL as written | Recommended in | Count | Level / topic |
|---|---|---|---|---|
| CSES Problem Set | `https://cses.fi/problemset/` | 57445, 101561, 111099, 116371, 70018, 80064 | 8 | standard techniques; "doesn't teach how to think" (111099) |
| AtCoder Beginner Contests | `https://atcoder.jp`, `https://kenkoooo.com/atcoder/#/table/` | 53341, 66909, 111099, 113785 | 9 | ABC C–D ≈ 1100–1600 (53341); educational |
| Competitive Programmer's Handbook | `https://cses.fi/book.html` | 50728 (1161), 101561, 118882 | 4 | first 8 chapters for basics (118882) |
| Codeforces EDU | `/edu/courses`; lessons `https://codeforces.com/edu/course/2/lesson/6`, `/9` | 79530 (2375), 81729, 87248, 101561 c+18 | 6 | binary search, two pointers; 101549 doubts its value for greys |
| USACO Guide | `https://usaco.guide/` | 111099, 116371, 101561, 95106 | 6 | topic lookup; OI-flavoured |
| cp-algorithms / e-maxx | `https://cp-algorithms.com` | 116371, 101549, 101561, 120381 | 7 | algorithm reference |
| TheScrasse roadmap (~100 problems) | Google Drive link in 111099 | 111099 (283) | 1 | grey → blue |
| Mostafa Saad "Juniors sheet" | `https://goo.gl/unDETI` | 65133 (76), 97858 (30) | 3 | newcomer → Div2 D |
| CP-31 sheet (TLE Eliminators) | `https://www.tle-eliminators.com/cp-sheet` | 139079 (58) | 1 | 31 problems per rating, 800–1900; low vote count, author's own product |
| A2OJ ladders | `https://a2oj.com/ladders` | 16443 (136), 47442 (195) | 5 | by Div2 letter / rating; **site likely gone**: listing shows "Goodbye A2 Online Judge :(" (71249, 1793, not opened) |
| USACO training | `https://train.usaco.org/` | 98621, 116371 | 3 | absolute beginners; called outdated in 101549 c+57 |
| Timus (no editorials) | `https://timus.online/` | 98806, 101561 c+32, 16599 | 8 | archive practice |
| Alcumus (AoPS) | `https://artofproblemsolving.com/alcumus/` | 118882 | 2 | counting, number theory for greys |
| AtCoder DP contest | `https://atcoder.jp/contests/dp` | 67679, 95106 | 3 | DP |
| Ultimate Topic List | `https://youkn0wwho.academy/topic-list` | 95106 (4383) | 1 | graded from 1600 upward only |
| Benq's repo | `https://github.com/bqi343/USACO` | 71349 (303) | 1 | general |

## 3. Per-topic best explanations (opened via API)

| Topic | Entry |
|---|---|
| Binary search | 81729 "EDU: Binary Search" (710). Videos: 114268 "Hooray! Binary Search Episode!" (387), 67509 "The most comprehensive Binary Search lecture" (233) |
| Two pointers | 87248 "EDU: Two Pointers Method" (553) |
| Prefix sums | 88474 "Video about prefix sums, difference array and the power of half-closed intervals" (365) — video announcement |
| Number theory basics | weak: 54090 "[Tutorial] Math note — linear sieve" (226, not beginner level); 8989 "Sieve Methods : Prime, Divisor, Euler Phi etc." (18). 46620 "Number Theory in Competitive Programming [Tutorial]" → API "not found" |
| Modular arithmetic / inverse | 72527 "Modular Arithmetic for Beginners" (46) |
| Bit manipulation | 73490 "Bitwise operations for beginners" (206); 73558 "Bitwise operations 2 — popcount & bitsets" (326) |
| DP for beginners | 67679 "DP Tutorial and Problem List" (301); 70018 "CSES DP section editorial" (192); 80064 "Beginner Friendly Series on Dynamic Programming" (120) |
| Graphs BFS/DFS | 16221 "Algorithm Gym :: Graph Algorithms" (355); deeper: 68138 "[Tutorial] The DFS tree and its applications: how I found out I really didn't understand bridges" (565); 22276 "0-1 BFS [Tutorial]" (178) |
| Dijkstra | no dedicated beginner entry; section inside 16221; 43508 "Faster Dijkstra on Special Graphs [Tutorial]" (92, advanced) |
| DSU | 120381 "Introduction to Disjoint Set Data Structure \| DSU" (46); 111583 "[Educational] DSU Study Notes (1)" (39) |
| Trees | 81527 "Algorithms Thread 8: Tree Basics (+ Gym Contest)" (1924); 101271 "[Tutorial] Diameter of a tree and its applications" (259) |
| Topological sort | none found (only a section in 3075 "Basic Graph Theory", 8 votes) |
| Combinatorics | 110376 "[Educational] Combinatorics Study Notes (1)" (139); 62690 "Sums and Expected Value — part 1" (614); 64625 "[Tutorial] Inclusion-Exclusion Principle" (323, harder) |
| Interactive problems | 45307 "Interactive Problems: Guide for Participants" (293) |
| Stress testing / debugging | no dedicated tutorial found; 133289 "How to Solve Questions [Dominater Version]" (263, §4); 113785 "Pro Tips — get them while they are free" (1119); 15547 "Catching silly mistakes with GCC" (899) |
| C++ STL / C++ for CP | 15643 "C++ Tricks" (971); 74684 "C++ tips and tricks" (756); 62393 "Blowing up unordered_map, and how to stop getting hacked on it" (752). 9702 "C++ STL: map and set" → API "not found" |
| Common beginner mistakes | 111217 "[Tutorial] Common Mistakes in Competitive Programming and How to Avoid Them" (634) |

Also useful: 20548 "How to come up with the solutions: techniques" (731); 84150 "Tricks that I learnt while practicing" (472); 99660 "How to use Codeforces [GUIDE]" (726).

## 4. What matters up to 1600

- **To leave grey:** "DFS, binary search and ideas taught in middle school math", and the author calls even that list exaggerated (98621).
- **Grey → blue roadmap sections:** ad-hoc, STL, binary search, DP, number theory, graphs (111099).
- **Div2 C–D level:** DP, graph algorithms such as Dijkstra and MST, segment/Fenwick trees (86330, c+12) — a single low-vote comment that mixes pre- and post-1600 material.
- **95106 (4383):** its graded list starts at 1600–1899; "If you are a beginner then just learn basic topics and solve problems."
- **Not needed yet:** segment trees (Wind_Eagle did not understand them as an expert, 101549), HLD, centroid decomposition (118882), treap/Cartesian tree, Mo's algorithm ("so many gray people who learn" them, 101549).
- No opened thread gives a numeric "N topics before 1600". **Unverified.**

## Not verified

- All external pages and their contents; whether A2OJ still works.
- Entries 46620 and 9702 exist in link lists (57282, 13529) but the API returns "not found".
- Counts cover only the threads I opened; they are not site-wide statistics.
- Vote counts change over time.
