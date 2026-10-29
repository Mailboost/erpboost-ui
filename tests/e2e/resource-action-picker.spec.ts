import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test.describe(`Resource action flow ${viewport.width}`, () => {
    test.use({ viewport });
    test.beforeEach(({}, info) =>
      test.skip(
        info.project.name === "reference",
        "Additional ERPBoost composition",
      ),
    );
    test("creates after popup removal, keeps focus in the new field and does not affect another picker", async ({
      page,
    }) => {
      await page.goto("patterns/resource-action-picker?preview=fullscreen");
      const projects = page.getByRole("region", {
          name: "Projects",
          exact: true,
        }),
        connections = page.getByRole("region", {
          name: "Connections",
          exact: true,
        });
      await projects
        .getByRole("combobox", { name: "Choose Projects", exact: true })
        .click();
      const search = page.getByRole("combobox", {
        name: "Search Projects",
        exact: true,
      });
      await search.fill("ＢＥＴＡ");
      await expect(
        page.getByRole("option", { name: "Beta", exact: true }),
      ).toBeVisible();
      await page.getByRole("option", { name: "Beta", exact: true }).click();
      await expect(projects.getByLabel("Projects selection")).toHaveText(
        "9007199254740993",
      );
      await projects
        .getByRole("combobox", { name: "Choose Projects", exact: true })
        .click();
      const create = page.getByRole("button", {
        name: "Create Projects",
        exact: true,
      });
      expect(
        await create.evaluate(
          (el) => !!el.closest('[data-demo-portal="resource-action-picker"]'),
        ),
      ).toBe(true);
      await expect(search).toBeFocused();
      await create.focus();
      await create.press("Enter");
      const field = projects.getByRole("textbox", {
        name: "Projects name",
        exact: true,
      });
      await expect(field).toBeFocused();
      await field.fill("0001 — 日本語");
      await expect(field).toHaveValue("0001 — 日本語");
      await expect(projects.getByLabel("Projects actions")).toHaveText("1");
      await expect(projects.getByLabel("Projects popups at action")).toHaveText(
        "0",
      );
      await expect(connections.getByLabel("Connections actions")).toHaveText(
        "0",
      );
      await field.press("Escape");
      await expect(
        projects.getByRole("combobox", {
          name: "Choose Projects",
          exact: true,
        }),
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(viewport.width);
    });
    test("renames after an open popup closes and preserves disabled actions and a header trigger", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("patterns/resource-action-picker?preview=fullscreen");
      const connections = page.getByRole("region", {
        name: "Connections",
        exact: true,
      });
      const trigger = connections.getByRole("combobox", {
        name: "Choose Connections",
        exact: true,
      });
      await trigger.click();
      await expect(
        page.getByRole("combobox", { name: "Search Connections", exact: true }),
      ).toBeFocused();
      await trigger.focus();
      await expect(trigger).toBeFocused();
      await trigger.press("F2");
      const field = connections.getByRole("textbox", {
        name: "Connections name",
        exact: true,
      });
      await expect(field).toBeFocused();
      await expect(field).toHaveValue("Alpha");
      await expect(
        connections.getByLabel("Connections popups at action"),
      ).toHaveText("0");
      await expect(connections.getByLabel("Connections actions")).toHaveText(
        "1",
      );
      await field.press("Escape");
      await connections
        .getByRole("button", { name: "Disable Connections", exact: true })
        .click();
      await expect(trigger).toBeDisabled();
      await connections
        .getByRole("button", { name: "Enable Connections", exact: true })
        .click();
      await trigger.click();
      await page
        .getByRole("button", { name: "Create Connections", exact: true })
        .click();
      await expect(field).toBeFocused();
      await expect(connections.getByLabel("Connections actions")).toHaveText(
        "2",
      );
      await expect(
        connections.getByLabel("Connections popups at action"),
      ).toHaveText("0");
    });
  });
}
