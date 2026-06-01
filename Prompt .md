╔══════════════════════════════════════════════════════════════════════╗
║     ULTIMATE MASTER PROMPT — KENZ BLADI BETA (CLIENT + ADMIN)        ║
║               For Claude — Full Full-Stack Build Prompt              ║
╚══════════════════════════════════════════════════════════════════════╝

# ROLE & MISSION

You are an Expert Full-Stack Developer and UI/UX Engineer. Your mission is to build "Kenz Bladi Beta" — a beautiful, fully functional LOCAL PRESENTATION VERSION of the Kenz Bladi Moroccan marketplace, running entirely on one Windows machine with no external dependencies (no MongoDB, no RabbitMQ, no Docker).

This project contains THREE main pieces:
1. A Monolithic Node.js/Express Backend (Port 4000) using JSON files as a database.
2. A Client Angular 17 Application (Port 4200).
3. An Admin Angular 17 Application (Port 4201).

---

# EXECUTION PROTOCOL (CRITICAL FOR TOKEN MANAGEMENT)

⚠️ **STOP AND READ THIS CAREFULLY** ⚠️
This project is massive. Do NOT attempt to output all the code in a single response, because you will hit the token generation limit and the code will be truncated. 

You MUST follow this strict step-by-step protocol:
1. First, **simply acknowledge this prompt**, briefly outline the 6 phases below, and ask me to type "Start Phase 1". **Do not write any code in your first response.**
2. Write the complete code for ONE phase at a time.
3. At the very end of your response for each phase, STOP and explicitly ask me to type "Continue to Phase X" before you generate the next phase.
4. If you hit the generation limit mid-code, I will type "Continue exactly from where you got cut off". Do NOT apologize, just resume the exact line of code.

**PHASE BREAKDOWN:**
- **Phase 1:** Backend Setup (`package.json`, `app.js` with CORS, `seed.js`, and JSON data access helpers).
- **Phase 2:** Backend Admin Routes (Auth, Products, Taxonomies, FAQs, Dashboard Stats).
- **Phase 3:** Backend Chatbot Pipeline (Multi-Agent RAG: `intentRouter.js`, `ragFetcher.js`, `ollamaClient.js`, `chat.controller.js`).
- **Phase 4:** Client Frontend Setup (Angular SCSS, ThemeService, Home, Catalogue, Product Detail, Chatbot Widget).
- **Phase 5:** Admin Frontend Setup (Angular SCSS, AuthGuard, Layout HTML/SCSS, Login, Dashboard, Products CRUD Table).
- **Phase 6:** The Windows `.bat` Startup Scripts.

---

# WHAT I'M GIVING YOU (Context Files)

I have attached context files. Read them to understand the design tokens and data:
- `_variables.scss`, `_components.scss`, `_typography.scss`, `_bootstrap-overrides.scss`, `_primeng-overrides.scss`.
- JSON Mock Data: `produits.json`, `taxonomies.json`, `faqs.json`.

---

# ARCHITECTURE & DIRECTORY STRUCTURE

Build a SINGLE MONOLITHIC application. Use this exact directory layout:

```text
KenzBladi_Beta_Local/
├── backend/               ← Node.js + Express monolith
│   ├── app.js
│   ├── package.json
│   ├── seed.js            ← Creates admin_users.json with bcrypt
│   ├── middlewares/
│   │   └── adminAuth.middleware.js
│   ├── data/              ← JSON files (produits.json, taxonomies.json, faqs.json, conversations.json, admin_users.json)
│   ├── routes/
│   │   ├── admin.auth.routes.js
│   │   ├── admin.produits.routes.js
│   │   ├── admin.taxonomies.routes.js
│   │   ├── admin.faqs.routes.js
│   │   ├── admin.dashboard.routes.js
│   │   ├── admin.chat.routes.js
│   │   └── chat.routes.js ← Public chatbot API
│   ├── controllers/
│   │   └── chat.controller.js
│   └── helpers/
│       ├── intentRouter.js
│       ├── ragFetcher.js
│       ├── ollamaClient.js
│       └── dataAccess.js  ← Helper to read/write JSON files
├── frontend/              ← Client Angular App (Port 4200)
│   └── src/
│       ├── styles.scss
│       └── app/
│           ├── pages/ (home, catalogue, product-detail, about, faq)
│           ├── components/ (navbar, footer, product-card, chatbot-widget, theme-toggle)
│           └── services/ (theme.service.ts, chatbot.service.ts, etc.)
└── admin_frontend/        ← Admin Angular App (Port 4201)
    └── src/
        ├── styles.scss
        └── app/
            ├── guards/admin-auth.guard.ts
            ├── pages/ (login, dashboard, produits-list, produit-form, taxonomies, faqs, chat-sessions)
            ├── components/ (sidebar, topbar, admin-layout)
            └── services/ (admin-api.service.ts, admin-auth.service.ts)
```

---

# PHASE 1 & 2: BACKEND CORE & ADMIN API (Port 4000)

### Tech Stack & Dependencies
Node.js, Express, `axios`, `cors`, `dotenv`, `helmet`, `morgan`, `uuid`, `bcryptjs`, `jsonwebtoken`.

### CORS & Middlewares (`app.js`)
Must explicitly allow origins `http://localhost:4200` AND `http://localhost:4201`.
Allowed headers: `['Content-Type', 'Authorization', 'jwt', 'admin-token', 'lang']`.

### Data Access (`helpers/dataAccess.js`)
```javascript
const fs = require('fs');
const path = require('path');
exports.readData = (filename) => JSON.parse(fs.readFileSync(path.join(__dirname, '../data', filename), 'utf8'));
exports.writeData = (filename, data) => fs.writeFileSync(path.join(__dirname, '../data', filename), JSON.stringify(data, null, 2), 'utf8');
```

### Database Seeding (`seed.js`)
Create a script that uses `bcryptjs` to hash the password `'admin123'`. It must create `backend/data/admin_users.json` containing one user object: `login: 'admin'`, `role: 'superadmin'`, `etatObjet: 'code-1'`. Also ensure `conversations.json` is initialized as `[]`.

### Admin Auth Middleware
Check for `req.headers['admin-token']`. Verify with `JWT_SECRET = 'kenzbladi-admin-secret-2026'`. Return 401 if invalid.

### Admin API Endpoints
- **POST `/api/admin/auth/login`**: Verify against `admin_users.json`. Return `{ token, user }`.
- **GET `/api/admin/dashboard/stats`**: Return counts for `totalProduits`, `totalCategories`, `totalFaqs`, `totalSessions`.
- **GET, POST, PATCH, DELETE `/api/admin/produits`**: Standard CRUD writing to `produits.json`.
- **GET, POST, PATCH, DELETE `/api/admin/taxonomies`**
- **GET, POST, PATCH, DELETE `/api/admin/faqs`**
- **GET, DELETE `/api/admin/chat-sessions`**

---

# PHASE 3: MULTI-AGENT RAG CHATBOT (`/api/chat`)

### 1. Intent Router (`helpers/intentRouter.js`)
Classify user messages into: `NAVIGATION | GENERAL | SPECIALIST | UNKNOWN`.
- Extract product references using regex: `/(?:ref|produit|article)\s*[:\s]?\s*([A-Z0-9\-]+)/i`.

### 2. RAG Fetcher (`helpers/ragFetcher.js`)
Read from local JSON files:
- **NAVIGATION:** Read `taxonomies.json`.
- **GENERAL:** Read `faqs.json`.
- **SPECIALIST:** Read `produits.json`, match by `refProduit`.

### 3. Ollama Client (`helpers/ollamaClient.js`)
URL: `http://localhost:11434/api/chat`, Model: `llama3.1`.
**System Persona:**
`Tu es Kenza, l'assistante officielle de Kenz Bladi — la marketplace marocaine des produits du terroir authentique. Tu es chaleureuse, passionnée par la culture marocaine. Tu parles en Français, Darija ou Anglais selon la langue de l'utilisateur.`

### 4. Controller Logic
1. Load session from `conversations.json` (keep last 6 turns).
2. Classify Intent. Override to `SPECIALIST` if `productRef` passed in body.
3. Build RAG context.
4. Call Ollama.
5. Save conversation turn to `conversations.json`.
6. Return `{ sessionId, reply, agent, language }`.

---

# PHASE 4: CLIENT FRONTEND (Port 4200)

### SCSS Configuration (CRITICAL)
In `styles.scss`, you MUST `@use` the provided token files in this exact order:
```scss
@use "./assets/styles/variables";
@use "./assets/styles/typography";
@use "./assets/styles/bootstrap-overrides";
@use "./assets/styles/components";
```
*Do NOT override these variables with hardcoded hex colors in your components. Use `var(--primary-color)`, `var(--surface-card)`, etc.*

### Dark Mode Service
```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDark = false;
  toggleTheme() {
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('app-dark', this.isDark);
    const link = document.getElementById('theme-css') as HTMLLinkElement;
    if(link) link.href = this.isDark ? 'assets/themes/lara-dark-blue/theme.css' : 'assets/themes/lara-light-blue/theme.css';
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }
}
```

### Key Client Pages
- **Home:** Hero banner with gradient overlay over `bg1.jpg`. Taxonomies grid. `p-carousel` for products.
- **Catalogue:** Left sidebar filters (PrimeNG `p-slider`, checkboxes). Right responsive grid of `.app-card` products. Display price as `X MAD TTC` (Calculated HT * 1.2).
- **Product Detail:** Image, Name, Price TTC, Stock badge. Add an **"Ask Kenza" button** passing the `productRef` to the chatbot.
- **Chatbot Widget:** A floating bottom-right panel. Shows conversation history, avatar bubbles (🧿 Kenza), and Agent badge (`[SPECIALIST]`).

---

# PHASE 5: ADMIN FRONTEND (Port 4201)

### SCSS Configuration
Import the same design tokens, plus `_primeng-overrides.scss`.

### Admin Layout & Sidebar
Build a two-column layout. Use this structure:
```html
<div class="admin-layout">
  <nav class="admin-sidebar">
    <div class="sidebar-logo">Kenz Bladi Admin</div>
    <ul class="sidebar-nav">
      <li><a routerLink="/dashboard"><i class="pi pi-chart-bar"></i> Dashboard</a></li>
      <li><a routerLink="/produits"><i class="pi pi-box"></i> Produits</a></li>
      <li><a routerLink="/chat-sessions"><i class="pi pi-comments"></i> Sessions Chat</a></li>
    </ul>
    <button (click)="logout()">Déconnexion</button>
  </nav>
  <main class="admin-content">
    <header class="admin-topbar">...</header>
    <div class="admin-page-content"><router-outlet></router-outlet></div>
  </main>
</div>
```

### Key Admin Pages
- **Login (`/login`):** JWT Auth storing `admin-token` in `sessionStorage`.
- **Dashboard (`/dashboard`):** 4 KPI cards. 2 `Chart.js` charts (Products by category, Stock status).
- **Produits (`/produits`):** PrimeNG `p-table` listing products with search, sort, pagination.
- **Produit Form (`/produits/nouveau`):** 6-section form (Identification, Pricing, Stock, Publication, etc.).

---

# PHASE 6: STARTUP SCRIPTS

Create a root `START_ALL.bat` that:
1. Checks Ollama (`curl -s http://localhost:11434/api/tags`).
2. Seeds backend (`cd backend && node seed.js`).
3. Starts Backend: `start "Backend" cmd /k "cd backend && node app.js"`
4. Starts Client: `start "Client" cmd /k "cd frontend && npx ng serve --port 4200 --open"`
5. Starts Admin: `start "Admin" cmd /k "cd admin_frontend && npx ng serve --port 4201 --open"`

---
**Do you understand the Execution Protocol? If yes, acknowledge it briefly and ask me to type "Start Phase 1".**
╔══════════════════════════════════════════════════════════════════════╗
║                    END OF ULTIMATE MASTER PROMPT                     ║
╚══════════════════════════════════════════════════════════════════════╝