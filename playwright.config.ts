import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke-test config only — these hit a locally-running dev server against
 * the marketing site (root domain), which needs no database. See
 * `src/lib/supabase/middleware.ts`, which fails open when Supabase is
 * unreachable so these pages still render in an environment with no
 * configured Supabase project. Dashboard/tenant-site flows need real
 * Postgres + Supabase and are intentionally out of scope here.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3002",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        // Serve the production build rather than `next dev` — on-demand
        // route compilation in dev mode is slow enough under parallel
        // workers to make click-triggered navigations flaky/time out.
        command: "npm run build && npm run start",
        url: "http://localhost:3002",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
