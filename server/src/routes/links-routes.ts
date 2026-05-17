import type { FastifyInstance } from "fastify";
import { createLinksController } from "#app/controllers/links-controller";
import type { LinkService } from "#app/services/link-service";
import type { ReportService } from "#app/services/report-service";

interface RegisterLinksRoutesDeps {
  linkService: LinkService;
  reportService: ReportService;
}

export async function registerLinksRoutes(
  app: FastifyInstance,
  deps: RegisterLinksRoutesDeps,
): Promise<void> {
  const controller = createLinksController(deps);

  app.post("/urls", controller.create);
  app.get("/urls", controller.list);
  app.get("/urls/:shortUrl", controller.resolve);
  app.post("/urls/:shortUrl/increment", controller.increment);
  app.delete("/urls/:shortUrl", controller.delete);
  app.get("/urls/report", controller.exportCsv);
}
