# 073 · Planta TS (Playground de utilitários)
TypeScript estrito + Tailwind. `src/utils.ts` tem ~25 funções tipadas (arrays, números, objetos, texto, debounce/memoize); `src/registry.ts` descreve cada uma (assinatura, doc, exemplos) e alimenta a UI e os testes Jest.

```
npm i && npm run build   # dist/ commitado
npm test                 # Jest: exemplos do registro + casos de borda
```
Na UI: escolha uma função, edite os argumentos (lista JSON; callbacks por nome, veja a descrição), clique em Executar (ou Ctrl+Enter) ou rode os testes de exemplo.
