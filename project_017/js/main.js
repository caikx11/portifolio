// Currency data with exchange rates (simulated)
const currencies = [
    { code: 'USD', name: 'Dólar Americano', symbol: '$', rate: 1.0 },
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', rate: 5.25 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£', rate: 0.79 },
    { code: 'JPY', name: 'Iene Japonês', symbol: '¥', rate: 150.25 },
    { code: 'CAD', name: 'Dólar Canadense', symbol: 'CA$', rate: 1.36 },
    { code: 'AUD', name: 'Dólar Australiano', symbol: 'AU$', rate: 1.53 },
    { code: 'CHF', name: 'Franco Suíço', symbol: 'CHF', rate: 0.90 },
    { code: 'CNY', name: 'Yuan Chinês', symbol: '¥', rate: 7.24 },
    { code: 'INR', name: 'Rúpia Indiana', symbol: '₹', rate: 83.12 }
];

// Application state
let conversionHistory = [];
const MAX_HISTORY = 10;

// DOM Elements
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const convertedAmountInput = document.getElementById('converted-amount');
const swapButton = document.getElementById('swap-currencies');
const exchangeRateDisplay = document.getElementById('exchange-rate');
const historyList = document.getElementById('history-list');
const clearHistoryButton = document.getElementById('clear-history');

// Initialize the application
function init() {
    // Load history from localStorage
    loadHistory();

    // Populate currency dropdowns
    populateCurrencyDropdowns();

    // Set default currencies (USD to BRL)
    fromCurrencySelect.value = 'USD';
    toCurrencySelect.value = 'BRL';

    // Add event listeners
    amountInput.addEventListener('input', convertCurrency);
    fromCurrencySelect.addEventListener('change', convertCurrency);
    toCurrencySelect.addEventListener('change', convertCurrency);
    swapButton.addEventListener('click', swapCurrencies);
    clearHistoryButton.addEventListener('click', clearHistory);

    // Initial conversion
    convertCurrency();
}

// Populate currency dropdowns
function populateCurrencyDropdowns() {
    currencies.forEach(currency => {
        const optionFrom = document.createElement('option');
        optionFrom.value = currency.code;
        optionFrom.textContent = `${currency.code} - ${currency.name}`;
        fromCurrencySelect.appendChild(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = currency.code;
        optionTo.textContent = `${currency.code} - ${currency.name}`;
        toCurrencySelect.appendChild(optionTo);
    });
}

// Find currency by code
function findCurrency(code) {
    return currencies.find(c => c.code === code);
}

// Convert currency
function convertCurrency() {
    const amount = parseFloat(amountInput.value) || 0;
    const fromCode = fromCurrencySelect.value;
    const toCode = toCurrencySelect.value;

    if (!fromCode || !toCode) {
        convertedAmountInput.value = '';
        exchangeRateDisplay.textContent = 'Selecione as moedas';
        return;
    }

    const fromCurrency = findCurrency(fromCode);
    const toCurrency = findCurrency(toCode);

    // Calculate conversion
    // Base currency is USD (rate 1.0)
    // So we convert from -> USD -> to
    const amountInUSD = amount / fromCurrency.rate;
    const convertedAmount = amountInUSD * toCurrency.rate;

    // Format result
    const formattedAmount = formatCurrency(convertedAmount, toCurrency);
    convertedAmountInput.value = formattedAmount;

    // Calculate and display exchange rate
    const rate = toCurrency.rate / fromCurrency.rate;
    exchangeRateDisplay.textContent = `1 ${fromCurrency.code} = ${rate.toFixed(4)} ${toCurrency.code}`;

    // Add to history if amount > 0
    if (amount > 0) {
        addToHistory(amount, fromCurrency, convertedAmount, toCurrency);
    }
}

// Format currency
function formatCurrency(amount, currency) {
    return `${currency.symbol} ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Swap currencies
function swapCurrencies() {
    const temp = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = temp;
    convertCurrency();
}

// Add conversion to history
function addToHistory(amount, fromCurrency, convertedAmount, toCurrency) {
    const historyItem = {
        id: Date.now(),
        amount: amount,
        fromCurrency: fromCurrency.code,
        fromSymbol: fromCurrency.symbol,
        toCurrency: toCurrency.code,
        toSymbol: toCurrency.symbol,
        convertedAmount: convertedAmount,
        timestamp: new Date().toISOString()
    };

    // Add to beginning of array
    conversionHistory.unshift(historyItem);

    // Limit history size
    if (conversionHistory.length > MAX_HISTORY) {
        conversionHistory = conversionHistory.slice(0, MAX_HISTORY);
    }

    // Save and render
    saveHistory();
    renderHistory();
}

// Render history
function renderHistory() {
    if (conversionHistory.length === 0) {
        historyList.innerHTML = '<p class="no-history">Nenhuma conversão realizada ainda</p>';
        return;
    }

    historyList.innerHTML = conversionHistory.map(item => `
        <div class="history-item">
            <span>${item.fromSymbol} ${item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${item.fromCurrency}</span>
            <span class="history-value">${item.toSymbol} ${item.convertedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${item.toCurrency}</span>
        </div>
    `).join('');
}

// Clear history
function clearHistory() {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
        conversionHistory = [];
        saveHistory();
        renderHistory();
    }
}

// Save history to localStorage
function saveHistory() {
    localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
}

// Load history from localStorage
function loadHistory() {
    const savedHistory = localStorage.getItem('conversionHistory');
    if (savedHistory) {
        try {
            conversionHistory = JSON.parse(savedHistory);
        } catch (e) {
            console.error('Error parsing history from localStorage:', e);
            conversionHistory = [];
        }
    }
    renderHistory();
}

// Initialize the application when DOM loads
document.addEventListener('DOMContentLoaded', init);