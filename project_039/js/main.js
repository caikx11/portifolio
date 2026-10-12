// Controle de Gastos com Gráficos
class ExpenseTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions_v2')) || this.getDefaultTransactions();
        this.categories = {
            income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
            expense: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Outros']
        };
        this.pieChart = null;
        this.barChart = null;
        this.init();
    }

    getDefaultTransactions() {
        const d = (monthsAgo, day) => {
            const t = new Date();
            const x = new Date(t.getFullYear(), t.getMonth() - monthsAgo, day);
            return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
        };
        return [
            { id: 1, type: 'income', category: 'Salário', description: 'Salário mensal', value: 5000, date: d(0, 5) },
            { id: 2, type: 'expense', category: 'Alimentação', description: 'Supermercado', value: 450, date: d(0, 10) },
            { id: 3, type: 'expense', category: 'Transporte', description: 'Combustível', value: 200, date: d(0, 12) },
            { id: 4, type: 'expense', category: 'Moradia', description: 'Aluguel', value: 1200, date: d(0, 1) },
            { id: 5, type: 'income', category: 'Freelance', description: 'Projeto web', value: 1500, date: d(1, 20) },
            { id: 6, type: 'expense', category: 'Saúde', description: 'Farmácia', value: 150, date: d(1, 25) },
            { id: 7, type: 'expense', category: 'Lazer', description: 'Cinema', value: 80, date: d(1, 18) },
            { id: 8, type: 'income', category: 'Salário', description: 'Salário mensal', value: 5000, date: d(1, 5) },
            { id: 9, type: 'expense', category: 'Moradia', description: 'Aluguel', value: 1200, date: d(1, 1) },
            { id: 10, type: 'expense', category: 'Educação', description: 'Curso online', value: 320, date: d(2, 14) },
            { id: 11, type: 'income', category: 'Salário', description: 'Salário mensal', value: 5000, date: d(2, 5) },
            { id: 12, type: 'expense', category: 'Alimentação', description: 'Restaurante', value: 180, date: d(2, 22) }
        ].sort((a, b) => b.date.localeCompare(a.date));
    }

    init() {
        document.getElementById('month-label').textContent = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        this.bindEvents();
        this.updateCategoryOptions();
        this.setDefaultDate();
        this.render();
    }

    bindEvents() {
        // Form submit
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Type change
        document.getElementById('trans-type').addEventListener('change', () => {
            this.updateCategoryOptions();
        });

        // Filters
        document.getElementById('filter-type').addEventListener('change', () => this.render());
        document.getElementById('filter-category').addEventListener('change', () => this.render());
    }

    updateCategoryOptions() {
        const type = document.getElementById('trans-type').value;
        const categorySelect = document.getElementById('trans-category');
        const categories = this.categories[type] || [];

        categorySelect.innerHTML = '<option value="">Selecione a categoria</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('trans-date').value = today;
    }

    addTransaction() {
        const type = document.getElementById('trans-type').value;
        const category = document.getElementById('trans-category').value;
        const description = document.getElementById('trans-description').value.trim();
        const value = parseFloat(document.getElementById('trans-value').value);
        const date = document.getElementById('trans-date').value;

        if (!type || !category || !description || !value || !date) {
            const err = document.getElementById('form-error');
            err.textContent = 'Preencha tipo, categoria, descrição, valor e data.';
            err.hidden = false;
            return;
        }

        document.getElementById('form-error').hidden = true;
        const transaction = {
            id: Date.now(),
            type,
            category,
            description,
            value,
            date
        };

        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.render();

        // Reset form
        document.getElementById('transaction-form').reset();
        this.setDefaultDate();
    }

    deleteTransaction(id) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.render();
        }
    }

    getFilteredTransactions() {
        const filterType = document.getElementById('filter-type').value;
        const filterCategory = document.getElementById('filter-category').value;

        return this.transactions.filter(t => {
            const typeMatch = filterType === 'all' || t.type === filterType;
            const categoryMatch = filterCategory === 'all' || t.category === filterCategory;
            return typeMatch && categoryMatch;
        });
    }

    calculateTotals() {
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.value, 0);

        const expense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.value, 0);

        return { income, expense, balance: income - expense };
    }

    render() {
        this.renderSummary();
        this.renderCharts();
        this.renderTransactions();
        this.renderFilterCategories();
    }

    renderSummary() {
        const { income, expense, balance } = this.calculateTotals();

        document.getElementById('total-income').textContent = this.formatCurrency(income);
        document.getElementById('total-expense').textContent = this.formatCurrency(expense);
        document.getElementById('total-balance').textContent = this.formatCurrency(balance);

        // Update balance card color based on value
        const balanceCard = document.querySelector('.summary-card.balance');
        balanceCard.classList.toggle('negative', balance < 0);
    }

    renderFilterCategories() {
        const filterCategory = document.getElementById('filter-category');
        const currentValue = filterCategory.value;

        // Get unique categories from transactions
        const categories = [...new Set(this.transactions.map(t => t.category))];

        filterCategory.innerHTML = '<option value="all">Todas as categorias</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filterCategory.appendChild(option);
        });

        filterCategory.value = currentValue;
    }

    renderTransactions() {
        const container = document.getElementById('transactions-list');
        const filtered = this.getFilteredTransactions();

        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state">Nenhuma transação encontrada</div>';
            return;
        }

        container.innerHTML = filtered.map(t => `
            <div class="transaction-item ${t.type}" data-id="${t.id}">
                <div class="transaction-info">
                    <div class="transaction-description">${this.escapeHtml(t.description)}</div>
                    <div class="transaction-meta">
                        <span class="transaction-category">${this.escapeHtml(t.category)}</span>
                        <span>${this.formatDate(t.date)}</span>
                    </div>
                </div>
                <div class="transaction-value">
                    ${t.type === 'income' ? '+' : '-'} ${this.formatCurrency(t.value)}
                </div>
                <div class="transaction-actions">
                    <button class="delete-btn" aria-label="Excluir transação" onclick="expenseTracker.deleteTransaction(${t.id})">&times;</button>
                </div>
            </div>
        `).join('');
    }

    renderCharts() {
        this.renderPieChart();
        this.renderBarChart();
    }

    renderPieChart() {
        const ctx = document.getElementById('pieChart').getContext('2d');

        // Calculate expenses by category
        const expensesByCategory = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.value;
                return acc;
            }, {});

        const labels = Object.keys(expensesByCategory);
        const data = Object.values(expensesByCategory);

        if (this.pieChart) {
            this.pieChart.destroy();
        }

        this.pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.length > 0 ? labels : ['Sem despesas'],
                datasets: [{
                    data: data.length > 0 ? data : [1],
                    backgroundColor: [
                        '#0f8b6d', '#ff6b57', '#f7b32b', '#3d5a80',
                        '#8fd694', '#c05299', '#5bc0be', '#9aa5a0'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${this.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderBarChart() {
        const ctx = document.getElementById('barChart').getContext('2d');

        // Get last 6 months
        const months = [];
        const incomeData = [];
        const expenseData = [];

        for (let i = 5; i >= 0; i--) {
            const now = new Date();
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

            months.push(monthLabel);

            const monthTransactions = this.transactions.filter(t => t.date.startsWith(monthKey));
            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.value, 0);
            const expense = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.value, 0);

            incomeData.push(income);
            expenseData.push(expense);
        }

        if (this.barChart) {
            this.barChart.destroy();
        }

        this.barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Receitas',
                        data: incomeData,
                        backgroundColor: '#0f8b6d',
                        borderColor: '#0f8b6d',
                        borderWidth: 1
                    },
                    {
                        label: 'Despesas',
                        data: expenseData,
                        backgroundColor: '#ff6b57',
                        borderColor: '#ff6b57',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${this.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    formatCurrency(value) {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    formatDate(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTransactions() {
        localStorage.setItem('transactions_v2', JSON.stringify(this.transactions));
    }
}

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.expenseTracker = new ExpenseTracker();
});