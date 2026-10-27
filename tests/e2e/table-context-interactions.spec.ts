import { expect, test, type Page } from "@playwright/test";

type ContextEvent = { prevented: boolean; trusted: boolean };
const errors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
});
test.afterEach(async ({ page }, info) => {
  await info.attach("final-state", {
    body: await page.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
  await info.attach("accessible-state", {
    body: await page.locator("body").ariaSnapshot(),
    contentType: "text/plain",
  });
  expect(errors.get(page)).toEqual([]);
});

const open = (page: Page, route: string) =>
  page.goto(`${route}?preview=fullscreen`);

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

    for (const route of [
      "components/data-table",
      "page/collection",
      "page/dashboard-with-charts",
      "page/detail-2col-action-panel",
      "patterns/datatable-inline-edit",
      "patterns/bulk-actions-bar",
    ]) {
      test(`${route} preserves browser context-menu events on headers and cells`, async ({
        page,
      }) => {
        await open(page, route);
        await page.evaluate(() => {
          const state = window as Window & {
            tableContextEvents?: ContextEvent[];
          };
          state.tableContextEvents = [];
          document.addEventListener("contextmenu", (event) => {
            queueMicrotask(() =>
              state.tableContextEvents!.push({
                prevented: event.defaultPrevented,
                trusted: event.isTrusted,
              }),
            );
          });
        });
        const table = page.getByRole("table").first();
        const header = table
          .getByRole("columnheader")
          .filter({ hasText: /\S/ })
          .first();
        const cell = table
          .locator("tbody td")
          .filter({ hasText: /\S/ })
          .first();
        await expect(cell).toBeVisible();
        const before = await table.locator("tbody tr").allTextContents();
        for (const [index, target] of [header, cell].entries()) {
          await target.click({ button: "right" });
          await expect
            .poll(() =>
              page.evaluate(
                () =>
                  (window as Window & { tableContextEvents?: ContextEvent[] })
                    .tableContextEvents,
              ),
            )
            .toEqual(
              Array.from({ length: index + 1 }, () => ({
                prevented: false,
                trusted: true,
              })),
            );
          await expect(page.getByRole("menu")).toHaveCount(0);
        }
        expect(await table.locator("tbody tr").allTextContents()).toEqual(
          before,
        );
      });
    }

    test("bulk filtering clears hidden selections and rejecting preserves demo records", async ({
      page,
    }) => {
      await open(page, "patterns/bulk-actions-bar");
      const table = page.getByRole("table");
      const select = page.getByRole("combobox");
      await expect(table.getByRole("columnheader").first()).toHaveCSS(
        "position",
        "static",
      );
      await expect(table.getByRole("columnheader").first()).toHaveCSS(
        "background-color",
        "rgba(0, 0, 0, 0)",
      );
      const headerCheckbox = table.getByRole("checkbox", {
        name: "Select all rows",
        exact: true,
      });
      await select.press("Tab");
      await expect(headerCheckbox).toBeFocused();
      await expect(headerCheckbox).toHaveCSS("outline-style", "auto");
      await expect(headerCheckbox).toHaveCSS("box-shadow", "none");
      await headerCheckbox.press("Space");
      await expect(page.getByText("4 selected", { exact: true })).toBeVisible();
      await select.click();
      await page.getByRole("option", { name: "Pending", exact: true }).click();
      await expect(page.getByRole("listbox")).not.toBeVisible();
      await expect(table.locator("tbody tr")).toHaveCount(2);
      await table
        .getByRole("checkbox", { name: "Select all rows", exact: true })
        .check();
      await expect(page.getByText("2 selected", { exact: true })).toBeVisible();
      await select.click();
      await page.getByRole("option", { name: "Approved", exact: true }).click();
      await expect(page.getByRole("listbox")).not.toBeVisible();
      await expect(table.locator("tbody tr")).toHaveCount(1);
      await expect(
        table.getByRole("checkbox", { name: "Select all rows", exact: true }),
      ).not.toBeChecked();
      await expect(
        page.getByRole("button", { name: "Reject", exact: true }),
      ).toHaveCount(0);
      await table
        .getByRole("checkbox", { name: "Select row", exact: true })
        .check();
      await expect(page.getByText("1 selected", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Reject", exact: true }).click();
      await expect(table.locator("tbody tr").first()).toContainText(
        "East Works Ltd.",
      );
      await expect(table.locator("tbody tr").first()).toContainText("Approved");
      await expect(
        table.getByRole("checkbox", { name: "Select row", exact: true }),
      ).not.toBeChecked();
      await select.click();
      await page.getByRole("option", { name: "Pending", exact: true }).click();
      await expect(table.locator("tbody tr")).toHaveCount(2);
      await expect(
        table.getByRole("checkbox", { name: "Select all rows", exact: true }),
      ).not.toBeChecked();
    });

    test("inline checkbox identity survives renaming and subsequent keyboard edits", async ({
      page,
    }) => {
      await open(page, "patterns/datatable-inline-edit");
      const row = page.getByRole("row").filter({ hasText: "SKU-2044" });
      const confirm = page.getByRole("checkbox", {
        name: "Confirm Silicone gasket roll",
        exact: true,
      });
      await confirm.press("Space");
      await expect(confirm).toBeChecked();
      await row
        .getByRole("button", { name: "Silicone gasket roll", exact: true })
        .click();
      const popup = page.getByRole("dialog");
      await popup.getByRole("textbox").fill("Reviewed gasket");
      await popup.getByRole("textbox").press("Enter");
      await expect(popup).not.toBeVisible();
      const renamed = page.getByRole("checkbox", {
        name: "Confirm Reviewed gasket",
        exact: true,
      });
      await expect(renamed).toBeChecked();
      await row.getByRole("button", { name: "40", exact: true }).click();
      await popup.getByRole("spinbutton").fill("25");
      await popup.getByRole("spinbutton").press("Escape");
      await expect(
        row.getByRole("button", { name: "40", exact: true }),
      ).toBeVisible();
      await row.getByRole("button", { name: "Draft", exact: true }).click();
      await page
        .getByRole("menuitemradio", { name: "Active", exact: true })
        .press("Enter");
      await expect(
        row.getByRole("button", { name: "Active", exact: true }),
      ).toBeVisible();
      await expect(renamed).toBeChecked();
      await renamed.press("Space");
      await expect(renamed).not.toBeChecked();
    });
  });
}
