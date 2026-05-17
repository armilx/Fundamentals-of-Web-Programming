function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'Unauthorized' });
}

function hasRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
        if (allowedRoles.includes(req.user.role)) return next();
        res.status(403).json({ error: 'Forbidden' });
    };
}

module.exports = { isAuthenticated, hasRole };