import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacidade" };
export default function Privacy() {
  return (
    <main id="conteudo" className="prose">
      <p className="eyebrow">TRANSPARÊNCIA</p>
      <h1>
        A tua carta.
        <br />
        Os teus dados.
      </h1>
      <p className="lead">
        Esta versão de teste foi desenhada para pedir o mínimo possível. Não
        precisas de criar conta e não mantemos um histórico das tuas cartas.
      </p>
      <h2>Antes de usares</h2>
      <p>
        O projeto está em fase de teste. O contacto temporário é{" "}
        <strong>test@test.com</strong>, um marcador de teste, não um canal de
        apoio validado. A identidade do responsável pelo tratamento e um
        contacto real terão de ser publicados antes do lançamento público. Evita
        inserir dados sensíveis ou informações que identifiquem outras pessoas.
      </p>
      <h2>O que acontece ao teu texto</h2>
      <ul>
        <li>
          Enquanto escreves, o assunto e o rascunho ficam na memória desta
          página. Não são guardados em cookies nem no armazenamento local do
          navegador.
        </li>
        <li>
          Ao aceitares e pedires um rascunho, o assunto, o destinatário
          escolhido e as preferências de escrita passam pelo servidor alojado na
          Olaia e são enviados ao OpenRouter, que encaminha o pedido para a
          Mistral ou, em caso de indisponibilidade temporária, para a Microsoft
          Azure, que disponibiliza o modelo alternativo GPT-4.1 Mini da OpenAI.
        </li>
        <li>
          A aplicação não guarda assuntos nem cartas numa base de dados e não
          regista o conteúdo em logs. A ausência de uma base de dados na
          aplicação não significa ausência de tratamento pelos fornecedores.
        </li>
        <li>
          O servidor usa identificadores técnicos transformados em hashes,
          temporariamente em memória, para limitar pedidos abusivos. Esses
          limites são apagados quando o processo reinicia ou os prazos expiram.
        </li>
      </ul>
      <h2>Email é opcional</h2>
      <p>
        Se pedires uma cópia, o endereço e o texto editado são enviados à
        infraestrutura de email transacional da Olaia. Não te inscrevemos em
        listas nem enviamos mensagens de acompanhamento. O fornecedor pode
        conservar registos técnicos de entrega. Podes sempre copiar, descarregar
        ou imprimir a carta sem indicar email.
      </p>
      <h2>Fornecedores e escolhas</h2>
      <p>
        O alojamento está configurado na região europeia disponibilizada pela
        Olaia. O OpenRouter intermedeia a geração de texto. A Mistral fornece o
        modelo principal e a Microsoft Azure disponibiliza o modelo alternativo
        GPT-4.1 Mini da OpenAI. Este percurso não garante tratamento exclusivo
        na União Europeia. Os termos, prazos de retenção, subcontratantes e
        eventuais transferências internacionais aplicáveis devem ser confirmados
        pelo operador nas respetivas contas antes de disponibilizar o serviço ao
        público.
      </p>
      <p>
        Consulta a{" "}
        <a href="https://openrouter.ai/privacy">
          política de privacidade do OpenRouter
        </a>
        . A aplicação solicita encaminhamento sem recolha de dados e com
        retenção zero no fornecedor do modelo. Estas preferências não substituem
        as políticas dos fornecedores. A configuração de utilização de dados
        para treino e de registo de pedidos no OpenRouter também deve ser
        revista na conta do operador.
      </p>
      <h2>Controlo e direitos</h2>
      <p>
        Podes desistir antes de gerar a carta, não usar email e apagar o texto
        ou fechar a página. Retirar a tua decisão não desfaz um pedido já
        enviado ao fornecedor. Não disponibilizamos contas nem uma área de
        histórico. Para pedidos de acesso, retificação, apagamento ou outras
        questões de proteção de dados, será necessário o contacto real do
        operador, ainda por definir nesta versão de teste. Podes consultar a{" "}
        <a href="https://www.cnpd.pt/">
          Comissão Nacional de Proteção de Dados
        </a>
        .
      </p>
      <h2>Sem publicidade nem análise de utilização</h2>
      <p>
        Esta aplicação não inclui publicidade, ferramentas de analytics ou
        cookies de rastreio. Os fornecedores de infraestrutura podem tratar
        dados de rede para operar e proteger o serviço.
      </p>
      <p className="quiet">
        Última atualização: 20 de novembro de 2026. Informação de teste; a
        identificação do operador está pendente.
      </p>
    </main>
  );
}
