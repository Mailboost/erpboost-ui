import { SidebarPanel } from "@/components/shell-parts";
import { useState } from "react";
import { SearchField } from "@/components/search-field";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { Toolbar } from "@/components/toolbar";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";

it("preserves heading levels and working actions in an empty state", () => {
  const reset = vi.fn();
  render(
    <EmptyState
      title="No matches"
      description="Change your filters"
      headingLevel={3}
      icon={<span>search</span>}
    >
      <Button onClick={reset}>Reset filters</Button>
    </EmptyState>,
  );
  expect(
    screen.getByRole("heading", { name: "No matches", level: 3 }),
  ).toBeTruthy();
  expect(screen.getByText("Change your filters")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
  expect(reset).toHaveBeenCalledOnce();
  expect(
    screen.getByText("search").closest('[aria-hidden="true"]'),
  ).toBeTruthy();
});

it("clears a controlled search and returns focus without stealing text cursor keys", () => {
  const changed = vi.fn();
  function SearchDemo() {
    const [value, setValue] = useState("orders");
    return (
      <Toolbar.Row aria-label="Search controls">
        <SearchField
          aria-label="Find orders"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            changed(event.target.value);
          }}
          clearLabel="Clear search"
          onClear={() => setValue("")}
        />
        <Button>Refresh search</Button>
      </Toolbar.Row>
    );
  }
  render(<SearchDemo />);
  const input = screen.getByRole("textbox", {
    name: "Find orders",
  }) as HTMLInputElement;
  input.focus();
  expect(fireEvent.keyDown(input, { key: "ArrowLeft" })).toBe(true);
  expect(document.activeElement).toBe(input);
  fireEvent.change(input, { target: { value: "customer" } });
  expect(changed).toHaveBeenLastCalledWith("customer");
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
  expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
});

it("keeps navigation readable while refusing pointer and keyboard activation until enabled", () => {
  const navigate = vi.fn();
  const { rerender } = render(
    <SidebarPanel.Button disabled onClick={navigate}>
      Orders
    </SidebarPanel.Button>,
  );
  const button = screen.getByRole("button", { name: "Orders" });
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(button.tabIndex).toBe(-1);
  fireEvent.click(button);
  fireEvent.keyDown(button, { key: "Enter" });
  expect(navigate).not.toHaveBeenCalled();
  rerender(
    <SidebarPanel.Button onClick={navigate}>Orders</SidebarPanel.Button>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Orders" }));
  expect(navigate).toHaveBeenCalledOnce();
});
