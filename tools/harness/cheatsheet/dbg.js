const { chromium } = require('/home/o54ma/Apartment/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', e => console.log('PAGEERR', String(e).slice(0, 300)));
  p.on('requestfailed', r => console.log('REQFAIL', r.url().slice(0, 100), r.failure().errorText));
  p.on('requestfinished', r => console.log('OK', r.url().slice(0, 90)));
  await p.goto('file://' + __dirname + '/index.html#cheatsheet', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(e => console.log('goto', String(e).slice(0, 80)));
  console.log(await p.evaluate(() => [location.hash, (document.getElementById('main') || {innerHTML: ''}).innerHTML.length, document.title, typeof katex]));
  await b.close(); })();
