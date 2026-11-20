import { letterInputSchema } from "@/lib/validation";
import { getParliament } from "@/lib/lookup/data";
import { findRepresentative } from "@/lib/lookup/parliament";
import { generateBody } from "@/lib/openrouter";
import { createTicket } from "@/lib/email/ticket";
import { guard, readJson, json, failure, HttpError } from "@/lib/http";
import { POSTAL_ADDRESS } from "@/lib/config";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    guard(request, "generate", 5);
    const parsed = letterInputSchema.safeParse(await readJson(request));
    if (!parsed.success)
      throw new HttpError(
        400,
        "Verifica o teu texto, o destinatário e o consentimento.",
      );
    const input = parsed.data;
    const data = await getParliament();
    const recipient = findRepresentative(
      data,
      input.constituencyId,
      input.representativeId,
    );
    if (!recipient)
      throw new HttpError(
        400,
        "Este deputado não está disponível neste círculo. Volta a escolher o destinatário.",
      );
    if (!process.env.OPENROUTER_API_KEY)
      throw new HttpError(
        503,
        "A geração de cartas ainda está a ser preparada. Tenta novamente mais tarde.",
      );
    const constituency = data.constituencies.find(
      (c) => c.id === input.constituencyId,
    )!.name;
    const body = await generateBody(input, recipient, constituency);
    const date = new Intl.DateTimeFormat("pt-PT", {
      dateStyle: "long",
      timeZone: "Europe/Lisbon",
    }).format(new Date());
    const letter = `À atenção de ${recipient.name}\n${POSTAL_ADDRESS}\n\n${date}\n\nExmo. Senhor Deputado / Exma. Senhora Deputada,\n\n${body}\n\nCom os melhores cumprimentos,\n[O teu nome]`;
    return json({ letter, ticket: createTicket(), recipient });
  } catch (error) {
    return failure(
      error,
      "Não foi possível gerar a carta agora. O teu texto continua aqui. Tenta novamente dentro de instantes.",
    );
  }
}
