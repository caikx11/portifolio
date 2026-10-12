import { chromium } from 'playwright';
const base='http://localhost:8080';
const ids=(process.argv[2]||'041,042,043,044,045,046,047,048,049,050').split(',');
const b=await chromium.launch({executablePath:process.env.CHROME});
for(const id of ids){
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  const errs=[];
  p.on('pageerror',e=>errs.push('pageerror: '+e.message));
  p.on('console',m=>m.type()==='error'&&errs.push('console: '+m.text()));
  await p.goto(`${base}/project_${id}/index.html`,{waitUntil:'load',timeout:15000}).catch(e=>errs.push(e.message));
  await p.waitForTimeout(500);
  for(const btn of (await p.$$('button:visible')).slice(0,6)) await btn.click({timeout:500}).catch(()=>{});
  const ov=await p.evaluate(()=>{const w=innerWidth;const bad=[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>w+1&&getComputedStyle(e).position!=='fixed').slice(0,4).map(e=>e.tagName+'.'+e.className+'#'+e.id);return {o:document.documentElement.scrollWidth>w,bad}});
  if(process.env.SHOT) await p.screenshot({path:`/tmp/claude-0/s/${id}.png`});
  console.log(id,errs.filter(e=>!/net::ERR|cdn|fonts|Failed to load resource/i.test(e)).join(' | ')||'ok',ov.o?'[overflow] '+ov.bad.join(','):'');
}
await b.close();
