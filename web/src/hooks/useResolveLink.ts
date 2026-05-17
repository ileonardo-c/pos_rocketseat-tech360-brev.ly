import { useMutation } from "@tanstack/react-query";
import type { AppError } from "@/lib/http";
import { toAppError } from "@/lib/http";
import {
  type LinkRepository,
  linkRepository,
  type ResolveLinkOutput,
} from "@/repositories/links.repository";

interface ResolveLinkInput {
  slug: string;
}

interface UseResolveLinkOptions {
  repository?: LinkRepository;
}

export function useResolveLink(options?: UseResolveLinkOptions) {
  const repository = options?.repository ?? linkRepository;

  return useMutation<ResolveLinkOutput, AppError, ResolveLinkInput>({
    mutationFn: async ({ slug }) => {
      try {
        return await repository.resolveBySlug(slug);
      } catch (error) {
        throw toAppError(error, {
          kind: "notFound",
          message: "Link nao encontrado.",
        });
      }
    },
  });
}
