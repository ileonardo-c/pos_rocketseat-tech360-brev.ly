import type { FastifyInstance } from "fastify";
import z from "zod";
import type { AppUseCases } from "../use-cases.js";

const paramsSchema = z.object({
  shortUrl: z.string(),
});

export async function registerResolveLinkRoute(app: FastifyInstance, useCases: AppUseCases) {
  app.get("/urls/:shortUrl", async (request, reply) => {
    const parsed = paramsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({ message: "Invalid params" });
    }

    const result = await useCases.resolveLinkUseCase.execute({
      slug: parsed.data.shortUrl,
    });

    if (!result.ok) {
      return reply.status(404).send({ message: result.error.message });
    }

    return reply.status(200).send(result.value);
  });
}
