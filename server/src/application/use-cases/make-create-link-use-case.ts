import z from "zod";
import type { LinkRepository } from "../repositories/link-repository.js";
import { slugPattern } from "../../domain/link.js";
import { err, ok, type Result } from "../../shared/result.js";
import type { CreateLinkErrorCode, UseCaseError } from "./errors.js";

const inputSchema = z.object({
  originalUrl: z.url(),
  slug: z.string().regex(slugPattern),
});

type Input = z.input<typeof inputSchema>;
type Output = { id: string; slug: string };

export function makeCreateLinkUseCase(deps: { linkRepository: LinkRepository }) {
  return {
    async execute(
      input: Input,
    ): Promise<Result<Output, UseCaseError<CreateLinkErrorCode>>> {
      const validation = inputSchema.safeParse(input);

      if (!validation.success) {
        const issue = validation.error.issues[0];
        if (issue?.path[0] === "originalUrl") {
          return err({
            code: "INVALID_URL",
            field: "originalUrl",
            message: "Invalid original URL",
          });
        }

        return err({
          code: "INVALID_SLUG",
          field: "slug",
          message: "Invalid slug format",
        });
      }

      const existing = await deps.linkRepository.findBySlug(validation.data.slug);

      if (existing) {
        return err({
          code: "DUPLICATE_SLUG",
          field: "slug",
          message: "Slug already exists",
        });
      }

      let created;
      try {
        created = await deps.linkRepository.create(validation.data);
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes("duplicate key") || error.message.includes("unique"))
        ) {
          return err({
            code: "DUPLICATE_SLUG",
            field: "slug",
            message: "Slug already exists",
          });
        }

        throw error;
      }

      return ok({
        id: created.id,
        slug: created.slug,
      });
    },
  };
}
