// Reference example: https://ui.tailor.tech/patterns/field-diff-table
import { useMemo, useState } from "react";
import { Table, Tabs } from "@mailboost/erpboost-ui";

export type FieldDiff = {
  key: string;
  label: string;
  before: string | null;
  after: string | null;
};

type Props = {
  rows: FieldDiff[];
};

type DiffRowFilter = "all" | "changed";

const DIFF_FILTER_OPTIONS: { value: DiffRowFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "changed", label: "Changed only" },
];

export const FieldDiffTable = ({ rows }: Props) => {
  const [filter, setFilter] = useState<DiffRowFilter>("all");

  const visibleRows = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((row) => row.before !== row.after);
  }, [rows, filter]);

  return (
    <>
      <Tabs.Root
        value={filter}
        onValueChange={(v) => setFilter(v as DiffRowFilter)}
        className="mb-3 w-fit gap-0"
      >
        <Tabs.List aria-label="Diff row visibility">
          {DIFF_FILTER_OPTIONS.map((opt) => (
            <Tabs.Tab key={opt.value} value={opt.value}>
              {opt.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.Root>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-1/3">Field</Table.Head>
            <Table.Head className="w-1/3">Before</Table.Head>
            <Table.Head className="w-1/3">After</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visibleRows.map((row) => {
            const changed = row.before !== row.after;
            return (
              <Table.Row key={row.key}>
                <Table.Cell className="font-medium text-muted-foreground">
                  {row.label}
                </Table.Cell>
                <Table.Cell
                  className={
                    changed
                      ? "bg-status-danger/5 text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {row.before != null ? (
                    <span className={changed ? "line-through" : undefined}>
                      {row.before}
                    </span>
                  ) : (
                    <Empty />
                  )}
                </Table.Cell>
                <Table.Cell
                  className={
                    changed
                      ? "bg-status-completed/10 font-medium text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {row.after ?? <Empty />}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </>
  );
};

const Empty = () => <span className="text-muted-foreground/60">—</span>;
