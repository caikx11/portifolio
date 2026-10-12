// Hábito Solar - controle de hábitos com metas diárias, sequências e recompensas
const CATEGORIES = { saude: 'Saúde', produtividade: 'Produtividade', aprendizado: 'Aprendizado', 'bem-estar': 'Bem-estar', financas: 'Finanças' };

function dayKey(d = new Date()) {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}
function shiftDay(key, delta) {
    const [y, m, d] = key.split('-').map(Number);
    return dayKey(new Date(y, m - 1, d + delta));
}
function esc(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
}
function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
}

class HabitTracker {
    constructor() {
        this.habits = load('habits', []);
        this.counts = load('habit_counts_v2', null);
        if (!this.counts) this.counts = this.migrate(load('completions', {}));
        this.init();
    }

    migrate(old) {
        const out = {};
        Object.keys(old).forEach(id => {
            const h = this.habits.find(x => String(x.id) === id);
            out[id] = {};
            (Array.isArray(old[id]) ? old[id] : []).forEach(dk => { out[id][dk] = h ? h.goal : 1; });
        });
        return out;
    }

    init() {
        document.getElementById('today-label').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        document.getElementById('add-habit-btn').addEventListener('click', () => this.addHabit());
        ['habit-name', 'habit-goal', 'habit-reward'].forEach(id =>
            document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') this.addHabit(); }));
        document.getElementById('habits-container').addEventListener('click', e => {
            const b = e.target.closest('button[data-act]');
            if (!b) return;
            const id = Number(b.dataset.id);
            if (b.dataset.act === 'inc') this.bump(id, 1);
            if (b.dataset.act === 'dec') this.bump(id, -1);
            if (b.dataset.act === 'del') this.deleteHabit(id);
            if (b.dataset.act === 'edit') this.editHabit(id);
        });
        this.render();
    }

    save() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
        localStorage.setItem('habit_counts_v2', JSON.stringify(this.counts));
    }

    count(id, key = dayKey()) { return (this.counts[id] && this.counts[id][key]) || 0; }
    done(h, key = dayKey()) { return this.count(h.id, key) >= h.goal; }

    addHabit() {
        const name = document.getElementById('habit-name').value.trim();
        const err = document.getElementById('form-error');
        if (!name) {
            err.textContent = 'Dê um nome ao hábito para plantá-lo.';
            err.hidden = false;
            document.getElementById('habit-name').focus();
            return;
        }
        err.hidden = true;
        this.habits.push({
            id: Date.now(), name,
            category: document.getElementById('habit-category').value,
            goal: Math.min(20, Math.max(1, parseInt(document.getElementById('habit-goal').value, 10) || 1)),
            reward: document.getElementById('habit-reward').value.trim(),
            createdAt: new Date().toISOString()
        });
        this.save();
        ['habit-name', 'habit-goal', 'habit-reward'].forEach(id => { document.getElementById(id).value = ''; });
        this.render();
    }

    bump(id, delta) {
        const h = this.habits.find(x => x.id === id);
        if (!h) return;
        const key = dayKey();
        this.counts[id] = this.counts[id] || {};
        const n = Math.max(0, Math.min(h.goal, this.count(id) + delta));
        if (n === 0) delete this.counts[id][key]; else this.counts[id][key] = n;
        this.save();
        this.render();
    }

    editHabit(id) {
        const h = this.habits.find(x => x.id === id);
        const name = h && prompt('Novo nome do hábito:', h.name);
        if (name && name.trim()) { h.name = name.trim().slice(0, 60); this.save(); this.render(); }
    }

    deleteHabit(id) {
        if (!confirm('Excluir este hábito?')) return;
        this.habits = this.habits.filter(h => h.id !== id);
        delete this.counts[id];
        this.save();
        this.render();
    }

    streak(h) {
        let key = dayKey();
        if (!this.done(h, key)) key = shiftDay(key, -1);
        let n = 0;
        while (this.done(h, key)) { n++; key = shiftDay(key, -1); }
        return n;
    }

    bestStreak(h) {
        const days = Object.keys(this.counts[h.id] || {}).filter(k => this.done(h, k)).sort();
        let best = 0, cur = 0, prev = null;
        days.forEach(k => {
            cur = prev && shiftDay(prev, 1) === k ? cur + 1 : 1;
            best = Math.max(best, cur);
            prev = k;
        });
        return best;
    }

    weekDots(h) {
        const today = dayKey();
        let html = '';
        for (let i = 6; i >= 0; i--) {
            const k = shiftDay(today, -i);
            const [y, m, d] = k.split('-').map(Number);
            const lbl = new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'narrow' });
            html += `<span class="dot ${this.done(h, k) ? 'on' : this.count(h.id, k) ? 'half' : ''} ${i === 0 ? 'today' : ''}" title="${k}">${lbl}</span>`;
        }
        return html;
    }

    render() {
        const box = document.getElementById('habits-container');
        if (!this.habits.length) {
            box.innerHTML = '<p class="empty-state">Nenhum hábito ainda. Plante o primeiro acima e veja o sol nascer.</p>';
        } else {
            box.innerHTML = this.habits.map(h => {
                const c = this.count(h.id), ok = c >= h.goal, pct = Math.round(c / h.goal * 100);
                return `
                <article class="habit-item ${ok ? 'completed' : ''}">
                    <div class="sun" aria-hidden="true" style="--p:${pct}"></div>
                    <div class="habit-info">
                        <div class="habit-name">${esc(h.name)}</div>
                        <div class="habit-details"><span class="chip cat-${h.category}">${CATEGORIES[h.category] || esc(h.category)}</span><span>Meta ${h.goal}x/dia</span></div>
                        <div class="habit-progress">
                            <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
                            <div class="progress-text">${c}/${h.goal}</div>
                        </div>
                        <div class="week" aria-label="Últimos 7 dias">${this.weekDots(h)}</div>
                        <div class="habit-stats"><small>Sequência ${this.streak(h)} d · Melhor ${this.bestStreak(h)} d</small></div>
                        ${ok && h.reward ? `<div class="reward">Recompensa liberada: ${esc(h.reward)}</div>` : ''}
                    </div>
                    <div class="habit-actions">
                        <button class="btn-small btn-complete" data-act="inc" data-id="${h.id}" ${ok ? 'disabled' : ''}>${h.goal > 1 ? '+1' : 'Concluir'}</button>
                        <button class="btn-small" data-act="dec" data-id="${h.id}" ${c ? '' : 'disabled'} aria-label="Desfazer um">Desfazer</button>
                        <button class="btn-small" data-act="edit" data-id="${h.id}">Editar</button>
                        <button class="btn-small btn-delete" data-act="del" data-id="${h.id}">Excluir</button>
                    </div>
                </article>`;
            }).join('');
        }
        this.updateStats();
    }

    updateStats() {
        const done = this.habits.filter(h => this.done(h)).length;
        document.getElementById('completed-today').textContent = `${done}/${this.habits.length}`;
        document.getElementById('best-streak').textContent = `${Math.max(0, ...this.habits.map(h => this.bestStreak(h)))} dias`;
        document.getElementById('current-streak').textContent = `${Math.max(0, ...this.habits.map(h => this.streak(h)))} dias`;
    }
}

document.addEventListener('DOMContentLoaded', () => { window.habitTracker = new HabitTracker(); });
