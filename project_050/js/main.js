// Plataforma de Ensino
class EducationPlatformApp {
    constructor() {
        this.currentCourseId = null;
        this.currentLessonId = null;
        this.courses = {}; // courseId => { title, description, category, lessons, etc. }
        this.progress = {}; // courseId => { completedLessons: [], quizScore, certificateEarned, etc. }
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCoursesPanel();
        this.loadFromLocalStorage();
        this.renderWelcomeContent();
    }

    setupEventListeners() {
        // Courses panel click delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.course-item')) {
                const courseId = e.target.closest('.course-item').dataset.id;
                this.showCourseDetails(courseId);
            }
        });

        // Toolbar buttons
        document.getElementById('add-course').addEventListener('click', () => this.showAddCourseForm());
        document.getElementById('refresh-courses').addEventListener('click', () => this.renderCoursesPanel());
        document.getElementById('export-data').addEventListener('click', () => this.exportData());
        document.getElementById('import-data').addEventListener('click', () => this.importData());
        document.getElementById('clear-all').addEventListener('click', () => this.clearAllData());

        // Handle form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id !== 'course-form') return;
            e.preventDefault();
            if (this.validateCourseForm(e.target)) {
                this.saveCourse(e.target);
                this.hidePropertiesPanel();
            }
        });

        document.addEventListener('submit', (e) => {
            if (e.target.id !== 'quiz-form') return;
            e.preventDefault();
            if (this.validateQuizForm(e.target)) {
                this.submitQuiz(e.target);
                this.hideQuizPanel();
            }
        });

        // Handle first course button in welcome screen
        document.addEventListener('click', (e) => { if (e.target.closest('#add-first-course')) this.showAddCourseForm(); });

        // Close panels when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('button, input, select, textarea, label, a, .properties-panel') &&
                !e.target.closest('.lesson-panel') &&
                !e.target.closest('.quiz-panel') &&
                !e.target.closest('.certificate-panel') &&
                !e.target.closest('.course-item') &&
                !e.target.closest('#add-course') &&
                !e.target.closest('#add-first-course')) {
                this.hidePropertiesPanel();
                this.hideLessonPanel();
                this.hideQuizPanel();
                this.hideCertificatePanel();
            }
        });

        // Handle Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePropertiesPanel();
                this.hideLessonPanel();
                this.hideQuizPanel();
                this.hideCertificatePanel();
            }
        });
    }

    renderCoursesPanel() {
        const coursesPanel = document.getElementById('courses-panel');
        const courseIds = Object.keys(this.courses);

        if (courseIds.length === 0) {
            coursesPanel.innerHTML = '<p class="empty-msg">Nenhum curso cadastrado</p>';
            return;
        }

        coursesPanel.innerHTML = courseIds.map(id => {
            const course = this.courses[id];
            const courseProgress = this.progress[id] || { completedLessons: [], quizScore: 0, certificateEarned: false };
            const totalLessons = course.lessons ? course.lessons.length : 0;
            const completedLessons = courseProgress.completedLessons ? courseProgress.completedLessons.length : 0;
            const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

            return `
                <div class="course-item" data-id="${id}">
                    <h3>${course.title}</h3>
                    <div class="course-meta">
                        <span>${course.category || 'Sem categoria'}</span>
                        <span>${completedLessons}/${totalLessons} aulas</span>
                    </div>
                    <div class="course-progress">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${progressPercentage}%"></div>
                        </div>
                        <span>${progressPercentage}% concluído</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    showAddCourseForm() {
        this.currentCourseId = null;
        this.showPropertiesPanel('Adicionar Novo Curso', `
            <div class="field-group">
                <label for="course-title">Título do Curso *</label>
                <input type="text" id="course-title" name="course-title" placeholder="Ex: Desenvolvimento Web com JavaScript" required>
            </div>

            <div class="field-group">
                <label for="course-description">Descrição *</label>
                <textarea id="course-description" name="course-description" placeholder="Descreva o conteúdo do curso" required></textarea>
            </div>

            <div class="field-group">
                <label for="course-category">Categoria</label>
                <input type="text" id="course-category" name="course-category" placeholder="Ex: Programação, Design, Marketing">
            </div>

            <div class="field-group">
                <label for="course-duration">Duração estimada (horas)</label>
                <input type="number" id="course-duration" name="course-duration" min="1" placeholder="Ex: 20">
            </div>

            <div class="field-group">
                <label for="course-level">Nível</label>
                <select id="course-level" name="course-level">
                    <option value="">Selecione o nível</option>
                    <option value="iniciante">Iniciante</option>
                    <option value="intermediário">Intermediário</option>
                    <option value="avançado">Avançado</option>
                </select>
            </div>
        `, 'course-form');
    }

    showCourseDetails(courseId) {
        this.currentCourseId = courseId;
        const course = this.courses[courseId];
        const courseProgress = this.progress[courseId] || { completedLessons: [], quizScore: 0, certificateEarned: false };
        const totalLessons = course.lessons ? course.lessons.length : 0;
        const completedLessons = courseProgress.completedLessons ? courseProgress.completedLessons.length : 0;
        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        // Update courses panel active state
        document.querySelectorAll('.course-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === courseId);
        });

        // Show course content in main area
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `
            <div class="course-detail">
                <h2>${course.title}</h2>
                <div class="course-info">
                    <div>
                        <h3>Descrição</h3>
                        <p>${course.description}</p>
                    </div>
                    <div>
                        <h3>Informações</h3>
                        <p><strong>Categoria:</strong> ${course.category || 'Não especificada'}</p>
                        <p><strong>Duração:</strong> ${course.duration || 'Não informada'} horas</p>
                        <p><strong>Nível:</strong> ${course.level || 'Não informado'}</p>
                    </div>
                </div>

                <div class="course-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>${completedLessons}/${totalLessons} aulas concluídas</span>
                        <span>${progressPercentage}%</span>
                    </div>
                </div>

                ${course.lessons && course.lessons.length > 0 ?
                    `<div class="lessons-section">
                        <h3>Aulas</h3>
                        <div class="lessons-list">
                            ${course.lessons.map((lesson, index) => {
                                const isCompleted = courseProgress.completedLessons && courseProgress.completedLessons.includes(index);
                                return `
                                    <div class="lesson-item ${isCompleted ? 'completed' : ''}" data-index="${index}">
                                        <div class="lesson-item-header">
                                            <span class="lesson-item-title">${lesson.title}</span>
                                            <span class="lesson-item-status ${isCompleted ? 'completed' : 'pending'}">
                                                ${isCompleted ? 'Concluída' : 'Pendente'}
                                            </span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>` :
                    `<p class="empty-msg">Nenhuma aula cadastrada para este curso.</p>`
                }

                ${course.quiz ?
                    `<div class="quiz-section">
                        <h3>Quiz de Avaliação</h3>
                        <p>${courseProgress.quizScore > 0 ? `Sua pontuação: ${courseProgress.quizScore}/100` : 'Quiz não realizado'}</p>
                        ${courseProgress.certificateEarned ?
                            `<button id="view-certificate" class="btn-primary">Ver Certificado</button>` :
                            `<button id="take-quiz" class="btn-primary">Fazer Quiz</button>`
                        }
                    </div>` : ''
                }
            </div>
        `;

        // Add event listeners for lessons
        setTimeout(() => {
            document.querySelectorAll('.lesson-item').forEach(item => {
                item.addEventListener('click', () => {
                    const lessonIndex = parseInt(item.dataset.index);
                    this.showLesson(lessonIndex);
                });
            });

            // Quiz button listener
            const takeQuizBtn = document.getElementById('take-quiz');
            if (takeQuizBtn) {
                takeQuizBtn.addEventListener('click', () => this.showQuiz());
            }

            // Certificate button listener
            const viewCertificateBtn = document.getElementById('view-certificate');
            if (viewCertificateBtn) {
                viewCertificateBtn.addEventListener('click', () => this.showCertificate());
            }
        }, 0);
    }

    showLesson(lessonIndex) {
        if (!this.currentCourseId) return;

        const course = this.courses[this.currentCourseId];
        const lesson = course.lessons[lessonIndex];
        if (!lesson) return;

        this.currentLessonId = lessonIndex;

        this.showLessonPanel(lesson.title, `
            <div class="lesson-content">
                ${lesson.content || '<p>Conteúdo da aula não disponível.</p>'}
            </div>
            <div class="lesson-actions">
                <button id="mark-complete" class="btn-primary">${this.isLessonCompleted(lessonIndex) ? 'Marcar como pendente' : 'Marcar como concluída'}</button>
            </div>
        `);
    }

    isLessonCompleted(lessonIndex) {
        const courseProgress = this.progress[this.currentCourseId] || { completedLessons: [] };
        return courseProgress.completedLessons && courseProgress.completedLessons.includes(lessonIndex);
    }

    showLessonPanel(title, content) {
        const lessonPanel = document.getElementById('lesson-panel');
        lessonPanel.innerHTML = `<h2>${title}</h2>${content}`;
        lessonPanel.classList.add('active');

        // Handle mark complete button
        setTimeout(() => {
            const markCompleteBtn = document.getElementById('mark-complete');
            if (markCompleteBtn) {
                markCompleteBtn.addEventListener('click', () => {
                    this.toggleLessonCompletion(this.currentLessonId);
                    this.hideLessonPanel();
                    this.showCourseDetails(this.currentCourseId);
                });
            }
        }, 0);
    }

    toggleLessonCompletion(lessonIndex) {
        if (!this.currentCourseId) return;

        if (!this.progress[this.currentCourseId]) {
            this.progress[this.currentCourseId] = { completedLessons: [], quizScore: 0, certificateEarned: false };
        }

        if (!this.progress[this.currentCourseId].completedLessons) {
            this.progress[this.currentCourseId].completedLessons = [];
        }

        const completedLessons = this.progress[this.currentCourseId].completedLessons;
        const index = completedLessons.indexOf(lessonIndex);

        if (index === -1) {
            completedLessons.push(lessonIndex);
        } else {
            completedLessons.splice(index, 1);
        }

        this.saveToLocalStorage();
    }

    showQuiz() {
        if (!this.currentCourseId) return;

        const course = this.courses[this.currentCourseId];
        if (!course.quiz) return;

        this.showQuizPanel('Quiz de Avaliação', `
            ${course.quiz.questions.map((q, index) => `
                <div class="field-group">
                    <label for="q${index}">${q.question}</label>
                    ${q.options.map((option, optIndex) => `
                        <label class="quiz-option">
                            <input type="radio" id="q${index}_opt${optIndex}" name="q${index}" value="${option.value}" required>
                            ${option.text}
                        </label>
                    `).join('')}
                </div>
            `).join('')}
        `);
    }

    showQuizPanel(title, content) {
        const quizPanel = document.getElementById('quiz-panel');
        quizPanel.innerHTML = `<h2>${title}</h2><form id="quiz-form">${content}</form>`;
        quizPanel.classList.add('active');

        // Focus first input
        setTimeout(() => {
            const firstInput = quizPanel.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
        }, 0);
    }

    validateQuizForm(form) {
        const course = this.courses[this.currentCourseId];
        if (!course.quiz || !course.quiz.questions) return false;

        // Check if all questions are answered
        for (let i = 0; i < course.quiz.questions.length; i++) {
            const selectedOption = form.querySelector(`input[name="q${i}"]:checked`);
            if (!selectedOption) {
                this.showNotification(`Por favor, responda a questão ${i + 1}`, 'error');
                return false;
            }
        }

        return true;
    }

    submitQuiz(form) {
        if (!this.currentCourseId) return;

        const course = this.courses[this.currentCourseId];
        if (!course.quiz || !course.quiz.questions) return;

        let score = 0;
        const totalQuestions = course.quiz.questions.length;

        // Calculate score
        for (let i = 0; i < totalQuestions; i++) {
            const selectedOption = form.querySelector(`input[name="q${i}"]:checked`);
            if (selectedOption && selectedOption.value === course.quiz.questions[i].correctAnswer) {
                score += (100 / totalQuestions);
            }
        }

        // Save quiz score
        if (!this.progress[this.currentCourseId]) {
            this.progress[this.currentCourseId] = { completedLessons: [], quizScore: 0, certificateEarned: false };
        }

        this.progress[this.currentCourseId].quizScore = Math.round(score);
        this.progress[this.currentCourseId].certificateEarned = score >= 70; // Certificate if score >= 70%

        this.saveToLocalStorage();
        this.showNotification(`Quiz concluído! Sua pontuação: ${Math.round(score)}/100`, score >= 70 ? 'success' : 'warning');
        this.hideQuizPanel();
        this.showCourseDetails(this.currentCourseId);
    }

    showCertificate() {
        if (!this.currentCourseId) return;

        const course = this.courses[this.currentCourseId];
        const courseProgress = this.progress[this.currentCourseId] || {};

        if (!courseProgress.certificateEarned) {
            this.showNotification('Você precisa atingir pelo menos 70% no quiz para obter o certificado', 'error');
            return;
        }

        this.showCertificatePanel(`
            <div class="certificate-content">
                <h3>CERTIFICADO DE CONCLUSÃO</h3>
                <p>Este certifica que</p>
                <p><strong>${courseProgress.studentName || 'Aluno'}</strong></p>
                <p>concluiu com sucesso o curso</p>
                <p><strong>${course.title}</strong></p>
                <p>Com carga horária de ${course.duration || 'XX'} horas</p>
                <p>Obtendo pontuação final de ${courseProgress.quizScore}/100</p>
                <p>Data de emissão: ${new Date().toLocaleDateString('pt-BR')}</p>
                <p>Este documento é válido para fins de complementação de atividades.</p>
            </div>
        `);
    }

    showCertificatePanel(content) {
        const certificatePanel = document.getElementById('certificate-panel');
        certificatePanel.innerHTML = `<h2>Certificado de Conclusão</h2>${content}`;
        certificatePanel.classList.add('active');
    }

    hidePropertiesPanel() {
        document.getElementById('properties-panel').classList.remove('active');
    }

    hideLessonPanel() {
        document.getElementById('lesson-panel').classList.remove('active');
    }

    hideQuizPanel() {
        document.getElementById('quiz-panel').classList.remove('active');
    }

    hideCertificatePanel() {
        document.getElementById('certificate-panel').classList.remove('active');
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

    validateCourseForm(form) {
        const titleInput = form.querySelector('#course-title');
        const descriptionInput = form.querySelector('#course-description');

        if (!titleInput || !titleInput.value.trim()) {
            this.showNotification('Por favor, preencha o título do curso', 'error');
            titleInput?.focus();
            return false;
        }

        if (!descriptionInput || !descriptionInput.value.trim()) {
            this.showNotification('Por favor, preencha a descrição do curso', 'error');
            descriptionInput?.focus();
            return false;
        }

        return true;
    }

    saveCourse(form) {
        const formData = new FormData(form);
        const courseId = Date.now().toString(); // Simple ID generation

        // Parse lessons from textarea (simple format: one per line)
        const lessonsText = formData.get('course-lessons') || '';
        const lessons = lessonsText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => ({ title: line, content: `Conteúdo da aula: ${line}` }));

        this.courses[courseId] = {
            title: formData.get('course-title'),
            description: formData.get('course-description'),
            category: formData.get('course-category'),
            duration: formData.get('course-duration'),
            level: formData.get('course-level'),
            lessons: lessons.length > 0 ? lessons : [
                { title: 'Introdução', content: 'Bem-vindo ao curso!' },
                { title: 'Conclusão', content: 'Obrigado por participar!' }
            ],
            quiz: formData.get('include-quiz') === 'on' ? {
                questions: [
                    {
                        question: 'Qual é o objetivo principal deste curso?',
                        options: [
                            { text: 'Aprender os conceitos básicos', value: 'a' },
                            { text: 'Desenvolver habilidades avançadas', value: 'b' },
                            { text: 'Aplicar o conhecimento na prática', value: 'c' },
                            { text: 'Todas as alternativas acima', value: 'd' }
                        ],
                        correctAnswer: 'd'
                    }
                ]
            } : null,
            createdAt: new Date().toISOString()
        };

        // Initialize progress for this course
        this.progress[courseId] = { completedLessons: [], quizScore: 0, certificateEarned: false };

        this.saveToLocalStorage();
        this.renderCoursesPanel();
        this.showNotification('Curso adicionado com sucesso!');

        // Automatically show the new course details
        this.showCourseDetails(courseId);
    }

    saveToLocalStorage() {
        try {
            const data = {
                courses: this.courses,
                progress: this.progress
            };
            localStorage.setItem('education-platform-data', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save to localStorage', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('education-platform-data');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.courses = parsed.courses || {};
                this.progress = parsed.progress || {};
                this.renderCoursesPanel();
            }
        } catch (e) {
            console.warn('Could not load from localStorage', e);
        }
    }

    exportData() {
        try {
            const data = {
                courses: this.courses,
                progress: this.progress,
                exportedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `plataforma-ensino-${new Date().toISOString().split('T')[0]}.json`;
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
                    this.courses = { ...this.courses, ...importedData.courses || {} };
                    this.progress = { ...this.progress, ...importedData.progress || {} };

                    this.saveToLocalStorage();
                    this.renderCoursesPanel();
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
            this.courses = {};
            this.progress = {};
            this.currentCourseId = null;
            this.saveToLocalStorage();
            this.renderCoursesPanel();
            this.renderWelcomeContent();
            this.hidePropertiesPanel();
            this.hideLessonPanel();
            this.hideQuizPanel();
            this.hideCertificatePanel();
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
        notification.style.background = type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#ff6b6b';
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
        if (Object.keys(this.courses).length === 0) {
            dynamicContent.innerHTML = `
                <div class="welcome-screen">
                    <h2>Bem-vindo à Plataforma de Ensino</h2>
                    <p>Selecione um curso na barra lateral para começar a estudar ou adicionar um novo curso.</p>
                    <div class="empty-state">
                        <p>Nenhum curso cadastrado ainda.</p>
                        <button id="add-first-course" class="btn-primary">Adicionar Primeiro Curso</button>
                    </div>
                </div>
            `;
        } else {
            // Show stats when there are courses
            const totalCourses = Object.keys(this.courses).length;
            const totalLessons = Object.values(this.courses).reduce((sum, course) => sum + (course.lessons ? course.lessons.length : 0), 0);
            const completedLessons = Object.values(this.progress).reduce((sum, prog) => sum + (prog.completedLessons ? prog.completedLessons.length : 0), 0);
            const certificatesEarned = Object.values(this.progress).filter(prog => prog.certificateEarned).length;

            dynamicContent.innerHTML = `
                <div class="welcome-screen">
                    <h2>Bem-vindo à Plataforma de Ensino</h2>
                    <p>Visão geral do sistema:</p>
                    <div class="stats-summary">
                        <p>Total de cursos: ${totalCourses}</p>
                        <p>Total de aulas: ${totalLessons}</p>
                        <p>Aulas concluídas: ${completedLessons}</p>
                        <p>Certificados emitidos: ${certificatesEarned}</p>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EducationPlatformApp();
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
