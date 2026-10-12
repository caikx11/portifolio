// Game state
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameMode = 'pvp'; // pvp or pvc
let difficulty = 'medium'; // easy, medium, hard
let scoreX = 0;
let scoreO = 0;
let gameHistory = [];
let gameActive = true;

// DOM elements
const boardElement = document.getElementById('gameBoard');
const statusElement = document.getElementById('status');
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');
const currentPlayerElement = document.getElementById('currentPlayer');
const gameModeSelect = document.getElementById('gameMode');
const difficultySelect = document.getElementById('difficulty');
const resetBtn = document.getElementById('resetBtn');
const historyBtn = document.getElementById('historyBtn');
const gameOverlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const overlayBtn = document.getElementById('overlayBtn');
const historyPanel = document.getElementById('historyPanel');
const historyContent = document.getElementById('historyContent');
const closeHistoryBtn = document.getElementById('closeHistory');

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
  initializeBoard();
  updateStatus();

  // Event listeners
  gameModeSelect.addEventListener('change', (e) => {
    gameMode = e.target.value;
    resetGame();
  });

  difficultySelect.addEventListener('change', (e) => {
    difficulty = e.target.value;
  });

  resetBtn.addEventListener('click', resetGame);
  historyBtn.addEventListener('click', () => {
    historyPanel.classList.add('active');
    renderHistory();
  });

  overlayBtn.addEventListener('click', () => {
    gameOverlay.classList.remove('active');
    resetGame();
  });

  closeHistoryBtn.addEventListener('click', () => {
    historyPanel.classList.remove('active');
  });

  // Close panels when clicking outside
  gameOverlay.addEventListener('click', (e) => {
    if (e.target === gameOverlay) {
      gameOverlay.classList.remove('active');
    }
  });

  historyPanel.addEventListener('click', (e) => {
    if (e.target === historyPanel) {
      historyPanel.classList.remove('active');
    }
  });
});

// Initialize the game board
function initializeBoard() {
  boardElement.innerHTML = '';
  board.forEach((cell, index) => {
    const cellElement = document.createElement('div');
    cellElement.classList.add('cell');
    cellElement.dataset.index = index;
    cellElement.addEventListener('click', handleCellClick);
    boardElement.appendChild(cellElement);
  });
}

// Handle cell click
function handleCellClick(e) {
  if (!gameActive) return;

  const index = e.target.dataset.index;

  if (board[index] !== '') return;

  // Make the move
  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add(currentPlayer.toLowerCase());

  // Check for win or draw
  if (checkWin()) {
    handleGameEnd(`${currentPlayer} venceu!`);
  } else if (board.every(cell => cell !== '')) {
    handleGameEnd('Empate!');
  } else {
    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();

    // If vs computer and it's computer's turn
    if (gameMode === 'pvc' && currentPlayer === 'O') {
      setTimeout(makeComputerMove, 500);
    }
  }
}

// Make computer move
function makeComputerMove() {
  if (!gameActive) return;

  let moveIndex;

  switch (difficulty) {
    case 'easy':
      moveIndex = getRandomMove();
      break;
    case 'medium':
      moveIndex = getMediumMove();
      break;
    case 'hard':
      moveIndex = getBestMove();
      break;
    default:
      moveIndex = getRandomMove();
  }

  if (moveIndex !== null) {
    board[moveIndex] = currentPlayer;
    const cellElement = boardElement.children[moveIndex];
    cellElement.textContent = currentPlayer;
    cellElement.classList.add(currentPlayer.toLowerCase());

    // Check for win or draw
    if (checkWin()) {
      handleGameEnd(`${currentPlayer} venceu!`);
    } else if (board.every(cell => cell !== '')) {
      handleGameEnd('Empate!');
    } else {
      // Switch player
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      updateStatus();
    }
  }
}

// Get random move (easy difficulty)
function getRandomMove() {
  const emptyCells = board
    .map((cell, index) => cell === '' ? index : null)
    .filter(index => index !== null);

  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Get medium difficulty move (blocks player or takes winning move)
function getMediumMove() {
  // First, check if we can win
  const winMove = findWinningMove('O');
  if (winMove !== null) return winMove;

  // Then, check if we need to block player from winning
  const blockMove = findWinningMove('X');
  if (blockMove !== null) return blockMove;

  // Otherwise, take random move
  return getRandomMove();
}

// Find winning move for a player
function findWinningMove(player) {
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = player;
      if (checkWin()) {
        board[i] = ''; // Reset
        return i;
      }
      board[i] = ''; // Reset
    }
  }
  return null;
}

// Get best move using minimax algorithm (hard difficulty)
function getBestMove() {
  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = '';

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

// Minimax algorithm
function minimax(newBoard, depth, isMaximizing) {
  const result = checkWinner(newBoard);
  if (result !== null) {
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    return 0; // Draw
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === '') {
        newBoard[i] = 'O';
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === '') {
        newBoard[i] = 'X';
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Check for win
function checkWin() {
  return checkWinner() !== null;
}

// Check winner (returns 'X', 'O', or null for draw/no winner)
function checkWinner(boardParam) {
  const currentBoard = boardParam || board;
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
      return currentBoard[a];
    }
  }

  return null;
}

// Handle game end
function handleGameEnd(message) {
  gameActive = false;

  // Update score
  if (message.includes('X venceu')) {
    scoreX++;
  } else if (message.includes('O venceu')) {
    scoreO++;
  }

  // Add to history
  const historyEntry = {
    date: new Date(),
    mode: gameMode === 'pvp' ? 'Dois Jogadores' : 'Contra o Computador',
    difficulty: gameMode === 'pvc' ? difficulty : 'N/A',
    result: message,
    board: [...board]
  };
  gameHistory.push(historyEntry);

  // Update score display
  scoreXElement.textContent = scoreX;
  scoreOElement.textContent = scoreO;

  // Show overlay
  overlayTitle.textContent = 'Fim de Jogo!';
  overlayMessage.textContent = message;
  gameOverlay.classList.add('active');

  // Highlight winning combination
  highlightWinningCombination();
}

// Highlight winning combination
function highlightWinningCombination() {
  const winner = checkWinner();
  if (winner === null) return;

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] === winner && board[b] === winner && board[c] === winner) {
      const cells = [boardElement.children[a], boardElement.children[b], boardElement.children[c]];
      cells.forEach(cell => {
        cell.classList.add('winning-cell');
      });
      break;
    }
  }
}

// Update status display
function updateStatus() {
  statusElement.textContent = `Vez do Jogador: ${currentPlayer}`;
  currentPlayerElement.textContent = currentPlayer;

  // Add visual indicator for current player
  if (currentPlayer === 'X') {
    currentPlayerElement.style.color = '#e74c3c';
  } else {
    currentPlayerElement.style.color = '#3498db';
  }
}

// Reset game
function resetGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;

  // Reset board display
  const cells = boardElement.children;
  for (let i = 0; i < cells.length; i++) {
    cells[i].textContent = '';
    cells[i].className = 'cell';
    cells[i].classList.remove('winning-cell');
  }

  updateStatus();

  // If vs computer and computer goes first
  if (gameMode === 'pvc' && currentPlayer === 'O') {
    setTimeout(makeComputerMove, 500);
  }
}

// Render history
function renderHistory() {
  if (gameHistory.length === 0) {
    historyContent.innerHTML = '<p>Nenhum jogo registrado ainda.</p>';
    return;
  }

  historyContent.innerHTML = gameHistory
    .map((entry, index) => {
      const date = new Date(entry.date);
      const formattedDate = date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      let resultClass = 'history-item';
      if (entry.result.includes('X venceu')) {
        resultClass += ' history-item player-x';
      } else if (entry.result.includes('O venceu')) {
        resultClass += ' history-item player-o';
      } else {
        resultClass += ' history-item draw';
      }

      return `
        <div class="${resultClass}">
          <div class="history-result">${entry.result}</div>
          <div class="history-details">
            <div>${entry.mode}</div>
            ${entry.difficulty !== 'N/A' ? `<div>Dificuldade: ${entry.difficulty}</div>` : ''}
            <div class="history-date">${formattedDate}</div>
          </div>
        </div>
      `;
    })
    .reverse() // Show newest first
    .join('');
}