import { useState } from "react";
import { InlineCreate } from "@mailboost/erpboost-ui";
export function InlineCreateDemo() {
  const [value, setValue] = useState(""),
    [error, setError] = useState(""),
    [result, setResult] = useState("No resource created");
  return (
    <div>
      <InlineCreate
        label="New resource name"
        value={value}
        onValueChange={(next) => {
          setValue(next);
          setError("");
        }}
        placeholder="example.py"
        maxLength={51}
        canSubmit={!!value.trim()}
        submitLabel="Create"
        cancelLabel="Cancel creation"
        error={error}
        onSubmit={() => {
          if (value === "duplicate") {
            setError("That name already exists");
            return;
          }
          setResult(`Created: ${value}`);
        }}
        onCancel={() => setResult("Cancelled")}
      />
      <p role="status">{result}</p>
    </div>
  );
}
