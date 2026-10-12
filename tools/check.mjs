import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:8080';
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' });
const out = [];
for (let i = 1; i <= 50; i++) {
  const id = String(i).padStart(3, '0');
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text()));
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base)) errs.push(r.status() + ' ' + r.url()); });
  await p.goto(`${base}/project_${id}/index.html`, { waitUntil: 'load' }).catch(e => errs.push(e.message));
  await p.waitForTimeout(500);
  for (const btn of (await p.$$('button:visible')).slice(0, 5)) await btn.click({ timeout: 800 }).catch(() => {});
  const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  out.push({ id, errs: errs.filter(e => !/net::ERR|cdn|fonts/i.test(e)), overflow: ov });
}
await b.close();
for (const r of out) console.log(r.id, r.errs.length ? r.errs.join(' | ') : 'ok', r.overflow ? '[overflow]' : '');
