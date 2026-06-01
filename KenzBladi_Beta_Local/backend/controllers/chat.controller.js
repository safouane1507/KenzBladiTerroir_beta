const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../helpers/dataAccess');
const { classifyIntent } = require('../helpers/intentRouter');
const { fetchContext } = require('../helpers/ragFetcher');
const { callOllama, detectLanguage } = require('../helpers/ollamaClient');

const MAX_HISTORY_TURNS = 6; // keep last 6 user+assistant pairs = 12 messages

/**
 * POST /api/chat
 * Body: { message, sessionId?, productRef? }
 */
exports.handleChat = async (req, res) => {
  const { message, productRef: bodyRef } = req.body;
  let { sessionId } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'Le message ne peut pas être vide.' });
  }

  // Create new session if none provided
  if (!sessionId) {
    sessionId = uuidv4();
  }

  try {
    // ── 1. Load conversation history for this session ──────────────────────
    const allConversations = readData('conversations.json');
    const sessionTurns = allConversations
      .filter((c) => c.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Build OpenAI-style message array (last N turns)
    const recentTurns = sessionTurns.slice(-MAX_HISTORY_TURNS);
    const historyMessages = [];
    recentTurns.forEach((turn) => {
      historyMessages.push({ role: 'user', content: turn.userMessage });
      historyMessages.push({ role: 'assistant', content: turn.assistantReply });
    });

    // Add current user message
    historyMessages.push({ role: 'user', content: message.trim() });

    // ── 2. Classify intent ─────────────────────────────────────────────────
    let { intent, productRef } = classifyIntent(message);

    // Override: if productRef passed explicitly in body, force SPECIALIST
    if (bodyRef) {
      intent = 'SPECIALIST';
      productRef = bodyRef;
    }

    // ── 3. Fetch RAG context ───────────────────────────────────────────────
    const ragContext = fetchContext(intent, productRef, message);

    // ── 4. Call Ollama ─────────────────────────────────────────────────────
    const reply = await callOllama(historyMessages, ragContext);

    // ── 5. Detect language ─────────────────────────────────────────────────
    const language = detectLanguage(message);

    // ── 6. Persist conversation turn ───────────────────────────────────────
    const newTurn = {
      _id: uuidv4(),
      sessionId,
      userMessage: message.trim(),
      assistantReply: reply,
      intent,
      productRef: productRef || null,
      language,
      timestamp: new Date().toISOString()
    };

    allConversations.push(newTurn);
    writeData('conversations.json', allConversations);

    // ── 7. Return response ─────────────────────────────────────────────────
    res.json({
      sessionId,
      reply,
      agent: intent,
      language,
      productRef: productRef || null
    });
  } catch (err) {
    console.error('[Chat Controller Error]', err.message);

    // Graceful degradation: return a helpful error rather than crashing
    const friendlyMessage =
      err.message.includes('Ollama') || err.message.includes('modèle')
        ? err.message
        : 'Désolée, je rencontre une difficulté technique. Réessayez dans un instant.';

    res.status(503).json({
      sessionId,
      reply: friendlyMessage,
      agent: 'ERROR',
      language: 'fr',
      error: err.message
    });
  }
};

/**
 * GET /api/chat/history/:sessionId
 */
exports.getHistory = (req, res) => {
  try {
    const conversations = readData('conversations.json');
    const turns = conversations
      .filter((c) => c.sessionId === req.params.sessionId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({ sessionId: req.params.sessionId, turns });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};
