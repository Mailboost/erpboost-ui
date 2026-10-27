import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
  "base64",
);
const image = { name: "audit-図.png", mimeType: "image/png", buffer: png };
const textFile = {
  name: "audit-手順.txt",
  mimeType: "text/plain",
  buffer: Buffer.from("ERP attachment audit\n確認用の添付\n"),
};
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

// Identify a preview by its own control, never by its position while sibling
// previews are still loading.
const thread = (page: Page, control: Locator) =>
  page
    .locator("div.relative.flex.w-full.min-w-0.flex-col")
    .filter({ has: control });

async function choose(page: Page, trigger: Locator, files: (typeof image)[]) {
  const chooser = page.waitForEvent("filechooser");
  await trigger.click();
  await (await chooser).setFiles(files);
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

    test(
      mode.viewport.width < 600
        ? "narrow mail supports search and keyboard selection but clips message actions like the reference"
        : "mail keyboard selection, filtered unread counts and per-message stars survive search",
      async ({ page }) => {
        await open(page, "page/email");
        const search = page.getByPlaceholder("Search mail");
        const inbox = page.getByRole("complementary").filter({ has: search });
        const rows = inbox.getByRole("listitem");
        const article = page.getByRole("article");
        const billing = rows
          .filter({ hasText: "Invoice INV-2026-0418 is ready" })
          .getByRole("button");
        const aiko = rows.filter({ hasText: "PO #4421" }).getByRole("button");
        const count = inbox.getByText(/^\d+$/);
        await expect(rows).toHaveCount(5);
        await expect(count).toHaveText("2");
        await billing.focus();
        await page.keyboard.press("Enter");
        await expect(article.getByRole("heading")).toHaveText(
          "Invoice INV-2026-0418 is ready",
        );
        await expect(count).toHaveText("1");
        if (mode.viewport.width < 600) {
          await search.fill("  BILLING  ");
          await expect(rows).toHaveCount(1);
          await expect(count).toHaveText("0");
          await search.fill("no-match-監査");
          await expect(rows).toHaveText(['No messages match "no-match-監査".']);
          await expect(article.getByRole("heading")).toHaveText(
            "Invoice INV-2026-0418 is ready",
          );
          await search.fill("");
          await aiko.focus();
          await page.keyboard.press("Space");
          await expect(count).toHaveText("0");
          const action = page.getByRole("button", {
            name: "Unstar",
            exact: true,
          });
          expect((await action.boundingBox())!.x).toBeGreaterThan(
            mode.viewport.width,
          );
          test.info().annotations.push({
            type: "reference-limitation",
            description:
              "The fixed 320px inbox clips the message toolbar on a 375px viewport; toolbar actions are not counted as mobile successes.",
          });
          return;
        }
        await page.getByRole("button", { name: "Star", exact: true }).click();
        await expect(
          page.getByRole("button", { name: "Unstar", exact: true }),
        ).toHaveAttribute("aria-pressed", "true");
        await page
          .getByRole("button", { name: "Mark as unread", exact: true })
          .click();
        await expect(count).toHaveText("2");
        await search.fill("  BILLING  ");
        await expect(rows).toHaveCount(1);
        await expect(count).toHaveText("1");
        await search.fill("no-match-監査");
        await expect(rows).toHaveText(['No messages match "no-match-監査".']);
        await expect(count).toHaveText("0");
        await expect(article.getByRole("heading")).toHaveText(
          "Invoice INV-2026-0418 is ready",
        );
        await search.fill("");
        await aiko.focus();
        await page.keyboard.press("Space");
        await expect(article.getByRole("heading")).toHaveText(
          "PO #4421 — confirmation needed before EOD",
        );
        await expect(count).toHaveText("1");
        await page.getByRole("button", { name: "Unstar", exact: true }).click();
        await expect(
          page.getByRole("button", { name: "Star", exact: true }),
        ).toHaveAttribute("aria-pressed", "false");
        await billing.click();
        await expect(
          page.getByRole("button", { name: "Unstar", exact: true }),
        ).toHaveAttribute("aria-pressed", "true");
        await expect(count).toHaveText("0");
        // The demo toolbar does not implement archive/delete/reply or persistence.
        for (const name of [
          "Reply",
          "Reply all",
          "Forward",
          "Archive",
          "Delete",
          "More actions",
        ])
          await page.getByRole("button", { name, exact: true }).click();
        await expect(rows).toHaveCount(5);
        await expect(article.getByRole("heading")).toHaveText(
          "Invoice INV-2026-0418 is ready",
        );
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await page.reload();
        await expect(count).toHaveText("2");
        await expect(article.getByRole("heading")).toHaveText(
          "PO #4421 — confirmation needed before EOD",
        );
      },
    );

    test(
      mode.viewport.width < 600
        ? "narrow chat switches conversations but has a zero-width composer input like the reference"
        : "chat preserves a shared draft on conversation changes and only clears it on demo submit",
      async ({ page }) => {
        await open(page, "page/chat");
        const input = page.getByPlaceholder("What do you want to know?");
        const send = page.getByRole("button", { name: "Send", exact: true });
        await expect(send).toBeDisabled();
        if (mode.viewport.width < 600) {
          await page
            .getByRole("link", {
              name: "Launch plan for Q3 rollout",
              exact: true,
            })
            .click();
          await expect(
            page.getByRole("heading", {
              name: "Launch plan for Q3 rollout",
              exact: true,
            }),
          ).toHaveText("Launch plan for Q3 rollout");
          await expect(
            page.getByText("No messages in this conversation yet.", {
              exact: true,
            }),
          ).toHaveCount(1);
          await page
            .getByRole("link", {
              name: "Quick recipes for dinner",
              exact: true,
            })
            .click();
          await expect(
            page.getByText(
              "Sure! Are you cooking for yourself or more people?",
              { exact: true },
            ),
          ).toHaveCount(1);
          expect((await input.boundingBox())!.width).toBe(0);
          test.info().annotations.push({
            type: "reference-limitation",
            description:
              "The fixed 256px chat sidebar leaves the textarea at zero width on a 375px viewport; mobile draft entry is not counted as successful.",
          });
          return;
        }
        await input.fill("   \n");
        await expect(send).toBeDisabled();
        await input.fill("製造部への確認");
        await input.press("Shift+Enter");
        await input.pressSequentially("second line");
        const draft = await input.inputValue();
        expect(draft).toBe("製造部への確認\nsecond line");
        await page
          .getByRole("link", {
            name: "Launch plan for Q3 rollout",
            exact: true,
          })
          .click();
        await expect(
          page.getByRole("heading", {
            name: "Launch plan for Q3 rollout",
            exact: true,
          }),
        ).toBeVisible();
        await expect(
          page.getByText("No messages in this conversation yet.", {
            exact: true,
          }),
        ).toBeVisible();
        await expect(input).toHaveValue(draft);
        await page
          .getByRole("link", {
            name: "Rewrite homepage value prop",
            exact: true,
          })
          .click();
        await expect(input).toHaveValue(draft);
        await send.click();
        await expect(input).toHaveValue("");
        await expect(send).toBeDisabled();
        await expect(
          page.getByText("No messages in this conversation yet.", {
            exact: true,
          }),
        ).toBeVisible();
        await page
          .getByRole("link", { name: "Quick recipes for dinner", exact: true })
          .click();
        await expect(
          page.getByText("Sure! Are you cooking for yourself or more people?", {
            exact: true,
          }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Good response", exact: true }),
        ).toHaveCount(2);
      },
    );

    test("attachment chooser handles multiple files, broken previews, menu cancellation and reselecting a deleted file", async ({
      page,
    }) => {
      await open(page, "components/attachment");
      const upload = page.getByRole("button", {
        name: "Drop files or click to upload",
        exact: true,
      });
      await choose(page, upload, [image, textFile]);
      const itemOrder = () =>
        page
          .getByRole("button", { name: /^Attachment options for / })
          .evaluateAll((buttons) =>
            buttons.map((button) => button.getAttribute("aria-label")),
          );
      await expect
        .poll(itemOrder)
        .toEqual([
          "Attachment options for supplier-tax-cert.pdf",
          "Attachment options for logo.png",
          `Attachment options for ${image.name}`,
          `Attachment options for ${textFile.name}`,
        ]);
      const img = page.getByRole("img", { name: image.name, exact: true });
      await expect(img).toBeVisible();
      await expect
        .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBe(5);
      const options = page.getByRole("button", {
        name: `Attachment options for ${textFile.name}`,
        exact: true,
      });
      await expect(options).toHaveCount(1);
      await options.click();
      await expect(
        page.getByRole("menuitem", { name: "Download", exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("menuitem", { name: "Delete", exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("menu")).toHaveCount(0);
      await expect(options).toBeFocused();
      await options.click();
      await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
      await expect(options).toHaveCount(0);
      await choose(page, upload, [textFile]);
      await expect
        .poll(itemOrder)
        .toEqual([
          "Attachment options for supplier-tax-cert.pdf",
          "Attachment options for logo.png",
          `Attachment options for ${image.name}`,
          `Attachment options for ${textFile.name}`,
        ]);
      await expect(options).toHaveCount(1);
      await choose(page, upload, [
        {
          name: "broken.png",
          mimeType: "image/png",
          buffer: Buffer.from("invalid image"),
        },
      ]);
      const broken = page.getByRole("button", {
        name: "Attachment options for broken.png",
        exact: true,
      });
      await expect(broken).toHaveCount(1);
      await expect(
        page.getByRole("img", { name: "broken.png", exact: true }),
      ).toHaveCount(0);
      await expect(page.getByText("broken", { exact: true })).toBeVisible();
      await broken.click();
      await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
      await expect(broken).toHaveCount(0);
      await expect(img).toBeVisible();
    });

    test("thread image preview downloads the actual image and closes without losing its attachment", async ({
      page,
    }) => {
      await open(page, "patterns/conversation-thread");
      const sample = thread(
        page,
        page.getByRole("button", { name: "Attach files", exact: true }),
      );
      const preview = sample.getByRole("button", {
        name: "Preview",
        exact: true,
      });
      await preview.click();
      const dialog = page.getByRole("dialog", {
        name: "error-screenshot.png",
        exact: true,
      });
      await expect(dialog).toBeVisible();
      const img = dialog.getByRole("img", {
        name: "error-screenshot.png",
        exact: true,
      });
      await expect
        .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBe(5);
      const downloadEvent = page.waitForEvent("download");
      await dialog.getByRole("link", { name: "Download", exact: true }).click();
      const download = await downloadEvent;
      expect(download.suggestedFilename()).toBe("error-screenshot.png");
      const bytes = await readFile((await download.path())!);
      expect(bytes).toEqual(png);
      await test
        .info()
        .attach("downloaded-image", { body: bytes, contentType: "image/png" });
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await preview.click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Close", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(sample.getByRole("article")).toHaveCount(3);
      await expect(
        sample.getByRole("img", { name: "error-screenshot.png", exact: true }),
      ).toBeVisible();
    });

    test("thread pending files remain after discard and demo flush while text and internal state behave independently", async ({
      page,
    }) => {
      await open(page, "patterns/conversation-thread");
      const attach = page.getByRole("button", {
        name: "Attach files",
        exact: true,
      });
      const sample = thread(page, attach);
      const input = sample.getByRole("textbox");
      const send = sample.getByRole("button", { name: "Send", exact: true });
      const remove = sample.getByRole("button", {
        name: "Remove attachment",
        exact: true,
      });
      const flushed: string[] = [];
      page.on("console", (message) => {
        if (message.text().startsWith("flushing")) flushed.push(message.text());
      });
      await expect(send).toBeDisabled();
      await choose(page, attach, [image, textFile]);
      await expect(remove).toHaveCount(2);
      await expect(send).toBeEnabled();
      await input.fill("監査用の内部メモ");
      await sample.getByRole("checkbox").check();
      await expect(input).toHaveAttribute(
        "placeholder",
        "Internal context for teammates…",
      );
      await expect(input).toHaveValue("監査用の内部メモ");
      await sample
        .getByRole("button", { name: "Discard", exact: true })
        .click();
      await expect(input).toHaveValue("");
      await expect(sample.getByRole("checkbox")).toBeChecked();
      await expect(remove).toHaveCount(2);
      await remove.last().click();
      await expect(remove).toHaveCount(1);
      await send.click();
      await expect
        .poll(() => flushed)
        .toEqual(["flushing 1 attachment operations"]);
      await expect(remove).toHaveCount(1);
      await expect(sample.getByRole("article")).toHaveCount(3);
      await send.click();
      await expect
        .poll(() => flushed)
        .toEqual([
          "flushing 1 attachment operations",
          "flushing 0 attachment operations",
        ]);
      await remove.click();
      await expect(remove).toHaveCount(0);
      await expect(send).toBeDisabled();
    });

    test("thread edits cancel or save independently and quoted replies and reactions can be cleared", async ({
      page,
    }) => {
      await open(page, "patterns/conversation-thread");
      const sample = thread(
        page,
        page.getByRole("button", { name: "Edit", exact: true }).first(),
      );
      const articles = sample.getByRole("article");
      const first = articles.first();
      const original = await first.locator("p").innerText();
      await first.getByRole("button", { name: "Edit", exact: true }).click();
      await first.getByRole("textbox").fill(" ");
      await expect(
        first.getByRole("button", { name: "Save", exact: true }),
      ).toBeDisabled();
      await first.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(first.locator("p")).toHaveText(original);
      await first.getByRole("button", { name: "Edit", exact: true }).click();
      await first.getByRole("textbox").fill("更新済み — ready for shipping");
      await first.getByRole("button", { name: "Save", exact: true }).click();
      await expect(first.locator("p")).toHaveText(
        "更新済み — ready for shipping",
      );
      await first.getByRole("button", { name: "Like", exact: true }).click();
      await expect(
        first.getByRole("button", { name: "Liked", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(
        articles.nth(1).getByRole("button", { name: "Like", exact: true }),
      ).toHaveAttribute("aria-pressed", "false");
      await first.getByRole("button", { name: "Reply", exact: true }).click();
      await expect(sample.getByRole("textbox")).toHaveValue(
        "> 更新済み — ready for shipping\n\n",
      );
      await sample.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(sample.getByRole("textbox")).toHaveValue("");
      await expect(
        sample.getByRole("button", { name: "Send", exact: true }),
      ).toBeDisabled();
      await first.getByRole("button", { name: "Liked", exact: true }).click();
      await expect(
        first.getByRole("button", { name: "Like", exact: true }),
      ).toHaveAttribute("aria-pressed", "false");
    });

    test("markdown preview keeps the draft and internal flag, while demo Send has no submission handler", async ({
      page,
    }) => {
      await open(page, "patterns/conversation-thread");
      const write = page.getByRole("button", { name: "Write", exact: true });
      const sample = thread(page, write);
      const input = sample.getByRole("textbox");
      const source =
        "## 確認事項\n\n**在庫あり** と _納期_\n\n1. `ERP_READY`\n2. [案内](https://example.com/audit)";
      await input.fill(source);
      await sample.getByRole("checkbox").check();
      await sample
        .getByRole("button", { name: "Preview", exact: true })
        .click();
      await expect(input).toHaveCount(0);
      await expect(
        sample.locator("strong").filter({ hasText: "在庫あり" }),
      ).toHaveText("在庫あり");
      await expect(
        sample.getByRole("link", { name: "案内", exact: true }),
      ).toHaveAttribute("href", "https://example.com/audit");
      await sample.getByRole("button", { name: "Send", exact: true }).click();
      await expect(sample.getByRole("article")).toHaveCount(3);
      await write.click();
      await expect(input).toHaveValue(source);
      await expect(sample.getByRole("checkbox")).toBeChecked();
      await sample
        .getByRole("button", { name: "Discard", exact: true })
        .click();
      await expect(input).toHaveValue("");
      await expect(sample.getByRole("checkbox")).toBeChecked();
      await sample
        .getByRole("button", { name: "Preview", exact: true })
        .click();
      await expect(
        sample.getByText("Nothing to preview yet.", { exact: true }),
      ).toBeVisible();
      await expect(
        sample.getByRole("button", { name: "Send", exact: true }),
      ).toBeDisabled();
    });
  });
}
