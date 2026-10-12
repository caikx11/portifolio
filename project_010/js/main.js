// Controle de Finanças: transações, filtros, relatórios em SVG, CSV, tema
document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } };
    const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

    const CATS = {
        salary: 'Salário', freelance: 'Freelance', investment: 'Investimento', 'other-income': 'Outra Receita',
        food: 'Alimentação', transport: 'Transporte', housing: 'Moradia', health: 'Saúde', entertainment: 'Lazer',
        education: 'Educação', shopping: 'Compras', bills: 'Contas', 'other-expense': 'Outra Despesa'
    };
    const INCOME = ['salary', 'freelance', 'investment', 'other-income'];
    const EXPENSE = ['food', 'transport', 'housing', 'health', 'entertainment', 'education', 'shopping', 'bills', 'other-expense'];
    const PALETTE = ['#c9a24b', '#2f6f8f', '#b5533c', '#5a8f6a', '#7a6aa8', '#d98c5f', '#3f4f6b', '#9aa86a', '#a85a7c', '#6b7f8c'];

    let transactions = read('transactions', []);
    let settings = Object.assign({ currency: 'BRL', theme: 'light', defaultView: 'monthly' }, read('settings', {}));
    let customCategories = read('customCategories', []);

    const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
    const label = c => CATS[c] || c;
    const money = n => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: settings.currency }).format(n);
    const isoToDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
    const fmtDate = (s, full) => isoToDate(s).toLocaleDateString('pt-BR', full ? { day: '2-digit', month: '2-digit', year: 'numeric' } : { day: '2-digit', month: '2-digit' });
    const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

    function since(period) {
        const n = new Date();
        if (period === 'monthly') return new Date(n.getFullYear(), n.getMonth(), 1);
        if (period === 'quarterly') return new Date(n.getFullYear(), n.getMonth() - 2, 1);
        if (period === 'yearly') return new Date(n.getFullYear(), 0, 1);
        return new Date(0);
    }
    const inPeriod = (t, p) => isoToDate(t.date) >= since(p === 'all-time' ? 'all' : p);

    // ---------- Tabs ----------
    const tabButtons = document.querySelectorAll('.tab-btn'), tabPanels = document.querySelectorAll('.tab-panel');
    function openTab(id) {
        tabButtons.forEach(b => { const on = b.dataset.tab === id; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
        tabPanels.forEach(p => p.classList.toggle('active', p.id === id));
        if (id === 'reports') renderCharts();
    }
    tabButtons.forEach(b => b.addEventListener('click', () => openTab(b.dataset.tab)));

    // ---------- Form ----------
    const form = $('transaction-form'), showBtn = $('show-add-form');
    function typeNow() { return document.querySelector('input[name="transaction-type"]:checked').value; }
    function fillCategories() {
        const base = typeNow() === 'income' ? INCOME : EXPENSE;
        const sel = $('transaction-category');
        sel.innerHTML = '<option value="">Selecione uma categoria</option>';
        base.concat(customCategories).forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = label(c); sel.appendChild(o); });
    }
    function openForm() {
        form.reset(); fillCategories();
        $('transaction-date').value = todayISO();
        form.classList.remove('hidden'); showBtn.classList.add('hidden');
        openTab('transactions'); $('transaction-description').focus();
    }
    function closeForm() { form.reset(); form.classList.add('hidden'); showBtn.classList.remove('hidden'); }
    showBtn.addEventListener('click', openForm);
    $('add-transaction-btn').addEventListener('click', openForm);
    $('cancel-transaction').addEventListener('click', closeForm);
    $('view-all-transactions-btn').addEventListener('click', () => openTab('transactions'));
    document.getElementsByName('transaction-type').forEach(r => r.addEventListener('change', fillCategories));

    form.addEventListener('submit', e => {
        e.preventDefault();
        const description = $('transaction-description').value.trim();
        const amount = parseFloat($('transaction-amount').value);
        const category = $('transaction-category').value, date = $('transaction-date').value, type = typeNow();
        if (!description || !(amount > 0) || !category || !date) return toast('Preencha todos os campos corretamente', 'error');
        transactions.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), description, amount: type === 'income' ? amount : -amount, category, date, type });
        write('transactions', transactions);
        closeForm(); refresh(); toast('Transação adicionada', 'success');
    });

    // ---------- Lists ----------
    function row(t, full) {
        return `<div class="transaction-item">
            <span class="dot ${t.amount >= 0 ? 'income' : 'expense'}" aria-hidden="true"></span>
            <div class="transaction-info">
                <div class="transaction-description">${esc(t.description)}</div>
                <div class="transaction-meta"><span class="transaction-category">${esc(label(t.category))}</span><span class="transaction-date">${fmtDate(t.date, full)}</span></div>
            </div>
            <div class="transaction-amount ${t.amount >= 0 ? 'income' : 'expense'}">${t.amount >= 0 ? '+' : '−'} ${money(Math.abs(t.amount))}</div>
            ${full ? `<button class="tx-delete" data-id="${t.id}" aria-label="Excluir ${esc(t.description)}">×</button>` : ''}
        </div>`;
    }
    const byDate = (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id);

    function renderLists() {
        const type = $('filter-type').value, period = $('filter-period').value;
        const list = transactions.filter(t => (type === 'all' || t.type === type) && inPeriod(t, period)).sort(byDate);
        $('transactions-list').innerHTML = list.length ? list.map(t => row(t, true)).join('')
            : `<p class="empty-state">${transactions.length ? 'Nada encontrado com estes filtros.' : 'Nenhuma transação registrada ainda.'}</p>`;
        const recent = [...transactions].sort(byDate).slice(0, 5);
        $('recent-transactions-list').innerHTML = recent.length ? recent.map(t => row(t, false)).join('')
            : '<div class="empty-state">Nenhuma transação registrada ainda.<br><button class="btn btn-sm" id="load-demo" type="button">Carregar dados de exemplo</button></div>';
        const demo = $('load-demo'); if (demo) demo.addEventListener('click', loadDemo);
    }
    $('transactions-list').addEventListener('click', e => {
        const b = e.target.closest('.tx-delete'); if (!b) return;
        transactions = transactions.filter(t => t.id !== b.dataset.id);
        write('transactions', transactions); refresh(); toast('Transação removida', 'info');
    });
    $('filter-type').addEventListener('change', renderLists);
    $('filter-period').addEventListener('change', renderLists);
    $('clear-filters').addEventListener('click', () => { $('filter-type').value = 'all'; $('filter-period').value = settings.defaultView; renderLists(); });

    function renderSummary() {
        const inc = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const exp = -transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
        const m = since('monthly'), month = transactions.filter(t => isoToDate(t.date) >= m).reduce((s, t) => s + t.amount, 0);
        $('total-balance').textContent = money(inc - exp);
        $('total-income').textContent = money(inc);
        $('total-expenses').textContent = money(exp);
        $('monthly-balance').textContent = money(month);
        $('total-balance').classList.toggle('negative', inc - exp < 0);
        $('monthly-balance').classList.toggle('negative', month < 0);
    }

    // ---------- Charts (SVG puro) ----------
    const empty = '<p class="chart-empty">Sem dados no período</p>';
    function sumBy(list, keyFn) { const m = {}; list.forEach(t => { const k = keyFn(t); m[k] = (m[k] || 0) + Math.abs(t.amount); }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }
    function hbars(entries, color) {
        const max = Math.max(...entries.map(e => e[1]));
        return `<div class="hbars">${entries.map(([k, v], i) => `<div class="hbar"><span class="hb-l">${esc(label(k))}</span><span class="hb-t"><i style="width:${(v / max * 100).toFixed(1)}%;background:${color || PALETTE[i % PALETTE.length]}"></i></span><span class="hb-v">${money(v)}</span></div>`).join('')}</div>`;
    }
    function donut(entries) {
        const total = entries.reduce((s, e) => s + e[1], 0), R = 52, C = 2 * Math.PI * R;
        let off = 0;
        const arcs = entries.map(([k, v], i) => { const len = v / total * C; const a = `<circle r="${R}" cx="70" cy="70" fill="none" stroke="${PALETTE[i % PALETTE.length]}" stroke-width="22" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"><title>${esc(label(k))}: ${money(v)}</title></circle>`; off += len; return a; }).join('');
        const legend = entries.map(([k, v], i) => `<li><i style="background:${PALETTE[i % PALETTE.length]}"></i>${esc(label(k))}<b>${Math.round(v / total * 100)}%</b></li>`).join('');
        return `<div class="donut"><svg viewBox="0 0 140 140" role="img" aria-label="Despesas por categoria">${arcs}<text x="70" y="66" text-anchor="middle" class="d-s">Total</text><text x="70" y="82" text-anchor="middle" class="d-v">${money(total)}</text></svg><ul>${legend}</ul></div>`;
    }
    function trend() {
        const now = new Date(), months = [];
        for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ y: d.getFullYear(), m: d.getMonth(), inc: 0, exp: 0 }); }
        transactions.forEach(t => { const d = isoToDate(t.date); const b = months.find(x => x.y === d.getFullYear() && x.m === d.getMonth()); if (b) { if (t.amount > 0) b.inc += t.amount; else b.exp -= t.amount; } });
        const max = Math.max(1, ...months.map(m => Math.max(m.inc, m.exp)));
        if (months.every(m => !m.inc && !m.exp)) return empty;
        const W = 360, H = 170, bw = 16, gap = W / 6;
        const bars = months.map((m, i) => { const x = i * gap + gap / 2, hi = m.inc / max * (H - 40), he = m.exp / max * (H - 40);
            return `<rect x="${x - bw - 1}" y="${H - 24 - hi}" width="${bw}" height="${hi}" rx="3" class="b-inc"><title>Receitas: ${money(m.inc)}</title></rect><rect x="${x + 1}" y="${H - 24 - he}" width="${bw}" height="${he}" rx="3" class="b-exp"><title>Despesas: ${money(m.exp)}</title></rect><text x="${x}" y="${H - 6}" text-anchor="middle">${new Date(m.y, m.m, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</text>`; }).join('');
        return `<svg viewBox="0 0 ${W} ${H}" class="trend" role="img" aria-label="Evolução mensal">${bars}</svg><div class="legend2"><span><i class="b-inc"></i>Receitas</span><span><i class="b-exp"></i>Despesas</span></div>`;
    }
    function renderCharts() {
        const p = $('report-period').value, list = transactions.filter(t => inPeriod(t, p));
        const inc = list.filter(t => t.amount > 0), exp = list.filter(t => t.amount < 0);
        const ti = inc.reduce((s, t) => s + t.amount, 0), te = -exp.reduce((s, t) => s + t.amount, 0);
        $('income-expense-chart').innerHTML = list.length ? hbars([['Receitas', ti], ['Despesas', te]].map(([k, v]) => [k, v]), null).replace(/background:[^"]+/, 'background:var(--income)').replace(/background:#2f6f8f/, 'background:var(--expense)') : empty;
        $('expenses-by-category-chart').innerHTML = exp.length ? donut(sumBy(exp, t => t.category)) : empty;
        $('monthly-trend-chart').innerHTML = trend();
        $('income-distribution-chart').innerHTML = inc.length ? hbars(sumBy(inc, t => t.category)) : empty;
    }
    $('report-period').addEventListener('change', renderCharts);

    // ---------- Settings ----------
    function applyTheme() { document.body.classList.toggle('dark-theme', settings.theme === 'dark'); }
    $('currency-select').value = settings.currency; $('theme-select').value = settings.theme; $('default-view-select').value = settings.defaultView;
    $('filter-period').value = settings.defaultView;
    $('currency-select').addEventListener('change', e => { settings.currency = e.target.value; write('settings', settings); refresh(); });
    $('theme-select').addEventListener('change', e => { settings.theme = e.target.value; write('settings', settings); applyTheme(); });
    $('default-view-select').addEventListener('change', e => { settings.defaultView = e.target.value; $('filter-period').value = e.target.value; write('settings', settings); renderLists(); });

    function renderCats() {
        const box = $('custom-categories-list');
        box.innerHTML = customCategories.length ? customCategories.map((c, i) => `<span class="category-tag">${esc(c)}<button type="button" data-i="${i}" aria-label="Remover ${esc(c)}">×</button></span>`).join('') : '<p class="muted">Nenhuma categoria personalizada adicionada</p>';
    }
    $('custom-categories-list').addEventListener('click', e => {
        const b = e.target.closest('button[data-i]'); if (!b) return;
        customCategories.splice(+b.dataset.i, 1); write('customCategories', customCategories); renderCats(); fillCategories();
    });
    function addCat() {
        const c = $('new-category-input').value.trim();
        if (!c) return toast('Digite um nome para a categoria', 'error');
        if (customCategories.concat(Object.values(CATS)).some(x => x.toLowerCase() === c.toLowerCase())) return toast('Esta categoria já existe', 'error');
        customCategories.push(c); write('customCategories', customCategories);
        $('new-category-input').value = ''; renderCats(); fillCategories(); toast('Categoria adicionada', 'success');
    }
    $('add-category-btn').addEventListener('click', addCat);
    $('new-category-input').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addCat(); } });

    $('clear-all-data').addEventListener('click', () => {
        if (!confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) return;
        transactions = []; customCategories = []; settings = { currency: 'BRL', theme: 'light', defaultView: 'monthly' };
        write('transactions', transactions); write('customCategories', customCategories); write('settings', settings);
        $('currency-select').value = 'BRL'; $('theme-select').value = 'light'; $('default-view-select').value = 'monthly'; $('filter-period').value = 'monthly';
        applyTheme(); renderCats(); fillCategories(); refresh(); toast('Todos os dados foram limpos', 'info');
    });

    function csvCell(v) { v = String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return `"${v.replace(/"/g, '""')}"`; }
    $('export-csv').addEventListener('click', () => {
        if (!transactions.length) return toast('Não há dados para exportar', 'error');
        const rows = [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']].concat([...transactions].sort(byDate).map(t => [fmtDate(t.date, true), t.description, label(t.category), t.type === 'income' ? 'Receita' : 'Despesa', Math.abs(t.amount).toFixed(2).replace('.', ',')]));
        const blob = new Blob(['﻿' + rows.map(r => r.map(csvCell).join(';')).join('\n')], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `financas_${todayISO()}.csv`;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        toast('CSV exportado', 'success');
    });

    function loadDemo() {
        const n = new Date(), mk = (back, day, d, a, c) => { const dt = new Date(n.getFullYear(), n.getMonth() - back, day); const ds = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; return { id: 'demo' + Math.random().toString(36).slice(2, 8), description: d, amount: a, category: c, date: ds, type: a > 0 ? 'income' : 'expense' }; };
        const demo = [];
        for (let b = 0; b < 4; b++) demo.push(mk(b, 5, 'Salário', 5200, 'salary'), mk(b, 8, 'Aluguel', -1500, 'housing'), mk(b, 12, 'Supermercado', -(480 + b * 35), 'food'), mk(b, 15, 'Transporte', -(190 + b * 10), 'transport'), mk(b, 20, 'Cinema e jantar', -(160 + b * 25), 'entertainment'), mk(b, 22, 'Conta de luz', -(140 + b * 6), 'bills'));
        demo.push(mk(0, 2, 'Projeto freelance', 1300, 'freelance'), mk(1, 18, 'Dividendos', 240, 'investment'), mk(0, 3, 'Curso online', -229, 'education'));
        transactions = transactions.concat(demo.filter(t => isoToDate(t.date) <= n)); write('transactions', transactions); refresh(); toast('Dados de exemplo carregados', 'success');
    }

    function toast(msg, type = 'info') {
        const box = $('notification-container'); box.querySelector('.notification')?.remove();
        const n = document.createElement('div'); n.className = `notification notification-${type}`; n.setAttribute('role', 'status');
        n.innerHTML = `<div class="notification-content">${esc(msg)}</div><button class="notification-close" aria-label="Fechar">&times;</button>`;
        n.querySelector('button').addEventListener('click', () => n.remove());
        box.appendChild(n);
        setTimeout(() => { n.classList.add('notification-hide'); setTimeout(() => n.remove(), 300); }, 3000);
    }

    function refresh() { renderSummary(); renderLists(); renderCharts(); }
    applyTheme(); renderCats(); fillCategories(); refresh();
});
