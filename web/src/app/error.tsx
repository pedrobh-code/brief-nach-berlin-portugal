"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="conteudo" className="prose">
      <h1>Algo não correu bem.</h1>
      <p>
        Tenta novamente. Se tinhas um texto aberto, copia-o antes de atualizar a
        página.
      </p>
      <button className="button primary" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
