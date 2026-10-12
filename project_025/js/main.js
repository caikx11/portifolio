// Sistema de Gestão de Projetos Profissionais - ProManager
class ProManager {
    constructor() {
        this.currentSector = 'legal';
        this.currentView = 'dashboard';
        this.processes = this.loadInitialData();
        this.filteredProcesses = [];

        this.init();
    }

    loadInitialData() {
        const storedData = localStorage.getItem('promanager-data');
        if (storedData) {
            return JSON.parse(storedData);
        }

        // Dados iniciais baseados em áreas profissionais
        return [
            // Área Jurídica
            {
                id: 1,
                title: "Processo Cível 1023/2024 - Danos Morais",
                client: "Ana Carolina Silva",
                status: "active",
                deadline: "2026-11-15",
                responsible: "Dra. Claudia Ribeiro",
                sector: "legal",
                type: "civil"
            },
            {
                id: 2,
                title: "Processo Trabalhista 541/2024 - Rescisão Indireta",
                client: "Empresa XYZ Ltda.",
                status: "pending",
                deadline: "2026-10-20",
                responsible: "Dr. Marcus Vinícius",
                sector: "legal",
                type: "labor"
            },
            {
                id: 3,
                title: "Ação de Execução Fiscal 892/2024",
                client: "Secretaria da Fazenda",
                status: "critical",
                deadline: "2026-09-30",
                responsible: "Dra. Claudia Ribeiro",
                sector: "legal",
                type: "tax"
            },

            // Área Contábil
            {
                id: 4,
                title: "Fechamento Contábil 2024 - Empresa ABC",
                client: "Empresa ABC Ltda.",
                status: "active",
                deadline: "2027-01-15",
                responsible: "Maria Santos",
                sector: "accounting",
                type: "closing"
            },
            {
                id: 5,
                title: "Balancete Mensal - Outubro 2024",
                client: "Empresa ABC Ltda.",
                status: "active",
                deadline: "2024-11-10",
                responsible: "Maria Santos",
                sector: "accounting",
                type: "monthly"
            },

            // Área de Engenharia
            {
                id: 6,
                title: "Obra Nova - Bloco Residencial Edifício São Paulo",
                client: "Construtora Mendes Ltda.",
                status: "active",
                deadline: "2027-06-30",
                responsible: "Eng. Roberto Almeida",
                sector: "engineering",
                type: "construction"
            },
            {
                id: 7,
                title: "Licença Ambiental - Parcelamento de Solo",
                client: "Imóveis Serra Verde",
                status: "critical",
                deadline: "2026-10-15",
                responsible: "Eng. Roberto Almeida",
                sector: "engineering",
                type: "environmental"
            }
        ];
    }

    init() {
        this.setupSectors();
        this.setupViews();
        this.renderDashboard();
        this.setupEventListeners();
        this.updateStorage();
    }

    setupEventListeners() {
        const btn = document.getElementById('btn-new-item');
        if (btn) btn.addEventListener('click', () => {
            this.editingId = null;
            const f = document.getElementById('record-form');
            if (f) f.reset();
            document.getElementById('modal-title').textContent = 'Novo Registro';
            document.getElementById('modal-form').style.display = 'flex';
        });
        document.querySelectorAll('#modal-form .close-modal').forEach(b =>
            b.addEventListener('click', () => { document.getElementById('modal-form').style.display = 'none'; }));
        const sf = document.getElementById('status-filter');
        if (sf) sf.addEventListener('change', e => {
            const v = e.target.value;
            this.filteredProcesses.forEach((p, i) => {
                const row = document.querySelectorAll('#table-body tr')[i];
                if (row) row.style.display = (v === 'all' || p.status === v) ? '' : 'none';
            });
        });
    }

    setupSectors() {
        const sectorSelect = document.getElementById('sector-select');
        if (sectorSelect) {
            sectorSelect.addEventListener('change', (e) => {
                this.switchSector(e.target.value);
            });
        }
    }

    setupViews() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });
    }

    switchSector(sector) {
        this.currentSector = sector;
        document.getElementById('sector-indicator').textContent =
            this.getSectorLabel(sector);

        // Atualizar classe ativa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', this.getViewForSector(sector) === item.dataset.view);
        });

        this.filteredProcesses = this.processes.filter(p => p.sector === sector);
        this.updateMetrics();
        this.renderTable();
    }

    getSectorLabel(sector) {
        const labels = {
            legal: "Jurídico / Advocacia",
            accounting: "Contabilidade / Finanças",
            engineering: "Engenharia / Obras"
        };
        return labels[sector] || sector;
    }

    getViewForSector(sector) {
        // Cada setor tem uma view padrão
        const sectorMap = {
            legal: 'cases',
            accounting: 'financial',
            engineering: 'cases'
        };
        return sectorMap[sector] || 'dashboard';
    }

    switchView(view) {
        this.currentView = view;

        // Atualizar navegação
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        document.getElementById('current-view-title').textContent =
            this.getViewTitle(view);

        // Atualizar indicador de setor
        document.getElementById('sector-indicator').textContent =
            this.getSectorLabel(this.currentSector);

        this.renderContent();
    }

    getViewTitle(view) {
        const titles = {
            dashboard: "Visão Geral",
            cases: "Processos & Casos",
            deadlines: "Prazos & Agenda",
            clients: "Clientes & Partes",
            financial: "Honorários & Custos"
        };
        return titles[view] || "Visão Geral";
    }

    renderContent() {
        this.updateMetrics();
        this.renderTable();
    }

    updateMetrics() {
        const total = this.processes.length;
        const active = this.processes.filter(p => p.status === 'active').length;
        const critical = this.processes.filter(p => p.status === 'critical').length;

        // Calcular honorários a faturar
        let totalFees = 0;
        this.processes.forEach(p => {
            if (p.status === 'active' || p.status === 'pending') {
                // Valores estimados por tipo e setor
                const values = {
                    legal: { active: 8500, pending: 4200 },
                    accounting: { active: 3200, pending: 1800 },
                    engineering: { active: 12000, pending: 6500 }
                };
                const sectorValues = values[this.currentSector] || values['legal'];
                if (p.status === 'active') {
                    totalFees += values[this.currentSector].active;
                } else if (p.status === 'pending') {
                    totalFees += values[this.currentSector].pending;
                }
            }
        });

        // Taxa de sucesso (mock baseada no setor)
        let successRate = 82;
        if (this.currentSector === 'legal') successRate = 86;
        else if (this.currentSector === 'accounting') successRate = 94;
        else if (this.currentSector === 'engineering') successRate = 78;

        // Prazos críticos nos próximos 7 dias
        const today = new Date();
        const sevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const criticalDeadlines = this.processes.filter(p => {
            if (p.status !== 'critical') return false;
            const deadline = new Date(p.deadline);
            return deadline >= today && deadline <= sevenDays;
        }).length;

        // Atualizar DOM
        document.getElementById('m1-value').textContent = total;
        document.getElementById('m2-value').textContent = criticalDeadlines;
        document.getElementById('m3-value').textContent = `R$ ${totalFees.toLocaleString('pt-BR')}`;
        document.getElementById('m4-value').textContent = `${successRate}%`;
    }

    renderDashboard() {
        this.updateMetrics();
        this.renderTable();
    }

    renderTable() {
        const tbody = document.getElementById('table-body');
        if (!tbody) return;

        this.filteredProcesses = this.processes.filter(p => p.sector === this.currentSector);

        // Ordenar por prazo crítico primeiro
        this.filteredProcesses.sort((a, b) => {
            const statusOrder = { critical: 0, active: 1, pending: 2, finished: 3 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
            return new Date(a.deadline) - new Date(b.deadline);
        });

        if (this.filteredProcesses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">
                        Nenhum processo encontrado para este setor.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredProcesses.map((p, index) => {
            const statusLabels = {
                active: { label: "Em Andamento", class: "status-active" },
                pending: { label: "Aguardando Documentos", class: "status-pending" },
                critical: { label: "Prazo Crítico", class: "status-critical" },
                finished: { label: "Concluído", class: "status-finished" }
            };

            const statusInfo = statusLabels[p.status] || statusLabels.active;
            const deadlineDate = new Date(p.deadline);
            const today = new Date();
            const daysUntil = Math.ceil((new Date(p.deadline) - today) / (1000 * 60 * 60 * 24));

            return `
                <tr>
                    <td>
                        <strong>${p.id}</strong><br>
                        <small>${p.type ? p.type.toUpperCase() : ""}</small>
                    </td>
                    <td>${p.client}</td>
                    <td>${p.responsible}</td>
                    <td>
                        <span title="${p.deadline}" class="deadline-badge">${p.deadline.substring(8, 10)}/${p.deadline.substring(5, 7)}</span>
                        ${daysUntil <= 0 ? "EXPIRADO" : daysUntil > 0 ? `${daysUntil}d` : "Vencido"}
                    </td>
                    <td>
                        <span class="status-badge ${statusInfo.class}">${statusInfo.label}</span>
                    </td>
                    <td>
                        <div class="actions-cell">
                            <button class="btn-icon view" title="Ver detalhes" onclick="manager.viewProcess(${p.id})">👁</button>
                            <button class="btn-icon edit" title="Editar" onclick="manager.editProcess(${p.id})">✎</button>
                            <button class="btn-icon delete" title="Excluir" onclick="manager.deleteProcess(${p.id})">🗑</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    viewProcess(id) {
        const process = this.processes.find(p => p.id === id);
        if (!process) return;

        const statusLabels = {
            active: "Em Andamento",
            pending: "Aguardando Documentos",
            critical: "Prazo Crítico",
            finished: "Concluído"
        };

        alert(`
            Detalhes do Processo:\n
            Código: #${process.id}\n
            Título: ${process.title}\n
            Cliente: ${process.client}\n
            Setor: ${this.getSectorLabel(this.currentSector)}\n
            Responsável: ${process.responsible}\n
            Tipo: ${process.type || "Não informado"}\n
            Status: ${statusLabels[process.status] || "Não informado"}\n
            Data Limite: ${process.deadline}\n
            Observações: Registro ativo no sistema ProManager.
        `);
    }

    editProcess(id) {
        const process = this.processes.find(p => p.id === id);
        if (!process) return;

        // Preencher modal com dados do processo
        document.getElementById('item-title').value = process.title;
        document.getElementById('item-client').value = process.client;
        document.getElementById('item-assignee').value = process.responsible;
        document.getElementById('item-date').value = process.deadline;
        document.getElementById('item-status').value = process.status;

        this.editingId = id;
        document.getElementById('modal-title').textContent = 'Editar Registro';
        document.getElementById('modal-form').style.display = 'flex';
    }

    deleteProcess(id) {
        if (confirm(`Tem certeza que deseja excluir o processo #${id}?\nIsso removerá permanentemente este registro.`)) {
            this.processes = this.processes.filter(p => p.id !== id);
            localStorage.setItem('promanager-data', JSON.stringify(this.processes));
            this.updateStorage();
            this.renderTable();
            this.updateMetrics();
            alert("Processo excluído com sucesso.");
        }
    }

    // Método para salvar novo/modificar registro
    saveRecord() {
        const title = document.getElementById('item-title').value.trim();
        const client = document.getElementById('item-client').value.trim();
        const assignee = document.getElementById('item-assignee').value.trim();
        const date = document.getElementById('item-date').value;
        const status = document.getElementById('item-status').value;

        if (!title || !client || !assignee || !date) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // Verificar se é edição ou novo
        const form = document.getElementById('record-form');
        const submitBtn = form.querySelector('button[type="submit"]');

        // Criar novo registro
        const newProcess = {
            id: Date.now(),
            title,
            client,
            status,
            deadline: date,
            responsible: assignee,
            sector: this.currentSector,
            type: this.getProcessType()
        };

        if (this.editingId) {
            const i = this.processes.findIndex(p => p.id === this.editingId);
            if (i >= 0) this.processes[i] = { ...this.processes[i], title, client, status, deadline: date, responsible: assignee };
            this.editingId = null;
        } else {
            this.processes.push(newProcess);
        }
        localStorage.setItem('promanager-data', JSON.stringify(this.processes));
        this.updateStorage();
        this.renderTable();
        this.updateMetrics();

        // Fechar modal
        document.getElementById('modal-form').style.display = 'none';
        form.reset();

        alert("Registro salvo com sucesso!");
    }

    getProcessType() {
        const types = {
            legal: ["civil", "criminal", "trabalhista", "tributario", "familiar"],
            accounting: ["fechamento", "balancete", "apuração", "auditoria", "assinatura"],
            engineering: ["obra", "licenca", "projeto", "orçamento", "conferencia"]
        };

        const sectorTypes = types[this.currentSector] || types['legal'];
        return sectorTypes[Math.floor(Math.random() * sectorTypes.length)];
    }

    updateStorage() {
        localStorage.setItem('promanager-data', JSON.stringify(this.processes));
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.manager = new ProManager();

    // Event listeners globais
    const modal = document.getElementById('modal-form');
    const closeBtn = modal ? modal.querySelector('.close-modal') : null;

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Fechar modal ao clicar fora
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Salvar formulário
    const form = document.getElementById('record-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            window.manager.saveRecord();
        });
    }

    // Buscar processos
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#table-body tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }

    // Atualizar métricas inicial
    setTimeout(() => {
        window.manager.updateMetrics();
    }, 100);
});