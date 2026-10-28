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

async function openEditor(page: Page) {
  await page.goto("patterns/rich-text-editor?preview=fullscreen");
  const editor = page.getByRole("textbox");
  await expect(editor).toBeVisible();
  return editor;
}

async function replaceText(page: Page, editor: Locator, text: string) {
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await editor.click();
  await page.keyboard.insertText(text);
  await expect(editor).toHaveText(text);
}

async function toolbar(page: Page, editor: Locator, name: string) {
  await page.getByRole("button", { name, exact: true }).click();
  // Tiptap restores the stored selection in an animation frame. Do not send
  // the next keyboard action to the toolbar button while focus is in transit.
  await expect(editor).toBeFocused();
}

async function settleSelection(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

async function linkPrompt(page: Page, answer: string | null) {
  const dialog = page.waitForEvent("dialog").then(async (dialog) => {
    expect(dialog.type()).toBe("prompt");
    expect(dialog.message()).toBe("URL");
    expect(dialog.defaultValue()).toBe("https://");
    if (answer === null) await dialog.dismiss();
    else await dialog.accept(answer);
  });
  await page.getByRole("button", { name: "Link", exact: true }).click();
  await dialog;
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

    test("rich text headings, combined marks, undo and redo preserve the selected text", async ({
      page,
    }) => {
      const editor = await openEditor(page);
      await replaceText(page, editor, "Audit text");
      await page.keyboard.press("ControlOrMeta+a");
      for (const level of [1, 2, 3]) {
        await toolbar(page, editor, `Heading ${level}`);
        await expect(editor.locator(`h${level}`)).toHaveText("Audit text");
      }
      await toolbar(page, editor, "Heading 3");
      await expect(editor.locator("p")).toHaveText("Audit text");
      for (const [name, tag] of [
        ["Bold", "strong"],
        ["Italic", "em"],
        ["Underline", "u"],
        ["Strikethrough", "s"],
      ]) {
        await toolbar(page, editor, name);
        await expect(editor.locator(tag)).toHaveText("Audit text");
      }
      await expect(editor.locator("strong em s u")).toHaveText("Audit text");
      await page.keyboard.press("ControlOrMeta+z");
      await expect(editor.locator("s")).toHaveCount(0);
      await expect(editor.locator("strong em u")).toHaveText("Audit text");
      await page.keyboard.press("ControlOrMeta+Shift+z");
      await expect(editor.locator("strong em s u")).toHaveText("Audit text");
    });

    test("rich text lists nest, outdent and change type, while whole-document removal retains the reference limitation", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "reference-limitation",
        description:
          "A sole list selected with Ctrl/Cmd+A does not toggle off in the reference. Changing list type and lifting individual items still work; this is not successful whole-document list removal.",
      });
      const editor = await openEditor(page);
      await replaceText(page, editor, "First");
      await toolbar(page, editor, "Bullet list");
      await page.keyboard.press("End");
      await page.keyboard.press("Enter");
      await page.keyboard.insertText("Second");
      await expect(editor.locator("ul > li")).toHaveCount(2);
      await page.keyboard.press("Tab");
      await expect(editor.locator("ul ul li")).toHaveText("Second");
      await page.keyboard.press("Shift+Tab");
      await expect(editor.locator("ul ul")).toHaveCount(0);
      await expect(editor.locator("ul > li")).toHaveText(["First", "Second"]);
      await toolbar(page, editor, "Numbered list");
      await expect(editor.locator("ol > li")).toHaveText(["First", "Second"]);
      await page.keyboard.press("ControlOrMeta+a");
      await settleSelection(page);
      await toolbar(page, editor, "Numbered list");
      await expect(editor.locator("ol > li")).toHaveText(["First", "Second"]);
      await toolbar(page, editor, "Bullet list");
      await expect(editor.locator("ul > li")).toHaveText(["First", "Second"]);
      await page.keyboard.press("ControlOrMeta+a");
      await settleSelection(page);
      await toolbar(page, editor, "Bullet list");
      await expect(editor.locator("ul > li")).toHaveText(["First", "Second"]);
      await toolbar(page, editor, "Numbered list");
      await expect(editor.locator("ol > li")).toHaveText(["First", "Second"]);
      await editor
        .locator("li p")
        .last()
        .click({ position: { x: 2, y: 4 } });
      await settleSelection(page);
      await toolbar(page, editor, "Numbered list");
      await expect(editor.locator("ol > li")).toHaveText(["First"]);
      await expect(editor.locator(":scope > p")).toHaveText("Second");
      await editor
        .locator("li p")
        .first()
        .click({ position: { x: 2, y: 4 } });
      await settleSelection(page);
      await toolbar(page, editor, "Numbered list");
      await expect(editor.locator("ol, ul")).toHaveCount(0);
      await expect(editor.locator("p")).toHaveText(["First", "Second"]);
    });

    test("rich text link prompts preserve accepted schemes and relative paths, reject a bare host path and unsafe schemes, and cancel without changes", async ({
      page,
    }) => {
      const editor = await openEditor(page);
      for (const href of [
        "https://example.com/a?x=1&y=2",
        "mailto:demo@example.com",
        "tel:+81312345678",
        "sms:+81312345678",
        "ftp://example.com",
        "/relative/path",
      ]) {
        await replaceText(page, editor, "Audit link");
        await page.keyboard.press("ControlOrMeta+a");
        await linkPrompt(page, href);
        const link = editor.getByRole("link", {
          name: "Audit link",
          exact: true,
        });
        await expect(link).toHaveAttribute("href", href);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute(
          "rel",
          "noopener noreferrer nofollow",
        );
        await toolbar(page, editor, "Link");
        await expect(editor.locator("a")).toHaveCount(0);
      }
      for (const answer of [
        null,
        "",
        "example.com/path",
        "javascript:alert(1)",
        "data:text/html,blocked",
      ]) {
        await replaceText(page, editor, "Audit link");
        await page.keyboard.press("ControlOrMeta+a");
        await linkPrompt(page, answer);
        await expect(editor.locator("a")).toHaveCount(0);
        await expect(editor).toHaveText("Audit link");
      }
    });

    test("rich text typing automatically links completed URLs without changing their visible text", async ({
      page,
    }) => {
      const editor = await openEditor(page);
      for (const [text, href] of [
        ["https://example.com/path", "https://example.com/path"],
        ["example.org", "http://example.org"],
        ["ftp://example.com/", "ftp://example.com/"],
      ]) {
        await replaceText(page, editor, "");
        await editor.pressSequentially(`${text} `);
        await expect(editor.locator("a")).toHaveText(text);
        await expect(editor.locator("a")).toHaveAttribute("href", href);
      }
    });

    test("rich text inserted tables navigate cells in both directions and Tab at the end adds a row", async ({
      page,
    }) => {
      const editor = await openEditor(page);
      await replaceText(page, editor, "");
      await toolbar(page, editor, "Insert table");
      const table = editor.getByRole("table");
      await expect(table.getByRole("row")).toHaveCount(3);
      await expect(table.getByRole("columnheader")).toHaveCount(3);
      await page.keyboard.insertText("Header");
      await page.keyboard.press("Tab");
      await page.keyboard.insertText("Role");
      await expect(table.getByRole("columnheader").nth(0)).toHaveText("Header");
      await expect(table.getByRole("columnheader").nth(1)).toHaveText("Role");
      await table
        .locator("td p")
        .last()
        .click({ position: { x: 2, y: 4 } });
      // Native selectionchange is queued after the mouse click. Let the browser
      // deliver it before asking Tiptap to navigate from the selected cell.
      await settleSelection(page);
      await page.keyboard.press("Tab");
      await expect(table.getByRole("row")).toHaveCount(4);
      await page.keyboard.insertText("New row");
      await expect(
        table.getByRole("row").nth(3).getByRole("cell").nth(0),
      ).toHaveText("New row");
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.insertText("Previous row");
      await expect(
        table.getByRole("row").nth(2).getByRole("cell").nth(2),
      ).toHaveText("Previous row");
      await page.keyboard.press("Tab");
      await page.keyboard.press("End");
      await page.keyboard.insertText(" updated");
      await expect(
        table.getByRole("row").nth(3).getByRole("cell").nth(0),
      ).toHaveText("New row updated");
    });

    test("rich text Clear is undoable and redoable, while the demo Save does not persist on reload", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "reference-limitation",
        description:
          "Save is a demo button without a handler, and the character count is a dash. This verifies in-memory editing and reload reset, not backend persistence.",
      });
      const editor = await openEditor(page);
      const initial = await editor.innerHTML();
      await page.getByRole("button", { name: "Clear", exact: true }).click();
      await expect(editor).toHaveText("");
      await expect(editor.locator("p")).toHaveAttribute(
        "data-placeholder",
        "Type here...",
      );
      await editor.click();
      await page.keyboard.press("ControlOrMeta+z");
      await expect.poll(() => editor.innerHTML()).toBe(initial);
      await page.keyboard.press("ControlOrMeta+Shift+z");
      await expect(editor).toHaveText("");
      await page.keyboard.insertText("Draft retained until reload");
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await expect(editor).toHaveText("Draft retained until reload");
      await expect(
        page.getByText("— characters", { exact: true }),
      ).toBeVisible();
      await page.reload();
      await expect(editor.getByRole("heading", { level: 1 })).toHaveText(
        "Rich text editor",
      );
      await expect(editor).not.toContainText("Draft retained until reload");
    });

    test("attachment chooser exposes image/PDF types but the demo still accepts oversized and alternate-type files", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "reference-limitation",
        description:
          "The accept attribute filters native chooser suggestions, but selecting files programmatically bypasses that filter. The reference accepts 20,000,000-byte and 20MiB+1-byte PDFs and a text file; its 20MB hint is not enforced.",
      });
      await page.goto("components/attachment?preview=fullscreen");
      const input = page.locator('input[type="file"]');
      await expect(input).toHaveAttribute("accept", "image/*,application/pdf");
      await expect(input).toHaveAttribute("multiple", "");
      const files = [
        {
          name: "exact-20MB.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.alloc(20_000_000),
        },
        {
          name: "over-20MiB.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.alloc(20 * 1024 * 1024 + 1),
        },
        {
          name: "備考.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("Notes\n備考\n"),
        },
      ];
      const chooser = page.waitForEvent("filechooser");
      await page
        .getByRole("button", {
          name: "Drop files or click to upload",
          exact: true,
        })
        .click();
      // setFiles is an explicit file-chooser input; it does not prove that a
      // platform file dialog visually permits choosing these filtered-out types.
      await (await chooser).setFiles(files);
      await expect(
        page.getByRole("button", { name: /^Attachment options for / }),
      ).toHaveCount(5);
      for (const file of files) {
        const options = page.getByRole("button", {
          name: `Attachment options for ${file.name}`,
          exact: true,
        });
        await expect(options).toBeVisible();
        await options.click();
        await page
          .getByRole("menuitem", { name: "Delete", exact: true })
          .click();
        await expect(options).toHaveCount(0);
      }
      await expect(input).toHaveValue("");
      await expect(
        page.getByRole("button", { name: /^Attachment options for / }),
      ).toHaveCount(2);
    });
  });
}
