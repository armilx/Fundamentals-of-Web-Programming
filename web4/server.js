const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket сервер запущено на порту 8080');

function generateWindData() {
    const windSpeed = 5 + Math.random() * 15;
    const windDirection = Math.floor(Math.random() * 360);
    const capacityFactor = 30 + Math.random() * 60;
    
    const turbines = [];
    let totalPower = 0;
    for (let i = 1; i <= 10; i++) {
        let power = (windSpeed > 3 && windSpeed < 25) ? (windSpeed * 0.1) + Math.random() * 0.2 : 0;
        if (power > 2) power = 2;
        turbines.push(power);
        totalPower += power;
    }

    return {
        timestamp: Date.now(),
        windSpeed: windSpeed,
        windDirection: windDirection,
        totalPower: totalPower,
        capacityFactor: capacityFactor,
        turbines: turbines
    };
}

wss.on('connection', (ws) => {
    console.log('Клієнт підключився');
    
    // Відправляємо дані кожні 2 секунди
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(generateWindData()));
        }
    }, 2000);

    ws.on('close', () => {
        console.log('Клієнт відключився');
        clearInterval(interval);
    });
});