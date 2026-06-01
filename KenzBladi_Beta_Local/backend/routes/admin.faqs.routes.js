const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const adminAuth = require('../middlewares/adminAuth.middleware');
const { readData, writeData } = require('../helpers/dataAccess');

// GET /api/admin/faqs
router.get('/', adminAuth, (req, res) => {
  try {
    const faqs = readData('faqs.json');
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// GET /api/admin/faqs/:reference
router.get('/:reference', adminAuth, (req, res) => {
  try {
    const faqs = readData('faqs.json');
    const faq = faqs.find((f) => f.reference === req.params.reference);
    if (!faq) return res.status(404).json({ message: 'FAQ non trouvée.' });
    res.json(faq);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// POST /api/admin/faqs
router.post('/', adminAuth, (req, res) => {
  try {
    const faqs = readData('faqs.json');

    if (!req.body.reference) {
      return res.status(400).json({ message: 'Le champ reference est requis.' });
    }
    if (faqs.find((f) => f.reference === req.body.reference)) {
      return res.status(409).json({ message: 'Référence FAQ déjà existante.' });
    }

    const newFaq = {
      _id: { $oid: uuidv4() },
      etatObjet: req.body.etatObjet || 'code-1',
      etatDePublication: req.body.etatDePublication || 'code_540',
      etatFaq: req.body.etatFaq || 'code_4268',
      reference: req.body.reference,
      translations: req.body.translations || [],
      emailResponsable: req.body.emailResponsable || '',
      questions: req.body.questions || [],
      createdAt: new Date().toISOString()
    };

    faqs.push(newFaq);
    writeData('faqs.json', faqs);
    res.status(201).json(newFaq);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// PATCH /api/admin/faqs/:reference
router.patch('/:reference', adminAuth, (req, res) => {
  try {
    const faqs = readData('faqs.json');
    const idx = faqs.findIndex((f) => f.reference === req.params.reference);
    if (idx === -1) return res.status(404).json({ message: 'FAQ non trouvée.' });

    faqs[idx] = {
      ...faqs[idx],
      ...req.body,
      reference: faqs[idx].reference,
      _id: faqs[idx]._id,
      updatedAt: new Date().toISOString()
    };

    writeData('faqs.json', faqs);
    res.json(faqs[idx]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// DELETE /api/admin/faqs/:reference  (soft-delete)
router.delete('/:reference', adminAuth, (req, res) => {
  try {
    const faqs = readData('faqs.json');
    const idx = faqs.findIndex((f) => f.reference === req.params.reference);
    if (idx === -1) return res.status(404).json({ message: 'FAQ non trouvée.' });

    faqs[idx].etatObjet = 'code-2';
    faqs[idx].updatedAt = new Date().toISOString();
    writeData('faqs.json', faqs);

    res.json({ message: 'FAQ désactivée.', reference: req.params.reference });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

module.exports = router;
