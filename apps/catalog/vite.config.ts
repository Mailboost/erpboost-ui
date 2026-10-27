import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const source = (path: string) =>
  fileURLToPath(new URL(`../../packages/ui/src/${path}`, import.meta.url));
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@mailboost/erpboost-ui/styles",
        replacement: source("globals.css"),
      },
      { find: "@mailboost/erpboost-ui", replacement: source("index.ts") },
      { find: "@", replacement: source("") },
    ],
    dedupe: ["react", "react-dom", "react-router"],
  },
  server: { fs: { allow: [fileURLToPath(new URL("../..", import.meta.url))] } },
  build: { target: "es2022", sourcemap: false },
});
