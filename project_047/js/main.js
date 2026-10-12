// Gerador de Contratos Personalizáveis
class ContractGeneratorApp {
    constructor() {
        this.currentContractType = null;
        this.contractData = {};
        this.contractTypes = {
            'prestacao-servicos': {
                description: 'Contratação de profissionais autônomos ou empresas para serviços específicos.',
                title: 'Prestação de Serviços',
                icon: '💼',
                fields: [
                    { id: 'contratante', label: 'Contratante', type: 'text', placeholder: 'Nome ou razão social do contratante', required: true },
                    { id: 'contratado', label: 'Contratado', type: 'text', placeholder: 'Nome ou razão social do contratado', required: true },
                    { id: 'servico', label: 'Descrição do Serviço', type: 'textarea', placeholder: 'Descreva detalhadamente o serviço a ser prestado', required: true },
                    { id: 'valor', label: 'Valor Total (R$)', type: 'number', placeholder: 'Valor em reais', min: 0, step: 0.01, required: true },
                    { id: 'prazo', label: 'Prazo para Execução', type: 'text', placeholder: 'Ex: 30 dias, 2 meses', required: true },
                    { id: 'local', label: 'Local de Execução', type: 'text', placeholder: 'Endereço onde o serviço será executado', required: true },
                    { id: 'data-inicio', label: 'Data de Início', type: 'date', required: true },
                    { id: 'data-termino', label: 'Data de Término', type: 'date', required: true },
                    { id: 'penalidade', label: 'Cláusula de Penalidade', type: 'textarea', placeholder: 'Descreva as penalidades por descumprimento', required: false },
                    { id: 'rescisao', label: 'Cláusula de Rescisão', type: 'textarea', placeholder: 'Descreva as condições para rescisão do contrato', required: false }
                ]
            },
            'locacao-imovel': {
                description: 'Aluguel de residências, salas comerciais ou espaços.',
                title: 'Locação de Imóvel',
                icon: '🏠',
                fields: [
                    { id: 'locador', label: 'Locador', type: 'text', placeholder: 'Nome ou razão social do locador', required: true },
                    { id: 'locatario', label: 'Locatário', type: 'text', placeholder: 'Nome ou razão social do locatário', required: true },
                    { id: 'imovel', label: 'Descrição do Imóvel', type: 'textarea', placeholder: 'Endereço completo e características do imóvel', required: true },
                    { id: 'aluguel', label: 'Valor do Aluguel (R$)', type: 'number', placeholder: 'Valor mensal em reais', min: 0, step: 0.01, required: true },
                    { id: 'dia-vencimento', label: 'Dia de Vencimento', type: 'number', placeholder: 'Dia do mês para pagamento', min: 1, max: 31, required: true },
                    { id: 'deposito', label: 'Valor do Depósito (R$)', type: 'number', placeholder: 'Valor do depósito caução', min: 0, step: 0.01, required: true },
                    { id: 'condominio', label: 'Valor do Condomínio (R$)', type: 'number', placeholder: 'Valor mensal do condomínio', min: 0, step: 0.01, required: false },
                    { id: 'iptu', label: 'Valor do IPTU (R$)', type: 'number', placeholder: 'Valor mensal do IPTU', min: 0, step: 0.01, required: false },
                    { id: 'duracao', label: 'Duração do Contrato', type: 'text', placeholder: 'Ex: 12 meses, 2 anos', required: true },
                    { id: 'data-inicio', label: 'Data de Início', type: 'date', required: true },
                    { id: 'data-termino', label: 'Data de Término', type: 'date', required: true },
                    { id: 'reajuste', label: 'Cláusula de Reajuste', type: 'textarea', placeholder: 'Descreva o índice e periodicidade de reajuste', required: false },
                    { id: 'multa', label: 'Cláusula de Multa', type: 'textarea', placeholder: 'Descreva as multas por atraso ou descumprimento', required: false }
                ]
            },
            'parceria-empresarial': {
                description: 'Acordo entre partes para desenvolver projetos em conjunto.',
                title: 'Parceria Empresarial',
                icon: '🤝',
                fields: [
                    { id: 'parte1', label: 'Primeira Parte', type: 'text', placeholder: 'Nome ou razão social da primeira parte', required: true },
                    { id: 'parte2', label: 'Segunda Parte', type: 'text', placeholder: 'Nome ou razão social da segunda parte', required: true },
                    { id: 'objeto', label: 'Objeto da Parceria', type: 'textarea', placeholder: 'Descreva o objetivo e escopo da parceria', required: true },
                    { id: 'contribuicoes', label: 'Contribuições de Cada Parte', type: 'textarea', placeholder: 'Descreva o que cada parte está contribuindo (recursos, propriedade intelectual, etc.)', required: true },
                    { id: 'duracao', label: 'Duração da Parceria', type: 'text', placeholder: 'Ex: 12 meses, 2 anos, indeterminado', required: true },
                    { id: 'propriedade-intelectual', label: 'Cláusula de Propriedade Intelectual', type: 'textarea', placeholder: 'Defina a propriedade dos resultados e invenções', required: false },
                    { id: 'lucros', label: 'Distribuição de Lucros e Prejuízos', type: 'textarea', placeholder: 'Como serão distribuídos os lucros e prejuízos', required: false },
                    { id: 'confidencialidade', label: 'Cláusula de Confidencialidade', type: 'textarea', placeholder: 'Obrigações de confidencialidade das partes', required: false },
                    { id: 'rescisao', label: 'Cláusula de Rescisão', type: 'textarea', placeholder: 'Condições e procedimentos para rescisão da parceria', required: false }
                ]
            },
            'confidencialidade': {
                description: 'Proteção de informações confidenciais e proprietárias.',
                title: 'Acordo de Confidencialidade (NDA)',
                icon: '🔒',
                fields: [
                    { id: 'parte-reveladora', label: 'Parte Reveladora', type: 'text', placeholder: 'Nome ou razão social da parte que revela informações', required: true },
                    { id: 'parte-receptora', label: 'Parte Receptora', type: 'text', placeholder: 'Nome ou razão social da parte que receberá informações', required: true },
                    { id: 'informacoes-confidenciais', label: 'Definição de Informações Confidenciais', type: 'textarea', placeholder: 'Descreva quais informações são consideradas confidenciais', required: true },
                    { id: 'obrigacoes', label: 'Obrigações da Parte Receptora', type: 'textarea', placeholder: 'Descreva as obrigações de proteção e não uso das informações', required: true },
                    { id: 'excecoes', label: 'Exceções à Confidencialidade', type: 'textarea', placeholder: 'Informações que não são consideradas confidenciais', required: false },
                    { id: 'duracao', label: 'Duração do Obrigo de Confidencialidade', type: 'text', placeholder: 'Ex: 2 anos, 5 anos, indeterminado', required: true },
                    { id: 'devolucao', label: 'Devolução ou Destruição de Informações', type: 'textarea', placeholder: 'Procedimentos ao final do acordo', required: false },
                    { id: 'remedios', label: 'Remédios em Caso de Violação', type: 'textarea', placeholder: 'O que acontece em caso de violação do acordo', required: false },
                    { id: 'lei-aplicavel', label: 'Lei Aplicável e Foro', type: 'text', placeholder: 'Ex: Lei Brasileira, Foro da Cidade de São Paulo', required: false }
                ]
            }
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderSidebar();
        this.renderWelcomeContent();
        this.loadFromLocalStorage();
    }

    renderWelcomeContent() {
        const dynamicContent = document.getElementById('dynamic-content');
        const cards = Object.entries(this.contractTypes).map(([type, info]) => `
            <button type="button" class="contract-card" data-contract-type="${type}">
                <span class="contract-card-icon">${info.icon}</span>
                <h3>${info.title}</h3>
                <p>${info.description || ''}</p>
            </button>
        `).join('');
        dynamicContent.innerHTML = `
            <div class="welcome-screen">
                <h2>Bem-vindo ao Gerador de Contratos</h2>
                <p>Escolha um tipo de contrato abaixo (ou na barra lateral) para criar seu documento personalizado.</p>
                <div class="contract-types">${cards}</div>
            </div>
        `;
        dynamicContent.querySelectorAll('.contract-card').forEach(card => {
            card.addEventListener('click', () => this.showContractForm(card.dataset.contractType));
        });
    }

    setupEventListeners() {
        // Sidebar contract type buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.contract-type-btn')) {
                const type = e.target.closest('.contract-type-btn').dataset.type;
                this.showContractForm(type);
            }
        });

        // Toolbar buttons
        document.getElementById('new-contract').addEventListener('click', () => this.newContract());
        document.getElementById('save-contract').addEventListener('click', () => this.saveContract());
        document.getElementById('load-contract').addEventListener('click', () => this.loadContract());
        document.getElementById('export-pdf').addEventListener('click', () => this.exportAsPDF());
        document.getElementById('clear-form').addEventListener('click', () => this.clearForm());

        // Close properties panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.properties-panel') && !e.target.closest('.contract-type-btn') && !e.target.closest('.contract-card')) {
                this.hidePropertiesPanel();
            }
        });

        // Handle form submission
        const form = document.getElementById('contract-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm(form)) {
                this.saveContractData();
                this.generateContractPreview();
                this.hidePropertiesPanel();
                this.showNotification('Dados do contrato salvos com sucesso!');
            }
        });

        // Handle Escape key to close panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePropertiesPanel();
            }
        });
    }

    newContract() {
        this.currentContractType = null;
        this.contractData = {};
        this.hidePropertiesPanel();
        this.renderWelcomeContent();
        this.showNotification('Pronto para criar um novo contrato');
    }

    renderSidebar() {
        const contractTypesPanel = document.getElementById('contract-types-panel');
        contractTypesPanel.innerHTML = Object.entries(this.contractTypes).map(([type, info]) => `
            <button class="contract-type-btn" data-type="${type}">
                <span>${info.icon}</span>
                <span>${info.title}</span>
            </button>
        `).join('');
    }

    showContractForm(type) {
        this.currentContractType = type;
        const contractInfo = this.contractTypes[type];
        const propertiesPanel = document.getElementById('properties-panel');
        const form = document.getElementById('contract-form');

        let formHTML = `<h2>${contractInfo.title}</h2>`;
        formHTML += '<div class="contract-fields">';

        contractInfo.fields.forEach(field => {
            const value = this.contractData[field.id] || '';
            formHTML += `
                <div class="field-group">
                    <label for="${field.id}">${field.label}${field.required ? ' *' : ''}</label>
                    ${field.type === 'textarea' ?
                        `<textarea id="${field.id}" name="${field.id}" placeholder="${field.placeholder}">${value}</textarea>` :
                        `<input type="${field.type}" id="${field.id}" name="${field.id}" placeholder="${field.placeholder}" value="${value}" ${field.required ? 'required' : ''}>`
                    }
                </div>
            `;
        });

        formHTML += '</div>';
        formHTML += '<div class="form-actions">';
        formHTML += '<button type="button" class="btn-cancel" onclick="app.hidePropertiesPanel()">Cancelar</button>';
        formHTML += '<button type="submit" class="btn-primary">Salvar e Visualizar</button>';
        formHTML += '</div>';

        form.innerHTML = formHTML;
        propertiesPanel.classList.add('active');

        // Focus first input
        const firstInput = form.querySelector('input, textarea');
        if (firstInput) firstInput.focus();
    }

    hidePropertiesPanel() {
        document.getElementById('properties-panel').classList.remove('active');
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        for (const input of inputs) {
            if (!input.value.trim()) {
                this.showNotification(`Por favor, preencha o campo: ${input.previousElementSibling?.textContent}`, 'error');
                input.focus();
                return false;
            }

            // Validate number fields
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

            // Validate date fields (ensure end date is after start date)
            if (input.type === 'date' && input.id === 'data-termino' && this.currentContractType) {
                const startDate = document.getElementById('data-inicio');
                if (startDate && startDate.value) {
                    const endDate = new Date(input.value);
                    const startDateObj = new Date(startDate.value);
                    if (endDate < startDateObj) {
                        this.showNotification('A data de término deve ser posterior à data de início', 'error');
                        input.focus();
                        return false;
                    }
                }
            }
        }
        return true;
    }

    saveContractData() {
        const form = document.getElementById('contract-form');
        const formData = new FormData(form);
        this.contractData = {};

        for (const [key, value] of formData.entries()) {
            this.contractData[key] = value;
        }

        this.saveToLocalStorage();
    }

    generateContractPreview() {
        if (!this.currentContractType || !this.contractData) {
            return;
        }

        const dynamicContent = document.getElementById('dynamic-content');
        const contractInfo = this.contractTypes[this.currentContractType];

        // Generate contract text based on type
        let contractText = '';
        switch (this.currentContractType) {
            case 'prestacao-servicos':
                contractText = this.generateServiceContract();
                break;
            case 'locacao-imovel':
                contractText = this.generateLeaseContract();
                break;
            case 'parceria-empresarial':
                contractText = this.generatePartnershipContract();
                break;
            case 'confidencialidade':
                contractText = this.generateNDAContract();
                break;
        }

        dynamicContent.innerHTML = `
            <div class="contract-preview">
                <h2>${contractInfo.title}</h2>
                <div class="contract-content">
                    ${contractText.replace(/\n/g, '<br>')}
                </div>
                <div class="contract-actions">
                    <button class="btn-secondary" onclick="app.showContractForm(app.currentContractType)">Editar Dados</button>
                    <button class="btn-secondary" onclick="app.copyToClipboard()">Copiar Texto</button>
                    <button class="btn-secondary" onclick="app.printContract()">Imprimir</button>
                </div>
            </div>
        `;
    }

    generateServiceContract() {
        const d = this.contractData;
        return `
        CONTRATO DE PRESTAÇÃO DE SERVIÇOS

        Pelo presente instrumento, de acordo com as disposições da legislação civil brasileira,
        especialmente a Lei nº 8.078/90 (Código de Defesa do Consumidor) e a Lei nº 8.666/93,
        ficam entre si justificadas e contratadas as seguintes condições:

        PARTE CONTRATANTE:
        ${d.contratante}

        PARTE CONTRATADA:
        ${d.contratado}

        CLÁUSULA 1ª - DO OBJETO
        O CONTRATADO se obriga a prestar os seguintes serviços:
        ${d.servico}

        CLÁUSULA 2ª - DO PRAZO
        Este contrato terá vigência de ${d["data-inicio"]} até ${d["data-termino"]},
        totalizando aproximadamente ${d.prazo} para execução dos serviços.

        CLÁUSULA 3ª - DO VALOR E PAGAMENTO
        O valor total pelos serviços descritos é de R$ ${parseFloat(d.valor).toFixed(2)},
        que será pago conforme conforme acordado entre as partes.

        CLÁUSULA 4ª - DO LOCAL DE EXECUÇÃO
        Os serviços serão executados no seguinte local: ${d.local}

        ${d.penalidade ? 'CLÁUSULA 5ª - DAS PENALIDADES\n' + d.penalidade + '\n\n' : ''}
        ${d.rescisao ? 'CLÁUSULA 6ª - DA RESCISÃO\n' + d.rescisao + '\n\n' : ''}

        CLÁUSULA ÚLTIMA - DAS DISPOSIÇÕES GERAIS
        Este contrato entra em vigor na data de sua assinatura, obrigando as partes fielmente
        a cumprir e cumprir tudo o que nele está contido, bem como de fazer tudo o que por
        ele for devido e não proibido pela lei.

        E, por estarem assim justificadas e contratadas, assinam o presente instrumento em
        2 vias de igual teor, na presença de 2 testemunhas.

        ______________________________    ______________________________
        ${d.contratante}                    ${d.contratado}

        Testemunha 1: _____________________   Testemunha 2: _____________________
        `;
    }

    generateLeaseContract() {
        const d = this.contractData;
        return `
        CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL

        Pelo presente instrumento de contrato particular de locação de imóvel residencial,
        ficam entre si justificadas e contratadas as partes identificadas a seguir:

        LOCADOR:
        ${d.locador}

        LOCATÁRIO:
        ${d.locatario}

        CLÁUSULA 1ª - DO IMÓVEL
        O LOCADOR loca ao LOCATÁRIO, que aceita e toma, o imóvel situado à
        ${d.imovel}, para fins residenciais.

        CLÁUSULA 2ª - DO PRAZO
        O prazo desta locação será de ${d["data-inicio"]} até ${d["data-termino"]},
        correspondente a aproximadamente ${d.duracao}.

        CLÁUSULA 3ª - DO ALUGUEL E PAGAMENTOS
        O LOCATÁRIO pagará ao LOCADOR, pelo aluguel do imóvel, o valor mensal de
        R$ ${parseFloat(d.aluguel).toFixed(2)}, vencível todo dia ${d['dia-vencimento']}
        de cada mês, bem como os seguintes encargos:
        - Condomínio: R$ ${parseFloat(d.condominio || 0).toFixed(2)}
        - IPTU: R$ ${parseFloat(d.iptu || 0).toFixed(2)}

        CLÁUSULA 4ª - DO DEPÓSITO
        À título de garantia, o LOCATÁRIO depositará em favor do LOCADOR a importância de
        R$ ${parseFloat(d.deposito).toFixed(2)} (depósito caução), que será devolvida
        ao término do contrato, após vistoria do imóvel, descontadas eventuais pendências.

        ${d.reajuste ? 'CLÁUSULA 5ª - DO REAJUSTE\n' + d.reajuste + '\n\n' : ''}
        ${d.multa ? 'CLÁUSULA 6ª - DAS MULTAS\n' + d.multa + '\n\n' : ''}

        CLÁUSULA ÚLTIMA - DAS DISPOSIÇÕES GERAIS
        O presente contrato será celebrado em duas vias de igual teor, na presença de
        duas testemunhas, para que assim produza todos os seus efeitos legais.

        E, por estarem assim justificadas e contratadas, assinam o presente instrumento
        em 2 vias de igual teor.

        ______________________________    ______________________________
        ${d.locador}                    ${d.locatario}

        Testemunha 1: _____________________   Testemunha 2: _____________________
        `;
    }

    generatePartnershipContract() {
        const d = this.contractData;
        return `
        CONTRATO DE PARCERIA EMPRESARIAL

        Pelo presente instrumento, ficam entre si justificadas e contratadas as partes:

        PRIMEIRA PARTE:
        ${d.parte1}

        SEGUNDA PARTE:
        ${d.parte2}

        CLÁUSULA 1ª - DO OBJETO
        As partes constituem entre si uma parceria para o seguinte objeto:
        ${d.objeto}

        CLÁUSULA 2ª - DAS CONTRIBUIÇÕES
        Cada parte contribuirá da seguinte forma:
        ${d.contribuicoes}

        CLÁUSULA 3ª - DA DURAÇÃO
        A presente parceria terá vigência de ${d.duracao}, iniciando-se na data da assinatura deste instrumento.

        ${d["propriedade-intelectual"] ? 'CLÁUSULA 4ª - DA PROPRIEDADE INTELECTUAL\n' + d["propriedade-intelectual"] + '\n\n' : ''}
        ${d.lucros ? 'CLÁUSULA 5ª - DA DISTRIBUIÇÃO DE LUCROS E PREJUÍZOS\n' + d.lucros + '\n\n' : ''}
        ${d.confidencialidade ? 'CLÁUSULA 6ª - DA CONFIDENCIALIDADE\n' + d.confidencialidade + '\n\n' : ''}
        ${d.rescisao ? 'CLÁUSULA 7ª - DA RESCISÃO\n' + d.rescisao + '\n\n' : ''}

        CLÁUSULA ÚLTIMA - DAS DISPOSIÇÕES GERAIS
        Este contrato entra em vigor na data de sua assinatura, obrigando as partes fielmente
        a cumprir e cumprir tudo o que nele está contido.

        E, por estarem assim justificadas e contratadas, assinam o presente instrumento em
        2 vias de igual teor, na presença de 2 testemunhas.

        ______________________________    ______________________________
        ${d.parte1}                    ${d.parte2}

        Testemunha 1: _____________________   Testemunha 2: _____________________
        `;
    }

    generateNDAContract() {
        const d = this.contractData;
        return `
        ACORDO DE CONFIDENCIALIDADE (NDA)

        Pelo presente instrumento, ficam entre si obrigadas as partes identificadas abaixo:

        PARTE REVELADORA:
        ${d["parte-reveladora"]}

        PARTE RECEPTORA:
        ${d["parte-receptora"]}

        CLÁUSULA 1ª - DAS INFORMAÇÕES CONFIDENCIAIS
        Consideram-se informações confidenciais, para efeito deste acordo, aquelas
        descritas a seguir:
        ${d["informacoes-confidenciais"]}

        CLÁUSULA 2ª - DAS OBRIGAÇÕES
        A PARTE RECEPTORA obriga-se a:
        ${d.obrigacoes}

        ${d.excecoes ? 'CLÁUSULA 3ª - DAS EXCEÇÕES\n' + d.excecoes + '\n\n' : ''}
        CLÁUSULA 4ª - DA DURAÇÃO
        As obrigações de confidencialidade estabelecidas neste acordo permanecerão
        em pleno vigor e efeito por período de ${d.duracao}, contados a partir da data
        da assinatura deste instrumento.

        ${d.devolucao ? 'CLÁUSULA 5ª - DA DEVOLUÇÃO OU DESTRUIÇÃO\n' + d.devolucao + '\n\n' : ''}
        ${d.remedios ? 'CLÁUSULA 6ª - DOS REMEDIOS\n' + d.remedios + '\n\n' : ''}
        ${d["lei-aplicavel"] ? 'CLÁUSULA 7ª - DA LEI APLICÁVEL E FORO\n' + d["lei-aplicavel"] + '\n\n' : ''}

        CLÁUSULA ÚLTIMA - DAS DISPOSIÇÕES GERAIS
        Este acordo será regido pelas leis da República Federativa do Brasil,
        sendo eleito o foro da comarca especificada para dirimir quaisquer dúvidas
        ou litígios que dele oriundos.

        E, por estarem assim justificadas e contratadas, assinam o presente instrumento
        em 2 vias de igual teor, na presença de 2 testemunhas.

        ______________________________    ______________________________
        ${d["parte-reveladora"]}           ${d["parte-receptora"]}

        Testemunha 1: _____________________   Testemunha 2: _____________________
        `;
    }

    saveToLocalStorage() {
        try {
            const dataToSave = {
                currentContractType: this.currentContractType,
                contractData: this.contractData
            };
            localStorage.setItem('contract-generator-data', JSON.stringify(dataToSave));
        } catch (e) {
            console.warn('Could not save to localStorage', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('contract-generator-data');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.currentContractType = parsed.currentContractType;
                this.contractData = parsed.contractData || {};
                if (this.currentContractType && Object.keys(this.contractData).length > 0) {
                    this.showContractForm(this.currentContractType);
                    this.hidePropertiesPanel();
                    this.generateContractPreview();
                }
            }
        } catch (e) {
            console.warn('Could not load from localStorage', e);
        }
    }

    saveContract() {
        if (!this.currentContractType || Object.keys(this.contractData).length === 0) {
            this.showNotification('Não há dados de contrato para salvar', 'error');
            return;
        }
        this.saveContractData();
        this.showNotification('Contrato salvo com sucesso!');
    }

    loadContract() {
        this.loadFromLocalStorage();
        if (this.currentContractType && Object.keys(this.contractData).length > 0) {
            this.showNotification('Contrato carregado com sucesso!');
        } else {
            this.showNotification('Nenhum contrato salvo encontrado', 'error');
        }
    }

    clearForm() {
        if (confirm('Tem certeza que deseja limpar o formulário atual?')) {
            this.contractData = {};
            this.currentContractType = null;
            this.hidePropertiesPanel();
            this.renderWelcomeContent();
            this.showNotification('Formulário limpo com sucesso!');
        }
    }

    exportAsPDF() {
        // Simple approach: open print dialog
        window.print();
        this.showNotification('Dialogo de impressão aberto - salve como PDF');
    }

    copyToClipboard() {
        const contractPreview = document.querySelector('.contract-content');
        if (contractPreview) {
            const text = contractPreview.innerText;
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Texto copiado para a área de transferência!');
            }).catch(err => {
                this.showNotification('Falha ao copiar texto: ' + err, 'error');
            });
        }
    }

    printContract() {
        window.print();
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ContractGeneratorApp();
});