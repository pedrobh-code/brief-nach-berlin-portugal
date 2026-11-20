// Lean, in-memory rate limiter for MVP abuse protection.
//
// Caveats (acknowledged for v1):
// - In-memory state does NOT share across Vercel serverless instances.
//   Attackers hitting different cold-start instances get independent buckets.
// - Buckets are lost on redeploy/scale events.
// - Good enough to stop trivial/accidental abuse and honest repeated clicks.
// - Replace with @vercel/kv or Upstash when traffic warrants.

import { createHash, randomBytes } from "node:crypto";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Salt the IP/email hash so the bucket key is not a recoverable identifier.
// Falls back to a per-process random string if no env var is set, which is
// fine because buckets are per-instance anyway.
const RATE_LIMIT_SALT =
  process.env.RATE_LIMIT_SALT ?? randomBytes(32).toString("hex");

// Truncated SHA-256 (16 hex chars = 64 bits) is plenty to keep buckets distinct
// for an in-memory limiter and short enough to keep log lines readable.
export function hashIdentifier(value: string): string {
  return createHash("sha256")
    .update(value + ":" + RATE_LIMIT_SALT)
    .digest("hex")
    .slice(0, 16);
}

// Periodically prune expired buckets so the Map doesn't grow unbounded.
// Runs at most once per 5 minutes per instance.
let lastPrune = 0;
function maybePrune(now: number) {
  if (now - lastPrune < 5 * 60_000) return;
  lastPrune = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  remaining?: number;
}

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  maybePrune(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  if (bucket.count >= max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  bucket.count++;
  return { allowed: true, remaining: max - bucket.count };
}
