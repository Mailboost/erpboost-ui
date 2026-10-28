import { expect, test, type Locator, type Page } from "@playwright/test";

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

async function openCharts(page: Page) {
  await page.goto("patterns/data-charts?preview=fullscreen");
  await expect(page.locator(".recharts-wrapper")).toHaveCount(6);
  await expect(
    page.getByRole("button", {
      name: "Open schedule for Go-live",
      exact: true,
    }),
  ).toBeVisible();
}
async function openKanban(page: Page) {
  await page.goto("page/pipeline-kanban?preview=fullscreen");
  await expect(
    page.getByRole("heading", { name: "Deals", exact: true }),
  ).toBeVisible();
  const collapse = page.getByRole("button", {
    name: "Collapse preview sidebar",
    exact: true,
  });
  if (await collapse.count()) await collapse.click();
  await expect(
    page.getByRole("region", { name: "Lead 1", exact: true }),
  ).toBeVisible();
}
const schedule = (page: Page, name: string) =>
  page.getByRole("button", { name: `Open schedule for ${name}`, exact: true });
const input = (page: Page, name: string) =>
  page.getByRole("textbox", { name, exact: true });
async function selectPipeline(page: Page, name: string) {
  const tab = page.getByRole("tab", { name, exact: true });
  // At 375px the reference header actions overlap the pipeline tabs. Exercise
  // their keyboard activation without bypassing hit testing with a forced click.
  await tab.focus();
  await tab.press("Enter");
  await expect(tab).toHaveAttribute("aria-selected", "true");
}
const dialogClosed = (page: Page) =>
  expect(page.locator('[role="dialog"]')).toHaveCount(0);

async function expectTooltip(chart: Locator, contents: string[]) {
  const tooltip = chart.locator(".recharts-tooltip-wrapper");
  await expect(tooltip).toHaveCSS("visibility", "visible");
  for (const text of contents) await expect(tooltip).toContainText(text);
}

async function hoverSlice(
  page: Page,
  chart: Locator,
  index: number,
  radius: number,
) {
  const sectors = chart.locator(".recharts-pie-sector path");
  await expect(sectors).toHaveCount(4);
  await chart.scrollIntoViewIfNeeded();
  const svg = chart.locator("svg.recharts-surface").first();
  const box = await svg.boundingBox();
  if (!box) throw new Error("Pie chart has no layout");
  const cx = Number(await sectors.first().getAttribute("cx"));
  const cy = Number(await sectors.first().getAttribute("cy"));
  const values = [38, 27, 22, 13];
  const angle =
    ((values.slice(0, index).reduce((a, b) => a + b, 0) + values[index] / 2) /
      100) *
    Math.PI *
    2;
  // A donut sector's bounding-box centre falls inside its empty hole. Move the
  // real pointer to the middle of the painted arc, rather than forcing hover.
  await page.mouse.move(
    box.x + cx + Math.cos(angle) * radius,
    box.y + cy - Math.sin(angle) * radius,
  );
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

    test("Cartesian tooltips follow the hovered point and hide when the pointer leaves", async ({
      page,
    }) => {
      await openCharts(page);
      const charts = page.locator(".recharts-wrapper");
      const line = charts.nth(0);
      const dots = line.locator(".recharts-line-dot");
      await expect(dots).toHaveCount(5);
      await dots.first().hover();
      await expectTooltip(line, ["Jan", "v : 12"]);
      await dots.last().hover();
      await expectTooltip(line, ["May", "v : 28"]);
      const vertical = charts.nth(1);
      await vertical.locator(".recharts-bar-rectangle path").last().hover();
      await expectTooltip(vertical, ["NA", "value : 22"]);
      const horizontal = charts.nth(2);
      await horizontal.locator(".recharts-bar-rectangle path").nth(2).hover();
      await expectTooltip(horizontal, ["Ops", "backlog : 19"]);
      const stacked = charts.nth(5);
      await stacked.locator(".recharts-bar-rectangle path").nth(1).hover();
      await expectTooltip(stacked, [
        "Q2",
        "backlog : 18",
        "wip : 8",
        "done : 14",
      ]);
      await page.mouse.move(0, 0);
      await expect(stacked.locator(".recharts-tooltip-wrapper")).toHaveCSS(
        "visibility",
        "hidden",
      );
    });

    test("pie and donut tooltips retain all four values when a legend item is clicked", async ({
      page,
    }) => {
      await openCharts(page);
      const charts = page.locator(".recharts-wrapper");
      for (const index of [3, 4]) {
        const chart = charts.nth(index);
        const legend = chart.locator(".recharts-legend-item-text");
        await expect(legend).toHaveText([
          "Direct",
          "Partner",
          "Inbound",
          "Other",
        ]);
        // Wait for the initial Recharts sweep to complete before moving into an arc.
        await chart.locator(".recharts-pie-sector path").last().hover();
        await hoverSlice(page, chart, 0, index === 4 ? 61 : 50);
        await expectTooltip(chart, ["Direct : 38"]);
        await legend.first().click();
        await expect(chart.locator(".recharts-pie-sector path")).toHaveCount(4);
        await hoverSlice(page, chart, 2, index === 4 ? 61 : 50);
        await expectTooltip(chart, ["Inbound : 22"]);
        await page.mouse.move(0, 0);
        await expect(chart.locator(".recharts-tooltip-wrapper")).toHaveCSS(
          "visibility",
          "hidden",
        );
      }
    });

    test("Gantt scale changes preserve saved dates and reload restores the sample", async ({
      page,
    }) => {
      await openCharts(page);
      const gantt = page.locator(".tailor-gantt-chart");
      const widths: number[] = [];
      for (const mode of ["Week", "Year", "Month"]) {
        const tab = page.getByRole("tab", { name: mode, exact: true });
        await tab.click();
        await expect(tab).toHaveAttribute("aria-selected", "true");
        widths.push(
          await gantt
            .locator("svg")
            .evaluateAll((elements) =>
              Math.max(
                ...elements.map(
                  (element) => Number(element.getAttribute("width")) || 0,
                ),
              ),
            ),
        );
      }
      expect(new Set(widths).size).toBe(3);
      await schedule(page, "Discovery").click();
      await input(page, "Start date").fill("2026-02-10");
      await input(page, "End date").fill("2026-03-04");
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await dialogClosed(page);
      await page.getByRole("tab", { name: "Year", exact: true }).click();
      await schedule(page, "Discovery").click();
      await expect(input(page, "Start date")).toHaveValue("2026-02-10");
      await expect(input(page, "End date")).toHaveValue("2026-03-04");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await page.reload();
      await schedule(page, "Discovery").click();
      await expect(input(page, "Start date")).toHaveValue("2026-02-01");
      await expect(input(page, "End date")).toHaveValue("2026-02-25");
      await expect(
        page.getByRole("tab", { name: "Month", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
    });

    test("Gantt nested calendar changes month, Escape closes only the calendar, and Cancel discards edits", async ({
      page,
    }) => {
      await openCharts(page);
      await schedule(page, "Discovery").click();
      const calendar = page.getByRole("button", {
        name: "Open calendar: Start date",
        exact: true,
      });
      await calendar.click();
      await expect(
        page.getByRole("grid", { name: "February 2026", exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Go to the Next Month", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Tuesday, March 3rd, 2026", exact: true })
        .click();
      await expect(page.locator('[role="dialog"]')).toHaveCount(1);
      await expect(input(page, "Start date")).toHaveValue("2026-03-03");
      await calendar.click();
      await page.keyboard.press("Escape");
      await expect(page.locator('[role="dialog"]')).toHaveCount(1);
      await expect(input(page, "Start date")).toHaveValue("2026-03-03");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await dialogClosed(page);
      await schedule(page, "Discovery").click();
      await expect(input(page, "Start date")).toHaveValue("2026-02-01");
      await input(page, "Start date").fill("2026-02-12");
      await page.keyboard.press("Escape");
      await dialogClosed(page);
      await schedule(page, "Discovery").click();
      await expect(input(page, "Start date")).toHaveValue("2026-02-01");
    });

    test("Gantt rejects reversed dates and completes an incomplete schedule with a same-day range", async ({
      page,
    }) => {
      await openCharts(page);
      await schedule(page, "Go-live").click();
      await expect(input(page, "Start date")).toHaveValue("2026-06-01");
      await expect(input(page, "End date")).toHaveValue("");
      await input(page, "End date").fill("2026-05-31");
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await expect(
        page.getByText("Start date must be on or before end date.", {
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.locator('[role="dialog"]')).toHaveCount(1);
      await input(page, "End date").fill("2026-06-01");
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await dialogClosed(page);
      await schedule(page, "Go-live").click();
      await expect(input(page, "End date")).toHaveValue("2026-06-01");
    });

    test("Kanban collapse state survives keyboard pipeline changes but resets when returning from the table", async ({
      page,
    }) => {
      await openKanban(page);
      await page.getByTitle("Hide Lead", { exact: true }).click();
      await expect(page.getByTitle("Show Lead", { exact: true })).toBeVisible();
      await expect(
        page.getByRole("region", { name: "Lead 1", exact: true }),
      ).toHaveCount(0);
      await selectPipeline(page, "Expand 3");
      await expect(
        page.getByRole("region", { name: "Identified 1", exact: true }),
      ).toBeVisible();
      await expect(page.locator('[draggable="true"]')).toHaveCount(3);
      await selectPipeline(page, "New Logo 6");
      await expect(page.getByTitle("Show Lead", { exact: true })).toBeVisible();
      await page.getByTitle("Show Lead", { exact: true }).click();
      await expect(
        page.getByRole("region", { name: "Lead 1", exact: true }),
      ).toBeVisible();
      await expect(page.getByTitle("Show Lead", { exact: true })).toHaveCount(
        0,
      );
      await page.getByTitle("Hide Lead", { exact: true }).click();
      await page.getByRole("tab", { name: "Table view", exact: true }).click();
      await expect(page.getByRole("row")).toHaveCount(7);
      await selectPipeline(page, "Expand 3");
      await expect(page.getByRole("row")).toHaveCount(4);
      await selectPipeline(page, "New Logo 6");
      await page.getByRole("tab", { name: "Kanban view", exact: true }).click();
      await expect(
        page.getByRole("region", { name: "Lead 1", exact: true }),
      ).toBeVisible();
      await expect(page.getByTitle("Show Lead", { exact: true })).toHaveCount(
        0,
      );
    });

    test("Kanban and table open the same deal details, demo actions are inert, and closing restores the view", async ({
      page,
    }) => {
      await openKanban(page);
      const title = "Acme Corp — platform rollout";
      const sheet = page.locator("aside").filter({
        has: page.getByRole("heading", { name: "Deal summary", exact: true }),
      });
      await page.getByRole("heading", { name: title, exact: true }).click();
      await expect(sheet).toContainText("¥4,800,000");
      await expect(sheet).toContainText("Jun 30, 2026");
      const before = await sheet.innerText();
      for (const name of ["Log activity", "Move stage"]) {
        await sheet.getByRole("button", { name, exact: true }).click();
        await expect.poll(() => sheet.innerText()).toBe(before);
      }
      await expect(
        sheet.getByRole("link", { name: "Open full page", exact: true }),
      ).toHaveAttribute("href", "#");
      await page.keyboard.press("Escape");
      await expect(sheet).toHaveCount(0);
      await page.getByRole("tab", { name: "Table view", exact: true }).click();
      await page.getByRole("button", { name: title, exact: true }).click();
      await expect.poll(() => sheet.innerText()).toBe(before);
      await sheet.getByRole("button", { name: "Close", exact: true }).click();
      await expect(sheet).toHaveCount(0);
      await expect(
        page.getByRole("tab", { name: "Table view", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
      await page
        .getByRole("button", { name: "Create deal", exact: true })
        .click();
      await expect(sheet).toHaveCount(0);
      await expect(page.getByRole("row")).toHaveCount(7);
    });
  });
}

test("dashboard tooltips format monthly spend and category percentages without changing the table", async ({
  page,
}) => {
  await page.goto("page/dashboard-with-charts?preview=fullscreen");
  await page
    .getByRole("button", { name: "Collapse preview sidebar", exact: true })
    .click();
  const charts = page.locator(".recharts-wrapper");
  await expect(charts).toHaveCount(2);
  const monthly = charts.nth(0);
  const tick = monthly
    .locator(".recharts-xAxis .recharts-cartesian-axis-tick")
    .filter({ hasText: "Apr" });
  await monthly.scrollIntoViewIfNeeded();
  const point = await tick.boundingBox();
  const grid = await monthly.locator(".recharts-cartesian-grid").boundingBox();
  if (!point || !grid) throw new Error("Monthly chart has no layout");
  await page.mouse.move(
    point.x + point.width / 2 - 2,
    grid.y + grid.height / 2,
  );
  await expectTooltip(monthly, ["Apr", "Spend : ¥3.8M"]);
  const categories = charts.nth(1);
  await categories.locator(".recharts-bar-rectangle path").first().hover();
  await expectTooltip(categories, ["Electronics", "Share : 42%"]);
  await categories.locator(".recharts-bar-rectangle path").last().hover();
  await expectTooltip(categories, ["Other", "Share : 13%"]);
  await expect(page.getByRole("row")).toHaveCount(5);
});

test("moving a Kanban card updates the table and detail, survives view switches, and resets on reload", async ({
  page,
}) => {
  const nativeEvents: { type: string; trusted: boolean }[] = [];
  await page.exposeFunction(
    "recordKanbanDrag",
    (event: { type: string; trusted: boolean }) => nativeEvents.push(event),
  );
  await page.addInitScript(() => {
    for (const type of ["dragstart", "drop", "dragend"]) {
      window.addEventListener(
        type,
        (event) => {
          (
            window as unknown as {
              recordKanbanDrag: (event: {
                type: string;
                trusted: boolean;
              }) => void;
            }
          ).recordKanbanDrag({ type, trusted: event.isTrusted });
        },
        true,
      );
    }
  });
  await openKanban(page);
  const title = "Acme Corp — platform rollout";
  const card = page.locator('[draggable="true"]').filter({ hasText: title });
  const target = page
    .locator('[draggable="true"]')
    .filter({ hasText: "Northwind — pilot expansion" })
    .locator("xpath=ancestor::li[1]");
  const box = await target.boundingBox();
  if (!box) throw new Error("Drop target has no layout");
  await card.dragTo(target, { targetPosition: { x: 80, y: box.height - 8 } });
  await expect(
    page
      .getByRole("region", { name: "Qualified 2", exact: true })
      .locator('[draggable="true"]'),
  ).toHaveCount(2);
  await expect
    .poll(() => nativeEvents.map((event) => event.type))
    .toContain("drop");
  expect(nativeEvents.every((event) => event.trusted)).toBe(true);
  await page.getByRole("tab", { name: "Table view", exact: true }).click();
  const row = page
    .getByRole("row")
    .filter({ has: page.getByRole("button", { name: title, exact: true }) });
  await expect(row).toContainText("Qualified");
  await row.getByRole("button", { name: title, exact: true }).click();
  const sheet = page.locator("aside").last();
  await expect(sheet).toContainText("Qualified");
  await page.keyboard.press("Escape");
  await selectPipeline(page, "Expand 3");
  await expect(page.getByRole("row")).toHaveCount(4);
  await selectPipeline(page, "New Logo 6");
  await page.getByRole("tab", { name: "Kanban view", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Qualified 2", exact: true })
      .locator('[draggable="true"]'),
  ).toContainText(["Northwind — pilot expansion", title]);
  await page.reload();
  await expect(
    page
      .getByRole("region", { name: "Lead 1", exact: true })
      .locator('[draggable="true"]'),
  ).toContainText([title]);
});

test("Gantt discards invalid calendar dates on blur and saves a valid leap day", async ({
  page,
}) => {
  await openCharts(page);
  await schedule(page, "Discovery").click();
  const start = input(page, "Start date");
  const end = input(page, "End date");
  await end.fill("2028-03-10");
  for (const value of ["2026-02-31", "2026-02-29", "2026-13-10", "2026-02"]) {
    await start.fill(value);
    await expect(start).toHaveValue(value);
    await end.click();
    await expect(start).toHaveValue("2026-02-01");
  }
  await start.fill(" 2028-02-29 ");
  await expect(start).toHaveValue("2028-02-29");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await dialogClosed(page);
  await schedule(page, "Discovery").click();
  await expect(start).toHaveValue("2028-02-29");
  await expect(end).toHaveValue("2028-03-10");
});

test("Gantt reference limitation: keyboard editing is prevented by the surrounding chart", async ({
  page,
}) => {
  test.info().annotations.push({
    type: "reference-limitation",
    description:
      "The surrounding Gantt handles and prevents native keydown events from its portal. This is error parity, not working keyboard date entry.",
  });
  await openCharts(page);
  await schedule(page, "Go-live").click();
  await page.evaluate(() => {
    const state = window as unknown as {
      dateKeys: { key: string; prevented: boolean; trusted: boolean }[];
    };
    state.dateKeys = [];
    document.addEventListener(
      "keydown",
      (event) => {
        if (!(event.target instanceof HTMLInputElement)) return;
        setTimeout(() =>
          state.dateKeys.push({
            key: event.key,
            prevented: event.defaultPrevented,
            trusted: event.isTrusted,
          }),
        );
      },
      true,
    );
  });
  const start = input(page, "Start date");
  await start.press("Backspace");
  await start.pressSequentially("9");
  await expect(start).toHaveValue("2026-06-01");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as unknown as {
              dateKeys: { key: string; prevented: boolean; trusted: boolean }[];
            }
          ).dateKeys,
      ),
    )
    .toEqual([
      { key: "Backspace", prevented: true, trusted: true },
      { key: "9", prevented: true, trusted: true },
    ]);
});
