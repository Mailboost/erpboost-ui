import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { Toolbar } from "@/components/toolbar";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Layout } from "@/components/layout";
import { EmptyState } from "@/components/empty-state";

it("moves between toolbar actions without stealing text-input navigation", () => {
  render(
    <Toolbar.Row aria-label="Order actions">
      <Button>Refresh</Button>
      <Button disabled>Delete</Button>
      <Input aria-label="Search" />
      <Button>Add</Button>
    </Toolbar.Row>,
  );
  const refresh = screen.getByRole("button", { name: "Refresh" });
  const search = screen.getByRole("textbox", { name: "Search" });
  refresh.focus();
  fireEvent.keyDown(refresh, { key: "ArrowRight" });
  expect(document.activeElement).toBe(search);
  expect(fireEvent.keyDown(search, { key: "ArrowLeft" })).toBe(true);
  expect(document.activeElement).toBe(search);
  screen.getByRole("button", { name: "Add" }).focus();
  fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
  expect(document.activeElement).toBe(refresh);
});

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

it("embeds the existing page header with its title, actions and page class", () => {
  render(
    <Layout.Header
      className="orders-heading"
      title="Orders"
      actions={[<Button key="create">Create</Button>]}
    />,
  );
  expect(
    screen
      .getByRole("heading", { name: "Orders", level: 1 })
      .closest("header")
      ?.classList.contains("orders-heading"),
  ).toBe(true);
  expect(screen.getByRole("button", { name: "Create" })).toBeTruthy();
});
