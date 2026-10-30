import { useCallback, useState } from "react";
import { EditableGrid, type GridColumn } from "@mailboost/erpboost-ui";
import { CellEditor } from "@mailboost/erpboost-ui";
import { Button, Input } from "@mailboost/erpboost-ui";
const columns: GridColumn[] = [
  { name: "id", label: "ID", type: "text", editable: false },
  { name: "name", label: "Name", type: "text", editable: true },
];
function Edit({
  value,
  onSave,
  onClose,
  anchor,
}: {
  value: string;
  onSave: (value: string) => Promise<void>;
  onClose: () => void;
  anchor: DOMRect;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <CellEditor
      title="Name"
      closeLabel="Close editor"
      anchor={anchor}
      container={document.body}
      onClose={onClose}
      actions={
        <Button onClick={() => void onSave(draft).then(onClose)}>Save</Button>
      }
    >
      <Input
        aria-label="Cell value"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
    </CellEditor>
  );
}
export function EditableGridDemo() {
  const [rows, setRows] = useState([
    { id: "0001", name: "Precision bearing" },
    { id: "0002", name: "Hex bolt" },
  ]);
  const state = useCallback(() => {}, []);
  return (
    <div className="astw:h-105 astw:flex">
      <EditableGrid
        model={{ name: "inventory", primaryKeys: ["id"], columns }}
        data={rows}
        relations={[]}
        pending={false}
        fetching={false}
        onStateChange={state}
        onRefresh={() => {}}
        onOpen={() => {}}
        onSaveCell={async (row, column, value) =>
          setRows((rows) =>
            rows.map((item) =>
              item.id === row.id
                ? { ...item, [column.name]: String(value) }
                : item,
            ),
          )
        }
        renderEditor={({ row, column, anchor, onSave, onClose }) => (
          <Edit
            value={String(row[column.name] ?? "")}
            anchor={anchor}
            onSave={onSave}
            onClose={onClose}
          />
        )}
      />
    </div>
  );
}
