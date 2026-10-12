// Sistema de Avaliação de Produtos
class ProductRatingApp {
    constructor() {
        this.currentProductId = null;
        this.products = {}; // productId => { name, description, category, etc. }
        this.reviews = {}; // productId => [review objects]
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderProductsPanel();
        this.loadFromLocalStorage();
        this.renderWelcomeContent();
    }

    setupEventListeners() {
        // Products panel click delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.product-item')) {
                const productId = e.target.closest('.product-item').dataset.id;
                this.showProductDetails(productId);
            }
        });

        // Toolbar buttons
        document.getElementById('add-product').addEventListener('click', () => this.showAddProductForm());
        document.getElementById('refresh-products').addEventListener('click', () => this.renderProductsPanel());
        document.getElementById('export-data').addEventListener('click', () => this.exportData());
        document.getElementById('import-data').addEventListener('click', () => this.importData());
        document.getElementById('clear-all').addEventListener('click', () => this.clearAllData());

        // Handle form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id !== 'product-form') return;
            e.preventDefault();
            if (this.validateProductForm(e.target)) {
                this.saveProduct(e.target);
                this.hidePropertiesPanel();
            }
        });

        document.addEventListener('submit', (e) => {
            if (e.target.id !== 'review-form') return;
            e.preventDefault();
            if (this.validateReviewForm(e.target)) {
                this.saveReview(e.target);
                this.hideReviewPanel();
                this.showProductDetails(this.currentProductId); // Refresh product details
            }
        });

        // Handle first product button in welcome screen
        document.addEventListener('click', (e) => { if (e.target.closest('#add-first-product')) this.showAddProductForm(); });

        // Close panels when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('button, input, select, textarea, label, a, .properties-panel') &&
                !e.target.closest('.review-panel') &&
                !e.target.closest('.product-item') &&
                !e.target.closest('#add-product') &&
                !e.target.closest('#add-first-product')) {
                this.hidePropertiesPanel();
                this.hideReviewPanel();
            }
        });

        // Handle Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePropertiesPanel();
                this.hideReviewPanel();
            }
        });
    }

    renderProductsPanel() {
        const productsPanel = document.getElementById('products-panel');
        const productIds = Object.keys(this.products);

        if (productIds.length === 0) {
            productsPanel.innerHTML = '<p class="empty-msg">Nenhum produto cadastrado</p>';
            return;
        }

        productsPanel.innerHTML = productIds.map(id => {
            const product = this.products[id];
            const reviewCount = this.reviews[id] ? this.reviews[id].length : 0;
            const avgRating = this.calculateAverageRating(id);

            return `
                <div class="product-item" data-id="${id}">
                    <h3>${product.name}</h3>
                    <div class="product-meta">
                        <span>${product.category || 'Sem categoria'}</span>
                        <span>${reviewCount} avaliação${reviewCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="product-rating">
                        ${this.renderStars(avgRating, false)}
                        <span>${avgRating.toFixed(1)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    showAddProductForm() {
        this.currentProductId = null;
        this.showPropertiesPanel('Adicionar Novo Produto', `
            <div class="field-group">
                <label for="product-name">Nome do Produto *</label>
                <input type="text" id="product-name" name="product-name" placeholder="Ex: Smartphone XYZ" required>
            </div>

            <div class="field-group">
                <label for="product-description">Descrição</label>
                <textarea id="product-description" name="product-description" placeholder="Descreva o produto brevemente"></textarea>
            </div>

            <div class="field-group">
                <label for="product-category">Categoria</label>
                <input type="text" id="product-category" name="product-category" placeholder="Ex: Eletrônicos, Livros, Vestuário">
            </div>

            <div class="field-group">
                <label for="product-brand">Marca</label>
                <input type="text" id="product-brand" name="product-brand" placeholder="Marca do produto">
            </div>
        `, 'product-form');
    }

    showProductDetails(productId) {
        this.currentProductId = productId;
        const product = this.products[productId];
        const productReviews = this.reviews[productId] || [];
        const avgRating = this.calculateAverageRating(productId);

        // Update products panel active state
        document.querySelectorAll('.product-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === productId);
        });

        this.showReviewPanel('Avaliar Produto', `
            <div class="field-group">
                <label for="review-title">Título da Avaliação *</label>
                <input type="text" id="review-title" name="review-title" placeholder="Ex: Excelente produto!" required>
            </div>

            <div class="field-group">
                <label for="review-comment">Comentário *</label>
                <textarea id="review-comment" name="review-comment" placeholder="Descreva sua experiência com o produto" required></textarea>
            </div>

            <div class="field-group">
                <label for="review-rating">Nota *</label>
                <div class="rating-stars" id="rating-stars">
                    ${[5,4,3,2,1].map(rating => `
                        <span class="star" data-rating="${rating}">★</span>
                    `).join('')}
                </div>
                <input type="hidden" id="review-rating" name="review-rating" value="0">
            </div>

            <div class="field-group">
                <label for="reviewer-name">Seu Nome (opcional)</label>
                <input type="text" id="reviewer-name" name="reviewer-name" placeholder="Como você quer aparecer">
            </div>
        `, 'review-form');

        // Set up star rating interaction
        setTimeout(() => {
            const stars = document.querySelectorAll('#rating-stars .star');
            stars.forEach(star => {
                star.addEventListener('click', () => {
                    const rating = parseInt(star.dataset.rating);
                    document.getElementById('review-rating').value = rating;
                    // Update visual state
                    stars.forEach(s => {
                        s.classList.toggle('active', parseInt(s.dataset.rating) <= rating);
                    });
                });
                star.addEventListener('mouseover', () => {
                    const rating = parseInt(star.dataset.rating);
                    stars.forEach(s => {
                        s.classList.toggle('hover', parseInt(s.dataset.rating) <= rating);
                    });
                });
                star.addEventListener('mouseout', () => {
                    stars.forEach(s => {
                        s.classList.remove('hover');
                    });
                });
            });
        }, 0);

        // Show product details in main content
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `
            <div class="product-detail">
                <h2>${product.name}</h2>
                <div class="product-info">
                    <div>
                        <h3>Descrição</h3>
                        <p>${product.description || 'Sem descrição'}</p>
                    </div>
                    <div>
                        <h3>Informações</h3>
                        <p><strong>Categoria:</strong> ${product.category || 'Não especificada'}</p>
                        <p><strong>Marca:</strong> ${product.brand || 'Não especificada'}</p>
                    </div>
                </div>

                <div class="rating-display">
                    ${this.renderStars(avgRating, true)}
                    <div class="rating-text">
                        <span>${avgRating.toFixed(1)}</span>
                        <span>(${productReviews.length} avaliação${productReviews.length !== 1 ? 's' : ''})</span>
                    </div>
                </div>

                <div class="reviews-list">
                    ${productReviews.length > 0 ?
                        productReviews.map(review => `
                            <div class="review-item">
                                <div class="review-item-header">
                                    <div class="user-info">
                                        <span>${review.reviewerName || 'Anônimo'}</span>
                                        <span>${new Date(review.date).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div class="review-rating">
                                        ${this.renderStars(parseInt(review.rating), false)}
                                    </div>
                                </div>
                                <p><strong>${review.title}</strong></p>
                                <p>${review.comment}</p>
                                <div class="review-actions">
                                    <button class="btn-small" onclick="app.reportReview('${productId}', '${review.date}')">Denunciar</button>
                                </div>
                            </div>
                        `).join('') :
                        `<p class="empty-msg">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>`
                    }
                </div>
            </div>
        `;
        document.getElementById('review-panel').classList.remove('active');
        const detailBox = dynamicContent.querySelector('.product-detail');
        if (detailBox) detailBox.insertAdjacentHTML('afterbegin', '<button type="button" class="btn-primary open-side" data-open="review-panel">Escrever avaliação</button>');
    }

    hidePropertiesPanel() {
        document.getElementById('properties-panel').classList.remove('active');
    }

    hideReviewPanel() {
        document.getElementById('review-panel').classList.remove('active');
    }

    showPropertiesPanel(title, content, formId) {
        const propertiesPanel = document.getElementById('properties-panel');
        propertiesPanel.innerHTML = `<h2>${title}</h2><form id="${formId}">${content}</form>`;
        propertiesPanel.classList.add('active');

        // Focus first input
        setTimeout(() => {
            const firstInput = propertiesPanel.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
        }, 0);
    }

    showReviewPanel(title, content, formId) {
        const reviewPanel = document.getElementById('review-panel');
        reviewPanel.innerHTML = `<h2>${title}</h2><form id="${formId}">${content}</form>`;
        reviewPanel.classList.add('active');

        // Focus first input
        setTimeout(() => {
            const firstInput = reviewPanel.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
        }, 0);
    }

    validateProductForm(form) {
        const nameInput = form.querySelector('#product-name');
        if (!nameInput || !nameInput.value.trim()) {
            this.showNotification('Por favor, preencha o nome do produto', 'error');
            nameInput?.focus();
            return false;
        }
        return true;
    }

    validateReviewForm(form) {
        const titleInput = form.querySelector('#review-title');
        const commentInput = form.querySelector('#review-comment');
        const ratingInput = form.querySelector('#review-rating');

        if (!titleInput || !titleInput.value.trim()) {
            this.showNotification('Por favor, preencha o título da avaliação', 'error');
            titleInput?.focus();
            return false;
        }

        if (!commentInput || !commentInput.value.trim()) {
            this.showNotification('Por favor, preencha o comentário', 'error');
            commentInput?.focus();
            return false;
        }

        if (!ratingInput || parseInt(ratingInput.value) === 0) {
            this.showNotification('Por favor, selecione uma nota', 'error');
            return false;
        }

        return true;
    }

    saveProduct(form) {
        const formData = new FormData(form);
        const productId = Date.now().toString(); // Simple ID generation

        this.products[productId] = {
            name: formData.get('product-name'),
            description: formData.get('product-description'),
            category: formData.get('product-category'),
            brand: formData.get('product-brand'),
            createdAt: new Date().toISOString()
        };

        // Initialize reviews array for this product
        if (!this.reviews[productId]) {
            this.reviews[productId] = [];
        }

        this.saveToLocalStorage();
        this.renderProductsPanel();
        this.showNotification('Produto adicionado com sucesso!');

        // Automatically show the new product details
        this.showProductDetails(productId);
    }

    saveReview(form) {
        if (!this.currentProductId) {
            this.showNotification('Nenhum produto selecionado', 'error');
            return;
        }

        const formData = new FormData(form);
        const review = {
            id: Date.now().toString(),
            title: formData.get('review-title'),
            comment: formData.get('review-comment'),
            rating: parseInt(formData.get('review-rating')),
            reviewerName: formData.get('reviewer-name') || 'Anônimo',
            date: new Date().toISOString()
        };

        if (!this.reviews[this.currentProductId]) {
            this.reviews[this.currentProductId] = [];
        }

        this.reviews[this.currentProductId].push(review);
        this.saveToLocalStorage();
        this.showNotification('Avaliação adicionada com sucesso!');

        // Refresh product details to show new review
        this.showProductDetails(this.currentProductId);
    }

    calculateAverageRating(productId) {
        const reviews = this.reviews[productId] || [];
        if (reviews.length === 0) return 0;

        const sum = reviews.reduce((acc, review) => acc + parseInt(review.rating), 0);
        return sum / reviews.length;
    }

    renderStars(rating, isStatic = false) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<span class="star full">★</span>';
        }
        if (hasHalfStar) {
            starsHtml += '<span class="star half">★</span>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<span class="star empty">☆</span>';
        }

        if (!isStatic) {
            // Make stars interactive for rating selection
            return starsHtml.replace(/class="star (full|half|empty)"/g, 'class="star" data-rating="$1"');
        }

        return starsHtml;
    }

    saveToLocalStorage() {
        try {
            const data = {
                products: this.products,
                reviews: this.reviews
            };
            localStorage.setItem('product-rating-data', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save to localStorage', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('product-rating-data');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.products = parsed.products || {};
                this.reviews = parsed.reviews || {};
                this.renderProductsPanel();
            }
        } catch (e) {
            console.warn('Could not load from localStorage', e);
        }
    }

    exportData() {
        try {
            const data = {
                products: this.products,
                reviews: this.reviews,
                exportedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `avaliacao-produtos-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showNotification('Dados exportados com sucesso!');
        } catch (e) {
            this.showNotification('Erro ao exportar dados', 'error');
            console.error(e);
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    // Merge with existing data
                    this.products = { ...this.products, ...importedData.products || {} };
                    this.reviews = { ...this.reviews, ...importedData.reviews || {} };

                    this.saveToLocalStorage();
                    this.renderProductsPanel();
                    this.showNotification('Dados importados com sucesso!');
                } catch (err) {
                    this.showNotification('Erro ao importar dados: formato inválido', 'error');
                    console.error(err);
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    clearAllData() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            this.products = {};
            this.reviews = {};
            this.currentProductId = null;
            this.saveToLocalStorage();
            this.renderProductsPanel();
            this.renderWelcomeContent();
            this.hidePropertiesPanel();
            this.hideReviewPanel();
            this.showNotification('Todos os dados foram limpos com sucesso!');
        }
    }

    reportReview(productId, reviewDate) {
        // Simple reporting - in a real app this would send to moderation
        if (confirm('Deseja denunciar esta avaliação? Esta ação será enviada para moderação.')) {
            this.showNotification('Avaliação denunciada para moderação');
            // In a real implementation, we would flag this review for review
        }
    }

    showNotification(message, type = 'success') {
        // Remove any existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Styles
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.background = type === 'success' ? '#4caf50' : '#ff6b6b';
        notification.style.color = 'white';
        notification.style.padding = '1rem 1.5rem';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notification.style.zIndex = '1000';
        notification.style.transition = 'opacity 0.3s, transform 0.3s';
        notification.style.opacity = '0';
        notification.style.maxWidth = '80%';

        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    renderWelcomeContent() {
        const dynamicContent = document.getElementById('dynamic-content');
        if (Object.keys(this.products).length === 0) {
            dynamicContent.innerHTML = `
                <div class="welcome-screen">
                    <h2>Bem-vindo ao Sistema de Avaliação</h2>
                    <p>Selecione um produto na barra lateral para ver suas avaliações ou adicionar um novo produto.</p>
                    <div class="empty-state">
                        <p>Nenhum produto cadastrado ainda.</p>
                        <button id="add-first-product" class="btn-primary">Adicionar Primeiro Produto</button>
                    </div>
                </div>
            `;
        } else {
            // Show stats when there are products
            const totalProducts = Object.keys(this.products).length;
            const totalReviews = Object.values(this.reviews).flat().length;
            const avgRatingOverall = Object.keys(this.products).reduce((acc, id) => acc + this.calculateAverageRating(id), 0) / totalProducts;

            dynamicContent.innerHTML = `
                <div class="welcome-screen">
                    <h2>Bem-vindo ao Sistema de Avaliação</h2>
                    <p>Visão geral do sistema:</p>
                    <div class="stats-summary">
                        <p>Total de produtos: ${totalProducts}</p>
                        <p>Total de avaliações: ${totalReviews}</p>
                        <p>Média geral de avaliações: ${avgRatingOverall.toFixed(1)} estrelas</p>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ProductRatingApp();
});
// ---- Painéis laterais: botão de fechar e ações padrão de formulário ----
document.addEventListener('DOMContentLoaded', () => {
    const labels = { 'quiz-form': 'Enviar respostas', 'review-form': 'Publicar avaliação', 'loan-form': 'Registrar empréstimo' };
    const decorate = (panel) => {
        if (!panel.classList.contains('active')) return;
        if (!panel.querySelector('.panel-close')) {
            const x = document.createElement('button');
            x.type = 'button'; x.className = 'panel-close'; x.setAttribute('aria-label', 'Fechar painel'); x.textContent = '×';
            x.addEventListener('click', () => panel.classList.remove('active'));
            panel.insertBefore(x, panel.firstChild);
        }
        const form = panel.querySelector('form');
        if (form && !form.querySelector('[type="submit"]')) {
            const box = document.createElement('div');
            box.className = 'form-actions';
            box.innerHTML = '<button type="button" class="btn-cancel">Cancelar</button><button type="submit" class="btn-primary"></button>';
            box.querySelector('.btn-primary').textContent = labels[form.id] || 'Salvar';
            box.querySelector('.btn-cancel').addEventListener('click', () => panel.classList.remove('active'));
            form.appendChild(box);
        }
    };
    document.querySelectorAll('.properties-panel,.review-panel,.loan-panel,.lesson-panel,.quiz-panel,.certificate-panel').forEach(panel => {
        new MutationObserver(() => decorate(panel)).observe(panel, { attributes: true, attributeFilter: ['class'], childList: true });
    });
    document.addEventListener('click', (e) => {
        const o = e.target.closest('[data-open]');
        if (o) document.getElementById(o.dataset.open).classList.add('active');
    });
});
