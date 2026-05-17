import axios from "axios";
import { useMemo, useState } from "react";
import { LinksList } from "../components/LinksList";
import { NewLinkForm, type NewLinkFormValues } from "../components/NewLinkForm";
import {
  useCreateLinkMutation,
  useDeleteLinkMutation,
  useExportLinksCsvMutation,
  useLinksQuery,
} from "../features/links/hooks";

export function HomePage() {
  const { data: links = [], isLoading } = useLinksQuery();
  const createMutation = useCreateLinkMutation();
  const deleteMutation = useDeleteLinkMutation();
  const exportMutation = useExportLinksCsvMutation();
  const [createError, setCreateError] = useState<string | undefined>();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const hasLinks = useMemo(() => links.length > 0, [links.length]);

  async function handleCreate(values: NewLinkFormValues) {
    setCreateError(undefined);
    try {
      await createMutation.mutateAsync(values);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message;
        setCreateError(serverMessage ?? "Não foi possível criar o link.");
        return;
      }
      setCreateError("Erro inesperado ao criar link.");
    }
  }

  async function handleDelete(slug: string) {
    if (!window.confirm("Deseja remover esse link?")) {
      return;
    }

    setDeletingSlug(slug);
    try {
      await deleteMutation.mutateAsync(slug);
    } finally {
      setDeletingSlug(null);
    }
  }

  async function handleExport() {
    const report = await exportMutation.mutateAsync();
    window.open(report.reportUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="page">
      <header className="header">
        <h1>Brevly</h1>
        <p>Gerencie links encurtados com performance e simplicidade.</p>
      </header>

      <section className="grid">
        <NewLinkForm
          onCreate={handleCreate}
          isSubmitting={createMutation.isPending}
          errorMessage={createError}
        />

        <div className="actions-wrapper">
          <div className="card card-header">
            <h2 className="card-title">Relatório</h2>
            <button type="button" disabled={!hasLinks || exportMutation.isPending} onClick={handleExport}>
              {exportMutation.isPending ? "Gerando..." : "Baixar CSV"}
            </button>
          </div>

          <LinksList
            items={links}
            isLoading={isLoading}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
            deletingSlug={deletingSlug}
          />
        </div>
      </section>
    </main>
  );
}
