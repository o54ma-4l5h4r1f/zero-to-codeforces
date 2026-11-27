const { chromium } = require('/home/o54ma/Apartment/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  for (const w of [1280, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.route('**/ajax/libs/KaTeX/**', r => { const u = r.request().url(), f = __dirname + '/cdn/' + u.split('/').pop();
      if (/\.(js|css)$/.test(u) && require('fs').existsSync(f)) r.fulfill({ path: f, contentType: u.endsWith('css') ? 'text/css' : 'application/javascript' }); else r.continue(); });
    await p.route(/\.(woff2?|ttf)(\?|$)|fonts\.gstatic/, r => r.abort());
    const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + __dirname + '/index.html#cheatsheet', { waitUntil: 'domcontentloaded' }).catch(e => console.log('goto', String(e).slice(0, 80)));
    await p.waitForTimeout(2500);
    const r = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth, out = { vw, docW: document.documentElement.scrollWidth, cards: document.querySelectorAll('.cc').length,
        katex: document.querySelectorAll('.cheat .katex').length, rawMath: (document.querySelector('.cheat').innerText.match(/\\\(|\\frac|\\text/g) || []).length, over: [], preScroll: [], katexErr: document.querySelectorAll('.katex-error').length };
      document.querySelectorAll('.cc').forEach((c, i) => {
        const r = c.getBoundingClientRect();
        if (r.right > vw + 1 || c.scrollWidth > c.clientWidth + 1) out.over.push(i + ': ' + c.innerText.slice(0, 40).replace(/\n/g, ' '));
        c.querySelectorAll('pre').forEach(pr => { if (pr.scrollWidth > pr.clientWidth + 1) out.preScroll.push(i + ' +' + (pr.scrollWidth - pr.clientWidth) + ': ' + pr.innerText.slice(0, 30).replace(/\n/g, ' ')); });
      });
      out.cols = new Set([...document.querySelectorAll('.cgrid')[1].children].map(c => Math.round(c.getBoundingClientRect().left))).size;
      out.h = document.documentElement.scrollHeight;
      return out;
    });
    console.log(w, JSON.stringify(r, null, 0).slice(0, 3000), errs.slice(0, 5));
    await p.locator('#main').screenshot({ path: `shot-${w}-top.png`, clip: undefined }).catch(() => {});
    await p.screenshot({ path: `shot-${w}-a.png` });
    // jump link
    const before = await p.evaluate(() => scrollY);
    await p.click('.cjump a[data-jump="cs-grids"]');
    await p.waitForTimeout(1800);
    const after = await p.evaluate(() => [scrollY, Math.round(document.getElementById('cs-grids').getBoundingClientRect().top), location.hash]);
    console.log('jump', before, after);
    await p.screenshot({ path: `shot-${w}-b.png` });
    await p.evaluate(() => document.getElementById('cs-parity').scrollIntoView()); await p.waitForTimeout(1800);
    await p.screenshot({ path: `shot-${w}-c.png` });
    await p.hover('#cs-parity .cc'); await p.waitForTimeout(300); await p.screenshot({ path: `shot-${w}-tip.png` });
    await p.close();
  }
  await b.close();
})();
