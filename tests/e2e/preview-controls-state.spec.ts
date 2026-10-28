import { expect, test, type Locator, type Page } from "@playwright/test";

const errors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
});
test.afterEach(async ({ page }, info) => {
  await info.attach("final-state", {
    body: await page.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
  expect(errors.get(page)).toEqual([]);
});
const button = (scope: Page | Locator, name: string) =>
  scope.getByRole("button", { name, exact: true });
const region = (page: Page, name: string) =>
  page.getByRole("region", { name, exact: true });
const title = (scope: Locator) =>
  scope.getByPlaceholder("Review supplier docs", { exact: true });
const changeView = (scope: Locator, name: string) =>
  scope.getByRole("tab", { name, exact: true }).click();
const clipboard = (page: Page) =>
  page.evaluate(() => navigator.clipboard.readText());

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

    test("refresh in Code returns every open source viewer to its first file and clears its copied indicator", async ({
      page,
    }) => {
      await page.goto("page/form-as-page");
      const first = region(page, "Single column");
      const second = region(page, "Section nav (anchors)");
      for (const sample of [first, second]) {
        await changeView(sample, "Code");
        await button(sample, "App.tsx").click();
        await expect(sample.locator("code")).toContainText("DefaultSidebar");
      }
      await button(first, "Copy").click();
      await expect(button(first, "Copied")).toBeVisible();
      expect(await clipboard(page)).toBe(
        await first.locator("code").textContent(),
      );
      await button(first, "Refresh preview").click();
      await expect(first.locator("code")).toContainText(
        'import { useState } from "react"',
      );
      await expect(second.locator("code")).toContainText(
        "export const CreateTaskPageWithSectionNav",
      );
      await expect(button(first, "Copy")).toBeVisible();
      await expect(button(first, "Copied")).toHaveCount(0);
      await expect(button(first, "CreateTaskPage.tsx")).toHaveCSS(
        "background-color",
        mode.colorScheme === "dark" ? "rgb(38, 38, 38)" : "rgb(245, 245, 245)",
      );
      await button(first, "Copy").click();
      await expect(button(first, "Copied")).toBeVisible();
      expect(await clipboard(page)).toBe(
        await first.locator("code").textContent(),
      );
    });

    test("viewport presets leave Code full width while still constraining the Preview", async ({
      page,
    }) => {
      await page.goto("page/form-as-page");
      const sample = region(page, "Single column");
      await changeView(sample, "Code");
      await expect(sample.locator("code")).toBeVisible();
      await button(sample, "App.tsx").click();
      for (const preset of ["Tablet", "Mobile", "Desktop"]) {
        await changeView(sample, preset + " preview width");
        await expect(sample.locator("code")).toContainText("DefaultSidebar");
        const sizes = await sample.getByRole("tabpanel").evaluate((panel) => ({
          available: panel.clientWidth,
          code: panel
            .querySelector("code")!
            .parentElement!.getBoundingClientRect().width,
        }));
        expect(sizes.code).toBe(sizes.available);
      }
      await changeView(sample, "Mobile preview width");
      await changeView(sample, "Preview");
      await expect(title(sample)).toBeVisible();
      await expect(sample.getByRole("tabpanel")).toHaveCSS(
        "background-size",
        "20px 20px",
      );
      await expect(sample.getByRole("tabpanel")).not.toHaveCSS(
        "background-image",
        "none",
      );
      const available = await sample
        .getByRole("tabpanel")
        .evaluate((element) => element.clientWidth);
      await expect
        .poll(async () =>
          sample
            .getByRole("tabpanel")
            .locator(":scope > div")
            .evaluate((element) => element.getBoundingClientRect().width),
        )
        .toBe(Math.min(384, available));
      await changeView(sample, "Code");
      await expect(sample.locator("code")).toContainText(
        'import { useState } from "react"',
      );
      await changeView(sample, "Desktop preview width");
      await changeView(sample, "Preview");
      await expect(sample.getByRole("tabpanel")).toHaveCSS(
        "background-image",
        "none",
      );
    });

    test("preview refresh clears all three drafts, Code only clears its own draft, and viewport and background settings survive refresh", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "reference-limitation",
        description:
          "Refresh discards drafts across every preview on the page without warning. Switching a single preview to Code discards that preview's draft. No backend save is performed.",
      });
      await page.goto("page/form-as-page");
      const samples = [
        "Single column",
        "Section nav (anchors)",
        "Wizard (multiple steps)",
      ].map((name) => region(page, name));
      for (const [i, sample] of samples.entries())
        await title(sample).fill(`Unsaved ${i}`);
      await changeView(samples[0], "Code");
      await changeView(samples[0], "Preview");
      await expect(title(samples[0])).toHaveValue("");
      await expect(title(samples[1])).toHaveValue("Unsaved 1");
      await expect(title(samples[2])).toHaveValue("Unsaved 2");
      await changeView(samples[0], "Mobile preview width");
      await changeView(samples[0], "Background");
      await button(samples[0], "Refresh preview").click();
      for (const sample of samples) {
        await expect(title(sample)).toHaveValue("");
        await expect(
          sample.getByRole("tab", {
            name: "Mobile preview width",
            exact: true,
          }),
        ).toHaveAttribute("aria-selected", "true");
        await expect(
          sample.getByRole("tab", { name: "Background", exact: true }),
        ).toHaveAttribute("aria-selected", "true");
      }
    });

    test("open preview creates a fullscreen tab with all form variants and independent draft state", async ({
      page,
      context,
    }) => {
      await page.goto("page/form-as-page");
      const sample = region(page, "Single column");
      await title(sample).fill("Parent tab draft");
      await changeView(sample, "Mobile preview width");
      const [popup] = await Promise.all([
        context.waitForEvent("page"),
        button(sample, "Open preview in new tab").click(),
      ]);
      const popupErrors: string[] = [];
      popup.on("pageerror", (error) => popupErrors.push(error.message));
      await popup.waitForLoadState("domcontentloaded");
      expect(new URL(popup.url()).pathname.replace(/\/$/, "")).toMatch(
        /\/page\/form-as-page$/,
      );
      expect(new URL(popup.url()).search).toBe("?preview=fullscreen");
      const fields = popup.getByPlaceholder("Review supplier docs", {
        exact: true,
      });
      await expect(fields).toHaveCount(3);
      for (const field of await fields.all())
        await expect(field).toHaveValue("");
      await expect(
        popup.getByRole("button", { name: "Refresh preview", exact: true }),
      ).toHaveCount(0);
      await fields.first().fill("New tab draft");
      await popup.close();
      expect(popupErrors).toEqual([]);
      await expect(title(sample)).toHaveValue("Parent tab draft");
    });

    test("Copy as Markdown writes guidance and complete source files, then resets its completion label", async ({
      page,
    }) => {
      await page.goto("patterns/field-diff-table");
      await button(page, "Copy as Markdown").click();
      await expect(button(page, "Copied")).toBeVisible();
      const content = await clipboard(page);
      expect(content).toContain("# Field diff table\n\n**Tier:** pattern");
      for (const heading of [
        "## Do",
        "## Don't",
        "## Primitives used",
        "## Source",
        "### FieldDiffTable.tsx",
      ])
        expect(content).toContain(heading);
      expect(
        [...content.matchAll(/^### (.+)\n\n```(\w+)\n/gm)].map((match) => [
          match[1],
          match[2],
        ]),
      ).toEqual([["FieldDiffTable.tsx", "tsx"]]);
      expect(content).toContain("export type FieldDiff");
      await expect(button(page, "Copy as Markdown")).toBeVisible({
        timeout: 4000,
      });
    });
  });
}
