import { describe, expect, it } from "vitest";

import { MAX_REDIRECT_PATH_LENGTH } from "@/lib/constants";
import { registerSchema, signInSchema } from "@/lib/schemas/auth";
import { safeRedirectPath } from "@/lib/schemas/shared";

const account = {
  fullName: "Jo Sparks",
  email: "jo@brightspark.com",
  password: "electric-avenue",
  confirmPassword: "electric-avenue",
  next: "/onboarding",
};

describe("register", () => {
  it("accepts a complete account", () => {
    const parsed = registerSchema.parse(account);
    expect(parsed.fullName).toBe("Jo Sparks");
    expect(parsed.email).toBe("jo@brightspark.com");
  });

  it("trims the name and rejects a blank one", () => {
    expect(
      registerSchema.parse({ ...account, fullName: "  Jo  " }).fullName,
    ).toBe("Jo");

    const result = registerSchema.safeParse({ ...account, fullName: "   " });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["fullName"]);
  });

  it("reports a mismatch on the confirm box, not the password", () => {
    const result = registerSchema.safeParse({
      ...account,
      confirmPassword: "electric-avenu",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
    expect(result.error?.issues[0]?.message).toBe("Both passwords must match.");
  });

  it("rejects a short password before it reaches Supabase", () => {
    const result = registerSchema.safeParse({
      ...account,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === "password")).toBe(
      true,
    );
  });
});

describe("the next path can't leave the site", () => {
  const credentials = { email: account.email, password: account.password };

  it("keeps a same-site path", () => {
    expect(signInSchema.parse({ ...credentials, next: "/quotes" }).next).toBe(
      "/quotes",
    );
  });

  // The fallback is the dashboard: signing in with nowhere in particular to
  // go lands on "what happened while I was away".
  it.each(["//evil.com", "https://evil.com", "evil.com", ""])(
    "falls back rather than redirecting to %o",
    (next) => {
      expect(signInSchema.parse({ ...credentials, next }).next).toBe(
        "/dashboard",
      );
    },
  );
});

/*
 * Every page that renders a `next` out of the query string shares this, because
 * /auth/verified had its own copy that checked startsWith("/") and nothing
 * else — so "//evil.com" reached an href and the browser read it as absolute.
 */
describe("safeRedirectPath", () => {
  const schema = safeRedirectPath("/onboarding");

  it("keeps a same-site path", () => {
    expect(schema.parse("/quotes?new=1")).toBe("/quotes?new=1");
  });

  it.each([
    "//evil.com",
    "///evil.com",
    "https://evil.com",
    "evil.com",
    "",
    " /quotes",
  ])("falls back rather than leaving the site for %o", (next) => {
    expect(schema.parse(next)).toBe("/onboarding");
  });

  it("falls back on a path longer than the cap instead of inspecting it", () => {
    expect(schema.parse(`/${"a".repeat(MAX_REDIRECT_PATH_LENGTH)}`)).toBe(
      "/onboarding",
    );
  });
});
