import type { FastifyInstance } from "fastify";
import type { AppUseCases } from "../use-cases.js";

export async function registerExportReportRoute(app: FastifyInstance, useCases: AppUseCases) {
  app.get("/urls/report", async (_, reply) => {
    const result = await useCases.exportLinksCsvUseCase.execute();
    return reply.status(200).send(result.value);
  });
}
