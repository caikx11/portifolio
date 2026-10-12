// Simulador de Física Interativo
class PhysicsSimulator {
    constructor() {
        this.currentSimulation = 'spring';
        this.isRunning = false;
        this.animationId = null;

        // Configurações e estado da Mola
        this.spring = {
            mass: 1.0,          // kg
            k: 10,              // N/m
            damping: 0.5,       // Ns/m
            initial: 1.0,       // m
            gravity: 9.8,       // m/s²
            x: 1.0,             // m (deslocamento)
            v: 0.0,             // m/s
            a: 0.0,             // m/s²
            length: 150,        // pixels de referência
            equilibriumY: 200   // pixels
        };

        // Configurações e estado do Pêndulo
        this.pendulum = {
            length: 2.0,        // m
            mass: 1.0,          // kg
            angle: 30 * Math.PI / 180, // rad
            omega: 0.0,         // rad/s
            alpha: 0.0,         // rad/s²
            damping: 0.02,
            gravity: 9.8,
            originX: 300,
            originY: 80,
            scale: 80           // pixels por metro
        };

        // Configurações e estado do Projétil
        this.projectile = {
            velocity: 25,       // m/s
            angle: 45 * Math.PI / 180, // rad
            height: 0,          // m
            gravity: 9.8,       // m/s²
            x: 0,               // m
            y: 0,               // m
            vx: 0,              // m/s
            vy: 0,              // m/s
            time: 0,            // s
            path: [],           // histórico de posições
            isLaunched: false,
            maxHeight: 0,
            range: 0
        };

        this.init();
    }

    init() {
        this.setupTabs();
        this.setupEventListeners();
        this.resizeCanvases();
        this.resetCurrentSimulation();
        this.startLoop();
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.simulator-tabs .tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = tab.dataset.tab;

                // Atualizar classes das abas
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Atualizar conteúdos
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                document.getElementById(`${targetTab}-tab`).classList.add('active');

                // Atualizar painéis de informação
                document.querySelectorAll('.info-panel').forEach(p => p.style.display = 'none');
                document.getElementById(`${targetTab}-info`).style.display = 'block';

                this.currentSimulation = targetTab;
                this.resetCurrentSimulation();
            });
        });
    }

    setupEventListeners() {
        // Mola listeners
        this.bindRange('spring-mass', 'spring-mass-value', (val) => { this.spring.mass = parseFloat(val); });
        this.bindRange('spring-k', 'spring-k-value', (val) => { this.spring.k = parseFloat(val); });
        this.bindRange('spring-damping', 'spring-damping-value', (val) => { this.spring.damping = parseFloat(val); });
        this.bindRange('spring-initial', 'spring-initial-value', (val) => {
            this.spring.initial = parseFloat(val);
            this.spring.x = this.spring.initial;
            this.spring.v = 0;
        });
        this.bindRange('spring-gravity', 'spring-gravity-value', (val) => { this.spring.gravity = parseFloat(val); });

        // Pêndulo listeners
        this.bindRange('pendulum-length', 'pendulum-length-value', (val) => { this.pendulum.length = parseFloat(val); });
        this.bindRange('pendulum-mass', 'pendulum-mass-value', (val) => { this.pendulum.mass = parseFloat(val); });
        this.bindRange('pendulum-angle', 'pendulum-angle-value', (val) => {
            this.pendulum.angle = parseFloat(val) * Math.PI / 180;
            this.pendulum.omega = 0;
        });
        this.bindRange('pendulum-damping', 'pendulum-damping-value', (val) => { this.pendulum.damping = parseFloat(val); });
        this.bindRange('pendulum-gravity', 'pendulum-gravity-value', (val) => { this.pendulum.gravity = parseFloat(val); });

        // Projétil listeners
        this.bindRange('projectile-velocity', 'projectile-velocity-value', (val) => { this.projectile.velocity = parseFloat(val); });
        this.bindRange('projectile-angle', 'projectile-angle-value', (val) => { this.projectile.angle = parseFloat(val) * Math.PI / 180; });
        this.bindRange('projectile-height', 'projectile-height-value', (val) => {
            this.projectile.height = parseFloat(val);
            if (!this.projectile.isLaunched) this.resetProjectile();
        });
        this.bindRange('projectile-gravity', 'projectile-gravity-value', (val) => { this.projectile.gravity = parseFloat(val); });

        // Controles globais (Iniciar, Pausar, Resetar)
        ['spring', 'pendulum', 'projectile'].forEach(sim => {
            const startBtn = document.getElementById(`${sim}-start`);
            const pauseBtn = document.getElementById(`${sim}-pause`);
            const resetBtn = document.getElementById(`${sim}-reset`);

            if (startBtn) startBtn.addEventListener('click', () => { this.isRunning = true; if(sim==='projectile') this.projectile.isLaunched = true; });
            if (pauseBtn) pauseBtn.addEventListener('click', () => { this.isRunning = false; });
            if (resetBtn) resetBtn.addEventListener('click', () => { this.resetCurrentSimulation(); });
        });
    }

    bindRange(sliderId, valueId, callback) {
        const slider = document.getElementById(sliderId);
        const valueSpan = document.getElementById(valueId);
        if (slider && valueSpan) {
            slider.addEventListener('input', (e) => {
                const val = e.target.value;
                valueSpan.textContent = val;
                callback(val);
            });
        }
    }

    resizeCanvases() {
        ['spring', 'pendulum', 'projectile'].forEach(sim => {
            const canvas = document.getElementById(`${sim}-canvas`);
            if (canvas) {
                canvas.width = canvas.parentElement.clientWidth - 32;
                canvas.height = 350;
            }
        });
    }

    resetCurrentSimulation() {
        this.isRunning = false;
        if (this.currentSimulation === 'spring') {
            this.spring.x = this.spring.initial;
            this.spring.v = 0;
            this.spring.a = 0;
        } else if (this.currentSimulation === 'pendulum') {
            const angleDeg = parseFloat(document.getElementById('pendulum-angle').value);
            this.pendulum.angle = angleDeg * Math.PI / 180;
            this.pendulum.omega = 0;
            this.pendulum.alpha = 0;
        } else if (this.currentSimulation === 'projectile') {
            this.resetProjectile();
        }
        this.updateInfoPanel();
    }

    resetProjectile() {
        this.projectile.time = 0;
        this.projectile.x = 0;
        this.projectile.y = this.projectile.height;
        this.projectile.vx = this.projectile.velocity * Math.cos(this.projectile.angle);
        this.projectile.vy = this.projectile.velocity * Math.sin(this.projectile.angle);
        this.projectile.path = [];
        this.projectile.isLaunched = false;
        this.projectile.maxHeight = this.projectile.height;
        this.projectile.range = 0;
    }

    startLoop() {
        let lastTime = performance.now();

        const loop = (currentTime) => {
            const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // Limitar dt para estabilidade
            lastTime = currentTime;

            if (this.isRunning) {
                this.updatePhysics(dt);
            }

            this.render();
            this.updateInfoPanel();

            this.animationId = requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    updatePhysics(dt) {
        if (this.currentSimulation === 'spring') {
            // m*x'' + b*x' + k*x = 0  (ignorando gravidade estática no deslocamento)
            const { mass, k, damping } = this.spring;
            this.spring.a = (-k * this.spring.x - damping * this.spring.v) / mass;
            this.spring.v += this.spring.a * dt;
            this.spring.x += this.spring.v * dt;

        } else if (this.currentSimulation === 'pendulum') {
            // L*theta'' + (b/m)*theta' + g*sin(theta) = 0
            const { length, mass, damping, gravity } = this.pendulum;
            const b = damping;
            this.pendulum.alpha = (-gravity / length * Math.sin(this.pendulum.angle) - (b / mass) * this.pendulum.omega);
            this.pendulum.omega += this.pendulum.alpha * dt;
            this.pendulum.angle += this.pendulum.omega * dt;

        } else if (this.currentSimulation === 'projectile' && this.projectile.isLaunched) {
            const { gravity } = this.projectile;
            this.projectile.time += dt;
            this.projectile.vx = this.projectile.velocity * Math.cos(this.projectile.angle);
            this.projectile.vy = (this.projectile.velocity * Math.sin(this.projectile.angle)) - (gravity * this.projectile.time);

            this.projectile.x = this.projectile.vx * this.projectile.time;
            this.projectile.y = this.projectile.height + (this.projectile.velocity * Math.sin(this.projectile.angle) * this.projectile.time) - (0.5 * gravity * Math.pow(this.projectile.time, 2));

            if (this.projectile.y > this.projectile.maxHeight) {
                this.projectile.maxHeight = this.projectile.y;
            }

            this.projectile.path.push({ x: this.projectile.x, y: this.projectile.y });

            if (this.projectile.y <= 0) {
                this.projectile.y = 0;
                this.projectile.range = this.projectile.x;
                this.isRunning = false;
            }
        }
    }

    render() {
        if (this.currentSimulation === 'spring') {
            this.renderSpring();
        } else if (this.currentSimulation === 'pendulum') {
            this.renderPendulum();
        } else if (this.currentSimulation === 'projectile') {
            this.renderProjectile();
        }
    }

    renderSpring() {
        const canvas = document.getElementById('spring-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const startX = width / 2;
        const startY = 50;
        const pixelsPerMeter = 80;
        const blockY = startY + 100 + (this.spring.x * pixelsPerMeter);

        // Desenhar teto / suporte
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(startX - 60, startY - 10, 120, 10);

        // Desenhar mola (ziguezague)
        ctx.beginPath();
        ctx.strokeStyle = '#4a6fa5';
        ctx.lineWidth = 3;
        ctx.moveTo(startX, startY);

        const coils = 12;
        const springLen = blockY - startY;
        const coilHeight = springLen / coils;
        for (let i = 1; i <= coils; i++) {
            const cx = startX + (i % 2 === 0 ? 25 : -25);
            const cy = startY + (i * coilHeight);
            ctx.lineTo(cx, cy);
        }
        ctx.lineTo(startX, blockY);
        ctx.stroke();

        // Desenhar massa (bloco)
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(startX - 30, blockY, 60, 60);
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX - 30, blockY, 60, 60);

        // Texto no bloco
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Segoe UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.spring.mass} kg`, startX, blockY + 30);
    }

    renderPendulum() {
        const canvas = document.getElementById('pendulum-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const originX = width / 2;
        const originY = 60;
        const L = this.pendulum.length * this.pendulum.scale;

        const bobX = originX + L * Math.sin(this.pendulum.angle);
        const bobY = originY + L * Math.cos(this.pendulum.angle);

        // Suporte
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(originX - 40, originY - 10, 80, 10);
        ctx.beginPath();
        ctx.arc(originX, originY, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#7f8c8d';
        ctx.fill();

        // Haste
        ctx.beginPath();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.moveTo(originX, originY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        // Massa (pêndulo bob)
        const radius = Math.max(15, this.pendulum.mass * 12);
        ctx.beginPath();
        ctx.arc(bobX, bobY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    renderProjectile() {
        const canvas = document.getElementById('projectile-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const scale = 4; // pixels por metro
        const originX = 50;
        const groundY = height - 50;

        // Solo
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(0, groundY, width, height - groundY);

        // Desenhar trajetória
        if (this.projectile.path.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            for (let i = 0; i < this.projectile.path.length; i++) {
                const pt = this.projectile.path[i];
                const px = originX + pt.x * scale;
                const py = groundY - (pt.y * scale);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Projétil atual
        const currentX = originX + this.projectile.x * scale;
        const currentY = groundY - (this.projectile.y * scale);

        ctx.beginPath();
        ctx.arc(currentX, currentY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    updateInfoPanel() {
        if (this.currentSimulation === 'spring') {
            document.getElementById('spring-pos').textContent = `${this.spring.x.toFixed(2)} m`;
            document.getElementById('spring-vel').textContent = `${this.spring.v.toFixed(2)} m/s`;
            document.getElementById('spring-acc').textContent = `${this.spring.a.toFixed(2)} m/s²`;

            const omega = Math.sqrt(this.spring.k / this.spring.mass);
            const period = (2 * Math.PI) / omega;
            const freq = 1 / period;
            const energy = 0.5 * this.spring.k * Math.pow(this.spring.x, 2) + 0.5 * this.spring.mass * Math.pow(this.spring.v, 2);

            document.getElementById('spring-energy').textContent = `${energy.toFixed(2)} J`;
            document.getElementById('spring-period').textContent = `${period.toFixed(2)} s`;
            document.getElementById('spring-freq').textContent = `${freq.toFixed(2)} Hz`;

        } else if (this.currentSimulation === 'pendulum') {
            document.getElementById('pendulum-ang').textContent = `${(this.pendulum.angle * 180 / Math.PI).toFixed(2)}°`;
            document.getElementById('pendulum-omega').textContent = `${this.pendulum.omega.toFixed(2)} rad/s`;
            document.getElementById('pendulum-alpha').textContent = `${this.pendulum.alpha.toFixed(2)} rad/s²`;

            const period = 2 * Math.PI * Math.sqrt(this.pendulum.length / this.pendulum.gravity);
            const energy = 0.5 * this.pendulum.mass * Math.pow(this.pendulum.length * this.pendulum.omega, 2) + this.pendulum.mass * this.pendulum.gravity * this.pendulum.length * (1 - Math.cos(this.pendulum.angle));

            document.getElementById('pendulum-energy').textContent = `${energy.toFixed(2)} J`;
            document.getElementById('pendulum-period').textContent = `${period.toFixed(2)} s`;
            document.getElementById('pendulum-tension').textContent = `${(this.pendulum.mass * this.pendulum.gravity * Math.cos(this.pendulum.angle)).toFixed(2)} N`;

        } else if (this.currentSimulation === 'projectile') {
            document.getElementById('projectile-x').textContent = `${this.projectile.x.toFixed(2)} m`;
            document.getElementById('projectile-y').textContent = `${this.projectile.y.toFixed(2)} m`;
            document.getElementById('projectile-vx').textContent = `${this.projectile.vx.toFixed(2)} m/s`;
            document.getElementById('projectile-vy').textContent = `${this.projectile.vy.toFixed(2)} m/s`;
            document.getElementById('projectile-max-h').textContent = `${this.projectile.maxHeight.toFixed(2)} m`;
            document.getElementById('projectile-range').textContent = `${this.projectile.range.toFixed(2)} m`;
            document.getElementById('projectile-time').textContent = `${this.projectile.time.toFixed(2)} s`;
        }
    }
}

// Inicializar simulador quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    new PhysicsSimulator();
});