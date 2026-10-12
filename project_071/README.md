# 071 · Launchpad (SaaS Starter)
React + TypeScript + Tailwind. Cadastro/login, planos, painel de uso e checkout.

**Stripe está em MODO DEMONSTRAÇÃO**: não há chaves nem chamadas de rede. `Store.checkout` valida o cartão (Luhn/validade/CVC) e gera uma fatura fictícia; contas ficam no `localStorage`. Para produção, substitua `checkout` por uma chamada ao seu backend que cria uma Stripe Checkout Session e troque o hash/sessão local por autenticação no servidor.

```
npm i && npm run build   # gera dist/app.js e dist/app.css (commitados)
npm test                 # Jest (src/lib.ts)
```
Abra `index.html` via servidor estático. Cartões de teste: `4242 4242 4242 4242` (aprova), `4000 0000 0000 0002` (recusa).
