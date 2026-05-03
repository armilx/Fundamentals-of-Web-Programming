const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

console.log('Сервер працює! Очікування підключень на порту 8080...');

function generateWindData() {
    const windSpeed = 5 + Math.random() * 15;
    const direction = Math.floor(Math.random() * 360);
    const turbines = [];
    let totalPower = 0;

    for (let i = 0; i < 10; i++) {
        const power = (windSpeed > 3 && windSpeed < 25) ? (windSpeed * 0.1) + Math.random() * 0.2 : 0;
        const roundedPower = Number(power.toFixed(2));
        turbines.push(roundedPower);
        totalPower += roundedPower;
    }

    const kvvp = (totalPower / 25) * 100;

    return {
        timestamp: Date.now(),
        windSpeed: Number(windSpeed.toFixed(1)),
        direction: direction,
        turbines: turbines,
        totalPower: Number(totalPower.toFixed(2)),
        kvvp: Number(kvvp.toFixed(1))
    };
}

wss.on('connection', (ws) => {
    console.log('Клієнт підключився до сервера!');
    
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(generateWindData()));
        }
    }, 2000);

    ws.on('close', () => {
        console.log('Клієнт відключився');
        clearInterval(interval);
    });
    
    ws.on('error', () => clearInterval(interval));
});