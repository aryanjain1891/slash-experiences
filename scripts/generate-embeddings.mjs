import { neon } from "@neondatabase/serverless";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_Po9Rw2SLgEbl@ep-empty-firefly-a10m87ds-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const GOOGLE_API_KEY = "AIzaSyAVu5EkrmX3i0aj4sxx9w8ya-xNE0Vb5Mk";

const sql = neon(DATABASE_URL);

async function getEmbedding(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.embedding.values;
}

function buildEmbeddingText(exp) {
  const parts = [
    exp.title,
    exp.description,
    exp.category,
    exp.niche_category,
    exp.location,
    exp.exp_type,
    exp.tags,
  ].filter(Boolean);
  return parts.join(". ");
}

async function main() {
  const experiences = await sql`SELECT id, title, description, category, niche_category, location, exp_type, tags FROM experiences WHERE embedding IS NULL`;

  console.log(`Found ${experiences.length} experiences without embeddings`);

  let success = 0;
  let failed = 0;

  for (const exp of experiences) {
    const text = buildEmbeddingText(exp);
    try {
      const embedding = await getEmbedding(text);
      const vectorStr = `[${embedding.join(",")}]`;
      await sql`UPDATE experiences SET embedding = ${vectorStr}::vector WHERE id = ${exp.id}`;
      success++;
      console.log(`[${success}/${experiences.length}] ✓ ${exp.title}`);
    } catch (err) {
      failed++;
      console.error(`✗ ${exp.title}: ${err.message}`);
    }
    // small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\nDone: ${success} embedded, ${failed} failed`);
}

main().catch(console.error);
