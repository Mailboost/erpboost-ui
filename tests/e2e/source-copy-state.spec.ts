import { expect, test, type Locator, type Page } from "@playwright/test";

const clipboard = (page: Page) =>
  page.evaluate(() => navigator.clipboard.readText());
const button = (scope: Page | Locator, name: string) =>
  scope.getByRole("button", { name, exact: true });

for (const mode of [
  {
    name: "desktop light",
    viewport: { width: 1280, height: 900 },
    colorScheme: "light" as const,
  },
  {
    name: "mobile dark",
    viewport: { width: 375, height: 812 },
    colorScheme: "dark" as const,
  },
]) {
  test.describe(mode.name, () => {
    test.use({
      viewport: mode.viewport,
      colorScheme: mode.colorScheme,
      permissions: ["clipboard-read", "clipboard-write"],
    });

    test("every source file copies its displayed contents and Copy all preserves ordered fences and the final newline", async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("page/assistant-panel");
      const sample = page.getByRole("region", {
        name: "Block preview",
        exact: true,
      });
      await sample.getByRole("tab", { name: "Code", exact: true }).click();
      const code = sample.locator("code");
      await expect(code.locator("span").first()).toBeVisible();
      const sources: { filename: string; text: string }[] = [];
      for (const filename of [
        "AssistantPanelScreen.tsx",
        "AssistantPanel.tsx",
        "mockAssistant.ts",
        "App.tsx",
      ]) {
        await button(sample, filename).click();
        const text = (await code.textContent())!;
        await sample.getByRole("button", { name: /^(Copy|Copied)$/ }).click();
        await expect.poll(() => clipboard(page)).toBe(text);
        await expect(code).toHaveCSS("font-size", "12px");
        await expect(code).toHaveCSS("line-height", "18px");
        await expect(code).toHaveCSS("white-space", "pre");
        sources.push({ filename, text });
      }
      await button(sample, "Copy all (4)").click();
      const expected =
        sources
          .map(
            ({ filename, text }) =>
              `### ${filename}\n\n\`\`\`${filename.split(".").pop()}\n${text}\n\`\`\``,
          )
          .join("\n\n") + "\n";
      await expect.poll(() => clipboard(page)).toBe(expected);
      expect(errors).toEqual([]);
    });

    test("single-file and all-file copy feedback each lasts 1500ms", async ({
      page,
    }) => {
      await page.goto("page/form-as-page");
      const sample = page.getByRole("region", {
        name: "Single column",
        exact: true,
      });
      await sample.getByRole("tab", { name: "Code", exact: true }).click();
      await expect(sample.locator("code span").first()).toBeVisible();
      await page.clock.install({ time: new Date("2026-10-29T00:00:00Z") });
      await page.clock.pauseAt(new Date("2026-10-29T00:00:01Z"));
      for (const [initial, copied] of [
        ["Copy", "Copied"],
        ["Copy all (2)", "Copied all"],
      ]) {
        await button(sample, initial).click();
        await expect(button(sample, copied)).toBeVisible();
        await page.clock.runFor(1499);
        await expect(button(sample, copied)).toBeVisible();
        await page.clock.runFor(1);
        await expect(button(sample, initial)).toBeVisible();
      }
    });

    test("page Markdown ends with a fenced-source newline and its copied feedback lasts 1500ms", async ({
      page,
    }) => {
      await page.goto("patterns/field-diff-table");
      await expect(button(page, "Copy as Markdown")).toBeVisible();
      await page.clock.install({ time: new Date("2026-10-29T00:00:00Z") });
      await page.clock.pauseAt(new Date("2026-10-29T00:00:01Z"));
      await button(page, "Copy as Markdown").click();
      await expect(button(page, "Copied")).toBeVisible();
      const markdown = await clipboard(page);
      expect(markdown).toMatch(/^# Field diff table\n/);
      expect(markdown).toContain("### FieldDiffTable.tsx\n\n```tsx\n");
      expect(markdown).toMatch(/\n```\n$/);
      await page.clock.runFor(1499);
      await expect(button(page, "Copied")).toBeVisible();
      await page.clock.runFor(1);
      await expect(button(page, "Copy as Markdown")).toBeVisible();
    });
  });
}
