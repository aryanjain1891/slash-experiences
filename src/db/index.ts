import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DbInstance = ReturnType<typeof createDb>;

// Store on globalThis to survive Next.js hot module reloads in development
const globalForDb = globalThis as unknown as { _db?: DbInstance };

function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Please add it to your .env.local file."
    );
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export function getDb(): DbInstance {
  if (!globalForDb._db) {
    globalForDb._db = createDb();
  }
  return globalForDb._db;
}

export const db = new Proxy({} as DbInstance, {
  get(_, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type Database = DbInstance;
