import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3100);
const executablePath = process.env.PW_CHROMIUM_PATH; // e.g. /opt/pw-browsers/chromium in CI images
// Remote runs (E2E_BASE_URL) from a proxied environment: route browser and API requests through it.
const remote = process.env.E2E_BASE_URL && !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(process.env.E2E_BASE_URL);
const proxyServer = remote ? process.env.HTTPS_PROXY : undefined;
// Draft preview secret: a throwaway value for local runs; remote runs must provide E2E_PREVIEW_SECRET or skip.
if (!remote && !process.env.E2E_PREVIEW_SECRET) process.env.E2E_PREVIEW_SECRET = "local-e2e-preview-secret-0123456789abcdef";
// Vercel Deployment Protection bypass for automation (never commit the value).
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${port}`,
    trace: "off",
    launchOptions: executablePath ? { executablePath } : {},
    ...(proxyServer ? { proxy: { server: proxyServer }, ignoreHTTPSErrors: false } : {}),
    ...(bypass ? { extraHTTPHeaders: { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" } } : {}),
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, hasTouch: true } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next start -p ${port}`,
        port,
        reuseExistingServer: true,
        timeout: 60_000,
        env: { SANITY_PREVIEW_SECRET: process.env.E2E_PREVIEW_SECRET ?? "" },
      },
});
