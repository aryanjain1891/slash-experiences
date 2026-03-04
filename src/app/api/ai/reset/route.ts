import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/db/queries/ai-sessions";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");

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
