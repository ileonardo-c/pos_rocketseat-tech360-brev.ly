import { useMemo, useState } from "react";
import { LinksList } from "@/components/LinksList";
import { NewLinkForm, type NewLinkFormValues } from "@/components/NewLinkForm";
import { useCreateLink, useDeleteLink, useExportLinksCsv, useListLinks } from "@/hooks";
import type { AppError } from "@/lib/http";

function getCreateErrorMessage(error: AppError | null): string | undefined {
  if (!error) {
    return undefined;
  }

  if (error.kind === "validation") {
    if (error.field === "originalUrl") {
      return "Informe uma URL válida.";
    }

    if (error.field === "slug") {
      return "Use apenas letras, números, _ e -.";
    }

    return "Não foi possível validar os dados enviados.";
  }

  if (error.kind === "conflict" && error.field === "slug") {
    return "Esse encurtamento já existe.";
  }

  if (error.kind === "network") {
    return "Sem conexão. Tente novamente.";
  }

  if (error.kind === "server") {
    return "Erro interno. Tente novamente.";
  }

  return error.message || "Não foi possível criar o link.";
}

function getExportErrorMessage(error: AppError | null): string | undefined {
  if (!error) {
    return undefined;
  }

  if (error.kind === "network") {
    return "Sem conexão. Tente novamente.";
  }

  if (error.kind === "server") {
    return "Falha ao exportar relatório.";
  }

  return error.message || "Não foi possível gerar o relatório CSV.";
}

export function HomePage() {
  const { data: links = [], isLoading } = useListLinks();
  const createLink = useCreateLink();
  const deleteLink = useDeleteLink();
  const exportLinksCsv = useExportLinksCsv();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const hasLinks = useMemo(() => links.length > 0, [links.length]);
  const createErrorMessage = useMemo(
    () => getCreateErrorMessage(createLink.error ?? null),
    [createLink.error],
  );
  const exportErrorMessage = useMemo(
    () => getExportErrorMessage(exportLinksCsv.error ?? null),
    [exportLinksCsv.error],
  );

  async function handleCreate(values: NewLinkFormValues) {
    try {
      await createLink.mutateAsync(values);
    } catch {
      // Error is exposed by createLink.error for UI mapping.
    }
  }

  async function handleDelete(slug: string) {
    if (!window.confirm("Deseja remover esse link?")) {
      return;
    }

    setDeletingSlug(slug);
    try {
      await deleteLink.mutateAsync({ slug });
    } finally {
      setDeletingSlug(null);
    }
  }

  async function handleExport() {
    try {
      const report = await exportLinksCsv.mutateAsync();
      window.open(report.reportUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Error is exposed by exportLinksCsv.error for UI mapping.
    }
  }

  return (
    <main className="home-page">
      <section className="home-shell">
        <img src="/logo.svg" alt="brev.ly" className="home-logo" />
        <div className="home-grid">
          <NewLinkForm
            onCreate={handleCreate}
            isSubmitting={createLink.isPending}
            errorMessage={createErrorMessage}
          />

          <LinksList
            items={links}
            isLoading={isLoading}
            onDelete={handleDelete}
            isDeleting={deleteLink.isPending}
            deletingSlug={deletingSlug}
            onExport={handleExport}
            isExporting={exportLinksCsv.isPending}
            hasLinks={hasLinks}
            exportErrorMessage={exportErrorMessage}
          />
        </div>
      </section>
    </main>
  );
}
