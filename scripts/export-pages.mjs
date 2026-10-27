import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { entries, sections } from "../apps/catalog/src/registry.ts";

const output = resolve("apps/catalog/dist");
const html = await readFile(resolve(output, "index.html"), "utf8");
const routes = [
  ...sections.map((s) => s.category),
  ...entries.map((e) => `${e.category}/${e.slug}`),
];
for (const route of routes) {
  const directory = resolve(output, route);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), html);
}
await writeFile(resolve(output, "404.html"), html);
await writeFile(resolve(output, ".nojekyll"), "");
console.log(`Exported ${routes.length} catalogue routes.`);
