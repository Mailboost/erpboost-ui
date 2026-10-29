import { useState } from "react";
import {
  Button,
  Card,
  DetailTable,
  FormGrid,
  FormLoadingFields,
  Input,
  RecordPlaceholder,
  Table,
  TableLoadingRows,
} from "@mailboost/erpboost-ui";
const fields = [
  { key: "code", label: "Reference" },
  { key: "account", label: "Account", shape: "lookup" as const },
  { key: "note", label: "Notes", shape: "textarea" as const, fullWidth: true },
];
const columns = [
  { key: "code", header: "Reference", width: 240 },
  { key: "description", header: "Description", width: 260 },
  { key: "quantity", header: "Quantity", width: 120 },
  { key: "action", header: "Actions", width: 80 },
];
export function RecordLoadingDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
      <Button type="button" onClick={() => setLoading((value) => !value)}>
        {loading ? "Show loaded" : "Show loading"}
      </Button>
      <section
        aria-label="Record preview"
        aria-busy={loading}
        style={{ minWidth: 0 }}
      >
        <span role="status">
          {loading ? "Loading record…" : "Record ready"}
        </span>
        <Card.Root>
          <Card.Header
            title={loading ? <RecordPlaceholder shape="title" /> : "Record"}
          />
          <Card.Content>
            {loading ? (
              <FormLoadingFields fields={fields} />
            ) : (
              <FormGrid.Root>
                <label>
                  Reference
                  <Input defaultValue="0001" />
                </label>
                <label>
                  Account
                  <Input defaultValue="Sample account" />
                </label>
                <FormGrid.Full>
                  <label>
                    Notes
                    <Input defaultValue="Saved content" />
                  </label>
                </FormGrid.Full>
              </FormGrid.Root>
            )}
          </Card.Content>
        </Card.Root>
        <div style={{ marginTop: 20 }}>
          <DetailTable
            columns={columns}
            minWidth={700}
            scrollLabel="Record items"
            stickyActions
          >
            {loading ? (
              <TableLoadingRows
                columns={[
                  { key: "code", shape: "lookup" },
                  { key: "description", shape: "input" },
                  { key: "quantity", shape: "input" },
                  { key: "action", shape: "empty" },
                ]}
                rows={3}
              />
            ) : (
              <Table.Row>
                <Table.Cell>0001</Table.Cell>
                <Table.Cell>Sample item</Table.Cell>
                <Table.Cell>3</Table.Cell>
                <Table.Cell>
                  <Button type="button" size="sm">
                    Edit
                  </Button>
                </Table.Cell>
              </Table.Row>
            )}
          </DetailTable>
        </div>
      </section>
    </div>
  );
}
