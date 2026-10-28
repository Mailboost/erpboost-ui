import { expect, test, type Locator, type Page } from "@playwright/test";

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
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

async function open(page: Page, route: string) {
  // Fix only the date examples; other widgets keep their normal clock.
  if (route.includes("date-")) {
    await page.clock.setFixedTime(new Date("2026-07-10T12:00:00Z"));
  }
  await page.goto(`${route}?preview=fullscreen`);
}
const field = (page: Page, name: string) =>
  page.getByRole("group", { name, exact: true });
const segment = (group: Locator, name: string) =>
  group.getByRole("spinbutton", { name, exact: true });
async function typeSegment(group: Locator, name: string, text: string) {
  const input = segment(group, name);
  await input.focus();
  await input.press("Backspace");
  await input.pressSequentially(text);
}
async function date(group: Locator, year: string, month: string, day: string) {
  await typeSegment(group, "year", year);
  await typeSegment(group, "month", month);
  await typeSegment(group, "day", day);
}
async function expectDate(
  group: Locator,
  month: string,
  day: string,
  year: string,
) {
  await expect(segment(group, "month")).toHaveText(month);
  await expect(segment(group, "day")).toHaveText(day);
  await expect(segment(group, "year")).toHaveText(year);
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

    test("date segments clamp leap-year month ends and distinguish segment wrapping from whole-date shortcuts", async ({
      page,
    }) => {
      await open(page, "components/date-field");
      const invoice = field(page, "Invoice date");
      await date(invoice, "2028", "01", "31");
      await expectDate(invoice, "01", "31", "2028");
      await typeSegment(invoice, "month", "02");
      await expectDate(invoice, "02", "29", "2028");
      await expect(segment(invoice, "day")).toBeFocused();
      await typeSegment(invoice, "year", "2027");
      await expectDate(invoice, "02", "28", "2027");
      await segment(invoice, "day").press("ArrowUp");
      await expectDate(invoice, "02", "01", "2027");
      await segment(invoice, "day").press("-");
      await expectDate(invoice, "01", "31", "2027");
      await segment(invoice, "day").press("=");
      await expectDate(invoice, "02", "01", "2027");
      await segment(invoice, "day").press("h");
      await expectDate(invoice, "02", "28", "2027");
      await segment(invoice, "day").press("m");
      await expectDate(invoice, "02", "01", "2027");
      await segment(invoice, "day").press("y");
      await expectDate(invoice, "01", "01", "2027");
      await segment(invoice, "day").press("r");
      await expectDate(invoice, "12", "31", "2027");
    });

    test("date entry advances on slash, expands a short year when leaving its segment and does not refill a cleared day", async ({
      page,
    }) => {
      await open(page, "components/date-field");
      const due = field(page, "Due date");
      await typeSegment(due, "month", "1");
      await expect(segment(due, "month")).toBeFocused();
      await segment(due, "month").press("/");
      await expect(segment(due, "day")).toBeFocused();
      await segment(due, "day").press("2");
      await segment(due, "day").press("/");
      await expect(segment(due, "year")).toBeFocused();
      await segment(due, "year").pressSequentially("28");
      await expect(segment(due, "year")).toHaveText("28");
      await segment(due, "year").press("ArrowLeft");
      await expectDate(due, "01", "02", "2028");
      await expect(segment(due, "day")).toBeFocused();
      await segment(due, "day").press("Home");
      await expect(segment(due, "month")).toBeFocused();
      await segment(due, "month").press("End");
      await expect(segment(due, "year")).toBeFocused();
      await segment(due, "day").press("Delete");
      await segment(field(page, "Invoice date"), "month").focus();
      await expectDate(due, "01", "dd", "2028");
      await segment(due, "month").press("Delete");
      await segment(due, "year").press("Backspace");
      await segment(field(page, "Invoice date"), "month").focus();
      await expectDate(due, "mm", "dd", "yyyy");
    });

    test("date picker preserves the viewed month on reopen even after its typed year changes", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "reference-limitation",
        description:
          "The reference keeps the last viewed month even after typing another year. Retained navigation is verified, but the popup need not show the typed date.",
      });
      await open(page, "components/date-picker");
      const ship = field(page, "Ship date");
      const trigger = ship.getByRole("button", {
        name: "Open calendar",
        exact: true,
      });
      const dialog = page.getByRole("dialog", {
        name: "Ship date, choose date",
        exact: true,
      });
      await segment(ship, "month").press("Alt+ArrowDown");
      await expect(
        dialog.getByText("July 2026", { exact: true }),
      ).toBeVisible();
      await expect(
        dialog.getByRole("button", {
          name: "Friday, July 10, 2026",
          exact: true,
        }),
      ).toBeFocused();
      await dialog
        .getByRole("button", { name: "Next month", exact: true })
        .click();
      await expect(
        dialog.getByText("August 2026", { exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await trigger.click();
      await expect(
        dialog.getByText("August 2026", { exact: true }),
      ).toBeVisible();
      await expect(
        dialog.getByRole("button", {
          name: "Saturday, August 1, 2026",
          exact: true,
        }),
      ).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await typeSegment(ship, "year", "28");
      await expect(segment(ship, "year")).toHaveText("28");
      await trigger.focus();
      await expectDate(ship, "07", "10", "2028");
      await trigger.click();
      await expect(
        dialog.getByText("August 2026", { exact: true }),
      ).toBeVisible();
      await expect(dialog.locator('[aria-selected="true"]')).toHaveCount(0);
      await expect(
        dialog.getByRole("button", {
          name: "Saturday, August 1, 2026",
          exact: true,
        }),
      ).toBeFocused();
    });

    test("date picker explains out-of-range input, clears its error on correction and bounds calendar navigation", async ({
      page,
    }) => {
      await open(page, "components/date-picker");
      const delivery = field(page, "Delivery window");
      const trigger = delivery.getByRole("button", {
        name: "Open calendar",
        exact: true,
      });
      await date(delivery, "2026", "07", "05");
      await trigger.focus();
      await expect(segment(delivery, "day")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      const error = page.getByRole("alert");
      await expect(error).toHaveText("Date is outside the allowed range.");
      await expect
        .poll(async () =>
          (await delivery.getAttribute("aria-describedby"))
            ?.split(" ")
            .includes((await error.getAttribute("id")) ?? ""),
        )
        .toBe(true);
      await typeSegment(delivery, "day", "10");
      await trigger.focus();
      await expect(error).toHaveCount(0);
      await expect(segment(delivery, "day")).not.toHaveAttribute(
        "aria-invalid",
        "true",
      );
      await trigger.click();
      const dialog = page.getByRole("dialog", {
        name: "Delivery window, choose date",
        exact: true,
      });
      await expect(
        dialog.getByText("July 2026", { exact: true }),
      ).toBeVisible();
      await expect(
        dialog.getByRole("button", { name: "Previous month", exact: true }),
      ).toBeDisabled();
      await expect(
        dialog.getByRole("button", {
          name: "Thursday, July 9, 2026",
          exact: true,
        }),
      ).toBeDisabled();
      await dialog
        .getByRole("button", { name: "Next month", exact: true })
        .click();
      await expect(
        dialog.getByText("August 2026", { exact: true }),
      ).toBeVisible();
      await expect(
        dialog.getByRole("button", { name: "Next month", exact: true }),
      ).toBeDisabled();
      await expect(
        dialog.getByRole("button", {
          name: "Monday, August 10, 2026",
          exact: true,
        }),
      ).toBeDisabled();
      await dialog
        .getByRole("button", { name: "Sunday, August 9, 2026", exact: true })
        .click();
      await expect(dialog).not.toBeVisible();
      await expectDate(delivery, "08", "09", "2026");
      await expect(error).toHaveCount(0);
    });

    test("calendar date changes retain time but expose the reference hour-display defect before segment cycling", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "known-difference",
        description:
          "After a calendar selection, the reference displays 23 AM for an 11 PM value. ERPboost retains the correct 11 PM display. This test records that difference rather than claiming identical hour formatting.",
      });
      const hourAfterCalendar =
        test.info().project.name === "reference" ? "23" : "11";
      const periodAfterCalendar =
        test.info().project.name === "reference" ? "AM" : "PM";
      await open(page, "components/date-picker");
      const booking = field(page, "Booking slot");
      await date(booking, "2026", "07", "10");
      await typeSegment(booking, "hour", "11");
      await typeSegment(booking, "minute", "59");
      await segment(booking, "AM/PM").press("p");
      await booking
        .getByRole("button", { name: "Open calendar", exact: true })
        .click();
      const dialog = page.getByRole("dialog", {
        name: "Booking slot, choose date",
        exact: true,
      });
      await dialog
        .getByRole("button", { name: "Sunday, July 12, 2026", exact: true })
        .click();
      await expect(dialog).not.toBeVisible();
      await expectDate(booking, "07", "12", "2026");
      await expect(segment(booking, "hour")).toHaveText(hourAfterCalendar);
      await expect(segment(booking, "minute")).toHaveText("59");
      await expect(segment(booking, "AM/PM")).toHaveText(periodAfterCalendar);
      await segment(booking, "minute").press("ArrowUp");
      await expect(segment(booking, "minute")).toHaveText("00");
      await expect(segment(booking, "hour")).toHaveText(hourAfterCalendar);
      await segment(booking, "hour").press("ArrowUp");
      await expect(segment(booking, "hour")).toHaveText("12");
      await expect(segment(booking, "AM/PM")).toHaveText(periodAfterCalendar);
      await segment(booking, "AM/PM").press("a");
      await expect(segment(booking, "AM/PM")).toHaveText("AM");
      await expectDate(booking, "07", "12", "2026");
    });

    test("tab arrows move focus, Enter and Space activate panels, and variant and size selections stay independent", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "reference-limitation",
        description:
          "The last icon-only tab in each Sizes example has no accessible name in the reference. Keyboard activation is verified, but readable naming is not a passing accessibility outcome.",
      });
      await open(page, "components/tabs");
      const main = page.getByRole("tablist", {
        name: "Supplier sections",
        exact: true,
      });
      const overview = main.getByRole("tab", { name: "Overview", exact: true });
      const orders = main.getByRole("tab", { name: "Orders", exact: true });
      const activity = main.getByRole("tab", { name: "Activity", exact: true });
      await overview.focus();
      await overview.press("ArrowRight");
      await expect(orders).toBeFocused();
      await expect(overview).toHaveAttribute("aria-selected", "true");
      await orders.press("Enter");
      await expect(
        page.getByRole("tabpanel", { name: "Orders", exact: true }),
      ).toHaveText("Purchase orders placed with this supplier.");
      await orders.press("End");
      await expect(activity).toBeFocused();
      await expect(orders).toHaveAttribute("aria-selected", "true");
      await activity.press("Space");
      await expect(
        page.getByRole("tabpanel", { name: "Activity", exact: true }),
      ).toHaveText("Recent updates and comments.");
      await activity.press("ArrowRight");
      await expect(overview).toBeFocused();
      await overview.press("ArrowLeft");
      await expect(activity).toBeFocused();
      await activity.press("Home");
      await expect(overview).toBeFocused();
      await overview.press("Enter");
      await expect(
        page.getByRole("tabpanel", { name: "Overview", exact: true }),
      ).toHaveText("Company profile and key metrics.");
      await page
        .getByRole("tablist", { name: "Supplier sections (line)", exact: true })
        .getByRole("tab", { name: "Orders", exact: true })
        .click();
      await page
        .getByRole("tablist", { name: "Order status", exact: true })
        .getByRole("tab", { name: "Approved", exact: true })
        .click();
      await page
        .getByRole("tablist", { name: "View mode", exact: true })
        .getByRole("tab", { name: "Favorites view", exact: true })
        .click();
      for (const size of ["xs", "sm", "default", "lg"]) {
        const list = page.getByRole("tablist", {
          name: `Order status (${size})`,
          exact: true,
        });
        const all = list.getByRole("tab", { name: "All", exact: true });
        const icon = list.getByRole("tab").nth(2);
        await expect(icon).toHaveAccessibleName("");
        await all.focus();
        await all.press("End");
        await expect(icon).toBeFocused();
        await icon.press("Enter");
        await expect(icon).toHaveAttribute("aria-selected", "true");
      }
      await expect(overview).toHaveAttribute("aria-selected", "true");
      await expect(
        page
          .getByRole("tablist", { name: "Order status", exact: true })
          .getByRole("tab", { name: "Approved", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
    });

    test("tooltip opens by keyboard focus and hover, closes on Escape or pointer exit and stays within the viewport", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "reference-limitation",
        description:
          "The reference popup has no tooltip role. Visible focus/hover/dismissal behavior is tested through its popup slot, not counted as complete accessible tooltip semantics.",
      });
      await open(page, "components/tooltip");
      const trigger = page.getByRole("button", {
        name: "Hover tooltip",
        exact: true,
      });
      const popup = page.locator('[data-slot="tooltip-content"]');
      await expect(trigger).toBeVisible();
      await page.keyboard.press("Tab");
      await expect(trigger).toBeFocused();
      await expect(popup).toHaveText(
        "Inline guidance for dense enterprise UI.",
      );
      const box = await popup.boundingBox();
      if (!box) throw new Error("Tooltip has no layout");
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(mode.viewport.width);
      await page.keyboard.press("Escape");
      await expect(popup).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await page.keyboard.press("Tab");
      await page.mouse.move(0, 0);
      await trigger.hover();
      await expect(popup).toBeVisible();
      await page.mouse.move(0, 0);
      await expect(popup).not.toBeVisible();
    });

    test("disabled date field retains the reference defect where a real pointer click permits keyboard mutation", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "reference-limitation",
        description:
          "Despite aria-disabled and tabindex=-1, a native pointer click focuses a date segment and ArrowUp changes it in the reference. This is defect parity, not successful disabled-state enforcement.",
      });
      await open(page, "components/date-field");
      const locked = field(page, "Locked date");
      const month = segment(locked, "month");
      await expect(locked).toHaveAttribute("aria-disabled", "true");
      await expect(month).toHaveAttribute("tabindex", "-1");
      await expectDate(locked, "01", "01", "2026");
      await month.scrollIntoViewIfNeeded();
      const box = await month.boundingBox();
      if (!box) throw new Error("Disabled segment has no layout");
      // Use an actual pointer event, not force:true or programmatic focus, to
      // verify what a human click does despite the control's ARIA state.
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(month).toBeFocused();
      await page.keyboard.press("ArrowUp");
      await expectDate(locked, "02", "01", "2026");
      await expect(locked).toHaveAttribute("aria-disabled", "true");
    });
  });
}
