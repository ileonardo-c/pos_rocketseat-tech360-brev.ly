import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "#app/lib/db/schema";
import { env } from "#app/lib/env";

export const sql = postgres(env.DATABASE_URL, {
  max: 10,
});

export const db = drizzle(sql, { schema });
