import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
]) {
  test.describe(`ERPboost header ${viewport.width}px`, () => {
    test.use({ viewport });
    test("keeps both selectors separate, preserves their selection and labels loading states", async ({
      page,
    }, info) => {
      test.skip(
        info.project.name === "reference",
        "ERPboost-specific component; not a Tailor reference route.",
      );
      await page.goto("patterns/erp-header?preview=fullscreen");
      const organization = page.getByRole("combobox", {
        name: "組織を切り替え",
        exact: true,
      });
      const connection = page.getByRole("combobox", {
        name: "ERP接続を切り替え",
        exact: true,
      });
      await expect(organization).toBeVisible();
      await expect(connection).toBeVisible();
      const orgBox = await organization.boundingBox(),
        connectionBox = await connection.boundingBox();
      expect(
        orgBox && connectionBox && orgBox.x + orgBox.width <= connectionBox.x,
      ).toBeTruthy();
      await organization.click();
      await expect(
        page.getByRole("combobox", { name: "組織を検索", exact: true }),
      ).toBeVisible();
      await page
        .getByRole("option", {
          name: "株式会社サンプルの長い組織名",
          exact: true,
        })
        .click();
      await expect(organization).toContainText("株式会社サンプルの長い組織名");
      await expect(connection).toContainText("検証用ERP接続");
      await connection.click();
      await page
        .getByRole("option", {
          name: "長い名前のERP接続・販売管理システム",
          exact: true,
        })
        .click();
      await expect(connection).toContainText(
        "長い名前のERP接続・販売管理システム",
      );
      const header = page.locator('[data-slot="erp-header"]');
      expect(
        await header.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
      await page
        .getByRole("button", { name: "読み込み表示を切り替え", exact: true })
        .click();
      await expect(
        page.getByRole("status", {
          name: "組織を読み込んでいます",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("status", {
          name: "ERP接続を読み込んでいます",
          exact: true,
        }),
      ).toBeVisible();
      await expect(organization).toHaveCount(0);
      await expect(connection).toHaveCount(0);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(
        page.locator('[data-slot="erp-header-skeleton"]').first(),
      ).toHaveCSS("animation-name", "none");
      await page
        .getByRole("button", { name: "読み込み表示を切り替え", exact: true })
        .click();
      await expect(organization).toContainText("株式会社サンプルの長い組織名");
      await expect(connection).toContainText(
        "長い名前のERP接続・販売管理システム",
      );
    });
  });
}
