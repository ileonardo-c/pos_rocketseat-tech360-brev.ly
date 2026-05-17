import z from "zod";
import type { Link, LinkModel } from "#app/models/link-model";
import { slugPattern } from "#app/models/link-model";
import { HttpError } from "#app/services/http-error";

const createLinkSchema = z.object({
  originalUrl: z.url(),
  slug: z.string().regex(slugPattern),
});

const slugSchema = z.string().min(1);

export interface CreateLinkRequest {
  originalUrl: string;
  slug: string;
}

export class LinkService {
  constructor(private readonly linkModel: LinkModel) {}

  async createLink(input: CreateLinkRequest): Promise<{ id: string; slug: string }> {
    const parsed = createLinkSchema.safeParse(input);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      if (issue?.path[0] === "originalUrl") {
        throw new HttpError(400, "Invalid original URL", "originalUrl");
      }

      throw new HttpError(400, "Invalid slug format", "slug");
    }

    const existing = await this.linkModel.findBySlug(parsed.data.slug);
    if (existing) {
      throw new HttpError(409, "Slug already exists", "slug");
    }

    try {
      const created = await this.linkModel.create(parsed.data);
      return { id: created.id, slug: created.slug };
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("duplicate key") || error.message.includes("unique"))
      ) {
        throw new HttpError(409, "Slug already exists", "slug");
      }

      throw error;
    }
  }

  async deleteLinkByShortUrl(shortUrl: string): Promise<void> {
    const slug = parseSlug(shortUrl);
    await this.linkModel.deleteBySlug(slug);
  }

  async resolveLink(shortUrl: string): Promise<{ fullUrl: string }> {
    const slug = parseSlug(shortUrl);
    const link = await this.linkModel.findBySlug(slug);

    if (!link) {
      throw new HttpError(404, "Short URL not found");
    }

    return { fullUrl: link.originalUrl };
  }

  async listLinks(): Promise<Link[]> {
    return this.linkModel.listAll();
  }

  async incrementAccess(shortUrl: string): Promise<void> {
    const slug = parseSlug(shortUrl);
    const updated = await this.linkModel.incrementAccessCount(slug);

    if (!updated) {
      throw new HttpError(404, "Short URL not found");
    }
  }
}

function parseSlug(shortUrl: string): string {
  const parsed = slugSchema.safeParse(shortUrl);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid params");
  }

  return parsed.data;
}
