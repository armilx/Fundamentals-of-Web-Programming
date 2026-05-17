const express = require('express');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/solar/generation', isAuthenticated, hasRole(['engineer', 'admin']), (req, res) => {
    const currentGen = (4.2 + Math.random() * 0.8).toFixed(2);
    const forecastGen = (4.8 + Math.random() * 0.2).toFixed(2);
    
    res.json({ 
        generation: `${currentGen} MW`, 
        forecast: `${forecastGen} MW`, 
        status: currentGen > 4.5 ? 'Optimal' : 'Normal' 
    });
});

router.get('/solar/panels/status', isAuthenticated, hasRole(['engineer', 'admin']), (req, res) => {
    const offline = Math.floor(Math.random() * 70) + 10;
    const active = 5000 - offline;
    const eff = (95 + Math.random() * 4).toFixed(1);

    res.json({ 
        activePanels: active, 
        offlinePanels: offline, 
        efficiency: `${eff}%` 
    });
});

router.post('/users', isAuthenticated, hasRole(['admin']), (req, res) => {
    res.status(201).json({ message: 'User created by admin' });
});

module.exports = router;