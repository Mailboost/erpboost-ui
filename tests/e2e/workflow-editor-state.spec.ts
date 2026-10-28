import { expect, test, type Page } from "@playwright/test";

const pageErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
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
  const errors = pageErrors.get(page)!;
  if (info.title.startsWith("fullscreen provider-dependent"))
    expect(
      errors.every((error) =>
        error.includes("useSidebar must be used within a SidebarProvider."),
      ),
    ).toBe(true);
  else expect(errors).toEqual([]);
});

const open = (page: Page, route: string) =>
  page.goto(`${route}?preview=fullscreen`);
const readSchema = (page: Page) =>
  page.locator("pre").evaluate((element) => JSON.parse(element.textContent!));
const fields = (page: Page) =>
  page
    .getByRole("region", { name: "Form canvas", exact: true })
    .locator("div.group.relative");

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

    test("approval advances only the next stage, clears its comment and completes the chain", async ({
      page,
    }) => {
      await open(page, "patterns/approval-flow");
      const steps = page.getByRole("listitem");
      const comment = page.getByPlaceholder("Add a comment (optional)");
      await expect(steps).toHaveCount(4);
      await expect(steps.nth(1)).toContainText("Pending");
      for (const [index, body] of [
        [1, "  設計確認済み  "],
        [2, "品質確認済み"],
        [3, "出荷可"],
      ] as const) {
        await comment.fill(body);
        await page
          .getByRole("button", { name: "Approve", exact: true })
          .click();
        await expect(steps.nth(index)).toContainText(
          "Approved · Jul 15, 2026 10:24",
        );
        await expect(steps.nth(index)).toContainText(body.trim());
        if (index < 3) {
          await expect(steps.nth(index + 1)).toContainText("Pending");
          await expect(comment).toHaveValue("");
          await expect(
            page.getByRole("button", { name: "Approve", exact: true }),
          ).toHaveCount(1);
        }
      }
      await expect(
        page.getByText("All steps approved", { exact: true }),
      ).toBeVisible();
      await expect(comment).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Approve", exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Return", exact: true }),
      ).toHaveCount(0);
      await expect(steps.getByText("Waiting", { exact: true })).toHaveCount(0);
      await expect(steps.getByText("Pending", { exact: true })).toHaveCount(0);
      await page
        .getByRole("button", { name: "Reset demo", exact: true })
        .click();
      await expect(
        page.getByText("All steps approved", { exact: true }),
      ).toHaveCount(0);
      await expect(comment).toHaveValue("");
      await expect(steps.nth(1)).toContainText("Pending");
      await expect(steps.nth(2)).toContainText("Waiting");
    });

    test("returning a later approval preserves the earlier decision and reset removes the revision state", async ({
      page,
    }) => {
      await open(page, "patterns/approval-flow");
      const steps = page.getByRole("listitem");
      const comment = page.getByPlaceholder("Add a comment (optional)");
      await comment.fill("  設計承認  ");
      await page.getByRole("button", { name: "Approve", exact: true }).click();
      await comment.fill("  仕様を再確認してください  ");
      await page.getByRole("button", { name: "Return", exact: true }).click();
      await expect(
        page.getByText("Returned to applicant", { exact: true }),
      ).toBeVisible();
      await expect(steps.nth(1)).toContainText("設計承認");
      await expect(steps.nth(2)).toContainText("Returned · Jul 15, 2026 10:24");
      await expect(steps.nth(2)).toContainText("仕様を再確認してください");
      await expect(steps.nth(3)).toContainText("Waiting");
      await expect(comment).toHaveCount(0);
      await expect(
        page.getByText("All steps approved", { exact: true }),
      ).toHaveCount(0);
      await page
        .getByRole("button", { name: "Reset demo", exact: true })
        .click();
      await expect(comment).toHaveValue("");
      await expect(
        page.getByText("Returned to applicant", { exact: true }),
      ).toHaveCount(0);
      await comment.fill("   ");
      await page.getByRole("button", { name: "Return", exact: true }).click();
      await expect(steps.nth(1)).toContainText("Returned · Jul 15, 2026 10:24");
      expect(await steps.nth(1).locator("p").count()).toBe(2);
    });

    test("approval editor clamps quorum, retains configured quorum when approvers return, and rebuilds an empty route", async ({
      page,
    }) => {
      await open(page, "patterns/approval-route-builder");
      await page
        .getByRole("button", { name: "Generated route (JSON)", exact: true })
        .click();
      const input = page.getByRole("combobox", {
        name: "Director sign-off approvers",
        exact: true,
      });
      const toolbar = page.getByRole("toolbar").filter({ has: input });
      const minimum = async () => (await readSchema(page)).stages[2].rule.min;
      await expect.poll(minimum).toBe(2);
      await toolbar.getByRole("button").first().click();
      await toolbar.getByRole("button").first().click();
      await expect.poll(minimum).toBe(1);
      await expect(
        page.getByRole("button", { name: "Decrease quorum", exact: true }),
      ).toBeDisabled();
      await expect(
        page.getByRole("button", { name: "Increase quorum", exact: true }),
      ).toBeDisabled();
      for (const name of ["Sam Porter", "Alex Murphy"]) {
        await input.fill(name);
        await page.getByRole("option", { name, exact: true }).click();
        await expect(page.locator('[role="listbox"]')).toHaveCount(0);
        await expect(input).toHaveValue("");
      }
      await expect.poll(minimum).toBe(2);
      await expect
        .poll(async () => (await readSchema(page)).stages[2].approvers)
        .toEqual([
          { kind: "role", ref: "Directors" },
          { kind: "user", ref: "Sam Porter" },
          { kind: "user", ref: "Alex Murphy" },
        ]);
      await page
        .getByRole("button", { name: "Increase quorum", exact: true })
        .click();
      await expect.poll(minimum).toBe(3);
      for (let i = 0; i < 3; i++)
        await toolbar.getByRole("button").first().click();
      await expect(
        page.getByText("No approvers yet — this stage would be skipped.", {
          exact: true,
        }),
      ).toHaveCount(1);
      await expect.poll(minimum).toBe(1);
      await expect
        .poll(async () => (await readSchema(page)).stages[2].approvers)
        .toEqual([]);
      await page
        .getByRole("textbox", { name: "Route name", exact: true })
        .fill("購買の承認");
      for (const name of ["Save", "Discard"])
        await page.getByRole("button", { name, exact: true }).click();
      await expect
        .poll(async () => (await readSchema(page)).route)
        .toBe("購買の承認");
      for (let i = 0; i < 3; i++)
        await page
          .getByRole("button", { name: "Delete stage", exact: true })
          .first()
          .click();
      await expect(
        page.getByText("No stages yet — add the first approval stage below.", {
          exact: true,
        }),
      ).toBeVisible();
      await expect
        .poll(async () => (await readSchema(page)).stages)
        .toEqual([]);
      await page
        .getByRole("button", { name: "Add stage", exact: true })
        .click();
      await expect
        .poll(async () => (await readSchema(page)).stages)
        .toEqual([
          { order: 1, name: "Stage 1", rule: { type: "all" }, approvers: [] },
        ]);
    });

    test("Escape closes an open approver picker but clears the selection when the picker is already closed", async ({
      page,
    }) => {
      await open(page, "patterns/approval-route-builder");
      await page
        .getByRole("button", { name: "Generated route (JSON)", exact: true })
        .click();
      const input = page.getByRole("combobox", {
        name: "Director sign-off approvers",
        exact: true,
      });
      const initial = (await readSchema(page)).stages;
      await input.click();
      await expect(page.getByRole("listbox")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator('[role="listbox"]')).toHaveCount(0);
      expect((await readSchema(page)).stages).toEqual(initial);
      await page.keyboard.press("Escape");
      await expect
        .poll(async () => (await readSchema(page)).stages[2].approvers)
        .toEqual([]);
      expect((await readSchema(page)).stages.slice(0, 2)).toEqual(
        initial.slice(0, 2),
      );
      await expect(
        page.getByText("No approvers yet — this stage would be skipped.", {
          exact: true,
        }),
      ).toBeVisible();
    });

    test("form editor updates existing field metadata and reindexes editable options without changing field identity", async ({
      page,
    }) => {
      await open(page, "patterns/form-builder");
      await page
        .getByRole("button", { name: "Generated schema (JSON)", exact: true })
        .click();
      const initial = await readSchema(page);
      await expect(fields(page)).toHaveCount(5);
      await fields(page)
        .first()
        .click({ position: { x: 5, y: 10 } });
      await page.getByRole("button", { name: "Required", exact: true }).click();
      await fields(page)
        .first()
        .getByRole("textbox", { name: "Label", exact: true })
        .fill("監査の件名");
      await fields(page)
        .first()
        .getByRole("textbox", { name: "Placeholder", exact: true })
        .fill("対象部門を入力");
      await page
        .getByRole("textbox", { name: "Help text", exact: true })
        .fill("現場と共有する名前");
      await page
        .getByRole("textbox", { name: "Help text", exact: true })
        .press("Enter");
      expect(page.url()).toContain("preview=fullscreen");
      await expect
        .poll(async () => (await readSchema(page)).fields[0])
        .toEqual({
          ...initial.fields[0],
          label: "監査の件名",
          placeholder: "対象部門を入力",
          helpText: "現場と共有する名前",
          required: false,
        });
      await fields(page)
        .nth(1)
        .click({ position: { x: 5, y: 10 } });
      const options = fields(page).nth(1);
      await options
        .getByRole("textbox", { name: "Option 2", exact: true })
        .fill("承認担当者");
      await options
        .getByRole("button", { name: "Remove option", exact: true })
        .first()
        .click();
      await expect(
        options.getByRole("textbox", { name: "Option 1", exact: true }),
      ).toHaveValue("承認担当者");
      await expect(
        options.getByRole("textbox", { name: "Option 2", exact: true }),
      ).toHaveValue("Sam Porter");
      await options
        .getByRole("button", { name: "Remove option", exact: true })
        .first()
        .click();
      await options
        .getByRole("button", { name: "Remove option", exact: true })
        .first()
        .click();
      await expect
        .poll(async () => (await readSchema(page)).fields[1].options)
        .toEqual([]);
      await options
        .getByRole("button", { name: "Add option", exact: true })
        .click();
      await options
        .getByRole("textbox", { name: "Option 1", exact: true })
        .fill("新しい担当者");
      await page
        .getByRole("button", { name: "Clear selection", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Required", exact: true }),
      ).toHaveCount(0);
      await expect
        .poll(async () => (await readSchema(page)).fields[1])
        .toEqual({ ...initial.fields[1], options: ["新しい担当者"] });
      expect(
        (await readSchema(page)).fields.map(
          (field: { id: string }) => field.id,
        ),
      ).toEqual(initial.fields.map((field: { id: string }) => field.id));
    });

    test("form palette serializes every type, removes the active field and rebuilds an empty canvas while Save and Discard remain demo controls", async ({
      page,
    }) => {
      await open(page, "patterns/form-builder");
      await page
        .getByRole("button", { name: "Generated schema (JSON)", exact: true })
        .click();
      for (const name of [
        "Text",
        "Long text",
        "Number",
        "Email",
        "Date",
        "Select",
        "Multi-select",
        "Checkbox",
      ])
        await page.getByRole("button", { name, exact: true }).click();
      await expect(fields(page)).toHaveCount(13);
      await expect
        .poll(async () =>
          (await readSchema(page)).fields
            .slice(5)
            .map((f: { type: string }) => f.type),
        )
        .toEqual([
          "text",
          "textarea",
          "number",
          "email",
          "date",
          "select",
          "multiselect",
          "checkbox",
        ]);
      await page.getByRole("button", { name: "Required", exact: true }).click();
      await expect(
        page.getByText("13 fields · 3 required", { exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Delete field", exact: true })
        .click();
      await expect(fields(page)).toHaveCount(12);
      await expect(
        page.getByRole("button", { name: "Clear selection", exact: true }),
      ).toHaveCount(0);
      await page
        .getByRole("textbox", { name: "Form title", exact: true })
        .fill("部門別の申請");
      const before = await readSchema(page);
      for (const name of ["Save", "Discard"]) {
        await page.getByRole("button", { name, exact: true }).click();
        expect(await readSchema(page)).toEqual(before);
      }
      for (let i = 0; i < 12; i++) {
        await fields(page)
          .first()
          .click({ position: { x: 5, y: 10 } });
        await page
          .getByRole("button", { name: "Delete field", exact: true })
          .click();
      }
      await expect(
        page.getByText("Add fields from the palette on the left", {
          exact: true,
        }),
      ).toBeVisible();
      await expect
        .poll(async () => (await readSchema(page)).fields)
        .toEqual([]);
      await expect(
        page.getByRole("textbox", { name: "Submit button label", exact: true }),
      ).toHaveCount(0);
      await page.getByRole("button", { name: "Text", exact: true }).click();
      await expect
        .poll(async () =>
          (await readSchema(page)).fields.map(
            ({ id, ...field }: { id: string }) => field,
          ),
        )
        .toEqual([
          {
            type: "text",
            label: "Text field",
            placeholder: "",
            required: false,
          },
        ]);
      await page.reload();
      await expect(fields(page)).toHaveCount(5);
      await expect(
        page.getByRole("textbox", { name: "Form title", exact: true }),
      ).toHaveValue("Supplier audit task");
    });

    test("notification keyboard read state resets on reopen and its sidebar badge remains the sample count", async ({
      page,
    }) => {
      await page.goto("patterns/notification-panel");
      const sample = page.getByRole("region", {
        name: "Block preview",
        exact: true,
      });
      const trigger = sample.getByRole("button", {
        name: "Open notifications",
        exact: true,
      });
      const dialog = page.getByRole("dialog", {
        name: "Notifications",
        exact: true,
      });
      await expect(dialog.getByRole("listitem")).toHaveCount(3);
      await trigger.click();
      await trigger.press("Enter");
      // Traverse the visible sidebar and then the notification controls with
      // real Tab events. Narrow containers scroll horizontally as focus moves.
      for (let i = 0; i < 7; i++) await page.keyboard.press("Tab");
      await expect(
        dialog.getByRole("tab", { name: "Unread 3", exact: true }),
      ).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(
        dialog.getByRole("tab", { name: "All", exact: true }),
      ).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(
        dialog.getByRole("tab", { name: "All", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
      await expect(dialog.getByRole("listitem")).toHaveCount(5);
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      await expect(
        dialog.getByRole("tab", { name: "Unread 2", exact: true }),
      ).toHaveCount(1);
      await expect(trigger).toHaveText("Notifications3");
      for (let i = 0; i < 3; i++) await page.keyboard.press("Shift+Tab");
      await expect(
        dialog.getByRole("button", { name: "Mark all as read", exact: true }),
      ).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(
        dialog.getByRole("button", { name: "Mark all as read", exact: true }),
      ).toHaveCount(0);
      await dialog.getByRole("tab", { name: "Unread", exact: true }).click();
      await expect(
        dialog.getByText("No notifications", { exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await trigger.click();
      await expect(
        dialog.getByRole("tab", { name: "Unread 3", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
      await expect(dialog.getByRole("listitem")).toHaveCount(3);
      await sample.getByRole("button", { name: "Home", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await expect(
        sample.getByRole("button", { name: "Home", exact: true }),
      ).toHaveClass(/(^|\s)bg-muted(\s|$)/);
      await trigger.click();
      await expect(dialog.getByRole("listitem")).toHaveCount(3);
    });
  });
}

test("fullscreen provider-dependent samples render the same known error instead of a functioning preview", async ({
  page,
}) => {
  test.info().annotations.push({
    type: "reference-limitation",
    description:
      "Error-screen parity is not successful UI rendering. Normal catalogue notification interaction is tested separately.",
  });
  for (const route of [
    "components/sidebar",
    "patterns/user-profile-dialog",
    "patterns/notification-panel",
  ]) {
    await open(page, route);
    const error = page.getByRole("alert", {
      name: "default-error-boundary",
      exact: true,
    });
    await expect(
      error.getByRole("heading", { name: "Something went wrong", exact: true }),
    ).toBeVisible();
    await expect(error).toContainText(
      "useSidebar must be used within a SidebarProvider.",
    );
    await expect(
      error.getByRole("button", { name: "Try Again", exact: true }),
    ).toBeVisible();
    if (route.endsWith("notification-panel"))
      await expect(
        page.getByRole("button", { name: "Open notifications", exact: true }),
      ).toHaveCount(0);
  }
});
