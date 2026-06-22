# Deployment Guide — Invoice Generator

Frontend on **Vercel**, Backend on **Render**, Database on **MongoDB Atlas**.

---

## Prerequisites

- GitHub account
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- MongoDB Atlas cluster (already provisioned)
- Node.js >= 18 installed locally

---

## Project Structure

```
Invoice/
├── backend/          ← Deploys to Render
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── controllers/
│   ├── models/
│   └── routes/
└── frontend/         ← Deploys to Vercel
    ├── src/
    ├── package.json
    ├── vite.config.js
    └── vercel.json
```

---

## Phase 1: Prepare Code for Production

### 1.1 — Create shared API config

Create `frontend/src/config.js`:

```js
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
```

Then update every frontend file that hardcodes `http://localhost:4000` to import from this file:

```js
import { API_BASE } from "../config";
```

**Files to update:**
- `src/pages/Dashboard.jsx`
- `src/pages/Invoices.jsx`
- `src/pages/CreateInvoice.jsx`
- `src/pages/BusinessProfile.jsx`

> `InvoicePreview.jsx` and `AiInvoiceModal.jsx` already use `import.meta.env.VITE_API_URL` — update them to use the shared config too for consistency.

---

### 1.2 — Fix backend CORS

In `backend/server.js`, replace the hardcoded CORS origin:

```js
// BEFORE
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// AFTER
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
```

---

### 1.3 — Add Node.js version pinning

In `backend/package.json`, add an `engines` field:

```json
{
  "name": "invoice-generator-backend",
  "version": "1.0.0",
  "main": "server.js",
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  ...
}
```

---

### 1.4 — Create .gitignore files

**Root `.gitignore`:**

```gitignore
node_modules/
dist/
.env
*.local
.DS_Store
.idea/
.vscode/
```

**`backend/.gitignore`:**

```gitignore
node_modules/
.env
uploads/
```

---

### 1.5 — Create frontend/vercel.json

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures Vercel serves `index.html` for all routes (SPA client-side routing).

---

### 1.6 — Commit and push

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

---

## Phase 2: Deploy Backend on Render

### 2.1 — Create the service

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `invoice-backend`
   - **Region:** Oregon (or closest to your users)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free (or Starter for production)

### 2.2 — Set environment variables

In the **Environment** tab, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` (Render sets this automatically, but can override) |
| `MONGODB_URI` | `mongodb+srv://shreyashchandak321_db_user:0aUiHGDTbmhk2cwu@aiinvoicegenerator.qb92vxt.mongodb.net/invoice-generator?appName=AIInvoiceGenerator` |
| `GEMINI_API_KEY` | `AIzaSyBJiR7jx-LTjz-Dl_1JFm4ZFdDNTX6LD1w` |
| `CORS_ORIGIN` | *(leave blank for now — set after frontend is deployed)* |
| `CLERK_SECRET_KEY` | `sk_test_UtUUNjsSStsGWBScQf32R5pwFDeV0p7BPj5EaAnUyh` |
| `CLERK_PUBLISHABLE_KEY` | `pk_test_aW1tZW5zZS1taW5rLTkwLmNsZXJrLmFjY291bnRzLmRldiQ` |

### 2.3 — Deploy

Click **Create Web Service**. Wait for the first deploy to finish.

Your backend will be live at: `https://invoice-backend.onrender.com`

### 2.4 — Verify

Open in browser: `https://invoice-backend.onrender.com/api/health`

Expected response:
```json
{"success":true,"message":"Server is running"}
```

---

## Phase 3: Deploy Frontend on Vercel

### 3.1 — Import project

1. Go to https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3.2 — Set environment variables

In the **Environment Variables** section, add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://invoice-backend.onrender.com` |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_aW1tZW5zZS1taW5rLTkwLmNsZXJrLmFjY291bnRzLmRldiQ` |

### 3.3 — Deploy

Click **Deploy**. Wait for the build to finish.

Your frontend will be live at: `https://invoice-frontend-xxxxx.vercel.app` (Vercel assigns a random subdomain)

### 3.4 — Set custom domain (optional)

In your Vercel project → **Settings** → **Domains**, add your custom domain if you have one.

---

## Phase 4: Connect Frontend to Backend

### 4.1 — Update CORS on Render

Go back to Render → your `invoice-backend` service → **Environment** tab.

Set `CORS_ORIGIN` to your Vercel URL:

```
https://invoice-frontend-xxxxx.vercel.app
```

Save. Render will auto-redeploy.

### 4.2 — Redeploy frontend (if needed)

If you made no code changes, the frontend should already work with the new backend URL since `VITE_API_URL` was set during deployment.

---

## Phase 5: Verify Everything

### Test checklist:

- [ ] Open `https://invoice-frontend-xxxxx.vercel.app`
- [ ] Dashboard loads without errors
- [ ] Create an invoice → saves successfully
- [ ] View invoice list → shows saved invoices
- [ ] Open invoice preview → renders correctly
- [ ] Download PDF → generates and downloads
- [ ] AI Generate Invoice → opens modal, generates data
- [ ] Business Profile → loads and saves
- [ ] Logout → clears session, returns to home

### Check backend logs:

On Render → your service → **Logs** tab, verify:
- `Connected to MongoDB`
- `Server running on port 4000`
- No CORS errors
- No 500 errors

---

## Environment Variables Reference

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (Render sets automatically) | `4000` |
| `NODE_ENV` | Environment | `production` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `CLERK_SECRET_KEY` | Clerk authentication secret | `sk_test_...` |
| `CLERK_PUBLISHABLE_KEY` | Clerk authentication public key | `pk_test_...` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://your-app.vercel.app` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://invoice-backend.onrender.com` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_test_...` |

---

## Troubleshooting

### CORS errors in browser console

- Ensure `CORS_ORIGIN` on Render matches your Vercel URL exactly (no trailing slash)
- Redeploy the backend after changing env vars

### 404 on page refresh (Vercel)

- Ensure `vercel.json` exists in `frontend/` with the rewrite rule
- Redeploy the frontend

### "Invoice not found" after creating

- Ensure `VITE_API_URL` is set correctly on Vercel
- The frontend must use MongoDB `_id` (not `invoiceNumber`) in URLs — this is already fixed

### Backend not starting on Render

- Check the logs for the exact error
- Ensure `MONGODB_URI` is set and the Atlas cluster allows connections from `0.0.0.0/0`
- Ensure Node.js >= 18

### MongoDB connection refused

- MongoDB Atlas → Network Access → Add IP Address → `0.0.0.0/0` (Allow access from anywhere)

---

## Updating the App

### Backend changes

1. Push to `main` branch
2. Render auto-deploys

### Frontend changes

1. Push to `main` branch
2. Vercel auto-deploys

### Environment variable changes

1. Update in Render/Vercel dashboard
2. Trigger manual redeploy

---

## Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| Render Backend | Free tier | $0/month |
| Vercel Frontend | Hobby plan | $0/month |
| MongoDB Atlas | M0 (free) | $0/month |
| **Total** | | **$0/month** |

> Free tiers have limitations (sleep after inactivity, build minutes, bandwidth). For production, consider paid plans.
