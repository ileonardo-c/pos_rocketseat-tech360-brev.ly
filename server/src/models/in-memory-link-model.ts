import { randomUUID } from "node:crypto";
import type { CreateLinkInput, Link, LinkModel, LinkReportRow } from "#app/models/link-model";

export class InMemoryLinkModel implements LinkModel {
  private readonly links = new Map<string, Link>();

  async create(input: CreateLinkInput): Promise<Link> {
    const link: Link = {
      id: randomUUID(),
      originalUrl: input.originalUrl,
      slug: input.slug,
      accessCount: 0,
      createdAt: new Date(),
    };
    this.links.set(link.slug, link);
    return { ...link };
  }

  async findBySlug(slug: string): Promise<Link | null> {
    const link = this.links.get(slug);
    return link ? { ...link } : null;
  }

  async deleteBySlug(slug: string): Promise<boolean> {
    return this.links.delete(slug);
  }

  async listAll(): Promise<Link[]> {
    return [...this.links.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async incrementAccessCount(slug: string): Promise<boolean> {
    const link = this.links.get(slug);
    if (!link) {
      return false;
    }

    link.accessCount += 1;
    this.links.set(slug, link);
    return true;
  }

  async *streamAllForReport(): AsyncIterable<LinkReportRow> {
    for (const link of await this.listAll()) {
      yield {
        originalUrl: link.originalUrl,
        shortUrl: link.slug,
        accessCount: link.accessCount,
        createdAt: link.createdAt,
      };
    }
  }
}
