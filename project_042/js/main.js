(function () {
    'use strict';
    const COLUMNS = ['Backlog', 'Em Análise', 'Em Desenvolvimento', 'Em Teste', 'Concluído'];
    const KEY = 'promanager-kanban-v1';
    const seed = [
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
    let cards;
    try { cards = JSON.parse(localStorage.getItem(KEY)); } catch (e) { cards = null; }
    if (!Array.isArray(cards)) cards = seed.map(c => Object.assign({}, c));
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cards)); } catch (e) {} };
    const board = document.getElementById('Kanban');
    const summary = document.getElementById('summary');
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fmt = d => d ? d.split('-').reverse().slice(0, 2).join('/') : '';
    let dragId = null;

    function render() {
        board.innerHTML = '';
        COLUMNS.forEach((col, i) => {
            const items = cards.filter(c => c.Status === col);
            const sec = document.createElement('section');
            sec.className = 'column col-' + i;
            sec.dataset.status = col;
            sec.setAttribute('role', 'listitem');
            sec.innerHTML = '<h2><span>' + esc(col) + '</span><em>' + items.length + '</em></h2><div class="dropzone"></div>';
            const zone = sec.querySelector('.dropzone');
            items.forEach(c => zone.appendChild(cardEl(c)));
            if (!items.length) zone.innerHTML = '<p class="empty">Solte um cartão aqui</p>';
            sec.addEventListener('dragover', e => { e.preventDefault(); sec.classList.add('over'); });
            sec.addEventListener('dragleave', e => { if (!sec.contains(e.relatedTarget)) sec.classList.remove('over'); });
            sec.addEventListener('drop', e => {
                e.preventDefault(); sec.classList.remove('over');
                if (dragId != null) move(dragId, col);
            });
            board.appendChild(sec);
        });
        const done = cards.filter(c => c.Status === 'Concluído').length;
        const pct = cards.length ? Math.round(done / cards.length * 100) : 0;
        summary.innerHTML = '<span><b>' + cards.length + '</b> tarefas</span><span><b>' + done + '</b> concluídas</span>' +
            '<div class="bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%"></i></div><span><b>' + pct + '%</b></span>';
    }

    function cardEl(c) {
        const el = document.createElement('article');
        el.className = 'card prio-' + c.Priority.normalize('NFD').replace(/[^a-z]/gi, '').toLowerCase();
        el.draggable = true;
        el.dataset.id = c.Id;
        el.innerHTML = '<div class="card-top"><span class="id">#' + c.Id + '</span><span class="badge">' + esc(c.Priority) + '</span>' +
            '<button class="del" aria-label="Excluir tarefa" title="Excluir">&times;</button></div>' +
            '<p class="summary-text">' + esc(c.Summary) + '</p>' +
            '<div class="tags">' + (c.Tags || []).map(t => '<span>' + esc(t) + '</span>').join('') + '</div>' +
            '<div class="meta"><span>' + esc(c.Assignee || '') + '</span>' + (c.DueDate ? '<span>Prazo ' + fmt(c.DueDate) + '</span>' : '') + '</div>' +
            '<label class="mv">Mover para <select>' + COLUMNS.map(s => '<option' + (s === c.Status ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></label>';
        el.addEventListener('dragstart', e => { dragId = c.Id; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(c.Id)); } catch (x) {} });
        el.addEventListener('dragend', () => { dragId = null; el.classList.remove('dragging'); document.querySelectorAll('.over').forEach(n => n.classList.remove('over')); });
        el.querySelector('select').addEventListener('change', e => move(c.Id, e.target.value));
        el.querySelector('.del').addEventListener('click', () => { cards = cards.filter(x => x.Id !== c.Id); save(); render(); });
        return el;
    }

    function move(id, status) {
        const c = cards.find(x => x.Id === id);
        if (c && c.Status !== status) { c.Status = status; save(); render(); }
    }

    document.getElementById('card-form').addEventListener('submit', e => {
        e.preventDefault();
        const t = document.getElementById('card-title');
        const title = t.value.trim();
        if (!title) return;
        const id = cards.reduce((m, c) => Math.max(m, c.Id), 0) + 1;
        cards.push({ Id: id, Status: 'Backlog', Summary: title, Priority: document.getElementById('card-priority').value, Assignee: 'Equipe', Tags: [], DueDate: '' });
        t.value = '';
        save(); render();
    });
    render();
})();
