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

// Geração de números válidos (para testes)
function gerarCPF() {
    const n = Array.from({length: 9}, () => Math.floor(Math.random() * 10));
    for (let t = 0; t < 2; t++) {
        const soma = n.reduce((a, d, i) => a + d * (n.length + 1 - i), 0);
        const r = (soma * 10) % 11;
        n.push(r === 10 ? 0 : r);
    }
    const c = n.join('');
    return /^(\d)\1{10}$/.test(c) ? gerarCPF() : c;
}

function gerarCNPJ() {
    const n = Array.from({length: 12}, () => Math.floor(Math.random() * 10));
    n[8] = n[9] = n[10] = 0; n[11] = 1;
    for (let t = 0; t < 2; t++) {
        const pesos = t === 0 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
        const soma = n.reduce((a, d, i) => a + d * pesos[i], 0);
        const r = soma % 11;
        n.push(r < 2 ? 0 : 11 - r);
    }
    return n.join('');
}

const TIPOS = {
    cpf: { tam: 11, nome: 'CPF', fmt: formatarCPF, val: validarCPF, gen: gerarCPF },
    cnpj: { tam: 14, nome: 'CNPJ', fmt: formatarCNPJ, val: validarCNPJ, gen: gerarCNPJ }
};

function atualizar(tipo) {
    const t = TIPOS[tipo];
    const input = document.getElementById(tipo);
    const feedback = document.getElementById(tipo + '-feedback');
    const box = document.getElementById(tipo + '-result');
    const limpo = limparValor(input.value);
    input.value = t.fmt(limpo);
    input.classList.remove('is-valid', 'is-invalid');
    feedback.className = 'feedback';
    if (limpo.length === 0) {
        feedback.textContent = '';
        box.className = 'result-box';
        box.textContent = '';
        return;
    }
    if (limpo.length < t.tam) {
        feedback.textContent = `${limpo.length} de ${t.tam} dígitos`;
        box.className = 'result-box';
        box.textContent = '';
        return;
    }
    const ok = t.val(limpo);
    feedback.textContent = '';
    input.classList.add(ok ? 'is-valid' : 'is-invalid');
    box.className = 'result-box ' + (ok ? 'valid' : 'invalid');
    box.innerHTML = ok
        ? `<span class="stamp">Válido</span><span class="num">${t.fmt(limpo)}</span>`
        : `<span class="stamp">Inválido</span><span class="num">${t.fmt(limpo)}</span><em>Dígitos verificadores não conferem.</em>`;
}

Object.keys(TIPOS).forEach(tipo => {
    document.getElementById(tipo).addEventListener('input', () => atualizar(tipo));
});

document.querySelectorAll('[data-gen]').forEach(b => b.addEventListener('click', () => {
    const tipo = b.dataset.gen;
    document.getElementById(tipo).value = TIPOS[tipo].gen();
    atualizar(tipo);
}));

document.querySelectorAll('[data-clear]').forEach(b => b.addEventListener('click', () => {
    const tipo = b.dataset.clear;
    const el = document.getElementById(tipo);
    el.value = '';
    atualizar(tipo);
    el.focus();
}));

document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const v = document.getElementById(b.dataset.copy).value;
    if (!v) return;
    const old = b.textContent;
    try { await navigator.clipboard.writeText(v); b.textContent = 'Copiado!'; }
    catch (e) { b.textContent = 'Selecione e copie'; }
    setTimeout(() => { b.textContent = old; }, 1400);
}));
