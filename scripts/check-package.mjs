import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Check the archive a consumer installs, without the catalogue's source aliases.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const directory = mkdtempSync(join(tmpdir(), "erpboost-ui-package-"));
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
try {
  const [archive] = JSON.parse(
    execFileSync(
      "npm",
      [
        "pack",
        "-w",
        "@mailboost/erpboost-ui",
        "--ignore-scripts",
        "--pack-destination",
        directory,
        "--json",
      ],
      { cwd: root, encoding: "utf8" },
    ),
  );
  const library = JSON.parse(
    readFileSync(join(root, "packages/ui/package.json"), "utf8"),
  );
  for (const path of Object.values(library.exports).flatMap((entry) =>
    typeof entry === "string" ? [entry] : [entry.types, entry.import],
  )) {
    assert(
      archive.files.some((file) => file.path === path.replace(/^\.\//, "")),
      `Package export missing from archive: ${path}`,
    );
  }
  writeFileSync(
    join(directory, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "@mailboost/erpboost-ui": `file:${join(directory, archive.filename)}`,
        react: manifest.devDependencies.react,
        "react-dom": manifest.devDependencies["react-dom"],
      },
      devDependencies: Object.fromEntries(
        ["typescript", "vite", "@types/react", "@types/react-dom"].map(
          (name) => [name, manifest.devDependencies[name]],
        ),
      ),
    }),
  );
  writeFileSync(
    join(directory, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
      },
      include: ["src.tsx"],
    }),
  );
  writeFileSync(
    join(directory, "index.html"),
    '<div id="root"></div><script type="module" src="/src.tsx"></script>',
  );
  writeFileSync(
    join(directory, "src.tsx"),
    `
    import {createRoot} from "react-dom/client";
    import {AppShell,SidebarLayout,Button,Input,Sheet} from "@mailboost/erpboost-ui";
    import "@mailboost/erpboost-ui/styles";
    function Sample(){return <><h1>External package</h1><Button>Package button</Button><Input aria-label="Name"/><Sheet.Root><Sheet.Trigger>Open details</Sheet.Trigger><Sheet.Content><Sheet.Header><Sheet.Title>Package sheet</Sheet.Title></Sheet.Header><p>External consumer works.</p></Sheet.Content></Sheet.Root></>}
    createRoot(document.getElementById("root")!).render(<AppShell title="Package check" modules={[]} rootComponent={Sample} commandPalette={{routeOrder:"definition",showAppInfo:false}}><SidebarLayout/></AppShell>);
  `,
  );
  writeFileSync(
    join(directory, "vite.config.mjs"),
    "export default {build:{rolldownOptions:{checks:{moduleLevelDirective:false}}}};",
  );
  execFileSync(
    "npm",
    ["install", "--ignore-scripts", "--no-audit", "--no-fund"],
    { cwd: directory, stdio: "inherit" },
  );
  for (const [binary, args] of [
    ["tsc", ["--noEmit"]],
    ["vite", ["build"]],
  ]) {
    execFileSync(join(directory, "node_modules/.bin", binary), args, {
      cwd: directory,
      stdio: "inherit",
    });
  }
  // An existing app can use controls without pulling in AppShell integrations.
  writeFileSync(join(directory, "src.tsx"), `
    import {createRoot} from "react-dom/client";
    import {Button} from "@mailboost/erpboost-ui/button";
    import {Input} from "@mailboost/erpboost-ui/input";
    import {Textarea} from "@mailboost/erpboost-ui/textarea";
    import {Table} from "@mailboost/erpboost-ui/table";
    import {Spinner} from "@mailboost/erpboost-ui/spinner";
    import "@mailboost/erpboost-ui/styles";
    createRoot(document.getElementById("root")!).render(<form><Input aria-label="Name"/><Textarea aria-label="Note"/><Button type="button">Save</Button><Spinner/><Table.Root><Table.Body><Table.Row><Table.Cell>Standalone</Table.Cell></Table.Row></Table.Body></Table.Root></form>);
  `);
  writeFileSync(join(directory, "vite.config.mjs"), `export default {
    plugins: [{name:"consumer-module-audit", generateBundle(){
      this.emitFile({type:"asset",fileName:"consumer-modules.json",source:JSON.stringify([...this.getModuleIds()])});
    }}],
    build:{rolldownOptions:{checks:{moduleLevelDirective:false}}}
  };`);
  for (const [binary, args] of [["tsc", ["--noEmit"]], ["vite", ["build"]]]) {
    execFileSync(join(directory, "node_modules/.bin", binary), args, {cwd: directory, stdio: "inherit"});
  }
  const moduleIds = JSON.parse(readFileSync(join(directory, "dist/consumer-modules.json"), "utf8"));
  for (const dependency of ["openai", "@tailor-platform/auth-public-client", "react-router"]) {
    assert(!moduleIds.some((id) => id.replaceAll("\\", "/").includes(`/node_modules/${dependency}/`)), `Standalone controls imported ${dependency}`);
  }
  console.log("Packed library: root API and standalone consumers passed; controls exclude auth, AI and router modules.");
} finally {
  if (process.env.KEEP_PACKAGE_CHECK === "1")
    console.log(`Consumer fixture retained: ${directory}`);
  else rmSync(directory, { recursive: true, force: true });
}
