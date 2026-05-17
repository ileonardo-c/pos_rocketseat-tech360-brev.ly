import type { FastifyInstance } from "fastify";
import z from "zod";
import type { AppUseCases } from "../use-cases.js";

const bodySchema = z.object({
  originalUrl: z.string(),
  slug: z.string(),
});

export async function registerCreateLinkRoute(app: FastifyInstance, useCases: AppUseCases) {
  app.post("/urls", async (request, reply) => {
    const parsed = bodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: "Invalid payload",
      });
    }

    const result = await useCases.createLinkUseCase.execute(parsed.data);

    if (!result.ok) {
      return reply.status(400).send({
        message: result.error.message,
        field: result.error.field,
        code: result.error.code,
      });
    }

    return reply.status(201).send();
  });
}
