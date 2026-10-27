import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { DataTable, useDataTable, type Column } from "@mailboost/erpboost-ui";
import { AppShellInternal } from "../packages/ui/src/components/appshell/appshell";

const columns: Column<{ id: string; name: string }>[] = [
  { id: "name", label: "Name", type: "text" },
];
const modules: [] = [];
const initialEntries = ["/"];

function Example({
  enabled,
  selectable,
}: {
  enabled?: boolean;
  selectable?: boolean;
}) {
  const table = useDataTable({
    columns,
    data: { rows: [{ id: "supplier-1", name: "Aoba" }] },
    rowSelection: selectable ? {} : undefined,
  });
  return (
    <DataTable.Root value={table} contextMenu={enabled}>
      <DataTable.Table />
    </DataTable.Root>
  );
}

const app = (enabled?: boolean, selectable?: boolean) => (
  <AppShellInternal
    title="Test"
    modules={modules}
    locale="en"
    memory
    initialEntries={initialEntries}
  >
    <Example enabled={enabled} selectable={selectable} />
  </AppShellInternal>
);

it("leaves native header and cell context-menu events unhandled by default", async () => {
  render(app());
  const header = await screen.findByRole("columnheader", { name: "Name" });
  const cell = screen.getByRole("cell", { name: "Aoba" });
  for (const target of [header, cell]) {
    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(target, event);
    expect(event.defaultPrevented).toBe(false);
    expect(screen.queryByRole("menu")).toBeNull();
  }
  expect(cell.style.getPropertyValue("-webkit-touch-callout")).toBe("");
});

it("retains cell copying when built-in menus are explicitly enabled", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  try {
    render(app(true));
    fireEvent.contextMenu(await screen.findByRole("cell", { name: "Aoba" }), {
      clientX: 50,
      clientY: 50,
    });
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Copy value" }),
    );
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("Aoba"));
  } finally {
    if (descriptor) Object.defineProperty(navigator, "clipboard", descriptor);
    else Reflect.deleteProperty(navigator, "clipboard");
  }
});

it("retains explicit column pinning through the header menu", async () => {
  render(app(true));
  const header = await screen.findByRole("columnheader", { name: "Name" });
  fireEvent.contextMenu(
    header.querySelector(
      '[data-slot="data-table-header-context-menu-trigger"]',
    )!,
    { clientX: 50, clientY: 50 },
  );
  const pin = await screen.findByRole("menuitem", { name: "Pin column" });
  pin.focus();
  fireEvent.keyDown(pin, { key: "ArrowRight" });
  fireEvent.click(await screen.findByRole("menuitem", { name: "Pin to left" }));
  await waitFor(() => expect(header.style.left).toBe("0px"));
});

it("discards an open cell menu when disabled and does not reopen stale state", async () => {
  const view = render(app(true));
  fireEvent.contextMenu(await screen.findByRole("cell", { name: "Aoba" }), {
    clientX: 50,
    clientY: 50,
  });
  await screen.findByRole("menuitem", { name: "Copy value" });
  view.rerender(app(false));
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  view.rerender(app(true));
  expect(screen.queryByRole("menu")).toBeNull();
  expect(await screen.findByRole("cell", { name: "Aoba" })).toBeTruthy();
});

it("pins the selection column only alongside an explicitly pinned data column", async () => {
  render(app(true, true));
  const checkbox = await screen.findByRole("checkbox", {
    name: "Select all rows",
  });
  const selectionHeader = checkbox.closest("th")!;
  expect(selectionHeader.style.position).toBe("");
  const header = screen.getByRole("columnheader", { name: "Name" });
  fireEvent.contextMenu(
    header.querySelector(
      '[data-slot="data-table-header-context-menu-trigger"]',
    )!,
    { clientX: 50, clientY: 50 },
  );
  const pin = await screen.findByRole("menuitem", { name: "Pin column" });
  pin.focus();
  fireEvent.keyDown(pin, { key: "ArrowRight" });
  fireEvent.click(await screen.findByRole("menuitem", { name: "Pin to left" }));
  await waitFor(() => expect(selectionHeader.style.position).toBe("sticky"));
  expect(header.style.position).toBe("sticky");
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  fireEvent.contextMenu(
    header.querySelector(
      '[data-slot="data-table-header-context-menu-trigger"]',
    )!,
    { clientX: 50, clientY: 50 },
  );
  const pinAgain = await screen.findByRole("menuitem", { name: "Pin column" });
  pinAgain.focus();
  fireEvent.keyDown(pinAgain, { key: "ArrowRight" });
  fireEvent.click(await screen.findByRole("menuitem", { name: "Unpin" }));
  await waitFor(() => expect(selectionHeader.style.position).toBe(""));
  expect(header.style.position).toBe("");
});
