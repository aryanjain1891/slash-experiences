import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Exclude Better Auth tables — they're managed by Better Auth directly, not Drizzle
  tablesFilter: ["!user", "!session", "!account", "!verification"],
});
