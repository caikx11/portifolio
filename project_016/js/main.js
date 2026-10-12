// Game state
let cards = [];
let flippedCards = [];
let matchedCards = [];
let moves = 0;
let timer = null;
let secondsElapsed = 0;
let isFlipping = false;

// Symbols for the cards (using emojis)
const symbols = ['😀', '😎', '😍', '😂', '😭', '😱', '🤖', '👻', '🎃', '🎄', '⚽', '🏀'];
const totalPairs = 8; // Number of pairs to match

// DOM Elements
const gameBoard = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const matchesDisplay = document.getElementById('matches');
const totalPairsDisplay = document.getElementById('total-pairs');
const gameOverlay = document.getElementById('game-overlay');
const finalTimeDisplay = document.getElementById('final-time');
const finalMovesDisplay = document.getElementById('final-moves');
const playAgainBtn = document.getElementById('play-again-btn');

// Initialize the game
function initGame() {
    // Reset game state
    cards = [];
    flippedCards = [];
    matchedCards = [];
    moves = 0;
    secondsElapsed = 0;
    isFlipping = false;

    // Reset displays
    timerDisplay.textContent = '00:00';
    movesDisplay.textContent = '0';
    matchesDisplay.textContent = '0';
    totalPairsDisplay.textContent = totalPairs;

    // Hide overlay
    gameOverlay.classList.add('hidden');

    // Create cards
    createCards();

    // Start timer
    startTimer();

    // Add event listener to play again button
    playAgainBtn.addEventListener('click', restartGame);
}

// Create cards for the game
function createCards() {
    // Clear the board
    gameBoard.innerHTML = '';

    // Select random symbols for the game
    const selectedSymbols = symbols
        .sort(() => 0.5 - Math.random())
        .slice(0, totalPairs);

    // Create pairs for each symbol
    const cardValues = [...selectedSymbols, ...selectedSymbols]
        .sort(() => 0.5 - Math.random());

    // Create card elements
    cardValues.forEach((value, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        cardElement.dataset.value = value;

        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-face front">?</div>
                <div class="card-face back">${value}</div>
            </div>
        `;

        // Add click event listener
        cardElement.addEventListener('click', flipCard);

        gameBoard.appendChild(cardElement);
        cards.push(cardElement);
    });
}

// Flip a card
function flipCard() {
    if (isFlipping) return;
    if (this.classList.contains('flipped') || this.classList.contains('matched')) return;

    // Flip the card
    this.classList.add('flipped');
    flippedCards.push(this);

    // Play flip sound (optional)
    // playFlipSound();

    // Check if we have two flipped cards
    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;

        // Check for match
        const [firstCard, secondCard] = flippedCards;
        if (firstCard.dataset.value === secondCard.dataset.value) {
            // Match found
            matchedCards.push(firstCard, secondCard);
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');

            // Update matches display
            matchesDisplay.textContent = matchedCards.length / 2;

            // Clear flipped cards
            flippedCards = [];

            // Check if game is won
            if (matchedCards.length === totalPairs * 2) {
                setTimeout(() => {
                    endGame();
                }, 500);
            }
        } else {
            // No match - flip back after delay
            isFlipping = true;
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                flippedCards = [];
                isFlipping = false;
            }, 1000);
        }
    }
}

// Start the timer
function startTimer() {
    // Clear any existing timer
    if (timer) {
        clearInterval(timer);
    }

    // Reset timer display
    secondsElapsed = 0;
    timerDisplay.textContent = '00:00';

    // Start new timer
    timer = setInterval(() => {
        secondsElapsed++;
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        timerDisplay.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// End the game
function endGame() {
    // Stop timer
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    // Show overlay with final stats
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    finalTimeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    finalMovesDisplay.textContent = moves;

    gameOverlay.classList.remove('hidden');
}

// Restart the game
function restartGame() {
    initGame();
}

// Initialize the game when DOM loads
document.addEventListener('DOMContentLoaded', initGame);

// Optional: Add keyboard support for accessibility
document.addEventListener('keydown', (e) => {
    // Space bar to restart game when overlay is visible
    if (e.code === 'Space' && !gameOverlay.classList.contains('hidden')) {
        e.preventDefault();
        restartGame();
    }
});