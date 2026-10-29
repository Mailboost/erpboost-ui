import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
])
  test.describe(`Result/settings compositions ${viewport.width}`, () => {
    test.use({ viewport });
    test.beforeEach(({}, info) =>
      test.skip(
        info.project.name === "reference",
        "Additive ERPBoost patterns",
      ),
    );
    test("result selection, keyboard tabs, exact preview and compact details", async ({
      page,
    }) => {
      await page.goto("patterns/result-panel?preview=fullscreen");
      const data = page.getByRole("tab", { name: "Data", exact: true }),
        panel = page.getByRole("tabpanel");
      await expect(panel).toHaveAttribute(
        "aria-labelledby",
        (await data.getAttribute("id")) as string,
      );
      await expect(
        page.getByRole("cell", { name: "0001", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("cell", { name: "9007199254740993", exact: true }),
      ).toBeVisible();
      const output = page.getByRole("combobox", {
        name: "Output table",
        exact: true,
      });
      await output.click();
      await page
        .getByRole("option", {
          name: "a_very_long_output_table_identifier",
          exact: true,
        })
        .click();
      await expect(output).toContainText("a_very_long_output_table_identifier");
      await data.focus();
      await page.keyboard.press("ArrowRight");
      const logs = page.getByRole("tab", { name: "Logs", exact: true });
      await expect(logs).toBeFocused();
      await expect(data).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("Enter");
      await expect(panel).toHaveAttribute(
        "aria-labelledby",
        (await logs.getAttribute("id")) as string,
      );
      await expect(page.getByLabel("Execution log")).toContainText(
        "<script>plain text only</script>",
      );
      await page.getByRole("tab", { name: "Run details", exact: true }).click();
      await expect(panel.locator("dd").first()).toHaveText("0001");
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(viewport.width);
      if (viewport.width < 520)
        await expect(panel.locator(".erpui-result-details")).toHaveCSS(
          "grid-template-columns",
          /^[\d.]+px$/,
        );
      await page
        .getByRole("button", { name: "Dock graph", exact: true })
        .click();
      await expect(page.getByLabel("Dock state")).toHaveText("Docked");
    });
    test("graph error text stays bounded and inert", async ({ page }) => {
      await page.goto("patterns/result-panel?preview=fullscreen");
      await page
        .getByRole("button", { name: "Toggle result error", exact: true })
        .click();
      await page.getByRole("tab", { name: "Graph", exact: true }).click();
      const alert = page.getByRole("alert"),
        panel = page.getByRole("tabpanel");
      await expect(panel).toHaveAttribute("data-graph", "true");
      await expect(alert).toContainText("<img src=x>");
      expect((await alert.boundingBox())!.height).toBeLessThanOrEqual(80);
      expect(
        await alert.evaluate((el) => el.scrollHeight > el.clientHeight),
      ).toBe(true);
      await expect(alert.locator("img")).toHaveCount(0);
      await expect(page.getByLabel("Graph placeholder")).toBeVisible();
    });
    test("settings nested selection, busy close, failed retry and return focus", async ({
      page,
    }) => {
      await page.goto("patterns/settings-panel?preview=fullscreen");
      const trigger = page.getByRole("button", {
        name: "Open settings",
        exact: true,
      });
      await trigger.click();
      const dialog = page.getByRole("dialog", {
          name: "Schedule settings",
          exact: true,
        }),
        frequency = page.getByRole("combobox", {
          name: "Frequency",
          exact: true,
        });
      await expect(frequency).toBeFocused();
      const box = await dialog.boundingBox();
      expect(box!.width).toBeLessThanOrEqual(380);
      await frequency.click();
      await expect(
        page.getByRole("option", { name: "Every 15 minutes", exact: true }),
      ).toBeVisible();
      await expect(frequency).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Escape");
      await expect(dialog).toBeVisible();
      await frequency.click();
      await page
        .getByRole("option", { name: "Every 15 minutes", exact: true })
        .click();
      await expect(frequency).toContainText("Every 15 minutes");
      await page
        .getByRole("button", { name: "Save settings", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Close settings", exact: true }),
      ).toBeDisabled();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeVisible();
      await page
        .getByRole("button", { name: "Fail save", exact: true })
        .click();
      await expect(page.getByRole("alert")).toContainText(
        "Caller-owned save error",
      );
      await expect(frequency).toContainText("Every 15 minutes");
      expect(
        (await page.getByRole("alert").boundingBox())!.height,
      ).toBeLessThanOrEqual(viewport.height / 4);
      const body = dialog.locator(".erpui-settings-panel-body");
      await body.evaluate((el) => (el.scrollTop = el.scrollHeight));
      await expect(
        page.getByRole("button", { name: "Save settings", exact: true }),
      ).toBeInViewport();
      await page
        .getByRole("button", { name: "Save settings", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Complete save", exact: true })
        .click();
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await expect(page.getByLabel("Settings result")).toHaveText("Saved: 15");
    });
    test("read-only settings remain closable", async ({ page }) => {
      await page.goto("patterns/settings-panel?preview=fullscreen");
      await page
        .getByRole("button", { name: "Open read-only settings", exact: true })
        .click();
      await expect(
        page.getByRole("combobox", { name: "Frequency", exact: true }),
      ).toBeDisabled();
      await expect(
        page.getByRole("button", { name: "Save settings", exact: true }),
      ).toBeDisabled();
      await page
        .getByRole("button", { name: "Close settings", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
    });
  });
