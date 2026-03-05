import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }
const sql = neon(DATABASE_URL);

const IMAGE_MAP = {
  "Scuba Diving": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  "Camping": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
  "Mystery Games": "https://images.unsplash.com/photo-1590504805498-4db0cc644419?w=800&q=80",
  "Pottery": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
  "Poetry": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
  "Paintball": "https://images.unsplash.com/photo-1562827463-3ffe0e51bf77?w=800&q=80",
  "Rage Room": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80",
  "Caligraphy": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
  "Perfume": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
  "Paragliding": "https://images.unsplash.com/photo-1622397815598-68aaab141844?w=800&q=80",
  "Wine & Spirits": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
  "Movies": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
  "Trekking": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
  "Dining": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "Karaoke": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
  "Virtual Reality": "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80",
  "Art": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
  "Dance": "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80",
  "Go Karting": "https://images.unsplash.com/photo-1621253748931-c36e3aab2f44?w=800&q=80",
  "Cooking": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
  "Rock Climbing": "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80",
  "Laser Tag": "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80",
  "Candle Making": "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=800&q=80",
  "Farming": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80",
  "Yoga": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
  "Meditation": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
  "Resort": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
  "Reading": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  "Psychic": "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=800&q=80",
  "Zero Gravity": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80",
  "Photography": "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=80",
  "Adventure Park": "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80",
  "Pet": "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",
};

const CATEGORY_FALLBACK = {
  "adventure": "https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=800&q=80",
  "learning": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  "arts": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
  "sports": "https://images.unsplash.com/photo-1461896836934-bd45ba8785c2?w=800&q=80",
  "luxury": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
  "dining": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "music": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
  "technology": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
  "wellness": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
};

// Extra unique images to avoid duplicates within same exp_type
const VARIANT_IMAGES = {
  "Mystery Games": [
    "https://images.unsplash.com/photo-1590504805498-4db0cc644419?w=800&q=80",
    "https://images.unsplash.com/photo-1577741314755-048d8525d31e?w=800&q=80",
    "https://images.unsplash.com/photo-1594652634010-275456c808d0?w=800&q=80",
    "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&q=80",
    "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800&q=80",
    "https://images.unsplash.com/photo-1533371452382-d45a9da51b24?w=800&q=80",
  ],
  "Virtual Reality": [
    "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80",
    "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&q=80",
    "https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=800&q=80",
    "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
    "https://images.unsplash.com/photo-1478416272538-5f7e51dc7571?w=800&q=80",
    "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80",
  ],
  "Karaoke": [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80",
    "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
  ],
  "Cooking": [
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800&q=80",
    "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80",
    "https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=800&q=80",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80",
  ],
  "Dining": [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=800&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
  ],
  "Meditation": [
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800&q=80",
    "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
  ],
  "Pottery": [
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
    "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&q=80",
  ],
  "Paintball": [
    "https://images.unsplash.com/photo-1562827463-3ffe0e51bf77?w=800&q=80",
    "https://images.unsplash.com/photo-1555448248-2571daf6344b?w=800&q=80",
  ],
  "Paragliding": [
    "https://images.unsplash.com/photo-1622397815598-68aaab141844?w=800&q=80",
    "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?w=800&q=80",
  ],
  "Reading": [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    "https://images.unsplash.com/photo-1551029506-0807df4e2031?w=800&q=80",
  ],
};

const typeCounters = {};

async function run() {
  const rows = await sql.query("SELECT id, category, exp_type FROM experiences ORDER BY title");
  console.log(`Updating ${rows.length} experiences with Unsplash images...\n`);
  
  let count = 0;
  for (const row of rows) {
    let expTypes;
    try {
      expTypes = JSON.parse(row.exp_type || "[]");
    } catch { expTypes = []; }
    const expType = Array.isArray(expTypes) ? expTypes[0] : null;
    
    let imageUrl;
    
    if (expType && VARIANT_IMAGES[expType]) {
      const idx = typeCounters[expType] || 0;
      typeCounters[expType] = idx + 1;
      imageUrl = VARIANT_IMAGES[expType][idx % VARIANT_IMAGES[expType].length];
    } else if (expType && IMAGE_MAP[expType]) {
      imageUrl = IMAGE_MAP[expType];
    } else {
      imageUrl = CATEGORY_FALLBACK[row.category] || CATEGORY_FALLBACK["adventure"];
    }
    
    const jsonArray = JSON.stringify([imageUrl]);
    await sql.query("UPDATE experiences SET image_url = $1 WHERE id = $2", [jsonArray, row.id]);
    count++;
  }
  
  console.log(`Updated ${count} experiences with high-quality Unsplash images.`);
}

run().catch(console.error);
