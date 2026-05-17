const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const router = express.Router();

router.post('/register',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 10 }).trim().escape(),
    body('name').notEmpty().trim().escape(),
    body('role').isIn(['engineer', 'admin']),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password, name, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, name, role],
            function(err) {
                if (err) return res.status(400).json({ error: 'User already exists' });
                res.status(201).json({ message: 'User registered' });
            }
        );
    }
);

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: info.message || 'Login failed' });
        
        req.logIn(user, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({ message: 'Logged in', user: { id: user.id, email: user.email, role: user.role } });
        });
    })(req, res, next);
});

router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Logged out' });
    });
});

module.exports = router;