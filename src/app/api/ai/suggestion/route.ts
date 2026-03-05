import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText, embed } from "ai";
import { getSession, updateSession } from "@/db/queries/ai-sessions";
import { db } from "@/db";
import { sql } from "drizzle-orm";

const BUDGET_RANGES: Record<string, [number, number]> = {
  "Under ₹1,000": [0, 1000],
  "₹1,000 - ₹3,000": [800, 3500],
  "₹3,000 - ₹5,000": [2500, 5500],
  "₹5,000 - ₹10,000": [4000, 11000],
  "₹10,000+": [8000, 999999],
};

function parseBudgetRange(budget: string): [number, number] | null {
  return BUDGET_RANGES[budget] ?? null;
}

function buildQueryText(answers: Record<string, string>): string {
  const parts: string[] = [];

  if (answers.recipient && answers.occasion) {
    parts.push(
      `A special ${answers.occasion} gift experience for my ${answers.recipient}`
    );
  }
  if (answers.personality) {
    parts.push(`They are ${answers.personality.toLowerCase()}`);
  }
  if (answers.interests) {
    parts.push(
      `They love ${answers.interests.toLowerCase()} activities`
    );
  }

  if (answers.recipient === "Partner") {
    parts.push("romantic, intimate, couple-friendly");
  } else if (answers.recipient === "Friend") {
    parts.push("fun, social, group-friendly");
  } else if (answers.recipient === "Parent") {
    parts.push("relaxing, thoughtful, comfortable");
  } else if (answers.recipient === "Child") {
    parts.push("exciting, safe, family-friendly");
  }

  return parts.join(". ") || "gift experience";
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    const kParam = request.nextUrl.searchParams.get("k");
    const k = Math.min(Math.max(parseInt(kParam ?? "6", 10) || 6, 1), 20);

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const answers = session.answers ?? {};
    const queryText = buildQueryText(answers);

    const { embedding } = await embed({
      model: google.textEmbeddingModel("gemini-embedding-001"),
      value: queryText,
      providerOptions: {
        google: { outputDimensionality: 768 },
      },
    });

    const vectorLiteral = `[${embedding.join(",")}]`;
    const budgetRange = parseBudgetRange(answers.budget ?? "");
    const priceFilter = budgetRange
      ? sql`AND CAST(price AS numeric) BETWEEN ${budgetRange[0]} AND ${budgetRange[1]}`
      : sql``;

    // Fetch more candidates than needed so we can let the LLM pick the best
    const candidateLimit = Math.min(k * 3, 20);

    const candidates = await db.execute(
      sql`SELECT id, title, description, image_url, price, location, duration,
                 participants, date, category, niche_category, trending, featured,
                 romantic, adventurous, group_activity
          FROM experiences
          WHERE embedding IS NOT NULL ${priceFilter}
          ORDER BY embedding <=> ${vectorLiteral}::vector
          LIMIT ${candidateLimit}`
    );

    const candidateRows = candidates.rows as Record<string, unknown>[];

    // Use Gemini to pick and rank the best matches from the candidates
    const { text: rankedJson } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a gift experience curator. Pick the ${k} BEST experiences from the candidates below for this person:

- Recipient: ${answers.recipient ?? "someone special"}
- Occasion: ${answers.occasion ?? "a special occasion"}
- Budget: ${answers.budget ?? "flexible"}
- Interests: ${answers.interests ?? "various"}
- Personality: ${answers.personality ?? "fun-loving"}

Candidates:
${candidateRows.map((e, i) => `${i + 1}. [ID: ${e.id}] ${e.title} — ${e.description} (₹${e.price}, ${e.location}, category: ${e.category}, romantic: ${e.romantic}, adventurous: ${e.adventurous}, group: ${e.group_activity})`).join("\n")}

Rules:
- Pick experiences that actually fit the recipient, occasion, and personality
- For partners: prefer romantic/intimate experiences, avoid group activities like paintball
- For friends: prefer fun social activities
- For parents: prefer relaxing/comfortable experiences
- Respect the budget range
- Prefer variety (don't pick 3 similar karaoke places)

Return ONLY a JSON array of the selected IDs in order of best fit, like: ["id1","id2","id3"]
No explanation, just the JSON array.`,
    });

    // Parse the ranked IDs and map back to full experience objects
    let selectedIds: string[] = [];
    try {
      const cleaned = rankedJson.replace(/```json\n?|```\n?/g, "").trim();
      selectedIds = JSON.parse(cleaned);
    } catch {
      selectedIds = candidateRows.slice(0, k).map((e) => e.id as string);
    }

    const selectedExperiences = selectedIds
      .map((id) => candidateRows.find((e) => e.id === id))
      .filter(Boolean)
      .slice(0, k);

    // If LLM filtering left too few, fill from remaining candidates
    if (selectedExperiences.length < k) {
      const usedIds = new Set(selectedExperiences.map((e) => e!.id));
      for (const c of candidateRows) {
        if (selectedExperiences.length >= k) break;
        if (!usedIds.has(c.id)) selectedExperiences.push(c);
      }
    }

    const { text: aiResponse } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a friendly gift experience advisor. Based on the user's preferences:
- Recipient: ${answers.recipient ?? "someone special"}
- Occasion: ${answers.occasion ?? "a special occasion"}
- Budget: ${answers.budget ?? "flexible"}
- Interests: ${answers.interests ?? "various"}
- Personality: ${answers.personality ?? "fun-loving"}

Here are the curated experience picks:
${selectedExperiences.map((e, i) => `${i + 1}. ${e!.title} — ${e!.description} (₹${e!.price}, ${e!.location})`).join("\n")}

Write a warm, personalized recommendation (2-3 short paragraphs) explaining why each of these is a great choice for this specific person and occasion. Be enthusiastic but concise. Don't use bullet points — write in flowing prose.`,
    });

    await updateSession(sessionId, {
      suggestions: selectedExperiences as unknown[],
      context: { queryText, aiResponse },
    });

    return NextResponse.json({
      suggestions: selectedExperiences,
      aiResponse,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Error generating suggestions:", msg, stack);
    return NextResponse.json(
      { error: `Failed to generate suggestions: ${msg}` },
      { status: 500 }
    );
  }
}
