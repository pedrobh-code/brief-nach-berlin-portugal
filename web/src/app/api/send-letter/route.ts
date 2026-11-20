import { emailInputSchema } from "@/lib/validation";
import { verifyTicket } from "@/lib/email/ticket";
import { sendLetter } from "@/lib/email/send";
import { checkRateLimit, hashIdentifier } from "@/lib/rateLimit";
import { guard, readJson, json, failure, HttpError } from "@/lib/http";
const sent = new Map<string, number>();
const pending = new Set<string>();
export const runtime = "nodejs";
export async function POST(request: Request) {
  let id: string | null = null;
  let acquired = false;
  try {
    guard(request, "email", 3);
    const parsed = emailInputSchema.safeParse(await readJson(request, 60000));
    if (!parsed.success)
      throw new HttpError(
        400,
        "Verifica o endereço de email e confirma o envio.",
      );
    const input = parsed.data;
    id = verifyTicket(input.ticket);
    if (!id)
      throw new HttpError(
        400,
        "Esta sessão expirou. Podes copiar ou descarregar a carta.",
      );
    for (const [key, expires] of sent)
      if (expires < Date.now()) sent.delete(key);
    if (sent.has(id)) return json({ sent: true });
    if (pending.has(id))
      throw new HttpError(409, "O envio está em curso. Aguarda um momento.");
    if (
      !checkRateLimit(
        `email:to:${hashIdentifier(input.email.toLowerCase())}`,
        2,
        86400000,
      ).allowed
    )
      throw new HttpError(
        429,
        "Já foram pedidas cópias para este email. Podes descarregar a carta.",
      );
    pending.add(id);
    acquired = true;
    await sendLetter(input.email, input.letter, id);
    sent.set(id, Date.now() + 3600000);
    return json({ sent: true });
  } catch (error) {
    return failure(
      error,
      "Não foi possível enviar o email. A tua carta continua disponível para copiar ou descarregar.",
    );
  } finally {
    if (id && acquired) pending.delete(id);
  }
}
