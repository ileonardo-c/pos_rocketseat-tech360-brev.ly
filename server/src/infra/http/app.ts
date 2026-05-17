import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import { env } from "../../config/env.js";
import { registerCreateLinkRoute } from "./routes/create-link-route.js";
import { registerDeleteLinkRoute } from "./routes/delete-link-route.js";
import { registerExportReportRoute } from "./routes/export-report-route.js";
import { registerIncrementAccessRoute } from "./routes/increment-access-route.js";
import { registerListLinksRoute } from "./routes/list-links-route.js";
import { registerResolveLinkRoute } from "./routes/resolve-link-route.js";
import { buildDefaultUseCases, type AppUseCases } from "./use-cases.js";

export async function createApp(useCases: AppUseCases = buildDefaultUseCases()): Promise<FastifyInstance> {
  const app = Fastify();

  await app.register(cors, {
    origin: parseCorsOrigin(env.CORS_ORIGIN),
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  });

  app.setErrorHandler((error, _, reply) => {
    if (error instanceof Error) {
      return reply.status(500).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Unexpected error" });
  });

  app.get("/health", async (_, reply) => {
    return reply.status(200).send({ status: "ok" });
  });

  await registerCreateLinkRoute(app, useCases);
  await registerDeleteLinkRoute(app, useCases);
  await registerResolveLinkRoute(app, useCases);
  await registerListLinksRoute(app, useCases);
  await registerIncrementAccessRoute(app, useCases);
  await registerExportReportRoute(app, useCases);

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

  return (requestOrigin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
    if (!requestOrigin) {
      callback(null, true);
      return;
    }

    callback(null, allowed.includes(requestOrigin));
  };
}
