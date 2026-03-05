# Slash Experiences — Feature List

> 28 features across 10 categories. Each entry lists what it does, the files that implement it, the API endpoints it hits, the database tables it touches, and its current status.

---

## Browsing & Discovery

### 1. Homepage

**What it does:** The landing page shows a fullscreen hero section with rotating background images and parallax mouse tracking, animated stat counters (500+ experiences, 50k+ recipients), featured experiences in a grid, city-based suggestions sorted by haversine distance, a "Why Gift an Experience?" comparison section, a "Browse by Category" grid, and a trending-experiences carousel.

**Files:**
- `src/app/page.tsx` — page component, all sections
- `src/components/ExperienceCard.tsx` — card used in grids and carousel
- `src/lib/data/categories.ts` — category list with icons
- `src/lib/location.ts` — city coordinates, haversine distance calculation

**API endpoints:**
- `GET /api/experiences?featured=true` — featured experiences
- `GET /api/experiences` — all experiences (filtered client-side for trending, city)

**Database tables:** `experiences`

**Status:** Live

---

### 2. All Experiences Page

**What it does:** Shows every experience with a search input (debounced 300ms), category filter pills, a sort dropdown (Featured / Price Low-High / Price High-Low / Newest), an advanced filter dialog (price range, location, experience types), and paginated results (9 per page). In default browse mode, experiences are grouped by `exp_type` in color-coded horizontal-scroll rows. An `ImageTrail` component shows a visual ribbon of experience images at the top.

**Files:**
- `src/app/experiences/page.tsx` — page and `ExperiencesContent` component
- `src/components/ExperienceCard.tsx` — card component
- `src/components/ImageTrail.tsx` — image trail animation
- `src/components/FilterDialog.tsx` — advanced filter sheet
- `src/hooks/useSavedExperiences.ts` — save for later (localStorage)

**API endpoints:**
- `GET /api/experiences` — with query params: `search`, `category`, `minPrice`, `maxPrice`, `location`, `expType`, `sort`

**Database tables:** `experiences`

**Status:** Live

---

### 3. Category Page

**What it does:** Displays experiences filtered by a specific category (e.g., Adventure, Dining, Wellness). Accessed via `/category/[id]` route. Shows a grid of experience cards for that category.

**Files:**
- `src/app/category/[id]/page.tsx` — category page
- `src/components/ExperienceCard.tsx`

**API endpoints:**
- `GET /api/experiences?category={category}`

**Database tables:** `experiences`

**Status:** Live

---

### 4. Experience Type Page

**What it does:** Shows experiences filtered by their `exp_type` field (e.g., "Outdoor Adventures", "Romantic Getaways"). Accessed via `/experiences/type/[type]`. Shows a header with the type name and a 3-column grid of matching cards.

**Files:**
- `src/app/experiences/type/[type]/page.tsx` — type page

**API endpoints:**
- `GET /api/experiences?expType={type}`

**Database tables:** `experiences`

**Status:** Live

---

### 5. View History

**What it does:** Tracks which experiences a logged-in user has viewed. When a user visits an experience detail page, the `useTrackExperienceView` hook sends a POST request to record the view. Duplicate views are ignored. The history is displayed in the Profile page under the "Viewed" tab.

**Files:**
- `src/hooks/useTrackExperienceView.ts` — fires POST on mount
- `src/app/api/views/route.ts` — POST handler (records view)
- `src/app/api/views/history/route.ts` — GET handler (returns viewed list)
- `src/app/profile/page.tsx` — displays viewed tab

**API endpoints:**
- `POST /api/views` — body: `{ experienceId }`
- `GET /api/views/history` — returns last 50 viewed experiences with details

**Database tables:** `viewed_experiences`, `experiences` (joined)

**Status:** Live

---

## Authentication

### 6. Google Sign-In

**What it does:** Uses Better Auth with Google OAuth for authentication. Users click "Sign in with Google," get redirected to Google's OAuth consent screen, and are redirected back. Better Auth creates a session with a 7-day expiry (refreshed daily) and sets a cookie. The session is checked in API routes via `auth.api.getSession()`.

**Files:**
- `src/lib/auth.ts` — Better Auth server config (Google provider, Neon pool)
- `src/lib/auth-client.ts` — client-side auth helpers
- `src/contexts/AuthContext.tsx` — React context, exposes `user`, `signIn`, `signOut`
- `src/app/api/auth/[...all]/route.ts` — catch-all auth route handler

**API endpoints:**
- `GET/POST /api/auth/*` — Better Auth handles all sub-routes (callback, session, etc.)

**Database tables:** `user`, `session`, `account` (managed by Better Auth, not in `schema.ts`)

**Status:** Live

---

## Wishlist & Cart

### 7. Wishlist

**What it does:** Authenticated users can like/unlike experiences with a heart icon. The wishlist is stored server-side. A toggle POST creates or removes the entry. The wishlist context provides `isWishlisted()` and `toggleWishlist()` globally. The full list is displayed on the Profile page and at `/wishlist`.

**Files:**
- `src/contexts/WishlistContext.tsx` — context provider, fetches on mount
- `src/app/api/wishlist/route.ts` — GET (list + count), POST (toggle)
- `src/db/queries/wishlist.ts` — `getWishlist`, `toggleWishlist`, `getWishlistCount`
- `src/app/wishlist/page.tsx` — dedicated wishlist page
- `src/app/profile/page.tsx` — wishlist tab

**API endpoints:**
- `GET /api/wishlist` — returns `{ items, count }`
- `POST /api/wishlist` — body: `{ experienceId }`, toggles

**Database tables:** `wishlists`, `experiences` (joined)

**Status:** Live

---

### 8. Cart

**What it does:** Authenticated users can add experiences to a cart with a selected date and quantity. The cart context manages local state and syncs with the server. Items can be removed individually, updated in-place via PATCH, or cleared entirely.

**Files:**
- `src/contexts/CartContext.tsx` — context provider, uses PATCH for quantity updates
- `src/app/api/cart/route.ts` — GET (list), POST (add), PATCH (update quantity), DELETE (remove/clear)
- `src/db/queries/cart.ts` — `getCart`, `addToCart`, `updateCartItem`, `removeFromCart`, `clearCart`
- `src/components/Navbar.tsx` — cart icon with count badge

**API endpoints:**
- `GET /api/cart` — returns cart items
- `POST /api/cart` — body: `{ experienceId, quantity, selectedDate, selectedTime }`
- `PATCH /api/cart` — body: `{ id, quantity }` (update quantity in-place)
- `DELETE /api/cart` — body: `{ id }` or `?clear=true`

**Database tables:** `cart_items`, `experiences` (joined)

**Status:** Live

---

### 8b. Cart Page

**What it does:** A dedicated `/cart` page showing all cart items with full UI. Each item displays the experience image, title, price, selected date, and quantity controls (increment/decrement buttons). Users can remove individual items or clear the entire cart. The page shows a price breakdown with subtotal and total, and integrates the `RazorpayPayment` component for checkout. Unauthenticated users are redirected to sign in.

**Files:**
- `src/app/cart/page.tsx` — cart page with quantity controls and Razorpay checkout
- `src/contexts/CartContext.tsx` — provides `items`, `updateQuantity`, `removeFromCart`, `clearCart`
- `src/components/RazorpayPayment.tsx` — checkout component

**API endpoints:**
- `GET /api/cart` — fetch cart items
- `PATCH /api/cart` — update item quantity
- `DELETE /api/cart` — remove item or clear cart
- `POST /api/payment/create-order` — create Razorpay order at checkout

**Database tables:** `cart_items`, `experiences` (joined)

**Status:** Live

---

### 9. Save for Later

**What it does:** A localStorage-based bookmarking system that works without authentication. Users click "Save for Later" (bookmark icon) on an experience detail page. Saved IDs are stored in `localStorage` under the key `savedExperiences`. Cross-tab sync is handled via `storage` events and a custom `savedExperiencesChanged` event.

**Files:**
- `src/hooks/useSavedExperiences.ts` — hook with `isSaved`, `toggleSaved`
- `src/app/experience/[id]/page.tsx` — bookmark button
- `src/app/experiences/page.tsx` — uses the hook
- `src/app/profile/page.tsx` — saved tab

**API endpoints:** None (client-side only)

**Database tables:** None (localStorage)

**Status:** Live

---

## AI Gift Personalizer

### 10. Gift Personalizer Wizard

**What it does:** A multi-step questionnaire that helps users find the perfect gift experience. The flow is: (1) init a session, (2) answer 5 questions (recipient, occasion, budget, interests, personality) one at a time with animated transitions, (3) submit answers, (4) get AI-generated suggestions. The suggestion endpoint embeds the user's answers into a 768-dim vector using Google's `text-embedding-004` model, runs a pgvector cosine-distance search to find the nearest experiences, then asks Gemini `gemini-1.5-flash` to write a friendly recommendation. Users can ask follow-up questions using the same session context.

**Files:**
- `src/app/gift-personalizer/page.tsx` — wizard UI (phases: loading → questions → generating → results)
- `src/lib/ai-personalizer.ts` — client helper functions
- `src/lib/ai-questions.ts` — 5 questions with options
- `src/app/api/ai/init/route.ts` — creates session, returns first question
- `src/app/api/ai/next/route.ts` — returns next question
- `src/app/api/ai/submit/route.ts` — saves answer
- `src/app/api/ai/back/route.ts` — go back one step
- `src/app/api/ai/suggestion/route.ts` — embedding + vector search + Gemini generation
- `src/app/api/ai/followup/route.ts` — follow-up with existing context
- `src/app/api/ai/reset/route.ts` — reset session
- `src/db/queries/ai-sessions.ts` — CRUD for `ai_sessions`

**API endpoints:**
- `GET /api/ai/init` — creates session
- `POST /api/ai/next` — next question
- `POST /api/ai/submit` — submit answer
- `POST /api/ai/back` — go back
- `GET /api/ai/suggestion?sessionId=&k=` — get recommendations
- `POST /api/ai/followup` — follow-up question
- `POST /api/ai/reset` — reset

**Database tables:** `ai_sessions`, `experiences` (vector search)

**Status:** Live

---

### 11. AI Suggestions (Browsing-Based)

**What it does:** Placeholder page for future AI-powered recommendations based on browsing history and user preferences. Currently shows a static page explaining the concept.

**Files:**
- `src/app/ai-suggestions/page.tsx`

**API endpoints:** None yet

**Database tables:** None yet

**Status:** Placeholder

---

## Experience Detail

### 12. Experience Detail Page

**What it does:** Full detail view for a single experience. Shows an image carousel with prev/next navigation and dot indicators, title, category badge, like/save buttons, meta info (location, duration, participants, date), description, a booking section with date picker and quantity selector, a Leaflet/OpenStreetMap map (if lat/lng exist), and a "Similar Experiences" section (same category, excludes current). View tracking fires on mount for logged-in users.

**Files:**
- `src/app/experience/[id]/page.tsx` — full page component
- `src/app/api/experiences/[id]/route.ts` — GET single experience
- `src/components/ExperienceCard.tsx` — used for similar experiences
- `src/hooks/useTrackExperienceView.ts` — view tracking

**API endpoints:**
- `GET /api/experiences/{id}` — single experience
- `GET /api/experiences?category={category}` — similar experiences
- `POST /api/views` — track view

**Database tables:** `experiences`, `viewed_experiences`

**Status:** Live

---

## Profile & Account

### 13. User Profile

**What it does:** Authenticated users can view and edit their profile (full name, avatar URL, phone, address, bio). The page shows profile stats and has tabs for Wishlist, Saved (localStorage), Bookings, and Viewed experiences.

**Files:**
- `src/app/profile/page.tsx` — profile page with tabs
- `src/app/api/profile/route.ts` — GET (fetch), PUT (update)
- `src/db/queries/profiles.ts` — `getProfile`, `updateProfile`

**API endpoints:**
- `GET /api/profile` — current user's profile
- `PUT /api/profile` — body: `{ fullName, avatarUrl, phone, address, bio }`

**Database tables:** `profiles`

**Status:** Live

---

### 14. Bookings

**What it does:** Displays a user's order history. Bookings are created after successful payment verification. Each booking has items, a total amount, status, and payment method. Shown in the Profile page "Bookings" tab.

**Files:**
- `src/app/api/bookings/route.ts` — GET (list), POST (create)
- `src/db/queries/bookings.ts` — `getBookingsByUser`, `createBooking`
- `src/app/profile/page.tsx` — bookings tab

**API endpoints:**
- `GET /api/bookings` — user's bookings with items
- `POST /api/bookings` — body: `{ totalAmount, paymentMethod, notes, items }`

**Database tables:** `bookings`, `booking_items`, `experiences` (joined)

**Status:** Live

---

## Payments

### 15. Razorpay Order Creation

**What it does:** Creates a Razorpay order on the server side. Takes an amount and optional currency, multiplies amount by 100 (Razorpay expects paise), and returns the order object with an order ID for the client-side checkout.

**Files:**
- `src/app/api/payment/create-order/route.ts` — POST handler
- `src/lib/payment.ts` — `createOrder` client helper

**API endpoints:**
- `POST /api/payment/create-order` — body: `{ amount, currency }`

**Database tables:** None (Razorpay API only)

**Status:** Live

---

### 16. Razorpay Payment Verification

**What it does:** Verifies a completed Razorpay payment by checking the HMAC-SHA256 signature. If valid, creates a payment record in the database and updates its status to "paid". This is the server-side callback after the client-side checkout completes.

**Files:**
- `src/app/api/payment/verify/route.ts` — POST handler
- `src/db/queries/payments.ts` — `createPayment`, `updatePaymentStatus`
- `src/lib/payment.ts` — `verifyPayment` client helper

**API endpoints:**
- `POST /api/payment/verify` — body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, bookingData }`

**Database tables:** `payments`

**Status:** Live

---

### 17. Razorpay Checkout Component

**What it does:** Client-side component that loads the Razorpay checkout.js script, opens the payment modal with the order details, and handles the success/failure callbacks. Prefills user name and email from auth context.

**Files:**
- `src/components/RazorpayPayment.tsx` — checkout component
- `src/lib/payment.ts` — `createOrder`, `verifyPayment` helpers

**API endpoints:** Uses endpoints from #15 and #16

**Database tables:** None directly (delegates to payment APIs)

**Status:** Live

---

## Content Pages

### 18. FAQ

**What it does:** Fetches FAQs from the database via the content API, displays them in searchable accordion groups. Users can search by question or answer text. FAQs are grouped by category. Includes a "Still Have Questions?" section linking to `/contact`.

**Files:**
- `src/app/faq/page.tsx` — FAQ page
- `src/app/api/content/[type]/route.ts` — handles `type=faqs`
- `src/db/queries/content.ts` — `getFAQs`

**API endpoints:**
- `GET /api/content/faqs` — returns FAQ array

**Database tables:** `faqs`

**Status:** Live

---

### 19. Testimonials

**What it does:** Shows customer testimonials fetched from the database. Displays name, quote, avatar, company/role, and star rating. Featured testimonials can be highlighted.

**Files:**
- `src/app/testimonials/page.tsx` — testimonials page
- `src/app/api/content/[type]/route.ts` — handles `type=testimonials`
- `src/db/queries/content.ts` — `getTestimonials`

**API endpoints:**
- `GET /api/content/testimonials` — returns testimonial array

**Database tables:** `testimonials`

**Status:** Live

---

### 20. Press

**What it does:** Displays press releases and media mentions. Shows title, excerpt, publication name, published date, and external links. Featured releases can be highlighted.

**Files:**
- `src/app/press/page.tsx` — press page
- `src/app/api/content/[type]/route.ts` — handles `type=press`
- `src/db/queries/content.ts` — `getPressReleases`

**API endpoints:**
- `GET /api/content/press` — returns press release array

**Database tables:** `press_releases`

**Status:** Live

---

### 21. About Us

**What it does:** Static/dynamic about page for the company. Can pull content from the `company_pages` table if configured, otherwise renders static content.

**Files:**
- `src/app/about-us/page.tsx` — about page
- `src/app/api/content/[type]/route.ts` — handles `type=company/about`

**API endpoints:**
- `GET /api/content/company/about` (optional)

**Database tables:** `company_pages`

**Status:** Live

---

### 22. Contact Form

**What it does:** A contact form that sends an email via SMTP using nodemailer. Accepts name, email, subject, and message. Sends to `CONTACT_EMAIL` or falls back to `SMTP_USER`. The email includes both plain text and HTML versions.

**Files:**
- `src/app/contact/page.tsx` — form UI
- `src/app/api/contact/route.ts` — POST handler (nodemailer)

**API endpoints:**
- `POST /api/contact` — body: `{ name, email, subject, message }`

**Database tables:** None (sends email only)

**Status:** Live

---

### 23. Terms & Privacy

**What it does:** Static legal pages for Terms of Service and Privacy Policy.

**Files:**
- `src/app/terms/page.tsx` — terms page
- `src/app/privacy/page.tsx` — privacy page

**API endpoints:** None (static content)

**Database tables:** None

**Status:** Live

---

## Location

### 24. City Selection

**What it does:** A city selector in the Navbar that lets users pick from 200+ Indian cities (with 8 popular cities shown by default). The selected city is persisted in `localStorage` under `selected_city`. The homepage uses it to show nearby experiences sorted by haversine distance. The Navbar shows the selected city name with a MapPin icon.

**Files:**
- `src/components/Navbar.tsx` — `LocationDropdownContent` component, city list (~200 cities)
- `src/lib/location.ts` — `CITY_COORDINATES` (80+ cities with lat/lng), `calculateHaversineDistance`, `getSelectedCity`, `setSelectedCity`
- `src/app/page.tsx` — city-based suggestions section

**API endpoints:** None (client-side localStorage + distance calculation)

**Database tables:** None

**Status:** Live

---

### 25. Experience Map

**What it does:** Shows the experience location on an interactive Leaflet map with OpenStreetMap tiles. Only renders when the experience has valid latitude and longitude coordinates. Displayed on the experience detail page.

**Files:**
- `src/app/experience/[id]/page.tsx` — dynamic imports for `MapContainer`, `TileLayer`, `Marker`

**API endpoints:** None (uses experience data from detail API)

**Database tables:** `experiences` (latitude, longitude fields)

**Status:** Live

---

## Search

### 26. Global Search (Navbar)

**What it does:** A search overlay that opens from the Navbar search icon. Features autocomplete suggestions from experience titles, keyboard navigation (arrow keys + enter), recent search history (localStorage-backed, max 10 items), and the ability to clear history. Submitting navigates to `/experiences?search={query}`.

**Files:**
- `src/components/Navbar.tsx` — search overlay, `useSearchHistory` hook, autocomplete logic

**API endpoints:**
- `GET /api/experiences?search={query}` — autocomplete results

**Database tables:** `experiences`

**Status:** Live

---

### 27. In-Page Search

**What it does:** A search input on the All Experiences page with 300ms debounce. Typing filters experiences by title, description, or location via the API's `search` parameter. The search query is reflected in the URL search params.

**Files:**
- `src/app/experiences/page.tsx` — search input and debounce logic
- `src/db/queries/experiences.ts` — `searchExperiences` function

**API endpoints:**
- `GET /api/experiences?search={query}`

**Database tables:** `experiences`

**Status:** Live
