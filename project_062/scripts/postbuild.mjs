// Move o export estático (out/) para a raiz da pasta do projeto,
// para que project_NNN/index.html funcione no GitHub Pages (caminhos relativos).
import { cpSync, rmSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const out = root + 'out';
if (!existsSync(out)) throw new Error('out/ não existe; rode next build');
rmSync(root + '_next', { recursive: true, force: true });
for (const f of readdirSync(out)) cpSync(`${out}/${f}`, root + f, { recursive: true });
rmSync(out, { recursive: true, force: true });
writeFileSync(root + '.nojekyll', '');
console.log('Export copiado para a raiz do projeto.');
