import { expect, test, type Page } from "@playwright/test";

const content = (page: Page) =>
  page.locator("[data-appshell-scroll-container]");
const cards = (page: Page) => content(page).getByRole("link");
const button = (page: Page, name: string) =>
  content(page).getByRole("button", { name, exact: true });

async function language(page: Page, mobile: boolean, name: "EN" | "JA") {
  if (mobile) {
    await page
      .getByRole("button", { name: "Toggle Sidebar", exact: true })
      .last()
      .click();
    await expect(
      page.getByRole("dialog", { name: "Sidebar", exact: true }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name, exact: true }).click();
  if (mobile) {
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Sidebar", exact: true }),
    ).not.toBeVisible();
  }
}

for (const mode of [
  {
    name: "desktop light",
    viewport: { width: 1280, height: 900 },
    colorScheme: "light" as const,
    mobile: false,
  },
  {
    name: "mobile dark",
    viewport: { width: 375, height: 812 },
    colorScheme: "dark" as const,
    mobile: true,
  },
]) {
  test.describe(mode.name, () => {
    test.use({ viewport: mode.viewport, colorScheme: mode.colorScheme });

    test("category filters combine keyboard-selected tags with status and retain the empty-state spacing", async ({
      page,
    }) => {
      await page.goto("page");
      await expect(cards(page)).toHaveCount(10);
      await button(page, "Draft").focus();
      await page.keyboard.press("Tab");
      await expect(button(page, "All").last()).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(button(page, "action-panel")).toBeFocused();
      await page.keyboard.press("Space");
      await expect(cards(page)).toHaveCount(1);
      await expect(cards(page).first()).toHaveAttribute(
        "href",
        /\/page\/detail-2col-action-panel$/,
      );
      await button(page, "form").click();
      await expect(cards(page)).toHaveCount(2);
      await button(page, "Draft").press("Enter");
      await expect(cards(page)).toHaveCount(0);
      const empty = content(page).getByText(
        "No entries match the current filters.",
        { exact: true },
      );
      await expect(empty).toBeVisible();
      await expect
        .poll(async () => {
          const box = await empty.boundingBox();
          const lastTag = await content(page)
            .getByRole("button")
            .last()
            .boundingBox();
          return Math.round(box!.y - lastTag!.y - lastTag!.height);
        })
        .toBe(48);
      await button(page, "Public").press("Space");
      await expect(cards(page)).toHaveCount(2);
      await button(page, "All").last().click();
      await expect(cards(page)).toHaveCount(10);
      expect(new URL(page.url()).search).toBe("");
    });

    test("language switching retains both category filters while reload resets filters and retains language", async ({
      page,
    }) => {
      await page.goto("page");
      await button(page, "form").click();
      await button(page, "Draft").click();
      const url = page.url();
      await language(page, mode.mobile, "JA");
      await expect(content(page).getByRole("heading", { level: 1 })).toHaveText(
        "ページ",
      );
      await expect(page).toHaveURL(url);
      await expect(cards(page)).toHaveCount(0);
      await button(page, "すべて").click();
      await expect(cards(page)).toHaveCount(2);
      await page.reload();
      await expect(content(page).getByRole("heading", { level: 1 })).toHaveText(
        "ページ",
      );
      await expect(cards(page)).toHaveCount(10);
      await language(page, mode.mobile, "EN");
      await expect(content(page).getByRole("heading", { level: 1 })).toHaveText(
        "Pages",
      );
      await expect(cards(page)).toHaveCount(10);
    });

    test("browser Back and Forward remount the category and its form instead of restoring an unsaved draft", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "reference-limitation",
        description:
          "Browser navigation resets category filters and discards the in-memory form draft. This is not persisted draft restoration.",
      });
      await page.goto("page");
      await button(page, "form").click();
      await expect(cards(page)).toHaveCount(2);
      await cards(page).first().focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/page\/form-as-page\/?$/);
      const title = page
        .getByRole("region", { name: "Single column", exact: true })
        .getByPlaceholder("Review supplier docs", { exact: true });
      await title.fill("Unsaved category navigation audit");
      await page.goBack();
      await expect(content(page).getByRole("heading", { level: 1 })).toHaveText(
        "Pages",
      );
      await expect(cards(page)).toHaveCount(10);
      await page.goForward();
      await expect(page).toHaveURL(/\/page\/form-as-page\/?$/);
      await expect(title).toHaveValue("");
    });

    test("modifier-click opens an independent page tab without changing the parent category filter", async ({
      page,
      context,
    }) => {
      await page.goto("page");
      await button(page, "form").click();
      await expect(cards(page)).toHaveCount(2);
      const parentUrl = page.url();
      const popupPromise = context.waitForEvent("page");
      await cards(page)
        .first()
        .click({ modifiers: ["ControlOrMeta"] });
      const popup = await popupPromise;
      await expect(popup).toHaveURL(/\/page\/form-as-page\/?$/);
      const title = popup
        .getByRole("region", { name: "Single column", exact: true })
        .getByPlaceholder("Review supplier docs", { exact: true });
      await expect(title).toHaveValue("");
      await title.fill("Independent new tab");
      await expect(page).toHaveURL(parentUrl);
      await expect(cards(page)).toHaveCount(2);
      await popup.close();
      await button(page, "All").last().click();
      await expect(cards(page)).toHaveCount(10);
    });
  });
}

test("category grid crosses both responsive boundaries and an open mobile sidebar releases its pointer lock after resize", async ({
  page,
}) => {
  await page.goto("page");
  await expect(cards(page)).toHaveCount(10);
  for (const [width, columns] of [
    [1280, 3],
    [1279, 2],
    [768, 2],
    [767, 1],
    [375, 1],
  ]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        cards(page).evaluateAll((elements) => {
          const boxes = elements
            .slice(0, 3)
            .map((element) => element.getBoundingClientRect());
          return boxes.filter((box) => box.top === boxes[0].top).length;
        }),
      )
      .toBe(columns);
  }
  await page
    .getByRole("button", { name: "Toggle Sidebar", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("dialog", { name: "Sidebar", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(
    page.getByRole("dialog", { name: "Sidebar", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("body")).toHaveCSS("pointer-events", "auto");
  await button(page, "form").click();
  await expect(cards(page)).toHaveCount(2);
});
