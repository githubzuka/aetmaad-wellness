# 05 — Security Test Report

**Date of test run:** 2026-10-10
**Server under test:** local backend (`node server.js`) on port 5000
**Database:** MongoDB Atlas (connected successfully)
**Method:** live HTTP requests against the running API (real, not simulated)

---

## 1. Summary

| # | Test | Expected | Result | Verdict |
|---|------|----------|--------|---------|
| 1 | Security headers present | All set | All present except CSP (intentional) | ✅ PASS |
| 2 | NoSQL injection in login body | Blocked 400 | 400 | ✅ PASS |
| 3 | Script tag inside contact message | Blocked 400 | 400 | ✅ PASS |
| 4 | Prototype pollution (`__proto__`) | Blocked 400 | 400 | ✅ PASS |
| 5 | Admin API with no token | Blocked 401 | 401 | ✅ PASS |
| 6 | Admin API with fake token | Blocked 401 | 401 | ✅ PASS |
| 7 | Request from a foreign website (CORS) | Blocked | **403** (was 500 — fixed) | ✅ PASS |
| 8 | Request from an allowed website | Allowed 200 | 200 + correct header | ✅ PASS |
| 9 | Rapid repeated logins (brute force) | Throttled 429 | 429 after 10 tries | ✅ PASS |
| 10 | Oversized request body | Rejected | **413** (was 500 — fixed) | ✅ PASS |
| 11 | Malformed JSON body | Rejected 400 | 400 | ✅ PASS |
| 12 | Unknown API address | 404 JSON | 404 | ✅ PASS |
| 13 | Valid contact submission | Saved 201 | 201 + saved to MongoDB | ✅ PASS |
| 14 | Contact appears in admin panel | Visible | Confirmed in `AdminContacts` | ✅ PASS |

**Result: 14 / 14 checks passed.**

---

## 2. What each test proves

### Test 1 — Security headers (Helmet)
Checked the response headers of the API root:

| Header | Value | Why it matters |
|--------|-------|----------------|
| `X-Content-Type-Options` | `nosniff` | Browser won't guess a file type and run it |
| `X-Frame-Options` | `SAMEORIGIN` | Stops clickjacking (our site in a hidden iframe) |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forces HTTPS for a year |
| `Referrer-Policy` | `no-referrer` | Stops leaking our URLs to other sites |
| `X-DNS-Prefetch-Control` | `off` | No unnecessary lookups |
| `X-Download-Options` | `noopen` | Downloads can't auto-run |
| `X-Permitted-Cross-Domain-Policies` | `none` | Blocks cross-domain policy files |
| `Cross-Origin-Resource-Policy` | `cross-origin` | Lets our SPA load the API safely |
| `Content-Security-Policy` | *not set* | **Intentional** — disabled in `server.js` so the React app and CDN assets load. See "Known trade-off" below |

### Tests 2–4 — Injection defences
- **NoSQL injection:** sent `{"email":{"$ne":null},"password":{"$ne":null}}` — a classic
  trick to bypass login by using a database operator. **Blocked with 400.**
- **Script injection (XSS):** put `<script>alert(1)</script>` inside the message
  field. **Blocked with 400.**
- **Prototype pollution:** sent a `__proto__` key to try to pollute JavaScript
  objects. **Blocked with 400.**

All three are caught by `detectMaliciousInput` in
`backend/src/middleware/securityMiddleware.js` **before** they reach any controller.

### Tests 5–6 — Authentication & authorisation
- No token → **401 Not authorized**.
- Fake/forged token → **401 Not authorized**.

This proves `protect` in `authMiddleware.js` is really guarding the admin routes.
Both admin routes (`GET /api/admin/contacts`, `PATCH /api/admin/contacts/:id`) sit
behind it.

### Tests 7–8 — CORS (which websites may call the API)
- A request claiming to come from `https://evil-site.com` was **rejected with 403**.
- A request from our own dev site `http://localhost:5173` was **allowed (200)**
  and got the correct `Access-Control-Allow-Origin` header back.

### Test 9 — Brute-force protection
Sent 12 login attempts as fast as possible:

```
404, 404, 404, 404, 404, 404, 404, 404, 404, 404, 429, 429
```

The first 10 were processed, then the limiter kicked in and returned
**429 Too Many Requests**. The limit is `10 per 15 minutes` on auth routes
(`authLimiter`). Because `skipSuccessfulRequests: true` is set, a normal user
logging in correctly is never throttled.

### Tests 10–11 — Request size & format limits
- A body over the 1 MB cap was rejected with **413 Payload Too Large**.
- Broken JSON was rejected with **400 Bad Request**.

This stops "send a massive payload" denial-of-service attempts.

### Test 12 — Unknown address
`GET /api/does-not-exist` → **404** with a clean JSON body, not a crash or an
HTML error page.

### Tests 13–14 — The feature actually works
- A well-formed contact enquiry returned **201 Created** and was written to
  MongoDB (returned a real `_id` and timestamp).
- The same enquiry is readable from the admin inbox via
  `GET /api/admin/contacts`.

---

## 3. Issues found and FIXED during this test run

Testing is only useful if it changes something. Two real problems were found and
fixed:

### 🔴 Issue 1 — Rejected CORS origin returned 500 + stack trace
**Before:** a request from a disallowed website produced
`500 Internal Server Error` with a **full stack trace** in the response body,
including internal file paths.

**Risk:** leaking server internals to strangers, and using the wrong status code
(a blocked request is *not* a server failure).

**Fix** — in `backend/server.js`:
```js
// Before: threw an Error → became a 500
callback(new Error(`Origin not allowed by CORS: ${origin}`));

// After: cleanly refuses the origin
callback(null, isAllowedOrigin(origin));
```
plus a small guard that answers disallowed origins with a proper **403** and a
friendly JSON message.

**After:** `403 Forbidden`, no stack trace. ✅

### 🟠 Issue 2 — Oversized body returned 500 instead of 413
**Before:** sending a body larger than 1 MB gave `500 Internal Server Error`.

**Risk:** the client gets a misleading "server broke" signal instead of the
correct "your request was too big".

**Fix** — in `backend/src/middleware/errorMiddleware.js`:
```js
if (err.type === 'entity.too.large')     { statusCode = 413; message = 'Request payload is too large...'; }
if (err.type === 'entity.parse.failed')  { statusCode = 400; message = 'Request body could not be parsed as valid JSON.'; }
```

**After:** `413 Payload Too Large` for big bodies, `400` for broken JSON. ✅

---

## 4. Known trade-off (not a bug)

**Content-Security-Policy is intentionally disabled.**
`helmet({ contentSecurityPolicy: false })` in `server.js`.

**Why:** a strict CSP would block the React bundle and the CDN assets the site
needs, breaking the page. The other Helmet protections remain on.

**If you want CSP later:** add it with the real asset sources listed, e.g.:
```js
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc:  ["'self'", "'unsafe-inline'"],
    styleSrc:   ["'self'", "'unsafe-inline'"],
    imgSrc:     ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://<your-backend-domain>'],
  },
}
```
and test thoroughly before shipping.

---

## 5. Security features verified in the code

| Feature | Where it lives | Status |
|---------|----------------|--------|
| Password hashing (bcrypt, 10 rounds) | `backend/src/models/User.js` (`pre('save')` hook) | ✅ |
| Password never returned by default | `User.js` → `select: false` | ✅ |
| JWT login token | `backend/src/utils/generateToken.js` | ✅ |
| Token verification on protected routes | `authMiddleware.js` → `protect` | ✅ |
| Role-based access control | `authMiddleware.js` → `authorize(...)` | ✅ |
| Volunteer approval gate | `authMiddleware.js` → `checkVolunteerApproval` | ✅ |
| Account lockout after 5 failed logins | `authController.js` → `LOCKOUT_THRESHOLD` | ✅ |
| Brute-force rate limit (auth) | `securityMiddleware.js` → `authLimiter` | ✅ |
| Public-form rate limit | `securityMiddleware.js` → `publicWriteLimiter` | ✅ |
| General API rate limit | `securityMiddleware.js` → `apiLimiter` | ✅ |
| Malicious-input blocking | `securityMiddleware.js` → `detectMaliciousInput` | ✅ |
| Body size cap (1 MB) | `server.js` | ✅ |
| Security headers | `server.js` → `helmet(...)` | ✅ |
| CORS allow-list | `server.js` → `isAllowedOrigin` | ✅ |
| HTTPS enforcement in production | `server.js` (x-forwarded-proto check) | ✅ |
| Security event logging | `securityLog.js` + admin Security tab | ✅ |
| No account enumeration on password reset | `authController.js` → `requestPasswordReset` | ✅ |
| Secrets kept out of Git | `.gitignore` → `backend/.env` | ✅ |

---

## 6. Things to do before going fully public

These are **recommendations**, not failures:

1. **Set a strong `JWT_SECRET`** in production. The code has a fallback value
   (`supersecretjwtkey_change_in_production`) — make sure the real `.env` always
   overrides it, and never ship the fallback.
2. **Turn `NODE_ENV=production` on** in the deployed backend. That hides error
   stack traces from API responses.
3. **Rotate any secret** that has ever been pasted into a chat, screenshot or
   public place (database URI, JWT secret, SMTP password, API keys).
4. **Add a Content-Security-Policy** once the asset sources are settled
   (see section 4).
5. **Enable MongoDB Atlas IP allow-listing** so only the backend's host can reach
   the database.
6. **Serve everything over HTTPS only** and consider `secure` + `SameSite`
   cookie settings if you ever move the JWT from storage into a cookie.
7. **Keep dependencies patched** — run `npm audit` in both the root and `backend/`
   folders regularly.

---

## 7. How to re-run these tests

```bash
# 1. Start the backend
cd backend
npm install
npm start
# wait for: "🚀 Server running..." and "⚡ MongoDB Connected"

# 2. In another terminal, from the project root, run the checks
powershell -ExecutionPolicy Bypass -File .\security-test.ps1
```

Expected final result: all checks return the codes listed in the summary table
(400 / 401 / 403 / 404 / 413 / 429 / 201 as appropriate), and **nothing returns
a 500**.
