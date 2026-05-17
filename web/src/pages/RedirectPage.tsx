import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { incrementAccess, resolveLink } from "../features/links/api";

export function RedirectPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const activeRunRef = useRef<symbol | null>(null);

  useEffect(() => {
    if (typeof slug !== "string" || slug.length === 0) {
      navigate("/not-found", { replace: true });
      return;
    }

    let cancelled = false;
    const slugValue: string = slug;
    const runId = Symbol(slugValue);
    activeRunRef.current = runId;

    async function run() {
      try {
        const { fullUrl } = await resolveLink(slugValue);

        if (cancelled || activeRunRef.current !== runId) {
          return;
        }

        setTargetUrl(fullUrl);
        await incrementAccess(slugValue);

        if (cancelled || activeRunRef.current !== runId) {
          return;
        }

        window.location.href = fullUrl;
      } catch {
        if (cancelled || activeRunRef.current !== runId) {
          return;
        }

        navigate("/not-found", { replace: true });
      }
    }

    run();

    return () => {
      cancelled = true;

      if (activeRunRef.current === runId) {
        activeRunRef.current = null;
      }
    };
  }, [navigate, slug]);

  return (
    <main className="status-page">
      <section className="card status-card">
        <h1>Redirecionando...</h1>
        <p>Estamos te enviando para o destino agora.</p>
        {targetUrl && (
          <p>
            Se nada acontecer, <a href={targetUrl}>clique aqui</a>.
          </p>
        )}
      </section>
    </main>
  );
}
