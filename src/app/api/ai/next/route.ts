import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/db/queries/ai-sessions";
import { QUESTIONS } from "@/lib/ai-questions";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");

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

    const step = session.currentStep ?? 0;
    const question = step < QUESTIONS.length ? QUESTIONS[step] : null;

    return NextResponse.json({ question, currentStep: step, done: step >= QUESTIONS.length });
  } catch (error) {
    console.error("Error getting next question:", error);
    return NextResponse.json(
      { error: "Failed to get next question" },
      { status: 500 }
    );
  }
}
