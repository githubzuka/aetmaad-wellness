# 03 — The Whole Project Explained

This file explains the entire project in plain words: **what it is**, **who uses
it**, **how it works**, and **how a request flows** from a click to the database
and back.

---

## 1. What is this project?

**ASHVA Equine Wellness** is a website for a non-profit that helps working horses
by selling natural nutrition mixes and running a volunteer network of shops.

Think of it as **three things in one**:

1. **A shop** — people can browse products, add them to a cart and order.
2. **A donation page** — people can give money via UPI.
3. **A community platform** — volunteers manage "shops" in their city and send
   weekly reports; admins run everything from a control panel.

There is also an **AI chat helper**, an **events board**, and a **contact system**.

---

## 2. Who uses it? (The three roles)

| Role | What they can do | Where they land after login |
|------|-----------------|------------------------------|
| **Customer** | Browse, order, donate, contact, apply to volunteer | Home (or the page they came from) |
| **Volunteer** | Manage shops, see orders, send weekly feedback, message admin | `/volunteer/dashboard` (only if approved) |
| **Admin** | See everything: contacts, donations, events, users, security alerts | `/admin/dashboard` |

All three sign in **through the same login page** (`/login`). The app checks the
role and sends the person to the right place. This means normal users never need
to know the `/admin` address exists.

---

## 3. The pages on the website

| Page | URL | What it shows |
|------|-----|----------------|
| Home | `/` | Hero, About, Products, Events, Impact, Feeding Guide, **FAQ**, Footer |
| Products | `/products` | The full product catalog |
| Order a product | `/order/:productId` | Fill in details and order |
| Cart | `/cart` | Review cart and checkout |
| My Orders | `/orders` | Your past orders (must be logged in) |
| Our Mission | `/working-horses` | The story / mission page |
| Donate | `/donate` | Donation options + FAQ |
| Contact Us | `/contact` | Contact form + contact details |
| Login | `/login` | Sign in (all roles) |
| Signup | `/signup` | Create an account |
| Admin gateway | `/admin` | Admin sign-in entry |
| Volunteer gateway | `/volunteer` | Volunteer sign-in / application |
| Admin dashboard | `/admin/dashboard` | Admin control panel (admins only) |
| Volunteer dashboard | `/volunteer/dashboard` | Volunteer control panel (approved volunteers only) |
| Privacy / Terms | `/privacy`, `/terms` | Legal pages |

If someone types a wrong address, they are sent back to the home page.

---

## 4. How the app remembers things (State)

The app needs to remember two things all the time:

1. **Who is logged in** → `AuthContext`
   - Stores the user object (name, email, role) and the login token.
   - Provides `login()`, `logout()`, and `isAuthenticated`.
   - The token is saved in the browser so a refresh does not log you out.

2. **What is in the cart** → `CartContext`
   - Stores the cart items and the total count.
   - The little badge on the Cart icon reads from here.

Because these live in "Context", **any** page can read them without messy
passing of data from parent to child.

---

## 5. How a request travels (the important part)

Let's follow **"a visitor sends a Contact Us message"** step by step.

```
STEP 1  The visitor fills the form on /contact and clicks "Send Inquiry"
          │
          ▼
STEP 2  src/pages/Contact.jsx  calls  contactService.submitContact(formData)
          │
          ▼
STEP 3  src/services/contactService.js  sends:
          POST /api/contact   (with the form data as JSON)
          │
          ▼
STEP 4  The server (backend/server.js) receives it and applies middleware in order:
          ① HTTPS check  ② CORS check  ③ Helmet headers
          ④ body size limit  ⑤ malicious-input detector
          ⑥ rate limiter (max 25 per 10 min)
          │
          ▼
STEP 5  backend/src/routes/contactRoutes.js  points POST /  →  submitContact
          │
          ▼
STEP 6  backend/src/controllers/contactController.js  runs:
          - validates name / email / message
          - saves a new document using the Contact model
          │
          ▼
STEP 7  backend/src/models/Contact.js  →  MongoDB saves the record
          │
          ▼
STEP 8  The controller also creates an ADMIN NOTIFICATION:
          "New Contact Enquiry — <subject>"
          │
          ▼
STEP 9  Server replies:  { success: true, message: "Thank you..." }
          │
          ▼
STEP 10 The Contact page shows the green "Message Received!" screen
          │
          ▼
STEP 11 Later, an admin opens /admin/dashboard → "Contact Enquiries" tab
          (src/components/admin/AdminContacts.jsx)
          and reads it, adds a note, and marks it resolved.
```

**The same pattern is used for every feature** — orders, donations, events,
shops. Only the names change.

---

## 6. The Contact Us feature in detail

This one matters because it was specifically requested.

### Frontend
- **Page:** `src/pages/Contact.jsx`
- **Form fields:** Name, Email, Phone, Category, Subject, Message
- **Categories:** General, Order/Product, Volunteer Programme, Donation,
  Complaint/Feedback
- **Side cards:** Email, Helpline, WhatsApp, Instagram, Headquarters
- **Styling:** `src/pages/Contact.css`

### Backend
- **Model:** `backend/src/models/Contact.js` — defines the saved shape
  (name, email, phone, subject, category, message, status, adminNote,
  resolvedBy, resolvedAt, IP, user-agent).
- **Public route:** `POST /api/contact` → `submitContact`
  - Validates required fields.
  - Trims and caps the length of each field.
  - Saves to MongoDB.
  - Creates a deduped admin notification (repeated identical messages collapse
    into one entry with an "×N" counter instead of flooding the inbox).
  - Spam check: if the same email sends 5+ enquiries in 10 minutes, it logs a
    medium-severity security event.
- **Admin routes:**
  - `GET /api/admin/contacts` → list all (optional `?status=` filter) + counts
  - `PATCH /api/admin/contacts/:id` → change status / add an internal note

### Admin panel
- **Component:** `src/components/admin/AdminContacts.jsx`
- Tabs: All / New / In Progress / Resolved
- Summary tiles: New, In Progress, Resolved, Total
- Search across name, email, subject, message
- Click a row → popup with the full message, email link, note box, and
  "Mark In Progress" / "Mark Resolved" buttons

**Status labels:** `new`, `in_progress`, `resolved`
**Category labels:** `general`, `order`, `volunteer`, `donation`, `complaint`

---

## 7. The database (MongoDB) — what is stored

Each "collection" (think: table) has a Mongoose model:

| Model | Stores |
|-------|--------|
| `User` | Accounts: name, email (hashed password), role, volunteer status |
| `Product` | Nutrition mix products: name, price, description, images |
| `Order` | Orders: which user, which items, total, status, address |
| `Shop` | Volunteer shops: owner, city/zone, contact, status |
| `ShopFeedback` | Weekly shop reports |
| `Event` | Events: title, date, location, description |
| `Donation` | Donations: donor, amount, transaction reference |
| `Notification` | Alerts shown to a user or to admins |
| `Contact` | Contact form enquiries |
| `AdminReply` | Replies from admin to volunteers |

---

## 8. Security in one paragraph

Every action on the server is protected in layers. Passwords are **hashed** (never
stored as plain text) using bcrypt. When you log in you receive a **JWT token** —
a signed pass that proves who you are. Routes that need a login call `protect`;
routes that need a specific role call `authorize('admin')`. Sensitive routes have
**rate limits** so attackers cannot spam them. A **malicious-input detector**
blocks dangerous keys such as `$ne` or `__proto__` before they can reach the
database. **Helmet** sets protective browser headers, **CORS** allows only our
own websites to call the API, and production traffic is **forced onto HTTPS**.
Anything suspicious is written to a **security log** and appears in the admin
"Security Alerts" tab.

> Full test results: **`05-SECURITY-REPORT.md`**

---

## 9. How the frontend is put together (file-by-file mental model)

```
main.jsx
   │  wraps the app in:  BrowserRouter  →  AuthProvider  →  CartProvider
   ▼
App.jsx
   │  renders the router
   ▼
routes/AppRoutes.jsx
   │  decides which page to show based on the URL
   ▼
pages/Home.jsx  etc.
   │  each page is built from components
   ▼
components/…
   │  talk to the backend through:  services/  →  api/axiosClient.js
```

- **`api/axiosClient.js`** is the single door to the backend. It attaches the
  login token to every request automatically.
- **`services/*.js`** are thin wrappers so pages never build URLs by hand.
- **`hooks/*.js`** hold reusable logic (loading orders, loading shops).
- **`components/routing/*`** are the guards that block the wrong people.

---

## 10. How the backend is put together (file-by-file mental model)

```
server.js
   │  loads env vars, connects to Mongo, builds the Express app
   │  applies middleware, mounts all the routers, starts listening
   ▼
routes/*.js         → "when this URL is called, run this controller"
   ▼
middleware/*.js     → "is this allowed? who is this? too many requests?"
   ▼
controllers/*.js    → the actual logic
   ▼
models/*.js         → read / write MongoDB
   ▼
utils/*.js          → helper functions (tokens, email, security log)
```

---

## 11. The responsive design approach

The website must work on every screen size. The approach is:

1. **Flexbox and CSS Grid** for layout rather than fixed widths.
2. **`box-sizing: border-box`** so padding never breaks widths.
3. **Fluid units** (`fr`, `%`, `min()`, `clamp()`) instead of hard pixels.
4. **Media query breakpoints**, used consistently across the CSS files:

   | Breakpoint | Target |
   |-----------|--------|
   | 1100px | Small laptops |
   | 900px  | Tablets — panels collapse to one column |
   | 600px / 640px | Large phones |
   | 480px  | Phones |
   | 380px  | Very small phones |

5. **Mobile-specific tweaks** — e.g. the Login page hides its decorative brand
   panel below 900px, and the footer collapses to a single column below 600px.
6. **`100dvh`** instead of `100vh` so mobile browser toolbars do not cut the page.

**Verified in a real headless browser at 390px wide:** footer became one column,
the FAQ accordion and its buttons stacked vertically, the Login card fitted the
screen, and there was **no horizontal scrolling on any page**.

---

## 12. The AI chat helper

- **Frontend:** `src/components/ChatWindow.jsx`
- **Backend:** `backend/src/controllers/chatController.js` + `/api/chat`
- It uses the **OpenAI / Groq SDKs** to answer questions about equine nutrition
  and the website. Replies are rendered as Markdown via `react-markdown`.

---

## 13. Scheduled background jobs

`backend/src/jobs/cronJobs.js` uses **node-cron** to run tasks automatically —
for example cleaning up old data or sending reminders. It starts when the server
boots (`initCronJobs()` in `server.js`).

---

## 14. Where to start reading the code

If you are new to the project, read in this order:

1. `docs/01-PROJECT-STRUCTURE.md` — see all the files
2. `docs/02-TECHNOLOGIES-USED.md` — understand the tools
3. `src/routes/AppRoutes.jsx` — see all the pages and URLs
4. `src/pages/Home.jsx` — see how a page is assembled from components
5. `backend/server.js` — see the whole server in one file
6. `backend/src/controllers/contactController.js` — see a full, typical feature
7. `backend/src/middleware/securityMiddleware.js` — see how protection works
