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



        "editable-grid": "src/components/editable-grid/index.tsx",
        "workflow-graph": "src/components/workflow-graph/index.tsx",

        "search-field": "src/components/search-field/index.tsx",
        "option-card": "src/components/option-card/index.tsx",
        "code-workspace": "src/components/code-workspace/index.tsx",
        "graph-controls": "src/components/graph-controls/index.tsx",
        "status-dot": "src/components/status-dot/index.tsx",
        "resize-handle": "src/components/resize-handle/index.tsx",
        "log-viewer": "src/components/log-viewer/index.tsx",
        "file-list": "src/components/file-list/index.tsx",
        "workflow-node": "src/components/workflow-node/index.tsx",
        "cell-editor": "src/components/cell-editor/index.tsx",
        "code-editor": "src/components/code-editor/index.tsx",
        "description-list": "src/components/description-list/index.tsx",
        "erp-header": "src/components/erp-header/index.tsx",
        style: "src/style-entry.ts",
        button: "src/components/button/index.ts",
        toolbar: "src/components/toolbar/index.ts",
        layout: "src/components/layout/index.ts",
        card: "src/components/card/index.ts",
        fieldset: "src/components/fieldset/index.ts",
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
        "pagination": "src/components/pagination/index.tsx",
        "skeleton": "src/components/skeleton/index.tsx",
        "shell-parts": "src/components/shell-parts/index.tsx",
        "empty-state": "src/components/empty-state/index.tsx",
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
