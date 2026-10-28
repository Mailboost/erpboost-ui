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
    dts({
      tsconfigPath: "./tsconfig.json",
      entryRoot: "src",
      include: ["src/**/*"],
      exclude: ["**/*.test.*"],
    }),
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  publicDir: false,
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        style: "src/style-entry.ts",
        button: "src/components/button/index.ts",
        input: "src/components/input/index.ts",
        textarea: "src/components/textarea/index.ts",
        table: "src/components/table/index.ts",
        spinner: "src/components/spinner/index.ts",
        "badge": "src/components/badge/index.ts",
        "alert": "src/components/alert/index.ts",
        "checkbox": "src/components/checkbox/index.ts",
        "select": "src/components/select/index.ts",
        "combobox": "src/components/combobox/index.ts",
        "menu": "src/components/menu/index.ts",
        "tabs": "src/components/tabs/index.ts",
        "dialog": "src/components/dialog/index.ts",
        "sheet": "src/components/sheet/index.ts",
        "tooltip": "src/components/tooltip/index.ts",
        "fieldset": "src/components/fieldset/index.ts",
        "date-field": "src/components/date-field/index.ts",
        "pagination": "src/components/pagination/index.tsx",
        "avatar": "src/components/avatar/index.ts",
        "card": "src/components/card/index.ts",
        "skeleton": "src/components/skeleton/index.tsx",
        "shell-parts": "src/components/shell-parts/index.tsx",
        "field": "src/components/field/index.ts",
        "locale-provider": "src/components/locale-provider/index.tsx",
        "erd-diagram": "src/components/erd-diagram/index.ts",
        "database-workspace": "src/components/database-workspace/index.ts",

      },
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
