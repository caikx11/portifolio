// Controle de Finanças Javascript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const notificationContainer = document.getElementById('notification-container');
    const totalBalanceEl = document.getElementById('total-balance');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const monthlyBalanceEl = document.getElementById('monthly-balance');
    const recentTransactionsList = document.getElementById('recent-transactions-list');
    const transactionsList = document.getElementById('transactions-list');
    const filterType = document.getElementById('filter-type');
    const filterPeriod = document.getElementById('filter-period');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const showAddFormBtn = document.getElementById('show-add-form');
    const transactionForm = document.getElementById('transaction-form');
    const cancelTransactionBtn = document.getElementById('cancel-transaction');
    const currencySelect = document.getElementById('currency-select');
    const themeSelect = document.getElementById('theme-select');
    const defaultViewSelect = document.getElementById('default-view-select');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const newCategoryInput = document.getElementById('new-category-input');
    const customCategoriesList = document.getElementById('custom-categories-list');
    const clearAllDataBtn = document.getElementById('clear-all-data');
    const exportCSVBtn = document.getElementById('export-csv');
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const viewAllTransactionsBtn = document.getElementById('view-all-transactions-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const reportPeriodSelect = document.getElementById('report-period');
    const incomeExpenseChart = document.getElementById('income-expense-chart');
    const expensesByCategoryChart = document.getElementById('expenses-by-category-chart');
    const monthlyTrendChart = document.getElementById('monthly-trend-chart');
    const incomeDistributionChart = document.getElementById('income-distribution-chart');

    // Form elements
    const transactionDescription = document.getElementById('transaction-description');
    const transactionAmount = document.getElementById('transaction-amount');
    const transactionTypeRadios = document.getElementsByName('transaction-type');
    const transactionCategory = document.getElementById('transaction-category');
    const transactionDate = document.getElementById('transaction-date');

    // Charts placeholders
    const chartPlaceholders = [
        incomeExpenseChart,
        expensesByCategoryChart,
        monthlyTrendChart,
        incomeDistributionChart
    ];

    // Data
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let settings = JSON.parse(localStorage.getItem('settings')) || {
        currency: 'BRL',
        theme: 'light',
        defaultView: 'monthly'
    };
    let customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];

    // Initialize
    init();

    function init() {
        loadSettings();
        loadCustomCategories();
        updateUI();
        setupEventListeners();
        renderNotifications();
    }

    function loadSettings() {
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        currencySelect.value = settings.currency;
        themeSelect.value = settings.theme;
        defaultViewSelect.value = settings.defaultView;
    }

    function saveSettings() {
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    function loadCustomCategories() {
        renderCustomCategories();
    }

    function saveCustomCategories() {
        localStorage.setItem('customCategories', JSON.stringify(customCategories));
        renderCustomCategories();
    }

    function renderCustomCategories() {
        if (customCategories.length === 0) {
            customCategoriesList.innerHTML = '<p>Nenhuma categoria personalizada adicionada</p>';
            return;
        }

        customCategoriesList.innerHTML = customCategories.map(category => `
            <span class="category-tag">${category}</span>
        `).join('');
    }

    function setupEventListeners() {
        // Tab navigation
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Transaction form
        transactionForm.addEventListener('submit', handleTransactionSubmit);
        cancelTransactionBtn.addEventListener('click', () => {
            transactionForm.reset();
            transactionForm.classList.add('hidden');
            showAddFormBtn.classList.remove('hidden');
        });
        showAddFormBtn.addEventListener('click', () => {
            transactionForm.reset();
            transactionForm.classList.remove('hidden');
            showAddFormBtn.classList.add('hidden');
            transactionDescription.focus();
        });

        // Transaction type radios
        transactionTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                updateCategoryOptions();
            });
        });

        // Filters
        filterType.addEventListener('change', filterTransactions);
        filterPeriod.addEventListener('change', filterTransactions);
        clearFiltersBtn.addEventListener('click', () => {
            filterType.value = 'all';
            filterPeriod.value = 'monthly';
            filterTransactions();
        });

        // Settings
        currencySelect.addEventListener('change', () => {
            settings.currency = currencySelect.value;
            saveSettings();
            updateUI();
        });

        themeSelect.addEventListener('change', () => {
            settings.theme = themeSelect.value;
            if (settings.theme === 'dark') {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
            saveSettings();
            updateUI();
        });

        defaultViewSelect.addEventListener('change', () => {
            settings.defaultView = defaultViewSelect.value;
            saveSettings();
        });

        // Custom categories
        addCategoryBtn.addEventListener('click', addCustomCategory);
        newCategoryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addCustomCategory();
            }
        });

        // Data management
        clearAllDataBtn.addEventListener('click', clearAllData);
        exportCSVBtn.addEventListener('click', exportToCSV);

        // Quick actions
        addTransactionBtn.addEventListener('click', () => {
            showAddFormBtn.click();
        });

        viewAllTransactionsBtn.addEventListener('click', () => {
            tabButtons[1].click(); // Transactions tab
        });

        // Report filters
        reportPeriodSelect.addEventListener('change', updateReports);
    }

    function handleTransactionSubmit(e) {
        e.preventDefault();

        const description = transactionDescription.value.trim();
        const amount = parseFloat(transactionAmount.value);
        const type = document.querySelector('input[name="transaction-type"]:checked').value;
        const category = transactionCategory.value;
        const date = transactionDate.value;

        if (!description || isNaN(amount) || amount <= 0 || !category || !date) {
            showNotification('Por favor, preencha todos os campos corretamente', 'error');
            return;
        }

        const transaction = {
            id: Date.now().toString(),
            description,
            amount: type === 'income' ? amount : -amount, // Store as positive for income, negative for expense
            originalAmount: amount,
            category,
            date,
            type
        };

        transactions.push(transaction);
        saveTransactions();
        transactionForm.reset();
        transactionForm.classList.add('hidden');
        showAddFormBtn.classList.remove('hidden');
        updateUI();
        showNotification('Transação adicionada com sucesso', 'success');
    }

    function updateCategoryOptions() {
        const type = document.querySelector('input[name="transaction-type"]:checked').value;
        const incomeOptions = [
            { value: 'salary', text: 'Salário' },
            { value: 'freelance', text: 'Freelance' },
            { value: 'investment', text: 'Investimento' },
            { value: 'other-income', text: 'Outra Receita' }
        ];
        const expenseOptions = [
            { value: 'food', text: 'Alimentação' },
            { value: 'transport', text: 'Transporte' },
            { value: 'housing', text: 'Moradia' },
            { value: 'health', text: 'Saúde' },
            { value: 'entertainment', text: 'Lazer' },
            { value: 'education', text: 'Educação' },
            { value: 'shopping', text: 'Compras' },
            { value: 'bills', text: 'Contas' },
            { value: 'other-expense', text: 'Outra Despesa' }
        ];

        const options = type === 'income' ? incomeOptions : expenseOptions;
        const allOptions = [...options, ...customCategories.map(cat => ({ value: cat, text: cat }))];

        transactionCategory.innerHTML = '<option value="">Selecione uma categoria</option>';
        allOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            transactionCategory.appendChild(opt);
        });
    }

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function loadTransactions() {
        const saved = localStorage.getItem('transactions');
        if (saved) {
            try {
                transactions = JSON.parse(saved);
            } catch (error) {
                console.error('Error parsing transactions:', error);
                transactions = [];
                localStorage.removeItem('transactions');
            }
        }
    }

    function filterTransactions() {
        const typeFilter = filterType.value;
        const periodFilter = filterPeriod.value;

        let filtered = transactions;

        // Filter by type
        if (typeFilter !== 'all') {
            filtered = filtered.filter(t => t.type === typeFilter);
        }

        // Filter by period
        if (periodFilter !== 'all') {
            const now = new Date();
            let startDate;

            switch (periodFilter) {
                case 'monthly':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'quarterly':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                    break;
                case 'yearly':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
            }

            filtered = filtered.filter(t => new Date(t.date) >= startDate);
        }

        renderTransactions(filtered, transactionsList);
        renderRecentTransactions(filtered);
    }

    function renderTransactions(transactionsToRender, targetElement) {
        if (!transactionsToRender || transactionsToRender.length === 0) {
            targetElement.innerHTML = '<p class="empty-state">Nenhuma transação encontrada</p>';
            return;
        }

        targetElement.innerHTML = transactionsToRender
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Newest first
            .map(transaction => {
                const date = new Date(transaction.date);
                const formattedDate = date.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                return `
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <div class="transaction-description">${escapeHTML(transaction.description)}</div>
                            <div class="transaction-meta">
                                <span class="transaction-category">${getCategoryLabel(transaction.category)}</span>
                                <span class="transaction-date">${formattedDate}</span>
                            </div>
                        </div>
                        <div class="transaction-amount ${transaction.amount >= 0 ? 'income' : 'expense'}">
                            ${formatCurrency(Math.abs(transaction.amount))}
                        </div>
                    </div>
                `;
            })
            .join('');
    }

    function renderRecentTransactions(transactionsToRender) {
        const recent = transactionsToRender
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (!recent || recent.length === 0) {
            recentTransactionsList.innerHTML = '<p class="empty-state">Nenhuma transação registrada ainda</p>';
            return;
        }

        recentTransactionsList.innerHTML = recent
            .map(transaction => {
                const date = new Date(transaction.date);
                const formattedDate = date.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit'
                });

                return `
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <div class="transaction-description">${escapeHTML(transaction.description)}</div>
                            <div class="transaction-meta">
                                <span class="transaction-category">${getCategoryLabel(transaction.category)}</span>
                                <span class="transaction-date">${formattedDate}</span>
                            </div>
                        </div>
                        <div class="transaction-amount ${transaction.amount >= 0 ? 'income' : 'expense'}">
                            ${formatCurrency(Math.abs(transaction.amount))}
                        </div>
                    </div>
                `;
            })
            .join('');
    }

    function getCategoryLabel(category) {
        const categoryMap = {
            salary: 'Salário',
            freelance: 'Freelance',
            investment: 'Investimento',
            'other-income': 'Outra Receita',
            food: 'Alimentação',
            transport: 'Transporte',
            housing: 'Moradia',
            health: 'Saúde',
            entertainment: 'Lazer',
            education: 'Educação',
            shopping: 'Compras',
            bills: 'Contas',
            'other-expense': 'Outra Despesa'
        };

        return categoryMap[category] || category;
    }

    function formatCurrency(amount) {
        const currencyCode = settings.currency === 'BRL' ? 'BRL' :
                           settings.currency === 'USD' ? 'USD' : 'EUR';

        const formatter = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currencyCode
        });

        return formatter.format(amount);
    }

    function updateUI() {
        updateSummary();
        updateCharts();
        filterTransactions(); // This will update both lists
    }

    function updateSummary() {
        const total = transactions.reduce((sum, t) => sum + t.amount, 0);
        const income = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = Math.abs(transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0));

        const now = new Date();
        const monthly = transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === now.getMonth() &&
                       tDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);

        totalBalanceEl.textContent = formatCurrency(total);
        totalIncomeEl.textContent = formatCurrency(income);
        totalExpensesEl.textContent = formatCurrency(expenses);
        monthlyBalanceEl.textContent = formatCurrency(monthly);
    }

    function updateCharts() {
        // Simple placeholder updates for now
        chartPlaceholders.forEach(chart => {
            chart.innerHTML = `
                <div class="chart-content">
                    <h3>Gráfico em Desenvolvimento</h3>
                    <p>Esta funcionalidade será implementada em breve</p>
                </div>
            `;
        });
    }

    function updateReports() {
        updateCharts();
    }

    function addCustomCategory() {
        const category = newCategoryInput.value.trim();
        if (!category) {
            showNotification('Por favor, digite um nome para a categoria', 'error');
            return;
        }

        if (customCategories.includes(category)) {
            showNotification('Esta categoria já existe', 'error');
            return;
        }

        customCategories.push(category);
        saveCustomCategories();
        newCategoryInput.value = '';
        updateCategoryOptions();
        showNotification('Categoria adicionada com sucesso', 'success');
    }

    function clearAllData() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            transactions = [];
            customCategories = [];
            settings = {
                currency: 'BRL',
                theme: 'light',
                defaultView: 'monthly'
            };
            saveSettings();
            saveTransactions();
            saveCustomCategories();
            updateUI();
            showNotification('Todos os dados foram limpos', 'info');
        }
    }

    function exportToCSV() {
        if (transactions.length === 0) {
            showNotification('Não há dados para exportar', 'error');
            return;
        }

        const csvHeader = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
        const csvRows = transactions.map(t => {
            const date = new Date(t.date);
            const formattedDate = date.toLocaleDateString('pt-BR');
            const typeLabel = t.type === 'income' ? 'Receita' : 'Despesa';
            const amount = Math.abs(t.amount);
            return [
                formattedDate,
                `"${escapeHTML(t.description)}"`,
                `"${getCategoryLabel(t.category)}"`,
                typeLabel,
                amount.toFixed(2).replace('.', ',')
            ];
        });

        const csvContent = [csvHeader, ...csvRows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `financas_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Dados exportados para CSV com sucesso', 'success');
    }

    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = notificationContainer.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">${message}</div>
            <button class="notification-close" aria-label="Fechar notificação">&times;</button>
        `;

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        notificationContainer.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('notification-hide');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initial category load
    updateCategoryOptions();
});