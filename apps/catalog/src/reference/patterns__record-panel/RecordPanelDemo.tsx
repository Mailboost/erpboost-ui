import { useState } from "react";
import { RecordEditor, Button, Input } from "@mailboost/erpboost-ui";
export function RecordPanelDemo() {
  const [open, setOpen] = useState(false),
    [value, setValue] = useState("");
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open record editor</Button>
      {open && (
        <RecordEditor
          title="Inventory record"
          isNew
          busy={false}
          dirty={!!value}
          onClose={() => setOpen(false)}
          onSave={() => setOpen(false)}
        >
          <Input
            aria-label="Product name"
            placeholder="Product name"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </RecordEditor>
      )}
    </>
  );
}
