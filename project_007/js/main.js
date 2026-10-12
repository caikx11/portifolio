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
        setupEventListeners();
        renderHabits();
        renderWeekCalendar();
        updateStats();
    }

    function setupEventListeners() {
        addHabitBtn.addEventListener('click', () => {
            habitForm.style.display = 'block';
            addHabitBtn.style.display = 'none';
            habitNameInput.focus();
        });

        cancelHabitBtn.addEventListener('click', closeForm);

        frequencyRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    customDaysContainer.style.display = 'block';
                } else {
                    customDaysContainer.style.display = 'none';
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
        habitForm.style.display = 'none';
        addHabitBtn.style.display = 'flex';
        resetFormInputs();
    }

    function resetFormInputs() {
        habitNameInput.value = '';
        habitCategorySelect.value = 'health';
        document.querySelector('input[name="frequency"][value="daily"]').checked = true;
        customDaysContainer.style.display = 'none';
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

        if (habit.history[todayStr]) {
            delete habit.history[todayStr];
            habit.streak = Math.max(0, habit.streak - 1);
        } else {
            habit.history[todayStr] = true;
            habit.streak++;
            if (habit.streak > habit.longestStreak) {
                habit.longestStreak = habit.streak;
            }
        }

        saveToStorage();
        renderHabits();
        renderWeekCalendar();
        updateStats();
    }

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
                if (h.frequency === 'daily') return true;
                if (h.frequency === 'custom' && h.customDays.includes(todayDay)) return true;
                return false;
            });
        } else if (currentFilter === 'pending') {
            filteredHabits = habits.filter(h => !h.history[todayStr]);
        } else if (currentFilter === 'completed') {
            filteredHabits = habits.filter(h => h.history[todayStr]);
        }

        if (filteredHabits.length === 0) {
            habitsGrid.innerHTML = `
                <div class="empty-state">
                    <span class="empty-state-icon">📋</span>
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
                <div class="habit-checkbox ${isCompletedToday ? 'checked' : ''}"></div>
                <div class="habit-info">
                    <span class="habit-name">${habit.name}</span>
                    <div class="habit-meta">
                        <span class="habit-category">${catInfo.emoji} ${catInfo.label}</span>
                        <span class="habit-streak">🔥 ${habit.streak} dias</span>
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="delete" title="Excluir">🗑️</button>
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

                if (habit.frequency === 'daily') isScheduled = true;
                else if (habit.frequency === 'custom' && habit.customDays.includes(dayIndex)) isScheduled = true;

                if (isScheduled) {
                    const isCompleted = !!habit.history[dayStr];
                    const dot = document.createElement('div');
                    dot.className = `day-habit ${isCompleted ? 'completed' : 'pending'}`;
                    dot.title = habit.name;
                    dot.textContent = categories[habit.category]?.emoji || '🎯';
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
            if (h.streak > maxStreak) maxStreak = h.streak;
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
                if (h.frequency === 'daily') isScheduled = true;
                else if (h.frequency === 'custom' && h.customDays.includes(checkDayIndex)) isScheduled = true;

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
        localStorage.setItem('habitsData', JSON.stringify(habits));
    }

    function loadFromStorage() {
        const savedHabits = localStorage.getItem('habitsData');
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

    // Styles for notifications
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            box-shadow: var(--shadow-lg);
            transform: translateX(100px);
            opacity: 0;
            transition: all 0.3s ease;
        }

        .notification-show { transform: translateX(0); opacity: 1; }
        .notification-hide { transform: translateX(100px); opacity: 0; }

        .notification-info { background: var(--primary-color); }
        .notification-success { background: var(--secondary-color); }
        .notification-error { background: var(--danger-color); }

        .notification { animation: slideIn 0.3s ease forwards; }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    `;
    document.head.appendChild(style);
});