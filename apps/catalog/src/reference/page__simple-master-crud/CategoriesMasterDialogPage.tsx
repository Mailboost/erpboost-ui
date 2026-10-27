// Reference example: https://ui.tailor.tech/page/simple-master-crud
import { useState } from "react";
import {
  Badge,
  Button,
  Dialog,
  Field,
  Form,
  Layout,
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
};

const initial: Category[] = [
  {
    id: "c-1",
    code: "ELC",
    name: "Electronics",
    description: "Devices and components.",
    active: true,
  },
  {
    id: "c-2",
    code: "OFC",
    name: "Office supplies",
    description: "Consumables and stationery.",
    active: true,
  },
  {
    id: "c-3",
    code: "MAT",
    name: "Raw materials",
    description: "Stock used in production.",
    active: true,
  },
  {
    id: "c-4",
    code: "DEPR",
    name: "Deprecated",
    description: "Legacy codes kept read-only.",
    active: false,
  },
];

export const CategoriesMasterDialogPage = () => {
  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState<Category | null>(null);

  return (
    <Layout>
      <Layout.Header
        title="Categories"
        actions={[
          <Button
            key="new"
            onClick={() =>
              setEditing({
                id: `c-${rows.length + 1}`,
                code: "",
                name: "",
                description: "",
                active: true,
              })
            }
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
                <Table.Cell className="font-mono text-xs">
                  {row.code}
                </Table.Cell>
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
                    onClick={() => setEditing(row)}
                  >
                    Edit
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Layout.Column>

      <Dialog.Root
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <Dialog.Content className="sm:max-w-md">
          <Dialog.Header>
            <Dialog.Title>
              {editing && rows.some((row) => row.id === editing.id)
                ? "Edit category"
                : "New category"}
            </Dialog.Title>
            <Dialog.Description>
              When there are only a few fields, a modal is enough. Code, name, a
              short description, and the active flag can be reviewed and saved
              at a glance.
            </Dialog.Description>
          </Dialog.Header>
          {editing ? (
            <Form
              className="space-y-4"
              onFormSubmit={(_, details) => {
                const values = Object.fromEntries(
                  new FormData(details.event.target as HTMLFormElement),
                );
                const updated: Category = {
                  id: editing.id,
                  code: String(values.code ?? editing.code),
                  name: String(values.name ?? editing.name),
                  description: String(
                    values.description ?? editing.description,
                  ),
                  active: values.active !== undefined,
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
                <Field.Control defaultValue={editing.name} required />
              </Field.Root>
              <Field.Root name="description">
                <Field.Label>Description</Field.Label>
                <Textarea
                  name="description"
                  rows={3}
                  defaultValue={editing.description}
                  placeholder="Shown in pickers and exports."
                />
              </Field.Root>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox name="active" defaultChecked={editing.active} />
                Active
              </label>
              <Dialog.Footer className="flex flex-row justify-end gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </Dialog.Footer>
            </Form>
          ) : null}
        </Dialog.Content>
      </Dialog.Root>
    </Layout>
  );
};
