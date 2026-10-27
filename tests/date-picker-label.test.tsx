import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
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
