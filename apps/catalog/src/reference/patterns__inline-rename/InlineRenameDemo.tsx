import { useState } from "react";
import { InlineRename, Button } from "@mailboost/erpboost-ui";
export function InlineRenameDemo() {
  const [editing, setEditing] = useState(false),
    [value, setValue] = useState("Original name"),
    [result, setResult] = useState("No edit"),
    [submits, setSubmits] = useState(0);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmits(submits + 1);
      }}
    >
      {editing ? (
        <InlineRename
          aria-label="Resource name"
          value={value}
          onValueChange={setValue}
          onCommit={() => {
            setEditing(false);
            setResult(`Committed: ${value}`);
          }}
          onCancel={(original) => {
            setValue(original);
            setEditing(false);
            setResult(`Cancelled: ${original}`);
          }}
        />
      ) : (
        <Button type="button" onClick={() => setEditing(true)}>
          Rename resource
        </Button>
      )}
      <Button type="button">Other control</Button>
      <output aria-label="Rename result">{result}</output>
      <output aria-label="Parent submissions">{submits}</output>
    </form>
  );
}
