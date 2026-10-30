import { fireEvent, render, screen } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { useState } from "react";
import { ResizeControl } from "../packages/ui/src/components/resize-control";
import { InlineCreate } from "../packages/ui/src/components/inline-create";
it("resizes the end panel using its axis and clamps keyboard boundaries", () => {
  function Demo() {
    const [v, set] = useState(150);
    return (
      <ResizeControl
        orientation="horizontal"
        min={100}
        max={180}
        value={v}
        onValueChange={set}
        aria-label="Height"
      />
    );
  }
  render(<Demo />);
  const bar = screen.getByRole("separator");
  fireEvent.keyDown(bar, { key: "ArrowLeft" });
  expect(bar.getAttribute("aria-valuenow")).toBe("150");
  fireEvent.keyDown(bar, { key: "ArrowUp" });
  expect(bar.getAttribute("aria-valuenow")).toBe("170");
  fireEvent.keyDown(bar, { key: "ArrowUp" });
  expect(bar.getAttribute("aria-valuenow")).toBe("180");
  fireEvent.keyDown(bar, { key: "Home" });
  expect(bar.getAttribute("aria-valuenow")).toBe("100");
  fireEvent.keyDown(bar, { key: "ArrowDown" });
  expect(bar.getAttribute("aria-valuenow")).toBe("100");
  fireEvent.keyDown(bar, { key: "End" });
  expect(bar.getAttribute("aria-valuenow")).toBe("180");
});
it("supports the opposite side and blocks disabled resizing", () => {
  const change = vi.fn();
  const view = render(
    <ResizeControl
      orientation="vertical"
      value={150}
      min={100}
      max={200}
      panelSide="start"
      onValueChange={change}
    />,
  );
  fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });
  expect(change).toHaveBeenLastCalledWith(170);
  view.rerender(
    <ResizeControl
      orientation="vertical"
      value={150}
      min={100}
      max={200}
      disabled
      onValueChange={change}
    />,
  );
  change.mockClear();
  fireEvent.keyDown(screen.getByRole("separator"), { key: "End" });
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole("separator").tabIndex).toBe(-1);
});
it("ignores IME Enter and cancels without bubbling to a containing editor", () => {
  const submit = vi.fn(),
    cancel = vi.fn(),
    outer = vi.fn();
  render(
    <div onKeyDown={outer}>
      <InlineCreate
        label="Name"
        value="  Exact.py  "
        onValueChange={() => {}}
        onSubmit={submit}
        onCancel={cancel}
        submitLabel="Create"
        cancelLabel="Cancel"
      />
    </div>,
  );
  const input = screen.getByRole("textbox");
  fireEvent.keyDown(input, { key: "Enter", isComposing: true });
  expect(submit).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
  expect(submit).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: "Enter" });
  expect(submit).toHaveBeenCalledOnce();
  expect((input as HTMLInputElement).value).toBe("  Exact.py  ");
  outer.mockClear();
  fireEvent.keyDown(input, { key: "Escape" });
  expect(cancel).toHaveBeenCalledOnce();
  expect(outer).not.toHaveBeenCalled();
});
it("associates consumer errors with the input and blocks unavailable submits", () => {
  const submit = vi.fn();
  render(
    <InlineCreate
      label="Name"
      value="duplicate"
      onValueChange={() => {}}
      onSubmit={submit}
      onCancel={() => {}}
      submitLabel="Create"
      cancelLabel="Cancel"
      canSubmit={false}
      error="Consumer validation"
    />,
  );
  const input = screen.getByRole("textbox");
  expect(input.getAttribute("aria-describedby")).toBe(
    screen.getByRole("alert").id,
  );
  expect(input.getAttribute("aria-invalid")).toBe("true");
  fireEvent.keyDown(input, { key: "Enter" });
  fireEvent.click(screen.getByRole("button", { name: "Create" }));
  expect(submit).not.toHaveBeenCalled();
});
