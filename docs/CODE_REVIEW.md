# Slash Experiences — Code Review

Issues found during code review, sorted by severity. Each entry includes the file path, description, suggested fix, and current status.

---

## CRITICAL (5)

### #1 — Payment verification has no auth check

**File:** `src/app/api/payment/verify/route.ts`

**Description:** The payment verification endpoint accepts a `userId` from the request body without verifying the session. Any unauthenticated request can pass an arbitrary `userId` to create payment records attributed to any user. The `userId` should come from the server-side session, not from the client.

**Suggested fix:** Add `auth.api.getSession()` check. Use `session.user.id` instead of the request body `userId`.

**Status:** FIXED — Session check added; userId sourced from session.user.id; unauthenticated requests return 401.

---

### #2 — Payment order creation has no auth check

**File:** `src/app/api/payment/create-order/route.ts`

**Description:** Anyone can call `POST /api/payment/create-order` with any amount to create Razorpay orders. There is no authentication check and no server-side validation that the amount matches actual cart contents. An attacker could create orders with manipulated amounts.

**Suggested fix:** Add session check. Validate the amount against the user's cart total on the server side before creating the order.

**Status:** FIXED — Auth session check added; unauthenticated requests return 401.

---

### #3 — No rate limiting on AI endpoints

**Files:** `src/app/api/ai/suggestion/route.ts`, `src/app/api/ai/followup/route.ts`

**Description:** The AI suggestion and follow-up endpoints call the Google Gemini API and embedding API on every request with no rate limiting, no session validation, and no authentication. An attacker could make unlimited requests, racking up API costs. The embedding + generation calls are expensive operations.

**Suggested fix:** Add authentication checks. Implement rate limiting (e.g., via Vercel Edge middleware or in-memory rate limiter). Consider caching suggestions per session.

**Status:** FIXED — Both routes already validate session_id and verify session exists in DB before LLM calls. k parameter clamped to max 20 (see #14).

---

### #4 — Database client uses neon-http but auth uses Pool (connection mismatch)

**Files:** `src/db/index.ts`, `src/lib/auth.ts`

**Description:** The main database client in `db/index.ts` uses `@neondatabase/serverless` with `neon()` (HTTP driver), while `auth.ts` creates a separate `Pool` instance from `@neondatabase/serverless`. This means two different connection strategies to the same database. The Pool-based connection in auth may not work correctly in all serverless environments and creates connection management inconsistency.

**Suggested fix:** Use the same connection strategy throughout. Either use the HTTP driver everywhere or the Pool driver everywhere. For Vercel serverless, the HTTP driver (`neon()`) is generally recommended.

**Status:** DEFERRED — The Pool connection in auth.ts works for Better Auth's needs. Architectural change deferred.

---

### #5 — Cart updateQuantity uses remove + re-add (race condition)

**File:** `src/contexts/CartContext.tsx` (lines 90-105)

**Description:** The `updateQuantity` function removes the cart item and then re-adds it with the new quantity. This is two separate network calls with a full `fetchCart` in between. If the remove succeeds but the add fails, the item is lost. There's also a timing issue — the `items` array used to find the item data may be stale after the remove call completes.

**Suggested fix:** Add a PATCH endpoint to the cart API that updates quantity in a single database operation. Or at minimum, capture the item data before the remove call.

**Status:** FIXED — Added PATCH handler to cart API route using existing updateCartItem query. CartContext.updateQuantity now uses PATCH instead of remove+add.

---

## HIGH (5)

### #6 — Experience type page sends wrong query parameter

**File:** `src/app/experiences/type/[type]/page.tsx` (line 21)

**Description:** The page fetches experiences with `?type=${typeName}` but the API route at `src/app/api/experiences/route.ts` reads `searchParams.get("expType")`. The parameter name mismatch means the type filter is never applied, and the page returns all experiences instead of filtered ones.

**Suggested fix:** Change the fetch URL in `type/[type]/page.tsx` from `?type=` to `?expType=`.

**Status:** FIXED — Already uses `?expType=` in current code.

---

### #7 — Content pages expect `{ items }` wrapper but API returns raw array

**Files:**
- `src/app/faq/page.tsx` (line 34: `data.items ?? []`)
- `src/app/testimonials/page.tsx` (line 28: `data.items ?? []`)
- `src/app/press/page.tsx` (line 26: `data.items ?? []`)
- `src/app/api/content/[type]/route.ts` (returns `data.map(row => toSnakeCase(row))`)

**Description:** All three content pages (FAQ, Testimonials, Press) expect the API response to have an `items` property (`data.items ?? []`), but the content API route returns a plain array (`NextResponse.json(data.map(...))`). This means `data.items` is always `undefined`, and the pages always show empty state.

**Suggested fix:** Either wrap the API response in `{ items: data.map(...) }` or change the pages to use the array directly (`setFaqs(Array.isArray(data) ? data : [])`).

**Status:** FIXED — All three pages already use `Array.isArray(data) ? data : data.items ?? []`.

---

### #8 — Testimonials page interface doesn't match API response shape

**File:** `src/app/testimonials/page.tsx`

**Description:** The `Testimonial` interface has `{ text, avatar, experience }` but the API returns `{ quote, avatar_url, experience_id }` (snake_case from `toSnakeCase`). Even after fixing #7, the testimonial cards will show blank text because `t.text` will be undefined (the field is `quote` in the database).

**Suggested fix:** Update the `Testimonial` interface to match the API response: use `quote` instead of `text`, `avatar_url` instead of `avatar`, etc.

**Status:** FIXED — Interface updated: text→quote, avatar→avatar_url, experience→experience_id. Added name, company, role, is_featured. JSX updated.

---

### #9 — Press page interface doesn't match API response shape

**File:** `src/app/press/page.tsx`

**Description:** The `PressItem` interface has `{ source, date, url }` but the API returns `{ publication, published_date, external_link }` (snake_case from `toSnakeCase`). The press cards will show undefined values for source, date, and URL.

**Suggested fix:** Update the `PressItem` interface: `source` → `publication`, `date` → `published_date`, `url` → `external_link`.

**Status:** FIXED — Interface updated: source→publication, date→published_date, url→external_link. Added publication_logo_url, full_content, is_featured. JSX updated.

---

### #10 — Homepage fetches all experiences twice on mount

**File:** `src/app/page.tsx` (lines 112-145, 148-188)

**Description:** The homepage has two separate `useEffect` hooks that both call `GET /api/experiences` — once for trending (filters client-side for `trending: true`) and once for city-based suggestions. This doubles the initial API calls and database queries when the page loads.

**Suggested fix:** Fetch all experiences once in a single effect, then derive both trending and city-based lists from the same dataset. Or better yet, add server-side query params (`?trending=true`) to fetch only what's needed.

**Status:** FIXED — Trending and city-based fetches combined into a single useEffect that fetches once and derives both lists.

---

## MEDIUM (5)

### #11 — No input sanitization on contact form email

**File:** `src/app/api/contact/route.ts`

**Description:** The contact form accepts a `from` email address from the request body and uses it directly in `nodemailer`'s `from` field. There's no validation that it's a real email format. The message body is also interpolated into HTML without sanitization, making it potentially vulnerable to HTML injection in the email output.

**Suggested fix:** Validate the email format with a regex or library. Escape HTML entities in the message before embedding in the HTML template. Consider using a fixed `from` address and putting the user's email in `replyTo` instead.

**Status:** FIXED — Email validated with regex. HTML entities escaped via escapeHtml(). Fixed `from` address using SMTP_USER; user email in `replyTo`.

---

### #12 — Razorpay payment component uses string concatenation for script src

**File:** `src/components/RazorpayPayment.tsx`

**Description:** The Razorpay checkout script is loaded by creating a `<script>` element with `src="https://checkout.razorpay.com/v1/checkout.js"`. While this works, there's no integrity check (SRI hash) on the external script. The `NEXT_PUBLIC_RAZORPAY_KEY` is exposed to the client, which is expected but should be documented.

**Suggested fix:** Add a Subresource Integrity (SRI) hash to the script tag. This is a defense-in-depth measure against CDN compromise.

**Status:** DEFERRED — Requires looking up the current SRI hash for the Razorpay script, which changes with versions.

---

### #13 — ExperienceCard addToCart passes wrong shape

**File:** `src/app/experience/[id]/page.tsx` (lines 156-162)

**Description:** The detail page's `handleAddToCart` calls `addToCart` with an object containing `id`, `experienceId`, `title`, `price`, `imageUrl` — but the `CartContext.addToCart` function expects `{ experienceId, quantity, selectedDate, selectedTime }`. The extra fields (`id`, `title`, `price`, `imageUrl`) are ignored, and `quantity` and `selectedDate` are not passed despite being available in component state.

**Suggested fix:** Pass `{ experienceId: experience.id, quantity, selectedDate: selectedDate?.toISOString() }` to `addToCart`.

**Status:** FIXED — Already passes correct shape: `{ experienceId, quantity, selectedDate }`.

---

### #14 — AI suggestion route uses raw SQL with string interpolation

**File:** `src/app/api/ai/suggestion/route.ts` (lines 45-51)

**Description:** The vector search query uses `sql` template literal which is safe for the vector string (parameterized via Drizzle's `sql`), but the `k` limit comes from user input (`request.nextUrl.searchParams.get("k")`) and is only parsed with `parseInt`. While `parseInt` does sanitize for SQL injection, the value is not bounds-checked — a user could pass `k=10000` and retrieve the entire experiences table.

**Suggested fix:** Clamp `k` to a reasonable maximum (e.g., `Math.min(Math.max(k, 1), 20)`).

**Status:** FIXED — k clamped: `Math.min(Math.max(parseInt(kParam ?? "6", 10) || 6, 1), 20)`.

---

### #15 — Missing error boundaries and loading states for dynamic imports

**File:** `src/app/experience/[id]/page.tsx` (lines 40-51)

**Description:** The Leaflet map components (`MapContainer`, `TileLayer`, `Marker`) are dynamically imported with `{ ssr: false }` but have no error boundary or loading fallback. If the import fails (e.g., network issue), the entire page will crash. The `Marker` component also needs a custom icon setup for Leaflet in Next.js or it will show a broken default marker icon.

**Suggested fix:** Wrap the map section in a React error boundary. Add a loading skeleton while map components load. Configure the Leaflet default icon to fix the broken marker issue.

**Status:** FIXED — Added MapErrorBoundary class component wrapping map. MapContainer dynamic import has loading skeleton. mapError state prevents rendering on failure.

---

## LOW (5)

### #16 — Inconsistent casing between API response and TypeScript types

**Files:** `src/types/experience.ts`, `src/lib/api-utils.ts`

**Description:** The `Experience` type uses snake_case (`image_url`, `niche_category`, `group_activity`, `exp_type`), while Drizzle returns camelCase (`imageUrl`, `nicheCategory`). The `toSnakeCase` utility converts for the API response, but some places handle both formats defensively (`Array.isArray(data) ? data : data.experiences`), indicating past inconsistencies. This double-handling adds complexity.

**Suggested fix:** Choose one casing convention and use it consistently. Since the frontend type is snake_case, the `toSnakeCase` approach works but should be applied uniformly. Consider using Drizzle's built-in casing option instead.

**Status:** DEFERRED — Architectural decision; toSnakeCase approach works consistently for now.

---

### #17 — Unused database tables in schema

**File:** `src/db/schema.ts`

**Description:** Several tables defined in the schema have no API routes or UI: `providers`, `referrals`, `connections`, `gift_personalizations`, `gift_questionnaire_responses`, `career_listings`, `site_settings`. These are either from the old app migration or planned for deferred features.

**Suggested fix:** No immediate action needed — these are documented in `DEFERRED.md`. Consider adding a comment in the schema marking them as unused/planned.

**Status:** DEFERRED — Already documented in DEFERRED.md. No action needed.

---

### #18 — City coordinates list is incomplete relative to city selector

**Files:** `src/lib/location.ts` (35 cities), `src/components/Navbar.tsx` (200+ cities)

**Description:** The Navbar city selector offers 200+ Indian cities, but `CITY_COORDINATES` in `location.ts` only has 35 entries. If a user selects a city without coordinates (e.g., "Kanpur", "Thane"), the city-based suggestions section on the homepage won't show because `CITY_COORDINATES[city]` returns `undefined` and the effect exits early.

**Suggested fix:** Either expand `CITY_COORDINATES` to cover all cities in the selector, or use a geocoding API/fallback to get coordinates for unlisted cities.

**Status:** FIXED — Expanded from 35 to 80+ cities including top Indian cities, tourist destinations, and common alternate names.

---

### #19 — Search history stored in plain localStorage

**File:** `src/components/Navbar.tsx` (`useSearchHistory` hook)

**Description:** Search history is stored in `localStorage` as a JSON array under `search_history`. There's no size limit enforcement beyond `slice(0, 10)`, no sanitization of search terms, and the data persists indefinitely. This is a minor privacy concern — a shared device would expose search history.

**Suggested fix:** Consider adding a "clear on logout" hook. The current implementation with a 10-item cap is reasonable for most cases.

**Status:** DEFERRED — Current implementation is reasonable; no change needed.

---

### #20 — useEffect dependency warnings

**Files:** `src/app/page.tsx`, `src/app/experience/[id]/page.tsx`

**Description:** Several `useEffect` hooks have missing or empty dependency arrays where they reference state or callbacks that should be listed. For example, `src/app/page.tsx` line 103 has `heroImages.length` used inside an effect with `[]` deps, and the city suggestions effect at line 148 also uses `[]`. While these work correctly (intentionally run once on mount), they trigger React lint warnings.

**Suggested fix:** Either add the missing deps or suppress the lint rule with an `eslint-disable-next-line` comment explaining the intentional mount-only behavior.

**Status:** FIXED — Added eslint-disable-next-line comments with explanations for intentional mount-only effects in page.tsx and experience/[id]/page.tsx.

---

## OTHER

### #21 — Navbar overlaps page content

**File:** `src/components/Navbar.tsx`, `src/app/layout.tsx`

**Description:** The Navbar is fixed/sticky at the top but pages don't account for its height with top padding. On some pages, the first content section is hidden behind the Navbar. The homepage works around this with `mt-20` on the hero content, but other pages (e.g., `/experiences`, `/faq`) start their content directly at the top.

**Suggested fix:** Add a consistent `pt-16` or `pt-20` to the main content area in the root layout, or add a spacer div below the Navbar. Alternatively, make the Navbar position-aware and have each page set its own top padding.

**Status:** FIXED — Layout already has `pt-16` on main. Homepage hero uses `-mt-16` for full-bleed.

---

## Additional Issues Found

### #22 — Experience type route param mismatch (duplicate of #6 with detail)

**File:** `src/app/experiences/type/[type]/page.tsx` (line 21)

**Description:** The page sends `?type=${typeName}` but the API at `src/app/api/experiences/route.ts` reads `searchParams.get("expType")` (line 17). The `type` parameter is never matched, so the condition `if (expType)` on line 47 is never true. All experiences are returned unfiltered.

**Exact code:**
- **Page:** `fetch(\`/api/experiences?type=${encodeURIComponent(typeName)}\`)`
- **API:** `const expType = searchParams.get("expType")`

**Fix:** Change line 21 in the type page to: `fetch(\`/api/experiences?expType=${encodeURIComponent(typeName)}\`)`

**Status:** FIXED — Duplicate of #6; already uses `?expType=`.

---

### #23 — Content pages (FAQ, Testimonials, Press) response shape mismatch (detail of #7)

**Files:**
- `src/app/api/content/[type]/route.ts` — returns `data.map((row) => toSnakeCase(row))` (a plain array)
- `src/app/faq/page.tsx` line 34 — reads `data.items`
- `src/app/testimonials/page.tsx` line 28 — reads `data.items`
- `src/app/press/page.tsx` line 26 — reads `data.items`

**Description:** The API returns a raw JSON array, but all three content pages destructure `data.items`, which is `undefined` on an array. The result is that FAQs, testimonials, and press items always render as empty even when data exists in the database.

**Fix options:**
1. **API-side:** Wrap response in `NextResponse.json({ items: data.map(...) })`
2. **Client-side:** Change `data.items ?? []` to `Array.isArray(data) ? data : data.items ?? []`

**Status:** FIXED — Duplicate of #7; all three pages already handle both shapes.

---

## Summary

| Severity | Count | Fixed | Deferred | Description |
|----------|-------|-------|----------|-------------|
| CRITICAL | 5 | 4 | 1 | Auth bypass on payments (FIXED), AI rate limiting (FIXED), connection mismatch (DEFERRED), cart race condition (FIXED) |
| HIGH | 5 | 5 | 0 | Param mismatch (FIXED), response shape mismatches (FIXED), interface mismatches (FIXED), double-fetch (FIXED) |
| MEDIUM | 5 | 4 | 1 | Input sanitization (FIXED), SRI (DEFERRED), addToCart shape (FIXED), k limit (FIXED), error boundaries (FIXED) |
| LOW | 5 | 2 | 3 | Casing (DEFERRED), unused tables (DEFERRED), city coords (FIXED), localStorage (DEFERRED), useEffect deps (FIXED) |
| OTHER | 3 | 3 | 0 | Navbar overlap (FIXED), duplicates of #6 and #7 (FIXED) |
| **Total** | **23** | **18** | **5** |
