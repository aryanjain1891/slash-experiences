import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/db/queries/ai-sessions";
import { QUESTIONS } from "@/lib/ai-questions";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, answer } = await request.json();

    if (!sessionId || !answer) {
      return NextResponse.json(
        { error: "sessionId and answer are required" },
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

    const currentQuestion = QUESTIONS[session.currentStep ?? 0];
    const updatedAnswers = {
      ...session.answers,
      [currentQuestion.id]: answer,
    };
    const nextStep = (session.currentStep ?? 0) + 1;

    await updateSession(sessionId, {
      answers: updatedAnswers,
      currentStep: nextStep,
    });

    const nextQuestion = nextStep < QUESTIONS.length ? QUESTIONS[nextStep] : null;

    return NextResponse.json({ success: true, nextQuestion });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
}
