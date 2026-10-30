import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";
import { DetailPanel } from "../packages/ui/src/components/detail-panel";
import {PropertyRow, PropertySection} from "../packages/ui/src/components/property-layout";
import { Field } from "../packages/ui/src/components/field";
const tabs = [
  { value: "details", label: "Details" },
  { value: "disabled", label: "Disabled", disabled: true },
  { value: "history", label: "History" },
];
function Fixture({
  closeDisabled = false,
  onClose = () => {},
}: {
  closeDisabled?: boolean;
  onClose?: () => void;
}) {
  const [value, setValue] = useState("details");
  return (
    <DetailPanel.Root
      title="Record"
      context="Resources"
      tabs={tabs}
      value={value}
      onValueChange={setValue}
      tabListLabel="Sections"
      closeDisabled={closeDisabled}
      onClose={onClose}
    >
      <DetailPanel.Body aria-busy={value === "history"}>
        {value === "history" ? (
          "Loading history"
        ) : (
          <input aria-label="Reference" defaultValue="0001" />
        )}
      </DetailPanel.Body>
    </DetailPanel.Root>
  );
}
it("keeps the active tab and panel associated across content/loading changes", () => {
  render(<Fixture />);
  const panel = screen.getByRole("tabpanel");
  const details = screen.getByRole("tab", { name: "Details" });
  expect(panel.getAttribute("aria-labelledby")).toBe(details.id);
  expect(details.getAttribute("aria-controls")).toBe(panel.id);
  expect(panel.tabIndex).toBe(0);
  fireEvent.click(screen.getByRole("tab", { name: "History" }));
  expect(screen.getByRole("tabpanel").id).toBe(panel.id);
  expect(panel.getAttribute("aria-labelledby")).toBe(
    screen.getByRole("tab", { name: "History" }).id,
  );
  expect(panel.getAttribute("aria-busy")).toBe("true");
  expect(panel.textContent).toBe("Loading history");
});
it("blocks disabled tabs while retaining the active content", () => {
  render(<Fixture />);
  fireEvent.click(screen.getByRole("tab", { name: "Disabled" }));
  expect(screen.getByRole("textbox", { name: "Reference" })).toBeTruthy();
  expect(
    screen.getByRole("tab", { name: "Details" }).getAttribute("aria-selected"),
  ).toBe("true");
});
it("generates distinct tab/panel identifiers for successive records", () => {
  const first = render(<Fixture />);
  const id = screen.getByRole("tabpanel").id;
  first.unmount();
  render(<Fixture />);
  expect(screen.getByRole("tabpanel").id).not.toBe(id);
});
it("delegates Escape and retains the panel while closing is blocked", async () => {
  const close = vi.fn();
  const view = render(<Fixture closeDisabled onClose={close} />);
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Reference" }),
    ),
  );
  fireEvent.keyDown(document.activeElement!, { key: "Escape", code: "Escape" });
  expect(close).not.toHaveBeenCalled();
  view.rerender(<Fixture onClose={close} />);
  fireEvent.keyDown(document.activeElement!, { key: "Escape", code: "Escape" });
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
});
it("preserves Field label, description and exact string values through layout slots", () => {
  render(
    <Field.Root>
      <PropertyRow
        label={<Field.Label>Customer reference</Field.Label>}
        description={<Field.Description>customers.id</Field.Description>}
      >
        <Field.Control defaultValue="9007199254740993" />
      </PropertyRow>
    </Field.Root>,
  );
  const input = screen.getByRole("textbox", {
    name: "Customer reference",
  }) as HTMLInputElement;
  expect(input.value).toBe("9007199254740993");
  const description = document.getElementById(
    input.getAttribute("aria-describedby")!,
  );
  expect(description?.textContent).toBe("customers.id");
  fireEvent.click(screen.getByText("Customer reference"));
  expect(screen.getByLabelText("Customer reference")).toBe(input);
});
it("omits spacing for empty description arrays and keeps optional section semantic headings", () => {
  const { container } = render(
    <>
      <PropertyRow label="ID" description={[]}>
        0001
      </PropertyRow>
      <PropertySection title="Optional" description="May be omitted" />
    </>,
  );
  expect(container.querySelector(".erpui-property-row-description")).toBeNull();
  expect(
    screen.getByRole("heading", { name: "Optional", level: 3 }),
  ).toBeTruthy();
  expect(screen.getByText("0001")).toBeTruthy();
});
