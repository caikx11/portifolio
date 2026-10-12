// Quiz Interativo - JavaScript Principal

class QuizApp {
    constructor() {
        this.currentCategory = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.questions = [];
        this.userAnswers = [];

        this.init();
    }

    init() {
        // Bind events
        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.selectCategory(category);
            });
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.handleNextQuestion();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartQuiz();
        });

        // Initialize with empty state
        this.showCategorySelection();
    }

    selectCategory(category) {
        this.currentCategory = category;
        this.loadQuestions(category);
    }

    async loadQuestions(category) {
        try {
            const response = await fetch(`questions/${category}.json`);
            if (!response.ok) {
                throw new Error('Failed to load questions');
            }
            this.questions = await response.json();
            this.startQuiz();
        } catch (error) {
            console.error('Error loading questions:', error);
            alert('Erro ao carregar as perguntas. Tente novamente.');
            this.showCategorySelection();
        }
    }

    startQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.showQuizArea();
        this.displayQuestion();
    }

    showCategorySelection() {
        document.getElementById('category-selection').style.display = 'block';
        document.getElementById('quiz-area').style.display = 'none';
        document.getElementById('result-area').style.display = 'none';
    }

    showQuizArea() {
        document.getElementById('category-selection').style.display = 'none';
        document.getElementById('quiz-area').style.display = 'block';
        document.getElementById('result-area').style.display = 'none';
    }

    showResultArea() {
        document.getElementById('category-selection').style.display = 'none';
        document.getElementById('quiz-area').style.display = 'none';
        document.getElementById('result-area').style.display = 'block';
        this.displayResult();
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showResultArea();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        document.getElementById('question-counter').textContent =
            `Pergunta ${this.currentQuestionIndex + 1} de ${this.questions.length}`;
        document.getElementById('question-text').textContent = question.question;

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.addEventListener('click', () => {
                this.selectAnswer(button, index);
            });
            optionsContainer.appendChild(button);
        });

        document.getElementById('feedback').style.display = 'none';
        document.getElementById('next-btn').disabled = true;
    }

    selectAnswer(button, index) {
        // Disable all options
        const options = document.querySelectorAll('.option-btn');
        options.forEach(btn => {
            btn.disabled = true;
        });

        // Record answer
        this.userAnswers.push(index);

        // Check if correct
        const correctAnswer = this.questions[this.currentQuestionIndex].correctAnswer;
        const isCorrect = index === correctAnswer;

        if (isCorrect) {
            this.score++;
            button.classList.add('correct');
            this.showFeedback('Correto! ✅', 'correct');
        } else {
            button.classList.add('incorrect');
            // Show correct answer
            const correctButton = options[correctAnswer];
            correctButton.classList.add('correct');
            this.showFeedback(`Incorreto! ❌ A resposta correta era: "${this.questions[this.currentQuestionIndex].options[correctAnswer]}"`, 'incorrect');
        }

        // Enable next button
        document.getElementById('next-btn').disabled = false;
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
        feedback.style.display = 'block';
    }

    handleNextQuestion() {
        this.currentQuestionIndex++;
        this.displayQuestion();
    }

    displayResult() {
        document.getElementById('final-score').textContent =
            `Você acertou ${this.score} de ${this.questions.length} perguntas!`;

        // Add performance message
        const percentage = (this.score / this.questions.length) * 100;
        let message = '';
        if (percentage >= 80) {
            message = 'Excelente trabalho! 🌟';
        } else if (percentage >= 60) {
            message = 'Bom trabalho! Continue praticando! 👍';
        } else {
            message = 'Precisa melhorar, mas não desista! 💪';
        }

        const scoreElement = document.getElementById('final-score');
        scoreElement.innerHTML += `<br><span>${message}</span>`;
    }

    restartQuiz() {
        this.showCategorySelection();
    }
}

// Initialize the quiz app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});