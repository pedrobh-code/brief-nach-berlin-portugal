import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
// Process-local fallback is suitable for a single preview; production can set LETTER_TOKEN_SECRET for multi-instance consistency.
const fallback = randomBytes(32).toString("hex");
const secret = () => process.env.LETTER_TOKEN_SECRET || fallback;
export function createTicket() {
  const payload = Buffer.from(
    JSON.stringify({
      id: randomBytes(16).toString("hex"),
      expires: Date.now() + 3600000,
    }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}`;
}
export function verifyTicket(ticket: string): string | null {
  try {
    const [payload, signature, ...rest] = ticket.split(".");
    if (rest.length || !payload || !signature) return null;
    const expected = createHmac("sha256", secret()).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof data.id === "string" && data.expires > Date.now()
      ? data.id
      : null;
  } catch {
    return null;
  }
}
