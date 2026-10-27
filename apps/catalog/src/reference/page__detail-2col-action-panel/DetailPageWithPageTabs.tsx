// Reference example: https://ui.tailor.tech/page/detail-2col-action-panel
import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  DataTable,
  DescriptionCard,
  Input,
  Layout,
  Tabs,
  useDataTable,
} from "@mailboost/erpboost-ui";
import type { Column } from "@mailboost/erpboost-ui";
import {
  EmbeddedThreadedInquiryThread,
  threadedInquiryThreadMessageCount,
} from "../patterns__conversation-thread/InquiryThreadPage";

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

type PageTab = "profile" | "orders" | "conversation";

const PAGE_TABS: { value: PageTab; label: string; count?: number }[] = [
  { value: "profile", label: "Profile" },
  { value: "orders", label: "Orders", count: linkedPurchaseOrders.length },
  {
    value: "conversation",
    label: "Conversation",
    count: threadedInquiryThreadMessageCount,
  },
];

type PoStatusFilter = "ALL" | LinkedPoRow["status"];

const PO_STATUS_FILTERS: { value: PoStatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "Open", label: "Open" },
  { value: "Received", label: "Received" },
  { value: "Closed", label: "Closed" },
];

const SupplierOrdersPanel = () => {
  const [status, setStatus] = useState<PoStatusFilter>("ALL");
  const [keyword, setKeyword] = useState("");

  const filteredRows = useMemo(() => {
    return linkedPurchaseOrders.filter((row) => {
      if (status !== "ALL" && row.status !== status) return false;
      if (
        keyword &&
        !row.poNumber.toLowerCase().includes(keyword.toLowerCase().trim())
      )
        return false;
      return true;
    });
  }, [status, keyword]);

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
          return <Badge variant={variantMap[row.status]}>{row.status}</Badge>;
        },
      },
    ],
    [],
  );

  const poTable = useDataTable<LinkedPoRow>({
    columns: poColumns,
    data: { rows: filteredRows, total: filteredRows.length },
  });

  return (
    <div className="min-w-0">
      <DataTable.Root value={poTable}>
        <DataTable.Toolbar>
          <div className="flex w-full flex-nowrap items-center justify-between gap-2">
            <Tabs.Root
              value={status}
              onValueChange={(v) => setStatus(v as PoStatusFilter)}
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
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search PO"
              className="h-9 w-32 max-w-32 shrink-0 basis-32 md:w-36 md:max-w-36 md:basis-36"
            />
          </div>
        </DataTable.Toolbar>
        <DataTable.Table />
      </DataTable.Root>
    </div>
  );
};

const PageTabs = ({
  value,
  onChange,
}: {
  value: PageTab;
  onChange: (next: PageTab) => void;
}) => (
  <div
    role="tablist"
    aria-label="Supplier sections"
    className="mt-4 flex flex-wrap items-center gap-1"
  >
    {PAGE_TABS.map((item) => {
      const active = item.value === value;
      return (
        <Button
          key={item.value}
          type="button"
          role="tab"
          variant="ghost"
          size="sm"
          aria-selected={active}
          onClick={() => onChange(item.value)}
          className={
            active
              ? "relative flex h-auto items-center gap-2 px-3 py-2 text-sm font-medium text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:bg-primary"
              : "flex h-auto items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          }
        >
          <span>{item.label}</span>
          {typeof item.count === "number" ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium tabular-nums text-muted-foreground">
              {item.count}
            </span>
          ) : null}
        </Button>
      );
    })}
  </div>
);

export const DetailPageWithPageTabs = () => {
  const [tab, setTab] = useState<PageTab>("profile");

  return (
    <Layout>
      <Layout.Header
        title={supplier.companyName}
        actions={[
          <Button key="edit" variant="secondary">
            Edit
          </Button>,
        ]}
      >
        <PageTabs value={tab} onChange={setTab} />
      </Layout.Header>
      <Layout.Column>
        {tab === "profile" ? (
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
        ) : null}
        {tab === "orders" ? <SupplierOrdersPanel /> : null}
        {tab === "conversation" ? <EmbeddedThreadedInquiryThread /> : null}
      </Layout.Column>
    </Layout>
  );
};
