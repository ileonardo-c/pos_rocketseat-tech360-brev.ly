import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import { env } from "#app/lib/env";
import { InMemoryStorage } from "#app/lib/storage/in-memory-storage";
import { S3Storage } from "#app/lib/storage/s3-storage";
import { DrizzleLinkModel } from "#app/models/drizzle-link-model";
import { registerLinksRoutes } from "#app/routes/links-routes";
import { HttpError } from "#app/services/http-error";
import { LinkService } from "#app/services/link-service";
import { ReportService } from "#app/services/report-service";

export interface AppServices {
  linkService: LinkService;
  reportService: ReportService;
}

export function buildDefaultServices(): AppServices {
  const linkModel = new DrizzleLinkModel();
  const storage = env.FILE_STORAGE_DRIVER === "memory" ? new InMemoryStorage() : new S3Storage();

  return {
    linkService: new LinkService(linkModel),
    reportService: new ReportService({
      linkModel,
      fileStorage: storage,
      bucketName: env.AWS_S3_BUCKET,
      signedUrlExpiresInSeconds: env.REPORT_SIGNED_URL_EXPIRES_IN_SECONDS,
    }),
  };
}

export async function createApp(
  services: AppServices = buildDefaultServices(),
): Promise<FastifyInstance> {
  const app = Fastify();

  await app.register(cors, {
    origin: parseCorsOrigin(env.CORS_ORIGIN),
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.status).send({
        message: error.message,
        ...(error.field ? { field: error.field } : {}),
      });
    }

    if (error instanceof Error) {
      return reply.status(500).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Unexpected error" });
  });

  app.get("/health", async (_request, reply) => {
    return reply.status(200).send({ status: "ok" });
  });

  await registerLinksRoutes(app, services);
  return app;
}

function parseCorsOrigin(origin: string) {
  if (origin.trim() === "*") {
    return true;
  }

  const allowed = origin
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    requestOrigin: string | undefined,
    callback: (err: Error | null, allow: boolean) => void,
  ) => {
    if (!requestOrigin) {
      callback(null, true);
      return;
    }

    callback(null, allowed.includes(requestOrigin));
  };
}
