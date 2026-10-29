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

const drawer = (page: Page) =>
  page.getByRole("dialog", { name: "Sidebar", exact: true });
async function showNavigation(page: Page, mobile: boolean) {
  if (mobile && !(await drawer(page).isVisible())) {
    await page
      .getByRole("button", { name: "Toggle Sidebar", exact: true })
      .last()
      .click();
    await expect(drawer(page)).toBeVisible();
  }
}
async function closeNavigation(page: Page) {
  if (await drawer(page).isVisible()) {
    await page.keyboard.press("Escape");
    await expect(drawer(page)).not.toBeVisible();
  }
}
async function openSearch(page: Page, mobile: boolean, japanese = false) {
  await showNavigation(page, mobile);
  await page
    .getByRole("button", { name: japanese ? "検索" : "Search", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: japanese ? "ページを検索..." : "Search pages...",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox")).toBeFocused();
  return dialog;
}
async function openButtons(page: Page) {
  await page.goto("components/button");
  await expect(
    page.getByRole("button", { name: "Primary", exact: true }),
  ).toBeVisible();
}
async function openLargeProfile(page: Page) {
  await page.goto("patterns/user-profile-dialog");
  const trigger = page
    .getByRole("button", { name: "Open profile", exact: true })
    .nth(1);
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "User settings",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  return { trigger, dialog };
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

    test("global search preserves route order, handles no matches, resets on close and records its focus-return limitation", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "reference-limitation",
        description:
          "Padded or repeated-space text is not normalized, and reopening can restore an older element instead of the current opener. These are reference limitations, not successful forgiving search or focus return.",
      });
      await openButtons(page);
      let dialog = await openSearch(page, mode.mobile);
      const input = dialog.getByRole("textbox");
      const routes = dialog.locator("button[data-index]");
      const includesDatabaseWorkspace =
        test.info().project.name !== "reference";
      const routeCount = includesDatabaseWorkspace ? 100 : 71;
      await expect(routes).toHaveCount(routeCount);
      await expect(
        routes.filter({ hasText: "/patterns/database-workspace" }),
      ).toHaveCount(includesDatabaseWorkspace ? 1 : 0);
      await expect(routes.nth(0)).toHaveText("UI Catalogue/");
      await expect(routes.nth(1)).toHaveText("Components/components");
      await expect(routes.nth(2)).toHaveText(
        "Components > Overview/components/overview",
      );
      await expect(routes.last()).toContainText(
        "/patterns/user-profile-dialog",
      );
      await input.fill("FIELD");
      await expect(routes).toHaveCount(4);
      await expect(routes).toHaveText([
        "Components > DateField/components/date-field",
        "Components > Field/components/field",
        "Components > Fieldset/components/fieldset",
        "Patterns > Field diff table/patterns/field-diff-table",
      ]);
      await expect(routes.first().locator("span").last()).toHaveCSS(
        "font-size",
        "11px",
      );
      await expect
        .poll(async () => Math.round((await dialog.boundingBox())?.width ?? 0))
        .toBe(mode.mobile ? 343 : 672);
      await input.fill("FIELD DIFF");
      await expect(routes).toHaveCount(1);
      await input.fill("  FIELD   DIFF  ");
      await expect(
        dialog.getByText("No results found", { exact: true }),
      ).toBeVisible();
      const before = page.url();
      await input.press("ArrowDown");
      await input.press("Enter");
      await expect(page).toHaveURL(before);
      await expect(dialog).toBeVisible();
      await input.fill("__appinfo");
      await expect(routes).toHaveCount(0);
      await input.press("Shift+Tab");
      await expect(
        dialog.getByRole("button", { name: "Close", exact: true }),
      ).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(input).toBeFocused();
      await dialog.getByRole("button", { name: "Close", exact: true }).click();
      await expect(dialog).not.toBeVisible();
      dialog = await openSearch(page, mode.mobile);
      await expect(dialog.getByRole("textbox")).toHaveValue("");
      await expect(dialog.locator("button[data-index]")).toHaveCount(
        routeCount,
      );
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      // On compact layouts Escape can also dismiss the navigation sheet.
      // A removed search trigger must not be required to exist to verify lack of focus.
      await expect
        .poll(() =>
          page
            .getByRole("button", { name: "Search", exact: true })
            .evaluateAll((elements) =>
              elements.every((element) => element !== document.activeElement),
            ),
        )
        .toBe(true);
      await closeNavigation(page);
      const primary = page.getByRole("button", {
        name: "Primary",
        exact: true,
      });
      for (const shortcut of ["Meta+k", "Control+k"]) {
        await primary.focus();
        await primary.press(shortcut);
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole("textbox")).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(dialog).not.toBeVisible();
        await expect(primary).not.toBeFocused();
      }
    });

    test("global search keyboard navigation follows the highlighted route, resets after filtering and supports browser Back", async ({
      page,
    }) => {
      await openButtons(page);
      let dialog = await openSearch(page, mode.mobile);
      let input = dialog.getByRole("textbox");
      await input.fill("field");
      await expect(dialog.locator("button[data-index]")).toHaveCount(4);
      await input.press("ArrowDown");
      await input.press("Enter");
      await expect(page).toHaveURL(/\/components\/field\/?$/);
      await expect(dialog).not.toBeVisible();
      await closeNavigation(page);
      await expect(
        page.getByRole("heading", { name: "Field", exact: true }),
      ).toBeVisible();
      await page.goBack();
      await expect(
        page.getByRole("button", { name: "Primary", exact: true }),
      ).toBeVisible();
      dialog = await openSearch(page, mode.mobile);
      input = dialog.getByRole("textbox");
      await input.fill("field");
      for (let i = 0; i < 3; i++) await input.press("ArrowDown");
      await input.fill("datepicker");
      await expect(dialog.locator("button[data-index]")).toHaveCount(1);
      await input.press("Enter");
      await expect(page).toHaveURL(/\/components\/date-picker\/?$/);
      await expect(dialog).not.toBeVisible();
      await closeNavigation(page);
      await expect(
        page.getByRole("group", { name: "Ship date", exact: true }),
      ).toBeVisible();
    });

    test("appearance persists explicit modes across reload and System follows live color-scheme changes", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "known-difference",
        description:
          "After changing appearance, Escape leaves focus on the body in the reference, while ERPboost restores the menu trigger. Keep the working focus return instead of reproducing the defect.",
      });
      await openButtons(page);
      const trigger = page.getByRole("button", {
        name: "Appearance",
        exact: true,
      });
      const menu = page.getByRole("menu", { name: "Appearance", exact: true });
      await trigger.click();
      await expect(
        menu.getByRole("menuitemradio", { name: "System", exact: true }),
      ).toBeChecked();
      await menu
        .getByRole("menuitemradio", { name: "Dark", exact: true })
        .click();
      await expect(page.locator("html")).toHaveClass(/dark/);
      await expect(
        menu.getByRole("menuitemradio", { name: "Dark", exact: true }),
      ).toBeChecked();
      await expect(menu).toBeVisible();
      await expect(
        menu.getByRole("menuitemradio", { name: "Light", exact: true }),
      ).toHaveCSS("line-height", "15px");
      await expect
        .poll(async () => Math.round((await menu.boundingBox())?.height ?? 0))
        .toBe(127);
      const box = await menu.boundingBox();
      if (!box) throw new Error("Appearance menu has no layout");
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(mode.viewport.width);
      await page.keyboard.press("Escape");
      await expect(menu).not.toBeVisible();
      if (test.info().project.name === "reference")
        await expect(trigger).not.toBeFocused();
      else await expect(trigger).toBeFocused();
      await page.reload();
      await expect(page.locator("html")).toHaveClass(/dark/);
      await trigger.click();
      await expect(
        menu.getByRole("menuitemradio", { name: "Dark", exact: true }),
      ).toBeChecked();
      await menu
        .getByRole("menuitemradio", { name: "Light", exact: true })
        .click();
      await expect(page.locator("html")).toHaveClass(/light/);
      await expect(
        menu.getByRole("menuitemradio", { name: "Light", exact: true }),
      ).toBeChecked();
      await menu
        .getByRole("menuitemradio", { name: "System", exact: true })
        .click();
      await expect(
        menu.getByRole("menuitemradio", { name: "System", exact: true }),
      ).toBeChecked();
      await page.keyboard.press("Escape");
      await expect(menu).not.toBeVisible();
      await page.emulateMedia({ colorScheme: "dark" });
      await expect(page.locator("html")).toHaveClass(/dark/);
      await page.reload();
      await expect(page.locator("html")).toHaveClass(/dark/);
      await page.emulateMedia({ colorScheme: "light" });
      await expect(page.locator("html")).toHaveClass(/light/);
    });

    test("sidebar routes dismiss the mobile drawer, retain desktop groups, reset mobile groups and support shortcuts", async ({
      page,
    }) => {
      await openButtons(page);
      await showNavigation(page, mode.mobile);
      const components = page.getByRole("button", {
        name: "Components Toggle",
        exact: true,
      });
      await expect(components).not.toHaveAttribute("aria-expanded", "true");
      await components.click();
      await expect(components).toHaveAttribute("aria-expanded", "true");
      const inputLink = page.locator(
        'a[data-sidebar="menu-button"][href$="/components/input"]',
      );
      await inputLink.click();
      await expect(page).toHaveURL(/\/components\/input\/?$/);
      if (mode.mobile) {
        await expect(drawer(page)).not.toBeVisible();
        await page.keyboard.press("Meta+b");
        await expect(drawer(page)).toBeVisible();
        await expect(components).toHaveAttribute("aria-expanded", "false");
        await page.keyboard.press("Escape");
        await expect(drawer(page)).not.toBeVisible();
      } else {
        await expect(components).toHaveAttribute("aria-expanded", "true");
        const sidebar = page.locator('[data-slot="sidebar"]');
        await page
          .getByRole("button", { name: "Toggle Sidebar", exact: true })
          .last()
          .click();
        await expect(sidebar).toHaveAttribute("data-state", "collapsed");
        await page
          .getByRole("button", { name: "Toggle Sidebar", exact: true })
          .last()
          .click();
        await expect(sidebar).toHaveAttribute("data-state", "expanded");
        await page.keyboard.press("Control+b");
        await expect(sidebar).toHaveAttribute("data-state", "collapsed");
        await page.keyboard.press("Control+b");
        await expect(sidebar).toHaveAttribute("data-state", "expanded");
      }
      await expect(
        page.getByRole("heading", { name: "Input", exact: true }),
      ).toBeVisible();
    });

    test("catalogue language translates search and appearance and persists across route changes and reload", async ({
      page,
    }) => {
      await openButtons(page);
      const before = page.url();
      await showNavigation(page, mode.mobile);
      await page.getByRole("button", { name: "JA", exact: true }).click();
      await expect(page.locator("html")).toHaveAttribute("lang", "ja");
      await expect(page).toHaveURL(before);
      const search = await openSearch(page, mode.mobile, true);
      await search.getByRole("textbox").fill("差分");
      const result = search.locator("button[data-index]");
      await expect(result).toHaveCount(1);
      await expect(result).toContainText("パターン");
      await expect(result).toContainText("/patterns/field-diff-table");
      await search.getByRole("textbox").press("Enter");
      await expect(page).toHaveURL(/\/patterns\/field-diff-table\/?$/);
      await expect(search).not.toBeVisible();
      await closeNavigation(page);
      await page.getByRole("button", { name: "外観", exact: true }).click();
      const appearance = page.getByRole("menu", { name: "外観", exact: true });
      await expect(
        appearance.getByRole("menuitemradio", {
          name: "システム",
          exact: true,
        }),
      ).toBeChecked();
      await page.keyboard.press("Escape");
      await expect(appearance).not.toBeVisible();
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("lang", "ja");
      await expect(
        page.getByRole("button", { name: "外観", exact: true }),
      ).toBeVisible();
      await showNavigation(page, mode.mobile);
      await page.getByRole("button", { name: "EN", exact: true }).click();
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await closeNavigation(page);
      await expect(
        page.getByRole("heading", { name: "Field diff table", exact: true }),
      ).toBeVisible();
    });
  });
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`desktop profile ${colorScheme}`, () => {
    test.use({ viewport: { width: 1280, height: 900 }, colorScheme });

    test("two-column profile distinguishes close and Escape drafts, Cancel resets, and Save stays in memory only", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "reference-limitation",
        description:
          "Account/Preferences/Sessions are placeholders; Save is in-memory only and Cancel resets to the original fixture even after saving.",
      });
      const { trigger, dialog } = await openLargeProfile(page);
      const name = dialog.getByRole("textbox", {
        name: "Display name",
        exact: true,
      });
      const save = dialog.getByRole("button", { name: "Save", exact: true });
      await expect(save).toBeDisabled();
      await name.fill("監査 Profile");
      await expect(save).toBeEnabled();
      for (const tab of ["Account", "Preferences", "Sessions"]) {
        await dialog.getByRole("button", { name: tab, exact: true }).click();
        await expect(
          dialog.getByText(`${tab} is covered in a separate sample`, {
            exact: true,
          }),
        ).toBeVisible();
        await expect(
          dialog.getByText("You have unsaved changes", { exact: true }),
        ).toBeVisible();
      }
      await dialog
        .getByRole("button", { name: "Profile", exact: true })
        .click();
      await expect(name).toHaveValue("監査 Profile");
      await dialog.getByRole("button", { name: "Close", exact: true }).click();
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await trigger.click();
      await expect(name).toHaveValue("監査 Profile");
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await trigger.click();
      await expect(name).toHaveValue("監査 Profile");
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).not.toBeVisible();
      await trigger.click();
      await expect(name).toHaveValue("Jordan Mitchell");
      await expect(save).toBeDisabled();
      await name.fill("Saved Profile");
      await save.click();
      await expect(dialog).not.toBeVisible();
      await trigger.click();
      await expect(name).toHaveValue("Saved Profile");
      await expect(save).toBeDisabled();
      await dialog
        .getByRole("button", { name: "Account", exact: true })
        .click();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).not.toBeVisible();
      await trigger.click();
      await expect(
        dialog.getByRole("heading", { name: "Account", exact: true }),
      ).toBeVisible();
      await dialog
        .getByRole("button", { name: "Profile", exact: true })
        .click();
      await expect(name).toHaveValue("Jordan Mitchell");
      await page.reload();
      await trigger.click();
      await expect(name).toHaveValue("Jordan Mitchell");
    });

    test("two-column profile saves select values and bounds Bio while the photo chooser has no upload handler", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "reference-limitation",
        description:
          "Email has no accessible name, photo selection does not update the avatar or dirty state, and Remove leaves the selected file in the native input. This does not prove a working upload or removal.",
      });
      const { trigger, dialog } = await openLargeProfile(page);
      const email = dialog.locator('input[type="email"]');
      await expect(email).toHaveAccessibleName("");
      await expect(dialog.getByRole("textbox")).toHaveCount(4);
      await expect(
        dialog.getByText("Managed by admin", { exact: true }),
      ).toBeVisible();
      await dialog
        .getByRole("combobox", { name: "Timezone", exact: true })
        .click();
      await page
        .getByRole("option", { name: "Europe/London", exact: true })
        .click();
      await dialog
        .getByRole("combobox", { name: "Language", exact: true })
        .click();
      await page.getByRole("option", { name: "Japanese", exact: true }).click();
      const bio = dialog.getByRole("textbox", { name: "Bio", exact: true });
      await bio.fill("x".repeat(170));
      await expect(bio).toHaveValue("x".repeat(160));
      await expect(dialog.getByText("160/160", { exact: true })).toBeVisible();
      await dialog.getByRole("button", { name: "Save", exact: true }).click();
      await expect(dialog).not.toBeVisible();
      await trigger.click();
      await expect(
        dialog.getByRole("combobox", { name: "Timezone", exact: true }),
      ).toHaveText("Europe/London");
      await expect(
        dialog.getByRole("combobox", { name: "Language", exact: true }),
      ).toHaveText("Japanese");
      const avatar = dialog.locator('[data-slot="avatar-fallback"]');
      const before = await avatar.getAttribute("style");
      const chooserPromise = page.waitForEvent("filechooser");
      await dialog
        .getByRole("button", { name: "Upload photo", exact: true })
        .click();
      const chooser = await chooserPromise;
      await chooser.setFiles({
        name: "avatar.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aQhoAAAAASUVORK5CYII=",
          "base64",
        ),
      });
      const file = dialog.locator('input[type="file"]');
      await expect(file).toHaveAttribute("accept", "image/png,image/jpeg");
      expect(
        await file.evaluate(
          (input: HTMLInputElement) => input.files?.[0]?.name,
        ),
      ).toBe("avatar.png");
      await expect(avatar).toHaveAttribute("style", before!);
      await expect(
        dialog.getByRole("button", { name: "Save", exact: true }),
      ).toBeDisabled();
      await dialog.getByRole("button", { name: "Remove", exact: true }).click();
      await expect(avatar).toHaveAttribute("style", before!);
      expect(
        await file.evaluate((input: HTMLInputElement) => input.files?.length),
      ).toBe(1);
    });
  });
}

test("mobile two-column profile retains the reference clipped fields and offscreen Save limitation", async ({
  page,
}) => {
  test.info().annotations.push({
    type: "reference-limitation",
    description:
      "The fixed 220px navigation rail clips the right pane at 375px; Save lies beyond the viewport. Geometry and screenshot document the defect, not a usable mobile editor.",
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: "dark" });
  const { dialog } = await openLargeProfile(page);
  await dialog.screenshot({ animations: "disabled" });
  const bounds = await dialog.boundingBox();
  const name = await dialog
    .getByRole("textbox", { name: "Display name", exact: true })
    .boundingBox();
  const save = await dialog
    .getByRole("button", { name: "Save", exact: true })
    .boundingBox();
  if (!bounds || !name || !save)
    throw new Error("Profile controls have no layout");
  expect(bounds.width).toBeLessThanOrEqual(375);
  expect(name.x + name.width).toBeGreaterThan(bounds.x + bounds.width);
  expect(save.x).toBeGreaterThanOrEqual(375);
  await dialog.getByRole("button", { name: "Account", exact: true }).click();
  await expect(
    dialog.getByText("Account is covered in a separate sample", {
      exact: true,
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("sidebar footer profile preserves its own draft and focus but does not update the mock identity or page", async ({
  page,
}) => {
  test.info().annotations.push({
    type: "reference-limitation",
    description:
      "The mock sidebar buttons only change selection styling; the page remains Orders. Saved profile edits do not update the static footer identity.",
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("patterns/user-profile-dialog");
  const user = page.getByRole("button", {
    name: /Jordan Mitchell.*j\.mitchell/,
  });
  await expect(user).toBeVisible();
  const root = user.locator(
    'xpath=ancestor::div[contains(@class,"h-[640px]")][1]',
  );
  const reports = root.getByRole("button", { name: "Reports", exact: true });
  await reports.click();
  await expect(reports).toHaveClass(/font-medium/);
  await expect(root.getByRole("main")).toContainText("Orders");
  await root.getByRole("button", { name: "Menu Toggle", exact: true }).click();
  await expect(reports).not.toBeVisible();
  await root.getByRole("button", { name: "Menu Toggle", exact: true }).click();
  await expect(reports).toBeVisible();
  await user.click();
  const dialog = page.getByRole("dialog", {
    name: "User settings",
    exact: true,
  });
  await dialog
    .getByRole("textbox", { name: "Display name", exact: true })
    .fill("Footer edited");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(user).toContainText("Jordan Mitchell");
  await user.click();
  await expect(
    dialog.getByRole("textbox", { name: "Display name", exact: true }),
  ).toHaveValue("Footer edited");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(user).toBeFocused();
  await page
    .getByRole("button", { name: "Open profile", exact: true })
    .nth(1)
    .click();
  await expect(
    dialog.getByRole("textbox", { name: "Display name", exact: true }),
  ).toHaveValue("Jordan Mitchell");
});
