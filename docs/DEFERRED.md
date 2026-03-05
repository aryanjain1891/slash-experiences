# Deferred Features & Ideas

Features intentionally deferred from the current release. Backend API routes may already exist for some of these.

## Swipe Feature (needs redesign)
- The old Tinder-like swipe UI needs a complete rethink, not a copy
- Backend: `/api/swipe/start` is ready (pgvector-based recommendations)
- Needs: new interaction design, possibly different UX paradigm

## Admin Panel
- Experience CRUD (add/edit/delete experiences)
- User management
- Analytics dashboard (recharts is installed)
- Provider management
- Site settings
- The old app had admin pages at `/admin/*` but with fake auth (`admin123/slash2025`)
- Needs: proper role-based auth (admin role in Better Auth)

## Newsletter Signup
- Email collection form in footer/homepage
- Needs: email service integration (Resend, Mailchimp, etc.)
- Old app had a newsletter component but it wasn't wired to any backend

## Friends & Social Features
- Friends' likes shown on experience cards (avatar row)
- Connection requests (People You May Know)
- Accept/reject connections
- Tables exist: `connections` (3 rows imported)
- Needs: `/api/connections` routes, UI for connection management

## Badges & Gamification
- Referral badges carousel on profile
- Badge unlock modals
- Milestone-based achievements
- Table: `badges` (not created yet - was not in Supabase export)
- Low engagement in old app

## Import Contacts
- Google People API integration
- Match contacts with existing users
- Old component: `ImportContactsButton`
- Needs: Google People API scope + consent

## Save for Later (localStorage)
- Separate from wishlist (which is server-side)
- localStorage-based bookmarking for non-authenticated users
- Old app used `savedExperiences` in localStorage

---

## Deferred Code Review Items

Issues from `docs/CODE_REVIEW.md` that were reviewed and intentionally deferred.

### CR #4 — DB connection mismatch (CRITICAL)

**What:** `db/index.ts` uses `neon()` (HTTP driver) while `auth.ts` uses `Pool` from `@neondatabase/serverless`. Two different connection strategies to the same database.

**Why deferred:** Pool works correctly for Better Auth's connection needs. Refactoring both to use the same driver would risk breaking the auth flow, which is working reliably in production. The inconsistency is cosmetic — both drivers connect to the same Neon database.

**When to revisit:** If connection pooling issues arise in production, or if Better Auth adds native support for the Neon HTTP driver.

---

### CR #12 — Razorpay script SRI hash (MEDIUM)

**What:** The Razorpay `checkout.js` script is loaded without a Subresource Integrity (SRI) hash, meaning a CDN compromise could inject malicious code.

**Why deferred:** The SRI hash needs to match the exact version of the Razorpay script, which changes when Razorpay updates their checkout.js. Low risk since the script is served from Razorpay's own CDN over HTTPS.

**When to revisit:** If Razorpay publishes official SRI hashes, or if a security audit requires it.

---

### CR #16 — Inconsistent casing convention (LOW)

**What:** API responses use snake_case (via `toSnakeCase` utility) but Drizzle returns camelCase. Some places handle both formats defensively.

**Why deferred:** The `toSnakeCase` approach works consistently across all endpoints. Changing the convention would require touching every file that consumes API responses — high effort, no functional benefit, and risk of introducing regressions.

**When to revisit:** If starting a major refactor or migrating to a new API layer.

---

### CR #17 — Unused database tables in schema (LOW)

**What:** Several tables in `schema.ts` have no API routes or UI: `providers`, `referrals`, `connections`, `gift_personalizations`, `gift_questionnaire_responses`, `career_listings`, `site_settings`.

**Why deferred:** These tables are kept for future features (admin panel, social features, gamification — see sections above). Removing them would lose the schema definitions needed when those features are built.

**When to revisit:** When building the features that use these tables, or during a schema cleanup if features are permanently cut.

---

### CR #19 — Search history in plain localStorage (LOW)

**What:** Search history is stored in `localStorage` as a JSON array with no expiry. On shared devices, another user could see previous search terms.

**Why deferred:** The 10-item cap is reasonable. The data is not sensitive (experience search terms). Clear-on-logout is a nice-to-have but not a security risk since the app is not used on shared devices in practice.

**When to revisit:** If user privacy requirements change, or if a "clear my data" feature is added to the profile page.
