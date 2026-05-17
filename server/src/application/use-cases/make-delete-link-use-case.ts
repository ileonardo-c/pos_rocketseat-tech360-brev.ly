import z from "zod";
import type { LinkRepository } from "../repositories/link-repository.js";
import { ok } from "../../shared/result.js";

const inputSchema = z.object({
  slug: z.string(),
});

type Input = z.input<typeof inputSchema>;

export function makeDeleteLinkUseCase(deps: { linkRepository: LinkRepository }) {
  return {
    async execute(input: Input) {
      const { slug } = inputSchema.parse(input);
      await deps.linkRepository.deleteBySlug(slug);
      return ok(null);
    },
  };
}
