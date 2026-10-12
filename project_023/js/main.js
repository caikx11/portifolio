// Plataforma de Quiz Avançada
class QuizPlatform {
    constructor() {
        this.quizzes = [];
        this.currentQuiz = null;
        this.init();
    }

    init() {
        this.loadSampleQuizzes();
        this.setupEventListeners();
        this.renderQuizzesGrid();
    }

    loadSampleQuizzes() {
        // Carregar quizzes de amostra ou do localStorage
        const storedQuizzes = localStorage.getItem('custom-quizzes');
        if (storedQuizzes) {
            this.quizzes = JSON.parse(storedQuizzes);
        } else {
            this.quizzes = [
                {
                    id: 1,
                    title: "Quiz de História do Brasil",
                    description: "Teste seus conhecimentos sobre o período imperial e republicano do Brasil.",
                    category: "history",
                    questions: [
                        {
                            text: "Quem proclamou a independência do Brasil?",
                            options: ["Dom Pedro I", "Dom Pedro II", "Marechal Deodoro da Fonseca", "Tiradentes"],
                            correct: 0
                        },
                        {
                            text: "Em que ano foi assinada a Lei Áurea?",
                            options: ["1822", "1888", "1889", "1930"],
                            correct: 1
                        }
                    ]
                },
                {
                    id: 2,
                    title: "Desafio de JavaScript",
                    description: "Demonstre seu domínio em conceitos básicos e avançados da linguagem.",
                    category: "technology",
                    questions: [
                        {
                            text: "Qual palavra-chave é usada para declarar uma constante em ES6?",
                            options: ["var", "let", "const", "def"],
                            correct: 2
                        },
                        {
                            text: "Qual é o resultado de typeof []?",
                            options: ["array", "object", "null", "undefined"],
                            correct: 1
                        }
                    ]
                }
            ];
            localStorage.setItem('custom-quizzes', JSON.stringify(this.quizzes));
        }
    }

    setupEventListeners() {
        // Seletores de abas
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = tab.dataset.tab;
                this.switchTab(targetTab, tab);
            });
        });

        // Adicionar nova pergunta na criação
        const btnAddQuestion = document.querySelector('.btn-add-question');
        if (btnAddQuestion) {
            btnAddQuestion.addEventListener('click', () => {
                this.addNewQuestion();
            });
        }

        // Salvar quiz
        const saveQuizBtn = document.getElementById('save-quiz-btn');
        if (saveQuizBtn) {
            saveQuizBtn.addEventListener('click', () => {
                this.saveCustomQuiz();
            });
        }
    }

    switchTab(tabId, tabBtn) {
        // Remover active de todas as abas e botões
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        // Adicionar active na aba e botão selecionados
        if (tabBtn) {
            tabBtn.classList.add('active');
        }
        const tabElement = document.getElementById(`${tabId}-tab`);
        if (tabElement) {
            tabElement.classList.add('active');
        }

        // Atualizar visualizações
        if (tabId === 'library') {
            this.renderQuizzesGrid();
        } else if (tabId === 'play') {
            this.renderQuizSelector();
        }
    }

    addNewQuestion() {
        const questionsList = document.getElementById('questions-list');
        const nextIndex = questionsList.children.length;

        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.dataset.index = nextIndex;

        questionItem.innerHTML = `
            <div class="question-header">
                <h4>Pergunta ${nextIndex + 1}</h4>
                <button class="btn-remove-question" onclick="this.closest('.question-item').remove()">×</button>
            </div>

            <div class="form-group">
                <label for="question-text-${nextIndex}">Texto da pergunta:</label>
                <input type="text" id="question-text-${nextIndex}" placeholder="Digite a pergunta aqui">
            </div>

            <div class="options-container">
                <h5>Opções de resposta:</h5>
                <div class="option-item">
                    <input type="text" id="option-${nextIndex}-0" placeholder="Opção A">
                    <input type="radio" name="correct-answer-${nextIndex}" value="0" checked>
                    <label>Resposta correta</label>
                </div>
                <div class="option-item">
                    <input type="text" id="option-${nextIndex}-1" placeholder="Opção B">
                    <input type="radio" name="correct-answer-${nextIndex}" value="1">
                    <label>Resposta correta</label>
                </div>
                <div class="option-item">
                    <input type="text" id="option-${nextIndex}-2" placeholder="Opção C">
                    <input type="radio" name="correct-answer-${nextIndex}" value="2">
                    <label>Resposta correta</label>
                </div>
                <div class="option-item">
                    <input type="text" id="option-${nextIndex}-3" placeholder="Opção D">
                    <input type="radio" name="correct-answer-${nextIndex}" value="3">
                    <label>Resposta correta</label>
                </div>
            </div>
        `;

        questionsList.appendChild(questionItem);
    }

    saveCustomQuiz() {
        const title = document.getElementById('quiz-title').value.trim();
        const description = document.getElementById('quiz-description').value.trim();
        const category = document.getElementById('quiz-category').value;

        if (!title || !category) {
            alert('Por favor, preencha o título e selecione uma categoria.');
            return;
        }

        const questionsList = document.getElementById('questions-list');
        const questionItems = questionsList.querySelectorAll('.question-item');
        const questions = [];

        for (let i = 0; i < questionItems.length; i++) {
            const item = questionItems[i];
            const text = item.querySelector('input[type="text"]').value.trim();
            if (!text) {
                alert(`Por favor, preencha o texto da pergunta ${i + 1}.`);
                return;
            }

            const options = [];
            const optionInputs = item.querySelectorAll('.options-container input[type="text"]');
            for (let j = 0; j < optionInputs.length; j++) {
                const optText = optionInputs[j].value.trim();
                if (!optText) {
                    alert(`Por favor, preencha todas as opções da pergunta ${i + 1}.`);
                    return;
                }
                options.push(optText);
            }

            const correctRadio = item.querySelector('input[type="radio"]:checked');
            const correctIndex = correctRadio ? parseInt(correctRadio.value) : 0;

            questions.push({
                text,
                options,
                correct: correctIndex
            });
        }

        if (questions.length === 0) {
            alert('Adicione pelo menos uma pergunta para salvar o quiz.');
            return;
        }

        const newQuiz = {
            id: Date.now(),
            title,
            description,
            category,
            questions
        };

        this.quizzes.push(newQuiz);
        localStorage.setItem('custom-quizzes', JSON.stringify(this.quizzes));
        alert('Quiz salvo com sucesso!');

        // Limpar campos
        document.getElementById('quiz-title').value = '';
        document.getElementById('quiz-description').value = '';
        document.getElementById('quiz-category').value = '';
        questionsList.innerHTML = '';
        this.addNewQuestion(); // Adicionar uma pergunta vazia inicial
    }

    renderQuizzesGrid() {
        const grid = document.getElementById('quizzes-grid');
        if (!grid) return;

        grid.innerHTML = '';

        this.quizzes.forEach(quiz => {
            const card = document.createElement('div');
            card.className = 'quiz-card';

            card.innerHTML = `
                <h3>${quiz.title}</h3>
                <p class="quiz-description">${quiz.description}</p>
                <div class="quiz-meta">
                    <span class="quiz-category">${this.getCategoryLabel(quiz.category)}</span>
                    <span class="quiz-count">${quiz.questions.length} perguntas</span>
                </div>
                <button class="btn-play-quiz" data-id="${quiz.id}">Jogar</button>
            `;

            grid.appendChild(card);
        });

        // Configurar botões de jogar no grid da biblioteca
        const playBtns = grid.querySelectorAll('.btn-play-quiz');
        playBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.startQuiz(id);
            });
        });
    }

    renderQuizSelector() {
        const optionsContainer = document.getElementById('quiz-options');
        if (!optionsContainer) return;

        optionsContainer.innerHTML = '';

        this.quizzes.forEach(quiz => {
            const option = document.createElement('div');
            option.className = 'quiz-option';
            option.innerHTML = `
                <h4>${quiz.title}</h4>
                <p>${quiz.description}</p>
                <div class="quiz-meta">
                    <span>${this.getCategoryLabel(quiz.category)}</span>
                    <span>${quiz.questions.length} Perguntas</span>
                </div>
            `;

            option.addEventListener('click', () => {
                this.startQuiz(quiz.id);
            });

            optionsContainer.appendChild(option);
        });
    }

    startQuiz(quizId) {
        this.currentQuiz = this.quizzes.find(q => q.id === quizId);
        if (!this.currentQuiz) return;

        // Alternar para a aba Play se não estiver nela
        const playTabBtn = document.querySelector('.tab-btn[data-tab="play"]');
        if (playTabBtn && !playTabBtn.classList.contains('active')) {
            this.switchTab('play', playTabBtn);
        }

        // Esconder o seletor de quizzes
        const selector = document.querySelector('.quiz-selector');
        if (selector) selector.style.display = 'none';

        // Carregar jogador do quiz
        const player = document.getElementById('quiz-player');
        if (player) {
            player.style.display = 'block';
            this.loadQuizPlayer();
        }
    }

    loadQuizPlayer() {
        const player = document.getElementById('quiz-player');
        if (!player || !this.currentQuiz) return;

        player.innerHTML = `
            <div class="quiz-player-header">
                <h3>${this.currentQuiz.title}</h3>
                <button class="btn-exit-quiz" id="exit-quiz-btn">Sair</button>
            </div>
            <div class="quiz-progress-bar">
                <div class="progress" id="quiz-progress" style="width: 0%"></div>
            </div>
            <div id="quiz-player-content">
                <!-- Conteúdo da pergunta -->
            </div>
        `;

        const exitBtn = document.getElementById('exit-quiz-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                this.exitQuiz();
            });
        }

        this.currentQuestionIndex = 0;
        this.score = 0;
        this.showQuestion();
    }

    showQuestion() {
        const content = document.getElementById('quiz-player-content');
        if (!content || !this.currentQuiz) return;

        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const progress = ((this.currentQuestionIndex) / this.currentQuiz.questions.length) * 100;
        document.getElementById('quiz-progress').style.width = `${progress}%`;

        content.innerHTML = `
            <div class="quiz-question">
                <h4>Pergunta ${this.currentQuestionIndex + 1} de ${this.currentQuiz.questions.length}</h4>
                <p class="question-text">${question.text}</p>
                <div class="quiz-options-list">
                    ${question.options.map((opt, i) => `
                        <button class="btn-quiz-option" data-index="${i}">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;

        const optionButtons = content.querySelectorAll('.btn-quiz-option');
        optionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.checkAnswer(parseInt(e.target.dataset.index), e.target);
            });
        });
    }

    checkAnswer(selectedIndex, button) {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correct;

        // Desabilitar todas as opções para evitar duplo clique
        const optionButtons = document.querySelectorAll('.btn-quiz-option');
        optionButtons.forEach(btn => btn.disabled = true);

        if (isCorrect) {
            button.style.backgroundColor = '#2ecc71';
            button.style.color = 'white';
            this.score++;
        } else {
            button.style.backgroundColor = '#e74c3c';
            button.style.color = 'white';
            // Destacar a correta
            optionButtons[question.correct].style.backgroundColor = '#2ecc71';
            optionButtons[question.correct].style.color = 'white';
        }

        setTimeout(() => {
            this.currentQuestionIndex++;
            if (this.currentQuestionIndex < this.currentQuiz.questions.length) {
                this.showQuestion();
            } else {
                this.showQuizResults();
            }
        }, 1500);
    }

    showQuizResults() {
        const content = document.getElementById('quiz-player-content');
        if (!content || !this.currentQuiz) return;

        document.getElementById('quiz-progress').style.width = '100%';

        const percentage = Math.round((this.score / this.currentQuiz.questions.length) * 100);

        content.innerHTML = `
            <div class="quiz-results">
                <h3>Quiz Concluído!</h3>
                <p class="results-score">Você acertou <strong>${this.score}</strong> de <strong>${this.currentQuiz.questions.length}</strong> perguntas.</p>
                <p class="results-percentage">Desempenho: <strong>${percentage}%</strong></p>
                <button class="btn-restart-quiz" id="restart-quiz-btn">Tentar Novamente</button>
                <button class="btn-back-library" id="back-library-btn">Voltar para a Biblioteca</button>
            </div>
        `;

        document.getElementById('restart-quiz-btn').addEventListener('click', () => {
            this.startQuiz(this.currentQuiz.id);
        });

        document.getElementById('back-library-btn').addEventListener('click', () => {
            this.exitQuiz();
        });
    }

    exitQuiz() {
        this.currentQuiz = null;
        const player = document.getElementById('quiz-player');
        if (player) player.style.display = 'none';

        const selector = document.querySelector('.quiz-selector');
        if (selector) selector.style.display = 'block';

        this.renderQuizSelector();
    }

    getCategoryLabel(category) {
        const labels = {
            history: "História",
            science: "Ciência",
            technology: "Tecnologia",
            culture: "Cultura Geral",
            sports: "Esportes",
            entertainment: "Entretenimento"
        };
        return labels[category] || category;
    }
}

// Inicializar a plataforma de quiz quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new QuizPlatform();
});