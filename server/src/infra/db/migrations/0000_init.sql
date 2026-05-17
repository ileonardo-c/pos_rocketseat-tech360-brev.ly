CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "original_url" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "access_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "links_slug_idx" ON "links" ("slug");
CREATE INDEX IF NOT EXISTS "links_created_at_idx" ON "links" ("created_at");
