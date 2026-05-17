import { useMutation } from "@tanstack/react-query";
import type { AppError } from "@/lib/http";
import { toAppError } from "@/lib/http";
import {
  type ExportLinksCsvOutput,
  type LinkRepository,
  linkRepository,
} from "@/repositories/links.repository";

interface UseExportLinksCsvOptions {
  repository?: LinkRepository;
}

export function useExportLinksCsv(options?: UseExportLinksCsvOptions) {
  const repository = options?.repository ?? linkRepository;

  return useMutation<ExportLinksCsvOutput, AppError, void>({
    mutationFn: async () => {
      try {
        return await repository.exportCsv();
      } catch (error) {
        throw toAppError(error, {
          kind: "unknown",
          message: "Nao foi possivel gerar o relatorio CSV.",
        });
      }
    },
  });
}
