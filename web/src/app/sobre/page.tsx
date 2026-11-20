import type { Metadata } from "next";
import Link from "next/link";
import { PARLIAMENT_SOURCE, PARLIAMENT_CONTACTS } from "@/lib/config";
export const metadata: Metadata = { title: "Sobre e fontes" };
export default function About() {
  return (
    <main id="conteudo" className="prose">
      <p className="eyebrow">SOBRE O PROJETO</p>
      <h1>
        A democracia
        <br />
        também se escreve.
      </h1>
      <p className="lead">
        Carta à Assembleia ajuda-te a transformar uma preocupação numa carta
        pessoal a um deputado ou deputada da Assembleia da República.
      </p>
      <h2>Como funciona</h2>
      <ol>
        <li>
          Descreve um assunto que te preocupa, sem dados pessoais
          desnecessários.
        </li>
        <li>Escolhe o teu círculo eleitoral e uma pessoa a quem escrever.</li>
        <li>
          Pede um rascunho em português europeu, com apoio de inteligência
          artificial.
        </li>
        <li>
          Revê, personaliza, assina e envia a carta tu mesmo, por correio.
        </li>
      </ol>
      <p>
        Uma carta não garante uma resposta nem a resolução de um problema. É uma
        forma de participação e de diálogo. A tua opinião continua a ser tua.
      </p>
      <h2>Quem aparece na lista</h2>
      <p>
        A lista usa os{" "}
        <a href={PARLIAMENT_SOURCE}>
          dados abertos oficiais da Assembleia da República
        </a>
        . Inclui deputados em funções, por círculo eleitoral, ordenados
        alfabeticamente. Não classificamos partidos nem recomendamos pessoas com
        base nas tuas opiniões.
      </p>
      <p>
        Os 22 círculos incluem os distritos do continente, Açores, Madeira,
        Europa e Fora da Europa. Os deputados representam todo o país; o círculo
        é uma forma de encontrares os eleitos pela tua área de recenseamento,
        não uma garantia de competência exclusiva.
      </p>
      <p>
        O servidor procura atualizar os dados de seis em seis horas, quando é
        usado. Se a última informação validada tiver mais de sete dias, a
        seleção deixa de estar disponível. Confirma sempre o{" "}
        <a href="https://www.parlamento.pt/DeputadoGP/">perfil oficial</a> e a{" "}
        <a href={PARLIAMENT_CONTACTS}>morada de correspondência</a> antes de
        enviar.
      </p>
      <h2>O que esta versão cobre</h2>
      <p>
        Apenas a Assembleia da República. Não inclui câmaras municipais, juntas
        de freguesia, assembleias regionais ou Parlamento Europeu. Um deputado
        pode levantar um problema político, mas não substitui os serviços
        responsáveis por resolver um processo individual.
      </p>
      <h2>IA para ajudar a escrever</h2>
      <p>
        O rascunho é gerado através do OpenRouter, com o modelo Mistral Large e,
        se este estiver temporariamente indisponível, GPT-4.1 Mini da OpenAI,
        disponibilizado pela Microsoft Azure. Pode conter erros, omissões ou
        formulações que não representam o que queres dizer. Corrige-o e remove
        qualquer informação que não reconheças. A aplicação nunca envia cartas
        automaticamente a representantes políticos.
      </p>
      <h2>Origem, licença e contacto</h2>
      <p>
        Adaptação independente do projeto{" "}
        <a href="https://github.com/tholo91/brief-nach-berlin">
          Brief-nach-Berlin
        </a>
        , criado por Thomas Lorenz. O código mantém a licença MIT e os
        respetivos avisos. A informação parlamentar provém da fonte oficial
        identificada; a aplicação não reivindica direitos exclusivos sobre esses
        dados nem usa fotografias dos deputados.
      </p>
      <p>
        Não existe afiliação à Assembleia da República ou a partidos políticos.
        Versão de teste com contacto temporário <strong>test@test.com</strong>.
        O operador e o contacto público definitivo estão por identificar.
      </p>
      <Link href="/escrever" className="button primary">
        Começar a minha carta
      </Link>
    </main>
  );
}
