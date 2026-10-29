import { expect, test } from "@playwright/test";

for (const mode of [
  {
    name: "desktop light",
    viewport: { width: 1280, height: 900 },
    colorScheme: "light" as const,
    shadow: "rgba(15, 23, 42, 0.06) 0px 1px 2px 0px",
  },
  {
    name: "mobile dark",
    viewport: { width: 375, height: 812 },
    colorScheme: "dark" as const,
    shadow: "rgba(0, 0, 0, 0.35) 0px 1px 2px 0px",
  },
]) {
  test.describe(mode.name, () => {
    test.use({ viewport: mode.viewport, colorScheme: mode.colorScheme });

    test("multiple selection keeps its surface shadow through chip keyboard focus, removal, search and pointer selection", async ({
      page,
    }) => {
      await page.goto("components/combobox?preview=fullscreen");
      const input = page.locator('[data-slot="combobox-input"]').nth(1);
      const surface = page.locator('[data-slot="combobox-chips"]');
      const chips = page.locator('[data-slot="combobox-chip"]');
      const hasSurfaceShadow = async () => {
        await expect
          .poll(() =>
            surface.evaluate((element) => getComputedStyle(element).boxShadow),
          )
          .toContain(mode.shadow);
      };
      await expect(chips).toHaveText(["Tanaka", "Sato"]);
      await hasSurfaceShadow();
      await input.click();
      await input.press("ArrowLeft");
      await expect(chips.last()).toBeFocused();
      await expect(chips.last()).toHaveText("Sato");
      await hasSurfaceShadow();
      await page.keyboard.press("Backspace");
      await expect(chips).toHaveText(["Tanaka"]);
      await expect(chips.first()).toBeFocused();
      await hasSurfaceShadow();
      await input.fill("Suz");
      const option = page.getByRole("option", { name: "Suzuki", exact: true });
      await option.hover();
      await expect(option).toHaveAttribute("data-highlighted", "");
      await hasSurfaceShadow();
      await option.click();
      await expect(chips).toHaveText(["Tanaka", "Suzuki"]);
      await expect(input).toHaveValue("");
      await hasSurfaceShadow();
      await page.locator('[data-slot="combobox-chip-remove"]').first().click();
      await expect(chips).toHaveText(["Suzuki"]);
      await expect(input).toBeFocused();
      await hasSurfaceShadow();
    });

    test("empty multiple selection shows its prompt after closing and can be selected again in English and Japanese", async ({
      page,
    }) => {
      for (const language of ["en", "ja"]) {
        if (language === "ja") {
          await page.goto("components/select");
          if (mode.viewport.width < 768)
            await page
              .getByRole("button", { name: "Toggle Sidebar", exact: true })
              .click();
          await page.getByRole("button", { name: "JA", exact: true }).click();
          if (mode.viewport.width < 768) await page.keyboard.press("Escape");
          await expect(page.locator("html")).toHaveAttribute("lang", "ja");
        }
        await page.goto("components/select?preview=fullscreen");
        const trigger = page.locator('[data-slot="select-trigger"]').nth(1);
        await expect(trigger).toHaveText("Draft, Approved");
        await trigger.press("ArrowDown");
        for (const status of ["Draft", "Approved"]) {
          const option = page.getByRole("option", {
            name: status,
            exact: true,
          });
          await option.press("Space");
          await expect(option).toHaveAttribute("aria-selected", "false");
        }
        await page.keyboard.press("Escape");
        await expect(page.getByRole("listbox")).not.toBeVisible();
        await expect(trigger).toHaveText("Choose statuses");
        await expect(trigger).toBeFocused();
        await trigger.press("ArrowDown");
        const review = page.getByRole("option", {
          name: "In Review",
          exact: true,
        });
        await review.press("Space");
        await expect(review).toHaveAttribute("aria-selected", "true");
        await page.keyboard.press("Escape");
        await expect(trigger).toHaveText("In Review");
        await expect(trigger).toBeFocused();
      }
    });
  });
}
