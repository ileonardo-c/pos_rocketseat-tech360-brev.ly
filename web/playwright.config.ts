import { defineConfig, devices } from "@playwright/test";

const isVisualRun = process.env.PW_VISUAL === "1";

const isDemoVideo = process.env.E2E_DEMO_VIDEO === "true";

export default defineConfig({
  testDir: "./e2e",
  snapshotPathTemplate: "{testDir}/{arg}{ext}",
  outputDir: "test-results",
  fullyParallel: false,
  retries: isDemoVideo ? 0 : process.env.CI ? 1 : 0,
  timeout: isDemoVideo ? 300_000 : 30_000,
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
    trace: isDemoVideo ? "on" : "on-first-retry",
    screenshot: "only-on-failure",
    video: isDemoVideo ? { mode: "on", size: { width: 1280, height: 720 } } : "retain-on-failure",
    headless: true,
    ...(isDemoVideo ? { viewport: { width: 1280, height: 720 } } : {}),
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
        (process.platform === "linux" ? "/usr/bin/google-chrome" : undefined),
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
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
