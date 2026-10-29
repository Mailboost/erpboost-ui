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
    test("native validation, nested selection, busy state and failed-save retry", async ({
      page,
    }) => {
      await page.goto("patterns/form-dialog?preview=fullscreen");
      const trigger = page.getByRole("button", {
        name: "Open form",
        exact: true,
      });
      await trigger.click();
      const dialog = page.getByRole("dialog", {
          name: "Resource form",
          exact: true,
        }),
        name = page.getByRole("textbox", { name: "Name", exact: true });
      await expect(dialog.locator("form")).toHaveCSS("row-gap", "16px");
      await expect(name).toBeFocused();
      await page.getByRole("button", { name: "Create", exact: true }).click();
      await expect(name).toBeFocused();
      await name.fill("Bad Name");
      await page.getByRole("button", { name: "Create", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Saving", exact: true }),
      ).toHaveCount(0);
      await name.fill("customers");
      const mode = page.getByRole("combobox", { name: "Mode", exact: true });
      await mode.click();
      await expect(
        page.getByRole("option", { name: "Secondary", exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeVisible();
      await mode.click();
      await page
        .getByRole("option", { name: "Secondary", exact: true })
        .click();
      await page.getByRole("button", { name: "Create", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Cancel", exact: true }),
      ).toBeDisabled();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeVisible();
      await page
        .getByRole("button", { name: "Fail request", exact: true })
        .click();
      await expect(page.getByRole("alert")).toContainText(
        "Caller-owned failure",
      );
      expect(
        (await page.getByRole("alert").boundingBox())!.height,
      ).toBeLessThanOrEqual(viewport.height / 4);
      await expect(name).toHaveValue("customers");
      await expect(mode).toContainText("Secondary");
      await page.getByRole("button", { name: "Create", exact: true }).click();
      await page
        .getByRole("button", { name: "Finish request", exact: true })
        .click();
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await expect(page.getByLabel("Form result")).toHaveText(
        "Created: customers / secondary",
      );
    });
    test("side form keeps actions visible while its body scrolls", async ({
      page,
    }) => {
      await page.goto("patterns/form-dialog?preview=fullscreen");
      await page
        .getByRole("button", { name: "Open side form", exact: true })
        .click();
      const dialog = page.getByRole("dialog", {
        name: "Resource form",
        exact: true,
      });
      expect((await dialog.boundingBox())!.width).toBeLessThanOrEqual(
        viewport.width,
      );
      await dialog
        .locator(".erpui-form-dialog-body")
        .evaluate((el) => (el.scrollTop = el.scrollHeight));
      await expect(
        page.getByRole("button", { name: "Create", exact: true }),
      ).toBeInViewport();
      await page
        .getByRole("button", { name: "Auxiliary action", exact: true })
        .click();
      await expect(page.getByLabel("Form result")).toHaveText(
        "Auxiliary requested",
      );
      await expect(dialog).toBeVisible();
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).toHaveCount(0);
    });
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
