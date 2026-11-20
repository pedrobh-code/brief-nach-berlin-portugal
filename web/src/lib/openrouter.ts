import { z } from "zod";
import { letterMessages } from "./generation/prompt";
import type { LetterInput } from "./validation";
import type { Representative } from "./lookup/parliament";
import { APP_NAME, APP_URL } from "./config";
import { HttpError } from "./http";

export const OPENROUTER_MODEL = "mistralai/mistral-large-2512";
export const OPENROUTER_FALLBACK_MODEL = "openai/gpt-4.1-mini";
const responseSchema = z.object({
  error: z.unknown().optional(),
  choices: z
    .array(
      z.object({
        finish_reason: z.string(),
        message: z.object({ content: z.string().min(80).max(9000) }),
      }),
    )
    .min(1),
});

export async function generateBody(
  input: LetterInput,
  recipient: Representative,
  constituency: string,
) {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) throw new Error("AI_NOT_CONFIGURED");
  // One shared deadline bounds the primary and fallback. Never retry authentication,
  // credit, moderation or malformed-output failures.
  const signal = AbortSignal.timeout(45000);
  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Response;
    try {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": APP_URL,
          "X-Title": APP_NAME,
        },
        body: JSON.stringify({
          model: attempt === 0 ? OPENROUTER_MODEL : OPENROUTER_FALLBACK_MODEL,
          messages: letterMessages(input, recipient, constituency),
          temperature: 0.4,
          max_tokens: 1100,
          stream: false,
          provider: {
            only: [attempt === 0 ? "mistral" : "azure"],
            allow_fallbacks: false,
            data_collection: "deny",
            zdr: true,
          },
        }),
        signal,
        redirect: "error",
        cache: "no-store",
      });
    } catch {
      throw new HttpError(
        503,
        "A ligação ao serviço de escrita falhou. O teu texto continua aqui. Tenta novamente. (AI_CONNECTION)",
      );
    }
    // Codes contain only HTTP status, never provider bodies, user text or keys.
    if (!response.ok) {
      const status = response.status;
      await response.body?.cancel();
      if (
        attempt === 0 &&
        [429, 500, 502, 503, 504].includes(status) &&
        !signal.aborted
      ) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }
      const message =
        status === 402
          ? "O serviço de escrita está sem crédito disponível. É necessário verificar o saldo ou limite da chave no OpenRouter."
          : [401, 403].includes(status)
            ? "O serviço de escrita não conseguiu autenticar ou autorizar o pedido. É necessário verificar a configuração no OpenRouter."
            : status === 429
              ? "O serviço de escrita está temporariamente sobrecarregado. Tenta novamente dentro de instantes."
              : "O fornecedor de escrita não conseguiu responder. Tenta novamente dentro de instantes.";
      throw new HttpError(
        503,
        `${message} O teu texto continua aqui. (AI_HTTP_${status})`,
      );
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new HttpError(
        503,
        "O serviço de escrita devolveu uma resposta inválida. O teu texto continua aqui. (AI_RESPONSE)",
      );
    }
    const result = responseSchema.safeParse(payload);
    if (
      !result.success ||
      result.data.error ||
      result.data.choices[0].finish_reason !== "stop"
    ) {
      throw new HttpError(
        503,
        "O serviço de escrita não devolveu uma carta completa. O teu texto continua aqui. Tenta novamente. (AI_RESPONSE)",
      );
    }
    const text = result.data.choices[0].message.content.trim();
    if (text.length < 80)
      throw new HttpError(
        503,
        "O serviço de escrita não devolveu uma carta completa. O teu texto continua aqui. Tenta novamente. (AI_RESPONSE)",
      );
    return text;
  }
  throw new HttpError(
    503,
    "O serviço de escrita está indisponível. (AI_UNAVAILABLE)",
  );
}
