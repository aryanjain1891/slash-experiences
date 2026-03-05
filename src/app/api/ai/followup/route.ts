import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText, embed } from "ai";
import { getSession, updateSession } from "@/db/queries/ai-sessions";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    const question = request.nextUrl.searchParams.get("question");

    if (!sessionId || !question) {
      return NextResponse.json(
        { error: "sessionId and question are required" },
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

    const previousSuggestions = (session.suggestions ?? []) as Record<string, unknown>[];
    const previousIds = previousSuggestions
      .map((s) => s.id as string)
      .filter(Boolean);

    const { text: refinedQuery } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a search query builder. The user initially wanted a gift experience with these preferences:
${JSON.stringify(session.answers)}

They received suggestions but weren't satisfied. Their feedback is: "${question}"

Write a single, concise search phrase (15-25 words) that captures what they actually want now, combining their original preferences with this new feedback. Output ONLY the search phrase, nothing else.`,
    });

    const { embedding } = await embed({
      model: google.textEmbeddingModel("gemini-embedding-001"),
      value: refinedQuery.trim(),
      providerOptions: {
        google: { outputDimensionality: 768 },
      },
    });

    const vectorLiteral = `[${embedding.join(",")}]`;

    const excludeClause =
      previousIds.length > 0
        ? sql`AND id NOT IN (${sql.join(
            previousIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        : sql``;

    const experiences = await db.execute(
      sql`SELECT id, title, description, image_url, price, location, duration,
                 participants, date, category, niche_category, trending, featured,
                 romantic, adventurous, group_activity
          FROM experiences
          WHERE 1=1 ${excludeClause}
          ORDER BY embedding <=> ${vectorLiteral}::vector
          LIMIT 6`
    );

    const { text: aiResponse } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a friendly gift experience advisor. The user originally wanted:
${JSON.stringify(session.answers)}

They weren't happy with the previous suggestions and said: "${question}"

Here are the new experience matches based on their feedback:
${(experiences.rows as Record<string, unknown>[]).map((e, i) => `${i + 1}. ${e.title} - ${e.description} (₹${e.price}, ${e.location})`).join("\n")}

Write a warm, concise response (2-3 paragraphs) acknowledging their feedback and explaining why these new picks are a better fit.`,
    });

    await updateSession(sessionId, {
      suggestions: experiences.rows as unknown[],
      context: { queryText: refinedQuery.trim(), aiResponse, followupQuestion: question },
    });

    return NextResponse.json({
      response: aiResponse,
      suggestions: experiences.rows,
      aiResponse,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error handling follow-up:", msg);
    return NextResponse.json(
      { error: `Failed to handle follow-up: ${msg}` },
      { status: 500 }
    );
  }
}
