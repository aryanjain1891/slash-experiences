import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (userId) {
      const results = await db.execute(
        sql`WITH recent_views AS (
              SELECT e.embedding
              FROM viewed_experiences ve
              JOIN experiences e ON e.id = ve.experience_id
              WHERE ve.user_id = ${userId}
              ORDER BY ve.viewed_at DESC
              LIMIT 5
            ),
            avg_embedding AS (
              SELECT AVG(embedding) as avg_emb FROM recent_views
            )
            SELECT e.id, e.title, e.description, e.image_url, e.price, e.location,
                   e.duration, e.participants, e.date, e.category, e.niche_category,
                   e.trending, e.featured, e.romantic, e.adventurous, e.group_activity
            FROM experiences e, avg_embedding a
            WHERE a.avg_emb IS NOT NULL
            ORDER BY e.embedding <=> a.avg_emb
            LIMIT 20`
      );

      if (results.rows.length > 0) {
        return NextResponse.json({ experiences: results.rows });
      }
    }

    const results = await db.execute(
      sql`SELECT id, title, description, image_url, price, location,
                 duration, participants, date, category, niche_category,
                 trending, featured, romantic, adventurous, group_activity
          FROM experiences
          ORDER BY RANDOM()
          LIMIT 20`
    );

    return NextResponse.json({ experiences: results.rows });
  } catch (error) {
    console.error("Error fetching swipe experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}
