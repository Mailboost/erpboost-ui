import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { DatabaseWorkspace } from "../packages/ui/src/components/database-workspace";

const defaults = {
  tables: [
    { name: "sale_order", label: "受注" },
    { name: "res_partner", label: "得意先" },
  ],
  selectedTable: "sale_order",
  openedTables: ["sale_order", "res_partner"],
  view: "records" as const,
  search: "",
  sidebarOpen: true,
  canCreate: true,
  onSearchChange: vi.fn(),
  onSidebarOpenChange: vi.fn(),
  onSelectTable: vi.fn(),
  onCloseTable: vi.fn(),
  onCloseDiagram: vi.fn(),
  onCreateTable: vi.fn(),
  children: <div>Typed grid supplied by app</div>,
};
it("works without AppShell and delegates navigation, search and table creation", async () => {
  const handlers = {
    onSearchChange: vi.fn(),
    onSidebarOpenChange: vi.fn(),
    onSelectTable: vi.fn(),
    onCloseTable: vi.fn(),
    onCreateTable: vi.fn(),
  };
  render(<DatabaseWorkspace {...defaults} {...handlers} />);
  expect(screen.getByText("Typed grid supplied by app")).toBeTruthy();
  fireEvent.change(screen.getByRole("textbox", { name: "テーブルを検索" }), {
    target: { value: "得意先" },
  });
  expect(handlers.onSearchChange).toHaveBeenCalledWith("得意先");
  fireEvent.click(screen.getByRole("button", { name: "res_partner" }));
  expect(handlers.onSelectTable).toHaveBeenCalledWith("res_partner");
  fireEvent.click(
    screen.getByRole("button", { name: "sale_orderのタブを閉じる" }),
  );
  expect(handlers.onCloseTable).toHaveBeenCalledWith("sale_order");
  fireEvent.click(screen.getByRole("button", { name: "テーブル一覧を閉じる" }));
  expect(handlers.onSidebarOpenChange).toHaveBeenCalledWith(false);
  fireEvent.click(screen.getByRole("button", { name: "テーブルを追加" }));
  expect(handlers.onCreateTable).toHaveBeenCalledOnce();
});
it("filters names and labels while retaining the open table tabs", () => {
  render(<DatabaseWorkspace {...defaults} search="得意先" />);
  expect(screen.queryByRole("button", { name: "sale_order" })).toBeNull();
  expect(screen.getByRole("button", { name: "res_partner" })).toBeTruthy();
  expect(screen.getByRole("tab", { name: "sale_order" })).toBeTruthy();
});
it("disables both create controls for a viewer and exposes the diagram tab", async () => {
  const close = vi.fn(),
    create = vi.fn();
  render(
    <DatabaseWorkspace
      {...defaults}
      canCreate={false}
      view="erd"
      onCloseDiagram={close}
      onCreateTable={create}
    />,
  );
  for (const name of ["テーブルを追加", "新しいテーブルを追加"])
    expect(
      (screen.getByRole("button", { name }) as HTMLButtonElement).disabled,
    ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "新しいテーブルを追加" }));
  expect(create).not.toHaveBeenCalled();
  await waitFor(() =>
    expect(
      screen.getByRole("tab", { name: "ER図" }).getAttribute("aria-selected"),
    ).toBe("true"),
  );
  fireEvent.click(screen.getByRole("button", { name: "ER図を閉じる" }));
  expect(close).toHaveBeenCalledOnce();
});
