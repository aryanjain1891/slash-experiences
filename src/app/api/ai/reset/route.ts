import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/db/queries/ai-sessions";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    await deleteSession(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting session:", error);
    return NextResponse.json(
      { error: "Failed to reset session" },
      { status: 500 }
    );
  }
}
