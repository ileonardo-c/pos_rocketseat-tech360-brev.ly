import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3333),
  CORS_ORIGIN: z.string().default("*"),
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@localhost:5432/brevly"),
  SUPABASE_URL: z.string().url().default("https://example.supabase.co"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default("service-role-key"),
  SUPABASE_STORAGE_BUCKET: z.string().default("reports"),
  REPORT_SIGNED_URL_EXPIRES_IN_SECONDS: z.coerce.number().default(3600),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;
