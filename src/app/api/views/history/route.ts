import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { viewedExperiences, experiences } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { mapExperiences } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select({
        viewedAt: viewedExperiences.viewedAt,
        id: experiences.id,
        title: experiences.title,
        description: experiences.description,
        imageUrl: experiences.imageUrl,
        price: experiences.price,
        location: experiences.location,
        latitude: experiences.latitude,
        longitude: experiences.longitude,
        duration: experiences.duration,
        participants: experiences.participants,
        date: experiences.date,
        category: experiences.category,
        nicheCategory: experiences.nicheCategory,
        trending: experiences.trending,
        featured: experiences.featured,
        romantic: experiences.romantic,
        adventurous: experiences.adventurous,
        groupActivity: experiences.groupActivity,
        tags: experiences.tags,
        expType: experiences.expType,
        status: experiences.status,
        idtag: experiences.idtag,
        createdAt: experiences.createdAt,
        updatedAt: experiences.updatedAt,
      })
      .from(viewedExperiences)
      .innerJoin(experiences, eq(viewedExperiences.experienceId, experiences.id))
      .where(eq(viewedExperiences.userId, session.user.id))
      .orderBy(desc(viewedExperiences.viewedAt))
      .limit(50);

    return NextResponse.json(mapExperiences(rows));
  } catch (error) {
    console.error("Error fetching viewed history:", error);
    return NextResponse.json(
      { error: "Failed to fetch viewed history" },
      { status: 500 }
    );
  }
}
