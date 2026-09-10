import { describe, expect, it } from "vitest";

import { registerSchema, signInSchema } from "@/lib/schemas/auth";

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

  it.each(["//evil.com", "https://evil.com", "evil.com", ""])(
    "falls back rather than redirecting to %o",
    (next) => {
      expect(signInSchema.parse({ ...credentials, next }).next).toBe(
        "/pricebook",
      );
    },
  );
});
