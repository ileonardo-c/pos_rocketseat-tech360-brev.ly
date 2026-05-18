import { defineConfig, devices } from "@playwright/test";

const isVisualRun = process.env.PW_VISUAL === "1";

export default defineConfig({
  testDir: "./e2e",
  snapshotPathTemplate: "{testDir}/{arg}{ext}",
  outputDir: "test-results",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "../playwright-report" }]],
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      threshold: 0.08,
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? (isVisualRun ? "http://127.0.0.1:4173" : "http://localhost:5173"),
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: isVisualRun
    ? {
        command: "pnpm run dev:e2e",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: false,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
