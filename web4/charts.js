class WindCharts {
    constructor() {
        this.speedChart = new Chart(document.getElementById('windSpeedChart').getContext('2d'), {
            type: 'line', data: { labels: [], datasets: [{ label: 'Швидкість (м/с)', data: [], borderColor: 'blue', tension: 0.4 }] }
        });
        this.turbinesChart = new Chart(document.getElementById('turbinesChart').getContext('2d'), {
            type: 'bar', data: { labels: ['Т1','Т2','Т3','Т4','Т5','Т6','Т7','Т8','Т9','Т10'], datasets: [{ label: 'МВт', data: Array(10).fill(0), backgroundColor: 'teal' }] }
        });
        this.gaugeChart = new Chart(document.getElementById('cfGaugeChart').getContext('2d'), {
            type: 'doughnut', data: { labels: ['КВВП', 'Залишок'], datasets: [{ data: [0, 100], backgroundColor: ['orange', '#ddd'] }] },
            options: { rotation: -90, circumference: 180 }
        });
        this.roseChart = new Chart(document.getElementById('windRoseChart').getContext('2d'), {
            type: 'radar', data: { labels: ['Пн','Пн-Сх','Сх','Пд-Сх','Пд','Пд-Зх','Зх','Пн-Зх'], datasets: [{ label: 'Напрямок', data: Array(8).fill(0), borderColor: 'purple' }] }
        });
    }

    update(data) {
        const time = new Date(data.timestamp).toLocaleTimeString();
        
        this.speedChart.data.labels.push(time);
        this.speedChart.data.datasets[0].data.push(data.windSpeed);
        if (this.speedChart.data.labels.length > 15) { this.speedChart.data.labels.shift(); this.speedChart.data.datasets[0].data.shift(); }
        this.speedChart.update();

        this.turbinesChart.data.datasets[0].data = data.turbines;
        this.turbinesChart.update();

        this.gaugeChart.data.datasets[0].data = [data.capacityFactor, 100 - data.capacityFactor];
        this.gaugeChart.update();

        const sector = Math.round(data.windDirection / 45) % 8;
        const radarData = Array(8).fill(0);
        radarData[sector] = 1;
        this.roseChart.data.datasets[0].data = radarData;
        this.roseChart.update();
    }
}