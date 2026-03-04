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
