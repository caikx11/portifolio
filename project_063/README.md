# 063 · Aurora Bio (Link-in-bio)

**Stack:** Next.js 14 (export), React 18, Jest

Página de links com 3 temas, contador de cliques, editor (adicionar/remover com validação de URL http/https) e compartilhamento. Estado salvo em localStorage.

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
