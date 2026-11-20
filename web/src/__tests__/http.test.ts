import { readJson } from "../lib/http";
import { checkRateLimit } from "../lib/rateLimit";
test("rejects oversized body even without Content-Length", async () => {
  const r = new Request("https://example.com", {
    method: "POST",
    body: JSON.stringify({ text: "x".repeat(20001) }),
  });
  await expect(readJson(r)).rejects.toMatchObject({ status: 413 });
});
test("rate limit enforces ceiling and recovers after its window", () => {
  jest.useFakeTimers().setSystemTime(100000);
  const k = "rate-test";
  expect(checkRateLimit(k, 1, 1000).allowed).toBe(true);
  expect(checkRateLimit(k, 1, 1000).allowed).toBe(false);
  jest.setSystemTime(101001);
  expect(checkRateLimit(k, 1, 1000).allowed).toBe(true);
  jest.useRealTimers();
});
