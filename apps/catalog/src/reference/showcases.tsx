import { useState } from "react";
import {
  Badge,
  DescriptionCard,
  Button,
  DataTable,
  Select,
  useDataTable,
  createColumnHelper,
} from "@mailboost/erpboost-ui";
import { BulkActionsBar } from "./patterns__bulk-actions-bar/BulkActionsBar";
import { GridView, sampleCards } from "./patterns__grid-view/GridView";
import { DatatableInlineEdit } from "./patterns__datatable-inline-edit/DatatableInlineEdit";
import { FieldDiffTable } from "./patterns__field-diff-table/FieldDiffTable";
import { RightSheet } from "./patterns__right-sheet-custom/RightSheet";
import { SupplierCascader } from "./patterns__supplier-cascader/SupplierCascader";
import { useSupplierPreviewState } from "./shared/supplier-preview-state";
import { ThreadComposer } from "./patterns__thread-composer/ThreadComposer";
import { UserProfileDialogSmall } from "./patterns__user-profile-dialog/UserProfileDialogSmall";
import { UserProfileDialog } from "./patterns__user-profile-dialog/UserProfileDialog";
export function GridExample() {
  return <GridView cards={sampleCards} />;
}
export function InlineExample() {
  return (
    <DatatableInlineEdit
      initialRows={[
        {
          id: "1",
          sku: "SKU-1001",
          label: "Aluminum bracket",
          quantity: 120,
          owner: "Miller",
          status: "active",
          confirmed: true,
        },
        {
          id: "2",
          sku: "SKU-2044",
          label: "Silicone gasket roll",
          quantity: 40,
          owner: "Carter",
          status: "draft",
          confirmed: false,
        },
        {
          id: "3",
          sku: "SKU-0312",
          label: "Power supply unit",
          quantity: 8,
          owner: "Bennett",
          status: "hold",
          confirmed: false,
        },
      ]}
    />
  );
}
export function FieldDiffExample() {
  return (
    <FieldDiffTable
      rows={[
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
      ]}
    />
  );
}
export function SupplierExample() {
  const cascader = useSupplierPreviewState();
  return (
    <div className="mx-auto w-full max-w-3xl">
      <SupplierCascader cascader={cascader} />
    </div>
  );
}
export function ComposerExample() {
  const [value, setValue] = useState("");
  const [internal, setInternal] = useState(false);
  return (
    <div className="mx-auto w-full max-w-3xl">
      <ThreadComposer
        value={value}
        onChange={setValue}
        internal={internal}
        onInternalChange={setInternal}
        onDiscard={() => setValue("")}
        onSubmit={() => setValue("")}
        submitDisabled={!value.trim()}
      />
    </div>
  );
}
export function ProfileExample({ small = false }: { small?: boolean }) {
  const [open, setOpen] = useState(false);
  const Component = small ? UserProfileDialogSmall : UserProfileDialog;
  return (
    <div className="flex min-h-[420px] items-center justify-center bg-muted/40">
      <Button onClick={() => setOpen(true)}>Open profile</Button>
      <Component open={open} onOpenChange={setOpen} />
    </div>
  );
}
export function RightSheetExample() {
  const [mode, setMode] = useState<"backdrop" | "plain" | null>(null);
  return (
    <div className="space-y-8">
      <div>
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">With backdrop</h3>
            <p className="text-sm text-muted-foreground">
              Closes on Esc, ×, or a backdrop click. The panel uses{" "}
              <code className="text-xs">bg-card</code>.
            </p>
          </div>
          <Button onClick={() => setMode("backdrop")}>
            Open · with backdrop
          </Button>
        </section>
      </div>
      <div>
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">Without backdrop</h3>
            <p className="text-sm text-muted-foreground">
              No dimming, but a transparent click layer covers the screen, so
              Esc, ×, or clicking outside the sheet still closes it.
            </p>
          </div>
          <Button variant="outline" onClick={() => setMode("plain")}>
            Open · no backdrop
          </Button>
        </section>
        <RightSheet
          open={mode !== null}
          onOpenChange={(v) => !v && setMode(null)}
          title="Supplier · Tailor Supply Co."
          description={
            mode === "plain"
              ? "Transparent scrim · outside tap still closes"
              : "Drilldown panel with quick review"
          }
          expandHref="#"
          backdrop={mode === "backdrop"}
        >
          <DescriptionCard
            title="Supplier summary"
            data={{
              name: "Tailor Supply Co.",
              status: "Pending",
              requestedAt: "2026-04-01",
              website: "https://tailor.tech",
            }}
            fields={[
              { key: "name", label: "Company name" },
              {
                key: "status",
                label: "Status",
                type: "badge",
                meta: { badgeVariantMap: { Pending: "warning" } },
              },
              { key: "requestedAt", label: "Requested at", type: "date" },
              { key: "website", label: "Website", type: "link" },
            ]}
          />
        </RightSheet>
      </div>
    </div>
  );
}
type Supplier = { id: string; supplier: string; status: string };
const initialSuppliers: Supplier[] = [
  { id: "1", supplier: "Tailor Supply Co.", status: "Pending" },
  { id: "2", supplier: "East Works Ltd.", status: "Approved" },
  { id: "3", supplier: "Northwind Materials", status: "Pending" },
  { id: "4", supplier: "Acme Components", status: "Rejected" },
];
export function BulkExample() {
  const rows = initialSuppliers;
  const [selected, setSelected] = useState<Record<string, boolean>>({}),
    [status, setStatus] = useState<string | null>(null);
  const { column } = createColumnHelper<Supplier>();
  const table = useDataTable({
    data: {
      rows: rows.filter((r) => !status || r.status === status),
    },
    columns: [
      column({
        id: "supplier",
        label: "Supplier",
        render: (r) => <span className="font-medium">{r.supplier}</span>,
      }),
      column({
        id: "status",
        label: "Status",
        render: (r) => (
          <Badge
            variant={
              r.status === "Approved"
                ? "outline-success"
                : r.status === "Rejected"
                  ? "outline-error"
                  : "outline-warning"
            }
          >
            {r.status}
          </Badge>
        ),
      }),
    ],
    rowSelection: {
      selectedIds: Object.keys(selected).filter((k) => selected[k]),
      onChange: (ids) =>
        setSelected(Object.fromEntries(ids.map((id) => [id, true]))),
    },
  });
  const count = Object.values(selected).filter(Boolean).length;
  return (
    <div className="space-y-3">
      <DataTable.Root value={table}>
        <DataTable.Toolbar>
          <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="min-w-42 w-44 shrink-0">
              <Select
                items={["Pending", "Approved", "Rejected"]}
                value={status}
                onValueChange={(next) => {
                  setStatus(next);
                  setSelected({});
                }}
                placeholder="Status"
              />
            </div>
            <BulkActionsBar
              variant="toolbar"
              selectedCount={count}
              onClear={() => setSelected({})}
              onApprove={() => setSelected({})}
              onReject={() => setSelected({})}
            />
          </div>
        </DataTable.Toolbar>
        <DataTable.Table />
      </DataTable.Root>
    </div>
  );
}
