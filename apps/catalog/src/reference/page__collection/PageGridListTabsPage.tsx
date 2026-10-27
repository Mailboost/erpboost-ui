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
import { LayoutGrid, List as ListIcon } from "lucide-react";
import { Checkbox } from "../shared/checkbox";
import { BulkActionsBar } from "../patterns__bulk-actions-bar/BulkActionsBar";

// ─────────────────────── Status tabs + grid / list view switch ───────────────────────
// 同じコレクション (`Catalog`) を、画像が映えるグリッドビューと密度の高いリスト
// ビューで切り替えて見せるバリエーション。ステータスタブで在庫ステータスを絞り込み、
// view toggle で表示密度を切り替える。

type ItemStatus = "ACTIVE" | "LOW_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED";
type StatusFilter = "ALL" | ItemStatus;
type ViewMode = "grid" | "list";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "In stock" },
  { value: "LOW_STOCK", label: "Low stock" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
  { value: "DISCONTINUED", label: "Discontinued" },
];

const STATUS_VARIANT: Record<
  ItemStatus,
  "success" | "warning" | "error" | "neutral"
> = {
  ACTIVE: "success",
  LOW_STOCK: "warning",
  OUT_OF_STOCK: "error",
  DISCONTINUED: "neutral",
};

const STATUS_LABEL: Record<ItemStatus, string> = {
  ACTIVE: "In stock",
  LOW_STOCK: "Low stock",
  OUT_OF_STOCK: "Out of stock",
  DISCONTINUED: "Discontinued",
};

// ─────────────────────── Sample data ───────────────────────
// グリッドビューで「サムネイルが意味を持つ」ことを示すため、調達カタログ
// (オフィス用品 / 工具 / 資材 / 安全用具 / 電子機器) を題材にする。
// 実プロダクトでは商品画像 URL を参照する想定で、ここでは gradient + emoji で
// プレースホルダー表現する。

type Item = {
  id: string;
  sku: string;
  name: string;
  category: string;
  /** Visual thumbnail bits: gradient background + decorative glyph. */
  cover: string;
  emoji: string;
  status: ItemStatus;
  price: number;
  supplier: string;
};

const SUPPLIER_CYCLE: string[] = [
  "Tailor Supply Co.",
  "East Works Ltd.",
  "Northwind Components",
  "Aoba Precision",
  "Harbor Logistics",
];

// 1 周分が 32 件で、ページネーション (12 件/ページ) が複数ページに分かれるよう
// サンプル数を増やしている。
const ITEM_DEFINITIONS: Array<
  Pick<Item, "name" | "category" | "emoji" | "cover">
> = [
  {
    name: "Ballpoint pens (black, 10-pack)",
    category: "Stationery",
    emoji: "🖊️",
    cover: "linear-gradient(135deg, #fde68a, #fb923c)",
  },
  {
    name: "A4 copy paper, 5,000 sheets",
    category: "Stationery",
    emoji: "📄",
    cover: "linear-gradient(135deg, #e2e8f0, #94a3b8)",
  },
  {
    name: "Medium stapler",
    category: "Stationery",
    emoji: "📎",
    cover: "linear-gradient(135deg, #fda4af, #f87171)",
  },
  {
    name: "27-inch 4K monitor",
    category: "Electronics",
    emoji: "🖥️",
    cover: "linear-gradient(135deg, #93c5fd, #6366f1)",
  },
  {
    name: "Mechanical keyboard",
    category: "Electronics",
    emoji: "⌨️",
    cover: "linear-gradient(135deg, #5eead4, #818cf8)",
  },
  {
    name: "14-inch laptop",
    category: "Electronics",
    emoji: "💻",
    cover: "linear-gradient(135deg, #c4b5fd, #f0abfc)",
  },
  {
    name: "USB-C hub 7-in-1",
    category: "Electronics",
    emoji: "🔌",
    cover: "linear-gradient(135deg, #67e8f9, #a78bfa)",
  },
  {
    name: "Safety helmet (white)",
    category: "Safety gear",
    emoji: "⛑️",
    cover: "linear-gradient(135deg, #fef08a, #facc15)",
  },
  {
    name: "Safety glasses",
    category: "Safety gear",
    emoji: "🥽",
    cover: "linear-gradient(135deg, #99f6e4, #14b8a6)",
  },
  {
    name: "Work gloves (L)",
    category: "Safety gear",
    emoji: "🧤",
    cover: "linear-gradient(135deg, #fda4af, #fdba74)",
  },
  {
    name: "Cordless drill 18V",
    category: "Tools",
    emoji: "🪛",
    cover: "linear-gradient(135deg, #fdba74, #f97316)",
  },
  {
    name: "Wrench set (12-piece)",
    category: "Tools",
    emoji: "🔧",
    cover: "linear-gradient(135deg, #94a3b8, #475569)",
  },
  {
    name: "Tape measure 5m",
    category: "Tools",
    emoji: "📏",
    cover: "linear-gradient(135deg, #fcd34d, #f59e0b)",
  },
  {
    name: "Steel sheet 1.0mm 1820×910",
    category: "Materials",
    emoji: "🪟",
    cover: "linear-gradient(135deg, #cbd5e1, #64748b)",
  },
  {
    name: "Aluminum pipe φ20",
    category: "Materials",
    emoji: "🔩",
    cover: "linear-gradient(135deg, #d4d4d8, #71717a)",
  },
  {
    name: "Bearing 6202",
    category: "Materials",
    emoji: "⚙️",
    cover: "linear-gradient(135deg, #a8a29e, #78716c)",
  },
  {
    name: "Cardboard boxes, medium (100-pack)",
    category: "Packaging",
    emoji: "📦",
    cover: "linear-gradient(135deg, #fcd34d, #d97706)",
  },
  {
    name: "Packing tape 50m",
    category: "Packaging",
    emoji: "🧻",
    cover: "linear-gradient(135deg, #fde68a, #f59e0b)",
  },
  {
    name: "Dust masks (50-pack)",
    category: "Safety gear",
    emoji: "😷",
    cover: "linear-gradient(135deg, #ddd6fe, #a5b4fc)",
  },
  {
    name: "LED desk lamp",
    category: "Electronics",
    emoji: "💡",
    cover: "linear-gradient(135deg, #fde68a, #fbbf24)",
  },
];

// ステータスは「在庫あり」が大半、「在庫少」「在庫切れ」「廃版」が混ざるよう
// 配分する。
const STATUS_CYCLE: ItemStatus[] = [
  "ACTIVE",
  "ACTIVE",
  "ACTIVE",
  "LOW_STOCK",
  "ACTIVE",
  "OUT_OF_STOCK",
  "ACTIVE",
  "DISCONTINUED",
];

const ITEMS: Item[] = Array.from({ length: 32 }, (_, i) => {
  const def = ITEM_DEFINITIONS[i % ITEM_DEFINITIONS.length]!;
  const n = i + 1;
  return {
    id: `it-${1000 + n}`,
    sku: `SKU-${4200 + n}`,
    name: def.name,
    category: def.category,
    emoji: def.emoji,
    cover: def.cover,
    status: STATUS_CYCLE[i % STATUS_CYCLE.length]!,
    price: 480 + ((n * 7777) % 92_000),
    supplier: SUPPLIER_CYCLE[i % SUPPLIER_CYCLE.length]!,
  };
});

const formatJpy = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);

// ─────────────────────── Pagination helpers ───────────────────────
// 他バリエーション (PageCapsuleTabsPage / PageInlineEditTabsPage) と同じ
// useCollectionVariables のカーソルから配列をスライスする実装。

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

// ─────────────────────── Thumbnail ───────────────────────
// app-shell には商品画像向けの primitive がないため、catalog 用に小さな
// gradient + glyph タイルを切り出す。リストビューは 32px、グリッドビューは
// カード幅いっぱい (aspect-[4/3]) で利用する。

type ThumbnailProps = {
  cover: string;
  emoji: string;
  /** ピクセル幅。`fill` の場合は親要素いっぱいに広がる aspect 比固定の枠を出す。 */
  size?: number | "fill";
  rounded?: "sm" | "md" | "none";
};

const Thumbnail = ({
  cover,
  emoji,
  size = 32,
  rounded = "sm",
}: ThumbnailProps) => {
  const radiusClass =
    rounded === "none" ? "" : rounded === "md" ? "rounded-md" : "rounded";
  if (size === "fill") {
    return (
      <div
        className={`flex aspect-4/3 w-full items-center justify-center overflow-hidden ${radiusClass}`}
        style={{ background: cover, fontSize: 56, lineHeight: 1 }}
        aria-hidden
      >
        <span>{emoji}</span>
      </div>
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden ${radiusClass}`}
      style={{
        width: size,
        height: size,
        background: cover,
        fontSize: Math.round(size * 0.55),
        lineHeight: 1,
      }}
      aria-hidden
    >
      <span>{emoji}</span>
    </div>
  );
};

// ─────────────────────── Grid view ───────────────────────

type CatalogGridProps = {
  items: Item[];
  selected: Set<string>;
  onToggle: (id: string) => void;
};

const CatalogGrid = ({ items, selected, onToggle }: CatalogGridProps) => {
  if (items.length === 0) {
    return (
      <div className="grid place-items-center px-4 py-16 text-sm text-muted-foreground">
        No items match the current filters.
      </div>
    );
  }
  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const isSelected = selected.has(item.id);
        return (
          <article
            key={item.id}
            className={
              "group relative flex flex-col overflow-hidden rounded-xl border bg-card transition hover:shadow-md " +
              (isSelected ? "ring-2 ring-primary" : "")
            }
          >
            <div className="relative">
              <Thumbnail cover={item.cover} emoji={item.emoji} size="fill" rounded="none" />
              {/* 選択チェックボックスはサムネイル左上にオーバーレイ。 */}
              <label
                className={
                  "absolute left-2 top-2 inline-flex size-6 items-center justify-center rounded-md bg-card/90 shadow-sm backdrop-blur transition-opacity " +
                  (isSelected
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 focus-within:opacity-100")
                }
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggle(item.id)}
                  aria-label={`${item.name} — Select item`}
                />
              </label>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="min-w-0 truncate text-sm font-semibold">
                  {item.name}
                </h3>
                <Badge variant={STATUS_VARIANT[item.status]}>
                  {STATUS_LABEL[item.status]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {item.sku} · {item.category}
              </p>
              <div className="mt-auto flex items-end justify-between gap-2">
                <span className="truncate text-xs text-muted-foreground">
                  {item.supplier}
                </span>
                <span className="tabular-nums text-sm font-medium">
                  {formatJpy(item.price)}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

// ─────────────────────── Catalog panel ───────────────────────

const CatalogPanel = () => {
  const [view, setView] = useState<ViewMode>("grid");
  // grid は 12 / 24 件、list は 10 / 25 件が標準。view 切替時に
  // 端数のページに飛ばないよう、初期 pageSize は両方で扱える 12 にしている。
  const { variables, control } = useCollectionVariables({
    params: { pageSize: 12 },
  });
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    control.goToFirstPage();
  }, [status, keyword, view, control.goToFirstPage]);

  const filteredRows = useMemo(
    () =>
      ITEMS.filter((row) => {
        if (status !== "ALL" && row.status !== status) return false;
        if (
          keyword &&
          !`${row.sku} ${row.name} ${row.category} ${row.supplier}`
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

  const { column } = createColumnHelper<Item>();
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
            aria-label={`${row.sku} — Select row`}
          />
        ),
      }),
      column({
        id: "thumbnail",
        // 32px サムネ + 左右パディングが収まる程度の最小幅。
        width: 56,
        label: "",
        render: (row) => (
          <Thumbnail cover={row.cover} emoji={row.emoji} size={32} />
        ),
      }),
      column({
        id: "sku",
        label: "SKU",
        render: (row) => (
          <span className="font-mono text-xs">{row.sku}</span>
        ),
      }),
      column({
        id: "name",
        label: "Name",
        render: (row) => <span className="truncate">{row.name}</span>,
      }),
      column({
        id: "category",
        label: "Category",
        render: (row) => (
          <span className="text-muted-foreground">{row.category}</span>
        ),
      }),
      column({
        id: "status",
        label: "Status",
        render: (row) => (
          <Badge variant={STATUS_VARIANT[row.status]}>
            {STATUS_LABEL[row.status]}
          </Badge>
        ),
      }),
      column({
        id: "price",
        label: "Price",
        render: (row) => (
          <span className="tabular-nums">{formatJpy(row.price)}</span>
        ),
      }),
      column({
        id: "supplier",
        label: "Supplier",
        render: (row) => <span className="truncate">{row.supplier}</span>,
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
              <Tabs.List aria-label="Stock status" className="min-w-0 shrink">
                {STATUS_OPTIONS.map((opt) => (
                  <Tabs.Tab key={opt.value} value={opt.value}>
                    {opt.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.Root>
            <div className="flex items-center gap-2">
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search SKU / name / supplier"
                className="w-44 max-w-xs sm:w-auto sm:min-w-56"
              />
              {/* View toggle: grid / list. icon-only Tabs.Tab は default の
                  px-3 だと余白が大きいので px-2 に詰める。 */}
              <Tabs.Root
                value={view}
                onValueChange={(v) => setView(v as ViewMode)}
                className="w-fit gap-0"
              >
                <Tabs.List aria-label="View mode">
                  <Tabs.Tab
                    value="grid"
                    aria-label="Grid view"
                    className="px-2"
                  >
                    <LayoutGrid className="size-4" aria-hidden />
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="list"
                    aria-label="List view"
                    className="px-2"
                  >
                    <ListIcon className="size-4" aria-hidden />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.Root>
            </div>
          </div>
        )}
      </DataTable.Toolbar>
      {view === "list" ? (
        <DataTable.Table />
      ) : (
        <CatalogGrid
          items={pageRows}
          selected={selected}
          onToggle={toggle}
        />
      )}
      <DataTable.Footer>
        <DataTable.Pagination pageSizeOptions={[12, 24, 48]} />
      </DataTable.Footer>
    </DataTable.Root>
  );
};

// ─────────────────────── Page ───────────────────────

export const PageGridListTabsPage = () => (
  <Layout>
    <Layout.Header
      title="Catalog"
      actions={[
        <Button key="new" size="sm" type="button">
          New item
        </Button>,
      ]}
    />
    <Layout.Column>
      <CatalogPanel />
    </Layout.Column>
  </Layout>
);
