import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/db/queries/ai-sessions";
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

    const newStep = Math.max(0, (session.currentStep ?? 0) - 1);
    await updateSession(sessionId, { currentStep: newStep });

    return NextResponse.json({ question: QUESTIONS[newStep] });
  } catch (error) {
    console.error("Error going back:", error);
    return NextResponse.json(
      { error: "Failed to go back" },
      { status: 500 }
    );
  }
}
