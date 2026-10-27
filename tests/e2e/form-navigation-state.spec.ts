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

const open = (page: Page, route: string) =>
  page.goto(`${route}?preview=fullscreen`);

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

    for (const presentation of ["fullscreen", "catalogue"]) {
      test(`${presentation}: section anchors keep the outer page still and highlight the section at the scroll offset`, async ({
        page,
      }) => {
        await page.goto(
          presentation === "fullscreen"
            ? "page/form-as-page?preview=fullscreen"
            : "page/form-as-page",
        );
        const links = page.locator('a[href^="#section-"]');
        const basic = page.getByRole("link", {
          name: "Basic info",
          exact: true,
        });
        await basic.scrollIntoViewIfNeeded();
        const outerY = await page.evaluate(() => window.scrollY);
        const enclosingScrolls = () =>
          basic.evaluate((link) => {
            let owner = link.parentElement;
            while (
              owner &&
              !["auto", "scroll"].includes(getComputedStyle(owner).overflowY)
            )
              owner = owner.parentElement;
            const positions: number[] = [];
            for (
              let parent = owner?.parentElement;
              parent;
              parent = parent.parentElement
            )
              positions.push(parent.scrollTop);
            return positions;
          });
        const outerPositions = await enclosingScrolls();
        for (const [label, id] of [
          ["Follow-up", "followUp"],
          ["Assignment", "assignment"],
          ["Timeline", "timeline"],
          ["Basic info", "basic"],
        ]) {
          await page.getByRole("link", { name: label, exact: true }).click();
          // Poll the end position, so intermediate smooth-scroll highlights are
          // not mistaken for the final state.
          await expect
            .poll(() =>
              page.locator(`#section-${id}`).evaluate((section) => {
                let scroller = section.parentElement;
                while (
                  scroller &&
                  !["auto", "scroll"].includes(
                    getComputedStyle(scroller).overflowY,
                  )
                )
                  scroller = scroller.parentElement;
                return Math.round(
                  section.getBoundingClientRect().top -
                    (scroller?.getBoundingClientRect().top ?? 0),
                );
              }),
            )
            .toBe(presentation === "catalogue" && id === "followUp" ? 266 : 96);
          await expect(
            page.getByRole("link", { name: label, exact: true }),
          ).toHaveClass(/font-medium/);
          await expect
            .poll(() =>
              links.evaluateAll(
                (es) =>
                  es.filter((e) => e.classList.contains("font-medium")).length,
              ),
            )
            .toBe(1);
          expect(await page.evaluate(() => window.scrollY)).toBe(outerY);
          expect(await enclosingScrolls()).toEqual(outerPositions);
        }
        await page.getByRole("link", { name: "Timeline", exact: true }).click();
        await expect
          .poll(() =>
            page.locator("#section-timeline").evaluate((el) => {
              let scroller = el.parentElement;
              while (
                scroller &&
                !["auto", "scroll"].includes(
                  getComputedStyle(scroller).overflowY,
                )
              )
                scroller = scroller.parentElement;
              return Math.round(
                el.getBoundingClientRect().top -
                  (scroller?.getBoundingClientRect().top ?? 0),
              );
            }),
          )
          .toBe(96);
        const section = await page.locator("#section-timeline").boundingBox();
        await page.mouse.move(
          section!.x + section!.width / 2,
          Math.min(section!.y + 120, mode.viewport.height - 30),
        );
        await page.mouse.wheel(0, -200);
        await expect(
          page.getByRole("link", { name: "Assignment", exact: true }),
        ).toHaveClass(/font-medium/);
        await expect
          .poll(() =>
            links.evaluateAll(
              (es) =>
                es.filter((e) => e.classList.contains("font-medium")).length,
            ),
          )
          .toBe(1);
      });
    }

    test("form rejects missing and malformed fields before serializing valid values", async ({
      page,
    }) => {
      await open(page, "components/form");
      const company = page.getByRole("textbox", {
        name: "Company Name",
        exact: true,
      });
      const email = page.getByRole("textbox", {
        name: "Contact Email",
        exact: true,
      });
      const submit = page.getByRole("button", {
        name: "Submit form",
        exact: true,
      });
      await submit.click();
      await expect(company).toHaveAttribute("aria-invalid", "true");
      await expect(company).toBeFocused();
      await expect(page.locator("pre")).toHaveCount(0);
      await company.fill("Aoba 製造");
      await email.fill("not-an-email");
      await submit.click();
      await expect(email).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("pre")).toHaveCount(0);
      await email.fill("ops@example.com");
      await submit.click();
      await expect
        .poll(async () => JSON.parse(await page.locator("pre").innerText()))
        .toEqual({
          companyName: "Aoba 製造",
          contactEmail: "ops@example.com",
        });
      await email.fill("updated@example.com");
      await submit.click();
      await expect(page.locator("pre")).toContainText("updated@example.com");
    });

    test("wizard retains visited-step drafts before the reference demo submits on Review", async ({
      page,
    }) => {
      await open(page, "page/form-as-page");
      const form = page.locator("form").nth(2);
      const next = form.getByRole("button", { name: "Next", exact: true });
      const title = form.getByPlaceholder("Review supplier docs", {
        exact: true,
      });
      await expect(
        form.getByRole("button", { name: "4", exact: true }),
      ).toBeDisabled();
      await expect(
        form.getByRole("button", { name: "Back", exact: true }),
      ).toBeDisabled();
      await title.fill("見積確認 — audit");
      await form
        .getByPlaceholder("What outcome are you looking for?", { exact: true })
        .fill("Preserve all step values");
      await next.click();
      await form.getByRole("combobox", { name: "Owner", exact: true }).click();
      await page.getByRole("option", { name: "Suzuki", exact: true }).click();
      await expect(page.getByRole("listbox")).not.toBeVisible();
      await form
        .getByRole("combobox", { name: "Priority", exact: true })
        .click();
      await page.getByRole("option", { name: "Urgent", exact: true }).click();
      await expect(page.getByRole("listbox")).not.toBeVisible();
      await next.click();
      await form.locator('input[type="date"]').fill("2026-11-17");
      await form.getByRole("button", { name: "Back", exact: true }).click();
      await expect(
        form.getByRole("combobox", { name: "Owner", exact: true }),
      ).toHaveText("Suzuki");
      await expect(
        form.getByRole("combobox", { name: "Priority", exact: true }),
      ).toHaveText("Urgent");
      await form
        .getByRole("button", { name: "✓", exact: true })
        .first()
        .click();
      await expect(title).toHaveValue("見積確認 — audit");
      await expect(
        form.getByPlaceholder("What outcome are you looking for?", {
          exact: true,
        }),
      ).toHaveValue("Preserve all step values");
      await expect(
        form.getByRole("button", { name: "4", exact: true }),
      ).toBeDisabled();
      await form.getByRole("button", { name: "3", exact: true }).click();
      await expect(form.locator('input[type="date"]')).toHaveValue(
        "2026-11-17",
      );
      // In the reference demo the Next button becomes a submit button during
      // the same click. Its native GET resets the form instead of reaching
      // Review. Record this limitation, rather than asserting a working Review.
      await next.click();
      await expect(page).toHaveURL(
        (url) =>
          url.searchParams.has("notes") && !url.searchParams.has("preview"),
      );
      await expect(title).toHaveValue("");
      await expect(
        form.getByRole("button", { name: "Next", exact: true }),
      ).toBeVisible();
    });

    test("small profile retains demo drafts across cancel and saves while access stays read-only", async ({
      page,
    }) => {
      // Fullscreen lacks a SidebarProvider in both sites. Use the normal
      // catalogue where the sidebar user-menu example has its provider.
      await page.goto("patterns/user-profile-dialog");
      const trigger = page
        .getByRole("button", { name: "Open profile", exact: true })
        .first();
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "Profile", exact: true });
      const name = dialog.getByPlaceholder("Full name", { exact: true });
      const save = dialog.getByRole("button", {
        name: "Save changes",
        exact: true,
      });
      await expect(save).toBeDisabled();
      await name.fill("Aoba Reviewer");
      await dialog
        .getByRole("combobox", { name: "Language", exact: true })
        .click();
      await page.getByRole("option", { name: "Japanese", exact: true }).click();
      await expect(page.getByRole("listbox")).not.toBeVisible();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).not.toBeVisible();
      await trigger.click();
      await expect(name).toHaveValue("Aoba Reviewer");
      await expect(
        dialog.getByRole("combobox", { name: "Language", exact: true }),
      ).toHaveText("Japanese");
      await expect(save).toBeEnabled();
      await expect(dialog.getByText("Active", { exact: true })).toBeVisible();
      await expect(dialog.getByText("Admin", { exact: true })).toBeVisible();
      await expect(dialog.getByRole("textbox")).toHaveCount(2);
      await save.click();
      await expect(dialog).not.toBeVisible();
      await trigger.click();
      await expect(name).toHaveValue("Aoba Reviewer");
      await expect(save).toBeDisabled();
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
    });
  });
}
