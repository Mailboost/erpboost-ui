import { expect, test, type Locator, type Page } from "@playwright/test";

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
  // Freeze Date, not timers: activity labels use module-initialized relative dates.
  await page.clock.setFixedTime(new Date("2026-10-28T12:00:00Z"));
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

function limitation(description: string) {
  test.info().annotations.push({ type: "reference-limitation", description });
}
const preview = (page: Page, name: string) =>
  page.getByRole("tabpanel", { name: `${name} preview`, exact: true });
async function detail(page: Page, tabbed = false) {
  await page.goto("page/detail-2col-action-panel");
  const panel = preview(page, tabbed ? "Page tabs" : "2 columns · ActionPanel");
  await expect(
    panel.getByRole("heading", { name: "Tailor Supply Co.", exact: true }),
  ).toBeVisible();
  return panel;
}
async function master(page: Page, sheet = false) {
  await page.goto("page/simple-master-crud");
  const panel = preview(
    page,
    sheet ? "Sheet (many fields)" : "Dialog (few fields)",
  );
  await expect(panel.getByRole("table")).toBeVisible();
  return panel;
}
async function edit(page: Page, panel: Locator, code = "ELC") {
  const row = panel
    .getByRole("row")
    .filter({ has: page.getByRole("cell", { name: code, exact: true }) });
  await row.hover();
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  const dialog = page.getByRole("dialog", {
    name: "Edit category",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  return dialog;
}
async function select(
  page: Page,
  dialog: Locator,
  label: string,
  value: string,
) {
  await dialog.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: value, exact: true }).click();
}
async function close(page: Page, dialog: Locator) {
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
}
const codeField = (dialog: Locator) =>
  dialog.getByRole("textbox", { name: "Code", exact: true });
const nameField = (dialog: Locator) => dialog.locator('input[name="name"]');
const descriptionField = (dialog: Locator) =>
  dialog.locator('textarea[name="description"]');

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
    test.use({
      viewport: mode.viewport,
      colorScheme: mode.colorScheme,
      timezoneId: "Asia/Tokyo",
    });

    test("supplier PO filters combine statuses and trimmed case-insensitive search, including empty and zero results", async ({
      page,
    }) => {
      const panel = await detail(page);
      await expect(panel.getByRole("row")).toHaveCount(6);
      for (const [status, ids] of [
        ["Open", ["PO-24118", "PO-24102"]],
        ["Received", ["PO-24072", "PO-23988"]],
        ["Closed", ["PO-23941"]],
      ] as const) {
        await panel.getByRole("tab", { name: status, exact: true }).click();
        await expect(panel.getByRole("row")).toHaveCount(ids.length + 1);
        for (const id of ids)
          await expect(
            panel.getByRole("cell", { name: id, exact: true }),
          ).toBeVisible();
      }
      await panel.getByRole("tab", { name: "All", exact: true }).click();
      const search = panel.getByRole("textbox", {
        name: "Search PO",
        exact: true,
      });
      await search.fill("  po-24102  ");
      await expect(panel.getByRole("row")).toHaveCount(2);
      await expect(
        panel.getByRole("cell", { name: "PO-24102", exact: true }),
      ).toBeVisible();
      await panel.getByRole("tab", { name: "Received", exact: true }).click();
      await expect(panel.getByText("No data", { exact: true })).toBeVisible();
      await search.fill("   ");
      await expect(panel.getByRole("row")).toHaveCount(3);
      await search.fill("");
      await panel.getByRole("tab", { name: "All", exact: true }).click();
      await expect(panel.getByRole("row")).toHaveCount(6);
      await expect(
        panel.getByText("Oct 28, 2026, 8:30 PM", { exact: true }),
      ).toHaveCount(1);
      await expect(
        panel.getByText("Oct 27, 2026, 8:00 PM", { exact: true }),
      ).toHaveCount(1);
    });

    test("supplier page tabs reset orders on remount and record their missing arrow-key navigation", async ({
      page,
    }) => {
      limitation(
        "Custom page tabs do not implement arrow-key navigation; switching away unmounts Orders and resets its search/status.",
      );
      const panel = await detail(page, true);
      const profile = panel.getByRole("tab", { name: "Profile", exact: true });
      await profile.focus();
      await profile.press("ArrowRight");
      await expect(profile).toBeFocused();
      await expect(profile).toHaveAttribute("aria-selected", "true");
      const orders = panel.getByRole("tab", { name: "Orders 5", exact: true });
      await orders.click();
      await panel.getByRole("tab", { name: "Received", exact: true }).click();
      await panel
        .getByRole("textbox", { name: "Search PO", exact: true })
        .fill("24072");
      await expect(panel.getByRole("row")).toHaveCount(2);
      await profile.click();
      await expect(panel.getByRole("table")).toHaveCount(0);
      await orders.click();
      await expect(
        panel.getByRole("textbox", { name: "Search PO", exact: true }),
      ).toHaveValue("");
      await expect(
        panel.getByRole("tab", { name: "All", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
      await expect(panel.getByRole("row")).toHaveCount(6);
      const independent = preview(page, "2 columns · ActionPanel");
      await expect(independent.getByRole("row")).toHaveCount(6);
      await independent
        .getByRole("tab", { name: "Closed", exact: true })
        .click();
      await expect(panel.getByRole("row")).toHaveCount(6);
    });

    test("embedded conversation handles internal drafts and reply cancellation but Post has no submission handler", async ({
      page,
    }) => {
      limitation(
        "Post does not append or send; whitespace enables it, switching reply targets carries the same draft, and changing page tabs discards all conversation draft state.",
      );
      const panel = await detail(page, true);
      const conversation = panel.getByRole("tab", {
        name: "Conversation 6",
        exact: true,
      });
      await conversation.click();
      await expect(panel.getByRole("article")).toHaveCount(6);
      const post = panel
        .getByRole("button", { name: "Post", exact: true })
        .first();
      await expect(post).toBeDisabled();
      const internal = panel.getByRole("checkbox", {
        name: "Internal note (not sent to customer)",
        exact: true,
      });
      await internal.check();
      const composer = panel.getByRole("textbox", {
        name: "Internal context for teammates…",
        exact: true,
      });
      await composer.fill("   ");
      await expect(post).toBeEnabled();
      await composer.fill("Check lead time before replying.");
      await post.click();
      await expect(composer).toHaveValue("Check lead time before replying.");
      await expect(panel.getByRole("article")).toHaveCount(6);
      await panel.getByRole("button", { name: "Discard", exact: true }).click();
      await expect(composer).toHaveValue("");
      await expect(post).toBeDisabled();
      const replies = panel.getByRole("button", { name: "Reply", exact: true });
      await replies.nth(0).click();
      const reply = panel.getByRole("textbox", {
        name: "Write a reply…",
        exact: true,
      });
      await reply.fill("Revised delivery date tomorrow.");
      await replies.nth(1).click();
      await expect(
        panel.getByText("Replying to Mika Inoue", { exact: true }),
      ).toBeVisible();
      await expect(reply).toHaveValue("Revised delivery date tomorrow.");
      await panel
        .getByRole("button", { name: "Post", exact: true })
        .last()
        .click();
      await expect(panel.getByRole("article")).toHaveCount(6);
      await expect(reply).toHaveValue("Revised delivery date tomorrow.");
      await panel.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(reply).toHaveCount(0);
      await replies.nth(0).click();
      await expect(reply).toHaveValue("");
      await reply.fill("Unsaved reply");
      await composer.fill("Unsaved note");
      await panel.getByRole("tab", { name: "Profile", exact: true }).click();
      await conversation.click();
      await expect(
        panel.getByRole("textbox", { name: "Reply to customer…", exact: true }),
      ).toHaveValue("");
      await expect(internal).not.toBeChecked();
      await expect(reply).toHaveCount(0);
      await expect(panel.getByRole("article")).toHaveCount(6);
    });

    test("review and edit buttons are inert demo actions, and the supplier website is plain text", async ({
      page,
    }) => {
      limitation(
        "Edit, New and review actions have no handlers; the website is text rather than a navigable link. This is not an approval, comment, ERP sync or edit success.",
      );
      const panel = await detail(page);
      const before = await panel.ariaSnapshot();
      const url = page.url();
      for (const name of [
        "Edit",
        "+ New",
        "Approve",
        "Reject",
        "Leave a comment",
        "Re-sync from ERP",
      ]) {
        await panel.getByRole("button", { name, exact: true }).click();
        await expect(page.getByRole("dialog")).toHaveCount(0);
        expect(await panel.ariaSnapshot()).toBe(before);
        await expect(page).toHaveURL(url);
      }
      await expect(
        panel.getByRole("link", { name: "https://tailor.tech", exact: true }),
      ).toHaveCount(0);
      await expect(panel.getByText("Pending", { exact: true })).toHaveCount(1);
    });

    test("category dialog cancels unsaved values, closes by Escape and Close, and distinguishes registered Code validation from ignored Name validation", async ({
      page,
    }) => {
      limitation(
        "The Name input and description label are not associated with accessible names. Code required validation works, but the raw Name input is not registered: Save ignores its required constraint and edits.",
      );
      const panel = await master(page);
      let dialog = await edit(page, panel);
      await expect(nameField(dialog)).toHaveAccessibleName("");
      await codeField(dialog).fill("TEMP");
      await nameField(dialog).fill("Discarded name");
      await descriptionField(dialog).fill("Discarded description");
      await dialog
        .getByRole("checkbox", { name: "Active", exact: true })
        .uncheck();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).not.toBeVisible();
      dialog = await edit(page, panel);
      await expect(codeField(dialog)).toHaveValue("ELC");
      await expect(nameField(dialog)).toHaveValue("Electronics");
      await expect(descriptionField(dialog)).toHaveValue(
        "Devices and components.",
      );
      await expect(
        dialog.getByRole("checkbox", { name: "Active", exact: true }),
      ).toBeChecked();
      await codeField(dialog).fill("");
      await dialog.getByRole("button", { name: "Save", exact: true }).click();
      await expect(dialog).toBeVisible();
      expect(
        await codeField(dialog).evaluate(
          (input: HTMLInputElement) => input.validity.valueMissing,
        ),
      ).toBe(true);
      await codeField(dialog).fill("ELC");
      await nameField(dialog).fill("");
      expect(
        await nameField(dialog).evaluate(
          (input: HTMLInputElement) => input.validity.valueMissing,
        ),
      ).toBe(true);
      await dialog.getByRole("button", { name: "Save", exact: true }).click();
      await expect(dialog).not.toBeVisible();
      dialog = await edit(page, panel);
      await codeField(dialog).fill("CANCEL");
      await close(page, dialog);
      dialog = await edit(page, panel);
      await expect(codeField(dialog)).toHaveValue("ELC");
      await dialog.getByRole("button", { name: "Close", exact: true }).click();
      await expect(dialog).not.toBeVisible();
      await expect(panel.getByRole("row")).toHaveCount(5);
    });

    test("category dialog exposes partial Save and blank-name creation, stays independent and resets on reload", async ({
      page,
    }) => {
      limitation(
        "Only Code is registered in the demo form. Name, description and Active edits revert on Save; a new row saves its code but loses its entered name. State is memory-only.",
      );
      const panel = await master(page);
      let dialog = await edit(page, panel);
      await codeField(dialog).fill("DEV");
      await nameField(dialog).fill("Devices");
      await descriptionField(dialog).fill("New description");
      await dialog
        .getByRole("checkbox", { name: "Active", exact: true })
        .uncheck();
      await dialog.getByRole("button", { name: "Save", exact: true }).click();
      await expect(dialog).not.toBeVisible();
      dialog = await edit(page, panel, "DEV");
      await expect(codeField(dialog)).toHaveValue("DEV");
      await expect(nameField(dialog)).toHaveValue("Electronics");
      await expect(descriptionField(dialog)).toHaveValue(
        "Devices and components.",
      );
      await expect(
        dialog.getByRole("checkbox", { name: "Active", exact: true }),
      ).toBeChecked();
      await close(page, dialog);
      await expect(
        preview(page, "Sheet (many fields)").getByRole("cell", {
          name: "ELC",
          exact: true,
        }),
      ).toHaveCount(1);
      await panel
        .getByRole("button", { name: "+ New category", exact: true })
        .click();
      dialog = page.getByRole("dialog", { name: "New category", exact: true });
      await codeField(dialog).fill("AUDIT");
      await nameField(dialog).fill("Audit category");
      await dialog.getByRole("button", { name: "Save", exact: true }).click();
      await expect(dialog).not.toBeVisible();
      await expect(panel.getByRole("row")).toHaveCount(6);
      dialog = await edit(page, panel, "AUDIT");
      await expect(nameField(dialog)).toHaveValue("");
      await close(page, dialog);
      await page.reload();
      await expect(panel.getByRole("row")).toHaveCount(5);
      await expect(
        panel.getByRole("cell", { name: "ELC", exact: true }),
      ).toHaveCount(1);
      await expect(
        panel.getByRole("cell", { name: "DEV", exact: true }),
      ).toHaveCount(0);
      await expect(
        panel.getByRole("cell", { name: "AUDIT", exact: true }),
      ).toHaveCount(0);
    });

    test("category sheet discards controlled select changes and reinitializes them for each edited row", async ({
      page,
    }) => {
      const panel = await master(page, true);
      let dialog = await edit(page, panel, "MAT");
      await expect(
        dialog.getByRole("combobox", { name: "Parent category", exact: true }),
      ).toHaveText("Electronics");
      await expect(
        dialog.getByRole("combobox", { name: "Tax profile", exact: true }),
      ).toHaveText("Reduced 8%");
      await select(page, dialog, "Parent category", "Office supplies");
      await select(page, dialog, "Tax profile", "Reverse charge");
      await codeField(dialog).fill("TEMP");
      await close(page, dialog);
      dialog = await edit(page, panel, "MAT");
      await expect(codeField(dialog)).toHaveValue("MAT");
      await expect(
        dialog.getByRole("combobox", { name: "Parent category", exact: true }),
      ).toHaveText("Electronics");
      await expect(
        dialog.getByRole("combobox", { name: "Tax profile", exact: true }),
      ).toHaveText("Reduced 8%");
      await dialog.getByRole("button", { name: "Close", exact: true }).click();
      await expect(dialog).not.toBeVisible();
      dialog = await edit(page, panel, "ELC");
      await expect(
        dialog.getByRole("combobox", { name: "Parent category", exact: true }),
      ).toHaveText("— None —");
      await expect(
        dialog.getByRole("combobox", { name: "Tax profile", exact: true }),
      ).toHaveText("Standard 10%");
      await close(page, dialog);
      await panel
        .getByRole("button", { name: "+ New category", exact: true })
        .click();
      dialog = page.getByRole("dialog", { name: "New category", exact: true });
      await expect(codeField(dialog)).toHaveValue("");
      await expect(nameField(dialog)).toHaveValue("");
      await expect(
        dialog.getByRole("combobox", { name: "Parent category", exact: true }),
      ).toHaveText("— None —");
      await expect(
        dialog.getByRole("combobox", { name: "Tax profile", exact: true }),
      ).toHaveText("Standard 10%");
      await close(page, dialog);
      await expect(panel.getByRole("row")).toHaveCount(5);
    });

    test("category sheet records partial desktop persistence or the unreachable mobile Save button", async ({
      page,
    }) => {
      limitation(
        mode.mobile
          ? "The mobile sheet lacks a scroll container: Save is below the viewport. Do not force-click it or count this as successful mobile saving."
          : "Only Code and controlled Parent/Tax values persist. Name, description, sort order, Active and internal notes revert on Save; the raw Sort order minimum constraint is also ignored by Save.",
      );
      const panel = await master(page, true);
      let dialog = await edit(page, panel);
      await codeField(dialog).fill("DEV");
      await nameField(dialog).fill("Devices");
      await descriptionField(dialog).fill("Audited description");
      await select(page, dialog, "Parent category", "Raw materials");
      await select(page, dialog, "Tax profile", "Exempt");
      await dialog
        .getByRole("checkbox", { name: "Active", exact: true })
        .uncheck();
      const sort = dialog.locator('input[name="sortOrder"]');
      const notes = dialog.locator('textarea[name="notes"]');
      await notes.fill("New internal note");
      const save = dialog.getByRole("button", { name: "Save", exact: true });
      if (mode.mobile) {
        await sort.fill("42");
        await save.scrollIntoViewIfNeeded();
        const bounds = await save.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.y).toBeGreaterThanOrEqual(mode.viewport.height);
        await expect(save).not.toBeInViewport();
        await close(page, dialog);
        dialog = await edit(page, panel);
        await expect(codeField(dialog)).toHaveValue("ELC");
        await close(page, dialog);
        return;
      }
      await sort.fill("-1");
      expect(
        await sort.evaluate(
          (input: HTMLInputElement) => input.validity.rangeUnderflow,
        ),
      ).toBe(true);
      await save.click();
      await expect(dialog).not.toBeVisible();
      dialog = await edit(page, panel, "DEV");
      await expect(codeField(dialog)).toHaveValue("DEV");
      await expect(nameField(dialog)).toHaveValue("Electronics");
      await expect(descriptionField(dialog)).toHaveValue(
        "Devices and components for resale.",
      );
      await expect(
        dialog.getByRole("combobox", { name: "Parent category", exact: true }),
      ).toHaveText("Raw materials");
      await expect(
        dialog.getByRole("combobox", { name: "Tax profile", exact: true }),
      ).toHaveText("Exempt");
      await expect(dialog.locator('input[name="sortOrder"]')).toHaveValue("10");
      await expect(dialog.locator('textarea[name="notes"]')).toHaveValue(
        "Synced nightly from ERP.",
      );
      await expect(
        dialog.getByRole("checkbox", { name: "Active", exact: true }),
      ).toBeChecked();
      await close(page, dialog);
    });
  });
}
