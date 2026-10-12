import { chromium } from 'playwright';
const ids = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROME });
for (const id of ids) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text()));
  p.on('response', r => { if (r.status() >= 400 && r.url().includes('localhost')) errs.push(r.status() + ' ' + r.url()); });
  await p.goto(`http://localhost:8080/project_${id}/index.html`, { waitUntil: 'load' }).catch(e => errs.push(e.message));
  await p.waitForTimeout(600);
  for (const btn of (await p.$$('button:visible')).slice(0, 5)) await btn.click({ timeout: 800 }).catch(() => {});
  await p.waitForTimeout(300);
  const ov = await p.evaluate(() => { const w = innerWidth; const bad=[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>w+1 && getComputedStyle(e).position!=='fixed').slice(0,4).map(e=>e.tagName+'.'+e.className+'#'+e.id); return {o:document.documentElement.scrollWidth>w, bad}; });
  await p.screenshot({ path: `/tmp/claude-0/-home-user-portifolio/34832401-bc14-5029-ae8b-c7f8451c7d9c/scratchpad/s${id}.png` });
  console.log(id, errs.filter(e=>!/net::ERR|cdn|fonts/i.test(e)).join(' | ')||'ok', ov.o?'[overflow] '+ov.bad.join(','):'');
  await ctx.close();
}
await b.close();
