import { expect, test, type Locator, type Page } from "@playwright/test";

const pageErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
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
  expect(pageErrors.get(page)).toEqual([]);
});

const open = (page: Page, route: string) =>
  page.goto(`${route}?preview=fullscreen`);
const group = (page: Page, name: string) =>
  page.getByText(name, { exact: true }).locator("..");
const supplier = (page: Page, name: string) =>
  page.getByRole("checkbox", { name, exact: true });
const supplierRows = (page: Page) =>
  page.locator("label").filter({ has: page.getByRole("checkbox") });
const selected = (page: Page) =>
  page.getByRole("button", { name: /^Deselect / });
const supplierSearch = (page: Page) =>
  page.getByRole("textbox", { name: "Search by company name", exact: true });
async function collection(page: Page, index: number) {
  await open(page, "page/collection");
  const roots = page.locator('[data-slot="data-table"]');
  await expect(roots).toHaveCount(3);
  return roots.nth(index);
}
const rows = (root: Locator) => root.locator("tbody tr");
async function pageSize(page: Page, root: Locator, size: string) {
  await root.getByRole("combobox").click();
  await page.getByRole("option", { name: size, exact: true }).click();
  // Select keeps its listbox mounted while closed. Match the visible state,
  // rather than mistaking the hidden listbox for an open popup.
  await expect(page.getByRole("listbox")).toHaveCount(0);
}

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

    test("supplier group selection, partial state and sorted chips remain consistent without navigating on checkbox clicks", async ({
      page,
    }) => {
      await open(page, "patterns/supplier-cascader");
      const engineering = group(page, "Engineering Division");
      await engineering.getByRole("checkbox").check();
      await expect(
        page.getByText("Select a group or search by company name", {
          exact: true,
        }),
      ).toBeVisible();
      await expect(selected(page)).toHaveCount(5);
      await expect
        .poll(() =>
          selected(page).evaluateAll((elements) =>
            elements.map((element) => element.getAttribute("aria-label")),
          ),
        )
        .toEqual([
          "Deselect Kanto Heavy Industries Ltd.",
          "Deselect Naha Materials Co.",
          "Deselect Suzuki Electronic Components Inc.",
          "Deselect Tanaka Metal Works Co.",
          "Deselect Tokai Precision Ltd.",
        ]);
      await engineering
        .getByText("Engineering Division", { exact: true })
        .click();
      await expect(supplierRows(page)).toHaveCount(5);
      await page
        .getByRole("button", {
          name: "Deselect Kanto Heavy Industries Ltd.",
          exact: true,
        })
        .click();
      await expect(engineering.getByRole("checkbox")).toHaveAttribute(
        "aria-checked",
        "mixed",
      );
      await expect(
        supplier(page, "Kanto Heavy Industries Ltd."),
      ).not.toBeChecked();
      await engineering.getByRole("checkbox").check();
      await expect(selected(page)).toHaveCount(5);
      await group(page, "Asset Management Division")
        .getByRole("checkbox")
        .check();
      await expect(selected(page)).toHaveCount(7);
      await expect(supplierRows(page)).toHaveCount(5);
      await group(page, "Asset Management Division")
        .getByText("Asset Management Division", { exact: true })
        .click();
      await expect(supplierRows(page)).toHaveCount(2);
      await expect(supplier(page, "Tailor Supply Co.")).toBeChecked();
      await page
        .getByRole("button", { name: "Clear all", exact: true })
        .click();
      await expect(selected(page)).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Clear all", exact: true }),
      ).toBeDisabled();
      await expect(engineering.getByRole("checkbox")).not.toBeChecked();
    });

    test("supplier search is global, trims and ignores case, retains selections through no matches and returns to the active group", async ({
      page,
    }) => {
      await open(page, "patterns/supplier-cascader");
      await page.getByText("Engineering Division", { exact: true }).click();
      await supplier(page, "Kanto Heavy Industries Ltd.").check();
      await supplierSearch(page).fill("  gLoBaL  ");
      await expect(supplierRows(page)).toHaveCount(1);
      await expect(page.getByText("Groups", { exact: true })).toHaveCount(0);
      await supplier(page, "Global Parts Pte. Ltd.").check();
      await expect(selected(page)).toHaveCount(2);
      await supplierSearch(page).fill("no such supplier 1234");
      await expect(
        page.getByText("No suppliers match your search", { exact: true }),
      ).toBeVisible();
      await expect(supplierRows(page)).toHaveCount(0);
      await expect(selected(page)).toHaveCount(2);
      await page
        .getByRole("button", { name: "Clear search", exact: true })
        .click();
      await expect(supplierRows(page)).toHaveCount(5);
      await expect(supplier(page, "Kanto Heavy Industries Ltd.")).toBeChecked();
      await expect(
        group(page, "Engineering Division").getByRole("checkbox"),
      ).toHaveAttribute("aria-checked", "mixed");
      await page.getByText("Unaffiliated", { exact: true }).click();
      await expect(supplierRows(page)).toHaveCount(3);
      await expect(
        page
          .getByText("Unaffiliated", { exact: true })
          .locator("..")
          .getByRole("checkbox"),
      ).toBeDisabled();
      await page
        .getByRole("button", {
          name: "Deselect Global Parts Pte. Ltd.",
          exact: true,
        })
        .click();
      await expect(selected(page)).toHaveCount(1);
      await page
        .getByRole("button", { name: "Clear all", exact: true })
        .click();
      await expect(selected(page)).toHaveCount(0);
    });

    test("supplier load-more appends 8, 16 and 17 results, resets its window after search, and retains hidden selections", async ({
      page,
    }) => {
      await open(page, "patterns/supplier-cascader");
      await supplierSearch(page).fill(".");
      await expect(supplierRows(page)).toHaveCount(8);
      const first = await supplierRows(page).allTextContents();
      const more = page.getByRole("button", { name: "Load more", exact: true });
      await more.click();
      await expect(supplierRows(page)).toHaveCount(16);
      expect((await supplierRows(page).allTextContents()).slice(0, 8)).toEqual(
        first,
      );
      await more.click();
      await expect(supplierRows(page)).toHaveCount(17);
      await expect(more).toHaveCount(0);
      await supplier(page, "Jonan Industrial Co.").check();
      await supplierSearch(page).fill("cloud");
      await expect(supplierRows(page)).toHaveCount(1);
      await expect(supplier(page, "Cloud Materials LLC")).toBeVisible();
      await expect(selected(page)).toHaveCount(1);
      await supplierSearch(page).fill(".");
      await expect(supplierRows(page)).toHaveCount(8);
      await more.click();
      await more.click();
      await expect(supplier(page, "Jonan Industrial Co.")).toBeChecked();
      await page
        .getByRole("button", { name: "Clear search", exact: true })
        .click();
      await expect(
        page.getByText("Select a group or search by company name", {
          exact: true,
        }),
      ).toBeVisible();
      await expect(selected(page)).toHaveCount(1);
    });

    test("order filters reset rows and page size, while next-page search exposes the reference counter mismatch", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "reference-limitation",
        description:
          "Searching from page 2 returns the first matching row but retains Page 2 / 1 with navigation correctly disabled. Changing page size resets the display. This is matching an existing counter issue, not a correct page label.",
      });
      const root = await collection(page, 0);
      const search = root.getByRole("textbox", {
        name: "Search PO / RFQ / Supplier",
        exact: true,
      });
      await root
        .getByRole("button", { name: "Last page", exact: true })
        .click();
      await expect(rows(root).first()).toContainText("PO-2026-1031");
      await search.fill("  HARBOR  ");
      await expect(rows(root)).toHaveCount(7);
      await expect(rows(root).first()).toContainText("PO-2026-1005");
      await pageSize(page, root, "25");
      await expect(rows(root)).toHaveCount(7);
      await root.getByRole("tab", { name: "Draft", exact: true }).click();
      await expect(rows(root)).toContainText(["No data"]);
      await expect(root).toContainText("0 row(s)");
      await expect(root).toContainText("Page 1 / 1");
      for (const name of [
        "First page",
        "Previous page",
        "Next page",
        "Last page",
      ])
        await expect(
          root.getByRole("button", { name, exact: true }),
        ).toBeDisabled();
      await root.getByRole("tab", { name: "Cancelled", exact: true }).click();
      await expect(rows(root)).toHaveCount(7);
      await search.fill("");
      await root.getByRole("tab", { name: "All", exact: true }).click();
      await expect(rows(root)).toHaveCount(25);
      await root
        .getByRole("button", { name: "Next page", exact: true })
        .click();
      await expect(rows(root)).toHaveCount(11);
      await expect(rows(root).first()).toContainText("PO-2026-1026");
      await search.fill("rfq-476");
      await expect(rows(root)).toHaveCount(1);
      await expect(rows(root).first()).toContainText("PO-2026-1036");
      await expect(root).toContainText("Page 2 / 1");
      await expect(
        root.getByRole("button", { name: "Previous page", exact: true }),
      ).toBeDisabled();
      await expect(
        root.getByRole("button", { name: "Next page", exact: true }),
      ).toBeDisabled();
      await expect(
        root.getByRole("button", { name: "First page", exact: true }),
      ).toBeDisabled();
      await pageSize(page, root, "10");
      await expect(root).toContainText("Page 1 / 1");
    });

    test("catalog grid selections span pages and its bulk toolbar clears all selected cards before restoring filters", async ({
      page,
    }) => {
      const root = await collection(page, 2);
      const cards = root.locator("article");
      await expect(cards).toHaveCount(12);
      const first = cards.first().getByRole("checkbox");
      await cards.first().hover();
      await first.check();
      await expect(root.getByText("1 selected", { exact: true })).toBeVisible();
      await expect(
        root.getByRole("tab", { name: "List view", exact: true }),
      ).toHaveCount(0);
      await root
        .getByRole("button", { name: "Next page", exact: true })
        .click();
      await expect(cards).toHaveCount(12);
      await cards.first().hover();
      await cards.first().getByRole("checkbox").check();
      await expect(root.getByText("2 selected", { exact: true })).toBeVisible();
      await root
        .getByRole("button", { name: "Previous page", exact: true })
        .click();
      await expect(first).toBeChecked();
      await root.getByRole("button", { name: "Clear", exact: true }).click();
      await expect(first).not.toBeChecked();
      await expect(
        root.getByRole("tab", { name: "List view", exact: true }),
      ).toBeVisible();
      await root.getByRole("tab", { name: "List view", exact: true }).click();
      await expect(rows(root)).toHaveCount(12);
      await expect(root.getByRole("checkbox", { checked: true })).toHaveCount(
        0,
      );
      await root
        .getByRole("button", { name: "Next page", exact: true })
        .click();
      await expect(root.getByRole("checkbox", { checked: true })).toHaveCount(
        0,
      );
    });

    test("fill-layout table scrolls its own rows while its column headings, title and outer page stay fixed", async ({
      page,
    }) => {
      await open(page, "components/data-table");
      const tables = page.getByRole("table");
      await expect(tables).toHaveCount(3);
      const table = tables.nth(1);
      const container = table.locator("..");
      await expect(container).toHaveAttribute("data-slot", "table-container");
      await container.scrollIntoViewIfNeeded();
      const header = table.getByRole("columnheader", {
        name: "Supplier",
        exact: true,
      });
      const title = page.getByRole("heading", {
        name: "Suppliers",
        exact: true,
      });
      const before = {
        outer: await page.evaluate(() => window.scrollY),
        header: await header.boundingBox(),
        title: await title.boundingBox(),
      };
      const box = await container.boundingBox();
      if (!box || !before.header || !before.title)
        throw new Error("Table has no layout");
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, 600);
      await expect
        .poll(() => container.evaluate((element) => element.scrollTop))
        .toBeGreaterThan(0);
      const remaining = await container.evaluate(
        (element) =>
          element.scrollHeight - element.clientHeight - element.scrollTop,
      );
      await page.mouse.wheel(0, remaining);
      await expect
        .poll(() =>
          container.evaluate(
            (element) =>
              element.scrollTop + element.clientHeight === element.scrollHeight,
          ),
        )
        .toBe(true);
      await expect(
        table.getByRole("cell", { name: "Supplier 24", exact: true }),
      ).toBeInViewport();
      expect((await header.boundingBox())!.y).toBeCloseTo(before.header.y, 0);
      expect((await title.boundingBox())!.y).toBeCloseTo(before.title.y, 0);
      expect(await page.evaluate(() => window.scrollY)).toBe(before.outer);
      await expect(tables.nth(2).locator("tbody tr")).toContainText([
        "No data",
      ]);
    });

    test("menu keyboard navigation, persistent checkbox settings, outside dismissal and reload agree", async ({
      page,
    }) => {
      await open(page, "components/menu");
      const trigger = page.getByRole("button", {
        name: "Open menu",
        exact: true,
      });
      const menu = page.getByRole("menu", { name: "Open menu", exact: true });
      const notify = page.getByRole("menuitemcheckbox", {
        name: "Notify requester",
        exact: true,
      });
      const automatic = page.getByRole("menuitemcheckbox", {
        name: "Auto approve next time",
        exact: true,
      });
      await trigger.focus();
      await trigger.press("ArrowDown");
      await expect(
        page.getByRole("menuitem", { name: "Approve", exact: true }),
      ).toBeFocused();
      await page.keyboard.press("End");
      await expect(automatic).toBeFocused();
      await page.keyboard.press("Space");
      await expect(automatic).toHaveAttribute("aria-checked", "true");
      await expect(menu).toBeVisible();
      await page.keyboard.press("Home");
      await page.keyboard.press("r");
      await expect(
        page.getByRole("menuitem", { name: "Reject", exact: true }),
      ).toBeFocused();
      await notify.click();
      await expect(notify).toHaveAttribute("aria-checked", "false");
      await page.keyboard.press("Escape");
      await expect(page.locator('[role="menu"]')).toHaveCount(0);
      await expect
        .poll(() => page.evaluate(() => document.activeElement?.tagName))
        .toBe("BODY");
      await trigger.click();
      await expect(notify).toHaveAttribute("aria-checked", "false");
      await expect(automatic).toHaveAttribute("aria-checked", "true");
      // Hit the actual outside layer, which intercepts clicks before the
      // underlying heading and therefore cannot be targeted as a heading click.
      await page.mouse.click(2, 2);
      await expect(page.locator('[role="menu"]')).toHaveCount(0);
      await trigger.click();
      await page
        .getByRole("menuitem", { name: "Approve", exact: true })
        .click();
      await expect(page.locator('[role="menu"]')).toHaveCount(0);
      await page.reload();
      await trigger.click();
      await expect(notify).toHaveAttribute("aria-checked", "true");
      await expect(automatic).toHaveAttribute("aria-checked", "false");
      await page.keyboard.press("Escape");
      await expect(page.locator('[role="menu"]')).toHaveCount(0);
      await trigger.focus();
      await trigger.press("ArrowDown");
      await expect(
        page.getByRole("menuitem", { name: "Approve", exact: true }),
      ).toBeFocused();
      await page.keyboard.press("End");
      await expect(automatic).toBeFocused();
      await page.keyboard.press("ArrowUp");
      await expect(notify).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(notify).toHaveAttribute("aria-checked", "false");
      await page.keyboard.press("Escape");
      await expect(page.locator('[role="menu"]')).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });
  });
}

test("supplier refresh, code switch and preview size keep page-owned state, while full reload clears it", async ({
  page,
}) => {
  await page.goto("patterns/supplier-cascader");
  const sample = page.getByRole("region", {
    name: "Block preview",
    exact: true,
  });
  await group(page, "Engineering Division").getByRole("checkbox").check();
  await expect(selected(page)).toHaveCount(5);
  await sample
    .getByRole("button", { name: "Refresh preview", exact: true })
    .click();
  await expect(selected(page)).toHaveCount(5);
  await sample.getByRole("tab", { name: "Code", exact: true }).click();
  await expect(selected(page)).toHaveCount(0);
  await sample.getByRole("tab", { name: "Preview", exact: true }).click();
  await expect(selected(page)).toHaveCount(5);
  for (const name of [
    "Mobile preview width",
    "Tablet preview width",
    "Desktop preview width",
  ]) {
    await sample.getByRole("tab", { name, exact: true }).click();
    await expect(selected(page)).toHaveCount(5);
  }
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Clear all", exact: true }),
  ).toBeDisabled();
  await expect(selected(page)).toHaveCount(0);
});

test("320px menu popup stays within the viewport and Escape restores its trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await open(page, "components/menu");
  const trigger = page.getByRole("button", { name: "Open menu", exact: true });
  await trigger.click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  if (!box) throw new Error("Menu has no layout");
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  expect(box.y + box.height).toBeLessThanOrEqual(740);
  await page.keyboard.press("Escape");
  await expect(page.locator('[role="menu"]')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
