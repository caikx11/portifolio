// Gerador de senhas: aleatoriedade criptográfica, histórico só em memória
document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    const out = $('generated-password'), copyBtn = $('copy-btn'), slider = $('length-slider');
    const opts = { lower: $('opt-lower'), upper: $('opt-upper'), number: $('opt-number'), symbol: $('opt-symbol') };
    const optExclude = $('opt-exclude');
    const SETS = { lower: 'abcdefghijklmnopqrstuvwxyz', upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', number: '0123456789', symbol: '!@#$%^&*()_+-=[]{}|;:,.<>?' };
    const SIMILAR = 'il1o0O';
    const crit = { length: $('crit-length'), lower: $('crit-lower'), upper: $('crit-upper'), number: $('crit-number'), symbol: $('crit-symbol') };
    let history = [];

    function rand(n) { // inteiro uniforme em [0,n) sem viés
        const max = Math.floor(0x100000000 / n) * n, buf = new Uint32Array(1);
        do { crypto.getRandomValues(buf); } while (buf[0] >= max);
        return buf[0] % n;
    }
    const pool = k => optExclude.checked ? [...SETS[k]].filter(c => !SIMILAR.includes(c)).join('') : SETS[k];

    function generate(save) {
        $('length-value').textContent = slider.value;
        const active = Object.keys(opts).filter(k => opts[k].checked).map(pool).filter(Boolean);
        if (!active.length) {
            out.value = ''; update('', 0);
            toast('Selecione pelo menos um tipo de caractere', 'error');
            return;
        }
        const len = Math.max(+slider.value, active.length), all = active.join('');
        const chars = active.map(s => s[rand(s.length)]); // garante um de cada conjunto
        while (chars.length < len) chars.push(all[rand(all.length)]);
        for (let i = chars.length - 1; i > 0; i--) { const j = rand(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
        const pw = chars.join('');
        out.value = pw;
        update(pw, Math.log2(all.length) * len);
        if (save) addHistory(pw);
    }

    function update(pw, bits) {
        const has = { length: pw.length >= 12, lower: /[a-z]/.test(pw), upper: /[A-Z]/.test(pw), number: /[0-9]/.test(pw), symbol: /[^a-zA-Z0-9]/.test(pw) };
        crit.length.lastChild.textContent = ' 12+ caracteres';
        Object.keys(crit).forEach(k => { crit[k].classList.toggle('met', has[k]); crit[k].querySelector('.criterion-icon').textContent = has[k] ? '✓' : '✗'; });
        const lv = !pw ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : bits < 110 ? 4 : 5;
        const names = ['Muito Fraca', 'Muito Fraca', 'Fraca', 'Regular', 'Boa', 'Forte'];
        $('strength-fill').style.width = (lv * 20) + '%';
        $('strength-fill').dataset.level = lv;
        $('strength-label').textContent = names[lv];
        $('strength-label').dataset.level = lv;
        $('entropy').textContent = `Entropia: ${Math.round(bits)} bits`;
    }

    function addHistory(pw) {
        history.unshift({ pw, time: new Date().toLocaleTimeString('pt-BR'), len: pw.length });
        history = history.slice(0, 10);
        renderHistory();
    }
    function renderHistory() {
        const box = $('history-list'); box.innerHTML = '';
        if (!history.length) { box.innerHTML = '<p class="empty-history">Nenhuma senha gerada ainda (o histórico vive só nesta aba)</p>'; return; }
        history.forEach(h => {
            const row = document.createElement('div'); row.className = 'history-item';
            const pw = document.createElement('button'); pw.type = 'button'; pw.className = 'history-password';
            pw.textContent = '•'.repeat(Math.min(h.len, 20)); pw.title = 'Clique para mostrar/ocultar';
            let shown = false;
            pw.addEventListener('click', () => { shown = !shown; pw.textContent = shown ? h.pw : '•'.repeat(Math.min(h.len, 20)); });
            const meta = document.createElement('span'); meta.className = 'history-time'; meta.textContent = h.time;
            const cp = document.createElement('button'); cp.type = 'button'; cp.className = 'history-copy'; cp.textContent = 'Copiar';
            cp.addEventListener('click', () => copyText(h.pw));
            row.append(pw, meta, cp); box.appendChild(row);
        });
    }

    async function copyText(t) {
        try { await navigator.clipboard.writeText(t); toast('Senha copiada!', 'success'); return true; }
        catch (e) {
            const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
            let ok = false; try { ok = document.execCommand('copy'); } catch (x) {}
            ta.remove(); toast(ok ? 'Senha copiada!' : 'Não foi possível copiar', ok ? 'success' : 'error'); return ok;
        }
    }
    copyBtn.addEventListener('click', async () => {
        if (!out.value) return toast('Gere uma senha primeiro', 'error');
        if (await copyText(out.value)) {
            copyBtn.classList.add('copied');
            copyBtn.querySelector('.copy-icon').hidden = true; copyBtn.querySelector('.copied-text').hidden = false;
            setTimeout(() => { copyBtn.classList.remove('copied'); copyBtn.querySelector('.copy-icon').hidden = false; copyBtn.querySelector('.copied-text').hidden = true; }, 1600);
        }
    });

    function toast(msg, type = 'info') {
        document.querySelector('.notification')?.remove();
        const n = document.createElement('div'); n.className = `notification notification-${type}`; n.setAttribute('role', 'status'); n.textContent = msg;
        document.body.appendChild(n);
        setTimeout(() => { n.classList.add('notification-hide'); setTimeout(() => n.remove(), 300); }, 2600);
    }

    slider.addEventListener('input', () => generate(false));
    Object.values(opts).concat(optExclude).forEach(cb => cb.addEventListener('change', () => generate(false)));
    $('generate-btn').addEventListener('click', () => generate(true));
    $('clear-history').addEventListener('click', () => { history = []; renderHistory(); });
    renderHistory(); generate(false);
});
