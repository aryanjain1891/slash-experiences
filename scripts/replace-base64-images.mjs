/**
 * Replaces base64-encoded images in the experiences table with curated Unsplash CDN URLs.
 * Safe to re-run — only updates rows that still contain data: URIs.
 */
import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"|"$/g, "")];
    })
);

const sql = neon(env.DATABASE_URL);

// Curated replacement URL for each base64 slot per experience ID.
// Key = experience ID, Value = array of Unsplash URLs to swap IN for base64 entries.
const REPLACEMENTS = {
  // Night camping/stargazing
  "3d84915e-6a81-41ad-93f2-29a78c5f3477": ["https://images.unsplash.com/photo-1533230408708-8f9f91d1235a?q=80&w=1169&auto=format&fit=crop"],
  // Treasure hunts
  "0e99f7c2-e443-4e7a-8fb9-da84c1c2ac5b": ["https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=1170&auto=format&fit=crop"],
  // Pottery
  "107ec81a-f264-4bbc-bfad-1e8e1d675c28": ["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1170&auto=format&fit=crop"],
  // Poetry etc
  "08a038e9-f72f-473c-ab17-257c577813dc": ["https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1173&auto=format&fit=crop"],
  // PaintBall
  "7e54f913-b970-49ed-91c4-6c76903da00f": ["https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1170&auto=format&fit=crop"],
  // Rage room (has 2 URL images already, base64 was in middle)
  "d535d649-0e94-44ca-8147-5da3843bc2b0": ["https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=1170&auto=format&fit=crop"],
  // Calligraph
  "0ce04092-b810-4014-8bb5-46bf3a56a9d6": ["https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1175&auto=format&fit=crop"],
  // Make your own perfume
  "1d482a8e-9721-4a9e-ae61-8572963b96c3": ["https://images.unsplash.com/photo-1608528577891-eb055944f2e7?q=80&w=1172&auto=format&fit=crop"],
  // Paragliding
  "deb93233-95b2-42ab-a15b-f29165b78701": ["https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1168&auto=format&fit=crop"],
  // Trekking
  "c3118826-0507-4f10-b9b7-46c344a8fda3": ["https://images.unsplash.com/photo-1476611317561-60117649dd94?q=80&w=1170&auto=format&fit=crop"],
  // Karaoke
  "7350442c-b0f0-4421-b0ac-103740dc9fbc": ["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1170&auto=format&fit=crop"],
  // Murder mystery
  "3faa0bc7-3798-42ad-95c1-68f6d10e68b2": ["https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=1170&auto=format&fit=crop"],
  // Paintball at Sector 29
  "1f4bda9e-e1a6-4da3-89ee-ba0f49556604": ["https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1170&auto=format&fit=crop"],
  // Paragliding in Gurgaon
  "2de5d2c3-ae69-4adf-9938-e5d2d32ce36f": ["https://images.unsplash.com/photo-1536397106129-2358a35a7c9c?q=80&w=1170&auto=format&fit=crop"],
  // Rage Room Delhi
  "7f44ca72-4ceb-4665-b118-8aec7f5a53ba": ["https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=1170&auto=format&fit=crop"],
  // VR Gaming Gaming Mania
  "7b5b30de-3552-4ddc-ac42-8deb11b117a3": ["https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1170&auto=format&fit=crop"],
  // Art session
  "4f01504c-2dd8-4277-bcca-858f1f5f5029": ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1171&auto=format&fit=crop"],
  // Cafes
  "14cca129-4686-4f03-aabb-f3dfbceba236": ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1147&auto=format&fit=crop"],
  // Dance Fitness Workshop
  "420b1069-2198-4b91-963d-ffc49dacdfbb": ["https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=1031&auto=format&fit=crop"],
  // Go karting
  "e67e000d-d623-4467-a646-8cc3fe19f7a7": ["https://images.unsplash.com/photo-1520116468816-95b69f847357?q=80&w=1074&auto=format&fit=crop"],
  // Indoor Rock Climbing
  "0906e322-2c41-4653-97b8-35d6f4c7f4f6": ["https://images.unsplash.com/photo-1507034589631-9433cc6bc453?q=80&w=1171&auto=format&fit=crop"],
  // Laser Tag
  "6e133629-ec97-45f5-b8e4-dbfdaf5e3a47": ["https://images.unsplash.com/photo-1526484050152-33b72eb5b4d0?q=80&w=1025&auto=format&fit=crop"],
  // tickets + dome theaters + candle light concerts
  "ec0a3bee-d36d-48ac-b395-7e666dea2b95": ["https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=1170&auto=format&fit=crop"],
  // Pottery Workshop
  "d673da86-7a6c-4ff7-a3d3-ba1ce5bff648": ["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1170&auto=format&fit=crop"],
  // DIY Candle Making
  "d15aa961-e6c1-4f3f-8b6e-0b88b5eaccda": ["https://images.unsplash.com/photo-1601979031925-424e53b6caaa?q=80&w=1170&auto=format&fit=crop"],
  // VR Gaming Microgravity Gaming Zone
  "bd4e59fb-e1e2-4a42-97b7-34227afd2f22": ["https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1078&auto=format&fit=crop"],
  // VR Gaming Timezone Pacific Mall
  "7add3d7e-caa5-4a0c-bc87-99702459d010": ["https://images.unsplash.com/photo-1617802690992-15d93263d3a9?q=80&w=1170&auto=format&fit=crop"],
  // Organic Farming Experience
  "47df923e-5fb9-4d3b-9940-1a70fd0a03b7": ["https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1170&auto=format&fit=crop"],
  // Yoga & Meditation Retreat
  "6e7178b3-d17b-4521-a938-d19767ade24d": ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1099&auto=format&fit=crop"],
  // Karaoke/Musical Garage Inc
  "99d4c6a9-7176-4373-a159-0ff214950964": ["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1170&auto=format&fit=crop"],
  // Jungle resorts
  "69a458bf-9919-4a10-b43c-31e7a1e9e1d8": ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1080&auto=format&fit=crop"],
  // VR Gaming Timezone Vegas Mall Delhi
  "91b6e733-12fd-485e-a8c6-550720c711f2": ["https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1170&auto=format&fit=crop"],
  // Karaoke/Musical Grand Karaoke
  "6bc1fffa-892c-4218-98a5-53697f9b9856": ["https://images.unsplash.com/photo-1598805538557-c09c3390f5e6?q=80&w=1175&auto=format&fit=crop"],
  // Karaoke/Musical Hi KTV
  "5c55cad1-8c6e-47c7-bb3e-9e1d015296a8": ["https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=1170&auto=format&fit=crop"],
  // Cooking Workshop Tastesutra
  "ad29ffa7-713a-423a-aa03-c72723113390": ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1170&auto=format&fit=crop"],
  // Karaoke/Musical Raasta Delhi
  "501417ca-f649-452e-97aa-7d2e004ccc7f": ["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1170&auto=format&fit=crop"],
  // Meditation Rudra Meditation Studio
  "31179eb1-a291-4f98-98fd-7dcc060195ec": ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1099&auto=format&fit=crop"],
  // Meditation Zorba the Buddha
  "aa273a27-ff85-41a3-8b74-1263bd9b53b4": ["https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=1025&auto=format&fit=crop"],
  // Meditation Osho Glimpse
  "f4ee7720-5995-4924-9fa0-4a312b04abb8": ["https://images.unsplash.com/photo-1588286840104-8957b019727f?q=80&w=1170&auto=format&fit=crop"],
  // Tarot Card Reading Aura Gate
  "2bbfba8e-e22c-470f-bff6-84c2ee6d6483": ["https://images.unsplash.com/photo-1601040561849-3d76bfcaebce?q=80&w=1098&auto=format&fit=crop"],
  // Psychic Medium Daksh
  "37049908-40ac-4406-bc4c-289418b62592": ["https://images.unsplash.com/photo-1517637382994-f02da38c6728?q=80&w=1173&auto=format&fit=crop"],
  // Karaoke/Musical The Record Room
  "fa0cf785-082c-4958-be78-9fa29e028225": ["https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?q=80&w=1170&auto=format&fit=crop"],
  // Cosmic Connect Psychic Reading
  "a0557544-1059-411f-a6dc-1889e63d4064": ["https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?q=80&w=1170&auto=format&fit=crop"],
  // Art museums
  "2bc39b77-84f7-4ce3-b8fe-3ca81cf4541b": ["https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=1170&auto=format&fit=crop"],
  // Adventure Parks
  "ca19d186-8bf5-4620-b6e0-2bea93bcb606": ["https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?q=80&w=1170&auto=format&fit=crop"],
};

async function main() {
  const ids = Object.keys(REPLACEMENTS);
  console.log(`Processing ${ids.length} experiences...`);

  const rows = await sql`SELECT id, image_url FROM experiences WHERE id = ANY(${ids})`;
  console.log(`Found ${rows.length} rows in DB`);

  let updated = 0;
  for (const row of rows) {
    const replacementUrls = REPLACEMENTS[row.id];
    if (!replacementUrls) continue;

    let current;
    try {
      current = typeof row.image_url === "string" ? JSON.parse(row.image_url) : row.image_url;
    } catch {
      current = [];
    }
    if (!Array.isArray(current)) current = [];

    // Replace base64 entries in-order with the curated URLs
    let replIdx = 0;
    const cleaned = current.map((url) => {
      if (typeof url === "string" && url.startsWith("data:") && replIdx < replacementUrls.length) {
        return replacementUrls[replIdx++];
      }
      return url;
    });

    await sql`UPDATE experiences SET image_url = ${JSON.stringify(cleaned)} WHERE id = ${row.id}`;
    console.log(`✓ Updated: ${row.id} (replaced ${replIdx} base64 image(s))`);
    updated++;
  }

  // Verify
  const remaining = await sql`SELECT COUNT(*) as count FROM experiences WHERE image_url LIKE '%data:image%'`;
  console.log(`\nDone. Updated ${updated} rows.`);
  console.log(`Remaining base64 entries in DB: ${remaining[0].count}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
