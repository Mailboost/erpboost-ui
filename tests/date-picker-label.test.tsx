import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { expect, it } from "vitest";
import { parseDate } from "@internationalized/date";
import { useState } from "react";
import { DatePicker, Field } from "@mailboost/erpboost-ui";
import { AppShellInternal } from "../packages/ui/src/components/appshell/appshell";

it.each([
  {
    locale: "en",
    name: "Ship date",
    trigger: "Open calendar",
    dialog: "Ship date, choose date",
  },
  {
    locale: "ja",
    name: "出荷日",
    trigger: "カレンダーを開く",
    dialog: "出荷日、日付を選択",
  },
])(
  "announces the date-picker name and action inside a Field in $locale",
  async ({ locale, name, trigger, dialog }) => {
    render(
      <AppShellInternal
        title="Test"
        modules={[]}
        locale={locale}
        memory
        initialEntries={["/"]}
      >
        <Field.Root>
          <Field.Label>{name}</Field.Label>
          <DatePicker aria-label={name} />
        </Field.Root>
      </AppShellInternal>,
    );
    fireEvent.click(await screen.findByRole("button", { name: trigger }));
    expect(await screen.findByRole("dialog", { name: dialog })).toBeTruthy();
  },
);

it("preserves an explicit aria-labelledby over aria-label", async () => {
  render(
    <AppShellInternal
      title="Test"
      modules={[]}
      locale="en"
      memory
      initialEntries={["/"]}
    >
      <span id="dispatch-label">Dispatch date</span>
      <DatePicker aria-label="Other name" aria-labelledby="dispatch-label" />
    </AppShellInternal>,
  );
  fireEvent.click(await screen.findByRole("button", { name: "Open calendar" }));
  expect(
    await screen.findByRole("dialog", { name: "Dispatch date" }),
  ).toBeTruthy();
});

it.each([
  {
    preserveCalendarView: undefined,
    expectedMonth: "July 2028",
    focusedDay: "Monday, July 10, 2028",
  },
  {
    preserveCalendarView: true,
    expectedMonth: "July 2026",
    focusedDay: "Wednesday, July 1, 2026",
  },
])(
  "opens on $expectedMonth after a controlled date changes",
  async ({ preserveCalendarView, expectedMonth, focusedDay }) => {
    function ControlledPicker() {
      const [value, setValue] = useState(parseDate("2026-07-10"));
      return (
        <>
          <button onClick={() => setValue(parseDate("2028-07-10"))}>
            Load another date
          </button>
          <DatePicker
            aria-label="Ship date"
            value={value}
            preserveCalendarView={preserveCalendarView}
          />
        </>
      );
    }
    render(
      <AppShellInternal
        title="Test"
        modules={[]}
        locale="en"
        memory
        initialEntries={["/"]}
      >
        <ControlledPicker />
      </AppShellInternal>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Load another date" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Open calendar" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Ship date, choose date",
    });
    expect(
      await within(dialog).findByText(expectedMonth, { exact: true }),
    ).toBeTruthy();
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(dialog).getByRole("button", { name: focusedDay }),
      ),
    );
  },
);
