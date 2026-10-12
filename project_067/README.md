# 067 · Encurtador de URLs

Encurtador com Node + Express + SQLite: slug aleatório ou customizado, redirecionamento 302 e contagem de cliques (com referrer).

## Demonstração estática (GitHub Pages)
Abra `index.html` (ou sirva a raiz do repo: `python3 -m http.server 8080`). Sem servidor, a página entra em **modo demonstração** (API simulada no navegador, indicado na UI). Se detectar a API real em `http://localhost:3067`, usa o servidor de verdade.

## Rodar o servidor local
```bash
cd server && npm install
npm start
```
Testes: `npm test`. Porta padrão: 3067 (variável `PORT`).

## Endpoints
- `GET /api/health`
- `POST /api/links` {url, slug?} (201; 400 URL/slug inválidos; 409 slug em uso)
- `GET /api/links` lista com contagem de cliques
- `GET /api/links/:slug` estatísticas + últimos 10 cliques
- `DELETE /api/links/:slug` (204)
- `GET /:slug` redireciona (302) e registra o clique

## Banco de dados
O curso usa PostgreSQL; aqui usamos SQLite (better-sqlite3) para rodar sem dependências. Para trocar: instale `pg`, substitua `src/db.js` por um `Pool`, troque `?` por `$1, $2…`, `INTEGER PRIMARY KEY AUTOINCREMENT` por `SERIAL PRIMARY KEY` e `datetime('now')` por `now()`; as funções passam a ser `async`.
Arquivo: `links.db` (ou `DB_FILE`), ignorado pelo git.

## Deploy sugerido
Render ou Railway: web service Node com root `project_067/server`, build `npm install`, start conforme acima. Configure as variáveis de ambiente citadas; para persistir dados use um disco/volume (SQLite) ou PostgreSQL gerenciado. A demo (`index.html`) publica-se no GitHub Pages sem servidor.
