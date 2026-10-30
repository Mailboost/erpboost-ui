import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { EditableGrid } from "../packages/ui/src/components/editable-grid";
import { Button } from "../packages/ui/src/components/button";
const columns = [
  { name: "tenant", label: "Tenant", type: "text", editable: false },
  { name: "code", label: "Code", type: "text", editable: true },
];
const defaults = {
  model: { name: "inventory", primaryKeys: ["tenant", "code"], columns },
  data: [
    { tenant: "a", code: "0002" },
    { tenant: "b", code: "0002" },
    { tenant: "a", code: "9007199254740993" },
  ],
  relations: [],
  pending: false,
  fetching: false,
  onStateChange: vi.fn(),
  onRefresh: vi.fn(),
  onOpen: vi.fn(),
  onSaveCell: vi.fn(),
  renderEditor: vi.fn(() => null),
};
it("retains composite row identity and exact string values while filtering and navigating cells", async () => {
  const open = vi.fn(),
    editor = vi.fn(
      (props: { row: Record<string, string | number | boolean | null> }) => {
        void props;
        return null;
      },
    );
  render(<EditableGrid {...defaults} onOpen={open} renderEditor={editor} />);
  const rows = screen.getAllByRole("row");
  expect(rows.length).toBe(4);
  fireEvent.click(screen.getByRole("checkbox", { name: "レコード 1を選択" }));
  expect(screen.getByText("1 件選択中")).toBeTruthy();
  expect(
    screen
      .getByRole("checkbox", { name: "レコード 2を選択" })
      .getAttribute("aria-checked"),
  ).toBe("false");
  fireEvent.click(screen.getByRole("button", { name: "選択を解除" }));
  fireEvent.change(
    screen.getByRole("textbox", { name: "表示中のデータを検索" }),
    { target: { value: "9007199254740993" } },
  );
  expect(screen.getAllByRole("row").length).toBe(2);
  const cell = screen.getByRole("gridcell", { name: "code: 9007199254740993" });
  fireEvent.keyDown(cell, { key: "F2" });
  await waitFor(() => expect(editor).toHaveBeenCalled());
  expect(editor.mock.calls.at(-1)?.[0].row.code).toBe("9007199254740993");
  expect(defaults.onSaveCell).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "レコード 1の詳細を表示" }),
  );
  expect(open.mock.calls[0][0]).toEqual({
    tenant: "a",
    code: "9007199254740993",
  });
});
it("delegates column changes and keeps unavailable schema actions disabled", () => {
  const onEdit = vi.fn();
  render(<EditableGrid {...defaults} onEditColumn={onEdit} />);
  expect(
    (screen.getByRole("button", { name: "カラムを追加" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  const resize = screen.getByRole("separator", { name: "codeのカラム幅" });
  fireEvent.keyDown(resize, { key: "ArrowRight" });
  expect(resize.getAttribute("aria-valuenow")).toBe("266");
});
