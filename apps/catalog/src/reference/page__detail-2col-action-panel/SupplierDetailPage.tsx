// Reference example: https://ui.tailor.tech/page/detail-2col-action-panel
import { useMemo, useState } from "react";
import {
  ActionPanel,
  ActivityCard,
  Badge,
  Button,
  Card,
  DataTable,
  DescriptionCard,
  Input,
  Layout,
  Tabs,
  useDataTable,
} from "@mailboost/erpboost-ui";
import type { Column } from "@mailboost/erpboost-ui";

const supplier = {
  id: "s-001",
  companyName: "Tailor Supply Co.",
  status: "PENDING",
  owner: "Tanaka",
  requestedAt: "2026-04-12",
  website: "https://tailor.tech",
};

type LinkedPoRow = {
  id: string;
  poNumber: string;
  amount: string;
  submitted: string;
  status: "Open" | "Received" | "Closed";
};

const linkedPurchaseOrders: LinkedPoRow[] = [
  {
    id: "po-1",
    poNumber: "PO-24118",
    amount: "¥186K",
    submitted: "2026-05-08",
    status: "Open",
  },
  {
    id: "po-2",
    poNumber: "PO-24072",
    amount: "¥54K",
    submitted: "2026-04-21",
    status: "Received",
  },
  {
    id: "po-3",
    poNumber: "PO-23941",
    amount: "¥920K",
    submitted: "2026-03-02",
    status: "Closed",
  },
  {
    id: "po-4",
    poNumber: "PO-24102",
    amount: "¥128K",
    submitted: "2026-05-01",
    status: "Open",
  },
  {
    id: "po-5",
    poNumber: "PO-23988",
    amount: "¥312K",
    submitted: "2026-04-08",
    status: "Received",
  },
];

type PoStatusFilter = "ALL" | LinkedPoRow["status"];

const PO_STATUS_FILTERS: { value: PoStatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "Open", label: "Open" },
  { value: "Received", label: "Received" },
  { value: "Closed", label: "Closed" },
];

const activity = [
  {
    id: "a-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    actor: { name: "System" },
    description: "Pulled latest data from ERP",
  },
  {
    id: "a-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    actor: { name: "Aiko Sato" },
    description: "Requested clarification on tax ID",
  },
  {
    id: "a-3",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25),
    actor: { name: "Taro Tanaka" },
    description: "Submitted supplier registration",
  },
];

export const SupplierDetailPage = () => {
  const [poStatus, setPoStatus] = useState<PoStatusFilter>("ALL");
  const [poKeyword, setPoKeyword] = useState("");

  const filteredPurchaseOrders = useMemo(() => {
    return linkedPurchaseOrders.filter((row) => {
      if (poStatus !== "ALL" && row.status !== poStatus) return false;
      if (
        poKeyword &&
        !row.poNumber.toLowerCase().includes(poKeyword.toLowerCase().trim())
      )
        return false;
      return true;
    });
  }, [poStatus, poKeyword]);

  const poColumns = useMemo<Column<LinkedPoRow>[]>(
    () => [
      {
        id: "poNumber",
        label: "PO",
        render: (row) => (
          <span className="font-mono text-xs">{row.poNumber}</span>
        ),
      },
      { id: "amount", label: "Amount", render: (row) => row.amount },
      { id: "submitted", label: "Submitted", render: (row) => row.submitted },
      {
        id: "status",
        label: "Status",
        render: (row) => {
          const variantMap = {
            Open: "warning",
            Received: "success",
            Closed: "outline-neutral",
          } as const;
          return (
            <Badge variant={variantMap[row.status]}>{row.status}</Badge>
          );
        },
      },
    ],
    [],
  );

  const poTable = useDataTable<LinkedPoRow>({
    columns: poColumns,
    data: { rows: filteredPurchaseOrders, total: filteredPurchaseOrders.length },
  });

  return (
    <Layout>
      <Layout.Header
        title={supplier.companyName}
        actions={[
          <Button key="edit" variant="secondary">
            Edit
          </Button>,
        ]}
      />
      <Layout.Column area="main">
        <div className="flex flex-col gap-4">
          <DescriptionCard
            title="Supplier profile"
            data={supplier}
            fields={[
              { key: "companyName", label: "Company name" },
              { key: "owner", label: "Owner" },
              {
                key: "status",
                label: "Status",
                type: "badge",
                meta: { badgeVariantMap: { PENDING: "warning" } },
              },
              { type: "divider" },
              { key: "requestedAt", label: "Requested at", type: "date" },
              {
                key: "website",
                label: "Website",
                type: "link",
                meta: { external: true },
              },
            ]}
          />
          <Card.Root className="min-w-0 overflow-hidden">
            <div className="flex w-full min-w-0 items-center justify-between gap-3 px-6 py-4">
              <h3 className="text-lg font-semibold leading-none tracking-tight text-card-foreground">
                Purchase orders
              </h3>
              <Button type="button" variant="default" className="shrink-0">
                + New
              </Button>
            </div>
            <Card.Content className="astw:p-0 astw:first:pt-0">
              <DataTable.Root
                value={poTable}
                className="astw:rounded-none astw:border-0 astw:border-t"
              >
                <DataTable.Toolbar>
                  <div className="flex w-full flex-nowrap items-center justify-between gap-2">
                    <Tabs.Root
                      value={poStatus}
                      onValueChange={(v) => setPoStatus(v as PoStatusFilter)}
                      className="w-fit shrink-0 gap-0"
                    >
                      <Tabs.List
                        aria-label="PO status"
                        className="inline-flex w-fit shrink-0 flex-nowrap"
                      >
                        {PO_STATUS_FILTERS.map((opt) => (
                          <Tabs.Tab key={opt.value} value={opt.value}>
                            {opt.label}
                          </Tabs.Tab>
                        ))}
                      </Tabs.List>
                    </Tabs.Root>
                    <Input
                      value={poKeyword}
                      onChange={(e) => setPoKeyword(e.target.value)}
                      placeholder="Search PO"
                      className="h-9 w-32 max-w-32 shrink-0 basis-32 md:w-36 md:max-w-36 md:basis-36"
                    />
                  </div>
                </DataTable.Toolbar>
                <DataTable.Table />
              </DataTable.Root>
            </Card.Content>
          </Card.Root>
        </div>
      </Layout.Column>
      <Layout.Column area="right">
        <div className="flex flex-col gap-4">
          <ActionPanel
            title="Review"
            actions={[
              { key: "approve", label: "Approve", icon: <span>✓</span> },
              { key: "reject", label: "Reject", icon: <span>✗</span> },
              { key: "comment", label: "Leave a comment", icon: <span>…</span> },
              { key: "sync", label: "Re-sync from ERP", icon: <span>↻</span> },
            ]}
          />
          <ActivityCard
            title="Recent updates"
            groupBy="day"
            items={activity}
          />
        </div>
      </Layout.Column>
    </Layout>
  );
};
