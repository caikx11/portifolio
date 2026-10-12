// Initialize Kanban board for project management
document.addEventListener('DOMContentLoaded', function () {
    // Sample project data for professional workflow
    const kanbanData = [
        {
            Id: 1,
            Status: 'Backlog',
            Summary: 'Definir escopo do projeto de sistema de gestão',
            Priority: 'Alta',
            Assignee: 'Gerente de Projeto',
            Tags: ['planejamento', 'início'],
            CreatedDate: '2026-10-01',
            DueDate: '2026-10-15'
        },
        {
            Id: 2,
            Status: 'Backlog',
            Summary: 'Criar wireframes da interface do usuário',
            Priority: 'Média',
            Assignee: 'Designer UX/UI',
            Tags: ['design', 'protótipo'],
            CreatedDate: '2026-10-02',
            DueDate: '2026-10-10'
        },
        {
            Id: 3,
            Status: 'Backlog',
            Summary: 'Desenvolver API REST para autenticação',
            Priority: 'Alta',
            Assignee: 'Desenvolvedor Backend',
            Tags: ['backend', 'segurança'],
            CreatedDate: '2026-10-03',
            DueDate: '2026-10-20'
        },
        {
            Id: 4,
            Status: 'Em Análise',
            Summary: 'Revisar requisitos funcionais com stakeholders',
            Priority: 'Alta',
            Assignee: 'Analista de Sistemas',
            Tags: ['reunião', 'validação'],
            CreatedDate: '2026-10-05',
            DueDate: '2026-10-08'
        },
        {
            Id: 5,
            Status: 'Em Análise',
            Summary: 'Elaborar documento de especificação técnica',
            Priority: 'Média',
            Assignee: 'Arquiteto de Soluções',
            Tags: ['documentação', 'arquitetura'],
            CreatedDate: '2026-10-06',
            DueDate: '2026-10-12'
        },
        {
            Id: 6,
            Status: 'Em Desenvolvimento',
            Summary: 'Implementar componente de login com validação',
            Priority: 'Alta',
            Assignee: 'Desenvolvedor Frontend',
            Tags: ['frontend', 'autenticação'],
            CreatedDate: '2026-10-07',
            DueDate: '2026-10-15'
        },
        {
            Id: 7,
            Status: 'Em Desenvolvimento',
            Summary: 'Configurar banco de dados PostgreSQL',
            Priority: 'Média',
            Assignee: 'Administrador de Banco',
            Tags: ['infraestrutura', 'database'],
            CreatedDate: '2026-10-08',
            DueDate: '2026-10-18'
        },
        {
            Id: 8,
            Status: 'Em Teste',
            Summary: 'Testar integração entre frontend e backend',
            Priority: 'Alta',
            Assignee: 'QA Engineer',
            Tags: ['teste', 'integração'],
            CreatedDate: '2026-10-09',
            DueDate: '2026-10-14'
        },
        {
            Id: 9,
            Status: 'Em Teste',
            Summary: 'Validar responsividade em dispositivos móveis',
            Priority: 'Média',
            Assignee: 'QA Engineer',
            Tags: ['teste', 'responsivo'],
            CreatedDate: '2026-10-10',
            DueDate: '2026-10-16'
        },
        {
            Id: 10,
            Status: 'Concluído',
            Summary: 'Configurar ambiente de desenvolvimento',
            Priority: 'Baixa',
            Assignee: 'DevOps Engineer',
            Tags: ['setup', 'ambiente'],
            CreatedDate: '2026-09-25',
            DueDate: '2026-09-30'
        },
        {
            Id: 11,
            Status: 'Concluído',
            Summary: 'Definir metodologia ágil Scrum para o projeto',
            Priority: 'Média',
            Assignee: 'Scrum Master',
            Tags: ['metodologia', 'processo'],
            CreatedDate: '2026-09-28',
            DueDate: '2026-10-05'
        },
        {
            Id: 12,
            Status: 'Em Análise',
            Summary: 'Avaliar riscos do projeto e criar plano de mitigação',
            Priority: 'Alta',
            Assignee: 'Gerente de Riscos',
            Tags: ['riscos', 'planejamento'],
            CreatedDate: '2026-10-11',
            DueDate: '2026-10-18'
        }
    ];

    // Initialize the Kanban board
    const kanbanObj = new ej.kanban.Kanban({
        dataSource: kanbanData,
        keyField: 'Status',
        columns: [
            { headerText: 'Backlog', keyField: 'Backlog' },
            { headerText: 'Em Análise', keyField: 'Em Análise' },
            { headerText: 'Em Desenvolvimento', keyField: 'Em Desenvolvimento' },
            { headerText: 'Em Teste', keyField: 'Em Teste' },
            { headerText: 'Concluído', keyField: 'Concluído' }
        ],
        cardSettings: {
            contentField: 'Summary',
            headerField: 'Id'
        },
        swimlaneSettings: {
            keyField: 'Assignee',
            allowDragAndDrop: true
        },
        // Enable drag and drop
        allowDragAndDrop: true,
        // Enable keyboard navigation
        allowKeyboard: true,
        // Set width and height
        width: '100%',
        height: '600px'
    });

    // Render the Kanban board
    kanbanObj.appendTo('#Kanban');
});