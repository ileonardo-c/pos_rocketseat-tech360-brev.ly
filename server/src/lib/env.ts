import "dotenv/config";
import z from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3333),
    CORS_ORIGIN: z.string().default("*"),
    DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/brevly"),
    FILE_STORAGE_DRIVER: z.enum(["s3", "memory"]).default("s3"),
    AWS_REGION: z.string().default("us-east-1"),
    AWS_ENDPOINT_URL: z.url().optional(),
    AWS_S3_PUBLIC_ENDPOINT_URL: z.url().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_S3_BUCKET: z.string().default("brevly-reports"),
    REPORT_SIGNED_URL_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(3600),
  })
  .superRefine((value, ctx) => {
    const hasAccessKey = Boolean(value.AWS_ACCESS_KEY_ID);
    const hasSecretKey = Boolean(value.AWS_SECRET_ACCESS_KEY);

    if (hasAccessKey !== hasSecretKey) {
      ctx.addIssue({
        code: "custom",
        path: hasAccessKey ? ["AWS_SECRET_ACCESS_KEY"] : ["AWS_ACCESS_KEY_ID"],
        message: "AWS access key and secret must be provided together",
      });
    }

    if (value.FILE_STORAGE_DRIVER === "s3" && !value.AWS_S3_BUCKET.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["AWS_S3_BUCKET"],
        message: "AWS_S3_BUCKET is required when FILE_STORAGE_DRIVER is s3",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;
