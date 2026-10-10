# 04 — Git & Revision History

This file records the **history (revisions) of the project** and gives you the
**exact Git commands** to save your work and upload it.

Simple idea: **Git** is a notebook that remembers every version of your project.
Every time you finish something, you "commit" — you take a snapshot with a short
message saying what you did. You can always go back to any snapshot.

---

## 1. What is in each commit (revision list)

Below is the revision history for this project, newest last. These are the
messages used when saving the work.

| # | Commit message | What it did |
|---|----------------|-------------|
| 1 | `chore: initial project setup` | Baseline: React frontend + Express/MongoDB backend + deprecated old frontend |
| 2 | `feat(login): redesign sign-in page with premium emerald & gold theme` | New brand panel glow, card accent bar, focus states, button shine, reduced-motion support |
| 3 | `feat(footer): update contact details and reduce socials to Instagram, WhatsApp, Email` | New email `enquinemix@gmail.com`, phone/WhatsApp `84220 60195`, Instagram `ashva_enquinemix`; removed Facebook & YouTube; added FAQs quick link |
| 4 | `feat(faq): add FAQ accordion section to home page` | New `HomeFAQ.jsx` + `HomeFAQ.css`, wired into `Home.jsx` with `id="faq"` |
| 5 | `feat(contact): add correct contact details and WhatsApp/Instagram info cards` | Contact page cards updated, link styling, DonateFAQ email updated |
| 6 | `fix(contact): avoid unavailable lucide Instagram icon with inline SVG` | Build fix — `lucide-react` in this version does not export `Instagram` |
| 7 | `docs: add full project documentation (structure, tech stack, guide)` | This `docs/` folder |
| 8 | `test(security): verify headers, rate limiting, auth and input defences` | Security test pass + `05-SECURITY-REPORT.md` |

---

## 2. First-time setup (only once)

If the project is **not yet a Git repository**, run these **once** inside the
project folder:

```bash
cd "aetmaad-wellness-main"

# 1. Turn this folder into a Git repository
git init

# 2. Tell Git who you are (use your own name and email)
git config user.name "Your Name"
git config user.email "you@example.com"

# 3. Rename the default branch to main
git branch -M main

# 4. (Optional) connect to GitHub — create the repo on github.com first, then:
git remote add origin https://github.com/<your-username>/<repo-name>.git
```

> ⚠️ **Check `.gitignore` first.** It must ignore `node_modules`, `dist` and
> `backend/.env`. Never upload your real secrets.

---

## 3. Saving one change (the everyday commands)

Use this cycle whenever you finish a piece of work:

```bash
# 1. See what changed
git status

# 2. See the exact lines that changed
git diff

# 3. Stage the files you want to save
git add .                      # everything
# or be precise:
git add src/pages/Login.css src/pages/Login.jsx

# 4. Take the snapshot with a clear message
git commit -m "feat(login): redesign sign-in page with premium emerald & gold theme"

# 5. Send it to GitHub
git push
```

---

## 4. The full command sequence for THIS revision

Run these one after another to save **everything done in this session** as
separate, clear commits.

```bash
cd "aetmaad-wellness-main"

# ---------- Commit 1: Login page redesign ----------
git add src/pages/Login.css src/pages/Login.jsx
git commit -m "feat(login): redesign sign-in page with premium emerald & gold theme"

# ---------- Commit 2: Footer update ----------
git add src/components/Footer.jsx src/components/Footer.css
git commit -m "feat(footer): update contact details and keep only Instagram, WhatsApp, Email"

# ---------- Commit 3: FAQ section ----------
git add src/components/HomeFAQ.jsx src/components/HomeFAQ.css src/pages/Home.jsx
git commit -m "feat(faq): add FAQ accordion section to the home page"

# ---------- Commit 4: Contact page details ----------
git add src/pages/Contact.jsx src/pages/Contact.css src/components/Donate/DonateFAQ.jsx
git commit -m "feat(contact): add correct details and WhatsApp/Instagram cards"

# ---------- Commit 5: Build fix ----------
git add src/pages/Contact.jsx
git commit -m "fix(contact): replace unavailable lucide Instagram icon with inline SVG"

# ---------- Commit 6: Documentation ----------
git add docs/
git commit -m "docs: add project structure, tech stack and full project guide"

# ---------- Commit 7: Security test report ----------
git add docs/05-SECURITY-REPORT.md
git commit -m "test(security): verify headers, rate limiting, auth and input defences"

# ---------- Finally, upload ----------
git push -u origin main
```

---

## 5. If you prefer ONE single commit

```bash
cd "aetmaad-wellness-main"
git add .
git commit -m "feat: redesign login, add FAQ section, update contacts; add docs and security report"
git push -u origin main
```

---

## 6. Useful "time machine" commands

```bash
# See the history (a list of all snapshots)
git log --oneline

# See a nicer, graph view
git log --oneline --graph --all --decorate

# See who changed what, line by line, in one file
git blame src/pages/Login.css

# Undo changes in a file you have NOT committed yet
git restore src/pages/Login.css

# Un-stage a file (keep the changes)
git restore --staged src/pages/Login.css

# Look at an old version of a file without changing anything
git show <commit-hash>:src/pages/Login.css

# Go back to an old snapshot in a safe, detached way
git checkout <commit-hash>

# Come back to the latest
git checkout main

# Create a separate line of work for a new feature
git checkout -b feature/my-new-idea
```

---

## 7. Branching: a simple, safe habit

Work on a branch, then merge it back. This keeps `main` always working.

```bash
# 1. Make a branch for the new work
git checkout -b feature/improve-footer

# 2. Do the work, then save it
git add .
git commit -m "feat(footer): improve layout on small screens"

# 3. Push the branch to GitHub
git push -u origin feature/improve-footer

# 4. Merge it into main
git checkout main
git pull
git merge feature/improve-footer

# 5. Push the merged main, then delete the branch
git push
git branch -d feature/improve-footer
```

---

## 8. Tags — naming a release

Tags mark an important snapshot, like a version number.

```bash
# Make a tag
git tag -a v1.0.0 -m "First complete release of ASHVA Wellness"

# Send tags to GitHub
git push origin v1.0.0

# See all tags
git tag
```

---

## 9. Common problems and fixes

| Problem | Fix |
|---------|-----|
| "fatal: not a git repository" | You are in the wrong folder. `cd` into the project and run `git init` |
| Accidentally staged `node_modules` | Add it to `.gitignore`, then `git rm -r --cached node_modules` |
| Accidentally committed `.env` | Change the secrets immediately, then `git rm --cached backend/.env` |
| Committed but want a different message | `git commit --amend -m "new message"` (only if not pushed yet) |
| Merge conflict | Open the file, look for `<<<<<<<` markers, keep the correct code, then `git add` and `git commit` |
| Pushed the wrong thing | `git revert <commit-hash>` makes a new commit that undoes it — safer than deleting history |
| Want to see what would be pushed first | `git log origin/main..HEAD --oneline` |

---

## 10. Good commit message habits

Use a short **type** prefix, then a plain description:

| Prefix | Means |
|--------|-------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting / CSS, no behaviour change |
| `refactor` | Code reshaped, same behaviour |
| `test` | Adding or fixing tests |
| `chore` | Setup, tools, housekeeping |

Good:  `feat(faq): add FAQ accordion section to the home page`
Bad:   `update stuff`
