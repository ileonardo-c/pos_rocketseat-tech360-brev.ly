import {
  CheckIcon,
  CopyIcon,
  DownloadSimpleIcon,
  LinkIcon,
  SpinnerIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { Link } from "@/repositories/links.repository";

interface LinksListProps {
  items: Link[];
  isLoading: boolean;
  isDeleting: boolean;
  deletingSlug: string | null;
  hasLinks: boolean;
  isExporting: boolean;
  exportErrorMessage?: string;
  onDelete: (slug: string) => Promise<void>;
  onExport: () => Promise<void>;
}

function formatShortUrl(slug: string): string {
  const shortBase = (import.meta.env.VITE_SHORT_BASE_URL ?? "brev.ly").replace(/\/+$/g, "");
  return `${shortBase}/${slug}`;
}

function truncateUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "");
}

export function LinksList({
  items,
  isLoading,
  isDeleting,
  deletingSlug,
  hasLinks,
  isExporting,
  exportErrorMessage,
  onDelete,
  onExport,
}: LinksListProps) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copyErrorMessage, setCopyErrorMessage] = useState<string | null>(null);
  const showEmpty = useMemo(() => !isLoading && items.length === 0, [isLoading, items.length]);

  async function handleCopy(slug: string) {
    try {
      const shortUrl = formatShortUrl(slug);
      await navigator.clipboard.writeText(shortUrl);
      setCopyErrorMessage(null);
      setCopiedSlug(slug);

      window.setTimeout(() => {
        setCopiedSlug((current) => (current === slug ? null : current));
      }, 1500);
    } catch {
      setCopiedSlug(null);
      setCopyErrorMessage("Não foi possível copiar o link. Tente novamente.");
    }
  }

  return (
    <section className="panel links-panel">
      <header className="links-header">
        <h2 className="panel-title">Meus links</h2>
        <button
          type="button"
          className="secondary-btn"
          disabled={!hasLinks || isExporting}
          onClick={onExport}
        >
          {isExporting ? (
            <SpinnerIcon size={18} className="spin" />
          ) : (
            <DownloadSimpleIcon size={18} />
          )}
          <span>{isExporting ? "Gerando..." : "Baixar CSV"}</span>
        </button>
      </header>

      {exportErrorMessage && <p className="form-error links-export-error">{exportErrorMessage}</p>}
      {copyErrorMessage && <p className="form-error links-export-error">{copyErrorMessage}</p>}

      <div className="links-content">
        {isLoading && (
          <div className="links-loading">
            <SpinnerIcon size={24} className="spin" />
            <p>Carregando links...</p>
          </div>
        )}

        {showEmpty && (
          <div className="links-empty">
            <LinkIcon size={36} />
            <p>Ainda não existem links cadastrados</p>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <ul className="link-list">
            {items.map((item) => {
              const isItemDeleting = isDeleting && deletingSlug === item.slug;
              const isCopied = copiedSlug === item.slug;

              return (
                <li key={item.id} className="link-item">
                  <div className="link-item-main">
                    <a
                      className="link-short-url"
                      href={`/${item.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {formatShortUrl(item.slug)}
                    </a>
                    <p className="link-original-url" title={item.originalUrl}>
                      {truncateUrl(item.originalUrl)}
                    </p>
                  </div>

                  <div className="link-item-actions">
                    <span className="link-access-count">{item.accessCount} acessos</span>
                    <div className="link-action-buttons">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => handleCopy(item.slug)}
                        aria-label="Copiar link"
                      >
                        {isCopied ? <CheckIcon size={18} weight="bold" /> : <CopyIcon size={18} />}
                      </button>

                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => onDelete(item.slug)}
                        disabled={isItemDeleting}
                        aria-label="Excluir link"
                      >
                        {isItemDeleting ? (
                          <SpinnerIcon size={18} className="spin" />
                        ) : (
                          <TrashIcon size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
