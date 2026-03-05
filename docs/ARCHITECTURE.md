# Slash Experiences — Architecture Guide

A plain-English guide to how the app works, how to run it, and how to deploy it.

---

## Tech Stack

| Layer | Technology | What it does |
|-------|-----------|-------------|
| Framework | **Next.js 16 App Router** | React framework with server-side rendering, API routes, and file-based routing |
| Database | **Neon Postgres** | Serverless Postgres, free tier, Singapore region (`ap-southeast-1`) |
| ORM | **Drizzle ORM** | Type-safe database queries, schema defined as TypeScript code |
| Auth | **Better Auth** | Authentication library with Google OAuth, session management, cookie-based |
| AI | **Vercel AI SDK + Google Gemini** | LLM text generation (`gemini-1.5-flash`) and text embeddings (`text-embedding-004`) |
| Vector Search | **pgvector** | Postgres extension for vector similarity search (cosine distance) |
| Styling | **Tailwind CSS + shadcn/ui** | Utility-first CSS framework + 45+ pre-built accessible components |
| Payments | **Razorpay** | Indian payment gateway, server-side order creation + client-side checkout modal |
| Email | **Nodemailer** | SMTP-based email for the contact form |
| Maps | **Leaflet + OpenStreetMap** | Interactive maps on experience detail pages (dynamically imported, no API key needed) |
| Hosting | **Vercel** | Auto-deploy from GitHub, edge network, serverless functions |

---

## How Data Flows

```
Browser
  → Next.js Page (React component)
    → fetch('/api/...')
      → API Route (server-side, runs in Node.js)
        → Drizzle Query (type-safe SQL builder)
          → Neon Postgres (serverless connection pool)
            → Response (JSON)
              → Page renders updated state
```

Every API route lives under `src/app/api/`. Pages are client components (`"use client"`) that fetch data via `useEffect` + `fetch`. There are no React Server Components fetching data directly — all data flows through the API layer.

---

## How Auth Works

1. User clicks "Sign in with Google" (in the Navbar dropdown)
2. Better Auth redirects the browser to Google's OAuth consent screen
3. Google authenticates the user and redirects back to `/api/auth/callback/google`
4. Better Auth creates a session (7-day expiry, refreshed every 24 hours), writes to the `session` table, and sets an HTTP-only cookie
5. Subsequent requests include the session cookie automatically
6. API routes check the session via `auth.api.getSession({ headers: await headers() })`
7. If the session is missing or expired, the API returns `{ error: "Unauthorized" }` with status 401
8. The `AuthContext` provider on the client side exposes `user`, `signIn()`, and `signOut()`

Better Auth manages its own tables (`user`, `session`, `account`) — these are not defined in `src/db/schema.ts`.

---

## How AI Gift Personalizer Works

1. User visits `/gift-personalizer`, which calls `GET /api/ai/init`
2. The init route creates a row in `ai_sessions` with a random UUID as `session_id` and returns the first question
3. There are 5 questions defined in `src/lib/ai-questions.ts`:
   - **Recipient** — who is the experience for? (Partner, Friend, Parent, etc.)
   - **Occasion** — what's the occasion? (Birthday, Anniversary, etc.)
   - **Budget** — what's the budget range? (Under ₹1,000 through ₹10,000+)
   - **Interests** — what are they interested in? (Adventure, Food, Wellness, etc.)
   - **Personality** — how would you describe them? (Adventurous, Relaxed, Creative, etc.)
4. User answers each question one at a time. Each answer is stored in the session's `answers` JSON column via `POST /api/ai/submit`
5. After all questions, the client calls `GET /api/ai/suggestion?sessionId=...&k=6`
6. The suggestion route:
   - Builds a query text from the answers (e.g., "Adventurous experience for a Partner for Birthday budget ₹3,000-₹5,000 interested in Adventure")
   - Embeds the query text into a 768-dimensional vector using Google's `text-embedding-004` model
   - Runs a pgvector cosine-distance search (`ORDER BY embedding <=> vector`) to find the `k` nearest experiences
   - Sends the top matches to Gemini `gemini-1.5-flash` to generate a warm, personalized recommendation paragraph
7. The results (experience cards + AI text) are shown to the user
8. Users can ask follow-up questions via `POST /api/ai/followup`, which uses the same session context

---

## How Payments Work

1. User adds experiences to cart with date and quantity
2. User clicks "Pay" → `RazorpayPayment` component calls `POST /api/payment/create-order` with the total amount
3. Server creates a Razorpay order (amount × 100 for paise conversion) and returns the `order_id`
4. Client opens the Razorpay checkout modal (loaded via `checkout.js` script tag)
5. User completes payment in the modal
6. On success, client sends `POST /api/payment/verify` with `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`
7. Server verifies the HMAC-SHA256 signature against `RAZORPAY_KEY_SECRET`
8. If valid, creates a `payments` record and updates status to "paid"
9. Client creates a booking via `POST /api/bookings`

---

## File Structure

```
slash-experiences/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Homepage
│   │   ├── layout.tsx                # Root layout (providers, Navbar, Footer)
│   │   ├── not-found.tsx             # 404 page
│   │   ├── experiences/
│   │   │   ├── page.tsx              # All Experiences (search, filter, paginate)
│   │   │   └── type/[type]/page.tsx  # Experiences by type
│   │   ├── experience/[id]/page.tsx  # Experience detail
│   │   ├── category/[id]/page.tsx    # Category page
│   │   ├── gift-personalizer/page.tsx # AI Gift Personalizer wizard
│   │   ├── ai-suggestions/page.tsx   # AI Suggestions placeholder
│   │   ├── profile/page.tsx          # User profile + tabs
│   │   ├── wishlist/page.tsx         # Wishlist page
│   │   ├── contact/page.tsx          # Contact form
│   │   ├── faq/page.tsx              # FAQ page
│   │   ├── testimonials/page.tsx     # Testimonials
│   │   ├── press/page.tsx            # Press releases
│   │   ├── about-us/page.tsx         # About Us
│   │   ├── terms/page.tsx            # Terms of Service
│   │   ├── privacy/page.tsx          # Privacy Policy
│   │   ├── swipe/page.tsx            # Swipe feature (deferred)
│   │   ├── travel-demo/page.tsx      # Travel demo
│   │   └── api/
│   │       ├── auth/[...all]/route.ts     # Better Auth catch-all
│   │       ├── experiences/route.ts        # GET experiences (list, search, filter)
│   │       ├── experiences/[id]/route.ts   # GET single experience
│   │       ├── wishlist/route.ts           # GET/POST wishlist
│   │       ├── cart/route.ts               # GET/POST/DELETE cart
│   │       ├── bookings/route.ts           # GET/POST bookings
│   │       ├── profile/route.ts            # GET/PUT profile
│   │       ├── views/route.ts              # POST track view
│   │       ├── views/history/route.ts      # GET view history
│   │       ├── payment/
│   │       │   ├── create-order/route.ts   # POST create Razorpay order
│   │       │   └── verify/route.ts         # POST verify payment
│   │       ├── contact/route.ts            # POST send email
│   │       ├── content/[type]/route.ts     # GET FAQs, testimonials, press, pages
│   │       ├── swipe/start/route.ts        # POST swipe recommendations (deferred)
│   │       └── ai/
│   │           ├── init/route.ts           # GET init AI session
│   │           ├── next/route.ts           # POST next question
│   │           ├── submit/route.ts         # POST submit answer
│   │           ├── back/route.ts           # POST go back
│   │           ├── suggestion/route.ts     # GET AI suggestions
│   │           ├── followup/route.ts       # POST follow-up
│   │           └── reset/route.ts          # POST reset session
│   │
│   ├── components/                   # React components
│   │   ├── Navbar.tsx                # Navigation, search overlay, city selector, auth menu
│   │   ├── Footer.tsx                # Site footer
│   │   ├── ExperienceCard.tsx        # Reusable experience card
│   │   ├── ImageTrail.tsx            # Animated image ribbon
│   │   ├── FilterDialog.tsx          # Advanced filter sheet
│   │   ├── RazorpayPayment.tsx       # Razorpay checkout component
│   │   └── ui/                       # shadcn/ui primitives (45+ components)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── accordion.tsx
│   │       ├── ... (and ~40 more)
│   │
│   ├── contexts/                     # React context providers
│   │   ├── AuthContext.tsx           # Auth state (user, signIn, signOut)
│   │   ├── CartContext.tsx           # Cart state (items, addToCart, removeFromCart)
│   │   └── WishlistContext.tsx       # Wishlist state (items, toggleWishlist, isWishlisted)
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useSavedExperiences.ts    # localStorage bookmarks
│   │   ├── useTrackExperienceView.ts # Track experience views
│   │   ├── use-in-view.ts           # Intersection Observer for scroll animations
│   │   ├── use-toast.ts             # Toast notifications
│   │   └── use-mobile.tsx           # Mobile detection
│   │
│   ├── db/                           # Database layer
│   │   ├── schema.ts                # Drizzle schema (all tables)
│   │   ├── index.ts                 # Database client (Neon connection)
│   │   └── queries/                  # Query functions
│   │       ├── experiences.ts        # searchExperiences
│   │       ├── wishlist.ts           # getWishlist, toggleWishlist, getWishlistCount
│   │       ├── cart.ts               # getCart, addToCart, removeFromCart, clearCart
│   │       ├── bookings.ts           # getBookingsByUser, createBooking
│   │       ├── payments.ts           # createPayment, updatePaymentStatus
│   │       ├── profiles.ts           # getProfile, updateProfile
│   │       ├── ai-sessions.ts        # createSession, getSession, updateSession
│   │       └── content.ts            # getFAQs, getTestimonials, getPressReleases, getCompanyPage, getSupportPage
│   │
│   ├── lib/                          # Utilities
│   │   ├── auth.ts                  # Better Auth server config
│   │   ├── auth-client.ts           # Better Auth client helpers
│   │   ├── payment.ts              # Razorpay client helpers (createOrder, verifyPayment)
│   │   ├── location.ts             # City coordinates, haversine distance, city storage
│   │   ├── ai-personalizer.ts       # AI session client helpers
│   │   ├── ai-questions.ts          # 5 AI questionnaire definitions
│   │   ├── api-utils.ts             # toSnakeCase, mapExperiences
│   │   ├── utils.ts                 # cn() classname merger
│   │   └── data/
│   │       └── categories.ts        # Category list with Lucide icons
│   │
│   └── types/
│       └── experience.ts            # Experience TypeScript type
│
├── scripts/                          # Data import/export
│   └── import-data.mjs              # Import experiences from CSV/JSON
│
├── public/                           # Static assets (images, favicon, etc.)
├── docs/                             # This documentation
│   ├── FEATURES.md                   # Complete feature list (27 features)
│   ├── ARCHITECTURE.md               # This file
│   └── CODE_REVIEW.md                # Code review issues
│
├── .env.example                      # Environment variable template
├── drizzle.config.ts                 # Drizzle ORM config
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind CSS config
├── tsconfig.json                     # TypeScript config
├── package.json                      # Dependencies
└── DEFERRED.md                       # Deferred features (swipe, admin, social, etc.)
```

---

## Database Tables

### Core
| Table | Purpose |
|-------|---------|
| `providers` | Experience providers (companies) |
| `experiences` | All experiences with details, coordinates, and 768-dim embeddings |

### User
| Table | Purpose |
|-------|---------|
| `user` | User accounts (managed by Better Auth) |
| `session` | Auth sessions (managed by Better Auth) |
| `account` | OAuth accounts (managed by Better Auth) |
| `profiles` | Extended user profiles (name, avatar, phone, bio) |
| `viewed_experiences` | Track which experiences a user has viewed |
| `referrals` | User referral tracking |
| `connections` | User-to-user connections (deferred feature) |

### Commerce
| Table | Purpose |
|-------|---------|
| `cart_items` | Shopping cart items (experience + date + quantity) |
| `wishlists` | Liked/wishlisted experiences |
| `bookings` | Completed orders |
| `booking_items` | Line items within a booking |
| `payments` | Razorpay payment records |

### AI
| Table | Purpose |
|-------|---------|
| `ai_sessions` | Gift personalizer sessions (step, answers, suggestions) |
| `gift_personalizations` | Gift customization details |
| `gift_questionnaire_responses` | Legacy questionnaire responses |

### Content
| Table | Purpose |
|-------|---------|
| `faqs` | Frequently asked questions |
| `testimonials` | Customer testimonials |
| `press_releases` | Press/media mentions |
| `company_pages` | Dynamic company pages (about, etc.) |
| `support_pages` | Dynamic support pages |
| `career_listings` | Job postings |
| `site_settings` | Key-value site configuration |

---

## Environment Variables

Create a `.env.local` file from `.env.example` with these values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string (starts with `postgresql://`) |
| `BETTER_AUTH_SECRET` | Random secret for signing auth tokens/cookies |
| `BETTER_AUTH_URL` | App URL (e.g., `http://localhost:3000` or `https://slashexperiences.in`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (from Google Cloud Console) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key (for Gemini + embeddings) |
| `RAZORPAY_KEY_ID` | Razorpay key ID (from Razorpay Dashboard) |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret (server-side only) |
| `NEXT_PUBLIC_RAZORPAY_KEY` | Razorpay key ID exposed to client (same as `RAZORPAY_KEY_ID`) |
| `SMTP_HOST` | SMTP server host (e.g., `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (e.g., `587`) |
| `SMTP_USER` | SMTP username/email |
| `SMTP_PASS` | SMTP password or app-specific password |

---

## How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Fill in all values (see Environment Variables section above)

# 3. Run the dev server
npm run dev

# App will be available at http://localhost:3000
```

### Database Setup

The database schema is managed by Drizzle ORM. To push the schema to a fresh Neon database:

```bash
npx drizzle-kit push
```

To import experience data:

```bash
node scripts/import-data.mjs
```

---

## How to Deploy

1. **Push to GitHub** — the repository should be connected to Vercel
2. **Vercel auto-deploys** — every push to `main` triggers a production deploy
3. **Environment variables** — set all env vars in the Vercel project settings (Settings → Environment Variables)
4. **Domain** — `slashexperiences.in` (Hostinger DNS → Vercel nameservers or A/CNAME records)

### Vercel Configuration

- Framework preset: Next.js (auto-detected)
- Build command: `next build` (default)
- Output directory: `.next` (default)
- Node.js version: 18.x or 20.x
- Region: auto (functions execute near user, database is in Singapore)
