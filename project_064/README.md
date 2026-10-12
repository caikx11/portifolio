# 064 · Trilha Docs (Docs Site)

**Stack:** Next.js 14 (export), React 18, Jest

Site de documentação com sidebar por seções, busca (atalhos / e Ctrl+K), sumário "Nesta página", botão de copiar código, anterior/próximo e menu mobile.

## Rodar
```bash
npm install
npm run dev      # http://localhost:3000
npm test         # Jest
```

## Buildar (site estático)
```bash
npm run build    # next build (output: 'export') + scripts/postbuild.mjs
```
O `postbuild` copia o export para a raiz da pasta: `index.html`, `_next/` e `404.html` ficam ao lado do README e funcionam com caminhos relativos (`assetPrefix: './'`) em subpasta do GitHub Pages. A navegação interna usa hash (`#/rota`) para não quebrar os caminhos relativos. `node_modules/` e `.next/` não são versionados.

## Deploy sugerido
Vercel (importar a pasta, framework Next.js) ou GitHub Pages servindo a pasta já exportada.
