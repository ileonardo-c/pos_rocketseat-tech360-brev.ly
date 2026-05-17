import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../../config/env.js";
import { schema } from "./schema/index.js";

export const sql = postgres(env.DATABASE_URL, {
  max: 10,
});

export const db = drizzle(sql, { schema });
