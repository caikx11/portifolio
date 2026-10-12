# 068 · Notas Full Stack

Notas privadas com Express + SQLite + JWT (bcryptjs) e frontend em HTML/JS: cadastro, login, CRUD e busca.

## Demonstração estática (GitHub Pages)
Abra `index.html` (ou sirva a raiz do repo: `python3 -m http.server 8080`). Sem servidor, a página entra em **modo demonstração** (API simulada no navegador, indicado na UI). Se detectar a API real em `http://localhost:3068`, usa o servidor de verdade.

## Rodar o servidor local
```bash
cd server && npm install
JWT_SECRET=um-segredo-forte npm start
```
Testes: `npm test`. Porta padrão: 3068 (variável `PORT`).

## Endpoints
- `GET /api/health`
- `POST /api/auth/register` {email, password>=6} e `POST /api/auth/login` -> {token}
- `GET /api/auth/me` (Bearer)
- `GET /api/notes[?q=texto]`, `POST /api/notes`, `GET|PUT|DELETE /api/notes/:id` (Bearer; cada usuário só acessa as próprias)

## Banco de dados
O curso usa PostgreSQL; aqui usamos SQLite (better-sqlite3) para rodar sem dependências. Para trocar: instale `pg`, substitua `src/db.js` por um `Pool`, troque `?` por `$1, $2…`, `INTEGER PRIMARY KEY AUTOINCREMENT` por `SERIAL PRIMARY KEY` e `datetime('now')` por `now()`; as funções passam a ser `async`.
Arquivo: `notes.db` (ou `DB_FILE`). Defina `JWT_SECRET` em produção.

## Deploy sugerido
Render ou Railway: web service Node com root `project_068/server`, build `npm install`, start conforme acima. Configure as variáveis de ambiente citadas; para persistir dados use um disco/volume (SQLite) ou PostgreSQL gerenciado. A demo (`index.html`) publica-se no GitHub Pages sem servidor.
