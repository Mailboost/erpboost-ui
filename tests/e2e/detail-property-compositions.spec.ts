import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
])
  test.describe(`Detail/property compositions ${viewport.width}`, () => {
    test.use({ viewport });
    test.beforeEach(({}, info) =>
      test.skip(
        info.project.name === "reference",
        "Additive ERPBoost patterns",
      ),
    );
    test("property form preserves native validation, precision and narrow-container layout", async ({
      page,
    }) => {
      await page.goto("patterns/property-layout?preview=fullscreen");
      const submit = page.getByRole("button", {
        name: "Add property",
        exact: true,
      });
      await submit.click();
      await expect(page.getByLabel("Submission result")).toHaveText(
        "No submission",
      );
      const name = page.getByRole("textbox", {
        name: "Property name",
        exact: true,
      });
      await expect(name).toBeFocused();
      await name.fill("Bad Name");
      await submit.click();
      await expect(page.getByLabel("Submission result")).toHaveText(
        "No submission",
      );
      await name.fill("customer_notes");
      await submit.click();
      await expect(page.getByLabel("Submission result")).toHaveText(
        "Submitted: customer_notes",
      );
      await expect(
        page.getByRole("textbox", { name: "identifier text", exact: true }),
      ).toHaveValue("0001");
      await expect(
        page.getByRole("textbox", {
          name: /very_long_customer_reference_identifier/,
        }),
      ).toHaveValue("9007199254740993");
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(viewport.width);
      const row = page.locator('[data-slot="property-row"]').last();
      const label = await row
        .locator(".erpui-property-row-label")
        .boundingBox();
      const control = await row
        .locator(".erpui-property-row-control")
        .boundingBox();
      if (viewport.width < 500)
        expect(control!.y).toBeGreaterThanOrEqual(label!.y + label!.height);
      else expect(control!.x).toBeGreaterThan(label!.x + label!.width);
    });
    test("detail keyboard navigation, fixed actions, busy close and return focus", async ({
      page,
    }) => {
      await page.goto("patterns/detail-panel?preview=fullscreen");
      const trigger = page.getByRole("button", {
        name: "Open record",
        exact: true,
      });
      await trigger.click();
      const panel = page.getByRole("tabpanel");
      await expect(
        page.getByRole("textbox", { name: "Reference", exact: true }),
      ).toBeFocused();
      const details = page.getByRole("tab", { name: "Details", exact: true });
      await details.focus();
      await page.keyboard.press("ArrowRight");
      const unavailable = page.getByRole("tab", {
        name: "Unavailable",
        exact: true,
      });
      await expect(unavailable).toBeFocused();
      await expect(details).toHaveAttribute("aria-selected", "true");
      await expect(unavailable).toHaveAttribute("aria-disabled", "true");
      await page.keyboard.press("Enter");
      await expect(details).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("ArrowRight");
      const history = page.getByRole("tab", { name: "History", exact: true });
      await expect(history).toBeFocused();
      await expect(details).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("Enter");
      await expect(history).toHaveAttribute("aria-selected", "true");
      await expect(panel).toHaveAttribute(
        "aria-labelledby",
        (await history.getAttribute("id")) as string,
      );
      await expect(panel).toContainText("No history yet");
      await page.keyboard.press("ArrowLeft");
      await expect(unavailable).toBeFocused();
      await expect(history).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("ArrowLeft");
      await expect(details).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(
        page.getByRole("tab", { name: "Unavailable", exact: true }),
      ).toBeDisabled();
      await page
        .getByRole("button", { name: "Block closing", exact: true })
        .click();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Save record", exact: true }),
      ).toBeDisabled();
      await page
        .getByRole("button", { name: "Release busy state", exact: true })
        .click();
      await panel.evaluate((el) => (el.scrollTop = el.scrollHeight));
      await expect(
        page.getByRole("tablist", { name: "Record sections" }),
      ).toBeInViewport();
      await expect(
        page.getByRole("button", { name: "Save record", exact: true }),
      ).toBeInViewport();
      await page
        .getByRole("button", { name: "Save record", exact: true })
        .click();
      await expect(page.getByLabel("Detail result")).toHaveText(
        "Saved by caller",
      );
      const box = await page.getByRole("dialog").boundingBox();
      expect(box!.width).toBeLessThanOrEqual(viewport.width);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });
  });
