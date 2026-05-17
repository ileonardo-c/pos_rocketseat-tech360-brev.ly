import { makeCreateLinkUseCase } from "../../application/use-cases/make-create-link-use-case.js";
import { makeDeleteLinkUseCase } from "../../application/use-cases/make-delete-link-use-case.js";
import { makeExportLinksCsvUseCase } from "../../application/use-cases/make-export-links-csv-use-case.js";
import { makeIncrementAccessUseCase } from "../../application/use-cases/make-increment-access-use-case.js";
import { makeListLinksUseCase } from "../../application/use-cases/make-list-links-use-case.js";
import { makeResolveLinkUseCase } from "../../application/use-cases/make-resolve-link-use-case.js";
import { env } from "../../config/env.js";
import { DrizzleLinkRepository } from "../repositories/drizzle-link-repository.js";
import { InMemoryStorageRepository } from "../storage/in-memory-storage-repository.js";
import { SupabaseStorageRepository } from "../storage/supabase-storage-repository.js";

export function buildDefaultUseCases() {
  const linkRepository = new DrizzleLinkRepository();
  const storageRepository =
    env.FILE_STORAGE_DRIVER === "memory"
      ? new InMemoryStorageRepository()
      : new SupabaseStorageRepository();

  return {
    createLinkUseCase: makeCreateLinkUseCase({ linkRepository }),
    deleteLinkUseCase: makeDeleteLinkUseCase({ linkRepository }),
    resolveLinkUseCase: makeResolveLinkUseCase({ linkRepository }),
    listLinksUseCase: makeListLinksUseCase({ linkRepository }),
    incrementAccessUseCase: makeIncrementAccessUseCase({ linkRepository }),
    exportLinksCsvUseCase: makeExportLinksCsvUseCase({
      linkReportRepository: linkRepository,
      fileStorageRepository: storageRepository,
      bucketName: env.SUPABASE_STORAGE_BUCKET,
      signedUrlExpiresInSeconds: env.REPORT_SIGNED_URL_EXPIRES_IN_SECONDS,
    }),
  };
}

export type AppUseCases = ReturnType<typeof buildDefaultUseCases>;
