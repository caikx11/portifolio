// Simulador de Investimentos
class InvestmentSimulator {
    constructor() {
        this.chart = null;
        this.init();
    }

    init() {
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
        if (initialInvestment < 0 || monthlyContribution < 0 || annualRate < 0 || years <= 0) {
            alert('Por favor, preencha todos os campos com valores válidos');
            return;
        }

        // Converter taxa anual para mensal
        const monthlyRate = (annualRate / 100) / 12;
        const months = years * 12;

        // Calcular resultados
        const futureValue = this.calculateFutureValue(initialInvestment, monthlyContribution, monthlyRate, months);
        const totalInvested = initialInvestment + (monthlyContribution * months);
        const totalReturn = futureValue - totalInvested;
        const returnPercentage = (totalReturn / totalInvested) * 100;

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

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valor Acumulado (R$)',
                    data: data,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
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
        const container = document.getElementById('table-container');
        container.innerHTML = `
            <h3>Evolução Anual</h3>
            <table>
                <thead>
                    <tr>
                        <th>Ano</th>
                        <th>Investido (R$)</th>
                        <th>Valor Acumulado (R$)</th>
                        <th>Lucro (R$)</th>
                        <th>Retorno (%)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (let year = 1; year <= years; year++) {
            const months = year * 12;
            const invested = initial + (monthly * months);
            const accumulated = this.calculateFutureValue(initial, monthly, monthlyRate, months);
            const profit = accumulated - invested;
            const returnPercent = (profit / invested) * 100;

            container.innerHTML += `
                <tr>
                    <td>${year}</td>
                    <td>R$ ${invested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>R$ ${accumulated.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${returnPercent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</td>
                </tr>
            `;
        }

        container.innerHTML += `
                </tbody>
            </table>
        `;
    }

    displaySummary(params) {
        const summaryBox = document.getElementById('summary-box');
        summaryBox.innerHTML = `
            <h3>Resumo da Simulação</h3>
            <p><strong>Investimento Inicial:</strong> R$ ${params.initialInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Aporte Mensal:</strong> R$ ${params.monthlyContribution.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Taxa Anual:</strong> ${params.annualRate}%</p>
            <p><strong>Período:</strong> ${params.years} ano${params.years > 1 ? 's' : ''}</p>
            <hr>
            <p><strong>Total Investido:</strong> R$ ${params.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Valor Futuro:</strong> R$ ${params.futureValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Lucro Total:</strong> R$ ${params.totalReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Retorno Total:</strong> ${params.returnPercentage.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</p>
        `;
    }
}

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.investmentSimulator = new InvestmentSimulator();
});