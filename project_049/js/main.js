// Aplicativo de Controle de Biblioteca
class LibraryApp {
    constructor() {
        this.currentBookId = null;
        this.books = {}; // bookId => { title, author, isbn, genre, etc. }
        this.loans = {}; // bookId => [loan objects]
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderBooksPanel();
        this.loadFromLocalStorage();
        this.renderWelcomeContent();
    }

    setupEventListeners() {
        // Books panel click delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.book-item')) {
                const bookId = e.target.closest('.book-item').dataset.id;
                this.showBookDetails(bookId);
            }
        });

        // Toolbar buttons
        document.getElementById('add-book').addEventListener('click', () => this.showAddBookForm());
        document.getElementById('refresh-books').addEventListener('click', () => this.renderBooksPanel());
        document.getElementById('export-data').addEventListener('click', () => this.exportData());
        document.getElementById('import-data').addEventListener('click', () => this.importData());
        document.getElementById('clear-all').addEventListener('click', () => this.clearAllData());

        // Handle form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id !== 'book-form') return;
            e.preventDefault();
            if (this.validateBookForm(e.target)) {
                this.saveBook(e.target);
                this.hidePropertiesPanel();
            }
        });

        document.addEventListener('submit', (e) => {
            if (e.target.id !== 'loan-form') return;
            e.preventDefault();
            if (this.validateLoanForm(e.target)) {
                this.saveLoan(e.target);
                this.hideLoanPanel();
                this.showBookDetails(this.currentBookId); // Refresh book details
            }
        });

        // Handle first book button in welcome screen
        document.addEventListener('click', (e) => { if (e.target.closest('#add-first-book')) this.showAddBookForm(); });

        // Close panels when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('button, input, select, textarea, label, a, .properties-panel') &&
                !e.target.closest('.loan-panel') &&
                !e.target.closest('.book-item') &&
                !e.target.closest('#add-book') &&
                !e.target.closest('#add-first-book')) {
                this.hidePropertiesPanel();
                this.hideLoanPanel();
            }
        });

        // Handle Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePropertiesPanel();
                this.hideLoanPanel();
            }
        });
    }

    renderBooksPanel() {
        const booksPanel = document.getElementById('books-panel');
        const bookIds = Object.keys(this.books);

        if (bookIds.length === 0) {
            booksPanel.innerHTML = '<p class="empty-msg">Nenhum livro cadastrado</p>';
            return;
        }

        booksPanel.innerHTML = bookIds.map(id => {
            const book = this.books[id];
            const loanCount = this.loans[id] ? this.loans[id].length : 0;
            const isCurrentlyLoaned = this.loans[id] && this.loans[id].some(loan => !loan.returnDate);

            return `
                <div class="book-item" data-id="${id}">
                    <h3>${book.title}</h3>
                    <div class="book-meta">
                        <span>${book.author || 'Autor desconhecido'}</span>
                        <span>${book.genre || 'Gênero não especificado'}</span>
                    </div>
                    <div class="book-status">
                        ${isCurrentlyLoaned ?
                            `<span class="status-loaned">Emprestado</span>` :
                            `<span class="status-available">Disponível</span>`}
                        <span>${loanCount} empréstimo${loanCount !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    showAddBookForm() {
        this.currentBookId = null;
        this.showPropertiesPanel('Adicionar Novo Livro', `
            <div class="field-group">
                <label for="book-title">Título do Livro *</label>
                <input type="text" id="book-title" name="book-title" placeholder="Ex: Dom Casmurro" required>
            </div>

            <div class="field-group">
                <label for="book-author">Autor *</label>
                <input type="text" id="book-author" name="book-author" placeholder="Ex: Machado de Assis" required>
            </div>

            <div class="field-group">
                <label for="book-isbn">ISBN</label>
                <input type="text" id="book-isbn" name="book-isbn" placeholder="Ex: 978-85-0000000-0">
            </div>

            <div class="field-group">
                <label for="book-genre">Gênero</label>
                <input type="text" id="book-genre" name="book-genre" placeholder="Ex: Romance, Ficção, Técnico">
            </div>

            <div class="field-group">
                <label for="book-publisher">Editora</label>
                <input type="text" id="book-publisher" name="book-publisher" placeholder="Nome da editora">
            </div>

            <div class="field-group">
                <label for="book-year">Ano de Publicação</label>
                <input type="number" id="book-year" name="book-year" min="1000" max="${new Date().getFullYear()}" placeholder="Ex: 1899">
            </div>
        `, 'book-form');
    }

    showBookDetails(bookId) {
        this.currentBookId = bookId;
        const book = this.books[bookId];
        const bookLoans = this.loans[bookId] || [];
        const currentLoan = bookLoans.find(loan => !loan.returnDate);

        // Update books panel active state
        document.querySelectorAll('.book-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === bookId);
        });

        this.showLoanPanel('Registrar Empréstimo', `
            <div class="field-group">
                <label for="loan-borrower">Nome do Usuário *</label>
                <input type="text" id="loan-borrower" name="loan-borrower" placeholder="Nome da pessoa que está emprestando o livro" required>
            </div>

            <div class="field-group">
                <label for="loan-date">Data do Empréstimo *</label>
                <input type="date" id="loan-date" name="loan-date" value="${new Date().toISOString().split('T')[0]}" required>
            </div>

            <div class="field-group">
                <label for="loan-return-date">Data prevista para devolução</label>
                <input type="date" id="loan-return-date" name="loan-return-date">
            </div>

            <div class="field-group">
                <label for="loan-notes">Observações</label>
                <textarea id="loan-notes" name="loan-notes" placeholder="Observações sobre o empréstimo"></textarea>
            </div>
        `, 'loan-form');

        // Show book details in main content
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `
            <div class="book-detail">
                <h2>${book.title}</h2>
                <div class="book-info">
                    <div>
                        <h3>Informações Básicas</h3>
                        <p><strong>Título:</strong> ${book.title}</p>
                        <p><strong>Autor:</strong> ${book.author}</p>
                        <p><strong>ISBN:</strong> ${book.isbn || 'Não informado'}</p>
                    </div>
                    <div>
                        <h3>Detalhes</h3>
                        <p><strong>Gênero:</strong> ${book.genre || 'Não especificado'}</p>
                        <p><strong>Editora:</strong> ${book.publisher || 'Não informada'}</p>
                        <p><strong>Ano:</strong> ${book.year || 'Não informado'}</p>
                    </div>
                </div>

                <div class="loan-status">
                    ${currentLoan ?
                        `<div class="status-loaned">
                            <span>📚 Emprestado para</span>
                            <span>${currentLoan.borrower}</span>
                            <span>desde ${new Date(currentLoan.loanDate).toLocaleDateString('pt-BR')}</span>
                        </div>` :
                        `<div class="status-available">
                            <span>📖 Disponível para empréstimo</span>
                        </div>`
                    }
                </div>

                <div class="loans-list">
                    ${bookLoans.length > 0 ?
                        bookLoans.map(loan => `
                            <div class="loan-item">
                                <div class="loan-item-header">
                                    <div class="borrower-info">
                                        <span>${loan.borrower}</span>
                                        <span>${new Date(loan.loanDate).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div class="loan-status">
                                        ${loan.returnDate ?
                                            `<span class="status-returned">Devolvido</span>` :
                                            `<span class="status-active">Em andamento</span>`}
                                    </div>
                                </div>
                                ${loan.returnDate ?
                                    `<p><strong>Data de devolução:</strong> ${new Date(loan.returnDate).toLocaleDateString('pt-BR')}</p>` :
                                    `<p><strong>Data prevista para devolução:</strong> ${loan.returnDate ? new Date(loan.returnDate).toLocaleDateString('pt-BR') : 'Não definida'}</p>`
                                }
                                ${loan.notes ? `<p><strong>Observações:</strong> ${loan.notes}</p>` : ''}
                            </div>
                        `).join('') :
                        `<p class="empty-msg">Nenhum empréstimo registrado para este livro.</p>`
                    }
                </div>
            </div>
        `;
        document.getElementById('loan-panel').classList.remove('active');
        const detailBox = dynamicContent.querySelector('.book-detail');
        if (detailBox) detailBox.insertAdjacentHTML('afterbegin', '<button type="button" class="btn-primary open-side" data-open="loan-panel">Registrar empréstimo</button>');
    }

    hidePropertiesPanel() {
        document.getElementById('properties-panel').classList.remove('active');
    }

    hideLoanPanel() {
        document.getElementById('loan-panel').classList.remove('active');
    }

    showPropertiesPanel(title, content, formId) {
        const propertiesPanel = document.getElementById('properties-panel');
        propertiesPanel.innerHTML = `<h2>${title}</h2><form id="${formId}">${content}</form>`;
        propertiesPanel.classList.add('active');

        // Focus first input
        setTimeout(() => {
            const firstInput = propertiesPanel.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
        }, 0);
    }

    showLoanPanel(title, content, formId) {
        const loanPanel = document.getElementById('loan-panel');
        loanPanel.innerHTML = `<h2>${title}</h2><form id="${formId}">${content}</form>`;
        loanPanel.classList.add('active');

        // Focus first input
        setTimeout(() => {
            const firstInput = loanPanel.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
        }, 0);
    }

    validateBookForm(form) {
        const titleInput = form.querySelector('#book-title');
        const authorInput = form.querySelector('#book-author');

        if (!titleInput || !titleInput.value.trim()) {
            this.showNotification('Por favor, preencha o título do livro', 'error');
            titleInput?.focus();
            return false;
        }

        if (!authorInput || !authorInput.value.trim()) {
            this.showNotification('Por favor, preencha o autor do livro', 'error');
            authorInput?.focus();
            return false;
        }

        return true;
    }

    validateLoanForm(form) {
        const borrowerInput = form.querySelector('#loan-borrower');
        const dateInput = form.querySelector('#loan-date');

        if (!borrowerInput || !borrowerInput.value.trim()) {
            this.showNotification('Por favor, preencha o nome do usuário', 'error');
            borrowerInput?.focus();
            return false;
        }

        if (!dateInput || !dateInput.value) {
            this.showNotification('Por favor, selecione a data do empréstimo', 'error');
            dateInput?.focus();
            return false;
        }

        return true;
    }

    saveBook(form) {
        const formData = new FormData(form);
        const bookId = Date.now().toString(); // Simple ID generation

        this.books[bookId] = {
            title: formData.get('book-title'),
            author: formData.get('book-author'),
            isbn: formData.get('book-isbn'),
            genre: formData.get('book-genre'),
            publisher: formData.get('book-publisher'),
            year: formData.get('book-year'),
            addedAt: new Date().toISOString()
        };

        // Initialize loans array for this book
        if (!this.loans[bookId]) {
            this.loans[bookId] = [];
        }

        this.saveToLocalStorage();
        this.renderBooksPanel();
        this.showNotification('Livro adicionado com sucesso!');

        // Automatically show the new book details
        this.showBookDetails(bookId);
    }

    saveLoan(form) {
        if (!this.currentBookId) {
            this.showNotification('Nenhum livro selecionado', 'error');
            return;
        }

        const formData = new FormData(form);
        const loan = {
            id: Date.now().toString(),
            borrower: formData.get('loan-borrower'),
            loanDate: formData.get('loan-date'),
            returnDate: formData.get('loan-return-date') || null,
            notes: formData.get('loan-notes') || '',
            createdAt: new Date().toISOString()
        };

        if (!this.loans[this.currentBookId]) {
            this.loans[this.currentBookId] = [];
        }

        this.loans[this.currentBookId].push(loan);
        this.saveToLocalStorage();
        this.showNotification('Empréstimo registrado com sucesso!');

        // Refresh book details to show new loan
        this.showBookDetails(this.currentBookId);
    }

    saveToLocalStorage() {
        try {
            const data = {
                books: this.books,
                loans: this.loans
            };
            localStorage.setItem('library-data', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save to localStorage', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('library-data');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.books = parsed.books || {};
                this.loans = parsed.loans || {};
                this.renderBooksPanel();
            }
        } catch (e) {
            console.warn('Could not load from localStorage', e);
        }
    }

    exportData() {
        try {
            const data = {
                books: this.books,
                loans: this.loans,
                exportedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `controle-biblioteca-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showNotification('Dados exportados com sucesso!');
        } catch (e) {
            this.showNotification('Erro ao exportar dados', 'error');
            console.error(e);
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    // Merge with existing data
                    this.books = { ...this.books, ...importedData.books || {} };
                    this.loans = { ...this.loans, ...importedData.loans || {} };

                    this.saveToLocalStorage();
                    this.renderBooksPanel();
                    this.showNotification('Dados importados com sucesso!');
                } catch (err) {
                    this.showNotification('Erro ao importar dados: formato inválido', 'error');
                    console.error(err);
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    clearAllData() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            this.books = {};
            this.loans = {};
            this.currentBookId = null;
            this.saveToLocalStorage();
            this.renderBooksPanel();
            this.renderWelcomeContent();
            this.hidePropertiesPanel();
            this.hideLoanPanel();
            this.showNotification('Todos os dados foram limpos com sucesso!');
        }
    }

    showNotification(message, type = 'success') {
        // Remove any existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Styles
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.background = type === 'success' ? '#4caf50' : '#ff6b6b';
        notification.style.color = 'white';
        notification.style.padding = '1rem 1.5rem';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notification.style.zIndex = '1000';
        notification.style.transition = 'opacity 0.3s, transform 0.3s';
        notification.style.opacity = '0';
        notification.style.maxWidth = '80%';

        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    renderWelcomeContent() {
        const dynamicContent = document.getElementById('dynamic-content');
        if (Object.keys(this.books).length === 0) {
            dynamicContent.innerHTML = `
                <div class="welcome-screen">
                    <h2>Bem-vindo ao Controle de Biblioteca</h2>
                    <p>Selecione um livro na barra lateral para ver detalhes ou adicionar um novo livro.</p>
                    <div class="empty-state">
                        <p>Nenhum livro cadastrado ainda.</p>
                        <button id="add-first-book" class="btn-primary">Adicionar Primeiro Livro</button>
                    </div>
                </div>
            `;
        } else {
            // Show stats when there are books
            const totalBooks = Object.keys(this.books).length;
            const totalLoans = Object.values(this.loans).flat().length;
            const activeLoans = Object.values(this.loans).flat().filter(loan => !loan.returnDate).length;

            dynamicContent.innerHTML = `
                <div class="welcome-screen">
                    <h2>Bem-vindo ao Controle de Biblioteca</h2>
                    <p>Visão geral do sistema:</p>
                    <div class="stats-summary">
                        <p>Total de livros: ${totalBooks}</p>
                        <p>Total de empréstimos: ${totalLoans}</p>
                        <p>Empréstimos ativos: ${activeLoans}</p>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LibraryApp();
});
// ---- Painéis laterais: botão de fechar e ações padrão de formulário ----
document.addEventListener('DOMContentLoaded', () => {
    const labels = { 'quiz-form': 'Enviar respostas', 'review-form': 'Publicar avaliação', 'loan-form': 'Registrar empréstimo' };
    const decorate = (panel) => {
        if (!panel.classList.contains('active')) return;
        if (!panel.querySelector('.panel-close')) {
            const x = document.createElement('button');
            x.type = 'button'; x.className = 'panel-close'; x.setAttribute('aria-label', 'Fechar painel'); x.textContent = '×';
            x.addEventListener('click', () => panel.classList.remove('active'));
            panel.insertBefore(x, panel.firstChild);
        }
        const form = panel.querySelector('form');
        if (form && !form.querySelector('[type="submit"]')) {
            const box = document.createElement('div');
            box.className = 'form-actions';
            box.innerHTML = '<button type="button" class="btn-cancel">Cancelar</button><button type="submit" class="btn-primary"></button>';
            box.querySelector('.btn-primary').textContent = labels[form.id] || 'Salvar';
            box.querySelector('.btn-cancel').addEventListener('click', () => panel.classList.remove('active'));
            form.appendChild(box);
        }
    };
    document.querySelectorAll('.properties-panel,.review-panel,.loan-panel,.lesson-panel,.quiz-panel,.certificate-panel').forEach(panel => {
        new MutationObserver(() => decorate(panel)).observe(panel, { attributes: true, attributeFilter: ['class'], childList: true });
    });
    document.addEventListener('click', (e) => {
        const o = e.target.closest('[data-open]');
        if (o) document.getElementById(o.dataset.open).classList.add('active');
    });
});
