import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const base='http://localhost:8080';
async function pg(n,w=390){const c=await b.newContext({viewport:{width:w,height:844}});const p=await c.newPage();p.on('pageerror',e=>console.log('PE',n,e.message));await p.goto(`${base}/project_${n}/index.html`);await p.waitForTimeout(500);return p;}
// 033
let p=await pg('033');await p.fill('#cpf','12345678909');console.log('033',await p.textContent('#cpf-result'));
await p.click('[data-gen=cnpj]');console.log(await p.inputValue('#cnpj'),await p.textContent('#cnpj-result'));
// 034
p=await pg('034');await p.fill('#habit-name','Ler');await p.fill('#habit-goal','2');await p.click('#add-habit-btn');await p.click('[data-act=inc]');await p.click('[data-act=inc]');console.log('034',await p.textContent('#completed-today'),await p.textContent('#current-streak'));
// 035
p=await pg('035');console.log('035',(await p.textContent('#summary-box')).replace(/\s+/g,' ').slice(0,80),await p.$$eval('tbody tr',r=>r.length));
await p.fill('#annual-rate','0');await p.click('#calculate-btn');console.log((await p.textContent('.kpi.main')).trim());
// 036
p=await pg('036');await p.click('.recipe-card');await p.click('#save-offline-btn');await p.click('#close-detail-btn');await p.click('[data-tab=offline]');console.log('036',await p.$$eval('.recipe-card',r=>r.length), await p.evaluate(async()=>{await navigator.serviceWorker.ready;return (await caches.keys()).join()}));
// 037
p=await pg('037');await p.click('#sample-btn');await p.fill('#brightness','30');await p.dispatchEvent('#brightness','input');console.log('037',await p.$eval('#edit-canvas',c=>c.width+'x'+c.height));
// 038
p=await pg('038');await p.click('.question-card .vote-btn');console.log('038',await p.$eval('.vote-count',e=>e.textContent));await p.click('.view-answers-btn');await p.fill('#answer-body','teste');await p.click('#submit-answer-btn');console.log(await p.$$eval('.answer-card',a=>a.length));
// 039
p=await pg('039');await p.fill('#trans-description','x');await p.selectOption('#trans-category',{index:1});await p.fill('#trans-value','10');await p.click('#transaction-form button');console.log('039',await p.$$eval('.transaction-item',a=>a.length));
// 040
for(const lvl of ['fácil','médio','difícil']){p=await pg('040');await p.selectOption('#difficulty',lvl);await p.click('#reveal-btn');console.log('040',lvl,await p.$eval('#words-found',e=>e.textContent),await p.$eval('#game-over-message h2',e=>e.textContent));
p=await pg('040');await p.selectOption('#difficulty',lvl);
const sol=await p.evaluate(()=>{const g=window.crossword;return Object.values(g.cellMap).map(c=>[c.r,c.c,c.letter])});
for(const [r,c,l] of sol){await p.evaluate(([r,c,l])=>{const g=window.crossword;const cell=g.cellMap[r+','+c];cell.input.value=l;g.checkWords(false)},[r,c,l]);}
console.log(' win',await p.$eval('#words-found',e=>e.textContent),await p.$eval('#score',e=>e.textContent));}
await b.close();
