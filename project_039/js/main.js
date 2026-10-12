// Controle de Gastos com Gráficos
class ExpenseTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || this.getDefaultTransactions();
        this.categories = {
            income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
            expense: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Outros']
        };
        this.pieChart = null;
        this.barChart = null;
        this.init();
    }

    getDefaultTransactions() {
        return [
            { id: 1, type: 'income', category: 'Salário', description: 'Salário mensal', value: 5000, date: '2024-01-05' },
            { id: 2, type: 'expense', category: 'Alimentação', description: 'Supermercado', value: 450, date: '2024-01-10' },
            { id: 3, type: 'expense', category: 'Transporte', description: 'Combustível', value: 200, date: '2024-01-12' },
            { id: 4, type: 'expense', category: 'Moradia', description: 'Aluguel', value: 1200, date: '2024-01-01' },
            { id: 5, type: 'income', category: 'Freelance', description: 'Projeto web', value: 1500, date: '2024-01-20' },
            { id: 6, type: 'expense', category: 'Saúde', description: 'Farmácia', value: 150, date: '2024-01-25' },
            { id: 7, type: 'expense', category: 'Lazer', description: 'Cinema', value: 80, date: '2024-01-28' }
        ];
    }

    init() {
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
            alert('Por favor, preencha todos os campos');
            return;
        }

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
        if (balance >= 0) {
            balanceCard.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
        } else {
            balanceCard.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        }
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
                        <span class="transaction-category">${t.category}</span>
                        <span>${this.formatDate(t.date)}</span>
                    </div>
                </div>
                <div class="transaction-value">
                    ${t.type === 'income' ? '+' : '-'} ${this.formatCurrency(t.value)}
                </div>
                <div class="transaction-actions">
                    <button class="delete-btn" onclick="expenseTracker.deleteTransaction(${t.id})">&times;</button>
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
                        '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
                        '#9b59b6', '#1abc9c', '#e67e22', '#95a5a6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
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
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
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
                        backgroundColor: 'rgba(39, 174, 96, 0.8)',
                        borderColor: '#27ae60',
                        borderWidth: 1
                    },
                    {
                        label: 'Despesas',
                        data: expenseData,
                        backgroundColor: 'rgba(231, 76, 60, 0.8)',
                        borderColor: '#e74c3c',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
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
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }
}

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.expenseTracker = new ExpenseTracker();
});