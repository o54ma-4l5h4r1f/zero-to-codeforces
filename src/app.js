(function () {
  var D = window.CFG_DATA, $ = function (s, r) { return (r || document).querySelector(s); };
  var main = $('#main'), side = $('#nav'), tip = $('#tip');
  var flat = [];
  D.stages.forEach(function (st) { st.topics.forEach(function (t) { t.stage = st; flat.push(t); }); });
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ----- progress (saved in this browser only) ----- */
  var done = {};
  try { done = JSON.parse(localStorage.getItem('cfg-done') || '{}') || {}; } catch (e) {}
  function setDone(slug, v) {
    if (v) done[slug] = 1; else delete done[slug];
    try { localStorage.setItem('cfg-done', JSON.stringify(done)); } catch (e) {}
  }

  /* ----- theme ----- */
  try { var th = localStorage.getItem('cfg-theme'); if (th) document.documentElement.setAttribute('data-theme', th); } catch (e) {}
  function toggleTheme() {
    var r = document.documentElement, cur = r.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var nx = cur === 'dark' ? 'light' : 'dark';
    r.setAttribute('data-theme', nx);
    try { localStorage.setItem('cfg-theme', nx); } catch (e) {}
  }

  /* ----- sidebar ----- */
  function drawSide(cur) {
    var h = '';
    D.stages.forEach(function (st) {
      h += '<div class="s' + st.id + '"><div class="stage-h">' + esc(st.id + ' · ' + st.name) + '<span>' + esc(st.rating) + '</span></div><ul>';
      st.topics.forEach(function (t) {
        h += '<li class="' + (done[t.slug] ? 'done' : '') + '"><a href="#' + t.slug + '" class="' + (t.slug === cur ? 'on' : '') + '">' + esc(t.title) +
          '</a><input type="checkbox" id="ck-' + t.slug + '" data-slug="' + t.slug + '" aria-label="Done: ' + esc(t.title) + '"' + (done[t.slug] ? ' checked' : '') + '></li>';
      });
      h += '</ul></div>';
    });
    side.innerHTML = h;
  }

  /* ----- C++ highlighter (tiny) ----- */
  var KW = 'int|long|double|float|char|bool|void|auto|const|unsigned|signed|short|string|vector|pair|map|set|multiset|unordered_map|unordered_set|queue|deque|stack|priority_queue|array|bitset|tuple|if|else|for|while|do|return|break|continue|struct|class|using|namespace|typedef|template|typename|true|false|switch|case|default|static|sizeof|nullptr|std|cin|cout|endl|greater|less|public|private|ll';
  var RX = new RegExp('(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|("(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\')|(#\\s*\\w+)|\\b(' + KW + ')\\b|\\b(\\d[\\w\'.]*)\\b', 'g');
  function hl(src) {
    var out = '', last = 0, m;
    RX.lastIndex = 0;
    while ((m = RX.exec(src))) {
      out += esc(src.slice(last, m.index));
      var c = m[1] ? 'com' : m[2] ? 'str' : m[3] ? 'pre' : m[4] ? 'kw' : 'num';
      out += '<span class="t-' + c + '">' + esc(m[0]) + '</span>';
      last = RX.lastIndex;
    }
    return out + esc(src.slice(last));
  }

  /* ----- make a page interactive ----- */
  function enhance(root) {
    var seen = {};
    root.querySelectorAll('.term').forEach(function (el) {
      var k = el.getAttribute('data-t'), g = D.glossary[k];
      if (!g) return;
      el.tabIndex = 0;
      if (!seen[k] && !el.closest('h1,h2,h3,th,.cc,svg')) {
        seen[k] = 1;
        var s = document.createElement('span');
        s.className = 'ar'; s.lang = 'ar'; s.dir = 'rtl'; s.textContent = '(' + g.ar.replace(/\s*[(（].*$/, '') + ')';
        el.after(' ', s);
      }
    });
    root.querySelectorAll('pre > code').forEach(function (c) {
      var src = c.textContent.replace(/^\n+|\s+$/g, '');
      c.innerHTML = hl(src);
      var pre = c.parentNode;
      if (pre.closest('.cc')) return;
      var box = document.createElement('div'); box.className = 'codebox';
      pre.replaceWith(box); box.appendChild(pre);
      var b = document.createElement('button'); b.className = 'btn copy'; b.type = 'button'; b.textContent = 'Copy';
      b.onclick = function () {
        var okf = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1200); };
        try { navigator.clipboard.writeText(src).then(okf, sel); } catch (e) { sel(); }
        function sel() { var r = document.createRange(); r.selectNodeContents(c); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      };
      box.appendChild(b);
    });
    root.querySelectorAll('a.cf').forEach(function (a) {
      var p = a.getAttribute('data-p'), m = /^(\d+)([A-Z]\d?)$/.exec(p || '');
      if (!m) return;
      a.href = 'https://codeforces.com/problemset/problem/' + m[1] + '/' + m[2];
      var id = document.createElement('span'); id.className = 'id'; id.textContent = p;
      a.before(id);
    });
    /* order every ladder by real difficulty: official rating, then most-solved first.
       Links to other judges keep the place the author gave them. */
    root.querySelectorAll('.practice ol').forEach(function (ol) {
      var items = [].slice.call(ol.children);
      var info = function (li) { var a = li.querySelector(':scope > a.cf'); return a && D.cf && D.cf[a.getAttribute('data-p')]; };
      var cfItems = items.filter(info).map(function (li, i) { return { li: li, d: info(li), i: i }; })
        .sort(function (x, y) { return (x.d[0] || 9999) - (y.d[0] || 9999) || y.d[1] - x.d[1] || x.i - y.i; });
      var k = 0;
      items.map(function (li) { return info(li) ? cfItems[k++].li : li; }).forEach(function (li) {
        var d = info(li);
        if (d) {
          var r = li.querySelector('.r'); if (!r) { r = document.createElement('span'); r.className = 'r'; li.appendChild(r); }
          r.textContent = d[0] || '—';
          var sv = document.createElement('span'); sv.className = 'solved';
          sv.textContent = d[1] >= 1000 ? Math.round(d[1] / 1000) + 'k solved' : d[1] + ' solved';
          sv.title = d[1] + ' people solved this problem. More solvers usually means easier.';
          li.insertBefore(sv, r);
        }
        ol.appendChild(li);
      });
    });
    root.querySelectorAll('a[href^="http"]').forEach(function (a) { a.target = '_blank'; a.rel = 'noopener'; });
    root.querySelectorAll('.cc').forEach(function (c) { c.tabIndex = 0; });
    root.querySelectorAll('table').forEach(function (t) {
      if (t.parentNode.classList.contains('tablewrap') || t.closest('.cc')) return;
      var w = document.createElement('div'); w.className = 'tablewrap'; t.replaceWith(w); w.appendChild(t);
    });
  }

  /* ----- pages ----- */
  function home() {
    var total = flat.length, n = flat.filter(function (t) { return done[t.slug]; }).length;
    var h = '<div class="col">' + D.pages.home +
      '<div><div class="note">Your progress: ' + n + ' / ' + total + ' lessons</div><div class="meter"><i style="width:' + (100 * n / total) + '%"></i></div></div><div class="path">';
    D.stages.forEach(function (st) {
      h += '<div class="stage s' + st.id + '"><div class="num">' + st.id + '</div><div class="body"><div class="meta">' + esc(st.rating) + '</div><h2>' + esc(st.name) + '</h2><p>' + esc(st.goal) + '</p><ul class="chips">';
      st.topics.forEach(function (t) { h += '<li><a href="#' + t.slug + '" class="' + (done[t.slug] ? 'done' : '') + '">' + esc(t.title) + '</a></li>'; });
      h += '</ul><p class="ready"><b>Move on when:</b> ' + esc(st.ready) + '</p></div></div>';
    });
    return h + '</div><p><a class="btn" href="#cheatsheet">Open the cheat sheet</a> <a class="btn" href="#glossary">English → Arabic word list</a></p></div>';
  }
  function glossary() {
    var keys = Object.keys(D.glossary).sort(function (a, b) { return D.glossary[a].en.localeCompare(D.glossary[b].en); });
    var h = '<div class="col"><div class="page-h"><div class="eyebrow">Word list</div><h1>English → Arabic</h1></div>' +
      '<input class="search" id="gq" type="search" placeholder="Search a word…" aria-label="Search a word">' +
      '<table class="gloss"><thead><tr><th>English</th><th>العربية</th><th>Simple meaning</th></tr></thead><tbody>';
    keys.forEach(function (k) { var g = D.glossary[k]; h += '<tr><td>' + esc(g.en) + '</td><td lang="ar">' + esc(g.ar) + '</td><td>' + esc(g.note || '') + '</td></tr>'; });
    return h + '</tbody></table></div>';
  }
  function topic(t) {
    var i = flat.indexOf(t), pv = flat[i - 1], nx = flat[i + 1];
    return '<article class="col s' + t.stage.id + '"><div class="page-h"><div class="eyebrow">Stage ' + t.stage.id + ' · ' + esc(t.stage.name) + ' · ' + esc(t.stage.rating) +
      '</div><h1>' + esc(t.title) + '</h1></div>' + (D.pages[t.slug] || '<p>This lesson is not written yet.</p>') +
      '<div class="pager">' + (pv ? '<a href="#' + pv.slug + '">← ' + esc(pv.title) + '</a>' : '<span></span>') +
      '<button type="button" class="btn done-btn' + (done[t.slug] ? ' is' : '') + '" id="done-btn" data-slug="' + t.slug + '">' + (done[t.slug] ? '✓ Done' : 'Mark as done') + '</button>' +
      (nx ? '<a href="#' + nx.slug + '">' + esc(nx.title) + ' →</a>' : '<a href="#cheatsheet">Cheat sheet →</a>') + '</div></article>';
  }
  function render() {
    var slug = (location.hash || '').slice(1) || 'home';
    var t = flat.filter(function (x) { return x.slug === slug; })[0];
    hideTip(); document.body.classList.remove('open');
    if (t) main.innerHTML = topic(t);
    else if (slug === 'cheatsheet') main.innerHTML = '<div class="col wide cheat"><div class="page-h"><div class="eyebrow">Everything on one page</div><h1>Cheat sheet</h1><p class="note">Point at a card (or tap it) to see what it does and open its lesson.</p></div>' + D.pages.cheatsheet + '</div>';
    else if (slug === 'glossary') main.innerHTML = glossary();
    else { slug = 'home'; main.innerHTML = home(); }
    enhance(main); drawSide(slug);
    document.querySelectorAll('.quick a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + slug); });
    window.scrollTo(0, 0);
  }

  /* ----- tooltip ----- */
  var tipFor = null, hideT = 0;
  function showTip(el) {
    clearTimeout(hideT);
    if (tipFor === el) return;
    var html, rtl = false;
    if (el.classList.contains('term')) {
      var g = D.glossary[el.getAttribute('data-t')]; if (!g) return;
      html = esc(g.ar) + (g.note ? '<span class="en">' + esc(g.note) + '</span>' : ''); rtl = true;
    } else {
      var to = el.getAttribute('data-to'), tt = flat.filter(function (x) { return x.slug === to; })[0];
      html = esc(el.getAttribute('data-tip') || '') + (tt ? '<br><a href="#' + to + '">Open lesson: ' + esc(tt.title) + ' →</a>' : '');
    }
    tipFor = el; tip.innerHTML = html; tip.className = rtl ? 'rtl' : ''; tip.hidden = false;
    var r = el.getBoundingClientRect(), w = tip.offsetWidth, hh = tip.offsetHeight, vw = document.documentElement.clientWidth;
    var x = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, vw - w - 12));
    var y = r.bottom + 6; if (y + hh > innerHeight - 8 && r.top - hh - 6 > 0) y = r.top - hh - 6;
    tip.style.left = (x + scrollX) + 'px'; tip.style.top = (y + scrollY) + 'px';
  }
  function hideTip() { tipFor = null; tip.hidden = true; }
  function later() { clearTimeout(hideT); hideT = setTimeout(hideTip, 220); }
  function target(e) { return e.target.closest && e.target.closest('.term, .cc[data-tip]'); }
  document.addEventListener('mouseover', function (e) { var t = target(e); if (t) showTip(t); else if (e.target.closest && e.target.closest('#tip')) clearTimeout(hideT); });
  document.addEventListener('mouseout', function (e) { if (target(e) || (e.target.closest && e.target.closest('#tip'))) later(); });
  document.addEventListener('focusin', function (e) { var t = target(e); if (t) showTip(t); });
  document.addEventListener('focusout', function (e) { if (target(e)) later(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { hideTip(); document.body.classList.remove('open'); } });

  document.addEventListener('click', function (e) {
    var t = target(e);
    if (t) { if (tipFor === t && e.detail === 0) hideTip(); else showTip(t); }
    else if (!e.target.closest('#tip')) hideTip();
    if (e.target.closest('#menu')) document.body.classList.toggle('open');
    else if (document.body.classList.contains('open') && !e.target.closest('.side')) document.body.classList.remove('open');
    if (e.target.closest('.theme')) toggleTheme();
    var d = e.target.closest('#done-btn');
    if (d) { setDone(d.dataset.slug, !done[d.dataset.slug]); d.classList.toggle('is', !!done[d.dataset.slug]); d.textContent = done[d.dataset.slug] ? '✓ Done' : 'Mark as done'; drawSide(d.dataset.slug); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.matches('.side input[type=checkbox]')) { setDone(e.target.dataset.slug, e.target.checked); render(); }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id !== 'gq') return;
    var q = e.target.value.toLowerCase();
    document.querySelectorAll('.gloss tbody tr').forEach(function (tr) { tr.hidden = tr.textContent.toLowerCase().indexOf(q) < 0; });
  });
  window.addEventListener('hashchange', render);
  render();
})();
