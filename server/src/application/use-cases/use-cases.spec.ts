import { describe, expect, it } from "vitest";
import { makeCreateLinkUseCase } from "./make-create-link-use-case.js";
import { makeDeleteLinkUseCase } from "./make-delete-link-use-case.js";
import { makeExportLinksCsvUseCase } from "./make-export-links-csv-use-case.js";
import { makeIncrementAccessUseCase } from "./make-increment-access-use-case.js";
import { makeListLinksUseCase } from "./make-list-links-use-case.js";
import { makeResolveLinkUseCase } from "./make-resolve-link-use-case.js";
import { InMemoryLinkRepository } from "../../infra/repositories/in-memory-link-repository.js";
import { InMemoryStorageRepository } from "../../infra/storage/in-memory-storage-repository.js";

describe("use cases", () => {
  it("creates a link when payload is valid", async () => {
    const repository = new InMemoryLinkRepository();
    const useCase = makeCreateLinkUseCase({ linkRepository: repository });

    const result = await useCase.execute({
      originalUrl: "https://example.com",
      slug: "example_slug",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.value.slug).toBe("example_slug");
  });

  it("rejects malformed slug", async () => {
    const repository = new InMemoryLinkRepository();
    const useCase = makeCreateLinkUseCase({ linkRepository: repository });

    const result = await useCase.execute({
      originalUrl: "https://example.com",
      slug: "bad slug",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.error.code).toBe("INVALID_SLUG");
  });

  it("rejects duplicate slug", async () => {
    const repository = new InMemoryLinkRepository();
    const useCase = makeCreateLinkUseCase({ linkRepository: repository });

    await useCase.execute({
      originalUrl: "https://example.com",
      slug: "dup_slug",
    });

    const duplicate = await useCase.execute({
      originalUrl: "https://openai.com",
      slug: "dup_slug",
    });

    expect(duplicate.ok).toBe(false);
    if (duplicate.ok) {
      return;
    }

    expect(duplicate.error.code).toBe("DUPLICATE_SLUG");
  });

  it("resolves, increments and deletes links", async () => {
    const repository = new InMemoryLinkRepository();
    const createUseCase = makeCreateLinkUseCase({ linkRepository: repository });
    const resolveUseCase = makeResolveLinkUseCase({ linkRepository: repository });
    const incrementUseCase = makeIncrementAccessUseCase({ linkRepository: repository });
    const listUseCase = makeListLinksUseCase({ linkRepository: repository });
    const deleteUseCase = makeDeleteLinkUseCase({ linkRepository: repository });

    await createUseCase.execute({
      originalUrl: "https://example.com",
      slug: "my-slug",
    });

    const resolved = await resolveUseCase.execute({ slug: "my-slug" });
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(resolved.value.fullUrl).toBe("https://example.com");
    }

    const inc = await incrementUseCase.execute({ slug: "my-slug" });
    expect(inc.ok).toBe(true);

    const list = await listUseCase.execute();
    expect(list.value.links).toHaveLength(1);
    expect(list.value.links[0]?.accessCount).toBe(1);

    await deleteUseCase.execute({ slug: "my-slug" });

    const missing = await resolveUseCase.execute({ slug: "my-slug" });
    expect(missing.ok).toBe(false);
  });

  it("exports links to CSV with signed URL", async () => {
    const repository = new InMemoryLinkRepository();
    const storage = new InMemoryStorageRepository();

    const createUseCase = makeCreateLinkUseCase({ linkRepository: repository });
    const incrementUseCase = makeIncrementAccessUseCase({ linkRepository: repository });
    const exportUseCase = makeExportLinksCsvUseCase({
      linkReportRepository: repository,
      fileStorageRepository: storage,
      bucketName: "reports",
      signedUrlExpiresInSeconds: 1800,
    });

    await createUseCase.execute({
      originalUrl: "https://example.com",
      slug: "csv-test",
    });
    await incrementUseCase.execute({ slug: "csv-test" });

    const report = await exportUseCase.execute();

    expect(report.value.expiresIn).toBe(1800);
    expect(report.value.reportUrl).toContain("https://signed.example/reports/reports/");

    const parsedUrl = new URL(report.value.reportUrl);
    const fileKey = parsedUrl.pathname.replace(/^\/+/, "");
    const file = storage.getFile(fileKey);

    expect(file).toBeDefined();
    const csv = file?.toString("utf-8") ?? "";
    expect(csv).toContain("original_url,short_url,access_count,created_at");
    expect(csv).toContain("https://example.com,csv-test,1");
  });
});
