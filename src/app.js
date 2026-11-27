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

  var solvedP = {};
  try { solvedP = JSON.parse(localStorage.getItem('cfg-solved') || '{}') || {}; } catch (e) {}
  function setSolved(id, v) {
    if (v) solvedP[id] = 1; else delete solvedP[id];
    try { localStorage.setItem('cfg-solved', JSON.stringify(solvedP)); } catch (e) {}
  }
  var T = D.training, trackOf = {};
  if (T) T.tracks.forEach(function (t) { trackOf[t.slug] = t; });
  function nSolved(list) { return list.filter(function (p) { return solvedP[p[0]]; }).length; }
  function cfUrl(id) { var m = /^(\d+)(.+)$/.exec(id); return 'https://codeforces.com/problemset/problem/' + m[1] + '/' + m[2]; }
  function kfmt(n) { return n >= 1000 ? Math.round(n / 1000) + 'k' : String(n); }

  /* ----- training pages ----- */
  function trainHome() {
    var all = T.mixed.slice(); T.tracks.forEach(function (t) { all = all.concat(t.problems); });
    var n = nSolved(all);
    var h = '<div class="col"><div class="page-h"><div class="eyebrow">Training</div><h1>' + all.length + ' problems, in order</h1></div>' +
      '<p class="idea">Reading gives you the idea. Problems give you the skill. Each track repeats one idea with small changes, from easy to hard.</p>' +
      '<section><h2>How to use it</h2><ol><li>Read the lesson. Solve its practice ladder.</li><li>Open the track. Solve from the top. The rating goes up slowly.</li>' +
      '<li>Before each problem, read the list of <b>twists</b>. After you solve it, say which twist it was.</li>' +
      '<li>Solved about two of every three in a track? Go to the next lesson. Come back later for the rest.</li>' +
      '<li>After each stage, do the <b>mixed set</b>. There nobody tells you the topic.</li></ol>' +
      '<p class="note">Every problem is real and comes from the Codeforces list. They are sorted by the official rating, then by how many people solved them.</p></section>' +
      '<div><div class="note">Solved: ' + n + ' / ' + all.length + '</div><div class="meter"><i style="width:' + (100 * n / all.length) + '%"></i></div></div>';
    D.stages.forEach(function (st) {
      var ts = st.topics.filter(function (t) { return trackOf[t.slug]; });
      if (!ts.length) return;
      h += '<section class="s' + st.id + '"><h2>Stage ' + st.id + ' · ' + esc(st.name) + '</h2><div class="tgrid">';
      ts.forEach(function (t) {
        var tr = trackOf[t.slug], k = nSolved(tr.problems), p = tr.problems;
        h += '<a class="tcard" href="#train-' + t.slug + '"><b>' + esc(t.title) + '</b><span class="note">' + p.length + ' problems · ' + p[0][2] + '–' + p[p.length - 1][2] +
          '</span><div class="meter"><i style="width:' + (100 * k / p.length) + '%"></i></div><span class="note">' + k + ' solved</span></a>';
      });
      h += '</div></section>';
    });
    var mk = nSolved(T.mixed);
    return h + '<section><h2>Mixed set</h2><div class="tgrid"><a class="tcard" href="#train-mixed"><b>All topics, no labels</b><span class="note">' + T.mixed.length +
      ' problems · 800–1600</span><div class="meter"><i style="width:' + (100 * mk / T.mixed.length) + '%"></i></div><span class="note">' + mk + ' solved</span></a></div></section></div>';
  }
  function trainTrack(slug) {
    var mixed = slug === 'mixed', tr = mixed ? { problems: T.mixed, twists: [] } : trackOf[slug];
    var t = flat.filter(function (x) { return x.slug === slug; })[0], p = tr.problems, k = nSolved(p);
    var h = '<div class="col' + (t ? ' s' + t.stage.id : '') + '"><div class="page-h"><div class="eyebrow"><a href="#training">Training</a> · ' + p.length + ' problems</div><h1>' +
      esc(mixed ? 'Mixed set' : t.title) + '</h1></div>' +
      '<div><div class="note" id="tprog">Solved: ' + k + ' / ' + p.length + '</div><div class="meter"><i id="tbar" style="width:' + (100 * k / p.length) + '%"></i></div></div>';
    if (mixed) h += '<p class="idea">Nobody tells you the topic here. First find the idea, then solve. This is how a real contest feels.</p>';
    else {
      h += '<section><h2>The same idea in different clothes</h2><p>Most problems in this track are one of these. Read the list before you start. After each problem, say which one it was.</p><ul>';
      tr.twists.forEach(function (w) { h += '<li>' + esc(w) + '</li>'; });
      h += '</ul><p class="note">New to this idea? Read the lesson first: <a href="#' + slug + '">' + esc(t.title) + '</a>.</p></section>';
    }
    var cur = 0;
    p.forEach(function (q) {
      if (q[2] !== cur) { if (cur) h += '</ol></section>'; cur = q[2]; h += '<section class="practice"><h2>Rating ' + cur + '</h2><ol>'; }
      h += '<li class="tp' + (solvedP[q[0]] ? ' ok' : '') + '"><input type="checkbox" id="p-' + q[0] + '" data-pid="' + q[0] + '" aria-label="Solved: ' + esc(q[1]) + '"' + (solvedP[q[0]] ? ' checked' : '') +
        '><span class="id">' + q[0] + '</span><a class="cf" href="' + cfUrl(q[0]) + '">' + esc(q[1]) + '</a>' +
        (q[4] ? '<button type="button" class="btn hint" data-h="' + esc(q[4]) + '">hint</button>' : '') + '<span class="solved">' + kfmt(q[3]) + ' solved</span></li>';
    });
    return h + '</ol></section><p class="note">"hint" shows which other ideas the problem mixes in. Try without it first.</p></div>';
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

  /* ----- Arabic sentence help on/off (the "ع" button). Default: on. ----- */
  var trOff = false;
  try { trOff = localStorage.getItem('cfg-tr') === 'off'; } catch (e) {}
  function drawTr() {
    document.documentElement.setAttribute('data-tr', trOff ? 'off' : 'on');
    var b = $('.trbtn'); if (b) { b.setAttribute('aria-pressed', String(!trOff)); b.title = trOff ? 'Arabic sentence help is off' : 'Arabic sentence help is on'; }
  }
  function toggleTr() {
    trOff = !trOff; hideTip(); drawTr();
    try { localStorage.setItem('cfg-tr', trOff ? 'off' : 'on'); } catch (e) {}
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

  /* ----- math: \( inline \) and \[ display \], drawn by KaTeX. No "$": code and prices use it.
     KaTeX loads after this script, so the first page is drawn again when it arrives.
     If KaTeX never loads, the raw LaTeX stays on the page as text. ----- */
  function mathify(root) {
    if (!window.renderMathInElement || root.getAttribute('data-math')) return;
    root.setAttribute('data-math', '1');
    try {
      window.renderMathInElement(root, {
        delimiters: [{ left: '\\(', right: '\\)', display: false }, { left: '\\[', right: '\\]', display: true }],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option', 'svg', 'input', 'button'],
        ignoredClasses: ['no-math'],
        throwOnError: false, strict: false
      });
    } catch (e) {}
  }
  document.addEventListener('DOMContentLoaded', function () { mathify(main); });

  /* ----- make a page interactive ----- */
  function enhance(root) {
    root.removeAttribute('data-math'); mathify(root);
    root.querySelectorAll('.term').forEach(function (el) {
      var k = el.getAttribute('data-t'), g = D.glossary[k];
      if (!g) return;
      el.tabIndex = 0;   /* Arabic is shown only in the tooltip (hover, focus, tap), never inside the text */
    });
    root.querySelectorAll('.tr[data-ar]').forEach(function (el) { el.tabIndex = 0; });
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
    return h + '</div><p>' + (T ? '<a class="btn" href="#training">Training: 1000 problems</a> ' : '') + '<a class="btn" href="#cheatsheet">Open the cheat sheet</a> <a class="btn" href="#glossary">English → Arabic word list</a></p></div>';
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
      (trackOf[t.slug] ? '<p class="tip-box"><b>Go deeper:</b> <a href="#train-' + t.slug + '">' + trackOf[t.slug].problems.length + ' more problems on this idea</a>, from easy to hard, with the usual twists.</p>' : '') +
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
    else if (T && slug === 'training') main.innerHTML = trainHome();
    else if (T && /^train-/.test(slug) && (slug === 'train-mixed' || trackOf[slug.slice(6)])) main.innerHTML = trainTrack(slug.slice(6));
    else { slug = 'home'; main.innerHTML = home(); }
    enhance(main); drawSide(slug.replace(/^train-/, ''));
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
    } else if (el.classList.contains('tr')) {
      var ar = el.getAttribute('data-ar'); if (!ar) return;
      html = esc(ar); rtl = true;
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
  /* the innermost one wins: a .term inside a .tr shows the word, the rest of the sentence shows the sentence */
  function target(e) {
    var t = e.target.closest && e.target.closest('.term, .tr[data-ar], .cc[data-tip]');
    if (t && trOff && t.classList.contains('tr')) t = t.parentNode.closest('.term, .cc[data-tip]');
    return t;
  }
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
    if (e.target.closest('.trbtn')) toggleTr();
    var hb = e.target.closest('.hint');
    if (hb) { var sp = document.createElement('span'); sp.className = 'note'; sp.textContent = 'also: ' + hb.getAttribute('data-h'); hb.replaceWith(sp); }
    var d = e.target.closest('#done-btn');
    if (d) { setDone(d.dataset.slug, !done[d.dataset.slug]); d.classList.toggle('is', !!done[d.dataset.slug]); d.textContent = done[d.dataset.slug] ? '✓ Done' : 'Mark as done'; drawSide(d.dataset.slug); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.matches('.side input[type=checkbox]')) { setDone(e.target.dataset.slug, e.target.checked); render(); }
    if (e.target.matches('.tp input')) {
      setSolved(e.target.dataset.pid, e.target.checked); e.target.closest('.tp').classList.toggle('ok', e.target.checked);
      var boxes = document.querySelectorAll('.tp input'), k = document.querySelectorAll('.tp input:checked').length;
      $('#tprog').textContent = 'Solved: ' + k + ' / ' + boxes.length; $('#tbar').style.width = (100 * k / boxes.length) + '%';
    }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id !== 'gq') return;
    var q = e.target.value.toLowerCase();
    document.querySelectorAll('.gloss tbody tr').forEach(function (tr) { tr.hidden = tr.textContent.toLowerCase().indexOf(q) < 0; });
  });
  window.addEventListener('hashchange', render);
  drawTr();
  render();
})();
