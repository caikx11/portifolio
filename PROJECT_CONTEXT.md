# Objetivo do projeto
Criar um portfólio de 50 projetos diversos, cada um desenvolvido por agentes autônomos, utilizando metodologias de skills para padronização e qualidade. **OBJETIVO CONCLUÍDO**

# Arquitetura (pastas e módulos principais, fluxo de dados)
```
/portifolio
  /project_001          # Primeiro projeto: site de portfólio pessoal
    index.html
    /css
      style.css
    /js
      main.js
    /images
    /assets
  /project_002          # Segundo projeto: Landing page portfólio com HTML5/CSS3/JS vanilla
    index.html
    /css
      style.css
    /js
      main.js
  /project_003          # Terceiro projeto: Aplicativo de Gerenciamento de Tarefas (To-Do List) com localStorage
    index.html
    /css
      style.css
    /js
      main.js
  /project_004          # Quarto projeto: Calculadora Matemática com modo básico e científico
    index.html
    /css
      style.css
    /js
      main.js
  /project_005          # Quinto projeto: Aplicativo de Clima e Previsão do Tempo
    index.html
    /css
      style.css
    /js
      main.js
  /project_006          # Sexto projeto: Pomodoro Timer com gerenciamento de tarefas e estatísticas
    index.html
    /css
      style.css
    /js
      main.js
  /project_007          # Sétimo projeto: Habit Tracker com streaks, categorias e calendário semanal
    index.html
    /css
      style.css
    /js
      main.js
  /project_008          # Oitavo projeto: Weather Dashboard com previsão 5 dias, alertas e histórico
    index.html
    /css
      style.css
    /js
      main.js
  /project_009          # Nono projeto: Gerador de Senhas Seguras com medidor de força e histórico
    index.html
    /css
      style.css
    /js
      main.js
  /project_010          # Décimo projeto: Controle de Finanças Pessoais Avançado com abas de navegação, registro de transações, filtros, relatórios, exportação CSV, categorias personalizadas, temas claro/escuro e persistência em localStorage
    index.html
    /css
      style.css
    /js
      main.js
  /project_011          # Décimo primeiro projeto: Quiz Interativo com múltiplas categorias, cronometragem e placar
    index.html
    /css
      style.css
    /js
      main.js
    /questions
      historia.json
      ciencia.json
      tecnologia.json
      cultura-geral.json
  /project_012          # Décimo segundo projeto: Blog Simples com comentários e categorias
    index.html
    /css
      style.css
    /js
      main.js
    /posts
      post1.json
      post2.json
  /project_013          # Décimo terceiro projeto: Sistema de Reservas com calendário interativo
    index.html
    /css
      style.css
    /js
      main.js
  /project_014          # Décimo quarto projeto: Loja Virtual com carrinho de compras e catalogo de produtos
    index.html
    /css
      style.css
    /js
      main.js
    /products
      catalog.json
  /project_015          # Décimo quinto projeto: Aplicativo de Notas com categorização, busca e tags
    index.html
    /css
      style.css
    /js
      main.js
  /project_016          # Décimo sexto projeto: Jogo da Memória com múltiplos níveis e pontuação
    index.html
    /css
      style.css
    /js
      main.js
  /project_017          # Décimo sétimo projeto: Conversor de Moedas com taxa de câmbio em tempo real (simulada)
    index.html
    /css
      style.css
    /js
      main.js
  /project_018          # Décimo oitavo projeto: Gerador de Memes com upload de imagem e texto personalizável
    index.html
    /css
      style.css
    /js
      main.js
  /project_019          # Décimo nono projeto: Aplicativo de Receitas com filtros avançados por ingrediente, tempo e dificuldade
    index.html
    /css
      style.css
    /js
      main.js
    /recipes
      database.json
  /project_020          # Vigésimo projeto: Sistema de Chat Simulado com salas e histórico de mensagens
    index.html
    /css
      style.css
    /js
      main.js
    /chat-data
      rooms.json
      messages.json
  /project_021          # Vigésimo primeiro projeto: Dashboard de Analytics com gráficos interativos
    index.html
    /css
      style.css
    /js
      main.js
  /project_022          # Vigésimo segundo projeto: Editor de Texto Rich com formatação básica
    index.html
    /css
      style.css
    /js
      main.js
  /project_023          # Vigésimo terceiro projeto: Plataforma de Quiz Avançada com criação e compartilhamento de quizzes
    index.html
    /css
      style.css
    /js
      main.js
    /quizzes
      sample.json
  /project_024          # Vigésimo quarto projeto: Simulador de Física interativo (mola, pêndulo, projétil)
    index.html
    /css
      style.css
    /js
      main.js
  /project_025          # Vigésimo quinto projeto: Sistema de Gestão de Projetos (foco em áreas profissionais: Jurídico / Contábil / Engenharia)
    index.html
    /css
      style.css
    /js
      main.js
  /project_026          # Vigésimo sexto projeto: Aplicativo de Controle de Estoque com entrada/saída de produtos
    index.html
    /css
      style.css
    /js
      main.js
  /project_027          # Vigésimo sétimo projeto: Gerador de Diagramas de Fluxo com formas conectáveis
    index.html
    /css
      style.css
    /js
      main.js
  /project_028          # Vigésimo oitavo projeto: Aplicativo de Leitura de Notícias com categorização e busca
    index.html
    /css
      style.css
    /js
      main.js
  /project_029          # Vigésimo nono projeto: Portal de Notícias com API simulada e filtragem avançada
    index.html
    /css
      style.css
    /js
      main.js
    /api
      news-api.js
    /data
      news.json
  /project_030          # Trigésimo projeto: Jogo da Velha Online com placar e histórico de partidas
    index.html
    /css
      style.css
    /js
      main.js
  /project_031          # Trigésimo primeiro projeto: Aplicativo de Meditação com temporizadores personalizáveis e sons
    index.html
    /css
      style.css
    /js
      main.js
  /project_032          # Trigésimo segundo projeto: Dashboard Financeiro Profissional com gráficos interativos e análise de investimentos
    index.html
    /css
      style.css
    /js
      main.js
  /project_033          # Trigésimo terceiro projeto: Validador e Formatar de CPF/CNPJ com máscara, validação em tempo real e formatação de números
    index.html
    /css
      style.css
    /js
      main.js
  /project_034          # Trigésimo quarto projeto: Aplicativo de Controle de Hábitos avançado com metas e recompensas
    index.html
    /css
      style.css
    /js
      main.js
  /project_035          # Trigésimo quinto projeto: Simulador de Investimentos com gráficos de desempenho
    index.html
    /css
      style.css
    /js
      main.js
  /project_036          # Trigésimo sexto projeto: Aplicativo de Receitas com modo offline e favoritos
    index.html
    /css
      style.css
    /js
      main.js
    /recipes
      offline.json
  /project_037          # Trigésimo sétimo projeto: Editor de Imagens básico com filtros (brilho, contraste, saturação)
    index.html
    /css
      style.css
    /js
      main.js
  /project_038          # Trigésimo oitavo projeto: Sistema de Perguntas e Respostas comunitário com voting
    index.html
    /css
      style.css
    /js
      main.js
  /project_039          # Trigésimo nono projeto: Aplicativo de Controle de Gastos com gráficos de pizza e barras
    index.html
    /css
      style.css
    /js
      main.js
  /project_040          # Quadragésimo projeto: Jogo de Palavras Cruzadas com dicas e sistema de pontos
    index.html
    /css
      style.css
    /js
      main.js
  /project_041          # Quadragésimo primeiro projeto: Aplicativo de Análise de Texto (contagem de palavras, frases, legibilidade)
    index.html
    /css
      style.css
    /js
      main.js
  /project_042          # Quadragésimo segundo projeto: Sistema de Gestão de Projetos Kanban com arrastar e soltar
    index.html
    /css
      style.css
    /js
      main.js
  /project_043          # Quadragésimo terceiro projeto: Aplicativo de Controle de Estoque com entrada/saída de produtos
    index.html
    /css
      style.css
    /js
      main.js
  /project_044          # Quadragésimo quarto projeto: Gerador de Diagramas de Fluxo com formas conectáveis (CONCLUÍDO - VERSÃO INICIAL)
    index.html
    /css
      style.css
    /js
      main.js
    /shapes
      rectangle.json
      diamond.json
      circle.json
  /project_045          # Quadragésimo quinto projeto: Simulador de Eletrônica básica (circuitos com LED, resistores) (INICIANDO)
    index.html
    /css
      style.css
    /js
      main.js
    /components
      led.json
      resistor.json
      battery.json
      wire.json
  /project_046          # Quadragésimo sexto projeto: Aplicativo de Controle de Saúde (pressão arterial, glicose, medicação)
    index.html
    /css
      style.css
    /js
      main.js
  /project_047          # Quadragésimo sétimo projeto: Gerador de Contratos simples com cláusulas personalizáveis
    index.html
    /css
      style.css
    /js
      main.js
    /contracts
      templates.json
  /project_048          # Quadragésimo oitavo projeto: Sistema de Avaliação de Produtos com comentários e estrelas
    index.html
    /css
      style.css
    /js
      main.js
  /project_049          # Quadragésimo nono projeto: Aplicativo de Controle de Biblioteca pessoal com empréstimos e devoluções
    index.html
    /css
      style.css
    /js
      main.js
  /project_050          # Quinquinquagésimo projeto: Plataforma de Ensino com vídeo, quiz e certificado de conclusão
    index.html
    /css
      style.css
    /js
      main.js
    /courses
      course1.json
  AGENTS.md             # Configuração de skills de agente
  /docs
    /agents
      issue-tracker.md  # Configuração de rastreamento de issues (markdown local)
      domain.md         # Configuração de documentação de domínio (single-context)
```

# Tecnologias (linguagens, frameworks, versões relevantes, como rodar e testar)
- HTML5, CSS3, JavaScript (ES6+) para os projetos web
- Projetos futuros podem incluir: React, Node.js, Python, Flutter, etc.
- Para rodar: abrir arquivos HTML em navegador ou usar servidores locais (ex: python -m http.server)
- Para testar: testes manuais de funcionalidade e responsividade

# Regras obrigatórias (padrões, convenções, restrições do usuário)
- Responder sempre em português (pt-BR)
- Utilizar skills de agente para padronização de configuração (issue tracker, domain docs)
- Para cada projeto, buscar e instalar globalmente uma skill útil via /find-skills
- Manter os projetos com foco em beleza e simplicidade, não complexidade excessiva
- Não incluir segredos, chaves, senhas ou dados pessoais
- **Focar os próximos projetos em temas de áreas profissionais** (jurídico, contábil, engenharia, gestão, saúde, etc.), evitando quizzes e temas puramente recreativos.

# Decisões tomadas (o quê e por quê)
- Usar rastreamento de issues em markdown local (em .scratch/) pois não há repositório Git configurado
- Layout de documentação de domínio single-context (um GLOSSARY.md + docs/adr/ na raiz)
- Criar o arquivo AGENTS.md com as preferências do usuário e configuração de skills
- Para o projeto 001, criar um site de portfólio pessoal com layout moderno e responsivo
- Instalar a skill vercel-labs/agent-skills globalmente para obter diretrizes de design web e melhores práticas do React/Next.js
- Para o projeto 003, criar um aplicativo de To-Do List com localStorage e interface moderna
- Para o projeto 004, criar uma calculadora matemática com modo básico e científico, histórico de cálculos e design responsivo
- Para o projeto 002, criar uma landing page moderna com navegação suave, design responsivo e componentes interativos
- Para o projeto 005, criar um aplicativo de clima com busca de cidades, cartões informativos e design glassmorphism moderno
- Para o projeto 006, criar um Pomodoro Timer com gerenciamento de tarefas, estatísticas de produtividade e notificações sonoras
- Para o projeto 007, criar um Habit Tracker completo com contagem de sequências (streaks), categorização, calendário semanal e estatísticas
- Para o projeto 008, criar um Weather Dashboard avançado com previsão de 5 dias, alertas meteorológicos e histórico de cidades recentes
- Para o projeto 009, criar um Gerador de Senhas Seguras com medidor de força, opções personalizáveis, exclusão de caracteres similares e histórico
- Para o projeto 010, criar um Controle de Finanças Pessoais Avançado com registro de receitas/despesas, filtros, relatórios, exportação CSV, categorias personalizadas, temas e persistência em localStorage
- Para o projeto 011, criar um Quiz Interativo com múltiplas categorias (história, ciência, tecnologia, cultura geral), cronometragem por pergunta, placar final, feedback imediato e design responsivo
- Para o projeto 012, criar um Blog Simples com comentários, categorias e sistema de tags usando localStorage para armazenamento
- Para o projeto 013, desenvolver um Sistema de Reservas com calendário interativo para selecionar datas e horários disponíveis (Skill instalada: syncfusion-react-calendars, via agentes de pesquisa)
- Para o projeto 014, criar uma Loja Virtual com carrinho de compras, catálogo de produtos e processo de checkout simulado
- Para o projeto 015, desenvolver um Aplicativo de Notas com categorização, busca por tags e arquivamento
- Para o projeto 016, criar um Jogo da Memória com múltiplos níveis de dificuldade, sistema de pontuação e modo contra o tempo
- Para o projeto 017, desenvolver um Conversor de Moedas com taxa de câmbio simulada em tempo real e histórico de conversões
- Para o projeto 018, criar um Gerador de Memes com upload de imagem, posicionamento de texto e opções de compartilhamento
- Para o projeto 019, desenvolver um Aplicativo de Receitas com filtros avançados por ingrediente, tempo de preparo, dificuldade e tipo dietético
- Para o projeto 020, criar um Sistema de Chat Simulado com salas e histórico de mensagens e indicadores de digitação
- Para o projeto 021, criar um Dashboard de Analytics com gráficos interativos usando Chart.js
- Para o projeto 022, criar um Editor de Texto Rich com formatação básica (negrito, itálico, sublinhado, cores) e capacidade de exportar para HTML
- Para o projeto 023, criar uma Plataforma de Quiz Avançada com criação, compartilhamento e jogabilidade de quizzes personalizados
- Para o projeto 024, criar um Simulador de Física interativo (mola, pêndulo, projétil) com animações em Canvas e parâmetros ajustáveis
- Para o projeto 025, desenvolver o Sistema de Gestão de Projetos Profissional (ProManager)
- Para o projeto 026, desenvolver o Aplicativo de Controle de Estoque (EstoquePro)
- Para o projeto 027, desenvolver o Gerador de Diagramas de Fluxo com formas conectáveis
- Para o projeto 028, desenvolver o Aplicativo de Leitura de Notícias com categorização e busca
- Para o projeto 029, desenvolver o Portal de Notícias com API simulada, filtragem avançada, múltiplas visualizações e painel de métricas
- Para o projeto 030, desenvolver o Jogo da Velha Online com IA (Minimax), placar e histórico
- Para o projeto 030, desenvolver o Jogo da Velha Online com placar e histórico de partidas
- Para o projeto 031, desenvolver o Aplicativo de Meditação com temporizadores personalizáveis e sons
- Para o projeto 032, desenvolver o Dashboard Financeiro Profissional com gráficos interativos e análise de investimentos
- Para o projeto 033, desenvolver o Validador e Formatar de CPF/CNPJ com máscara, validação em tempo real e formatação de números
- Para o projeto 034, desenvolver o Aplicativo de Controle de Hábitos avançado com metas e recompensas
- Para o projeto 035, desenvolver o Simulador de Investimentos com gráficos de desempenho
- Para o projeto 036, desenvolver o Aplicativo de Receitas com modo offline e favoritos
- Para o projeto 037, desenvolver o Editor de Imagens básico com filtros (brilho, contraste, saturação)
- Para o projeto 038, desenvolver o Sistema de Perguntas e Respostas comunitário com voting
- Para o projeto 039, desenvolver o Aplicativo de Controle de Gastos com gráficos de pizza e barras
- Para o projeto 040, desenvolver o Jogo de Palavras Cruzadas com dicas e sistema de pontos
- Para o projeto 041, desenvolver o Analisador de Texto com métricas de palavras, caracteres, frases, parágrafos, índices de legibilidade (Flesch, Gunning Fog, SMOG, etc.) e frequência de palavras
- Para o projeto 042, desenvolver o Sistema de Gestão de Projetos Kanban com arrastar e soltar (Skill instalada: syncfusion-javascript-kanban)
- Para o projeto 043, desenvolver o Aplicativo de Controle de Estoque com entrada/saída de produtos
- Para o projeto 044, desenvolver o Gerador de Diagramas de Fluxo com formas conectáveis usando a skill archify instalada
- Para o projeto 045, desenvolver o Simulador de Eletrônica básica (circuitos com LED, resistores, bateria, fios) - **CONCLUÍDO**
- Para o projeto 045, implementar análise nodal completa com modelagem DC de capacitores/indutores
- Para o projeto 045, implementar análise transiente no domínio do tempo com integração trapezoidal
- Para o projeto 045, adicionar exportação SPICE, PNG e SVG
- Para o projeto 046, desenvolver o Aplicativo de Controle de Saúde (pressão arterial, glicose, medicação) (área profissional: saúde/medicina)
- Para o projeto 047, desenvolver o Gerador de Contratos simples com cláusulas personalizáveis (área profissional: jurídico) - **CONCLUÍDO**
- Para o projeto 048, desenvolver o Sistema de Avaliação de Produtos com comentários e estrelas (área profissional: comércio/consumo) - **CONCLUÍDO**
- Para o projeto 049, desenvolver o Aplicativo de Controle de Biblioteca pessoal com empréstimos e devoluções (área profissional: educação/gestão) - **CONCLUÍDO**
- Para o projeto 050, desenvolver a Plataforma de Ensino com vídeo, quiz e certificado de conclusão (área profissional: educação/tecnologia) - **CONCLUÍDO**

# Não alterar (arquivos, APIs, comportamentos que devem ficar como estão, e o motivo)
- AGENTS.md: contém as preferências do usuário que devem ser mantidas em todas as sessões
- docs/agents/issue-tracker.md: define o método de rastreamento de issues para o projeto
- docs/agents/domain.md: define o layout de documentação de domínio
- Estrutura básica de pastas dos projetos 001-050: deve ser mantida para organização

# Tarefas concluídas
1. ✅ Configuração inicial do repositório com AGENTS.md e docs/agents/
... (lista completa de tarefas concluídas anteriores, omitida para concisão)
73. ✅ Desenvolvimento do projeto 043 - Aplicativo de Controle de Estoque com entrada/saída de produtos
74. ✅ Criação da estrutura de pastas e arquivos iniciais para o projeto 044 - Gerador de Diagramas de Fluxo com formas conectáveis
75. ✅ Desenvolvimento inicial do projeto 044 - Gerador de Diagramas de Fluxo com formas conectáveis (versão básica funcional)
76. ✅ Desenvolvimento do projeto 029 - Portal de Notícias com API simulada, filtragem avançada, múltiplas visualizações (grade/lista/métricas) e painel de dashboard
77. ✅ Desenvolvimento do projeto 030 - Jogo da Velha Online com IA (Minimax), placar e histórico

# Pendências (prioritárias)
1. ~~Melhorar o projeto 044 - Gerador de Diagramas de Fluxo com formas conectáveis.~~ ✅ **CONCLUÍDO**
   a. ✅ Adicionar funcionalidade de salvar/carregar diagramas (localStorage + botões)
   b. ✅ Implementar mais formas (triângulo, paralelogramo, elipse, hexágono)
   c. ✅ Adicionar opções de estilo avançadas (cores de preenchimento/borda, espessura, fonte)
   d. ✅ Melhorar a experiência de conexão entre formas (snap-to-grid, highlight visual, drag-and-drop)
   e. ✅ Adicionar exportação para PNG/JPEG além de SVG
   f. ✅ Desenvolver o projeto com foco em beleza e simplicidade, seguindo as decisões documentadas acima
2. ~~Continuar o desenvolvimento do projeto 045 - Simulador de Eletrônica básica (circuitos com LED, resistores) (área profissional: engenharia/eletrônica).~~ ✅ **CONCLUÍDO**
   a. ✅ Implementar lógica de conexão entre componentes (com update de conexões automático)
   b. ✅ Desenvolver sistema de simulação de circuitos básicos (Lei de Ohm + cálculo de corrente/tensão)
   c. ✅ Adicionar visualização de corrente e tensão nos componentes (pontos de conexão com valores em tempo real)
   d. ✅ Desenvolver o projeto com foco em beleza e simplicidade, seguindo as decisões documentadas acima
   e. ✅ Adicionar suporte a mais tipos de componentes (transistor BJT NPN/PNP, diodo Zener)
   f. ✅ Melhorar a interface de conexão (snap-to-terminal, highlight visual, animação de pulso)
   g. ✅ Adicionar validação de circuitos (detecção de laços abertos, curtos-circuitos, nós flutuantes, componentes desconectados)
   h. ✅ Implementar salvar/carregar circuitos em localStorage com restauração completa
   i. ✅ Implementar modelagem de capacitor e indutor em análise DC (circuito aberto/curto-circuito)
   j. ✅ Adicionar análise transiente básica para capacitores e indutores (integração trapezoidal)
   k. ✅ Adicionar exportação de imagem do circuito (PNG/SVG)
   l. ✅ Corrigir bugs de sintaxe e testar no navegador
3. ~~Desenvolver o projeto 046 - Aplicativo de Controle de Saúde (pressão arterial, glicose, medicação) (área profissional: saúde/medicina).~~ ✅ **CONCLUÍDO**
   a. ✅ Implementar módulos de Pressão Arterial, Glicose, Medicação e Peso/IMC
   b. ✅ CRUD completo de entradas com validação e persistência em localStorage
   c. ✅ Interface sidebar com navegação entre módulos
   d. ✅ Formulários dinâmicos com validação de campos e placeholders
   e. ✅ Relatórios com gráficos interativos (Chart.js) para tendências temporais
   f. ✅ Exportação/Importação de dados em JSON
   g. ✅ Limpeza de dados com confirmação
   h. ✅ UX aprimorado: teclas de atalho (Escape para fechar), foco automático, data/hora padrão
4. ~~Iniciar o projeto 047 - Gerador de Contratos simples com cláusulas personalizáveis~~ ✅ **CONCLUÍDO**
   a. ✅ Estrutura básica de pastas criada (index.html, css/, js/, contracts/)
   b. ✅ Modelo de dados implementado para 4 tipos de contrato (prestação de serviços, locação, parceria, NDA)
   c. ✅ Formulários dinâmicos para cada tipo de contrato com validação
   d. ✅ Geração automática de texto contratual baseado nos dados preenchidos
   e. ✅ Funcionalidade de salvar/carregar contratos em localStorage
   f. ✅ Exportação para PDF e impressão
   g. ✅ Interface responsiva com sidebar, toolbar e painel de propriedades
   h. ✅ UX aprimorado: teclas de atalho (Escape), foco automático, validação em tempo real

# Tarefas concluídas (adicionais)
76. ✅ Desenvolvimento do projeto 029 - Portal de Notícias com API simulada, filtragem avançada, múltiplas visualizações (grade/lista/métricas) e painel de dashboard
77. ✅ Desenvolvimento do projeto 030 - Jogo da Velha Online com IA (Minimax), placar e histórico
78. ✅ Criação da estrutura inicial do projeto 045 - Simulador de Eletrônica básica
79. ✅ Implementação da análise nodal básica (construção da matriz de condutância e solução do sistema linear)
80. ✅ Implementação da visualização de resultados (tensões nos nós, correntes e potências nos ramos)
81. ✅ Adição de componentes BJT NPN, BJT PNP e Diodo Zener com modelagem matemática
82. ✅ Implementação de snap-to-terminal e highlight visual para conexões
83. ✅ Implementação de validação de circuitos e persistência em localStorage
84. ✅ Desenvolvimento do projeto 046 - Aplicativo de Controle de Saúde completo

# Onde parei: exatamente o último passo feito, o próximo passo, arquivos e linhas envolvidos, comandos em andamento e qualquer erro ainda não resolvido
Último passo: **Auditoria e correção de todos os 50 projetos do portfólio**:
- Verificado todos os 50 projetos para problemas funcionais e visuais
- Corrigido erros de sintaxe, elementos ausentes e problemas de template literals
- Validado que o hub de projetos (projeto 001) exibe todos os 50 projetos ao clicar em "Ver meus projetos"
- Confirmado temas visuais únicos para cada projeto
- Validado funcionalidade do simulador de eletrônica (projeto 045)
- Preparado materiais para apresentação final do portfólio

Próximo passo: **Portfólio completo e pronto para apresentação!** Todos os 50 projetos desenvolvidos com sucesso, cada um com tema visual único e funcionalidade completa.

Arquivos envolvidos (revisão final):
- C:\Users\caio_\OneDrive\Documentos\portifolio\PROJECT_CONTEXT.md (documento de contexto atualizado)
- C:\Users\caio_\OneDrive\Documentos\portifolio\project_001-050\ (todos os projetos verificados)
Comandos em andamento: Nenhum
Erros ainda não resolvidos: Nenhum