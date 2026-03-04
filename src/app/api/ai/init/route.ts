import { NextResponse } from "next/server";
import { createSession } from "@/db/queries/ai-sessions";
import { QUESTIONS } from "@/lib/ai-questions";

export async function GET() {
  try {
    const sessionId = crypto.randomUUID();
    await createSession(sessionId);
    return NextResponse.json({ sessionId, question: QUESTIONS[0] });
  } catch (error) {
    console.error("Error initializing AI session:", error);
    return NextResponse.json(
      { error: "Failed to initialize session" },
      { status: 500 }
    );
  }
}
