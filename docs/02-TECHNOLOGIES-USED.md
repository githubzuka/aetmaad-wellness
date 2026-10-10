# 02 — Technologies & Techniques Used

This file explains, in **simple words**, every tool and technique used to build this
project. For each one: *what it is*, *why we used it*, and *where it lives*.

---

## 1. The big picture

The project is split into two parts that talk to each other over the internet:

```
   USER'S BROWSER                    INTERNET                    SERVER
┌─────────────────────┐          ┌─────────────┐          ┌──────────────────┐
│  FRONTEND (React)   │  HTTP    │   Requests  │  HTTP    │  BACKEND (Node)  │
│  What you see       │ ───────► │   / JSON    │ ───────► │  Rules + Logic   │
│  Runs in browser    │ ◄─────── │   Data      │ ◄─────── │  Talks to DB     │
└─────────────────────┘          └─────────────┘          └────────┬─────────┘
                                                                   │
                                                          ┌────────▼─────────┐
                                                          │  MONGODB (Cloud) │
                                                          │  Stores all data │
                                                          └──────────────────┘
```

- The **frontend** is like the shop counter the customer sees.
- The **backend** is the stockroom + the rules ("are you allowed? is this valid?").
- **MongoDB** is the warehouse where data is stored permanently.

---

## 2. Frontend technologies

| Tool | What it is (simple) | Why we used it |
|------|--------------------|----------------|
| **React 19** | A way to build websites out of reusable "pieces" called components | Lets us build one Header/Footer and reuse it on every page |
| **Vite** | A very fast build tool | Starts the dev server quickly and bundles the final website |
| **React Router DOM v7** | Handles page navigation | Gives each page a real URL (e.g. `/contact`) without reloading |
| **Axios** | A tool to make web requests | The frontend uses it to call the backend API |
| **Lucide React** | A pack of clean line icons | All the icons (Mail, Phone, Lock, etc.) come from here. Where it lacked an icon (Instagram), we wrote a small inline SVG instead |
| **Bootstrap Icons** | Another icon font pack | Extra icons where needed |
| **QRCode.React** | Draws QR codes | Used in the donation popup for UPI payment |
| **React Markdown** | Renders Markdown text as HTML | Used in the AI chat window |

### Key frontend techniques

- **Component-based design** — the UI is split into small files under `src/components/`.
- **Context API** (`src/context/`) — a shared "global memory" so any page can read
  who is logged in (`AuthContext`) or what is in the cart (`CartContext`) without
  passing data down by hand.
- **Service layer** (`src/services/`) — every API call is written once in a service
  file, so pages never call the backend directly. Easy to change later.
- **Route guards** (`src/components/routing/`) — `ProtectedRoute` blocks logged-out
  users, `RoleRoute` blocks the wrong role (e.g. a customer trying to open the admin
  dashboard).
- **CSS per component** — each component has its own `.css` file next to it, so
  styles are easy to find.
- **Mobile-first responsive design** — every section uses flexbox/grid plus
  `@media` breakpoints (typically 1100px, 900px, 600px, 480px, 380px) so it looks
  right on phone, tablet and desktop.

---

## 3. Backend technologies

| Tool | What it is (simple) | Why we used it |
|------|--------------------|----------------|
| **Node.js** | Runs JavaScript on the server | One language for the whole project |
| **Express 4** | A web server framework | Makes it easy to define API addresses (routes) |
| **MongoDB + Mongoose 8** | A database + a helper to talk to it | Stores users, orders, contacts, donations… |
| **JWT (jsonwebtoken)** | A signed "login pass" | Proves a user is logged in on every request |
| **bcryptjs** | Password scrambler (hashing) | Passwords are never stored in plain text |
| **Helmet** | Sets safety HTTP headers | Blocks common browser attacks |
| **express-rate-limit** | Slows down attackers | Stops brute-force logins and spam floods |
| **express-mongo-sanitize** | Cleans database queries | Stops NoSQL injection |
| **CORS** | Controls which websites may call the API | Only our own frontends are allowed |
| **Compression** | Shrinks responses | Faster loading |
| **Nodemailer** | Sends email from the server | Password resets / notifications |
| **node-cron** | Runs jobs on a schedule | Background housekeeping tasks |
| **openai / groq-sdk** | AI services | Powers the chat helper |

### Key backend techniques

- **MVC-style layout** — `models/` (data shape), `controllers/` (logic),
  `routes/` (URLs). Clean separation.
- **Middleware pipeline** — every request passes through, in order:
  1. HTTPS redirect (in production)
  2. CORS check
  3. Helmet security headers
  4. Body size limit (1 MB)
  5. Malicious-input detector
  6. Rate limiter
  7. Route handler
  8. Error handler
- **Environment variables** (`.env`) — secrets like the database password and JWT
  key are kept out of the code and out of Git.
- **Central error handler** — every error becomes a clean JSON reply instead of a
  crash.

---

## 4. Security techniques used (summary)

> Full details and test results are in **`05-SECURITY-REPORT.md`**.

| Technique | Plain-English meaning |
|-----------|----------------------|
| Password hashing (bcrypt) | Even if the database leaked, passwords can't be read |
| JWT tokens | A tamper-proof pass issued at login |
| Role-based access control | Admins, volunteers and customers see different things |
| Rate limiting | "Slow down" rules for logins and public forms |
| Input sanitising | Strips dangerous `$` and `__proto__` keys |
| Payload size cap | Rejects huge request bodies |
| Security headers (Helmet) | Browser-level protection |
| CORS allow-list | Only our own sites may call the API |
| HTTPS enforcement | Production traffic must be encrypted |
| Security event logging | Suspicious activity is recorded and shown to admins |

---

## 5. What was added or changed in THIS revision

| Change | File(s) |
|--------|---------|
| **More beautiful Login page** | `src/pages/Login.css`, `src/pages/Login.jsx` |
| Gold/emerald premium look, animated glow, card accent bar, button shine | `src/pages/Login.css` |
| **Footer** contact details fixed | `src/components/Footer.jsx` |
| Email → `enquinemix@gmail.com` | `src/components/Footer.jsx` |
| Phone/WhatsApp → `84220 60195` | `src/components/Footer.jsx` |
| Instagram → `ashva_enquinemix` | `src/components/Footer.jsx` |
| Removed Facebook & YouTube | `src/components/Footer.jsx` |
| Only 3 socials left: Instagram, WhatsApp, Email | `src/components/Footer.jsx` |
| **New FAQ section** on the home page | `src/components/HomeFAQ.jsx`, `HomeFAQ.css` |
| FAQ wired into Home + `/#faq` link | `src/pages/Home.jsx`, `src/components/Footer.jsx` |
| **Contact Us** page updated with new details + WhatsApp/Instagram cards | `src/pages/Contact.jsx`, `Contact.css` |
| Login page contact links updated | `src/pages/Login.jsx` |
| Donation FAQ email updated | `src/components/Donate/DonateFAQ.jsx` |
| Mobile responsiveness verified everywhere | all the above `.css` files |

---

## 6. The npm commands you will use

```bash
# ---------- FRONTEND (run in the project root) ----------
npm install          # download all frontend tools
npm run dev          # start the website for development
npm run build        # make the final, optimised website for release
npm run preview      # preview the built website
npm run lint         # check the code for common mistakes

# ---------- BACKEND (run inside the backend/ folder) ----------
cd backend
npm install          # download all backend tools
npm start            # start the server
```

---

## 7. Where the project is hosted

| Part | Host | Config file |
|------|------|-------------|
| Frontend | **Vercel** | `vercel.json` |
| Backend | **Render** | (Render dashboard) |
| Database | **MongoDB Atlas** (cloud) | `.env` → `MONGO_URI` |
