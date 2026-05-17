export function NotFoundPage() {
  return (
    <main className="status-page">
      <section className="status-card">
        <img src="/404.svg" alt="404" className="status-404" />
        <h1 className="status-title">Link não encontrado</h1>
        <p className="status-text">
          O link que você está tentando acessar não existe, foi removido ou é uma URL inválida.
          Saiba mais em{" "}
          <a href="/" className="status-link">
            brev.ly
          </a>
          .
        </p>
      </section>
    </main>
  );
}
