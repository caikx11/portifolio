# PROJECT_CONTEXT.md - Projeto 031: Aplicativo de Meditação

## 1. Objetivo do projeto
Desenvolver um aplicativo de meditação interativo com temporizadores personalizáveis, meditações guiadas e exercícios de respiração, permitindo que os usuários pratiquem mindfulness e reduzam o estresse através de sessões guiadas ou autônomas.

## 2. Arquitetura (pastas e módulos principais, fluxo de dados)
```
project_031/
├── index.html          # Estrutura HTML principal
├── css/
│   └── style.css       # Todos os estilos e design visual
└── js/
    └── main.js         # Lógica e funcionalidades do aplicativo
```

**Fluxo de dados:**
- O aplicativo usa uma classe `MeditationApp` para gerenciar todo o estado
- Estado inclui: modo atual (timer/guided/breathing), durações do timer, estado de respiração, sons, estatísticas
- As estatísticas são persistentes usando `localStorage` (chave: 'meditation_stats')
- Sons são carregados via URLs externas (Google Actions sound library)
- Não há comunicação com backend - tudo é executado client-side

## 3. Tecnologias (linguagens, frameworks, versões relevantes, como rodar e testar)
- HTML5
- CSS3 (com variáveis CSS, flexbox)
- JavaScript ES6+ (classes, arrow functions, template literals)
- Web Audio API (para reprodução de sons de fundo e sino)
- LocalStorage (para persistência de estatísticas)
- Não requer frameworks externos ou build steps
- Para testar: abra `index.html` em qualquer navegador moderno

## 4. Regras obrigatórias (padrões, convenções, restrições do usuário)
- Todas as respostas devem estar em português (pt-BR)
- Manter foco em beleza e simplicidade no design
- Para projetos subsequentes (032-050), aumentar ligeiramente a complexidade
- Cada novo projeto deve encontrar e instalar uma nova skill
- Proseguir com os próximos passos sem aguardar aprovação explícita, a menos que bloqueado
- Para projetos de dashboard e visualização de dados, bibliotecas como Chart.js são recomendadas
- Sistemas de chat simulados são bons para praticar manipulação de estado
- Organizar dados em estruturas separadas facilita escalabilidade

## 5. Decisões tomadas (o quê e por quê)
- **Estrutura de modos**: Separado em Temporizador, Guiada e Respiração para facilitar navegação e foco em cada tipo de prática
- **Persistência de estatísticas**: Usando LocalStorage para manter histórico entre sessões sem necessidade de backend
- **Sons de fundo**: Utilizando links gratuitos da Google Actions Sound Library para evitar problemas de hospedagem e licenciamento
- **Visualização de respiração**: Círculo que expande/contrai com transições CSS suaves para feedback visual intuitivo
- **Controles de tempo**: Presets rápidos mais input customizado para flexibilidade
- **Notificação de conclusão**: Usando sino de taça tibetana e alert para indicar fim da sessão

## 6. Não alterar (arquivos, APIs, comportamentos que devem ficar como estão, e o motivo)
- **API de sons**: Manter os URLs do Google Actions Sound Library pois são confiáveis e gratuitos
- **Estrutura de classes JS**: Manter a classe `MeditationApp` como único ponto de entrada para evitar espalhamento de estado
- **Persistência via LocalStorage**: Manter a chave 'meditation_stats' para compatibilidade com versões anteriores
- **IDs dos elementos HTML**: Manter os IDs atuais pois são referenciados no JavaScript

## 7. Tarefas concluídas
- Estrutura básica do aplicativo com três modos de meditação
- Temporizador com presets e tempo customizável
- Sistema de sons de fundo com controle de volume
- Exercícios de respiração com padrões pré-definidos (4-7-8, Box, 4-4-6-2, customizado)
- Meditações guiadas pré-definidas com botões de reprodução
- Sistema de estatísticas (sessões totais, minutos meditados, streak de dias)
- Persistência de estatísticas usando LocalStorage
- Design responsivo para mobile e desktop
- Transições suaves para visualização de respiração
- Adicionar mais opções de sons de fundo (pássaros, noite, riacho, vento)
- Melhorar a visualização do círculo de respiração (transição mais suave com cubic-bezier e escala ajustada)
- Adicionar notificações nativas de fim de sessão (alert e notificações do navegador)

## 8. Pendências (priorizadas)
1. **Adicionar histórico detalhado de sessões** - Mostrar data/hora e tipo de cada sessão realizada
2. **Incluir opção de compartilhar conquistas** - Permitir compartilhar streak ou marcos nas redes sociais

## 9. Onde parei
**Último passo feito**: Implementação de notificações nativas de fim de sessão (alert e notificações do navegador) para o temporizador e exercícios de respiração.

**Próximo passo**: Começar a implementar a primeira pendência - adicionar histórico detalhado de sessões (data/hora e tipo de cada sessão).

**Arquivos e linhas envolvidos**:
- `js/main.js`: Precisará ser modificado para adicionar notificações do navegador quando a sessão terminar

**Comandos em andamento**: Nenhum no momento.

**Erro ainda não resolvido**: Nenhum identificado na revisão inicial.