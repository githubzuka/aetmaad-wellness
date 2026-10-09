# ASHVA Wellness — Equine Nutrition & Volunteer Portal

React + Vite frontend with an Express/MongoDB backend.

## Deployment

| Piece | Host | URL |
|---|---|---|
| Frontend | Vercel | https://aetmaad-wellness.vercel.app |
| Backend | Render | https://aetmaad-backend.onrender.com |

**Root Directory must be the repository root (`./`).** There is only one app,
and it lives in `/src`. A stale duplicate used to sit in `frontend/`, which broke
Vercel builds for a long time — see `_deprecated_frontend/README.md`.

### Backend (Render)

Config is in `render.yaml` (`rootDir: backend`).

Required environment variables:

```
NODE_ENV     = production
MONGO_URI    = <MongoDB connection string>
JWT_SECRET   = <secret>
JWT_EXPIRE   = 7d
ADMIN_EMAIL  = <admin email>
```

Optional:

```
CORS_ORIGINS = https://aetmaad-wellness.vercel.app
```

(Requests from any `*.vercel.app` or `*.onrender.com` origin are allowed
automatically.)

### Frontend (Vercel)

Required environment variable:

```
VITE_API_URL = https://aetmaad-backend.onrender.com
```

Vite bakes environment variables in **at build time**, so you must redeploy
after changing this. If it is missing, the production build falls back to the
Render URL above rather than pointing at `localhost`.

## Local development

1. Start the backend:

   ```bash
   cd backend
   npm install
   npm start          # http://localhost:5000
   ```

2. Start the frontend from the repository root:

   ```bash
   npm install
   npm run dev        # http://localhost:5173
   ```

Leave `VITE_API_URL` unset locally — `vite.config.js` proxies `/api` to port
5000.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
