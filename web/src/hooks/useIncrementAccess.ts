import { useMutation } from "@tanstack/react-query";
import type { AppError } from "@/lib/http";
import { toAppError } from "@/lib/http";
import { type LinkRepository, linkRepository } from "@/repositories/links.repository";

interface IncrementAccessInput {
  slug: string;
}

interface UseIncrementAccessOptions {
  repository?: LinkRepository;
}

export function useIncrementAccess(options?: UseIncrementAccessOptions) {
  const repository = options?.repository ?? linkRepository;

  return useMutation<void, AppError, IncrementAccessInput>({
    mutationFn: async ({ slug }) => {
      try {
        await repository.incrementAccess(slug);
      } catch (error) {
        throw toAppError(error, {
          kind: "unknown",
          message: "Nao foi possivel registrar o acesso do link.",
        });
      }
    },
  });
}
