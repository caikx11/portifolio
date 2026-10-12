// Cruzadinha do Dia
class CrosswordGame {
    constructor() {
        const $ = (id) => document.getElementById(id);
        this.difficultySelect = $('difficulty');
        this.checkBtn = $('check-btn');
        this.revealBtn = $('reveal-btn');
        this.hintBtn = $('hint-btn');
        this.timerDisplay = $('timer');
        this.scoreDisplay = $('score');
        this.wordsFoundDisplay = $('words-found');
        this.grid = $('crossword-grid');
        this.acrossList = $('across-clues');
        this.downList = $('down-clues');
        this.overlay = $('game-overlay');
        this.finalMessage = $('final-message');
        this.overlayTitle = $('overlay-title');
        this.activeClue = $('active-clue');
        this.difficulty = 'médio';
        this.lastIndex = {};
        this.timer = null;
        this.bind();
        $('dateline').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        this.startNewGame();
    }

    bind() {
        this.difficultySelect.addEventListener('change', (e) => { this.difficulty = e.target.value; this.startNewGame(); });
        document.getElementById('new-game-btn').addEventListener('click', () => this.startNewGame());
        this.checkBtn.addEventListener('click', () => this.checkAnswers());
        this.revealBtn.addEventListener('click', () => this.revealSolution());
        this.hintBtn.addEventListener('click', () => this.giveHint());
        document.getElementById('play-again-btn').addEventListener('click', () => this.startNewGame());
    }

    startNewGame() {
        clearInterval(this.timer);
        const list = PUZZLES[this.difficulty];
        let idx = Math.floor(Math.random() * list.length);
        if (list.length > 1 && idx === this.lastIndex[this.difficulty]) idx = (idx + 1) % list.length;
        this.lastIndex[this.difficulty] = idx;
        this.words = list[idx].map(w => ({ ...w, cells: [], done: false }));
        this.score = 0;
        this.seconds = 0;
        this.over = false;
        this.selected = null;
        this.dir = 'across';
        this.overlay.classList.add('hidden');
        this.buildGrid();
        this.renderClues();
        this.updateHud();
        [this.checkBtn, this.revealBtn, this.hintBtn].forEach(b => { b.disabled = false; });
        this.timer = setInterval(() => { this.seconds++; this.updateHud(); }, 1000);
        const first = this.words.find(w => w.num === 1) || this.words[0];
        this.dir = first.dir;
        this.select(first.row, first.col, first.dir, false);
    }

    buildGrid() {
        const rows = Math.max(...this.words.map(w => w.row + (w.dir === 'down' ? w.word.length : 1)));
        const cols = Math.max(...this.words.map(w => w.col + (w.dir === 'across' ? w.word.length : 1)));
        this.rows = rows; this.cols = cols;
        this.cellMap = {};
        this.words.forEach((w, wi) => {
            for (let i = 0; i < w.word.length; i++) {
                const r = w.row + (w.dir === 'down' ? i : 0), c = w.col + (w.dir === 'across' ? i : 0);
                const key = r + ',' + c;
                const cell = this.cellMap[key] || (this.cellMap[key] = { r, c, letter: w.word[i], words: {} });
                cell.words[w.dir] = wi;
                w.cells.push(cell);
            }
        });
        // numbering
        let n = 0;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const cell = this.cellMap[r + ',' + c];
            if (!cell) continue;
            const starts = this.words.filter(w => w.row === r && w.col === c);
            if (starts.length) { cell.num = ++n; starts.forEach(w => { w.num = cell.num; }); }
        }
        this.grid.style.setProperty('--cols', cols);
        this.grid.innerHTML = '';
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const cell = this.cellMap[r + ',' + c];
            const el = document.createElement('div');
            if (!cell) { el.className = 'cell block'; this.grid.appendChild(el); continue; }
            el.className = 'cell';
            el.setAttribute('role', 'gridcell');
            if (cell.num) el.insertAdjacentHTML('beforeend', `<span class="num">${cell.num}</span>`);
            const input = document.createElement('input');
            input.maxLength = 1;
            input.autocomplete = 'off';
            input.autocapitalize = 'characters';
            input.setAttribute('aria-label', `Linha ${r + 1}, coluna ${c + 1}`);
            input.addEventListener('focus', () => this.onFocus(cell));
            input.addEventListener('mousedown', () => { this.clickedSame = this.selected === cell; });
            input.addEventListener('click', () => { if (this.clickedSame) this.toggleDir(cell); });
            input.addEventListener('input', () => this.onInput(cell, input));
            input.addEventListener('keydown', (e) => this.onKey(e, cell));
            el.appendChild(input);
            cell.el = el; cell.input = input;
            this.grid.appendChild(el);
        }
    }

    renderClues() {
        const mk = (dir, ul) => {
            ul.innerHTML = '';
            this.words.filter(w => w.dir === dir).sort((a, b) => a.num - b.num).forEach(w => {
                const li = document.createElement('li');
                li.innerHTML = `<button type="button"><b>${w.num}</b> ${w.clue} <small>(${w.word.length})</small></button>`;
                li.querySelector('button').addEventListener('click', () => { this.dir = w.dir; this.select(w.row, w.col, w.dir, true); });
                w.li = li;
                ul.appendChild(li);
            });
        };
        mk('across', this.acrossList);
        mk('down', this.downList);
    }

    wordAt(cell, dir) {
        const wi = cell.words[dir];
        return wi === undefined ? null : this.words[wi];
    }

    onFocus(cell) {
        this.selected = cell;
        if (!this.wordAt(cell, this.dir)) this.dir = this.dir === 'across' ? 'down' : 'across';
        this.highlight();
    }

    toggleDir(cell) {
        const other = this.dir === 'across' ? 'down' : 'across';
        if (this.wordAt(cell, other)) { this.dir = other; this.highlight(); }
    }

    select(r, c, dir, focus = true) {
        const cell = this.cellMap[r + ',' + c];
        if (!cell) return;
        this.selected = cell;
        this.dir = dir;
        this.highlight();
        if (focus) cell.input.focus({ preventScroll: true });
    }

    highlight() {
        Object.values(this.cellMap).forEach(c => c.el.classList.remove('active-word', 'active'));
        const w = this.selected && this.wordAt(this.selected, this.dir);
        this.words.forEach(x => x.li && x.li.classList.toggle('current', x === w));
        if (!w) return;
        w.cells.forEach(c => c.el.classList.add('active-word'));
        this.selected.el.classList.add('active');
        this.activeClue.innerHTML = `<b>${w.num} ${w.dir === 'across' ? 'Horizontal' : 'Vertical'}</b> ${w.clue} <small>(${w.word.length} letras)</small>`;
    }

    step(cell, delta) {
        const w = this.wordAt(cell, this.dir);
        if (!w) return;
        const i = w.cells.indexOf(cell) + delta;
        if (i >= 0 && i < w.cells.length) w.cells[i].input.focus();
    }

    onInput(cell, input) {
        if (this.over) { input.value = cell.input.value; return; }
        const v = input.value.toUpperCase().replace(/[^A-ZÇ]/g, '');
        input.value = v.slice(-1);
        cell.el.classList.remove('wrong', 'right');
        if (input.value) this.step(cell, 1);
        this.checkWords(false);
    }

    onKey(e, cell) {
        const k = e.key;
        const move = { ArrowRight: [0, 1, 'across'], ArrowLeft: [0, -1, 'across'], ArrowDown: [1, 0, 'down'], ArrowUp: [-1, 0, 'down'] }[k];
        if (move) {
            e.preventDefault();
            const t = this.cellMap[(cell.r + move[0]) + ',' + (cell.c + move[1])];
            if (t) { this.dir = move[2]; t.input.focus(); this.dir = move[2]; this.highlight(); }
        } else if (k === 'Backspace' && !cell.input.value) {
            e.preventDefault();
            this.step(cell, -1);
        } else if (k === ' ' || k === 'Tab' && false) {
            e.preventDefault();
            this.toggleDir(cell);
        }
    }

    checkWords(markWrong) {
        let found = 0;
        this.words.forEach(w => {
            const ok = w.cells.every(c => c.input.value === c.letter);
            if (ok && !w.done) { w.done = true; this.score += 10 * w.word.length; }
            if (!ok && w.done) { w.done = false; this.score -= 10 * w.word.length; }
            if (w.li) w.li.classList.toggle('solved', w.done);
            if (w.done) { found++; w.cells.forEach(c => { c.el.classList.add('right'); c.el.classList.remove('wrong'); }); }
        });
        if (markWrong) {
            Object.values(this.cellMap).forEach(c => {
                const v = c.input.value;
                c.el.classList.toggle('wrong', !!v && v !== c.letter);
            });
        }
        this.found = found;
        this.updateHud();
        if (found === this.words.length && !this.over) this.endGame(true);
    }

    checkAnswers() {
        this.checkWords(true);
        const wrong = Object.values(this.cellMap).filter(c => c.input.value && c.input.value !== c.letter).length;
        const empty = Object.values(this.cellMap).filter(c => !c.input.value).length;
        if (!this.over) this.activeClue.innerHTML = wrong ? `<b>${wrong}</b> letra(s) incorreta(s) marcada(s) em vermelho.` : (empty ? `Tudo certo até aqui. Faltam <b>${empty}</b> casas.` : '');
    }

    giveHint() {
        if (this.over) return;
        const w = (this.selected && this.wordAt(this.selected, this.dir)) || this.words.find(x => !x.done);
        const target = w && (w.cells.find(c => c.input.value !== c.letter));
        if (!target) return;
        target.input.value = target.letter;
        target.el.classList.add('hinted');
        this.score = Math.max(0, this.score - 5);
        target.input.focus();
        this.checkWords(false);
    }

    revealSolution() {
        if (this.over) return;
        Object.values(this.cellMap).forEach(c => { c.input.value = c.letter; c.el.classList.add('revealed'); c.el.classList.remove('wrong'); });
        this.words.forEach(w => { w.done = true; w.li && w.li.classList.add('solved'); });
        this.endGame(false);
    }

    endGame(won) {
        this.over = true;
        clearInterval(this.timer);
        Object.values(this.cellMap).forEach(c => { c.input.readOnly = true; });
        [this.checkBtn, this.revealBtn, this.hintBtn].forEach(b => { b.disabled = true; });
        if (won) {
            const bonus = Math.max(0, 300 - this.seconds);
            this.score += bonus;
            this.updateHud();
            this.overlayTitle.textContent = 'Parabéns!';
            this.finalMessage.textContent = `Cruzadinha completa em ${this.fmt(this.seconds)}. Pontuação final: ${this.score} (bônus de tempo: ${bonus}).`;
        } else {
            this.overlayTitle.textContent = 'Solução revelada';
            this.finalMessage.textContent = 'Veja as respostas na grade. Que tal tentar outra cruzadinha?';
        }
        setTimeout(() => this.overlay.classList.remove('hidden'), won ? 500 : 0);
    }

    fmt(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }

    updateHud() {
        this.timerDisplay.textContent = `Tempo: ${this.fmt(this.seconds)}`;
        this.scoreDisplay.textContent = `Pontuação: ${this.score}`;
        this.wordsFoundDisplay.textContent = `Palavras: ${this.words.filter(w => w.done).length}/${this.words.length}`;
    }
}

document.addEventListener('DOMContentLoaded', () => { window.crossword = new CrosswordGame(); });
