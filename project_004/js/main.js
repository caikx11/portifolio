// Calculadora com parser próprio (sem eval)
document.addEventListener('DOMContentLoaded', () => {
    const inputEl = document.getElementById('input-display');
    const resultEl = document.getElementById('result-display');
    const sciGrid = document.getElementById('sci-grid');
    const keys = document.querySelector('.keys');
    const panel = document.getElementById('history-panel');
    const histContent = document.getElementById('history-content');
    const degBtn = keys.querySelector('[data-key="deg"]');

    let expr = '';
    let justEvaluated = false;
    let useDeg = true;
    let history = [];
    try { history = JSON.parse(localStorage.getItem('calcHistory')) || []; } catch (e) { history = []; }

    const FUNCS = {
        sin: x => Math.sin(useDeg ? x * Math.PI / 180 : x),
        cos: x => Math.cos(useDeg ? x * Math.PI / 180 : x),
        tan: x => Math.tan(useDeg ? x * Math.PI / 180 : x),
        ln: Math.log, log: Math.log10, sqrt: Math.sqrt
    };

    function tokenize(s) {
        const t = [];
        const re = /\s*(\d+\.?\d*|\.\d+|pi|e(?![a-z])|sin|cos|tan|ln|log|sqrt|[-+*/^()!%])/gy;
        let m, last = 0;
        while ((m = re.exec(s))) { t.push(m[1]); last = re.lastIndex; }
        if (s.slice(last).trim()) throw new Error('Expressão inválida');
        return t;
    }

    // Descida recursiva: expr -> term -> unary -> power -> postfix -> primary
    function evaluate(s) {
        const t = tokenize(s);
        let i = 0;
        const peek = () => t[i], next = () => t[i++];
        function parseExpr() {
            let v = parseTerm();
            while (peek() === '+' || peek() === '-') v = next() === '+' ? v + parseTerm() : v - parseTerm();
            return v;
        }
        function parseTerm() {
            let v = parseUnary();
            while (peek() === '*' || peek() === '/') v = next() === '*' ? v * parseUnary() : v / parseUnary();
            return v;
        }
        function parseUnary() {
            if (peek() === '-') { next(); return -parseUnary(); }
            if (peek() === '+') { next(); return parseUnary(); }
            return parsePower();
        }
        function parsePower() {
            const b = parsePostfix();
            if (peek() === '^') { next(); return Math.pow(b, parseUnary()); }
            return b;
        }
        function parsePostfix() {
            let v = parsePrimary();
            while (peek() === '!' || peek() === '%') {
                if (next() === '!') {
                    if (v < 0 || !Number.isInteger(v) || v > 170) throw new Error('Fatorial inválido');
                    let r = 1; for (let k = 2; k <= v; k++) r *= k; v = r;
                } else v = v / 100;
            }
            return v;
        }
        function parsePrimary() {
            const tok = next();
            if (tok === undefined) throw new Error('Incompleto');
            if (tok === '(') { const v = parseExpr(); if (next() !== ')') throw new Error('Parêntese'); return v; }
            if (tok === 'pi') return Math.PI;
            if (tok === 'e') return Math.E;
            if (FUNCS[tok]) {
                if (next() !== '(') throw new Error('Função');
                const v = parseExpr(); if (peek() === ')') next();
                return FUNCS[tok](v);
            }
            if (/^[\d.]/.test(tok)) return parseFloat(tok);
            throw new Error('Token inesperado');
        }
        const out = parseExpr();
        if (i < t.length) throw new Error('Sobrou texto');
        return out;
    }

    function fmt(n) {
        if (!Number.isFinite(n)) throw new Error('Resultado indefinido');
        const r = parseFloat(n.toPrecision(12));
        return String(r).replace('e+', 'e');
    }
    const pretty = s => s.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−').replace(/pi/g, 'π').replace(/sqrt/g, '√');

    function render(preview) {
        inputEl.textContent = expr ? pretty(expr) : '0';
        inputEl.scrollLeft = inputEl.scrollWidth;
        resultEl.textContent = preview || '';
        resultEl.classList.toggle('error', preview === 'Erro');
        liveSize();
    }
    function liveSize() { inputEl.style.fontSize = expr.length > 14 ? '1.5rem' : expr.length > 9 ? '2rem' : ''; }

    function livePreview() {
        if (!expr || !/[-+*/^!%]|\(|sin|cos|tan|ln|log|sqrt/.test(expr.replace(/^-/, ''))) return render('');
        try { render('= ' + fmt(evaluate(expr))); } catch (e) { render(''); }
    }

    function press(k) {
        if (k === 'clear') { expr = ''; justEvaluated = false; return render(''); }
        if (k === 'back') { expr = expr.replace(/(sin\(|cos\(|tan\(|ln\(|log\(|sqrt\(|pi|.)$/, ''); return livePreview(); }
        if (k === 'deg') { useDeg = !useDeg; degBtn.textContent = useDeg ? 'deg' : 'rad'; return livePreview(); }
        if (k === '=') return equals();
        const isOp = /^[-+*/^!%]$/.test(k);
        if (justEvaluated) { if (!isOp || k === '!') expr = ''; justEvaluated = false; }
        if (isOp && k !== '-' && (!expr || /[-+*/^(]$/.test(expr)) && k !== '!' ) return;
        if (/^[-+*/^]$/.test(k) && /[+*/^]$/.test(expr) ) expr = expr.slice(0, -1);
        if (/^\d$/.test(k) || k === '.') {
            const last = expr.match(/[\d.]+$/);
            if (k === '.' && last && last[0].includes('.')) return;
            if (/(pi|\))$/.test(expr)) expr += '*';
        }
        if (k === 'pi' && /[\d.)]$/.test(expr)) expr += '*';
        if (/^(sin|cos|tan|ln|log|sqrt)\($/.test(k) && /[\d.)]$|pi$/.test(expr)) expr += '*';
        if (expr.length > 60) return;
        expr += k;
        livePreview();
    }

    function equals() {
        if (!expr) return;
        let e = expr;
        const open = (e.match(/\(/g) || []).length - (e.match(/\)/g) || []).length;
        if (open > 0) e += ')'.repeat(open);
        try {
            const res = fmt(evaluate(e));
            history.unshift({ e: pretty(e), r: res });
            history = history.slice(0, 40);
            try { localStorage.setItem('calcHistory', JSON.stringify(history)); } catch (x) {}
            renderHistory();
            resultEl.textContent = pretty(e) + ' =';
            expr = res; justEvaluated = true;
            inputEl.textContent = res; liveSize();
        } catch (err) {
            render('Erro');
        }
    }

    function renderHistory() {
        histContent.innerHTML = '';
        if (!history.length) {
            const p = document.createElement('p'); p.className = 'history-empty'; p.textContent = 'Nenhum cálculo ainda.';
            histContent.appendChild(p); return;
        }
        history.forEach(h => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'history-item';
            const a = document.createElement('span'); a.textContent = h.e;
            const r = document.createElement('strong'); r.textContent = '= ' + h.r;
            b.append(a, r);
            b.addEventListener('click', () => { expr = h.r; justEvaluated = true; render(''); });
            histContent.appendChild(b);
        });
    }

    keys.addEventListener('click', e => {
        const b = e.target.closest('button[data-key]');
        if (b) press(b.dataset.key);
    });
    document.querySelectorAll('.btn-mode').forEach(b => b.addEventListener('click', () => {
        document.querySelectorAll('.btn-mode').forEach(x => x.classList.toggle('active', x === b));
        sciGrid.classList.toggle('open', b.dataset.mode === 'scientific');
    }));
    document.getElementById('history-toggle').addEventListener('click', e => {
        panel.hidden = !panel.hidden;
        e.currentTarget.setAttribute('aria-expanded', String(!panel.hidden));
    });
    document.getElementById('clear-history').addEventListener('click', () => {
        history = []; try { localStorage.removeItem('calcHistory'); } catch (x) {} renderHistory();
    });

    document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const k = e.key;
        if (/^[0-9.+\-*/^()!%]$/.test(k)) { press(k); e.preventDefault(); }
        else if (k === 'Enter' || k === '=') { if (document.activeElement.tagName !== 'BUTTON' || k === '=') { press('='); e.preventDefault(); } }
        else if (k === 'Backspace') press('back');
        else if (k === 'Escape' || k === 'Delete') press('clear');
    });
    renderHistory();
    render('');
});
