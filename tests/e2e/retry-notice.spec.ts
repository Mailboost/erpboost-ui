import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test.describe(`Retry notice ${viewport.width}`, () => {
    test.use({ viewport });
    test.beforeEach(({}, info) =>
      test.skip(
        info.project.name === "reference",
        "Additional ERPBoost composition",
      ),
    );
    test("bounds long escaped errors, retains a visible retry and supports keyboard scrolling", async ({
      page,
    }) => {
      await page.goto("patterns/retry-notice?preview=fullscreen");
      const notice = page.getByRole("alert"),
        message = notice.locator('[data-slot="alert-description"]'),
        retry = notice.getByRole("button", { name: "Try again" });
      await expect(notice).toContainText("<img src=x>");
      await expect(notice.locator("img")).toHaveCount(0);
      expect((await notice.boundingBox())!.width).toBeLessThanOrEqual(
        viewport.width,
      );
      expect((await message.boundingBox())!.height).toBeLessThanOrEqual(
        Math.min(viewport.height * 0.4, 320),
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(viewport.width);
      const top = (await retry.boundingBox())!.y;
      await message.focus();
      await message.press("End");
      await expect
        .poll(() => message.evaluate((el) => el.scrollTop))
        .toBeGreaterThan(0);
      expect((await retry.boundingBox())!.y).toBe(top);
      await expect(retry).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(notice).toBeVisible();
    });
    test("retry preserves caller draft, pending guard, failure recovery and reduced motion", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("patterns/retry-notice?preview=fullscreen");
      const draft = page.getByRole("textbox", { name: "Draft" }),
        retry = page.getByRole("button", { name: "Try again" });
      await draft.fill("9007199254740993");
      await retry.focus();
      await retry.press("Enter");
      await expect(retry).toBeDisabled();
      await expect(page.getByRole("alert")).toHaveAttribute(
        "aria-busy",
        "true",
      );
      await expect(page.getByLabel("Retry attempts")).toHaveText("1");
      await expect(page.getByLabel("Form submissions")).toHaveText("0");
      await expect(retry.locator("svg")).toHaveCSS("animation-name", "none");
      await page.getByRole("button", { name: "Fail retry" }).click();
      await expect(retry).toBeEnabled();
      await expect(draft).toHaveValue("9007199254740993");
      await retry.click();
      await page.getByRole("button", { name: "Finish retry" }).click();
      await expect(page.getByRole("alert")).toHaveCount(0);
      await expect(
        page.getByRole("status").filter({ hasText: "Loaded" }),
      ).toContainText("Loaded");
      await expect(draft).toHaveValue("9007199254740993");
      await page.getByRole("button", { name: "Show failure" }).click();
      await expect(retry).toBeEnabled();
      await expect(page.getByLabel("Retry attempts")).toHaveText("2");
    });
  });
}
