const limits = {
    windSpeed: { min: 0, max: 25, normMin: 5, normMax: 15 },
    rotor: { min: 0, max: 20, normMin: 8, normMax: 18 },
    power: { min: 0, max: 2000, normMin: 500, normMax: 1800 },
    bladeAngle: { min: 0, max: 90, normMin: 10, normMax: 45 }
};

let autoInterval = null;
let isAutoEnabled = false;

const ctx = document.getElementById('powerChart').getContext('2d');
const powerHistory = {
    labels: [],
    datasets: [{
        label: 'Вироблена потужність (кВт)',
        data: [],
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
    }]
};

const chart = new Chart(ctx, {
    type: 'line',
    data: powerHistory,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, max: 2200 } },
        plugins: { legend: { labels: { color: '#fff' } } }
    }
});

function formatTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('uk-UA');
}

function getRandomFloat(min, max, decimals = 1) {
    return (Math.random() * (max - min) + min).toFixed(decimals);
}

function checkStatus(value, paramLimits) {
    const v = parseFloat(value);
    if (v >= paramLimits.normMin && v <= paramLimits.normMax) return 'normal';
    if (v >= paramLimits.min && v <= paramLimits.max) return 'danger'; 
    return 'warning';
}

function updateDisplayItem(idValue, idStatus, value, limitsObj) {
    document.getElementById(idValue).textContent = value;
    
    const statusElement = document.getElementById(idStatus);
    const status = checkStatus(value, limitsObj);
    
    statusElement.className = 'status-indicator status-' + status;
    
    if (status === 'normal') statusElement.textContent = '● Норма';
    else if (status === 'warning') statusElement.textContent = '▲ Увага';
    else statusElement.textContent = '❌ Критично';

    return status;
}

function updateChart(time, powerValue) {
    powerHistory.labels.push(time);
    powerHistory.datasets[0].data.push(powerValue);

    if (powerHistory.labels.length > 15) {
        powerHistory.labels.shift();
        powerHistory.datasets[0].data.shift();
    }
    chart.update();
}

function generateSensorData() {
    const time = formatTimestamp();
    document.getElementById('lastUpdate').textContent = time;

    const windSpeed = getRandomFloat(limits.windSpeed.min, limits.windSpeed.max, 1);
    const windStatus = updateDisplayItem('val-wind-speed', 'status-wind-speed', windSpeed, limits.windSpeed);

    const rotor = getRandomFloat(limits.rotor.min, limits.rotor.max, 0);
    updateDisplayItem('val-rotor', 'status-rotor', rotor, limits.rotor);

    const power = getRandomFloat(limits.power.min, limits.power.max, 0);
    updateDisplayItem('val-power', 'status-power', power, limits.power);

    updateChart(time, parseFloat(power));

    const angle = getRandomFloat(limits.bladeAngle.min, limits.bladeAngle.max, 0);
    updateDisplayItem('val-blade-angle', 'status-blade-angle', angle, limits.bladeAngle);

    const degrees = Math.floor(Math.random() * 360);
    const directions = ['Пн', 'Пн-Сх', 'Сх', 'Пд-Сх', 'Пд', 'Пд-Зх', 'Зх', 'Пн-Зх', 'Пн'];
    const dirIndex = Math.round(degrees / 45);
    
    document.getElementById('val-wind-direction').textContent = directions[dirIndex];
    document.getElementById('compass-arrow').style.transform = `rotate(${degrees}deg)`;

    const brakesElement = document.getElementById('val-brakes');

    if (parseFloat(windSpeed) > 20) {
        brakesElement.textContent = 'АКТИВОВАНА!';
        brakesElement.className = 'brake-status danger';

        document.getElementById('card-wind-speed').style.borderColor = '#e74c3c';
    } else {
        brakesElement.textContent = 'Відпущена';
        brakesElement.className = 'brake-status safe';
        document.getElementById('card-wind-speed').style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }
}

function manualUpdate() {
    generateSensorData();
}

function toggleAutoUpdate() {
    const btn = document.getElementById('autoUpdateBtn');
    const statusText = document.getElementById('autoStatus');

    if (!isAutoEnabled) {
        autoInterval = setInterval(generateSensorData, 2500);
        isAutoEnabled = true;
        btn.innerHTML = '⏸️ Зупинити';
        btn.className = 'btn btn-danger';
        statusText.textContent = 'Увімкнено (2.5 сек)';
    } else {
        clearInterval(autoInterval);
        isAutoEnabled = false;
        btn.innerHTML = '▶️ Автооновлення';
        btn.className = 'btn btn-success';
        statusText.textContent = 'Вимкнено';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    generateSensorData();
    
    document.getElementById('updateBtn').addEventListener('click', manualUpdate);
    document.getElementById('autoUpdateBtn').addEventListener('click', toggleAutoUpdate);
});