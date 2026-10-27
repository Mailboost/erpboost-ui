import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";
import packageJson from "./package.json" with { type: "json" };

const dependencies = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.peerDependencies,
});
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ tsconfigPath: "./tsconfig.json", exclude: ["**/*.test.*"] }),
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  publicDir: false,
  build: {
    lib: {
      entry: { index: "src/index.ts", style: "src/style-entry.ts" },
      formats: ["es"],
      cssFileName: "erpboost-ui",
    },
    rollupOptions: {
      external: (id) =>
        dependencies.some((dep) => id === dep || id.startsWith(`${dep}/`)),
    },
    target: "es2022",
    sourcemap: true,
  },
});
