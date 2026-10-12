// Dashboard de Analytics com Chart.js
class AnalyticsDashboard {
    constructor() {
        this.trendChart = null;
        this.sourcesChart = null;
        this.deviceChart = null;
        this.currentDateRange = 30; // dias

        this.init();
    }

    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.renderCharts();
    }

    loadSampleData() {
        // Dados de exemplo para o gráfico de tendência (últimos 30 dias)
        this.trendData = {
            labels: Array.from({length: 30}, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (29 - i));
                return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
            }),
            datasets: [{
                label: 'Visitantes Diários',
                data: [650, 720, 780, 650, 820, 910, 750, 800, 950, 1020, 980, 1100, 1050, 1180, 1250, 1180, 1320, 1410, 1380, 1450, 1520, 1480, 1550, 1620, 1580, 1650, 1720, 1690, 1750, 1820],
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.3,
                fill: true
            }]
        };

        // Dados para o gráfico de fontes de tráfego
        this.sourcesData = {
            labels: ['Busca Orgânica', 'Redes Sociais', 'Tráfego Direto', 'Referências', 'Email Marketing'],
            datasets: [{
                data: [45, 25, 15, 10, 5],
                backgroundColor: [
                    '#4f46e5',
                    '#0d9488',
                    '#f43f5e',
                    '#f59e0b',
                    '#8b5cf6'
                ],
                borderWidth: 2
            }]
        };

        // Dados para o gráfico de conversão por dispositivo
        this.deviceData = {
            labels: ['Desktop', 'Mobile', 'Tablet'],
            datasets: [{
                label: 'Taxa de Conversão (%)',
                data: [4.2, 2.8, 1.5],
                backgroundColor: [
                    '#4f46e5',
                    '#0d9488',
                    '#e67e22'
                ],
                borderWidth: 2
            }]
        };
    }

    setupEventListeners() {
        // Event listener para seleção de período
        const dateSelect = document.getElementById('date-select');
        if (dateSelect) {
            dateSelect.addEventListener('change', (e) => {
                this.currentDateRange = parseInt(e.target.value);
                this.updateMetrics();
                this.updateTrendChart();
            });
        }

        // Event listeners para botões de tipo de gráfico
        const chartButtons = document.querySelectorAll('.chart-btn');
        chartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remover classe active de todos os botões
                chartButtons.forEach(btn => btn.classList.remove('active'));
                // Adicionar classe active ao botão clicado
                e.target.classList.add('active');

                // Atualizar o gráfico de tendência com o novo tipo
                this.updateTrendChart(e.target.dataset.type);
            });
        });
    }

    renderCharts() {
        // Renderizar gráfico de tendência
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        this.trendChart = new Chart(trendCtx, {
            type: 'line',
            data: this.trendData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            display: true,
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Renderizar gráfico de fontes de tráfego (pizza)
        const sourcesCtx = document.getElementById('sourcesChart').getContext('2d');
        this.sourcesChart = new Chart(sourcesCtx, {
            type: 'doughnut',
            data: this.sourcesData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${percentage}%`;
                            }
                        }
                    }
                }
            }
        });

        // Renderizar gráfico de conversão por dispositivo (barras)
        const deviceCtx = document.getElementById('deviceChart').getContext('2d');
        this.deviceChart = new Chart(deviceCtx, {
            type: 'bar',
            data: this.deviceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    updateMetrics() {
        // Simular atualização das métricas baseada no período selecionado
        const visitorsEl = document.getElementById('visitors-count');
        const conversionEl = document.getElementById('conversion-rate');
        const revenueEl = document.getElementById('revenue');
        const avgTimeEl = document.getElementById('avg-time');

        // Valores base para 30 dias
        let visitors = 12450;
        let conversion = 3.8;
        let revenue = 84200;
        let avgTime = '4m 23s';

        // Ajustar valores baseado no período
        if (this.currentDateRange === 7) {
            visitors = 2850;
            conversion = 4.1;
            revenue = 19800;
            avgTime = '4m 10s';
        } else if (this.currentDateRange === 90) {
            visitors = 37800;
            conversion = 3.5;
            revenue = 252600;
            avgTime = '4m 35s';
        } else if (this.currentDateRange === 365) {
            visitors = 148200;
            conversion = 3.2;
            revenue = 1010400;
            avgTime = '4m 15s';
        }

        // Atualizar os elementos com animação simples
        this.animateNumber(visitorsEl, visitors);
        this.animateNumber(conversionEl, conversion, 1, true);
        this.animateNumber(revenueEl, revenue, 0, true);
        avgTimeEl.textContent = avgTime;
    }

    animateNumber(element, target, decimals = 0, isCurrency = false) {
        let start = 0;
        if (isCurrency) {
            // Extrair valor numérico do texto atual (removendo R$ e pontos)
            const currentText = element.textContent;
            const currentValue = parseFloat(currentText.replace(/[^\d,-]/g, '').replace(',', '.'));
            start = currentValue;
        } else if (element.textContent.includes('%')) {
            start = parseFloat(element.textContent);
        } else {
            start = parseFloat(element.textContent.replace(/\D/g, '')) || 0;
        }

        const duration = 1000; // 1 segundo
        const startTime = performance.now();

        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            let currentValue;
            if (isCurrency) {
                currentValue = start + (target - start) * progress;
                element.textContent = `R$ ${currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            } else if (decimals > 0) {
                currentValue = start + (target - start) * progress;
                element.textContent = currentValue.toFixed(decimals) + (decimals === 1 ? '%' : '');
            } else {
                currentValue = Math.floor(start + (target - start) * progress);
                element.textContent = currentValue.toLocaleString('pt-BR');
            }

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }

        requestAnimationFrame(updateNumber);
    }

    updateTrendChart(type = 'line') {
        if (this.trendChart) {
            this.trendChart.destroy();

            const trendCtx = document.getElementById('trendChart').getContext('2d');
            this.trendChart = new Chart(trendCtx, {
                type: type,
                data: this.trendData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: {
                                display: true,
                                color: 'rgba(0,0,0,0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }
}

// Inicializar o dashboard quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new AnalyticsDashboard();
});