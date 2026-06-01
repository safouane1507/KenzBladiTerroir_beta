const express = require('express');
const router = express.Router();
const adminAuth = require('../middlewares/adminAuth.middleware');
const { readData } = require('../helpers/dataAccess');

// GET /api/admin/dashboard/stats
router.get('/stats', adminAuth, (req, res) => {
  try {
    const produits = readData('produits.json');
    const taxonomies = readData('taxonomies.json');
    const faqs = readData('faqs.json');
    const conversations = readData('conversations.json');

    // Products by category count
    const categoryCount = {};
    produits.forEach((p) => {
      const cat = p.classe || 'Non classé';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    // Stock status breakdown
    const stockStatus = { enStock: 0, rupture: 0, faible: 0 };
    produits.forEach((p) => {
      const qty = p.indicationDuStock?.quantiteDisponible ?? 0;
      const etat = p.indicationDuStock?.etatStock ?? '';
      if (etat === 'Rupture' || qty === 0) stockStatus.rupture++;
      else if (qty <= 5) stockStatus.faible++;
      else stockStatus.enStock++;
    });

    // Unique sessions
    const sessionIds = new Set(conversations.map((c) => c.sessionId).filter(Boolean));

    res.json({
      totalProduits: produits.length,
      totalCategories: taxonomies.length,
      totalFaqs: faqs.reduce((acc, f) => acc + (f.questions?.length || 0), 0),
      totalSessions: sessionIds.size,
      produitsActifs: produits.filter((p) => p.etatObjet === 'code-1').length,
      produitsEnStock: stockStatus.enStock,
      produitsRupture: stockStatus.rupture,
      produitsFaibleStock: stockStatus.faible,
      categoryBreakdown: categoryCount,
      stockBreakdown: stockStatus
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

module.exports = router;
