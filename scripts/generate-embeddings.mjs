import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

function loadEnv() {
  try {
    const content = readFileSync(".env.local", "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    }
  } catch { /* .env.local not found */ }
}
loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!DATABASE_URL || !GOOGLE_API_KEY) {
  console.error("Missing DATABASE_URL or GOOGLE_GENERATIVE_AI_API_KEY in .env.local");
  process.exit(1);
}

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
