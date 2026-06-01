const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const adminAuth = require('../middlewares/adminAuth.middleware');
const { readData, writeData } = require('../helpers/dataAccess');

// GET /api/admin/produits
router.get('/', adminAuth, (req, res) => {
  try {
    const { search, etatObjet, classe, page = 1, limit = 20 } = req.query;
    let produits = readData('produits.json');

    if (search) {
      const s = search.toLowerCase();
      produits = produits.filter((p) => {
        const name = p.translations?.find((t) => t.language === 'fr')?.designationProduit || '';
        return (
          p.refProduit?.toLowerCase().includes(s) ||
          name.toLowerCase().includes(s)
        );
      });
    }
    if (etatObjet) produits = produits.filter((p) => p.etatObjet === etatObjet);
    if (classe) produits = produits.filter((p) => p.classe === classe);

    const total = produits.length;
    const start = (Number(page) - 1) * Number(limit);
    const paginated = produits.slice(start, start + Number(limit));

    res.json({ total, page: Number(page), limit: Number(limit), data: paginated });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// GET /api/admin/produits/:ref
router.get('/:ref', adminAuth, (req, res) => {
  try {
    const produits = readData('produits.json');
    const produit = produits.find((p) => p.refProduit === req.params.ref);
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé.' });
    res.json(produit);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// POST /api/admin/produits
router.post('/', adminAuth, (req, res) => {
  try {
    const produits = readData('produits.json');
    const newProduit = {
      _id: { $oid: uuidv4() },
      refProduit: req.body.refProduit || `PROD-${uuidv4().substring(0, 8).toUpperCase()}`,
      etatDePublication: req.body.etatDePublication || 'code_540',
      etatObjet: req.body.etatObjet || 'code-1',
      typeProduit: req.body.typeProduit || 'physique',
      classe: req.body.classe || '',
      tarifUHTPardefaut: req.body.tarifUHTPardefaut || 0,
      tvaParDefaut: req.body.tvaParDefaut ?? 20,
      monnaie: req.body.monnaie || { code: 'MAD', symbole: 'د.م.' },
      region: req.body.region || [],
      pays: req.body.pays || ['MA'],
      imageProduit: req.body.imageProduit || '',
      caracteristiquePhysique: req.body.caracteristiquePhysique || [],
      indicationDuStock: req.body.indicationDuStock || { etatStock: 'En stock', quantiteDisponible: 0 },
      translations: req.body.translations || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check ref uniqueness
    if (produits.find((p) => p.refProduit === newProduit.refProduit)) {
      return res.status(409).json({ message: 'Référence produit déjà existante.' });
    }

    produits.push(newProduit);
    writeData('produits.json', produits);
    res.status(201).json(newProduit);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// PATCH /api/admin/produits/:ref
router.patch('/:ref', adminAuth, (req, res) => {
  try {
    const produits = readData('produits.json');
    const idx = produits.findIndex((p) => p.refProduit === req.params.ref);
    if (idx === -1) return res.status(404).json({ message: 'Produit non trouvé.' });

    produits[idx] = {
      ...produits[idx],
      ...req.body,
      refProduit: produits[idx].refProduit, // ref is immutable
      _id: produits[idx]._id,
      updatedAt: new Date().toISOString()
    };

    writeData('produits.json', produits);
    res.json(produits[idx]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// DELETE /api/admin/produits/:ref  (soft-delete: sets etatObjet to 'code-2')
router.delete('/:ref', adminAuth, (req, res) => {
  try {
    const produits = readData('produits.json');
    const idx = produits.findIndex((p) => p.refProduit === req.params.ref);
    if (idx === -1) return res.status(404).json({ message: 'Produit non trouvé.' });

    produits[idx].etatObjet = 'code-2';
    produits[idx].updatedAt = new Date().toISOString();
    writeData('produits.json', produits);

    res.json({ message: 'Produit désactivé.', ref: req.params.ref });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

module.exports = router;
