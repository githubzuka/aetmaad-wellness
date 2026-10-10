# ASHVA Equine Wellness — Documentation

Welcome! This folder explains the whole project in **simple words**, so anyone can
understand it — even without a technical background.

---

## Read these in order

| # | File | What it tells you |
|---|------|-------------------|
| 1 | [`01-PROJECT-STRUCTURE.md`](./01-PROJECT-STRUCTURE.md) | **Every file and folder**, and what each one does |
| 2 | [`02-TECHNOLOGIES-USED.md`](./02-TECHNOLOGIES-USED.md) | **Every tool and technique** (npm, React, MongoDB, Helmet…) and why we used it |
| 3 | [`03-PROJECT-EXPLAINED.md`](./03-PROJECT-EXPLAINED.md) | **How the whole project works**, end to end — pages, roles, request flow |
| 4 | [`04-GIT-COMMITS.md`](./04-GIT-COMMITS.md) | **Revision history + all the Git commands** to save and upload the work |
| 5 | [`05-SECURITY-REPORT.md`](./05-SECURITY-REPORT.md) | **Security tests**, results, and the two issues found and fixed |

---

## The 30-second version

- **ASHVA Equine Wellness** is a website that sells natural horse nutrition,
  takes donations, and runs a volunteer network of shops.
- It is built as **two apps**:
  - a **frontend** (React) — what thanse visitor sees;
  - a **backend** (Node/Express + MongoDB) — the rules and the data.
- There are **three kinds of user**: Customer, Volunteer, Admin.
- **Everything is mobile friendly** — tested on a real phone-sized screen.
- **Security is layered**: hashed passwords, JWT logins, role checks, rate
  limits, input filtering, security headers, and a CORS allow-list.

---

## What changed most recently

1. 🔐 **Login page redesigned** to look more premium (emerald + gold theme).
2. 📞 **Footer / contact details updated:**
   - Email → `enquinemix@gmail.com`
   - Phone & WhatsApp → `84220 60195`
   - Instagram → `@ashva_enquinemix`
   - Facebook and YouTube **removed** — only Instagram, WhatsApp and Email remain.
3. ❓ **New FAQ section** on the home page (accordion + WhatsApp/Email buttons).
4. 📱 **Mobile responsiveness verified** on every section.
5. 📬 **Contact Us** wired through to MongoDB and visible in the **admin panel**.
6. 🛡️ **Security tested** — 14/14 checks pass; two real issues found and fixed.

---

## Quick commands

```bash
# Frontend (project root)
npm install
npm run dev       # develop
npm run build     # production build
npm run preview   # preview the build

# Backend (inside backend/)
cd backend
npm install
npm start
```
