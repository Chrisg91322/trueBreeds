import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
      // Next's `server-only` package throws outside RSC; tests import server modules.
      "server-only": path.resolve(dirname, "./tests/mocks/server-only.ts"),
    },
  },
});
