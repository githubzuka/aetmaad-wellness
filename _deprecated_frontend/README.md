# ⚠️ DEPRECATED — DO NOT USE

This folder holds a preserved copy of the old `frontend/` directory that used to
live at the repository root.

## Why it was removed

The repository contained **two copies** of the React application:

| Location | Status |
|---|---|
| `src/` at the repository root | ✅ **The real, current app** — all features live here |
| `frontend/` (removed) | ❌ A stale, incomplete duplicate |

The duplicate was **incomplete and could never build**. It referenced
`../pages/AdminDashboard` and other pages that did not exist inside it, so any
attempt to build it failed with:

```
Could not resolve "../pages/AdminDashboard" from "src/routes/AppRoutes.jsx"
```

Despite that, the Vercel project's **Root Directory** was set to `frontend`, so
every deployment tried to build the broken copy and failed. This is why no
frontend update ever appeared on the live site, no matter how many commits were
pushed.

## What was actually in the duplicate

Only 7 files existed there that were not already in the root `src/`, and none of
them were features:

- `App.test.js`, `setupTests.js` — Create React App scaffolding. The tests
  referenced an `App.jsx` that did not exist, so they could not run.
- `logo.svg` — the default Vite template logo.
- `reportWebVitals.js` — unused CRA boilerplate.
- `components/AdminCustomers.jsx` / `.css` — superseded. The root
  `AdminDashboard.jsx` implements customers as a fully working dashboard tab.
- `pages/NotFound.jsx` — a small 404 page. The root app handles unknown routes
  with `<Navigate to="/" replace />`.

## The canonical app

Everything lives in **`/src`** at the repository root. Deploy from there.

### Required frontend environment variable

```
VITE_API_URL = https://aetmaad-backend.onrender.com
```

Set this in the frontend host's environment variables (Vercel → Settings →
Environment Variables), then **redeploy** — Vite bakes environment variables in
at build time, so changing the value without rebuilding has no effect.

To recover anything from this backup, it is also available in git history:

```bash
git log --all -- frontend/
```
