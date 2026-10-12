// Editor de Texto Rich
class RichTextEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.htmlView = document.getElementById('html-view');
        this.htmlViewBtn = document.getElementById('html-view-btn');
        this.wordCountEl = document.getElementById('word-count');
        this.charCountEl = document.getElementById('char-count');
        this.clearBtn = document.getElementById('clear-btn');
        this.saveBtn = document.getElementById('save-btn');

        this.isHtmlView = false;
        this.init();
    }

    init() {
        // Configurar o editor
        this.setupEditor();
        // Configurar event listeners
        this.setupEventListeners();
        // Atualizar contadores inicialmente
        this.updateCounters();
    }

    setupEditor() {
        // Tornar o editor editável e limpar seu conteúdo inicial
        this.editor.contentEditable = 'true';
        this.editor.innerHTML = '<p><br></p>';
        this.editor.focus();
    }

    setupEventListeners() {
        // Listeners para os botões da toolbar
        const toolbarButtons = document.querySelectorAll('.toolbar-btn[data-command]');
        toolbarButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const command = button.dataset.command;
                this.executeCommand(command, button);
            });
        });

        // Listeners para os selects (font name, font size)
        const fontSelect = document.querySelector('.toolbar-select[data-command="fontName"]');
        const sizeSelect = document.querySelector('.toolbar-select[data-command="fontSize"]');
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                this.executeCommand('fontName', null, e.target.value);
            });
        }
        if (sizeSelect) {
            sizeSelect.addEventListener('change', (e) => {
                this.executeCommand('fontSize', null, e.target.value);
            });
        }

        // Listeners para os picks de cor
        const foreColorPicker = document.querySelector('.toolbar-btn[data-command="foreColor"] .color-picker');
        const backColorPicker = document.querySelector('.toolbar-btn[data-command="backColor"] .color-picker');
        if (foreColorPicker) {
            foreColorPicker.addEventListener('input', (e) => {
                this.executeCommand('foreColor', null, e.target.value);
            });
        }
        if (backColorPicker) {
            backColorPicker.addEventListener('input', (e) => {
                this.executeCommand('backColor', null, e.target.value);
            });
        }

        // Listener para o botão de visualização HTML
        if (this.htmlViewBtn) {
            this.htmlViewBtn.addEventListener('click', () => {
                this.toggleHtmlView();
            });
        }

        // Listener para limpar o editor
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja limpar todo o conteúdo?')) {
                    this.editor.innerHTML = '<p><br></p>';
                    this.updateCounters();
                }
            });
        }

        // Listener para salvar como HTML
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => {
                this.saveAsHtml();
            });
        }

        // Listeners para atualizar contadores quando o conteúdo mudar
        this.editor.addEventListener('input', () => this.updateCounters());
        this.editor.addEventListener('keyup', () => this.updateCounters());
        this.editor.addEventListener('mouseup', () => this.updateCounters());
    }

    executeCommand(command, button, value = null) {
        // Prevenir o comportamento padrão do botão
        if (button) {
            button.blur();
        }

        // Tratar comandos especiais
        switch (command) {
            case 'createlink':
                const url = prompt('Digite a URL:', 'http://');
                if (url) {
                    document.execCommand(command, false, url);
                }
                break;
            case 'insertimage':
                const imgUrl = prompt('Digite a URL da imagem:', 'http://');
                if (imgUrl) {
                    document.execCommand(command, false, imgUrl);
                }
                break;
            case 'htmlview':
                this.toggleHtmlView();
                break;
            default:
                if (value) {
                    document.execCommand(command, false, value);
                } else {
                    document.execCommand(command, false, null);
                }
                break;
        }

        // Atualizar contadores após a execução do comando
        this.updateCounters();
        // Manter o foco no editor
        this.editor.focus();
    }

    toggleHtmlView() {
        this.isHtmlView = !this.isHtmlView;
        if (this.isHtmlView) {
            // Mostrar código HTML
            this.htmlView.value = this.editor.innerHTML;
            this.editor.style.display = 'none';
            this.htmlView.style.display = 'block';
            this.htmlViewBtn.textContent = 'Ver Editor Rich';
            this.htmlView.focus();
        } else {
            // Mostrar editor rich
            this.editor.innerHTML = this.htmlView.value;
            this.editor.style.display = 'block';
            this.htmlView.style.display = 'none';
            this.htmlViewBtn.textContent = 'Ver Código HTML';
            this.editor.focus();
        }
        this.updateCounters();
    }

    updateCounters() {
        const content = this.editor.innerHTML;

        // Remover tags HTML para contar apenas texto visível
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const text = tempDiv.textContent || tempDiv.innerText || '';

        // Contar palavras (dividir por espaços múltiplos e quebras de linha)
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        // Contar caracteres (incluindo espaços)
        const characters = text.length;

        this.wordCountEl.textContent = `${words} palavra${words !== 1 ? 's' : ''}`;
        this.charCountEl.textContent = `${characters} caractere${characters !== 1 ? 's' : ''}`;
    }

    saveAsHtml() {
        const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documento Salvo</title>
</head>
<body>
    ${this.editor.innerHTML}
</body>
</html>`.trim();

        // Criar um blob e disparar download
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
        a.download = `editor-content-${timestamp}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Inicializar o editor quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new RichTextEditor();
});