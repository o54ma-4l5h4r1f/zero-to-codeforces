// Harness part 3: the older algorithm cards.
namespace g_isPrime {
@{isPrime}
}
namespace g_factorize {
@{factorize}
}
namespace g_sieve {
@{sieve}
}
static void t_numtheory() {
  SEC = "numtheory";
  for (ll a = 0; a <= 48; a++) for (ll b = 0; b <= 48; b++) {
    ll g = bGcd(a, b);
    //#gcd_rule
    if (b) CK(g == bGcd(b, a % b));
    //#gcd_zero
    CK(bGcd(a, 0) == a);
    CK((@{gcd_std}) == g); CK((@{gcd_old}) == g); CK((@{coprime}) == (g == 1));
    if (a && b) { ll l = bLcm(a, b);
      //#lcm_rule
      CK(a % g == 0 && a / g * b == l); CK((@{lcm_std}) == l); }
  }
  { ll a = 1000000000000000000LL, b = 999999999999999999LL; CK((@{gcd_std}) == 1); a = 6000000000LL; b = 4000000000LL; CK((@{gcd_std}) == 2000000000LL && (@{lcm_std}) == 12000000000LL); }
  for (int it = 0; it < 500; it++) { vector<ll> a(rnd(0, 6)); for (auto &v : a) v = rnd(0, 40) * rnd(1, 4);
    @{gcdarr}
    ll w = 0; for (ll v : a) w = bGcd(w, v); CK(g == w); }
  for (ll n = -5; n <= 3000; n++) {
    CK(g_isPrime::isPrime(n) == bPrime(n));
    if (n >= 1) {
      vector<ll> d; @{divisors}
      sort(d.begin(), d.end()); vector<ll> w; for (ll v = 1; v <= n; v++) if (bMult(n, v) && n % v == 0) w.push_back(v); CK(d == w);
      vector<ll> f = g_factorize::factorize(n); ll prod = 1; for (size_t i = 0; i < f.size(); i++) { prod *= f[i]; CK(bPrime(f[i])); if (i) CK(f[i - 1] <= f[i]); } CK(prod == n);
    }
  }
  CK(g_isPrime::isPrime(1000000007) && g_isPrime::isPrime(998244353) && g_isPrime::isPrime(999999999989LL) && !g_isPrime::isPrime(1000006000009LL) && !g_isPrime::isPrime(1000000007LL * 998244353));
  CK(g_factorize::factorize(1000000007LL * 998244353) == vector<ll>({998244353, 1000000007})); CK(g_factorize::factorize(1LL << 40).size() == 40); CK(g_factorize::factorize(999999999989LL) == vector<ll>({999999999989LL}));
  { ll n = 1000006000009LL; vector<ll> d; @{divisors}
    sort(d.begin(), d.end()); CK(d == vector<ll>({1, 1000003, n})); }
  g_sieve::sieve(); { int cnt = 0; for (int i = 0; i <= g_sieve::N; i++) { if (g_sieve::prime[i]) cnt++; if (i <= 3000) CK(g_sieve::prime[i] == bPrime(i)); else if (i % 97 == 0 || i > g_sieve::N - 300) CK(g_sieve::prime[i] == g_isPrime::isPrime(i)); } CK(cnt == 78498); }
}

namespace g_power {
@{power}
}
namespace g_ncr {
@{ncr}
}
static void t_mod() {
  SEC = "mod";
  using g_power::power;
  for (int m = 1; m <= 25; m++) for (int a = 0; a < m; a++) for (int b = 0; b < m; b++) {
    int add = a; for (int i = 0; i < b; i++) { add++; if (add == m) add = 0; }
    int sub = a; for (int i = 0; i < b; i++) { sub--; if (sub < 0) sub = m - 1; }
    int mul = 0; for (int i = 0; i < b; i++) for (int j = 0; j < a; j++) { mul++; if (mul == m) mul = 0; }
    CK((@{mod_add}) == add); CK((@{mod_sub}) == sub); CK((@{mod_mul}) == mul);
    if (bPrime(m) && b) { int q = -1; for (int x = 0; x < m; x++) if (x * b % m == a) q = x;
      //#mod_div
      CK(q == a * power(b, m - 2, m) % m); }
  }
  { int m = 1000000007; for (int it = 0; it < 2000; it++) { int a = it < 5 ? m - 1 : rnd(0, m - 1), b = it < 5 ? m - 1 : rnd(0, m - 1);
      CK((@{mod_add}) == (ll)(((i128)a + b) % m)); CK((@{mod_sub}) == (ll)((((i128)a - b) % m + m) % m)); CK((@{mod_mul}) == (ll)((i128)a * b % m)); } }
  for (ll m : {1LL, 2LL, 7LL, 10LL, 1000LL, 998244353LL, 1000000007LL, 3000000000LL}) for (ll a : {0LL, 1LL, 2LL, 3LL, 10LL, 999999999LL, 1000000006LL, 123456789012345LL, 999999999999999999LL})
    { i128 w = 1 % m; for (ll b = 0; b <= 70; b++) { CK(power(a, b, m) == (ll)w); w = w * (a % m) % m; } }
  CK(power(2, 10, 1000000007) == 1024); CK(power(5, 0, 1) == 0); CK(power(3, 1000000006, 1000000007) == 1); CK(power(2, 1000000000000000000LL, 1000000007) == 719476260);
  { vector<vector<ll>> P(22, vector<ll>(22, 0)); vector<i128> f(22, 1); for (int i = 1; i < 22; i++) f[i] = f[i - 1] * i;
    //#fact_def
    CK(f[5] == 120 && f[10] == 3628800);
    for (int n = 0; n <= 20; n++) { ll rowsum = 0; for (int r = 0; r <= n; r++) {
        //#ncr_pascal
        P[n][r] = (r == 0 || r == n) ? 1 : P[n - 1][r - 1] + P[n - 1][r];
        //#ncr_def
        CK((i128)P[n][r] == f[n] / (f[r] * f[n - r]));
        ll brute = 0; if (n <= 12) { for (int mask = 0; mask < (1 << n); mask++) if (__builtin_popcount(mask) == r) brute++; CK(brute == P[n][r]); }
        rowsum += P[n][r]; }
      CK(rowsum == (1LL << n)); if (n >= 2) CK(P[n][2] == (ll)n * (n - 1) / 2); } }
  { using namespace g_ncr; init(); CK(MOD == 1000000007);
    const int T = 400; vector<vector<ll>> P(T + 1, vector<ll>(T + 1, 0));
    for (int n = 0; n <= T; n++) for (int r = 0; r <= n; r++) { P[n][r] = (r == 0 || r == n) ? 1 : (P[n - 1][r - 1] + P[n - 1][r]) % MOD; CK(C(n, r) == P[n][r]); }
    CK(C(5, -1) == 0 && C(5, 6) == 0 && C(0, 0) == 1);
    for (int i = 0; i < MAXN; i += 1009) CK(fact[i] * inv[i] % MOD == 1);
    for (int it = 0; it < 3000; it++) { int n = rnd(1, MAXN - 1), r = rnd(0, n); CK(C(n, r) == (C(n - 1, r - 1) + C(n - 1, r)) % MOD); CK(C(n, r) == C(n, n - r)); }
    CK(pw(2, 10) == 1024); }
}

static void t_bits() {
  SEC = "bits";
  for (int x = 0; x <= 600; x++) {
    vector<int> bit(12, 0); { int v = x; for (int i = 0; i < 12; i++) { bit[i] = v % 2; v /= 2; } }
    auto val = [&](vector<int> b) { int v = 0, p = 1; for (int i = 0; i < 12; i++) { v += b[i] * p; p *= 2; } return v; };
    for (int k = 0; k < 11; k++) {
      CK((@{bit_get}) == bit[k]);
      { auto b = bit; b[k] = 1; CK((@{bit_set}) == val(b)); } { auto b = bit; b[k] = 0; CK((@{bit_clear}) == val(b)); } { auto b = bit; b[k] = 1 - b[k]; CK((@{bit_flip}) == val(b)); }
    }
  }
  { vector<ll> xs = BIGS; for (ll x = 1; x <= 3000; x++) xs.push_back(x);
    for (ll x : xs) if (x > 0) { int ones = 0, low = -1; { ll v = x; for (int i = 0; i < 63; i++) { if (v % 2) { ones++; if (low < 0) low = i; } v /= 2; } }
      CK((@{popcnt}) == ones); CK((@{ctz}) == low); CK((@{lowbit}) == (1LL << low)); } }
  for (ll a : BIGS) for (ll b : BIGS) { CK((@{xor_self}) == 0); CK((@{xor_zero}) == a); CK((@{xor_undo}) == a); }
  for (int n = 0; n <= 20; n++) { int s = 0, p = 1; for (int i = 0; i < n; i++) { s += p; p *= 2; } CK((@{mask_all}) == s); }
  for (int a = 0; a < 64; a++) for (int b = 0; b < 64; b++) {
    int both = 0, any = 0; bool sub = true;
    for (int i = 0, p = 1; i < 6; i++, p *= 2) { bool ia = a / p % 2, ib = b / p % 2; if (ia && ib) both += p; if (ia || ib) any += p; if (ia && !ib) sub = false; }
    CK((@{mask_and}) == both); CK((@{mask_or}) == any); CK((@{mask_sub}) == sub);
  }
  for (int n = 0; n <= 6; n++) { vector<ll> a(n), sum(1 << n, 0); for (auto &v : a) v = rnd(-50, 50);
    @{subsets_loop}
    for (int mask = 0; mask < (1 << n); mask++) { ll w = 0; int v = mask; for (int i = 0; i < n; i++) { if (v % 2) w += a[i]; v /= 2; } CK(sum[mask] == w); } CK((int)sum.size() == (1 << n)); }
}

static void t_stl() {
  SEC = "stl";
  for (int it = 0; it < 500; it++) {
    vector<int> a(rnd(1, 9)); for (auto &v : a) v = rnd(-5, 5); const vector<int> orig = a;
    @{vec_tools}
    vector<int> u; for (int v = -5; v <= 5; v++) { bool in = false; for (int q : orig) if (q == v) in = true; if (in) u.push_back(v); }
    ll w = 0; for (int v : orig) w += v;
    vector<int> srt = orig; for (size_t i = 0; i < srt.size(); i++) for (size_t j = i + 1; j < srt.size(); j++) if (srt[j] < srt[i]) swap(srt[i], srt[j]);
    CK(a == srt && mx == u.back() && mn == u[0] && s == w);
  }
  { vector<int> a = {3, 1, 2}; sort(a.rbegin(), a.rend()); CK(a == vector<int>({3, 2, 1})); }
  for (int it = 0; it < 500; it++) {
    vector<pair<int,int>> v(rnd(0, 9)); for (auto &p : v) p = {(int)rnd(0, 3), (int)rnd(0, 3)}; auto orig = v;
    @{comparator}
    for (size_t i = 1; i < v.size(); i++) CK(v[i - 1].second < v[i].second || (v[i - 1].second == v[i].second && v[i - 1].first >= v[i].first));
    sort(orig.begin(), orig.end()); auto w = v; sort(w.begin(), w.end()); CK(orig == w);
  }
  { int x = 7; bool found = false; @{set_lines}
    CK(found && s.empty()); }
  { set<int> s = {1, 5, 9}; int x = 4; auto it = s.lower_bound(x); CK(*it == 5); x = 5; CK(*s.lower_bound(x) == 5); x = 10; CK(s.lower_bound(x) == s.end()); }
  { string key = "ab"; bool found = false; int total = 0; @{map_lines}
    CK(found && total == 1 && m.size() == 1 && m[key] == 1); }
  { int x = 7; @{multiset_lines}
    CK(smallest == 7 && biggest == 7 && ms.empty()); }
  { multiset<int> ms = {4, 7, 7, 7, 9}; int x = 7; ms.erase(ms.find(x)); CK(ms.size() == 4 && ms.count(7) == 2); ms.erase(x); CK(ms.size() == 2); }
  { int x = 7; @{pq_lines}
    CK(top == 7 && pq.empty() && mn.top() == 7); }
  { priority_queue<int> pq; priority_queue<int, vector<int>, greater<int>> mn; for (int v : {3, 9, 1}) { pq.push(v); mn.push(v); } CK(pq.top() == 9 && mn.top() == 1); }
  { string s = "hello"; vector<ll> a = {5, 5, -1, 1000000000000LL, 5}; @{freq}
    CK(cnt['l' - 'a'] == 2 && cnt['h' - 'a'] == 1 && cnt[0] == 0 && f[5] == 3 && f[-1] == 1 && f[1000000000000LL] == 1 && f.size() == 3); }
  for (int it = 0; it < 500; it++) { vector<ll> a(rnd(0, 10)); for (auto &v : a) v = rnd(0, 3);
    @{eqpairs}
    ll w = 0; for (size_t i = 0; i < a.size(); i++) for (size_t j = i + 1; j < a.size(); j++) if (a[i] == a[j]) w++; CK(pairs == w); }
}

static void t_stl2() {
  SEC = "stl2";
  for (int it = 0; it < 2000; it++) { vector<ll> a(rnd(0, 10)); for (auto &v : a) v = rnd(-3, 3);
    @{mostfreq}
    ll wb = 0; int wc = 0; for (ll v = -3; v <= 3; v++) { int c = 0; for (ll q : a) if (q == v) c++; if (c > wc) { wc = c; wb = v; } }
    CK(best == wb && bestCount == wc); }
}

static void t_ranges() {
  SEC = "ranges";
  for (int it = 0; it < 400; it++) {
    int n = rnd(1, 9); vector<ll> a(n); for (auto &v : a) v = rnd(-9, 9);
    { vector<ll> b(n + 1, 0); for (int i = 1; i <= n; i++) b[i] = a[i - 1];   // positions from 1, as in the lesson
    //#pre_build
    vector<ll> pre(n + 1); pre[0] = 0; for (int i = 1; i <= n; i++) pre[i] = pre[i-1] + b[i];
    for (int l = 1; l <= n; l++) for (int r = l; r <= n; r++) { ll w = 0; for (int i = l; i <= r; i++) w += b[i]; CK((@{pre_query}) == w); } }
    vector<ll> d(n + 2, 0), want(n + 1, 0);
    for (int q = 0; q < 5; q++) { int l = rnd(1, n), r = rnd(l, n); ll v = rnd(-5, 5); @{diff_upd}; for (int i = l; i <= r; i++) want[i] += v; }
    //#diff_final
    { ll run = 0; for (int i = 1; i <= n; i++) { run += d[i]; CK(run == want[i]); } CK(d[0] == 0); }
    { int R = rnd(1, 5), Cn = rnd(1, 5); vector<vector<ll>> a(R + 1, vector<ll>(Cn + 1, 0)), P = a;
    for (int i = 1; i <= R; i++) for (int j = 1; j <= Cn; j++) { a[i][j] = rnd(-9, 9); @{pre2_build}; }
    for (int r1 = 1; r1 <= R; r1++) for (int r2 = r1; r2 <= R; r2++) for (int c1 = 1; c1 <= Cn; c1++) for (int c2 = c1; c2 <= Cn; c2++) {
      ll sum = 0, w = 0; for (int i = r1; i <= r2; i++) for (int j = c1; j <= c2; j++) w += a[i][j];
      @{pre2_query}; CK(sum == w); } }
  }
  for (int it = 0; it < 3000; it++) {
    int n = rnd(0, 10); vector<ll> a(n); for (auto &v : a) v = rnd(1, 9); ll S = rnd(0, 25);
    @{window}
    int w = 0; for (int l = 0; l < n; l++) { ll t = 0; for (int r = l; r < n; r++) { t += a[r]; if (t <= S) w = max(w, r - l + 1); } } CK(best == w);
  }
  for (int it = 0; it < 3000; it++) {
    int n = rnd(0, 9); vector<ll> a(n); for (auto &v : a) v = rnd(-9, 9); sort(a.begin(), a.end()); ll target = rnd(-20, 20);
    @{twosum}
    bool w = false; for (int p = 0; p < n; p++) for (int q = p + 1; q < n; q++) if (a[p] + a[q] == target) w = true; CK(found == w); if (found) CK(i < j && a[i] + a[j] == target);
  }
  for (ll T = 0; T <= 40; T++) for (ll N : {40LL, 41LL, 1000000000000000000LL}) {
    auto ok = [&](ll v) { return v >= T; }; ll lo = -1, hi = N; int calls = 0;
    @{bsearch}
    CK(hi == T && lo == T - 1); (void)calls;
  }
  { auto ok = [&](ll v) { return v * v >= 1000000000000LL; }; ll lo = 0, hi = 2000000000LL;
    @{bsearch}
    CK(hi == 1000000); }
  for (int it = 0; it < 3000; it++) {
    int n = rnd(0, 9); vector<ll> a(n); for (auto &v : a) v = rnd(0, 6); sort(a.begin(), a.end()); ll x = rnd(-1, 7);
    @{bounds}
    int eq = 0, less = 0, more = 0, fi = n, fj = n; for (int p = n - 1; p >= 0; p--) { if (a[p] == x) eq++; if (a[p] < x) less++; if (a[p] > x) more++; if (a[p] >= x) fi = p; if (a[p] > x) fj = p; }
    CK(i == fi && j == fj && has == (eq > 0)); CK((@{bs_eq}) == eq); CK((@{bs_less}) == less); CK((@{bs_more}) == more);
  }
}

namespace g_rec {
vector<vector<int>> seen;
@{rec_subsets|/* use cur */=>seen.push_back(cur);}
}
static void t_recdp() {
  SEC = "recdp";
  for (int n = 0; n <= 10; n++) {
    g_rec::n = n; g_rec::a.clear(); for (int i = 0; i < n; i++) g_rec::a.push_back(1 << i); g_rec::cur.clear(); g_rec::seen.clear();
    g_rec::go(0);
    set<int> sums; for (auto &v : g_rec::seen) { int s = 0; for (int x : v) s += x; sums.insert(s); CK(is_sorted(v.begin(), v.end())); }
    CK((int)g_rec::seen.size() == (1 << n) && (int)sums.size() == (1 << n) && g_rec::cur.empty());
  }
  for (int it = 0; it < 60; it++) {
    int n = rnd(1, 6); vector<int> a(n); for (auto &v : a) v = rnd(0, 3); vector<vector<int>> seen;
    @{perms|/* use a */=>seen.push_back(a);}
    set<vector<int>> w; vector<int> idx(n); iota(idx.begin(), idx.end(), 0);
    function<void(vector<int>, vector<bool>)> rec = [&](vector<int> cur, vector<bool> used) { if ((int)cur.size() == n) { w.insert(cur); return; }
      for (int i = 0; i < n; i++) if (!used[i]) { auto c2 = cur; c2.push_back(a[i]); auto u2 = used; u2[i] = true; rec(c2, u2); } };
    rec({}, vector<bool>(n, false));
    CK(set<vector<int>>(seen.begin(), seen.end()) == w && seen.size() == w.size());
  }
  { //#dp_stairs
    function<ll(int)> ways = [&](int left) -> ll { if (left == 0) return 1; if (left < 0) return 0; return ways(left - 1) + ways(left - 2); };
    vector<ll> dp(26); dp[0] = 1; dp[1] = 1; for (int i = 2; i <= 25; i++) dp[i] = dp[i-1] + dp[i-2];
    for (int i = 0; i <= 25; i++) CK(dp[i] == ways(i)); }
  for (int it = 0; it < 300; it++) { //#dp_coins
    int k = rnd(1, 3); vector<int> coins(k); for (auto &c : coins) c = rnd(1, 7); int X = 30; const int INF = 1e9;
    vector<int> dp(X + 1, INF); dp[0] = 0; for (int x = 1; x <= X; x++) for (int c : coins) if (x - c >= 0 && dp[x - c] != INF) dp[x] = min(dp[x], dp[x - c] + 1);
    vector<int> bf(X + 1, -1); queue<int> q; q.push(0); bf[0] = 0; while (!q.empty()) { int v = q.front(); q.pop(); for (int c : coins) if (v + c <= X && bf[v + c] < 0) { bf[v + c] = bf[v] + 1; q.push(v + c); } }
    for (int x = 0; x <= X; x++) CK((dp[x] == INF ? -1 : dp[x]) == bf[x]); }
  { //#dp_grid
    function<ll(int, int)> paths = [&](int i, int j) -> ll { if (i == 0 && j == 0) return 1; ll s = 0; if (i > 0) s += paths(i - 1, j); if (j > 0) s += paths(i, j - 1); return s; };
    vector<vector<ll>> dp(8, vector<ll>(8, 0)); for (int i = 0; i < 8; i++) for (int j = 0; j < 8; j++) { if (i == 0 || j == 0) dp[i][j] = 1; else dp[i][j] = dp[i-1][j] + dp[i][j-1]; }
    for (int i = 0; i < 8; i++) for (int j = 0; j < 8; j++) CK(dp[i][j] == paths(i, j)); }
  for (int it = 0; it < 300; it++) { //#dp_knap
    int n = rnd(1, 8), W = rnd(0, 20); vector<int> wts(n), vals(n); for (int i = 0; i < n; i++) { wts[i] = rnd(1, 8); vals[i] = rnd(1, 20); }
    vector<ll> dp(W + 1, 0); for (int i = 0; i < n; i++) { int wt = wts[i], val = vals[i]; for (int w = W; w >= wt; w--) dp[w] = max(dp[w], dp[w - wt] + val); }
    ll best = 0; for (int mask = 0; mask < (1 << n); mask++) { ll tw = 0, tv = 0; for (int i = 0; i < n; i++) if ((mask >> i) & 1) { tw += wts[i]; tv += vals[i]; } if (tw <= W) best = max(best, tv); }
    CK(dp[W] == best); }
  for (int it = 0; it < 300; it++) { //#dp_lis
    int n = rnd(1, 10); vector<int> a(n); for (auto &v : a) v = rnd(0, 6);
    vector<int> dp(n, 1); int ans = 0; for (int i = 0; i < n; i++) { for (int j = 0; j < i; j++) if (a[j] < a[i]) dp[i] = max(dp[i], 1 + dp[j]); ans = max(ans, dp[i]); }
    int best = 0; for (int mask = 1; mask < (1 << n); mask++) { int last = -1, len = 0; bool ok = true; for (int i = 0; i < n; i++) if ((mask >> i) & 1) { if (a[i] <= last) ok = false; last = a[i]; len++; } if (ok) best = max(best, len); }
    CK(ans == best); }
  for (int it = 0; it < 300; it++) { //#dp_lcs
    int n = rnd(1, 7), m = rnd(1, 7); string a = " ", b = " "; for (int i = 0; i < n; i++) a += char('a' + rnd(0, 2)); for (int i = 0; i < m; i++) b += char('a' + rnd(0, 2));
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++) for (int j = 1; j <= m; j++) dp[i][j] = a[i] == b[j] ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1]);
    set<string> subs; for (int mask = 0; mask < (1 << m); mask++) { string t; for (int i = 0; i < m; i++) if ((mask >> i) & 1) t += b[i + 1]; subs.insert(t); }
    int best = 0; for (int mask = 0; mask < (1 << n); mask++) { string t; for (int i = 0; i < n; i++) if ((mask >> i) & 1) t += a[i + 1]; if (subs.count(t)) best = max(best, (int)t.size()); }
    CK(dp[n][m] == best); }
}

namespace g_dfs {
@{dfs}
}
namespace g_bfs {
@{bfs}
}
namespace g_dijkstra {
@{dijkstra}
}
namespace g_tree {
@{treedfs}
}
namespace g_dsu {
@{dsu}
}
namespace g_topo {
@{topo}
}
static void t_graphs() {
  SEC = "graphs";
  { In in("1 2\n2 3\n1 3\n4 4\n"); int n = 4, m = 4; @{readgraph}
    CK(g.size() == 5 && g[1] == vector<int>({2, 3}) && g[2] == vector<int>({1, 3}) && g[3] == vector<int>({2, 1}) && g[4] == vector<int>({4, 4}) && g[0].empty()); }
  for (int it = 0; it < 600; it++) {
    int n = rnd(1, 9), m = rnd(0, 12); const ll BIG = 1e15;
    vector<vector<int>> g(n + 1); vector<vector<pair<int,ll>>> gw(n + 1); vector<vector<ll>> fl(n + 1, vector<ll>(n + 1, BIG)), fw = fl;
    for (int v = 1; v <= n; v++) fl[v][v] = fw[v][v] = 0;
    g_dsu::DSU dsu(n); int comps = n;
    for (int e = 0; e < m; e++) { int u = rnd(1, n), v = rnd(1, n); ll w = rnd(0, 20);
      bool connectedBefore = false; { vector<vector<ll>> t = fl; for (int k = 1; k <= n; k++) for (int i = 1; i <= n; i++) for (int j = 1; j <= n; j++) t[i][j] = min(t[i][j], t[i][k] + t[k][j]); connectedBefore = t[u][v] < BIG; }
      CK((dsu.find(u) == dsu.find(v)) == connectedBefore); CK(dsu.unite(u, v) == !connectedBefore); if (!connectedBefore) comps--;
      g[u].push_back(v); g[v].push_back(u); gw[u].push_back({v, w}); gw[v].push_back({u, w});
      fl[u][v] = min(fl[u][v], 1LL); fl[v][u] = min(fl[v][u], 1LL); fw[u][v] = min(fw[u][v], w); fw[v][u] = min(fw[v][u], w); }
    for (int k = 1; k <= n; k++) for (int i = 1; i <= n; i++) for (int j = 1; j <= n; j++) { fl[i][j] = min(fl[i][j], fl[i][k] + fl[k][j]); fw[i][j] = min(fw[i][j], fw[i][k] + fw[k][j]); }
    for (int s = 1; s <= n; s++) {
      vector<int> d = g_bfs::bfs(s, g); vector<ll> dw = g_dijkstra::dijkstra(s, gw);
      for (int v = 1; v <= n; v++) { CK(d[v] == (fl[s][v] >= BIG ? -1 : fl[s][v])); CK(dw[v] == (fw[s][v] >= BIG ? g_dijkstra::INF : fw[s][v])); CK((dsu.find(s) == dsu.find(v)) == (fl[s][v] < BIG)); }
      g_dfs::g = g; g_dfs::vis.assign(n + 1, false); g_dfs::dfs(s); for (int v = 1; v <= n; v++) CK(g_dfs::vis[v] == (fl[s][v] < BIG));
    }
    { g_dfs::g = g; g_dfs::vis.assign(n + 1, false); int c = 0; for (int v = 1; v <= n; v++) if (!g_dfs::vis[v]) { g_dfs::dfs(v); c++; } CK(c == comps); { int roots = 0; for (int v = 1; v <= n; v++) if (dsu.find(v) == v) { roots++; CK(dsu.sz[v] >= 1); } CK(roots == comps); } }
  }
  { vector<vector<pair<int,ll>>> gw(3); gw[1].push_back({2, 1000000000000LL}); gw[2].push_back({1, 1000000000000LL}); auto d = g_dijkstra::dijkstra(1, gw); CK(d[2] == 1000000000000LL && d[0] == g_dijkstra::INF); }
  for (int it = 0; it < 600; it++) {       // random tree
    int n = rnd(1, 12), root = rnd(1, n); vector<int> par(n + 1, 0); vector<vector<int>> g(n + 1); vector<int> perm(n); iota(perm.begin(), perm.end(), 1); shuffle(perm.begin(), perm.end(), rng);
    for (int i = 0; i < n; i++) if (perm[i] == root) swap(perm[i], perm[0]);
    int edges = 0; for (int i = 1; i < n; i++) { int p = perm[rnd(0, i - 1)]; par[perm[i]] = p; g[p].push_back(perm[i]); g[perm[i]].push_back(p); edges++; }
    //#tree_edges
    CK(edges == n - 1);
    g_tree::g = g; g_tree::depth.assign(n + 1, 0); g_tree::sz.assign(n + 1, 0); g_tree::dfs(root, 0);
    for (int v = 1; v <= n; v++) { int dep = 0; for (int u = v; u != root; u = par[u]) dep++; int size = 0; for (int u = 1; u <= n; u++) { for (int x = u;; x = par[x]) { if (x == v) { size++; break; } if (x == root) break; } }
      CK(g_tree::depth[v] == dep && g_tree::sz[v] == size); }
  }
  for (int n = 1; n <= 5; n++) {            // every graph on n labelled vertices: connected and without a cycle  =>  n - 1 edges
    vector<pair<int,int>> all; for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) all.push_back({i, j});
    for (int mask = 0; mask < (1 << all.size()); mask++) { vector<int> comp(n); iota(comp.begin(), comp.end(), 0); bool cyc = false; int e = 0;
      for (size_t k = 0; k < all.size(); k++) if ((mask >> k) & 1) { e++; int a = comp[all[k].first], b = comp[all[k].second]; if (a == b) cyc = true; else for (int &c : comp) if (c == b) c = a; }
      bool conn = true; for (int c : comp) if (c != comp[0]) conn = false;
      if (conn && !cyc) CK(e == n - 1); if (conn && e == n - 1) CK(!cyc); }
  }
  for (int it = 0; it < 1500; it++) {
    int n = rnd(1, 8), m = rnd(0, 12); vector<vector<int>> g(n + 1); vector<vector<int>> reach(n + 1, vector<int>(n + 1, 0)); bool dagOnly = it % 2;
    vector<int> lab(n + 1); iota(lab.begin(), lab.end(), 0); shuffle(lab.begin() + 1, lab.end(), rng);
    for (int e = 0; e < m; e++) { int u = rnd(1, n), v = rnd(1, n); if (dagOnly) { if (u == v) continue; if (lab[u] > lab[v]) swap(u, v); } g[u].push_back(v); reach[u][v] = 1; }
    for (int k = 1; k <= n; k++) for (int i = 1; i <= n; i++) for (int j = 1; j <= n; j++) if (reach[i][k] && reach[k][j]) reach[i][j] = 1;
    bool cyc = false; for (int v = 1; v <= n; v++) if (reach[v][v]) cyc = true;
    vector<int> order = g_topo::topo(n, g);
    CK(((int)order.size() < n) == cyc);
    if (!cyc) { vector<int> pos(n + 1, -1); for (int i = 0; i < n; i++) pos[order[i]] = i; for (int v = 1; v <= n; v++) { CK(pos[v] >= 0); for (int u : g[v]) CK(pos[v] < pos[u]); } }
  }
}

int main() {
  t_start(); t_parity(); t_division(); t_wrap(); t_digits(); t_compare(); t_counting();
  t_chars(); t_strings(); t_arrays(); t_grids(); t_powers(); t_time(); t_geometry(); t_io(); t_safety();
  t_numtheory(); t_mod(); t_bits(); t_stl(); t_stl2(); t_ranges(); t_recdp(); t_graphs();
  fprintf(stderr, "%ld checks, %d failed\n", checks, fails);
  return fails ? 1 : 0;
}
