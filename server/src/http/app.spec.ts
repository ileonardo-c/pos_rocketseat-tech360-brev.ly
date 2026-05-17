import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "#app/http/app";
import { InMemoryStorage } from "#app/lib/storage/in-memory-storage";
import { InMemoryLinkModel } from "#app/models/in-memory-link-model";
import { LinkService } from "#app/services/link-service";
import { ReportService } from "#app/services/report-service";

describe("http routes", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeEach(async () => {
    const linkModel = new InMemoryLinkModel();
    const storage = new InMemoryStorage();
    app = await createApp({
      linkService: new LinkService(linkModel),
      reportService: new ReportService({
        linkModel,
        fileStorage: storage,
        bucketName: "reports",
        signedUrlExpiresInSeconds: 3600,
      }),
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it("handles full link workflow with backend-first errors", async () => {
    const health = await app.inject({ method: "GET", url: "/health" });
    expect(health.statusCode).toBe(200);
    expect(health.json()).toEqual({ status: "ok" });

    const created = await app.inject({
      method: "POST",
      url: "/urls",
      payload: {
        originalUrl: "https://example.com/path",
        slug: "my-slug",
      },
    });
    expect(created.statusCode).toBe(201);

    const malformed = await app.inject({
      method: "POST",
      url: "/urls",
      payload: {
        originalUrl: "https://example.com/path",
        slug: "bad slug",
      },
    });
    expect(malformed.statusCode).toBe(400);
    expect(malformed.json()).toEqual({
      message: "Invalid slug format",
      field: "slug",
    });

    const duplicated = await app.inject({
      method: "POST",
      url: "/urls",
      payload: {
        originalUrl: "https://another.com",
        slug: "my-slug",
      },
    });
    expect(duplicated.statusCode).toBe(409);
    expect(duplicated.json()).toEqual({
      message: "Slug already exists",
      field: "slug",
    });

    const resolved = await app.inject({
      method: "GET",
      url: "/urls/my-slug",
    });
    expect(resolved.statusCode).toBe(200);
    expect(resolved.json()).toEqual({
      fullUrl: "https://example.com/path",
    });

    const increment = await app.inject({
      method: "POST",
      url: "/urls/my-slug/increment",
    });
    expect(increment.statusCode).toBe(200);

    const listed = await app.inject({
      method: "GET",
      url: "/urls",
    });
    expect(listed.statusCode).toBe(200);
    const links = listed.json();
    expect(links).toHaveLength(1);
    expect(links[0].accessCount).toBe(1);

    const report = await app.inject({
      method: "GET",
      url: "/urls/report",
    });
    expect(report.statusCode).toBe(200);
    expect(report.json().reportUrl).toContain("https://signed.example/");

    const deleted = await app.inject({
      method: "DELETE",
      url: "/urls/my-slug",
    });
    expect(deleted.statusCode).toBe(204);

    const missing = await app.inject({
      method: "GET",
      url: "/urls/my-slug",
    });
    expect(missing.statusCode).toBe(404);
    expect(missing.json()).toEqual({
      message: "Short URL not found",
    });
  });
});
