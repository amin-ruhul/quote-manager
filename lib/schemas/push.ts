import { z } from "zod";

/*
 * Web push subscriptions (SPEC §15).
 *
 * The endpoint is a URL the server will later make requests to, so it is
 * restricted to https and kept away from our own network. It arrives from a
 * signed-in owner's browser, which makes this defence in depth rather than the
 * only thing standing between us and a request forgery — but it costs little.
 */
function isPublicHttpsUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost")) return false;
  if (host === "::1") return false;

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (ipv4) {
    const first = Number(ipv4[1]);
    const second = Number(ipv4[2]);
    // Loopback, "this network", private ranges, and link-local (which is where
    // cloud metadata services live).
    if (first === 0 || first === 10 || first === 127) return false;
    if (first === 169 && second === 254) return false;
    if (first === 172 && second >= 16 && second <= 31) return false;
    if (first === 192 && second === 168) return false;
  }

  return true;
}

const pushEndpoint = z
  .url("That doesn't look like a push endpoint.")
  .max(1000, "That push endpoint is too long.")
  .refine(isPublicHttpsUrl, "That push endpoint isn't allowed.");

/** Matches the shape of the browser's own `subscription.toJSON()`. */
export const pushSubscriptionSchema = z.object({
  endpoint: pushEndpoint,
  keys: z.object({
    p256dh: z.string().min(1).max(255),
    auth: z.string().min(1).max(255),
  }),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

export const pushUnsubscribeSchema = z.object({ endpoint: pushEndpoint });
