// Simulador de Investimentos
class InvestmentSimulator {
    constructor() {
        this.chart = null;
        this.init();
    }

    init() {
        this.calculate();
        document.getElementById('calculate-btn').addEventListener('click', () => this.calculate());

        // Permitir calcular com Enter
        document.getElementById('initial-investment').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.calculate();
        });
        document.getElementById('monthly-contribution').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.calculate();
        });
        document.getElementById('annual-rate').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.calculate();
        });
        document.getElementById('years').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.calculate();
        });
    }

    calculate() {
        // Obter valores dos inputs
        const initialInvestment = parseFloat(document.getElementById('initial-investment').value) || 0;
        const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value) || 0;
        const annualRate = parseFloat(document.getElementById('annual-rate').value) || 0;
        const years = parseInt(document.getElementById('years').value) || 0;

        // Validação básica
        const err = document.getElementById('form-error');
        if (years <= 0 || (initialInvestment <= 0 && monthlyContribution <= 0)) {
            err.textContent = 'Informe um valor inicial ou aporte, e um período de pelo menos 1 ano.';
            err.hidden = false;
            return;
        }
        err.hidden = true;
        document.getElementById('results').classList.add('show');

        // Converter taxa anual para mensal
        const monthlyRate = (annualRate / 100) / 12;
        const months = years * 12;

        // Calcular resultados
        const futureValue = this.calculateFutureValue(initialInvestment, monthlyContribution, monthlyRate, months);
        const totalInvested = initialInvestment + (monthlyContribution * months);
        const totalReturn = futureValue - totalInvested;
        const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

        // Exibir resumo
        this.displaySummary({
            initialInvestment,
            monthlyContribution,
            annualRate,
            years,
            futureValue,
            totalInvested,
            totalReturn,
            returnPercentage
        });

        // Gerar dados para o gráfico
        const chartData = this.generateChartData(initialInvestment, monthlyContribution, monthlyRate, months);
        this.renderChart(chartData.labels, chartData.data);

        // Gerar tabela de evolução anual
        this.renderYearlyTable(initialInvestment, monthlyContribution, monthlyRate, years);
    }

    calculateFutureValue(initial, monthly, monthlyRate, months) {
        // Fórmula de juros compostos com aportes mensais
        // FV = P*(1+r)^n + PMT*[((1+r)^n - 1)/r]
        if (monthlyRate === 0) return initial + monthly * months;
        const futureValueInitial = initial * Math.pow(1 + monthlyRate, months);
        const futureValueContributions = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        return futureValueInitial + futureValueContributions;
    }

    generateChartData(initial, monthly, monthlyRate, months) {
        const labels = [];
        const data = [];

        // Adicionar ponto inicial (mês 0)
        labels.push('Início');
        data.push(initial);

        // Calcular para cada ano
        for (let year = 1; year <= months / 12; year++) {
            const month = year * 12;
            const value = this.calculateFutureValue(initial, monthly, monthlyRate, month);

            labels.push(`${year} ano${year > 1 ? 's' : ''}`);
            data.push(value);
        }

        return { labels, data };
    }

    renderChart(labels, data) {
        const ctx = document.getElementById('investmentChart').getContext('2d');

        // Destruir gráfico existente se houver
        if (this.chart) {
            this.chart.destroy();
        }

        if (Chart.defaults) { Chart.defaults.color = '#aeb8d3'; Chart.defaults.borderColor = 'rgba(255,255,255,.08)'; Chart.defaults.font.family = "'Sora', sans-serif"; }
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valor Acumulado (R$)',
                    data: data,
                    borderColor: '#f5c451',
                    backgroundColor: 'rgba(245, 196, 81, 0.12)',
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 3,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'R$ ' + context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                            }
                        }
                    }
                }
            }
        });
    }

    renderYearlyTable(initial, monthly, monthlyRate, years) {
        const f = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let rows = '';
        for (let year = 1; year <= years; year++) {
            const months = year * 12;
            const invested = initial + (monthly * months);
            const accumulated = this.calculateFutureValue(initial, monthly, monthlyRate, months);
            const profit = accumulated - invested;
            const pct = invested > 0 ? (profit / invested) * 100 : 0;
            rows += `<tr><td>${year}</td><td>R$ ${f(invested)}</td><td>R$ ${f(accumulated)}</td><td class="pos">R$ ${f(profit)}</td><td>${f(pct)}%</td></tr>`;
        }
        document.getElementById('table-container').innerHTML = `
            <h3>Evolução anual</h3>
            <div class="table-scroll"><table>
                <thead><tr><th>Ano</th><th>Investido</th><th>Acumulado</th><th>Lucro</th><th>Retorno</th></tr></thead>
                <tbody>${rows}</tbody>
            </table></div>`;
    }

    displaySummary(p) {
        const f = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const share = p.futureValue > 0 ? Math.round(p.totalInvested / p.futureValue * 100) : 100;
        document.getElementById('summary-box').innerHTML = `
            <div class="kpi main"><span>Valor futuro</span><strong>R$ ${f(p.futureValue)}</strong></div>
            <div class="kpi"><span>Total investido</span><strong>R$ ${f(p.totalInvested)}</strong></div>
            <div class="kpi gain"><span>Lucro com juros</span><strong>R$ ${f(p.totalReturn)}</strong></div>
            <div class="kpi"><span>Retorno total</span><strong>${f(p.returnPercentage)}%</strong></div>
            <div class="split" aria-label="Proporção investido x juros"><i style="width:${share}%"></i></div>
            <p class="split-legend"><b>${share}%</b> do seu patrimônio vem de aportes, <b>${100 - share}%</b> dos juros em ${p.years} ano${p.years > 1 ? 's' : ''}.</p>`;
    }
}

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.investmentSimulator = new InvestmentSimulator();
});