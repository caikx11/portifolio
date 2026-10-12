// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.createElement('div');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    const nav = document.querySelector('nav');
    nav.insertBefore(mobileMenuToggle, nav.querySelector('.logo'));

    const navUl = nav.querySelector('ul');
    mobileMenuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navUl.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navUl.classList.remove('active');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form submission handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would typically send the form data to a server
            // For now, we'll just show a success message
            let st = document.getElementById('form-status');
            if (!st) { st = document.createElement('p'); st.id = 'form-status'; st.className = 'form-status'; st.setAttribute('role', 'status'); this.appendChild(st); }
            st.textContent = 'Obrigado pela mensagem! (Demonstração: nada é enviado a um servidor.)';
            this.reset();
        });
    }

    // Lista de todos os 50 projetos do portfólio
    const portfolioProjects = Array.from({length: 50}, (_, i) => {
        const projectNumber = (i + 1).toString().padStart(3, '0');
        const titles = {
            1: 'Portfólio Pessoal', 2: 'Etch-a-Sketch', 3: 'To-Do List', 4: 'Calculadora',
            5: 'Clima Atual', 6: 'Pomodoro Timer', 7: 'Habit Tracker', 8: 'Weather Dashboard',
            9: 'Gerador de Senhas', 10: 'Controle de Finanças', 11: 'Quiz Interativo', 12: 'Blog Pessoal',
            13: 'Gerenciador de Tarefas', 14: 'Agenda Digital', 15: 'Aplicativo de Notas', 16: 'Conversor de Moedas',
            17: 'Lista de Compras', 18: 'Controle de Gastos', 19: 'Sistema de Login', 20: 'Chat Simulado',
            21: 'API de Notícias', 22: 'Gerador de Códigos QR', 23: 'Contador de Palavras', 24: 'Validador de Formulários',
            25: 'ProManager', 26: 'Sistema de Reservas', 27: 'Catálogo de Produtos', 28: 'Gerenciador de Arquivos',
            29: 'Notícias em Tempo Real', 30: 'Jogo da Velha', 31: 'Visualização de Dados', 32: 'Dashboard Interativo',
            33: 'Sistema de Autenticação', 34: 'Gerenciador de Equipe', 35: 'Painel Administrativo', 36: 'E-commerce',
            37: 'Rede Social Simples', 38: 'Sistema de Votação', 39: 'Gerenciador de Templates', 40: 'Conversor de Imagens',
            41: 'Analisador de Texto', 42: 'Quadro Kanban', 43: 'Controle de Estoque', 44: 'Gerador de Diagramas',
            45: 'Simulador de Eletrônica', 46: 'Controle de Saúde', 47: 'Gerador de Contratos', 48: 'Avaliação de Produtos',
            49: 'Controle de Biblioteca', 50: 'Plataforma de Ensino'
        };

        const descriptions = {
            1: 'Site de portfólio pessoal com layout moderno e responsivo para apresentar habilidades e projetos',
            2: 'Lousa mágica em grade com pincel, arco-íris, sombra e paleta de cores',
            3: 'Aplicativo de gerenciamento de tarefas com armazenamento em localStorage, filtros e estatísticas',
            4: 'Calculadora matemática com modos básico e científico, histórico de cálculos e design responsivo',
            5: 'Aplicativo de clima com previsão do tempo, busca por cidades e exibição de informações meteorológicas',
            6: 'Timer Pomodoro com gerenciamento de tarefas, estatísticas de produtividade e notificações sonoras',
            7: 'Rastreador de hábitos com sequências (streaks), categorização, calendário semanal e métricas de progresso',
            8: 'Dashboard meteorológico com previsão de 5 dias, alertas meteorológicos e histórico de cidades pesquisadas',
            9: 'Gerador de senhas seguras com medidor de força, opções personalizáveis e histórico de senhas geradas',
            10: 'Controle avançado de finanças pessoais com registro de transações, filtros, relatórios e exportação CSV',
            11: 'Quiz interativo com múltiplas categorias, cronometragem por pergunta, placar e feedback imediato',
            12: 'Blog simples com sistema de posts, comentários, categorias e armazenamento em localStorage',
            13: 'Sistema de gerenciamento de tarefas com prioridades, prazos e organização por projetos',
            14: 'Agenda digital compromissada com visualização por dia, semana e mês, além de lembretes',
            15: 'Aplicativo de notas com categorização, busca por tags, arquivamento e sincronização',
            16: 'Conversor de moedas com taxa de câmbio em tempo real (simulada), histórico de conversões e gráficos',
            17: 'Lista de compras inteligente com categorização de produtos, preços e compartilhamento',
            18: 'Controle de gastos com gráficos interativos, categorização de despesas e metas de economia',
            19: 'Sistema de autenticação com login, registro, recuperação de senha e validação de formulários',
            20: 'Simulador de chat com salas de discussão, histórico de mensagens e indicadores de digitação',
            21: 'API de notícias simulada com endpoints para buscar, filtrar e categorizar notícias por tema',
            22: 'Gerador de códigos QR com personalização de design, cores e download em diferentes formatos',
            23: 'Contador de palavras e caracteres com análise de legibilidade, densidade de palavras e estatísticas de texto',
            24: 'Validador de formulários em tempo real com máscaras de entrada e feedback visual instantâneo',
            25: 'ProManager - Sistema profissional de gestão de projetos com tarefas, marcos e alocação de recursos',
            26: 'Sistema de reservas com calendário interativo, seleção de horários e confirmação de agendamentos',
            27: 'Catálogo de produtos com carrinho de compras, filtros de busca e processo de checkout simulado',
            28: 'Gerenciador de arquivos com upload, download, organização por pastas e visualização de documentos',
            29: 'Portal de notícias em tempo real com atualizações automáticas, filtros por categoria e modo escuro',
            30: 'Jogo da velha online com modo dois jogadores, contra o computador (IA Minimax) e histórico de partidas',
            31: 'Ferramenta de visualização de dados com gráficos interativos, filtros dinâmicos e exportação de relatórios',
            32: 'Dashboard interativo com métricas em tempo real, widgets personalizáveis e drill-down de dados',
            33: 'Sistema de autenticação avançado com login social, JWT, refresh tokens e controle de acesso por roles',
            34: 'Painel de gerenciamento de equipe com perfis, atribuição de tarefas, controle de ponto e relatórios',
            35: 'Painel administrativo completo com gestão de usuários, permissões, configurações do sistema e logs',
            36: 'Plataforma de e-commerce com catálogo de produtos, carrinho, processo de checkout e integração de pagamentos',
            37: 'Rede social simples com perfil de usuários, publicações, comentários, curtir e sistema de seguir',
            38: 'Sistema de votação e enquetes com criação de pesquisas, opções múltiplas e resultados em tempo real',
            39: 'Gerenciador de templates com biblioteca de modelos, personalização e geração de documentos',
            40: 'Conversor de imagens com redimensionamento, conversão de formato e aplicação de filtros básicos',
            41: 'Analisador de texto com contagem de palavras, frases, caracteres, parágrafos e índices de legibilidade',
            42: 'Quadro Kanban com arrastar e soltar, colunas personalizáveis, limites de WIP e relatórios de fluxo',
            43: 'Sistema profissional de controle de estoque com entrada/saída de produtos, relatórios e alertas de reposição',
            44: 'Gerador de diagramas de fluxo com formas conectáveis, edição de propriedades e exportação para múltiplos formatos',
            45: 'Simulador de eletrônica básica com componentes como LED, resistores, baterias e análise de circuitos em tempo real',
            46: 'Aplicativo de controle de saúde com monitoramento de pressão arterial, glicose, medicação e relatórios médicos',
            47: 'Gerador de contratos simples com cláusulas personalizáveis, pré-visualização em tempo real e exportação para PDF',
            48: 'Sistema de avaliação de produtos com sistema de estrelas, comentários detalhados e análise de sentimento',
            49: 'Aplicativo de controle de biblioteca pessoal com empréstimos, devoluções, busca de obras e histórico de leituras',
            50: 'Plataforma de ensino com vídeo-aulas, quizzes interativos, sistema de certificação e acompanhamento de progresso'
        };
        return {
            number: projectNumber,
            title: titles[i + 1] || `Projeto ${projectNumber}`,
            description: descriptions[i + 1] || `Projeto ${projectNumber} do portfólio com funcionalidades específicas e design único.`,
            tags: ['HTML5', 'CSS3', 'JavaScript'],
            link: `../project_${projectNumber}/index.html`
        };
    });

    // Generate project cards dynamically from portfolio
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) {
        portfolioProjects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
                <div class="project-image">
                    <div class="image-placeholder">
                        <span>${project.number}</span>
                    </div>
                </div>
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-tags">
                        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        <a href="${project.link}" class="btn-link">Ver Projeto</a>
                    </div>
                </div>
            `;
            projectsGrid.appendChild(projectCard);
        });
    }
    const search = document.getElementById('project-search');
    if (search) {
        search.addEventListener('input', () => {
            const q = search.value.trim().toLowerCase();
            let shown = 0;
            document.querySelectorAll('.project-card').forEach(card => {
                const ok = card.textContent.toLowerCase().includes(q);
                card.hidden = !ok;
                if (ok) shown++;
            });
            document.getElementById('no-results').hidden = shown > 0;
        });
    }
    const fadeElements = document.querySelectorAll('.fade-in-up');
    if (fadeElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        fadeElements.forEach(el => {
            observer.observe(el);
        });
    }

    // Add active class to nav links based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav ul li a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
});