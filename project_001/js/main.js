const PROJECTS = [
 [
  "Portfólio Pessoal",
  "Este site: apresentação, lista dos 50 projetos com busca e formulário de contato"
 ],
 [
  "Etch-a-Sketch",
  "Lousa mágica com pincel, borracha, seletor de cor e tamanho de grade, com suporte a toque"
 ],
 [
  "To-Do List",
  "Lista de tarefas com filtros e contadores, salva no navegador (localStorage)"
 ],
 [
  "Calculadora",
  "Calculadora com modo básico e científico, histórico e uso pelo teclado"
 ],
 [
  "Clima Atual",
  "Clima por cidade com dados simulados, alternância °C/°F e fundo que muda com o tempo"
 ],
 [
  "Pomodoro Timer",
  "Temporizador de foco e pausas com tarefa ativa, anel de progresso e sequência diária"
 ],
 [
  "Habit Tracker",
  "Acompanhamento de hábitos com sequências (streaks) e histórico semanal"
 ],
 [
  "Weather Dashboard",
  "Painel do tempo com previsão de 24 horas e 5 dias (dados simulados)"
 ],
 [
  "Gerador de Senhas",
  "Senhas seguras com opções de tamanho e caracteres, medidor de força e entropia"
 ],
 [
  "Controle de Finanças",
  "Receitas e despesas com filtros, gráficos, categorias e exportação em CSV"
 ],
 [
  "Quiz Interativo",
  "Quiz por categorias com cronômetro por pergunta e placar"
 ],
 [
  "Blog Simples",
  "Blog com lista de posts, filtros por categoria e leitura em modal"
 ],
 [
  "Sistema de Reservas",
  "Calendário de reservas com escolha de horário e confirmação"
 ],
 [
  "Loja Virtual",
  "Catálogo de produtos com carrinho de compras"
 ],
 [
  "Aplicativo de Notas",
  "Notas coloridas com busca, salvas no navegador"
 ],
 [
  "Jogo da Memória",
  "Jogo de pares de cartas com contador de jogadas"
 ],
 [
  "Conversor de Moedas",
  "Conversão entre moedas com histórico (taxas simuladas)"
 ],
 [
  "Gerador de Memes",
  "Editor de memes com texto sobre imagem e download do resultado"
 ],
 [
  "Aplicativo de Receitas",
  "Livro de receitas com categorias, busca e detalhes"
 ],
 [
  "Chat Simulado",
  "Salas de conversa simuladas com respostas automáticas e indicador de digitação"
 ],
 [
  "Dashboard de Analytics",
  "Painel com gráficos interativos de métricas"
 ],
 [
  "Editor de Texto Rich",
  "Editor de texto com formatação (negrito, listas, alinhamento)"
 ],
 [
  "Quiz Avançado",
  "Plataforma de quizzes com níveis, pontuação e resultados"
 ],
 [
  "Simulador de Física",
  "Simulação interativa de física com parâmetros ajustáveis"
 ],
 [
  "ProManager",
  "Gestão de processos jurídicos: cadastro, edição e filtro por status"
 ],
 [
  "EstoquePro",
  "Controle de estoque industrial com cadastro e alertas de produtos"
 ],
 [
  "Gerador de Diagramas de Fluxo",
  "Editor de fluxogramas com exportação em imagem"
 ],
 [
  "Leitor de Notícias",
  "Feed de notícias com busca, filtros e paginação"
 ],
 [
  "Portal de Notícias 360",
  "Portal de notícias com API simulada, categorias e métricas"
 ],
 [
  "Jogo da Velha",
  "Dois jogadores ou contra o computador, com placar e histórico"
 ],
 [
  "App de Meditação",
  "Sessões de meditação e respiração guiada com estatísticas"
 ],
 [
  "FinanceFlow",
  "Dashboard financeiro com transações, filtros e gráficos"
 ],
 [
  "Validador CPF/CNPJ",
  "Valida e formata CPF e CNPJ, com gerador de números válidos"
 ],
 [
  "Controle de Hábitos Avançado",
  "Metas diárias com contador, sequências e recompensas"
 ],
 [
  "Simulador de Investimentos",
  "Simulação de juros compostos com gráfico e tabela anual"
 ],
 [
  "Receitas com Modo Offline",
  "Receitas que continuam disponíveis sem internet (service worker)"
 ],
 [
  "Editor de Imagens",
  "Filtros, giro, espelhamento e download de imagens"
 ],
 [
  "Perguntas e Respostas",
  "Fórum de perguntas com respostas, votos e filtros"
 ],
 [
  "Controle de Gastos com Gráficos",
  "Despesas por categoria com gráficos mensais"
 ],
 [
  "Palavras Cruzadas",
  "Cruzadas em três níveis com dicas e verificação"
 ],
 [
  "Analisador de Texto",
  "Estatísticas de texto: palavras, frases e tempo de leitura"
 ],
 [
  "Kanban",
  "Quadro de tarefas com arrastar e soltar, salvo no navegador"
 ],
 [
  "Controle de Estoque",
  "Inventário com entradas, saídas e relatórios"
 ],
 [
  "Diagramas de Fluxo (v1)",
  "Primeira versão do editor de fluxogramas com formas arrastáveis"
 ],
 [
  "Simulador de Eletrônica",
  "Monte circuitos com bateria, resistor e LED e simule"
 ],
 [
  "Controle de Saúde",
  "Registro de pressão, glicose, peso e medicação, com relatórios"
 ],
 [
  "Gerador de Contratos",
  "Gera contratos a partir de um formulário, com pré-visualização"
 ],
 [
  "Avaliação de Produtos",
  "Avaliações com estrelas e comentários"
 ],
 [
  "Biblioteca Pessoal",
  "Acervo de livros com empréstimos e devoluções"
 ],
 [
  "Plataforma de Ensino",
  "Cursos com aulas, quizzes e certificado"
 ],
 ["TaskFlow", "Quadro de tarefas com prioridade, prazos e progresso", "React,TypeScript,Tailwind"],
 ["Painel de Cripto", "Preços simulados em tempo real, gráfico de velas e carteira", "React,TypeScript"],
 ["Habit Garden", "Hábitos que viram plantas conforme a sequência", "React,TypeScript,Jest"],
 ["Receitário", "Receitas com busca, porções e lista de compras", "React,TypeScript"],
 ["Quiz Dev", "30 perguntas de programação com tempo e recordes", "React,TypeScript"],
 ["Notas Markdown", "Editor com preview ao vivo e várias notas", "React,TypeScript"],
 ["Kanban Pro", "Quadro com arrastar e soltar e colunas editáveis", "React,TypeScript"],
 ["Foco Pomodoro", "Ciclos de foco com tarefas e gráfico semanal", "React,TypeScript,Jest"],
 ["Clima React", "Previsão simulada com 24 horas e 7 dias", "React,TypeScript"],
 ["Catálogo de Filmes", "Busca, filtros, favoritos e detalhes", "React,TypeScript"],
 ["Blog Next", "Blog com posts em Markdown, busca e tags", "Next.js,TypeScript"],
 ["SaaS Landing e Preços", "Página de preços com checkout em modo demonstração", "Next.js,TypeScript"],
 ["Link-in-bio", "Página de links com temas e contador de cliques", "Next.js,TypeScript"],
 ["Docs Site", "Documentação com busca, sumário e copiar código", "Next.js,TypeScript"],
 ["Auth JWT", "API de login com JWT e demo no navegador", "Node.js,Express,JWT"],
 ["To-Do API", "API de tarefas com validação e testes", "NestJS,TypeScript,Jest"],
 ["Encurtador de URLs", "Links curtos com contagem de cliques", "Node.js,SQLite"],
 ["Notas Full Stack", "Notas por usuário com login e API", "Express,SQLite,JWT"],
 ["Chat em Tempo Real", "Salas de chat com WebSocket", "WebSocket,Node.js"],
 ["Blog Full Stack", "Blog com banco de dados e painel de posts", "Next.js,SQLite"],
 ["Launchpad SaaS", "Cadastro, planos, painel e faturas (demonstração)", "React,TypeScript"],
 ["Lista em Tempo Real", "Lista sincronizada entre abas, no estilo Firebase", "TypeScript,Firebase API"],
 ["TypeScript Playground", "25 utilitários tipados com testes", "TypeScript,Jest"],
 ["Assistente IA para Devs", "Agentes e ferramentas com respostas simuladas", "React,TypeScript,IA"],
 ["Biblioteca de Componentes", "Botões, modais, tabs e toasts com código para copiar", "TypeScript,Tailwind"]
];

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
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            let st = document.getElementById('form-status');
            if (!st) { st = document.createElement('p'); st.id = 'form-status'; st.className = 'form-status'; st.setAttribute('role', 'status'); this.appendChild(st); }
            const btn = this.querySelector('button[type="submit"]');
            const data = Object.fromEntries(new FormData(this));
            if (data._honey) return;
            btn.disabled = true;
            st.textContent = 'Enviando…';
            try {
                const res = await fetch('https://formsubmit.co/ajax/caikx11@gmail.com', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ name: data.name, email: data.email, _subject: data.subject, message: data.message, _replyto: data.email, _template: 'table' })
                });
                const json = await res.json();
                if (!res.ok || json.success === 'false') throw new Error(json.message || 'Falha no envio');
                st.textContent = 'Mensagem enviada! Responderei em breve.';
                this.reset();
            } catch (err) {
                const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
                st.innerHTML = 'Não foi possível enviar agora. <a href="mailto:caikx11@gmail.com?subject=' + encodeURIComponent(data.subject) + '&body=' + body + '">Enviar pelo seu aplicativo de e-mail</a>.';
            } finally {
                btn.disabled = false;
            }
        });
    }

    // Lista de todos os 50 projetos do portfólio
    const portfolioProjects = Array.from({length: 75}, (_, i) => {
        const projectNumber = (i + 1).toString().padStart(3, '0');
        const [pTitle, pDescription, pTags] = PROJECTS[i];
        return {
            number: projectNumber,
            title: pTitle,
            description: pDescription,
            tags: pTags ? pTags.split(',') : ['HTML5', 'CSS3', 'JavaScript'],
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