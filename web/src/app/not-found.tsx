import Link from "next/link";
export default function NotFound() {
  return (
    <main id="conteudo" className="prose">
      <p className="eyebrow">PÁGINA NÃO ENCONTRADA</p>
      <h1>
        Esta página
        <br />
        não está aqui.
      </h1>
      <p>Podes voltar ao início ou começar a tua carta.</p>
      <Link href="/" className="button primary">
        Voltar ao início
      </Link>
    </main>
  );
}
