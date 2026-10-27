// Reference example: https://ui.tailor.tech/page/collection
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  type BadgeProps,
  Button,
  DataTable,
  Input,
  Layout,
  Menu,
  Tabs,
  createColumnHelper,
  useCollectionVariables,
  useDataTable,
  useToast,
} from "@mailboost/erpboost-ui";
import type { PageInfo, PaginationVariables } from "@mailboost/erpboost-ui";
import { Check, ChevronDown, Pencil } from "lucide-react";
import { Checkbox } from "../shared/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../shared/popover";
import { BulkActionsBar } from "../patterns__bulk-actions-bar/BulkActionsBar";

// ─────────────────────── Status tabs ───────────────────────
// 同じステータスタブで行集合を絞り込みつつ、行のセル単位で値を直接編集できるパターン。

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

const STATUS_EDIT_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "ORDERED", label: "Ordered" },
  { value: "CLOSED", label: "Closed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  "outline-neutral" | "warning" | "outline-info" | "success" | "error"
> = {
  DRAFT: "outline-neutral",
  SUBMITTED: "warning",
  ORDERED: "outline-info",
  CLOSED: "success",
  CANCELLED: "error",
};

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
const INITIAL_ORDERS: Order[] = Array.from({ length: 36 }, (_, i) => {
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

const formatJpy = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);

// ─────────────────────── Inline edit cells ───────────────────────

/**
 * Popover ベースの編集セル。
 * トリガをクリックすると Popover に Input + Save/Cancel が出る。
 * Enter で保存 / Esc・blur で破棄。明示的に確定するフィールド向け。
 */
type PopoverEditCellProps = {
  label: string;
  value: string;
  display?: string;
  type?: "text" | "number";
  align?: "left" | "right";
  width?: string;
  onCommit: (next: string) => void;
};

const PopoverEditCell = ({
  label,
  value,
  display,
  type = "text",
  align = "left",
  width = "w-64",
  onCommit,
}: PopoverEditCellProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(value);
    setOpen(next);
  };

  const handleSave = () => {
    if (draft !== value) onCommit(draft);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={
            "group inline-flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-sm hover:underline underline-offset-2 " +
            (align === "right" ? "justify-end tabular-nums" : "justify-start")
          }
        >
          <span className="truncate">{(display ?? value) || "—"}</span>
          <Pencil className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className={width} align="start">
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{label}</h4>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          <Input
            autoFocus
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Badge 形のインライン値切り替え。
 * 「Badge + 小さい chevron-down」をトリガとして Menu を開き、値を即時確定する。
 * Select だとフォーム入力寄りの装飾が固定で出てしまうため、セル内編集では
 * Menu + 自前トリガの方が読み取り中心の DataTable に馴染む。
 */
type BadgeMenuCellProps<V extends string> = {
  value: V;
  display: string;
  variant: BadgeProps["variant"];
  options: { value: V; label: string }[];
  onCommit: (next: V) => void;
};

const BadgeMenuCell = <V extends string>({
  value,
  display,
  variant,
  options,
  onCommit,
}: BadgeMenuCellProps<V>) => (
  <Menu.Root>
    <Menu.Trigger
      render={
        <button
          type="button"
          className={
            "inline-flex cursor-pointer items-center gap-1 rounded-sm " +
            "outline-none focus-visible:ring-2 focus-visible:ring-ring/50 " +
            "focus-visible:ring-offset-1 focus-visible:ring-offset-background"
          }
        />
      }
    >
      <Badge variant={variant}>{display || "—"}</Badge>
      <ChevronDown
        className="size-3 text-muted-foreground"
        aria-hidden
      />
    </Menu.Trigger>
    <Menu.Content>
      <Menu.RadioGroup
        value={value}
        onValueChange={(next) => {
          if (next !== value) onCommit(next as V);
        }}
      >
        {options.map((option) => (
          <Menu.RadioItem
            key={option.value}
            value={option.value}
            closeOnClick
          >
            <Menu.RadioItemIndicator>
              <Check className="size-4" aria-hidden />
            </Menu.RadioItemIndicator>
            {option.label}
          </Menu.RadioItem>
        ))}
      </Menu.RadioGroup>
    </Menu.Content>
  </Menu.Root>
);

// ─────────────────────── Orders panel ───────────────────────

const OrdersPanel = () => {
  const toast = useToast();
  const [rows, setRows] = useState<Order[]>(INITIAL_ORDERS);
  const { variables, control } = useCollectionVariables({
    params: { pageSize: 10 },
  });
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    control.goToFirstPage();
  }, [status, keyword, control.goToFirstPage]);

  const updateRow = useCallback(
    (id: string, patch: Partial<Order>) => {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    },
    [],
  );

  const updateStatus = useCallback(
    (row: Order, next: OrderStatus) => {
      updateRow(row.id, { status: next });
      // Badge select は即時確定なので、保存された旨を toast で明示する。
      toast.success("Status updated", {
        description: `${row.poNumber} → ${next}`,
      });
    },
    [toast, updateRow],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
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
    [keyword, rows, status],
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
        // Supplier の付け替えはインラインで済む変更ではないので、ここは参照のみ。
        // 編集が必要なら詳細画面 / 専用ダイアログに遷移する想定。
        render: (row) => <span className="truncate">{row.supplier}</span>,
      }),
      column({
        id: "rfqNumber",
        label: "RFQ #",
        render: (row) => (
          <PopoverEditCell
            label="RFQ #"
            value={row.rfqNumber}
            onCommit={(next) => updateRow(row.id, { rfqNumber: next })}
          />
        ),
      }),
      column({
        id: "status",
        label: "Status",
        render: (row) => (
          <BadgeMenuCell
            value={row.status}
            display={row.status}
            variant={STATUS_BADGE_VARIANT[row.status]}
            options={STATUS_EDIT_OPTIONS}
            onCommit={(next) => updateStatus(row, next)}
          />
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
          <PopoverEditCell
            label="Amount"
            type="number"
            align="right"
            width="w-48"
            value={String(row.amount)}
            display={formatJpy(row.amount)}
            onCommit={(next) => {
              const parsed = Number.parseInt(next, 10);
              updateRow(row.id, {
                amount: Number.isFinite(parsed) ? Math.max(0, parsed) : 0,
              });
            }}
          />
        ),
      }),
    ],
    [
      column,
      selected,
      allSelected,
      someSelected,
      pageIds,
      updateRow,
      updateStatus,
    ],
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

export const PageInlineEditTabsPage = () => (
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
