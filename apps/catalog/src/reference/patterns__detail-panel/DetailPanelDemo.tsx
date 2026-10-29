import { useState } from "react";
import { DetailPanel } from "@mailboost/erpboost-ui";
import { RecordActions } from "@mailboost/erpboost-ui";
import { Field } from "@mailboost/erpboost-ui";
import { Button } from "@mailboost/erpboost-ui";
import { Badge } from "@mailboost/erpboost-ui";
export function DetailPanelDemo() {
  const [open, setOpen] = useState(false),
    [tab, setTab] = useState("details"),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState("No save");
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open record</Button>
      <output aria-label="Detail result">{result}</output>
      {open && (
        <DetailPanel.Root
          title="Record with a long title that wraps inside the available panel width"
          context="Records"
          badge={<Badge>Draft</Badge>}
          width={680}
          tabListLabel="Record sections"
          value={tab}
          onValueChange={setTab}
          tabs={[
            { value: "details", label: "Details" },
            { value: "locked", label: "Unavailable", disabled: true },
            { value: "history", label: "History" },
          ]}
          closeDisabled={busy}
          onClose={() => setOpen(false)}
        >
          <DetailPanel.Body>
            {tab === "history" ? (
              <p>No history yet</p>
            ) : (
              <>
                <Field.Root>
                  <Field.Label>Reference</Field.Label>
                  <Field.Control defaultValue="0001" />
                </Field.Root>
                <Button type="button" onClick={() => setBusy(!busy)}>
                  {busy ? "Release busy state" : "Block closing"}
                </Button>
                {Array.from({ length: 30 }, (_, i) => (
                  <p key={i}>Record content {i + 1}</p>
                ))}
              </>
            )}
          </DetailPanel.Body>
          <RecordActions status={busy ? "Working" : "Draft"}>
            <Button
              type="button"
              disabled={busy}
              onClick={() => setResult("Saved by caller")}
            >
              Save record
            </Button>
          </RecordActions>
        </DetailPanel.Root>
      )}
    </>
  );
}
