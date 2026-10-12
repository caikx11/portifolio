// Posts em JSON com corpo em Markdown (poderia vir de arquivos .md em build).
export const posts = [
  { slug: 'export-estatico-next', title: 'Next.js como site estático, sem servidor', date: '2026-09-28', tags: ['next', 'deploy'],
    excerpt: 'output: export gera HTML puro que roda em qualquer hospedagem, inclusive GitHub Pages.',
    body: `Com **output: 'export'** o Next.js pré-renderiza tudo em tempo de build e entrega apenas arquivos estáticos.

## O que muda

- Sem rotas de API em tempo de execução
- Imagens precisam de \`unoptimized: true\`
- Dados vêm de JSON ou arquivos Markdown lidos no build

## Caminhos relativos

Em subpastas do GitHub Pages, use \`assetPrefix: './'\` e mantenha a navegação por hash para não quebrar os caminhos dos assets.

\`\`\`js
export default { output: 'export', assetPrefix: './', trailingSlash: true };
\`\`\`

> Estático não é limitação: é velocidade, cache e custo zero de servidor.` },
  { slug: 'markdown-como-fonte', title: 'Markdown como fonte de verdade', date: '2026-09-14', tags: ['conteúdo', 'markdown'],
    excerpt: 'Por que escrever posts em Markdown e como transformar texto simples em HTML seguro.',
    body: `Markdown é texto que sobrevive: abre em qualquer editor e versiona bem no Git.

## Segurança primeiro

Todo renderizador deve **escapar HTML** antes de aplicar a formatação. Links aceitam apenas \`http\`, \`https\` ou âncoras.

1. Escape do texto
2. Troca de marcadores por tags
3. Saída injetada na página

Neste blog o renderizador tem testes com Jest para garantir exatamente isso.` },
  { slug: 'acessibilidade-pratica', title: 'Acessibilidade prática em cinco minutos', date: '2026-08-30', tags: ['a11y', 'design'],
    excerpt: 'Foco visível, contraste e movimento reduzido: o mínimo que todo site deveria ter.',
    body: `Acessibilidade começa em hábitos pequenos.

## Checklist rápido

- **Foco visível** em todo elemento interativo
- Contraste mínimo de 4.5:1 para texto
- Respeitar \`prefers-reduced-motion\`
- Links com texto que faça sentido fora de contexto

Teste navegando só com o teclado: se você se perder, seu usuário também se perde.` },
  { slug: 'tipografia-na-web', title: 'Tipografia na web: duas fontes bastam', date: '2026-08-12', tags: ['design', 'css'],
    excerpt: 'Uma serifa para títulos, uma sem serifa para o texto: combinação simples que funciona.',
    body: `Boa tipografia é **hierarquia** antes de ser estilo.

## Regras de bolso

- Largura de linha entre 60 e 75 caracteres
- Entrelinha em torno de 1.6 para leitura longa
- Escala modular para tamanhos de título

Use \`clamp()\` para que títulos cresçam suavemente entre celular e desktop.` },
  { slug: 'estado-sem-bibliotecas', title: 'Estado de interface sem bibliotecas', date: '2026-07-25', tags: ['react', 'next'],
    excerpt: 'useState, useMemo e a URL como estado: o suficiente para um blog com busca e filtros.',
    body: `Nem todo app precisa de uma biblioteca de estado.

## A URL é estado

Guardar o post aberto no **hash** (\`#/slug\`) permite compartilhar links, usar o botão voltar e funcionar em hospedagem estática.

## Derivar em vez de duplicar

Lista filtrada é \`useMemo\` sobre posts, busca e tag. Um único lugar de verdade, nenhum bug de sincronização.` },
];
