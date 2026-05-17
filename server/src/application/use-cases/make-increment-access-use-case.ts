import z from "zod";
import type { LinkRepository } from "../repositories/link-repository.js";
import { err, ok, type Result } from "../../shared/result.js";
import type { IncrementAccessErrorCode, UseCaseError } from "./errors.js";

const inputSchema = z.object({
  slug: z.string(),
});

type Input = z.input<typeof inputSchema>;

export function makeIncrementAccessUseCase(deps: { linkRepository: LinkRepository }) {
  return {
    async execute(
      input: Input,
    ): Promise<Result<null, UseCaseError<IncrementAccessErrorCode>>> {
      const { slug } = inputSchema.parse(input);
      const updated = await deps.linkRepository.incrementAccessCount(slug);

      if (!updated) {
        return err({
          code: "NOT_FOUND",
          message: "Short URL not found",
        });
      }

      return ok(null);
    },
  };
}
