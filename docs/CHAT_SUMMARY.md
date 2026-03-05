# Chat Summary & Lessons Learned

## What was accomplished in this session

### Starting point
- Old app: Vite SPA + Supabase + Netlify + Render (Python AI services) + Qdrant + Groq + Azure OpenAI + Google Maps
- 11 external services, hardcoded credentials, no ownership of infrastructure
- Repo: github.com/Sanu700/Slash (cloned to slash-experience/)

### What we built
- New app: Next.js App Router + Neon Postgres + Drizzle ORM + Better Auth + Vercel AI SDK + Gemini
- 6 services total (Vercel free, Neon free, Google OAuth free, Leaflet free, Gemini paid, Razorpay paid)
- Repo: github.com/aryanjain1891/slash-experiences
- Live at: slashexperiences.in (Vercel, DNS via Hostinger)

### Migration steps completed
1. Created fresh GitHub repo under aryanjain1891
2. Scaffolded Next.js project with Tailwind + shadcn/ui
3. Copied 45+ shadcn components from old repo
4. Created Drizzle schema (20+ tables including pgvector)
5. Set up Neon Postgres (Singapore region), pushed schema
6. Exported all data from Supabase (using service role key to bypass RLS)
7. Imported 65 experiences, 29 profiles, 42 bookings, 43 wishlists, 219 views
8. Set up Better Auth with Google OAuth
9. Created 16 API routes (data, auth, AI, payments, contact)
10. Ported 19 page routes to App Router
11. Rewrote AI gift personalizer (Python FastAPI → Next.js API routes + Gemini)
12. Set up Vercel deployment with all env vars
13. Pointed slashexperiences.in DNS from Netlify to Vercel
14. Replaced all base64/low-quality images with Unsplash CDN URLs
15. Created comprehensive documentation (FEATURES, ARCHITECTURE, CODE_REVIEW, DEFERRED, IDEAS)

### Bugs found and fixed
- Supabase anon key couldn't see user data (RLS) — used service role key
- Better Auth needed Pool adapter, not Drizzle adapter
- Google OAuth 400 error — trailing newlines in Vercel env vars (from `<<<` in shell)
- API returned camelCase but frontend expected snake_case — added toSnakeCase mapper
- Category filtering broken — case mismatch (Adventure vs adventure)
- Missing schema fields — tags, exp_type, status, idtag not in Drizzle schema
- Experience date column was DATE type but data had "Available daily" strings
- Calendar component broken — react-day-picker v9 uses different classNames than v8
- Toaster component missing from layout — all toasts were invisible
- 23 code review issues fixed (auth, validation, SQL safety, etc.)

---

## Aryan's working style

### Communication preferences
- Direct and impatient — don't ask unnecessary questions, just do it
- Wants to understand WHY, not just WHAT — explain decisions
- Gets frustrated when things break repeatedly — values thoroughness over speed
- Prefers "you decide" for technical decisions but wants to know the trade-offs
- Doesn't know infrastructure deeply (DNS, hosting, etc.) — needs plain English explanations

### Decision-making
- Wants free services wherever possible
- Wants everything in one repo, manageable by Cursor
- Doesn't want to copy blindly — port smartly, adapt to new backend
- Deferred features should be tracked, not forgotten (docs/ as living files)
- Swipe feature needs redesign, not copying
- Admin panel and newsletter are low priority

### What frustrates Aryan
- "Code reviews" that only read code instead of testing the UI
- Bugs that should have been caught proactively (missing Toaster, wrong response shapes)
- Having to manually test and report every issue
- Asking too many clarifying questions instead of making reasonable decisions
- Not updating documentation after changes

### What Aryan values
- Documentation that stays in sync (docs/ folder with .cursor/rules for enforcement)
- Comprehensive plans before execution
- Honest assessment of problems (don't sugarcoat)
- Tracking deferred work (DEFERRED.md, IDEAS.md)
- Clean, maintainable code

---

## Lessons learned (for future sessions)

### 1. Test the actual UI, not just the code
Reading code catches type errors but misses runtime issues (missing components, wrong response shapes, CSS bugs). Use Apple Events/screenshots to verify visually.

### 2. Always add Toaster/toast provider
Any Next.js app using sonner/toast needs `<Toaster />` in layout.tsx. Without it, all feedback is invisible.

### 3. Drizzle returns camelCase, frontends often expect snake_case
When porting from a snake_case database (Postgres) to Drizzle ORM, the JavaScript property names become camelCase. Either use Drizzle's casing option or add a mapper.

### 4. Environment variables via shell can have trailing newlines
Using `<<<` to pipe values to `vercel env add` adds a `\n`. Use `printf '%s'` instead.

### 5. react-day-picker v9 broke v8 classNames
The Calendar component from shadcn uses v8 class names (caption, nav_button, etc.) but react-day-picker v9 uses different keys (month_caption, button_previous, etc.).

### 6. Better Auth needs its own tables
Better Auth creates user/session/account/verification tables. These need to be created before auth works. The Drizzle adapter requires them in the schema; the Pool adapter creates them automatically.

### 7. Don't commit secrets, but do commit .env.example
Secrets go in .env.local (gitignored). The template goes in .env.example (committed).

### 8. Supabase RLS blocks anon key from seeing user data
The anon key only sees data allowed by RLS policies. To export user-specific data (profiles, wishlists, cart), use the service role key.

### 9. Port data carefully — check actual formats
The experiences data had image_url as JSON arrays, date as text ("Available daily"), exp_type as arrays, tags as semicolon-separated strings. Schema must match actual data, not what you assume.

### 10. Always update docs after changes
Created .cursor/rules/docs.mdc to remind: update FEATURES.md, CODE_REVIEW.md, DEFERRED.md, ARCHITECTURE.md, IDEAS.md after every change.

---

## Current state of the app

### What works
- Homepage with hero, featured experiences, trending, categories, stats
- All Experiences with search, filters, sort, grouping by exp_type, ImageTrail
- Experience detail with image, booking section, Leaflet map, similar experiences
- Google Sign-In / Sign-Out via Better Auth
- Cart (add, remove, update quantity, checkout with Razorpay)
- Wishlist (toggle, list)
- Save for Later (localStorage)
- Profile (edit, stats, tabs for wishlist/saved/bookings/viewed)
- Gift Personalizer (question wizard — fails at suggestion step due to missing embeddings)
- FAQ, About, Contact, Privacy, Terms, Testimonials, Press
- Location selection (80+ Indian cities, distance calculation)
- Search autocomplete with grouped results
- 26/26 smoke tests passing

### What needs attention next (from IDEAS.md)
1. Send pitch deck to align vision
2. Fix AI Gift Personalizer end-to-end (generate embeddings, debug suggestion route)
3. Review FEATURES.md and make changes
4. Adding more powerful functionality
5. Swipe feature redesign

### Known deferred items (from DEFERRED.md)
- Swipe feature (needs redesign)
- Admin panel
- Newsletter signup
- Friends & social features
- Badges & gamification
- Import contacts
- 5 deferred code review items (DB connection consistency, Razorpay SRI, casing convention, unused tables, search localStorage)

### Credentials configured
- DATABASE_URL: Neon Postgres (Singapore)
- BETTER_AUTH_SECRET + BETTER_AUTH_URL
- GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (GCP project: grounded-atrium-433915-s5)
- GOOGLE_GENERATIVE_AI_API_KEY (Gemini from AI Studio)
- RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (test mode: rzp_test_*)
- SMTP: not configured yet

### DNS
- Domain: slashexperiences.in (Hostinger)
- A record: 76.76.21.21 (Vercel)
- CNAME www: cname.vercel-dns.com
- MX: Zoho Mail (mx.zoho.in)
- All TXT, CAA, DKIM records preserved
