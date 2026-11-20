jest.mock("../lib/email/send", () => ({ sendLetter: jest.fn() }));
import { POST } from "../app/api/send-letter/route";
import { sendLetter } from "../lib/email/send";
import { createTicket, verifyTicket } from "../lib/email/ticket";
const body = {
  email: "visitor@example.com",
  letter:
    "Carta de teste com texto suficientemente longo para validar o pedido de envio.",
  consent: true,
};
let seq = 0;
function request(payload: unknown) {
  return new Request("http://localhost:3000/api/send-letter", {
    method: "POST",
    headers: {
      host: "localhost:3000",
      origin: "http://localhost:3000",
      "content-type": "application/json",
      "x-forwarded-for": `email-test-${seq++}`,
    },
    body: JSON.stringify(payload),
  });
}
afterEach(() => jest.clearAllMocks());
test("tickets cannot be forged and expire", () => {
  const ticket = createTicket();
  expect(verifyTicket(ticket)).toBeTruthy();
  expect(verifyTicket(ticket + "tampered")).toBeNull();
  jest.useFakeTimers().setSystemTime(Date.now() + 3601000);
  expect(verifyTicket(ticket)).toBeNull();
  jest.useRealTimers();
});
test("email requires a generated-letter ticket and explicit consent", async () => {
  expect(
    (await POST(request({ ...body, ticket: "fake".repeat(20) }))).status,
  ).toBe(400);
  expect(
    (await POST(request({ ...body, ticket: createTicket(), consent: false })))
      .status,
  ).toBe(400);
  expect(sendLetter).not.toHaveBeenCalled();
});
test("repeated send is idempotent", async () => {
  const ticket = createTicket();
  jest.mocked(sendLetter).mockResolvedValue(undefined);
  expect((await POST(request({ ...body, ticket }))).status).toBe(200);
  expect((await POST(request({ ...body, ticket }))).status).toBe(200);
  expect(sendLetter).toHaveBeenCalledTimes(1);
});
test("provider failure retains ability to save letter and does not leak details", async () => {
  jest.mocked(sendLetter).mockRejectedValue(new Error("secret details"));
  const r = await POST(
    request({ ...body, email: "another@example.com", ticket: createTicket() }),
  );
  expect(r.status).toBe(503);
  expect(JSON.stringify(await r.json())).not.toContain("secret");
});
