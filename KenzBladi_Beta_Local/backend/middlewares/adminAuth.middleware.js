const jwt = require('jsonwebtoken');

const JWT_SECRET = 'kenzbladi-admin-secret-2026';

module.exports = (req, res, next) => {
  const token = req.headers['admin-token'];

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};
