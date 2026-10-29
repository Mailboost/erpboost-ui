import { test, expect } from "@playwright/test";
test.beforeEach(({}, info) =>
  test.skip(
    info.project.name === "reference",
    "Additional ERPBoost composition",
  ),
);
test("uses a narrow container inside a desktop browser and preserves navigation/editor nodes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("patterns/adaptive-workspace?preview=fullscreen");
  const editor = page.getByRole("textbox", {
      name: "Editor draft",
      exact: true,
    }),
    files = page.getByRole("complementary", {
      name: "Source files",
      exact: true,
    });
  await expect(files).toBeVisible();
  await editor.fill("9007199254740993");
  await editor.evaluate((el) => {
    (window as any).originalEditor = el;
  });
  await page
    .getByRole("button", { name: "Use narrow container", exact: true })
    .click();
  const toggle = page.getByRole("button", { name: "Files", exact: true });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(files).toHaveCount(0);
  expect((await editor.boundingBox())!.width).toBeGreaterThan(330);
  await toggle.focus();
  await toggle.press("Enter");
  await expect(files).toBeVisible();
  await files.getByRole("button", { name: "helpers.py", exact: true }).click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue("9007199254740993");
  expect(
    await editor.evaluate((el) => el === (window as any).originalEditor),
  ).toBe(true);
  await expect(page.getByLabel("Selected source")).toHaveText("helpers.py");
  await expect(page.getByLabel("Form submissions")).toHaveText("0");
});
test("keeps a typed navigation draft when a mobile sidebar closes and reopens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("patterns/adaptive-workspace?preview=fullscreen");
  const toggle = page.getByRole("button", { name: "Files", exact: true }),
    editor = page.getByRole("textbox", { name: "Editor draft", exact: true });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect((await editor.boundingBox())!.width).toBeGreaterThan(350);
  await toggle.click();
  await page.getByRole("button", { name: "Add source", exact: true }).click();
  const input = page.getByRole("textbox", { name: "Source name", exact: true });
  await input.fill("日本語の入力中_0001");
  await input.evaluate((el) => {
    (window as any).sidebarInput = el;
  });
  await toggle.click();
  await expect(input).toHaveCount(0);
  await toggle.click();
  await expect(input).toHaveValue("日本語の入力中_0001");
  expect(
    await input.evaluate((el) => el === (window as any).sidebarInput),
  ).toBe(true);
  expect(
    await page
      .locator(".erpui-adaptive-workspace-navigation")
      .evaluate((el) => el.getBoundingClientRect().height),
  ).toBeLessThanOrEqual(280);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await expect(page.getByLabel("Form submissions")).toHaveText("0");
});
test("resizing a focused inline sidebar restores the disclosure without losing editor state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("patterns/adaptive-workspace?preview=fullscreen");
  const editor = page.getByRole("textbox", {
      name: "Editor draft",
      exact: true,
    }),
    files = page.getByRole("complementary", {
      name: "Source files",
      exact: true,
    });
  await editor.fill("0001 — preserved");
  await files.getByRole("button", { name: "main.py", exact: true }).focus();
  await page.locator('[data-demo-container="adaptive"]').evaluate((el) => {
    (el as HTMLElement).style.width = "360px";
  });
  const toggle = page.getByRole("button", { name: "Files", exact: true });
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(editor).toHaveValue("0001 — preserved");
  await page.locator('[data-demo-container="adaptive"]').evaluate((el) => {
    (el as HTMLElement).style.width = "100%";
  });
  await expect(toggle).toHaveCount(0);
  await expect(files).toBeVisible();
  await expect(editor).toHaveValue("0001 — preserved");
});
