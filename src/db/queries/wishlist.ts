import { db } from "@/db";
import { eq, and, sql } from "drizzle-orm";
import { wishlists, experiences } from "@/db/schema";

export async function getWishlist(userId: string) {
  return db
    .select({
      id: wishlists.id,
      userId: wishlists.userId,
      experienceId: wishlists.experienceId,
      addedAt: wishlists.addedAt,
      title: experiences.title,
      description: experiences.description,
      price: experiences.price,
      imageUrl: experiences.imageUrl,
      location: experiences.location,
      category: experiences.category,
    })
    .from(wishlists)
    .innerJoin(experiences, eq(wishlists.experienceId, experiences.id))
    .where(eq(wishlists.userId, userId));
}

export async function toggleWishlist(userId: string, experienceId: string) {
  const [existing] = await db
    .select()
    .from(wishlists)
    .where(
      and(
        eq(wishlists.userId, userId),
        eq(wishlists.experienceId, experienceId)
      )
    );

  if (existing) {
    await db.delete(wishlists).where(eq(wishlists.id, existing.id));
    return { added: false };
  }

  await db.insert(wishlists).values({ userId, experienceId });
  return { added: true };
}

export async function getWishlistCount(userId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(wishlists)
    .where(eq(wishlists.userId, userId));
  return result.count;
}
