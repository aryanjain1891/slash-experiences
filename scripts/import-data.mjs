import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data-export");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

function load(file) {
  try {
    const data = JSON.parse(readFileSync(join(DATA_DIR, file), "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const TEST_USER_IDS = new Set();
const TEST_EMAILS = ["admin@slash.com", "ajexperiment.1891@gmail.com", "anyan15082024@gmail.com"];

async function run() {
  console.log("Starting import...\n");

  // Map test users
  const users = load("auth_users.json");
  for (const u of users) {
    if (TEST_EMAILS.includes(u.email)) {
      TEST_USER_IDS.add(u.id);
    }
  }
  console.log(`Identified ${TEST_USER_IDS.size} test accounts to skip`);

  // 1. Experiences (no user dependency)
  const experiences = load("experiences.json");
  console.log(`\nImporting ${experiences.length} experiences...`);
  let expCount = 0;
  for (const e of experiences) {
    try {
      await sql.query(
        `INSERT INTO experiences (id, title, description, image_url, price, location, latitude, longitude, duration, participants, date, category, niche_category, trending, featured, romantic, adventurous, group_activity, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         ON CONFLICT (id) DO NOTHING`,
        [e.id, e.title, e.description, e.image_url, e.price, e.location,
         e.latitude, e.longitude, e.duration, e.participants, e.date,
         e.category, e.niche_category, e.trending ?? false, e.featured ?? false,
         e.romantic ?? false, e.adventurous ?? false, e.group_activity ?? false,
         e.created_at, e.updated_at]
      );
      expCount++;
    } catch (err) {
      console.error(`  Failed: ${e.title}: ${err.message}`);
    }
  }
  console.log(`  ✓ ${expCount} experiences imported`);

  // 2. FAQs
  const faqs = load("faqs.json");
  console.log(`\nImporting ${faqs.length} FAQs...`);
  for (const f of faqs) {
    await sql.query(
      `INSERT INTO faqs (id, question, answer, category, display_order, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
      [f.id, f.question, f.answer, f.category, f.display_order, f.created_at, f.updated_at]
    );
  }
  console.log(`  ✓ ${faqs.length} FAQs imported`);

  // 3. Company pages
  const pages = load("company_pages.json");
  console.log(`\nImporting ${pages.length} company pages...`);
  for (const p of pages) {
    await sql.query(
      `INSERT INTO company_pages (id, page_name, title, content, meta_description, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
      [p.id, p.page_name, p.title, JSON.stringify(p.content), p.meta_description, p.created_at, p.updated_at]
    );
  }
  console.log(`  ✓ ${pages.length} company pages imported`);

  // 4. Profiles (skip test users)
  const profiles = load("profiles.json");
  const cleanProfiles = profiles.filter(p => !TEST_USER_IDS.has(p.id));
  console.log(`\nImporting ${cleanProfiles.length} profiles (skipped ${profiles.length - cleanProfiles.length} test)...`);
  for (const p of cleanProfiles) {
    await sql.query(
      `INSERT INTO profiles (id, full_name, avatar_url, phone, address, bio, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
      [p.id, p.full_name, p.avatar_url, p.phone, p.address, p.bio, p.updated_at]
    );
  }
  console.log(`  ✓ ${cleanProfiles.length} profiles imported`);

  // 5. Bookings (skip test users)
  const bookings = load("bookings.json");
  const cleanBookings = bookings.filter(b => !TEST_USER_IDS.has(b.user_id));
  console.log(`\nImporting ${cleanBookings.length} bookings (skipped ${bookings.length - cleanBookings.length} test)...`);
  for (const b of cleanBookings) {
    await sql.query(
      `INSERT INTO bookings (id, user_id, total_amount, status, payment_method, notes, booking_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
      [b.id, b.user_id, b.total_amount, b.status, b.payment_method, b.notes, b.booking_date]
    );
  }
  console.log(`  ✓ ${cleanBookings.length} bookings imported`);

  // 6. Booking items
  const bookingItems = load("booking_items.json");
  const validBookingIds = new Set(cleanBookings.map(b => b.id));
  const cleanItems = bookingItems.filter(i => validBookingIds.has(i.booking_id));
  console.log(`\nImporting ${cleanItems.length} booking items...`);
  for (const i of cleanItems) {
    await sql.query(
      `INSERT INTO booking_items (id, booking_id, experience_id, quantity, price_at_booking)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
      [i.id, i.booking_id, i.experience_id, i.quantity, i.price_at_booking]
    );
  }
  console.log(`  ✓ ${cleanItems.length} booking items imported`);

  // 7. Wishlists (skip test users)
  const wishlists = load("wishlists.json");
  const cleanWishlists = wishlists.filter(w => !TEST_USER_IDS.has(w.user_id));
  console.log(`\nImporting ${cleanWishlists.length} wishlist items (skipped ${wishlists.length - cleanWishlists.length} test)...`);
  for (const w of cleanWishlists) {
    await sql.query(
      `INSERT INTO wishlists (id, user_id, experience_id, added_at)
       VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
      [w.id, w.user_id, w.experience_id, w.added_at]
    );
  }
  console.log(`  ✓ ${cleanWishlists.length} wishlists imported`);

  // 8. Cart items (skip test users)
  const cart = load("cart_items.json");
  const cleanCart = cart.filter(c => !TEST_USER_IDS.has(c.user_id));
  console.log(`\nImporting ${cleanCart.length} cart items...`);
  for (const c of cleanCart) {
    await sql.query(
      `INSERT INTO cart_items (id, user_id, experience_id, quantity, selected_date, selected_time, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
      [c.id, c.user_id, c.experience_id, c.quantity, c.selected_date, c.selected_time, c.created_at, c.updated_at]
    );
  }
  console.log(`  ✓ ${cleanCart.length} cart items imported`);

  // 9. Viewed experiences (skip test users)
  const views = load("viewed_experiences.json");
  const cleanViews = views.filter(v => !TEST_USER_IDS.has(v.user_id));
  console.log(`\nImporting ${cleanViews.length} viewed experiences (skipped ${views.length - cleanViews.length} test)...`);
  for (const v of cleanViews) {
    await sql.query(
      `INSERT INTO viewed_experiences (id, user_id, experience_id, viewed_at)
       VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
      [v.id, v.user_id, v.experience_id, v.viewed_at]
    );
  }
  console.log(`  ✓ ${cleanViews.length} viewed experiences imported`);

  // 10. Referrals (skip test users)
  const referrals = load("referrals.json");
  const cleanRefs = referrals.filter(r => !TEST_USER_IDS.has(r.user_id) && !TEST_USER_IDS.has(r.referred_user_id));
  console.log(`\nImporting ${cleanRefs.length} referrals...`);
  for (const r of cleanRefs) {
    await sql.query(
      `INSERT INTO referrals (id, user_id, referred_user_id, created_at)
       VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
      [r.id, r.user_id, r.referred_user_id, r.created_at]
    );
  }
  console.log(`  ✓ ${cleanRefs.length} referrals imported`);

  // 11. Connections
  const connections = load("connections.json");
  const cleanConns = connections.filter(c => !TEST_USER_IDS.has(c.user_id));
  console.log(`\nImporting ${cleanConns.length} connections...`);
  for (const c of cleanConns) {
    await sql.query(
      `INSERT INTO connections (id, user_id, connected_user_id, created_at)
       VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
      [c.id, c.user_id, c.connected_user_id, c.created_at]
    );
  }
  console.log(`  ✓ ${cleanConns.length} connections imported`);

  // 12. Gift personalizations
  const gifts = load("gift_personalizations.json");
  const cleanGifts = gifts.filter(g => !g.user_id || !TEST_USER_IDS.has(g.user_id));
  console.log(`\nImporting ${cleanGifts.length} gift personalizations...`);
  for (const g of cleanGifts) {
    await sql.query(
      `INSERT INTO gift_personalizations (id, recipient_name, recipient_email, card_style, delivery_method, message, category, user_id, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`,
      [g.id, g.recipient_name, g.recipient_email, g.card_style, g.delivery_method, g.message, g.category, g.user_id, g.created_at, g.updated_at]
    );
  }
  console.log(`  ✓ ${cleanGifts.length} gift personalizations imported`);

  console.log("\n✅ Import complete!");
}

run().catch(console.error);
