import type { FastifyInstance } from "fastify";
import type { AppUseCases } from "../use-cases.js";

export async function registerListLinksRoute(app: FastifyInstance, useCases: AppUseCases) {
  app.get("/urls", async (_, reply) => {
    const result = await useCases.listLinksUseCase.execute();
    return reply.status(200).send(result.value.links);
  });
}
