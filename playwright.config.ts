import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3100);
const executablePath = process.env.PW_CHROMIUM_PATH; // e.g. /opt/pw-browsers/chromium in CI images
// Remote runs (E2E_BASE_URL) from a proxied environment: route browser and API requests through it.
const proxyServer = process.env.E2E_BASE_URL ? process.env.HTTPS_PROXY : undefined;
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
    : { command: `npx next start -p ${port}`, port, reuseExistingServer: true, timeout: 60_000 },
});
