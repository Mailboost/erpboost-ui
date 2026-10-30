import { fireEvent, render, screen } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { useState } from "react";
import { ResizeControl } from "../packages/ui/src/components/resize-control";
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
