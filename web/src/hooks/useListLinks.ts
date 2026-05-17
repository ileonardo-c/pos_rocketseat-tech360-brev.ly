import { useQuery } from "@tanstack/react-query";
import type { AppError } from "@/lib/http";
import { toAppError } from "@/lib/http";
import { type Link, type LinkRepository, linkRepository } from "@/repositories/links.repository";

const LINKS_QUERY_KEY = ["links"] as const;

interface UseListLinksOptions {
  repository?: LinkRepository;
}

export function useListLinks(options?: UseListLinksOptions) {
  const repository = options?.repository ?? linkRepository;

  return useQuery<Link[], AppError>({
    queryKey: LINKS_QUERY_KEY,
    queryFn: async () => {
      try {
        return await repository.listAll();
      } catch (error) {
        throw toAppError(error, {
          kind: "unknown",
          message: "Nao foi possivel carregar os links.",
        });
      }
    },
  });
}

export { LINKS_QUERY_KEY };
