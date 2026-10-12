class NewsReader {
    constructor() {
        this.container = document.querySelector('.container');
        this.searchInput = document.getElementById('search-input');
        this.categoryFilter = document.getElementById('category-filter');
        this.refreshBtn = document.getElementById('refresh-btn');
        this.categoryList = document.getElementById('category-list');
        this.newsGrid = document.getElementById('news-grid');
        this.newsDetail = document.getElementById('news-detail');
        this.closeDetailBtn = document.getElementById('close-detail');
        this.detailTitle = document.getElementById('detail-title');
        this.detailCategory = document.getElementById('detail-category');
        this.detailDate = document.getElementById('detail-date');
        this.detailContent = document.getElementById('detail-content');

        this.newsData = [];
        this.filteredNews = [];
        this.currentCategory = 'all';
        this.searchTerm = '';

        this.init();
    }

    init() {
        // Event listeners
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterNews();
        });

        this.categoryFilter.addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.filterNews();
        });

        this.refreshBtn.addEventListener('click', () => this.loadNews());

        // Category sidebar listeners
        this.categoryList.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                // Update active state
                this.categoryList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                e.target.classList.add('active');

                // Update filter
                this.currentCategory = e.target.dataset.category;
                this.categoryFilter.value = this.currentCategory;
                this.filterNews();
            }
        });

        // Close detail panel
        this.closeDetailBtn.addEventListener('click', () => {
            this.newsDetail.classList.remove('active');
        });

        // Close on outside click
        this.newsDetail.addEventListener('click', (e) => {
            if (e.target === this.newsDetail) {
                this.newsDetail.classList.remove('active');
            }
        });

        // Load initial news
        this.loadNews();
    }

    async loadNews() {
        // Show loading state
        this.showLoading();

        try {
            // In a real application, this would fetch from an API
            // For this demo, we'll simulate with static data
            await this.fetchMockNews();

            // Apply filters
            this.filterNews();

            // Hide loading state
            this.hideLoading();
        } catch (error) {
            console.error('Error loading news:', error);
            this.showError('Erro ao carregar notícias. Por favor, tente novamente.');
        }
    }

    async fetchMockNews() {
        try {
            // Fetch real news data from JSON file
            const response = await fetch('news/articles.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.newsData = await response.json();
        } catch (error) {
            console.error('Error fetching news:', error);
            // Fallback to mock data if fetch fails
            await this.fetchMockNewsFallback();
        }
    }

    async fetchMockNewsFallback() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock news data
        const categories = [
            'tecnologia',
            'esportes',
            'politica',
            'entretenimento',
            'saude'
        ];

        const sources = [
            'BBC News',
            'Reuters',
            'Associated Press',
            'CNN',
            'The Guardian',
            'TechCrunch',
            'ESPN',
            'Politico',
            'Variety',
            'WebMD'
        ];

        // Generate mock news articles
        this.newsData = [];

        for (let i = 1; i <= 20; i++) {
            const categoryIndex = Math.floor(Math.random() * categories.length);
            const sourceIndex = Math.floor(Math.random() * sources.length);
            const daysAgo = Math.floor(Math.random() * 7);

            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            this.newsData.push({
                id: i,
                title: this.generateMockTitle(categories[categoryIndex]),
                category: categories[categoryIndex],
                source: sources[sourceIndex],
                date: date.toISOString().split('T')[0],
                summary: this.generateMockSummary(categories[categoryIndex]),
                content: this.generateMockContent(categories[categoryIndex]),
                imageUrl: `https://picsum.photos/seed/news${i}/800/400`
            });
        }
    }

    generateMockTitle(category) {
        const titlesByCategory = {
            tecnologia: [
                'Nova atualização do sistema operacional promete melhorias significativas de desempenho',
                'Empresa de tecnologia lança dispositivo revolucionário para saúde',
                'Inteligência artificial alcança novo marco no diagnóstico médico',
                'Start-up desenvolve bateria que dura uma semana com carregamento rápido',
                'Gigante das redes sociais anuncia nova política de privacidade'
            ],
            esportes: [
                'Time local conquista vitória emocionante nos minutos finais',
                'Atleta quebra recorde mundial em competição internacional',
                'Técnico anuncia nova estratégia para a próxima temporada',
                'Lesão de jogador estrela preocupa comissão técnica',
                'Federação confirma mudanças no regulamento do campeonato'
            ],
            politica: [
                'Governo anuncia novo pacote de incentivos para pequenas empresas',
                'Deputados aprovam projeto de lei sobre reforma tributária',
                'Líderes mundiais se reúnem para discutir mudanças climáticas',
                'Tribunal decide sobre caso que pode mudar precedente legal',
                'Candidato divulga plano de governo focado em educação e saúde'
            ],
            entretenimento: [
                'Filme de quebra de bilheteria estreia nos cinemas nesta semana',
                'Artista internacional anuncia turnê mundial para 2025',
                'Série televisiva ganha prêmio importante de crítica',
                'Festival de música confirma atrações para edição deste ano',
                'Reality show revela surpresa na eliminação de participantes'
            ],
            saude: [
                'Estudo descobre novo método para tratamento de doença crônica',
                'Vacina contra vírus emergente mostra eficácia em testes iniciais',
                'Hospital implements technology to reduce waiting times',
                'Nutricionista alerta sobre perigos de dietas da moda',
                'Exercício físico regular pode reduzir risco de depressão em 30%'
            ]
        };

        const titles = titlesByCategory[category] || titlesByCategory.tecnologia;
        return titles[Math.floor(Math.random() * titles.length)];
    }

    generateMockSummary(category) {
        const summariesByCategory = {
            tecnologia: [
                'A inovação promete mudar a forma como interagimos com a tecnologia no dia a dia.',
                'Especialistas afirmam que o desenvolvimento pode ter impactos significativos na indústria.',
                'Testes iniciais mostraram resultados promissores em laboratórios especializados.',
                'A empresa planeja lançar o produto no mercado global nos próximos meses.',
                'Parcerias com outras empresas de tecnologia estão sendo negociadas.'
            ],
            esportes: [
                'A performance surpreendeu até mesmo os mais otimistas analistas esportivos.',
                'O feito representa um marco na história da modalidade esportiva.',
                'A decisão foi tomada após reunião emergencial da diretoria do clube.',
                'Médicos estão otimistas quanto à recuperação do atleta lesionado.',
                'As mudanças visam tornar o esporte mais justo e emocionante para os espectadores.'
            ],
            politica: [
                'As medidas devem entrar em vigor no início do próximo trimestre fiscal.',
                'A votação ocorreu após intenso debate entre parlamentares de diferentes partidos.',
                'Os acordos podem ter implicações significativas para o comércio internacional.',
                'A decisão poderá afetar centenas de casos similares em tramitação nos tribunais.',
                'O plano inclui investimentos em infraestrutura e capacitação de profissionais.'
            ],
            entretenimento: [
                'A produção contou com elenco internacional e equipe de premiados profissionais.',
                'A conquista ocorre após anos de trabalho e dedicação da equipe criativa.',
                'O evento espera atrair milhares de visitantes de todo o país.',
                'A nova temporada promete reviravoltas que deixarão os fãs ansiosos.',
                'Os participantes serão submetidos a desafios inéditos jamais vistos antes.'
            ],
            saude: [
                'Os resultados foram publicados em revista científica de renome internacional.',
                'Os primeiros lotes devem estar disponíveis para distribuição em breve.',
                'A implementação da tecnologia ocorreu em fase piloto com resultados alentadores.',
                'Especialistas recomendam abordagem equilibrada e acompanhamento profissional.',
                'Benefícios foram observados após apenas oito semanas de prática regular.'
            ]
        };

        const summaries = summariesByCategory[category] || summariesByCategory.tecnologia;
        return summaries[Math.floor(Math.random() * summaries.length)];
    }

    generateMockContent(category) {
        const paragraphs = [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
            'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
            'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.',
            'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.'
        ];

        // Select 3-5 random paragraphs
        const selectedCount = 3 + Math.floor(Math.random() * 3);
        const selected = [];

        for (let i = 0; i < selectedCount; i++) {
            const index = Math.floor(Math.random() * paragraphs.length);
            selected.push(paragraphs[index]);
        }

        return selected.join('<br><br>');
    }

    filterNews() {
        // Filter by category
        let filtered = this.newsData;

        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(news => news.category === this.currentCategory);
        }

        // Filter by search term
        if (this.searchTerm.trim() !== '') {
            filtered = filtered.filter(news =>
                news.title.toLowerCase().includes(this.searchTerm) ||
                news.summary.toLowerCase().includes(this.searchTerm) ||
                news.content.toLowerCase().includes(this.searchTerm)
            );
        }

        this.filteredNews = filtered;
        this.renderNews();
    }

    renderNews() {
        if (this.filteredNews.length === 0) {
            this.newsGrid.innerHTML = '<div class="loading">Nenhuma notícia encontrada com os filtros aplicados.</div>';
            return;
        }

        this.newsGrid.innerHTML = '';

        this.filteredNews.forEach(news => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            newsCard.innerHTML = `
                <div class="news-card-image">
                    <img src="${news.imageUrl}" alt="${news.title}" onerror="this.src='https://picsum.photos/seed/error/800/400'">
                </div>
                <div class="news-card-content">
                    <span class="news-card-category">${this.capitalizeFirstLetter(news.category)}</span>
                    <h3 class="news-card-title">${news.title}</h3>
                    <p class="news-card-excerpt">${news.summary}</p>
                    <div class="news-card-footer">
                        <span>${news.source}</span>
                        <span>${this.formatDate(news.date)}</span>
                    </div>
                </div>
            `;

            newsCard.addEventListener('click', () => this.showNewsDetail(news));
            this.newsGrid.appendChild(newsCard);
        });
    }

    showNewsDetail(news) {
        this.detailTitle.textContent = news.title;
        this.detailCategory.textContent = this.capitalizeFirstLetter(news.category);
        this.detailDate.textContent = this.formatDate(news.date);
        this.detailContent.innerHTML = `
            <p><strong>Fonte:</strong> ${news.source}</p>
            <p>${news.content}</p>
        `;

        this.newsDetail.classList.add('active');
    }

    capitalizeFirstLetter(string) {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }

    showLoading() {
        this.newsGrid.innerHTML = '<div class="loading">Carregando notícias...</div>';
    }

    hideLoading() {
        // Loading is hidden when we render the news
    }

    showError(message) {
        this.newsGrid.innerHTML = `<div class="error">${message}</div>`;
    }
}

// Initialize the news reader when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.newsReader = new NewsReader();
});