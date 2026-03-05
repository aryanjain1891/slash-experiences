import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { getSession } from "@/db/queries/ai-sessions";

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

    const suggestions = (session.suggestions ?? []) as Record<string, unknown>[];
    const context = session.context as Record<string, unknown> | null;

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a friendly gift experience advisor. The user previously asked for gift suggestions and received these recommendations:

Previous suggestions:
${suggestions.map((s, i) => `${i + 1}. ${s.title} - ${s.description} (₹${s.price})`).join("\n")}

Previous AI response: ${context?.aiResponse ?? "N/A"}

User preferences: ${JSON.stringify(session.answers)}

The user now asks: "${question}"

Provide a helpful, warm response addressing their follow-up question. Be specific about the experiences when relevant.`,
    });

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error handling follow-up:", error);
    return NextResponse.json(
      { error: "Failed to handle follow-up" },
      { status: 500 }
    );
  }
}
