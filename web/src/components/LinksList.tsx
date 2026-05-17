import type { LinkItem } from "../features/links/api";

interface LinksListProps {
  items: LinkItem[];
  isLoading: boolean;
  isDeleting: boolean;
  deletingSlug: string | null;
  onDelete: (slug: string) => Promise<void>;
}

export function LinksList({ items, isLoading, isDeleting, deletingSlug, onDelete }: LinksListProps) {
  if (isLoading) {
    return (
      <section className="card">
        <h2 className="card-title">Meus Links</h2>
        <p className="muted">Carregando links...</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="card">
        <h2 className="card-title">Meus Links</h2>
        <p className="muted">Você ainda não cadastrou nenhum link.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2 className="card-title">Meus Links</h2>

      <ul className="link-list">
        {items.map((item) => (
          <li key={item.id} className="link-item">
            <div>
              <strong>{item.slug}</strong>
              <p>{item.originalUrl}</p>
            </div>
            <div className="link-actions">
              <span>{item.accessCount} acessos</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${item.slug}`)}
              >
                Copiar
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => onDelete(item.slug)}
                disabled={isDeleting && deletingSlug === item.slug}
              >
                {isDeleting && deletingSlug === item.slug ? "Removendo..." : "Excluir"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
