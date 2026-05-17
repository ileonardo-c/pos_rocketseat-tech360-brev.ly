import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="status-page">
      <section className="card status-card">
        <h1>Link não encontrado</h1>
        <p>A URL solicitada não existe, foi removida ou está inválida.</p>
        <Link to="/">Voltar para a página inicial</Link>
      </section>
    </main>
  );
}
