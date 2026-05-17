import z from "zod";
import type { LinkRepository } from "../repositories/link-repository.js";
import { err, ok, type Result } from "../../shared/result.js";
import type { ResolveLinkErrorCode, UseCaseError } from "./errors.js";

const inputSchema = z.object({
  slug: z.string(),
});

type Input = z.input<typeof inputSchema>;

export function makeResolveLinkUseCase(deps: { linkRepository: LinkRepository }) {
  return {
    async execute(
      input: Input,
    ): Promise<Result<{ fullUrl: string }, UseCaseError<ResolveLinkErrorCode>>> {
      const { slug } = inputSchema.parse(input);
      const link = await deps.linkRepository.findBySlug(slug);

      if (!link) {
        return err({
          code: "NOT_FOUND",
          message: "Short URL not found",
        });
      }

      return ok({ fullUrl: link.originalUrl });
    },
  };
}
