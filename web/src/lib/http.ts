import { checkRateLimit, hashIdentifier } from "./rateLimit";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export function guard(request: Request, action: string, max: number) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || new URL(origin).host !== host)
    throw new HttpError(403, "Atualiza a página e tenta novamente.");
  if (
    !(request.headers.get("content-type") ?? "").startsWith("application/json")
  )
    throw new HttpError(415, "Formato de pedido inválido.");
  // Global ceiling also bounds spend if proxy IP headers are spoofed or unavailable. Per-instance, documented in README.
  const ip = (
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown"
  ).trim();
  for (const [key, limit] of [
    [`${action}:all`, 60],
    [`${action}:ip:${hashIdentifier(ip)}`, max],
  ] as const) {
    const result = checkRateLimit(key, limit, 3600000);
    if (!result.allowed)
      throw new HttpError(
        429,
        "Atingiste o limite de pedidos. Tenta novamente dentro de uma hora.",
      );
  }
}
export async function readJson(request: Request, limit = 20000) {
  if (Number(request.headers.get("content-length") ?? 0) > limit)
    throw new HttpError(413, "O texto é demasiado longo.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Pedido vazio.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > limit) {
      await reader.cancel();
      throw new HttpError(413, "O texto é demasiado longo.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Pedido inválido.");
  }
}
export function failure(error: unknown, fallback: string) {
  if (error instanceof HttpError)
    return json({ error: error.message }, error.status);
  return json({ error: fallback }, 503);
}
