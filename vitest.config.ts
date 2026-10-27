import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const source = (path: string) =>
  fileURLToPath(new URL(`./packages/ui/src/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@mailboost/erpboost-ui", replacement: source("index.ts") },
      { find: "@", replacement: source("") },
    ],
    dedupe: ["react", "react-dom", "react-router"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
