import type { Metadata } from "next";
import Link from "next/link";
import Brand from "@/components/Brand";
import { APP_NAME, APP_URL } from "@/lib/config";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — A tua voz, por escrito.`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Transforma uma preocupação numa carta pessoal a um deputado da Assembleia da República. Escolhe, escreve, revê e envia tu mesmo.",
  robots: { index: false, follow: false }, // Test contact: keep previews out of search until the operator is identified.
  openGraph: {
    title: APP_NAME,
    description: "A tua voz, por escrito.",
    locale: "pt_PT",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT">
      <body>
        <a className="skip-link" href="#conteudo">
          Saltar para o conteúdo
        </a>
        <header className="site-header">
          <Brand />
          <nav aria-label="Navegação principal">
            <Link href="/sobre">Como funciona</Link>
            <Link className="nav-cta" href="/escrever">
              Escrever uma carta
            </Link>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div>
            <Brand />
            <p>
              Uma iniciativa independente.
              <br />A democracia também se escreve.
            </p>
          </div>
          <div className="footer-links">
            <Link href="/sobre">Sobre e fontes</Link>
            <Link href="/privacidade">Privacidade</Link>
            <a href="https://github.com/pedrobh-code/brief-nach-berlin-portugal">
              Código aberto
            </a>
          </div>
          <p className="footer-note">
            Adaptado de{" "}
            <a href="https://github.com/tholo91/brief-nach-berlin">
              Brief-nach-Berlin
            </a>
            , de Thomas Lorenz.
            <br />
            Não representa a Assembleia da República. Versão de teste.
          </p>
        </footer>
      </body>
    </html>
  );
}
