# 01 — Full Project Structure

This file shows **every important file and folder** in the project, and explains in
simple words what each one does.

The project has **two apps in one repository**:

1. **Frontend** — the website the user sees (React).
2. **Backend** — the server + database that stores data (Node/Express + MongoDB).

> `node_modules`, `dist` and other machine-generated folders are hidden from the
> list below because a computer makes them automatically and nobody edits them by hand.

---

## Top level (root of the project)

```
aetmaad-wellness-main/
├── .env.example              # Sample list of settings (no real secrets inside)
├── .gitignore                # Tells Git which files to never upload
├── index.html                # The single HTML page that loads the whole website
├── package.json              # Frontend list of tools + commands (npm run dev, build...)
├── package-lock.json         # Exact locked versions of frontend tools
├── vite.config.js            # Settings for Vite (the frontend builder)
├── vercel.json               # Settings for hosting the frontend on Vercel
├── eslint.config.js          # Rules that check frontend code for mistakes
├── README.md                 # Short intro to the project
├── contact-e2e.mjs           # An automated browser test for the Contact form
├── docs/                     # 📁 This documentation folder
└── backend/                  # 📁 The server app (see below)
```

---

## Frontend — `src/` folder

```
src/
├── main.jsx                  # Starting point. Turns the React app ON.
├── App.jsx                   # The outer shell of the app
├── App.css                   # Global styles for the app shell
├── index.css                 # Base styles used everywhere (fonts, colors, resets)
├── index.js                  # Small entry helper
│
├── routes/
│   └── AppRoutes.jsx         # The full list of pages and their web addresses (URLs)
│
├── context/                  # Shared "global memory" for the app
│   ├── AuthContext.jsx       # Remembers who is logged in (user, role, login/logout)
│   └── CartContext.jsx       # Remembers the shopping cart items
│
├── api/
│   └── axiosClient.js        # The one place that talks to the backend server
│
├── services/                 # One file per "kind of request" the app makes
│   ├── authService.js        # Login, signup, password reset
│   ├── adminService.js       # Admin-only data actions
│   ├── contactService.js     # Contact form + admin contact inbox
│   ├── eventService.js       # Events
│   ├── notificationService.js# Notifications
│   ├── orderService.js       # Orders
│   ├── productService.js     # Products
│   ├── replyService.js       # Admin replies / messages
│   └── shopService.js        # Shops (volunteer desk)
│
├── hooks/                    # Reusable pieces of logic
│   ├── useOrders.js          # Loads + manages orders for a screen
│   └── useShops.js           # Loads + manages shops for a screen
│
├── assets/                   # Images bundled with the app (hero.png, logos)
│
├── components/               # 📁 Reusable building blocks of the UI
│   ├── Header.jsx / .css     # Top navigation bar (logo, links, cart, sign in)
│   ├── Footer.jsx / .css     # Bottom area (newsletter, links, contact, socials)
│   ├── Hero.jsx / .css       # Big first section on the home page
│   ├── Features.jsx / .css   # "About Us" style feature grid
│   ├── ProductShowcase.jsx   # Shows nutrition mix products
│   ├── FeedingGuidelines.jsx # Feeding guide section
│   ├── ImpactSection.jsx     # The "Our Impact" numbers section
│   ├── UpcomingEvents.jsx    # Events list on the home page
│   ├── HomeFAQ.jsx / .css    # ⭐ FAQ accordion section (added in this revision)
│   ├── ChatWindow.jsx        # Floating AI chat helper
│   ├── CookieBanner.jsx      # Cookie consent banner
│   │
│   ├── admin/                # 📁 Screens only admins see
│   │   ├── AdminContacts.jsx / .css    # Contact enquiries inbox (MongoDB backed)
│   │   ├── AdminDonations.jsx / .css   # Donations list
│   │   ├── AdminEvents.jsx / .css      # Manage events
│   │   ├── AdminNotifications.jsx/.css # Notification centre
│   │   └── AdminSecurity.jsx / .css    # Security alerts feed
│   │
│   ├── volunteer/            # 📁 Screens volunteers see
│   │   ├── ShopCard.jsx                # One shop card
│   │   ├── VolunteerShopsSection.jsx   # Shop list + management
│   │   ├── VolunteerShopOrders.jsx     # Orders for a shop
│   │   ├── VolunteerAdminMessages.jsx  # Chat with admin
│   │   ├── VolunteerNotifications.jsx  # Volunteer notifications
│   │   ├── WeeklyFeedbackModal.jsx     # Weekly report popup
│   │   └── EventProposalForm.jsx       # Suggest a new event
│   │
│   ├── Donate/               # 📁 Everything for the donation page
│   │   ├── DonateHero.jsx
│   │   ├── DonateImpact.jsx
│   │   ├── DonateTrust.jsx
│   │   ├── DonateFAQ.jsx     # Donation-specific FAQs
│   │   └── DonateModal.jsx   # Payment / QR popup
│   │
│   ├── Cart/                 # 📁 Shopping cart pieces
│   │   ├── CartContent.jsx
│   │   └── PaymentModal.jsx
│   │
│   ├── common/               # 📁 Small shared helpers
│   │   ├── BackToHome.jsx    # "Back to Home" bar on sub-pages
│   │   ├── ConfirmDialog.jsx # "Are you sure?" popup
│   │   └── DashMobileMenu.jsx# Mobile menu for dashboards
│   │
│   └── routing/              # 📁 Route guards (who is allowed where)
│       ├── ProtectedRoute.jsx # "You must be logged in"
│       └── RoleRoute.jsx      # "You must have this role"
│
└── pages/                    # 📁 One file per full page
    ├── Home.jsx              # Home page (Hero, FAQ, Footer, ...)
    ├── Products.jsx          # Product catalog
    ├── ProductOrder.jsx      # Order one product
    ├── Cart.jsx              # Shopping cart page
    ├── MyOrders.jsx          # A customer's past orders
    ├── WorkingHorses.jsx     # "Our Mission" page
    ├── Donate.jsx            # Donation page
    ├── Contact.jsx / .css    # ⭐ Contact Us page (updated in this revision)
    ├── Login.jsx / .css      # ⭐ Sign in page (redesigned in this revision)
    ├── Signup.jsx            # Create account page
    ├── AdminAuth.jsx         # Admin gateway page
    ├── AdminDashboard.jsx    # Admin control panel
    ├── VolunteerAuth.jsx     # Volunteer gateway page
    ├── VolunteerDashboard.jsx# Volunteer control panel
    ├── Unauthorized.jsx      # "You are not allowed here" page
    ├── PrivacyPolicy.jsx     # Legal: privacy policy
    ├── TermsConditions.jsx   # Legal: terms and conditions
    └── LegalPage.css         # Shared styles for legal pages
```

---

## Backend — `backend/` folder

```
backend/
├── .env                      # ⚠️ REAL secrets (DB password, JWT key). Never uploaded.
├── .env.example              # Sample of the settings needed (safe to share)
├── .gitignore                # Hides node_modules and .env from Git
├── package.json              # Backend tool list + commands (npm start)
├── server.js                 # 🚀 The main server file. Starts everything.
│
└── src/
    ├── config/
    │   └── db.js             # Connects the server to MongoDB
    │
    ├── models/               # 📁 The shape of data saved in the database
    │   ├── User.js           # Users (customers, volunteers, admins)
    │   ├── Product.js        # Nutrition mix products
    │   ├── Order.js          # Customer orders
    │   ├── Shop.js           # Shops (volunteer zones)
    │   ├── ShopFeedback.js   # Weekly shop feedback
    │   ├── Event.js          # Events
    │   ├── Donation.js       # Donations
    │   ├── Notification.js   # Notifications shown to users/admins
    │   ├── Contact.js        # ⭐ Contact form submissions (MongoDB)
    │   └── AdminReply.js     # Replies from admin to volunteers
    │
    ├── controllers/          # 📁 The "brain" behind each API address
    │   ├── authController.js         # Signup, login, reset password
    │   ├── adminController.js        # Admin actions
    │   ├── contactController.js      # ⭐ Save + manage contact enquiries
    │   ├── donationController.js     # Donations
    │   ├── eventController.js        # Events
    │   ├── impactController.js       # Impact stats
    │   ├── notificationController.js # Notifications
    │   ├── orderController.js        # Orders
    │   ├── productController.js      # Products
    │   ├── shopController.js         # Shops
    │   ├── shopFeedbackController.js # Shop feedback
    │   ├── adminReplyController.js   # Admin replies
    │   └── chatController.js         # AI chat
    │
    ├── routes/               # 📁 The list of API web addresses (URLs)
    │   ├── authRoutes.js     # /api/auth/...
    │   ├── adminRoutes.js    # /api/admin/...  (includes /contacts)
    │   ├── contactRoutes.js  # /api/contact
    │   ├── donationRoutes.js # /api/donations
    │   ├── eventRoutes.js    # /api/events
    │   ├── impactRoutes.js   # /api/impact
    │   ├── notificationRoutes.js # /api/notifications
    │   ├── orderRoutes.js    # /api/orders
    │   ├── productRoutes.js  # /api/products
    │   ├── shopRoutes.js     # /api/shops
    │   ├── replyRoutes.js    # /api/replies
    │   └── chatRoutes.js     # /api/chat
    │
    ├── middleware/           # 📁 Code that runs BEFORE the main handler
    │   ├── authMiddleware.js      # Checks the login token (protect / authorize)
    │   ├── securityMiddleware.js  # Rate limits + blocks bad input
    │   └── errorMiddleware.js     # Turns errors into clean JSON replies
    │
    ├── utils/                # 📁 Small helpers
    │   ├── generateToken.js  # Creates the login token (JWT)
    │   ├── securityLog.js    # Records security events for admins
    │   └── sendEmail.js      # Sends emails
    │
    └── jobs/
        └── cronJobs.js       # Scheduled background tasks
```

---

## Other folders

```
_deprecated_frontend/         # 🗑️ The OLD version of the frontend.
                              #    Kept only for reference. Not used by the app.
```

---

## Quick map: "I want to change X, where do I look?"

| I want to change...            | Open this file                                  |
|--------------------------------|-------------------------------------------------|
| The sign-in page look          | `src/pages/Login.css` + `src/pages/Login.jsx`   |
| The footer (contact + socials) | `src/components/Footer.jsx`                     |
| The FAQ section                | `src/components/HomeFAQ.jsx`                    |
| The home page section order    | `src/pages/Home.jsx`                            |
| The Contact Us page            | `src/pages/Contact.jsx`                         |
| A website page's web address   | `src/routes/AppRoutes.jsx`                      |
| What the contact form saves    | `backend/src/models/Contact.js`                 |
| The contact form's backend     | `backend/src/controllers/contactController.js`  |
| Who can access an API          | `backend/src/middleware/authMiddleware.js`      |
| Rate limits / bad input rules  | `backend/src/middleware/securityMiddleware.js`  |
| All API web addresses          | `backend/server.js`                             |
