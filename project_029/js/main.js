class NewsApp {
    constructor() {
        this.container = document.getElementById('app-content');
        this.pagination = document.getElementById('pagination');
        this.searchInput = document.getElementById('search-input');
        this.categoryFilter = document.getElementById('category-filter');
        this.sortOrder = document.getElementById('sort-order');
        this.startDate = document.getElementById('start-date');
        this.endDate = document.getElementById('end-date');

        // View controls
        this.viewGridBtn = document.getElementById('view-grid');
        this.viewListBtn = document.getElementById('view-list');
        this.viewAnalyticsBtn = document.getElementById('view-analytics');

        // Page size
        this.pageSizeSelect = document.getElementById('page-size');

        // Modal elements
        this.modal = document.getElementById('news-modal');
        this.closeModalBtn = document.getElementById('close-modal');
        this.modalBody = document.getElementById('modal-body');

        // Stats panel
        this.statsPanel = document.getElementById('stats-panel');

        // State
        this.newsData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.pageSize = parseInt(this.pageSizeSelect.value) || 12;
        this.currentView = 'grid'; // grid, list, analytics
        this.filters = {
            search: '',
            category: 'all',
            sort: 'date-desc',
            startDate: '',
            endDate: ''
        };

        this.init();
    }

    init() {
        // Event listeners
        this.searchInput.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        this.categoryFilter.addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });

        this.sortOrder.addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            this.applyFilters();
        });

        this.startDate.addEventListener('change', (e) => {
            this.filters.startDate = e.target.value;
            this.applyFilters();
        });

        this.endDate.addEventListener('change', (e) => {
            this.filters.endDate = e.target.value;
            this.applyFilters();
        });

        // View controls
        this.viewGridBtn.addEventListener('click', () => {
            this.setView('grid');
        });

        this.viewListBtn.addEventListener('click', () => {
            this.setView('list');
        });

        this.viewAnalyticsBtn.addEventListener('click', () => {
            this.setView('analytics');
        });

        // Page size
        this.pageSizeSelect.addEventListener('change', (e) => {
            this.pageSize = parseInt(e.target.value);
            this.currentPage = 1;
            this.render();
        });

        // Modal
        this.closeModalBtn.addEventListener('click', () => {
            this.modal.style.display = 'none';
        });

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
            }
        });

        // Load initial news
        this.loadNews();
    }

    async loadNews() {
        try {
            // Load from JSON file
            const response = await fetch('data/articles.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.newsData = await response.json();

            // Enrich with metadata
            this.enrichNewsData();

            this.applyFilters();
        } catch (error) {
            console.error('Error loading news:', error);
            // Fallback to mock data
            await this.loadMockNews();
        }
    }

    async loadMockNews() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const categories = ['tecnologia', 'esportes', 'politica', 'entretenimento', 'saude'];
        const sources = [
            'BBC News', 'Reuters', 'Associated Press', 'CNN', 'The Guardian',
            'TechCrunch', 'ESPN', 'Politico', 'Variety', 'WebMD',
            'Globo Esporte', 'Estadão', 'Folha de S.Paulo', 'Valor Econômico'
        ];

        this.newsData = [];

        // Generate 30 news articles
        for (let i = 1; i <= 30; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            const categoryIndex = Math.floor(Math.random() * categories.length);
            const sourceIndex = Math.floor(Math.random() * sources.length);

            this.newsData.push({
                id: i,
                title: this.generateMockTitle(categories[categoryIndex]),
                category: categories[categoryIndex],
                source: sources[sourceIndex],
                date: date.toISOString().split('T')[0],
                summary: this.generateMockSummary(categories[categoryIndex]),
                content: this.generateMockContent(categories[categoryIndex]),
                imageUrl: `https://picsum.photos/seed/news${i}/800/400`,
                views: Math.floor(Math.random() * 10000) + 500,
                shares: Math.floor(Math.random() * 500) + 20,
                likes: Math.floor(Math.random() * 2000) + 100,
                comments: Math.floor(Math.random() * 300) + 15
            });
        }

        this.enrichNewsData();
        this.applyFilters();
    }

    enrichNewsData() {
        this.newsData.forEach(news => {
            // Default views/likes/comments/shares if not present
            news.views = news.views || Math.floor(Math.random() * 8000) + 800;
            news.likes = news.likes || Math.floor(Math.random() * 1500) + 50;
            news.comments = news.comments || Math.floor(Math.random() * 200) + 10;
            news.shares = news.shares || Math.floor(Math.random() * 300) + 15;

            // Reading time calculation
            const wordCount = (news.content || '').split(/\s+/).length;
            news.readingTime = Math.max(1, Math.round(wordCount / 200));

            // Engagement score
            news.engagementScore = (
                (news.views * 0.1) +
                (news.shares * 2) +
                (news.likes * 0.5) +
                (news.comments * 1)
            );
        });
    }

    generateMockTitle(category) {
        const titlesByCategory = {
            tecnologia: [
                'Nova atualização promete revolucionar o uso de baterias inteligentes',
                'IA atinge marco histórico em diagnósticos preventivos de saúde',
                'Grandes corporações investem em computação quântica aplicada',
                'Novo protocolo de segurança digital busca frear crimes cibernéticos'
            ],
            esportes: [
                'Time supera expectativas e avança para a grande final',
                'Recorde olímpico é superado em disputa emocionante no mundial',
                'Novas regras prometem agilizar partidas e evitar interrupções longas',
                'Clube apresenta plano ambicioso para modernização de infraestrutura'
            ],
            politica: [
                'Projeto de sustentabilidade urbana avança no parlamento com amplo apoio',
                'Reforma prevê incentivos para empresas que adotarem energia verde',
                'Líderes debatem metas climáticas em conferência internacional de cúpula',
                'Novo pacote econômico busca estimular geração de postos de trabalho'
            ],
            entretenimento: [
                'Produção independente conquista principais prêmios da temporada de cinema',
                'Festival internacional de música anuncia lineup diversificado para a edição',
                'Série aclamada confirma nova temporada com enredo surpreendente',
                'Livro sobre história e cultura popular atinge topo das vendas semanais'
            ],
            saude: [
                'Estudo aponta que rotina de sono adequada pode aumentar a longevidade',
                'Novo tratamento menos invasivo ganha aprovação para uso clínico',
                'Pesquisa identifica potenciais benefícios de hábitos alimentares simples',
                'Avanços no rastreamento genético auxiliam na detecção precoce de doenças'
            ]
        };

        const titles = titlesByCategory[category] || titlesByCategory.tecnologia;
        return titles[Math.floor(Math.random() * titles.length)];
    }

    generateMockSummary(category) {
        const summaries = [
            'Especialistas avaliam os impactos positivos no médio e longo prazo para a sociedade.',
            'Resultados de testes mostram estabilidade e alta taxa de eficiência em diferentes cenários.',
            'Medidas implementadas visam modernizar processos e atender exigências globais.',
            'Novas iniciativas estão sendo coordenadas para garantir alcance acessível à população.'
        ];
        return summaries[Math.floor(Math.random() * summaries.length)];
    }

    generateMockContent(category) {
        return `O desenvolvimento recente demonstra uma tendência consistente de evolução no setor. Especialistas destacam que os investimentos contínuos em pesquisa e tecnologia desempenham um papel fundamental para alcançar resultados duradouros.<br><br>As equipes responsáveis pelo projeto afirmam que os próximos meses serão dedicados a refinar a implementação, coletar retornos dos usuários e expandir as operações com responsabilidade e foco no impacto positivo.`;
    }

    applyFilters() {
        this.currentPage = 1;

        let filtered = this.newsData;

        // Category filter
        if (this.filters.category !== 'all') {
            filtered = filtered.filter(news => news.category.toLowerCase() === this.filters.category.toLowerCase());
        }

        // Search filter
        if (this.filters.search.trim() !== '') {
            filtered = filtered.filter(news =>
                news.title.toLowerCase().includes(this.filters.search) ||
                news.summary.toLowerCase().includes(this.filters.search) ||
                (news.content && news.content.toLowerCase().includes(this.filters.search))
            );
        }

        // Date range
        if (this.filters.startDate) {
            filtered = filtered.filter(news => news.date >= this.filters.startDate);
        }

        if (this.filters.endDate) {
            filtered = filtered.filter(news => news.date <= this.filters.endDate);
        }

        // Sort
        filtered = this.sortNews(filtered, this.filters.sort);

        this.filteredData = filtered;
        this.render();
    }

    sortNews(newsArray, sortBy) {
        const sorted = [...newsArray];

        switch (sortBy) {
            case 'date-desc':
                sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc':
                sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'views-desc':
                sorted.sort((a, b) => b.views - a.views);
                break;
            default:
                sorted.sort((a, b) => b.engagementScore - a.engagementScore);
                break;
        }

        return sorted;
    }

    render() {
        this.container.innerHTML = '';

        if (this.currentView === 'analytics') {
            this.container.style.display = 'none';
            this.pagination.style.display = 'none';
            this.renderAnalytics();
            return;
        }

        this.container.style.display = 'block';
        this.statsPanel.classList.remove('active');

        const totalPages = Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
        }

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        if (this.currentView === 'grid') {
            this.renderGrid(pageData);
        } else if (this.currentView === 'list') {
            this.renderList(pageData);
        }

        this.renderPagination(totalPages);
    }

    renderGrid(newsArray) {
        const grid = document.createElement('div');
        grid.className = 'news-grid';

        if (newsArray.length === 0) {
            grid.innerHTML = '<div class="empty-state">Nenhuma notícia encontrada com os filtros aplicados.</div>';
            this.container.appendChild(grid);
            return;
        }

        newsArray.forEach(news => {
            const card = this.createNewsCard(news, 'grid');
            grid.appendChild(card);
        });

        this.container.appendChild(grid);
    }

    renderList(newsArray) {
        const list = document.createElement('div');
        list.className = 'news-list';

        if (newsArray.length === 0) {
            list.innerHTML = '<div class="empty-state">Nenhuma notícia encontrada com os filtros aplicados.</div>';
            this.container.appendChild(list);
            return;
        }

        newsArray.forEach(news => {
            const card = this.createNewsCard(news, 'list');
            list.appendChild(card);
        });

        this.container.appendChild(list);
    }

    createNewsCard(news, viewType) {
        const article = document.createElement('article');
        article.className = `news-item news-item-${viewType}`;
        article.dataset.id = news.id;

        const formattedDate = this.formatDate(news.date);
        const categoryClass = `category-${news.category.toLowerCase()}`;

        let html = '';

        if (viewType === 'grid') {
            html = `
                <div class="news-item-image">
                    <img src="${news.imageUrl}" alt="${news.title}" onerror="this.src='https://picsum.photos/seed/error/800/400'">
                </div>
                <div class="news-item-content">
                    <span class="news-item-category ${categoryClass}">${this.capitalizeFirstLetter(news.category)}</span>
                    <h3 class="news-item-title">${news.title}</h3>
                    <p class="news-item-excerpt">${news.summary}</p>
                    <div class="news-item-footer">
                        <span class="news-item-source">${news.source}</span>
                        <span class="news-item-date">${formattedDate}</span>
                        <div class="news-item-views">
                            <i class="fas fa-eye"></i>
                            <span>${this.formatNumber(news.views)}</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (viewType === 'list') {
            html = `
                <div class="news-item-image">
                    <img src="${news.imageUrl}" alt="${news.title}" onerror="this.src='https://picsum.photos/seed/error/800/400'">
                </div>
                <div class="news-item-content">
                    <div>
                        <span class="news-item-category ${categoryClass}">${this.capitalizeFirstLetter(news.category)}</span>
                        <h3 class="news-item-title">${news.title}</h3>
                        <p class="news-item-excerpt">${news.summary}</p>
                    </div>
                    <div class="news-item-footer">
                        <div>
                            <span class="news-item-source">${news.source}</span>
                            <span class="news-item-date">${formattedDate}</span>
                        </div>
                        <div class="news-item-engagement">
                            <div class="news-item-views">
                                <i class="fas fa-eye"></i>
                                <span>${this.formatNumber(news.views)}</span>
                            </div>
                            <div class="news-item-likes">
                                <i class="fas fa-heart"></i>
                                <span>${this.formatNumber(news.likes)}</span>
                            </div>
                            <div class="news-item-comments">
                                <i class="fas fa-comment"></i>
                                <span>${this.formatNumber(news.comments)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        article.innerHTML = html;
        article.addEventListener('click', () => this.openNewsModal(news));

        return article;
    }

    renderAnalytics() {
        this.statsPanel.innerHTML = '';

        const analytics = this.calculateAnalytics();

        const title = document.createElement('h2');
        title.className = 'stats-title';
        title.innerHTML = '<i class="fas fa-chart-line"></i> Dashboard de Métricas e Engajamento';
        this.statsPanel.appendChild(title);

        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid';

        const statsData = [
            { value: analytics.totalNews, label: 'Notícias Publicadas', icon: 'fas fa-newspaper' },
            { value: this.formatNumber(analytics.totalViews), label: 'Total de Leituras', icon: 'fas fa-eye' },
            { value: this.formatNumber(analytics.totalLikes), label: 'Curtidas Recebidas', icon: 'fas fa-heart' },
            { value: analytics.topCategory, label: 'Categoria em Destaque', icon: 'fas fa-fire' }
        ];

        statsData.forEach(stat => {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML = `
                <div class="stat-icon"><i class="${stat.icon}"></i></div>
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            `;
            statsGrid.appendChild(card);
        });

        this.statsPanel.appendChild(statsGrid);

        const chartsContainer = document.createElement('div');
        chartsContainer.className = 'charts-container';

        // Distribution by category
        const catContainer = document.createElement('div');
        catContainer.className = 'chart-container';
        catContainer.innerHTML = `
            <div class="chart-title">Distribuição por Categoria</div>
            <div style="padding: 20px; display: flex; flex-direction: column; gap: 12px; justify-content: center; height: 100%;">
                ${Object.entries(analytics.categoryCounts).map(([cat, count]) => {
                    const percent = Math.round((count / analytics.totalNews) * 100);
                    return `
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: 500;">
                                <span>${this.capitalizeFirstLetter(cat)}</span>
                                <span>${count} (${percent}%)</span>
                            </div>
                            <div style="background: #e0e0e0; border-radius: 4px; height: 8px; overflow: hidden;">
                                <div style="background: #667eea; width: ${percent}%; height: 100%;"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        chartsContainer.appendChild(catContainer);

        // Top Read Articles
        const topArticlesContainer = document.createElement('div');
        topArticlesContainer.className = 'chart-container';
        topArticlesContainer.innerHTML = `
            <div class="chart-title">Artigos Mais Populares</div>
            <div style="padding: 15px 20px; overflow-y: auto;">
                ${analytics.topArticles.map((art, idx) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;">
                        <span style="font-size: 0.9rem; font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 70%;">
                            ${idx + 1}. ${art.title}
                        </span>
                        <span style="font-size: 0.85rem; color: #7f8c8d; font-weight: 600;">
                            ${this.formatNumber(art.views)} views
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
        chartsContainer.appendChild(topArticlesContainer);

        this.statsPanel.appendChild(chartsContainer);
        this.statsPanel.classList.add('active');
    }

    calculateAnalytics() {
        const data = this.newsData;

        const totalNews = data.length;
        const totalViews = data.reduce((sum, news) => sum + (news.views || 0), 0);
        const totalLikes = data.reduce((sum, news) => sum + (news.likes || 0), 0);

        const categoryCounts = {};
        data.forEach(news => {
            const cat = news.category.toLowerCase();
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        let topCategory = 'Geral';
        let maxCount = 0;
        for (const [cat, count] of Object.entries(categoryCounts)) {
            if (count > maxCount) {
                maxCount = count;
                topCategory = cat;
            }
        }

        const topArticles = [...data]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);

        return {
            totalNews,
            totalViews,
            totalLikes,
            topCategory: this.capitalizeFirstLetter(topCategory),
            categoryCounts,
            topArticles
        };
    }

    openNewsModal(news) {
        const formattedDate = this.formatDate(news.date);
        const categoryClass = `category-${news.category.toLowerCase()}`;

        this.modalBody.innerHTML = `
            <div class="modal-header">
                <div class="modal-meta">
                    <span class="modal-category ${categoryClass}">${this.capitalizeFirstLetter(news.category)}</span>
                    <span class="modal-date">${formattedDate}</span>
                </div>
                <h2 class="modal-title">${news.title}</h2>
            </div>
            <div class="modal-body-content">
                <div class="modal-engagement">
                    <div><i class="fas fa-eye"></i> <span>${this.formatNumber(news.views)}</span> leituras</div>
                    <div><i class="fas fa-heart"></i> <span>${this.formatNumber(news.likes)}</span> curtidas</div>
                    <div><i class="fas fa-comment"></i> <span>${this.formatNumber(news.comments)}</span> comentários</div>
                    <div><i class="fas fa-clock"></i> <span>${news.readingTime} min</span> de leitura</div>
                </div>
                <img src="${news.imageUrl}" alt="${news.title}" onerror="this.src='https://picsum.photos/seed/error/800/400'">
                <div class="modal-content-text">
                    <p><strong>Fonte:</strong> ${news.source}</p>
                    <p>${news.content || news.summary}</p>
                </div>
            </div>
        `;

        this.modal.style.display = 'block';
    }

    renderPagination(totalPages) {
        this.pagination.style.display = 'flex';
        this.pagination.innerHTML = `
            <button id="prevPage" ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Anterior
            </button>
            <span id="pageInfo">Página ${this.currentPage} de ${totalPages}</span>
            <button id="nextPage" ${this.currentPage >= totalPages ? 'disabled' : ''}>
                Próxima <i class="fas fa-chevron-right"></i>
            </button>
        `;

        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.render();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.render();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
    }

    setView(view) {
        this.currentView = view;

        this.viewGridBtn.classList.toggle('active', view === 'grid');
        this.viewListBtn.classList.toggle('active', view === 'list');
        this.viewAnalyticsBtn.classList.toggle('active', view === 'analytics');

        this.render();
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }

    formatNumber(num) {
        if (!num) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.newsApp = new NewsApp();
});