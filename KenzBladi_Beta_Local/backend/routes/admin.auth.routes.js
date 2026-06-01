const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readData } = require('../helpers/dataAccess');

const JWT_SECRET = 'kenzbladi-admin-secret-2026';
const TOKEN_EXPIRES = '8h';

// POST /api/admin/auth/login
router.post('/login', (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ message: 'Login et mot de passe requis.' });
    }

    const users = readData('admin_users.json');
    const user = users.find((u) => u.login === login && u.etatObjet === 'code-1');

    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const payload = { id: user._id, login: user.login, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

    res.json({
      token,
      user: { id: user._id, login: user.login, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// GET /api/admin/auth/me  (optional — token verification)
router.get('/me', (req, res) => {
  const token = req.headers['admin-token'];
  if (!token) return res.status(401).json({ message: 'Token manquant.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ message: 'Token invalide.' });
  }
});

module.exports = router;
