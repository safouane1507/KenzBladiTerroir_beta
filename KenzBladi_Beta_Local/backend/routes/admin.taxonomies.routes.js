const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const adminAuth = require('../middlewares/adminAuth.middleware');
const { readData, writeData } = require('../helpers/dataAccess');

// GET /api/admin/taxonomies
router.get('/', adminAuth, (req, res) => {
  try {
    const taxonomies = readData('taxonomies.json');
    res.json(taxonomies);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// GET /api/admin/taxonomies/:reference
router.get('/:reference', adminAuth, (req, res) => {
  try {
    const taxonomies = readData('taxonomies.json');
    const tax = taxonomies.find((t) => t.reference === req.params.reference);
    if (!tax) return res.status(404).json({ message: 'Taxonomie non trouvée.' });
    res.json(tax);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// POST /api/admin/taxonomies
router.post('/', adminAuth, (req, res) => {
  try {
    const taxonomies = readData('taxonomies.json');

    if (!req.body.reference) {
      return res.status(400).json({ message: 'Le champ reference est requis.' });
    }
    if (taxonomies.find((t) => t.reference === req.body.reference)) {
      return res.status(409).json({ message: 'Référence de taxonomie déjà existante.' });
    }

    const newTax = {
      _id: { $oid: uuidv4() },
      etatObjet: req.body.etatObjet || 'code-1',
      reference: req.body.reference,
      translations: req.body.translations || [],
      icone: req.body.icone || 'pi pi-tag',
      couleur: req.body.couleur || '#333333',
      parent: req.body.parent || null,
      createdAt: new Date().toISOString()
    };

    taxonomies.push(newTax);
    writeData('taxonomies.json', taxonomies);
    res.status(201).json(newTax);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// PATCH /api/admin/taxonomies/:reference
router.patch('/:reference', adminAuth, (req, res) => {
  try {
    const taxonomies = readData('taxonomies.json');
    const idx = taxonomies.findIndex((t) => t.reference === req.params.reference);
    if (idx === -1) return res.status(404).json({ message: 'Taxonomie non trouvée.' });

    taxonomies[idx] = {
      ...taxonomies[idx],
      ...req.body,
      reference: taxonomies[idx].reference,
      _id: taxonomies[idx]._id,
      updatedAt: new Date().toISOString()
    };

    writeData('taxonomies.json', taxonomies);
    res.json(taxonomies[idx]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// DELETE /api/admin/taxonomies/:reference  (soft-delete)
router.delete('/:reference', adminAuth, (req, res) => {
  try {
    const taxonomies = readData('taxonomies.json');
    const idx = taxonomies.findIndex((t) => t.reference === req.params.reference);
    if (idx === -1) return res.status(404).json({ message: 'Taxonomie non trouvée.' });

    taxonomies[idx].etatObjet = 'code-2';
    taxonomies[idx].updatedAt = new Date().toISOString();
    writeData('taxonomies.json', taxonomies);

    res.json({ message: 'Taxonomie désactivée.', reference: req.params.reference });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

module.exports = router;
