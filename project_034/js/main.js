// Controle de Hábitos Avançado
class HabitTracker {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habits')) || [];
        this.completions = JSON.parse(localStorage.getItem('completions')) || {};
        this.init();
    }

    init() {
        this.renderHabits();
        this.updateStats();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('add-habit-btn').addEventListener('click', () => this.addHabit());

        // Permitir adicionar hábito com Enter
        document.getElementById('habit-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addHabit();
        });
        document.getElementById('habit-goal').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addHabit();
        });
        document.getElementById('habit-reward').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addHabit();
        });
    }

    addHabit() {
        const name = document.getElementById('habit-name').value.trim();
        const category = document.getElementById('habit-category').value;
        const goal = parseInt(document.getElementById('habit-goal').value) || 1;
        const reward = document.getElementById('habit-reward').value.trim();

        if (!name) {
            alert('Por favor, digite o nome do hábito');
            return;
        }

        const habit = {
            id: Date.now(),
            name,
            category,
            goal,
            reward,
            createdAt: new Date().toISOString()
        };

        this.habits.push(habit);
        this.saveHabits();
        this.renderHabits();

        // Limpar formulário
        document.getElementById('habit-name').value = '';
        document.getElementById('habit-goal').value = '';
        document.getElementById('habit-reward').value = '';
        document.getElementById('habit-category').selectedIndex = 0;
    }

    toggleHabitCompletion(habitId, date) {
        const dateKey = date || new Date().toISOString().split('T')[0];
        if (!this.completions[habitId]) {
            this.completions[habitId] = [];
        }

        const index = this.completions[habitId].indexOf(dateKey);
        if (index === -1) {
            this.completions[habitId].push(dateKey);
        } else {
            this.completions[habitId].splice(index, 1);
        }

        this.saveCompletions();
        this.renderHabits();
        this.updateStats();
    }

    deleteHabit(habitId) {
        if (confirm('Tem certeza que deseja excluir este hábito?')) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            delete this.completions[habitId];
            this.saveHabits();
            this.saveCompletions();
            this.renderHabits();
            this.updateStats();
        }
    }

    getCompletionCount(habitId, date) {
        const dateKey = date || new Date().toISOString().split('T')[0];
        return this.completions[habitId] && this.completions[habitId].includes(dateKey) ? 1 : 0;
    }

    getStreak(habitId) {
        const completions = this.completions[habitId] || [];
        if (completions.length === 0) return 0;

        // Ordenar datas
        const sortedDates = [...completions].sort((a, b) => new Date(b) - new Date(a));

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedDates.length; i++) {
            const checkDate = new Date(sortedDates[i]);
            checkDate.setHours(0, 0, 0, 0);

            const diffTime = today - checkDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === i) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    getBestStreak(habitId) {
        const completions = this.completions[habitId] || [];
        if (completions.length === 0) return 0;

        // Ordenar datas
        const sortedDates = [...completions].sort((a, b) => new Date(a) - new Date(b));

        let maxStreak = 0;
        let currentStreak = 0;
        let prevDate = null;

        for (const dateStr of sortedDates) {
            const currentDate = new Date(dateStr);

            if (prevDate === null) {
                currentStreak = 1;
            } else {
                const diffTime = currentDate - prevDate;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    maxStreak = Math.max(maxStreak, currentStreak);
                    currentStreak = 1;
                }
            }

            prevDate = currentDate;
        }

        return Math.max(maxStreak, currentStreak);
    }

    getTodayCompletionCount() {
        const today = new Date().toISOString().split('T')[0];
        let count = 0;

        for (const habitId in this.completions) {
            if (this.completions[habitId] && this.completions[habitId].includes(today)) {
                count++;
            }
        }

        return count;
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    saveCompletions() {
        localStorage.setItem('completions', JSON.stringify(this.completions));
    }

    renderHabits() {
        const container = document.getElementById('habits-container');

        if (this.habits.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum hábito adicionado. Comece adicionando seu primeiro hábito acima!</p>';
            return;
        }

        container.innerHTML = this.habits.map(habit => {
            const completedToday = this.getCompletionCount(habit.id);
            const streak = this.getStreak(habit.id);
            const bestStreak = this.getBestStreak(habit.id);

            return `
                <div class="habit-item ${completedToday ? 'completed' : ''}" data-habit-id="${habit.id}">
                    <div class="habit-info">
                        <div class="habit-name">${habit.name}</div>
                        <div class="habit-details">
                            <span>${this.getCategoryLabel(habit.category)}</span>
                            <span>Meta: ${habit.goal}x/dia</span>
                        </div>
                        <div class="habit-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${completedToday >= habit.goal ? '100%' : '0%'}"></div>
                            </div>
                            <div class="progress-text">${completedToday}/${habit.goal}</div>
                        </div>
                    </div>
                    <div class="habit-actions">
                        <button class="btn-small btn-complete" onclick="habitTracker.toggleHabitCompletion(${habit.id})">
                            ${completedToday ? 'Desfez' : 'Concluir'}
                        </button>
                        <button class="btn-small btn-edit" onclick="alert('Em desenvolvimento')">Editar</button>
                        <button class="btn-small btn-delete" onclick="habitTracker.deleteHabit(${habit.id})">Excluir</button>
                    </div>
                    <div class="habit-stats">
                        <small>Sequência: ${streak} dias | Melhor: ${bestStreak} dias</small>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const todayCompleted = this.getTodayCompletionCount();
        const totalHabits = this.habits.length;

        // Calcular melhor sequência geral
        let bestOverallStreak = 0;
        for (const habit of this.habits) {
            const streak = this.getBestStreak(habit.id);
            if (streak > bestOverallStreak) {
                bestOverallStreak = streak;
            }
        }

        document.getElementById('completed-today').textContent = `${todayCompleted}/${totalHabits}`;
        document.getElementById('best-streak').textContent = `${bestOverallStreak} dias`;

        // Sequência atual (média ou hábito com maior sequência atual)
        let currentStreak = 0;
        for (const habit of this.habits) {
            const streak = this.getStreak(habit.id);
            if (streak > currentStreak) {
                currentStreak = streak;
            }
        }
        document.getElementById('current-streak').textContent = `${currentStreak} dias`;
    }

    getCategoryLabel(category) {
        const categories = {
            saude: 'Saúde',
            produtividade: 'Produtividade',
            aprendizado: 'Aprendizado',
            'bem-estar': 'Bem-estar',
            financas: 'Finanças'
        };
        return categories[category] || category;
    }
}

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.habitTracker = new HabitTracker();
});