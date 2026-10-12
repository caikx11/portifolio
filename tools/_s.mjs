import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: process.env.CHROME });
for (const n of process.argv.slice(2)){const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();await p.goto(`http://localhost:8080/project_${n}/index.html`);await p.waitForTimeout(700);
if(n==='037')await p.click('#sample-btn');if(n==='040')await p.waitForTimeout(100);
await p.screenshot({path:`/tmp/claude-0/s/f${n}.png`,fullPage:true});}
await b.close();
