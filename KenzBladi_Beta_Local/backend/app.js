require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Ensure data directory exists ───────────────────────────────────────────
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// ─── Security & Logging ─────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ['http://localhost:4200', 'http://localhost:4201'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'jwt', 'admin-token', 'lang'],
    credentials: true
  })
);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static assets (product images) ─────────────────────────────────────────
app.use('/images', express.static(path.join(__dirname, '../context_files/images')));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'KenzBladi Beta Backend', port: PORT });
});

// ─── Public Routes ───────────────────────────────────────────────────────────
app.use('/api/chat', require('./routes/chat.routes'));

// ─── Admin Routes ─────────────────────────────────────────────────────────────
app.use('/api/admin/auth',         require('./routes/admin.auth.routes'));
app.use('/api/admin/dashboard',    require('./routes/admin.dashboard.routes'));
app.use('/api/admin/produits',     require('./routes/admin.produits.routes'));
app.use('/api/admin/taxonomies',   require('./routes/admin.taxonomies.routes'));
app.use('/api/admin/faqs',         require('./routes/admin.faqs.routes'));
app.use('/api/admin/chat-sessions',require('./routes/admin.chat.routes'));

// ─── Public catalogue routes (read-only) ─────────────────────────────────────
app.get('/api/produits', (req, res) => {
  try {
    const { readData } = require('./helpers/dataAccess');
    const produits = readData('produits.json').filter(
      (p) => p.etatObjet === 'code-1' && p.etatDePublication === 'code_541'
    );
    res.json(produits);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

app.get('/api/produits/:ref', (req, res) => {
  try {
    const { readData } = require('./helpers/dataAccess');
    const produit = readData('produits.json').find(
      (p) => p.refProduit === req.params.ref
    );
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé.' });
    res.json(produit);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

app.get('/api/taxonomies', (req, res) => {
  try {
    const { readData } = require('./helpers/dataAccess');
    const taxonomies = readData('taxonomies.json').filter(
      (t) => t.etatObjet === 'code-1'
    );
    res.json(taxonomies);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

app.get('/api/faqs', (req, res) => {
  try {
    const { readData } = require('./helpers/dataAccess');
    const faqs = readData('faqs.json').filter(
      (f) => f.etatObjet === 'code-1' && f.etatDePublication === 'code_541'
    );
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ─── 404 Catch-all ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ message: 'Erreur interne du serveur.', error: err.message });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 Kenz Bladi Beta Backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
