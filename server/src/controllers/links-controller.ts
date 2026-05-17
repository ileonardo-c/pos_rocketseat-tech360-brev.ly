import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { HttpError } from "#app/services/http-error";
import type { LinkService } from "#app/services/link-service";
import type { ReportService } from "#app/services/report-service";

const createLinkBodySchema = z.object({
  originalUrl: z.string(),
  slug: z.string(),
});

const shortUrlParamsSchema = z.object({
  shortUrl: z.string(),
});

interface LinksControllerDeps {
  linkService: LinkService;
  reportService: ReportService;
}

export function createLinksController({ linkService, reportService }: LinksControllerDeps) {
  return {
    create: async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = createLinkBodySchema.safeParse(request.body);
      if (!parsed.success) {
        throw new HttpError(400, "Invalid payload");
      }

      await linkService.createLink(parsed.data);
      return reply.status(201).send();
    },

    list: async (_request: FastifyRequest, reply: FastifyReply) => {
      const links = await linkService.listLinks();
      return reply.status(200).send(links);
    },

    resolve: async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = shortUrlParamsSchema.safeParse(request.params);
      if (!parsed.success) {
        throw new HttpError(400, "Invalid params");
      }

      const result = await linkService.resolveLink(parsed.data.shortUrl);
      return reply.status(200).send(result);
    },

    increment: async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = shortUrlParamsSchema.safeParse(request.params);
      if (!parsed.success) {
        throw new HttpError(400, "Invalid params");
      }

      await linkService.incrementAccess(parsed.data.shortUrl);
      return reply.status(200).send();
    },

    delete: async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = shortUrlParamsSchema.safeParse(request.params);
      if (!parsed.success) {
        throw new HttpError(400, "Invalid params");
      }

      await linkService.deleteLinkByShortUrl(parsed.data.shortUrl);
      return reply.status(204).send();
    },

    exportCsv: async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await reportService.exportLinksCsv();
      return reply.status(200).send(result);
    },
  };
}
