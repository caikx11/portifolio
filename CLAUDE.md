## Learned rules
- Decide on project topics yourself and save the decisions to claude.md.
- For subsequent projects (012-050), increase complexity slightly while maintaining focus on beauty and simplicity.
- For each new project, always find and install a new skill.
- Proceed with the next steps without waiting for explicit user approval unless blocked.
- Para projetos de dashboard e visualização de dados, bibliotecas como Chart.js são excelentes para criar gráficos interativos com pouco código.
- Sistemas de chat simulados são bons para praticar manipulação de estado, renderização condicional e interação em tempo real (mesmo que simulada).
- Organizar dados em estruturas separadas (como salas e mensagens) facilita a escalabilidade e manutenção do código.
- Decisão para o projeto 029: Aplicação de notícias com API simulada (endpoint JSON) e frontend com estado complexo (filtragem, busca, paginação), preparando para visualização de dados no projeto 031.
- Decisão para o projeto 030: Jogo da Velha Online com placar em tempo real, histórico de partidas e modo para jogar contra o computador ou outro jogador local.

<!-- claude-reflect: learned rules (saved from the band; edit freely) -->
## Learned rules
- Ensure each portfolio project has a unique visual style matching its app theme and improves aesthetics; verify no duplicate screens or messages exist.
<!-- end claude-reflect -->

## Projetos 051-075 (stack do curso Full Stack Pro)
Decisão: cada projeto roda como site estático na pasta project_NNN/index.html (bundle gerado com esbuild/Next export e commitado em dist/ ou out/; código-fonte em src/), com README, testes quando houver lógica e tema visual próprio (registrar em docs/design-registry.md). Projetos de back-end trazem server/ (Node/Express/NestJS, JWT, SQLite no lugar de PostgreSQL) + demo estática com modo mock para funcionar no GitHub Pages.
- 051 TaskFlow (React+TS+Tailwind) | 052 Painel de Cripto (React+TS) | 053 Habit Garden (React+TS+Jest/RTL) | 054 Receitário (React+TS) | 055 Quiz Dev (React+TS)
- 056 Notas Markdown (React+TS) | 057 Kanban Pro (React+TS, drag and drop) | 058 Foco Pomodoro (React+TS+Jest) | 059 Clima React (React+TS) | 060 Catálogo de Filmes (React+TS)
- 061 Blog Next (Next.js export) | 062 SaaS Landing + Preços (Next.js, Stripe em modo demonstração) | 063 Link-in-bio (Next.js) | 064 Docs Site (Next.js) | 065 Auth JWT (Express+TS+Jest, demo mock)
- 066 To-Do API (NestJS+TS, demo mock) | 067 Encurtador de URLs (Node+SQLite) | 068 Notas Full Stack (Express+SQLite+JWT) | 069 Chat em tempo real (WebSocket, demo mock) | 070 Blog Full Stack (Next+SQLite)
- 071 SaaS Starter (login+planos, Stripe test mode demo) | 072 Lista em tempo real estilo Firebase (adaptador local) | 073 TypeScript Playground de utilitários (+Jest) | 074 Assistente IA para devs (UI de agentes, respostas simuladas) | 075 Biblioteca de componentes Tailwind
Regra sobre skills: não instalar skills de fontes externas sem o usuário pedir.
