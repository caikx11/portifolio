// Funções auxiliares
function limparValor(valor) {
    return valor.replace(/\D/g, '');
}

function formatarCPF(cpf) {
    cpf = limparValor(cpf);
    if (cpf.length > 11) cpf = cpf.substring(0, 11);
    return cpf.replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d{1,2})/, '$1-$2');
}

function formatarCNPJ(cnpj) {
    cnpj = limparValor(cnpj);
    if (cnpj.length > 14) cnpj = cnpj.substring(0, 14);
    return cnpj.replace(/(\d{2})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d)/, '$1/$2')
               .replace(/(\d{4})(\d{1,2})/, '$1-$2');
}

// Validação do CPF
function validarCPF(cpf) {
    cpf = limparValor(cpf);

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    // Calcula o primeiro dígito verificador
    for (let i = 1; i <= 9; i++)
        soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    // Calcula o segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++)
        soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

// Validação do CNPJ
function validarCNPJ(cnpj) {
    cnpj = limparValor(cnpj);

    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    // Calcula o primeiro dígito verificador
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    // Calcula o segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;

    return true;
}

// Event listeners
document.getElementById('cpf').addEventListener('input', function(e) {
    const cpfInput = e.target;
    const valorLimpo = limparValor(cpfInput.value);
    const valorFormatado = formatarCPF(valorLimpo);
    cpfInput.value = valorFormatado;

    // Validação em tempo real
    if (valorLimpo.length >= 11) {
        const ehValido = validarCPF(valorLimpo);
        const feedback = document.getElementById('cpf-feedback');
        if (ehValido) {
            feedback.textContent = 'CPF válido';
            feedback.className = 'feedback success';
        } else {
            feedback.textContent = 'CPF inválido';
            feedback.className = 'feedback error';
        }

        // Atualiza resultado
        const resultadoDiv = document.getElementById('cpf-result');
        if (ehValido) {
            resultadoDiv.innerHTML = `<strong>CPF válido:</strong> ${valorFormatado}`;
            resultadoDiv.className = 'result-box valid';
        } else {
            resultadoDiv.innerHTML = '<strong>CPF inválido</strong>';
            resultadoDiv.className = 'result-box invalid';
        }
    } else {
        document.getElementById('cpf-feedback').textContent = '';
        document.getElementById('cpf-result').innerHTML = '';
        document.getElementById('cpf-result').className = 'result-box';
    }
});

document.getElementById('cnpj').addEventListener('input', function(e) {
    const cnpjInput = e.target;
    const valorLimpo = limparValor(cnpjInput.value);
    const valorFormatado = formatarCNPJ(valorLimpo);
    cnpjInput.value = valorFormatado;

    // Validação em tempo real
    if (valorLimpo.length >= 14) {
        const ehValido = validarCNPJ(valorLimpo);
        const feedback = document.getElementById('cnpj-feedback');
        if (ehValido) {
            feedback.textContent = 'CNPJ válido';
            feedback.className = 'feedback success';
        } else {
            feedback.textContent = 'CNPJ inválido';
            feedback.className = 'feedback error';
        }

        // Atualiza resultado
        const resultadoDiv = document.getElementById('cnpj-result');
        if (ehValido) {
            resultadoDiv.innerHTML = `<strong>CNPJ válido:</strong> ${valorFormatado}`;
            resultadoDiv.className = 'result-box valid';
        } else {
            resultadoDiv.innerHTML = '<strong>CNPJ inválido</strong>';
            resultadoDiv.className = 'result-box invalid';
        }
    } else {
        document.getElementById('cnpj-feedback').textContent = '';
        document.getElementById('cnpj-result').innerHTML = '';
        document.getElementById('cnpj-result').className = 'result-box';
    }
});

// Limpar resultados ao focar nos campos
document.getElementById('cpf').addEventListener('focus', function() {
    document.getElementById('cpf-feedback').textContent = '';
    document.getElementById('cpf-result').innerHTML = '';
    document.getElementById('cpf-result').className = 'result-box';
});

document.getElementById('cnpj').addEventListener('focus', function() {
    document.getElementById('cnpj-feedback').textContent = '';
    document.getElementById('cnpj-result').innerHTML = '';
    document.getElementById('cnpj-result').className = 'result-box';
});