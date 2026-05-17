import { randomUUID } from "node:crypto";
import { createWriteStream, promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { stringify } from "csv-stringify";
import type { FileStorage } from "#app/lib/storage/file-storage";
import type { LinkModel } from "#app/models/link-model";

interface ReportServiceOptions {
  linkModel: LinkModel;
  fileStorage: FileStorage;
  bucketName: string;
  signedUrlExpiresInSeconds: number;
}

export class ReportService {
  constructor(private readonly options: ReportServiceOptions) {}

  async exportLinksCsv(): Promise<{ reportUrl: string; expiresIn: number }> {
    const filename = `${Date.now()}-${randomUUID()}.csv`;
    const storagePath = `reports/${filename}`;
    const tempFilePath = path.join(os.tmpdir(), filename);

    try {
      await this.options.fileStorage.ensurePrivateBucket(this.options.bucketName);

      const rows = Readable.from(this.options.linkModel.streamAllForReport());

      await pipeline(
        rows,
        stringify({
          header: true,
          columns: [
            { key: "originalUrl", header: "original_url" },
            { key: "shortUrl", header: "short_url" },
            { key: "accessCount", header: "access_count" },
            { key: "createdAt", header: "created_at" },
          ],
          cast: {
            date(value) {
              return value.toISOString();
            },
          },
        }),
        createWriteStream(tempFilePath),
      );

      const fileBuffer = await fs.readFile(tempFilePath);

      await this.options.fileStorage.uploadFile({
        bucket: this.options.bucketName,
        path: storagePath,
        body: fileBuffer,
        contentType: "text/csv; charset=utf-8",
      });

      const reportUrl = await this.options.fileStorage.createSignedUrl({
        bucket: this.options.bucketName,
        path: storagePath,
        expiresInSeconds: this.options.signedUrlExpiresInSeconds,
      });

      return {
        reportUrl,
        expiresIn: this.options.signedUrlExpiresInSeconds,
      };
    } finally {
      await fs.rm(tempFilePath, { force: true });
    }
  }
}
