// Harness part 1. Each at-brace placeholder is replaced by the exact text published on the sheet.
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef __int128 i128;
static long checks = 0; static int fails = 0; static const char *SEC = "";
static const bool FASTFAIL = getenv("FASTFAIL") != nullptr;
#define CK(...) do { checks++; if (!(__VA_ARGS__)) { if (FASTFAIL) _exit(1); if (fails++ < 60) fprintf(stderr, "FAIL [%s] line %d: %s\n", SEC, __LINE__, #__VA_ARGS__); } } while (0)
static const vector<ll> BIGS = {LLONG_MIN, LLONG_MIN + 1, -4000000000000000000LL, -1000000000000000007LL, -(1LL << 40) - 1,
  -1000000007, -3, -2, -1, 0, 1, 2, 3, 1000000007, (1LL << 40) + 1, 999999999999999999LL, 1000000000000000000LL,
  4000000000000000000LL, LLONG_MAX - 1, LLONG_MAX};
struct Cap { ostringstream os; streambuf *old; ios::fmtflags fl; streamsize pr; char fc;
  Cap() { fl = cout.flags(); pr = cout.precision(); fc = cout.fill(); old = cout.rdbuf(os.rdbuf()); }
  ~Cap() { cout.rdbuf(old); cout.flags(fl); cout.precision(pr); cout.fill(fc); } string str() { return os.str(); } };
struct In { istringstream is; streambuf *old; In(const string &s) : is(s) { old = cin.rdbuf(is.rdbuf()); cin.clear(); }
  ~In() { cin.rdbuf(old); cin.clear(); } };
static mt19937_64 rng(12345);
static ll rnd(ll lo, ll hi) { unsigned long long span = (unsigned long long)hi - (unsigned long long)lo + 1; unsigned long long r = span ? rng() % span : rng(); return (ll)((unsigned long long)lo + r); }
// obviously-correct helpers (no % or / tricks)
static bool bEven(ll x) { string s = to_string(x); return string("02468").find(s.back()) != string::npos; }
static ll bFloor(ll a, ll b) { ll q = 0; while (q * b <= a) q++; while (q * b > a) q--; return q; }            // a any, b > 0, small
static ll bCeil(ll a, ll b) { ll q = bFloor(a, b); return q * b == a ? q : q + 1; }
static bool bMult(ll x, ll k) { for (ll q = -llabs(x) - 1; q <= llabs(x) + 1; q++) if (q * k == x) return true; return false; }
static ll bGcd(ll a, ll b) { a = llabs(a); b = llabs(b); if (!a) return b; if (!b) return a; ll g = 1; for (ll d = 1; d <= min(a, b); d++) if (bMult(a, d) && bMult(b, d)) g = d; return g; }
static ll bLcm(ll a, ll b) { for (ll v = max(a, b);; v++) if (bMult(v, a) && bMult(v, b)) return v; }
static bool bPrime(ll n) { if (n < 2) return false; int c = 0; for (ll d = 1; d <= n; d++) if (n % d == 0) c++; return c == 2; }
static string str128(i128 v) { if (v == 0) return "0"; string s; while (v > 0) { s += char('0' + (int)(v % 10)); v /= 10; } return string(s.rbegin(), s.rend()); }

#if 0
@{template}
#endif

static void t_start() {
  SEC = "start";
  { int a = 2000000000, b = 2; @{mul1ll}
    CK(p == 4000000000LL); CK(big == 1000000000000000000LL); CK(MOD == 1000000007); }
  //#lim_int
  CK(fabs(INT_MAX - 2e9) / 2e9 < 0.08);
  //#lim_int2
  CK(INT_MAX == (1LL << 31) - 1);
  //#lim_ll
  CK(fabs((double)LLONG_MAX - 9e18) / 9e18 < 0.03);
  //#lim_ll2
  CK((unsigned long long)LLONG_MAX == (1ULL << 63) - 1);
  //#mem_ints
  CK(fabs(256.0 * 1024 * 1024 / sizeof(int) - 6.7e7) / 6.7e7 < 0.01);   // 67 108 864
}

static void t_parity() {
  SEC = "parity";
  vector<ll> xs; for (ll x = -60; x <= 60; x++) xs.push_back(x); for (ll b : BIGS) xs.push_back(b);
  for (ll x : xs) {
    CK((@{even}) == bEven(x)); CK((@{odd}) == !bEven(x)); CK((@{oddbit}) == (bEven(x) ? 0 : 1));
  }
  CK((@{negmod2}) == -1);
  CK((-3 % 2 == 3 % 2) == false);        // the trap named in the tip is real
  CK((-7 % 2 == 1) == false);
  for (ll a = -30; a <= 30; a++) for (ll b = -30; b <= 30; b++) {
    //#par_add1 //#par_add2 //#par_add3
    if (bEven(a) && bEven(b)) { CK(bEven(a + b)); CK(bEven(a - b)); }
    if (!bEven(a) && !bEven(b)) { CK(bEven(a + b)); CK(bEven(a - b)); }
    if (bEven(a) != bEven(b)) { CK(!bEven(a + b)); CK(!bEven(a - b)); }
    //#par_mul1 //#par_mul2
    if (bEven(a)) CK(bEven(a * b));
    if (!bEven(a) && !bEven(b)) CK(!bEven(a * b));
    CK((@{samepar}) == (bEven(a) == bEven(b))); CK((@{diffpar}) == (bEven(a) != bEven(b)));
  }
  for (int it = 0; it < 3000; it++) {
    int len = rnd(1, 8); ll sum = 0, prod = 1; int cntOdd = 0, cntEven = 0;
    for (int i = 0; i < len; i++) { ll v = rnd(-9, 9); sum += v; prod *= v; if (bEven(v)) cntEven++; else cntOdd++; }
    CK((@{sumodd}) == !bEven(sum)); CK((@{prododd}) == !bEven(prod));
  }
  for (ll n = 0; n <= 200; n++) {
    ll e = 0, o = 0; for (ll v = 1; v <= n; v++) { if (bEven(v)) e++; else o++; }
    CK((@{ev1n}) == e); CK((@{od1n}) == o);
    CK((@{halfdown}) + (@{halfup}) == n); CK((@{halfup}) - (@{halfdown}) >= 0 && (@{halfup}) - (@{halfdown}) <= 1); CK((@{halfup2}) == (@{halfup}));
    ll ei = 0, oi = 0; for (ll i = 0; i < n; i++) { if (bEven(i)) ei++; else oi++; }
    CK((@{evenidx}) == ei); CK((@{oddidx}) == oi);
  }
  for (ll l = 1; l <= 60; l++) for (ll r = l; r <= 60; r++) {
    ll e = 0, o = 0; for (ll v = l; v <= r; v++) { if (bEven(v)) e++; else o++; }
    CK((@{evlr}) == e); CK((@{odlr}) == o);
  }
  { ll l = 1, r = 1000000000000000000LL; CK((@{evlr}) == 500000000000000000LL); CK((@{odlr}) == 500000000000000000LL); }
  for (ll x = -50; x <= 50; x++) {
    ll ne = x; while (!bEven(ne)) ne++; ll no = x; while (bEven(no)) no++;
    ll pe = x; while (!bEven(pe)) pe--; ll po = x; while (bEven(po)) po--;
    CK((@{nexteven}) == ne); CK((@{nextodd}) == no); CK((@{preveven}) == pe); CK((@{prevodd}) == po);
  }
  { vector<ll> ev, od; for (ll v = 1; v <= 200; v++) (bEven(v) ? ev : od).push_back(v);
    for (ll k = 1; k <= 100; k++) { CK((@{ktheven}) == ev[k - 1]); CK((@{kthodd}) == od[k - 1]);
      { ll x = ev[k - 1]; CK((@{poseven}) == k); } { ll x = od[k - 1]; CK((@{posodd}) == k); } } }
  for (int n = 0; n <= 9; n++) {
    vector<int> a(n), first, second, f2, s2; for (int i = 0; i < n; i++) a[i] = 10 + i;
    @{alt_index}
    for (int i = 0; i < n; i++) (bEven(i) ? f2 : s2).push_back(a[i]);
    CK(first == f2 && second == s2);
  }
  { int b = 0; @{flip01}; CK(b == 1); @{flip01}; CK(b == 0); }
  { int want = 1; ll x = 7, y = 9; for (int i = 0; i < 20; i++) { CK(@{altsign} == want); CK(@{altval} == (want == 1 ? x : y)); want = -want; } }
}

namespace g_floorceil {
@{floorceil}
}
using g_floorceil::floorDiv; using g_floorceil::ceilDiv;
static void t_division() {
  SEC = "division";
  CK((@{d1}) == 3); CK((@{d2}) == -3); CK((@{d3}) == 1); CK((@{d4}) == -1);
  for (ll a = -40; a <= 40; a++) for (ll b = -40; b <= 40; b++) if (b) {
    CK(@{dident});
    CK(floorDiv(a, b) == (ll)floor((double)a / (double)b)); CK(ceilDiv(a, b) == (ll)ceil((double)a / (double)b));
    CK(fabs((@{realdiv}) - (double)a / (double)b) < 1e-12); CK(fabs((@{realdiv2}) - (double)a / (double)b) < 1e-12);
  }
  for (ll a : BIGS) for (ll b : BIGS) if (b && !(a == LLONG_MIN && b == -1)) {
    CK(@{dident});
    i128 q = floorDiv(a, b), c = ceilDiv(a, b), A = a, B = b;
    if (b > 0) { CK(q * B <= A && A < (q + 1) * B); CK((c - 1) * B < A && A <= c * B); }
    else { CK(q * B >= A && A > (q + 1) * B); CK((c - 1) * B > A && A >= c * B); }
  }
  for (ll a = 0; a <= 200; a++) for (ll b = 1; b <= 40; b++) {
    ll f = bFloor(a, b), c = bCeil(a, b), near = (2 * (a - f * b) >= b) ? f + 1 : f;
    CK((@{floorpos}) == f); CK((@{ceilpos}) == c); CK((@{ceilpos2}) == c); CK((@{roundpos}) == near);
    CK((@{roundpos}) == llround((long double)a / b));
  }
  for (ll a : BIGS) for (ll b : BIGS) if (a >= 0 && b > 0) { i128 c = @{ceilpos2}; CK((c - 1) * b < a && a <= c * (i128)b); }
  { ll a = 7, b = 2, sum = 7, n = 2; CK((@{realdiv}) == 3.5); CK((@{realdiv2}) == 3.5); CK((@{average}) == 3.5); CK((@{realbad}) == 3.0); }
  { double xs[] = {2.7, -2.7, 2.5, -2.5, 3.0, 2.2, -2.2, 0.0}; ll cut[] = {2, -2, 2, -2, 3, 2, -2, 0}, dn[] = {2, -3, 2, -3, 3, 2, -3, 0},
      up[] = {3, -2, 3, -2, 3, 3, -2, 0}, nr[] = {3, -3, 3, -3, 3, 2, -2, 0};
    for (int i = 0; i < 8; i++) { double x = xs[i]; CK((@{rd_cut}) == cut[i]); CK((@{rd_floor}) == dn[i]); CK((@{rd_ceil}) == up[i]); CK((@{rd_round}) == nr[i]); } }
  { ll a = 7, b = 2; CK(ceil(a / b) == 3); }        // the trap in the tip: 4 was wanted
  for (ll x = 0; x <= 200; x++) for (ll k = 1; k <= 30; k++) {
    CK((@{divis}) == bMult(x, k));
    ll dn = x; while (!bMult(dn, k)) dn--; ll up = x; while (!bMult(up, k)) up++; ll nx = x + 1; while (!bMult(nx, k)) nx++;
    CK((@{multdown}) == dn); CK((@{multup}) == up); CK((@{multnext}) == nx);
    { ll n = x, full = 0, left = n; while (left >= k) { left -= k; full++; }
      CK((@{boxes_full}) == full); CK((@{boxes_left}) == left); CK((@{boxes_need}) == full + (left > 0 ? 1 : 0)); }
  }
  for (ll x = -30; x <= 30; x++) for (ll k = 1; k <= 12; k++) CK((@{divis}) == bMult(x, k));
  for (ll x = -60; x <= 150; x++) for (ll a = 1; a <= 12; a++) for (ll b = 1; b <= 12; b++) {
    CK((@{divboth}) == (bMult(x, a) && bMult(x, b))); CK((@{diveither}) == (bMult(x, a) || bMult(x, b))); CK((@{divlcm}) == (bMult(x, a) && bMult(x, b)));
  }
}

static void t_wrap() {
  SEC = "wrap";
  for (ll a = -100; a <= 100; a++) for (ll m = 1; m <= 20; m++) {
    ll w = a; while (w < 0) w += m; while (w >= m) w -= m;
    CK((@{modfix}) == w);
  }
  for (ll a : BIGS) for (ll m : {1LL, 2LL, 3LL, 7LL, 1000000007LL, 1000000000000000000LL, 4000000000000000000LL}) {
    ll w = @{modfix}; CK(0 <= w && w < m); CK(((i128)a - w) % m == 0);
  }
  CK((@{mf1}) == -1); CK((@{mf2}) == 2);
  for (int n = 1; n <= 12; n++) {
    for (int i = 0; i < n; i++) {
      int nx = i + 1; if (nx == n) nx = 0; int pv = i - 1; if (pv < 0) pv = n - 1;
      CK((@{wnext}) == nx); CK((@{wprev}) == pv);
      int f = i, b = i;
      for (int k = 0; k <= 40; k++) {
        CK((@{wfwd}) == f); CK((@{wback}) == b);
        f++; if (f == n) f = 0; b--; if (b < 0) b = n - 1;
      }
      for (int j = 0; j < n; j++) {
        int steps = 0, p = i; while (p != j) { p++; if (p == n) p = 0; steps++; }
        int back = 0; p = i; while (p != j) { p--; if (p < 0) p = n - 1; back++; }
        CK((@{cfwd}) == steps); CK((@{cdist}) == min(steps, back));
      }
    }
    for (int i = 1; i <= n; i++) {
      int nx = i + 1; if (nx > n) nx = 1; int pv = i - 1; if (pv < 1) pv = n;
      CK((@{w1next}) == nx); CK((@{w1prev}) == pv);
      int f = i, b = i;
      for (int k = 0; k <= 40; k++) { CK((@{w1fwd}) == f); CK((@{w1back}) == b); f++; if (f > n) f = 1; b--; if (b < 1) b = n; }
    }
  }
  for (int k = 1; k <= 7; k++) { int row = 0, col = 0;
    for (int p = 0; p <= 60; p++) {
      CK((@{rowof0}) == row); CK((@{colof0}) == col);
      { int q = p; int p = q + 1; CK((@{rowof1}) == row + 1); CK((@{colof1}) == col + 1); }
      col++; if (col == k) { col = 0; row++; }
    } }
  for (string s : {string("a"), string("ab"), string("abcde"), string("xyzzy!?")}) {
    string big; for (int i = 0; i < 20; i++) big += s;
    for (int k = 0; k < (int)big.size(); k++) { CK((@{repchar}) == big[k]); int full = 0; while ((full + 1) * (int)s.size() <= k) full++; CK((int)(@{repfull}) == full); }
  }
  for (ll m : {1LL, 2LL, 7LL, 10LL, 1000000007LL, 3000000000LL}) for (int it = 0; it < 400; it++) {
    ll a = it < 200 ? rnd(0, 60) : rnd(0, 1000000000000000000LL), b = it < 200 ? rnd(0, 60) : rnd(0, 1000000000000000000LL);
    CK((@{modsum}) == (ll)(((i128)a + b) % m)); CK((@{modprod}) == (ll)(((i128)a * b) % m));
  }
}

namespace g_countDigits {
@{countDigits}
}
namespace g_digitSum {
@{digitSum}
}
namespace g_reverseNumber {
@{reverseNumber}
}
using g_countDigits::countDigits; using g_digitSum::digitSum; using g_reverseNumber::reverseNumber;
static void t_digits() {
  SEC = "digits";
  vector<ll> xs; for (ll x = 0; x <= 12000; x++) xs.push_back(x);
  { ll p = 1; for (int i = 0; i < 18; i++) { p *= 10; xs.push_back(p - 1); xs.push_back(p); xs.push_back(p + 1); } }
  for (int i = 0; i < 2000; i++) xs.push_back(rnd(0, 999999999999999999LL));
  for (ll x : xs) {
    string s = to_string(x); int n = s.size();
    CK((@{lastdig}) == s[n - 1] - '0');
    CK((@{droplast}) == (n > 1 ? stoll(s.substr(0, n - 1)) : 0));
    CK((@{last2}) == stoll(n > 2 ? s.substr(n - 2) : s));
    CK((@{drop2}) == (n > 2 ? stoll(s.substr(0, n - 2)) : 0));
    CK((@{tens}) == (n > 1 ? s[n - 2] - '0' : 0));
    CK(countDigits(x) == n);
    for (int k = 0; k <= 18; k++) { @{pow10}
      CK(to_string(p) == "1" + string(k, '0'));
      CK((@{lastk}) == (k == 0 ? 0 : stoll(k >= n ? s : s.substr(n - k)))); CK((@{dropk}) == (k >= n ? 0 : stoll(s.substr(0, n - k)))); }
    int ds = 0; for (char ch : s) ds += ch - '0';
    CK(digitSum(x) == ds);
    string rs(s.rbegin(), s.rend());
    if (x < 1000000000000000000LL) { CK(reverseNumber(x) == stoll(rs)); CK((@{palnum}) == (s == rs)); }
    CK(@{dr3}); CK(@{dr9});
    //#dr_last
    CK(x % 2 == (s[n - 1] - '0') % 2 && x % 5 == (s[n - 1] - '0') % 5 && (x % 10 == 0) == (s[n - 1] == '0'));
    //#dr_4
    CK(x % 4 == stoll(n > 2 ? s.substr(n - 2) : s) % 4);
    //#dr_39
    CK(x % 3 == ds % 3 && x % 9 == ds % 9);
    { ll v = x; ll x = v; @{digits_loop}
      vector<int> want; if (v > 0) for (char ch : s) want.push_back(ch - '0'); CK(digits == want); CK(x == 0); }
    { vector<int> digits; for (char ch : s) digits.push_back(ch - '0'); @{fromdigits}
      CK(x == stoll(s)); }
    { ll v = x; ll x = v; @{firstdigit}
      CK(x == s[0] - '0'); }
    CK((@{tostr}) == s); CK((@{stollx}) == x); CK((@{ndigstr}) == (size_t)n);
    for (int k = 0; k < n; k++) CK((@{kthdig}) == s[k] - '0');
    if (x <= INT_MAX) CK((@{stoix}) == (int)x);
  }
  CK(countDigits(LLONG_MAX) == 19); CK(digitSum(LLONG_MAX) == 88); CK(reverseNumber(1230) == 321); CK(reverseNumber(0) == 0);
  { string s = "-42"; CK((@{stollx}) == -42); CK((@{stoix}) == -42); }
  for (int d = 0; d <= 9; d++) { char c = "0123456789"[d]; CK((@{c2d}) == d); CK((@{d2c}) == c); CK(sizeof(@{d2c}) == 1); }
  for (int v = 0; v < 128; v++) { char c = (char)v; CK((@{isdigc}) == (string("0123456789").find(c) != string::npos)); }
  for (int it = 0; it < 3000; it++) {
    i128 V = 0; int len = rnd(1, 36); for (int i = 0; i < len; i++) V = V * 10 + rnd(0, 9);
    ll m = it % 3 == 0 ? rnd(1, 50) : it % 3 == 1 ? 1000000007LL : rnd(1, 900000000000000000LL);
    In in(str128(V) + "\n");
    @{bigmod}
    CK(r == (ll)(V % m)); CK(s == str128(V));
  }
  for (int k = 1; k <= 6; k++) {
    ll lo = -1, hi = -1, cnt = 0, p10k = 1, p10k1 = 1; for (int i = 0; i < k; i++) p10k *= 10; for (int i = 0; i < k - 1; i++) p10k1 *= 10;
    for (ll x = 1; x <= 1000000; x++) if ((int)to_string(x).size() == k) { if (lo < 0) lo = x; hi = x; cnt++; }
    //#kdig_range
    CK(lo == p10k1 && hi == p10k - 1);
    //#kdig_count
    CK(cnt == 9 * p10k1);
  }
}

static void t_compare() {
  SEC = "compare";
  for (ll a = -3; a <= 3; a++) for (ll b = -3; b <= 3; b++) {
    { vector<ll> v = {a, b}; sort(v.begin(), v.end()); CK((@{min2}) == v[0]); CK((@{max2}) == v[1]); CK((@{dist2}) == v[1] - v[0]);
      ll steps = 0; for (ll t = v[0]; t < v[1]; t++) steps++; CK((@{dist1}) == steps); }
    { ll a0 = a, b0 = b; ll a = a0, b = b0; @{swap2}; CK(a == b0 && b == a0); }
    { ll a0 = a, b0 = b; ll a = a0, b = b0; @{order2}; CK(a <= b && a + b == a0 + b0 && (a == a0 || a == b0)); }
    CK((@{diffsign}) == ((a < 0 && b >= 0) || (a >= 0 && b < 0)));
    for (ll c = -3; c <= 3; c++) {
      vector<ll> v = {a, b, c}; sort(v.begin(), v.end());
      CK((@{min3}) == v[0]); CK((@{mid3}) == v[1]);
      set<ll> st(v.begin(), v.end());
      CK((@{alleq3}) == (st.size() == 1)); CK((@{alldiff3}) == (st.size() == 3)); CK((@{twoeq3}) == (st.size() <= 2));
      { ll a1 = a, b1 = b, c1 = c; ll a = a1, b = b1, c = c1;
        @{sort3}
        CK(a == v[0] && b == v[1] && c == v[2]); }
      for (ll d = -3; d <= 3; d++) { vector<ll> w = {a, b, c, d}; sort(w.begin(), w.end()); CK((@{max4}) == w[3]); }
    }
  }
  for (ll x : BIGS) { CK((@{max0}) == (x < 0 ? 0 : x)); CK((@{clamp0}) == (x < 0 ? 0 : x)); CK((@{sign}) == (x > 0 ? 1 : x < 0 ? -1 : 0));
    if (x != LLONG_MIN) CK((@{abs1}) == (x < 0 ? -x : x)); }
  CK(sizeof(abs(-5000000000LL)) == 8 && abs(-5000000000LL) == 5000000000LL);
  for (int it = 0; it < 500; it++) {
    int n = rnd(1, 9); vector<ll> a(n); for (auto &v : a) v = it % 2 ? rnd(-5, 5) : rnd(LLONG_MIN, LLONG_MAX);
    @{runmax}
    vector<ll> b = a; sort(b.begin(), b.end()); CK(mn == b[0] && mx == b[n - 1]);
  }
  for (ll lo = -4; lo <= 4; lo++) for (ll hi = lo; hi <= 4; hi++) for (ll x = -8; x <= 8; x++) {
    ll want = x; if (want < lo) want = lo; if (want > hi) want = hi;
    CK((@{clamp1}) == want); CK((@{clamp2}) == want);
    { ll dd = 0; ll p = x; while (p < lo) { p++; dd++; } while (p > hi) { p--; dd++; } CK((@{dist_range}) == dd); }
    { ll l = lo, r = hi; bool in = false; for (ll v = l; v <= r; v++) if (v == x) in = true;
      CK((@{inrange}) == in); CK((@{outrange}) == !in);
      bool inh = false; for (ll v = l; v < r; v++) if (v == x) inh = true; CK((@{inhalf}) == inh); }
  }
  for (ll a = 0; a <= 7; a++) for (ll b = a; b <= 7; b++) for (ll c = 0; c <= 7; c++) for (ll d = c; d <= 7; d++) {
    vector<ll> common; ll uni = 0, seg = 0; bool inside = true;
    for (ll t = -1; t <= 9; t++) { bool p = a <= t && t <= b, q = c <= t && t <= d; if (p && q) common.push_back(t); if (p || q) uni++; if (p && !q) inside = false;
      if (a <= t && t + 1 <= b && c <= t && t + 1 <= d) seg++; }
    CK((@{ovl_test}) == !common.empty()); CK((@{ovl_none}) == common.empty()); CK((@{ovl_inside}) == inside);
    if (!common.empty()) { CK((@{ovl_lo}) == common[0]); CK((@{ovl_hi}) == common.back()); }
    CK((@{ovl_cnt}) == (ll)common.size()); CK((@{ovl_len}) == seg); CK((@{union_cnt}) == uni);
  }
  for (ll a = -6; a <= 6; a++) for (ll b = 1; b <= 6; b++) for (ll c = -6; c <= 6; c++) for (ll d = 1; d <= 6; d++) {
    long double p = (long double)a / b, q = (long double)c / d; bool eq = fabsl(p - q) < 1e-12L;
    CK((@{frac_eq}) == eq); CK((@{frac_lt}) == (!eq && p < q)); }
  { double x = 0.1 + 0.2, y = 0.3; CK(!(x == y)); CK(@{feq}); CK(!(@{flt})); }
  { double x = 0.1, y = 0.2; CK(!(@{feq})); CK(@{flt}); }
  { double x = 0.2, y = 0.1; CK(!(@{feq})); CK(!(@{flt})); }
}

static void t_counting() {
  SEC = "counting";
  for (ll l = -10; l <= 10; l++) for (ll r = l; r <= 10; r++) {
    ll c1 = 0, c2 = 0, c3 = 0, sum = 0;
    for (ll v = l; v <= r; v++) { c1++; sum += v; } for (ll v = l; v < r; v++) c2++; for (ll v = l + 1; v < r; v++) c3++;
    //#cnt_lr
    CK((@{cntlr}) == c1); CK((@{cnthalf}) == c2); if (l < r) CK((@{cntopen}) == c3);
    //#sum_lr
    CK((l + r) * (r - l + 1) % 2 == 0); CK((@{csumlr}) == sum);
  }
  for (ll n = 1; n <= 30; n++) { ll g = 0; for (ll i = 1; i < n; i++) g++; CK((@{gaps}) == g); }
  for (ll k = 1; k <= 12; k++) {
    for (ll n = 0; n <= 100; n++) { ll c = 0; for (ll v = 1; v <= n; v++) if (bMult(v, k)) c++;
      //#mult_1n
      CK((@{mult1n}) == c); }
    for (ll l = 1; l <= 40; l++) for (ll r = l; r <= 40; r++) {
      ll c = 0; for (ll v = l; v <= r; v++) if (bMult(v, k)) c++;
      CK((@{multlr}) == c);
      ll f = l; while (!bMult(f, k)) f++; ll la = r; while (!bMult(la, k)) la--;
      CK((@{multfirst}) == f); CK((@{multlast}) == la);
    }
  }
  for (ll n = 0; n <= 150; n++) for (ll a = 1; a <= 10; a++) for (ll b = 1; b <= 10; b++) {
    ll both = 0, either = 0, none = 0;
    for (ll v = 1; v <= n; v++) { bool p = bMult(v, a), q = bMult(v, b); both += p && q; either += p || q; none += !p && !q; }
    CK((@{cntboth}) == both); CK((@{cnteither}) == either); CK((@{cntnone}) == none);
  }
  for (ll n = 0; n <= 45; n++) {
    ll pr = 0, op = 0, le = 0, tr = 0, sub = 0;
    for (ll i = 0; i < n; i++) for (ll j = 0; j < n; j++) { if (i < j) pr++; if (i != j) op++; if (i <= j) le++; }
    for (ll i = 0; i < n; i++) for (ll j = i + 1; j < n; j++) for (ll k = j + 1; k < n; k++) tr++;
    for (ll l = 0; l < n; l++) for (ll r = l; r < n; r++) sub++;
    //#pairs_f //#opairs_f //#triples_f //#ncr_pairs
    CK((@{pairs}) == pr); CK((@{opairs}) == op); CK((@{pairsle}) == le); CK((@{triples}) == tr); CK((@{handshakes}) == pr); CK((@{subarrays}) == sub);
    for (ll m = 0; m <= 6; m++) { ll c = 0; for (ll i = 0; i < n; i++) for (ll j = 0; j < m; j++) c++; CK((@{pairsnm}) == c); }
    for (ll k = 1; k <= n; k++) { ll w = 0, last = -1; for (ll st = 0; st + k <= n; st++) { w++; last = st; } CK((@{windows}) == w); CK((@{lastwin}) == last);
      for (ll m = k; m <= 8; m++) { ll sq = 0; for (ll i = 0; i + k <= n; i++) for (ll j = 0; j + k <= m; j++) sq++; CK((@{ksquares}) == sq); } }
  }
  { ll n = 100000; CK((@{pairs}) == 4999950000LL); }
  { ll n = 2000000; CK((i128)(@{triples}) == (i128)n * (n - 1) * (n - 2) / 6); }
  for (int n = 0; n <= 20; n++) { ll c = 0; for (int mask = 0; mask < (1 << n); mask++) c++;
    //#subsets_f //#ncr_subsets
    CK((@{subsets}) == c); }
  for (ll n = 0; n <= 300; n++) {
    ll s1 = 0, so = 0, se = 0, sq = 0, sc = 0;
    for (ll v = 1; v <= n; v++) { s1 += v; so += 2 * v - 1; se += 2 * v; sq += v * v; sc += v * v * v; }
    //#sum_1n
    CK(s1 == n * (n + 1) / 2); CK((@{csum1n}) == s1);
    //#sum_odd
    CK(so == n * n);
    //#sum_even
    CK(se == n * (n + 1));
    //#sum_sq
    CK(n * (n + 1) * (2 * n + 1) % 6 == 0 && sq == n * (n + 1) * (2 * n + 1) / 6); CK((@{csumsq}) == sq);
    //#sum_cube
    CK(n * n * (n + 1) * (n + 1) % 4 == 0 && sc == n * n * (n + 1) * (n + 1) / 4);
  }
  { ll n = 1000000000; CK((@{csum1n}) == 500000000500000000LL); }
  { ll n = 1000000; CK((i128)(@{csumsq}) == (i128)n * (n + 1) * (2 * n + 1) / 6); }
  for (ll a = -5; a <= 5; a++) for (ll d = -4; d <= 4; d++) for (ll terms = 1; terms <= 12; terms++) {
    vector<ll> t; ll sum = 0; for (ll i = 0; i < terms; i++) { t.push_back(a + i * d); sum += t.back(); }
    //#ap_kth
    for (ll k = 1; k <= terms; k++) CK(t[k - 1] == a + (k - 1) * d);
    ll first = t[0], last = t.back(), cnt = terms;
    //#ap_cnt
    if (d != 0) CK((last - first) % d == 0 && (last - first) / d + 1 == terms);
    //#ap_sum
    CK(terms * (first + last) % 2 == 0 && sum == terms * (first + last) / 2);
    CK((@{apsum}) == sum);
  }
  { ll s = 0, p = 1; for (int k = 0; k <= 61; k++) { s += p;
      //#geo_2
      CK(s == 2 * p - 1); CK((@{geo2c}) == s); p *= 2; } }
  for (ll r = 2; r <= 7; r++) { ll s = 0, p = 1; for (int k = 0; k <= 12; k++) { s += p; p *= r;
      //#geo_r
      CK((p - 1) % (r - 1) == 0 && s == (p - 1) / (r - 1)); } }
  for (int it = 0; it < 300; it++) { vector<ll> a(rnd(0, 9)); for (auto &v : a) v = rnd(-9, 9);
    @{cntif}
    int w = 0; for (ll v : a) if (bEven(v)) w++; CK(cnt == w); }
}
