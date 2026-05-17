import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const links = pgTable(
  "links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    originalUrl: text("original_url").notNull(),
    slug: text("slug").notNull().unique(),
    accessCount: integer("access_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIndex: index("links_slug_idx").on(table.slug),
    createdAtIndex: index("links_created_at_idx").on(table.createdAt),
  }),
);
