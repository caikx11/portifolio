// Simulador de Eletrônica Básica
class CircuitSimulator {
    constructor() {
        this.components = [];
        this.wires = [];
        this.selectedComponent = null;
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.connectionMode = false;
        this.connectionStart = null;
        this.connectionEndTemp = null;
        this.simulationResults = {};
        this.isSimulating = false;
        this.simulationTime = 0; // Current simulation time in seconds
        this.lastUpdateTime = 0; // Last time we updated the simulation
        this.gridSize = 20; // Snap-to-grid
        this.showGrid = true;

        // Load components
        this.loadComponentDefinitions();

        // Setup event listeners
        this.setupEventListeners();

        // Initial render
        this.render();

        // Start animation loop
        this.animate();

        // Auto-load saved circuit
        this.loadFromLocalStorage();
    }

    loadComponentDefinitions() {
        // Load component definitions from JSON files
        const componentFiles = ['led', 'resistor', 'battery', 'wire', 'capacitor', 'inductor', 'transistor', 'switch'];
        this.componentDefinitions = {};

        // Load synchronously for simplicity
        componentFiles.forEach(file => {
            try {
                // In a real implementation, we'd fetch these files
                // For now, we'll define them directly
                switch(file) {
                    case 'led':
                        this.componentDefinitions.led = {
                            "id": "led",
                            "name": "LED",
                            "type": "output",
                            "symbol": "⬤",
                            "color": "#ff0000",
                            "properties": [
                                {
                                    "name": "voltage",
                                    "label": "Tensão (V)",
                                    "type": "number",
                                    "default": 2.0,
                                    "min": 1.8,
                                    "max": 3.3,
                                    "step": 0.1
                                },
                                {
                                    "name": "current",
                                    "label": "Corrente (mA)",
                                    "type": "number",
                                    "default": 20,
                                    "min": 5,
                                    "max": 50,
                                    "step": 1
                                }
                            ],
                            "connections": [
                                {
                                    "name": "anode",
                                    "label": "Ânodo (+)",
                                    "type": "input"
                                },
                                {
                                    "name": "cathode",
                                    "label": "Cátodo (-)",
                                    "type": "output"
                                }
                            ],
                            "description": "Diodo emissor de luz que emite luz quando polarizado diretamente"
                        };
                        break;
                    case 'resistor':
                        this.componentDefinitions.resistor = {
                            "id": "resistor",
                            "name": "Resistor",
                            "type": "passive",
                            "symbol": "╳",
                            "color": "#8B4513",
                            "properties": [
                                {
                                    "name": "resistance",
                                    "label": "Resistência (Ω)",
                                    "type": "number",
                                    "default": 220,
                                    "min": 1,
                                    "max": 10000,
                                    "step": 1
                                },
                                {
                                    "name": "power",
                                    "label": "Potência (W)",
                                    "type": "number",
                                    "default": 0.25,
                                    "min": 0.125,
                                    "max": 2,
                                    "step": 0.125
                                }
                            ],
                            "connections": [
                                {
                                    "name": "terminal1",
                                    "label": "Terminal 1",
                                    "type": "bidirectional"
                                },
                                {
                                    "name": "terminal2",
                                    "label": "Terminal 2",
                                    "type": "bidirectional"
                                }
                            ],
                            "description": "Componente que limita a corrente elétrica em um circuito"
                        };
                        break;
                    case 'battery':
                        this.componentDefinitions.battery = {
                            "id": "battery",
                            "name": "Bateria",
                            "type": "power",
                            "symbol": "⎓",
                            "color": "#006400",
                            "properties": [
                                {
                                    "name": "voltage",
                                    "label": "Tensão (V)",
                                    "type": "number",
                                    "default": 9.0,
                                    "min": 1.5,
                                    "max": 24,
                                    "step": 0.1
                                },
                                {
                                    "name": "capacity",
                                    "label": "Capacidade (mAh)",
                                    "type": "number",
                                    "default": 500,
                                    "min": 100,
                                    "max": 5000,
                                    "step": 100
                                }
                            ],
                            "connections": [
                                {
                                    "name": "positive",
                                    "label": "Positivo (+)",
                                    "type": "output"
                                },
                                {
                                    "name": "negative",
                                    "label": "Negativo (-)",
                                    "type": "input"
                                }
                            ],
                            "description": "Fonte de tensão contínua que fornece energia ao circuito"
                        };
                        break;
                    case 'wire':
                        this.componentDefinitions.wire = {
                            "id": "wire",
                            "name": "Fio",
                            "type": "connection",
                            "symbol": "─",
                            "color": "#000000",
                            "properties": [],
                            "connections": [
                                {
                                    "name": "end1",
                                    "label": "Extremidade 1",
                                    "type": "bidirectional"
                                },
                                {
                                    "name": "end2",
                                    "label": "Extremidade 2",
                                    "type": "bidirectional"
                                }
                            ],
                            "description": "Condutor elétrico que conecta componentes em um circuito"
                        };
                        break;
                    case 'capacitor':
                        this.componentDefinitions.capacitor = {
                            "id": "capacitor",
                            "name": "Capacitor",
                            "type": "passive",
                            "symbol": "||",
                            "color": "#9400D3",
                            "properties": [
                                {
                                    "name": "capacitance",
                                    "label": "Capacitância (µF)",
                                    "type": "number",
                                    "default": 1.0,
                                    "min": 0.1,
                                    "max": 1000,
                                    "step": 0.1
                                },
                                {
                                    "name": "voltageRating",
                                    "label": "Tensão de Trabalho (V)",
                                    "type": "number",
                                    "default": 25,
                                    "min": 6.3,
                                    "max": 100,
                                    "step": 0.1
                                }
                            ],
                            "connections": [
                                {
                                    "name": "terminal1",
                                    "label": "Terminal 1",
                                    "type": "bidirectional"
                                },
                                {
                                    "name": "terminal2",
                                    "label": "Terminal 2",
                                    "type": "bidirectional"
                                }
                            ],
                            "description": "Componente que armazena energia elétrica em campo eletrostático"
                        };
                        break;
                    case 'inductor':
                        this.componentDefinitions.inductor = {
                            "id": "inductor",
                            "name": "Indutor",
                            "type": "passive",
                            "symbol": "╲",
                            "color": "#FF8C00",
                            "properties": [
                                {
                                    "name": "inductance",
                                    "label": "Indutância (mH)",
                                    "type": "number",
                                    "default": 10,
                                    "min": 0.1,
                                    "max": 1000,
                                    "step": 0.1
                                },
                                {
                                    "name": "resistance",
                                    "label": "Resistência Parasítica (Ω)",
                                    "type": "number",
                                    "default": 0.1,
                                    "min": 0,
                                    "max": 10,
                                    "step": 0.01
                                }
                            ],
                            "connections": [
                                {
                                    "name": "terminal1",
                                    "label": "Terminal 1",
                                    "type": "bidirectional"
                                },
                                {
                                    "name": "terminal2",
                                    "label": "Terminal 2",
                                    "type": "bidirectional"
                                }
                            ],
                            "description": "Componente que armazena energia em campo magnético e opõe-se a mudanças de corrente"
                        };
                        break;
                    case 'transistor':
                        this.componentDefinitions.transistor = {
                            "id": "transistor",
                            "name": "Transistor NPN",
                            "type": "semiconductor",
                            "symbol": "Q",
                            "color": "#800080",
                            "properties": [
                                {
                                    "name": "beta",
                                    "label": "Ganho de Corrente (β)",
                                    "type": "number",
                                    "default": 100,
                                    "min": 10,
                                    "max": 500,
                                    "step": 1
                                },
                                {
                                    "name": "vbe",
                                    "label": "Tensão Base-Emissor (V)",
                                    "type": "number",
                                    "default": 0.7,
                                    "min": 0.5,
                                    "max": 1.2,
                                    "step": 0.05
                                }
                            ],
                            "connections": [
                                {
                                    "name": "collector",
                                    "label": "Coletor (C)",
                                    "type": "output"
                                },
                                {
                                    "name": "base",
                                    "label": "Base (B)",
                                    "type": "input"
                                },
                                {
                                    "name": "emitter",
                                    "label": "Emissor (E)",
                                    "type": "output"
                                }
                            ],
                            "description": "Transistor bipolar de junção NPN para amplificação e comutação"
                        };
                        break;
                    case 'switch':
                        this.componentDefinitions.switch = {
                            "id": "switch",
                            "name": "Chave SPST",
                            "type": "mechanical",
                            "symbol": "S",
                            "color": "#654321",
                            "properties": [
                                {
                                    "name": "state",
                                    "label": "Estado",
                                    "type": "select",
                                    "options": ["Aberto", "Fechado"],
                                    "default": "Fechado"
                                }
                            ],
                            "connections": [
                                {
                                    "name": "terminal1",
                                    "label": "Terminal 1",
                                    "type": "bidirectional"
                                },
                                {
                                    "name": "terminal2",
                                    "label": "Terminal 2",
                                    "type": "bidirectional"
                                }
                            ],
                            "description": "Chave unipolar unijetado para abrir ou fechar circuitos"
                        };
                        break;
                }
            } catch (error) {
                console.error(`Error loading ${file}.json:`, error);
            }
        });

        this.renderComponentPanel();
    }

    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
        this.canvas.addEventListener('dragover', (e) => { e.preventDefault(); this.canvas.classList.add('dragover'); });
        this.canvas.addEventListener('dragleave', (e) => this.canvas.classList.remove('dragover'));
        this.canvas.addEventListener('drop', (e) => this.onCanvasDrop(e));

        // Touch support: map single-finger gestures to the mouse handlers
        const touchPt = (e) => ({ clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY });
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.onMouseDown(touchPt(e)); }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.onMouseMove(touchPt(e)); }, { passive: false });
        this.canvas.addEventListener('touchend', (e) => { e.preventDefault(); this.onMouseUp(touchPt(e)); }, { passive: false });

        // Keep the drawing buffer equal to the CSS size so pointer coordinates stay 1:1
        this.resizeCanvas = () => {
            const w = Math.max(200, Math.floor(this.canvas.clientWidth));
            const h = Math.max(200, Math.floor(this.canvas.clientHeight));
            if (this.canvas.width !== w) this.canvas.width = w;
            if (this.canvas.height !== h) this.canvas.height = h;
        };
        window.addEventListener('resize', this.resizeCanvas);
        this.resizeCanvas();

        // Toolbar buttons
        document.getElementById('clear-circuit').addEventListener('click', () => this.clearCircuit());
        document.getElementById('run-simulation').addEventListener('click', () => this.runSimulation());
        document.getElementById('stop-simulation').addEventListener('click', () => this.stopSimulation());
        document.getElementById('save-circuit').addEventListener('click', () => this.saveCircuit());
        document.getElementById('load-circuit').addEventListener('click', () => this.loadCircuit());
        document.getElementById('export-circuit').addEventListener('click', () => this.exportCircuit());

        // Properties form
        document.getElementById('component-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateComponentProperties();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking on a component
        const clickedComponent = this.getComponentAtPosition(x, y);
        if (clickedComponent) {
            this.selectedComponent = clickedComponent;
            this.isDragging = true;
            this.dragOffset = {
                x: x - clickedComponent.x,
                y: y - clickedComponent.y
            };
            this.render();
            return;
        }

        // Check if clicking on a connection point
        const clickedConnection = this.getConnectionPointAtPosition(x, y);
        if (clickedConnection) {
            this.connectionMode = true;
            this.connectionStart = clickedConnection;
            this.render();
            return;
        }

        // Click on empty canvas: place the component chosen in the panel (tap-to-place), else deselect
        if (this.selectedComponentId && this.componentDefinitions[this.selectedComponentId]) {
            const px = Math.round(x / this.gridSize) * this.gridSize;
            const py = Math.round(y / this.gridSize) * this.gridSize;
            this.addComponent(this.selectedComponentId, px, py);
            this.selectedComponentId = null;
            document.querySelectorAll('.component-item.active').forEach(n => n.classList.remove('active'));
            this.render();
            return;
        }
        this.selectedComponent = null;
        this.render();
    }

    onMouseMove(e) {
        if (!this.isDragging && !this.connectionMode) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.isDragging && this.selectedComponent) {
            // Apply snap-to-grid
            const newX = x - this.dragOffset.x;
            const newY = y - this.dragOffset.y;
            this.selectedComponent.x = Math.round(newX / this.gridSize) * this.gridSize;
            this.selectedComponent.y = Math.round(newY / this.gridSize) * this.gridSize;
            this.render();
        }

        if (this.connectionMode && this.connectionStart) {
            this.connectionEndTemp = { x, y };
            this.render();
        }
    }

    onMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.selectedComponent = null;
        }

        if (this.connectionMode && this.connectionStart) {
            this.connectionMode = false;
            // Create wire between connection points if valid
            const endConnection = this.getConnectionPointAtPosition(
                this.connectionEndTemp.x,
                this.connectionEndTemp.y
            );

            if (endConnection &&
                endConnection.component !== this.connectionStart.component &&
                this.isValidConnection(this.connectionStart, endConnection)) {
                this.createWire(this.connectionStart, endConnection);
            }

            this.connectionStart = null;
            this.connectionEndTemp = null;
        }

        this.render();
    }

    onMouseLeave(e) {
        if (this.isDragging) {
            this.isDragging = false;
        }

        if (this.connectionMode) {
            this.connectionMode = false;
            this.connectionStart = null;
            this.connectionEndTemp = null;
        }

        this.render();
    }

    onCanvasDrop(e) {
        e.preventDefault();
        this.canvas.classList.remove('dragover');

        const componentId = e.dataTransfer.getData('text/plain');
        if (!componentId || !this.componentDefinitions[componentId]) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const snappedX = Math.round(x / this.gridSize) * this.gridSize;
        const snappedY = Math.round(y / this.gridSize) * this.gridSize;

        this.addComponent(componentId, snappedX, snappedY);
    }

    getComponentAtPosition(x, y) {
        // Check components in reverse order (topmost first)
        for (let i = this.components.length - 1; i >= 0; i--) {
            const comp = this.components[i];
            if (x >= comp.x && x <= comp.x + comp.width &&
                y >= comp.y && y <= comp.y + comp.height) {
                return comp;
            }
        }
        return null;
    }

    getConnectionPointAtPosition(x, y) {
        const tolerance = 15;
        for (const comp of this.components) {
            // Define 4 connection points: top, right, bottom, left
            const points = [
                {
                    x: comp.x + comp.width / 2,
                    y: comp.y,
                    component: comp,
                    connection: { name: 'top', type: 'bidirectional' },
                    type: 'top'
                },
                {
                    x: comp.x + comp.width,
                    y: comp.y + comp.height / 2,
                    component: comp,
                    connection: { name: 'right', type: 'bidirectional' },
                    type: 'right'
                },
                {
                    x: comp.x + comp.width / 2,
                    y: comp.y + comp.height,
                    component: comp,
                    connection: { name: 'bottom', type: 'bidirectional' },
                    type: 'bottom'
                },
                {
                    x: comp.x,
                    y: comp.y + comp.height / 2,
                    component: comp,
                    connection: { name: 'left', type: 'bidirectional' },
                    type: 'left'
                }
            ];

            for (const point of points) {
                if (Math.abs(x - point.x) < tolerance && Math.abs(y - point.y) < tolerance) {
                    return {
                        component: point.component,
                        connection: point.connection,
                        x: point.x,
                        y: point.y,
                        type: point.type
                    };
                }
            }
        }
        return null;
    }

    isValidConnection(start, end) {
        // Prevent connecting a component to itself
        if (start.component === end.component) {
            return false;
        }

        // Prevent connecting output to output or input to input
        // For simplicity, we'll allow any connection for now
        // In a more advanced version, we'd check connection types
        return true;
    }

    createWire(start, end) {
        const wire = {
            id: `wire-${Date.now()}`,
            start: {
                x: start.x,
                y: start.y,
                componentId: start.component.id,
                connectionName: start.connection.name
            },
            end: {
                x: end.x,
                y: end.y,
                componentId: end.component.id,
                connectionName: end.connection.name
            }
        };

        // Update component connections
        const startComp = start.component;
        const endComp = end.component;

        // Find and update the connection objects
        const startConn = startComp.connections.find(c => c.name === start.connection.name);
        const endConn = endComp.connections.find(c => c.name === end.connection.name);

        if (startConn) {
            startConn.connectedTo = wire.id;
            startConn.connectedComponent = endComp.id;
            startConn.connectedConnection = end.connection.name;
        }
        if (endConn) {
            endConn.connectedTo = wire.id;
            endConn.connectedComponent = startComp.id;
            endConn.connectedConnection = start.connection.name;
        }

        this.wires.push(wire);
        this.render();
    }

    runSimulation() {
        if (this.components.length === 0) {
            alert('Adicione componentes ao circuito antes de simular.');
            return;
        }

        this.isSimulating = true;
        this.simulationTime = 0;
        this.lastUpdateTime = 0;
        this.calculateCircuitValues();
        this.showSimulationResults();
    }

    stopSimulation() {
        this.isSimulating = false;
        this.hideSimulationResults();
    }

    /**
     * Perform nodal analysis to solve for node voltages in the circuit
     * Simplified implementation to avoid scope/undefined-reference bugs
     */
    performNodalAnalysis() {
        const nodeVoltages = new Map();
        const branchCurrents = new Map();
        const powerConsumption = {};
        const terminalWires = new Map();

        // Initialize all nodes to 0V
        this.components.forEach(comp => {
            comp.connections.forEach(conn => {
                const nodeKey = `${comp.id}:${conn.name}`;
                if (!nodeVoltages.has(nodeKey)) {
                    nodeVoltages.set(nodeKey, 0);
                }
            });
        });

        // Set battery voltages
        this.components.forEach(comp => {
            if (comp.definition.id === 'battery') {
                const voltage = comp.properties.voltage || 9;
                const posKey = `${comp.id}:positive`;
                const negKey = `${comp.id}:negative`;
                nodeVoltages.set(posKey, voltage);
                nodeVoltages.set(negKey, 0);
            }
        });

        // Simple wire connection propagation
        this.wires.forEach(wire => {
            const startKey = `${wire.start.componentId}:${wire.start.connectionName}`;
            const endKey = `${wire.end.componentId}:${wire.end.connectionName}`;
            const startVoltage = nodeVoltages.get(startKey) || 0;
            const endVoltage = nodeVoltages.get(endKey) || 0;

            // If one is set and other isn't, propagate voltage
            if (startVoltage !== 0 && endVoltage === 0) {
                nodeVoltages.set(endKey, startVoltage);
            } else if (endVoltage !== 0 && startVoltage === 0) {
                nodeVoltages.set(startKey, endVoltage);
            } else if (startVoltage === 0 && endVoltage === 0) {
                // Both unset, leave as 0
            } else if (Math.abs(startVoltage - endVoltage) > 0.01) {
                // Voltage difference exists - average them for simplicity
                const avgVoltage = (startVoltage + endVoltage) / 2;
                nodeVoltages.set(startKey, avgVoltage);
                nodeVoltages.set(endKey, avgVoltage);
            }
        });

        // Calculate power consumption for resistors
        this.components.forEach(comp => {
            if (comp.definition.id === 'resistor') {
                const v1 = nodeVoltages.get(`${comp.id}:terminal1`) || 0;
                const v2 = nodeVoltages.get(`${comp.id}:terminal2`) || 0;
                const resistance = comp.properties.resistance || 220;
                const current = Math.abs(v1 - v2) / resistance;
                const power = (v1 - v2) ** 2 / resistance;
                powerConsumption[comp.id] = power;
            }
        });

        return { nodeVoltages, branchCurrents, powerConsumption, terminalWires };
    }

    calculateCircuitValues() {
        // Perform nodal analysis to solve for node voltages
        const { nodeVoltages, branchCurrents, powerConsumption, terminalWires } = this.performNodalAnalysis();

        // Calculate totals for display
        let totalVoltage = 0;
        let totalPower = 0;

        // Find battery voltages for display
        this.components.forEach(comp => {
            if (comp.definition.id === 'battery') {
                totalVoltage = comp.properties.voltage || 0;
            }
        });

        // Sum power consumption
        Object.values(powerConsumption).forEach(power => {
            totalPower += power;
        });

        // Store results for display
        this.simulationResults = {
            totalVoltage,
            totalResistance: totalVoltage > 0 ? (totalVoltage * totalVoltage) / totalPower : 0, // V²/P
            totalCurrent: Math.sqrt(totalPower / Math.max(totalVoltage * totalVoltage / totalPower, 1e-12)) * 1000, // mA
            power: totalPower // mW
        };

        // Update connection point values based on solved node voltages
        this.updateConnectionValuesFromNodeVoltages(nodeVoltages, branchCurrents, terminalWires);
    }

    /**
     * Update connection point values based on nodal analysis results
     * This is called after transient simulation updates
     */
    updateConnectionValues() {
        // Run nodal analysis to get accurate node voltages
        const { nodeVoltages, terminalWires } = this.performNodalAnalysis();
        this.updateConnectionValuesFromNodeVoltages(nodeVoltages, new Map(), terminalWires);
    }

    showSimulationResults() {
        document.getElementById('simulation-results').style.display = 'block';

        if (this.isSimulating && Object.keys(this.simulationResults).length > 0) {
            const results = this.simulationResults;
            document.getElementById('results-content').innerHTML = `
                <p><strong>Tensão Total:</strong> ${results.totalVoltage.toFixed(2)} V</p>
                <p><strong>Resistência Total:</strong> ${results.totalResistance.toFixed(2)} Ω</p>
                <p><strong>Corrente:</strong> ${results.totalCurrent.toFixed(2)} mA</p>
                <p><strong>Potência:</strong> ${results.power.toFixed(2)} mW</p>
            `;
        } else {
            document.getElementById('results-content').innerHTML = '<p>Calculando resultados...</p>';
        }
    }

    hideSimulationResults() {
        document.getElementById('simulation-results').style.display = 'none';
    }

    /**
     * Update transient simulation for dynamic components (capacitors, inductors)
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    updateTransientSimulation(deltaTime) {
        // Only update if we have a valid time step
        if (deltaTime <= 0 || deltaTime > 0.1) { // Limit max time step for stability
            return;
        }

        // Run nodal analysis to get the current DC operating point and equivalent resistances
        const { nodeVoltages } = this.performNodalAnalysis();

        // Update each dynamic component based on actual circuit topology
        this.components.forEach(component => {
            if (component.definition.id === 'capacitor') {
                this.updateCapacitorState(component, nodeVoltages, deltaTime);
            } else if (component.definition.id === 'inductor') {
                this.updateInductorState(component, nodeVoltages, deltaTime);
            }
        });
    }

    /**
     * Update capacitor state based on RC circuit charging/discharging with topology awareness
     * @param {Object} component - The capacitor component
     * @param {Map} nodeVoltages - Map of nodeId -> voltage from nodal analysis
     * @param {number} deltaTime - Time step in seconds
     */
    updateCapacitorState(component, nodeVoltages, deltaTime) {
        // Find the two terminals of the capacitor
        const terminal1Key = `${component.id}:terminal1`;
        const terminal2Key = `${component.id}:terminal2`;

        const v1 = nodeVoltages.get(terminal1Key) || 0;
        const v2 = nodeVoltages.get(terminal2Key) || 0;

        // Calculate the equivalent resistance seen by this capacitor
        // by temporarily removing the capacitor and finding the Thevenin resistance
        // between its terminals
        const capacitance = component.state.capacitance || 0;
        if (capacitance <= 0) return;

        // Get the Thevenin equivalent voltage (open-circuit voltage across capacitor terminals)
        const vThevenin = v1 - v2;

        // Calculate Thevenin equivalent resistance by zeroing all independent sources
        // and finding resistance between capacitor terminals
        const rThevenin = this.calculateTheveninResistance(terminal1Key, terminal2Key);

        if (rThevenin <= 0) return;

        // Time constant τ = R * C
        const tau = rThevenin * capacitance;

        if (tau <= 0) return;

        // Charging formula: dVc/dt = (V_thevenin - Vc) / τ
        const voltageChange = (vThevenin - component.state.voltage) * (deltaTime / tau);
        component.state.voltage += voltageChange;

        // Clamp voltage to reasonable limits
        const maxVoltage = component.properties.voltageRating || Math.abs(vThevenin) + 1;
        component.state.voltage = Math.max(-maxVoltage, Math.min(component.state.voltage, maxVoltage));
    }

    /**
     * Calculate Thevenin equivalent resistance between two nodes
     * by zeroing all independent voltage sources and finding resistance
     * @param {string} nodeKey1 - First node identifier
     * @param {string} nodeKey2 - Second node identifier
     * @returns {number} Equivalent resistance in Ohms
     */
    calculateTheveninResistance(nodeKey1, nodeKey2) {
        // Build conductance matrix with all independent sources zeroed
        const nodeMap = new Map();
        const nodeList = [];
        let nodeIndex = 0;

        const getNodeIndex = (key) => {
            if (!nodeMap.has(key)) {
                nodeMap.set(key, nodeIndex);
                nodeList.push(key);
                nodeIndex++;
            }
            return nodeMap.get(key);
        };

        // Get indices for our target nodes
        const idx1 = getNodeIndex(nodeKey1);
        const idx2 = getNodeIndex(nodeKey2);

        // Add all wires as ideal conductors
        const WIRE_CONDUCTANCE = 1e6;
        const connections = [];

        this.wires.forEach(wire => {
            const nodeA = getNodeIndex(`${wire.start.componentId}:${wire.start.connectionName}`);
            const nodeB = getNodeIndex(`${wire.end.componentId}:${wire.end.connectionName}`);
            connections.push({nodeA, nodeB});
        });

        // Build conductance matrix with components (voltage sources zeroed = shorted)
        const numNodes = nodeList.length;
        const G = Array.from({length: numNodes}, () => Array(numNodes).fill(0));

        // Add wire conductances
        connections.forEach(conn => {
            G[conn.nodeA][conn.nodeA] += WIRE_CONDUCTANCE;
            G[conn.nodeA][conn.nodeB] -= WIRE_CONDUCTANCE;
            G[conn.nodeB][conn.nodeA] -= WIRE_CONDUCTANCE;
            G[conn.nodeB][conn.nodeB] += WIRE_CONDUCTANCE;
        });

        // Add component conductances (voltage sources zeroed = shorted)
        this.components.forEach(comp => {
            const terminalNodes = {};
            comp.connections.forEach(conn => {
                terminalNodes[conn.name] = getNodeIndex(`${comp.id}:${conn.name}`);
            });

            switch (comp.definition.id) {
                case 'resistor': {
                    const node1 = terminalNodes['terminal1'];
                    const node2 = terminalNodes['terminal2'];
                    if (node1 !== undefined && node2 !== undefined) {
                        const conductance = 1 / Math.max(comp.properties.resistance || 1, 1e-12);
                        G[node1][node1] += conductance;
                        G[node1][node2] -= conductance;
                        G[node2][node1] -= conductance;
                        G[node2][node2] += conductance;
                    }
                    break;
                }
                case 'led': {
                    // LED as series resistance when on (diode equation linearized)
                    const nodeAnode = terminalNodes['anode'];
                    const nodeCathode = terminalNodes['cathode'];
                    if (nodeAnode !== undefined && nodeCathode !== undefined) {
                        const rSeries = 10;
                        const conductance = 1 / Math.max(rSeries, 1e-12);
                        G[nodeAnode][nodeAnode] += conductance;
                        G[nodeAnode][nodeCathode] -= conductance;
                        G[nodeCathode][nodeAnode] -= conductance;
                        G[nodeCathode][nodeCathode] += conductance;
                    }
                    break;
                }
                case 'battery': {
                    // Zeroed voltage source = short circuit
                    const nodePos = terminalNodes['positive'];
                    const nodeNeg = terminalNodes['negative'];
                    if (nodePos !== undefined && nodeNeg !== undefined) {
                        G[nodePos][nodePos] += WIRE_CONDUCTANCE;
                        G[nodePos][nodeNeg] -= WIRE_CONDUCTANCE;
                        G[nodeNeg][nodePos] -= WIRE_CONDUCTANCE;
                        G[nodeNeg][nodeNeg] += WIRE_CONDUCTANCE;
                    }
                    break;
                }
                case 'inductor': {
                    // For DC, inductor is short circuit
                    const node1 = terminalNodes['terminal1'];
                    const node2 = terminalNodes['terminal2'];
                    if (node1 !== undefined && node2 !== undefined) {
                        G[node1][node1] += WIRE_CONDUCTANCE;
                        G[node1][node2] -= WIRE_CONDUCTANCE;
                        G[node2][node1] -= WIRE_CONDUCTANCE;
                        G[node2][node2] += WIRE_CONDUCTANCE;
                    }
                    break;
                }
                case 'switch': {
                    if (comp.properties.state === 'Fechado') {
                        const node1 = terminalNodes['terminal1'];
                        const node2 = terminalNodes['terminal2'];
                        if (node1 !== undefined && node2 !== undefined) {
                            G[node1][node1] += WIRE_CONDUCTANCE;
                            G[node1][node2] -= WIRE_CONDUCTANCE;
                            G[node2][node1] -= WIRE_CONDUCTANCE;
                            G[node2][node2] += WIRE_CONDUCTANCE;
                        }
                    }
                    break;
                }
                case 'transistor': {
                    // Transistor as resistor between collector-emitter (simplified)
                    const nodeCollector = terminalNodes['collector'];
                    const nodeEmitter = terminalNodes['emitter'];
                    if (nodeCollector !== undefined && nodeEmitter !== undefined) {
                        const gCollector = 1 / 10000;
                        G[nodeCollector][nodeCollector] += gCollector;
                        G[nodeCollector][nodeEmitter] -= gCollector;
                        G[nodeEmitter][nodeCollector] -= gCollector;
                        G[nodeEmitter][nodeEmitter] += gCollector;
                    }
                    break;
                }
                case 'capacitor': {
                    // Capacitor is open circuit for Thevenin resistance calculation
                    // (except the one we're analyzing, which we already excluded by not adding it)
                    break;
                }
            }
        });

        // Use superposition: inject 1A current source between nodeKey1 and nodeKey2
        // and measure voltage difference = Rth
        const I = Array(numNodes).fill(0);
        I[idx1] = 1;
        I[idx2] = -1;

        // Ground one node (use idx2 as reference)
        const groundIdx = idx2;
        const reducedSize = numNodes - 1;
        if (reducedSize <= 0) return 1e6;

        // Create reduced matrix
        const Gr = Array.from({length: reducedSize}, () => Array(reducedSize).fill(0));
        const Ir = Array(reducedSize).fill(0);

        let rIdx = 0;
        for (let i = 0; i < numNodes; i++) {
            if (i === groundIdx) continue;
            let cIdx = 0;
            for (let j = 0; j < numNodes; j++) {
                if (j === groundIdx) continue;
                Gr[rIdx][cIdx] = G[i][j];
                cIdx++;
            }
            Ir[rIdx] = I[i];
            rIdx++;
        }

        // Solve
        const V = this.gaussianElimination(Gr, Ir);

        // Reconstruct full voltage vector
        const nodeVoltagesFull = Array(numNodes).fill(0);
        let vIdx = 0;
        for (let i = 0; i < numNodes; i++) {
            if (i === groundIdx) {
                nodeVoltagesFull[i] = 0;
            } else {
                nodeVoltagesFull[i] = V[vIdx];
                vIdx++;
            }
        }

        // Thevenin resistance = voltage difference / 1A = voltage difference
        const rth = Math.abs(nodeVoltagesFull[idx1] - nodeVoltagesFull[idx2]);
        return Math.max(rth, 1e-6);
    }

    /**
     * Update inductor state based on RL circuit current change with topology awareness
     * @param {Object} component - The inductor component
     * @param {Map} nodeVoltages - Map of nodeId -> voltage from nodal analysis
     * @param {number} deltaTime - Time step in seconds
     */
    updateInductorState(component, nodeVoltages, deltaTime) {
        // Find the two terminals of the inductor
        const terminal1Key = `${component.id}:terminal1`;
        const terminal2Key = `${component.id}:terminal2`;

        const v1 = nodeVoltages.get(terminal1Key) || 0;
        const v2 = nodeVoltages.get(terminal2Key) || 0;

        // Calculate the equivalent resistance seen by this inductor
        // by temporarily removing the inductor and finding the Thevenin resistance
        // between its terminals
        const inductance = component.state.inductance || 0;
        if (inductance <= 0) return;

        // Get the Thevenin equivalent voltage (open-circuit voltage across inductor terminals)
        const vThevenin = v1 - v2;

        // Calculate Thevenin equivalent resistance by zeroing all independent sources
        // and finding resistance between inductor terminals
        const rThevenin = this.calculateTheveninResistance(terminal1Key, terminal2Key);

        if (rThevenin <= 0) return;

        // Time constant τ = L / R
        const tau = inductance / rThevenin;

        if (tau <= 0) return;

        // Inductor formula: dI/dt = V / L
        const currentChange = vThevenin * (deltaTime / inductance);
        component.state.current += currentChange;

        // Clamp current to reasonable limits
        const maxCurrent = component.properties.voltageRating || Math.abs(vThevenin) + 1;
        component.state.current = Math.max(-maxCurrent, Math.min(component.state.current, maxCurrent));
    }

    /**
     * Update connection point values based on solved node voltages
     * @param {Map} nodeVoltages - Map of nodeId->voltage
     * @param {Map} branchCurrents - Map of branchId->current
     */
    updateConnectionValuesFromNodeVoltages(nodeVoltages, branchCurrents, terminalWires) {
        this.components.forEach(component => {
            // Get node voltages for each connection
            const nodeMap = {};
            component.connections.forEach(conn => {
                const nodeId = `${component.id}:${conn.name}`;
                const voltage = nodeVoltages.get(nodeId) || 0;
                nodeMap[conn.name] = voltage;
            });

            // Update each connection point with solved values
            component.connections.forEach(conn => {
                const voltage = nodeMap[conn.name] || 0;
                // Calculate current from component characteristics
                let current = 0;
                switch (component.definition.id) {
                    case 'resistor': {
                        const v1 = nodeMap['terminal1'] || 0;
                        const v2 = nodeMap['terminal2'] || 0;
                        current = (v1 - v2) / Math.max(component.properties.resistance || 1, 1e-12);
                        break;
                    }
                    case 'led': {
                        const vAnode = nodeMap['anode'] || 0;
                        const vCathode = nodeMap['cathode'] || 0;
                        const vDiff = vAnode - vCathode;
                        const vf = component.properties.voltage || 2.0;
                        if (vDiff > vf) {
                            current = (vDiff - vf) / 10; // Through series resistance
                        } else {
                            current = 0;
                        }
                        break;
                    }
                    case 'battery': {
                        // Battery current: sum of currents from connected wires
                        const terminalKey = `${component.id}:${conn.name}`;
                        const connectedWires = terminalWires ? terminalWires.get(terminalKey) : null;
                        if (connectedWires) {
                            connectedWires.forEach(wireConn => {
                                const vOther = nodeVoltages.get(wireConn.otherNodeKey) || 0;
                                current += (voltage - vOther) * 1e6;
                            });
                        }
                        break;
                    }
                    case 'transistor': {
                        // Approximate current based on transistor model
                        const vBase = nodeMap['base'] || 0;
                        const vEmitter = nodeMap['emitter'] || 0;
                        const vCollector = nodeMap['collector'] || 0;
                        const vbe = component.properties.vbe || 0.7;
                        const beta = component.properties.beta || 100;
                        const ib = Math.max(0, (vBase - vEmitter - vbe)) / 1000;
                        const ic = beta * ib;
                        if (conn.name === 'collector') {
                            current = ic;
                        } else if (conn.name === 'emitter') {
                            current = ic + ib; // Emitter current = collector + base
                        } else if (conn.name === 'base') {
                            current = ib;
                        }
                        break;
                    }
                    case 'switch': {
                        // Current through switch = V * conductance
                        const v1 = nodeMap['terminal1'] || 0;
                        const v2 = nodeMap['terminal2'] || 0;
                        if (comp.properties.state === 'Fechado') {
                            current = (v1 - v2) * 1e6;
                        } else {
                            current = 0;
                        }
                        break;
                    }
                    default:
                        current = 0;
                }
                conn.voltage = voltage;
                conn.current = current * 1000; // Convert to mA for display
            });
        });
    }

    /**
     * Simple Gaussian elimination for solving Ax = b
     * @param {number[][]} A - Coefficient matrix (modified in place)
     * @param {number[]} b - Right-hand side vector (modified in place)
     * @returns {number[]} Solution vector x
     */
    gaussianElimination(A, b) {
        const n = A.length;
        // Forward elimination
        for (let i = 0; i < n; i++) {
            // Find pivot
            let maxRow = i;
            for (let r = i + 1; r < n; r++) {
                if (Math.abs(A[r][i]) > Math.abs(A[maxRow][i])) {
                    maxRow = r;
                }
            }
            // Swap rows
            if (maxRow !== i) {
                [A[i], A[maxRow]] = [A[maxRow], A[i]];
                [b[i], b[maxRow]] = [b[maxRow], b[i]];
            }
            // Skip if singular
            if (Math.abs(A[i][i]) < 1e-12) continue;
            // Eliminate below
            for (let r = i + 1; r < n; r++) {
                const factor = A[r][i] / A[i][i];
                for (let c = i; c < n; c++) {
                    A[r][c] -= factor * A[i][c];
                }
                b[r] -= factor * b[i];
            }
        }
        // Back substitution
        const x = Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            let sum = b[i];
            for (let j = i + 1; j < n; j++) {
                sum -= A[i][j] * x[j];
            }
            x[i] = Math.abs(A[i][i]) > 1e-12 ? sum / A[i][i] : 0;
        }
        return x;
    }

    // Component panel rendering
    renderComponentPanel() {
        const panel = document.getElementById('component-panel');
        panel.innerHTML = '';

        for (const [id, definition] of Object.entries(this.componentDefinitions)) {
            const componentElement = document.createElement('div');
            componentElement.className = 'component-item';
            componentElement.draggable = true;
            componentElement.dataset.componentId = id;

            componentElement.innerHTML = `
                <div class="component-header">
                    <span class="component-symbol">${definition.symbol}</span>
                    <span class="component-name">${definition.name}</span>
                </div>
            `;

            componentElement.addEventListener('click', () => this.selectComponent(id));
            componentElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', id);
            });

            panel.appendChild(componentElement);
        }
    }

    selectComponent(componentId) {
        this.selectedComponentId = componentId;
        document.querySelectorAll('.component-item').forEach(n => n.classList.toggle('active', n.dataset.componentId === componentId));
        this.render();
    }

    // Circuit manipulation
    clearCircuit() {
        this.components = [];
        this.wires = [];
        this.selectedComponent = null;
        this.simulationResults = {};
        this.hideSimulationResults();
        this.render();
    }

    saveCircuit() {
        const circuitData = {
            components: this.components.map(comp => ({
                id: comp.id,
                x: comp.x,
                y: comp.y,
                definitionId: comp.definition.id,
                properties: comp.properties,
                state: comp.state || {}
            })),
            wires: this.wires
        };
        localStorage.setItem('savedCircuit', JSON.stringify(circuitData));
        alert('Circuito salvo com sucesso!');
    }

    loadCircuit() {
        const saved = localStorage.getItem('savedCircuit');
        if (saved) {
            try {
                const circuitData = JSON.parse(saved);
                this.components = circuitData.components.map(compData => {
                    const definition = this.componentDefinitions[compData.definitionId];
                    if (!definition) {
                        throw new Error(`Unknown component definition: ${compData.definitionId}`);
                    }
                    return {
                        id: compData.id,
                        x: compData.x,
                        y: compData.y,
                        definition: definition,
                        properties: { ...compData.properties },
                        state: { ...compData.state },
                        connections: definition.connections.map(conn => ({ ...conn }))
                    };
                });
                this.wires = circuitData.wires || [];
                this.render();
                alert('Circuito carregado com sucesso!');
            } catch (error) {
                console.error('Error loading circuit:', error);
                alert('Erro ao carregar circuito. Verifique o console para detalhes.');
            }
        } else {
            alert('Nenhum circuito salvo encontrado.');
        }
    }

    exportCircuit() {
        // For now, just alert that export is not implemented
        alert('Exportação de circuito ainda não implementada.');
    }

    // Animation loop
    animate() {
        const now = performance.now() / 1000; // Convert to seconds
        const deltaTime = now - this.lastUpdateTime;
        this.lastUpdateTime = now;

        // Update transient simulation if we're simulating
        if (this.isSimulating) {
            this.simulationTime += deltaTime;
            this.updateTransientSimulation(deltaTime);
            this.updateConnectionValues(); // Update connection values after transient update
            this.showSimulationResults(); // Update the display
        }

        this.render();
        requestAnimationFrame(() => this.animate());
    }

    // Rendering
    render() {
        // Clear canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid if enabled
        if (this.showGrid) {
            this.context.strokeStyle = 'rgba(11,42,34,0.10)';
            this.context.lineWidth = 1;
            for (let x = 0; x < this.canvas.width; x += this.gridSize) {
                this.context.beginPath();
                this.context.moveTo(x, 0);
                this.context.lineTo(x, this.canvas.height);
                this.context.stroke();
            }
            for (let y = 0; y < this.canvas.height; y += this.gridSize) {
                this.context.beginPath();
                this.context.moveTo(0, y);
                this.context.lineTo(this.canvas.width, y);
                this.context.stroke();
            }
        }

        // Draw wires
        this.context.strokeStyle = '#b8721f';
        this.context.lineWidth = 3;
        this.context.lineCap = 'round';
        for (const wire of this.wires) {
            this.context.beginPath();
            this.context.moveTo(wire.start.x, wire.start.y);
            this.context.lineTo(wire.end.x, wire.end.y);
            this.context.stroke();
        }

        // Draw components
        for (const comp of this.components) {
            const lit = this.isSimulating && comp.definition.id === 'led';
            this.context.save();
            if (lit) { this.context.shadowColor = comp.definition.color; this.context.shadowBlur = 22; }
            this.context.fillStyle = comp.definition.color;
            this.context.beginPath();
            if (this.context.roundRect) this.context.roundRect(comp.x, comp.y, comp.width, comp.height, 8);
            else this.context.rect(comp.x, comp.y, comp.width, comp.height);
            this.context.fill();
            this.context.restore();
            this.context.strokeStyle = '#26352e';
            this.context.lineWidth = 2;
            this.context.stroke();

            // Name label under the component
            this.context.fillStyle = '#26352e';
            this.context.font = '600 11px "Chakra Petch", sans-serif';
            this.context.textAlign = 'center';
            this.context.textBaseline = 'top';
            this.context.fillText(comp.definition.name, comp.x + comp.width / 2, comp.y + comp.height + 8);

            // Draw symbol
            this.context.fillStyle = '#fff';
            this.context.font = '700 16px "Chakra Petch", Arial';
            this.context.textAlign = 'center';
            this.context.textBaseline = 'middle';
            this.context.fillText(comp.definition.symbol, comp.x + comp.width / 2, comp.y + comp.height / 2);

            // Draw connection points
            this.context.fillStyle = '#f6c874';
            for (const conn of comp.connections) {
                let pointX, pointY;
                switch (conn.name) {
                    case 'anode':
                        pointX = comp.x + comp.width / 2;
                        pointY = comp.y;
                        break;
                    case 'cathode':
                        pointX = comp.x + comp.width / 2;
                        pointY = comp.y + comp.height;
                        break;
                    case 'positive':
                        pointX = comp.x + comp.width;
                        pointY = comp.y + comp.height / 2;
                        break;
                    case 'negative':
                        pointX = comp.x;
                        pointY = comp.y + comp.height / 2;
                        break;
                    case 'terminal1':
                        pointX = comp.x;
                        pointY = comp.y + comp.height / 2;
                        break;
                    case 'terminal2':
                        pointX = comp.x + comp.width;
                        pointY = comp.y + comp.height / 2;
                        break;
                    case 'collector':
                        pointX = comp.x + comp.width;
                        pointY = comp.y + comp.height / 4;
                        break;
                    case 'base':
                        pointX = comp.x;
                        pointY = comp.y + comp.height / 2;
                        break;
                    case 'emitter':
                        pointX = comp.x + comp.width;
                        pointY = comp.y + 3 * comp.height / 4;
                        break;
                    case 'end1':
                        pointX = comp.x;
                        pointY = comp.y;
                        break;
                    case 'end2':
                        pointX = comp.x + comp.width;
                        pointY = comp.y + comp.height;
                        break;
                    default:
                        pointX = comp.x + comp.width / 2;
                        pointY = comp.y + comp.height / 2;
                }
                this.context.beginPath();
                this.context.arc(pointX, pointY, 4, 0, Math.PI * 2);
                this.context.fill();
            }
        }

        // Draw selected component outline
        if (this.selectedComponent) {
            this.context.strokeStyle = '#f08c00';
            this.context.lineWidth = 3;
            this.context.strokeRect(this.selectedComponent.x, this.selectedComponent.y, this.selectedComponent.width, this.selectedComponent.height);
        }

        // Draw connection line if in connection mode
        if (this.connectionMode && this.connectionStart) {
            this.context.strokeStyle = '#0000ff';
            this.context.lineWidth = 2;
            this.context.setLineDash([5, 5]);
            this.context.beginPath();
            this.context.moveTo(this.connectionStart.x, this.connectionStart.y);
            this.context.lineTo(this.connectionEndTemp.x, this.connectionEndTemp.y);
            this.context.stroke();
            this.context.setLineDash([]);
        }
    }

    // Helper methods for component dimensions
    getComponentWidth(definition) {
        // Default size, can be customized per component type
        return 40;
    }

    getComponentHeight(definition) {
        // Default size, can be customized per component type
        return 40;
    }

    // Keyboard shortcuts
    handleKeyDown(e) {
        if (e.key === 'Delete' && this.selectedComponent) {
            this.removeComponent(this.selectedComponent);
        }
        if (e.key === 'Escape') {
            this.selectedComponent = null;
            this.connectionMode = false;
            this.connectionStart = null;
            this.connectionEndTemp = null;
            this.render();
        }
    }

    // Update component properties from form values
    updateComponentProperties() {
        if (!this.selectedComponent) return;

        const form = document.getElementById('component-form');
        if (!form) return;

        // Update component properties based on form values
        const formData = new FormData(form);
        for (const [name, value] of formData.entries()) {
            // Only update if this property exists in the component's definition
            const propDef = this.selectedComponent.definition.properties.find(
                prop => prop.name === name
            );
            if (propDef) {
                // Convert value based on property type
                let parsedValue = value;
                if (propDef.type === 'number') {
                    parsedValue = parseFloat(value) || propDef.default || 0;
                } else if (propDef.type === 'select') {
                    // Keep as string for select
                }
                // For other types, keep as string

                this.selectedComponent.properties[name] = parsedValue;
            }
        }

        // Re-render to reflect changes
        this.render();

        // Hide properties panel
        const propertiesPanel = document.getElementById('properties-panel');
        if (propertiesPanel) {
            propertiesPanel.style.display = 'none';
        }

        // Clear selection
        this.selectedComponent = null;
    }

    removeComponent(component) {
        // Remove any wires connected to this component
        this.wires = this.wires.filter(wire =>
            wire.start.componentId !== component.id &&
            wire.end.componentId !== component.id
        );

        // Remove the component
        const index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
        }

        // Clear selection if it was the removed component
        if (this.selectedComponent === component) {
            this.selectedComponent = null;
        }

        this.render();
    }

    // Add component to canvas
    addComponent(componentId, x, y) {
        const definition = this.componentDefinitions[componentId];
        if (!definition) return;

        const component = this.createComponentInstance(componentId, x, y);
        component.width = this.getComponentWidth(definition);
        component.height = this.getComponentHeight(definition);

        // Initialize properties with defaults
        if (definition.properties) {
            definition.properties.forEach(prop => {
                component.properties[prop.name] = prop.default;
            });
        }

        // Initialize state for dynamic components
        if (definition.id === 'capacitor') {
            component.state.capacitance = component.properties.capacitance || 1e-6;
            component.state.voltage = 0;
        } else if (definition.id === 'inductor') {
            component.state.inductance = component.properties.inductance || 1e-3;
            component.state.current = 0;
        }

        this.components.push(component);
        this.render();
    }

    // Save to localStorage helper
    saveToLocalStorage() {
        try {
            const circuitData = {
                components: this.components.map(comp => ({
                    id: comp.id,
                    x: comp.x,
                    y: comp.y,
                    definitionId: comp.definition.id,
                    properties: comp.properties,
                    state: comp.state || {}
                })),
                wires: this.wires
            };
            localStorage.setItem('savedCircuit', JSON.stringify(circuitData));
        } catch (e) {
            console.warn('Could not save to localStorage', e);
        }
    }

    // Load component instance from definition
    createComponentInstance(definitionId, x, y) {
        const definition = this.componentDefinitions[definitionId];
        if (!definition) {
            throw new Error(`Unknown component definition: ${definitionId}`);
        }

        return {
            id: `${definitionId}-${Date.now()}`,
            x: x,
            y: y,
            definition: definition,
            properties: {},
            state: {},
            connections: definition.connections.map(conn => ({ ...conn }))
        };
    }

    // Load from localStorage on startup
    loadFromLocalStorage() {
        const saved = localStorage.getItem('savedCircuit');
        if (saved) {
            try {
                const circuitData = JSON.parse(saved);
                this.components = circuitData.components.map(compData => {
                    const definition = this.componentDefinitions[compData.definitionId];
                    if (!definition) {
                        throw new Error(`Unknown component definition: ${compData.definitionId}`);
                    }
                    return {
                        id: compData.id,
                        x: compData.x,
                        y: compData.y,
                        definition: definition,
                        properties: { ...compData.properties },
                        state: { ...compData.state },
                        connections: definition.connections.map(conn => ({ ...conn }))
                    };
                });
                this.wires = circuitData.wires || [];
            } catch (error) {
                console.error('Error loading circuit from localStorage:', error);
            }
        }
    }
}

// Initialize simulator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.simulator = new CircuitSimulator();
});