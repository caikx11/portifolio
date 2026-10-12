# 065 · Chave Mestra (Auth JWT)

API de autenticação com **Express + TypeScript**, senhas com **bcrypt**, tokens **JWT** e testes **Jest + supertest**.

## Rotas
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/register` | `{name,email,password}` → `201 {user,token}` |
| POST | `/api/login` | `{email,password}` → `200 {user,token}` / `401` |
| GET | `/api/me` | Header `Authorization: Bearer <token>` → usuário |

## Rodar
```bash
npm install
JWT_SECRET=troque-esta-chave-123 npm run dev   # http://localhost:3000
npm test                                        # 7 testes (supertest)
npm run build && npm start                      # produção
```
A API guarda usuários em memória (`src/store.ts`); troque por SQLite/Postgres para persistir.

## Demo estática (GitHub Pages)
Abra `index.html`. O **modo mock** reimplementa as rotas no navegador (PBKDF2 + HS256 via WebCrypto, usuários em `localStorage`). O modo "API real" aponta para a API local (exige CORS habilitado, ex.: pacote `cors`).

## Deploy sugerido
Render ou Railway (Node, `npm run build`, start `npm start`, variável `JWT_SECRET`). A demo estática vai no GitHub Pages.
