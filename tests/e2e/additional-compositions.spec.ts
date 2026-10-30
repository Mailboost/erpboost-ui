import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
])
  test.describe(`Additional presentation ${viewport.width}`, () => {
    test.use({ viewport });
    test.beforeEach(({}, info) =>
      test.skip(
        info.project.name === "reference",
        "ERPBoost additions have no reference route.",
      ),
    );
    test("resource picker normalizes search", async ({
      page,
    }) => {
      await page.goto("patterns/resource-picker?preview=fullscreen");
      await page.getByRole("combobox", { name: "Choose office" }).click();
      await page
        .getByRole("combobox", { name: "Search office" })
        .fill("ＯＳＡＫＡ");
      await page.getByRole("option", { name: /Osaka/ }).click();
      await expect(
        page.getByRole("combobox", { name: "Choose office" }),
      ).toContainText("Osaka");

    });
    test("value editor preserves exact strings and displays consumer validation", async ({
      page,
    }) => {
      await page.goto("patterns/value-editor?preview=fullscreen");
      await page.getByRole("button", { name: "Edit value" }).click();
      const input = page.getByRole("textbox", { name: "amountの値" });
      await expect(input).toHaveValue("9007199254740993");
      await input.fill("invalid");
      await input.press("Enter");
      await expect(page.getByRole("alert")).toContainText("Invalid value");
      await input.fill("12345678901234567890.01");
      await input.press("Enter");
      await expect(page.getByRole("status")).toHaveText(
        "Saved: 12345678901234567890.01",
      );
    });
  });
