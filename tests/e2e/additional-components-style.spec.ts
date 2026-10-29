import { expect, test, type Locator } from "@playwright/test";

async function decoration(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return Object.fromEntries(
      [
        "font-family",
        "font-size",
        "font-weight",
        "line-height",
        "letter-spacing",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
        "border-radius",
        "border-top-width",
        "border-top-color",
        "background-color",
        "color",
        "box-shadow",
      ].map((property) => [property, style.getPropertyValue(property)]),
    );
  });
}

for (const mode of [
  {
    name: "desktop light",
    viewport: { width: 1280, height: 900 },
    colorScheme: "light" as const,
  },
  {
    name: "mobile dark",
    viewport: { width: 390, height: 844 },
    colorScheme: "dark" as const,
  },
]) {
  test.describe(mode.name, () => {
    test.use({ viewport: mode.viewport, colorScheme: mode.colorScheme });
    test("preserves native control decoration and uses standard loading and popup behavior", async ({
      page,
    }, info) => {
      test.skip(
        info.project.name !== "local",
        "Additional components exist on the PR catalogue only.",
      );
      await page.goto("patterns/context-details?preview=fullscreen");
      await expect(
        page.getByRole("combobox", { name: "組織を切り替え", exact: true }),
      ).toBeVisible();
      const navigation = page.getByRole("button", {
        name: "データ同期",
        exact: true,
      });
      const standardButton = page.getByRole("button", {
        name: "表示を更新",
        exact: true,
      });
      expect(await decoration(navigation)).toEqual(
        await decoration(standardButton),
      );
      expect(
        await decoration(
          page.getByRole("textbox", { name: "サンプルを検索", exact: true }),
        ),
      ).toEqual(
        await decoration(
          page.getByRole("textbox", {
            name: "サンプルのファイル名",
            exact: true,
          }),
        ),
      );
      const standardCard = await decoration(
        page.locator('[data-slot="card"]').first(),
      );
      await page
        .getByRole("checkbox", { name: "読み込み表示を確認", exact: true })
        .check();
      const skeleton = page.locator('[data-slot="skeleton"]');
      await expect(skeleton).toHaveCSS("animation-name", "pulse");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(skeleton).toHaveCSS("animation-name", "none");

      await page.goto("patterns/code-workspace?preview=fullscreen");
      expect(
        await decoration(page.locator('[data-slot="workflow-node"]').first()),
      ).toEqual(standardCard);
      const open = page.getByRole("button", {
        name: "セル編集を開く",
        exact: true,
      });
      await open.click();
      const dialog = page.getByRole("dialog", { name: "name", exact: true });
      await expect(dialog).toBeVisible();
      const value = dialog.getByRole("textbox", {
        name: "Example cell value",
        exact: true,
      });
      await expect(value).toBeFocused();
      const box = await dialog.boundingBox();
      expect(
        box && box.x >= 0 && box.x + box.width <= mode.viewport.width,
      ).toBeTruthy();
      await value.fill("draft-value");
      await value.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(open).toBeFocused();
      await open.click();
      await expect(
        dialog.getByRole("textbox", {
          name: "Example cell value",
          exact: true,
        }),
      ).toHaveValue("draft-value");
      await page
        .getByRole("heading", {
          name: "コード・ファイル・実行結果・セル編集",
          exact: true,
        })
        .click();
      await expect(dialog).toHaveCount(0);
    });
  });
}
