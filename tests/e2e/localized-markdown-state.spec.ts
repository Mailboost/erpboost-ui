import { expect, test, type Page } from "@playwright/test";
// Expected headers were captured from the public reference, independently of registry.ts.
import referenceCopies from "../fixtures/localized-markdown.json" with { type: "json" };

const content = (page: Page) =>
  page.locator("[data-appshell-scroll-container]");
const clipboard = (page: Page) =>
  page.evaluate(() => navigator.clipboard.readText());
async function language(page: Page, mobile: boolean, lang: "JA" | "EN") {
  if (mobile)
    await page
      .getByRole("button", { name: "Toggle Sidebar", exact: true })
      .last()
      .click();
  await page.getByRole("button", { name: lang, exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "lang",
    lang.toLowerCase(),
  );
  if (mobile) {
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Sidebar", exact: true }),
    ).not.toBeVisible();
  }
}
async function copyPage(page: Page) {
  await page.evaluate(() =>
    navigator.clipboard.writeText("uncopied localized page"),
  );
  await page
    .getByRole("button", { name: "Copy as Markdown", exact: true })
    .click();
  await expect.poll(() => clipboard(page)).not.toBe("uncopied localized page");
  const markdown = await clipboard(page);
  const boundary = markdown.indexOf("\n## Source\n");
  expect(boundary).toBeGreaterThan(0);
  return {
    markdown,
    header: markdown.slice(0, boundary),
    files: [
      ...markdown.slice(boundary).matchAll(/^### (.+)\n\n```(\w+)\n/gm),
    ].map((match) => ({ filename: match[1], language: match[2] })),
  };
}

for (const mode of [
  {
    name: "desktop light",
    viewport: { width: 1280, height: 900 },
    colorScheme: "light" as const,
    mobile: false,
  },
  {
    name: "mobile dark",
    viewport: { width: 375, height: 812 },
    colorScheme: "dark" as const,
    mobile: true,
  },
]) {
  test.describe(mode.name, () => {
    test.use({
      viewport: mode.viewport,
      colorScheme: mode.colorScheme,
      permissions: ["clipboard-read", "clipboard-write"],
    });

    for (const route of [
      "/page/form-as-page",
      "/page/document-page",
    ] as const) {
      test(`${route}: page Markdown follows the current language, including translated notes, and can switch back to English`, async ({
        page,
      }) => {
        await page.goto(route.slice(1), { waitUntil: "domcontentloaded" });
        await language(page, mode.mobile, "JA");
        const ja = await copyPage(page);
        expect(ja.header).toBe(referenceCopies[route].ja.header);
        expect(ja.files).toEqual(referenceCopies[route].ja.files);
        expect(ja.markdown.match(/\n*$/)?.[0]).toBe("\n");
        await language(page, mode.mobile, "EN");
        // The completion label is transient and does not change the document.
        await expect(
          page.getByRole("button", { name: "Copy as Markdown", exact: true }),
        ).toBeVisible();
        const en = await copyPage(page);
        expect(en.header).toBe(referenceCopies[route].en.header);
        expect(en.files).toEqual(referenceCopies[route].en.files);
        expect(en.files).toEqual(ja.files);
        expect(en.markdown.match(/\n*$/)?.[0]).toBe("\n");
      });
    }

    test("Japanese source viewers copy the selected file and all files without translating their names or source bodies", async ({
      page,
    }) => {
      await page.goto("page/form-as-page", { waitUntil: "domcontentloaded" });
      await language(page, mode.mobile, "JA");
      const sample = page.getByRole("region", {
        name: "単一カラム",
        exact: true,
      });
      await sample.getByRole("tab", { name: "Code", exact: true }).click();
      const sources: { filename: string; text: string }[] = [];
      for (const filename of ["CreateTaskPage.tsx", "App.tsx"]) {
        await sample
          .getByRole("button", { name: filename, exact: true })
          .click();
        await expect(sample.locator("code")).toBeVisible();
        sources.push({
          filename,
          text: (await sample.locator("code").textContent())!,
        });
      }
      await page.evaluate(() =>
        navigator.clipboard.writeText("uncopied selected source"),
      );
      await sample.getByRole("button", { name: "Copy", exact: true }).click();
      await expect.poll(() => clipboard(page)).toBe(sources[1].text);
      await sample
        .getByRole("button", { name: "Copy all (2)", exact: true })
        .click();
      const expected =
        sources
          .map(
            (source) =>
              `### ${source.filename}\n\n\`\`\`tsx\n${source.text}\n\`\`\``,
          )
          .join("\n\n") + "\n";
      await expect.poll(() => clipboard(page)).toBe(expected);
      await expect(sample.getByRole("heading", { level: 2 })).toHaveText(
        "単一カラム",
      );
    });
  });
}
