document.addEventListener('DOMContentLoaded', () => {
    const charts = new WindCharts();
    let dataHistory = [];

    const api = new WindAPI(
        (data) => {
            document.getElementById('currentPower').textContent = `${data.totalPower.toFixed(2)} МВт`;
            document.getElementById('windSpeed').textContent = `${data.windSpeed.toFixed(1)} м/с`;
            document.getElementById('capacityFactor').textContent = `${data.capacityFactor.toFixed(1)} %`;
            
            charts.update(data);
            
            dataHistory.unshift(data);
            if (dataHistory.length > 10) dataHistory.pop();
            renderTable(dataHistory);
        },
        (text, className) => {
            const statusLabel = document.getElementById('status');
            statusLabel.textContent = text;
            statusLabel.className = className;
        }
    );

    api.connect();

    function renderTable(history) {
        document.getElementById('dataTable').innerHTML = `
            <table class="table table-striped table-sm">
                <thead><tr><th>Час</th><th>Швидкість (м/с)</th><th>Напрямок</th><th>Потужність (МВт)</th><th>КВВП (%)</th></tr></thead>
                <tbody>${history.map(item => `<tr><td>${new Date(item.timestamp).toLocaleTimeString()}</td><td>${item.windSpeed.toFixed(1)}</td><td>${item.windDirection}&deg;</td><td>${item.totalPower.toFixed(2)}</td><td>${item.capacityFactor.toFixed(1)}</td></tr>`).join('')}</tbody>
            </table>`;
    }
});