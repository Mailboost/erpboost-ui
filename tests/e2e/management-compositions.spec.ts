import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
])
  test.describe(`Management compositions ${viewport.width}`, () => {
    test.use({ viewport });
    test.beforeEach(({}, info) =>
      test.skip(
        info.project.name === "reference",
        "Additive ERPBoost patterns",
      ),
    );
    test("management search and compact table preserve actionable rows", async ({
      page,
    }) => {
      await page.goto("patterns/management-layout?preview=fullscreen");
      await expect(
        page.getByRole("button", { name: "Add resource", exact: true }),
      ).toBeVisible();
      await page
        .getByRole("textbox", { name: "Search resources" })
        .fill("Second");
      await expect(
        page.getByRole("cell", { name: /Second workspace/ }),
      ).toBeVisible();
      await expect(
        page.getByRole("cell", { name: /Demo workspace/ }),
      ).toHaveCount(0);
      await page.getByRole("button", { name: "Edit two", exact: true }).click();
      await expect(
        page.getByRole("status", { name: "Selection result" }),
      ).toHaveText("Second workspace");
      if (viewport.width < 700)
        await expect(
          page.getByRole("columnheader", { name: "Endpoint", exact: true }),
        ).toHaveCount(0);
      else
        await expect(
          page.getByRole("columnheader", { name: "Endpoint", exact: true }),
        ).toBeVisible();
      await page
        .getByRole("textbox", { name: /Jordan Mitchell/ })
        .fill("Administrator");
      await expect(
        page.getByRole("textbox", { name: /Jordan Mitchell/ }),
      ).toHaveValue("Administrator");
      const row = page.locator('[data-slot="settings-row"]');
      expect((await row.boundingBox())!.width).toBeLessThanOrEqual(
        viewport.width,
      );
    });
    test("setup panel delegates its action", async ({ page }) => {
      await page.goto("patterns/management-layout?preview=fullscreen");
      await page.getByRole("button", { name: "Prepare", exact: true }).click();
      await expect(page.getByLabel("Preparation result")).toHaveText("Ready");
    });
    test("template review does not apply until confirmation and restores Back focus", async ({
      page,
    }) => {
      await page.goto("patterns/template-picker?preview=fullscreen");
      await page.getByRole("button", { name: "Choose with review" }).click();
      await expect(
        page.getByRole("button", { name: "Unavailable", exact: true }),
      ).toBeDisabled();
      await page.getByRole("button", { name: "Starter", exact: true }).click();
      await expect(
        page.getByRole("status", { includeHidden: true }),
      ).toHaveText("No choice");
      await expect(
        page.getByRole("button", { name: "Apply", exact: true }),
      ).toBeFocused();
      await page.getByRole("button", { name: "Back", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Starter", exact: true }),
      ).toBeFocused();
      await page.getByRole("button", { name: "Starter", exact: true }).click();
      await page.getByRole("button", { name: "Apply", exact: true }).click();
      await expect(page.getByRole("status")).toHaveText("Chosen: starter");
    });
    test("direct and empty template modes close safely", async ({ page }) => {
      await page.goto("patterns/template-picker?preview=fullscreen");
      await page.getByRole("button", { name: "Choose directly" }).click();
      await page
        .getByRole("button", { name: "Full template", exact: true })
        .click();
      await expect(page.getByRole("status")).toHaveText("Chosen: full");
      await page.getByRole("button", { name: "Open empty picker" }).click();
      await expect(
        page.getByRole("heading", { name: "No templates", exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
    });
  });
