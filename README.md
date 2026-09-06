# React + Vite

## Deploying ASHVA AI

The chatbot needs the Express backend to be deployed separately from the Vite frontend. A phone cannot reach `localhost:5000` on your computer.

1. Deploy the `backend` folder to a Node hosting service and set `GROQ_API_KEY` and `PORT` in that service's environment variables.
2. Copy the root `.env.example` to `.env` before building the frontend.
3. Set `VITE_API_URL` to the public backend URL, for example `https://ashva-api.example.com`.
4. Run `npm run build` and deploy the generated `dist` folder.

For local development, leave `VITE_API_URL` empty, start the backend with `cd backend; npm start`, then run `npm run dev` from the repository root. Vite proxies `/api` to port 5000 locally.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
