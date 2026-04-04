document.addEventListener('DOMContentLoaded', () => {
    loadSPP();

    const form = document.getElementById('sppForm');
    const batteryRadios = document.querySelectorAll('input[name="hasBattery"]');
    const batteryGroup = document.getElementById('batteryCapacityGroup');
    const batteryInput = document.getElementById('batteryCapacity');
    const powerInput = document.getElementById('power');
    const calcResult = document.getElementById('calcResult');

    batteryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'yes') {
                batteryGroup.style.display = 'block';
                batteryInput.required = true;
            } else {
                batteryGroup.style.display = 'none';
                batteryInput.required = false;
                batteryInput.value = '';
            }
        });
    });

    powerInput.addEventListener('input', (e) => {
        const power = parseFloat(e.target.value) || 0;
        calcResult.textContent = (power * 1100).toLocaleString('uk-UA');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/spp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if (result.success) {
                showMessage('success', result.message);
                form.reset();
                calcResult.textContent = '0';
                batteryGroup.style.display = 'none';
                loadSPP();
            } else {
                showMessage('error', result.message);
            }
        } catch (error) {
            showMessage('error', 'Помилка з\'єднання');
        }
    });
});

async function loadSPP() {
    try {
        const response = await fetch('/api/spp');
        const data = await response.json();
        displaySPP(data);
        updateStatistics(data);
    } catch (error) {
        console.error('Помилка завантаження:', error);
    }
}

function updateStatistics(data) {
    const totalCount = data.length;
    const totalPower = data.reduce((sum, item) => sum + item.power, 0);
    const totalBattery = data.reduce((sum, item) => sum + (item.batteryCapacity || 0), 0);

    document.getElementById('statCount').textContent = totalCount;
    document.getElementById('statPower').textContent = totalPower.toFixed(1);
    document.getElementById('statBattery').textContent = totalBattery.toFixed(1);
}

function displaySPP(sppList) {
    const container = document.getElementById('sppList');
    if (sppList.length === 0) {
        container.innerHTML = '<p>Немає зареєстрованих СЕС.</p>';
        return;
    }

    const types = { 'roof': 'Дах', 'ground': 'Наземна', 'garage': 'Гараж', 'mono': 'Монокристалічні', 'poly': 'Полікристалічні', 'thin': 'Тонкоплівкові' };

    container.innerHTML = sppList.map(spp => `
        <div class="spp-card">
            <h3>Власник: ${spp.ownerName}</h3>
            <p><strong>Тип об'єкта:</strong> ${types[spp.objectType]}</p>
            <p><strong>Адреса:</strong> ${spp.address}</p>
            <p><strong>Потужність:</strong> ${spp.power} кВт (${spp.panelCount} шт. - ${types[spp.panelType]})</p>
            <p><strong>АКБ:</strong> ${spp.hasBattery === 'yes' ? spp.batteryCapacity + ' кВт*год' : 'Відсутні'}</p>
            <button class="btn btn-delete" onclick="deleteSPP('${spp.id}')">Видалити</button>
        </div>
    `).join('');
}

async function deleteSPP(id) {
    if (!confirm('Видалити цей об\'єкт?')) return;
    try {
        const response = await fetch(`/api/spp/${id}`, { method: 'DELETE' });
        if ((await response.json()).success) loadSPP();
    } catch (error) {
        console.error('Помилка видалення:', error);
    }
}

function showMessage(type, text) {
    const msgDiv = document.getElementById('message');
    msgDiv.className = `message ${type}`;
    msgDiv.textContent = text;
    setTimeout(() => msgDiv.style.display = 'none', 3000);
}