import { db } from "@/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { experiences } from "@/db/schema";

export async function getAllExperiences() {
  return db.select().from(experiences).orderBy(desc(experiences.createdAt));
}

export async function getExperienceById(id: string) {
  const [experience] = await db
    .select()
    .from(experiences)
    .where(eq(experiences.id, id));
  return experience ?? null;
}

export async function getExperiencesByCategory(category: string) {
  return db
    .select()
    .from(experiences)
    .where(eq(experiences.category, category))
    .orderBy(desc(experiences.createdAt));
}

export async function getFeaturedExperiences() {
  return db
    .select()
    .from(experiences)
    .where(eq(experiences.featured, true))
    .limit(8);
}

export async function searchExperiences(query: string) {
  const pattern = `%${query}%`;
  return db
    .select()
    .from(experiences)
    .where(
      sql`${experiences.title} ILIKE ${pattern}
        OR ${experiences.description} ILIKE ${pattern}
        OR ${experiences.location} ILIKE ${pattern}
        OR ${experiences.category} ILIKE ${pattern}`
    )
    .orderBy(desc(experiences.createdAt));
}

export async function getSimilarExperiences(
  experienceId: string,
  limit = 6
) {
  return db
    .select()
    .from(experiences)
    .where(sql`${experiences.id} != ${experienceId}`)
    .orderBy(
      sql`embedding <=> (SELECT embedding FROM experiences WHERE id = ${experienceId})`
    )
    .limit(limit);
}
