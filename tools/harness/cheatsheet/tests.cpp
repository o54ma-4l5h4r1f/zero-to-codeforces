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
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int n; cin >> n;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    cout << (n > 0 ? "YES" : "NO") << "\n";
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int t; cin >> t;
    while (t--) solve();
}
#endif

static void t_start() {
  SEC = "start";
  { int a = 2000000000, b = 2; long long p = 1LL * a * b;
long long big = 1e18;
const int MOD = 1e9 + 7;
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
  CK(fabs(256.0 * 1024 * 1024 / sizeof(int) - 6e7) / 6e7 < 0.15);
}

static void t_parity() {
  SEC = "parity";
  vector<ll> xs; for (ll x = -60; x <= 60; x++) xs.push_back(x); for (ll b : BIGS) xs.push_back(b);
  for (ll x : xs) {
    CK((x % 2 == 0) == bEven(x)); CK((x % 2 != 0) == !bEven(x)); CK((x & 1) == (bEven(x) ? 0 : 1));
  }
  CK((-7 % 2) == -1);
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
    CK(((a - b) % 2 == 0) == (bEven(a) == bEven(b))); CK(((a - b) % 2 != 0) == (bEven(a) != bEven(b)));
  }
  for (int it = 0; it < 3000; it++) {
    int len = rnd(1, 8); ll sum = 0, prod = 1; int cntOdd = 0, cntEven = 0;
    for (int i = 0; i < len; i++) { ll v = rnd(-9, 9); sum += v; prod *= v; if (bEven(v)) cntEven++; else cntOdd++; }
    CK((cntOdd % 2 != 0) == !bEven(sum)); CK((cntEven == 0) == !bEven(prod));
  }
  for (ll n = 0; n <= 200; n++) {
    ll e = 0, o = 0; for (ll v = 1; v <= n; v++) { if (bEven(v)) e++; else o++; }
    CK((n / 2) == e); CK(((n + 1) / 2) == o);
    CK((n / 2) + ((n + 1) / 2) == n); CK(((n + 1) / 2) - (n / 2) >= 0 && ((n + 1) / 2) - (n / 2) <= 1); CK((n - n / 2) == ((n + 1) / 2));
    ll ei = 0, oi = 0; for (ll i = 0; i < n; i++) { if (bEven(i)) ei++; else oi++; }
    CK(((n + 1) / 2) == ei); CK((n / 2) == oi);
  }
  for (ll l = 1; l <= 60; l++) for (ll r = l; r <= 60; r++) {
    ll e = 0, o = 0; for (ll v = l; v <= r; v++) { if (bEven(v)) e++; else o++; }
    CK((r / 2 - (l - 1) / 2) == e); CK(((r + 1) / 2 - l / 2) == o);
  }
  { ll l = 1, r = 1000000000000000000LL; CK((r / 2 - (l - 1) / 2) == 500000000000000000LL); CK(((r + 1) / 2 - l / 2) == 500000000000000000LL); }
  for (ll x = -50; x <= 50; x++) {
    ll ne = x; while (!bEven(ne)) ne++; ll no = x; while (bEven(no)) no++;
    ll pe = x; while (!bEven(pe)) pe--; ll po = x; while (bEven(po)) po--;
    CK((x + (x & 1)) == ne); CK((x | 1) == no); CK((x - (x & 1)) == pe); CK(((x - 1) | 1) == po);
  }
  { vector<ll> ev, od; for (ll v = 1; v <= 200; v++) (bEven(v) ? ev : od).push_back(v);
    for (ll k = 1; k <= 100; k++) { CK((2 * k) == ev[k - 1]); CK((2 * k - 1) == od[k - 1]);
      { ll x = ev[k - 1]; CK((x / 2) == k); } { ll x = od[k - 1]; CK(((x + 1) / 2) == k); } } }
  for (int n = 0; n <= 9; n++) {
    vector<int> a(n), first, second, f2, s2; for (int i = 0; i < n; i++) a[i] = 10 + i;
    for (int i = 0; i < n; i++) {
    if (i % 2 == 0) first.push_back(a[i]);
    else            second.push_back(a[i]);
}
// first: a[0], a[2]..  second: a[1], a[3]..
    for (int i = 0; i < n; i++) (bEven(i) ? f2 : s2).push_back(a[i]);
    CK(first == f2 && second == s2);
  }
  { int b = 0; b = 1 - b; CK(b == 1); b = 1 - b; CK(b == 0); }
  { int want = 1; ll x = 7, y = 9; for (int i = 0; i < 20; i++) { CK((i % 2 == 0 ? 1 : -1) == want); CK((i % 2 == 0 ? x : y) == (want == 1 ? x : y)); want = -want; } }
}

namespace g_floorceil {
long long floorDiv(long long a, long long b) {
    long long q = a / b;
    if (a % b != 0 && (a < 0) != (b < 0)) q--;
    return q;
}
long long ceilDiv(long long a, long long b) {
    long long q = a / b;
    if (a % b != 0 && (a < 0) == (b < 0)) q++;
    return q;
}
}
using g_floorceil::floorDiv; using g_floorceil::ceilDiv;
static void t_division() {
  SEC = "division";
  CK((7 / 2) == 3); CK((-7 / 2) == -3); CK((7 % 2) == 1); CK((-7 % 2) == -1);
  for (ll a = -40; a <= 40; a++) for (ll b = -40; b <= 40; b++) if (b) {
    CK(a == (a / b) * b + a % b);
    CK(floorDiv(a, b) == (ll)floor((double)a / (double)b)); CK(ceilDiv(a, b) == (ll)ceil((double)a / (double)b));
    CK(fabs((1.0 * a / b) - (double)a / (double)b) < 1e-12); CK(fabs(((double)a / b) - (double)a / (double)b) < 1e-12);
  }
  for (ll a : BIGS) for (ll b : BIGS) if (b && !(a == LLONG_MIN && b == -1)) {
    CK(a == (a / b) * b + a % b);
    i128 q = floorDiv(a, b), c = ceilDiv(a, b), A = a, B = b;
    if (b > 0) { CK(q * B <= A && A < (q + 1) * B); CK((c - 1) * B < A && A <= c * B); }
    else { CK(q * B >= A && A > (q + 1) * B); CK((c - 1) * B > A && A >= c * B); }
  }
  for (ll a = 0; a <= 200; a++) for (ll b = 1; b <= 40; b++) {
    ll f = bFloor(a, b), c = bCeil(a, b), near = (2 * (a - f * b) >= b) ? f + 1 : f;
    CK((a / b) == f); CK(((a + b - 1) / b) == c); CK((a / b + (a % b != 0)) == c); CK(((a + b / 2) / b) == near);
    CK(((a + b / 2) / b) == llround((long double)a / b));
  }
  for (ll a : BIGS) for (ll b : BIGS) if (a >= 0 && b > 0) { i128 c = a / b + (a % b != 0); CK((c - 1) * b < a && a <= c * (i128)b); }
  { ll a = 7, b = 2, sum = 7, n = 2; CK((1.0 * a / b) == 3.5); CK(((double)a / b) == 3.5); CK((1.0 * sum / n) == 3.5); CK(((double)(a / b)) == 3.0); }
  { double xs[] = {2.7, -2.7, 2.5, -2.5, 3.0, 2.2, -2.2, 0.0}; ll cut[] = {2, -2, 2, -2, 3, 2, -2, 0}, dn[] = {2, -3, 2, -3, 3, 2, -3, 0},
      up[] = {3, -2, 3, -2, 3, 3, -2, 0}, nr[] = {3, -3, 3, -3, 3, 2, -2, 0};
    for (int i = 0; i < 8; i++) { double x = xs[i]; CK(((long long)x) == cut[i]); CK((floor(x)) == dn[i]); CK((ceil(x)) == up[i]); CK((llround(x)) == nr[i]); } }
  { ll a = 7, b = 2; CK(ceil(a / b) == 3); }        // the trap in the tip: 4 was wanted
  for (ll x = 0; x <= 200; x++) for (ll k = 1; k <= 30; k++) {
    CK((x % k == 0) == bMult(x, k));
    ll dn = x; while (!bMult(dn, k)) dn--; ll up = x; while (!bMult(up, k)) up++; ll nx = x + 1; while (!bMult(nx, k)) nx++;
    CK((x / k * k) == dn); CK(((x + k - 1) / k * k) == up); CK(((x / k + 1) * k) == nx);
    { ll n = x, full = 0, left = n; while (left >= k) { left -= k; full++; }
      CK((n / k) == full); CK((n % k) == left); CK(((n + k - 1) / k) == full + (left > 0 ? 1 : 0)); }
  }
  for (ll x = -30; x <= 30; x++) for (ll k = 1; k <= 12; k++) CK((x % k == 0) == bMult(x, k));
  for (ll x = -60; x <= 150; x++) for (ll a = 1; a <= 12; a++) for (ll b = 1; b <= 12; b++) {
    CK((x % a == 0 && x % b == 0) == (bMult(x, a) && bMult(x, b))); CK((x % a == 0 || x % b == 0) == (bMult(x, a) || bMult(x, b))); CK((x % lcm(a, b) == 0) == (bMult(x, a) && bMult(x, b)));
  }
}

static void t_wrap() {
  SEC = "wrap";
  for (ll a = -100; a <= 100; a++) for (ll m = 1; m <= 20; m++) {
    ll w = a; while (w < 0) w += m; while (w >= m) w -= m;
    CK((((a % m) + m) % m) == w);
  }
  for (ll a : BIGS) for (ll m : {1LL, 2LL, 3LL, 7LL, 1000000007LL, 1000000000000000000LL, 4000000000000000000LL}) {
    ll w = ((a % m) + m) % m; CK(0 <= w && w < m); CK(((i128)a - w) % m == 0);
  }
  CK((-7 % 3) == -1); CK((((-7 % 3) + 3) % 3) == 2);
  for (int n = 1; n <= 12; n++) {
    for (int i = 0; i < n; i++) {
      int nx = i + 1; if (nx == n) nx = 0; int pv = i - 1; if (pv < 0) pv = n - 1;
      CK(((i + 1) % n) == nx); CK(((i - 1 + n) % n) == pv);
      int f = i, b = i;
      for (int k = 0; k <= 40; k++) {
        CK(((i + k) % n) == f); CK((((i - k) % n + n) % n) == b);
        f++; if (f == n) f = 0; b--; if (b < 0) b = n - 1;
      }
      for (int j = 0; j < n; j++) {
        int steps = 0, p = i; while (p != j) { p++; if (p == n) p = 0; steps++; }
        int back = 0; p = i; while (p != j) { p--; if (p < 0) p = n - 1; back++; }
        CK(((j - i + n) % n) == steps); CK((min(abs(i - j), n - abs(i - j))) == min(steps, back));
      }
    }
    for (int i = 1; i <= n; i++) {
      int nx = i + 1; if (nx > n) nx = 1; int pv = i - 1; if (pv < 1) pv = n;
      CK((i % n + 1) == nx); CK(((i + n - 2) % n + 1) == pv);
      int f = i, b = i;
      for (int k = 0; k <= 40; k++) { CK(((i - 1 + k) % n + 1) == f); CK((((i - 1 - k) % n + n) % n + 1) == b); f++; if (f > n) f = 1; b--; if (b < 1) b = n; }
    }
  }
  for (int k = 1; k <= 7; k++) { int row = 0, col = 0;
    for (int p = 0; p <= 60; p++) {
      CK((p / k) == row); CK((p % k) == col);
      { int q = p; int p = q + 1; CK(((p - 1) / k + 1) == row + 1); CK(((p - 1) % k + 1) == col + 1); }
      col++; if (col == k) { col = 0; row++; }
    } }
  for (string s : {string("a"), string("ab"), string("abcde"), string("xyzzy!?")}) {
    string big; for (int i = 0; i < 20; i++) big += s;
    for (int k = 0; k < (int)big.size(); k++) { CK((s[k % s.size()]) == big[k]); int full = 0; while ((full + 1) * (int)s.size() <= k) full++; CK((int)(k / s.size()) == full); }
  }
  for (ll m : {1LL, 2LL, 7LL, 10LL, 1000000007LL, 3000000000LL}) for (int it = 0; it < 400; it++) {
    ll a = it < 200 ? rnd(0, 60) : rnd(0, 1000000000000000000LL), b = it < 200 ? rnd(0, 60) : rnd(0, 1000000000000000000LL);
    CK(((a % m + b % m) % m) == (ll)(((i128)a + b) % m)); CK(((a % m) * (b % m) % m) == (ll)(((i128)a * b) % m));
  }
}

namespace g_countDigits {
int countDigits(long long x) {
    int c = 1;
    while (x >= 10) { x /= 10; c++; }
    return c;
}
}
namespace g_digitSum {
int digitSum(long long x) {
    int s = 0;
    for (; x > 0; x /= 10) s += x % 10;
    return s;
}
}
namespace g_reverseNumber {
long long reverseNumber(long long x) {
    long long r = 0;
    while (x > 0) {
        r = r * 10 + x % 10;
        x /= 10;
    }
    return r;
}
}
using g_countDigits::countDigits; using g_digitSum::digitSum; using g_reverseNumber::reverseNumber;
static void t_digits() {
  SEC = "digits";
  vector<ll> xs; for (ll x = 0; x <= 12000; x++) xs.push_back(x);
  { ll p = 1; for (int i = 0; i < 18; i++) { p *= 10; xs.push_back(p - 1); xs.push_back(p); xs.push_back(p + 1); } }
  for (int i = 0; i < 2000; i++) xs.push_back(rnd(0, 999999999999999999LL));
  for (ll x : xs) {
    string s = to_string(x); int n = s.size();
    CK((x % 10) == s[n - 1] - '0');
    CK((x / 10) == (n > 1 ? stoll(s.substr(0, n - 1)) : 0));
    CK((x % 100) == stoll(n > 2 ? s.substr(n - 2) : s));
    CK((x / 100) == (n > 2 ? stoll(s.substr(0, n - 2)) : 0));
    CK((x / 10 % 10) == (n > 1 ? s[n - 2] - '0' : 0));
    CK(countDigits(x) == n);
    for (int k = 0; k <= 18; k++) { long long p = 1;
for (int i = 0; i < k; i++) p *= 10;
      CK(to_string(p) == "1" + string(k, '0'));
      CK((x % p) == (k == 0 ? 0 : stoll(k >= n ? s : s.substr(n - k)))); CK((x / p) == (k >= n ? 0 : stoll(s.substr(0, n - k)))); }
    int ds = 0; for (char ch : s) ds += ch - '0';
    CK(digitSum(x) == ds);
    string rs(s.rbegin(), s.rend());
    if (x < 1000000000000000000LL) { CK(reverseNumber(x) == stoll(rs)); CK((x == reverseNumber(x)) == (s == rs)); }
    CK(x % 3 == digitSum(x) % 3); CK(x % 9 == digitSum(x) % 9);
    //#dr_last
    CK(x % 2 == (s[n - 1] - '0') % 2 && x % 5 == (s[n - 1] - '0') % 5 && (x % 10 == 0) == (s[n - 1] == '0'));
    //#dr_4
    CK(x % 4 == stoll(n > 2 ? s.substr(n - 2) : s) % 4);
    //#dr_39
    CK(x % 3 == ds % 3 && x % 9 == ds % 9);
    { ll v = x; ll x = v; vector<int> digits;
while (x > 0) {
    digits.push_back(x % 10);  // last digit
    x /= 10;                   // remove it
}
reverse(digits.begin(), digits.end());
      vector<int> want; if (v > 0) for (char ch : s) want.push_back(ch - '0'); CK(digits == want); CK(x == 0); }
    { vector<int> digits; for (char ch : s) digits.push_back(ch - '0'); long long x = 0;
for (int d : digits) x = x * 10 + d;
      CK(x == stoll(s)); }
    { ll v = x; ll x = v; while (x >= 10) x /= 10;
// now x is the first digit
      CK(x == s[0] - '0'); }
    CK((to_string(x)) == s); CK((stoll(s)) == x); CK((to_string(x).size()) == (size_t)n);
    for (int k = 0; k < n; k++) CK((to_string(x)[k] - '0') == s[k] - '0');
    if (x <= INT_MAX) CK((stoi(s)) == (int)x);
  }
  CK(countDigits(LLONG_MAX) == 19); CK(digitSum(LLONG_MAX) == 88); CK(reverseNumber(1230) == 321); CK(reverseNumber(0) == 0);
  { string s = "-42"; CK((stoll(s)) == -42); CK((stoi(s)) == -42); }
  for (int d = 0; d <= 9; d++) { char c = "0123456789"[d]; CK((c - '0') == d); CK((char('0' + d)) == c); CK(sizeof(char('0' + d)) == 1); }
  for (int v = 0; v < 128; v++) { char c = (char)v; CK(('0' <= c && c <= '9') == (string("0123456789").find(c) != string::npos)); }
  for (int it = 0; it < 3000; it++) {
    i128 V = 0; int len = rnd(1, 36); for (int i = 0; i < len; i++) V = V * 10 + rnd(0, 9);
    ll m = it % 3 == 0 ? rnd(1, 50) : it % 3 == 1 ? 1000000007LL : rnd(1, 900000000000000000LL);
    In in(str128(V) + "\n");
    string s; cin >> s;
long long r = 0;
for (char c : s)
    r = (r * 10 + (c - '0')) % m;
// r is the big number % m
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
    { vector<ll> v = {a, b}; sort(v.begin(), v.end()); CK((min(a, b)) == v[0]); CK((max(a, b)) == v[1]); CK((max(a, b) - min(a, b)) == v[1] - v[0]);
      ll steps = 0; for (ll t = v[0]; t < v[1]; t++) steps++; CK((abs(a - b)) == steps); }
    { ll a0 = a, b0 = b; ll a = a0, b = b0; swap(a, b); CK(a == b0 && b == a0); }
    { ll a0 = a, b0 = b; ll a = a0, b = b0; if (a > b) swap(a, b); CK(a <= b && a + b == a0 + b0 && (a == a0 || a == b0)); }
    CK(((a < 0) != (b < 0)) == ((a < 0 && b >= 0) || (a >= 0 && b < 0)));
    for (ll c = -3; c <= 3; c++) {
      vector<ll> v = {a, b, c}; sort(v.begin(), v.end());
      CK((min({a, b, c})) == v[0]); CK((a + b + c - min({a, b, c}) - max({a, b, c})) == v[1]);
      set<ll> st(v.begin(), v.end());
      CK((a == b && b == c) == (st.size() == 1)); CK((a != b && b != c && a != c) == (st.size() == 3)); CK((a == b || b == c || a == c) == (st.size() <= 2));
      { ll a1 = a, b1 = b, c1 = c; ll a = a1, b = b1, c = c1;
        if (a > b) swap(a, b);
if (b > c) swap(b, c);
if (a > b) swap(a, b);
        CK(a == v[0] && b == v[1] && c == v[2]); }
      for (ll d = -3; d <= 3; d++) { vector<ll> w = {a, b, c, d}; sort(w.begin(), w.end()); CK((max({a, b, c, d})) == w[3]); }
    }
  }
  for (ll x : BIGS) { CK((max(x, 0LL)) == (x < 0 ? 0 : x)); CK((max(0LL, x)) == (x < 0 ? 0 : x)); CK(((x > 0) - (x < 0)) == (x > 0 ? 1 : x < 0 ? -1 : 0));
    if (x != LLONG_MIN) CK((abs(x)) == (x < 0 ? -x : x)); }
  CK(sizeof(abs(-5000000000LL)) == 8 && abs(-5000000000LL) == 5000000000LL);
  for (int it = 0; it < 500; it++) {
    int n = rnd(1, 9); vector<ll> a(n); for (auto &v : a) v = it % 2 ? rnd(-5, 5) : rnd(LLONG_MIN, LLONG_MAX);
    long long mx = LLONG_MIN, mn = LLONG_MAX;
for (long long x : a) {
    mx = max(mx, x);
    mn = min(mn, x);
}
    vector<ll> b = a; sort(b.begin(), b.end()); CK(mn == b[0] && mx == b[n - 1]);
  }
  for (ll lo = -4; lo <= 4; lo++) for (ll hi = lo; hi <= 4; hi++) for (ll x = -8; x <= 8; x++) {
    ll want = x; if (want < lo) want = lo; if (want > hi) want = hi;
    CK((max(lo, min(x, hi))) == want); CK((clamp(x, lo, hi)) == want);
    { ll dd = 0; ll p = x; while (p < lo) { p++; dd++; } while (p > hi) { p--; dd++; } CK((max({0LL, lo - x, x - hi})) == dd); }
    { ll l = lo, r = hi; bool in = false; for (ll v = l; v <= r; v++) if (v == x) in = true;
      CK((l <= x && x <= r) == in); CK((x < l || x > r) == !in);
      bool inh = false; for (ll v = l; v < r; v++) if (v == x) inh = true; CK((l <= x && x < r) == inh); }
  }
  for (ll a = 0; a <= 7; a++) for (ll b = a; b <= 7; b++) for (ll c = 0; c <= 7; c++) for (ll d = c; d <= 7; d++) {
    vector<ll> common; ll uni = 0, seg = 0; bool inside = true;
    for (ll t = -1; t <= 9; t++) { bool p = a <= t && t <= b, q = c <= t && t <= d; if (p && q) common.push_back(t); if (p || q) uni++; if (p && !q) inside = false;
      if (a <= t && t + 1 <= b && c <= t && t + 1 <= d) seg++; }
    CK((max(a, c) <= min(b, d)) == !common.empty()); CK((b < c || d < a) == common.empty()); CK((c <= a && b <= d) == inside);
    if (!common.empty()) { CK((max(a, c)) == common[0]); CK((min(b, d)) == common.back()); }
    CK((max(0LL, min(b, d) - max(a, c) + 1)) == (ll)common.size()); CK((max(0LL, min(b, d) - max(a, c))) == seg); CK(((b - a + 1) + (d - c + 1) - max(0LL, min(b, d) - max(a, c) + 1)) == uni);
  }
  for (ll a = -6; a <= 6; a++) for (ll b = 1; b <= 6; b++) for (ll c = -6; c <= 6; c++) for (ll d = 1; d <= 6; d++) {
    long double p = (long double)a / b, q = (long double)c / d; bool eq = fabsl(p - q) < 1e-12L;
    CK((a * d == c * b) == eq); CK((a * d < c * b) == (!eq && p < q)); }
  { double x = 0.1 + 0.2, y = 0.3; CK(!(x == y)); CK(abs(x - y) < 1e-9); CK(!(x < y - 1e-9)); }
  { double x = 0.1, y = 0.2; CK(!(abs(x - y) < 1e-9)); CK(x < y - 1e-9); }
  { double x = 0.2, y = 0.1; CK(!(abs(x - y) < 1e-9)); CK(!(x < y - 1e-9)); }
}

static void t_counting() {
  SEC = "counting";
  for (ll l = -10; l <= 10; l++) for (ll r = l; r <= 10; r++) {
    ll c1 = 0, c2 = 0, c3 = 0, sum = 0;
    for (ll v = l; v <= r; v++) { c1++; sum += v; } for (ll v = l; v < r; v++) c2++; for (ll v = l + 1; v < r; v++) c3++;
    //#cnt_lr
    CK((r - l + 1) == c1); CK((r - l) == c2); if (l < r) CK((r - l - 1) == c3);
    //#sum_lr
    CK((l + r) * (r - l + 1) % 2 == 0); CK(((l + r) * (r - l + 1) / 2) == sum);
  }
  for (ll n = 1; n <= 30; n++) { ll g = 0; for (ll i = 1; i < n; i++) g++; CK((n - 1) == g); }
  for (ll k = 1; k <= 12; k++) {
    for (ll n = 0; n <= 100; n++) { ll c = 0; for (ll v = 1; v <= n; v++) if (bMult(v, k)) c++;
      //#mult_1n
      CK((n / k) == c); }
    for (ll l = 1; l <= 40; l++) for (ll r = l; r <= 40; r++) {
      ll c = 0; for (ll v = l; v <= r; v++) if (bMult(v, k)) c++;
      CK((r / k - (l - 1) / k) == c);
      ll f = l; while (!bMult(f, k)) f++; ll la = r; while (!bMult(la, k)) la--;
      CK(((l + k - 1) / k * k) == f); CK((r / k * k) == la);
    }
  }
  for (ll n = 0; n <= 150; n++) for (ll a = 1; a <= 10; a++) for (ll b = 1; b <= 10; b++) {
    ll both = 0, either = 0, none = 0;
    for (ll v = 1; v <= n; v++) { bool p = bMult(v, a), q = bMult(v, b); both += p && q; either += p || q; none += !p && !q; }
    CK((n / lcm(a, b)) == both); CK((n / a + n / b - n / lcm(a, b)) == either); CK((n - n / a - n / b + n / lcm(a, b)) == none);
  }
  for (ll n = 0; n <= 45; n++) {
    ll pr = 0, op = 0, le = 0, tr = 0, sub = 0;
    for (ll i = 0; i < n; i++) for (ll j = 0; j < n; j++) { if (i < j) pr++; if (i != j) op++; if (i <= j) le++; }
    for (ll i = 0; i < n; i++) for (ll j = i + 1; j < n; j++) for (ll k = j + 1; k < n; k++) tr++;
    for (ll l = 0; l < n; l++) for (ll r = l; r < n; r++) sub++;
    //#pairs_f //#opairs_f //#triples_f //#ncr_pairs
    CK((n * (n - 1) / 2) == pr); CK((n * (n - 1)) == op); CK((n * (n + 1) / 2) == le); CK((n * (n - 1) * (n - 2) / 6) == tr); CK((n * (n - 1) / 2) == pr); CK((n * (n + 1) / 2) == sub);
    for (ll m = 0; m <= 6; m++) { ll c = 0; for (ll i = 0; i < n; i++) for (ll j = 0; j < m; j++) c++; CK((n * m) == c); }
    for (ll k = 1; k <= n; k++) { ll w = 0, last = -1; for (ll st = 0; st + k <= n; st++) { w++; last = st; } CK((n - k + 1) == w); CK((n - k) == last);
      for (ll m = k; m <= 8; m++) { ll sq = 0; for (ll i = 0; i + k <= n; i++) for (ll j = 0; j + k <= m; j++) sq++; CK(((n - k + 1) * (m - k + 1)) == sq); } }
  }
  { ll n = 100000; CK((n * (n - 1) / 2) == 4999950000LL); }
  { ll n = 2000000; CK((i128)(n * (n - 1) * (n - 2) / 6) == (i128)n * (n - 1) * (n - 2) / 6); }
  for (int n = 0; n <= 20; n++) { ll c = 0; for (int mask = 0; mask < (1 << n); mask++) c++;
    //#subsets_f //#ncr_subsets
    CK((1LL << n) == c); }
  for (ll n = 0; n <= 300; n++) {
    ll s1 = 0, so = 0, se = 0, sq = 0, sc = 0;
    for (ll v = 1; v <= n; v++) { s1 += v; so += 2 * v - 1; se += 2 * v; sq += v * v; sc += v * v * v; }
    //#sum_1n
    CK(s1 == n * (n + 1) / 2); CK((n * (n + 1) / 2) == s1);
    //#sum_odd
    CK(so == n * n);
    //#sum_even
    CK(se == n * (n + 1));
    //#sum_sq
    CK(n * (n + 1) * (2 * n + 1) % 6 == 0 && sq == n * (n + 1) * (2 * n + 1) / 6); CK((n * (n + 1) * (2 * n + 1) / 6) == sq);
    //#sum_cube
    CK(n * n * (n + 1) * (n + 1) % 4 == 0 && sc == n * n * (n + 1) * (n + 1) / 4);
  }
  { ll n = 1000000000; CK((n * (n + 1) / 2) == 500000000500000000LL); }
  { ll n = 1000000; CK((i128)(n * (n + 1) * (2 * n + 1) / 6) == (i128)n * (n + 1) * (2 * n + 1) / 6); }
  for (ll a = -5; a <= 5; a++) for (ll d = -4; d <= 4; d++) for (ll terms = 1; terms <= 12; terms++) {
    vector<ll> t; ll sum = 0; for (ll i = 0; i < terms; i++) { t.push_back(a + i * d); sum += t.back(); }
    //#ap_kth
    for (ll k = 1; k <= terms; k++) CK(t[k - 1] == a + (k - 1) * d);
    ll first = t[0], last = t.back(), cnt = terms;
    //#ap_cnt
    if (d != 0) CK((last - first) % d == 0 && (last - first) / d + 1 == terms);
    //#ap_sum
    CK(terms * (first + last) % 2 == 0 && sum == terms * (first + last) / 2);
    CK((cnt * (first + last) / 2) == sum);
  }
  { ll s = 0, p = 1; for (int k = 0; k <= 61; k++) { s += p;
      //#geo_2
      CK(s == 2 * p - 1); CK(((1LL << (k + 1)) - 1) == s); p *= 2; } }
  for (ll r = 2; r <= 7; r++) { ll s = 0, p = 1; for (int k = 0; k <= 12; k++) { s += p; p *= r;
      //#geo_r
      CK((p - 1) % (r - 1) == 0 && s == (p - 1) / (r - 1)); } }
  for (int it = 0; it < 300; it++) { vector<ll> a(rnd(0, 9)); for (auto &v : a) v = rnd(-9, 9);
    int cnt = 0;
for (long long x : a) cnt += (x % 2 == 0);
    int w = 0; for (ll v : a) if (bEven(v)) w++; CK(cnt == w); }
}

// Harness part 2: characters, strings, arrays, grids, powers, time, geometry, output, safety.
static const string LOW = "abcdefghijklmnopqrstuvwxyz", UPP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", DIG = "0123456789";
static bool has(const string &s, char c) { return s.find(c) != string::npos; }
namespace g_isVowel {
bool isVowel(char c) {
    string v = "aeiou";
    return v.find(c) != string::npos;
}
}
static void t_chars() {
  SEC = "chars";
  for (int v = 0; v < 128; v++) {
    char c = (char)v; bool lo = has(LOW, c) && v, up = has(UPP, c) && v, dg = has(DIG, c) && v;
    CK(((isalpha(c)) != 0) == (lo || up)); CK(((isdigit(c)) != 0) == dg); CK(((islower(c)) != 0) == lo); CK(((isupper(c)) != 0) == up);
    CK(((isalnum(c)) != 0) == (lo || up || dg));
    CK(('a' <= c && c <= 'z') == lo); CK(('A' <= c && c <= 'Z') == up); CK(('0' <= c && c <= '9') == dg);
    char wantUp = lo ? UPP[LOW.find(c)] : c, wantLo = up ? LOW[UPP.find(c)] : c;
    CK((char(toupper(c))) == wantUp); CK((char(tolower(c))) == wantLo); CK(sizeof(char(toupper(c))) == 1); CK(sizeof(toupper(c)) == sizeof(int));
    if (lo) CK((char(c - 'a' + 'A')) == wantUp); if (up) CK((char(c - 'A' + 'a')) == wantLo);
    CK(((int)c) == v);
  }
  CK(isalpha('a') != 1 || true);  // may be any non-zero value: documented in the tip
  for (int i = 0; i < 26; i++) {
    char c = LOW[i];
    CK((c - 'a') == i); CK((char('a' + i)) == c); CK(sizeof(char('a' + i)) == 1);
    CK((char('a' + (c - 'a' + 1) % 26)) == LOW[i == 25 ? 0 : i + 1]);
    int p = i; for (int k = 0; k <= 100; k++) { CK((char('a' + (c - 'a' + k) % 26)) == LOW[p]); CK((char('a' + ((c - 'a' + k) % 26 + 26) % 26)) == LOW[p]); p++; if (p == 26) p = 0; }
    p = i; for (int k = 0; k >= -100; k--) { CK((char('a' + ((c - 'a' + k) % 26 + 26) % 26)) == LOW[p]); p--; if (p < 0) p = 25; }
    CK(g_isVowel::isVowel(c) == (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u'));
    for (int j = 0; j < 26; j++) { char c1 = LOW[i], c2 = LOW[j]; CK((abs(c1 - c2)) == (i > j ? i - j : j - i)); }
  }
  CK(((int)'A') == 65); CK(((int)'a') == 97); CK(((int)'0') == 48); CK(((int)' ') == 32);
}

namespace g_isPalindrome {
bool isPalindrome(const string &s) {
    int n = s.size();
    for (int i = 0; i < n / 2; i++)
        if (s[i] != s[n - 1 - i])
            return false;
    return true;
}
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
  { string s = "hello"; CK(((int)s.size()) == 5); CK((is_same<decltype((int)s.size()), int>::value)); CK((s[0]) == 'h'); CK((s.back()) == 'o'); CK(!(s.empty()));
    char c = '!'; string t = "ab"; s += c; CK(s == "hello!"); s += t; CK(s == "hello!ab"); s.pop_back(); CK(s == "hello!a");
    CK((s + t) == "hello!aab"); int n = 3; CK((string(n, 'a')) == "aaa"); n = 0; CK((string(n, 'a')) == ""); }
  { string s; CK(s.empty()); CK(((int)s.size()) == 0); }
  vector<string> all = allStrings(7, "ab"), small = allStrings(4, "abc");
  for (const string &orig : all) {
    string manual; for (int i = (int)orig.size() - 1; i >= 0; i--) manual += orig[i];
    { string s = orig; reverse(s.begin(), s.end());     // changes s
string t(s.rbegin(), s.rend());  // a copy
      CK(s == manual); CK(t == orig); }
    CK(g_isPalindrome::isPalindrome(orig) == (orig == manual));
    { string s = orig; int cnt = 0; set<char> ds; for (char ch : s) { if (ch == 'a') cnt++; ds.insert(ch); }
      CK((count(s.begin(), s.end(), 'a')) == cnt); CK((set<char>(s.begin(), s.end()).size()) == ds.size()); }
    { string s = orig; int n = s.size(), same = 0;
for (int i = 0; i + 1 < n; i++)
    if (s[i] == s[i + 1]) same++;
      int w = 0; for (size_t i = 1; i < s.size(); i++) if (s[i - 1] == s[i]) w++; CK(same == w); CK(n == (int)s.size()); }
  }
  for (const string &s : small) for (const string &t : small) {
    bool eq = s.size() == t.size(); if (eq) for (size_t i = 0; i < s.size(); i++) if (s[i] != t[i]) eq = false;
    CK((s == t) == eq); CK((s < t) == bLess(s, t)); CK((min(s, t)) == (bLess(t, s) ? t : s));
    size_t pos = string::npos;
    for (size_t i = 0; i + t.size() <= s.size() && pos == string::npos; i++) { bool ok = true; for (size_t j = 0; j < t.size(); j++) if (s[i + j] != t[j]) ok = false; if (ok) pos = i; }
    CK((s.find(t) != string::npos) == (pos != string::npos)); CK((s.find(t)) == pos); CK((s.substr(0, t.size()) == t) == (pos == 0));
    { string s1 = s, t1 = t; string s = s1, t = t1;
      sort(s.begin(), s.end());
sort(t.begin(), t.end());
bool sameLetters = (s == t);
      int f[128] = {}; for (char ch : s1) f[(int)ch]++; for (char ch : t1) f[(int)ch]--; bool w = true; for (int v : f) if (v) w = false;
      CK(sameLetters == w); CK(is_sorted(s.begin(), s.end()) && s.size() == s1.size()); }
  }
  { string s = "10", t = "9"; CK(s < t); }
  for (const string &s : {string("abcdefgh"), string("x"), string("hello world")}) {
    int n = s.size();
    for (int pos = 0; pos <= n; pos++) {
      string w2; for (int i = pos; i < n; i++) w2 += s[i]; CK((s.substr(pos)) == w2);
      for (int len = 0; len <= n + 2; len++) { string w; for (int i = pos; i < n && i < pos + len; i++) w += s[i]; CK((s.substr(pos, len)) == w); }
    }
    for (int k = 0; k <= n; k++) { string f, l; for (int i = 0; i < k; i++) f += s[i]; for (int i = n - k; i < n; i++) l += s[i]; CK((s.substr(0, k)) == f); CK((s.substr(s.size() - k)) == l); }
  }
  { string s = "hello"; int w[26] = {}; w['h' - 'a'] = 1; w['e' - 'a'] = 1; w['l' - 'a'] = 2; w['o' - 'a'] = 1;
    int cnt[26] = {};
for (char c : s) cnt[c - 'a']++;
    for (int i = 0; i < 26; i++) CK(cnt[i] == w[i]); }
  { string s = "aBc1z Z"; for (char &c : s) c = toupper(c);
    CK(s == "ABC1Z Z"); }
  { In in("3\nhello world  x\nnext\n"); int n; cin >> n;
cin.ignore();  // skip the end of line 1
string line; getline(cin, line);
    CK(n == 3); CK(line == "hello world  x"); }
  { string line = "  ab  cd e "; stringstream ss(line);
string word; vector<string> words;
while (ss >> word) words.push_back(word);
    CK(words == vector<string>({"ab", "cd", "e"})); }
  { string line = ""; stringstream ss(line);
string word; vector<string> words;
while (ss >> word) words.push_back(word);
    CK(words.empty()); }
  { string s = "xaxxbx"; s.erase(remove(s.begin(), s.end(), 'x'),
        s.end());
    CK(s == "ab"); }
  { string s = "abc"; s.erase(remove(s.begin(), s.end(), 'x'),
        s.end());
    CK(s == "abc"); }
}

static void t_arrays() {
  SEC = "arrays";
  { In in("3\n5 -2 7000000000\n"); int n; cin >> n;
vector<long long> a(n);
for (auto &x : a) cin >> x;
    CK(n == 3 && a == vector<ll>({5, -2, 7000000000LL})); }
  { In in("3\n5 -2 7000000000\n"); int n; cin >> n;
vector<long long> a(n + 1);
for (int i = 1; i <= n; i++) cin >> a[i];
    CK(n == 3 && a.size() == 4 && a[1] == 5 && a[2] == -2 && a[3] == 7000000000LL); }
  { vector<ll> a(5, 1000000000); long long sum = 0;
for (long long x : a) sum += x;
long long same =
    accumulate(a.begin(), a.end(), 0LL);
    CK(sum == 5000000000LL && same == sum); }
  { vector<int> a(5, 1000000000); CK(accumulate(a.begin(), a.end(), 0LL) == 5000000000LL); }
  for (int it = 0; it < 4000; it++) {
    int n = rnd(1, 9); vector<ll> a(n); for (auto &v : a) v = rnd(-4, 4); const vector<ll> orig = a;
    ll bmx = orig[0], bmn = orig[0]; for (ll v : orig) { if (v > bmx) bmx = v; if (v < bmn) bmn = v; }
    int fmx = -1, fmn = -1; for (int i = n - 1; i >= 0; i--) { if (orig[i] == bmx) fmx = i; if (orig[i] == bmn) fmn = i; }
    { long long sum = 0;
for (long long x : a) sum += x;
long long same =
    accumulate(a.begin(), a.end(), 0LL);
      i128 w = 0; for (ll v : a) w += v; CK(sum == (ll)w && same == sum); }
    { int pos = 0;
for (int i = 1; i < n; i++)
    if (a[i] > a[pos]) pos = i;
      CK(pos == fmx); }
    { auto it = max_element(a.begin(), a.end());
long long mx = *it;
int imx = it - a.begin();
auto jt = min_element(a.begin(), a.end());
long long mn = *jt;
int imn = jt - a.begin();
      CK(mx == bmx && mn == bmn && imx == fmx && imn == fmn); }
    { ll x = rnd(-4, 4); int c = 0, fi = n; for (int i = n - 1; i >= 0; i--) if (a[i] == x) { c++; fi = i; }
      CK((count(a.begin(), a.end(), x)) == c); CK((find(a.begin(), a.end(), x) != a.end()) == (c > 0)); CK((find(a.begin(), a.end(), x) - a.begin()) == fi);
      { int pos = -1;
for (int i = 0; i < n; i++)
    if (a[i] > x) { pos = i; break; }
        int w = -1; for (int i = n - 1; i >= 0; i--) if (a[i] > x) w = i; CK(pos == w); } }
    { bool all = true, any = false;
for (long long x : a) {
    if (x > 0) any = true;
    else all = false;
}
      int pos = 0; for (ll v : a) if (v > 0) pos++; CK(all == (pos == n) && any == (pos > 0)); }
    { vector<ll> b; for (int i = n - 1; i >= 0; i--)
    b.push_back(a[i]);
      CK((int)b.size() == n); for (int i = 0; i < n; i++) CK(b[i] == orig[n - 1 - i]); }
    { reverse(a.begin(), a.end()); for (int i = 0; i < n; i++) CK(a[i] == orig[n - 1 - i]); a = orig; }
    for (int k = 0; k <= n; k++) {
      rotate(a.begin(), a.begin() + k, a.end()); for (int i = 0; i < n; i++) CK(a[i] == orig[(i + k) % n]); a = orig;
      rotate(a.begin(), a.end() - k, a.end()); for (int i = 0; i < n; i++) CK(a[(i + k) % n] == orig[i]); a = orig;
    }
    { bool sorted = true;
for (int i = 0; i + 1 < n; i++)
    if (a[i] > a[i + 1]) sorted = false;
bool same = is_sorted(a.begin(), a.end());
      bool w = true; for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) if (a[i] > a[j]) w = false; CK(sorted == w && same == w); }
    { set<long long> st(a.begin(), a.end());
int different = st.size();
bool allEqual = (st.size() == 1);
bool allDifferent = (st.size() == a.size());
      bool eq = true, df = true; for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) { if (a[i] != a[j]) eq = false; else df = false; }
      vector<ll> u; for (ll v : a) { bool seen = false; for (ll q : u) if (q == v) seen = true; if (!seen) u.push_back(v); }
      CK(allEqual == eq && allDifferent == df && different == (int)u.size()); }
    { sort(a.begin(), a.end());
auto last = unique(a.begin(), a.end());
a.erase(last, a.end());
      vector<ll> u; for (ll v = -4; v <= 4; v++) { bool in = false; for (ll q : orig) if (q == v) in = true; if (in) u.push_back(v); } CK(a == u); a = orig; }
    { vector<ll> b = orig; sort(b.begin(), b.end(), greater<ll>());
      { long long m1 = LLONG_MIN, m2 = LLONG_MIN;
for (long long x : a) {
    if (x > m1) { m2 = m1; m1 = x; }
    else if (x > m2) m2 = x;
}
        CK(m1 == b[0] && m2 == (n > 1 ? b[1] : LLONG_MIN)); }
      { long long mx = LLONG_MIN;
long long second = LLONG_MIN;
for (long long x : a) {
    if (x > mx) { second = mx; mx = x; }
    else if (x < mx && x > second)
        second = x;
}
        ll w = LLONG_MIN; for (ll v : b) if (v < b[0]) { w = v; break; } CK(mx == b[0] && second == w); } }
    { vector<long long> pm(n), sm(n);
pm[0] = a[0];
for (int i = 1; i < n; i++)
    pm[i] = max(pm[i - 1], a[i]);
sm[n - 1] = a[n - 1];
for (int i = n - 2; i >= 0; i--)
    sm[i] = max(sm[i + 1], a[i]);
      for (int i = 0; i < n; i++) { ll p = a[0], s = a[n - 1]; for (int j = 0; j <= i; j++) p = max(p, a[j]); for (int j = i; j < n; j++) s = max(s, a[j]); CK(pm[i] == p && sm[i] == s); } }
    { ll target = rnd(-8, 8); int cnt = 0;
      for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++)
        if (a[i] + a[j] == target) cnt++;
      int w = 0; for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) if (i < j && a[i] + a[j] == target) w++; CK(cnt == w); }
    { vector<pair<long long, int>> v(n);
for (int i = 0; i < n; i++)
    v[i] = {a[i], i};
sort(v.begin(), v.end());
// v[0] = (smallest value, its old index)
      vector<int> seen(n, 0); for (int i = 0; i < n; i++) { CK(v[i].first == a[v[i].second]); seen[v[i].second]++; if (i) CK(v[i - 1].first <= v[i].first); }
      for (int i = 0; i < n; i++) CK(seen[i] == 1); }
    { sort(a.begin(), a.end()); CK((a[0]) == bmn); CK((a.back()) == bmx);
      int below = 0, above = 0; ll med = a[n / 2]; for (ll v : a) { below += v < med; above += v > med; } CK(below <= n / 2 && above <= n / 2);
      CK((a[(n - 1) / 2]) <= med); if (n % 2 == 1) CK((a[(n - 1) / 2]) == med); a = orig; }
  }
  { vector<ll> a = {1, 2, 3, 4}; int n = 4; CK((a[n / 2]) == 3 && (a[(n - 1) / 2]) == 2); }
  { int n = 4; vector<int> a(n, 5); CK(a == vector<int>({5, 5, 5, 5})); fill(a.begin(), a.end(), 0); CK(a == vector<int>({0, 0, 0, 0})); iota(a.begin(), a.end(), 0); CK(a == vector<int>({0, 1, 2, 3})); }
  { vector<ll> a; int n = 0; bool sorted = true;
for (int i = 0; i + 1 < n; i++)
    if (a[i] > a[i + 1]) sorted = false;
bool same = is_sorted(a.begin(), a.end());
    CK(sorted && same); }
  { vector<ll> a, b; int n = 0; bool all = true, any = false;
for (long long x : a) {
    if (x > 0) any = true;
    else all = false;
}
    CK(all && !any); for (int i = n - 1; i >= 0; i--)
    b.push_back(a[i]);
    CK(b.empty()); }
  { In in("1 2 3\n4 5 6\n"); int n = 2, m = 3; vector<vector<int>> g(n, vector<int>(m, 0));
for (int r = 0; r < n; r++)
    for (int c = 0; c < m; c++)
        cin >> g[r][c];
    CK(g == vector<vector<int>>({{1, 2, 3}, {4, 5, 6}})); }
  { In in("2 3\n.#.\n##.\n"); int n, m; cin >> n >> m;
vector<string> g(n);
for (auto &row : g) cin >> row;
    CK(n == 2 && m == 3 && g[0] == ".#." && g[1][0] == '#' && g[1][2] == '.'); }
}

static void t_grids() {
  SEC = "grids";
  for (int n = 1; n <= 5; n++) for (int m = 1; m <= 5; m++) {
    set<pair<int,int>> cells; { int id = 0; for (int r = 0; r < n; r++) for (int c = 0; c < m; c++) { cells.insert({r, c});
      CK((r * m + c) == id); CK((id / m) == r); CK((id % m) == c); { int r1 = r + 1, c1 = c + 1; int r = r1, c = c1; CK(((r - 1) * m + c) == id + 1); } id++; } }
    for (int r = -3; r <= n + 2; r++) for (int c = -3; c <= m + 2; c++) {
      CK((0 <= r && r < n && 0 <= c && c < m) == (cells.count({r, c}) > 0)); CK((1 <= r && r <= n && 1 <= c && c <= m) == (cells.count({r - 1, c - 1}) > 0));
    }
    vector<vector<ll>> g(n, vector<ll>(m)); for (int r = 0; r < n; r++) for (int c = 0; c < m; c++) g[r][c] = 1LL << (r * m + c);
    for (int r = 0; r < n; r++) for (int c = 0; c < m; c++) {
      ll sum = 0, want = 0; int out4 = 0;
      for (auto [rr, cc] : cells) if ((rr == r && (cc == c - 1 || cc == c + 1)) || (cc == c && (rr == r - 1 || rr == r + 1))) want += g[rr][cc];
      for (auto [pr, pc] : vector<pair<int,int>>{{r - 1, c}, {r + 1, c}, {r, c - 1}, {r, c + 1}}) if (!cells.count({pr, pc})) out4++;
      int dr[4] = {1, -1, 0, 0};
int dc[4] = {0, 0, 1, -1};
for (int d = 0; d < 4; d++) {
    int nr = r + dr[d], nc = c + dc[d];
    if (nr < 0 || nr >= n) continue;
    if (nc < 0 || nc >= m) continue;
    sum += g[nr][nc];   // a neighbour
}
      CK(sum == want);
      CK((r == 0 || c == 0 || r == n - 1 || c == m - 1) == (out4 > 0));
      CK(((r == 0 || r == n - 1) && (c == 0 || c == m - 1)) == ((r == 0 && c == 0) || (r == 0 && c == m - 1) || (r == n - 1 && c == 0) || (r == n - 1 && c == m - 1)));
    }
    { vector<vector<int>> g(n, vector<int>(m)); for (auto &row : g) for (auto &v : row) v = rnd(-9, 9);
      vector<long long> rowSum(n), colSum(m);
for (int r = 0; r < n; r++)
    for (int c = 0; c < m; c++) {
        rowSum[r] += g[r][c];
        colSum[c] += g[r][c];
    }
      for (int r = 0; r < n; r++) { ll s = 0; for (int c = 0; c < m; c++) s += g[r][c]; CK(rowSum[r] == s); }
      for (int c = 0; c < m; c++) { ll s = 0; for (int r = 0; r < n; r++) s += g[r][c]; CK(colSum[c] == s); } }
  }
  { int dr8[8] = {-1, -1, -1, 0, 0, 1, 1, 1};
int dc8[8] = {-1, 0, 1, -1, 1, -1, 0, 1};
int kr[8] = {-2, -2, -1, -1, 1, 1, 2, 2};
int kc[8] = {-1, 1, -2, 2, -2, 2, -1, 1};
    set<pair<int,int>> a8, k8, w8, wk;
    for (int d = 0; d < 8; d++) { a8.insert({dr8[d], dc8[d]}); k8.insert({kr[d], kc[d]}); }
    for (int x = -2; x <= 2; x++) for (int y = -2; y <= 2; y++) { if (max(abs(x), abs(y)) == 1) w8.insert({x, y}); if (abs(x) + abs(y) == 3 && x && y) wk.insert({x, y}); }
    CK(a8 == w8 && a8.size() == 8); CK(k8 == wk && k8.size() == 8); }
  for (int d0 = 0; d0 < 4; d0++) {
    int r = 5, c = 5, d = d0;
    int dr[4] = {-1, 0, 1, 0};
int dc[4] = {0, 1, 0, -1};
r += dr[d]; c += dc[d];    // one step
    int wr[4] = {4, 5, 6, 5}, wc[4] = {5, 6, 5, 4};      // up, right, down, left of (5,5); row 0 is the top row
    CK(r == wr[d0] && c == wc[d0]);
    const char *name = "URDL"; char right[128], left[128], back[128]; right['U'] = 'R'; right['R'] = 'D'; right['D'] = 'L'; right['L'] = 'U';
    left['U'] = 'L'; left['L'] = 'D'; left['D'] = 'R'; left['R'] = 'U'; back['U'] = 'D'; back['D'] = 'U'; back['L'] = 'R'; back['R'] = 'L';
    d = d0; d = (d + 1) % 4; CK(name[d] == right[(int)name[d0]]);
    d = d0; d = (d + 3) % 4; CK(name[d] == left[(int)name[d0]]);
    d = d0; d = (d + 2) % 4; CK(name[d] == back[(int)name[d0]]);
  }
  for (int n = 1; n <= 6; n++) {
    set<pair<int,int>> md, ad; for (int i = 0; i < n; i++) { md.insert({i, i}); ad.insert({i, n - 1 - i}); }
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) { CK((r == c) == (md.count({r, c}) > 0)); CK((r + c == n - 1) == (ad.count({r, c}) > 0)); }
  }
  { const int N = 7; // distances by BFS on a 7x7 board, colours by BFS parity
    for (int r1 = 0; r1 < N; r1++) for (int c1 = 0; c1 < N; c1++) {
      vector<vector<int>> d4(N, vector<int>(N, -1)), d8 = d4;
      for (int mode = 0; mode < 2; mode++) { auto &dist = mode ? d8 : d4; queue<pair<int,int>> q; q.push({r1, c1}); dist[r1][c1] = 0;
        while (!q.empty()) { auto [r, c] = q.front(); q.pop();
          for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++) { if (!x && !y) continue; if (!mode && x && y) continue;
            int nr = r + x, nc = c + y; if (nr < 0 || nc < 0 || nr >= N || nc >= N || dist[nr][nc] >= 0) continue; dist[nr][nc] = dist[r][c] + 1; q.push({nr, nc}); } } }
      for (int r2 = 0; r2 < N; r2++) for (int c2 = 0; c2 < N; c2++) {
        CK((abs(r1 - r2) + abs(c1 - c2)) == d4[r2][c2]); CK((max(abs(r1 - r2), abs(c1 - c2))) == d8[r2][c2]);
        CK(((r1 + c1) % 2 == (r2 + c2) % 2) == (d4[r2][c2] % 2 == 0));
        bool sd = false, sa = false, rook = false, bishop = false;
        for (int t = -N; t <= N; t++) { if (r1 + t == r2 && c1 + t == c2) sd = true; if (r1 + t == r2 && c1 - t == c2) sa = true;
          if (t && ((r1 + t == r2 && c1 == c2) || (r1 == r2 && c1 + t == c2))) rook = true; }
        bishop = (sd || sa) && !(r1 == r2 && c1 == c2);
        CK((r1 - c1 == r2 - c2) == sd); CK((r1 + c1 == r2 + c2) == sa);
        if (r1 != r2 || c1 != c2) {
          CK((r1 == r2 || c1 == c2) == rook); CK((abs(r1 - r2) == abs(c1 - c2)) == bishop); CK((max(abs(r1 - r2), abs(c1 - c2)) == 1) == (d8[r2][c2] == 1));
          bool kn = false; for (int x : {-2, -1, 1, 2}) for (int y : {-2, -1, 1, 2}) if (abs(x) != abs(y) && r1 + x == r2 && c1 + y == c2) kn = true;
          CK((abs(r1 - r2) * abs(c1 - c2) == 2) == kn);
        }
      }
      { int r = r1, c = c1; vector<vector<int>> col(N, vector<int>(N)); for (int i = 0; i < N; i++) for (int j = 0; j < N; j++) col[i][j] = (i == 0 && j == 0) ? 0 : (j > 0 ? 1 - col[i][j - 1] : 1 - col[i - 1][j]);
        CK(((r + c) % 2) == col[r][c]); }
    } }
  { int n = 2; vector<vector<int>> a = {{1, 2}, {3, 4}}, b(2, vector<int>(2));
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) { b[c][n - 1 - r] = a[r][c]; } CK(b == vector<vector<int>>({{3, 1}, {4, 2}}));
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) { b[n - 1 - c][r] = a[r][c]; } CK(b == vector<vector<int>>({{2, 4}, {1, 3}}));
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) { b[c][r] = a[r][c]; } CK(b == vector<vector<int>>({{1, 3}, {2, 4}})); }
  for (int n = 1; n <= 5; n++) { vector<vector<int>> a(n, vector<int>(n)), b = a, b2 = a, b3 = a; int v = 0; for (auto &row : a) for (auto &x : row) x = v++;
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) { b[c][n - 1 - r] = a[r][c]; }
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) CK(b[i][j] == a[n - 1 - j][i]);       // clockwise: first row becomes last column
    for (int j = 0; j < n; j++) CK(b[j][n - 1] == a[0][j]);
    b2 = b; { vector<vector<int>> a = b2, b = b3; for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) { b[n - 1 - c][r] = a[r][c]; } b3 = b; }
    CK(b3 == a); }
}

namespace g_isqrt {
long long isqrt(long long n) {
    long long r = sqrtl(n);
    while (r > 0 && r > n / r) r--;
    while (r + 1 <= n / (r + 1)) r++;
    return r;
}
}
using g_isqrt::isqrt;
namespace g_ipow {
long long ipow(long long a, int b) {
    long long r = 1;
    for (int i = 0; i < b; i++) r *= a;
    return r;
}
}
static void t_powers() {
  SEC = "powers";
  { ll root = 0; for (ll n = 0; n <= 200000; n++) { if ((root + 1) * (root + 1) <= n) root++; CK(isqrt(n) == root);
      if (n <= 3000) { long long r = isqrt(n);
bool square = (r * r == n);
        CK(square == (root * root == n)); CK(r == root); CK((isqrt(n)) == root); } } }
  { vector<ll> ns = {LLONG_MAX, LLONG_MAX - 1, 1000000000000000000LL, 999999999999999999LL, 4000000000000000000LL, 9000000000000000000LL};
    for (ll k : {3037000499LL, 3037000498LL, 1000000000LL, 999999999LL, 2147483647LL, 2147483648LL, 94906265LL, 94906266LL, 94906267LL, 67108865LL}) { ns.push_back(k * k); ns.push_back(k * k - 1); ns.push_back(k * k + 1); }
    for (int i = 0; i < 20000; i++) ns.push_back(rnd(0, LLONG_MAX));
    for (int i = 0; i < 20000; i++) { ll k = rnd(1, 3037000499LL); ns.push_back(k * k); ns.push_back(k * k - 1); }
    for (ll n : ns) { i128 r = isqrt(n); CK(r >= 0 && r * r <= n && (r + 1) * (r + 1) > n); } }
  for (ll l = 1; l <= 70; l++) for (ll r = l; r <= 70; r++) { ll c = 0; for (ll v = l; v <= r; v++) for (ll q = 1; q <= v; q++) if (q * q == v) c++; CK((isqrt(r) - isqrt(l - 1)) == c); }
  //#sq_1n
  { ll x = 100000; CK((x * x) == 10000000000LL); x = 1000000; CK((x * x * x) == 1000000000000000000LL); x = -3; CK((x * x) == 9 && (x * x * x) == -27); }
  for (ll n : {0LL, 1LL, 2LL, 15LL, 16LL, 17LL, 1000000LL, 999999999999LL}) { ll cnt = 0; for (long long i = 1; i * i <= n; i++) cnt++; CK(cnt == isqrt(n)); }
  { ll p = 1; for (int k = 0; k <= 62; k++) {
      //#pow2_shift
      CK((1LL << k) == p); CK((1LL << k) == p);
      { ll x = 5; if (k <= 60) CK((x << k) == 5 * p); } { ll x = 1000000000000000000LL; CK((x >> k) == x / p); }
      if (k < 62) p *= 2; } }
  { set<ll> pw; for (int k = 0; k <= 62; k++) pw.insert(1LL << k);
    vector<ll> xs = BIGS; for (ll x = -10; x <= 5000; x++) xs.push_back(x); for (ll p : pw) { xs.push_back(p); xs.push_back(p - 1); xs.push_back(p + 1); }
    for (ll x : xs) { CK((x > 0 && (x & (x - 1)) == 0) == (pw.count(x) > 0));
      if (x > 0) { int lg = 0; while (lg < 62 && (1LL << (lg + 1)) <= x) lg++;
        //#lg_floor
        CK((__lg(x)) == lg); CK((__lg(x) + 1) == lg + 1); CK((1LL << __lg(x)) == (1LL << lg)); }
      if (x <= 4000000000000000000LL) { long long p = 1;
while (p < x) p *= 2;
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
bool isLeap(int y) {
    if (y % 400 == 0) return true;
    if (y % 100 == 0) return false;
    return y % 4 == 0;
}
}
using g_isLeap::isLeap;
static ll dayNumber(int y, int mon, int day) { struct tm t = {}; t.tm_year = y - 1900; t.tm_mon = mon - 1; t.tm_mday = day; return (ll)timegm(&t) / 86400; }
static void t_time() {
  SEC = "time";
  { int h = 0, m = 0, s = 0; for (ll t = 0; t <= 200000; t++) {
      CK((t / 3600) == h && (t % 3600 / 60) == m && (t % 60) == s); CK((h * 3600 + m * 60 + s) == t);
      s++; if (s == 60) { s = 0; m++; } if (m == 60) { m = 0; h++; } } }
  { int t = 0; for (int h = 0; h < 24; h++) for (int m = 0; m < 60; m++) {
      CK((h * 60 + m) == t); CK((t / 60) == h && (t % 60) == m);
      int hh = h, mm = m; for (int k = 0; k <= 3000; k += 7) { int cur = hh * 60 + mm; if (k) for (int i = 0; i < 7; i++) { mm++; if (mm == 60) { mm = 0; hh++; } if (hh == 24) hh = 0; } cur = hh * 60 + mm; CK(((t + k) % 1440) == cur); }
      t++; } }
  for (int t1 = 0; t1 < 1440; t1 += 13) for (int t2 = 0; t2 < 1440; t2 += 11) { int steps = 0, p = t1; while (p != t2) { p++; if (p == 1440) p = 0; steps++; } CK((((t2 - t1) % 1440 + 1440) % 1440) == steps); }
  for (const char *tc : {"09:05", "23:59", "00:00", "7:5", "12:30"}) { int wh, wm; sscanf(tc, "%d:%d", &wh, &wm); char buf[16]; snprintf(buf, sizeof buf, "%02d:%02d\n", wh, wm);
    In in(string(tc) + "\n"); Cap cap;
    int h, m; char colon;
cin >> h >> colon >> m;
cout << setfill('0') << setw(2) << h << ":"
     << setw(2) << m << "\n";
    CK(h == wh && m == wm && colon == ':'); CK(cap.str() == buf); }
  for (int d = 0; d < 7; d++) { int f = d, b = d; for (int k = 0; k <= 60; k++) { CK(((d + k) % 7) == f); CK((((d - k) % 7 + 7) % 7) == b); f++; if (f == 7) f = 0; b--; if (b < 0) b = 6; } }
  { int w = 0, rest = 0; for (int days = 0; days <= 500; days++) { CK((days / 7) == w && (days % 7) == rest); rest++; if (rest == 7) { rest = 0; w++; } } }
  { int shown = 12; for (int h = 0; h < 24; h++) { CK((h % 12 == 0 ? 12 : h % 12) == shown); CK((h >= 12) == (h == 12 || h > 12)); shown++; if (shown == 13) shown = 1; } }
  for (int y = 1600; y <= 2800; y++) {
    bool leap = dayNumber(y + 1, 1, 1) - dayNumber(y, 1, 1) == 366;
    CK(isLeap(y) == leap);
    int days[13] = {0, 31, 28, 31, 30, 31, 30,
                31, 31, 30, 31, 30, 31};
if (isLeap(y)) days[2] = 29;
    for (int mo = 1; mo <= 12; mo++) CK(days[mo] == (mo == 12 ? dayNumber(y + 1, 1, 1) : dayNumber(y, mo + 1, 1)) - dayNumber(y, mo, 1));
  }
  CK(!isLeap(1900) && isLeap(2000) && isLeap(2024) && !isLeap(2023) && !isLeap(2100));
  for (ll k = 1; k <= 100; k += 9) { ll big = 0, small = 0; for (ll x = 0; x <= 1000; x++) { CK((x / k) == big && (x % k) == small); CK((big * k + small) == x); small++; if (small == k) { small = 0; big++; } } }
  for (ll x = 0; x <= 400; x++) for (ll p = 0; p <= 100; p++) CK((x * p / 100) == (ll)floorl((long double)x * p / 100 + 1e-9));
}

namespace g_dist2 {
long long dist2(long long x1, long long y1,
        long long x2, long long y2) {
    long long dx = x1 - x2, dy = y1 - y2;
    return dx * dx + dy * dy;
}
}
namespace g_cross {
long long cross(long long ax, long long ay,
        long long bx, long long by,
        long long cx, long long cy) {
    return (bx - ax) * (cy - ay)
         - (by - ay) * (cx - ax);
}
}
using g_dist2::dist2; using g_cross::cross;
static void t_geometry() {
  SEC = "geometry";
  const double PIv = 3.14159265358979323846;
  for (ll x1 = -4; x1 <= 4; x1++) for (ll y1 = -4; y1 <= 4; y1++) for (ll x2 = -4; x2 <= 4; x2++) for (ll y2 = -4; y2 <= 4; y2++) {
    double h = hypot((double)(x1 - x2), (double)(y1 - y2));
    CK(dist2(x1, y1, x2, y2) == llround(h * h)); CK(fabs((sqrt((double)dist2(x1, y1, x2, y2))) - h) < 1e-9);
    ll pts = 0; for (ll x = -4; x <= 4; x++) for (ll y = -4; y <= 4; y++) {       // lattice points on the segment: distances add up exactly
      double d = hypot((double)(x - x1), (double)(y - y1)) + hypot((double)(x - x2), (double)(y - y2)); if (fabs(d - h) < 1e-9) pts++; }
    CK((gcd(abs(x1 - x2), abs(y1 - y2)) + 1) == pts);
  }
  { ll x1 = 0, y1 = 0, x2 = 3, y2 = 4; CK((sqrt((double)dist2(x1, y1, x2, y2))) == 5.0); CK(dist2(-1000000000, -1000000000, 1000000000, 1000000000) == 8000000000000000000LL); }
  for (ll ax = -3; ax <= 3; ax++) for (ll ay = -3; ay <= 3; ay++) for (ll bx = -3; bx <= 3; bx++) for (ll by = -3; by <= 3; by++)
    for (ll cx = -3; cx <= 3; cx++) for (ll cy = -3; cy <= 3; cy++) {
      ll cr = cross(ax, ay, bx, by, cx, cy);
      double A = hypot((double)(bx - cx), (double)(by - cy)), B = hypot((double)(ax - cx), (double)(ay - cy)), C = hypot((double)(ax - bx), (double)(ay - by)), s = (A + B + C) / 2;
      double heron = sqrt(max(0.0, s * (s - A) * (s - B) * (s - C)));          // area from the three side lengths
      CK(fabs((double)(abs(cross(ax, ay, bx, by, cx, cy))) - 2 * heron) < 1e-6); CK(fabs((abs(cross(ax, ay, bx, by, cx, cy)) / 2.0) - heron) < 1e-6); CK((cross(ax, ay, bx, by, cx, cy) == 0) == (heron < 1e-4));
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
    bool tri = a + b > c && a + c > b && b + c > a; CK((a + b > c) == tri);
    if (tri) { double s = (a + b + c) / 2.0, area = sqrt(s * (s - a) * (s - b) * (s - c)); CK((a * a + b * b == c * c) == (fabs(area - a * b / 2.0) < 1e-7)); }
  }
  { ll a = 3, b = 4, c = 5; CK(a * a + b * b == c * c); a = 5; b = 12; c = 13; CK(a * a + b * b == c * c); a = 2; b = 3; c = 4; CK(!(a * a + b * b == c * c)); }
  for (ll x1 = 0; x1 <= 4; x1++) for (ll y1 = 0; y1 <= 4; y1++) for (ll x2 = x1; x2 <= 4; x2++) for (ll y2 = y1; y2 <= 4; y2++) {
    ll cells = 0, edges = 0;
    for (ll x = -1; x <= 5; x++) for (ll y = -1; y <= 5; y++) {
      if (x1 <= x && x + 1 <= x2 && y1 <= y && y + 1 <= y2) cells++;
      bool in = false; for (ll px = x1; px <= x2; px++) for (ll py = y1; py <= y2; py++) if (px == x && py == y) in = true;
      CK((x1 <= x && x <= x2 && y1 <= y && y <= y2) == in);
    }
    for (ll x = x1; x < x2; x++) edges += 2; for (ll y = y1; y < y2; y++) edges += 2;
    CK(((x2 - x1) * (y2 - y1)) == cells); CK((2 * ((x2 - x1) + (y2 - y1))) == edges);
  }
  for (int it = 0; it < 30000; it++) {
    ll ax1 = rnd(0, 6), ax2 = rnd(ax1, 6), ay1 = rnd(0, 6), ay2 = rnd(ay1, 6), bx1 = rnd(0, 6), bx2 = rnd(bx1, 6), by1 = rnd(0, 6), by2 = rnd(by1, 6);
    long long w = min(ax2, bx2) - max(ax1, bx1);
long long h = min(ay2, by2) - max(ay1, by1);
long long area = 0;
if (w > 0 && h > 0) area = w * h;
    ll cells = 0; for (ll x = 0; x < 6; x++) for (ll y = 0; y < 6; y++) if (ax1 <= x && x + 1 <= ax2 && ay1 <= y && y + 1 <= ay2 && bx1 <= x && x + 1 <= bx2 && by1 <= y && y + 1 <= by2) cells++;
    CK(area == cells);
  }
  for (ll cx = -2; cx <= 2; cx++) for (ll cy = -2; cy <= 2; cy++) for (ll r = 0; r <= 6; r++) for (ll x = -8; x <= 8; x++) for (ll y = -8; y <= 8; y++)
    CK(((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r) == (hypotl((long double)(x - cx), (long double)(y - cy)) <= r + 1e-9L));
  for (ll dx1 = -4; dx1 <= 4; dx1++) for (ll dy1 = -4; dy1 <= 4; dy1++) for (ll dx2 = -4; dx2 <= 4; dx2++) for (ll dy2 = -4; dy2 <= 4; dy2++)
    if ((dx1 || dy1) && (dx2 || dy2)) { double d = atan2((double)dy1, (double)dx1) - atan2((double)dy2, (double)dx2); d = fabs(remainder(d, PIv)); CK((dy1 * dx2 == dy2 * dx1) == (d < 1e-9)); }
  { const double PI = acos(-1.0); CK(fabs(PI - PIv) < 1e-15); }
}

static char pbuf[256];
static void t_io() {
  SEC = "io";
  { bool ok = true; Cap c; cout << (ok ? "YES" : "NO") << "\n";
    CK(c.str() == "YES\n"); }
  { bool ok = false; Cap c; cout << (ok ? "YES" : "NO") << "\n";
    CK(c.str() == "NO\n"); }
  { double x = 1e9 / 3; Cap c; cout << fixed << setprecision(9);
cout << x << "\n";
    CK(c.str() == "333333333.333333313\n" || c.str().substr(0, 16) == "333333333.333333"); CK(c.str().find('e') == string::npos); CK(c.str().size() == 20); }
  { double x = 2; Cap c; cout << fixed << setprecision(9);
cout << x << "\n";
    CK(c.str() == "2.000000000\n"); }
  { double x = 1e9; Cap c; cout << x; CK(c.str() == "1e+09"); }       // the trap in the tip
  { vector<ll> a = {1, -2, 3000000000LL}; Cap c; for (long long x : a) cout << x << " ";
cout << "\n";
    CK(c.str() == "1 -2 3000000000 \n"); }
  { ll x = 5; Cap c; cout << x << "\n"; cout << x << endl; CK(c.str() == "5\n5\n"); }
  { In in("1 2\n3\n\n4000000000\n"); long long x, sum = 0;
while (cin >> x) sum += x;
    CK(sum == 4000000006LL); }
  { ll a = 3, b = -4; Cap c; cout << a << " " << b << "\n"; CK(c.str() == "3 -4\n"); }
  { int i = 2; Cap c; cout << char('a' + i); cout << 'a' + i; CK(c.str() == "c99"); }
#define printf(...) snprintf(pbuf, sizeof pbuf, __VA_ARGS__)
  { ll x = -9000000000000000000LL; printf("%lld\n", x); CK(string(pbuf) == "-9000000000000000000\n"); }
  { double d = 3.14159265; printf("%.6f\n", d); CK(string(pbuf) == "3.141593\n"); }
  { int h = 9, m = 5; printf("%02d:%02d\n", h, m); CK(string(pbuf) == "09:05\n"); }
#undef printf
  { int mid = 7, answer = 42; In in("yes\n"); Cap c;
    cout << "? " << mid << endl;   // flush
string reply; cin >> reply;
cout << "! " << answer << endl;
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
  { int a = 3, b = 4; long long p = a * b; CK(p == 12); }
  { int a = 100000, b = 100000; long long p = 1LL * a * b; CK(p == 10000000000LL); CK((ll)((unsigned)a * (unsigned)b) != p); }   // the int product really is different
  { int i = 100000; ll n = 20000000000LL; CK(1LL * i * i <= n); n = 9999999999LL; CK(!(1LL * i * i <= n)); n = 10000000000LL; CK(1LL * i * i <= n); }
  for (ll a = 0; a <= 40; a++) for (ll b = 1; b <= 40; b++) for (ll c = 0; c <= 150; c++) { CK((a > c / b) == (a * b > c)); CK((a <= c / b) == (a * b <= c)); CK((a >= c / b + (c % b != 0)) == (a * b >= c)); }
  for (ll a : BIGS) for (ll b : BIGS) for (ll c : BIGS) if (a >= 0 && b > 0 && c >= 0) {
    CK((a > c / b) == ((i128)a * b > c)); CK((a <= c / b) == ((i128)a * b <= c)); CK((a >= c / b + (c % b != 0)) == ((i128)a * b >= c)); }
  for (int it = 0; it < 20000; it++) { ll a = rnd(0, 4000000000LL), b = rnd(1, 4000000000LL), c = rnd(0, 1) ? (ll)min((i128)LLONG_MAX, (i128)a * b + rnd(-2, 2)) : rnd(0, LLONG_MAX); if (c < 0) c = 0;
    CK((a > c / b) == ((i128)a * b > c)); CK((a <= c / b) == ((i128)a * b <= c)); CK((a >= c / b + (c % b != 0)) == ((i128)a * b >= c)); }
  for (ll a : BIGS) for (ll b : BIGS) if (b >= 0) CK((a > LLONG_MAX - b) == ((i128)a + b > LLONG_MAX));
  CK((INT_MAX) == 2147483647); CK((INT_MIN) == -2147483647 - 1); CK((LLONG_MAX) == 9223372036854775807LL); CK((LLONG_MIN) == -9223372036854775807LL - 1);
  { const int INF = 1e9; CK(INF == 1000000000 && (ll)INF + INF <= INT_MAX); }
  { const long long INF = 1e18; CK(INF == 1000000000000000000LL && (i128)INF + INF <= LLONG_MAX); }
  { vector<int> a; CK((a.size() - 1) > 1000000000u); CK(((int)a.size() - 1) == -1); CK(!(-1 < (int)a.size()) == false); int runs = 0; for (int i = 0; i + 1 < (int)a.size(); i++) runs++; CK(runs == 0); }
  { vector<int> a = {1, 2, 3}; CK((a.size() - 1) == 2); CK(((int)a.size() - 1) == 2); int runs = 0; for (int i = 0; i + 1 < (int)a.size(); i++) runs++; CK(runs == 2); int n = 3; CK((a[n - 1]) == 3); }
  for (ll lo : BIGS) for (ll hi : BIGS) if (0 <= lo && lo <= hi) { ll mid = lo + (hi - lo) / 2; CK((i128)mid == ((i128)lo + hi) / 2); }
  for (ll lo = -20; lo <= 20; lo++) for (ll hi = lo; hi <= 20; hi++) { ll mid = lo + (hi - lo) / 2; CK(lo <= mid && mid <= hi && (hi - lo < 1 || mid < hi)); if (lo >= 0) CK(((lo + hi) / 2) == mid); }
  //#dbl_53
  CK((1LL << 53) == 9007199254740992LL && fabs((double)(1LL << 53) - 9e15) / 9e15 < 0.01 && (double)((1LL << 53) + 1) == (double)(1LL << 53) && (double)((1LL << 53) - 1) != (double)(1LL << 53));
  { ll x = 1000000000000000000LL; CK(((double)(x + 1) == (double)x) == true); x = 1000; CK(((double)(x + 1) == (double)x) == false); }
  { const int MAXN = 200000 + 5; CK(MAXN == 200005); }
}

// Harness part 3: the older algorithm cards.
namespace g_isPrime {
bool isPrime(long long n) {
    if (n < 2) return false;
    for (long long i = 2; i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}
}
namespace g_factorize {
vector<long long> factorize(long long n) {
    vector<long long> f;
    for (long long p = 2; p * p <= n; p++)
        while (n % p == 0) {
            f.push_back(p);
            n /= p;
        }
    if (n > 1) f.push_back(n);
    return f;
}
}
namespace g_sieve {
const int N = 1000000;
vector<bool> prime(N + 1, true);
void sieve() {
    prime[0] = prime[1] = false;
    for (int i = 2; 1LL * i * i <= N; i++) {
        if (!prime[i]) continue;
        for (int j = i * i; j <= N; j += i)
            prime[j] = false;
    }
}
}
static void t_numtheory() {
  SEC = "numtheory";
  for (ll a = 0; a <= 48; a++) for (ll b = 0; b <= 48; b++) {
    ll g = bGcd(a, b);
    //#gcd_rule
    if (b) CK(g == bGcd(b, a % b));
    //#gcd_zero
    CK(bGcd(a, 0) == a);
    CK((gcd(a, b)) == g); CK((__gcd(a, b)) == g); CK((gcd(a, b) == 1) == (g == 1));
    if (a && b) { ll l = bLcm(a, b);
      //#lcm_rule
      CK(a % g == 0 && a / g * b == l); CK((lcm(a, b)) == l); }
  }
  { ll a = 1000000000000000000LL, b = 999999999999999999LL; CK((gcd(a, b)) == 1); a = 6000000000LL; b = 4000000000LL; CK((gcd(a, b)) == 2000000000LL && (lcm(a, b)) == 12000000000LL); }
  for (int it = 0; it < 500; it++) { vector<ll> a(rnd(0, 6)); for (auto &v : a) v = rnd(0, 40) * rnd(1, 4);
    long long g = 0;
for (long long x : a) g = gcd(g, x);
    ll w = 0; for (ll v : a) w = bGcd(w, v); CK(g == w); }
  for (ll n = -5; n <= 3000; n++) {
    CK(g_isPrime::isPrime(n) == bPrime(n));
    if (n >= 1) {
      vector<ll> d; for (long long i = 1; i * i <= n; i++)
    if (n % i == 0) {
        d.push_back(i);
        if (i != n / i) d.push_back(n / i);
    }
      sort(d.begin(), d.end()); vector<ll> w; for (ll v = 1; v <= n; v++) if (bMult(n, v) && n % v == 0) w.push_back(v); CK(d == w);
      vector<ll> f = g_factorize::factorize(n); ll prod = 1; for (size_t i = 0; i < f.size(); i++) { prod *= f[i]; CK(bPrime(f[i])); if (i) CK(f[i - 1] <= f[i]); } CK(prod == n);
    }
  }
  CK(g_isPrime::isPrime(1000000007) && g_isPrime::isPrime(998244353) && g_isPrime::isPrime(999999999989LL) && !g_isPrime::isPrime(1000006000009LL) && !g_isPrime::isPrime(1000000007LL * 998244353));
  CK(g_factorize::factorize(1000000007LL * 998244353) == vector<ll>({998244353, 1000000007})); CK(g_factorize::factorize(1LL << 40).size() == 40); CK(g_factorize::factorize(999999999989LL) == vector<ll>({999999999989LL}));
  { ll n = 1000006000009LL; vector<ll> d; for (long long i = 1; i * i <= n; i++)
    if (n % i == 0) {
        d.push_back(i);
        if (i != n / i) d.push_back(n / i);
    }
    sort(d.begin(), d.end()); CK(d == vector<ll>({1, 1000003, n})); }
  g_sieve::sieve(); { int cnt = 0; for (int i = 0; i <= g_sieve::N; i++) { if (g_sieve::prime[i]) cnt++; if (i <= 3000) CK(g_sieve::prime[i] == bPrime(i)); else if (i % 97 == 0 || i > g_sieve::N - 300) CK(g_sieve::prime[i] == g_isPrime::isPrime(i)); } CK(cnt == 78498); }
}

namespace g_power {
long long power(long long a, long long b,
                long long m) {
    long long r = 1 % m; a %= m;
    while (b > 0) {
        if (b & 1) r = r * a % m;
        a = a * a % m;
        b >>= 1;
    }
    return r;
}
}
namespace g_ncr {
const int MOD = 1e9 + 7, MAXN = 200005;
long long fact[MAXN], inv[MAXN];
long long pw(long long a, long long b) {
    long long r = 1; a %= MOD;
    for (; b > 0; b >>= 1, a = a * a % MOD)
        if (b & 1) r = r * a % MOD;
    return r;
}
void init() {
    fact[0] = 1;
    for (int i = 1; i < MAXN; i++) fact[i] = fact[i-1] * i % MOD;
    inv[MAXN-1] = pw(fact[MAXN-1], MOD - 2);
    for (int i = MAXN - 1; i > 0; i--) inv[i-1] = inv[i] * i % MOD;
}
long long C(int n, int r) {
    if (r < 0 || r > n) return 0;
    return fact[n] * inv[r] % MOD * inv[n-r] % MOD;
}
}
static void t_mod() {
  SEC = "mod";
  using g_power::power;
  for (int m = 1; m <= 25; m++) for (int a = 0; a < m; a++) for (int b = 0; b < m; b++) {
    int add = a; for (int i = 0; i < b; i++) { add++; if (add == m) add = 0; }
    int sub = a; for (int i = 0; i < b; i++) { sub--; if (sub < 0) sub = m - 1; }
    int mul = 0; for (int i = 0; i < b; i++) for (int j = 0; j < a; j++) { mul++; if (mul == m) mul = 0; }
    CK(((a + b) % m) == add); CK((((a - b) % m + m) % m) == sub); CK(((1LL * a * b) % m) == mul);
    if (bPrime(m) && b) { int q = -1; for (int x = 0; x < m; x++) if (x * b % m == a) q = x;
      //#mod_div
      CK(q == a * power(b, m - 2, m) % m); }
  }
  { int m = 1000000007; for (int it = 0; it < 2000; it++) { int a = it < 5 ? m - 1 : rnd(0, m - 1), b = it < 5 ? m - 1 : rnd(0, m - 1);
      CK(((a + b) % m) == (ll)(((i128)a + b) % m)); CK((((a - b) % m + m) % m) == (ll)((((i128)a - b) % m + m) % m)); CK(((1LL * a * b) % m) == (ll)((i128)a * b % m)); } }
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
      CK(((x >> k) & 1) == bit[k]);
      { auto b = bit; b[k] = 1; CK((x | (1 << k)) == val(b)); } { auto b = bit; b[k] = 0; CK((x & ~(1 << k)) == val(b)); } { auto b = bit; b[k] = 1 - b[k]; CK((x ^ (1 << k)) == val(b)); }
    }
  }
  { vector<ll> xs = BIGS; for (ll x = 1; x <= 3000; x++) xs.push_back(x);
    for (ll x : xs) if (x > 0) { int ones = 0, low = -1; { ll v = x; for (int i = 0; i < 63; i++) { if (v % 2) { ones++; if (low < 0) low = i; } v /= 2; } }
      CK((__builtin_popcountll(x)) == ones); CK((__builtin_ctzll(x)) == low); CK((x & -x) == (1LL << low)); } }
  for (ll a : BIGS) for (ll b : BIGS) { CK((a ^ a) == 0); CK((a ^ 0) == a); CK(((a ^ b) ^ b) == a); }
  for (int n = 0; n <= 20; n++) { int s = 0, p = 1; for (int i = 0; i < n; i++) { s += p; p *= 2; } CK(((1 << n) - 1) == s); }
  for (int a = 0; a < 64; a++) for (int b = 0; b < 64; b++) {
    int both = 0, any = 0; bool sub = true;
    for (int i = 0, p = 1; i < 6; i++, p *= 2) { bool ia = a / p % 2, ib = b / p % 2; if (ia && ib) both += p; if (ia || ib) any += p; if (ia && !ib) sub = false; }
    CK((a & b) == both); CK((a | b) == any); CK(((a & b) == a) == sub);
  }
  for (int n = 0; n <= 6; n++) { vector<ll> a(n), sum(1 << n, 0); for (auto &v : a) v = rnd(-50, 50);
    for (int mask = 0; mask < (1 << n); mask++)
    for (int i = 0; i < n; i++)
        if ((mask >> i) & 1)    // i is in
            sum[mask] += a[i];
    for (int mask = 0; mask < (1 << n); mask++) { ll w = 0; int v = mask; for (int i = 0; i < n; i++) { if (v % 2) w += a[i]; v /= 2; } CK(sum[mask] == w); } CK((int)sum.size() == (1 << n)); }
}

static void t_stl() {
  SEC = "stl";
  for (int it = 0; it < 500; it++) {
    vector<int> a(rnd(1, 9)); for (auto &v : a) v = rnd(-5, 5); const vector<int> orig = a;
    sort(a.begin(), a.end());
sort(a.rbegin(), a.rend());  // big to small
reverse(a.begin(), a.end());
int mx = *max_element(a.begin(), a.end());
int mn = *min_element(a.begin(), a.end());
long long s =
    accumulate(a.begin(), a.end(), 0LL);
    vector<int> u; for (int v = -5; v <= 5; v++) { bool in = false; for (int q : orig) if (q == v) in = true; if (in) u.push_back(v); }
    ll w = 0; for (int v : orig) w += v;
    vector<int> srt = orig; for (size_t i = 0; i < srt.size(); i++) for (size_t j = i + 1; j < srt.size(); j++) if (srt[j] < srt[i]) swap(srt[i], srt[j]);
    CK(a == srt && mx == u.back() && mn == u[0] && s == w);
  }
  { vector<int> a = {3, 1, 2}; sort(a.rbegin(), a.rend()); CK(a == vector<int>({3, 2, 1})); }
  for (int it = 0; it < 500; it++) {
    vector<pair<int,int>> v(rnd(0, 9)); for (auto &p : v) p = {(int)rnd(0, 3), (int)rnd(0, 3)}; auto orig = v;
    sort(v.begin(), v.end(),
     [](pair<int,int> x, pair<int,int> y) {
    if (x.second != y.second)
        return x.second < y.second;
    return x.first > y.first;
});
    for (size_t i = 1; i < v.size(); i++) CK(v[i - 1].second < v[i].second || (v[i - 1].second == v[i].second && v[i - 1].first >= v[i].first));
    sort(orig.begin(), orig.end()); auto w = v; sort(w.begin(), w.end()); CK(orig == w);
  }
  { int x = 7; bool found = false; set<int> s;
s.insert(x);
if (s.count(x)) found = true;  // x inside?
auto it = s.lower_bound(x);    // first >= x
s.erase(x);
    CK(found && s.empty()); }
  { set<int> s = {1, 5, 9}; int x = 4; auto it = s.lower_bound(x); CK(*it == 5); x = 5; CK(*s.lower_bound(x) == 5); x = 10; CK(s.lower_bound(x) == s.end()); }
  { string key = "ab"; bool found = false; int total = 0; map<string, int> m;
m[key]++;                     // starts at 0
if (m.count(key)) found = true;
for (auto [k, v] : m) total += v;  // sorted
    CK(found && total == 1 && m.size() == 1 && m[key] == 1); }
  { int x = 7; multiset<int> ms;
ms.insert(x); ms.insert(x);
int smallest = *ms.begin();
int biggest = *ms.rbegin();
ms.erase(ms.find(x));        // one copy
ms.erase(x);                 // all copies
    CK(smallest == 7 && biggest == 7 && ms.empty()); }
  { multiset<int> ms = {4, 7, 7, 7, 9}; int x = 7; ms.erase(ms.find(x)); CK(ms.size() == 4 && ms.count(7) == 2); ms.erase(x); CK(ms.size() == 2); }
  { int x = 7; priority_queue<int> pq;    // biggest on top
pq.push(x); int top = pq.top(); pq.pop();
priority_queue<int, vector<int>,
               greater<int>> mn; // smallest
mn.push(x);
    CK(top == 7 && pq.empty() && mn.top() == 7); }
  { priority_queue<int> pq; priority_queue<int, vector<int>, greater<int>> mn; for (int v : {3, 9, 1}) { pq.push(v); mn.push(v); } CK(pq.top() == 9 && mn.top() == 1); }
  { string s = "hello"; vector<ll> a = {5, 5, -1, 1000000000000LL, 5}; int cnt[26] = {};
for (char c : s) cnt[c - 'a']++;
map<long long, long long> f;
for (auto x : a) f[x]++;
// k equal items: k * (k - 1) / 2 pairs
    CK(cnt['l' - 'a'] == 2 && cnt['h' - 'a'] == 1 && cnt[0] == 0 && f[5] == 3 && f[-1] == 1 && f[1000000000000LL] == 1 && f.size() == 3); }
  for (int it = 0; it < 500; it++) { vector<ll> a(rnd(0, 10)); for (auto &v : a) v = rnd(0, 3);
    map<long long, long long> f;
for (long long x : a) f[x]++;
long long pairs = 0;
for (auto [value, k] : f)
    pairs += k * (k - 1) / 2;
    ll w = 0; for (size_t i = 0; i < a.size(); i++) for (size_t j = i + 1; j < a.size(); j++) if (a[i] == a[j]) w++; CK(pairs == w); }
}

static void t_stl2() {
  SEC = "stl2";
  for (int it = 0; it < 2000; it++) { vector<ll> a(rnd(0, 10)); for (auto &v : a) v = rnd(-3, 3);
    map<long long, int> f;
for (long long x : a) f[x]++;
long long best = 0; int bestCount = 0;
for (auto [value, k] : f)
    if (k > bestCount) {
        bestCount = k; best = value;
    }
    ll wb = 0; int wc = 0; for (ll v = -3; v <= 3; v++) { int c = 0; for (ll q : a) if (q == v) c++; if (c > wc) { wc = c; wb = v; } }
    CK(best == wb && bestCount == wc); }
}

static void t_ranges() {
  SEC = "ranges";
  for (int it = 0; it < 400; it++) {
    int n = rnd(1, 9); vector<ll> a(n); for (auto &v : a) v = rnd(-9, 9);
    //#pre_build
    vector<ll> pre(n + 1); pre[0] = 0; for (int i = 0; i < n; i++) pre[i+1] = pre[i] + a[i];
    for (int l = 0; l < n; l++) for (int r = l; r < n; r++) { ll w = 0; for (int i = l; i <= r; i++) w += a[i]; CK((pre[r+1] - pre[l]) == w); }
    vector<ll> d(n + 1, 0), want(n, 0);
    for (int q = 0; q < 5; q++) { int l = rnd(0, n - 1), r = rnd(l, n - 1); ll v = rnd(-5, 5); d[l] += v, d[r+1] -= v; for (int i = l; i <= r; i++) want[i] += v; }
    //#diff_final
    { ll run = 0; for (int i = 0; i < n; i++) { run += d[i]; CK(run == want[i]); } }
    { int R = rnd(1, 5), Cn = rnd(1, 5); vector<vector<ll>> a(R + 1, vector<ll>(Cn + 1, 0)), P = a;
    for (int i = 1; i <= R; i++) for (int j = 1; j <= Cn; j++) { a[i][j] = rnd(-9, 9); P[i][j] = a[i][j] + P[i-1][j] + P[i][j-1] - P[i-1][j-1]; }
    for (int r1 = 1; r1 <= R; r1++) for (int r2 = r1; r2 <= R; r2++) for (int c1 = 1; c1 <= Cn; c1++) for (int c2 = c1; c2 <= Cn; c2++) {
      ll sum = 0, w = 0; for (int i = r1; i <= r2; i++) for (int j = c1; j <= c2; j++) w += a[i][j];
      sum = P[r2][c2] - P[r1-1][c2] - P[r2][c1-1] + P[r1-1][c1-1]; CK(sum == w); } }
  }
  for (int it = 0; it < 3000; it++) {
    int n = rnd(0, 10); vector<ll> a(n); for (auto &v : a) v = rnd(1, 9); ll S = rnd(0, 25);
    long long sum = 0; int best = 0;
for (int l = 0, r = 0; r < n; r++) {
    sum += a[r];
    while (sum > S) sum -= a[l++];
    best = max(best, r - l + 1);
}
    int w = 0; for (int l = 0; l < n; l++) { ll t = 0; for (int r = l; r < n; r++) { t += a[r]; if (t <= S) w = max(w, r - l + 1); } } CK(best == w);
  }
  for (int it = 0; it < 3000; it++) {
    int n = rnd(0, 9); vector<ll> a(n); for (auto &v : a) v = rnd(-9, 9); sort(a.begin(), a.end()); ll target = rnd(-20, 20);
    int i = 0, j = n - 1; bool found = false;
while (i < j) {
    long long s = a[i] + a[j];
    if (s == target) { found = true; break; }
    if (s < target) i++; else j--;
}
    bool w = false; for (int p = 0; p < n; p++) for (int q = p + 1; q < n; q++) if (a[p] + a[q] == target) w = true; CK(found == w); if (found) CK(i < j && a[i] + a[j] == target);
  }
  for (ll T = 0; T <= 40; T++) for (ll N : {40LL, 41LL, 1000000000000000000LL}) {
    auto ok = [&](ll v) { return v >= T; }; ll lo = -1, hi = N; int calls = 0;
    // ok: no no no YES YES YES
while (hi - lo > 1) {
    long long mid = lo + (hi - lo) / 2;
    if (ok(mid)) hi = mid; else lo = mid;
}
// answer = hi
    CK(hi == T && lo == T - 1); (void)calls;
  }
  { auto ok = [&](ll v) { return v * v >= 1000000000000LL; }; ll lo = 0, hi = 2000000000LL;
    // ok: no no no YES YES YES
while (hi - lo > 1) {
    long long mid = lo + (hi - lo) / 2;
    if (ok(mid)) hi = mid; else lo = mid;
}
// answer = hi
    CK(hi == 1000000); }
  for (int it = 0; it < 3000; it++) {
    int n = rnd(0, 9); vector<ll> a(n); for (auto &v : a) v = rnd(0, 6); sort(a.begin(), a.end()); ll x = rnd(-1, 7);
    int i = lower_bound(a.begin(), a.end(), x)
        - a.begin();
int j = upper_bound(a.begin(), a.end(), x)
        - a.begin();
bool has =
    binary_search(a.begin(), a.end(), x);
    int eq = 0, less = 0, more = 0, fi = n, fj = n; for (int p = n - 1; p >= 0; p--) { if (a[p] == x) eq++; if (a[p] < x) less++; if (a[p] > x) more++; if (a[p] >= x) fi = p; if (a[p] > x) fj = p; }
    CK(i == fi && j == fj && has == (eq > 0)); CK((j - i) == eq); CK((i) == less); CK((n - j) == more);
  }
}

namespace g_rec {
vector<vector<int>> seen;
int n; vector<int> a, cur;
void go(int i) {
    if (i == n) { seen.push_back(cur); return; }
    go(i + 1);                 // skip a[i]
    cur.push_back(a[i]);
    go(i + 1);                 // take a[i]
    cur.pop_back();            // undo
}
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
    sort(a.begin(), a.end());
do {
    seen.push_back(a);
} while (next_permutation(a.begin(), a.end()));
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
vector<vector<int>> g; vector<bool> vis;
void dfs(int v) {
    vis[v] = true;
    for (int u : g[v]) if (!vis[u]) dfs(u);
}
}
namespace g_bfs {
vector<int> bfs(int s,
        const vector<vector<int>> &g) {
    vector<int> dist(g.size(), -1);
    queue<int> q; q.push(s); dist[s] = 0;
    while (!q.empty()) {
        int v = q.front(); q.pop();
        for (int u : g[v])
            if (dist[u] == -1) {
                dist[u] = dist[v] + 1;
                q.push(u);
            }
    }
    return dist;
}
}
namespace g_dijkstra {
const long long INF = 1e18;
vector<long long> dijkstra(int s,
        const vector<vector<pair<int,long long>>> &g) {
    vector<long long> dist(g.size(), INF);
    priority_queue<pair<long long,int>,
        vector<pair<long long,int>>, greater<>> pq;
    dist[s] = 0; pq.push({0, s});
    while (!pq.empty()) {
        auto [d, v] = pq.top(); pq.pop();
        if (d > dist[v]) continue;
        for (auto [u, w] : g[v])
            if (dist[v] + w < dist[u]) {
                dist[u] = dist[v] + w;
                pq.push({dist[u], u});
            }
    }
    return dist;
}
}
namespace g_tree {
vector<vector<int>> g;
vector<int> depth, sz;
void dfs(int v, int p) {
    sz[v] = 1;
    for (int u : g[v]) if (u != p) {
        depth[u] = depth[v] + 1;
        dfs(u, v);
        sz[v] += sz[u];
    }
}
}
namespace g_dsu {
struct DSU {
    vector<int> p, sz;
    DSU(int n) : p(n + 1), sz(n + 1, 1) {
        iota(p.begin(), p.end(), 0);
    }
    int find(int x) {
        if (p[x] != x) p[x] = find(p[x]);
        return p[x];
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        p[b] = a; sz[a] += sz[b];
        return true;
    }
};
}
namespace g_topo {
vector<int> topo(int n, const vector<vector<int>> &g) {
    vector<int> in(n + 1, 0), order;
    for (int v = 1; v <= n; v++) for (int u : g[v]) in[u]++;
    queue<int> q;
    for (int v = 1; v <= n; v++) if (in[v] == 0) q.push(v);
    while (!q.empty()) {
        int v = q.front(); q.pop();
        order.push_back(v);
        for (int u : g[v]) if (--in[u] == 0) q.push(u);
    }
    return order;          // size < n  =>  cycle
}
}
static void t_graphs() {
  SEC = "graphs";
  { In in("1 2\n2 3\n1 3\n4 4\n"); int n = 4, m = 4; vector<vector<int>> g(n + 1);
for (int i = 0; i < m; i++) {
    int u, v; cin >> u >> v;
    g[u].push_back(v);
    g[v].push_back(u);
}
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
