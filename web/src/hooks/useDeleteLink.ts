import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LINKS_QUERY_KEY } from "@/hooks/useListLinks";
import type { AppError } from "@/lib/http";
import { toAppError } from "@/lib/http";
import { type LinkRepository, linkRepository } from "@/repositories/links.repository";

interface DeleteLinkInput {
  slug: string;
}

interface UseDeleteLinkOptions {
  repository?: LinkRepository;
}

export function useDeleteLink(options?: UseDeleteLinkOptions) {
  const queryClient = useQueryClient();
  const repository = options?.repository ?? linkRepository;

  return useMutation<void, AppError, DeleteLinkInput>({
    mutationFn: async ({ slug }) => {
      try {
        await repository.deleteBySlug(slug);
      } catch (error) {
        throw toAppError(error, {
          kind: "unknown",
          message: "Nao foi possivel remover o link.",
        });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY });
    },
  });
}
