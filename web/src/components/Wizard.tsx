"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ParliamentData, Representative } from "@/lib/lookup/parliament";
import type { LetterInput } from "@/lib/validation";
import { POSTAL_ADDRESS, PARLIAMENT_CONTACTS } from "@/lib/config";
import { Envelope } from "./Brand";
const steps = ["O teu assunto", "O destinatário", "A tua carta"];
export default function Wizard() {
  const [step, setStep] = useState(0);
  const [issue, setIssue] = useState("");
  const [data, setData] = useState<ParliamentData | null>(null);
  const [dataError, setDataError] = useState("");
  const [constituencyId, setConstituency] = useState("");
  const [recipientId, setRecipient] = useState("");
  const [tone, setTone] = useState<LetterInput["tone"]>("cordial");
  const [length, setLength] = useState<LetterInput["length"]>("normal");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [letter, setLetter] = useState("");
  const [ticket, setTicket] = useState("");
  const [chosen, setChosen] = useState<Representative | null>(null);
  const [email, setEmail] = useState("");
  const [emailConsent, setEmailConsent] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState("");
  const titleRef = useRef<HTMLHeadingElement>(null);
  async function loadData() {
    try {
      const response = await fetch("/api/representatives");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setData(payload);
      setDataError("");
    } catch {
      setDataError(
        "Não conseguimos confirmar os deputados neste momento. Tenta novamente.",
      );
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/representatives", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        return response.json();
      })
      .then((payload) => setData(payload))
      .catch(() => {
        if (!controller.signal.aborted)
          setDataError(
            "Não conseguimos confirmar os deputados neste momento. Tenta novamente.",
          );
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    titleRef.current?.focus();
  }, [step]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (issue || letter) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [issue, letter]);
  const candidates =
    data?.representatives.filter((p) => p.constituencyId === constituencyId) ??
    [];
  const selected = candidates.find((p) => p.id === recipientId);
  const constituency = data?.constituencies.find(
    (c) => c.id === constituencyId,
  );
  function changeStep(next: number) {
    setError("");
    setNotice("");
    setStep(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await fetch("/api/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue,
          constituencyId,
          representativeId: recipientId,
          tone,
          length,
          consent,
        }),
        signal: AbortSignal.timeout(75000),
      });
      const payload = await r.json();
      if (!r.ok) throw new Error(payload.error);
      setLetter(payload.letter);
      setTicket(payload.ticket);
      setChosen(payload.recipient);
      setSent(false);
      changeStep(2);
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "TimeoutError"
          ? e.message
          : "O pedido demorou demasiado. O teu texto foi mantido; tenta novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([letter], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "carta-a-assembleia.txt";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Carta descarregada.");
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(letter);
      setNotice("Carta copiada.");
    } catch {
      setNotice(
        "Não foi possível copiar automaticamente. Seleciona o texto ou descarrega a carta.",
      );
    }
  }
  async function send(e: React.FormEvent) {
    e.preventDefault();
    setEmailBusy(true);
    setError("");
    try {
      const r = await fetch("/api/send-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, letter, ticket, consent: emailConsent }),
        signal: AbortSignal.timeout(25000),
      });
      const p = await r.json();
      if (!r.ok) throw new Error(p.error);
      setSent(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível enviar. Podes descarregar a carta.",
      );
    } finally {
      setEmailBusy(false);
    }
  }
  return (
    <>
      <div className="wizard-intro">
        <p className="eyebrow">UMA CARTA PESSOAL. UMA VOZ QUE CONTA.</p>
        <ol className="stepper" aria-label="Progresso">
          {steps.map((s, i) => (
            <li
              key={s}
              className={step === i ? "active" : step > i ? "complete" : ""}
              aria-current={step === i ? "step" : undefined}
            >
              <span>{step > i ? "✓" : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
      <div className="wizard-layout">
        <section className="wizard-panel" aria-busy={busy}>
          {step === 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                changeStep(1);
              }}
            >
              <p className="eyebrow">COMEÇA PELAS TUAS PALAVRAS</p>
              <h1 ref={titleRef} tabIndex={-1}>
                O que gostavas
                <br />
                de ver mudar?
              </h1>
              <p>
                Conta o que te preocupa e o que gostavas de pedir. Não precisas
                de encontrar as palavras certas já.
              </p>
              <label className="field-label" htmlFor="issue">
                O teu assunto
              </label>
              <textarea
                id="issue"
                rows={8}
                minLength={30}
                maxLength={3000}
                required
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="O que está a acontecer? Porque é importante para ti? O que gostavas que mudasse?"
                aria-describedby="issue-help"
              />
              <div className="field-meta">
                <span id="issue-help">
                  Pelo menos 30 caracteres. Evita dados pessoais sensíveis.
                </span>
                <span>{issue.length}/3000</span>
              </div>
              <p className="hint">
                Por exemplo: habitação, transportes, acesso à saúde ou educação.
                Uma experiência concreta ajuda mais do que um slogan.
              </p>
              <div className="form-actions">
                <span className="quiet">
                  O texto fica nesta página até pedires o rascunho.
                </span>
                <button
                  className="button primary"
                  type="submit"
                  disabled={issue.trim().length < 30}
                >
                  Escolher destinatário
                </button>
              </div>
            </form>
          )}
          {step === 1 && (
            <form onSubmit={generate}>
              <p className="eyebrow">A QUEM QUERES ESCREVER?</p>
              <h1 ref={titleRef} tabIndex={-1}>
                Escolhe quem
                <br />
                vai receber a carta.
              </h1>
              <p>
                Esta versão ajuda-te a escrever a deputados da Assembleia da
                República. A escolha é tua, entre todos os partidos.
              </p>
              {dataError ? (
                <div className="alert" role="alert">
                  {dataError}
                  <button
                    type="button"
                    className="text-button"
                    onClick={loadData}
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : !data ? (
                <p role="status">A confirmar a lista oficial de deputados…</p>
              ) : (
                <>
                  <label className="field-label" htmlFor="constituency">
                    O teu círculo eleitoral
                  </label>
                  <select
                    id="constituency"
                    required
                    value={constituencyId}
                    onChange={(e) => {
                      setConstituency(e.target.value);
                      setRecipient("");
                    }}
                  >
                    <option value="">
                      Escolhe o distrito, região ou círculo do estrangeiro
                    </option>
                    {data.constituencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <p className="field-help">
                    Escolhe o círculo onde estás recenseado/a. Nos Açores e na
                    Madeira, escolhe a região; no estrangeiro, Europa ou Fora da
                    Europa. Não inferimos o círculo a partir da tua localização.
                  </p>
                  {constituencyId && (
                    <>
                      <label className="field-label" htmlFor="recipient">
                        Deputado ou deputada
                      </label>
                      <select
                        id="recipient"
                        required
                        value={recipientId}
                        onChange={(e) => setRecipient(e.target.value)}
                      >
                        <option value="">
                          Escolhe uma pessoa ({candidates.length} disponíveis)
                        </option>
                        {candidates.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} · {p.party}
                          </option>
                        ))}
                      </select>
                      <p className="field-help">
                        Por ordem alfabética, sem recomendações partidárias.
                      </p>
                    </>
                  )}
                  {selected && (
                    <div className="recipient-card">
                      <span className="recipient-initials" aria-hidden="true">
                        {selected.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <div>
                        <strong>{selected.name}</strong>
                        <p>
                          {selected.party} · {constituency?.name}
                        </p>
                        <a
                          href={selected.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver perfil no Parlamento
                        </a>
                      </div>
                    </div>
                  )}
                  <p className="data-date">
                    Fonte:{" "}
                    <a href={data.sourceUrl} target="_blank" rel="noreferrer">
                      Assembleia da República
                    </a>{" "}
                    · Dados de{" "}
                    {new Date(
                      data.sourceDate + "T12:00:00Z",
                    ).toLocaleDateString("pt-PT")}
                    .
                  </p>
                </>
              )}
              <div className="field-grid">
                <div>
                  <label className="field-label" htmlFor="tone">
                    Tom da carta
                  </label>
                  <select
                    id="tone"
                    value={tone}
                    onChange={(e) =>
                      setTone(e.target.value as LetterInput["tone"])
                    }
                  >
                    <option value="cordial">Cordial e construtivo</option>
                    <option value="direto">Direto e concreto</option>
                    <option value="firme">Firme e respeitoso</option>
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="length">
                    Extensão
                  </label>
                  <select
                    id="length"
                    value={length}
                    onChange={(e) =>
                      setLength(e.target.value as LetterInput["length"])
                    }
                  >
                    <option value="curta">
                      Curta · cerca de 1 página à mão
                    </option>
                    <option value="normal">
                      Normal · cerca de 1–2 páginas à mão
                    </option>
                  </select>
                </div>
              </div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  Aceito enviar o meu texto ao OpenRouter e ao fornecedor do
                  modelo para criar o rascunho. Li a{" "}
                  <Link href="/privacidade" target="_blank">
                    informação de privacidade
                  </Link>
                  .
                </span>
              </label>
              <div className="form-actions">
                <button
                  type="button"
                  className="text-button"
                  disabled={busy}
                  onClick={() => changeStep(0)}
                >
                  Voltar ao meu texto
                </button>
                <button
                  type="submit"
                  className="button primary"
                  disabled={!selected || !consent || busy}
                >
                  {busy ? "A preparar a tua carta…" : "Criar o meu rascunho"}
                </button>
              </div>
              {busy && (
                <p role="status" className="hint">
                  Pode demorar alguns segundos. A carta não é enviada a ninguém.
                </p>
              )}
            </form>
          )}
          {step === 2 && (
            <>
              <p className="eyebrow">AGORA, DÁ-LHE A TUA VOZ</p>
              <h1 ref={titleRef} tabIndex={-1}>
                O rascunho está pronto.
                <br />A carta é tua.
              </h1>
              <p>
                Revê os factos, ajusta a saudação e substitui{" "}
                <strong>[O teu nome]</strong>. Acrescenta só os dados que queres
                partilhar.
              </p>
              <label className="field-label" htmlFor="letter">
                A tua carta — podes editar tudo
              </label>
              <textarea
                className="letter-editor"
                id="letter"
                rows={20}
                maxLength={12000}
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                spellCheck
                lang="pt-PT"
              />
              <div className="output-actions">
                <button className="button primary" onClick={copy}>
                  Copiar carta
                </button>
                <button className="button secondary" onClick={download}>
                  Descarregar .txt
                </button>
                <button
                  className="button secondary"
                  onClick={() => window.print()}
                >
                  Imprimir / PDF
                </button>
              </div>
              <p role="status" className="status-text">
                {notice}
              </p>
              <details className="email-details">
                <summary>Receber uma cópia por email</summary>
                {sent ? (
                  <p role="status">
                    Pedido de envio aceite. Verifica a tua caixa de entrada e o
                    spam. A entrega pode demorar alguns minutos.
                  </p>
                ) : (
                  <form onSubmit={send}>
                    <label className="field-label" htmlFor="email">
                      O teu email
                    </label>
                    <input
                      type="email"
                      id="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        required
                        checked={emailConsent}
                        onChange={(e) => setEmailConsent(e.target.checked)}
                      />
                      <span>
                        Este email é meu e quero receber uma cópia através da
                        Olaia. O texto da carta e o endereço serão tratados para
                        este envio.
                      </span>
                    </label>
                    <button
                      type="submit"
                      className="button secondary"
                      disabled={!emailConsent || emailBusy}
                    >
                      {emailBusy ? "A enviar…" : "Enviar a minha cópia"}
                    </button>
                  </form>
                )}
              </details>
              <button
                className="text-button revise-button"
                onClick={() => changeStep(1)}
              >
                Voltar e preparar outro rascunho
              </button>
              <div className="print-letter">{letter}</div>
            </>
          )}
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
        </section>
        <aside className="wizard-aside">
          <Envelope />
          <h2>
            {step === 2
              ? "O próximo passo é teu."
              : "Uma carta pode abrir uma conversa."}
          </h2>
          {step === 2 ? (
            <>
              <p>
                Escreve à mão ou imprime. Assina e envia por correio, com
                franquia adequada.
              </p>
              <div className="postal-address">
                <strong>À atenção de {chosen?.name}</strong>
                <br />
                {POSTAL_ADDRESS}
              </div>
              <a href={PARLIAMENT_CONTACTS} target="_blank" rel="noreferrer">
                Confirmar morada oficial
              </a>
              <p>
                Não há envio automático ao Parlamento. Tu decides se queres
                enviar.
              </p>
            </>
          ) : (
            <>
              <p>
                O que importa é o que tens a dizer. A ferramenta ajuda a
                organizar as ideias, sem escolher por ti.
              </p>
              <hr />
              <h3>Um âmbito claro</h3>
              <p>
                Deputados podem legislar e fiscalizar o Governo. Não resolvem
                diretamente serviços municipais ou processos individuais.
              </p>
              <h3>Sem conta, sem histórico</h3>
              <p>
                Não guardamos o teu texto numa base de dados. Ao saíres da
                página, podes perder o rascunho.
              </p>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
