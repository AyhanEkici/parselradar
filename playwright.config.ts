import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "proof/playwright-report", open: "never" }],
  ],
  use: {
    baseURL: process.env.E2E_WEB_URL || "http://127.0.0.1:3001",
    trace: "on",
    screenshot: "on",
    video: "on",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          slowMo: Number(process.env.E2E_SLOWMO || "350"),
        },
      },
    },
  ],
});
