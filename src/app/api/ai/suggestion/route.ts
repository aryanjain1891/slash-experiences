import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText, embed } from "ai";
import { getSession, updateSession } from "@/db/queries/ai-sessions";
import { db } from "@/db";
import { sql } from "drizzle-orm";

function buildQueryText(answers: Record<string, string>): string {
  const parts: string[] = [];
  if (answers.personality) parts.push(`${answers.personality} experience`);
  if (answers.recipient) parts.push(`for a ${answers.recipient}`);
  if (answers.occasion) parts.push(`for ${answers.occasion}`);
  if (answers.budget) parts.push(`budget ${answers.budget}`);
  if (answers.interests) parts.push(`interested in ${answers.interests}`);
  return parts.join(", ") || "gift experience";
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

    const queryText = buildQueryText(session.answers ?? {});

    const { embedding } = await embed({
      model: google.textEmbeddingModel("gemini-embedding-001"),
      value: queryText,
      providerOptions: {
        google: { outputDimensionality: 768 },
      },
    });

    const vectorLiteral = `[${embedding.join(",")}]`;

    const experiences = await db.execute(
      sql`SELECT id, title, description, image_url, price, location, duration, participants, date, category, niche_category, trending, featured, romantic, adventurous, group_activity
          FROM experiences
          ORDER BY embedding <=> ${vectorLiteral}::vector
          LIMIT ${k}`
    );

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a friendly gift experience advisor. Based on the user's preferences:
- Recipient: ${session.answers?.recipient ?? "someone special"}
- Occasion: ${session.answers?.occasion ?? "a special occasion"}
- Budget: ${session.answers?.budget ?? "flexible"}
- Interests: ${session.answers?.interests ?? "various"}
- Personality: ${session.answers?.personality ?? "fun-loving"}

Here are the top experience matches:
${(experiences.rows as Record<string, unknown>[]).map((e, i) => `${i + 1}. ${e.title} - ${e.description} (₹${e.price}, ${e.location})`).join("\n")}

Write a warm, personalized recommendation (2-3 paragraphs) explaining why these experiences are great choices. Be enthusiastic but concise.`,
    });

    await updateSession(sessionId, {
      suggestions: experiences.rows as unknown[],
      context: { queryText, aiResponse: text },
    });

    return NextResponse.json({
      suggestions: experiences.rows,
      aiResponse: text,
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
