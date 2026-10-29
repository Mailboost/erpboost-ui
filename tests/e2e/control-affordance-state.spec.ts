import { expect, test } from "@playwright/test";

for (const mode of [
  {
    name: "desktop light",
    viewport: { width: 1280, height: 900 },
    colorScheme: "light" as const,
  },
  {
    name: "mobile dark",
    viewport: { width: 375, height: 812 },
    colorScheme: "dark" as const,
  },
]) {
  test.describe(mode.name, () => {
    test.use({ viewport: mode.viewport, colorScheme: mode.colorScheme });

    test("catalogue CSS preserves component cursors, disabled actions and dismiss transitions", async ({
      page,
    }) => {
      test.setTimeout(60_000);
      const routes = [
        ["alert", '[aria-label="Dismiss"]', 1],
        ["attachment", '[aria-label^="Attachment options"]', 2],
        ["autocomplete", "button:visible", 2],
        [
          "calendar",
          '[aria-label="Previous month"], [aria-label="Next month"]',
          4,
        ],
        ["combobox", "button:visible", 4],
        ["date-picker", '[aria-label="Open calendar"]', 4],
        ["select", '[data-slot="select-trigger"]', 2],
      ] as const;
      for (const [route, selector, count] of routes) {
        await page.goto(`components/${route}?preview=fullscreen`);
        const controls = page.locator("main").locator(selector);
        await expect(controls).toHaveCount(count);
        for (const control of await controls.all()) {
          await expect(control).toHaveCSS("cursor", "default");
        }
        if (route === "alert") {
          const dismiss = controls.first();
          await expect(dismiss).toHaveCSS("transition-property", "opacity");
          await expect(dismiss).toHaveCSS("transition-duration", "0.15s");
          await expect(dismiss).toHaveCSS(
            "transition-timing-function",
            "cubic-bezier(0.4, 0, 0.2, 1)",
          );
          await dismiss.hover();
          await expect(dismiss).toHaveCSS("opacity", "0.7");
          await page.keyboard.press("Tab");
          await expect(dismiss).toBeFocused();
          await expect(dismiss).toHaveCSS("outline-style", "auto");
          await dismiss.press("Enter");
          await expect(dismiss).toHaveCount(0);
        }
      }
      await page.goto("components/action-panel?preview=fullscreen");
      const disabled = page.getByRole("button", {
        name: "Sync ERP",
        exact: true,
      });
      await expect(disabled).toBeDisabled();
      await expect(disabled).toHaveCSS("pointer-events", "none");
      await expect(disabled).toHaveCSS("cursor", "pointer");
      await expect(
        page.getByRole("button", { name: "Approve request", exact: true }),
      ).toHaveCSS("cursor", "pointer");
    });
  });
}
