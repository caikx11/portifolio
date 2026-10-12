// Sistema de Controle de Estoque - EstoquePro
document.addEventListener('DOMContentLoaded', function () {
    // Initialize data from localStorage or default values
    let products = JSON.parse(localStorage.getItem('estoqueProducts')) || [];
    let movements = JSON.parse(localStorage.getItem('estoqueMovements')) || [];

    // DOM Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const productForm = document.getElementById('product-form');
    const movementForm = document.getElementById('movement-form');
    const productModal = document.getElementById('product-modal');
    const movementModal = document.getElementById('movement-modal');
    const addProductBtn = document.getElementById('add-product-btn');
    const newMovementBtn = document.getElementById('new-movement-btn');
    const cancelProductBtn = document.getElementById('cancel-product-btn');
    const cancelMovementBtn = document.getElementById('cancel-movement-btn');
    const saveProductBtn = document.getElementById('save-product-btn');
    const saveMovementBtn = document.getElementById('save-movement-btn');
    const closeModals = document.querySelectorAll('.close-modal, .close-modal-movement');

    // Stats elements
    const totalProductsEl = document.getElementById('total-products');
    const totalValueEl = document.getElementById('total-value');
    const lowStockEl = document.getElementById('low-stock');
    const todayMovementsEl = document.getElementById('today-movements');
    const movementsBody = document.getElementById('movements-body');
    const productsBody = document.getElementById('products-body');
    const detailedMovementsBody = document.getElementById('detailed-movements-body');

    // Initialize the application
    initApp();

    // Event Listeners
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    addProductBtn.addEventListener('click', () => {
        openProductModal();
    });

    newMovementBtn.addEventListener('click', () => {
        openMovementModal();
    });

    cancelProductBtn.addEventListener('click', () => {
        closeModal(productModal);
    });

    cancelMovementBtn.addEventListener('click', () => {
        closeModal(movementModal);
    });

    closeModals.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            closeModal(modal);
        });
    });

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct();
    });

    movementForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveMovement();
    });

    // Functions
    function initApp() {
        renderStats();
        renderRecentMovements();
        renderProductsTable();
        renderDetailedMovements();
    }

    function switchTab(tabId) {
        // Update active tab button
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            }
        });

        // Update active tab pane
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === tabId) {
                pane.classList.add('active');
            }
        });
    }

    function openProductModal() {
        document.getElementById('modal-title').textContent = 'Adicionar Produto';
        productForm.reset();
        productModal.style.display = 'block';
    }

    function openMovementModal() {
        document.getElementById('movement-modal-title').textContent = 'Registrar Movimentação';
        movementForm.reset();
        loadProductsForMovement();
        movementModal.style.display = 'block';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
    }

    function saveProduct() {
        const product = {
            id: Date.now(),
            code: document.getElementById('product-code').value.trim(),
            name: document.getElementById('product-name').value.trim(),
            category: document.getElementById('product-category').value.trim(),
            currentStock: parseInt(document.getElementById('current-stock').value) || 0,
            minStock: parseInt(document.getElementById('min-stock').value) || 0,
            unitPrice: parseFloat(document.getElementById('unit-price').value) || 0,
            description: document.getElementById('product-description').value.trim()
        };

        // Validate
        if (!product.code || !product.name || !product.category) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        products.push(product);
        saveToLocalStorage();
        renderProductsTable();
        renderStats();
        closeModal(productModal);
        showNotification('Produto adicionado com sucesso!');
    }

    function saveMovement() {
        const movement = {
            id: Date.now(),
            productId: parseInt(document.getElementById('movement-product').value),
            type: document.getElementById('movement-type-select').value,
            quantity: parseInt(document.getElementById('movement-quantity').value),
            unitPrice: parseFloat(document.getElementById('movement-unit-price').value),
            observations: document.getElementById('movement-observations').value.trim(),
            timestamp: new Date().toISOString()
        };

        // Validate
        if (!movement.productId || !movement.quantity || !movement.unitPrice) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Find product to validate stock
        const product = products.find(p => p.id === movement.productId);
        if (!product) {
            alert('Produto não encontrado');
            return;
        }

        // Update stock based on movement type
        if (movement.type === 'saida') {
            if (product.currentStock < movement.quantity) {
                alert('Estoque insuficiente para esta saída');
                return;
            }
            product.currentStock -= movement.quantity;
        } else if (movement.type === 'entrada') {
            product.currentStock += movement.quantity;
        }

        movements.push(movement);
        saveToLocalStorage();
        renderStats();
        renderRecentMovements();
        renderProductsTable();
        renderDetailedMovements();
        closeModal(movementModal);
        showNotification('Movimentação registrada com sucesso!');
    }

    function saveToLocalStorage() {
        localStorage.setItem('estoqueProducts', JSON.stringify(products));
        localStorage.setItem('estoqueMovements', JSON.stringify(movements));
    }

    function renderStats() {
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
        const lowStock = products.filter(p => p.currentStock <= p.minStock).length;
        const today = new Date().toISOString().split('T')[0];
        const todayMovements = movements.filter(m => m.timestamp.startsWith(today)).length;

        totalProductsEl.textContent = totalProducts;
        totalValueEl.textContent = `R$ ${totalValue.toFixed(2)}`;
        lowStockEl.textContent = lowStock;
        todayMovementsEl.textContent = todayMovements;
    }

    function renderRecentMovements() {
        // Show last 5 movements
        const recentMovements = movements.slice(-5).reverse();
        movementsBody.innerHTML = '';

        if (recentMovements.length === 0) {
            movementsBody.innerHTML = '<tr><td colspan="5" class="no-data">Nenhuma movimentação registrada</td></tr>';
            return;
        }

        recentMovements.forEach(movement => {
            const product = products.find(p => p.id === movement.productId);
            const productName = product ? product.name : 'Produto excluído';
            const typeText = movement.type === 'entrada' ? 'Entrada' : 'Saída';
            const typeClass = movement.type === 'entrada' ? 'entrada' : 'saida';
            const date = new Date(movement.timestamp);
            const formattedDate = date.toLocaleString('pt-BR');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${productName}</td>
                <td><span class="movement-type ${typeClass}">${typeText}</span></td>
                <td>${movement.quantity}</td>
                <td>R$ ${(movement.quantity * movement.unitPrice).toFixed(2)}</td>
            `;
            movementsBody.appendChild(row);
        });
    }

    function renderProductsTable() {
        productsBody.innerHTML = '';

        if (products.length === 0) {
            productsBody.innerHTML = '<tr><td colspan="8" class="no-data">Nenhum produto cadastrado</td></tr>';
            return;
        }

        products.forEach(product => {
            const totalValue = product.currentStock * product.unitPrice;
            const stockStatus = product.currentStock <= product.minStock ? 'low-stock' : '';
            const date = new Date().toISOString().split('T')[0];

            const row = document.createElement('tr');
            row.className = stockStatus;
            row.innerHTML = `
                <td>${product.code}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.currentStock}</td>
                <td>${product.minStock}</td>
                <td>R$ ${product.unitPrice.toFixed(2)}</td>
                <td>R$ ${totalValue.toFixed(2)}</td>
                <td>
                    <button class="btn-sm btn-secondary edit-product" data-id="${product.id}">Editar</button>
                    <button class="btn-sm btn-sm-danger delete-product" data-id="${product.id}">Excluir</button>
                </td>
            `;
            productsBody.appendChild(row);
        });

        // Add event listeners to edit/delete buttons
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = parseInt(btn.getAttribute('data-id'));
                editProduct(productId);
            });
        });

        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = parseInt(btn.getAttribute('data-id'));
                deleteProduct(productId);
            });
        });
    }

    function renderDetailedMovements() {
        detailedMovementsBody.innerHTML = '';

        if (movements.length === 0) {
            detailedMovementsBody.innerHTML = '<tr><td colspan="7" class="no-data">Nenhuma movimentação registrada</td></tr>';
            return;
        }

        // Show all movements sorted by date (newest first)
        const sortedMovements = [...movements].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        sortedMovements.forEach(movement => {
            const product = products.find(p => p.id === movement.productId);
            const productName = product ? product.name : 'Produto excluído';
            const typeText = movement.type === 'entrada' ? 'Entrada' : 'Saída';
            const typeClass = movement.type === 'entrada' ? 'entrada' : 'saida';
            const date = new Date(movement.timestamp);
            const formattedDate = date.toLocaleString('pt-BR');
            const totalValue = movement.quantity * movement.unitPrice;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${productName}</td>
                <td><span class="movement-type ${typeClass}">${typeText}</span></td>
                <td>${movement.quantity}</td>
                <td>R$ ${movement.unitPrice.toFixed(2)}</td>
                <td>R$ ${totalValue.toFixed(2)}</td>
                <td>${movement.observations || '-'}</td>
            `;
            detailedMovementsBody.appendChild(row);
        });
    }

    function loadProductsForMovement() {
        const productSelect = document.getElementById('movement-product');
        productSelect.innerHTML = '<option value="">Selecione um produto</option>';

        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.code} - ${product.name} (Estoque: ${product.currentStock})`;
            productSelect.appendChild(option);
        });
    }

    function editProduct(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        document.getElementById('modal-title').textContent = 'Editar Produto';
        document.getElementById('product-code').value = product.code;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('current-stock').value = product.currentStock;
        document.getElementById('min-stock').value = product.minStock;
        document.getElementById('unit-price').value = product.unitPrice;
        document.getElementById('product-description').value = product.description;

        // We need to modify the form to update instead of add
        productForm.onsubmit = function(e) {
            e.preventDefault();
            updateProduct(productId);
        };

        productModal.style.display = 'block';
    }

    function updateProduct(productId) {
        const updatedProduct = {
            id: productId,
            code: document.getElementById('product-code').value.trim(),
            name: document.getElementById('product-name').value.trim(),
            category: document.getElementById('product-category').value.trim(),
            currentStock: parseInt(document.getElementById('current-stock').value) || 0,
            minStock: parseInt(document.getElementById('min-stock').value) || 0,
            unitPrice: parseFloat(document.getElementById('unit-price').value) || 0,
            description: document.getElementById('product-description').value.trim()
        };

        // Validate
        if (!updatedProduct.code || !updatedProduct.name || !updatedProduct.category) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = updatedProduct;
            saveToLocalStorage();
            renderProductsTable();
            renderStats();
            closeModal(productModal);
            // Reset form to add mode
            productForm.onsubmit = function(e) {
                e.preventDefault();
                saveProduct();
            };
            showNotification('Produto atualizado com sucesso!');
        }
    }

    function deleteProduct(productId) {
        if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
            return;
        }

        // Remove product
        products = products.filter(p => p.id !== productId);

        // Also remove movements related to this product (optional)
        // movements = movements.filter(m => m.productId !== productId);

        saveToLocalStorage();
        renderProductsTable();
        renderStats();
        renderRecentMovements();
        renderDetailedMovements();
        showNotification('Produto excluído com sucesso!');
    }

    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#10b981';
        notification.style.color = 'white';
        notification.style.padding = '12px 24px';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        notification.style.zIndex = '1000';
        notification.style.animation = 'slideIn 0.3s ease forwards';

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Add CSS for notifications and movement types
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }

        .movement-type {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .movement-type.entrada {
            background-color: #dcfce7;
            color: #166534;
        }

        .movement-type.saida {
            background-color: #fee2e2;
            color: #991b1b;
        }

        .no-data {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-style: italic;
        }

        .low-stock {
            background-color: #fef3c7;
        }
    `;
    document.head.appendChild(style);
});