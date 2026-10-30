import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
])
  test.describe(`Form/rename compositions ${viewport.width}`, () => {
    test.use({ viewport });
    test.beforeEach(({}, info) =>
      test.skip(
        info.project.name === "reference",
        "Additive ERPBoost patterns",
      ),
    );
    test("rename preserves IME composition and cancels without submitting its parent", async ({
      page,
    }) => {
      await page.goto("patterns/inline-rename?preview=fullscreen");
      await page
        .getByRole("button", { name: "Rename resource", exact: true })
        .click();
      const input = page.getByRole("textbox", {
        name: "Resource name",
        exact: true,
      });
      await expect(input).toBeFocused();
      await input.fill("日本語の名前");
      await input.dispatchEvent("keydown", { key: "Enter", isComposing: true });
      await expect(input).toBeVisible();
      await input.dispatchEvent("keydown", { key: "Enter", keyCode: 229 });
      await expect(input).toBeVisible();
      await input.press("Escape");
      await expect(page.getByLabel("Rename result")).toHaveText(
        "Cancelled: Original name",
      );
      await expect(page.getByLabel("Parent submissions")).toHaveText("0");
    });
    test("rename Enter and blur commit local names without parent form submission", async ({
      page,
    }) => {
      await page.goto("patterns/inline-rename?preview=fullscreen");
      await page
        .getByRole("button", { name: "Rename resource", exact: true })
        .click();
      const input = page.getByRole("textbox", {
        name: "Resource name",
        exact: true,
      });
      await input.fill("  exact name  ");
      await input.press("Enter");
      await expect(page.getByLabel("Rename result")).toHaveText(
        "Committed:   exact name  ",
      );
      await expect(page.getByLabel("Parent submissions")).toHaveText("0");
      await page
        .getByRole("button", { name: "Rename resource", exact: true })
        .click();
      await input.fill("Blur value");
      await page
        .getByRole("button", { name: "Other control", exact: true })
        .click();
      await expect(page.getByLabel("Rename result")).toHaveText(
        "Committed: Blur value",
      );
    });
  });
