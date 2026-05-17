import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useIncrementAccessMutation, useResolveLinkMutation } from "../features/links/hooks";

export function RedirectPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const resolveMutation = useResolveLinkMutation();
  const incrementMutation = useIncrementAccessMutation();
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    if (typeof slug !== "string" || slug.length === 0) {
      navigate("/not-found", { replace: true });
      return;
    }
    const slugValue: string = slug;

    async function run() {
      try {
        const { fullUrl } = await resolveMutation.mutateAsync(slugValue);
        setTargetUrl(fullUrl);
        await incrementMutation.mutateAsync(slugValue);
        window.location.href = fullUrl;
      } catch {
        navigate("/not-found", { replace: true });
      }
    }

    run();
  }, [incrementMutation, navigate, resolveMutation, slug]);

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
