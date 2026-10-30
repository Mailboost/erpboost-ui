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
    test("sensitive input reveals and conceals without changing input", async ({
      page,
    }) => {
      await page.goto("patterns/sensitive-input?preview=fullscreen");
      await page.getByLabel("API key", { exact: true }).fill("synthetic-value");
      await page.getByRole("button", { name: "Show value" }).click();
      await expect(page.getByLabel("API key", { exact: true })).toHaveAttribute(
        "type",
        "text",
      );
      await page.getByRole("button", { name: "Hide value" }).click();
      await expect(page.getByLabel("API key", { exact: true })).toHaveValue(
        "synthetic-value",
      );
      await expect(page.getByLabel("API key", { exact: true })).toHaveAttribute(
        "type",
        "password",
      );
    });
    test("collection layout filters with horizontal table scrolling", async ({
      page,
    }) => {
      await page.goto("patterns/collection-layout?preview=fullscreen");
      await page.getByRole("textbox", { name: "Search products" }).fill("bolt");
      await expect(page.getByRole("cell", { name: "Hex bolt" })).toBeVisible();
      await expect(page.getByRole("status")).toHaveText("1 products");
      const results = page.locator(".erpui-collection-results");
      await expect(results).toHaveCSS("overflow", "auto");
    });
    test("record layouts preserve exact values and keep actions fixed while scrolling", async ({
      page,
    }) => {
      await page.goto("patterns/record-layouts?preview=fullscreen");
      await expect(
        page.getByRole("textbox", { name: "Price", exact: true }),
      ).toHaveValue("123456789012345678.90");
      const region = page.getByRole("region", { name: "Line items" });
      const box = await region.boundingBox();
      expect(box!.width).toBeLessThanOrEqual(viewport.width);
      if (viewport.width < 768) {
        expect(
          await region.evaluate((el) => el.scrollWidth > el.clientWidth),
        ).toBe(true);
        await region.evaluate((el) => (el.scrollLeft = el.scrollWidth));
        await expect(
          page.getByRole("button", { name: "Remove line" }),
        ).toBeVisible();
      }
      await expect(
        page.getByRole("button", { name: "Submit", exact: true }),
      ).toBeVisible();
    });
    test("history reveals a result without interpreting it", async ({
      page,
    }) => {
      await page.goto("patterns/record-history?preview=fullscreen");
      await page.getByText("Result", { exact: true }).click();
      await expect(page.getByLabel("Result JSON")).toContainText('"0001"');
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
