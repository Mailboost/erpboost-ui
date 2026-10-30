import { useState } from "react";
import { DataPreview, Button, EmptyState, Alert } from "@mailboost/erpboost-ui";
const sample = [
  {
    id: "0001",
    amount: "9007199254740993",
    details: { exact: "value" },
    missing: null,
  },
];
export function DataPreviewDemo() {
  const [rows, setRows] = useState(sample);
  return (
    <div className="astw:w-full astw:min-w-0">
      <Button
        variant="outline"
        onClick={() => setRows(rows.length ? [] : sample)}
      >
        {rows.length ? "Empty data" : "Restore data"}
      </Button>
      <DataPreview
        label="Preview results"
        rows={rows}
        rowKey={(row) => row.id}
        columns={Object.keys(sample[0]).map((name) => ({
          id: name,
          header: name,
          cell: (row: (typeof sample)[number]) => {
            const value = row[name as keyof typeof row];
            return value === null ? (
              <i>NULL</i>
            ) : typeof value === "object" ? (
              JSON.stringify(value)
            ) : (
              value
            );
          },
        }))}
        empty={<EmptyState title="No rows" />}
        notice={
          <Alert.Root variant="warning" role="note">
            <Alert.Description>
              First row of 100 results. The consumer supplies this limit.
            </Alert.Description>
          </Alert.Root>
        }
      />
    </div>
  );
}
