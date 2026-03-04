import { db } from "@/db";
import { eq } from "drizzle-orm";
import { aiSessions } from "@/db/schema";

export async function getSession(sessionId: string) {
  const [session] = await db
    .select()
    .from(aiSessions)
    .where(eq(aiSessions.sessionId, sessionId));
  return session ?? null;
}

export async function createSession(sessionId: string) {
  const [session] = await db
    .insert(aiSessions)
    .values({
      sessionId,
      currentStep: 0,
      answers: {},
      context: {},
      suggestions: [],
    })
    .returning();
  return session;
}

export async function updateSession(
  sessionId: string,
  data: {
    currentStep?: number;
    answers?: Record<string, string>;
    context?: Record<string, unknown>;
    suggestions?: unknown[];
  }
) {
  const [session] = await db
    .update(aiSessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(aiSessions.sessionId, sessionId))
    .returning();
  return session;
}

export async function deleteSession(sessionId: string) {
  return db
    .delete(aiSessions)
    .where(eq(aiSessions.sessionId, sessionId));
}
