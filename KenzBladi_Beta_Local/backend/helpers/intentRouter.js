/**
 * Intent Router — classifies user messages for the RAG pipeline.
 * Returns: { intent, productRef }
 *
 * Intents:
 *   NAVIGATION  — user asks about categories, browsing, what's available
 *   GENERAL     — FAQs: delivery, payment, returns, who is Kenz Bladi
 *   SPECIALIST  — specific product query (by ref or product name)
 *   UNKNOWN     — cannot classify
 */

const NAVIGATION_PATTERNS = [
  /catégori/i, /categori/i, /rayon/i, /section/i, /rubrique/i,
  /quels? produits?/i, /qu[''']est[\s-]ce que vous vendez/i,
  /que vendez/i, /gamme/i, /collection/i, /artisanat/i,
  /alimentaire/i, /cosmétique/i, /textile/i, /parcourir/i, /explorer/i,
  /navigu/i, /browse/i, /catalog/i, /catalogue/i, /menu/i,
  /ما هي/i, /شنو عندكم/i, /أقسام/i
];

const GENERAL_PATTERNS = [
  /livraison/i, /délai/i, /expédition/i, /livrer/i, /shipping/i, /delivery/i,
  /paiement/i, /payer/i, /virement/i, /carte bancaire/i, /cod/i, /paypal/i,
  /retour/i, /remboursement/i, /échange/i, /retourner/i,
  /qui est kenz bladi/i, /c[''']est quoi kenz bladi/i, /votre site/i,
  /contact/i, /support/i, /service client/i,
  /authenti/i, /certif/i, /qualité/i, /garantie/i,
  /كيف/i, /ثمن التوصيل/i, /الدفع/i, /الإرجاع/i
];

const SPECIALIST_PATTERNS = [
  /(?:ref|produit|article|référence)\s*[:\s]?\s*([A-Z0-9\-]+)/i,
  /huile d[''']argan/i, /argan/i, /savon beldi/i, /beldi/i,
  /ghassoul/i, /ras el hanout/i, /safran/i, /amlou/i,
  /couscous/i, /henné/i, /zellige/i, /babouche/i, /djellaba/i,
  /tapis/i, /poterie/i, /bijoux?/i, /argent/i,
  /prix/i, /tarif/i, /combien/i, /coûte/i, /stock/i, /disponible/i,
  /acheter/i, /commander/i, /composition/i, /ingrédient/i,
  /where.*buy/i, /how much/i, /in stock/i
];

const REF_EXTRACTOR = /(?:ref|produit|article|référence)\s*[:\s]?\s*([A-Z0-9\-]{4,})/i;

/**
 * @param {string} message
 * @returns {{ intent: 'NAVIGATION'|'GENERAL'|'SPECIALIST'|'UNKNOWN', productRef: string|null }}
 */
exports.classifyIntent = (message) => {
  if (!message || typeof message !== 'string') {
    return { intent: 'UNKNOWN', productRef: null };
  }

  const text = message.trim();

  // Extract product ref first (works for all intents)
  const refMatch = text.match(REF_EXTRACTOR);
  const productRef = refMatch ? refMatch[1].toUpperCase() : null;

  // If ref extracted → always SPECIALIST
  if (productRef) {
    return { intent: 'SPECIALIST', productRef };
  }

  // Score-based classification
  const navScore = NAVIGATION_PATTERNS.filter((p) => p.test(text)).length;
  const genScore = GENERAL_PATTERNS.filter((p) => p.test(text)).length;
  const specScore = SPECIALIST_PATTERNS.filter((p) => p.test(text)).length;

  if (specScore === 0 && navScore === 0 && genScore === 0) {
    return { intent: 'UNKNOWN', productRef: null };
  }

  const max = Math.max(navScore, genScore, specScore);
  if (max === specScore) return { intent: 'SPECIALIST', productRef: null };
  if (max === navScore) return { intent: 'NAVIGATION', productRef: null };
  return { intent: 'GENERAL', productRef: null };
};
