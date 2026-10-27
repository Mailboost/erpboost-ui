// Reference example: https://ui.tailor.tech/page/simple-master-crud
import { useState } from "react";
import {
  Badge,
  Button,
  Field,
  Form,
  Input,
  Layout,
  Select,
  Sheet,
  Table,
} from "@mailboost/erpboost-ui";
import { Checkbox } from "../shared/checkbox";
import { Textarea } from "../shared/textarea";

type Category = {
  id: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
  sortOrder: number;
  parentLabel: string | null;
  taxProfile: string;
  notes: string;
};

const parentOptions = ["— None —", "Electronics", "Office supplies", "Raw materials"];
const taxProfiles = ["Standard 10%", "Reduced 8%", "Exempt", "Reverse charge"];

const initial: Category[] = [
  {
    id: "c-1",
    code: "ELC",
    name: "Electronics",
    description: "Devices and components for resale.",
    active: true,
    sortOrder: 10,
    parentLabel: null,
    taxProfile: taxProfiles[0],
    notes: "Synced nightly from ERP.",
  },
  {
    id: "c-2",
    code: "OFC",
    name: "Office supplies",
    description: "Consumables and stationery.",
    active: true,
    sortOrder: 20,
    parentLabel: null,
    taxProfile: taxProfiles[0],
    notes: "",
  },
  {
    id: "c-3",
    code: "MAT",
    name: "Raw materials",
    description: "Stock used in production runs.",
    active: true,
    sortOrder: 30,
    parentLabel: "Electronics",
    taxProfile: taxProfiles[1],
    notes: "Requires QC lot on receipt.",
  },
  {
    id: "c-4",
    code: "DEPR",
    name: "Deprecated",
    description: "Legacy codes; do not assign to new SKUs.",
    active: false,
    sortOrder: 999,
    parentLabel: null,
    taxProfile: taxProfiles[2],
    notes: "Scheduled for archive next quarter.",
  },
];

export const CategoriesMasterSheetPage = () => {
  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState<Category | null>(null);
  const [parent, setParent] = useState<string | null>(parentOptions[0]);
  const [taxProfile, setTaxProfile] = useState<string | null>(taxProfiles[0]);

  const syncSelectsFromEditing = (row: Category | null) => {
    if (!row) return;
    setParent(row.parentLabel ?? parentOptions[0]);
    setTaxProfile(row.taxProfile);
  };

  return (
    <Layout>
      <Layout.Header
        title="Categories"
        actions={[
          <Button
            key="new"
            onClick={() => {
              const blank: Category = {
                id: `c-${rows.length + 1}`,
                code: "",
                name: "",
                description: "",
                active: true,
                sortOrder: rows.length * 10 + 10,
                parentLabel: null,
                taxProfile: taxProfiles[0],
                notes: "",
              };
              setEditing(blank);
              syncSelectsFromEditing(blank);
            }}
          >
            + New category
          </Button>,
        ]}
      />
      <Layout.Column>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Code</Table.Head>
              <Table.Head>Name</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head className="w-24" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id} className="group">
                <Table.Cell className="font-mono text-xs">{row.code}</Table.Cell>
                <Table.Cell className="font-medium">{row.name}</Table.Cell>
                <Table.Cell>
                  {row.active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="outline-neutral">Inactive</Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => {
                      setEditing(row);
                      syncSelectsFromEditing(row);
                    }}
                  >
                    Edit
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Layout.Column>

      <Sheet.Root
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <Sheet.Content className="sm:max-w-lg">
          <Sheet.Header>
            <Sheet.Title>
              {editing && rows.some((row) => row.id === editing.id)
                ? "Edit category"
                : "New category"}
            </Sheet.Title>
            <Sheet.Description>
              Once the form grows, move it into a Sheet. Parent, tax profile,
              sort order, and internal notes all fit with vertical scrolling.
            </Sheet.Description>
          </Sheet.Header>
          {editing ? (
            <Form
              className="space-y-4 px-6 pb-4"
              onFormSubmit={(values) => {
                const parentLabel =
                  parent === parentOptions[0] || parent == null
                    ? null
                    : parent;
                const updated: Category = {
                  id: editing.id,
                  code: String(values.code ?? editing.code),
                  name: String(values.name ?? editing.name),
                  description: String(
                    values.description ?? editing.description,
                  ),
                  active: Boolean(values.active ?? editing.active),
                  sortOrder: Number(values.sortOrder ?? editing.sortOrder),
                  parentLabel,
                  taxProfile: taxProfile ?? editing.taxProfile,
                  notes: String(values.notes ?? editing.notes),
                };
                setRows((prev) => {
                  const exists = prev.some((r) => r.id === updated.id);
                  return exists
                    ? prev.map((r) => (r.id === updated.id ? updated : r))
                    : [...prev, updated];
                });
                setEditing(null);
              }}
            >
              <Field.Root name="code">
                <Field.Label>Code</Field.Label>
                <Field.Control defaultValue={editing.code} required />
              </Field.Root>
              <Field.Root name="name">
                <Field.Label>Name</Field.Label>
                <Input name="name" defaultValue={editing.name} required />
              </Field.Root>
              <Field.Root name="description">
                <Field.Label>Description</Field.Label>
                <Textarea
                  name="description"
                  rows={3}
                  defaultValue={editing.description}
                />
              </Field.Root>
              <Field.Root name="parent">
                <Field.Label>Parent category</Field.Label>
                <Select
                  items={parentOptions}
                  value={parent}
                  onValueChange={setParent}
                  placeholder="Optional rollup"
                />
              </Field.Root>
              <Field.Root name="sortOrder">
                <Field.Label>Sort order</Field.Label>
                <Input
                  name="sortOrder"
                  type="number"
                  defaultValue={editing.sortOrder}
                  min={0}
                />
              </Field.Root>
              <Field.Root name="taxProfile">
                <Field.Label>Tax profile</Field.Label>
                <Select
                  items={taxProfiles}
                  value={taxProfile}
                  onValueChange={setTaxProfile}
                  placeholder="Posting rule"
                />
              </Field.Root>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox name="active" defaultChecked={editing.active} />
                Active
              </label>
              <Field.Root name="notes">
                <Field.Label>Internal notes</Field.Label>
                <Textarea
                  name="notes"
                  rows={3}
                  defaultValue={editing.notes}
                  placeholder="Ops-only context."
                />
              </Field.Root>
              <Sheet.Footer className="flex flex-row justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </Sheet.Footer>
            </Form>
          ) : null}
        </Sheet.Content>
      </Sheet.Root>
    </Layout>
  );
};
