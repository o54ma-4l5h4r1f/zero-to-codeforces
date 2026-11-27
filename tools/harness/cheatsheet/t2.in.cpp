// Harness part 2: characters, strings, arrays, grids, powers, time, geometry, output, safety.
static const string LOW = "abcdefghijklmnopqrstuvwxyz", UPP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", DIG = "0123456789";
static bool has(const string &s, char c) { return s.find(c) != string::npos; }
namespace g_isVowel {
@{isVowel}
}
static void t_chars() {
  SEC = "chars";
  for (int v = 0; v < 128; v++) {
    char c = (char)v; bool lo = has(LOW, c) && v, up = has(UPP, c) && v, dg = has(DIG, c) && v;
    CK(((@{isalpha}) != 0) == (lo || up)); CK(((@{isdigit}) != 0) == dg); CK(((@{islower}) != 0) == lo); CK(((@{isupper}) != 0) == up);
    CK(((@{isalnum}) != 0) == (lo || up || dg));
    CK((@{islower2}) == lo); CK((@{isupper2}) == up); CK((@{isdigit2}) == dg);
    char wantUp = lo ? UPP[LOW.find(c)] : c, wantLo = up ? LOW[UPP.find(c)] : c;
    CK((@{toup}) == wantUp); CK((@{tolow}) == wantLo); CK(sizeof(@{toup}) == 1); CK(sizeof(toupper(c)) == sizeof(int));
    if (lo) CK((@{toup2}) == wantUp); if (up) CK((@{tolow2}) == wantLo);
    CK((@{asc_c}) == v);
  }
  CK(isalpha('a') != 1 || true);  // may be any non-zero value: documented in the tip
  for (int i = 0; i < 26; i++) {
    char c = LOW[i];
    CK((@{l2i}) == i); CK((@{i2l}) == c); CK(sizeof(@{i2l}) == 1);
    CK((@{nextl}) == LOW[i == 25 ? 0 : i + 1]);
    int p = i; for (int k = 0; k <= 100; k++) { CK((@{shiftl}) == LOW[p]); CK((@{shiftany}) == LOW[p]); p++; if (p == 26) p = 0; }
    p = i; for (int k = 0; k >= -100; k--) { CK((@{shiftany}) == LOW[p]); p--; if (p < 0) p = 25; }
    CK(g_isVowel::isVowel(c) == (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u'));
    for (int j = 0; j < 26; j++) { char c1 = LOW[i], c2 = LOW[j]; CK((@{ldist}) == (i > j ? i - j : j - i)); }
  }
  CK((@{asc_A}) == 65); CK((@{asc_a}) == 97); CK((@{asc_0}) == 48); CK((@{asc_sp}) == 32);
}

namespace g_isPalindrome {
@{isPalindrome}
}
static vector<string> allStrings(int maxLen, const string &alpha) {
  vector<string> res = {""}; size_t from = 0;
  for (int len = 1; len <= maxLen; len++) { size_t to = res.size(); for (size_t i = from; i < to; i++) for (char ch : alpha) res.push_back(res[i] + ch); from = to; }
  return res;
}
static bool bLess(const string &s, const string &t) {
  for (size_t i = 0;; i++) { if (i == t.size()) return false; if (i == s.size()) return true; if (s[i] != t[i]) return (unsigned char)s[i] < (unsigned char)t[i]; }
}
static void t_strings() {
  SEC = "strings";
  { string s = "hello"; CK((@{slen}) == 5); CK((is_same<decltype(@{slen}), int>::value)); CK((@{sfirst}) == 'h'); CK((@{slast}) == 'o'); CK(!(@{sempty}));
    char c = '!'; string t = "ab"; @{sapp1}; CK(s == "hello!"); @{sapp2}; CK(s == "hello!ab"); @{spop}; CK(s == "hello!a");
    CK((@{sjoin}) == "hello!aab"); int n = 3; CK((@{srep}) == "aaa"); n = 0; CK((@{srep}) == ""); }
  { string s; CK(@{sempty}); CK((@{slen}) == 0); }
  vector<string> all = allStrings(7, "ab"), small = allStrings(4, "abc");
  for (const string &orig : all) {
    string manual; for (int i = (int)orig.size() - 1; i >= 0; i--) manual += orig[i];
    { string s = orig; @{srev}
      CK(s == manual); CK(t == orig); }
    CK(g_isPalindrome::isPalindrome(orig) == (orig == manual));
    { string s = orig; int cnt = 0; set<char> ds; for (char ch : s) { if (ch == 'a') cnt++; ds.insert(ch); }
      CK((@{scount}) == cnt); CK((@{sdistinct}) == ds.size()); }
    { string s = orig; @{sadj}
      int w = 0; for (size_t i = 1; i < s.size(); i++) if (s[i - 1] == s[i]) w++; CK(same == w); CK(n == (int)s.size()); }
  }
  for (const string &s : small) for (const string &t : small) {
    bool eq = s.size() == t.size(); if (eq) for (size_t i = 0; i < s.size(); i++) if (s[i] != t[i]) eq = false;
    CK((@{seq}) == eq); CK((@{slt}) == bLess(s, t)); CK((@{smin}) == (bLess(t, s) ? t : s));
    size_t pos = string::npos;
    for (size_t i = 0; i + t.size() <= s.size() && pos == string::npos; i++) { bool ok = true; for (size_t j = 0; j < t.size(); j++) if (s[i + j] != t[j]) ok = false; if (ok) pos = i; }
    CK((@{sfind}) == (pos != string::npos)); CK((@{sfindpos}) == pos); CK((@{sstarts}) == (pos == 0));
    { string s1 = s, t1 = t; string s = s1, t = t1;
      @{ssort}
      int f[128] = {}; for (char ch : s1) f[(int)ch]++; for (char ch : t1) f[(int)ch]--; bool w = true; for (int v : f) if (v) w = false;
      CK(sameLetters == w); CK(is_sorted(s.begin(), s.end()) && s.size() == s1.size()); }
  }
  { string s = "10", t = "9"; CK(@{slt}); }
  for (const string &s : {string("abcdefgh"), string("x"), string("hello world")}) {
    int n = s.size();
    for (int pos = 0; pos <= n; pos++) {
      string w2; for (int i = pos; i < n; i++) w2 += s[i]; CK((@{sub2}) == w2);
      for (int len = 0; len <= n + 2; len++) { string w; for (int i = pos; i < n && i < pos + len; i++) w += s[i]; CK((@{sub1}) == w); }
    }
    for (int k = 0; k <= n; k++) { string f, l; for (int i = 0; i < k; i++) f += s[i]; for (int i = n - k; i < n; i++) l += s[i]; CK((@{subfirst}) == f); CK((@{sublast}) == l); }
  }
  { string s = "hello"; int w[26] = {}; w['h' - 'a'] = 1; w['e' - 'a'] = 1; w['l' - 'a'] = 2; w['o' - 'a'] = 1;
    @{sfreq}
    for (int i = 0; i < 26; i++) CK(cnt[i] == w[i]); }
  { string s = "aBc1z Z"; @{supper}
    CK(s == "ABC1Z Z"); }
  { In in("3\nhello world  x\nnext\n"); @{sgetline}
    CK(n == 3); CK(line == "hello world  x"); }
  { string line = "  ab  cd e "; @{ssplit}
    CK(words == vector<string>({"ab", "cd", "e"})); }
  { string line = ""; @{ssplit}
    CK(words.empty()); }
  { string s = "xaxxbx"; @{sremove}
    CK(s == "ab"); }
  { string s = "abc"; @{sremove}
    CK(s == "abc"); }
}

static void t_arrays() {
  SEC = "arrays";
  { In in("3\n5 -2 7000000000\n"); @{aread}
    CK(n == 3 && a == vector<ll>({5, -2, 7000000000LL})); }
  { In in("3\n5 -2 7000000000\n"); @{aread1}
    CK(n == 3 && a.size() == 4 && a[1] == 5 && a[2] == -2 && a[3] == 7000000000LL); }
  { vector<ll> a(5, 1000000000); @{asum}
    CK(sum == 5000000000LL && same == sum); }
  { vector<int> a(5, 1000000000); CK(accumulate(a.begin(), a.end(), 0LL) == 5000000000LL); }
  for (int it = 0; it < 4000; it++) {
    int n = rnd(1, 9); vector<ll> a(n); for (auto &v : a) v = rnd(-4, 4); const vector<ll> orig = a;
    ll bmx = orig[0], bmn = orig[0]; for (ll v : orig) { if (v > bmx) bmx = v; if (v < bmn) bmn = v; }
    int fmx = -1, fmn = -1; for (int i = n - 1; i >= 0; i--) { if (orig[i] == bmx) fmx = i; if (orig[i] == bmn) fmn = i; }
    { @{asum}
      i128 w = 0; for (ll v : a) w += v; CK(sum == (ll)w && same == sum); }
    { @{amaxpos}
      CK(pos == fmx); }
    { @{amaxstl}
      CK(mx == bmx && mn == bmn && imx == fmx && imn == fmn); }
    { ll x = rnd(-4, 4); int c = 0, fi = n; for (int i = n - 1; i >= 0; i--) if (a[i] == x) { c++; fi = i; }
      CK((@{acount}) == c); CK((@{ahas}) == (c > 0)); CK((@{afind}) == fi);
      { @{afirst}
        int w = -1; for (int i = n - 1; i >= 0; i--) if (a[i] > x) w = i; CK(pos == w); } }
    { @{aallany}
      int pos = 0; for (ll v : a) if (v > 0) pos++; CK(all == (pos == n) && any == (pos > 0)); }
    { vector<ll> b; @{abackward}
      CK((int)b.size() == n); for (int i = 0; i < n; i++) CK(b[i] == orig[n - 1 - i]); }
    { @{arev}; for (int i = 0; i < n; i++) CK(a[i] == orig[n - 1 - i]); a = orig; }
    for (int k = 0; k <= n; k++) {
      @{arotl}; for (int i = 0; i < n; i++) CK(a[i] == orig[(i + k) % n]); a = orig;
      @{arotr}; for (int i = 0; i < n; i++) CK(a[(i + k) % n] == orig[i]); a = orig;
    }
    { @{asorted}
      bool w = true; for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) if (a[i] > a[j]) w = false; CK(sorted == w && same == w); }
    { @{aalleq}
      bool eq = true, df = true; for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) { if (a[i] != a[j]) eq = false; else df = false; }
      vector<ll> u; for (ll v : a) { bool seen = false; for (ll q : u) if (q == v) seen = true; if (!seen) u.push_back(v); }
      CK(allEqual == eq && allDifferent == df && different == (int)u.size()); }
    { @{adedup}
      vector<ll> u; for (ll v = -4; v <= 4; v++) { bool in = false; for (ll q : orig) if (q == v) in = true; if (in) u.push_back(v); } CK(a == u); a = orig; }
    { vector<ll> b = orig; sort(b.begin(), b.end(), greater<ll>());
      { @{atwomax}
        CK(m1 == b[0] && m2 == (n > 1 ? b[1] : LLONG_MIN)); }
      { @{asecond}
        ll w = LLONG_MIN; for (ll v : b) if (v < b[0]) { w = v; break; } CK(mx == b[0] && second == w); } }
    { @{aprefmax}
      for (int i = 0; i < n; i++) { ll p = a[0], s = a[n - 1]; for (int j = 0; j <= i; j++) p = max(p, a[j]); for (int j = i; j < n; j++) s = max(s, a[j]); CK(pm[i] == p && sm[i] == s); } }
    { ll target = rnd(-8, 8); int cnt = 0;
      @{apairs}
      int w = 0; for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) if (i < j && a[i] + a[j] == target) w++; CK(cnt == w); }
    { @{aindexsort}
      vector<int> seen(n, 0); for (int i = 0; i < n; i++) { CK(v[i].first == a[v[i].second]); seen[v[i].second]++; if (i) CK(v[i - 1].first <= v[i].first); }
      for (int i = 0; i < n; i++) CK(seen[i] == 1); }
    { sort(a.begin(), a.end()); CK((@{asmall}) == bmn); CK((@{abig}) == bmx);
      int below = 0, above = 0; ll med = @{amedian}; for (ll v : a) { below += v < med; above += v > med; } CK(below <= n / 2 && above <= n / 2);
      CK((@{amedlow}) <= med); if (n % 2 == 1) CK((@{amedlow}) == med); a = orig; }
  }
  { vector<ll> a = {1, 2, 3, 4}; int n = 4; CK((@{amedian}) == 3 && (@{amedlow}) == 2); }
  { int n = 4; @{amake}; CK(a == vector<int>({5, 5, 5, 5})); @{afill0}; CK(a == vector<int>({0, 0, 0, 0})); @{aiota}; CK(a == vector<int>({0, 1, 2, 3})); }
  { vector<ll> a; int n = 0; @{asorted}
    CK(sorted && same); }
  { vector<ll> a, b; int n = 0; @{aallany}
    CK(all && !any); @{abackward}
    CK(b.empty()); }
  { In in("1 2 3\n4 5 6\n"); int n = 2, m = 3; @{a2d}
    CK(g == vector<vector<int>>({{1, 2, 3}, {4, 5, 6}})); }
  { In in("2 3\n.#.\n##.\n"); @{agridread}
    CK(n == 2 && m == 3 && g[0] == ".#." && g[1][0] == '#' && g[1][2] == '.'); }
}

static void t_grids() {
  SEC = "grids";
  for (int n = 1; n <= 5; n++) for (int m = 1; m <= 5; m++) {
    set<pair<int,int>> cells; { int id = 0; for (int r = 0; r < n; r++) for (int c = 0; c < m; c++) { cells.insert({r, c});
      CK((@{gid}) == id); CK((@{gidr}) == r); CK((@{gidc}) == c); { int r1 = r + 1, c1 = c + 1; int r = r1, c = c1; CK((@{gid1}) == id + 1); } id++; } }
    for (int r = -3; r <= n + 2; r++) for (int c = -3; c <= m + 2; c++) {
      CK((@{ginside}) == (cells.count({r, c}) > 0)); CK((@{ginside1}) == (cells.count({r - 1, c - 1}) > 0));
    }
    vector<vector<ll>> g(n, vector<ll>(m)); for (int r = 0; r < n; r++) for (int c = 0; c < m; c++) g[r][c] = 1LL << (r * m + c);
    for (int r = 0; r < n; r++) for (int c = 0; c < m; c++) {
      ll sum = 0, want = 0; int out4 = 0;
      for (auto [rr, cc] : cells) if ((rr == r && (cc == c - 1 || cc == c + 1)) || (cc == c && (rr == r - 1 || rr == r + 1))) want += g[rr][cc];
      for (auto [pr, pc] : vector<pair<int,int>>{{r - 1, c}, {r + 1, c}, {r, c - 1}, {r, c + 1}}) if (!cells.count({pr, pc})) out4++;
      @{g4}
      CK(sum == want);
      CK((@{gborder}) == (out4 > 0));
      CK((@{gcorner}) == ((r == 0 && c == 0) || (r == 0 && c == m - 1) || (r == n - 1 && c == 0) || (r == n - 1 && c == m - 1)));
    }
    { vector<vector<int>> g(n, vector<int>(m)); for (auto &row : g) for (auto &v : row) v = rnd(-9, 9);
      @{growcol}
      for (int r = 0; r < n; r++) { ll s = 0; for (int c = 0; c < m; c++) s += g[r][c]; CK(rowSum[r] == s); }
      for (int c = 0; c < m; c++) { ll s = 0; for (int r = 0; r < n; r++) s += g[r][c]; CK(colSum[c] == s); } }
  }
  { @{g8}
    set<pair<int,int>> a8, k8, w8, wk;
    for (int d = 0; d < 8; d++) { a8.insert({dr8[d], dc8[d]}); k8.insert({kr[d], kc[d]}); }
    for (int x = -2; x <= 2; x++) for (int y = -2; y <= 2; y++) { if (max(abs(x), abs(y)) == 1) w8.insert({x, y}); if (abs(x) + abs(y) == 3 && x && y) wk.insert({x, y}); }
    CK(a8 == w8 && a8.size() == 8); CK(k8 == wk && k8.size() == 8); }
  for (int d0 = 0; d0 < 4; d0++) {
    int r = 5, c = 5, d = d0;
    @{gdir}
    int wr[4] = {4, 5, 6, 5}, wc[4] = {5, 6, 5, 4};      // up, right, down, left of (5,5); row 0 is the top row
    CK(r == wr[d0] && c == wc[d0]);
    const char *name = "URDL"; char right[128], left[128], back[128]; right['U'] = 'R'; right['R'] = 'D'; right['D'] = 'L'; right['L'] = 'U';
    left['U'] = 'L'; left['L'] = 'D'; left['D'] = 'R'; left['R'] = 'U'; back['U'] = 'D'; back['D'] = 'U'; back['L'] = 'R'; back['R'] = 'L';
    d = d0; @{turn_r}; CK(name[d] == right[(int)name[d0]]);
    d = d0; @{turn_l}; CK(name[d] == left[(int)name[d0]]);
    d = d0; @{turn_b}; CK(name[d] == back[(int)name[d0]]);
  }
  for (int n = 1; n <= 6; n++) {
    set<pair<int,int>> md, ad; for (int i = 0; i < n; i++) { md.insert({i, i}); ad.insert({i, n - 1 - i}); }
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) { CK((@{gdiag}) == (md.count({r, c}) > 0)); CK((@{ganti}) == (ad.count({r, c}) > 0)); }
  }
  { const int N = 7; // distances by BFS on a 7x7 board, colours by BFS parity
    for (int r1 = 0; r1 < N; r1++) for (int c1 = 0; c1 < N; c1++) {
      vector<vector<int>> d4(N, vector<int>(N, -1)), d8 = d4;
      for (int mode = 0; mode < 2; mode++) { auto &dist = mode ? d8 : d4; queue<pair<int,int>> q; q.push({r1, c1}); dist[r1][c1] = 0;
        while (!q.empty()) { auto [r, c] = q.front(); q.pop();
          for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++) { if (!x && !y) continue; if (!mode && x && y) continue;
            int nr = r + x, nc = c + y; if (nr < 0 || nc < 0 || nr >= N || nc >= N || dist[nr][nc] >= 0) continue; dist[nr][nc] = dist[r][c] + 1; q.push({nr, nc}); } } }
      for (int r2 = 0; r2 < N; r2++) for (int c2 = 0; c2 < N; c2++) {
        CK((@{gman}) == d4[r2][c2]); CK((@{gcheb}) == d8[r2][c2]);
        CK((@{gsamecol}) == (d4[r2][c2] % 2 == 0));
        bool sd = false, sa = false, rook = false, bishop = false;
        for (int t = -N; t <= N; t++) { if (r1 + t == r2 && c1 + t == c2) sd = true; if (r1 + t == r2 && c1 - t == c2) sa = true;
          if (t && ((r1 + t == r2 && c1 == c2) || (r1 == r2 && c1 + t == c2))) rook = true; }
        bishop = (sd || sa) && !(r1 == r2 && c1 == c2);
        CK((@{gsamed}) == sd); CK((@{gsamea}) == sa);
        if (r1 != r2 || c1 != c2) {
          CK((@{grook}) == rook); CK((@{gbishop}) == bishop); CK((@{gking}) == (d8[r2][c2] == 1));
          bool kn = false; for (int x : {-2, -1, 1, 2}) for (int y : {-2, -1, 1, 2}) if (abs(x) != abs(y) && r1 + x == r2 && c1 + y == c2) kn = true;
          CK((@{gknight}) == kn);
        }
      }
      { int r = r1, c = c1; vector<vector<int>> col(N, vector<int>(N)); for (int i = 0; i < N; i++) for (int j = 0; j < N; j++) col[i][j] = (i == 0 && j == 0) ? 0 : (j > 0 ? 1 - col[i][j - 1] : 1 - col[i - 1][j]);
        CK((@{gcolor}) == col[r][c]); }
    } }
  { int n = 2; vector<vector<int>> a = {{1, 2}, {3, 4}}, b(2, vector<int>(2));
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) { @{grot}; } CK(b == vector<vector<int>>({{3, 1}, {4, 2}}));
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) { @{grotl}; } CK(b == vector<vector<int>>({{2, 4}, {1, 3}}));
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) { @{gtrans}; } CK(b == vector<vector<int>>({{1, 3}, {2, 4}})); }
  for (int n = 1; n <= 5; n++) { vector<vector<int>> a(n, vector<int>(n)), b = a, b2 = a, b3 = a; int v = 0; for (auto &row : a) for (auto &x : row) x = v++;
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) { @{grot}; }
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) CK(b[i][j] == a[n - 1 - j][i]);       // clockwise: first row becomes last column
    for (int j = 0; j < n; j++) CK(b[j][n - 1] == a[0][j]);
    b2 = b; { vector<vector<int>> a = b2, b = b3; for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) { @{grotl}; } b3 = b; }
    CK(b3 == a); }
}

namespace g_isqrt {
@{isqrt}
}
using g_isqrt::isqrt;
namespace g_ipow {
@{ipow}
}
static void t_powers() {
  SEC = "powers";
  { ll root = 0; for (ll n = 0; n <= 200000; n++) { if ((root + 1) * (root + 1) <= n) root++; CK(isqrt(n) == root);
      if (n <= 3000) { @{issquare}
        CK(square == (root * root == n)); CK(r == root); CK((@{sq1n}) == root); } } }
  { vector<ll> ns = {LLONG_MAX, LLONG_MAX - 1, 1000000000000000000LL, 999999999999999999LL, 4000000000000000000LL, 9000000000000000000LL};
    for (ll k : {3037000499LL, 3037000498LL, 1000000000LL, 999999999LL, 2147483647LL, 2147483648LL, 94906265LL, 94906266LL, 94906267LL, 67108865LL}) { ns.push_back(k * k); ns.push_back(k * k - 1); ns.push_back(k * k + 1); }
    for (int i = 0; i < 20000; i++) ns.push_back(rnd(0, LLONG_MAX));
    for (int i = 0; i < 20000; i++) { ll k = rnd(1, 3037000499LL); ns.push_back(k * k); ns.push_back(k * k - 1); }
    for (ll n : ns) { i128 r = isqrt(n); CK(r >= 0 && r * r <= n && (r + 1) * (r + 1) > n); } }
  for (ll l = 1; l <= 70; l++) for (ll r = l; r <= 70; r++) { ll c = 0; for (ll v = l; v <= r; v++) for (ll q = 1; q <= v; q++) if (q * q == v) c++; CK((@{sqlr}) == c); }
  //#sq_1n
  { ll x = 100000; CK((@{sqr}) == 10000000000LL); x = 1000000; CK((@{cube}) == 1000000000000000000LL); x = -3; CK((@{sqr}) == 9 && (@{cube}) == -27); }
  for (ll n : {0LL, 1LL, 2LL, 15LL, 16LL, 17LL, 1000000LL, 999999999999LL}) { ll cnt = 0; @{sqloop} cnt++; CK(cnt == isqrt(n)); }
  { ll p = 1; for (int k = 0; k <= 62; k++) {
      //#pow2_shift
      CK((@{pow2}) == p); CK((@{sh_good}) == p);
      { ll x = 5; if (k <= 60) CK((@{mulpow2}) == 5 * p); } { ll x = 1000000000000000000LL; CK((@{divpow2}) == x / p); }
      if (k < 62) p *= 2; } }
  { set<ll> pw; for (int k = 0; k <= 62; k++) pw.insert(1LL << k);
    vector<ll> xs = BIGS; for (ll x = -10; x <= 5000; x++) xs.push_back(x); for (ll p : pw) { xs.push_back(p); xs.push_back(p - 1); xs.push_back(p + 1); }
    for (ll x : xs) { CK((@{ispow2}) == (pw.count(x) > 0));
      if (x > 0) { int lg = 0; while (lg < 62 && (1LL << (lg + 1)) <= x) lg++;
        //#lg_floor
        CK((@{lg}) == lg); CK((@{nbits}) == lg + 1); CK((@{pow2floor}) == (1LL << lg)); }
      if (x <= 4000000000000000000LL) { @{pow2ceil}
        ll w = *pw.lower_bound(max(x, 1LL)); CK(p == w); } } }
  using g_ipow::ipow;
  CK(ipow(10, 18) == 1000000000000000000LL); CK(ipow(3, 39) == 4052555153018976267LL); CK(ipow(2, 62) == (1LL << 62)); CK(ipow(7, 0) == 1); CK(ipow(0, 0) == 1);
  CK(ipow(-2, 3) == -8); CK(ipow(0, 5) == 0);
  for (ll a = -6; a <= 6; a++) for (int b = 0; b <= 12; b++) CK(ipow(a, b) == llround(pow((double)a, b)));
  //#pw_10
  CK((1LL << 10) == 1024 && fabs(1024 - 1e3) / 1e3 < 0.03);
  //#pw_20
  CK(fabs((1LL << 20) - 1e6) / 1e6 < 0.05);
  //#pw_30
  CK(fabs((1LL << 30) - 1e9) / 1e9 < 0.08);
  { i128 f = 1; for (int i = 1; i <= 21; i++) { f *= i;
      //#pw_f12
      if (i == 12) CK(f <= INT_MAX && fabs((double)f - 4.8e8) / 4.8e8 < 0.01); if (i == 13) CK(f > INT_MAX);
      //#pw_f20
      if (i == 20) CK(f <= LLONG_MAX && fabs((double)f - 2.4e18) / 2.4e18 < 0.02); if (i == 21) CK(f > LLONG_MAX); } }
}

namespace g_isLeap {
@{isLeap}
}
using g_isLeap::isLeap;
static ll dayNumber(int y, int mon, int day) { struct tm t = {}; t.tm_year = y - 1900; t.tm_mon = mon - 1; t.tm_mday = day; return (ll)timegm(&t) / 86400; }
static void t_time() {
  SEC = "time";
  { int h = 0, m = 0, s = 0; for (ll t = 0; t <= 200000; t++) {
      CK((@{t_h}) == h && (@{t_m}) == m && (@{t_s}) == s); CK((@{t_back}) == t);
      s++; if (s == 60) { s = 0; m++; } if (m == 60) { m = 0; h++; } } }
  { int t = 0; for (int h = 0; h < 24; h++) for (int m = 0; m < 60; m++) {
      CK((@{c_min}) == t); CK((@{c_h}) == h && (@{c_m}) == m);
      int hh = h, mm = m; for (int k = 0; k <= 3000; k += 7) { int cur = hh * 60 + mm; if (k) for (int i = 0; i < 7; i++) { mm++; if (mm == 60) { mm = 0; hh++; } if (hh == 24) hh = 0; } cur = hh * 60 + mm; CK((@{c_later}) == cur); }
      t++; } }
  for (int t1 = 0; t1 < 1440; t1 += 13) for (int t2 = 0; t2 < 1440; t2 += 11) { int steps = 0, p = t1; while (p != t2) { p++; if (p == 1440) p = 0; steps++; } CK((@{c_diff}) == steps); }
  for (const char *tc : {"09:05", "23:59", "00:00", "7:5", "12:30"}) { int wh, wm; sscanf(tc, "%d:%d", &wh, &wm); char buf[16]; snprintf(buf, sizeof buf, "%02d:%02d\n", wh, wm);
    In in(string(tc) + "\n"); Cap cap;
    @{clockio}
    CK(h == wh && m == wm && colon == ':'); CK(cap.str() == buf); }
  for (int d = 0; d < 7; d++) { int f = d, b = d; for (int k = 0; k <= 60; k++) { CK((@{dow_fwd}) == f); CK((@{dow_back}) == b); f++; if (f == 7) f = 0; b--; if (b < 0) b = 6; } }
  { int w = 0, rest = 0; for (int days = 0; days <= 500; days++) { CK((@{weeks}) == w && (@{weekrest}) == rest); rest++; if (rest == 7) { rest = 0; w++; } } }
  { int shown = 12; for (int h = 0; h < 24; h++) { CK(@{h12} == shown); CK((@{ispm}) == (h == 12 || h > 12)); shown++; if (shown == 13) shown = 1; } }
  for (int y = 1600; y <= 2800; y++) {
    bool leap = dayNumber(y + 1, 1, 1) - dayNumber(y, 1, 1) == 366;
    CK(isLeap(y) == leap);
    @{monthdays}
    for (int mo = 1; mo <= 12; mo++) CK(days[mo] == (mo == 12 ? dayNumber(y + 1, 1, 1) : dayNumber(y, mo + 1, 1)) - dayNumber(y, mo, 1));
  }
  CK(!isLeap(1900) && isLeap(2000) && isLeap(2024) && !isLeap(2023) && !isLeap(2100));
  for (ll k = 1; k <= 100; k += 9) { ll big = 0, small = 0; for (ll x = 0; x <= 1000; x++) { CK((@{u_big}) == big && (@{u_small}) == small); CK((@{u_back}) == x); small++; if (small == k) { small = 0; big++; } } }
  for (ll x = 0; x <= 400; x++) for (ll p = 0; p <= 100; p++) CK((@{percent}) == (ll)floorl((long double)x * p / 100 + 1e-9));
}

namespace g_dist2 {
@{dist2fn}
}
namespace g_cross {
@{cross}
}
using g_dist2::dist2; using g_cross::cross;
static void t_geometry() {
  SEC = "geometry";
  const double PIv = 3.14159265358979323846;
  for (ll x1 = -4; x1 <= 4; x1++) for (ll y1 = -4; y1 <= 4; y1++) for (ll x2 = -4; x2 <= 4; x2++) for (ll y2 = -4; y2 <= 4; y2++) {
    double h = hypot((double)(x1 - x2), (double)(y1 - y2));
    CK(dist2(x1, y1, x2, y2) == llround(h * h)); CK(fabs((@{realdist}) - h) < 1e-9);
    ll pts = 0; for (ll x = -4; x <= 4; x++) for (ll y = -4; y <= 4; y++) {       // lattice points on the segment: distances add up exactly
      double d = hypot((double)(x - x1), (double)(y - y1)) + hypot((double)(x - x2), (double)(y - y2)); if (fabs(d - h) < 1e-9) pts++; }
    CK((@{lattice}) == pts);
  }
  { ll x1 = 0, y1 = 0, x2 = 3, y2 = 4; CK((@{realdist}) == 5.0); CK(dist2(-1000000000, -1000000000, 1000000000, 1000000000) == 8000000000000000000LL); }
  for (ll ax = -3; ax <= 3; ax++) for (ll ay = -3; ay <= 3; ay++) for (ll bx = -3; bx <= 3; bx++) for (ll by = -3; by <= 3; by++)
    for (ll cx = -3; cx <= 3; cx++) for (ll cy = -3; cy <= 3; cy++) {
      ll cr = cross(ax, ay, bx, by, cx, cy);
      double A = hypot((double)(bx - cx), (double)(by - cy)), B = hypot((double)(ax - cx), (double)(ay - cy)), C = hypot((double)(ax - bx), (double)(ay - by)), s = (A + B + C) / 2;
      double heron = sqrt(max(0.0, s * (s - A) * (s - B) * (s - C)));          // area from the three side lengths
      CK(fabs((double)(@{tri2}) - 2 * heron) < 1e-6); CK(fabs((@{triarea}) - heron) < 1e-6); CK((@{collinear}) == (heron < 1e-4));
      if ((ax != bx || ay != by) && (ax != cx || ay != cy)) {
        double ang = atan2((double)(cy - ay), (double)(cx - ax)) - atan2((double)(by - ay), (double)(bx - ax));
        while (ang > PIv) ang -= 2 * PIv; while (ang <= -PIv) ang += 2 * PIv;
        int side = (fabs(ang) < 1e-9 || fabs(fabs(ang) - PIv) < 1e-9) ? 0 : (ang > 0 ? 1 : -1);    // +1: C is to the left of A->B
        CK((cr > 0) - (cr < 0) == side);
      }
    }
  CK(cross(0, 0, 1, 0, 0, 1) > 0); CK(cross(0, 0, 1, 0, 0, -1) < 0); CK(cross(0, 0, 1, 1, 2, 2) == 0);
  { ll M = 1000000000; CK((i128)cross(-M, -M, M, M, -M, M) == (i128)(2 * M) * (2 * M) - (i128)(2 * M) * 0); CK((i128)cross(-M, -M, M, -M, M, M) == (i128)4 * M * M);
    CK((i128)cross(M, M, -M, -M, M, -M) == (i128)(-2 * M) * (-2 * M) - (i128)(-2 * M) * 0); CK((i128)cross(-M, M, M, -M, M, M) == (i128)(2 * M) * 0 - (i128)(-2 * M) * (2 * M)); }
  for (ll a = 1; a <= 14; a++) for (ll b = a; b <= 14; b++) for (ll c = b; c <= 30; c++) {
    bool tri = a + b > c && a + c > b && b + c > a; CK((@{tri_ok}) == tri);
    if (tri) { double s = (a + b + c) / 2.0, area = sqrt(s * (s - a) * (s - b) * (s - c)); CK((@{tri_right}) == (fabs(area - a * b / 2.0) < 1e-7)); }
  }
  { ll a = 3, b = 4, c = 5; CK(@{tri_right}); a = 5; b = 12; c = 13; CK(@{tri_right}); a = 2; b = 3; c = 4; CK(!(@{tri_right})); }
  for (ll x1 = 0; x1 <= 4; x1++) for (ll y1 = 0; y1 <= 4; y1++) for (ll x2 = x1; x2 <= 4; x2++) for (ll y2 = y1; y2 <= 4; y2++) {
    ll cells = 0, edges = 0;
    for (ll x = -1; x <= 5; x++) for (ll y = -1; y <= 5; y++) {
      if (x1 <= x && x + 1 <= x2 && y1 <= y && y + 1 <= y2) cells++;
      bool in = false; for (ll px = x1; px <= x2; px++) for (ll py = y1; py <= y2; py++) if (px == x && py == y) in = true;
      CK((@{rect_in}) == in);
    }
    for (ll x = x1; x < x2; x++) edges += 2; for (ll y = y1; y < y2; y++) edges += 2;
    CK((@{rect_area}) == cells); CK((@{rect_per}) == edges);
  }
  for (int it = 0; it < 30000; it++) {
    ll ax1 = rnd(0, 6), ax2 = rnd(ax1, 6), ay1 = rnd(0, 6), ay2 = rnd(ay1, 6), bx1 = rnd(0, 6), bx2 = rnd(bx1, 6), by1 = rnd(0, 6), by2 = rnd(by1, 6);
    @{rect_inter}
    ll cells = 0; for (ll x = 0; x < 6; x++) for (ll y = 0; y < 6; y++) if (ax1 <= x && x + 1 <= ax2 && ay1 <= y && y + 1 <= ay2 && bx1 <= x && x + 1 <= bx2 && by1 <= y && y + 1 <= by2) cells++;
    CK(area == cells);
  }
  for (ll cx = -2; cx <= 2; cx++) for (ll cy = -2; cy <= 2; cy++) for (ll r = 0; r <= 6; r++) for (ll x = -8; x <= 8; x++) for (ll y = -8; y <= 8; y++)
    CK((@{in_circle}) == (hypotl((long double)(x - cx), (long double)(y - cy)) <= r + 1e-9L));
  for (ll dx1 = -4; dx1 <= 4; dx1++) for (ll dy1 = -4; dy1 <= 4; dy1++) for (ll dx2 = -4; dx2 <= 4; dx2++) for (ll dy2 = -4; dy2 <= 4; dy2++)
    if ((dx1 || dy1) && (dx2 || dy2)) { double d = atan2((double)dy1, (double)dx1) - atan2((double)dy2, (double)dx2); d = fabs(remainder(d, PIv)); CK((@{slope_eq}) == (d < 1e-9)); }
  { @{pi}; CK(fabs(PI - PIv) < 1e-15); }
}

static char pbuf[256];
static void t_io() {
  SEC = "io";
  { bool ok = true; Cap c; @{yesno}
    CK(c.str() == "YES\n"); }
  { bool ok = false; Cap c; @{yesno}
    CK(c.str() == "NO\n"); }
  { double x = 1e9 / 3; Cap c; @{fixedp}
    CK(c.str() == "333333333.333333313\n" || c.str().substr(0, 16) == "333333333.333333"); CK(c.str().find('e') == string::npos); CK(c.str().size() == 20); }
  { double x = 2; Cap c; @{fixedp}
    CK(c.str() == "2.000000000\n"); }
  { double x = 1e9; Cap c; cout << x; CK(c.str() == "1e+09"); }       // the trap in the tip
  { vector<ll> a = {1, -2, 3000000000LL}; Cap c; @{printvec}
    CK(c.str() == "1 -2 3000000000 \n"); }
  { ll x = 5; Cap c; @{nl_fast}; @{nl_endl}; CK(c.str() == "5\n5\n"); }
  { In in("1 2\n3\n\n4000000000\n"); @{readall}
    CK(sum == 4000000006LL); }
  { ll a = 3, b = -4; Cap c; @{pr_two}; CK(c.str() == "3 -4\n"); }
  { int i = 2; Cap c; @{pr_char}; cout << 'a' + i; CK(c.str() == "c99"); }
#define printf(...) snprintf(pbuf, sizeof pbuf, __VA_ARGS__)
  { ll x = -9000000000000000000LL; @{pf_ll}; CK(string(pbuf) == "-9000000000000000000\n"); }
  { double d = 3.14159265; @{pf_f}; CK(string(pbuf) == "3.141593\n"); }
  { int h = 9, m = 5; @{pf_02}; CK(string(pbuf) == "09:05\n"); }
#undef printf
  { int mid = 7, answer = 42; In in("yes\n"); Cap c;
    @{interactive}
    CK(reply == "yes"); CK(c.str() == "? 7\n! 42\n"); }
}

static void t_safety() {
  SEC = "safety";
  //#of_1
  CK((i128)100000 * 100000 == (i128)10000000000LL && (i128)100000 * 100000 > INT_MAX && (i128)100000 * 100000 <= LLONG_MAX);
  //#of_2
  CK((i128)200000 * 1000000000 == (i128)200000000000000LL && (i128)200000 * 1000000000 > INT_MAX);
  //#of_3
  CK((i128)1000000000 * 1000000000 == (i128)1000000000000000000LL && (i128)1000000000 * 1000000000 <= LLONG_MAX);
  //#of_4
  CK((i128)1000000000 * 1000000000 * 1000000000 > LLONG_MAX);
  { int a = 3, b = 4; @{of_bad}; CK(p == 12); }
  { int a = 100000, b = 100000; @{of_good}; CK(p == 10000000000LL); CK((ll)((unsigned)a * (unsigned)b) != p); }   // the int product really is different
  { int i = 100000; ll n = 20000000000LL; CK(@{of_loop}); n = 9999999999LL; CK(!(@{of_loop})); n = 10000000000LL; CK(@{of_loop}); }
  for (ll a = 0; a <= 40; a++) for (ll b = 1; b <= 40; b++) for (ll c = 0; c <= 150; c++) { CK((@{cmp_gt}) == (a * b > c)); CK((@{cmp_le}) == (a * b <= c)); CK((@{cmp_ge}) == (a * b >= c)); }
  for (ll a : BIGS) for (ll b : BIGS) for (ll c : BIGS) if (a >= 0 && b > 0 && c >= 0) {
    CK((@{cmp_gt}) == ((i128)a * b > c)); CK((@{cmp_le}) == ((i128)a * b <= c)); CK((@{cmp_ge}) == ((i128)a * b >= c)); }
  for (int it = 0; it < 20000; it++) { ll a = rnd(0, 4000000000LL), b = rnd(1, 4000000000LL), c = rnd(0, 1) ? (ll)min((i128)LLONG_MAX, (i128)a * b + rnd(-2, 2)) : rnd(0, LLONG_MAX); if (c < 0) c = 0;
    CK((@{cmp_gt}) == ((i128)a * b > c)); CK((@{cmp_le}) == ((i128)a * b <= c)); CK((@{cmp_ge}) == ((i128)a * b >= c)); }
  for (ll a : BIGS) for (ll b : BIGS) if (b >= 0) CK((@{add_of}) == ((i128)a + b > LLONG_MAX));
  CK((@{c_intmax}) == 2147483647); CK((@{c_intmin}) == -2147483647 - 1); CK((@{c_llmax}) == 9223372036854775807LL); CK((@{c_llmin}) == -9223372036854775807LL - 1);
  { @{inf_int}; CK(INF == 1000000000 && (ll)INF + INF <= INT_MAX); }
  { @{inf_ll}; CK(INF == 1000000000000000000LL && (i128)INF + INF <= LLONG_MAX); }
  { vector<int> a; CK((@{sz_bad}) > 1000000000u); CK((@{sz_good}) == -1); CK(!(-1 < (int)a.size()) == false); int runs = 0; @{sz_loop} runs++; CK(runs == 0); }
  { vector<int> a = {1, 2, 3}; CK((@{sz_bad}) == 2); CK((@{sz_good}) == 2); int runs = 0; @{sz_loop} runs++; CK(runs == 2); int n = 3; CK((@{last_el}) == 3); }
  for (ll lo : BIGS) for (ll hi : BIGS) if (0 <= lo && lo <= hi) { ll mid = @{mid_safe}; CK((i128)mid == ((i128)lo + hi) / 2); }
  for (ll lo = -20; lo <= 20; lo++) for (ll hi = lo; hi <= 20; hi++) { ll mid = @{mid_safe}; CK(lo <= mid && mid <= hi && (hi - lo < 1 || mid < hi)); if (lo >= 0) CK((@{mid_bad}) == mid); }
  //#dbl_53
  CK((1LL << 53) == 9007199254740992LL && fabs((double)(1LL << 53) - 9e15) / 9e15 < 0.01 && (double)((1LL << 53) + 1) == (double)(1LL << 53) && (double)((1LL << 53) - 1) != (double)(1LL << 53));
  { ll x = 1000000000000000000LL; CK((@{dbl_lost}) == true); x = 1000; CK((@{dbl_lost}) == false); }
  { @{arr_room}; CK(MAXN == 200005); }
}
