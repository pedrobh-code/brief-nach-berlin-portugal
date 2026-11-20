import { generateBody, OPENROUTER_MODEL } from "../lib/openrouter";
import data from "../../data/parliament.json";
const recipient = data.representatives[0];
const input = {
  constituencyId: recipient.constituencyId,
  representativeId: recipient.id,
  issue: "Gostava de ter transportes públicos mais frequentes na minha região.",
  tone: "cordial" as const,
  length: "normal" as const,
  consent: true as const,
};
const letter =
  "Gostava de chamar a sua atenção para os transportes públicos na minha região. Peço que este assunto seja considerado no âmbito do trabalho parlamentar.";
let fetchMock: jest.SpyInstance;
beforeEach(() => {
  process.env.OPENROUTER_API_KEY = "test-only-not-a-key";
  fetchMock = jest.spyOn(global, "fetch");
});
afterEach(() => {
  delete process.env.OPENROUTER_API_KEY;
  fetchMock.mockRestore();
});
test("uses OpenRouter with the pinned model, privacy preferences and bounded output", async () => {
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify({
        choices: [{ finish_reason: "stop", message: { content: letter } }],
      }),
    ),
  );
  expect(await generateBody(input, recipient, "Lisboa")).toBe(letter);
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
  expect(options.headers.Authorization).toBe("Bearer test-only-not-a-key");
  expect(options.redirect).toBe("error");
  expect(options.signal).toBeInstanceOf(AbortSignal);
  expect(JSON.parse(options.body)).toMatchObject({
    model: OPENROUTER_MODEL,
    max_tokens: 1100,
    stream: false,
    provider: {
      only: ["mistral"],
      allow_fallbacks: false,
      data_collection: "deny",
      zdr: true,
    },
  });
});
test("missing key never sends a request", async () => {
  delete process.env.OPENROUTER_API_KEY;
  await expect(generateBody(input, recipient, "Lisboa")).rejects.toThrow(
    "AI_NOT_CONFIGURED",
  );
  expect(fetchMock).not.toHaveBeenCalled();
});
test.each([401, 402, 429, 500])(
  "rejects HTTP %s without disclosing provider detail",
  async (status) => {
    fetchMock.mockResolvedValue(
      new Response("sensitive provider detail", { status }),
    );
    await expect(generateBody(input, recipient, "Lisboa")).rejects.toThrow(
      "AI_PROVIDER_UNAVAILABLE",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  },
);
test.each([
  { choices: [{ finish_reason: "length", message: { content: letter } }] },
  { choices: [{ finish_reason: "stop", message: { content: "short" } }] },
  { choices: [] },
  {
    error: { message: "private error" },
    choices: [{ finish_reason: "stop", message: { content: letter } }],
  },
  {
    choices: [
      { finish_reason: "content_filter", message: { content: letter } },
    ],
  },
])("rejects incomplete or error responses", async (payload) => {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(payload)));
  await expect(generateBody(input, recipient, "Lisboa")).rejects.toThrow(
    "INVALID_AI_RESPONSE",
  );
});
test("timeouts propagate to the route's safe failure handling", async () => {
  fetchMock.mockRejectedValue(new DOMException("Timed out", "TimeoutError"));
  await expect(generateBody(input, recipient, "Lisboa")).rejects.toThrow(
    "Timed out",
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
