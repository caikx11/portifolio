# 066 · To-Do API (NestJS)

API REST de tarefas com NestJS + TypeScript: CRUD, validação (class-validator), testes unitários e e2e (Jest + supertest).

## Demonstração estática (GitHub Pages)
Abra `index.html` (ou sirva a raiz do repo: `python3 -m http.server 8080`). Sem servidor, a página entra em **modo demonstração** (API simulada no navegador, indicado na UI). Se detectar a API real em `http://localhost:3066`, usa o servidor de verdade.

## Rodar o servidor local
```bash
cd server && npm install
npm start   # ts-node (dev)
npm run build && npm run start:prod
```
Testes: `npm test` (unitários + e2e). Porta padrão: 3066 (variável `PORT`).

## Endpoints
- `GET /api/health`
- `GET /api/todos[?done=true|false]`, `GET /api/todos/:id`
- `POST /api/todos` {title (1-120), priority: baixa|media|alta}
- `PATCH /api/todos/:id` {title?, priority?, done?}
- `DELETE /api/todos/:id` (204)
Entrada inválida: 400; id inexistente: 404.

## Banco de dados
Repositório em memória (`TodosService`) para manter o foco no Nest. Para PostgreSQL, adicione `@nestjs/typeorm` + `pg` (ou Prisma), transforme `Todo` em entidade e injete o repositório no serviço; controller e DTOs não mudam.

## Deploy sugerido
Render ou Railway: web service Node com root `project_066/server`, build `npm install && npm run build`, start conforme acima. Configure as variáveis de ambiente citadas; para persistir dados use um disco/volume (SQLite) ou PostgreSQL gerenciado. A demo (`index.html`) publica-se no GitHub Pages sem servidor.
