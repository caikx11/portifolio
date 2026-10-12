// Password Generator Javascript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const generatedPassword = document.getElementById('generated-password');
    const copyBtn = document.getElementById('copy-btn');
    const lengthSlider = document.getElementById('length-slider');
    const lengthValue = document.getElementById('length-value');
    const optLower = document.getElementById('opt-lower');
    const optUpper = document.getElementById('opt-upper');
    const optNumber = document.getElementById('opt-number');
    const optSymbol = document.getElementById('opt-symbol');
    const optExclude = document.getElementById('opt-exclude');
    const generateBtn = document.getElementById('generate-btn');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');

    // Strength elements
    const strengthFill = document.getElementById('strength-fill');
    const strengthLabel = document.getElementById('strength-label');
    const critLength = document.getElementById('crit-length');
    const critLower = document.getElementById('crit-lower');
    const critUpper = document.getElementById('crit-upper');
    const critNumber = document.getElementById('crit-number');
    const critSymbol = document.getElementById('crit-symbol');

    // Character sets
    const LOWER = 'abcdefghijklmnopqrstuvwxyz';
    const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const NUMBERS = '0123456789';
    const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const SIMILAR = 'il1o0O';

    let passwordHistory = JSON.parse(localStorage.getItem('passwordHistory')) || [];

    // Initialize
    init();

    function init() {
        updateLengthDisplay();
        generatePassword();
        renderHistory();

        // Event Listeners
        lengthSlider.addEventListener('input', updateLengthDisplay);
        [optLower, optUpper, optNumber, optSymbol, optExclude].forEach(cb => {
            cb.addEventListener('change', generatePassword);
        });
        lengthSlider.addEventListener('change', generatePassword);
        generateBtn.addEventListener('click', generatePassword);
        copyBtn.addEventListener('click', copyPassword);
        clearHistoryBtn.addEventListener('click', clearHistory);
    }

    function updateLengthDisplay() {
        lengthValue.textContent = lengthSlider.value;
        generatePassword();
    }

    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        const useLower = optLower.checked;
        const useUpper = optUpper.checked;
        const useNumber = optNumber.checked;
        const useSymbol = optSymbol.checked;
        const excludeSimilar = optExclude.checked;

        let charset = '';
        if (useLower) charset += LOWER;
        if (useUpper) charset += UPPER;
        if (useNumber) charset += NUMBERS;
        if (useSymbol) charset += SYMBOLS;

        if (excludeSimilar) {
            charset = charset.split('').filter(c => !SIMILAR.includes(c)).join('');
        }

        if (!charset) {
            showNotification('Selecione pelo menos um tipo de caractere', 'error');
            generatedPassword.value = '';
            updateStrength('');
            return;
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        // Ensure at least one character from each selected set
        if (useLower && !password.match(/[a-z]/)) {
            password = password.slice(0, -1) + LOWER[Math.floor(Math.random() * LOWER.length)];
        }
        if (useUpper && !password.match(/[A-Z]/)) {
            password = password.slice(0, -1) + UPPER[Math.floor(Math.random() * UPPER.length)];
        }
        if (useNumber && !password.match(/[0-9]/)) {
            password = password.slice(0, -1) + NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
        }
        if (useSymbol && !password.match(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/)) {
            password = password.slice(0, -1) + SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        }

        generatedPassword.value = password;
        updateStrength(password);
        addToHistory(password);
    }

    function updateStrength(password) {
        if (!password) {
            resetStrength();
            return;
        }

        let score = 0;
        const checks = {
            length: password.length >= 8,
            lower: /[a-z]/.test(password),
            upper: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            symbol: /[^a-zA-Z0-9]/.test(password)
        };

        // Update criteria UI
        updateCriterion(critLength, checks.length);
        updateCriterion(critLower, checks.lower);
        updateCriterion(critUpper, checks.upper);
        updateCriterion(critNumber, checks.number);
        updateCriterion(critSymbol, checks.symbol);

        // Calculate score
        if (checks.length) score += 1;
        if (checks.lower) score += 1;
        if (checks.upper) score += 1;
        if (checks.number) score += 1;
        if (checks.symbol) score += 1;

        // Bonus for length
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;
        if (password.length >= 24) score += 1;

        // Update strength bar and label
        let label, percentage, colorClass;
        if (score <= 2) {
            label = 'Muito Fraca';
            percentage = 20;
            colorClass = 'very-weak';
        } else if (score <= 3) {
            label = 'Fraca';
            percentage = 40;
            colorClass = 'weak';
        } else if (score <= 4) {
            label = 'Regular';
            percentage = 60;
            colorClass = 'fair';
        } else if (score <= 5) {
            label = 'Boa';
            percentage = 80;
            colorClass = 'good';
        } else {
            label = 'Forte';
            percentage = 100;
            colorClass = 'strong';
        }

        strengthFill.style.width = `${percentage}%`;
        strengthFill.style.background = `var(--${colorClass === 'very-weak' || colorClass === 'weak' ? 'danger' : colorClass === 'fair' ? 'primary' : 'secondary'}-color)`;
        strengthLabel.textContent = label;
        strengthLabel.style.color = `var(--${colorClass === 'very-weak' || colorClass === 'weak' ? 'danger' : colorClass === 'fair' ? 'primary' : 'secondary'}-color)`;
    }

    function updateCriterion(element, met) {
        element.classList.toggle('met', met);
        const icon = element.querySelector('.criterion-icon');
        icon.textContent = met ? '✓' : '✗';
    }

    function resetStrength() {
        strengthFill.style.width = '0%';
        strengthLabel.textContent = 'Muito Fraca';
        [critLength, critLower, critUpper, critNumber, critSymbol].forEach(el => {
            el.classList.remove('met');
            el.querySelector('.criterion-icon').textContent = '✗';
        });
    }

    function copyPassword() {
        const password = generatedPassword.value;
        if (!password) {
            showNotification('Gere uma senha primeiro', 'error');
            return;
        }

        navigator.clipboard.writeText(password).then(() => {
            copyBtn.classList.add('copied');
            copyBtn.querySelector('.copy-icon').style.display = 'none';
            copyBtn.querySelector('.copied-text').style.display = 'inline';
            showNotification('Senha copiada para a área de transferência!', 'success');

            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.querySelector('.copy-icon').style.display = 'inline';
                copyBtn.querySelector('.copied-text').style.display = 'none';
            }, 2000);
        }).catch(() => {
            showNotification('Erro ao copiar. Tente selecionar e copiar manualmente.', 'error');
        });
    }

    function addToHistory(password) {
        const strength = getStrengthLabel(password);
        const entry = {
            password,
            time: new Date().toLocaleString('pt-BR'),
            strength
        };

        passwordHistory.unshift(entry);
        if (passwordHistory.length > 20) passwordHistory.pop();

        localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
        renderHistory();
    }

    function getStrengthLabel(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        if (password.length >= 12) score++;
        if (password.length >= 16) score++;
        if (password.length >= 24) score++;

        if (score <= 2) return 'very-weak';
        if (score <= 3) return 'weak';
        if (score <= 4) return 'fair';
        if (score <= 5) return 'good';
        return 'strong';
    }

    function renderHistory() {
        if (passwordHistory.length === 0) {
            historyList.innerHTML = '<p class="empty-history">Nenhuma senha gerada ainda</p>';
            return;
        }

        historyList.innerHTML = passwordHistory.map(entry => `
            <div class="history-item">
                <span class="history-password">${entry.password}</span>
                <div class="history-meta">
                    <span class="history-time">${entry.time}</span>
                    <span class="history-strength ${entry.strength}">${entry.strength}</span>
                </div>
            </div>
        `).join('');
    }

    function clearHistory() {
        if (confirm('Limpar todo o histórico de senhas?')) {
            passwordHistory = [];
            localStorage.removeItem('passwordHistory');
            renderHistory();
            showNotification('Histórico limpo', 'info');
        }
    }

    function showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('notification-hide');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});