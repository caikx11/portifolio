class CrosswordGame {
    constructor() {
        this.container = document.querySelector('.container');
        this.difficultySelect = document.getElementById('difficulty');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.checkBtn = document.getElementById('check-btn');
        this.revealBtn = document.getElementById('reveal-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.timerDisplay = document.getElementById('timer');
        this.scoreDisplay = document.getElementById('score');
        this.wordsFoundDisplay = document.getElementById('words-found');
        this.crosswordGrid = document.getElementById('crossword-grid');
        this.acrossCluesList = document.getElementById('across-clues');
        this.downCluesList = document.getElementById('down-clues');
        this.gameOverlay = document.getElementById('game-overlay');
        this.gameOverMessage = document.getElementById('final-message');
        this.playAgainBtn = document.getElementById('play-again-btn');

        // Game state
        this.currentDifficulty = 'médio';
        this.gridSize = 10; // 10x10 grid
        this.cells = [];
        this.solution = [];
        this.playerAnswers = [];
        this.clues = { across: [], down: [] };
        this.selectedCell = null;
        this.selectedDirection = 'across'; // or 'down'
        this.timer = null;
        this.secondsElapsed = 0;
        this.score = 0;
        this.wordsFound = 0;
        this.totalWords = 0;

        // Word lists by difficulty
        this.wordLists = {
            fácil: [
                { word: "CASA", clue: "Lugar onde se vive", orientation: "horizontal", row: 0, col: 0 },
                { word: "GATO", clue: "Animal felino doméstico", orientation: "vertical", row: 0, col: 2 },
                { word: "SOL", clue: "Estrela que ilumina a Terra", orientation: "horizontal", row: 2, col: 0 },
                { word: "LUZ", clue: "O que permite enxergar no escuro", orientation: "vertical", row: 2, col: 2 },
                { word: "AMOR", clue: "Sentimento de afeto profundo", orientation: "horizontal", row: 4, col: 0 }
            ],
            médio: [
                { word: "PROGRAMAR", clue: "Escrever instruções para computadores", orientation: "horizontal", row: 0, col: 0 },
                { word: "ALGORITMO", clue: "Sequência de passos para resolver um problema", orientation: "vertical", row: 0, col: 0 },
                { word: "DADOS", clue: "Informações coletadas para análise", orientation: "horizontal", row: 2, col: 2 },
                { word: "REDE", clue: "Conjunto de dispositivos conectados", orientation: "vertical", row: 2, col: 4 },
                { word: "INTERNET", clue: "Rede global de computadores", orientation: "horizontal", row: 4, col: 0 },
                { word: "TECNOLOGIA", clue: "Aplicação prática do conhecimento científico", orientation: "vertical", row: 4, col: 7 },
                { word: "ROBÔ", clue: "Máquina capaz de executar tarefas automaticamente", orientation: "horizontal", row: 6, col: 2 },
                { word: "INOVAÇÃO", clue: "Introdução de algo novo ou melhorado", orientation: "vertical", row: 6, col: 4 }
            ],
            difícil: [
                { word: "ARQUITETURA", clue: "Arte e técnica de projetar e edificar construções", orientation: "horizontal", row: 0, col: 0 },
                { word: "ENGENHARIA", clue: "Aplicação de princípios científicos ao projeto e construção", orientation: "vertical", row: 0, col: 0 },
                { word: "MATEMÁTICA", clue: "Ciência que estuda as propriedades dos números e das figuras", orientation: "horizontal", row: 3, col: 0 },
                { word: "FÍSICA", clue: "Ciência da natureza que estuda os fenômenos do mundo material", orientation: "vertical", row: 3, col: 6 },
                { word: "QUÍMICA", clue: "Ciência que estuda a composição, estrutura e propriedades da matéria", orientation: "horizontal", row: 6, col: 0 },
                { word: "BIOLOGIA", clue: "Ciência que estora os seres vivos e suas interações", orientation: "vertical", row: 6, col: 2 },
                { word: "ASTRONOMIA", clue: "Estudo dos corpos celestes e do universo como um todo", orientation: "horizontal", row: 9, col: 0 }
            ]
        };

        this.init();
    }

    init() {
        // Event listeners
        this.difficultySelect.addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.startNewGame();
        });

        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.checkBtn.addEventListener('click', () => this.checkAnswers());
        this.revealBtn.addEventListener('click', () => this.revealSolution());
        this.hintBtn.addEventListener('click', () => this.giveHint());
        this.playAgainBtn.addEventListener('click', () => {
            this.gameOverlay.classList.remove('visible');
            this.startNewGame();
        });

        // Start first game
        this.startNewGame();
    }

    startNewGame() {
        // Reset game state
        this.resetGame();

        // Generate crossword based on difficulty
        this.generateCrossword();

        // Initialize grid
        this.initGrid();

        // Start timer
        this.startTimer();

        // Enable buttons
        this.checkBtn.disabled = false;
        this.revealBtn.disabled = false;
        this.hintBtn.disabled = false;
    }

    resetGame() {
        // Clear timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.secondsElapsed = 0;
        this.timerDisplay.textContent = 'Tempo: 00:00';

        // Reset score
        this.score = 0;
        this.scoreDisplay.textContent = 'Pontuação: 0';

        // Reset words found
        this.wordsFound = 0;
        this.totalWords = 0;
        this.wordsFoundDisplay.textContent = 'Palavras encontradas: 0/0';

        // Clear grids and clues
        this.crosswordGrid.innerHTML = '';
        this.acrossCluesList.innerHTML = '';
        this.downCluesList.innerHTML = '';

        // Reset arrays
        this.cells = [];
        this.solution = [];
        this.playerAnswers = [];
        this.clues = { across: [], down: [] };
        this.selectedCell = null;
        this.selectedDirection = 'across';

        // Hide game overlay
        this.gameOverlay.classList.remove('visible');
    }

    generateCrossword() {
        const wordList = this.wordLists[this.currentDifficulty];

        // For simplicity, we'll place words in a predefined pattern
        // In a real implementation, this would use a crossword generation algorithm

        // Initialize empty solution grid
        this.solution = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(''));

        // Place words from the list
        wordList.forEach(wordObj => {
            const { word, clue, orientation, row, col } = wordObj;

            if (orientation === 'horizontal') {
                // Place word horizontally
                for (let i = 0; i < word.length; i++) {
                    if (col + i < this.gridSize) {
                        this.solution[row][col + i] = word[i].toUpperCase();
                    }
                }

                // Add clue
                this.clues.across.push({
                    number: this.clues.across.length + 1,
                    clue: clue,
                    answer: word.toUpperCase(),
                    row: row,
                    col: col,
                    length: word.length
                });
            } else {
                // Place word vertically
                for (let i = 0; i < word.length; i++) {
                    if (row + i < this.gridSize) {
                        this.solution[row + i][col] = word[i].toUpperCase();
                    }
                }

                // Add clue
                this.clues.down.push({
                    number: this.clues.down.length + 1,
                    clue: clue,
                    answer: word.toUpperCase(),
                    row: row,
                    col: col,
                    length: word.length
                });
            }
        });

        // Fill remaining empty spaces with random letters or leave empty
        // For simplicity, we'll leave them empty (black squares in traditional crosswords)
        // But for our implementation, we'll allow any letter in empty spaces
        this.totalWords = this.clues.across.length + this.clues.down.length;
    }

    initGrid() {
        // Initialize player answers grid (empty)
        this.playerAnswers = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(''));

        // Create grid cells
        this.crosswordGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 40px)`;
        this.crosswordGrid.style.gridTemplateRows = `repeat(${this.gridSize}, 40px)`;

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'cell';
                cellDiv.dataset.row = row;
                cellDiv.dataset.col = col;

                // Add clue number if this cell starts a word
                const acrossClue = this.clues.across.find(c => c.row === row && c.col === col);
                const downClue = this.clues.down.find(c => c.row === row && c.col === col);

                if (acrossClue || downClue) {
                    cellDiv.classList.add('clue-number');
                    let clueNum = '';
                    if (acrossClue && downClue) {
                        // Both across and down start here - use the smaller number
                        clueNum = Math.min(acrossClue.number, downClue.number).toString();
                    } else if (acrossClue) {
                        clueNum = acrossClue.number.toString();
                    } else if (downClue) {
                        clueNum = downClue.number.toString();
                    }
                    cellDiv.dataset.clueNumber = clueNum;
                }

                // Make cell clickable if it's part of the solution
                if (this.solution[row][col] !== '') {
                    cellDiv.addEventListener('click', () => this.selectCell(row, col));

                    // Add input for letter
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.addEventListener('input', (e) => {
                        const value = e.target.value.toUpperCase();
                        // Only allow letters
                        if (/[A-ZÁÉÍÓÚÇ]/.test(value)) {
                            this.playerAnswers[row][col] = value;
                            cellDiv.querySelector('input').value = value;
                            this.checkWordCompletion(row, col);
                        } else {
                            e.target.value = '';
                        }
                    });
                    input.addEventListener('keydown', (e) => {
                        // Handle arrow keys for navigation
                        if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            this.moveSelection(0, 1);
                        } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            this.moveSelection(0, -1);
                        } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            this.moveSelection(1, 0);
                        } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            this.moveSelection(-1, 0);
                        } else if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.toggleDirection();
                        }
                    });
                    cellDiv.appendChild(input);
                } else {
                    // Empty cell (black square in traditional crossword)
                    cellDiv.style.backgroundColor = '#2c3e50';
                }

                this.crosswordGrid.appendChild(cellDiv);
                this.cells.push(cellDiv);
            }
        }

        // Render clues
        this.renderClues();

        // Select first cell by default
        this.selectFirstCell();
    }

    selectFirstCell() {
        // Find first cell that's part of the solution
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.solution[row][col] !== '') {
                    this.selectCell(row, col);
                    return;
                }
            }
        }
    }

    selectCell(row, col) {
        // Deselect previous cell
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }

        // Select new cell
        const index = row * this.gridSize + col;
        this.selectedCell = this.cells[index];
        this.selectedCell.classList.add('selected');

        // Determine direction based on which word(s) this cell belongs to
        const acrossClue = this.clues.across.find(c =>
            c.row === row && c.col <= col && c.col + c.length > col);
        const downClue = this.clues.down.find(c =>
            c.col === col && c.row <= row && c.row + c.length > row);

        if (acrossClue && downClue) {
            // Both across and down - keep current direction or default to across
            if (!this.selectedDirection) {
                this.selectedDirection = 'across';
            }
        } else if (acrossClue) {
            this.selectedDirection = 'across';
        } else if (downClue) {
            this.selectedDirection = 'down';
        }

        // Update cell input focus
        const input = this.selectedCell.querySelector('input');
        if (input) {
            input.focus();
        }
    }

    moveSelection(deltaRow, deltaCol) {
        if (!this.selectedCell) return;

        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);

        let newRow = row + deltaRow;
        let newCol = col + deltaCol;

        // Wrap around grid
        if (newRow < 0) newRow = this.gridSize - 1;
        if (newRow >= this.gridSize) newRow = 0;
        if (newCol < 0) newCol = this.gridSize - 1;
        if (newCol >= this.gridSize) newCol = 0;

        // Only move to cells that are part of the solution
        let attempts = 0;
        const maxAttempts = this.gridSize * this.gridSize;
        while (this.solution[newRow][newCol] === '' && attempts < maxAttempts) {
            newCol += deltaCol;
            if (newCol < 0) newCol = this.gridSize - 1;
            if (newCol >= this.gridSize) newCol = 0;

            if (deltaCol === 0) { // Moving vertically
                newRow += deltaRow;
                if (newRow < 0) newRow = this.gridSize - 1;
                if (newRow >= this.gridSize) newRow = 0;
            }

            attempts++;
        }

        if (attempts < maxAttempts) {
            this.selectCell(newRow, newCol);
        }
    }

    toggleDirection() {
        if (!this.selectedCell) return;

        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);

        const acrossClue = this.clues.across.find(c =>
            c.row === row && c.col <= col && c.col + c.length > col);
        const downClue = this.clues.down.find(c =>
            c.col === col && c.row <= row && c.row + c.length > row);

        if (acrossClue && downClue) {
            // Can toggle between across and down
            this.selectedDirection = this.selectedDirection === 'across' ? 'down' : 'across';
        } else if (acrossClue) {
            this.selectedDirection = 'across';
        } else if (downClue) {
            this.selectedDirection = 'down';
        }

        // Visual feedback could be added here
    }

    renderClues() {
        // Render across clues
        this.acrossCluesList.innerHTML = '';
        this.clues.across.forEach(clue => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="clue-number-display">${clue.number}</span>
                <span class="clue-text">${clue.clue}</span>
                <span class="clue-status unsolved" data-clue-id="across-${clue.number}"></span>
            `;
            this.acrossCluesList.appendChild(li);
        });

        // Render down clues
        this.downCluesList.innerHTML = '';
        this.clues.down.forEach(clue => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="clue-number-display">${clue.number}</span>
                <span class="clue-text">${clue.clue}</span>
                <span class="clue-status unsolved" data-clue-id="down-${clue.number}"></span>
            `;
            this.downCluesList.appendChild(li);
        });
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.secondsElapsed++;
            const minutes = Math.floor(this.secondsElapsed / 60);
            const seconds = this.secondsElapsed % 60;
            this.timerDisplay.textContent = `Tempo: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    checkWordCompletion(row, col) {
        // Check if the across word is complete
        const acrossClue = this.clues.across.find(c =>
            c.row === row && c.col <= col && c.col + c.length > col);
        if (acrossClue) {
            let isComplete = true;
            for (let i = 0; i < acrossClue.length; i++) {
                const checkRow = acrossClue.row;
                const checkCol = acrossClue.col + i;
                if (this.playerAnswers[checkRow][checkCol] !== this.solution[checkRow][checkCol]) {
                    isComplete = false;
                    break;
                }
            }

            if (isComplete) {
                this.markClueAsComplete('across', acrossClue.number);
                this.updateScore(10); // Points for completing a word
                this.wordsFound++;
                this.wordsFoundDisplay.textContent = `Palavras encontradas: ${this.wordsFound}/${this.totalWords}`;

                // Check if game is complete
                if (this.wordsFound === this.totalWords) {
                    this.endGame();
                }
            }
        }

        // Check if the down word is complete
        const downClue = this.clues.down.find(c =>
            c.col === col && c.row <= row && c.row + c.length > row);
        if (downClue) {
            let isComplete = true;
            for (let i = 0; i < downClue.length; i++) {
                const checkRow = downClue.row + i;
                const checkCol = downClue.col;
                if (this.playerAnswers[checkRow][checkCol] !== this.solution[checkRow][checkCol]) {
                    isComplete = false;
                    break;
                }
            }

            if (isComplete) {
                this.markClueAsComplete('down', downClue.number);
                this.updateScore(10); // Points for completing a word
                this.wordsFound++;
                this.wordsFoundDisplay.textContent = `Palavras encontradas: ${this.wordsFound}/${this.totalWords}`;

                // Check if game is complete
                if (this.wordsFound === this.totalWords) {
                    this.endGame();
                }
            }
        }
    }

    markClueAsComplete(direction, number) {
        const statusSpan = document.querySelector(`.clue-status[data-clue-id="${direction}-${number}"]`);
        if (statusSpan) {
            statusSpan.classList.remove('unsolved');
            statusSpan.classList.add('correct');
        }
    }

    updateScore(points) {
        this.score += points;
        this.scoreDisplay.textContent = `Pontuação: ${this.score}`;
    }

    checkAnswers() {
        let correct = true;

        // Check all cells
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.solution[row][col] !== '') {
                    if (this.playerAnswers[row][col] !== this.solution[row][col]) {
                        correct = false;
                        // Highlight incorrect cell
                        const index = row * this.gridSize + col;
                        this.cells[index].style.backgroundColor = '#f8d7da';
                        setTimeout(() => {
                            this.cells[index].style.backgroundColor = '';
                        }, 1000);
                    }
                }
            }
        }

        if (correct) {
            // All correct - mark all clues as complete
            this.clues.across.forEach(clue => {
                this.markClueAsComplete('across', clue.number);
            });
            this.clues.down.forEach(clue => {
                this.markClueAsComplete('down', clue.number);
            });

            this.updateScore(50); // Bonus for completing entire puzzle
            this.endGame();
        } else {
            alert('Algumas respostas estão incorretas. Verifique as células destacadas em vermelho.');
        }
    }

    revealSolution() {
        // Fill in the solution
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.solution[row][col] !== '' && this.playerAnswers[row][col] === '') {
                    this.playerAnswers[row][col] = this.solution[row][col];
                    const index = row * this.gridSize + col;
                    const input = this.cells[index].querySelector('input');
                    if (input) {
                        input.value = this.solution[row][col];
                    }
                    // Highlight revealed cells
                    this.cells[index].style.backgroundColor = '#d4edda';
                    setTimeout(() => {
                        this.cells[index].style.backgroundColor = '';
                    }, 1500);
                }
            }
        }

        // Mark all clues as complete
        this.clues.across.forEach(clue => {
            this.markClueAsComplete('across', clue.number);
        });
        this.clues.down.forEach(clue => {
            this.markClueAsComplete('down', clue.number);
        });

        this.wordsFound = this.totalWords;
        this.wordsFoundDisplay.textContent = `Palavras encontradas: ${this.wordsFound}/${this.totalWords}`;

        // Small penalty for using reveal
        if (this.score > 10) {
            this.score -= 10;
            this.scoreDisplay.textContent = `Pontuação: ${this.score}`;
        }
    }

    giveHint() {
        if (!this.selectedCell) return;

        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);

        // Give hint for the current direction
        let hintWord = '';
        let hintRow = row;
        let hintCol = col;

        if (this.selectedDirection === 'across') {
            const acrossClue = this.clues.across.find(c =>
                c.row === row && c.col <= col && c.col + c.length > col);
            if (acrossClue) {
                // Find first empty letter in the word
                for (let i = 0; i < acrossClue.length; i++) {
                    const checkRow = acrossClue.row;
                    const checkCol = acrossClue.col + i;
                    if (this.playerAnswers[checkRow][checkCol] === '') {
                        hintWord = this.solution[checkRow][checkCol];
                        hintRow = checkRow;
                        hintCol = checkCol;
                        break;
                    }
                }
            }
        } else {
            const downClue = this.clues.down.find(c =>
                c.col === col && c.row <= row && c.row + c.length > row);
            if (downClue) {
                // Find first empty letter in the word
                for (let i = 0; i < downClue.length; i++) {
                    const checkRow = downClue.row + i;
                    const checkCol = downClue.col;
                    if (this.playerAnswers[checkRow][checkCol] === '') {
                        hintWord = this.solution[checkRow][checkCol];
                        hintRow = checkRow;
                        hintCol = checkCol;
                        break;
                    }
                }
            }
        }

        if (hintWord) {
            // Fill in the hint
            this.playerAnswers[hintRow][hintCol] = hintWord;
            const index = hintRow * this.gridSize + hintCol;
            const input = this.cells[index].querySelector('input');
            if (input) {
                input.value = hintWord;
            }

            // Visual feedback
            this.cells[index].style.backgroundColor = '#fff3cd';
            setTimeout(() => {
                this.cells[index].style.backgroundColor = '';
            }, 1000);

            // Small penalty for using hint
            if (this.score > 5) {
                this.score -= 5;
                this.scoreDisplay.textContent = `Pontuação: ${this.score}`;
            }

            // Check if this completes a word
            this.checkWordCompletion(hintRow, hintCol);
        } else {
            alert('Não há mais dicas disponíveis para esta direção.');
        }
    }

    endGame() {
        // Stop timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Disable action buttons
        this.checkBtn.disabled = true;
        this.revealBtn.disabled = true;
        this.hintBtn.disabled = true;

        // Show game over overlay
        const minutes = Math.floor(this.secondsElapsed / 60);
        const seconds = this.secondsElapsed % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        this.gameOverMessage.textContent = `Você completou o cruzadinha em ${timeString} com ${this.score} pontos!`;
        this.gameOverlay.classList.add('visible');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.crosswordGame = new CrosswordGame();
});