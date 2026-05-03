const turbinesChart = new Chart(document.getElementById('turbinesChart'), {
    type: 'bar',
    data: {
        labels: ['Т1', 'Т2', 'Т3', 'Т4', 'Т5', 'Т6', 'Т7', 'Т8', 'Т9', 'Т10'],
        datasets: [{
            label: 'Потужність турбін (МВт)',
            data: [0,0,0,0,0,0,0,0,0,0],
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true, max: 3 } } }
});

const windChart = new Chart(document.getElementById('windChart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Швидкість вітру (м/с)',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.3
        }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true, max: 25 } } }
});

const roseChart = new Chart(document.getElementById('roseChart'), {
    type: 'radar',
    data: {
        labels: ['Пн', 'Пн-Сх', 'Сх', 'Пд-Сх', 'Пд', 'Пд-Зх', 'Зх', 'Пн-Зх'],
        datasets: [{
            label: 'Сила вітру за напрямком',
            data: [0,0,0,0,0,0,0,0],
            backgroundColor: 'rgba(255, 99, 132, 0.4)',
            borderColor: 'rgb(255, 99, 132)'
        }]
    },
    options: { responsive: true, scales: { r: { beginAtZero: true } } }
});

const gaugeChart = new Chart(document.getElementById('gaugeChart'), {
    type: 'doughnut',
    data: {
        labels: ['КВВП (%)', 'Залишок'],
        datasets: [{
            data: [0, 100],
            backgroundColor: ['rgb(40, 167, 69)', 'rgb(233, 236, 239)']
        }]
    },
    options: {
        responsive: true,
        circumference: 180,
        rotation: -90,
        cutout: '75%'
    }
});

const dataHistory = [];
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Онлайн';
    statusEl.className = 'text-success';
};

socket.onclose = () => {
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Офлайн';
    statusEl.className = 'text-danger';
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    document.getElementById('totalPowerText').textContent = data.totalPower;
    document.getElementById('windSpeedText').textContent = data.windSpeed;
    document.getElementById('directionText').textContent = data.direction;

    turbinesChart.data.datasets[0].data = data.turbines;
    turbinesChart.update();

    const time = new Date(data.timestamp).toLocaleTimeString();
    windChart.data.labels.push(time);
    windChart.data.datasets[0].data.push(data.windSpeed);
    if (windChart.data.labels.length > 20) {
        windChart.data.labels.shift();
        windChart.data.datasets[0].data.shift();
    }
    windChart.update();

    const dirIndex = Math.round(data.direction / 45) % 8;
    const roseData = [0,0,0,0,0,0,0,0];
    roseData[dirIndex] = data.windSpeed;
    roseChart.data.datasets[0].data = roseData;
    roseChart.update();

    let safeKvvp = data.kvvp > 100 ? 100 : data.kvvp;
    gaugeChart.data.datasets[0].data = [safeKvvp, 100 - safeKvvp];
    gaugeChart.update();

    dataHistory.unshift(data);
    if (dataHistory.length > 10) dataHistory.pop();
    updateTable();
};

function updateTable() {
    const tableDiv = document.getElementById('dataTable');
    let html = '<table class="table table-hover"><thead><tr><th>Час</th><th>Швидкість (м/с)</th><th>Напрямок (°)</th><th>Потужність (МВт)</th><th>КВВП (%)</th></tr></thead><tbody>';
    
    dataHistory.forEach(item => {
        const time = new Date(item.timestamp).toLocaleTimeString();
        html += `<tr><td>${time}</td><td>${item.windSpeed}</td><td>${item.direction}</td><td>${item.totalPower}</td><td>${item.kvvp}</td></tr>`;
    });
    
    html += '</tbody></table>';
    tableDiv.innerHTML = html;
}