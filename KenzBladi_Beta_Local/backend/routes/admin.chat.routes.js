const express = require('express');
const router = express.Router();
const adminAuth = require('../middlewares/adminAuth.middleware');
const { readData, writeData } = require('../helpers/dataAccess');

// GET /api/admin/chat-sessions
// Returns list of sessions (grouped by sessionId) with metadata
router.get('/', adminAuth, (req, res) => {
  try {
    const conversations = readData('conversations.json');

    // Group turns by sessionId
    const sessionMap = {};
    conversations.forEach((turn) => {
      const sid = turn.sessionId;
      if (!sessionMap[sid]) {
        sessionMap[sid] = {
          sessionId: sid,
          startedAt: turn.timestamp,
          lastActivity: turn.timestamp,
          messageCount: 0,
          language: turn.language || 'fr',
          turns: []
        };
      }
      sessionMap[sid].messageCount++;
      sessionMap[sid].lastActivity = turn.timestamp;
      sessionMap[sid].turns.push(turn);
    });

    const sessions = Object.values(sessionMap).sort(
      (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)
    );

    res.json({ total: sessions.length, data: sessions });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// GET /api/admin/chat-sessions/:sessionId
router.get('/:sessionId', adminAuth, (req, res) => {
  try {
    const conversations = readData('conversations.json');
    const turns = conversations.filter((c) => c.sessionId === req.params.sessionId);
    if (!turns.length) return res.status(404).json({ message: 'Session non trouvée.' });
    res.json({ sessionId: req.params.sessionId, turns });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// DELETE /api/admin/chat-sessions/:sessionId
router.delete('/:sessionId', adminAuth, (req, res) => {
  try {
    const conversations = readData('conversations.json');
    const filtered = conversations.filter((c) => c.sessionId !== req.params.sessionId);

    if (filtered.length === conversations.length) {
      return res.status(404).json({ message: 'Session non trouvée.' });
    }

    writeData('conversations.json', filtered);
    res.json({ message: 'Session supprimée.', sessionId: req.params.sessionId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// DELETE /api/admin/chat-sessions  (clear all)
router.delete('/', adminAuth, (req, res) => {
  try {
    writeData('conversations.json', []);
    res.json({ message: 'Toutes les sessions ont été supprimées.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

module.exports = router;
