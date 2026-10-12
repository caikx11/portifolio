import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const base='http://localhost:8080';
for (let i=31;i<=40;i++){
  const id='0'+i;
  const ctx=await b.newContext({viewport:{width:390,height:844}});
  const p=await ctx.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));
  p.on('console',m=>m.type()==='error'&&!/net::ERR|Failed to load resource/.test(m.text())&&errs.push('C '+m.text()));
  p.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))errs.push(r.status()+' '+r.url())});
  await p.goto(`${base}/project_${id}/index.html`,{waitUntil:'load'}).catch(e=>errs.push(e.message));
  await p.waitForTimeout(800);
  for (const btn of (await p.$$('button:visible')).slice(0,6)) await btn.click({timeout:600}).catch(()=>{});
  const ov=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth}));
  await p.screenshot({path:`/tmp/claude-0/s/p${id}.png`,fullPage:false});
  console.log(id,errs.join(' | ')||'ok',ov.sw>ov.iw?`[overflow ${ov.sw}]`:'');
  await ctx.close();
}
await b.close();
