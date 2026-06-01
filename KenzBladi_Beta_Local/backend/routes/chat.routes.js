const express = require('express');
const router = express.Router();
const { handleChat, getHistory } = require('../controllers/chat.controller');

// POST /api/chat  — send a message, get Kenza's reply
router.post('/', handleChat);

// GET /api/chat/history/:sessionId  — retrieve full session history
router.get('/history/:sessionId', getHistory);

module.exports = router;
