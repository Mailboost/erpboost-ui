import { useState } from "react";
import {
  ResultPanel,
  LogViewer,
  Field,
  Select,
  Badge,
  Button,  Table } from "@mailboost/erpboost-ui";
export function ResultPanelDemo() {
  const [tab, setTab] = useState("data"),
    [output, setOutput] = useState("customers"),
    [error, setError] = useState(false),
    [docked, setDocked] = useState(false);
  const outputs = ["customers", "a_very_long_output_table_identifier"],
    rows = [{ id: "0001", amount: "9007199254740993" }];
  return (
    <div className="astw:p-4 astw:max-w-240">
      <Button onClick={() => setError(!error)}>Toggle result error</Button>
      <output aria-label="Dock state">{docked ? "Docked" : "Below"}</output>
      <ResultPanel.Root
        className="astw:h-80"
        aria-label="Execution results"
        tabs={[
          { value: "graph", label: "Graph", graph: true },
          { value: "data", label: "Data" },
          { value: "logs", label: "Logs" },
          { value: "runs", label: "Run details" },
          { value: "unavailable", label: "Unavailable", disabled: true },
        ]}
        value={tab}
        onValueChange={setTab}
        tabListLabel="Result views"
        actions={
          <>
            <Button type="button" onClick={() => setDocked(!docked)}>
              Dock graph
            </Button>
            <Badge>Success · 1 row · 0.12s</Badge>
          </>
        }
      >
        <ResultPanel.Body>
          {error && (
            <ResultPanel.Message>
              <ResultPanel.ErrorText>
                {Array.from(
                  { length: 10 },
                  (_, i) => `Line ${i + 1}: <img src=x> exact error text`,
                ).join("\n")}
              </ResultPanel.ErrorText>
            </ResultPanel.Message>
          )}
          {tab === "data" && (
            <>
              <ResultPanel.Selection>
                <Field.Root>
                  <Field.Label>Output table</Field.Label>
                  <Select.Parts.Root
                    value={output}
                    onValueChange={(value) => {
                      if (value) setOutput(value);
                    }}
                  >
                    <Select.Parts.Trigger>
                      <Select.Parts.Value />
                    </Select.Parts.Trigger>
                    <Select.Parts.Content>
                      {outputs.map((value) => (
                        <Select.Parts.Item key={value} value={value}>
                          {value}
                        </Select.Parts.Item>
                      ))}
                    </Select.Parts.Content>
                  </Select.Parts.Root>
                </Field.Root>
                <Badge>Saved</Badge>
              </ResultPanel.Selection>
              <Table.Root aria-label="Preview rows" containerClassName="astw:max-w-full astw:overscroll-x-contain" className="astw:[&_td]:tabular-nums"><Table.Header><Table.Row><Table.Head scope="col">#</Table.Head><Table.Head scope="col">ID</Table.Head><Table.Head scope="col">Amount</Table.Head></Table.Row></Table.Header><Table.Body>{rows.map((row,index)=><Table.Row key={index}><Table.Cell>{index+1}</Table.Cell><Table.Cell>{row.id}</Table.Cell><Table.Cell>{row.amount}</Table.Cell></Table.Row>)}</Table.Body></Table.Root>
              <ResultPanel.Message variant="warning" role="note">
                Only a preview is shown.
              </ResultPanel.Message>
            </>
          )}
          {tab === "logs" && (
            <LogViewer
              aria-label="Execution log"
              text="<script>plain text only</script>\nSecond line"
            />
          )}
          {tab === "runs" && (
            <ResultPanel.Details>
              <ResultPanel.Item label="Run ID">0001</ResultPanel.Item>
              <ResultPanel.Item label="Fingerprint">
                0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
              </ResultPanel.Item>
            </ResultPanel.Details>
          )}
          {tab === "graph" && (
            <div
              aria-label="Graph placeholder"
              className="astw:flex-1 astw:min-h-15"
            >
              Application-owned graph
            </div>
          )}
        </ResultPanel.Body>
      </ResultPanel.Root>
    </div>
  );
}
