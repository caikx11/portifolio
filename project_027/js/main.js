class FlowchartGenerator {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.propertiesPanel = document.getElementById('properties-panel');
        this.shapeForm = document.getElementById('shape-form');
        this.shapeTextInput = document.getElementById('shape-text');
        this.shapeColorInput = document.getElementById('shape-color');
        this.updateShapeButton = document.getElementById('update-shape');
        this.connectionStyleSelect = document.createElement('select');
        this.groupButton = document.createElement('button');
        this.ungroupButton = document.createElement('button');

        this.shapes = [];
        this.connections = [];
        this.selectedShapes = []; // Array of currently selected shapes
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartShapes = []; // Shapes being dragged
        this.shapeStartPositions = {} // Map of shape ID to start position
        this.isConnecting = false;
        this.connectionStartShape = null;
        this.connectionStartPoint = null;
        this.tempConnection = null;
        this.isEditing = false;
        this.editInput = null;
        this.currentConnectionStyle = 'arrow'; // Default connection style
        this.isGroupMode = false; // Whether we're in group selection mode

        this.init();
    }

    init() {
        // Event listeners for toolbar buttons
        document.getElementById('add-rectangle').addEventListener('click', () => this.addShape('rectangle'));
        document.getElementById('add-diamond').addEventListener('click', () => this.addShape('diamond'));
        document.getElementById('add-oval').addEventListener('click', () => this.addShape('oval'));
        document.getElementById('add-triangle').addEventListener('click', () => this.addShape('triangle'));
        document.getElementById('add-parallelogram').addEventListener('click', () => this.addShape('parallelogram'));
        document.getElementById('add-arrow').addEventListener('click', () => this.addShape('arrow'));
        document.getElementById('delete-shape').addEventListener('click', () => this.deleteSelectedShapes());
        document.getElementById('clear-all').addEventListener('click', () => this.clearAll());
        document.getElementById('save-diagram').addEventListener('click', () => this.saveDiagram());
        document.getElementById('load-diagram').addEventListener('click', () => this.loadDiagram());
        document.getElementById('export-diagram').addEventListener('click', () => this.exportDiagram());

        // Add connection style selector to toolbar
        this.addConnectionStyleSelector();

        // Add grouping buttons to toolbar
        this.addGroupingButtons();

        // Event listeners for shape properties
        this.shapeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateSelectedShapes();
        });

        // Canvas event listeners
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));

        // Global key listeners for group selection
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Control' || e.key === 'Meta') {
                this.isGroupMode = true;
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Control' || e.key === 'Meta') {
                this.isGroupMode = false;
            }
        });

        // Update properties panel visibility
        this.updatePropertiesPanel();

        // Load any saved diagram on init
        this.loadDiagram();
    }

    addConnectionStyleSelector() {
        const toolbar = document.querySelector('.toolbar');
        const label = document.createElement('label');
        label.textContent = 'Estilo da conexão: ';
        label.style.marginRight = '5px';
        label.style.fontSize = '1rem';
        label.style.color = '#333';

        this.connectionStyleSelect.innerHTML = `
            <option value="arrow">Seta</option>
            <option value="line">Linha</option>
            <option value="dashed">Tracejada</option>
            <option value="dotted">Pontilhada</option>
        `;
        this.connectionStyleSelect.style.padding = '5px';
        this.connectionStyleSelect.style.borderRadius = '4px';
        this.connectionStyleSelect.style.border = '1px solid #ddd';
        this.connectionStyleSelect.addEventListener('change', (e) => {
            this.currentConnectionStyle = e.target.value;
        });

        toolbar.insertBefore(label, toolbar.firstChild);
        toolbar.insertBefore(this.connectionStyleSelect, toolbar.firstChild.nextSibling);
    }

    addGroupingButtons() {
        const toolbar = document.querySelector('.toolbar');

        this.groupButton.textContent = 'Agrupar';
        this.groupButton.id = 'group-shapes';
        this.groupButton.style.padding = '12px 20px';
        this.groupButton.style.border = 'none';
        this.groupButton.style.borderRadius = '6px';
        this.groupButton.style.cursor = 'pointer';
        this.groupButton.style.fontSize = '1rem';
        this.groupButton.style.backgroundColor = '#9b59b6';
        this.groupButton.style.color = 'white';
        this.groupButton.addEventListener('click', () => this.groupSelectedShapes());

        this.ungroupButton.textContent = 'Desagrupar';
        this.ungroupButton.id = 'ungroup-shapes';
        this.ungroupButton.style.padding = '12px 20px';
        this.ungroupButton.style.border = 'none';
        this.ungroupButton.style.borderRadius = '6px';
        this.ungroupButton.style.cursor = 'pointer';
        this.ungroupButton.style.fontSize = '1rem';
        this.ungroupButton.style.backgroundColor = '#8e44ad';
        this.ungroupButton.style.color = 'white';
        this.ungroupButton.style.marginLeft = '10px';
        this.ungroupButton.addEventListener('click', () => this.ungroupSelectedShapes());

        toolbar.appendChild(this.groupButton);
        toolbar.appendChild(this.ungroupButton);
    }

    addShape(type) {
        // Define dimensions based on shape type
        let width = 120;
        let height = 60;

        if (type === 'triangle' || type === 'arrow') {
            width = 100;
            height = 80;
        } else if (type === 'parallelogram') {
            width = 120;
            height = 60;
        } else if (type === 'oval') {
            width = 100;
            height = 60;
        }

        const shape = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            type: type,
            x: 100,
            y: 100,
            width: width,
            height: height,
            text: `Forma ${type}`,
            color: '#3498db',
            connections: [], // Array of connection IDs
            groupId: null // To track grouping
        };

        this.shapes.push(shape);
        this.selectShape(shape);
        this.render();
    }

    selectShape(shape) {
        // Handle single or multi-selection
        if (this.isGroupMode) {
            if (!this.selectedShapes.includes(shape)) {
                this.selectedShapes.push(shape);
                shape.selected = true;
            } else {
                // Deselect if already selected in group mode
                this.selectedShapes = this.selectedShapes.filter(s => s !== shape);
                shape.selected = false;
            }
        } else {
            // If the shape is part of a group, select the entire group
            if (shape.groupId) {
                this.shapes.forEach(s => s.selected = false);
                this.selectedShapes = this.shapes.filter(s => s.groupId === shape.groupId);
                this.selectedShapes.forEach(s => s.selected = true);
            } else {
                // Normal single selection
                this.shapes.forEach(s => s.selected = false);
                shape.selected = true;
                this.selectedShapes = [shape];
            }
        }

        // Update properties panel
        this.updatePropertiesPanel();
        this.render();
    }

    deselectShapes() {
        this.shapes.forEach(s => s.selected = false);
        this.selectedShapes = [];
        this.updatePropertiesPanel();
        this.render();
    }

    updatePropertiesPanel() {
        if (this.selectedShapes.length === 1) {
            this.shapeTextInput.value = this.selectedShapes[0].text;
            this.shapeColorInput.value = this.selectedShapes[0].color;
            this.propertiesPanel.style.display = 'block';
        } else if (this.selectedShapes.length > 1) {
            this.shapeTextInput.value = ''; // In Batch mode, clear text
            this.shapeColorInput.value = this.selectedShapes[0].color;
            this.propertiesPanel.style.display = 'block';
        } else {
            this.propertiesPanel.style.display = 'none';
        }
    }

    updateSelectedShapes() {
        if (this.selectedShapes.length > 0) {
            this.selectedShapes.forEach(shape => {
                if (this.shapeTextInput.value) {
                    shape.text = this.shapeTextInput.value;
                }
                shape.color = this.shapeColorInput.value;
            });
            this.render();
        }
    }

    deleteSelectedShapes() {
        if (this.selectedShapes.length > 0) {
            if (confirm(`Tem certeza que deseja excluir ${this.selectedShapes.length} forma(s)?`)) {
                const selectedIds = this.selectedShapes.map(s => s.id);

                // Remove connections associated with these shapes
                this.connections = this.connections.filter(
                    conn => !selectedIds.includes(conn.startShapeId) && !selectedIds.includes(conn.endShapeId)
                );

                // Remove the shapes
                this.shapes = this.shapes.filter(shape => !selectedIds.includes(shape.id));
                this.selectedShapes = [];
                this.updatePropertiesPanel();
                this.render();
            }
        }
    }

    groupSelectedShapes() {
        if (this.selectedShapes.length > 1) {
            const newGroupId = Date.now();
            this.selectedShapes.forEach(shape => {
                shape.groupId = newGroupId;
            });
            alert(`${this.selectedShapes.length} formas foram agrupadas!`);
            this.render();
        } else {
            alert('Selecione pelo menos duas formas para agrupar (segure Ctrl/Cmd ao clicar).');
        }
    }

    ungroupSelectedShapes() {
        let count = 0;
        this.selectedShapes.forEach(shape => {
            if (shape.groupId) {
                shape.groupId = null;
                count++;
            }
        });
        if (count > 0) {
            alert(`${count} forma(s) foram desagrupadas.`);
            this.render();
        } else {
            alert('Nenhuma das formas selecionadas pertence a um grupo.');
        }
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicked on a shape
        const clickedShape = this.getShapeAtPosition(x, y);

        if (clickedShape) {
            // Check if Shift key is pressed for connection mode
            if (e.shiftKey) {
                // Start connection
                this.isConnecting = true;
                this.connectionStartShape = clickedShape;
                this.connectionStartPoint = { x, y };

                // Create temporary connection line
                this.tempConnection = {
                    startX: x,
                    startY: y,
                    endX: x,
                    endY: y
                };

                // Select the starting shape
                this.selectShape(clickedShape);
            } else {
                // Select the shape (handles group mode internally)
                this.selectShape(clickedShape);

                // Start dragging all selected shapes
                this.isDragging = true;
                this.dragStartX = x;
                this.dragStartY = y;
                this.dragStartShapes = [...this.selectedShapes];
                this.shapeStartPositions = {};
                this.dragStartShapes.forEach(shape => {
                    this.shapeStartPositions[shape.id] = { x: shape.x, y: shape.y };
                });
            }
        } else {
            // Clicked on empty space - deselect shape
            this.deselectShapes();
            // Cancel any ongoing connection
            if (this.isConnecting) {
                this.cancelConnection();
            }
        }
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Handle connection drawing
        if (this.isConnecting && this.tempConnection) {
            this.tempConnection.endX = x;
            this.tempConnection.endY = y;
            this.render();
            return;
        }

        // Handle shape dragging
        if (!this.isDragging || this.dragStartShapes.length === 0) return;

        const dx = x - this.dragStartX;
        const dy = y - this.dragStartY;

        this.dragStartShapes.forEach(shape => {
            const startPos = this.shapeStartPositions[shape.id];
            if (startPos) {
                shape.x = startPos.x + dx;
                shape.y = startPos.y + dy;

                // Keep shape within canvas bounds
                shape.x = Math.max(0, Math.min(shape.x, this.canvas.width - shape.width));
                shape.y = Math.max(0, Math.min(shape.y, this.canvas.height - shape.height));
            }
        });

        // Also update any connections attached to the moving shapes
        this.updateConnectionsForMovedShapes(this.dragStartShapes);

        this.render();
    }

    onMouseUp(e) {
        this.isDragging = false;

        // Handle connection completion
        if (this.isConnecting) {
            this.isConnecting = false;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check if we released over a shape
            const endShape = this.getShapeAtPosition(x, y);

            // Only create connection if we started and ended on different shapes
            if (endShape && endShape !== this.connectionStartShape) {
                // Calculate connection points (center of shapes)
                const startX = this.connectionStartShape.x + this.connectionStartShape.width / 2;
                const startY = this.connectionStartShape.y + this.connectionStartShape.height / 2;
                const endX = endShape.x + endShape.width / 2;
                const endY = endShape.y + endShape.height / 2;

                // Add connection to the list
                this.connections.push({
                    id: Date.now(),
                    startShapeId: this.connectionStartShape.id,
                    endShapeId: endShape.id,
                    startX: startX,
                    startY: startY,
                    endX: endX,
                    endY: endY,
                    style: this.currentConnectionStyle
                });

                // Update shape connection lists
                this.connectionStartShape.connections.push(endShape.id);
                endShape.connections.push(this.connectionStartShape.id);

                // Select the end shape
                this.selectShape(endShape);
            }

            // Clean up temporary connection
            this.cancelConnection();
        }
    }

    onDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicked on a shape
        const clickedShape = this.getShapeAtPosition(x, y);

        if (clickedShape) {
            this.selectShape(clickedShape);
            this.startInlineEditing(clickedShape, x, y);
        }
    }

    startInlineEditing(shape, x, y) {
        if (this.isEditing) return;

        this.isEditing = true;

        // Create input element
        this.editInput = document.createElement('input');
        this.editInput.type = 'text';
        this.editInput.value = shape.text;
        this.editInput.style.position = 'absolute';
        this.editInput.style.left = `${shape.x}px`;
        this.editInput.style.top = `${shape.y}px`;
        this.editInput.style.width = `${shape.width}px`;
        this.editInput.style.height = `${shape.height}px`;
        this.editInput.style.border = 'none';
        this.editInput.style.background = 'rgba(255,255,255,0.8)';
        this.editInput.style.color = shape.color === '#3498db' || shape.color === '#2ecc71' ? 'white' : 'black';
        this.editInput.style.textAlign = 'center';
        this.editInput.style.fontSize = '1rem';
        this.editInput.style.padding = '10px';
        this.editInput.style.boxSizing = 'border-box';
        this.editInput.style.zIndex = '30';
        this.editInput.style.borderRadius = shape.type === 'diamond' || shape.type === 'triangle' || shape.type === 'arrow' || shape.type === 'oval' ? '8px' : '8px';

        // Special styling for diamond and triangle shapes
        if (shape.type === 'diamond') {
            this.editInput.style.transform = 'rotate(-45deg)';
            this.editInput.style.transformOrigin = 'center';
        } else if (shape.type === 'triangle') {
            this.editInput.style.position = 'absolute';
            this.editInput.style.left = `${shape.x - 10}px`;
            this.editInput.style.top = `${shape.y + 25}px`;
            this.editInput.style.width = '120px';
            this.editInput.style.textAlign = 'center';
        } else if (shape.type === 'arrow') {
            this.editInput.style.position = 'absolute';
            this.editInput.style.left = `${shape.x - 15}px`;
            this.editInput.style.top = `${shape.y}px`;
            this.editInput.style.width = '60px';
            this.editInput.style.textAlign = 'center';
        }

        this.canvas.appendChild(this.editInput);
        this.editInput.focus();
        this.editInput.select();

        // Handle enter key or blur
        this.editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.stopInlineEditing();
            }
        });

        this.editInput.addEventListener('blur', () => {
            this.stopInlineEditing();
        });
    }

    stopInlineEditing() {
        if (!this.isEditing || !this.editInput) return;

        // Update shape text
        if (this.selectedShape) {
            this.selectedShape.text = this.editInput.value;
            this.render();
        }

        // Remove input element
        this.canvas.removeChild(this.editInput);
        this.editInput = null;
        this.isEditing = false;
    }

    getShapeAtPosition(x, y) {
        // Check shapes in reverse order (topmost first)
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            if (x >= shape.x && x <= shape.x + shape.width &&
                y >= shape.y && y <= shape.y + shape.height) {
                return shape;
            }
        }
        return null;
    }

    clearAll() {
        if (confirm('Tem certeza que deseja limpar todas as formas e conexões?')) {
            this.shapes = [];
            this.connections = [];
            this.selectedShape = null;
            this.cancelConnection();
            this.updatePropertiesPanel();
            this.render();
        }
    }

    cancelConnection() {
        this.isConnecting = false;
        this.connectionStartShape = null;
        this.connectionStartPoint = null;
        this.tempConnection = null;
        this.render();
    }

    updateConnectionsForMovedShapes(shapes) {
        // When shapes are moved, we need to update connection endpoints
        // Since we re-render all connections from scratch each frame,
        // we just need to make sure the connection data is current
        // The actual positions are calculated during render
        shapes.forEach(shape => {
            this.connections.forEach(conn => {
                if (conn.startShapeId === shape.id || conn.endShapeId === shape.id) {
                    // Connection will be updated during next render
                    // No action needed here since we recalculate positions in render()
                }
            });
        });
    }

    saveDiagram() {
        // Create a simple representation of the diagram
        const diagramData = {
            shapes: this.shapes.map(shape => ({
                id: shape.id,
                type: shape.type,
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height,
                text: shape.text,
                color: shape.color
            })),
            connections: this.connections
        };

        // Save to localStorage
        localStorage.setItem('flowchartDiagram', JSON.stringify(diagramData));
        alert('Diagrama salvo com sucesso!');
    }

    loadDiagram() {
        const savedData = localStorage.getItem('flowchartDiagram');
        if (savedData) {
            try {
                const diagramData = JSON.parse(savedData);
                this.shapes = diagramData.shapes.map(shape => ({
                    ...shape,
                    selected: false,
                    connections: []
                }));
                this.connections = diagramData.connections || [];
                this.render();

                // Select first shape if any exist
                if (this.shapes.length > 0) {
                    this.selectShape(this.shapes[0]);
                }
            } catch (error) {
                console.error('Erro ao carregar diagrama:', error);
                alert('Erro ao carregar o diagrama salvo.');
            }
        }
    }

    exportDiagram() {
        // Use html2canvas to capture the canvas and export as PNG
        html2canvas(this.canvas, {
            backgroundColor: null,
            useCORS: true
        }).then(canvas => {
            // Create a link to download the image
            const link = document.createElement('a');
            link.download = 'diagrama-fluxo.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(error => {
            console.error('Erro ao exportar diagrama:', error);
            alert('Erro ao exportar o diagrama. Por favor, tente novamente.');
        });
    }

    render() {
        // Clear canvas
        this.canvas.innerHTML = '';

        // Set canvas size to match container
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        // Render connections first (so they appear behind shapes)
        this.renderConnections();

        // Render shapes
        this.shapes.forEach(shape => this.renderShape(shape));
    }

    renderShape(shape) {
        const shapeElement = document.createElement('div');
        shapeElement.className = `shape ${shape.type}`;
        shapeElement.style.left = `${shape.x}px`;
        shapeElement.style.top = `${shape.y}px`;
        shapeElement.style.width = `${shape.width}px`;
        shapeElement.style.height = `${shape.height}px`;
        shapeElement.style.backgroundColor = shape.color;
        shapeElement.textContent = shape.text;

        if (shape.selected) {
            shapeElement.classList.add('selected');
        }

        this.canvas.appendChild(shapeElement);
    }

    renderConnections() {
        // Render saved connections
        this.connections.forEach(connection => {
            const connectionElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            connectionElement.className = 'connection';
            connectionElement.style.position = 'absolute';
            connectionElement.style.top = '0';
            connectionElement.style.left = '0';
            connectionElement.style.width = '100%';
            connectionElement.style.height = '100%';
            connectionElement.style.pointerEvents = 'none';
            connectionElement.style.zIndex = '5';

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', connection.startX);
            line.setAttribute('y1', connection.startY);
            line.setAttribute('x2', connection.endX);
            line.setAttribute('y2', connection.endY);
            line.setAttribute('stroke', '#95a5a6');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('fill', 'none');

            // Apply connection style based on connection.style property or default to arrow
            const style = connection.style || 'arrow';
            if (style === 'arrow') {
                line.setAttribute('marker-end', 'url(#arrowhead)');
            } else if (style === 'dashed') {
                line.setAttribute('stroke-dasharray', '5,5');
            } else if (style === 'dotted') {
                line.setAttribute('stroke-dasharray', '2,2');
            }
            // 'line' style has no special attributes

            // Create markers if they don't exist
            this.createConnectionMarkers();

            connectionElement.appendChild(line);
            this.canvas.appendChild(connectionElement);
        });

        // Render temporary connection while drawing
        if (this.tempConnection) {
            const tempElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            tempElement.className = 'connection temp';
            tempElement.style.position = 'absolute';
            tempElement.style.top = '0';
            tempElement.style.left = '0';
            tempElement.style.width = '100%';
            tempElement.style.height = '100%';
            tempElement.style.pointerEvents = 'none';
            tempElement.style.zIndex = '5';

            const tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tempLine.setAttribute('x1', this.tempConnection.startX);
            tempLine.setAttribute('y1', this.tempConnection.startY);
            tempLine.setAttribute('x2', this.tempConnection.endX);
            tempLine.setAttribute('y2', this.tempConnection.endY);
            tempLine.setAttribute('stroke', '#e74c3c');
            tempLine.setAttribute('stroke-width', '2');
            tempLine.setAttribute('stroke-dasharray', '5,5');
            tempLine.setAttribute('fill', 'none');

            // Apply current connection style to temporary connection
            if (this.currentConnectionStyle === 'arrow') {
                tempLine.setAttribute('marker-end', 'url(#arrowhead)');
            } else if (this.currentConnectionStyle === 'dashed') {
                tempLine.setAttribute('stroke-dasharray', '5,5');
            } else if (this.currentConnectionStyle === 'dotted') {
                tempLine.setAttribute('stroke-dasharray', '2,2');
            }
            // 'line' style has no special attributes

            tempElement.appendChild(tempLine);
            this.canvas.appendChild(tempElement);
        }
    }

    createConnectionMarkers() {
        // Create arrow marker if it doesn't exist
        if (!document.getElementById('arrowhead')) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', 'arrowhead');
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '7');
            marker.setAttribute('refX', '10');
            marker.setAttribute('refY', '3.5');
            marker.setAttribute('orient', 'auto');
            const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            markerPath.setAttribute('d', 'M0,0 L0,7 L10,3.5 z');
            markerPath.setAttribute('fill', '#95a5a6');
            marker.appendChild(markerPath);
            defs.appendChild(marker);

            // Create a temporary SVG element to hold the defs
            const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            tempSvg.appendChild(defs);
            document.body.appendChild(tempSvg);
        }
    }
}

// Initialize the flowchart generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.flowchart = new FlowchartGenerator();

    // Try to load any saved diagram
    window.flowchart.loadDiagram();
});