import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { viewedExperiences } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { experienceId } = await request.json();
    if (!experienceId) {
      return NextResponse.json(
        { error: "experienceId is required" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(viewedExperiences)
      .where(
        and(
          eq(viewedExperiences.userId, session.user.id),
          eq(viewedExperiences.experienceId, experienceId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ status: "already_tracked" });
    }

    await db.insert(viewedExperiences).values({
      userId: session.user.id,
      experienceId,
    });

    return NextResponse.json({ status: "tracked" });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}
