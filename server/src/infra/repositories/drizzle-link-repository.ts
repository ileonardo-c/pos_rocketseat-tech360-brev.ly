import { desc, eq, sql as drizzleSql } from "drizzle-orm";
import type { LinkReportRepository, LinkReportRow } from "../../application/repositories/link-report-repository.js";
import type { LinkRepository } from "../../application/repositories/link-repository.js";
import type { CreateLinkInput, Link } from "../../domain/link.js";
import { db, sql } from "../db/client.js";
import { schema } from "../db/schema/index.js";

function mapRowToLink(row: typeof schema.links.$inferSelect): Link {
  return {
    id: row.id,
    originalUrl: row.originalUrl,
    slug: row.slug,
    accessCount: row.accessCount,
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
  };
}

export class DrizzleLinkRepository implements LinkRepository, LinkReportRepository {
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

    for await (const chunk of cursor as AsyncIterable<
      Array<{
        originalUrl: string;
        shortUrl: string;
        accessCount: number;
        createdAt: Date | string;
      }>
    >) {
      for (const row of chunk) {
        yield {
          originalUrl: row.originalUrl,
          shortUrl: row.shortUrl,
          accessCount: row.accessCount,
          createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
        };
      }
    }
  }
}
