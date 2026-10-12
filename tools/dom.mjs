import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:process.env.CHROME});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
await p.goto('http://localhost:8080/project_044/index.html');
console.log(await p.locator('.shape-btn').first().evaluate(e=>e.outerHTML));
await b.close();
