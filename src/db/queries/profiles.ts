import { db } from "@/db";
import { eq } from "drizzle-orm";
import { profiles } from "@/db/schema";

export async function getProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId));
  return profile ?? null;
}

export async function updateProfile(
  userId: string,
  data: {
    fullName?: string;
    avatarUrl?: string;
    phone?: string;
    address?: string;
    bio?: string;
  }
) {
  const [profile] = await db
    .insert(profiles)
    .values({ id: userId, ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: profiles.id,
      set: { ...data, updatedAt: new Date() },
    })
    .returning();
  return profile;
}
