import { useState } from "react";
import { Table, Tabs } from "@mailboost/erpboost-ui";

export type FieldDiff = {
  key: string;
  label: string;
  before: string | null;
  after: string | null;
};

const changes: FieldDiff[] = [
  {
    key: "company",
    label: "Company name",
    before: "Tailor Supply Co.",
    after: "Tailor Supply Inc.",
  },
  {
    key: "address",
    label: "Address",
    before: "1-2-3 Marunouchi, Chiyoda-ku",
    after: "1-2-3 Marunouchi, Chiyoda-ku",
  },
  {
    key: "email",
    label: "Contact email",
    before: "ops@tailor-supply.example",
    after: "buyer-ops@tailor-supply.example",
  },
  { key: "taxId", label: "Tax ID", before: null, after: "JP-9876543210" },
];

export function FieldDiffTable({ rows: values }: { rows: FieldDiff[] }) {
  const [visibility, setVisibility] = useState("all");
  const rows = values.filter(
    (row) => visibility === "all" || row.before !== row.after,
  );
  return (
    <div className="field-diff-example" style={{ width: "100%" }}>
      <div style={{ marginBottom: 12 }}>
        <Tabs.Root
          value={visibility}
          onValueChange={(value) => setVisibility(String(value))}
        >
          <Tabs.List aria-label="Diff row visibility">
            <Tabs.Tab
              value="all"
              style={{ fontSize: 14, lineHeight: "20px", fontWeight: 500 }}
            >
              All
            </Tabs.Tab>
            <Tabs.Tab
              value="changed"
              style={{ fontSize: 14, lineHeight: "20px", fontWeight: 500 }}
            >
              Changed only
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.Root>
      </div>
      <Table.Root
        aria-label="Proposed field changes"
        style={{ fontSize: 14, lineHeight: "20px" }}
      >
        <Table.Header>
          <Table.Row>
            <Table.Head style={{ width: "33.333333%", fontWeight: 500 }}>
              Field
            </Table.Head>
            <Table.Head style={{ width: "33.333333%", fontWeight: 500 }}>
              Before
            </Table.Head>
            <Table.Head style={{ width: "33.333333%", fontWeight: 500 }}>
              After
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => {
            const changed = row.before !== row.after;
            return (
              <Table.Row key={row.key}>
                <Table.Cell
                  style={{ fontWeight: 500, color: "var(--muted-foreground)" }}
                >
                  {row.label}
                </Table.Cell>
                <Table.Cell
                  style={{
                    backgroundColor: changed
                      ? "color-mix(in oklab, var(--status-danger) 5%, transparent)"
                      : undefined,
                    color: changed
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {row.before === null ? (
                    <span
                      style={{
                        color:
                          "color-mix(in oklab, var(--muted-foreground) 60%, transparent)",
                      }}
                    >
                      —
                    </span>
                  ) : changed ? (
                    <s>{row.before}</s>
                  ) : (
                    row.before
                  )}
                </Table.Cell>
                <Table.Cell
                  style={{
                    backgroundColor: changed
                      ? "color-mix(in oklab, var(--status-completed) 10%, transparent)"
                      : undefined,
                    fontWeight: changed ? 500 : undefined,
                    color: changed
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {row.after === null ? (
                    <span
                      style={{
                        color:
                          "color-mix(in oklab, var(--muted-foreground) 60%, transparent)",
                      }}
                    >
                      —
                    </span>
                  ) : (
                    row.after
                  )}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </div>
  );
}

export function FieldDiffExample() {
  return <FieldDiffTable rows={changes} />;
}
