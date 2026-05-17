import { describe, expect, it } from "vitest";
import { InMemoryStorage } from "#app/lib/storage/in-memory-storage";
import { InMemoryLinkModel } from "#app/models/in-memory-link-model";
import { LinkService } from "#app/services/link-service";
import { ReportService } from "#app/services/report-service";

describe("ReportService", () => {
  it("exports links to CSV with unique filename and signed URL", async () => {
    const linkModel = new InMemoryLinkModel();
    const storage = new InMemoryStorage();
    const linkService = new LinkService(linkModel);
    const reportService = new ReportService({
      linkModel,
      fileStorage: storage,
      bucketName: "reports",
      signedUrlExpiresInSeconds: 1800,
    });

    await linkService.createLink({
      originalUrl: "https://example.com",
      slug: "csv-test",
    });
    await linkService.incrementAccess("csv-test");

    const firstReport = await reportService.exportLinksCsv();
    const secondReport = await reportService.exportLinksCsv();

    expect(firstReport.expiresIn).toBe(1800);
    expect(firstReport.reportUrl).toContain("https://signed.example/reports/reports/");
    expect(secondReport.reportUrl).not.toBe(firstReport.reportUrl);

    const fileKey = new URL(firstReport.reportUrl).pathname.replace(/^\/+/, "");
    const file = storage.getFile(fileKey);
    expect(file).toBeDefined();

    const csv = file?.toString("utf-8") ?? "";
    expect(csv).toContain("original_url,short_url,access_count,created_at");
    expect(csv).toContain("https://example.com,csv-test,1");
  });
});
