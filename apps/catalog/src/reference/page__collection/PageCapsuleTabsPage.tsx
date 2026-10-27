// Reference example: https://ui.tailor.tech/page/collection
import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  DataTable,
  Input,
  Layout,
  Tabs,
  createColumnHelper,
  useCollectionVariables,
  useDataTable,
} from "@mailboost/erpboost-ui";
import type { PageInfo, PaginationVariables } from "@mailboost/erpboost-ui";
import { Checkbox } from "../shared/checkbox";
import { BulkActionsBar } from "../patterns__bulk-actions-bar/BulkActionsBar";

// ─────────────────────── Status tabs ───────────────────────
// DataTable.Toolbar に入れて、行のステータス絞り込みに使う。

type OrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "ORDERED"
  | "CLOSED"
  | "CANCELLED";
type StatusFilter = "ALL" | OrderStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "ORDERED", label: "Ordered" },
  { value: "CLOSED", label: "Closed" },
  { value: "CANCELLED", label: "Cancelled" },
];

// ─────────────────────── Orders panel (DataTable) ───────────────────────

type Order = {
  id: string;
  poNumber: string;
  rfqNumber: string;
  supplier: string;
  status: OrderStatus;
  orderDate: string;
  amount: number;
};

const STATUS_CYCLE: OrderStatus[] = [
  "ORDERED",
  "SUBMITTED",
  "DRAFT",
  "CLOSED",
  "CANCELLED",
];

const SUPPLIER_CYCLE: string[] = [
  "Tailor Supply Co.",
  "East Works Ltd.",
  "Northwind Components",
  "Aoba Precision",
  "Harbor Logistics",
];

/** ページネーション用に件数を多めにしたサンプルデータ */
const ORDERS: Order[] = Array.from({ length: 36 }, (_, i) => {
  const n = i + 1;
  const month = String((i % 9) + 1).padStart(2, "0");
  const day = String((i % 26) + 1).padStart(2, "0");
  return {
    id: `po-${1000 + n}`,
    poNumber: `PO-2026-${1000 + n}`,
    rfqNumber: `RFQ-${440 + n}`,
    supplier: SUPPLIER_CYCLE[i % SUPPLIER_CYCLE.length]!,
    status: STATUS_CYCLE[i % STATUS_CYCLE.length]!,
    orderDate: `2026-${month}-${day}`,
    amount: 24_000 + ((n * 11_317) % 480_000),
  };
});

/** `useCollectionVariables` のカーソルを行インデックスとして扱い、配列をページ分割する */
function sliceRowsForPagination<T>(
  rows: T[],
  pagination: PaginationVariables,
  fallbackPageSize: number,
): { slice: T[]; pageInfo: PageInfo; total: number } {
  const total = rows.length;
  const first = pagination.first;
  const last = pagination.last;
  const after = pagination.after;
  const before = pagination.before;

  if (first != null) {
    const start =
      after == null || after === "" ? 0 : Number.parseInt(String(after), 10) + 1;
    if (!Number.isFinite(start) || start < 0) {
      return {
        slice: [],
        total,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
      };
    }
    const end = Math.min(start + first, total);
    const slice = rows.slice(start, end);
    return {
      slice,
      total,
      pageInfo: {
        hasNextPage: end < total,
        hasPreviousPage: start > 0,
        startCursor: slice.length > 0 ? String(start) : null,
        endCursor: slice.length > 0 ? String(end - 1) : null,
      },
    };
  }

  if (last != null) {
    const endExclusive =
      before == null || before === "" ? total : Number.parseInt(String(before), 10);
    if (!Number.isFinite(endExclusive) || endExclusive <= 0) {
      return {
        slice: [],
        total,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
      };
    }
    const start = Math.max(0, endExclusive - last);
    const slice = rows.slice(start, endExclusive);
    return {
      slice,
      total,
      pageInfo: {
        hasNextPage: endExclusive < total,
        hasPreviousPage: start > 0,
        startCursor: slice.length > 0 ? String(start) : null,
        endCursor: slice.length > 0 ? String(endExclusive - 1) : null,
      },
    };
  }

  const size = fallbackPageSize;
  const end = Math.min(size, total);
  const slice = rows.slice(0, end);
  return {
    slice,
    total,
    pageInfo: {
      hasNextPage: end < total,
      hasPreviousPage: false,
      startCursor: slice.length > 0 ? "0" : null,
      endCursor: slice.length > 0 ? String(end - 1) : null,
    },
  };
}

const STATUS_VARIANT: Record<
  OrderStatus,
  "outline-neutral" | "warning" | "outline-info" | "success" | "error"
> = {
  DRAFT: "outline-neutral",
  SUBMITTED: "warning",
  ORDERED: "outline-info",
  CLOSED: "success",
  CANCELLED: "error",
};

const formatJpy = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);

const OrdersPanel = () => {
  const { variables, control } = useCollectionVariables({
    params: { pageSize: 10 },
  });
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    control.goToFirstPage();
  }, [status, keyword, control.goToFirstPage]);

  const filteredRows = useMemo(
    () =>
      ORDERS.filter((row) => {
        if (status !== "ALL" && row.status !== status) return false;
        if (
          keyword &&
          !`${row.poNumber} ${row.rfqNumber} ${row.supplier}`
            .toLowerCase()
            .includes(keyword.toLowerCase().trim())
        )
          return false;
        return true;
      }),
    [keyword, status],
  );

  const { slice: pageRows, pageInfo, total } = useMemo(
    () =>
      sliceRowsForPagination(
        filteredRows,
        variables.pagination,
        control.pageSize,
      ),
    [control.pageSize, filteredRows, variables.pagination],
  );

  const filteredIds = useMemo(() => filteredRows.map((r) => r.id), [filteredRows]);
  const pageIds = useMemo(() => pageRows.map((r) => r.id), [pageRows]);

  useEffect(() => {
    setSelected((prev) => {
      const allowed = new Set(filteredIds);
      const next = new Set<string>();
      for (const id of prev) {
        if (allowed.has(id)) next.add(id);
      }
      if (next.size === prev.size && [...prev].every((id) => next.has(id))) {
        return prev;
      }
      return next;
    });
  }, [filteredIds]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someSelected =
    pageIds.some((id) => selected.has(id)) && !allSelected;

  const { column } = createColumnHelper<Order>();
  const columns = useMemo(
    () => [
      column({
        id: "select",
        width: 44,
        label: (
          <div
            className="flex items-center py-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={
                allSelected ? true : someSelected ? "indeterminate" : false
              }
              onCheckedChange={(checked) => {
                if (checked === true) {
                  setSelected((prev) => new Set([...prev, ...pageIds]));
                } else {
                  setSelected((prev) => {
                    const next = new Set(prev);
                    for (const id of pageIds) next.delete(id);
                    return next;
                  });
                }
              }}
              aria-label="Select all rows"
            />
          </div>
        ) as unknown as string,
        render: (row) => (
          <Checkbox
            checked={selected.has(row.id)}
            onCheckedChange={() => toggle(row.id)}
            aria-label={`${row.poNumber} — Select row`}
          />
        ),
      }),
      column({
        id: "poNumber",
        label: "PO #",
        render: (row) => (
          <span className="font-mono text-xs">{row.poNumber}</span>
        ),
      }),
      column({
        id: "supplier",
        label: "Supplier",
        render: (row) => <span className="truncate">{row.supplier}</span>,
      }),
      column({
        id: "rfqNumber",
        label: "RFQ #",
        render: (row) => (
          <span className="text-muted-foreground">{row.rfqNumber}</span>
        ),
      }),
      column({
        id: "status",
        label: "Status",
        render: (row) => (
          <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
        ),
      }),
      column({
        id: "orderDate",
        label: "Order date",
        render: (row) => row.orderDate,
      }),
      column({
        id: "amount",
        label: "Amount",
        render: (row) => (
          <span className="tabular-nums">{formatJpy(row.amount)}</span>
        ),
      }),
    ],
    [column, selected, allSelected, someSelected, pageIds],
  );

  const table = useDataTable({
    columns,
    control,
    data: {
      rows: pageRows,
      pageInfo,
      total,
    },
  });

  const showBulkToolbar = selected.size > 0;

  return (
    <DataTable.Root value={table}>
      <DataTable.Toolbar>
        {showBulkToolbar ? (
          <div className="w-full min-w-0">
            <BulkActionsBar
              variant="toolbar"
              selectedCount={selected.size}
              onClear={() => setSelected(new Set())}
              onApprove={() => setSelected(new Set())}
              onReject={() => setSelected(new Set())}
            />
          </div>
        ) : (
          <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
            <Tabs.Root
              value={status}
              onValueChange={(v) => setStatus(v as StatusFilter)}
              variant="default"
              className="min-w-0 w-fit shrink gap-0"
            >
              <Tabs.List aria-label="Order status" className="min-w-0 shrink">
                {STATUS_OPTIONS.map((opt) => (
                  <Tabs.Tab key={opt.value} value={opt.value}>
                    {opt.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.Root>
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search PO / RFQ / Supplier"
              className="w-44 max-w-xs sm:w-auto sm:min-w-48"
            />
          </div>
        )}
      </DataTable.Toolbar>
      <DataTable.Table />
      <DataTable.Footer>
        <DataTable.Pagination pageSizeOptions={[5, 10, 25]} />
      </DataTable.Footer>
    </DataTable.Root>
  );
};

// ─────────────────────── Page ───────────────────────

export const PageCapsuleTabsPage = () => (
  <Layout>
    <Layout.Header
      title="Orders"
      actions={[
        <Button key="new" size="sm" type="button">
          New
        </Button>,
      ]}
    />
    <Layout.Column>
      <OrdersPanel />
    </Layout.Column>
  </Layout>
);
