import { expect, test, type Locator, type Page } from "@playwright/test";
import Encoding from "encoding-japanese";

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
const goodCsv = "Supplier name,Owner,Status\nAoba,Suzuki,approved\n";

async function upload(
  page: Page,
  contents: string | Buffer,
  name = "suppliers.csv",
) {
  await page.locator('input[type="file"]').setInputFiles({
    name,
    mimeType: "text/csv",
    buffer: typeof contents === "string" ? Buffer.from(contents) : contents,
  });
}

async function csv(page: Page) {
  await open(page, "components/csv-importer");
  await page.getByRole("button", { name: "Import suppliers from CSV" }).click();
  return page.getByRole("dialog");
}

async function review(page: Page, contents: string | Buffer) {
  const dialog = await csv(page);
  await upload(page, contents);
  await expect(
    dialog.getByRole("heading", { name: "Map columns", exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    dialog.getByRole("heading", { name: "Review data", exact: true }),
  ).toBeVisible();
  return dialog;
}

const collection = (page: Page, index: number) =>
  page.locator('[data-slot="data-table"]').nth(index);
const rows = (panel: Locator) => panel.locator("tbody tr");

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

    test("CSV handles BOM, CRLF, quoted commas, quotes and blank lines", async ({
      page,
    }) => {
      const dialog = await review(
        page,
        '\uFEFFSupplier name,Owner,Status\r\n"Aoba, Inc.","Owner ""One""",approved\r\n"Tokyo\r\nWorks",Suzuki,pending\r\n\r\n',
      );
      await expect(
        dialog.getByText("Total: 2 rows", { exact: true }),
      ).toBeVisible();
      const cells = dialog.locator("tbody input");
      await expect(cells).toHaveCount(6);
      await expect(cells.nth(0)).toHaveValue("Aoba, Inc.");
      await expect(cells.nth(1)).toHaveValue('Owner "One"');
      // The reference uses single-line inputs: the embedded CRLF is not visible.
      await expect(cells.nth(3)).toHaveValue("TokyoWorks");
      await expect(
        dialog.getByRole("button", { name: "Import", exact: true }),
      ).toBeEnabled();
      await dialog.getByRole("button", { name: "Import", exact: true }).click();
      await expect(
        dialog.getByRole("heading", { name: "Import complete", exact: true }),
      ).toBeVisible();
      await expect(dialog.getByText("2", { exact: true }).last()).toBeVisible();
    });

    for (const encoding of ["SJIS", "UTF16LE"] as const) {
      test(`CSV decodes Japanese ${encoding}`, async ({ page }) => {
        const source =
          "Supplier name,Owner,Status\r\n東京商事,鈴木,approved\r\n";
        const buffer =
          encoding === "UTF16LE"
            ? Buffer.concat([
                Buffer.from([0xff, 0xfe]),
                Buffer.from(source, "utf16le"),
              ])
            : Buffer.from(
                Encoding.convert(Encoding.stringToCode(source), {
                  to: "SJIS",
                  from: "UNICODE",
                }),
              );
        const dialog = await review(page, buffer);
        await expect(dialog.locator("tbody input").nth(0)).toHaveValue(
          "東京商事",
        );
        await expect(dialog.locator("tbody input").nth(1)).toHaveValue("鈴木");
        await expect(
          dialog.getByText("No errors", { exact: true }),
        ).toBeVisible();
        await expect(
          dialog.getByRole("button", { name: "Import", exact: true }),
        ).toBeEnabled();
      });
    }

    test("CSV recovers from empty and oversized files and resets after Back", async ({
      page,
    }) => {
      const dialog = await csv(page);
      await upload(page, "");
      await expect(
        dialog.getByText("Failed to parse the CSV file", { exact: true }),
      ).toBeVisible();
      await upload(page, Buffer.alloc(10 * 1024 * 1024 + 1, 65), "large.csv");
      await expect(
        dialog.getByText("File size exceeds the maximum allowed size", {
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        dialog.getByText("Failed to parse the CSV file", { exact: true }),
      ).toHaveCount(0);
      await upload(page, goodCsv);
      await expect(
        dialog.getByRole("heading", { name: "Map columns", exact: true }),
      ).toBeVisible();
      await dialog.getByRole("button", { name: "Back", exact: true }).click();
      await expect(
        dialog.getByRole("heading", { name: "Upload CSV", exact: true }),
      ).toBeVisible();
      await expect(
        dialog.getByText("File size exceeds the maximum allowed size", {
          exact: true,
        }),
      ).toHaveCount(0);
      await upload(page, goodCsv);
      await expect(
        dialog.getByRole("button", { name: "Next", exact: true }),
      ).toBeEnabled();
    });

    test("CSV requires the name mapping and excludes already used source columns", async ({
      page,
    }) => {
      const dialog = await csv(page);
      await upload(
        page,
        "Business,Owner,Status,Extra\nAoba,Suzuki,approved,unused\n",
      );
      await expect(
        dialog.getByRole("button", { name: "Next", exact: true }),
      ).toBeDisabled();
      const nameRow = dialog.locator("tbody tr").first();
      const input = nameRow.locator('[data-slot="combobox-input"]');
      await input.press("ArrowDown");
      await expect(
        dialog.getByRole("option", { name: "Business", exact: true }),
      ).toBeVisible();
      await expect(
        dialog.getByRole("option", { name: "Owner", exact: true }),
      ).toHaveCount(0);
      await expect(
        dialog.getByRole("option", { name: "Status", exact: true }),
      ).toHaveCount(0);
      await dialog
        .getByRole("option", { name: "Business", exact: true })
        .click();
      await expect(dialog.getByRole("listbox")).not.toBeVisible();
      await expect(
        dialog.getByRole("button", { name: "Next", exact: true }),
      ).toBeEnabled();
      await expect(nameRow.getByRole("cell").last()).toHaveText("Aoba");
      await nameRow.locator('[data-slot="combobox-clear"]').click();
      await expect(
        dialog.getByRole("button", { name: "Next", exact: true }),
      ).toBeDisabled();
      await expect(nameRow.getByRole("cell").last()).toHaveText("—");
    });

    test("CSV corrections survive Back but are discarded on close and reopen", async ({
      page,
    }) => {
      const dialog = await review(
        page,
        "Supplier name,Owner,Status\n,Suzuki,unknown\n",
      );
      await expect(
        dialog.getByRole("button", { name: "Import", exact: true }),
      ).toBeDisabled();
      const inputs = dialog.locator("tbody input");
      await inputs.nth(0).fill("Corrected name");
      await inputs.nth(2).fill("approved");
      await expect(
        dialog.getByRole("button", { name: "Check", exact: true }),
      ).toBeEnabled();
      await dialog.getByRole("button", { name: "Back", exact: true }).click();
      await dialog.getByRole("button", { name: "Next", exact: true }).click();
      await expect(inputs.nth(0)).toHaveValue("Corrected name");
      await expect(inputs.nth(2)).toHaveValue("approved");
      await expect(
        dialog.getByRole("button", { name: "Import", exact: true }),
      ).toBeEnabled();
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await page
        .getByRole("button", { name: "Import suppliers from CSV" })
        .click();
      await expect(
        dialog.getByRole("heading", { name: "Upload CSV", exact: true }),
      ).toBeVisible();
      await upload(page, goodCsv);
      await dialog.getByRole("button", { name: "Next", exact: true }).click();
      await expect(inputs.nth(0)).toHaveValue("Aoba");
      await dialog.getByRole("button", { name: "Import", exact: true }).click();
      await expect(
        dialog.getByText("Rows corrected", { exact: true }),
      ).toHaveCount(0);
    });

    test("collection last-page boundaries, backward retracing and page-size reset", async ({
      page,
    }) => {
      await open(page, "page/collection");
      const panel = collection(page, 0);
      await panel
        .getByRole("button", { name: "Last page", exact: true })
        .click();
      await expect(rows(panel)).toHaveCount(6);
      await expect(rows(panel).first()).toContainText("PO-2026-1031");
      await expect(
        panel.getByRole("button", { name: "Next page", exact: true }),
      ).toBeDisabled();
      await panel
        .getByRole("button", { name: "Previous page", exact: true })
        .click();
      await expect(rows(panel)).toHaveCount(10);
      await expect(rows(panel).first()).toContainText("PO-2026-1021");
      await panel
        .getByRole("button", { name: "Next page", exact: true })
        .click();
      await expect(rows(panel).first()).toContainText("PO-2026-1031");
      await panel.getByRole("combobox").click();
      await page.getByRole("option", { name: "25", exact: true }).click();
      await expect(rows(panel)).toHaveCount(25);
      await expect(rows(panel).first()).toContainText("PO-2026-1001");
      await expect(
        panel.getByRole("button", { name: "Previous page", exact: true }),
      ).toBeDisabled();
    });

    test("collection selections span pages; page select-all clears only its own rows", async ({
      page,
    }) => {
      await open(page, "page/collection");
      const panel = collection(page, 0);
      await panel
        .getByRole("checkbox", {
          name: "PO-2026-1001 — Select row",
          exact: true,
        })
        .check();
      await panel
        .getByRole("button", { name: "Next page", exact: true })
        .click();
      await panel
        .getByRole("checkbox", { name: "Select all rows", exact: true })
        .check();
      await expect(
        panel.getByText("11 selected", { exact: true }),
      ).toBeVisible();
      await panel
        .getByRole("checkbox", { name: "Select all rows", exact: true })
        .uncheck();
      await expect(
        panel.getByText("1 selected", { exact: true }),
      ).toBeVisible();
      await panel
        .getByRole("button", { name: "Previous page", exact: true })
        .click();
      await expect(
        panel.getByRole("checkbox", {
          name: "PO-2026-1001 — Select row",
          exact: true,
        }),
      ).toBeChecked();
      await expect(
        panel.getByRole("checkbox", { name: "Select all rows", exact: true }),
      ).toHaveAttribute("aria-checked", "mixed");
      await panel.getByRole("button", { name: "Approve", exact: true }).click();
      await expect(rows(panel).first()).toContainText("ORDERED");
      await expect(
        panel.getByRole("button", { name: "Clear", exact: true }),
      ).toHaveCount(0);
      await panel
        .getByRole("checkbox", { name: "Select all rows", exact: true })
        .check();
      await panel.getByRole("button", { name: "Reject", exact: true }).click();
      await expect(rows(panel).first()).toContainText("ORDERED");
      await expect(
        panel.getByRole("checkbox", { name: "Select all rows", exact: true }),
      ).not.toBeChecked();
    });

    test("catalog preserves stock filter when switching grid/list and resets its page", async ({
      page,
    }) => {
      await open(page, "page/collection");
      const panel = collection(page, 2);
      await panel
        .getByRole("button", { name: "Last page", exact: true })
        .click();
      await expect(panel.locator("article")).toHaveCount(8);
      await panel.getByRole("tab", { name: "Low stock", exact: true }).click();
      await expect(panel.locator("article")).toHaveCount(4);
      await panel.getByRole("tab", { name: "List view", exact: true }).click();
      await expect(rows(panel)).toHaveCount(4);
      await expect(
        panel.getByRole("tab", { name: "Low stock", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
      await expect(rows(panel).first()).toContainText("SKU-4204");
      await panel
        .getByRole("textbox", { name: "Search SKU / name / supplier" })
        .fill("   missing SKU   ");
      await expect(rows(panel)).toContainText(["No data"]);
      await panel.getByRole("tab", { name: "Grid view", exact: true }).click();
      await expect(
        panel.getByText("No items match the current filters.", { exact: true }),
      ).toBeVisible();
      await panel
        .getByRole("textbox", { name: "Search SKU / name / supplier" })
        .fill("  MONITOR  ");
      await expect(panel.locator("article")).toHaveCount(1);
      await expect(
        panel.getByRole("heading", { name: "27-inch 4K monitor", exact: true }),
      ).toBeVisible();
      await expect(
        panel.getByRole("button", { name: "Previous page", exact: true }),
      ).toBeDisabled();
    });

    test("inline text editing discards Escape, Cancel and outside-click drafts", async ({
      page,
    }) => {
      await open(page, "page/collection");
      const panel = collection(page, 1);
      const trigger = panel.getByRole("button", {
        name: "RFQ-441",
        exact: true,
      });
      const popup = page.getByRole("dialog");
      for (const exit of ["escape", "cancel", "outside"]) {
        await trigger.click();
        await popup.getByRole("textbox").fill(`Unsaved ${exit}`);
        if (exit === "escape") await popup.getByRole("textbox").press("Escape");
        if (exit === "cancel")
          await popup
            .getByRole("button", { name: "Cancel", exact: true })
            .click();
        if (exit === "outside")
          await panel
            .getByRole("columnheader", { name: "Supplier", exact: true })
            .click();
        await expect(popup).not.toBeVisible();
        await expect(trigger).toBeVisible();
      }
      await trigger.click();
      await expect(popup.getByRole("textbox")).toHaveValue("RFQ-441");
      await popup.getByRole("textbox").fill("RFQ-AUDITED");
      await popup.getByRole("textbox").press("Enter");
      await expect(
        panel.getByRole("button", { name: "RFQ-AUDITED", exact: true }),
      ).toBeVisible();
      await panel
        .getByRole("button", { name: "Next page", exact: true })
        .click();
      await panel
        .getByRole("button", { name: "Previous page", exact: true })
        .click();
      await expect(
        panel.getByRole("button", { name: "RFQ-AUDITED", exact: true }),
      ).toBeVisible();
    });

    test("inline amount clamps negatives and status commits remove a filtered row", async ({
      page,
    }) => {
      await open(page, "page/collection");
      const panel = collection(page, 1);
      await rows(panel)
        .first()
        .getByRole("button", { name: "¥35,317", exact: true })
        .click();
      const popup = page.getByRole("dialog");
      await popup.getByRole("spinbutton").fill("-12.5");
      await popup.getByRole("spinbutton").press("Enter");
      await expect(
        rows(panel).first().getByRole("button", { name: "¥0", exact: true }),
      ).toBeVisible();
      await panel.getByRole("tab", { name: "Draft", exact: true }).click();
      await expect(rows(panel)).toHaveCount(7);
      await expect(rows(panel).first()).toContainText("PO-2026-1003");
      await rows(panel)
        .first()
        .getByRole("button", { name: "DRAFT", exact: true })
        .click();
      await page
        .getByRole("menuitemradio", { name: "Ordered", exact: true })
        .click();
      await expect(rows(panel)).toHaveCount(6);
      await expect(
        panel.getByRole("checkbox", {
          name: "PO-2026-1003 — Select row",
          exact: true,
        }),
      ).toHaveCount(0);
      await panel.getByRole("tab", { name: "All", exact: true }).click();
      await expect(
        rows(panel)
          .nth(2)
          .getByRole("button", { name: "ORDERED", exact: true }),
      ).toBeVisible();
    });
  });
}
