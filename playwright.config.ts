import { defineConfig, devices } from "@playwright/test";

const targets = {
  local: "http://127.0.0.1:5178/",
  reference: "https://ui.tailor.tech/",
  published: "https://mailboost.github.io/erpboost-ui/",
};
const selected = (process.env.E2E_TARGETS ?? "local").split(",");
for (const target of selected) {
  if (!(target in targets)) throw new Error(`Unknown E2E target: ${target}`);
}

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/native-drag.json" }],
  ],
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 720 },
    locale: "en-US",
    colorScheme: "light",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: selected.map((name) => ({
    name,
    use: { baseURL: targets[name as keyof typeof targets] },
  })),
  webServer: selected.includes("local")
    ? {
        command: "npm run dev --workspace apps/catalog",
        url: targets.local,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
