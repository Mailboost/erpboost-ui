import { useState } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { parseDate } from "@internationalized/date";
import { Field } from "@/components/field";
import { Fieldset } from "@/components/fieldset";
import { DatePicker } from "@/components/date-field";
import { LocaleProvider } from "@/components/locale-provider";
import { Pagination } from "@/components/pagination";

it("links standalone labels, descriptions and errors and inherits a disabled fieldset", async () => {
  const { rerender } = render(<Fieldset.Root disabled><Field.Root invalid><Field.Label>Reference</Field.Label><Field.Control defaultValue="SO-1"/><Field.Description>ERP reference</Field.Description><Field.Error match>Already used</Field.Error></Field.Root></Fieldset.Root>);
  await waitFor(() => expect((screen.getByLabelText("Reference") as HTMLInputElement).disabled).toBe(true));
  rerender(<Fieldset.Root><Field.Root invalid><Field.Label>Reference</Field.Label><Field.Control defaultValue="SO-1"/><Field.Description>ERP reference</Field.Description><Field.Error match>Already used</Field.Error></Field.Root></Fieldset.Root>);
  const input = screen.getByLabelText("Reference") as HTMLInputElement;
  await waitFor(() => expect(input.disabled).toBe(false));
  const descriptions = input.getAttribute("aria-describedby")!.split(" ").map(id => document.getElementById(id)?.textContent).join(" ");
  expect(descriptions).toContain("ERP reference");
  expect(descriptions).toContain("Already used");
});

it("keeps calendar dates exact and puts the calendar in the consumer's themed overlay", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const changed = vi.fn();
  function Picker() {
    const [date, setDate] = useState<ReturnType<typeof parseDate> | null>(parseDate("2026-10-29"));
    return <LocaleProvider locale="en-US"><Field.Root><Field.Label>Due date</Field.Label><DatePicker timeZone="Pacific/Honolulu" container={container} value={date} onChange={value => { setDate(value); changed(value?.toString() ?? null); }}/></Field.Root></LocaleProvider>;
  }
  try {
    render(<Picker/>);
    fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    const dialog = await within(container).findByRole("dialog", { name: "Due date" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Friday, October 30, 2026" }));
    expect(changed).toHaveBeenLastCalledWith("2026-10-30");
  } finally { container.remove(); }
});

it("clamps direct page entry and disables navigation at collection boundaries", () => {
  const page = vi.fn(), next = vi.fn();
  const props = { currentPage: 1, totalPages: 4, hasPrevPage: false, hasNextPage: true, onFirstPage: vi.fn(), onPreviousPage: vi.fn(), onNextPage: next, onLastPage: vi.fn(), onPageChange: page };
  const { rerender } = render(<LocaleProvider locale="ja-JP"><Pagination {...props}/></LocaleProvider>);
  expect((screen.getByRole("button", { name: "前のページ" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getByRole("spinbutton", { name: "ページ" }), { target: { value: "99" } });
  expect(page).toHaveBeenLastCalledWith(4);
  fireEvent.change(screen.getByRole("spinbutton", { name: "ページ" }), { target: { value: "0" } });
  expect(page).toHaveBeenLastCalledWith(1);
  fireEvent.click(screen.getByRole("button", { name: "次のページ" }));
  expect(next).toHaveBeenCalledOnce();
  rerender(<LocaleProvider locale="ja-JP"><Pagination {...props} disabled/></LocaleProvider>);
  fireEvent.click(screen.getByRole("button", { name: "次のページ" }));
  expect(next).toHaveBeenCalledOnce();
});
