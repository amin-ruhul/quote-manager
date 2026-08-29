import "server-only";

/*
 * Fixed-window rate limiter for public endpoints (quality rules: the free tool,
 * the public quote page and AI calls all get limited).
 *
 * In-memory on purpose — no Redis dependency for V1. That means the window is
 * per server instance, so a horizontally scaled deployment allows roughly
 * `limit x instances`. Good enough to stop a script hammering the accept
 * endpoint; swap for a shared store when traffic justifies it.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/** Drops expired windows so the map can't grow without bound. */
function sweep(now: number) {
  if (windows.size < 5_000) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  sweep(now);

  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best-effort client IP from the proxy headers Vercel sets. */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return headers.get("x-real-ip") ?? "unknown";
}
