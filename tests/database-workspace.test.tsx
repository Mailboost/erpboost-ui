import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AppShellInternal } from "../packages/ui/src/components/appshell/appshell";
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
  fireEvent.change(screen.getByRole("textbox", { name: "Search tables" }), {
    target: { value: "得意先" },
  });
  expect(handlers.onSearchChange).toHaveBeenCalledWith("得意先");
  fireEvent.click(screen.getByRole("button", { name: "res_partner" }));
  expect(handlers.onSelectTable).toHaveBeenCalledWith("res_partner");
  fireEvent.click(screen.getByRole("button", { name: "Close sale_order tab" }));
  expect(handlers.onCloseTable).toHaveBeenCalledWith("sale_order");
  fireEvent.click(screen.getByRole("button", { name: "Close table list" }));
  expect(handlers.onSidebarOpenChange).toHaveBeenCalledWith(false);
  fireEvent.click(screen.getByRole("button", { name: "Add table" }));
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
  for (const name of ["Add table", "Add new table"])
    expect(
      (screen.getByRole("button", { name }) as HTMLButtonElement).disabled,
    ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Add new table" }));
  expect(create).not.toHaveBeenCalled();
  await waitFor(() =>
    expect(
      screen
        .getByRole("tab", { name: "ER diagram" })
        .getAttribute("aria-selected"),
    ).toBe("true"),
  );
  fireEvent.click(screen.getByRole("button", { name: "Close ER diagram" }));
  expect(close).toHaveBeenCalledOnce();
});

it("selects a table named erd and keeps it distinct from the diagram", () => {
  const select = vi.fn();
  const tables = [...defaults.tables, { name: "erd" }];
  const openedTables = [...defaults.openedTables, "erd"];
  const { rerender } = render(
    <DatabaseWorkspace
      {...defaults}
      tables={tables}
      openedTables={openedTables}
      onSelectTable={select}
    />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "erd" }));
  expect(select).toHaveBeenLastCalledWith("erd");
  rerender(
    <DatabaseWorkspace
      {...defaults}
      tables={tables}
      openedTables={openedTables}
      selectedTable="erd"
      view="erd"
      onSelectTable={select}
    />,
  );
  expect(screen.getAllByRole("tab", { selected: true })).toEqual([
    screen.getByRole("tab", { name: "ER diagram" }),
  ]);
  expect(
    screen.getByRole("tab", { name: "erd" }).getAttribute("aria-selected"),
  ).toBe("false");
  fireEvent.click(screen.getByRole("tab", { name: "res_partner" }));
  expect(select).toHaveBeenLastCalledWith("res_partner");
  fireEvent.click(screen.getByRole("tab", { name: "erd" }));
  expect(select).toHaveBeenLastCalledWith("erd");
  rerender(
    <DatabaseWorkspace
      {...defaults}
      tables={tables}
      openedTables={openedTables}
      selectedTable="erd"
      onSelectTable={select}
    />,
  );
  expect(screen.getAllByRole("tab", { selected: true })).toEqual([
    screen.getByRole("tab", { name: "erd" }),
  ]);
});

it.each([
  {
    locale: "en",
    title: "Database",
    search: "Search tables",
    empty: "No matching tables",
    close: "Close sale_order tab",
    diagram: "ER diagram",
    add: "Add table",
    sidebar: "Close table list",
    workspace: "Database workspace",
  },
  {
    locale: "ja",
    title: "データベース",
    search: "テーブルを検索",
    empty: "該当するテーブルがありません",
    close: "sale_orderのタブを閉じる",
    diagram: "ER図",
    add: "テーブルを追加",
    sidebar: "テーブル一覧を閉じる",
    workspace: "データベース作業領域",
  },
])(
  "uses existing AppShell localization for visible and accessible labels in $locale",
  async ({
    locale,
    title,
    search,
    empty,
    close,
    diagram,
    add,
    sidebar,
    workspace,
  }) => {
    render(
      <AppShellInternal
        title="Test"
        modules={[]}
        locale={locale}
        memory
        initialEntries={["/"]}
      >
        <DatabaseWorkspace {...defaults} search="no-such-table" view="erd" />
      </AppShellInternal>,
    );
    expect(await screen.findByRole("heading", { name: title })).toBeTruthy();
    expect(
      screen.getByRole("textbox", { name: search }).getAttribute("placeholder"),
    ).toBe(search);
    expect(screen.getByRole("status").textContent).toBe(empty);
    expect(screen.getByRole("button", { name: close })).toBeTruthy();
    expect(screen.getByRole("tab", { name: diagram })).toBeTruthy();
    expect(screen.getByRole("button", { name: add })).toBeTruthy();
    expect(screen.getByRole("button", { name: sidebar })).toBeTruthy();
    expect(screen.getByRole("region", { name: workspace })).toBeTruthy();
  },
);

it("preserves an app-supplied title", () => {
  render(<DatabaseWorkspace {...defaults} title="Inventory" />);
  expect(screen.getByRole("heading", { name: "Inventory" })).toBeTruthy();
});
