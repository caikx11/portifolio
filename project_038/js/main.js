// Sistema de Perguntas e Respostas Comunitário
class QACommunity {
    constructor() {
        this.questions = JSON.parse(localStorage.getItem('qa_questions')) || this.getDefaultQuestions();
        this.currentQuestionId = null;
        try { this.myVotes = JSON.parse(localStorage.getItem('qa_my_votes')) || {}; } catch (e) { this.myVotes = {}; }
        this.sortBy = 'newest';
        this.init();
    }

    getDefaultQuestions() {
        return [
            {
                id: 1,
                title: "Como resolver erro 404 no React Router?",
                body: "Estou desenvolvendo uma aplicação React com React Router v6 e estou recebendo erro 404 ao recarregar a página em rotas aninhadas. Alguém sabe como configurar o servidor para lidar com isso?",
                tags: ["react", "react-router", "erro-404", "spa"],
                author: "dev_junior",
                createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                votes: 5,
                answers: [
                    {
                        id: 1,
                        body: "Para SPA (Single Page Application), você precisa configurar seu servidor para servir o index.html para todas as rotas que não sejam arquivos estáticos. No Apache, use .htaccess com FallbackResource. No Nginx, use try_files $uri $uri/ /index.html;",
                        author: "senior_dev",
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                        votes: 12
                    },
                    {
                        id: 2,
                        body: "Se estiver usando Vercel ou Netlify, eles fazem isso automaticamente. Para servidores próprios, configure o redirect para index.html em todas as rotas não encontradas.",
                        author: "frontend_expert",
                        createdAt: new Date(Date.now() - 43200000).toISOString(),
                        votes: 8
                    }
                ]
            },
            {
                id: 2,
                title: "Qual a melhor forma de fazer validação de formulários em React?",
                body: "Estou com dúvida sobre qual biblioteca usar para validação de formulários em React: React Hook Form, Formik, Yup, Zod? Qual a recomendação da comunidade atualmente?",
                tags: ["react", "formulários", "validação", "react-hook-form", "formik"],
                author: "frontend_dev",
                createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
                votes: 12,
                answers: [
                    {
                        id: 3,
                        body: "React Hook Form + Zod é a combinação mais moderna e performática atualmente. RHF tem melhor performance (menos re-renders) e Zod tem tipagem TypeScript excelente. Formik é mais antigo e pesado.",
                        author: "react_enthusiast",
                        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                        votes: 18
                    }
                ]
            },
            {
                id: 3,
                title: "Como implementar autenticação JWT segura em Node.js?",
                body: "Preciso implementar autenticação com JWT em uma API Node.js/Express. Quais as melhores práticas para armazenar o token (localStorage vs httpOnly cookie), refresh tokens e proteção contra CSRF?",
                tags: ["nodejs", "express", "jwt", "autenticação", "segurança"],
                author: "backend_dev",
                createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                votes: 8,
                answers: []
            }
        ];
    }

    init() {
        this.bindEvents();
        this.renderQuestions();
    }

    bindEvents() {
        // Ask question button
        document.getElementById('ask-question-btn').addEventListener('click', () => {
            document.getElementById('question-modal').style.display = 'flex';
        });

        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('question-modal').style.display = 'none';
                document.getElementById('detail-modal').style.display = 'none';
            });
        });

        // Click outside modal to close
        document.getElementById('question-modal').addEventListener('click', (e) => {
            if (e.target.id === 'question-modal') {
                document.getElementById('question-modal').style.display = 'none';
            }
        });

        document.getElementById('detail-modal').addEventListener('click', (e) => {
            if (e.target.id === 'detail-modal') {
                document.getElementById('detail-modal').style.display = 'none';
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') ['question-modal', 'detail-modal'].forEach(id => { document.getElementById(id).style.display = 'none'; });
        });
        document.getElementById('questions-list').addEventListener('click', (e) => {
            const v = e.target.closest('.vote-btn');
            if (v) { e.stopPropagation(); this.vote(v.dataset.target, parseInt(v.dataset.id, 10), v.dataset.vote === 'up' ? 1 : -1); return; }
            const card = e.target.closest('.question-card');
            if (card) this.showQuestionDetail(parseInt(card.dataset.questionId, 10));
        });
        document.getElementById('answers-list').addEventListener('click', (e) => {
            const v = e.target.closest('.vote-btn');
            if (v) this.vote('a', parseInt(v.dataset.id, 10), v.dataset.vote === 'up' ? 1 : -1);
        });

        // Question form submit
        document.getElementById('question-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitQuestion();
        });

        // Sort change
        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderQuestions();
        });

        // Submit answer
        document.getElementById('submit-answer-btn').addEventListener('click', () => {
            this.submitAnswer();
        });
    }

    vote(kind, id, dir) {
        const q = kind === 'q' ? this.questions.find(x => x.id === id)
            : this.questions.find(x => x.id === this.currentQuestionId).answers.find(a => a.id === id);
        if (!q) return;
        const key = kind + id;
        const prev = this.myVotes[key] || 0;
        const next = prev === dir ? 0 : dir;
        q.votes += next - prev;
        if (next) this.myVotes[key] = next; else delete this.myVotes[key];
        localStorage.setItem('qa_my_votes', JSON.stringify(this.myVotes));
        this.saveQuestions();
        this.renderQuestions();
        if (kind === 'a') this.showQuestionDetail(this.currentQuestionId, true);
    }

    submitQuestion() {
        const title = document.getElementById('question-title').value.trim();
        const body = document.getElementById('question-body').value.trim();
        const tagsInput = document.getElementById('question-tags').value.trim();

        if (!title || !body) {
            document.getElementById('question-title').reportValidity();
            return;
        }

        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 6) : [];

        const newQuestion = {
            id: Date.now(),
            title,
            body,
            tags,
            author: 'usuario_atual',
            createdAt: new Date().toISOString(),
            votes: 0,
            answers: []
        };

        this.questions.unshift(newQuestion);
        this.saveQuestions();
        this.renderQuestions();

        // Reset form and close modal
        document.getElementById('question-form').reset();
        document.getElementById('question-modal').style.display = 'none';
    }

    renderQuestions() {
        const container = document.getElementById('questions-list');

        // Sort questions
        const sortedQuestions = [...this.questions].filter(q => this.sortBy !== 'unanswered' || q.answers.length === 0).sort((a, b) => {
            switch (this.sortBy) {
                case 'votes':
                    return b.votes - a.votes;
                case 'unanswered':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'newest':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        if (sortedQuestions.length === 0) {
            container.innerHTML = '<div class="empty-state">Nenhuma pergunta encontrada. Seja o primeiro a perguntar!</div>';
            return;
        }

        container.innerHTML = sortedQuestions.map(question => this.createQuestionCard(question)).join('');


    }

    createQuestionCard(question) {
        const isUnanswered = question.answers.length === 0;
        const createdDate = new Date(question.createdAt).toLocaleDateString('pt-BR');
        const createdTime = new Date(question.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="question-card" data-question-id="${question.id}">
                <div class="question-header">
                    <h3 class="question-title">${this.escapeHtml(question.title)}</h3>
                    <div class="question-meta">
                        <span>@${this.escapeHtml(question.author)}</span>
                        <span>${createdDate} às ${createdTime}</span>
                        <span>${question.answers.length} resposta${question.answers.length === 1 ? '' : 's'}</span>
                    </div>
                </div>
                <div class="question-tags">
                    ${question.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                    ${isUnanswered ? '<span class="tag unanswered">Sem Resposta</span>' : ''}
                </div>
                <p class="question-body">${this.escapeHtml(question.body.substring(0, 150))}${question.body.length > 150 ? '...' : ''}</p>
                <div class="question-footer">
                    <div class="vote-section">
                        <button class="vote-btn ${this.myVotes['q' + question.id] === 1 ? 'voted' : ''}" data-target="q" data-id="${question.id}" data-vote="up" aria-label="Voto positivo">▲</button>
                        <span class="vote-count">${question.votes}</span>
                        <button class="vote-btn ${this.myVotes['q' + question.id] === -1 ? 'voted' : ''}" data-target="q" data-id="${question.id}" data-vote="down" aria-label="Voto negativo">▼</button>
                    </div>
                    <button class="view-answers-btn" data-question-id="${question.id}">
                        Ver Respostas
                    </button>
                </div>
            </div>
        `;
    }

    showQuestionDetail(questionId, keepScroll) {
        const question = this.questions.find(q => q.id === questionId);
        if (!question) return;

        this.currentQuestionId = questionId;

        const detailContainer = document.getElementById('question-detail');
        const answersContainer = document.getElementById('answers-list');
        const answerTextarea = document.getElementById('answer-body');

        // Render question detail
        const createdDate = new Date(question.createdAt).toLocaleDateString('pt-BR');
        const createdTime = new Date(question.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        detailContainer.innerHTML = `
            <div class="question-detail-card">
                <h3 class="question-detail-title">${this.escapeHtml(question.title)}</h3>
                <div class="question-detail-meta">
                    <span>@${this.escapeHtml(question.author)}</span>
                    <span>${createdDate} às ${createdTime}</span>
                    <span>${question.answers.length} resposta${question.answers.length === 1 ? '' : 's'}</span>
                </div>
                <div class="question-detail-tags">
                    ${question.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                </div>
                <div class="question-detail-body">${this.escapeHtml(question.body)}</div>
            </div>
        `;

        // Render answers
        if (question.answers.length === 0) {
            answersContainer.innerHTML = '<div class="empty-state">Nenhuma resposta ainda. Seja o primeiro a responder!</div>';
        } else {
            // Sort answers by votes
            const sortedAnswers = [...question.answers].sort((a, b) => b.votes - a.votes);

            answersContainer.innerHTML = sortedAnswers.map(answer => this.createAnswerCard(answer)).join('');
        }

        if (!keepScroll) answerTextarea.value = '';

        // Show modal
        document.getElementById('detail-modal').style.display = 'flex';
    }

    createAnswerCard(answer) {
        const createdDate = new Date(answer.createdAt).toLocaleDateString('pt-BR');
        const createdTime = new Date(answer.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="answer-card">
                <div class="answer-header">
                    <div class="answer-meta">
                        <span>@${this.escapeHtml(answer.author)}</span>
                        <span>${createdDate} às ${createdTime}</span>
                    </div>
                </div>
                <div class="answer-body">${this.escapeHtml(answer.body)}</div>
                <div class="answer-footer">
                    <div class="vote-section">
                        <button class="vote-btn ${this.myVotes['a' + answer.id] === 1 ? 'voted' : ''}" data-id="${answer.id}" data-vote="up" aria-label="Voto positivo">▲</button>
                        <span class="vote-count">${answer.votes}</span>
                        <button class="vote-btn ${this.myVotes['a' + answer.id] === -1 ? 'voted' : ''}" data-id="${answer.id}" data-vote="down" aria-label="Voto negativo">▼</button>
                    </div>
                </div>
            </div>
        `;
    }

    submitAnswer() {
        if (!this.currentQuestionId) return;

        const body = document.getElementById('answer-body').value.trim();
        if (!body) {
            document.getElementById('answer-body').focus();
            return;
        }

        const question = this.questions.find(q => q.id === this.currentQuestionId);
        if (!question) return;

        const newAnswer = {
            id: Date.now(),
            body,
            author: 'usuario_atual',
            createdAt: new Date().toISOString(),
            votes: 0
        };

        question.answers.push(newAnswer);
        this.saveQuestions();
        this.renderQuestions();

        // Re-render answers
        this.showQuestionDetail(this.currentQuestionId);
    }

    saveQuestions() {
        localStorage.setItem('qa_questions', JSON.stringify(this.questions));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.qaCommunity = new QACommunity();
});