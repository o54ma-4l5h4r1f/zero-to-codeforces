import re
files={f:open(f).read() for f in ['spec1.txt','spec2.txt','spec3.txt']}
def setcode(name,new):
    for f,s in files.items():
        m=re.search(r'(>>> \w+ '+name+r'\n)(.*?)(\n<<<)',s,re.S)
        if m:
            files[f]=s[:m.start(2)]+new.strip('\n')+s[m.end(2):]; return
    raise Exception('no '+name)
setcode('mul1ll','''
long long p = 1LL * a * b;
long long big = 1e18;
const int MOD = 1e9 + 7;
''')
setcode('alt_index','''
for (int i = 0; i < n; i++) {
    if (i % 2 == 0) first.push_back(a[i]);
    else            second.push_back(a[i]);
}
// first: a[0], a[2]..  second: a[1], a[3]..
''')
setcode('floorceil','''
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
''')
setcode('digits_loop','''
vector<int> digits;
while (x > 0) {
    digits.push_back(x % 10);  // last digit
    x /= 10;                   // remove it
}
reverse(digits.begin(), digits.end());
''')
setcode('reverseNumber','''
long long reverseNumber(long long x) {
    long long r = 0;
    while (x > 0) {
        r = r * 10 + x % 10;
        x /= 10;
    }
    return r;
}
''')
setcode('bigmod','''
string s; cin >> s;
long long r = 0;
for (char c : s)
    r = (r * 10 + (c - '0')) % m;
// r is the big number % m
''')
setcode('isVowel','''
bool isVowel(char c) {
    string v = "aeiou";
    return v.find(c) != string::npos;
}
''')
setcode('srev','''
reverse(s.begin(), s.end());      // changes s
string t(s.rbegin(), s.rend());   // a copy
''')
setcode('isPalindrome','''
bool isPalindrome(const string &s) {
    int n = s.size();
    for (int i = 0; i < n / 2; i++)
        if (s[i] != s[n - 1 - i])
            return false;
    return true;
}
''')
setcode('sgetline','''
int n; cin >> n;
cin.ignore();  // skip the end of line 1
string line; getline(cin, line);
''')
setcode('sremove','''
s.erase(remove(s.begin(), s.end(), 'x'),
        s.end());
''')
setcode('asum','''
long long sum = 0;
for (long long x : a) sum += x;
long long same =
    accumulate(a.begin(), a.end(), 0LL);
''')
setcode('amaxstl','''
auto it = max_element(a.begin(), a.end());
long long mx = *it;
int imx = it - a.begin();
auto jt = min_element(a.begin(), a.end());
long long mn = *jt;
int imn = jt - a.begin();
''')
setcode('aalleq','''
set<long long> st(a.begin(), a.end());
int different = st.size();
bool allEqual = (st.size() == 1);
bool allDifferent = (st.size() == a.size());
''')
setcode('adedup','''
sort(a.begin(), a.end());
auto last = unique(a.begin(), a.end());
a.erase(last, a.end());
''')
setcode('asecond','''
long long mx = LLONG_MIN;
long long second = LLONG_MIN;
for (long long x : a) {
    if (x > mx) { second = mx; mx = x; }
    else if (x < mx && x > second)
        second = x;
}
''')
setcode('aprefmax','''
vector<long long> pm(n), sm(n);
pm[0] = a[0];
for (int i = 1; i < n; i++)
    pm[i] = max(pm[i - 1], a[i]);
sm[n - 1] = a[n - 1];
for (int i = n - 2; i >= 0; i--)
    sm[i] = max(sm[i + 1], a[i]);
''')
setcode('aindexsort','''
vector<pair<long long, int>> v(n);
for (int i = 0; i < n; i++)
    v[i] = {a[i], i};
sort(v.begin(), v.end());
// v[0] = (smallest value, its old index)
''')
setcode('g4','''
int dr[4] = {1, -1, 0, 0};
int dc[4] = {0, 0, 1, -1};
for (int d = 0; d < 4; d++) {
    int nr = r + dr[d], nc = c + dc[d];
    if (nr < 0 || nr >= n) continue;
    if (nc < 0 || nc >= m) continue;
    sum += g[nr][nc];   // a neighbour
}
''')
setcode('gdir','''
int dr[4] = {-1, 0, 1, 0};
int dc[4] = {0, 1, 0, -1};
r += dr[d]; c += dc[d];    // one step
''')
setcode('growcol','''
vector<long long> rowSum(n), colSum(m);
for (int r = 0; r < n; r++)
    for (int c = 0; c < m; c++) {
        rowSum[r] += g[r][c];
        colSum[c] += g[r][c];
    }
''')
setcode('clockio','''
int h, m; char colon;
cin >> h >> colon >> m;
cout << setfill('0') << setw(2) << h << ":"
     << setw(2) << m << "\\n";
''')
setcode('isLeap','''
bool isLeap(int y) {
    if (y % 400 == 0) return true;
    if (y % 100 == 0) return false;
    return y % 4 == 0;
}
''')
setcode('dist2fn','''
long long dist2(long long x1, long long y1,
        long long x2, long long y2) {
    long long dx = x1 - x2, dy = y1 - y2;
    return dx * dx + dy * dy;
}
''')
setcode('cross','''
long long cross(long long ax, long long ay,
        long long bx, long long by,
        long long cx, long long cy) {
    return (bx - ax) * (cy - ay)
         - (by - ay) * (cx - ax);
}
''')
setcode('rect_inter','''
long long w = min(ax2, bx2) - max(ax1, bx1);
long long h = min(ay2, by2) - max(ay1, by1);
long long area = 0;
if (w > 0 && h > 0) area = w * h;
''')
setcode('fixedp','''
cout << fixed << setprecision(9);
cout << x << "\\n";
''')
setcode('factorize','''
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
''')
setcode('sieve','''
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
''')
setcode('power','''
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
''')
setcode('subsets_loop','''
for (int mask = 0; mask < (1 << n); mask++)
    for (int i = 0; i < n; i++)
        if ((mask >> i) & 1)    // i is in
            sum[mask] += a[i];
''')
setcode('vec_tools','''
sort(a.begin(), a.end());
sort(a.rbegin(), a.rend());   // big to small
reverse(a.begin(), a.end());
int mx = *max_element(a.begin(), a.end());
int mn = *min_element(a.begin(), a.end());
long long s =
    accumulate(a.begin(), a.end(), 0LL);
''')
setcode('comparator','''
sort(v.begin(), v.end(),
     [](pair<int,int> x, pair<int,int> y) {
    if (x.second != y.second)
        return x.second < y.second;
    return x.first > y.first;
});
''')
setcode('set_lines','''
set<int> s;
s.insert(x);
if (s.count(x)) found = true;  // x inside?
auto it = s.lower_bound(x);    // first >= x
s.erase(x);
''')
setcode('map_lines','''
map<string, int> m;
m[key]++;                      // starts at 0
if (m.count(key)) found = true;
for (auto [k, v] : m) total += v;  // sorted
''')
setcode('multiset_lines','''
multiset<int> ms;
ms.insert(x); ms.insert(x);
int smallest = *ms.begin();
int biggest = *ms.rbegin();
ms.erase(ms.find(x));        // one copy
ms.erase(x);                 // all copies
''')
setcode('pq_lines','''
priority_queue<int> pq;     // biggest on top
pq.push(x); int top = pq.top(); pq.pop();
priority_queue<int, vector<int>,
               greater<int>> mn;  // smallest
mn.push(x);
''')
setcode('freq','''
int cnt[26] = {};
for (char c : s) cnt[c - 'a']++;
map<long long, long long> f;
for (auto x : a) f[x]++;
// k equal items: k * (k - 1) / 2 pairs
''')
setcode('eqpairs','''
map<long long, long long> f;
for (long long x : a) f[x]++;
long long pairs = 0;
for (auto [value, k] : f)
    pairs += k * (k - 1) / 2;
''')
setcode('mostfreq','''
map<long long, int> f;
for (long long x : a) f[x]++;
long long best = 0; int bestCount = 0;
for (auto [value, k] : f)
    if (k > bestCount) {
        bestCount = k; best = value;
    }
''')
setcode('bounds','''
int i = lower_bound(a.begin(), a.end(), x)
        - a.begin();
int j = upper_bound(a.begin(), a.end(), x)
        - a.begin();
bool has =
    binary_search(a.begin(), a.end(), x);
''')
setcode('perms','''
sort(a.begin(), a.end());
do {
    /* use a */
} while (next_permutation(a.begin(), a.end()));
''')
setcode('bfs','''
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
''')
setcode('treedfs','''
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
''')
setcode('dsu','''
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
''')
setcode('interactive','''
cout << "? " << mid << endl;   // flush
string reply; cin >> reply;
cout << "! " << answer << endl;
''')
s=files['spec2.txt']
a="-- stl-basics | Are all elements equal, are all different, and how many different values are there. The array must not be empty."
assert a in s
files['spec2.txt']=s.replace(a,"-- stl-basics | Put the values in a set: it keeps one copy of each. Its size tells you how many different values there are, if all are equal, if all are different.")
s=files['spec2.txt']
a="-- simulation | Is y a leap year (366 days)? Every 4th year, but not the full hundreds, but again every 400th year."
assert a in s
files['spec2.txt']=s.replace(a,"-- simulation | Is y a leap year (366 days)? Every 4th year is, but years like 1900 are not, and years like 2000 are again.")
s=files['spec3.txt']
a="-- stl-basics | Everyday tools on a vector: sort, reverse, biggest, smallest, sum, remove duplicates."
assert a in s
files['spec3.txt']=s.replace(a,"-- stl-basics | Everyday tools on a vector: sort, sort from big to small, reverse, biggest, smallest, sum.")
for f,s in files.items(): open(f,'w').write(s)
t=open('t3.in.cpp').read()
a="    CK(a == u && mx == u.back() && mn == u[0] && s == w);"
assert a in t
t=t.replace(a,"    vector<int> srt = orig; for (size_t i = 0; i < srt.size(); i++) for (size_t j = i + 1; j < srt.size(); j++) if (srt[j] < srt[i]) swap(srt[i], srt[j]);\n    CK(a == srt && mx == u.back() && mn == u[0] && s == w);")
open('t3.in.cpp','w').write(t)
t=open('t2.in.cpp').read()
a="      CK(allEqual == eq && allDifferent == df && different == (int)u.size()); }"
assert a in t
open('t2.in.cpp','w').write(t)
