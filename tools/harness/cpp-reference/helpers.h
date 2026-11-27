template<class T, class = void> struct _zIt : false_type {};
template<class T> struct _zIt<T, void_t<decltype(begin(declval<const T&>()))>> : true_type {};
template<class T> void _zput(ostream& o, const T& x);
template<class A, class B> void _zput(ostream& o, const pair<A, B>& p) { _zput(o, p.first); o << ' '; _zput(o, p.second); }
template<class T> void _zput(ostream& o, const T& x) {
  if constexpr (is_same_v<T, bool>) o << (x ? "true" : "false");
  else if constexpr (is_convertible_v<T, string_view>) o << x;
  else if constexpr (_zIt<T>::value) { bool f = true; for (const auto& e : x) { if (!f) o << ' '; f = false; _zput(o, e); } }
  else o << x;
}
static map<int, string> _zrec;
struct _zCap { int id; ostringstream o; streambuf* b; _zCap(int i) : id(i) { b = cout.rdbuf(o.rdbuf()); } ~_zCap() { cout.rdbuf(b); _zrec[id] += o.str(); cout << o.str(); } };
template<class T> void _zchk(int id, const T& x) { ostringstream o; _zput(o, x); _zrec[id] += o.str() + " "; }
static string _znorm(string s) { string t; bool sp = false; for (char c : s) { if (isspace((unsigned char)c)) sp = true; else { if (sp && !t.empty()) t += ' '; sp = false; t += c; } }
  if (t.size() >= 2 && ((t[0] == '"' && t.back() == '"') || (t[0] == '\'' && t.back() == '\''))) t = t.substr(1, t.size() - 2); return t; }
struct _zEnd { const vector<string>* e = &_zexp; ~_zEnd() { cout.flush(); int bad = 0; for (int i = 0; i < (int)e->size(); i++) {
  if (!_zrec.count(i)) { cerr << "CHECK NOT RUN #" << i << " want [" << (*e)[i] << "]\n"; bad++; continue; }
  if (_znorm(_zrec[i]) != _znorm((*e)[i])) { cerr << "CHECK FAIL #" << i << " got [" << _znorm(_zrec[i]) << "] want [" << (*e)[i] << "]\n"; bad++; } }
  if (bad) _Exit(3); } };
static _zEnd _zend;
