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
const button = (scope: Page | Locator, name: string) =>
  scope.getByRole("button", { name, exact: true });
const preview = (page: Page, name = "Preview") =>
  page.getByRole("tabpanel", { name, exact: true });
async function background(page: Page, panel: Locator, name: string) {
  const own = panel.locator("..").getByRole("tab", { name, exact: true });
  await (
    (await own.count())
      ? own
      : page.getByRole("tab", { name, exact: true }).first()
  ).click();
}

for (const mode of [
  {
    name: "desktop light",
    viewport: { width: 1280, height: 900 },
    colorScheme: "light" as const,
    mobile: false,
    card: "rgb(255, 255, 255)",
    background: "rgb(250, 250, 250)",
  },
  {
    name: "mobile dark",
    viewport: { width: 375, height: 812 },
    colorScheme: "dark" as const,
    mobile: true,
    card: "rgb(23, 23, 23)",
    background: "rgb(10, 10, 10)",
  },
]) {
  test.describe(mode.name, () => {
    test.use({ viewport: mode.viewport, colorScheme: mode.colorScheme });

    test("screen background paints the rounded frame and main, leaves its wrapper transparent and preserves page state", async ({
      page,
    }) => {
      await page.goto("page/assistant-panel");
      const panel = preview(page);
      await button(panel, "Close assistant").click();
      const wrapper = panel.locator(":scope > div");
      const frame = wrapper.locator(":scope > div");
      const main = panel.getByRole("main").first();
      for (const [name, color] of [
        ["Background", mode.background],
        ["Card", mode.card],
        ["Background", mode.background],
      ] as const) {
        await background(page, panel, name);
        await expect(wrapper).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await expect(frame).toHaveCSS("background-color", color);
        await expect(main).toHaveCSS("background-color", color);
        await expect(panel.getByRole("article")).toHaveCount(6);
        await expect(button(panel, "Ask assistant")).toBeVisible();
        await expect(button(panel, "Close assistant")).toHaveCount(0);
      }
      await button(panel, "Ask assistant").click();
      await expect(button(panel, "Close assistant")).toBeVisible();
      await expect(frame).toHaveCSS("background-color", mode.background);
    });

    test("pattern background is shared, narrow viewport changes reset it to Card, and the draft is preserved", async ({
      page,
    }) => {
      await page.goto("patterns/ai-chat");
      const panel = preview(page, "Assistant panel (assembled) preview");
      const field = panel.getByRole("textbox");
      await field.fill("Keep this draft while changing the preview");
      const wrapper = panel.locator(":scope > div");
      const own = panel.locator("..");
      await background(page, panel, "Background");
      await expect(wrapper).toHaveCSS("background-color", mode.background);
      const sources = preview(page, "Sources (citations) preview");
      await expect(sources.locator(":scope > div")).toHaveCSS(
        "background-color",
        mode.background,
      );
      for (const name of [
        "Tablet preview width",
        "Mobile preview width",
        "Desktop preview width",
      ]) {
        await own.getByRole("tab", { name, exact: true }).click();
        await expect(field).toHaveValue(
          "Keep this draft while changing the preview",
        );
        const expected =
          name === "Desktop preview width" ? mode.background : mode.card;
        await expect(wrapper).toHaveCSS("background-color", expected);
        await expect(sources.locator(":scope > div")).toHaveCSS(
          "background-color",
          expected,
        );
        await background(page, panel, "Background");
        await expect(
          own.getByRole("tab", { name, exact: true }),
        ).toHaveAttribute("aria-selected", "true");
        await expect(wrapper).toHaveCSS("background-color", mode.background);
      }
      await background(page, panel, "Card");
      await expect(wrapper).toHaveCSS("background-color", mode.card);
      await expect(field).toHaveValue(
        "Keep this draft while changing the preview",
      );
    });

    for (const backdrop of [true, false]) {
      test(`wide drilldown ${backdrop ? "with" : "without"} backdrop supports close, Escape, outside click where exposed and records placeholder expansion`, async ({
        page,
      }) => {
        test.info().annotations.push({
          type: "reference-limitation",
          description:
            "The custom drilldown uses aside rather than dialog, has no focus trap, and Open full page points only to #. At narrow widths the sheet covers the backdrop and the catalogue header covers its header actions. Mobile close is checked through Escape, without forced clicks.",
        });
        await page.goto("patterns/right-sheet-custom");
        const trigger = button(
          page,
          backdrop ? "Open · with backdrop" : "Open · no backdrop",
        );
        const panel = page.getByRole("complementary").filter({
          has: page.getByRole("heading", {
            name: "Supplier · Tailor Supply Co.",
            exact: true,
          }),
        });
        const open = async () => {
          await trigger.click();
          await expect(panel).toBeVisible();
        };
        await open();
        await expect(page.getByRole("dialog")).toHaveCount(0);
        const website = panel.getByText("https://tailor.tech", { exact: true });
        await expect(website.locator("..")).toHaveCSS("height", "24px");
        await expect(website).toHaveCSS("display", "inline");
        await expect(
          panel.getByText(
            backdrop
              ? "Drilldown panel with quick review"
              : "Transparent scrim · outside tap still closes",
            { exact: true },
          ),
        ).toBeVisible();
        await expect
          .poll(async () => Math.round((await panel.boundingBox())?.width ?? 0))
          .toBe(Math.min(mode.viewport.width, 1024));
        const scrim = button(page, "Close sheet");
        if (backdrop)
          await expect(scrim).not.toHaveCSS(
            "background-color",
            "rgba(0, 0, 0, 0)",
          );
        else
          await expect(scrim).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        const expand = panel.getByRole("link", {
          name: "Open full page",
          exact: true,
        });
        await expect(expand).toHaveAttribute("href", "#");
        if (mode.mobile) {
          expect(
            await expand.evaluate((element) => {
              const rect = element.getBoundingClientRect();
              const hit = document.elementFromPoint(
                rect.x + rect.width / 2,
                rect.y + rect.height / 2,
              );
              return hit === element || (hit != null && element.contains(hit));
            }),
          ).toBe(false);
          await page.keyboard.press("Escape");
        } else {
          await expand.click();
          await expect(panel).toBeVisible();
          expect(new URL(page.url()).hash).toBe("");
          await button(panel, "Close").click();
        }
        await expect(panel).not.toBeVisible();
        await open();
        await page.keyboard.press("Escape");
        await expect(panel).not.toBeVisible();
        await open();
        if (mode.mobile) {
          const bounds = await panel.boundingBox();
          expect(bounds!.x).toBe(0);
          await page.keyboard.press("Escape");
        } else await page.mouse.click(2, 2);
        await expect(panel).not.toBeVisible();
        await expect(trigger).toBeVisible();
      });
    }

    test("all button variants show keyboard focus, preserve their sizes, and expose hover styling", async ({
      page,
    }) => {
      await page.goto("components/button");
      const names = [
        "Primary",
        "Secondary",
        "Outline",
        "Ghost",
        "Link",
        "Destructive",
      ];
      for (let i = 0; i < names.length; i++) {
        const target = button(page, names[i]);
        await target.scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        await expect(target).toHaveCSS("font-size", "14px");
        await expect(target).toHaveCSS("line-height", "20px");
        await expect(target).toHaveCSS("height", "36px");
        await target.hover();
        expect(await target.evaluate((e) => e.matches(":hover"))).toBe(true);
        if (names[i] === "Link")
          await expect(target).toHaveCSS("text-decoration-line", "underline");
        await page.mouse.move(0, 0);
        const next = button(page, names[i + 1] ?? "XS");
        await next.focus();
        await next.press("Shift+Tab");
        await expect(target).toBeFocused();
        expect(await target.evaluate((e) => e.matches(":focus-visible"))).toBe(
          true,
        );
        await expect(target).not.toHaveCSS("box-shadow", "none");
      }
      for (const [name, height] of [
        ["XS", "28px"],
        ["SM", "32px"],
        ["Default", "36px"],
        ["LG", "40px"],
      ])
        await expect(button(page, name)).toHaveCSS("height", height);
    });

    test("field differences filter by keyboard and keep changed, unchanged and empty values distinct", async ({
      page,
    }) => {
      await page.goto("patterns/field-diff-table");
      const panel = preview(page);
      await expect(panel.getByRole("row")).toHaveCount(5);
      const tax = panel.getByRole("row").filter({
        has: page.getByRole("cell", { name: "Tax ID", exact: true }),
      });
      await expect(tax.getByRole("cell").nth(1)).toHaveText("—");
      await expect(tax.getByRole("cell").nth(2)).toHaveText("JP-9876543210");
      const company = panel.getByRole("row").filter({
        has: page.getByRole("cell", { name: "Company name", exact: true }),
      });
      await expect(company.getByRole("cell").nth(1).locator("span")).toHaveCSS(
        "text-decoration-line",
        "line-through",
      );
      const all = panel.getByRole("tab", { name: "All", exact: true });
      const changed = panel.getByRole("tab", {
        name: "Changed only",
        exact: true,
      });
      await all.focus();
      await all.press("ArrowRight");
      await expect(changed).toBeFocused();
      await expect(all).toHaveAttribute("aria-selected", "true");
      await changed.press("Enter");
      await expect(panel.getByRole("row")).toHaveCount(4);
      await expect(
        panel.getByRole("cell", { name: "Address", exact: true }),
      ).toHaveCount(0);
      await all.click();
      await expect(panel.getByRole("row")).toHaveCount(5);
      await expect(
        panel.getByRole("cell", { name: "Address", exact: true }),
      ).toBeVisible();
    });
  });
}
