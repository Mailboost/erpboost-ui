import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
])
  test.describe(`Workspace compositions ${viewport.width}`, () => {
    test.use({ viewport });
    test.beforeEach(({}, info) =>
      test.skip(info.project.name === "reference", "Additive ERPBoost routes"),
    );
    test("workspace contains scrolling without displacing header or sidebar", async ({
      page,
    }) => {
      await page.goto("patterns/workspace-frame?preview=fullscreen");
      await page.getByRole("button", { name: "Products", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: "Products", exact: true }),
      ).toBeVisible();
      const frame = page.locator('[data-slot="workspace-frame"]'),
        header = page.locator('[data-slot="workspace-frame-header"]'),
        sidebar = page.locator('[data-slot="workspace-frame-sidebar"]'),
        scroll = page.locator('[data-slot="workspace-frame-scroll"]');
      const before = await header.boundingBox();
      await scroll.evaluate((el) => (el.scrollTop = el.scrollHeight));
      expect(await header.boundingBox()).toEqual(before);
      expect(Math.round((await sidebar.boundingBox())!.width)).toBe(
        viewport.width < 700 ? 72 : 176,
      );
      expect((await frame.boundingBox())!.width).toBeLessThanOrEqual(
        viewport.width,
      );
      expect(await scroll.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    });
    test("resize keyboard endpoints and pointer capture stay within bounds", async ({
      page,
    }) => {
      await page.goto("patterns/resize-control?preview=fullscreen");
      const height = page.getByRole("separator", { name: "Results height" });
      await height.focus();
      await page.keyboard.press("Home");
      await expect(height).toHaveAttribute("aria-valuenow", "100");
      await page.keyboard.press("ArrowUp");
      await expect(height).toHaveAttribute("aria-valuenow", "120");
      await page.keyboard.press("End");
      await expect(height).toHaveAttribute("aria-valuenow", "260");
      const box = await height.boundingBox();
      await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await page.mouse.down();
      await page.mouse.move(box!.x + box!.width / 2, box!.y + 120, {
        steps: 5,
      });
      await page.mouse.up();
      const resized = Number(await height.getAttribute("aria-valuenow"));
      expect(resized).toBeGreaterThanOrEqual(100);
      expect(resized).toBeLessThan(260);
      await page.mouse.move(1, 1);
      expect(Number(await height.getAttribute("aria-valuenow"))).toBe(resized);
      const width = page.getByRole("separator", { name: "Details width" });
      expect((await width.boundingBox())!.height).toBeGreaterThan(100);
      await width.focus();
      await page.keyboard.press("Home");
      await page.keyboard.press("ArrowLeft");
      await expect(width).toHaveAttribute("aria-valuenow", "120");
      await page.keyboard.press("End");
      await expect(width).toHaveAttribute("aria-valuenow", "300");
    });
    test("inline creation keeps consumer validation, exact names and IME handling", async ({
      page,
    }) => {
      await page.goto("patterns/inline-create?preview=fullscreen");
      const input = page.getByRole("textbox", { name: "New resource name" });
      await expect(
        page.getByRole("button", { name: "Create", exact: true }),
      ).toBeDisabled();
      await input.fill("duplicate");
      await input.press("Enter");
      await expect(page.getByRole("alert")).toContainText("already exists");
      await input.fill("  exact.py  ");
      await input.dispatchEvent("keydown", { key: "Enter", isComposing: true });
      await expect(page.getByRole("status")).toHaveText("No resource created");
      await input.press("Enter");
      await expect(page.getByRole("status")).toHaveText(
        "Created:   exact.py  ",
      );
      await input.press("Escape");
      await expect(page.getByRole("status")).toHaveText("Cancelled");
    });
  });
