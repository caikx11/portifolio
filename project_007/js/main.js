// Habit Tracker Javascript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitForm = document.getElementById('habit-form');
    const habitNameInput = document.getElementById('habit-name');
    const habitCategorySelect = document.getElementById('habit-category');
    const frequencyRadios = document.querySelectorAll('input[name="frequency"]');
    const customDaysContainer = document.getElementById('custom-days');
    const dayButtons = document.querySelectorAll('.day-buttons button');
    const saveHabitBtn = document.getElementById('save-habit-btn');
    const cancelHabitBtn = document.getElementById('cancel-habit-btn');
    const habitsGrid = document.getElementById('habits-grid');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const weekCalendar = document.getElementById('week-calendar');

    // Stats Elements
    const totalHabitsEl = document.getElementById('total-habits');
    const completedTodayEl = document.getElementById('completed-today');
    const longestStreakEl = document.getElementById('longest-streak');
    const completionRateEl = document.getElementById('completion-rate');

    // State
    let habits = [];
    let activeCustomDays = [];
    let currentFilter = 'all';

    const categories = {
        health: { label: 'Saúde', emoji: '🏥' },
        productivity: { label: 'Produtividade', emoji: '💼' },
        learning: { label: 'Aprendizado', emoji: '📚' },
        fitness: { label: 'Fitness', emoji: '💪' },
        mindfulness: { label: 'Mindfulness', emoji: '🧘' },
        other: { label: 'Outro', emoji: '📦' }
    };

    // Initialize
    init();

    function init() {
        loadFromStorage();
        habits.forEach(refreshStreak);
        setupEventListeners();
        renderHabits();
        renderWeekCalendar();
        updateStats();
    }

    function setupEventListeners() {
        addHabitBtn.addEventListener('click', () => {
            habitForm.hidden = false;
            addHabitBtn.hidden = true;
            habitNameInput.focus();
        });

        cancelHabitBtn.addEventListener('click', closeForm);

        frequencyRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    customDaysContainer.hidden = false;
                } else {
                    customDaysContainer.hidden = true;
                    activeCustomDays = [];
                    dayButtons.forEach(btn => btn.classList.remove('active'));
                }
            });
        });

        dayButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const day = parseInt(btn.dataset.day);
                if (activeCustomDays.includes(day)) {
                    activeCustomDays = activeCustomDays.filter(d => d !== day);
                    btn.classList.remove('active');
                } else {
                    activeCustomDays.push(day);
                    btn.classList.add('active');
                }
            });
        });

        saveHabitBtn.addEventListener('click', saveHabit);

        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => tab !== t && t.classList.remove('active'));
                tab.classList.add('active');
                currentFilter = tab.dataset.filter;
                renderHabits();
            });
        });
    }

    function closeForm() {
        habitForm.hidden = true;
        addHabitBtn.hidden = false;
        resetFormInputs();
    }

    function resetFormInputs() {
        habitNameInput.value = '';
        habitCategorySelect.value = 'health';
        document.querySelector('input[name="frequency"][value="daily"]').checked = true;
        customDaysContainer.hidden = true;
        activeCustomDays = [];
        dayButtons.forEach(btn => btn.classList.remove('active'));
    }

    // Save Habit
    function saveHabit() {
        const name = habitNameInput.value.trim();
        const category = habitCategorySelect.value;
        const frequency = document.querySelector('input[name="frequency"]:checked').value;

        if (!name) {
            showNotification('Digite o nome do hábito', 'error');
            return;
        }

        if (frequency === 'custom' && activeCustomDays.length === 0) {
            showNotification('Selecione pelo menos um dia para a frequência personalizada', 'error');
            return;
        }

        const newHabit = {
            id: Date.now(),
            name,
            category,
            frequency,
            customDays: [...activeCustomDays],
            streak: 0,
            longestStreak: 0,
            history: {}, // Format: { "YYYY-MM-DD": true/false }
            createdAt: new Date().toISOString()
        };

        habits.push(newHabit);
        saveToStorage();
        closeForm();
        renderHabits();
        renderWeekCalendar();
        updateStats();
        showNotification('Hábito criado com sucesso!', 'success');
    }

    // Toggle Habit Completion for Today
    function toggleHabitCompletion(id) {
        const todayStr = getTodayString();
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        if (habit.history[todayStr]) delete habit.history[todayStr];
        else habit.history[todayStr] = true;
        refreshStreak(habit);

        saveToStorage();
        renderHabits();
        renderWeekCalendar();
        updateStats();
    }

    function isScheduled(h, date) {
        if (h.frequency === 'custom') return h.customDays.includes(date.getDay());
        return true; // diário e semanal: qualquer dia vale
    }
    function refreshStreak(h) {
        const d = new Date();
        if (!h.history[formatDateString(d)]) d.setDate(d.getDate() - 1);
        let n = 0;
        for (let i = 0; i < 400; i++) {
            const k = formatDateString(d);
            if (h.history[k]) n++;
            else if (isScheduled(h, d)) break;
            d.setDate(d.getDate() - 1);
        }
        h.streak = n;
        h.longestStreak = Math.max(h.longestStreak || 0, n);
    }
    function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    // Delete Habit
    function deleteHabit(id) {
        if (confirm('Deseja realmente excluir este hábito?')) {
            habits = habits.filter(h => h.id !== id);
            saveToStorage();
            renderHabits();
            renderWeekCalendar();
            updateStats();
            showNotification('Hábito removido', 'info');
        }
    }

    // Render Habits Grid
    function renderHabits() {
        habitsGrid.innerHTML = '';
        const todayStr = getTodayString();

        let filteredHabits = habits;

        if (currentFilter === 'today') {
            const todayDay = new Date().getDay();
            filteredHabits = habits.filter(h => {
                return h.frequency !== 'custom' || h.customDays.includes(todayDay);
            });
        } else if (currentFilter === 'pending') {
            filteredHabits = habits.filter(h => !h.history[todayStr]);
        } else if (currentFilter === 'completed') {
            filteredHabits = habits.filter(h => h.history[todayStr]);
        }

        if (filteredHabits.length === 0) {
            habitsGrid.innerHTML = `
                <div class="empty-state">
                    <span class="empty-state-icon">∅</span>
                    <p>Nenhum hábito encontrado neste filtro.</p>
                </div>
            `;
            return;
        }

        filteredHabits.forEach(habit => {
            const isCompletedToday = !!habit.history[todayStr];
            const catInfo = categories[habit.category] || categories.other;

            const card = document.createElement('div');
            card.className = `habit-card ${isCompletedToday ? 'completed' : ''}`;
            card.innerHTML = `
                <button type="button" class="habit-checkbox ${isCompletedToday ? 'checked' : ''}" role="checkbox" aria-checked="${isCompletedToday}" aria-label="Marcar hábito de hoje"></button>
                <div class="habit-info">
                    <span class="habit-name">${esc(habit.name)}</span>
                    <div class="habit-meta">
                        <span class="habit-category">${catInfo.label}</span>
                        <span class="habit-streak">${habit.streak} ${habit.streak === 1 ? "dia seguido" : "dias seguidos"}</span>
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="delete" title="Excluir" aria-label="Excluir hábito">Excluir</button>
                </div>
            `;

            const checkbox = card.querySelector('.habit-checkbox');
            const deleteBtn = card.querySelector('.delete');

            checkbox.addEventListener('click', () => toggleHabitCompletion(habit.id));
            deleteBtn.addEventListener('click', () => deleteHabit(habit.id));

            habitsGrid.appendChild(card);
        });
    }

    // Render Weekly Calendar View
    function renderWeekCalendar() {
        weekCalendar.innerHTML = '';
        const today = new Date();
        const currentDayIndex = today.getDay();

        // Get past 7 days starting from Monday or just current week
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() - currentDayIndex + i);
            weekDays.push(d);
        }

        const daysLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

        weekDays.forEach((dayDate, i) => {
            const dayStr = formatDateString(dayDate);
            const isToday = formatDateString(today) === dayStr;

            const dayColumn = document.createElement('div');
            dayColumn.className = `day-column ${isToday ? 'day-today' : ''}`;

            const header = document.createElement('div');
            header.className = 'day-header';
            header.textContent = daysLabels[i];
            dayColumn.appendChild(header);

            const habitsDiv = document.createElement('div');
            habitsDiv.className = 'day-habits';

            // Filter habits scheduled for this day
            habits.forEach(habit => {
                const dayIndex = dayDate.getDay();
                let isScheduled = false;

                isScheduled = habit.frequency !== 'custom' || habit.customDays.includes(dayIndex);

                if (isScheduled) {
                    const isCompleted = !!habit.history[dayStr];
                    const dot = document.createElement('div');
                    dot.className = `day-habit ${isCompleted ? 'completed' : 'pending'}`;
                    dot.title = habit.name;
                    dot.textContent = (habit.name.trim()[0] || '•').toUpperCase();
                    habitsDiv.appendChild(dot);
                }
            });

            dayColumn.appendChild(habitsDiv);
            weekCalendar.appendChild(dayColumn);
        });
    }

    // Update stats panel
    function updateStats() {
        const todayStr = getTodayString();
        totalHabitsEl.textContent = habits.length;

        const completedToday = habits.filter(h => h.history[todayStr]).length;
        completedTodayEl.textContent = completedToday;

        let maxStreak = 0;
        habits.forEach(h => {
            refreshStreak(h);
            if (h.longestStreak > maxStreak) maxStreak = h.longestStreak;
        });
        longestStreakEl.textContent = maxStreak;

        // Calculate completion rate over the last 30 days
        let totalScheduled = 0;
        let totalCompleted = 0;

        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date();
            checkDate.setDate(today.getDate() - i);
            const checkDateStr = formatDateString(checkDate);
            const checkDayIndex = checkDate.getDay();

            habits.forEach(h => {
                let isScheduled = false;
                isScheduled = h.frequency !== 'custom' || h.customDays.includes(checkDayIndex);

                if (isScheduled) {
                    totalScheduled++;
                    if (h.history[checkDateStr]) {
                        totalCompleted++;
                    }
                }
            });
        }

        const rate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
        completionRateEl.textContent = `${rate}%`;
    }

    // Helper functions
    function getTodayString() {
        return formatDateString(new Date());
    }

    function formatDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Storage
    function saveToStorage() {
        try { localStorage.setItem('habitsData', JSON.stringify(habits)); } catch (e) {}
    }

    function loadFromStorage() {
        let savedHabits = null;
        try { savedHabits = localStorage.getItem('habitsData'); } catch (e) {}
        if (savedHabits) {
            try {
                habits = JSON.parse(savedHabits);
            } catch (e) {
                habits = [];
            }
        }
    }

    // Notification
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
