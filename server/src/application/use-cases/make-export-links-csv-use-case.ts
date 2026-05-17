import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { stringify } from "csv-stringify";
import type { FileStorageRepository } from "../repositories/file-storage-repository.js";
import type { LinkReportRepository } from "../repositories/link-report-repository.js";
import { ok } from "../../shared/result.js";

interface Deps {
  linkReportRepository: LinkReportRepository;
  fileStorageRepository: FileStorageRepository;
  bucketName: string;
  signedUrlExpiresInSeconds: number;
}

export function makeExportLinksCsvUseCase(deps: Deps) {
  return {
    async execute() {
      const filename = `${Date.now()}-${randomUUID()}.csv`;
      const storagePath = `reports/${filename}`;
      const tempFilePath = path.join(os.tmpdir(), filename);

      try {
        await deps.fileStorageRepository.ensurePrivateBucket(deps.bucketName);

        const rows = Readable.from(deps.linkReportRepository.streamAllForReport());

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
        await deps.fileStorageRepository.uploadObject({
          bucket: deps.bucketName,
          path: storagePath,
          body: fileBuffer,
          contentType: "text/csv; charset=utf-8",
        });

        const reportUrl = await deps.fileStorageRepository.createSignedUrl({
          bucket: deps.bucketName,
          path: storagePath,
          expiresInSeconds: deps.signedUrlExpiresInSeconds,
        });

        return ok({
          reportUrl,
          expiresIn: deps.signedUrlExpiresInSeconds,
        });
      } finally {
        await fs.rm(tempFilePath, { force: true });
      }
    },
  };
}
