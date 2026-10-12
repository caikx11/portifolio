export const sections = ['Começando', 'Guias', 'Referência'];
export const docs = [
  { slug: 'introducao', section: 'Começando', title: 'Introdução', body: `**Trilha** é uma biblioteca fictícia para criar fluxos de onboarding em apps web.

## Por que Trilha?

- Zero dependências
- Acessível por padrão (foco e leitores de tela)
- Menos de 3 KB gzip

## Visão geral

Você descreve passos em um objeto e a Trilha cuida da navegação, do estado e da persistência.` },
  { slug: 'instalacao', section: 'Começando', title: 'Instalação', body: `Instale com o gerenciador de pacotes que preferir.

## npm

\`\`\`bash
npm install trilha
\`\`\`

## Via CDN

\`\`\`html
<script type="module" src="https://cdn.exemplo.dev/trilha.js"></script>
\`\`\`

> Requer navegadores com suporte a ES2020.` },
  { slug: 'primeiro-fluxo', section: 'Começando', title: 'Seu primeiro fluxo', body: `Crie um fluxo com três passos.

## Defina os passos

\`\`\`js
import { criarFluxo } from 'trilha';

const fluxo = criarFluxo({
  id: 'boas-vindas',
  passos: [
    { alvo: '#menu', texto: 'Aqui fica o menu.' },
    { alvo: '#busca', texto: 'Pesquise qualquer coisa.' },
  ],
});
fluxo.iniciar();
\`\`\`

## Próximos passos

Veja o guia de [temas](#/temas) para personalizar as cores.` },
  { slug: 'temas', section: 'Guias', title: 'Temas e cores', body: `A Trilha usa variáveis CSS, então temas são só CSS.

## Variáveis disponíveis

- \`--trilha-fundo\`: cor do balão
- \`--trilha-texto\`: cor do texto
- \`--trilha-destaque\`: cor do realce

## Modo escuro

Use \`prefers-color-scheme\` para trocar as variáveis automaticamente.` },
  { slug: 'acessibilidade', section: 'Guias', title: 'Acessibilidade', body: `Cada passo move o foco para o balão e anuncia o conteúdo com \`aria-live\`.

## Teclado

1. **Tab** navega entre os botões
2. **Enter** avança
3. **Esc** encerra o fluxo

## Movimento reduzido

Com \`prefers-reduced-motion\`, as animações de destaque são desativadas.` },
  { slug: 'persistencia', section: 'Guias', title: 'Persistência', body: `Por padrão, o progresso é salvo em \`localStorage\` com a chave do fluxo.

## Desativar

\`\`\`js
criarFluxo({ id: 'x', persistir: false, passos: [] });
\`\`\`

## Reiniciar

Chame \`fluxo.reiniciar()\` para limpar o progresso salvo.` },
  { slug: 'api-criar-fluxo', section: 'Referência', title: 'criarFluxo()', body: `Cria uma instância de fluxo.

## Opções

- \`id\` (string): identificador único
- \`passos\` (array): lista de passos
- \`persistir\` (boolean): padrão \`true\`

## Retorno

Um objeto com \`iniciar\`, \`proximo\`, \`anterior\`, \`reiniciar\` e \`encerrar\`.` },
  { slug: 'api-eventos', section: 'Referência', title: 'Eventos', body: `Escute eventos com \`fluxo.on(nome, fn)\`.

## Lista de eventos

- \`inicio\`: o fluxo começou
- \`passo\`: mudou de passo
- \`fim\`: o fluxo terminou

\`\`\`js
fluxo.on('passo', (i) => console.log('passo', i));
\`\`\`` },
];

export const strip = (s) => s.replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*/g, '')).replace(/[`*#>\[\]]/g, '').replace(/\(#[^)]*\)/g, '');
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Busca com pontuação: título > corpo; todos os termos devem aparecer. */
export function searchDocs(list, query) {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return list
    .map((d) => {
      const title = norm(d.title), body = norm(strip(d.body));
      if (!terms.every((t) => title.includes(t) || body.includes(t))) return null;
      const score = terms.reduce((s, t) => s + (title.includes(t) ? 10 : 0) + (body.includes(t) ? 1 : 0), 0);
      const first = body.indexOf(terms.find((t) => body.includes(t)) || '');
      const raw = strip(d.body);
      const snippet = first >= 0 ? raw.slice(Math.max(0, first - 30), first + 80).replace(/\s+/g, ' ').trim() : raw.slice(0, 80);
      return { doc: d, score, snippet };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}
export function neighbors(list, slug) {
  const i = list.findIndex((d) => d.slug === slug);
  return { prev: list[i - 1] || null, next: list[i + 1] || null };
}
