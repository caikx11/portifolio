// Aplicativo de Controle de Saúde Pessoal
class HealthControlApp {
    constructor() {
        this.currentSection = 'welcome';
        this.data = {
            bloodPressure: [],
            glucose: [],
            medication: [],
            weight: []
        };
        this.selectedMetric = null;
        this.charts = {};
        this.init();
    }

    init() {
        this.renderSidebar();
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.renderWelcomeContent();
    }

    renderSidebar() {
        const modulePanel = document.getElementById('module-panel');
        const modules = [
            { id: 'blood-pressure', label: 'Pressão Arterial', icon: '🫀' },
            { id: 'glucose', label: 'Glicose', icon: '🩸' },
            { id: 'medication', label: 'Medicação', icon: '💊' },
            { id: 'weight', label: 'Peso', icon: '⚖️' }
        ];

        modulePanel.innerHTML = modules.map(m => `
            <button class="module-btn" data-metric="${m.id}">
                <span>${m.icon}</span>
                <span>${m.label}</span>
            </button>
        `).join('');

        // Re-attach event listeners for new buttons
        document.querySelectorAll('.module-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const metric = btn.dataset.metric;
                this.showSection(metric);
            });
        });
    }

    setupEventListeners() {
        // Toolbar buttons
        document.getElementById('add-entry').addEventListener('click', () => this.showAddEntryForm());
        document.getElementById('view-relatorios').addEventListener('click', () => this.showReports());
        document.getElementById('export-dados').addEventListener('click', () => this.exportData());
        document.getElementById('import-dados').addEventListener('click', () => this.importData());
        document.getElementById('clear-limpar').addEventListener('click', () => this.clearAllData());

        // Close properties panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.properties-panel') && !e.target.closest('.module-btn')) {
                this.hidePropertiesPanel();
            }
        });
    }

    clearAllData() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            this.data = {
                bloodPressure: [],
                glucose: [],
                medication: [],
                weight: []
            };
            this.saveToLocalStorage();
            this.renderContent();
            this.showNotification('Todos os dados foram limpos com sucesso!');
        }
    }

    showSection(metric) {
        this.currentSection = metric;
        this.selectedMetric = metric;

        // Update sidebar buttons
        document.querySelectorAll('.module-btn').forEach(btn => {
            if (btn.dataset.metric === metric) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Show relevant content
        this.hidePropertiesPanel();
        this.renderContent();
    }

    renderContent() {
        const dynamicContent = document.getElementById('dynamic-content');

        switch(this.currentSection) {
            case 'blood-pressure':
                this.renderBloodPressureContent();
                break;
            case 'glucose':
                this.renderGlucoseContent();
                break;
            case 'medication':
                this.renderMedicationContent();
                break;
            case 'weight':
                this.renderWeightContent();
                break;
            default:
                this.renderWelcomeContent();
        }
    }

    renderWelcomeContent() {
        const dynamicContent = document.getElementById('dynamic-content');
        dynamicContent.innerHTML = `
            <div class="welcome-screen">
                <h2>Bem-vindo ao seu Controle de Saúde</h2>
                <p>Selecione um módulo na barra lateral para começar a acompanhar seus indicadores de saúde.</p>
                <div class="health-metrics">
                    <div class="metric-card" data-metric="blood-pressure">
                        <h3>Pressão Arterial</h3>
                        <p>Registre e acompanhe sua pressão sistólica e diastólica</p>
                    </div>
                    <div class="metric-card" data-metric="glucose">
                        <h3>Glicose</h3>
                        <p>Monitore seus níveis de glicose em jejum e pós-refeições</p>
                    </div>
                    <div class="metric-card" data-metric="medication">
                        <h3>Medicação</h3>
                        <p>Controle o horário e dosagem de seus medicamentos</p>
                    </div>
                    <div class="metric-card" data-metric="weight">
                        <h3>Peso</h3>
                        <p>Acompanhe seu peso e IMC ao longo do tempo</p>
                    </div>
                </div>
            </div>
        `;

        // Re-add event listeners for new metric cards
        document.querySelectorAll('.metric-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const metric = card.dataset.metric;
                document.querySelector(`.module-btn[data-metric="${metric}"]`).click();
            });
        });
    }

    renderBloodPressureContent() {
        const dynamicContent = document.getElementById('dynamic-content');
        const entries = this.data.bloodPressure;

        dynamicContent.innerHTML = `
            <div class="section-header">
                <h2>Controle da Pressão Arterial</h2>
                <button class="btn-secondary" onclick="app.showAddEntryForm()">Adicionar Entrada</button>
            </div>

            <div class="entries-list">
                ${entries.map((entry, index) => `
                    <div class="entry-item">
                        <div>
                            <strong>Sistólica:</strong> ${entry.systolic} mmHg
                            <strong>Diastólica:</strong> ${entry.diastolic} mmHg
                        </div>
                        <div class="entry-meta">
                            <span>${entry.date}</span>
                            <span>${entry.time}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${entries.length > 0 ? `
                <div class="stats-summary">
                    <p>Média sistólica: ${this.calculateAverage(entries, 'systolic').toFixed(1)} mmHg</p>
                    <p>Média diastólica: ${this.calculateAverage(entries, 'diastolic').toFixed(1)} mmHg</p>
                    <p>Total de registros: ${entries.length}</p>
                </div>
            ` : ''}
        `;
    }

    calculateAverage(entries, field) {
        if (entries.length === 0) return 0;
        const sum = entries.reduce((acc, entry) => acc + (entry[field] || 0), 0);
        return sum / entries.length;
    }

    renderGlucoseContent() {
        const dynamicContent = document.getElementById('dynamic-content');
        const entries = this.data.glucose;

        dynamicContent.innerHTML = `
            <div class="section-header">
                <h2>Monitor de Glicose</h2>
                <button class="btn-secondary" onclick="app.showAddEntryForm()">Adicionar Entrada</button>
            </div>

            <div class="entries-list">
                ${entries.map((entry, index) => `
                    <div class="entry-item">
                        <div>
                            <strong>Glicose:</strong> ${entry.value} mg/dL
                        </div>
                        <div class="entry-meta">
                            <span>${entry.date}</span>
                            <span>${entry.time}</span>
                            <span>${entry.tipo}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${entries.length > 0 ? `
                <div class="stats-summary">
                    <p>Média: ${this.calculateAverage(entries, 'value').toFixed(1)} mg/dL</p>
                    <p>Total de registros: ${entries.length}</p>
                </div>
            ` : ''}
        `;
    }

    renderMedicationContent() {
        const dynamicContent = document.getElementById('dynamic-content');
        const entries = this.data.medication;

        dynamicContent.innerHTML = `
            <div class="section-header">
                <h2>Controle de Medicação</h2>
                <button class="btn-secondary" onclick="app.showAddEntryForm()">Adicionar Medicação</button>
            </div>

            <div class="entries-list">
                ${entries.map((entry, index) => `
                    <div class="entry-item">
                        <div>
                            <strong>${entry.nome}</strong> - ${entry.dosagem}
                        </div>
                        <div class="entry-meta">
                            <span>${entry.horario}</span>
                            <span>${entry.frequencia}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderWeightContent() {
        const dynamicContent = document.getElementById('dynamic-content');
        const entries = this.data.weight;

        dynamicContent.innerHTML = `
            <div class="section-header">
                <h2>Acompanhamento de Peso</h2>
                <button class="btn-secondary" onclick="app.showAddEntryForm()">Adicionar Registro de Peso</button>
            </div>

            <div class="entries-list">
                ${entries.map((entry, index) => `
                    <div class="entry-item">
                        <div>
                            <strong>Peso:</strong> ${entry.peso} kg
                            <strong>IMC:</strong> ${entry.imc.toFixed(1)}
                        </div>
                        <div class="entry-meta">
                            <span>${entry.date}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${entries.length > 0 ? `
                <div class="stats-summary">
                    <p>Peso inicial: ${entries[0].peso} kg</p>
                    <p>Peso atual: ${entries[entries.length - 1].peso} kg</p>
                    <p>Variação: ${((entries[entries.length - 1].peso - entries[0].peso) * 100 / entries[0].peso).toFixed(1)}%</p>
                    <p>Total de registros: ${entries.length}</p>
                </div>
            ` : ''}
        `;
    }

    showAddEntryForm() {
        if (!this.selectedMetric) {
            this.showNotification('Selecione um módulo primeiro', 'error');
            return;
        }

        const propertiesPanel = document.getElementById('properties-panel');
        const form = document.getElementById('entry-form');

        let formHTML = '<h2>Nova Entrada - ' + this.selectedMetric + '</h2>';

        switch(this.selectedMetric) {
            case 'blood-pressure':
                formHTML += `
                    <label for="systolic">Pressão Sistólica (mmHg)</label>
                    <input type="number" id="systolic" name="systolic" min="60" max="250" required placeholder="Ex: 120">
                    <label for="diastolic">Pressão Diastólica (mmHg)</label>
                    <input type="number" id="diastolic" name="diastolic" min="40" max="150" required placeholder="Ex: 80">
                    <label for="date">Data</label>
                    <input type="date" id="date" name="date" required>
                    <label for="time">Hora</label>
                    <input type="time" id="time" name="time" required>
                `;
                break;
            case 'glucose':
                formHTML += `
                    <label for="value">Valor da Glicose (mg/dL)</label>
                    <input type="number" id="value" name="value" min="50" max="600" required placeholder="Ex: 95">
                    <label for="date">Data</label>
                    <input type="date" id="date" name="date" required>
                    <label for="time">Hora</label>
                    <input type="time" id="time" name="time" required>
                    <label for="tipo">Tipo</label>
                    <select id="tipo" name="tipo">
                        <option value="jejum">Em jejum</option>
                        <option value="pos-refeicao">Pós-refeição</option>
                    </select>
                `;
                break;
            case 'medication':
                formHTML += `
                    <label for="nome">Nome do Medicamento</label>
                    <input type="text" id="nome" name="nome" required placeholder="Ex: Losartana">
                    <label for="dosagem">Dosagem</label>
                    <input type="text" id="dosagem" name="dosagem" required placeholder="Ex: 50mg">
                    <label for="horario">Horário</label>
                    <input type="text" id="horario" name="horario" required placeholder="Ex: 08:00">
                    <label for="frequencia">Frequência</label>
                    <select id="frequencia" name="frequencia">
                        <option value="diaria">Diária</option>
                        <option value="bd">À noite</option>
                        <option value="td">2x ao dia</option>
                    </select>
                `;
                break;
            case 'weight':
                formHTML += `
                    <label for="peso">Peso (kg)</label>
                    <input type="number" id="peso" name="peso" min="30" max="200" step="0.1" required placeholder="Ex: 70.5">
                    <label for="altura">Altura (cm)</label>
                    <input type="number" id="altura" name="altura" min="100" max="250" step="0.1" required placeholder="Ex: 175">
                `;
                break;
        }

        formHTML += `
            <div class="form-actions">
                <button type="button" class="btn-cancel" onclick="app.hidePropertiesPanel()">Cancelar</button>
                <button type="submit" class="btn-primary">Salvar Entrada</button>
            </div>
        `;

        form.innerHTML = formHTML;
        propertiesPanel.classList.add('active');

        // Set default date/time to now
        const dateInput = form.querySelector('input[type="date"]');
        const timeInput = form.querySelector('input[type="time"]');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        if (timeInput) {
            const now = new Date();
            timeInput.value = now.toTimeString().slice(0, 5);
        }

        // Focus first input
        const firstInput = form.querySelector('input, select');
        if (firstInput) firstInput.focus();

        // Form submit handler
        form.onsubmit = (e) => {
            e.preventDefault();
            if (this.validateForm(form)) {
                this.saveEntry(form);
                this.hidePropertiesPanel();
            }
        };

        // Keyboard shortcuts
        this.currentFormEscapeHandler = (e) => {
            if (e.key === 'Escape') this.hidePropertiesPanel();
        };
        document.addEventListener('keydown', this.currentFormEscapeHandler);
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required]');
        for (const input of inputs) {
            if (!input.value.trim()) {
                this.showNotification(`Preencha o campo: ${input.previousElementSibling?.textContent || input.name}`, 'error');
                input.focus();
                return false;
            }
            // Number validation
            if (input.type === 'number') {
                const val = parseFloat(input.value);
                const min = parseFloat(input.min);
                const max = parseFloat(input.max);
                if (!isNaN(min) && val < min) {
                    this.showNotification(`Valor mínimo para ${input.name}: ${min}`, 'error');
                    input.focus();
                    return false;
                }
                if (!isNaN(max) && val > max) {
                    this.showNotification(`Valor máximo para ${input.name}: ${max}`, 'error');
                    input.focus();
                    return false;
                }
            }
        }
        return true;
    }

    hidePropertiesPanel() {
        document.getElementById('properties-panel').classList.remove('active');
        document.getElementById('dynamic-content').innerHTML = '';

        // Remove escape handler
        if (this.currentFormEscapeHandler) {
            document.removeEventListener('keydown', this.currentFormEscapeHandler);
            this.currentFormEscapeHandler = null;
        }
    }

    saveEntry(form) {
        const metric = this.selectedMetric;
        const formData = new FormData(form);
        const entry = {};

        for (const [key, value] of formData.entries()) {
            entry[key] = value;
        }

        // Add timestamp
        const now = new Date();
        entry.date = now.toLocaleDateString('pt-BR');
        entry.time = now.toLocaleTimeString('pt-BR');

        // Save based on metric type
        switch(metric) {
            case 'blood-pressure':
                this.data.bloodPressure.push({
                    systolic: parseInt(entry.systolic),
                    diastolic: parseInt(entry.diastolic),
                    date: entry.date,
                    time: entry.time
                });
                break;
            case 'glucose':
                this.data.glucose.push({
                    value: parseFloat(entry.value),
                    date: entry.date,
                    time: entry.time,
                    tipo: entry.tipo
                });
                break;
            case 'medication':
                this.data.medication.push({
                    nome: entry.nome,
                    dosagem: entry.dosagem,
                    horario: entry.horario,
                    frequencia: entry.frequencia
                });
                break;
            case 'weight':
                const imc = (entry.peso / Math.pow(entry.altura / 100, 2)).toFixed(1);
                this.data.weight.push({
                    peso: parseFloat(entry.peso),
                    altura: parseFloat(entry.altura),
                    imc: parseFloat(imc),
                    date: entry.date
                });
                break;
        }

        this.saveToLocalStorage();
        this.renderContent();
        this.hidePropertiesPanel();
        this.showNotification('Entrada salva com sucesso!');
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('health-control-data', JSON.stringify(this.data));
        } catch (e) {
            console.warn('Could not save to localStorage', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('health-control-data');
            if (saved) {
                this.data = JSON.parse(saved);
                this.renderContent();
            }
        } catch (e) {
            console.warn('Could not load from localStorage', e);
        }
    }

    exportData() {
        const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `controle-saude-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Dados exportados com sucesso!');
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

                    // Merge with existing data, giving priority to new data for same dates
                    Object.keys(importedData).forEach(key => {
                        if (this.data[key]) {
                            this.data[key] = [...this.data[key], ...importedData[key]];
                        } else {
                            this.data[key] = importedData[key];
                        }
                    });

                    this.saveToLocalStorage();
                    this.renderContent();
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

    showReports() {
        const dynamicContent = document.getElementById('dynamic-content');

        let reportsHTML = '<h2>Relatórios de Saúde</h2><div class="charts-container">';

        // Blood pressure chart
        const bpEntries = this.data.bloodPressure;
        if (bpEntries.length > 0) {
            const avgSystolic = this.calculateAverage(bpEntries, 'systolic').toFixed(1);
            const avgDiastolic = this.calculateAverage(bpEntries, 'diastolic').toFixed(1);
            reportsHTML += `
                <div class="report-section">
                    <h3>Pressão Arterial</h3>
                    <p>Registros: ${bpEntries.length}</p>
                    <p>Média sistólica: ${avgSystolic} mmHg</p>
                    <p>Média diastólica: ${avgDiastolic} mmHg</p>
                    ${bpEntries.length > 0 ? `<p>Tendência: ${this.determineTrend(bpEntries.map(e => e.systolic))}</p>` : ''}
                    <canvas id="bp-chart" height="200"></canvas>
                </div>
            `;
        }

        // Glucose chart
        const glucoseEntries = this.data.glucose;
        if (glucoseEntries.length > 0) {
            const avgGlucose = this.calculateAverage(glucoseEntries, 'value').toFixed(1);
            reportsHTML += `
                <div class="report-section">
                    <h3>Glicose</h3>
                    <p>Registros: ${glucoseEntries.length}</p>
                    <p>Média: ${avgGlucose} mg/dL</p>
                    <canvas id="glucose-chart" height="200"></canvas>
                </div>
            `;
        }

        // Weight chart
        const weightEntries = this.data.weight;
        if (weightEntries.length > 0) {
            const weightChange = ((weightEntries[weightEntries.length - 1].peso - weightEntries[0].peso) / weightEntries[0].peso * 100).toFixed(1);
            reportsHTML += `
                <div class="report-section">
                    <h3>Peso e IMC</h3>
                    <p>Peso inicial: ${weightEntries[0].peso} kg</p>
                    <p>Peso atual: ${weightEntries[weightEntries.length - 1].peso} kg</p>
                    <p>Variação: ${weightChange}%</p>
                    <p>IMC atual: ${weightEntries[weightEntries.length - 1].imc.toFixed(1)}</p>
                    <canvas id="weight-chart" height="200"></canvas>
                </div>
            `;
        }

        // Medication report
        const medEntries = this.data.medication;
        if (medEntries.length > 0) {
            reportsHTML += `
                <div class="report-section">
                    <h3>Medicação</h3>
                    <p>Total de medicações registradas: ${medEntries.length}</p>
                </div>
            `;
        }

        if (!bpEntries.length && !glucoseEntries.length && !weightEntries.length && !medEntries.length) {
            reportsHTML = '<p>Nenhum dado disponível para gerar relatórios.</p>';
        }

        reportsHTML += '</div>';
        dynamicContent.innerHTML = reportsHTML;

        // Render charts after DOM is updated
        setTimeout(() => this.renderCharts(), 0);
    }

    renderCharts() {
        this.destroyCharts();

        // Blood Pressure Chart
        const bpCanvas = document.getElementById('bp-chart');
        if (bpCanvas && this.data.bloodPressure.length > 0) {
            const bpData = this.data.bloodPressure.slice(-30); // Last 30 entries
            this.charts.bp = new Chart(bpCanvas, {
                type: 'line',
                data: {
                    labels: bpData.map((e, i) => e.date),
                    datasets: [
                        {
                            label: 'Sistólica (mmHg)',
                            data: bpData.map(e => e.systolic),
                            borderColor: '#e53935',
                            backgroundColor: 'rgba(229, 57, 53, 0.1)',
                            tension: 0.3,
                            fill: true,
                            pointRadius: 4
                        },
                        {
                            label: 'Diastólica (mmHg)',
                            data: bpData.map(e => e.diastolic),
                            borderColor: '#1e88e5',
                            backgroundColor: 'rgba(30, 136, 229, 0.1)',
                            tension: 0.3,
                            fill: true,
                            pointRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Pressão Arterial - Últimos 30 Registros' }
                    },
                    scales: {
                        y: { min: 40, max: 200, title: { display: true, text: 'mmHg' } }
                    }
                }
            });
        }

        // Glucose Chart
        const glucoseCanvas = document.getElementById('glucose-chart');
        if (glucoseCanvas && this.data.glucose.length > 0) {
            const glucoseData = this.data.glucose.slice(-30);
            this.charts.glucose = new Chart(glucoseCanvas, {
                type: 'line',
                data: {
                    labels: glucoseData.map((e, i) => e.date),
                    datasets: [
                        {
                            label: 'Glicose (mg/dL)',
                            data: glucoseData.map(e => e.value),
                            borderColor: '#f57c00',
                            backgroundColor: 'rgba(245, 124, 0, 0.1)',
                            tension: 0.3,
                            fill: true,
                            pointRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Glicose - Últimos 30 Registros' }
                    },
                    scales: {
                        y: { min: 50, max: 400, title: { display: true, text: 'mg/dL' } }
                    }
                }
            });
        }

        // Weight Chart
        const weightCanvas = document.getElementById('weight-chart');
        if (weightCanvas && this.data.weight.length > 0) {
            const weightData = this.data.weight.slice(-30);
            this.charts.weight = new Chart(weightCanvas, {
                type: 'line',
                data: {
                    labels: weightData.map((e, i) => e.date),
                    datasets: [
                        {
                            label: 'Peso (kg)',
                            data: weightData.map(e => e.peso),
                            borderColor: '#43a047',
                            backgroundColor: 'rgba(67, 160, 71, 0.1)',
                            tension: 0.3,
                            fill: true,
                            pointRadius: 4,
                            yAxisID: 'y'
                        },
                        {
                            label: 'IMC',
                            data: weightData.map(e => e.imc),
                            borderColor: '#8e24aa',
                            backgroundColor: 'rgba(142, 36, 170, 0.1)',
                            tension: 0.3,
                            fill: false,
                            pointRadius: 4,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Peso e IMC - Últimos 30 Registros' }
                    },
                    scales: {
                        y: { type: 'linear', position: 'left', title: { display: true, text: 'Peso (kg)' } },
                        y1: { type: 'linear', position: 'right', title: { display: true, text: 'IMC' }, grid: { drawOnChartArea: false } }
                    }
                }
            });
        }
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

        // Blood pressure report
        const bpEntries = this.data.bloodPressure;
        if (bpEntries.length > 0) {
            const avgSystolic = this.calculateAverage(bpEntries, 'systolic').toFixed(1);
            const avgDiastolic = this.calculateAverage(bpEntries, 'diastolic').toFixed(1);
            reportsHTML += `
                <div class="report-section">
                    <h3>Pressão Arterial</h3>
                    <p>Registros: ${bpEntries.length}</p>
                    <p>Média sistólica: ${avgSystolic} mmHg</p>
                    <p>Média diastólica: ${avgDiastolic} mmHg</p>
                    ${bpEntries.length > 0 ? `<p>Tendência: ${this.determineTrend(bpEntries.map(e => e.systolic))}</p>` : ''}
                </div>
            `;
        }

        // Glucose report
        const glucoseEntries = this.data.glucose;
        if (glucoseEntries.length > 0) {
            const avgGlucose = this.calculateAverage(glucoseEntries, 'value').toFixed(1);
            reportsHTML += `
                <div class="report-section">
                    <h3>Glicose</h3>
                    <p>Registros: ${glucoseEntries.length}</p>
                    <p>Média: ${avgGlucose} mg/dL</p>
                </div>
            `;
        }

        // Weight report
        const weightEntries = this.data.weight;
        if (weightEntries.length > 0) {
            const weightChange = ((weightEntries[weightEntries.length - 1].peso - weightEntries[0].peso) / weightEntries[0].peso * 100).toFixed(1);
            reportsHTML += `
                <div class="report-section">
                    <h3>Peso e IMC</h3>
                    <p>Peso inicial: ${weightEntries[0].peso} kg</p>
                    <p>Peso atual: ${weightEntries[weightEntries.length - 1].peso} kg</p>
                    <p>Variação: ${weightChange}%</p>
                    <p>IMC atual: ${weightEntries[weightEntries.length - 1].imc.toFixed(1)}</p>
                </div>
            `;
        }

        // Medication report
        const medEntries = this.data.medication;
        if (medEntries.length > 0) {
            reportsHTML += `
                <div class="report-section">
                    <h3>Medicação</h3>
                    <p>Total de medicações registradas: ${medEntries.length}</p>
                </div>
            `;
        }

        if (!bpEntries.length && !glucoseEntries.length && !weightEntries.length && !medEntries.length) {
            reportsHTML = '<p>Nenhum dado disponível para gerar relatórios.</p>';
        }

        dynamicContent.innerHTML = reportsHTML;
    }

    determineTrend(values) {
        if (values.length < 2) return 'Insuficiente dados';

        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.ceil(values.length / 2));

        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

        if (changePercent > 5) return 'Em alta';
        if (changePercent < -5) return 'Em queda';
        return 'Estável';
    }

    hidePropertiesPanel() {
        document.getElementById('properties-panel').classList.remove('active');
        document.getElementById('dynamic-content').innerHTML = '';
    }

    showNotification(message, type = 'success') {
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HealthControlApp();
});