# Ideas & Reminders

Things to revisit and explore for future development.

---

## Immediate Reminders

1. **Send the pitch deck to better align the vision** -- share the deck so the product direction, target audience, and priorities are clear for all future development decisions.

2. **Adding more powerful functionality** -- brainstorm and scope out what "powerful" means for Slash Experiences. Consider: AI-powered recommendations based on browsing history, social features, group gifting, gift cards, experience bundles, partnerships with providers, etc.

3. **Check docs/FEATURES.md and make changes** -- review the feature list for accuracy, update statuses, remove features that are no longer relevant, and add new ones.

4. **Fix AI Gift Personalizer end-to-end** -- currently fails at the suggestion step. Needs: (a) run embedding generation script for all 65 experiences using Gemini text-embedding-004, (b) debug the /api/ai/suggestion route for edge cases, (c) test full flow: init -> questions -> suggestions -> followup. The embeddings column in the experiences table is empty.

---

## Feature Ideas (to explore)

- Redesigned swipe experience (see DEFERRED.md)
- Admin panel for experience management
- Group gifting (multiple people contribute to one experience)
- Gift cards / experience vouchers
- Provider self-service portal
- Real-time availability/booking calendar
- Reviews and ratings from users
- Social sharing with previews
- Push notifications for booking updates
- Mobile app (React Native or PWA)
