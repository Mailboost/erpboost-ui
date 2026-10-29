import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test.describe(`Source navigation ${viewport.width}`, () => {
    test.use({ viewport });
    test.beforeEach(({}, info) =>
      test.skip(
        info.project.name === "reference",
        "Additional ERPBoost composition",
      ),
    );
    test("shares selection and delegates add/remove while preserving caller contents", async ({
      page,
    }) => {
      await page.goto("patterns/source-navigation?preview=fullscreen");
      const sidebar = page.getByRole("complementary", { name: "Source files" }),
        editor = page.getByRole("textbox", { name: "Editor draft" });
      await expect(
        sidebar.getByRole("button", { name: "Remove main.py", exact: true }),
      ).toHaveCount(0);
      await sidebar
        .getByRole("button", { name: "Add source", exact: true })
        .click();
      const name = page.getByRole("textbox", { name: "Source name" });
      await name.fill("main.py");
      await name.press("Enter");
      await expect(page.getByRole("alert")).toContainText("Already exists");
      await name.fill("0001.py");
      await name.press("Enter");
      await expect(
        page.getByRole("tab", { name: "0001.py", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
      await editor.fill("9007199254740993");
      await sidebar
        .getByRole("button", { name: "helpers.py", exact: true })
        .click();
      await expect(
        page.getByRole("tab", { name: "helpers.py", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
      await sidebar
        .getByRole("button", { name: "0001.py", exact: true })
        .click();
      await expect(editor).toHaveValue("9007199254740993");
      await sidebar
        .getByRole("button", { name: "Remove 0001.py", exact: true })
        .click();
      await expect(
        page.getByRole("tab", { name: "0001.py", exact: true }),
      ).toHaveCount(0);
      await expect(page.getByLabel("Selected source")).toHaveText("main.py");
      await expect(page.getByLabel("Form submissions")).toHaveText("0");
    });
    test("keeps disabled mutation controls and overflowing tabs keyboard accessible", async ({
      page,
    }) => {
      await page.goto("patterns/source-navigation?preview=fullscreen");
      const sidebar = page.getByRole("complementary", { name: "Source files" }),
        last = page.getByRole("tab", {
          name: "a_long_source_filename_for_horizontal_scroll.py",
          exact: true,
        });
      await page
        .getByRole("button", { name: "Disable actions", exact: true })
        .click();
      await expect(
        sidebar.getByRole("button", { name: "Add source", exact: true }),
      ).toBeDisabled();
      await expect(
        sidebar.getByRole("button", { name: "Remove helpers.py", exact: true }),
      ).toBeDisabled();
      await sidebar
        .getByRole("button", { name: "helpers.py", exact: true })
        .click();
      await expect(page.getByLabel("Selected source")).toHaveText("helpers.py");
      const first = page.getByRole("tab", { name: "main.py", exact: true });
      await first.focus();
      await first.press("End");
      await last.press("Enter");
      await expect(last).toBeFocused();
      await expect(last).toHaveAttribute("aria-selected", "true");
      await expect(page.getByLabel("Selected source")).toHaveText(
        "a_long_source_filename_for_horizontal_scroll.py",
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(viewport.width);
      if (viewport.width === 390)
        expect(
          await page
            .locator(".erpui-source-navigation-tabs")
            .evaluate((el) => el.scrollWidth > el.clientWidth),
        ).toBe(true);
      await page
        .getByRole("button", { name: "Enable actions", exact: true })
        .click();
      await expect(
        sidebar.getByRole("button", { name: "Add source", exact: true }),
      ).toBeEnabled();
      await expect(page.getByLabel("Form submissions")).toHaveText("0");
    });
  });
}
