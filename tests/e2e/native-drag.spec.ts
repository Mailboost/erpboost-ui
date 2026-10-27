import { expect, test, type Locator, type Page } from "@playwright/test";

type NativeEvent = { type: string; trusted: boolean };
const capturedEvents = new WeakMap<Page, NativeEvent[]>();

test.afterEach(async ({ page }, info) => {
  await info.attach("native-events", {
    body: JSON.stringify(capturedEvents.get(page) ?? [], null, 2),
    contentType: "application/json",
  });
  await info.attach("final-state", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
});

// Observe actual Chromium drag events. Never dispatch synthetic DragEvents.
async function observeNativeDrag(page: Page) {
  const events: NativeEvent[] = [];
  capturedEvents.set(page, events);
  await page.exposeFunction("recordNativeDrag", (event: NativeEvent) => {
    events.push(event);
  });
  await page.addInitScript(() => {
    for (const type of ["dragstart", "drop", "dragend"]) {
      document.addEventListener(
        type,
        (event) => {
          (
            window as unknown as {
              recordNativeDrag: (event: {
                type: string;
                trusted: boolean;
              }) => void;
            }
          ).recordNativeDrag({ type, trusted: event.isTrusted });
        },
        true,
      );
    }
  });
  return events;
}

async function assertNativeDrop(events: NativeEvent[]) {
  await expect.poll(() => events.map((event) => event.type)).toContain("drop");
  expect(events.some((event) => event.type === "dragstart")).toBe(true);
  expect(events.every((event) => event.trusted)).toBe(true);
}

async function cancelDrag(page: Page, source: Locator, target: Locator) {
  await source.hover();
  const start = await source.boundingBox();
  const end = await target.boundingBox();
  if (!start || !end) throw new Error("Drag source/target has no layout");
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    start.x + start.width / 2 + 12,
    start.y + start.height / 2 + 12,
    { steps: 4 },
  );
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, {
    steps: 8,
  });
  await page.keyboard.press("Escape");
  await page.mouse.up();
}

async function open(page: Page, route: string) {
  await page.goto(`${route}?preview=fullscreen`);
  await expect(page.locator('[draggable="true"]').first()).toBeVisible();
}

test("pipeline stages reorder in both directions and cancel without changes", async ({
  page,
}) => {
  const events = await observeNativeDrag(page);
  await open(page, "patterns/pipeline-stage-manager");
  const rows = page.locator('[draggable="true"]');
  const initial = await rows.allTextContents();
  const position = {
    sourcePosition: { x: 16, y: 20 },
    targetPosition: { x: 100, y: 30 },
  };
  await rows.nth(0).dragTo(rows.nth(2), position);
  await expect(rows).toHaveText([
    initial[1],
    initial[2],
    initial[0],
    ...initial.slice(3),
  ]);
  await test
    .info()
    .attach("reordered-state", {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  await rows.nth(2).dragTo(rows.nth(0), position);
  await expect(rows).toHaveText(initial);
  await assertNativeDrop(events);
  const beforeCancel = events.length;
  await cancelDrag(page, rows.nth(0).locator("svg").first(), rows.nth(2));
  await expect(rows).toHaveText(initial);
  await expect
    .poll(() => events.slice(beforeCancel).map((event) => event.type))
    .toContain("dragend");
  expect(events.slice(beforeCancel).map((event) => event.type)).not.toContain(
    "drop",
  );
  await page.getByRole("button", { name: "Proposal", exact: true }).click();
  await expect(
    page
      .locator('input[value="Proposal"]')
      .locator("xpath=ancestor::*[@draggable][1]"),
  ).toHaveAttribute("draggable", "false");
});

test("approval stages reorder and preserve stage settings", async ({
  page,
}) => {
  const events = await observeNativeDrag(page);
  await open(page, "patterns/approval-route-builder");
  const handles = page.getByLabel("Drag to reorder", { exact: true });
  const names = page.getByLabel("Stage name", { exact: true });
  await page
    .getByRole("button", { name: "Generated route (JSON)", exact: true })
    .click();
  const schema = async () => JSON.parse(await page.locator("pre").innerText());
  const initialSchema = await schema();
  const initial = await names.evaluateAll((elements) =>
    elements.map((element) => (element as HTMLInputElement).value),
  );
  await handles
    .nth(0)
    .dragTo(handles.nth(1).locator(".."), {
      targetPosition: { x: 100, y: 120 },
    });
  await expect
    .poll(() =>
      names.evaluateAll((elements) =>
        elements.map((element) => (element as HTMLInputElement).value),
      ),
    )
    .toEqual([initial[1], initial[0], initial[2]]);
  await expect(
    page.getByText("Requester's manager", { exact: true }),
  ).toBeVisible();
  const settings = (route: typeof initialSchema) =>
    route.stages.map(
      ({
        order: _order,
        ...stage
      }: {
        order: number;
        [key: string]: unknown;
      }) => stage,
    );
  expect(settings(await schema())).toEqual([
    settings(initialSchema)[1],
    settings(initialSchema)[0],
    settings(initialSchema)[2],
  ]);
  await handles
    .nth(1)
    .dragTo(handles.nth(0).locator(".."), {
      targetPosition: { x: 100, y: 10 },
    });
  await expect
    .poll(() =>
      names.evaluateAll((elements) =>
        elements.map((element) => (element as HTMLInputElement).value),
      ),
    )
    .toEqual(initial);
  expect(await schema()).toEqual(initialSchema);
  await assertNativeDrop(events);
  const beforeCancel = events.length;
  await cancelDrag(page, handles.nth(0), handles.nth(1).locator(".."));
  await expect
    .poll(() => events.slice(beforeCancel).map((event) => event.type))
    .toContain("dragend");
  expect(events.slice(beforeCancel).map((event) => event.type)).not.toContain(
    "drop",
  );
  await expect
    .poll(() =>
      names.evaluateAll((elements) =>
        elements.map((element) => (element as HTMLInputElement).value),
      ),
    )
    .toEqual(initial);
});

test("form fields reorder while the generated schema preserves settings", async ({
  page,
}) => {
  const events = await observeNativeDrag(page);
  await open(page, "patterns/form-builder");
  await page
    .getByRole("button", { name: "Generated schema (JSON)", exact: true })
    .click();
  const schema = async () => JSON.parse(await page.locator("pre").innerText());
  const initial = await schema();
  const handles = page.getByLabel("Drag to reorder", { exact: true });
  const second = handles.nth(1).locator("..");
  const box = await second.boundingBox();
  if (!box) throw new Error("Field has no layout");
  await handles
    .nth(0)
    .dragTo(second, { targetPosition: { x: 100, y: box.height - 8 } });
  await expect
    .poll(async () => (await schema()).fields)
    .toEqual([
      initial.fields[1],
      initial.fields[0],
      ...initial.fields.slice(2),
    ]);
  expect((await schema()).form).toEqual(initial.form);
  await handles
    .nth(1)
    .dragTo(handles.nth(0).locator(".."), { targetPosition: { x: 100, y: 8 } });
  await expect.poll(schema).toEqual(initial);
  await assertNativeDrop(events);
  const beforeCancel = events.length;
  await cancelDrag(page, handles.nth(0), handles.nth(1).locator(".."));
  await expect
    .poll(() => events.slice(beforeCancel).map((event) => event.type))
    .toContain("dragend");
  expect(events.slice(beforeCancel).map((event) => event.type)).not.toContain(
    "drop",
  );
  expect(await schema()).toEqual(initial);
});

test("Kanban cards move between columns, reorder, and cancel", async ({
  page,
}) => {
  const events = await observeNativeDrag(page);
  await open(page, "page/pipeline-kanban");
  const cards = page.locator('[draggable="true"]');
  const acme = cards.filter({ hasText: "Acme Corp — platform rollout" });
  const northwind = cards.filter({ hasText: "Northwind — pilot expansion" });
  const qualified = page.getByRole("region", { name: /^Qualified/ });
  const target = northwind.locator("xpath=ancestor::li[1]");
  const box = await target.boundingBox();
  if (!box) throw new Error("Card has no layout");
  await acme.dragTo(target, { targetPosition: { x: 80, y: box.height - 8 } });
  await expect(qualified.locator('[draggable="true"]')).toHaveCount(2);
  await expect(qualified.locator('[draggable="true"]')).toContainText([
    "Northwind — pilot expansion",
    "Acme Corp — platform rollout",
  ]);
  await acme.dragTo(northwind.locator("xpath=ancestor::li[1]"), {
    targetPosition: { x: 80, y: 8 },
  });
  await expect(qualified.locator('[draggable="true"]')).toContainText([
    "Acme Corp — platform rollout",
    "Northwind — pilot expansion",
  ]);
  await assertNativeDrop(events);
  const beforeCancel = events.length;
  await cancelDrag(page, acme, northwind);
  await expect
    .poll(() => events.slice(beforeCancel).map((event) => event.type))
    .toContain("dragend");
  expect(events.slice(beforeCancel).map((event) => event.type)).not.toContain(
    "drop",
  );
  await expect(qualified.locator('[draggable="true"]')).toContainText([
    "Acme Corp — platform rollout",
    "Northwind — pilot expansion",
  ]);
  // Moving the only Lead card left an empty column: it must accept a native drop.
  const lead = page.getByRole("region", { name: /^Lead/ });
  await acme.dragTo(lead.getByRole("heading", { name: /^Lead/ }), {
    targetPosition: { x: 30, y: 10 },
  });
  await expect(lead.locator('[draggable="true"]')).toContainText([
    "Acme Corp — platform rollout",
  ]);
  await expect(qualified.locator('[draggable="true"]')).toContainText([
    "Northwind — pilot expansion",
  ]);
});

test("timeline bars move to another lane and preserve the time range", async ({
  page,
}) => {
  const events = await observeNativeDrag(page);
  await open(page, "patterns/timeline");
  const bar = page.getByRole("button", { name: "Phase 1", exact: true });
  const interval = bar.locator(
    'xpath=ancestor::*[@data-slot="timeline-interval"][1]',
  );
  const range = () =>
    interval.evaluate((element) => ({
      left: (element as HTMLElement).style.left,
      width: (element as HTMLElement).style.width,
    }));
  const initial = await range();
  const rows = page.locator('[data-slot="timeline-row"]');
  await bar.dragTo(rows.nth(1).locator(":scope > div"), {
    targetPosition: { x: 150, y: 20 },
  });
  await expect(
    rows.nth(1).getByRole("button", { name: "Phase 1", exact: true }),
  ).toBeVisible();
  expect(await range()).toEqual(initial);
  await assertNativeDrop(events);
  const beforeCancel = events.length;
  await cancelDrag(page, bar, rows.nth(2));
  await expect
    .poll(() => events.slice(beforeCancel).map((event) => event.type))
    .toContain("dragend");
  expect(events.slice(beforeCancel).map((event) => event.type)).not.toContain(
    "drop",
  );
  await expect(
    rows.nth(1).getByRole("button", { name: "Phase 1", exact: true }),
  ).toBeVisible();
  expect(await range()).toEqual(initial);
});
