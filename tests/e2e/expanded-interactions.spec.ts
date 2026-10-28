import { expect, test, type Page } from "@playwright/test";

const errors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
});
test.afterEach(async ({ page }, info) => {
  await info.attach("final-state", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
  expect(errors.get(page)).toEqual([]);
});

const open = (page: Page, route: string) =>
  page.goto(`${route}?preview=fullscreen`);

for (const mode of [
  {
    name: "desktop light",
    viewport: { width: 1280, height: 720 },
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

    test("autocomplete commits a keyboard suggestion and preserves free text", async ({
      page,
    }) => {
      await open(page, "components/autocomplete");
      const input = page.locator('[data-slot="autocomplete-input"]');
      await input.fill("Suz");
      const suggestion = page.getByRole("option", {
        name: "Suzuki",
        exact: true,
      });
      await expect(suggestion).toBeVisible();
      await input.press("ArrowDown");
      await expect(suggestion).toHaveAttribute("data-highlighted", "");
      await input.press("Enter");
      await expect(input).toHaveValue("Suzuki");
      await input.fill("Unlisted member");
      await input.press("Escape");
      await expect(input).toHaveValue("Unlisted member");
      await input.fill("");
      await input.press("Tab");
      await expect(input).toHaveValue("");
    });

    test("combobox keyboard selection, chip deletion and multi-select", async ({
      page,
    }) => {
      await open(page, "components/combobox");
      const inputs = page.locator('[data-slot="combobox-input"]');
      await inputs.first().fill("Suz");
      await inputs.first().press("ArrowDown");
      await expect(
        page.getByRole("option", { name: "Suzuki", exact: true }),
      ).toBeVisible();
      await inputs.first().press("Enter");
      await expect(inputs.first()).toHaveValue("Suzuki");
      const multi = inputs.nth(1);
      const chips = page.locator('[data-slot="combobox-chip"]');
      await multi.click();
      await multi.press("Backspace");
      await expect(chips).toHaveText(["Tanaka"]);
      await multi.fill("Yam");
      await multi.press("ArrowDown");
      await expect(
        page.getByRole("option", { name: "Yamada", exact: true }),
      ).toBeVisible();
      await multi.press("Enter");
      await expect(chips).toHaveText(["Tanaka", "Yamada"]);
      await multi.press("Escape");
      await expect(chips).toHaveText(["Tanaka", "Yamada"]);
    });

    test("select supports keyboard selection, multi-toggle and Escape", async ({
      page,
    }) => {
      await open(page, "components/select");
      const triggers = page.locator('[data-slot="select-trigger"]');
      await expect(triggers.first()).not.toHaveCSS("box-shadow", "none");
      await triggers.first().press("ArrowDown");
      await page
        .getByRole("option", { name: "In Review", exact: true })
        .press("Enter");
      await expect(triggers.first()).toHaveText("In Review");
      await expect(triggers.first()).toHaveAttribute("aria-expanded", "false");
      await expect(page.getByRole("listbox")).not.toBeVisible();
      await triggers.nth(1).click();
      const approved = page
        .locator('[role="listbox"][aria-multiselectable="true"]')
        .getByRole("option", { name: "Approved", exact: true });
      await approved.press("Space");
      await expect(approved).toHaveAttribute("aria-selected", "false");
      await expect(triggers.nth(1)).toHaveText("Draft");
      await approved.press("Escape");
      await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "false");
      await expect(triggers.nth(1)).toBeFocused();
    });

    test("calendar keyboard navigation traverses unavailable dates without selecting them", async ({
      page,
    }) => {
      await open(page, "components/calendar");
      const business = page.getByRole("grid", {
        name: "Select a business day in July",
      });
      const friday = business.getByRole("button", {
        name: "Friday, July 10, 2026",
        exact: true,
      });
      await friday.click();
      await friday.press("ArrowRight");
      const saturday = business.getByRole("button", {
        name: "Saturday, July 11, 2026",
        exact: true,
      });
      await expect(saturday).toBeFocused();
      await expect(saturday).toBeDisabled();
      await page.keyboard.press("Space");
      await expect(friday.locator("..")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      const monday = business.getByRole("button", {
        name: "Monday, July 13, 2026",
        exact: true,
      });
      await expect(monday).toBeFocused();
      await monday.press("Space");
      await expect(monday.locator("..")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(
        business.getByRole("button", {
          name: "Saturday, July 11, 2026",
          exact: true,
        }),
      ).toBeDisabled();
      const basic = page.getByRole("grid", {
        name: "Select a date",
        exact: true,
      });
      const day = basic.getByRole("button", {
        name: "Friday, July 10, 2026",
        exact: true,
      });
      await day.click();
      await day.press("PageDown");
      await page.keyboard.press("Space");
      await expect(
        basic
          .getByRole("button", { name: "Monday, August 10, 2026", exact: true })
          .locator(".."),
      ).toHaveAttribute("aria-selected", "true");
    });

    test("date picker announces the field and action and keeps read-only values", async ({
      page,
    }) => {
      await open(page, "components/date-picker");
      const field = page.getByRole("group", {
        name: "Locked ship date",
        exact: true,
      });
      await field
        .getByRole("spinbutton", { name: "month", exact: true })
        .press("ArrowUp");
      await expect(
        field.getByRole("spinbutton", { name: "month", exact: true }),
      ).toHaveText("07");
      const trigger = field.getByRole("button", { name: "Open calendar" });
      await trigger.click();
      const dialog = page.getByRole("dialog", {
        name: "Locked ship date, choose date",
        exact: true,
      });
      await expect(dialog).toBeVisible();
      await test
        .info()
        .attach("calendar-accessibility", {
          body: await dialog.ariaSnapshot(),
          contentType: "text/plain",
        });
      await test
        .info()
        .attach("open-calendar", {
          body: await page.screenshot({ animations: "disabled" }),
          contentType: "image/png",
        });
      await dialog
        .getByRole("button", { name: "Sunday, July 12, 2026", exact: true })
        .click();
      await expect(
        field.getByRole("spinbutton", { name: "day", exact: true }),
      ).toHaveText("10");
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    });

    for (const kind of ["dialog", "sheet"]) {
      test(`${kind} traps focus, fits the viewport and restores the trigger`, async ({
        page,
      }) => {
        await open(page, `components/${kind}`);
        const trigger = page.getByRole("button", {
          name: `Open ${kind}`,
          exact: true,
        });
        await trigger.press("Enter");
        const popup = page.getByRole("dialog");
        await expect(popup).toBeVisible();
        await expect
          .poll(async () => {
            const rect = await popup.boundingBox();
            return (
              rect != null &&
              rect.x >= -1 &&
              rect.x + rect.width <= mode.viewport.width + 1
            );
          })
          .toBe(true);
        await test
          .info()
          .attach("open-panel", {
            body: await page.screenshot({ animations: "disabled" }),
            contentType: "image/png",
          });
        for (const key of ["Tab", "Tab", "Shift+Tab"]) {
          await page.keyboard.press(key);
          await expect
            .poll(() =>
              popup.evaluate((element) =>
                element.contains(document.activeElement),
              ),
            )
            .toBe(true);
        }
        await page.keyboard.press("Escape");
        await expect(popup).not.toBeVisible();
        await expect(trigger).toBeFocused();
        await trigger.click();
        await page.mouse.click(2, 2);
        await expect(popup).not.toBeVisible();
      });
    }
  });
}

test("document links persist, renamed references resolve, embeds insert and discard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "page/document-page");
  const documents = page.getByRole("navigation", {
    name: "Documents",
    exact: true,
  });
  const origin = documents.getByRole("button", {
    name: "Supplier Onboarding Playbook",
    exact: true,
  });
  const editor = page.locator(".tiptap");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  // Edit mode focuses and selects the title on the next animation frame.
  // Let that finish before selecting body text or its selection is stolen.
  await expect(
    page.getByLabel("Document title", { exact: true }),
  ).toBeFocused();
  await editor.locator("p").first().click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("Link audit");
  await page.keyboard.press("Home");
  await page.keyboard.press("Shift+End");
  await page.getByRole("button", { name: "Add link", exact: true }).click();
  await page.getByLabel("URL", { exact: true }).fill("example.com/a?x=1&y=2");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(
    editor.getByRole("link", { name: "Link audit" }),
  ).toHaveAttribute("href", "https://example.com/a?x=1&y=2");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await documents
    .getByRole("button", { name: "Purchasing Rules", exact: true })
    .click();
  await origin.click();
  await expect(
    editor.getByRole("link", { name: "Link audit" }),
  ).toHaveAttribute("href", "https://example.com/a?x=1&y=2");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(
    page.getByLabel("Document title", { exact: true }),
  ).toBeFocused();
  await editor.locator("p").first().click();
  await page.keyboard.press("Home");
  await page.keyboard.press("Shift+End");
  await page.getByRole("button", { name: "Edit link", exact: true }).click();
  await page.getByRole("tab", { name: "Internal page", exact: true }).click();
  await page.getByLabel("Search internal pages").fill("Purchasing");
  await page
    .getByRole("list", { name: "Internal page candidates" })
    .getByRole("button", { name: /Purchasing Rules/ })
    .click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  const link = editor.locator("a[data-page-id]");
  const pageId = await link.getAttribute("data-page-id");
  await link.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Purchasing Rules",
  );
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(
    page.getByLabel("Document title", { exact: true }),
  ).toBeFocused();
  await page.getByLabel("Document title").fill("Renamed purchasing rules");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await origin.click();
  await expect(editor.locator("a[data-page-id]")).toHaveAttribute(
    "data-page-id",
    pageId!,
  );
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(
    page.getByLabel("Document title", { exact: true }),
  ).toBeFocused();
  await editor.locator("p").first().click();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Insert block", exact: true }).click();
  await page.getByRole("button", { name: "Page embed", exact: true }).click();
  await page.getByLabel("Search pages to embed").fill("Renamed");
  await page
    .getByRole("list", { name: "Page candidates" })
    .getByRole("button", { name: /Renamed purchasing rules/ })
    .click();
  await expect(editor.locator("[data-page-embed]")).toContainText(
    "Renamed purchasing rules",
  );
  await expect(editor.locator("[data-page-embed]")).toHaveAttribute(
    "data-page-id",
    pageId!,
  );
  await test.info().attach("inserted-embed", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
  await page.getByRole("button", { name: "Remove embed", exact: true }).click();
  await expect(editor.locator("[data-page-embed]")).toHaveCount(0);
  await page.getByRole("button", { name: "Discard", exact: true }).click();
  await expect(editor.locator("p")).toHaveCount(1);
  await expect(editor.locator("a[data-page-id]")).toHaveAttribute(
    "data-page-id",
    pageId!,
  );
});
