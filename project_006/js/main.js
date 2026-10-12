// Pomodoro com timer baseado em timestamp, tarefa ativa e streak diário
document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    const display = $('timer-display'), startBtn = $('start-btn'), pauseBtn = $('pause-btn'), resetBtn = $('reset-btn');
    const ring = $('ring-fg'), taskList = $('task-list'), area = $('task-input-area');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const C = 2 * Math.PI * 100;
    ring.style.strokeDasharray = C;

    const MODES = { pomodoro: 25 * 60, 'short-break': 5 * 60, 'long-break': 15 * 60 };
    const LABEL = { pomodoro: 'Foco', 'short-break': 'Pausa curta', 'long-break': 'Pausa longa' };
    const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
    const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

    let tasks = read('pomodoroTasks', []);
    let days = read('pomodoroDays', {}); // { 'YYYY-MM-DD': { pomodoros, focus, tasks } }
    let activeId = null;
    let mode = 'pomodoro', total = MODES[mode], left = total, endAt = 0, timer = null, running = false;

    const day = () => (days[today()] ||= { pomodoros: 0, focus: 0, tasks: 0 });
    const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    function draw() {
        display.textContent = fmt(left);
        ring.style.strokeDashoffset = C * (1 - left / total);
        document.title = `${running ? fmt(left) + ' · ' : ''}Pomodoro Timer`;
        document.body.dataset.mode = mode;
    }
    function tick() {
        left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
        draw();
        if (left <= 0) complete();
    }
    function start() {
        if (running) return;
        running = true; endAt = Date.now() + left * 1000;
        timer = setInterval(tick, 250);
        startBtn.disabled = true; pauseBtn.disabled = false;
        tick();
    }
    function pause() {
        if (!running) return;
        running = false; clearInterval(timer);
        startBtn.disabled = false; startBtn.textContent = 'Continuar'; pauseBtn.disabled = true;
        draw();
    }
    function reset() {
        running = false; clearInterval(timer);
        left = total = MODES[mode];
        startBtn.disabled = false; startBtn.textContent = 'Iniciar'; pauseBtn.disabled = true;
        draw();
    }
    function setMode(m) {
        mode = m;
        modeButtons.forEach(b => b.classList.toggle('active', b.dataset.mode === m));
        reset();
    }
    function complete() {
        const was = mode;
        pause(); beep();
        if (was === 'pomodoro') {
            const d = day(); d.pomodoros++; d.focus += 25;
            const t = tasks.find(x => x.id === activeId);
            if (t) { t.done = Math.min(t.est, t.done + 1) ; }
            saveAll(); renderTasks(); renderStats();
            toast('Pomodoro completo! Hora de uma pausa.', 'success');
            setMode(d.pomodoros % 4 === 0 ? 'long-break' : 'short-break');
        } else {
            toast('Pausa finalizada. Pronto para focar?', 'info');
            setMode('pomodoro');
        }
    }

    function saveAll() { write('pomodoroTasks', tasks); write('pomodoroDays', days); }

    function streak() {
        let n = 0; const d = new Date();
        if (!(days[today()]?.pomodoros > 0)) d.setDate(d.getDate() - 1);
        for (;;) {
            const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (days[k]?.pomodoros > 0) { n++; d.setDate(d.getDate() - 1); } else break;
        }
        return n;
    }
    function renderStats() {
        const d = day();
        $('completed-pomodoros').textContent = d.pomodoros;
        $('focus-time').textContent = `${d.focus} min`;
        $('completed-tasks').textContent = d.tasks;
        $('current-streak').textContent = streak();
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const act = tasks.find(t => t.id === activeId);
        $('timer-task').textContent = act ? act.name : 'Sem tarefa ativa';
        if (!tasks.length) {
            const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'Nenhuma tarefa ainda. Adicione a primeira.';
            taskList.appendChild(li); return;
        }
        tasks.forEach(t => {
            const li = document.createElement('li');
            li.className = 'task-item' + (t.completed ? ' completed' : '') + (t.id === activeId ? ' current' : '');
            const chk = document.createElement('button'); chk.className = 'task-checkbox' + (t.completed ? ' checked' : '');
            chk.setAttribute('role', 'checkbox'); chk.setAttribute('aria-checked', t.completed); chk.setAttribute('aria-label', 'Concluir ' + t.name);
            const info = document.createElement('button'); info.className = 'task-info'; info.title = 'Definir como tarefa ativa';
            const name = document.createElement('span'); name.className = 'task-name'; name.textContent = t.name;
            const meta = document.createElement('span'); meta.className = 'task-pomodoros'; meta.textContent = `${'●'.repeat(t.done)}${'○'.repeat(Math.max(0, t.est - t.done))}  ${t.done}/${t.est}`;
            info.append(name, meta);
            const del = document.createElement('button'); del.className = 'task-delete'; del.setAttribute('aria-label', 'Excluir ' + t.name); del.textContent = '×';
            chk.addEventListener('click', () => {
                t.completed = !t.completed;
                const d = day(); d.tasks = Math.max(0, d.tasks + (t.completed ? 1 : -1));
                if (t.completed && activeId === t.id) activeId = null;
                saveAll(); renderTasks(); renderStats();
            });
            info.addEventListener('click', () => { if (!t.completed) { activeId = activeId === t.id ? null : t.id; renderTasks(); } });
            del.addEventListener('click', () => { tasks = tasks.filter(x => x.id !== t.id); if (activeId === t.id) activeId = null; saveAll(); renderTasks(); });
            li.append(chk, info, del);
            taskList.appendChild(li);
        });
    }

    function addTask() {
        const name = $('task-input').value.trim();
        const est = Math.min(10, Math.max(1, parseInt($('task-pomodoros').value) || 1));
        if (!name) return toast('Digite o nome da tarefa', 'error');
        const t = { id: Date.now(), name, est, done: 0, completed: false };
        tasks.push(t); if (!activeId) activeId = t.id;
        saveAll(); renderTasks();
        $('task-input').value = ''; $('task-pomodoros').value = 1;
        area.hidden = true; $('add-task-btn').setAttribute('aria-expanded', 'false');
    }

    function toast(msg, type = 'info') {
        document.querySelector('.notification')?.remove();
        const n = document.createElement('div');
        n.className = `notification notification-${type}`; n.setAttribute('role', 'status'); n.textContent = msg;
        document.body.appendChild(n);
        setTimeout(() => { n.classList.add('notification-hide'); setTimeout(() => n.remove(), 300); }, 3000);
    }
    function beep() {
        try {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const o = ac.createOscillator(), g = ac.createGain();
            o.connect(g); g.connect(ac.destination);
            o.frequency.setValueAtTime(800, ac.currentTime); o.frequency.setValueAtTime(600, ac.currentTime + .15); o.frequency.setValueAtTime(800, ac.currentTime + .3);
            g.gain.setValueAtTime(.25, ac.currentTime); g.gain.exponentialRampToValueAtTime(.01, ac.currentTime + .6);
            o.start(); o.stop(ac.currentTime + .6);
        } catch (e) {}
    }

    modeButtons.forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    startBtn.addEventListener('click', start);
    pauseBtn.addEventListener('click', pause);
    resetBtn.addEventListener('click', reset);
    $('add-task-btn').addEventListener('click', e => {
        area.hidden = !area.hidden;
        e.currentTarget.setAttribute('aria-expanded', String(!area.hidden));
        if (!area.hidden) $('task-input').focus();
    });
    $('save-task-btn').addEventListener('click', addTask);
    $('task-input').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

    renderTasks(); renderStats(); draw();
});
