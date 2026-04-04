const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data', 'spp.json');

function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Помилка читання:', error);
        return [];
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Помилка запису:', error);
        return false;
    }
}

app.get('/api/spp', (req, res) => {
    res.json(readData());
});

app.post('/api/spp', (req, res) => {
    try {
        const newSPP = {
            id: Date.now().toString(),
            ownerName: req.body.ownerName,
            objectType: req.body.objectType,
            address: req.body.address,
            power: parseFloat(req.body.power),
            panelType: req.body.panelType,
            panelCount: parseInt(req.body.panelCount),
            hasBattery: req.body.hasBattery,
            batteryCapacity: req.body.hasBattery === 'yes' ? parseFloat(req.body.batteryCapacity) : 0,
            registrationDate: new Date().toISOString()
        };

        const sppList = readData();
        sppList.push(newSPP);

        if (writeData(sppList)) {
            res.status(201).json({ success: true, message: 'СЕС успішно зареєстровано' });
        } else {
            throw new Error('Помилка запису в файл');
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Помилка сервера', error: error.message });
    }
});

app.delete('/api/spp/:id', (req, res) => {
    const sppList = readData();
    const filtered = sppList.filter(item => item.id !== req.params.id);
    if (writeData(filtered)) {
        res.json({ success: true, message: 'Об\'єкт видалено' });
    } else {
        res.status(500).json({ success: false, message: 'Помилка видалення' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер працює: http://localhost:${PORT}`);
});