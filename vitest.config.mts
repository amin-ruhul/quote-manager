import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "."),
      // lib/ai.ts imports "server-only", which throws outside Next. The real
      // guard still applies to the app build; tests need a stand-in.
      "server-only": resolve(
        import.meta.dirname,
        "scripts/server-only-stub.ts",
      ),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
