// Pomodoro Timer with Task Management
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const timerDisplay = document.getElementById('timer-display');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskInputArea = document.getElementById('task-input-area');
    const taskInput = document.getElementById('task-input');
    const taskPomodoros = document.getElementById('task-pomodoros');
    const saveTaskBtn = document.getElementById('save-task-btn');
    const taskList = document.getElementById('task-list');

    // Stats Elements
    const completedPomodorosEl = document.getElementById('completed-pomodoros');
    const focusTimeEl = document.getElementById('focus-time');
    const completedTasksEl = document.getElementById('completed-tasks');
    const currentStreakEl = document.getElementById('current-streak');

    // State
    let timerInterval = null;
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let currentMode = 'pomodoro';
    let isRunning = false;

    const modes = {
        pomodoro: 25 * 60,
        'short-break': 5 * 60,
        'long-break': 15 * 60
    };

    let tasks = [];
    let stats = {
        completedPomodoros: 0,
        focusTime: 0,
        completedTasks: 0,
        currentStreak: 0
    };

    // Initialize
    loadFromStorage();
    updateTimerDisplay();
    renderTasks();
    updateStats();

    // Event Listeners
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);

    addTaskBtn.addEventListener('click', () => {
        taskInputArea.style.display = taskInputArea.style.display === 'none' ? 'flex' : 'none';
        taskInput.focus();
    });

    saveTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Switch mode
    function switchMode(mode) {
        currentMode = mode;
        timeLeft = modes[mode];

        modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        resetTimer();
    }

    // Timer functions
    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                timerComplete();
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timerInterval);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }

    function resetTimer() {
        pauseTimer();
        timeLeft = modes[currentMode];
        updateTimerDisplay();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }

    function timerComplete() {
        pauseTimer();
        playNotificationSound();

        if (currentMode === 'pomodoro') {
            stats.completedPomodoros++;
            stats.focusTime += 25;
            saveToStorage();
            updateStats();

            // Auto-switch to break
            const completedTasks = tasks.filter(t => t.completed).length;
            if (completedTasks > 0 && stats.completedPomodoros % 4 === 0) {
                switchMode('long-break');
            } else {
                switchMode('short-break');
            }

            showNotification('Pomodoro completo! Hora de uma pausa.', 'success');
        } else {
            showNotification('Pausa finalizada! Pressione Iniciar para continuar.', 'info');
            // Auto-switch back to pomodoro
            if (currentMode === 'long-break' || currentMode === 'short-break') {
                switchMode('pomodoro');
            }
        }
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Task functions
    function addTask() {
        const name = taskInput.value.trim();
        const pomodoros = parseInt(taskPomodoros.value) || 1;

        if (!name) {
            showNotification('Digite o nome da tarefa', 'error');
            return;
        }

        const task = {
            id: Date.now(),
            name,
            estimatedPomodoros: pomodoros,
            completedPomodoros: 0,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(task);
        saveToStorage();
        renderTasks();
        updateStats();

        taskInput.value = '';
        taskPomodoros.value = 1;
        taskInputArea.style.display = 'none';
        showNotification('Tarefa adicionada!', 'success');
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveToStorage();
        renderTasks();
        updateStats();
        showNotification('Tarefa removida', 'info');
    }

    function toggleTaskComplete(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        task.completed = !task.completed;
        if (task.completed) {
            stats.completedTasks++;
        } else {
            stats.completedTasks--;
        }
        saveToStorage();
        renderTasks();
        updateStats();
    }

    function renderTasks() {
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            const emptyMsg = document.createElement('li');
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.color = 'var(--gray-400)';
            emptyMsg.style.padding = '1rem';
            emptyMsg.textContent = 'Nenhuma tarefa. Adicione uma para começar!';
            taskList.appendChild(emptyMsg);
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
                <div class="task-info">
                    <span class="task-name">${task.name}</span>
                    <span class="task-pomodoros">${task.completedPomodoros}/${task.estimatedPomodoros} pomodoros</span>
                </div>
                <button class="task-delete" title="Excluir">🗑️</button>
            `;

            const checkbox = li.querySelector('.task-checkbox');
            const deleteBtn = li.querySelector('.task-delete');

            checkbox.addEventListener('click', () => toggleTaskComplete(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            taskList.appendChild(li);
        });
    }

    // Stats
    function updateStats() {
        completedPomodorosEl.textContent = stats.completedPomodoros;
        focusTimeEl.textContent = `${stats.focusTime} min`;
        completedTasksEl.textContent = stats.completedTasks;
        currentStreakEl.textContent = stats.currentStreak;
    }

    // Storage
    function saveToStorage() {
        localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    }

    function loadFromStorage() {
        const savedTasks = localStorage.getItem('pomodoroTasks');
        const savedStats = localStorage.getItem('pomodoroStats');

        if (savedTasks) {
            try {
                tasks = JSON.parse(savedTasks);
            } catch (e) {
                tasks = [];
            }
        }

        if (savedStats) {
            try {
                stats = JSON.parse(savedStats);
            } catch (e) {
                stats = { completedPomodoros: 0, focusTime: 0, completedTasks: 0, currentStreak: 0 };
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

    // Notification sound using Web Audio API
    function playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            // Audio not supported or blocked
        }
    }

    // Add notification styles
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
        .notification-error { background: var(--accent-color); }

        .notification { animation: slideIn 0.3s ease forwards; }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    `;
    document.head.appendChild(style);
});