class FinanceDashboard {
    constructor() {
        this.transactions = [];
        this.currentPeriod = 'this-month';
        this.isDarkMode = false;
        this.chartInstances = {};
        this.initDOMElements();
        this.initEventListeners();
        this.loadMockData();
        this.loadPreferences();
        this.render();
    }

    initDOMElements() {
        // Period selection
        this.periodSelect = document.getElementById('period-select');

        // Theme toggle
        this.themeToggleBtn = document.getElementById('theme-toggle-btn');
        this.themeIcon = document.getElementById('theme-icon');

        // Add transaction button
        this.addBtn = document.getElementById('add-transaction-btn');

        // Search input
        this.searchInput = document.getElementById('search-transactions');

        // Filters
        this.assetFilter = document.getElementById('asset-filter');
        this.typeFilter = document.getElementById('type-filter');
        this.searchTerm = '';
        this.sortKey = 'data';
        this.sortDir = -1;

        // Modal elements
        this.modal = document.getElementById('transaction-modal');
        this.transactionForm = document.getElementById('transaction-form');

        // Chart canvases
        this.distributionChartCanvas = document.getElementById('financial-distribution-chart');
        this.trendChartCanvas = document.getElementById('monthly-trend-chart');
    }

    initEventListeners() {
        // Period selection
        this.periodSelect.addEventListener('change', (e) => {
            this.currentPeriod = e.target.value;
            this.render();
        });

        // Theme toggle
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

        // Add transaction
        this.addBtn.addEventListener('click', () => this.openModal());

        // Search
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterAndRender();
        });

        // Filters
        this.assetFilter.addEventListener('change', () => this.filterAndRender());
        this.typeFilter.addEventListener('change', () => this.filterAndRender());
        document.querySelectorAll('th[data-sort]').forEach(th => th.addEventListener('click', () => {
            const k = th.dataset.sort;
            this.sortDir = this.sortKey === k ? -this.sortDir : 1;
            this.sortKey = k;
            this.filterAndRender();
        }));
        document.getElementById('cancel-btn').addEventListener('click', () => this.closeModal());
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeModal(); });
        document.querySelectorAll('.chart-btn').forEach(b => b.addEventListener('click', () => this.render()));

        // Modal close
        const closeModal = () => this.closeModal();
        document.querySelector('.close-btn').addEventListener('click', closeModal);
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) closeModal();
        });

        // Form submission
        this.transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
            this.closeModal();
        });
    }

    loadMockData() {
        const saved = localStorage.getItem('finance_transactions_v2');
        if (saved) {
            this.transactions = JSON.parse(saved);
        } else {
            this.transactions = [
                { id: 1, descricao: 'Salário Mensal', categoria: 'salario', valor: 8500.00, tipo: 'receita', data: this.seedDate(15) },
                { id: 2, descricao: 'Freelance - Projeto Web', categoria: 'freelance', valor: 2500.00, tipo: 'receita', data: this.seedDate(10) },
                { id: 3, descricao: 'Compra de Mercado', categoria: 'comida', valor: 150.50, tipo: 'despesa', data: this.seedDate(12) },
                { id: 4, descricao: 'Uber - Id Airport', categoria: 'transporte', valor: 45.00, tipo: 'despesa', data: this.seedDate(8) },
                { id: 5, descricao: 'Academia', categoria: 'lazer', valor: 120.00, tipo: 'despesa', data: this.seedDate(14) },
                { id: 6, descricao: 'Investimento Tesouro', categoria: 'investimento', valor: 500.00, tipo: 'despesa', data: this.seedDate(5) },
                { id: 7, descricao: 'Farmácia', categoria: 'saude', valor: 89.90, tipo: 'despesa', data: this.seedDate(16) },
                { id: 8, descricao: 'Curso Online', categoria: 'educacao', valor: 350.00, tipo: 'despesa', data: this.seedDate(18) },
                { id: 9, descricao: 'Venda Item Usado', categoria: 'outros-r', valor: 150.00, tipo: 'receita', data: this.seedDate(20) },
                { id: 10, descricao: 'Jantar', categoria: 'comida', valor: 120.00, tipo: 'despesa', data: this.seedDate(22) }
            ];
            this.saveTransactions();
        }
    }

    seedDate(day) {
        const t = new Date();
        const prev = day > 12;
        const d = prev ? new Date(t.getFullYear(), t.getMonth() - 1, day) : new Date(t.getFullYear(), t.getMonth(), Math.min(day, t.getDate()));
        return d.toISOString().slice(0, 10);
    }

    saveTransactions() {
        localStorage.setItem('finance_transactions_v2', JSON.stringify(this.transactions));
    }

    filterAndRender() {
        const term = this.searchTerm || '';
        const type = this.typeFilter.value, cat = this.assetFilter.value;
        const filtered = this.filterTransactions().filter(tx =>
            (!type || tx.tipo === type) && (!cat || tx.categoria === cat) &&
            (tx.descricao.toLowerCase().includes(term) || this.getCategoryLabel(tx.categoria).toLowerCase().includes(term)));
        const k = this.sortKey, dir = this.sortDir;
        filtered.sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * dir);
        this.updateSummary(filtered);
        this.renderTransactions(filtered);
        this.renderCharts(filtered);
    }

    filterTransactions() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();

        return this.transactions.filter(tx => {
            const txDate = new Date(tx.data);
            const txYear = txDate.getFullYear();
            const txMonth = txDate.getMonth();

            switch(this.currentPeriod) {
                case 'this-year':
                    return txYear === year;
                case 'this-month':
                    return txYear === year && txMonth === month;
                case 'today':
                    return txYear === year && txMonth === month && txDate.getDate() === day;
                case 'this-week':
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay());
                    return txDate >= startOfWeek;
                default:
                    return true; // All time
            }
        }).sort((a, b) => new Date(b.data) - new Date(a.data));
    }

    fillCategoryFilter() {
        const cur = this.assetFilter.value;
        const cats = [...new Set(this.transactions.map(t => t.categoria))];
        this.assetFilter.innerHTML = '<option value="">Todas as categorias</option>' +
            cats.map(c => `<option value="${c}">${this.getCategoryLabel(c)}</option>`).join('');
        this.assetFilter.value = cats.includes(cur) ? cur : '';
    }

    render() {
        this.fillCategoryFilter();
        this.filterAndRender();
        this.updateCurrentDateDisplay();
    }

    updateSummary(filtered) {
        let totalIncome = 0;
        let totalExpense = 0;

        filtered.forEach(tx => {
            if (tx.tipo === 'receita') {
                totalIncome += tx.valor;
            } else {
                totalExpense += tx.valor;
            }
        });

        const balance = totalIncome - totalExpense;

        document.getElementById('total-income').textContent = `R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('total-expense').textContent = `R$ ${totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('balance').textContent = `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

        const balanceEl = document.getElementById('balance').parentElement;
        balanceEl.className = balance >= 0 ? 'stat-tile balance positive' : 'stat-tile balance negative';
    }

    renderTransactions(filtered) {
        const tbody = document.getElementById('transactions-body');
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">Nenhuma transação encontrada.</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(tx => `
            <tr class="transaction-row" data-category="${tx.categoria}" data-type="${tx.tipo}">
                <td class="description">${this.escapeHtml(tx.descricao)}</td>
                <td class="category">${this.getCategoryLabel(tx.categoria)}</td>
                <td class="value ${tx.tipo}">${tx.tipo === 'receita' ? '+' : '-'} R$ ${tx.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="date">${this.formatDate(tx.data)}</td>
                <td class="type">${tx.tipo === 'receita' ? '🟢' : '🔴'}</td>
            </tr>
        `).join('');
    }

    renderCharts(filtered) {
        this.renderDistributionChart(filtered);
        this.renderTrendChart(filtered);
    }

    renderDistributionChart(filtered) {
        const ctx = this.distributionChartCanvas.getContext('2d');

        if (this.chartInstances.distribution) {
            this.chartInstances.distribution.destroy();
        }

        const expenses = filtered.filter(t => t.tipo === 'despesa');
        const categories = {};

        expenses.forEach(t => {
            categories[t.categoria] = (categories[t.categoria] || 0) + t.valor;
        });

        const data = {
            labels: Object.keys(categories).map(c => this.getCategoryLabel(c)),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    '#2a78d6', '#f59e0b', '#10b981', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'
                ],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        };

        this.chartInstances.distribution = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 12 },
                            padding: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                                return `${label}: R$ ${value}`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: false
                }
            }
        });
    }

    renderTrendChart(filtered) {
        const ctx = this.trendChartCanvas.getContext('2d');

        if (this.chartInstances.trend) {
            this.chartInstances.trend.destroy();
        }

        const months = [];
        const incomeData = [];
        const expenseData = [];

        // Aggregate by month
        const monthlyData = {};
        filtered.forEach(tx => {
            const date = new Date(tx.data);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { income: 0, expense: 0 };
            }
            if (tx.tipo === 'receita') {
                monthlyData[monthKey].income += tx.valor;
            } else {
                monthlyData[monthKey].expense += tx.valor;
            }
        });

        // Sort by date
        const sortedMonths = Object.keys(monthlyData).sort();
        sortedMonths.forEach(monthKey => {
            const [year, month] = monthKey.split('-');
            months.push(new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }));
            incomeData.push(monthlyData[monthKey].income);
            expenseData.push(monthlyData[monthKey].expense);
        });

        // Limit to last 6 months
        const displayMonths = months.slice(-6);
        const displayIncome = incomeData.slice(-6);
        const displayExpense = expenseData.slice(-6);

        this.chartInstances.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: displayMonths,
                datasets: [
                    {
                        label: 'Receitas',
                        data: displayIncome,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Despesas',
                        data: displayExpense,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: { size: 12 },
                            padding: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                                return `${label}: R$ ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            drawBorder: false,
                            lineWidth: 0.5
                        },
                        ticks: {
                            font: { size: 11 },
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
                            }
                        }
                    }
                }
            }
        });
    }

    getCategoryLabel(category) {
        const labels = {
            salario: 'Salário',
            freelance: 'Freelance',
            investimento: 'Investimento',
            comida: 'Alimentação',
            transporte: 'Transporte',
            lazer: 'Lazer',
            saude: 'Saúde',
            educacao: 'Educação',
            outros: 'Outros',
            'outros-r': 'Outros'
        };
        return labels[category] || category;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    openModal() {
        this.modal.classList.add('active');
        this.transactionForm.reset();
        document.getElementById('data').value = new Date().toISOString().split('T')[0];
        document.getElementById('descricao').focus();
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.transactionForm.reset();
    }

    addTransaction() {
        const descricao = document.getElementById('descricao').value.trim();
        const categoria = document.getElementById('categoria').value;
        const valor = parseFloat(document.getElementById('valor').value);
        const tipo = document.getElementById('tipo').value;
        const data = document.getElementById('data').value;

        if (!descricao || isNaN(valor) || valor <= 0 || !data) {
            this.showToast('Preencha todos os campos corretamente', 'error');
            return;
        }

        const newTransaction = {
            id: Date.now(),
            descricao,
            categoria,
            valor,
            tipo,
            data
        };

        this.transactions.push(newTransaction);
        this.saveTransactions();
        this.render();
        this.showToast('Transação adicionada com sucesso!', 'success');
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        this.savePreferences();
    }

    applyTheme() {
        if (this.isDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
            this.themeIcon.textContent = '☀️';
            this.themeIcon.style.transform = 'rotate(180deg)';
        } else {
            document.body.removeAttribute('data-theme');
            this.themeIcon.textContent = '🌙';
            this.themeIcon.style.transform = 'rotate(0deg)';
        }
    }

    loadPreferences() {
        const savedTheme = localStorage.getItem('finance_dashboard_theme');
        if (savedTheme === 'dark') {
            this.isDarkMode = true;
            this.applyTheme();
        }
    }

    savePreferences() {
        localStorage.setItem('finance_dashboard_theme', this.isDarkMode ? 'dark' : 'light');
    }

    updateCurrentDateDisplay() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('pt-BR', options);
        document.getElementById('current-date').textContent = dateStr;
    }
}

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    window.financeDashboard = new FinanceDashboard();
});

// Global functions for theme toggle from HTML
window.toggleThemeGlobal = function() {
    if (window.financeDashboard) {
        window.financeDashboard.toggleTheme();
    }
};