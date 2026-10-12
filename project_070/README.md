# 070 · Blog Full Stack

Blog com Next.js (App Router) + SQLite: páginas públicas, API REST e painel de posts protegido por senha (token HMAC).

## Demonstração estática (GitHub Pages)
Abra `index.html` (ou sirva a raiz do repo: `python3 -m http.server 8080`). Sem servidor, a página entra em **modo demonstração** (API simulada no navegador, indicado na UI). Se detectar a API real em `http://localhost:3070`, usa o servidor de verdade.

## Rodar o servidor local
```bash
cd server && npm install
npm run build && npm start   # ou: npm run dev
```
Testes: `npm test`. Porta padrão: 3070 (variável `PORT`).

## Endpoints
- Páginas: `/`, `/posts/:slug`, `/admin`
- `GET /api/health`, `POST /api/login` {password} -> {token}
- `GET /api/posts` (publicados) e `GET /api/posts?all=1` (admin)
- `POST /api/posts`, `GET|PUT|DELETE /api/posts/:id|slug` (escrita exige Bearer)
Variáveis: `ADMIN_PASSWORD` (padrão `admin`, troque!), `AUTH_SECRET`, `DB_FILE`.

## Banco de dados
O curso usa PostgreSQL; aqui, SQLite (better-sqlite3) em `lib/db.ts`/`lib/posts.ts`. Para trocar, use `pg` ou Prisma e torne as funções de `lib/posts.ts` assíncronas (os route handlers já são `async`).

## Deploy sugerido
Render ou Railway: web service Node com root `project_070/server`, build `npm install && npm run build`, start conforme acima. Configure as variáveis de ambiente citadas; para persistir dados use um disco/volume (SQLite) ou PostgreSQL gerenciado. A demo (`index.html`) publica-se no GitHub Pages sem servidor.
