import type { FastifyInstance } from "fastify";
import z from "zod";
import type { AppUseCases } from "../use-cases.js";

const paramsSchema = z.object({
  shortUrl: z.string(),
});

export async function registerDeleteLinkRoute(app: FastifyInstance, useCases: AppUseCases) {
  app.delete("/urls/:shortUrl", async (request, reply) => {
    const parsed = paramsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({ message: "Invalid params" });
    }

    await useCases.deleteLinkUseCase.execute({ slug: parsed.data.shortUrl });
    return reply.status(204).send();
  });
}
