// Aplicativo de Receitas com Modo Offline
class RecipeApp {
    constructor() {
        this.recipes = [];
        this.filteredRecipes = [];
        const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; } };
        this.favorites = new Set(read('favorites'));
        this.offlineRecipes = new Set(read('offlineRecipes'));
        this.currentTab = 'all';
        this.init();
    }

    init() {
        this.loadRecipes();
        this.bindEvents();
        this.updateStatus();
        this.renderTabs();
        this.registerSW();
    }

    registerSW() {
        if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
            navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW não registrado:', err));
        }
    }

    esc(t) {
        const d = document.createElement('div');
        d.textContent = t == null ? '' : String(t);
        return d.innerHTML;
    }

    bindEvents() {
        document.getElementById('search-btn').addEventListener('click', () => this.searchRecipes());
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchRecipes();
        });

        document.getElementById('close-detail-btn').addEventListener('click', () => this.closeDetail());
        document.getElementById('recipe-detail').addEventListener('click', (e) => {
            if (e.target.id === 'recipe-detail') this.closeDetail();
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeDetail(); });
        document.getElementById('search-input').addEventListener('input', () => this.applyFilters());

        // Tab events
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTab(e.currentTarget.dataset.tab);
            });
        });
    }

    async loadRecipes() {
        try {
            // Tentar carregar receitas do arquivo local
            const response = await fetch('recipes/database.json');
            if (!response.ok) throw new Error('Failed to load recipes');
            this.recipes = await response.json();
            try { localStorage.setItem('recipes', JSON.stringify(this.recipes)); } catch (e) { /* ignore */ }
            this.filteredRecipes = [...this.recipes];
            this.renderRecipes();
        } catch (error) {
            console.error('Error loading recipes:', error);
            // Tentar carregar do localStorage como fallback
            const stored = localStorage.getItem('recipes');
            if (stored) {
                this.recipes = JSON.parse(stored);
                this.filteredRecipes = [...this.recipes];
                this.renderRecipes();
            } else {
                this.showError('Não foi possível carregar as receitas');
            }
        }
    }

    searchRecipes() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();

        if (searchTerm === '') {
            this.filteredRecipes = [...this.recipes];
        } else {
            this.filteredRecipes = this.recipes.filter(recipe =>
                recipe.name.toLowerCase().includes(searchTerm) ||
                (recipe.ingredients && recipe.ingredients.some(ing =>
                    ing.toLowerCase().includes(searchTerm)))
            );
        }

        this.applyFilters();
    }

    setTab(tab) {
        this.currentTab = tab;
        this.renderTabs();
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.recipes];

        // Aplicar busca
        const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
        if (searchTerm !== '') {
            filtered = filtered.filter(recipe =>
                recipe.name.toLowerCase().includes(searchTerm) ||
                (recipe.ingredients && recipe.ingredients.some(ing =>
                    ing.toLowerCase().includes(searchTerm)))
            );
        }

        // Aplicar filtros de tab
        switch (this.currentTab) {
            case 'favorites':
                filtered = filtered.filter(recipe => this.favorites.has(recipe.id));
                break;
            case 'offline':
                filtered = filtered.filter(recipe => this.offlineRecipes.has(recipe.id));
                break;
            // 'all' não precisa de filtro adicional
        }

        this.filteredRecipes = filtered;
        this.renderRecipes();
    }

    renderTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === this.currentTab);
        });
    }

    renderRecipes() {
        const container = document.getElementById('recipes-container');

        if (this.filteredRecipes.length === 0) {
            const msgs = { favorites: 'Toque em uma receita e marque como favorita para vê-la aqui.', offline: 'Salve receitas para usá-las sem internet. Elas aparecerão aqui.' };
            container.innerHTML = `<div class="empty-state">${msgs[this.currentTab] && !document.getElementById('search-input').value ? msgs[this.currentTab] : 'Nenhuma receita encontrada.'}</div>`;
            return;
        }

        container.innerHTML = this.filteredRecipes.map(recipe => {
            const isFavorite = this.favorites.has(recipe.id);
            const isOffline = this.offlineRecipes.has(recipe.id);

            return `
                <div class="recipe-card ${isOffline ? 'offline' : ''} ${isFavorite ? 'favorite' : ''}"
                     data-recipe-id="${recipe.id}">
                    <div class="recipe-header">
                        <h3 class="recipe-title">${this.esc(recipe.name)}</h3>
                        <div class="recipe-tags">
                            ${isOffline ? '<span class="tag offline">Offline</span>' : ''}
                            ${isFavorite ? '<span class="tag favorite">Favorita</span>' : ''}
                        </div>
                    </div>
                    <div class="recipe-meta">
                        <span>⏱️ ${recipe.time || 'Tempo não informado'}</span>
                        <span>🔥 ${recipe.difficulty || 'Dificuldade não informada'}</span>
                    </div>
                    <p class="recipe-description">${recipe.description || 'Descrição não disponível'}</p>
                    <div class="recipe-footer">
                        <span>${recipe.servings ? recipe.servings + ' porções' : ''}</span>
                        <span>${this.esc(recipe.category || '')}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Adicionar event listeners para os cards
        document.querySelectorAll('.recipe-card').forEach(card => {
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.addEventListener('keydown', (e) => { if (e.key === 'Enter') card.click(); });
            card.addEventListener('click', (e) => {
                // Ignorar cliques nos botões internos (se existirem)
                if (!e.target.classList.contains('btn')) {
                    const recipeId = parseInt(card.dataset.recipeId);
                    this.showRecipeDetail(recipeId);
                }
            });
        });
    }

    closeDetail() {
        document.getElementById('recipe-detail').style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    showRecipeDetail(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const detailContainer = document.getElementById('recipe-detail');
        const contentContainer = document.querySelector('.recipe-content');

        contentContainer.innerHTML = `
            <h2>${this.esc(recipe.name)}</h2>
            <div class="detail-section">
                <h3>Descrição</h3>
                <p>${recipe.description || 'Descrição não disponível'}</p>
            </div>
            <div class="detail-section">
                <h3>Ingredientes</h3>
                <ul class="ingredients-list">
                    ${recipe.ingredients ? recipe.ingredients.map(ing => `<li>${this.esc(ing)}</li>`).join('') : '<li>Ingredientes não informados</li>'}
                </ul>
            </div>
            <div class="detail-section">
                <h3>Instruções</h3>
                <ol class="instructions-list">
                    ${recipe.instructions ? recipe.instructions.map(step => `<li>${this.esc(step)}</li>`).join('') : '<li>Instruções não informadas</li>'}
                </ol>
            </div>
            <div class="detail-section">
                <h3>Informações Adicionais</h3>
                <p><strong>Tempo de preparo:</strong> ${recipe.time || 'Não informado'}</p>
                <p><strong>Dificuldade:</strong> ${recipe.difficulty || 'Não informada'}</p>
                <p><strong>Porções:</strong> ${recipe.servings || 'Não informado'}</p>
                <p><strong>Categoria:</strong> ${recipe.category || 'Não informada'}</p>
            </div>
        `;

        // Atualizar botões de ação
        document.getElementById('toggle-favorite-btn').onclick = () => this.toggleFavorite(recipeId);
        document.getElementById('save-offline-btn').onclick = () => this.toggleOffline(recipeId);

        // Atualizar texto dos botões
        document.getElementById('toggle-favorite-btn').textContent =
            this.favorites.has(recipeId) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos';
        document.getElementById('save-offline-btn').textContent =
            this.offlineRecipes.has(recipeId) ? 'Remover do Offline' : 'Salvar para Offline';

        detailContainer.style.display = 'flex';
        document.body.classList.add('modal-open');
        detailContainer.scrollTop = 0;
    }

    toggleFavorite(recipeId) {
        if (this.favorites.has(recipeId)) {
            this.favorites.delete(recipeId);
        } else {
            this.favorites.add(recipeId);
        }

        this.saveFavorites();
        this.applyFilters(); // Re-renderizar para atualizar visual

        // Atualizar botão se o detalhe estiver aberto
        const detailContainer = document.getElementById('recipe-detail');
        if (detailContainer.style.display === 'flex') {
            document.getElementById('toggle-favorite-btn').textContent =
                this.favorites.has(recipeId) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos';
        }
    }

    toggleOffline(recipeId) {
        if (this.offlineRecipes.has(recipeId)) {
            this.offlineRecipes.delete(recipeId);
        } else {
            this.offlineRecipes.add(recipeId);
        }

        this.saveOfflineRecipes();
        this.applyFilters(); // Re-renderizar para atualizar visual

        // Atualizar botão se o detalhe estiver aberto
        const detailContainer = document.getElementById('recipe-detail');
        if (detailContainer.style.display === 'flex') {
            document.getElementById('save-offline-btn').textContent =
                this.offlineRecipes.has(recipeId) ? 'Remover do Offline' : 'Salvar para Offline';
        }
    }

    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify([...this.favorites]));
    }

    saveOfflineRecipes() {
        localStorage.setItem('offlineRecipes', JSON.stringify([...this.offlineRecipes]));
    }

    updateStatus() {
        // Simular verificação de conexão
        const isOnline = navigator.onLine;
        document.getElementById('status-text').textContent = isOnline ? 'Online' : 'Offline · usando cache';
        document.getElementById('status-dot').className = isOnline ? 'online' : 'offline';
    }

    showError(message) {
        const container = document.getElementById('recipes-container');
        container.innerHTML = `<div class="empty-state">${message}</div>`;
    }
}

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.recipeApp = new RecipeApp();

    // Atualizar status de conexão periodicamente
    setInterval(() => {
        window.recipeApp.updateStatus();
    }, 5000);

    // Escutar eventos de online/offline
    window.addEventListener('online', () => {
        window.recipeApp.updateStatus();
    });

    window.addEventListener('offline', () => {
        window.recipeApp.updateStatus();
    });
});