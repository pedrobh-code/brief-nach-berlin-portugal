import Link from "next/link";
import { Envelope } from "@/components/Brand";
export default function Home() {
  return (
    <main id="conteudo">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">PARTICIPAÇÃO CÍVICA · PORTUGAL</p>
          <h1>
            A tua voz merece
            <br />
            mais do que
            <br />
            <em>um comentário.</em>
          </h1>
          <p className="hero-description">
            Há um assunto que não te sai da cabeça?
            <br />
            Transforma-o numa carta a quem te representa na Assembleia da
            República.
          </p>
          <Link className="button primary" href="/escrever">
            Começar a minha carta <Envelope />
          </Link>
          <p className="quiet hero-reassurance">
            Sem conta. Sem filiação. Com as tuas palavras.
          </p>
        </div>
        <div className="letter-scene" aria-hidden="true">
          <div className="postmark">
            PORTUGAL
            <br />
            <span>CORREIO CÍVICO</span>
            <div>✳</div>
          </div>
          <div className="envelope-back" />
          <div className="hero-letter">
            <div className="letter-topline">
              <span>CARTA À ASSEMBLEIA</span>
              <span>PT</span>
            </div>
            <div className="paper-rule" />
            <p className="paper-to">À atenção de quem me representa,</p>
            <p>
              Escrevo-lhe porque acredito
              <br />
              que podemos fazer melhor.
            </p>
            <p>
              O que acontece na minha rua,
              <br />
              na minha escola e na minha vida
              <br />
              também merece ser ouvido.
            </p>
            <div className="hand-signature">A minha voz conta.</div>
            <div className="letter-strokes">
              <i />
              <i />
            </div>
          </div>
          <div className="envelope-front">
            <span>UMA IDEIA. UMA CARTA. A TUA VOZ.</span>
          </div>
          <div className="scene-caption">
            Do que te preocupa
            <br />
            <em>ao que podes fazer.</em>
          </div>
        </div>
      </section>
      <section className="principles" aria-label="Princípios">
        <span>As tuas ideias, respeitadas</span>
        <span>Deputados de todos os partidos</span>
        <span>Tu revês. Tu decides. Tu envias.</span>
      </section>
      <section className="how-section" id="como-funciona">
        <div className="section-heading">
          <p className="eyebrow">DA PREOCUPAÇÃO À PARTICIPAÇÃO</p>
          <h2>
            Uma carta começa
            <br />
            com o que tens a dizer.
          </h2>
        </div>
        <div className="how-grid">
          <article>
            <span className="step-label">O ASSUNTO</span>
            <h3>Conta o que te preocupa.</h3>
            <p>
              Uma experiência, uma ideia ou algo que gostavas de ver mudar. Não
              precisas de saber escrever uma carta formal.
            </p>
          </article>
          <article>
            <span className="step-label">A PESSOA</span>
            <h3>Escolhe a quem escrever.</h3>
            <p>
              Consulta os deputados eleitos pelo teu círculo e escolhe o
              destinatário. Os dados vêm da Assembleia da República.
            </p>
          </article>
          <article>
            <span className="step-label">A TUA CARTA</span>
            <h3>Dá-lhe o teu toque.</h3>
            <p>
              A IA ajuda com um rascunho. Tu corriges, personalizas e assinas.
              Depois, escreve à mão ou imprime e envia por correio.
            </p>
          </article>
        </div>
      </section>
      <section className="closing-note">
        <Envelope />
        <div>
          <h2>Não precisas de ter todas as respostas.</h2>
          <p>
            Basta teres algo a dizer. Uma carta é uma forma de abrir a conversa.
          </p>
        </div>
        <Link className="button secondary" href="/escrever">
          Escrever a minha carta
        </Link>
      </section>
    </main>
  );
}
