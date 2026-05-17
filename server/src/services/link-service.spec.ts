import { describe, expect, it } from "vitest";
import { InMemoryLinkModel } from "#app/models/in-memory-link-model";
import { LinkService } from "#app/services/link-service";

describe("LinkService", () => {
  it("creates a link when payload is valid", async () => {
    const linkService = new LinkService(new InMemoryLinkModel());

    const created = await linkService.createLink({
      originalUrl: "https://example.com",
      slug: "example_slug",
    });

    expect(created.slug).toBe("example_slug");
    expect(created.id).toBeTypeOf("string");
  });

  it("rejects malformed slug", async () => {
    const linkService = new LinkService(new InMemoryLinkModel());

    await expect(
      linkService.createLink({
        originalUrl: "https://example.com",
        slug: "bad slug",
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: "Invalid slug format",
      field: "slug",
    });
  });

  it("rejects duplicated slug", async () => {
    const linkService = new LinkService(new InMemoryLinkModel());

    await linkService.createLink({
      originalUrl: "https://example.com",
      slug: "dup_slug",
    });

    await expect(
      linkService.createLink({
        originalUrl: "https://openai.com",
        slug: "dup_slug",
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: "Slug already exists",
      field: "slug",
    });
  });

  it("resolves, increments and deletes links", async () => {
    const linkService = new LinkService(new InMemoryLinkModel());

    await linkService.createLink({
      originalUrl: "https://example.com",
      slug: "my-slug",
    });

    await expect(linkService.resolveLink("my-slug")).resolves.toEqual({
      fullUrl: "https://example.com",
    });

    await expect(linkService.incrementAccess("my-slug")).resolves.toBeUndefined();
    await expect(linkService.listLinks()).resolves.toMatchObject([
      { slug: "my-slug", accessCount: 1 },
    ]);

    await expect(linkService.deleteLinkByShortUrl("my-slug")).resolves.toBeUndefined();
    await expect(linkService.resolveLink("my-slug")).rejects.toMatchObject({
      status: 404,
      message: "Short URL not found",
    });
  });
});
