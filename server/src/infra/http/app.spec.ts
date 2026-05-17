import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeCreateLinkUseCase } from "../../application/use-cases/make-create-link-use-case.js";
import { makeDeleteLinkUseCase } from "../../application/use-cases/make-delete-link-use-case.js";
import { makeExportLinksCsvUseCase } from "../../application/use-cases/make-export-links-csv-use-case.js";
import { makeIncrementAccessUseCase } from "../../application/use-cases/make-increment-access-use-case.js";
import { makeListLinksUseCase } from "../../application/use-cases/make-list-links-use-case.js";
import { makeResolveLinkUseCase } from "../../application/use-cases/make-resolve-link-use-case.js";
import { InMemoryLinkRepository } from "../repositories/in-memory-link-repository.js";
import { InMemoryStorageRepository } from "../storage/in-memory-storage-repository.js";
import { createApp } from "./app.js";

describe("http routes", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeEach(async () => {
    const links = new InMemoryLinkRepository();
    const storage = new InMemoryStorageRepository();
    app = await createApp({
      createLinkUseCase: makeCreateLinkUseCase({ linkRepository: links }),
      deleteLinkUseCase: makeDeleteLinkUseCase({ linkRepository: links }),
      resolveLinkUseCase: makeResolveLinkUseCase({ linkRepository: links }),
      listLinksUseCase: makeListLinksUseCase({ linkRepository: links }),
      incrementAccessUseCase: makeIncrementAccessUseCase({ linkRepository: links }),
      exportLinksCsvUseCase: makeExportLinksCsvUseCase({
        linkReportRepository: links,
        fileStorageRepository: storage,
        bucketName: "reports",
        signedUrlExpiresInSeconds: 3600,
      }),
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it("handles full link workflow", async () => {
    const health = await app.inject({
      method: "GET",
      url: "/health",
    });
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

    const duplicated = await app.inject({
      method: "POST",
      url: "/urls",
      payload: {
        originalUrl: "https://another.com",
        slug: "my-slug",
      },
    });
    expect(duplicated.statusCode).toBe(400);

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
  });
});
