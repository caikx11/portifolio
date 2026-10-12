# 069 · Chat em Tempo Real

Chat com salas via WebSocket (biblioteca `ws`): presença, histórico das últimas 50 mensagens por sala e validação. Na demo estática, as abas do navegador conversam via BroadcastChannel e há um bot (EcoBot).

## Demonstração estática (GitHub Pages)
Abra `index.html` (ou sirva a raiz do repo: `python3 -m http.server 8080`). Sem servidor, a página entra em **modo demonstração** (API simulada no navegador, indicado na UI). Se detectar a API real em `http://localhost:3069`, usa o servidor de verdade.

## Rodar o servidor local
```bash
cd server && npm install
npm start
```
Testes: `npm test`. Porta padrão: 3069 (variável `PORT`).

## Endpoints
- WebSocket `ws://localhost:3069/ws`
  - cliente: `{type:'join', room, name}`, `{type:'msg', text}`
  - servidor: `history`, `msg`, `presence`, `error`
- `GET /api/health`, `GET /api/rooms`

## Banco de dados
Sem banco: o histórico fica em memória (reinicia com o servidor). Para persistir, grave as mensagens em PostgreSQL (`pg`) no handler de `msg` e carregue as últimas 50 no `join`.

## Deploy sugerido
Render ou Railway: web service Node com root `project_069/server`, build `npm install`, start conforme acima. Configure as variáveis de ambiente citadas; para persistir dados use um disco/volume (SQLite) ou PostgreSQL gerenciado. A demo (`index.html`) publica-se no GitHub Pages sem servidor.
