const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1';
const OLLAMA_TIMEOUT = 60000; // 60s

const SYSTEM_PERSONA = `Tu es Kenza, l'assistante officielle de Kenz Bladi — la marketplace marocaine des produits du terroir authentique. Tu es chaleureuse, passionnée par la culture marocaine et les produits artisanaux. Tu parles en Français, Darija ou Anglais selon la langue de l'utilisateur. Tu es précise, honnête, et tu n'inventes jamais d'informations sur les produits. Si tu ne sais pas quelque chose, tu le dis gentiment et tu proposes d'aider autrement.`;

/**
 * Calls the local Ollama server.
 *
 * @param {Array<{role: string, content: string}>} messages  - Full conversation history
 * @param {string} ragContext                                 - Injected context string
 * @returns {Promise<string>}                                 - Assistant reply text
 */
exports.callOllama = async (messages, ragContext) => {
  // Build the message array: system prompt + optional RAG context + history
  const systemMessage = {
    role: 'system',
    content: ragContext
      ? `${SYSTEM_PERSONA}\n\n---\nCONTEXTE DISPONIBLE:\n${ragContext}\n---\nUtilise ce contexte pour répondre avec précision. Ne l'invente pas si l'information n'est pas dans le contexte.`
      : SYSTEM_PERSONA
  };

  const payload = {
    model: OLLAMA_MODEL,
    messages: [systemMessage, ...messages],
    stream: false,
    options: {
      temperature: 0.7,
      top_p: 0.9,
      num_predict: 512
    }
  };

  try {
    const response = await axios.post(OLLAMA_URL, payload, {
      timeout: OLLAMA_TIMEOUT,
      headers: { 'Content-Type': 'application/json' }
    });

    const reply = response.data?.message?.content;
    if (!reply) throw new Error('Réponse Ollama vide ou malformée.');
    return reply.trim();
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
      throw new Error(
        'Ollama est inaccessible. Vérifiez que Ollama est lancé sur http://localhost:11434 avec le modèle llama3.1.'
      );
    }
    if (err.response?.status === 404) {
      throw new Error(
        `Le modèle "${OLLAMA_MODEL}" n'est pas installé. Lancez: ollama pull ${OLLAMA_MODEL}`
      );
    }
    throw err;
  }
};

/**
 * Detects language from recent messages for the response metadata.
 * @param {string} text
 * @returns {'fr'|'ar'|'en'|'darija'}
 */
exports.detectLanguage = (text) => {
  if (!text) return 'fr';
  // Arabic/Darija Unicode block
  if (/[؀-ۿ]/.test(text)) return 'ar';
  // Common English words
  if (/\b(the|is|are|what|how|can|i|we|you|please|thank)\b/i.test(text)) return 'en';
  return 'fr';
};
