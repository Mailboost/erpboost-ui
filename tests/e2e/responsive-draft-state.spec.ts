import { expect, test, type Page } from "@playwright/test";

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

// ResizeObserver updates and the 200ms sidebar transition must finish before
// checking a persistent state, rather than accepting the previous width once.
async function settleResize(page: Page) {
  await page.evaluate(async () => {
    const start = performance.now();
    let previous = "",
      changed = start;
    while (performance.now() - start < 4000) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      const signature = Array.from(
        document.querySelectorAll("aside, [role=dialog]"),
      )
        .map((el) => {
          const r = el.getBoundingClientRect();
          return [r.x, r.y, r.width, r.height].join(",");
        })
        .join(";");
      if (signature !== previous) {
        previous = signature;
        changed = performance.now();
      }
      if (performance.now() - changed >= 200) return;
    }
    throw new Error("Resize did not settle within 4 seconds");
  });
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(colorScheme, () => {
    test.use({ viewport: { width: 1280, height: 900 }, colorScheme });

    test("preview sidebar collapses below 480px of content width and resizing preserves the form draft", async ({
      page,
    }) => {
      await page.goto("page/form-as-page?preview=fullscreen");
      // Lazy previews may finish out of order; wait for the first form to be final.
      await expect(page.locator("form")).toHaveCount(3);
      const form = page.locator("form").first();
      const title = form.getByPlaceholder("Review supplier docs", {
        exact: true,
      });
      const description = form.getByPlaceholder(
        "What outcome are you looking for?",
        { exact: true },
      );
      const owner = form.getByRole("combobox", { name: "Owner", exact: true });
      await title.fill("Resize audit — 入力を保持");
      await description.fill(
        "Keep this draft while the preview sidebar changes.",
      );
      await owner.click();
      await page.getByRole("option", { name: "Sato", exact: true }).click();
      await expect(page.getByRole("listbox")).not.toBeVisible();
      const aside = page.locator("aside").first();
      const frame = aside.locator("..");
      const sidebarWidth = () =>
        aside.evaluate((el) => el.getBoundingClientRect().width);
      for (const [width, outerWidth, expectedSidebar] of [
        [690, 642, 256],
        [514, 482, 256],
        [513, 481, 0],
        [375, 343, 0],
        [1280, 1232, 0],
      ]) {
        await page.setViewportSize({ width, height: 900 });
        await settleResize(page);
        await expect
          .poll(() => frame.evaluate((el) => el.getBoundingClientRect().width))
          .toBe(outerWidth);
        await expect.poll(sidebarWidth).toBe(expectedSidebar);
        if (width < 768) {
          await expect(
            page.getByRole("button", {
              name: "Collapse preview sidebar",
              exact: true,
            }),
          ).not.toBeVisible();
        }
        await expect(title).toHaveValue("Resize audit — 入力を保持");
        await expect(description).toHaveValue(
          "Keep this draft while the preview sidebar changes.",
        );
        await expect(owner).toHaveText("Sato");
      }
      // Automatic collapse does not automatically reopen a user-visible panel.
      await page
        .getByRole("button", { name: "Expand preview sidebar", exact: true })
        .click();
      await expect.poll(sidebarWidth).toBe(256);
      await expect(
        page.getByRole("button", {
          name: "Collapse preview sidebar",
          exact: true,
        }),
      ).toBeVisible();
      await page.setViewportSize({ width: 514, height: 900 });
      await settleResize(page);
      await expect.poll(sidebarWidth).toBe(256);
      await page.setViewportSize({ width: 513, height: 900 });
      await settleResize(page);
      await expect.poll(sidebarWidth).toBe(0);
      // A manual reopen at a narrow width stays open until the frame resizes.
      await page
        .getByRole("button", { name: "Expand preview sidebar", exact: true })
        .click();
      await expect.poll(sidebarWidth).toBe(256);
      await page.setViewportSize({ width: 512, height: 900 });
      await settleResize(page);
      await expect.poll(sidebarWidth).toBe(0);
      await expect(title).toHaveValue("Resize audit — 入力を保持");
      await expect(owner).toHaveText("Sato");
    });

    test("an open edit sheet resizes across sm and md without dropping unsaved values or selections", async ({
      page,
    }) => {
      await page.goto("page/simple-master-crud");
      const panel = page.getByRole("tabpanel", {
        name: "Sheet (many fields) preview",
        exact: true,
      });
      const row = panel
        .getByRole("row")
        .filter({ has: page.getByRole("cell", { name: "ELC", exact: true }) });
      await row.hover();
      await row.getByRole("button", { name: "Edit", exact: true }).click();
      const sheet = page.getByRole("dialog", {
        name: "Edit category",
        exact: true,
      });
      const name = sheet.locator('input[name="name"]');
      const notes = sheet.locator('textarea[name="notes"]');
      await name.fill("Resize audit category");
      await notes.fill("Unsaved notes — 保持");
      await sheet
        .getByRole("combobox", { name: "Tax profile", exact: true })
        .click();
      await page.getByRole("option", { name: "Exempt", exact: true }).click();
      await expect(page.getByRole("listbox")).not.toBeVisible();
      for (const width of [767, 768, 639, 640, 1023, 1024, 375, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await settleResize(page);
        const expectedWidth = Math.round(width < 640 ? width * 0.75 : 384);
        await expect
          .poll(async () => Math.round((await sheet.boundingBox())!.width))
          .toBe(expectedWidth);
        await expect
          .poll(async () => Math.round((await sheet.boundingBox())!.x))
          .toBe(width - expectedWidth);
        await expect(name).toHaveValue("Resize audit category");
        await expect(notes).toHaveValue("Unsaved notes — 保持");
        await expect(
          sheet.getByRole("combobox", { name: "Tax profile", exact: true }),
        ).toHaveText("Exempt");
        await expect(page.getByRole("dialog")).toHaveCount(1);
      }
      // Cancel only: this is an in-memory draft check, not server persistence.
      await sheet.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(sheet).not.toBeVisible();
      await expect(page.locator("body")).toHaveCSS("pointer-events", "auto");
      await row.hover();
      await row.getByRole("button", { name: "Edit", exact: true }).click();
      await expect(name).toHaveValue("Electronics");
      await expect(notes).toHaveValue("Synced nightly from ERP.");
      await expect(
        sheet.getByRole("combobox", { name: "Tax profile", exact: true }),
      ).toHaveText("Standard 10%");
      await page.keyboard.press("Escape");
      await expect(sheet).not.toBeVisible();
    });
  });
}
