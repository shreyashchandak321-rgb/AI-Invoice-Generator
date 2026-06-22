# Tech Stack — Invoice Generator

Senior-level breakdown of every technology, language, and concept used in this project.

---

## Project Overview

Full-stack AI-powered invoice generator with:
- **Frontend:** React SPA on Vercel
- **Backend:** Express REST API on Render
- **Database:** MongoDB Atlas (cloud)
- **Auth:** Clerk (JWT-based)
- **AI:** Google Gemini (natural language → invoice JSON)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   VERCEL                        │
│  ┌───────────────────────────────────────────┐  │
│  │           React + Vite + Tailwind         │  │
│  │  Pages: Dashboard, Invoices, Create,      │  │
│  │         BusinessProfile, InvoicePreview   │  │
│  │  Components: AppShell, AiInvoiceModal,    │  │
│  │              ConfirmModal, StatusBadge    │  │
│  └──────────────────┬────────────────────────┘  │
└─────────────────────┼───────────────────────────┘
                      │ REST API (HTTPS)
                      ▼
┌─────────────────────────────────────────────────┐
│                   RENDER                        │
│  ┌───────────────────────────────────────────┐  │
│  │           Express.js (Node 18+)           │  │
│  │  Routes: /api/invoices, /api/business,    │  │
│  │          /api/ai                          │  │
│  │  Controllers: invoiceController,          │  │
│  │              businessProfileController    │  │
│  │  Middleware: cors, multer, clerkAuth       │  │
│  └──────┬──────────────┬─────────────────────┘  │
└─────────┼──────────────┼────────────────────────┘
          │              │
          ▼              ▼
┌──────────────┐  ┌──────────────┐
│  MONGODB     │  │ GOOGLE       │
│  ATLAS       │  │ GEMINI API   │
│  (Mongoose)  │  │ (AI invoice) │
└──────────────┘  └──────────────┘
```

---

## Complete Tech Stack

### Runtime & Language

| Technology | Version | What It Does |
|------------|---------|--------------|
| **JavaScript (ES6+)** | — | Primary programming language for entire project |
| **Node.js** | ≥ 18 | Server-side JavaScript runtime |
| **JSX** | — | HTML-like syntax in React components |

> **Languages used:** JavaScript (100%), JSX (React), HTML (index.html), CSS (Tailwind + custom)

---

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Express.js** | ^4.21.0 | HTTP server, routing, middleware |
| **Mongoose** | ^8.8.0 | MongoDB schema modeling, validation, queries |
| **cors** | ^2.8.5 | Cross-origin request handling |
| **dotenv** | ^16.4.5 | Load `.env` files into `process.env` |
| **multer** | ^1.4.5 | File upload handling (multipart/form-data) |
| **@clerk/backend** | ^1.21.0 | Server-side JWT verification |
| **@google/genai** | ^1.0.0 | Google Gemini AI SDK |

---

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^19.2.0 | Component-based UI library |
| **React DOM** | ^19.2.0 | Browser DOM renderer |
| **react-router-dom** | ^7.18.0 | Client-side routing (SPA navigation) |
| **@clerk/clerk-react** | ^5.61.8 | Auth UI (SignIn, SignUp, UserButton) |
| **jsPDF** | ^4.2.1 | Client-side PDF generation |
| **react-hot-toast** | ^2.6.0 | Toast notifications |
| **react-icons** | ^5.6.0 | Icon library (Feather, Font Awesome) |

---

### Build & Dev Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vite** | ^7.2.4 | Dev server + production bundler |
| **@vitejs/plugin-react** | ^5.1.1 | React Fast Refresh, JSX transform |
| **Tailwind CSS** | ^4.3.1 | Utility-first CSS framework |
| **@tailwindcss/vite** | ^4.3.1 | Tailwind integration for Vite |
| **ESLint** | ^9.39.1 | Code linting |
| **npm** | — | Package management |

---

### Database

| Technology | Purpose |
|------------|---------|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Mongoose ODM** | Schema definitions, validation, CRUD |

**Models:**
- `Invoice` — 20+ fields (items, totals, dates, client info, files, status)
- `BusinessProfile` — company details, logo, stamp, signature

---

### Authentication

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | `@clerk/clerk-react` | Login/signup UI, session management |
| Backend | `@clerk/backend` | JWT token verification |
| Custom | `useSafeAuth` hook | Graceful auth fallback for dev mode |

---

### AI Integration

| Technology | Purpose |
|------------|---------|
| **Google Gemini** (`gemini-2.5-flash`) | Natural language → structured invoice JSON |

Flow: User prompt → Gemini API → parsed JSON → pre-filled invoice form

---

### Deployment

| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting (static site, edge network) |
| **Render** | Backend hosting (Node.js web service) |
| **MongoDB Atlas** | Database hosting (M0 free tier) |

---

## Programming Languages Used

| Language | Where | % of Codebase |
|----------|-------|---------------|
| **JavaScript (ES6+)** | Frontend + Backend | ~95% |
| **JSX** | React components | ~3% |
| **HTML** | `index.html` | <1% |
| **CSS** | Tailwind utilities + custom CSS | <1% |

---

## Key Concepts & Patterns Used

### Backend Patterns
- **RESTful API design** — standard HTTP methods (GET, POST, PUT, DELETE)
- **MVC architecture** — Models, Controllers, Routes separation
- **Middleware chain** — cors → auth → multer → controller
- **Environment-based config** — `.env` files, `process.env`
- **Error handling** — global error handler, try/catch in async routes
- **Static file serving** — `express.static()` for uploads

### Frontend Patterns
- **Component-based architecture** — reusable UI components
- **Custom hooks** — `useSafeAuth`, `useCallback`, `useMemo`
- **Protected routes** — `SignedIn`/`SignedOut` wrappers
- **Layout routes** — `<Outlet />` via AppShell
- **Controlled forms** — `useState` for form state
- **Optimistic updates** — local state before server confirmation
- **Client-side routing** — SPA navigation without page reloads

### Database Patterns
- **Schema-first design** — Mongoose schemas with validation
- **Reference by ID** — `owner: userId` (Clerk ID string)
- **Computed fields** — subtotal/tax/total calculated before save
- **Upsert pattern** — business profile created or updated

---

## What You Need to Learn

### Priority 1 — Core (Must Know)

| Topic | Why | Resources |
|-------|-----|-----------|
| **JavaScript Fundamentals** | Everything is built on JS | [javascript.info](https://javascript.info) |
| **React Basics** | UI framework — components, props, state, hooks | [react.dev/learn](https://react.dev/learn) |
| **Node.js + Express** | Backend server, routing, middleware | [expressjs.com](https://expressjs.com/en/guide) |
| **REST APIs** | How frontend talks to backend | [roadmap.sh/rest-api](https://roadmap.sh/rest-api) |
| **MongoDB + Mongoose** | Database modeling and queries | [mongoosejs.com](https://mongoosejs.com/docs/) |

### Priority 2 — Essential

| Topic | Why | Resources |
|-------|-----|-----------|
| **React Router** | SPA navigation, route params, layout routes | [reactrouter.com](https://reactrouter.com) |
| **Tailwind CSS** | All styling in this project | [tailwindcss.com](https://tailwindcss.com) |
| **Git + GitHub** | Version control, pushing code | [git-scm.com](https://git-scm.com/book) |
| **npm / package.json** | Dependency management | Built into Node.js |
| **Environment Variables** | Secrets, config per environment | Learn `.env` patterns |

### Priority 3 — Project-Specific

| Topic | Why | Resources |
|-------|-----|-----------|
| **Clerk Authentication** | Login/signup system | [clerk.com/docs](https://clerk.com/docs) |
| **Google Gemini API** | AI invoice generation | [ai.google.dev](https://ai.google.dev) |
| **jsPDF** | PDF generation | [github.com/parallax/jsPDF](https://github.com/parallax/jsPDF) |
| **Multer** | File upload handling | [github.com/expressjs/multer](https://github.com/expressjs/multer) |
| **Vite** | Build tool and dev server | [vitejs.dev](https://vitejs.dev) |

### Priority 4 — Deployment & DevOps

| Topic | Why | Resources |
|-------|-----|-----------|
| **Render Deployment** | Backend hosting | [render.com/docs](https://render.com/docs) |
| **Vercel Deployment** | Frontend hosting | [vercel.com/docs](https://vercel.com/docs) |
| **MongoDB Atlas** | Cloud database | [mongodb.com/atlas](https://www.mongodb.com/atlas) |
| **CORS** | Cross-origin security | Understand why it exists |
| **SPA Routing** | Client-side vs server-side routes | Learn why `vercel.json` rewrite exists |

### Priority 5 — Advanced (Career Growth)

| Topic | Why | Resources |
|-------|-----|-----------|
| **TypeScript** | Type safety (project uses TS type defs but no TS) | [typescriptlang.org](https://www.typescriptlang.org) |
| **Testing** | Unit/E2E tests (none currently) | Jest, Playwright |
| **Docker** | Containerization | [docker.com](https://www.docker.com) |
| **CI/CD** | Automated testing + deployment | GitHub Actions |
| **GraphQL** | Alternative to REST | [graphql.org](https://graphql.org) |
| **Redis** | Caching, rate limiting | [redis.io](https://redis.io) |

---

## Skills You've Demonstrated By Building This

- [x] Full-stack development (frontend + backend + database)
- [x] REST API design and implementation
- [x] Database schema design (MongoDB/Mongoose)
- [x] Authentication integration (Clerk)
- [x] AI API integration (Google Gemini)
- [x] File upload handling (Multer)
- [x] Client-side PDF generation (jsPDF)
- [x] Responsive UI with Tailwind CSS
- [x] SPA routing with React Router
- [x] Component-based architecture
- [x] Environment configuration for dev/production
- [x] Cloud deployment (Vercel + Render + MongoDB Atlas)
- [x] Cross-origin resource sharing (CORS)
- [x] Git version control

---

## File Structure Reference

```
Invoice/
├── backend/
│   ├── server.js              ← Express entry point
│   ├── package.json           ← Dependencies + scripts
│   ├── .env                   ← Secrets (not committed)
│   ├── .env.example           ← Template for env vars
│   ├── models/
│   │   ├── invoiceModel.js    ← Invoice schema
│   │   └── businessProfileModel.js
│   ├── controllers/
│   │   ├── invoiceController.js
│   │   └── businessProfileController.js
│   ├── routes/
│   │   ├── invoiceRouter.js
│   │   ├── businessProfileRouter.js
│   │   └── aiInvoiceRouter.js
│   └── uploads/               ← User-uploaded files
├── frontend/
│   ├── src/
│   │   ├── App.jsx            ← Route definitions
│   │   ├── config.js          ← API_BASE constant
│   │   ├── pages/             ← Page components
│   │   ├── components/        ← Reusable components
│   │   ├── hooks/             ← Custom React hooks
│   │   └── assets/            ← Styles, icons
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json            ← SPA rewrite rules
│   └── index.html
├── .gitignore
├── render.yaml                ← Render deployment config
├── DEPLOYMENT.md              ← Deployment guide
└── TECH_STACK.md              ← This file
```
