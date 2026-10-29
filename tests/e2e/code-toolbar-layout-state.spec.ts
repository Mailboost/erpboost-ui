import { expect, test } from "@playwright/test";
for (const mode of [
  {
    name: "desktop light",
    viewport: { width: 1280, height: 900 },
    colorScheme: "light" as const,
    foreground: "rgb(10, 10, 10)",
  },
  {
    name: "tablet dark",
    viewport: { width: 768, height: 1024 },
    colorScheme: "dark" as const,
    foreground: "rgb(250, 250, 250)",
  },
  {
    name: "mobile dark",
    viewport: { width: 375, height: 812 },
    colorScheme: "dark" as const,
    foreground: "rgb(250, 250, 250)",
  },
]) {
  test.describe(mode.name, () => {
    test.use({ viewport: mode.viewport, colorScheme: mode.colorScheme });
    test("code file group keeps natural width, foreground and wrapping across file changes", async ({
      page,
    }) => {
      await page.goto("page/form-as-page");
      const example = page.getByRole("region", {
        name: "Single column",
        exact: true,
      });
      await example.getByRole("tab", { name: "Code", exact: true }).click();
      const code = example.locator("code");
      await expect(code.locator("span").first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const bar = example
        .getByRole("button", { name: "Copy", exact: true })
        .locator("xpath=../..");
      const files = bar.locator(":scope > div").first();
      const actions = bar.locator(":scope > div").last();
      await expect(bar).toHaveCSS("color", mode.foreground);
      await expect(files).toHaveCSS("color", mode.foreground);
      await expect(files).toHaveCSS("flex-grow", "0");
      await expect(actions).toHaveCSS("margin-left", "0px");
      await expect(files.getByRole("button")).toHaveText([
        "CreateTaskPage.tsx",
        "App.tsx",
      ]);
      const measure = async () =>
        files.evaluate((element) => {
          const buttons = [...element.querySelectorAll("button")].map((e) =>
            e.getBoundingClientRect(),
          );
          return {
            width: element.getBoundingClientRect().width,
            buttonWidths: buttons.map((r) => r.width),
            rows: buttons.map((r) => r.y - element.getBoundingClientRect().y),
          };
        });
      const before = await measure();
      if (mode.viewport.width < 600) {
        expect(before.width).toBeCloseTo(Math.max(...before.buttonWidths), 2);
        expect(before.rows[1]).toBeGreaterThan(before.rows[0]);
      } else {
        expect(before.width).toBeCloseTo(
          before.buttonWidths.reduce((sum, n) => sum + n, 0) + 4,
          2,
        );
        expect(before.rows[0]).toBe(before.rows[1]);
      }
      const firstSource = await code.innerText();
      await files
        .getByRole("button", { name: "App.tsx", exact: true })
        .press("Space");
      await expect(code).not.toHaveText(firstSource);
      await expect.poll(measure).toEqual(before);
      await example
        .getByRole("tab", { name: "Mobile preview width", exact: true })
        .click();
      await expect.poll(measure).toEqual(before);
    });
  });
}
