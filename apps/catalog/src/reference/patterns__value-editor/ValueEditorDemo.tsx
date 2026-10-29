import { useState } from "react";
import { ValueEditor, Button, type EditorValue } from "@mailboost/erpboost-ui";
export function ValueEditorDemo() {
  const [anchor, setAnchor] = useState<DOMRect | null>(null),
    [value, setValue] = useState<EditorValue>("9007199254740993");
  return (
    <>
      <Button
        onClick={(event) =>
          setAnchor(event.currentTarget.getBoundingClientRect())
        }
      >
        Edit value
      </Button>
      <p role="status">Saved: {String(value)}</p>
      {anchor && (
        <ValueEditor
          name="amount"
          description="Exact string value"
          initialValue={value}
          nullable
          anchor={anchor}
          container={document.body}
          onClose={() => setAnchor(null)}
          onSave={async (next) => {
            if (next === "invalid") throw new Error("Invalid value");
            setValue(next);
          }}
        />
      )}
    </>
  );
}
