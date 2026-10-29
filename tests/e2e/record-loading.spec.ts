import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test.describe(`Record loading ${viewport.width}`, () => {
    test.use({ viewport });
    test.beforeEach(({}, info) =>
      test.skip(
        info.project.name === "reference",
        "Additional ERPBoost composition",
      ),
    );
    test("keeps a labelled busy region with no pretend inputs, then restores real data", async ({
      page,
    }) => {
      await page.goto("patterns/record-loading?preview=fullscreen");
      const region = page.getByRole("region", {
        name: "Record preview",
        exact: true,
      });
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region.getByRole("status")).toHaveText("Loading record…");
      await expect(region.getByRole("textbox")).toHaveCount(0);
      await expect(region.getByRole("button")).toHaveCount(0);
      await expect(region.getByRole("columnheader")).toHaveCount(4);
      for (const row of await region.locator(".erpui-table-loading-row").all())
        await expect(row).toHaveCSS("cursor", "default");
      const fields = region.locator(".erpui-form-loading-field");
      await expect(fields).toHaveCount(3);
      const first = (await fields.nth(0).boundingBox())!,
        second = (await fields.nth(1).boundingBox())!;
      if (viewport.width === 390)
        expect(second.y).toBeGreaterThan(first.y + first.height);
      else expect(second.y).toBe(first.y);
      await page
        .getByRole("button", { name: "Show loaded", exact: true })
        .click();
      await expect(region).toHaveAttribute("aria-busy", "false");
      await expect(
        region.getByRole("textbox", { name: "Reference", exact: true }),
      ).toHaveValue("0001");
      await expect(
        region.getByRole("button", { name: "Edit", exact: true }),
      ).toBeEnabled();
      await expect(region.locator(".erpui-table-loading-row")).toHaveCount(0);
      await expect(region.getByRole("status")).toHaveText("Record ready");
    });
    test("limits overflow to the detail table and honors reduced motion in dark mode", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
      await page.goto("patterns/record-loading?preview=fullscreen");
      const scroll = page.getByRole("region", {
        name: "Record items",
        exact: true,
      });
      await scroll.focus();
      await expect(scroll).toBeFocused();
      if (viewport.width === 390) {
        expect(
          await scroll.evaluate((el) => el.scrollWidth > el.clientWidth),
        ).toBe(true);
        await scroll.press("ArrowRight");
        await expect
          .poll(() => scroll.evaluate((el) => el.scrollLeft))
          .toBeGreaterThan(0);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(viewport.width);
      const shapes = page.locator(".erpui-record-placeholder");
      await expect(shapes.first()).toHaveCSS("animation-name", "none");
      for (const box of await shapes.evaluateAll((elements) =>
        elements.map((el) => {
          const b = el.getBoundingClientRect();
          return { width: b.width, height: b.height };
        }),
      )) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
      await page
        .getByRole("button", { name: "Show loaded", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Show loading", exact: true })
        .click();
      await expect(page.locator(".erpui-table-loading-row")).toHaveCount(3);
    });
  });
}
