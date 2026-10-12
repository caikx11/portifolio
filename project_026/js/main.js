// Sistema de Controle de Estoque Profissional - EstoquePro
class EstoquePro {
    constructor() {
        this.currentCategory = 'all';
        this.currentView = 'dashboard';
        this.products = this.loadInitialData();
        this.filteredProducts = [];

        this.init();
    }

    loadInitialData() {
        const storedData = localStorage.getItem('estoquepro-data');
        if (storedData) {
            return JSON.parse(storedData);
        }

        // Dados iniciais de estoque por categoria
        return [
            // Eletrônicos
            {
                id: 1,
                code: "ELE001",
                description: "Notebook Dell Inspiron 15",
                category: "electronics",
                stock: 12,
                minStock: 5,
                location: "Prateleira A1",
                supplier: "TechDistribuidora Ltda."
            },
            {
                id: 2,
                code: "ELE002",
                description: "Mouse Óptico Logitech",
                category: "electronics",
                stock: 45,
                minStock: 20,
                location: "Prateleira A2",
                supplier: "TechDistribuidora Ltda."
            },
            {
                id: 3,
                code: "ELE003",
                description: "Monitor LG 24'' Full HD",
                category: "electronics",
                stock: 3,
                minStock: 8,
                location: "Prateleira A3",
                supplier: "TechDistribuidora Ltda."
            },
            {
                id: 4,
                code: "ELE004",
                description: "Teclado Mecânico Redragon",
                category: "electronics",
                stock: 0,
                minStock: 10,
                location: "Prateleira A4",
                supplier: "TechDistribuidora Ltda."
            },

            // Escritório
            {
                id: 5,
                code: "OFF001",
                description: "Resma A4 500 folhas",
                category: "office",
                stock: 28,
                minStock: 15,
                location: "Prateleira B1",
                supplier: "Papeleria Central"
            },
            {
                id: 6,
                code: "OFF002",
                description: "Caneta Esferográfica Azul",
                category: "office",
                stock: 150,
                minStock: 50,
                location: "Prateleira B2",
                supplier: "Papeleria Central"
            },
            {
                id: 7,
                code: "OFF003",
                description: "Clips Geminado Cx/100",
                category: "office",
                stock: 5,
                minStock: 20,
                location: "Prateleira B3",
                supplier: "Papeleria Central"
            },

            // Industrial
            {
                id: 8,
                code: "IND001",
                description: "Chave Inglesa 10mm",
                category: "industrial",
                stock: 8,
                minStock: 5,
                location: "Prateleira C1",
                supplier: "Ferrobras Ind."
            },
            {
                id: 9,
                code: "IND002",
                description: "Lâmina de Serra Circular 7''",
                category: "industrial",
                stock: 2,
                minStock: 10,
                location: "Prateleira C2",
                supplier: "Ferrobras Ind."
            },
            {
                id: 10,
                code: "IND003",
                description: "Parafusadeira Impacto 18V",
                category: "industrial",
                stock: 15,
                minStock: 8,
                location: "Prateleira C3",
                supplier: "Ferrobras Ind."
            },

            // Consumíveis
            {
                id: 11,
                code: "CON001",
                description: "Luvas de Nitrile Cx/100",
                category: "consumables",
                stock: 25,
                minStock: 20,
                location: "Prateleira D1",
                supplier: "SegurWork EPI"
            },
            {
                id: 12,
                code: "CON002",
                description: "Óleo Lubrificante Sintético 1L",
                category: "consumables",
                stock: 40,
                minStock: 15,
                location: "Prateleira D2",
                supplier: "SegurWork EPI"
            },
            {
                id: 13,
                code: "CON003",
                description: "Fita Isolante PVC Cx/10",
                category: "consumables",
                stock: 8,
                minStock: 12,
                location: "Prateleira D3",
                supplier: "SegurWork EPI"
            }
        ];
    }

    init() {
        this.setupCategoryFilter();
        this.setupViews();
        this.renderDashboard();
        this.setupEventListeners();
        this.updateStorage();
    }

    setupCategoryFilter() {
        const categorySelect = document.getElementById('category-select');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.switchCategory(e.target.value);
            });
        }
    }

    setupViews() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });
    }

    switchCategory(category) {
        this.currentCategory = category;
        document.getElementById('category-indicator').textContent =
            this.getCategoryLabel(category);

        // Atualizar classe ativa na navegação (opcional)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', this.getViewForCategory(category) === item.dataset.view);
        });

        this.filteredProducts = this.products.filter(p =>
            category === 'all' ? true : p.category === category
        );
        this.updateMetrics();
        this.renderTable();
    }

    getCategoryLabel(category) {
        const labels = {
            all: "Todas as Categorias",
            electronics: "Eletrônicos",
            office: "Escritório",
            industrial: "Industrial",
            consumables: "Consumíveis"
        };
        return labels[category] || category;
    }

    getViewForCategory(category) {
        // Cada categoria pode ter uma view padrão, mas por padrão usamos dashboard
        return 'dashboard';
    }

    switchView(view) {
        this.currentView = view;

        // Atualizar navegação
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        document.getElementById('current-view-title').textContent =
            this.getViewTitle(view);

        // Atualizar indicador de categoria
        document.getElementById('category-indicator').textContent =
            this.getCategoryLabel(this.currentCategory);

        this.renderContent();
    }

    getViewTitle(view) {
        const titles = {
            dashboard: "Visão Geral",
            products: "Produtos",
            movements: "Movimentações",
            reports: "Relatórios",
            suppliers: "Fornecedores"
        };
        return titles[view] || "Visão Geral";
    }

    renderContent() {
        this.updateMetrics();
        this.renderTable();
    }

    updateMetrics() {
        const totalProducts = this.products.length;
        const inStock = this.products.filter(p => p.stock > 0).length;
        const lowStock = this.products.filter(p => p.stock <= p.minStock && p.stock > 0).length;
        const outOfStock = this.products.filter(p => p.stock === 0).length;

        // Calcular valor total em estoque (valores simulados)
        let totalValue = 0;
        this.products.forEach(p => {
            const unitValues = {
                electronics: Math.random() * 1000 + 500, // R$ 500-1500
                office: Math.random() * 50 + 10,         // R$ 10-60
                industrial: Math.random() * 200 + 100,   // R$ 100-300
                consumables: Math.random() * 100 + 50    // R$ 50-150
            };
            const value = unitValues[p.category] * p.stock;
            totalValue += value;
        });

        // Taxa de giro simulada
        const turnoverRate = (Math.random() * 3 + 2).toFixed(1); // Entre 2x e 5x ao ano

        // Atualizar DOM
        document.getElementById('m1-value').textContent = totalProducts;
        document.getElementById('m2-value').textContent = lowStock + outOfStock; // Críticos (baixo + zerado)
        document.getElementById('m3-value').textContent = `R$ ${totalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('m4-value').textContent = `${turnoverRate}x`;
    }

    renderDashboard() {
        this.updateMetrics();
        this.renderTable();
    }

    renderTable() {
        const tbody = document.getElementById('table-body');
        if (!tbody) return;

        // Filtrar produtos baseado na categoria selecionada
        this.filteredProducts = this.products.filter(p =>
            this.currentCategory === 'all' ? true : p.category === this.currentCategory
        );

        // Ordenar por status de estoque (crítico primeiro)
        this.filteredProducts.sort((a, b) => {
            const statusA = a.stock === 0 ? 0 : (a.stock <= a.minStock ? 1 : 2);
            const statusB = b.stock === 0 ? 0 : (b.stock <= b.minStock ? 1 : 2);
            if (statusA !== statusB) return statusA - statusB;
            return a.code.localeCompare(b.code);
        });

        if (this.filteredProducts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: #64748b;">
                        Nenhum produto encontrado para esta categoria.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredProducts.map((p, index) => {
            const statusLabels = {
                'in-stock': { label: "Em Estoque", class: "status-in-stock" },
                'low-stock': { label: "Estoque Baixo", class: "status-low-stock" },
                'out-of-stock': { label: "Fora de Estoque", class: "status-out-of-stock" }
            };

            const stockStatus = p.stock === 0 ? 'out-of-stock' :
                              (p.stock <= p.minStock ? 'low-stock' : 'in-stock');
            const statusInfo = statusLabels[stockStatus];

            return `
                <tr>
                    <td>${p.code}</td>
                    <td>${p.description}</td>
                    <td>${this.getCategoryLabel(p.category)}</td>
                    <td>${p.stock}</td>
                    <td>${p.minStock}</td>
                    <td>${p.location}</td>
                    <td>
                        <div class="actions-cell">
                            <button class="btn-icon view" title="Ver detalhes" onclick="manager.viewProduct(${p.id})">👁</button>
                            <button class="btn-icon edit" title="Editar" onclick="manager.editProduct(${p.id})">✎</button>
                            <button class="btn-icon delete" title="Excluir" onclick="manager.deleteProduct(${p.id})">🗑</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    viewProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        const statusLabels = {
            'in-stock': "Em Estoque",
            'low-stock': "Estoque Baixo",
            'out-of-stock': "Fora de Estoque"
        };

        const stockStatus = product.stock === 0 ? 'out-of-stock' :
                          (product.stock <= product.minStock ? 'low-stock' : 'in-stock');

        alert(`
            Detalhes do Produto:\n
            Código: ${product.code}\n
            Descrição: ${product.description}\n
            Categoria: ${this.getCategoryLabel(product.category)}\n
            Fornecedor: ${product.supplier}\n
            Estoque Atual: ${product.stock} unidades\n
            Estoque Mínimo: ${product.minStock} unidades\n
            Status: ${statusLabels[stockStatus]}\n
            Localização: ${product.location}
        `);
    }

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        // Preencher modal com dados do produto
        document.getElementById('product-code').value = product.code;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-supplier').value = product.supplier;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-min-stock').value = product.minStock;
        document.getElementById('product-location').value = product.location;

        // Abrir modal
        document.getElementById('modal-form').style.display = 'flex';
    }

    deleteProduct(id) {
        if (confirm(`Tem certeza que deseja excluir o produto ${this.products.find(p => p.id === id)?.code}?\nIsso removerá permanentemente este registro.`)) {
            this.products = this.products.filter(p => p.id !== id);
            localStorage.setItem('estoquepro-data', JSON.stringify(this.products));
            this.updateStorage();
            this.renderTable();
            this.updateMetrics();
            alert("Produto excluído com sucesso.");
        }
    }

    // Método para salvar novo/modificar produto
    saveProduct() {
        const code = document.getElementById('product-code').value.trim().toUpperCase();
        const description = document.getElementById('product-description').value.trim();
        const category = document.getElementById('product-category').value;
        const supplier = document.getElementById('product-supplier').value.trim();
        const stock = parseInt(document.getElementById('product-stock').value) || 0;
        const minStock = parseInt(document.getElementById('product-min-stock').value) || 0;
        const location = document.getElementById('product-location').value.trim();

        if (!code || !description || !supplier || !location) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // Verificar se é edição ou novo produto
        const existingIndex = this.products.findIndex(p => p.code === code);
        const isEdit = existingIndex >= 0;

        const productData = {
            id: isEdit ? this.products[existingIndex].id : Date.now(),
            code,
            description,
            category,
            stock,
            minStock,
            location,
            supplier
        };

        if (isEdit) {
            this.products[existingIndex] = productData;
        } else {
            // Verificar se código já existe
            if (this.products.some(p => p.code === code)) {
                alert("Este código já está em uso. Por favor, utilize outro código.");
                return;
            }
            this.products.push(productData);
        }

        localStorage.setItem('estoquepro-data', JSON.stringify(this.products));
        this.updateStorage();
        this.renderTable();
        this.updateMetrics();

        // Fechar modal
        document.getElementById('modal-form').style.display = 'none';
        document.getElementById('product-form').reset();

        alert(isEdit ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
    }

    updateStorage() {
        localStorage.setItem('estoquepro-data', JSON.stringify(this.products));
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.manager = new EstoquePro();

    // Event listeners globais
    const modal = document.getElementById('modal-form');
    const closeBtn = modal ? modal.querySelector('.close-modal') : null;

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Fechar modal ao clicar fora
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Salvar formulário
    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            window.manager.saveProduct();
        });
    }

    // Buscar produtos
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#table-body tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }

    // Filtro de status
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            const status = e.target.value;
            const rows = document.querySelectorAll('#table-body tr');

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                const stockCell = cells[3]; // Estoque atual
                const minStockCell = cells[4]; // Estoque mínimo
                const stock = parseInt(stockCell.textContent);
                const minStock = parseInt(minStockCell.textContent);

                let show = true;
                switch (status) {
                    case 'in-stock':
                        show = stock > 0 && stock > minStock;
                        break;
                    case 'low-stock':
                        show = stock > 0 && stock <= minStock;
                        break;
                    case 'out-of-stock':
                        show = stock === 0;
                        break;
                    case 'all':
                    default:
                        show = true;
                }

                row.style.display = show ? '' : 'none';
            });
        });
    }

    // Atualizar métricas inicial
    setTimeout(() => {
        window.manager.updateMetrics();
    }, 100);
});