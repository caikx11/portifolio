// Calculadora Matemática com modo básico e científico
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const inputDisplay = document.getElementById('input-display');
    const resultDisplay = document.getElementById('result-display');
    const buttonsGrid = document.querySelector('.buttons-grid');
    const modeButtons = document.querySelectorAll('.btn-mode');
    const historyToggleBtn = document.getElementById('history-toggle');
    const historyPanel = document.getElementById('history-panel');
    const historyContent = document.getElementById('history-content');
    const clearHistoryBtn = document.getElementById('clear-history');

    // State
    let currentInput = '0';
    let previousInput = null;
    let currentOperator = null;
    let shouldResetDisplay = false;
    let history = [];
    let isScientificMode = false;
    let isDegrees = true; // true for degrees, false for radians

    // Initialize
    updateDisplay();

    // Event Listeners
    buttonsGrid.addEventListener('click', handleButtonClick);
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    historyToggleBtn.addEventListener('click', () => {
        historyPanel.classList.toggle('active');
        if (historyPanel.classList.contains('active')) {
            updateHistory();
        }
    });

    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        updateHistory();
    });

    // Handle button clicks
    function handleButtonClick(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        const value = button.dataset.value;

        if (button.classList.contains('btn-number')) {
            handleNumber(value);
        } else if (action === 'operator') {
            handleOperator(value);
        } else if (action === 'clear') {
            clearEntry();
        } else if (action === 'clear-all') {
            clearAll();
        } else if (action === 'action') {
            handleAction(value);
        }

        updateDisplay();
    }

    // Handle number input
    function handleNumber(num) {
        if (shouldResetDisplay) {
            currentInput = num;
            shouldResetDisplay = false;
        } else {
            currentInput = currentInput === '0' ? num : currentInput + num;
        }
    }

    // Handle operator
    function handleOperator(operator) {
        if (currentOperator !== null) calculate();
        previousInput = parseFloat(currentInput);
        currentOperator = operator;
        shouldResetDisplay = true;
    }

    // Handle special actions
    function handleAction(action) {
        switch (action) {
            case 'backspace':
                currentInput = currentInput.slice(0, -1) || '0';
                break;
            case 'sin':
                currentInput = Math.sin(parseFloat(currentInput) * (isDegrees ? Math.PI / 180 : 1)).toString();
                break;
            case 'cos':
                currentInput = Math.cos(parseFloat(currentInput) * (isDegrees ? Math.PI / 180 : 1)).toString();
                break;
            case 'tan':
                currentInput = Math.tan(parseFloat(currentInput) * (isDegrees ? Math.PI / 180 : 1)).toString();
                break;
            case 'fact':
                currentInput = factorial(parseInt(currentInput)).toString();
                break;
            case 'deg':
                isDegrees = !isDegrees;
                break;
        }
    }

    // Calculate result
    function calculate() {
        if (currentOperator === null || shouldResetDisplay) return;

        const current = parseFloat(currentInput);
        let result;

        switch (currentOperator) {
            case '+':
                result = previousInput + current;
                break;
            case '-':
                result = previousInput - current;
                break;
            case '*':
                result = previousInput * current;
                break;
            case '÷':
                result = previousInput / current;
                break;
            case '%':
                result = (previousInput / 100) * current;
                break;
            case '^':
                result = Math.pow(previousInput, current);
                break;
        }

        // Add to history
        const historyItem = `${previousInput} ${currentOperator} ${current} = ${result}`;
        history.unshift(historyItem);
        if (history.length > 50) history.pop(); // Keep only last 50 entries

        currentInput = result.toString();
        currentOperator = null;
        previousInput = null;
        shouldResetDisplay = true;
    }

    // Clear entry
    function clearEntry() {
        currentInput = '0';
    }

    // Clear all
    function clearAll() {
        currentInput = '0';
        previousInput = null;
        currentOperator = null;
        shouldResetDisplay = false;
    }

    // Set mode (basic/scientific)
    function setMode(mode) {
        isScientificMode = mode === 'scientific';
        modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Hide/show scientific buttons based on mode
        const scientificButtons = buttonsGrid.querySelectorAll('[data-action="operator"][data-value="^"], [data-action="action"][data-value="sin"], [data-action="action"][data-value="tan"], [data-action="action"][data-value="fact"]');
        scientificButtons.forEach(btn => {
            btn.parentElement.style.display = isScientificMode ? '' : 'none';
        });
    }

    // Update display
    function updateDisplay() {
        // Limit display length
        const maxLength = 12;
        inputDisplay.textContent = currentInput.length > maxLength
            ? currentInput.slice(0, maxLength) + '...'
            : currentInput;

        // Show result if we have a complete operation
        resultDisplay.textContent = currentOperator && previousInput !== null
            ? `${previousInput} ${currentOperator}`
            : '';
    }

    // Update history
    function updateHistory() {
        if (history.length === 0) {
            historyContent.innerHTML = '<div class="history-item">Nenhum cálculo no histórico</div>';
            return;
        }

        historyContent.innerHTML = history.map(item =>
            `<div class="history-item">${item}</div>`
        ).join('');
    }

    // Factorial function
    function factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') {
            handleNumber(e.key);
        } else if (e.key === '.') {
            handleNumber('.');
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            handleOperator(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            if (currentOperator !== null) calculate();
        } else if (e.key === 'Backspace') {
            handleAction('backspace');
        } else if (e.key === 'Escape') {
            clearAll();
        }

        updateDisplay();
    });
});

// Initialize scientific mode buttons visibility
document.addEventListener('DOMContentLoaded', () => {
    const scientificButtons = document.querySelectorAll('[data-action="operator"][data-value="^"], [data-action="action"][data-value="sin"], [data-action="action"][data-value="tan"], [data-action="action"][data-value="fact"]');
    scientificButtons.forEach(btn => {
        btn.parentElement.style.display = 'none'; // Start in basic mode
    });
});