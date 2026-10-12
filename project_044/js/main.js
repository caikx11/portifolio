// Gerador de Diagramas de Fluxo
class FlowchartGenerator {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.shapePanel = document.getElementById('shape-panel');
        this.propertiesPanel = document.getElementById('properties-panel');
        this.shapeForm = document.getElementById('shape-form');
        this.clearButton = document.getElementById('clear-canvas');
        this.exportButton = document.getElementById('export-diagram');
        this.saveButton = document.getElementById('save-diagram');
        this.loadButton = document.getElementById('load-diagram');

        this.shapes = [];
        this.connections = [];
        this.selectedShape = null;
        this.isDrawingConnection = false;
        this.connectionStartPoint = null;
        this.tempConnectionLine = null;
        this.gridSize = 20; // Snap-to-grid size
        this.dragStartPos = null;
        this.draggedShape = null;

        this.init();
    }

    init() {
        this.loadShapeDefinitions();
        this.setupEventListeners();
        this.renderShapePanel();
        this.loadFromLocalStorage(); // Auto-load saved diagram
    }

    loadShapeDefinitions() {
        // Carregar definições de formas dos arquivos JSON
        this.shapeDefinitions = {
            rectangle: {
                name: 'Retângulo',
                svg: '<rect x="0" y="0" width="100" height="60" rx="8"/>',
                connectionPoints: [
                    { x: 50, y: 0 },   // topo
                    { x: 100, y: 30 }, // direita
                    { x: 50, y: 60 },  // baixo
                    { x: 0, y: 30 }    // esquerda
                ]
            },
            diamond: {
                name: 'Losango',
                svg: '<polygon points="50,0 100,30 50,60 0,30"/>',
                connectionPoints: [
                    { x: 50, y: 0 },   // topo
                    { x: 100, y: 30 }, // direita
                    { x: 50, y: 60 },  // baixo
                    { x: 0, y: 30 }    // esquerda
                ]
            },
            circle: {
                name: 'Círculo',
                svg: '<circle cx="50" cy="30" r="30"/>',
                connectionPoints: [
                    { x: 50, y: 0 },   // topo
                    { x: 100, y: 30 }, // direita
                    { x: 50, y: 60 },  // baixo
                    { x: 0, y: 30 }    // esquerda
                ]
            },
            triangle: {
                name: 'Triângulo',
                svg: '<polygon points="50,0 100,60 0,60"/>',
                connectionPoints: [
                    { x: 50, y: 0 },   // topo
                    { x: 100, y: 30 }, // direita
                    { x: 50, y: 60 },  // baixo
                    { x: 0, y: 30 }    // esquerda
                ]
            },
            parallelogram: {
                name: 'Paralelogramo',
                svg: '<polygon points="15,0 100,0 85,60 0,60"/>',
                connectionPoints: [
                    { x: 50, y: 0 },   // topo
                    { x: 100, y: 30 }, // direita
                    { x: 50, y: 60 },  // baixo
                    { x: 0, y: 30 }    // esquerda
                ]
            },
            ellipse: {
                name: 'Elipse',
                svg: '<ellipse cx="50" cy="30" rx="50" ry="30"/>',
                connectionPoints: [
                    { x: 50, y: 0 },   // topo
                    { x: 100, y: 30 }, // direita
                    { x: 50, y: 60 },  // baixo
                    { x: 0, y: 30 }    // esquerda
                ]
            },
            hexagon: {
                name: 'Hexágono',
                svg: '<polygon points="50,0 90,15 90,45 50,60 10,45 10,15"/>',
                connectionPoints: [
                    { x: 50, y: 0 },   // topo
                    { x: 90, y: 30 },  // direita
                    { x: 50, y: 60 },  // baixo
                    { x: 10, y: 30 }   // esquerda
                ]
            }
        };
    }

    setupEventListeners() {
        this.clearButton.addEventListener('click', () => this.clearCanvas());
        this.exportButton.addEventListener('click', () => this.exportDiagram());
        this.saveButton.addEventListener('click', () => this.saveDiagram());
        this.loadButton.addEventListener('click', () => this.loadDiagram());

        this.canvas.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.canvas.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.canvas.addEventListener('drop', (e) => this.handleDrop(e));

        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    renderShapePanel() {
        this.shapePanel.innerHTML = '';

        Object.keys(this.shapeDefinitions).forEach(shapeType => {
            const shapeDef = this.shapeDefinitions[shapeType];
            const shapeBtn = document.createElement('div');
            shapeBtn.className = 'shape-btn';
            shapeBtn.dataset.shapeType = shapeType;
            shapeBtn.draggable = true;
            shapeBtn.title = shapeDef.name;

            const svgContainer = document.createElement('div');
            svgContainer.innerHTML = shapeDef.svg;
            const svgEl = svgContainer.firstElementChild;
            if (svgEl) {
                svgEl.setAttribute('style', 'fill: var(--primary-color); width: 28px; height: 28px;');
            }
            shapeBtn.appendChild(svgEl);

            const label = document.createElement('span');
            label.className = 'shape-label';
            label.textContent = shapeDef.name;
            shapeBtn.appendChild(label);

            shapeBtn.addEventListener('click', () => {
                document.querySelectorAll('.shape-btn').forEach(btn => btn.classList.remove('active'));
                shapeBtn.classList.add('active');
            });

            shapeBtn.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', shapeType);
                shapeBtn.classList.add('dragging');
            });

            shapeBtn.addEventListener('dragend', () => {
                shapeBtn.classList.remove('dragging');
            });

            this.shapePanel.appendChild(shapeBtn);
        });
    }

    // Salvar diagrama no localStorage
    saveDiagram() {
        const diagramData = {
            shapes: this.shapes.map(s => ({
                id: s.id,
                type: s.type,
                x: s.x,
                y: s.y,
                width: s.width,
                height: s.height,
                properties: s.properties
            })),
            connections: this.connections,
            timestamp: Date.now()
        };

        localStorage.setItem('flowchart-diagram', JSON.stringify(diagramData));
        this.showNotification('Diagrama salvo com sucesso!', 'success');
    }

    // Carregar diagrama do localStorage
    loadDiagram() {
        const saved = localStorage.getItem('flowchart-diagram');
        if (saved) {
            try {
                const diagramData = JSON.parse(saved);
                this.shapes = diagramData.shapes || [];
                this.connections = diagramData.connections || [];
                this.renderShapes();
                this.updatePropertiesPanel();
                this.showNotification('Diagrama carregado com sucesso!', 'success');
            } catch (e) {
                this.showNotification('Erro ao carregar diagrama salvo', 'error');
            }
        } else {
            this.showNotification('Nenhum diagrama salvo encontrado', 'info');
        }
    }

    // Auto-carregar diagrama salvo ao iniciar
    loadFromLocalStorage() {
        const saved = localStorage.getItem('flowchart-diagram');
        if (saved) {
            try {
                const diagramData = JSON.parse(saved);
                this.shapes = diagramData.shapes || [];
                this.connections = diagramData.connections || [];
                this.renderShapes();
            } catch (e) {
                console.warn('Erro ao carregar diagrama do localStorage:', e);
            }
        }
    }

    // Exportar para PNG/JPEG
    exportDiagramAsImage(format = 'png') {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', this.canvas.clientWidth);
        svg.setAttribute('height', this.canvas.clientHeight);
        svg.setAttribute('viewBox', `0 0 ${this.canvas.clientWidth} ${this.canvas.clientHeight}`);

        // Adicionar fundo branco para exportação de imagem
        const bg = document.createElementNS(svgNS, 'rect');
        bg.setAttribute('width', '100%');
        bg.setAttribute('height', '100%');
        bg.setAttribute('fill', 'white');
        svg.appendChild(bg);

        // Adicionar estilos
        const style = document.createElementNS(svgNS, 'style');
        style.textContent = `
            .shape { cursor: move; }
            .connection-point { fill: #667eea; cursor: pointer; }
            .connection-line { stroke: #667eea; stroke-width: 2; fill: none; }
        `;
        svg.appendChild(style);

        // Definir marcador de seta
        const defs = document.createElementNS(svgNS, 'defs');
        const marker = document.createElementNS(svgNS, 'marker');
        marker.setAttribute('id', 'arrow');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '10');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', 'M0,0 L0,7 L10,3.5 z');
        path.setAttribute('fill', '#667eea');
        marker.appendChild(path);
        defs.appendChild(marker);
        svg.appendChild(defs);

        // Adicionar formas
        this.shapes.forEach(shape => {
            const g = document.createElementNS(svgNS, 'g');
            g.setAttribute('transform', `translate(${shape.x}, ${shape.y})`);

            const shapeSvg = document.createElementNS(svgNS, 'svg');
            shapeSvg.setAttribute('width', shape.width);
            shapeSvg.setAttribute('height', shape.height);
            shapeSvg.innerHTML = this.shapeDefinitions[shape.type].svg;
            g.appendChild(shapeSvg);

            // Adicionar rótulo se existir
            if (shape.properties.label) {
                const text = document.createElementNS(svgNS, 'text');
                text.setAttribute('x', shape.width / 2);
                text.setAttribute('y', shape.height / 2 + 5);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', '#333');
                text.setAttribute('font-family', 'Arial, sans-serif');
                text.setAttribute('font-size', '12');
                text.textContent = shape.properties.label;
                g.appendChild(text);
            }

            svg.appendChild(g);
        });

        // Adicionar conexões
        this.connections.forEach(connection => {
            const startShape = this.shapes.find(s => s.id === connection.from);
            const endShape = this.shapes.find(s => s.id === connection.to);

            if (startShape && endShape) {
                const startPoint = this.getConnectionPoint(startShape, connection.fromPoint);
                const endPoint = this.getConnectionPoint(endShape, connection.toPoint);

                const line = document.createElementNS(svgNS, 'line');
                line.setAttribute('x1', startPoint.x);
                line.setAttribute('y1', startPoint.y);
                line.setAttribute('x2', endPoint.x);
                line.setAttribute('y2', endPoint.y);
                line.setAttribute('stroke', '#667eea');
                line.setAttribute('stroke-width', '2');
                line.setAttribute('marker-end', 'url(#arrow)');
                svg.appendChild(line);
            }
        });

        // Criar canvas para renderizar SVG como imagem
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);

        // Usar canvas para converter SVG para PNG/JPEG
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.canvas.clientWidth;
        canvas.height = this.canvas.clientHeight;

        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            const imageUrl = canvas.toDataURL(`image/${format}`);
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = `diagrama-fluxo.${format}`;
            a.click();
            this.showNotification(`Diagrama exportado como ${format.toUpperCase()}!`, 'success');
        };

        img.src = url;
    }

    // Exportar original (SVG) - mantido para compatibilidade
    exportDiagram() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', this.canvas.clientWidth);
        svg.setAttribute('height', this.canvas.clientHeight);
        svg.setAttribute('viewBox', `0 0 ${this.canvas.clientWidth} ${this.canvas.clientHeight}`);

        // Adicionar estilos
        const style = document.createElementNS(svgNS, 'style');
        style.textContent = `
            .shape { cursor: move; }
            .connection-point { fill: #667eea; cursor: pointer; }
            .connection-line { stroke: #667eea; stroke-width: 2; fill: none; }
        `;
        svg.appendChild(style);

        // Definir marcador de seta
        const defs = document.createElementNS(svgNS, 'defs');
        const marker = document.createElementNS(svgNS, 'marker');
        marker.setAttribute('id', 'arrow');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '10');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', 'M0,0 L0,7 L10,3.5 z');
        path.setAttribute('fill', '#667eea');
        marker.appendChild(path);
        defs.appendChild(marker);
        svg.appendChild(defs);

        // Adicionar formas
        this.shapes.forEach(shape => {
            const g = document.createElementNS(svgNS, 'g');
            g.setAttribute('transform', `translate(${shape.x}, ${shape.y})`);

            const shapeSvg = document.createElementNS(svgNS, 'svg');
            shapeSvg.setAttribute('width', shape.width);
            shapeSvg.setAttribute('height', shape.height);
            shapeSvg.innerHTML = this.shapeDefinitions[shape.type].svg;

            g.appendChild(shapeSvg);

            // Adicionar rótulo se existir
            if (shape.properties.label) {
                const text = document.createElementNS(svgNS, 'text');
                text.setAttribute('x', shape.width / 2);
                text.setAttribute('y', shape.height / 2 + 5);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', '#333');
                text.setAttribute('font-family', 'Arial, sans-serif');
                text.setAttribute('font-size', '12');
                text.textContent = shape.properties.label;
                g.appendChild(text);
            }

            svg.appendChild(g);
        });

        // Adicionar conexões
        this.connections.forEach(connection => {
            const startShape = this.shapes.find(s => s.id === connection.from);
            const endShape = this.shapes.find(s => s.id === connection.to);

            if (startShape && endShape) {
                const startPoint = this.getConnectionPoint(startShape, connection.fromPoint);
                const endPoint = this.getConnectionPoint(endShape, connection.toPoint);

                const line = document.createElementNS(svgNS, 'line');
                line.setAttribute('x1', startPoint.x);
                line.setAttribute('y1', startPoint.y);
                line.setAttribute('x2', endPoint.x);
                line.setAttribute('y2', endPoint.y);
                line.setAttribute('stroke', '#667eea');
                line.setAttribute('stroke-width', '2');
                line.setAttribute('marker-end', 'url(#arrow)');
                svg.appendChild(line);
            }
        });

        // Criar blob e download
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagrama-fluxo.svg';
        a.click();

        URL.revokeObjectURL(url);
        this.showNotification('Diagrama exportado como SVG!', 'success');
    }

    // Manipular atalhos de teclado
    handleKeyDown(e) {
        // Delete/Backspace para remover forma selecionada
        if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedShape) {
            this.removeShape(this.selectedShape.id);
            e.preventDefault();
        }

        // Ctrl+S para salvar
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveDiagram();
        }

        // Ctrl+E para exportar
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            this.exportDiagram();
        }

        // Teclas de seta para mover forma selecionada
        if (this.selectedShape && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const step = e.shiftKey ? 10 : this.gridSize;
            switch (e.key) {
                case 'ArrowUp': this.selectedShape.y -= step; break;
                case 'ArrowDown': this.selectedShape.y += step; break;
                case 'ArrowLeft': this.selectedShape.x -= step; break;
                case 'ArrowRight': this.selectedShape.x += step; break;
            }
            this.renderShapes();
        }
    }

    // Remover forma
    removeShape(shapeId) {
        // Remover conexões associadas
        this.connections = this.connections.filter(c => c.from !== shapeId && c.to !== shapeId);
        // Remover forma
        this.shapes = this.shapes.filter(s => s.id !== shapeId);
        if (this.selectedShape && this.selectedShape.id === shapeId) {
            this.selectedShape = null;
        }
        this.renderShapes();
        this.updatePropertiesPanel();
    }

    // Mostrar notificação toast
    showNotification(message, type = 'info') {
        // Remover notificações existentes
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        switch (type) {
            case 'success': toast.style.background = '#10b981'; break;
            case 'error': toast.style.background = '#ef4444'; break;
            case 'info': toast.style.background = '#3b82f6'; break;
            case 'warning': toast.style.background = '#f59e0b'; break;
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    handleDragOver(e) {
        e.preventDefault();
        this.canvas.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.canvas.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.canvas.classList.remove('dragover');

        const shapeType = e.dataTransfer.getData('text/plain');
        if (!shapeType || !this.shapeDefinitions[shapeType]) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - 50; // Centralizar forma
        const y = e.clientY - rect.top - 30;

        // Snap to grid
        const snappedX = Math.round(x / this.gridSize) * this.gridSize;
        const snappedY = Math.round(y / this.gridSize) * this.gridSize;

        this.addShape(shapeType, snappedX, snappedY);

        // Remover seleção após drop
        document.querySelectorAll('.shape-btn').forEach(btn => btn.classList.remove('active'));
    }

    addShape(shapeType, x, y) {
        const shapeId = `shape-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const shapeDef = this.shapeDefinitions[shapeType];

        const shape = {
            id: shapeId,
            type: shapeType,
            x: x,
            y: y,
            width: 100,
            height: 60,
            properties: {
                label: shapeDef.name,
                fillColor: '#667eea',
                strokeColor: '#5a67d8',
                strokeWidth: 2,
                fontSize: 12,
                fontColor: '#333'
            }
        };

        this.shapes.push(shape);
        this.renderShapes();
        this.selectShape(shape);
    }

    renderShapes() {
        // Limpar canvas exceto linhas de conexão
        const connectionsContainer = document.getElementById('connections-container') || this.createConnectionsContainer();

        // Remover todas as formas existentes
        document.querySelectorAll('.shape').forEach(el => el.remove());

        // Renderizar formas
        this.shapes.forEach(shape => {
            const shapeElement = document.createElement('div');
            shapeElement.className = 'shape';
            shapeElement.dataset.shapeId = shape.id;
            shapeElement.style.left = `${shape.x}px`;
            shapeElement.style.top = `${shape.y}px`;
            shapeElement.style.width = `${shape.width}px`;
            shapeElement.style.height = `${shape.height}px`;

            // Criar SVG da forma
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');

            // Substituir cores no SVG se necessário
            let shapeSvg = this.shapeDefinitions[shape.type].svg;
            if (shape.properties.fillColor) {
                shapeSvg = shapeSvg.replace(/fill="[^"]*"/g, '').replace(/fill=\'[^\']*\'/g, '');
                shapeSvg = shapeSvg.replace(/(<(rect|circle|ellipse|polygon|path)[^>]*)>/g, `$1 fill="${shape.properties.fillColor}">`);
            }
            if (shape.properties.strokeColor) {
                shapeSvg = shapeSvg.replace(/stroke="[^"]*"/g, '').replace(/stroke=\'[^\']*\'/g, '');
                shapeSvg = shapeSvg.replace(/(<(rect|circle|ellipse|polygon|path)[^>]*)>/g, `$1 stroke="${shape.properties.strokeColor}">`);
            }
            if (shape.properties.strokeWidth) {
                shapeSvg = shapeSvg.replace(/stroke-width="[^"]*"/g, '').replace(/stroke-width=\'[^\']*\'/g, '');
                shapeSvg = shapeSvg.replace(/(<(rect|circle|ellipse|polygon|path)[^>]*)>/g, `$1 stroke-width="${shape.properties.strokeWidth}">`);
            }

            svg.innerHTML = shapeSvg;
            shapeElement.appendChild(svg);

            // Adicionar rótulo se existir
            if (shape.properties.label) {
                const label = document.createElement('div');
                label.className = 'shape-label';
                label.textContent = shape.properties.label;
                label.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: ${shape.properties.fontSize || 12}px;
                    color: ${shape.properties.fontColor || '#333'};
                    pointer-events: none;
                    white-space: nowrap;
                    text-align: center;
                    width: 100%;
                    padding: 0 5px;
                    box-sizing: border-box;
                `;
                shapeElement.appendChild(label);
            }

            // Adicionar pontos de conexão
            this.shapeDefinitions[shape.type].connectionPoints.forEach((point, index) => {
                const cp = document.createElement('div');
                cp.className = 'connection-point';
                cp.style.left = `${point.x}px`;
                cp.style.top = `${point.y}px`;
                cp.dataset.pointIndex = index;
                shapeElement.appendChild(cp);
            });

            this.canvas.appendChild(shapeElement);
        });

        // Renderizar conexões
        this.renderConnections();
    }

    createConnectionsContainer() {
        const container = document.createElement('div');
        container.id = 'connections-container';
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        this.canvas.appendChild(container);
        return container;
    }

    renderConnections() {
        const container = document.getElementById('connections-container');
        container.innerHTML = ''; // Limpar conexões existentes

        this.connections.forEach(connection => {
            const line = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
            line.setAttribute('width', '100%');
            line.setAttribute('height', '100%');
            line.setAttribute('class', 'connection-line');
            line.style.position = 'absolute';
            line.style.top = '0';
            line.style.left = '0';

            const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            // Calcular pontos de conexão entre as formas
            const startShape = this.shapes.find(s => s.id === connection.from);
            const endShape = this.shapes.find(s => s.id === connection.to);

            if (startShape && endShape) {
                const startPoint = this.getConnectionPoint(startShape, connection.fromPoint);
                const endPoint = this.getConnectionPoint(endShape, connection.toPoint);

                const pathData = `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`;
                path.setAttribute('d', pathData);
                path.setAttribute('stroke', '#667eea');
                path.setAttribute('stroke-width', '2');
                path.setAttribute('fill', 'none');
                line.appendChild(path);

                // Adicionar seta
                const marker = document.createElementNS("http://www.w3.org/2000/svg", 'marker');
                marker.setAttribute('id', 'arrow');
                marker.setAttribute('markerWidth', '10');
                marker.setAttribute('markerHeight', '7');
                marker.setAttribute('refX', '10');
                marker.setAttribute('refY', '3.5');
                marker.setAttribute('orient', 'auto');

                const pathMarker = document.createElementNS("http://www.w3.org/2000/svg", 'path');
                pathMarker.setAttribute('d', 'M0,0 L0,7 L10,3.5 z');
                pathMarker.setAttribute('fill', '#667eea');
                marker.appendChild(pathMarker);

                line.appendChild(marker);
                path.setAttribute('marker-end', 'url(#arrow)');
            }

            container.appendChild(line);
        });
    }

    getConnectionPoint(shape, pointIndex) {
        const pointDef = this.shapeDefinitions[shape.type].connectionPoints[pointIndex];
        return {
            x: shape.x + pointDef.x,
            y: shape.y + pointDef.y
        };
    }

    handleMouseDown(e) {
        const shapeElement = e.target.closest('.shape, .connection-point');
        if (!shapeElement) {
            // Click no canvas vazio - deselecionar
            this.selectedShape = null;
            this.updatePropertiesPanel();
            document.querySelectorAll('.shape').forEach(el => el.classList.remove('selected'));
            return;
        }

        if (shapeElement.classList.contains('connection-point')) {
            this.startConnection(shapeElement);
        } else {
            this.selectShapeByElement(shapeElement);
            this.startDrag(e, shapeElement);
        }
    }

    startDrag(e, shapeElement) {
        this.draggedShape = shapeElement;
        const rect = this.canvas.getBoundingClientRect();
        this.dragStartPos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startConnection(connectionPointEl) {
        this.isDrawingConnection = true;
        const shapeEl = connectionPointEl.closest('.shape');
        const shapeId = shapeEl.dataset.shapeId;
        const pointIndex = parseInt(connectionPointEl.dataset.pointIndex);

        this.connectionStartPoint = { shapeId, pointIndex };

        // Highlight connection points on all shapes
        document.querySelectorAll('.connection-point').forEach(cp => {
            cp.style.opacity = '0.5';
            cp.style.transform = 'scale(1.2)';
        });

        // Criar linha temporária
        this.tempConnectionLine = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        this.tempConnectionLine.setAttribute('width', '100%');
        this.tempConnectionLine.setAttribute('height', '100%');
        this.tempConnectionLine.style.position = 'absolute';
        this.tempConnectionLine.style.top = '0';
        this.tempConnectionLine.style.left = '0';
        this.tempConnectionLine.style.pointerEvents = 'none';

        const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('stroke', '#667eea');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', '5,5');
        this.tempConnectionLine.appendChild(path);

        this.canvas.appendChild(this.tempConnectionLine);
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Arrastar forma
        if (this.draggedShape && this.dragStartPos) {
            const shapeId = this.draggedShape.dataset.shapeId;
            const shape = this.shapes.find(s => s.id === shapeId);
            if (shape) {
                const dx = mouseX - this.dragStartPos.x;
                const dy = mouseY - this.dragStartPos.y;

                // Snap to grid
                shape.x = Math.round((shape.x + dx) / this.gridSize) * this.gridSize;
                shape.y = Math.round((shape.y + dy) / this.gridSize) * this.gridSize;

                this.dragStartPos = { x: mouseX, y: mouseY };
                this.renderShapes();
                this.renderConnections();
            }
        }

        // Desenhar conexão temporária
        if (this.isDrawingConnection && this.tempConnectionLine) {
            const startShape = this.shapes.find(s => s.id === this.connectionStartPoint.shapeId);
            if (startShape) {
                const startPoint = this.getConnectionPoint(startShape, this.connectionStartPoint.pointIndex);

                const path = this.tempConnectionLine.querySelector('path');
                const pathData = `M ${startPoint.x} ${startPoint.y} L ${mouseX} ${mouseY}`;
                path.setAttribute('d', pathData);
            }
        }
    }

    handleMouseUp(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Finalizar arrasto
        if (this.draggedShape) {
            this.draggedShape = null;
            this.dragStartPos = null;
        }

        // Finalizar conexão
        if (this.isDrawingConnection && this.tempConnectionLine) {
            const targetShapeEl = e.target.closest('.shape, .connection-point');
            if (targetShapeEl && targetShapeEl.classList.contains('connection-point')) {
                const targetShapeElParent = targetShapeEl.closest('.shape');
                if (targetShapeElParent) {
                    const targetShapeId = targetShapeElParent.dataset.shapeId;
                    const targetPointIndex = parseInt(targetShapeEl.dataset.pointIndex);

                    // Verificar se não é a mesma forma
                    if (this.connectionStartPoint.shapeId !== targetShapeId) {
                        this.addConnection(
                            this.connectionStartPoint.shapeId,
                            this.connectionStartPoint.pointIndex,
                            targetShapeId,
                            targetPointIndex
                        );
                    }
                }
            }

            this.endConnection();
        }
    }

    endConnection() {
        this.isDrawingConnection = false;

        // Remover highlight dos pontos de conexão
        document.querySelectorAll('.connection-point').forEach(cp => {
            cp.style.opacity = '1';
            cp.style.transform = 'scale(1)';
        });

        if (this.tempConnectionLine) {
            this.tempConnectionLine.remove();
            this.tempConnectionLine = null;
        }
        this.connectionStartPoint = null;
    }

    addConnection(fromShapeId, fromPointIndex, toShapeId, toPointIndex) {
        // Verificar se conexão já existe
        const exists = this.connections.some(conn =>
            conn.from === fromShapeId &&
            conn.fromPoint === fromPointIndex &&
            conn.to === toShapeId &&
            conn.toPoint === toPointIndex
        );

        if (!exists) {
            this.connections.push({
                from: fromShapeId,
                fromPoint: fromPointIndex,
                to: toShapeId,
                toPoint: toPointIndex
            });

            this.renderConnections();
        }
    }

    selectShape(shape) {
        this.selectedShape = shape;
        this.updatePropertiesPanel();

        // Destacar forma selecionada
        document.querySelectorAll('.shape').forEach(el => {
            el.classList.toggle('selected', el.dataset.shapeId === shape.id);
        });
    }

    selectShapeByElement(shapeEl) {
        const shapeId = shapeEl.dataset.shapeId;
        const shape = this.shapes.find(s => s.id === shapeId);
        if (shape) {
            this.selectShape(shape);
        }
    }

    updatePropertiesPanel() {
        if (!this.selectedShape) {
            this.propertiesPanel.innerHTML = '<p>Selecione uma forma para editar suas propriedades</p>';
            return;
        }

        this.shapeForm.innerHTML = `
            <div class="property-group">
                <label for="shape-label">Rótulo:</label>
                <input type="text" id="shape-label" value="${this.selectedShape.properties.label || ''}">
            </div>
            <div class="property-group">
                <label for="shape-fill-color">Cor de Preenchimento:</label>
                <input type="color" id="shape-fill-color" value="${this.selectedShape.properties.fillColor || '#667eea'}">
            </div>
            <div class="property-group">
                <label for="shape-stroke-color">Cor da Borda:</label>
                <input type="color" id="shape-stroke-color" value="${this.selectedShape.properties.strokeColor || '#5a67d8'}">
            </div>
            <div class="property-group">
                <label for="shape-stroke-width">Espessura da Borda:</label>
                <input type="range" id="shape-stroke-width" min="1" max="5" value="${this.selectedShape.properties.strokeWidth || 2}">
                <span id="stroke-width-value">${this.selectedShape.properties.strokeWidth || 2}</span>
            </div>
            <div class="property-group">
                <label for="shape-font-size">Tamanho da Fonte:</label>
                <input type="range" id="shape-font-size" min="8" max="24" value="${this.selectedShape.properties.fontSize || 12}">
                <span id="font-size-value">${this.selectedShape.properties.fontSize || 12}</span>
            </div>
            <div class="property-group">
                <label for="shape-font-color">Cor da Fonte:</label>
                <input type="color" id="shape-font-color" value="${this.selectedShape.properties.fontColor || '#333'}">
            </div>
            <div class="property-group">
                <label for="shape-width">Largura:</label>
                <input type="number" id="shape-width" min="50" max="300" value="${this.selectedShape.width || 100}">
            </div>
            <div class="property-group">
                <label for="shape-height">Altura:</label>
                <input type="number" id="shape-height" min="30" max="200" value="${this.selectedShape.height || 60}">
            </div>
            <button type="submit" class="update-btn">Atualizar Forma</button>
            <button type="button" id="delete-shape-btn" class="delete-btn">Excluir Forma</button>
        `;

        const labelInput = this.shapeForm.querySelector('#shape-label');
        labelInput.addEventListener('input', (e) => {
            this.selectedShape.properties.label = e.target.value;
            this.renderShapes();
        });

        const fillColorInput = this.shapeForm.querySelector('#shape-fill-color');
        fillColorInput.addEventListener('input', (e) => {
            this.selectedShape.properties.fillColor = e.target.value;
            this.renderShapes();
        });

        const strokeColorInput = this.shapeForm.querySelector('#shape-stroke-color');
        strokeColorInput.addEventListener('input', (e) => {
            this.selectedShape.properties.strokeColor = e.target.value;
            this.renderShapes();
        });

        const strokeWidthInput = this.shapeForm.querySelector('#shape-stroke-width');
        strokeWidthInput.addEventListener('input', (e) => {
            this.selectedShape.properties.strokeWidth = parseInt(e.target.value);
            this.shapeForm.querySelector('#stroke-width-value').textContent = e.target.value;
            this.renderShapes();
        });

        const fontSizeInput = this.shapeForm.querySelector('#shape-font-size');
        fontSizeInput.addEventListener('input', (e) => {
            this.selectedShape.properties.fontSize = parseInt(e.target.value);
            this.shapeForm.querySelector('#font-size-value').textContent = e.target.value;
            this.renderShapes();
        });

        const fontColorInput = this.shapeForm.querySelector('#shape-font-color');
        fontColorInput.addEventListener('input', (e) => {
            this.selectedShape.properties.fontColor = e.target.value;
            this.renderShapes();
        });

        const widthInput = this.shapeForm.querySelector('#shape-width');
        widthInput.addEventListener('change', (e) => {
            this.selectedShape.width = parseInt(e.target.value);
            this.renderShapes();
        });

        const heightInput = this.shapeForm.querySelector('#shape-height');
        heightInput.addEventListener('change', (e) => {
            this.selectedShape.height = parseInt(e.target.value);
            this.renderShapes();
        });

        const deleteBtn = this.shapeForm.querySelector('#delete-shape-btn');
        deleteBtn.addEventListener('click', () => {
            this.removeShape(this.selectedShape.id);
        });

        this.shapeForm.onsubmit = (e) => {
            e.preventDefault();
        };
    }

    clearCanvas() {
        if (confirm('Tem certeza que deseja limpar o canvas?')) {
            this.shapes = [];
            this.connections = [];
            this.selectedShape = null;
            this.renderShapes();
            this.updatePropertiesPanel();
        }
    }

    exportDiagram() {
        // Criar SVG para exportação
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', this.canvas.clientWidth);
        svg.setAttribute('height', this.canvas.clientHeight);
        svg.setAttribute('viewBox', `0 0 ${this.canvas.clientWidth} ${this.canvas.clientHeight}`);

        // Adicionar estilos
        const style = document.createElementNS(svgNS, 'style');
        style.textContent = `
            .shape { cursor: move; }
            .connection-point { fill: #667eea; cursor: pointer; }
            .connection-line { stroke: #667eea; stroke-width: 2; fill: none; }
        `;
        svg.appendChild(style);

        // Adicionar formas
        this.shapes.forEach(shape => {
            const g = document.createElementNS(svgNS, 'g');
            g.setAttribute('transform', `translate(${shape.x}, ${shape.y})`);

            const shapeSvg = document.createElementNS(svgNS, 'svg');
            shapeSvg.setAttribute('width', shape.width);
            shapeSvg.setAttribute('height', shape.height);
            shapeSvg.innerHTML = this.shapeDefinitions[shape.type].svg;

            g.appendChild(shapeSvg);

            // Adicionar rótulo se existir
            if (this.selectedShape.properties.label) {
                const text = document.createElementNS(svgNS, 'text');
                text.setAttribute('x', shape.width / 2);
                text.setAttribute('y', shape.height / 2 + 5);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', '#333');
                text.setAttribute('font-family', 'Arial, sans-serif');
                text.setAttribute('font-size', '12');
                text.textContent = this.selectedShape.properties.label;
                g.appendChild(text);
            }

            svg.appendChild(g);
        });

        // Adicionar conexões
        this.connections.forEach(connection => {
            const startShape = this.shapes.find(s => s.id === connection.from);
            const endShape = this.shapes.find(s => s.id === connection.to);

            if (startShape && endShape) {
                const startPoint = this.getConnectionPoint(startShape, connection.fromPoint);
                const endPoint = this.getConnectionPoint(endShape, connection.toPoint);

                const line = document.createElementNS(svgNS, 'line');
                line.setAttribute('x1', startPoint.x);
                line.setAttribute('y1', startPoint.y);
                line.setAttribute('x2', endPoint.x);
                line.setAttribute('y2', endPoint.y);
                line.setAttribute('stroke', '#667eea');
                line.setAttribute('stroke-width', '2');
                line.setAttribute('marker-end', 'url(#arrow)');

                // Definir marcador de seta
                const defs = svg.querySelector('defs') || document.createElementNS(svgNS, 'defs');
                if (!svg.querySelector('defs')) {
                    svg.insertBefore(defs, svg.firstChild);
                }

                let marker = defs.querySelector('#arrow');
                if (!marker) {
                    marker = document.createElementNS(svgNS, 'marker');
                    marker.setAttribute('id', 'arrow');
                    marker.setAttribute('markerWidth', '10');
                    marker.setAttribute('markerHeight', '7');
                    marker.setAttribute('refX', '10');
                    marker.setAttribute('refY', '3.5');
                    marker.setAttribute('orient', 'auto');

                    const path = document.createElementNS(svgNS, 'path');
                    path.setAttribute('d', 'M0,0 L0,7 L10,3.5 z');
                    path.setAttribute('fill', '#667eea');
                    marker.appendChild(path);

                    defs.appendChild(marker);
                }

                svg.appendChild(line);
            }
        });

        // Criar blob e download
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagrama-fluxo.svg';
        a.click();

        URL.revokeObjectURL(url);
    }
}

// Inicializar o gerador quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.flowchart = new FlowchartGenerator();
});