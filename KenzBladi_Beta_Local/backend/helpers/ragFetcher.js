/**
 * RAG Fetcher — retrieves relevant context from local JSON files
 * based on classified intent.
 */

const { readData } = require('./dataAccess');

/**
 * NAVIGATION intent — returns active category names + descriptions.
 */
function fetchNavigationContext() {
  try {
    const taxonomies = readData('taxonomies.json');
    const active = taxonomies.filter((t) => t.etatObjet === 'code-1');

    const lines = active.map((t) => {
      const fr = t.translations?.find((tr) => tr.language === 'fr');
      const name = fr?.designation || t.reference;
      const desc = fr?.description || '';
      return `• ${name}${desc ? ': ' + desc : ''}`;
    });

    return [
      'Voici les catégories disponibles sur Kenz Bladi:',
      ...lines
    ].join('\n');
  } catch {
    return 'Informations de navigation non disponibles.';
  }
}

/**
 * GENERAL intent — returns FAQ questions & answers.
 */
function fetchGeneralContext(message) {
  try {
    const faqs = readData('faqs.json');
    const active = faqs.filter(
      (f) => f.etatObjet === 'code-1' && f.etatDePublication === 'code_541'
    );

    const msgLower = (message || '').toLowerCase();

    // Score each FAQ section by keyword relevance
    const scored = active.map((faq) => {
      const frTrans = faq.translations?.find((t) => t.language === 'fr');
      const designation = frTrans?.designation?.toLowerCase() || '';
      const description = frTrans?.description?.toLowerCase() || '';
      const score =
        (msgLower.includes(designation) ? 3 : 0) +
        (description.split(' ').filter((w) => w.length > 4 && msgLower.includes(w)).length);
      return { faq, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Take top 2 FAQ sections
    const topFaqs = scored.slice(0, 2).map(({ faq }) => faq);

    const chunks = [];
    topFaqs.forEach((faq) => {
      const frTrans = faq.translations?.find((t) => t.language === 'fr');
      if (frTrans?.designation) chunks.push(`\n## ${frTrans.designation}`);

      (faq.questions || []).forEach((q) => {
        const qFr = q.translations?.find((t) => t.language === 'fr');
        if (qFr?.question && qFr?.reponse) {
          chunks.push(`Q: ${qFr.question}\nR: ${qFr.reponse}`);
        }
      });
    });

    return chunks.length
      ? chunks.join('\n')
      : 'Informations générales non disponibles.';
  } catch {
    return 'Informations générales non disponibles.';
  }
}

/**
 * SPECIALIST intent — returns product details, matched by ref or keyword.
 */
function fetchSpecialistContext(productRef, message) {
  try {
    const produits = readData('produits.json');

    let product = null;

    // 1. Match by explicit ref
    if (productRef) {
      product = produits.find(
        (p) => p.refProduit?.toUpperCase() === productRef.toUpperCase()
      );
    }

    // 2. Fallback: fuzzy keyword match against fr designation
    if (!product && message) {
      const msgLower = message.toLowerCase();
      const scored = produits
        .filter((p) => p.etatObjet === 'code-1')
        .map((p) => {
          const fr = p.translations?.find((t) => t.language === 'fr');
          const name = (fr?.designationProduit || '').toLowerCase();
          const tags = (fr?.tags || []).map((t) => t.toLowerCase());
          const nameScore = name.split(' ').filter((w) => w.length > 3 && msgLower.includes(w)).length;
          const tagScore = tags.filter((t) => msgLower.includes(t)).length * 2;
          return { p, score: nameScore + tagScore };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score);

      product = scored[0]?.p || null;
    }

    if (!product) {
      return `Aucun produit trouvé${productRef ? ' pour la référence ' + productRef : ''}. Voici quelques produits disponibles:\n` +
        produits
          .filter((p) => p.etatObjet === 'code-1' && p.etatDePublication === 'code_541')
          .slice(0, 3)
          .map((p) => {
            const fr = p.translations?.find((t) => t.language === 'fr');
            const priceTTC = ((p.tarifUHTPardefaut || 0) * (1 + (p.tvaParDefaut || 20) / 100)).toFixed(2);
            return `• ${fr?.designationProduit || p.refProduit} — ${priceTTC} MAD TTC`;
          })
          .join('\n');
    }

    const fr = product.translations?.find((t) => t.language === 'fr');
    const priceTTC = ((product.tarifUHTPardefaut || 0) * (1 + (product.tvaParDefaut || 20) / 100)).toFixed(2);
    const stock = product.indicationDuStock;
    const caracteristiques = (product.caracteristiquePhysique || [])
      .map((c) => `  - ${c.type}: ${c.valeur}`)
      .join('\n');

    return [
      `Produit: ${fr?.designationProduit || product.refProduit}`,
      `Référence: ${product.refProduit}`,
      `Slogan: ${fr?.slogan || ''}`,
      `Prix: ${priceTTC} MAD TTC (HT: ${product.tarifUHTPardefaut} MAD, TVA: ${product.tvaParDefaut}%)`,
      `Stock: ${stock?.etatStock || 'N/A'} (Quantité: ${stock?.quantiteDisponible ?? 'N/A'})`,
      `Région: ${(product.region || []).join(', ')}`,
      caracteristiques ? `Caractéristiques:\n${caracteristiques}` : '',
      `Description: ${fr?.descriptifProduit || ''}`,
      fr?.tags?.length ? `Tags: ${fr.tags.join(', ')}` : ''
    ]
      .filter(Boolean)
      .join('\n');
  } catch {
    return 'Informations produit non disponibles.';
  }
}

/**
 * Main entry point.
 * @param {'NAVIGATION'|'GENERAL'|'SPECIALIST'|'UNKNOWN'} intent
 * @param {string|null} productRef
 * @param {string} message
 * @returns {string}
 */
exports.fetchContext = (intent, productRef, message) => {
  switch (intent) {
    case 'NAVIGATION':
      return fetchNavigationContext();
    case 'GENERAL':
      return fetchGeneralContext(message);
    case 'SPECIALIST':
      return fetchSpecialistContext(productRef, message);
    default:
      return '';
  }
};
