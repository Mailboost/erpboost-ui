import { expect, test } from "@playwright/test";
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test.describe(`Additive presentation ${viewport.width}px`, () => {
    test.use({ viewport });
    test.beforeEach(({}, info) =>
      test.skip(
        info.project.name === "reference",
        "Additional ERPboost compositions have no Tailor reference route.",
      ),
    );
    test("editable grid filters and delegates a cell edit", async ({
      page,
    }) => {
      await page.goto("patterns/editable-grid?preview=fullscreen");
      const cell = page.getByRole("gridcell", {
        name: "name: Precision bearing",
        exact: true,
      });
      await expect(cell).toBeVisible();
      await cell.dblclick();
      const input = page.getByRole("textbox", {
        name: "Cell value",
        exact: true,
      });
      await input.fill("Precision bearing updated");
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await expect(
        page.getByRole("gridcell", {
          name: "name: Precision bearing updated",
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByRole("textbox", { name: "表示中のデータを検索" })
        .fill("Hex bolt");
      await expect(
        page.getByRole("gridcell", {
          name: "name: Precision bearing updated",
          exact: true,
        }),
      ).toHaveCount(0);
    });
    test("record editor confirms and cancels dirty close", async ({ page }) => {
      await page.goto("patterns/record-panel?preview=fullscreen");
      await page.getByRole("button", { name: "Open record editor" }).click();
      await page
        .getByRole("textbox", { name: "Product name" })
        .fill("Draft item");
      await page.getByRole("button", { name: "閉じる", exact: true }).click();
      await expect(
        page.getByText("保存していない変更があります。"),
      ).toBeVisible();
      await page.getByRole("button", { name: "編集を続ける" }).click();
      await expect(
        page.getByRole("textbox", { name: "Product name" }),
      ).toHaveValue("Draft item");
      await page.getByRole("button", { name: "閉じる", exact: true }).click();
      await page
        .getByRole("button", { name: "変更を破棄", exact: true })
        .click();
      await expect(
        page.getByRole("textbox", { name: "Product name" }),
      ).toHaveCount(0);
    });
    test("loading wrappers keep decorative placeholders and reduced motion", async ({
      page,
    }) => {
      await page.goto("patterns/loading-layouts?preview=fullscreen");
      const skeleton = page.locator(".erpui-loading-placeholder").first();
      await expect(skeleton).toBeVisible();
      await expect(skeleton).toHaveAttribute("aria-hidden", "true");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(skeleton).toHaveCSS("animation-name", "none");
    });
    test("graph supports keyboard node selection and display controls", async ({
      page,
    }) => {
      await page.goto("patterns/workflow-graph?preview=fullscreen");
      const node = page
        .locator(".react-flow__node")
        .filter({ hasText: "Customers" });
      await expect(node).toBeVisible();
      await expect
        .poll(() =>
          node.locator('[data-slot="workflow-node"]').evaluate((el) => {
            const card = el.getBoundingClientRect();
            const canvas = el
              .closest(".erpui-workflow-graph-canvas")!
              .getBoundingClientRect();
            return (
              card.left >= canvas.left - 1 &&
              card.right <= canvas.right + 1 &&
              card.top >= canvas.top - 1 &&
              card.bottom <= canvas.bottom + 1
            );
          }),
        )
        .toBe(true);
      const controls = page.locator('[data-slot="graph-controls"]');
      await expect
        .poll(() =>
          controls.evaluate(
            (el) =>
              el.getBoundingClientRect().width <
              el.parentElement!.getBoundingClientRect().width,
          ),
        )
        .toBe(true);
      await node.focus();
      await node.press("Enter");
      await expect(page.getByRole("status")).toHaveText("Selected: customers");
      await page.getByRole("button", { name: "グラフを縦に並べる" }).click();
      await expect(
        page.getByRole("button", { name: "グラフを横に並べる" }),
      ).toBeVisible();
    });
  });
}
