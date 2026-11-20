import { z } from "zod";
import { letterMessages } from "./generation/prompt";
import type { LetterInput } from "./validation";
import type { Representative } from "./lookup/parliament";
import { APP_NAME, APP_URL } from "./config";

export const OPENROUTER_MODEL = "mistralai/mistral-large-2512";
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
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": APP_URL,
        "X-Title": APP_NAME,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: letterMessages(input, recipient, constituency),
        temperature: 0.4,
        max_tokens: 1100,
        stream: false,
        provider: {
          only: ["mistral"],
          allow_fallbacks: false,
          data_collection: "deny",
          zdr: true,
        },
      }),
      signal: AbortSignal.timeout(45000),
      redirect: "error",
      cache: "no-store",
    },
  );
  // Never expose provider response bodies or credentials in logs or client errors.
  if (!response.ok) throw new Error("AI_PROVIDER_UNAVAILABLE");
  const result = responseSchema.safeParse(await response.json());
  if (
    !result.success ||
    result.data.error ||
    result.data.choices[0].finish_reason !== "stop"
  ) {
    throw new Error("INVALID_AI_RESPONSE");
  }
  const text = result.data.choices[0].message.content.trim();
  if (text.length < 80) throw new Error("INVALID_AI_RESPONSE");
  return text;
}
