import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useIncrementAccess, useResolveLink } from "@/hooks";

export function RedirectPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { mutateAsync: resolveLink } = useResolveLink();
  const { mutateAsync: incrementAccess } = useIncrementAccess();
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
        const { fullUrl } = await resolveLink({ slug: slugValue });

        if (cancelled || activeRunRef.current !== runId) {
          return;
        }

        setTargetUrl(fullUrl);
        await incrementAccess({ slug: slugValue });

        if (cancelled || activeRunRef.current !== runId) {
          return;
        }

        window.open(fullUrl, "_self");
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
  }, [incrementAccess, navigate, resolveLink, slug]);

  return (
    <main className="status-page">
      <section className="status-card">
        <img src="/logo-icon.svg" alt="" className="status-icon" />
        <h1 className="status-title">Redirecionando...</h1>
        <p className="status-text">O link será aberto automaticamente em alguns instantes.</p>
        <p className="status-text">
          Não foi redirecionado?{" "}
          <a href={targetUrl ?? "#"} className="status-link">
            Acesse aqui
          </a>
        </p>
      </section>
    </main>
  );
}
