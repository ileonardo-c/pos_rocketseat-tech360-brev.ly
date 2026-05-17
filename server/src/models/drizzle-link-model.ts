import { desc, sql as drizzleSql, eq } from "drizzle-orm";
import { db, sql } from "#app/lib/db/client";
import { schema } from "#app/lib/db/schema";
import type { CreateLinkInput, Link, LinkModel, LinkReportRow } from "#app/models/link-model";

function mapRowToLink(row: typeof schema.links.$inferSelect): Link {
  return {
    id: row.id,
    originalUrl: row.originalUrl,
    slug: row.slug,
    accessCount: row.accessCount,
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
  };
}

function normalizeReportDate(value: Date | string): Date {
  if (value instanceof Date) {
    return value;
  }

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const normalized = value.replace(" ", "T").replace(/\+00$/, "Z");
  const fallback = new Date(normalized);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }

  throw new Error(`Invalid created_at value in report stream: ${value}`);
}

export class DrizzleLinkModel implements LinkModel {
  async create(input: CreateLinkInput): Promise<Link> {
    const [created] = await db
      .insert(schema.links)
      .values({
        originalUrl: input.originalUrl,
        slug: input.slug,
      })
      .returning();

    if (!created) {
      throw new Error("Link was not created");
    }

    return mapRowToLink(created);
  }

  async findBySlug(slug: string): Promise<Link | null> {
    const [link] = await db.select().from(schema.links).where(eq(schema.links.slug, slug)).limit(1);
    return link ? mapRowToLink(link) : null;
  }

  async deleteBySlug(slug: string): Promise<boolean> {
    const deleted = await db
      .delete(schema.links)
      .where(eq(schema.links.slug, slug))
      .returning({ id: schema.links.id });

    return deleted.length > 0;
  }

  async listAll(): Promise<Link[]> {
    const rows = await db.select().from(schema.links).orderBy(desc(schema.links.createdAt));
    return rows.map(mapRowToLink);
  }

  async incrementAccessCount(slug: string): Promise<boolean> {
    const updated = await db
      .update(schema.links)
      .set({
        accessCount: drizzleSql`${schema.links.accessCount} + 1`,
      })
      .where(eq(schema.links.slug, slug))
      .returning({ id: schema.links.id });

    return updated.length > 0;
  }

  async *streamAllForReport(): AsyncIterable<LinkReportRow> {
    const { sql: rawSql, params } = db
      .select({
        originalUrl: schema.links.originalUrl,
        shortUrl: schema.links.slug,
        accessCount: schema.links.accessCount,
        createdAt: schema.links.createdAt,
      })
      .from(schema.links)
      .orderBy(desc(schema.links.createdAt))
      .toSQL();

    const cursor = sql.unsafe(rawSql, params as never[]).cursor(100);

    for await (const chunk of cursor as AsyncIterable<Array<Record<string, unknown>>>) {
      for (const row of chunk) {
        const originalUrl = (row.originalUrl ?? row.original_url) as string | undefined;
        const shortUrl = (row.shortUrl ?? row.slug) as string | undefined;
        const accessCount = (row.accessCount ?? row.access_count) as number | undefined;
        const createdAtRaw = (row.createdAt ?? row.created_at) as Date | string | undefined;

        if (!originalUrl || !shortUrl || accessCount === undefined || !createdAtRaw) {
          throw new Error("Invalid row shape returned while streaming CSV report");
        }

        yield {
          originalUrl,
          shortUrl,
          accessCount,
          createdAt: normalizeReportDate(createdAtRaw),
        };
      }
    }
  }
}
