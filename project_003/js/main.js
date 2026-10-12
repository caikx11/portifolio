// To-Do List Application with localStorage persistence
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const taskCountEl = document.getElementById('task-count');
    const clearCompletedBtn = document.getElementById('clear-completed');

    // State
    let tasks = [];
    let currentFilter = 'all';

    // Initialize the app
    init();

    // Initialize application
    function init() {
        loadTasksFromStorage();
        renderTasks();
        updateTaskCount();
        setupEventListeners();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Add task button
        addTaskBtn.addEventListener('click', addTask);

        // Add task with Enter key
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });

        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active filter button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });

        // Clear completed tasks
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    }

    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();

        if (taskText === '') {
            showNotification('Por favor, digite uma tarefa válida', 'error');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        saveTasksToStorage();
        renderTasks();
        updateTaskCount();

        // Clear input and show success notification
        taskInput.value = '';
        taskInput.focus();
        showNotification('Tarefa adicionada com sucesso!', 'success');
    }

    // Toggle task completion status
    function toggleTaskCompletion(id) {
        tasks = tasks.map(task =>
            task.id === id ? {...task, completed: !task.completed} : task
        );
        saveTasksToStorage();
        renderTasks();
        updateTaskCount();
    }

    // Delete a task
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasksToStorage();
        renderTasks();
        updateTaskCount();
        showNotification('Tarefa removida', 'info');
    }

    // Edit a task
    function editTask(id, newText) {
        tasks = tasks.map(task =>
            task.id === id ? {...task, text: newText} : task
        );
        saveTasksToStorage();
        renderTasks();
        updateTaskCount();
        showNotification('Tarefa atualizada', 'success');
    }

    // Clear completed tasks
    function clearCompletedTasks() {
        const completedCount = tasks.filter(task => task.completed).length;
        if (completedCount === 0) {
            showNotification('Não há tarefas concluídas para limpar', 'info');
            return;
        }

        tasks = tasks.filter(task => !task.completed);
        saveTasksToStorage();
        renderTasks();
        updateTaskCount();
        showNotification(`${completedCount} tarefa(s) concluída(s) removida(s)`, 'success');
    }

    // Render tasks based on current filter
    function renderTasks() {
        // Clear the task list
        taskList.innerHTML = '';

        // Filter tasks
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        // If no tasks match filter, show empty state
        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML =
                currentFilter === 'active'
                    ? 'Tudo feito por aqui. Respire fundo.'
                    : currentFilter === 'completed'
                        ? 'Nada riscado da lista ainda.'
                        : 'Nenhuma tarefa cadastrada. Comece adicionando uma acima!';
            taskList.appendChild(emptyState);
            return;
        }

        // Render each task
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.innerHTML = `
                <button type="button" class="task-checkbox ${task.completed ? 'checked' : ''}" role="checkbox" aria-checked="${task.completed}" aria-label="Concluir tarefa"></button>
                <span class="task-text">${escapeHTML(task.text)}</span>
                <div class="task-actions">
                    <button class="edit-btn" title="Editar tarefa" aria-label="Editar tarefa">Editar</button>
                    <button class="delete-btn" title="Excluir tarefa" aria-label="Excluir tarefa">Excluir</button>
                </div>
            `;

            // Add event listeners to task elements
            const checkbox = taskItem.querySelector('.task-checkbox');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            const editBtn = taskItem.querySelector('.edit-btn');
            const taskText = taskItem.querySelector('.task-text');

            checkbox.addEventListener('click', () => toggleTaskCompletion(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            editBtn.addEventListener('click', () => {
                // Simple inline editing - prompt for new text
                const newText = prompt('Edite sua tarefa:', task.text);
                if (newText !== null && newText.trim() !== '') {
                    editTask(task.id, newText.trim());
                }
            });

            // Double-click to edit task text
            taskText.addEventListener('dblclick', () => {
                const newText = prompt('Edite sua tarefa:', task.text);
                if (newText !== null && newText.trim() !== '') {
                    editTask(task.id, newText.trim());
                }
            });

            taskList.appendChild(taskItem);
        });
    }

    // Update task count display
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCountEl.textContent = `${activeTasks} ${activeTasks === 1 ? 'tarefa pendente' : 'tarefas pendentes'}`;
    }

    // Save tasks to localStorage
    function saveTasksToStorage() {
        try { localStorage.setItem('todoTasks', JSON.stringify(tasks)); } catch (e) {}
    }

    // Load tasks from localStorage
    function loadTasksFromStorage() {
        let savedTasks = null;
        try { savedTasks = localStorage.getItem('todoTasks'); } catch (e) {}
        if (savedTasks) {
            try {
                tasks = JSON.parse(savedTasks);
            } catch (error) {
                console.error('Error parsing tasks from localStorage:', error);
                tasks = [];
                try { localStorage.removeItem('todoTasks'); } catch (e) {}
            }
        } else {
            tasks = [];
        }
    }

    function escapeHTML(s) {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    // Show notification (simple implementation)
    function showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Add to document
        document.body.appendChild(notification);

        // Remove after delay
        setTimeout(() => {
            notification.classList.add('notification-hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

});
