import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
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
  // prepare: false required — Supabase's PgBouncer transaction pooler doesn't support prepared statements
  const client = postgres(process.env.DATABASE_URL, {
    prepare: false,   // required for PgBouncer transaction mode
    max: 1,           // one connection per serverless instance
    idle_timeout: 20, // release idle connections after 20s
    connect_timeout: 10,
  });
  return drizzle(client, { schema });
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
