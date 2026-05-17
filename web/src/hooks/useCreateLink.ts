import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LINKS_QUERY_KEY } from "@/hooks/useListLinks";
import type { AppError } from "@/lib/http";
import { toAppError } from "@/lib/http";
import {
  type CreateLinkInput,
  type LinkRepository,
  linkRepository,
} from "@/repositories/links.repository";

interface UseCreateLinkOptions {
  repository?: LinkRepository;
}

export function useCreateLink(options?: UseCreateLinkOptions) {
  const queryClient = useQueryClient();
  const repository = options?.repository ?? linkRepository;

  return useMutation<void, AppError, CreateLinkInput>({
    mutationFn: async (input) => {
      try {
        await repository.create(input);
      } catch (error) {
        throw toAppError(error, {
          kind: "unknown",
          message: "Nao foi possivel criar o link.",
        });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY });
    },
  });
}
