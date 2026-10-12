import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:process.env.CHROME});
const [n]=process.argv.slice(2);
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto(`http://localhost:8080/project_${n}/index.html`);
await p.evaluate(()=>localStorage.clear());await p.reload();
console.log('welcome',await p.locator('.welcome-screen').count());
await p.click('#add-first-'+(n==='049'?'book':'course'));
for(const el of await p.$$('#properties-panel input[required], #properties-panel textarea[required]')){const t=await el.getAttribute('type');await el.fill(t==='number'?'2020':'Teste');}
await p.click('#properties-panel button[type=submit]');
const item=n==='049'?'.book-item':'.course-item';
console.log('items',await p.locator(item).count(),errs);
await p.locator(item).first().click();
await p.screenshot({path:`/tmp/claude-0/s/${n}f.png`,fullPage:true});
console.log(await p.evaluate(()=>document.documentElement.scrollWidth),errs);
await b.close();
