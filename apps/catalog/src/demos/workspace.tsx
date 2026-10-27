import { useState } from "react";
import { Badge, Button, Dialog, Input, Sheet } from "@mailboost/erpboost-ui";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Grid2X2,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useLocale } from "../locale";

export interface Order {
  id: string;
  supplier: string;
  reference: string;
  status: string;
  date: string;
  amount: number;
  note?: string;
}
export const initialOrders: Order[] = Array.from({ length: 36 }, (_, i) => ({
  id: `PO-2026-${1001 + i}`,
  supplier: [
    "ERPboost Supply Co.",
    "East Works Ltd.",
    "Northwind Components",
    "Aoba Precision",
    "Harbor Logistics",
  ][i % 5],
  reference: `RFQ-${441 + i}`,
  status: ["Ordered", "Submitted", "Draft", "Closed", "Cancelled"][i % 5],
  date: `2026-${String((i % 9) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
  amount: 35317 + i * 11317,
}));
export const money = (value: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(
    value,
  );
export function Status({ value }: { value: string }) {
  return (
    <Badge
      variant={
        value === "Ordered" || value === "Approved"
          ? "success"
          : value === "Cancelled"
            ? "error"
            : value === "Submitted" || value === "Pending"
              ? "warning"
              : "neutral"
      }
    >
      {value}
    </Badge>
  );
}
export function MiniSidebar({ active = "Orders" }: { active?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`demo-sidebar ${collapsed ? "narrow" : ""}`}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Collapse preview sidebar"
        onClick={() => setCollapsed(!collapsed)}
      >
        <List size={16} />
      </Button>
      {!collapsed && (
        <>
          <strong>ERPboost</strong>
          {["Home", "Orders", "Products", "Suppliers", "Reports"].map(
            (name) => (
              <button
                key={name}
                className={active === name ? "active" : ""}
                onClick={() => {
                  document.getElementById("preview-content")?.focus();
                }}
              >
                <span className="nav-dot" />
                {name}
              </button>
            ),
          )}
        </>
      )}
    </aside>
  );
}
export function RecordDetails({
  order = initialOrders[0],
  onUpdate,
}: {
  order?: Order;
  onUpdate?: (order: Order) => void;
}) {
  const [status, setStatus] = useState(order.status);
  const [note, setNote] = useState(
    order.note ?? "Please deliver during business hours.",
  );
  const [saved, setSaved] = useState(false);
  function updateStatus(next: string) {
    setStatus(next);
    onUpdate?.({ ...order, status: next });
  }
  return (
    <div className="detail-layout">
      <div className="stack">
        <div className="demo-heading">
          <div>
            <p className="muted small">Purchase order</p>
            <h2>{order.id}</h2>
          </div>
          <Status value={status} />
        </div>
        <div className="demo-card">
          <h3>Order information</h3>
          <dl className="description-grid">
            {[
              ["Supplier", order.supplier],
              ["Reference", order.reference],
              ["Order date", order.date],
              ["Total", money(order.amount)],
            ].map(([name, value]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="demo-card">
          <h3>Line items</h3>
          <div className="table-scroll">
            <table className="demo-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {["Steel bracket", "Hex bolt M8", "Precision bearing"].map(
                  (name, i) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{(i + 1) * 10}</td>
                      <td>{money(1200 + i * 380)}</td>
                      <td>{money((i + 1) * 10 * (1200 + i * 380))}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="demo-card">
          <h3>Notes</h3>
          <textarea
            aria-label="Order notes"
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setSaved(false);
            }}
          />
          <div className="row justify-end">
            <span role="status" className="small muted">
              {saved ? "Saved in this preview" : ""}
            </span>
            <Button
              variant="outline"
              onClick={() => {
                onUpdate?.({ ...order, status, note });
                setSaved(true);
              }}
            >
              Save notes
            </Button>
          </div>
        </div>
        <div className="demo-card">
          <h3>Activity</h3>
          <p className="small">
            <strong>Jordan Mitchell</strong> created the order{" "}
            <span className="muted">· Today, 10:30</span>
          </p>
          <p className="small muted">
            The supplier confirmed the requested delivery date.
          </p>
        </div>
      </div>
      <div className="demo-card actions-panel">
        <h3>Actions</h3>
        <Button
          onClick={() =>
            updateStatus(status === "Ordered" ? "Draft" : "Ordered")
          }
        >
          <Check size={15} />
          {status === "Ordered" ? "Reopen draft" : "Approve order"}
        </Button>
        <Button
          variant="outline"
          onClick={() => downloadCsv([{ ...order, status, note }])}
        >
          <Download size={15} />
          Export order
        </Button>
        <Button variant="ghost" onClick={() => updateStatus("Cancelled")}>
          <X size={15} />
          Cancel order
        </Button>
      </div>
    </div>
  );
}
export function downloadCsv(rows: Order[]) {
  const quote = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [
    ["Order", "Supplier", "Reference", "Status", "Date", "Amount"],
    ...rows.map((o) => [
      o.id,
      o.supplier,
      o.reference,
      o.status,
      o.date,
      o.amount,
    ]),
  ]
    .map((row) => row.map(quote).join(","))
    .join("\r\n");
  const link = document.createElement("a");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
  );
  link.href = url;
  link.download = "orders.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Collection({
  inline = false,
  grid = false,
}: {
  inline?: boolean;
  grid?: boolean;
}) {
  const { t } = useLocale();
  const [rows, setRows] = useState(initialOrders),
    [status, setStatus] = useState("All"),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(0),
    [selected, setSelected] = useState<string[]>([]),
    [ascending, setAscending] = useState(true),
    [asGrid, setAsGrid] = useState(grid),
    [current, setCurrent] = useState<Order | null>(null),
    [creating, setCreating] = useState(false),
    [supplier, setSupplier] = useState("");
  const filtered = rows
    .filter(
      (o) =>
        (status === "All" || o.status === status) &&
        `${o.id} ${o.supplier} ${o.reference}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      ascending ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id),
    );
  const lastPage = Math.max(0, Math.ceil(filtered.length / 10) - 1),
    visible = filtered.slice(
      Math.min(page, lastPage) * 10,
      Math.min(page, lastPage) * 10 + 10,
    );
  function toggle(id: string) {
    setSelected((s) =>
      s.includes(id) ? s.filter((v) => v !== id) : [...s, id],
    );
  }
  return (
    <div className="workspace">
      <MiniSidebar />
      <div className="workspace-body" id="preview-content" tabIndex={-1}>
        <div className="demo-heading">
          <h2>{grid ? t("Catalog", "商品一覧") : t("Orders", "発注一覧")}</h2>
          <Button onClick={() => setCreating(true)}>
            <Plus size={15} />
            {t("New", "新規作成")}
          </Button>
        </div>
        <div className="status-tabs" role="tablist" aria-label="Order status">
          {["All", "Draft", "Submitted", "Ordered", "Closed", "Cancelled"].map(
            (s) => (
              <button
                role="tab"
                aria-selected={status === s}
                className={status === s ? "active" : ""}
                key={s}
                onClick={() => {
                  setStatus(s);
                  setPage(0);
                }}
              >
                {s}
              </button>
            ),
          )}
        </div>
        <div className="table-toolbar">
          <div className="search-input">
            <Search size={15} />
            <Input
              aria-label="Search orders"
              placeholder={t("Search orders...", "発注を検索...")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div className="row">
            <Button
              variant="outline"
              size="icon"
              aria-label="Grid view"
              onClick={() => setAsGrid(true)}
            >
              <Grid2X2 size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="List view"
              onClick={() => setAsGrid(false)}
            >
              <List size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Export data"
              onClick={() => downloadCsv(filtered)}
            >
              <Download size={16} />
            </Button>
          </div>
        </div>
        {selected.length > 0 && (
          <div className="bulk-bar">
            <span>{selected.length} selected</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setRows((r) =>
                  r.map((o) =>
                    selected.includes(o.id) ? { ...o, status: "Ordered" } : o,
                  ),
                );
                setSelected([]);
              }}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                downloadCsv(rows.filter((o) => selected.includes(o.id)))
              }
            >
              Export
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              Clear
            </Button>
          </div>
        )}
        {asGrid ? (
          <div className="product-grid">
            {visible.map((o, i) => (
              <button
                className="product-card"
                key={o.id}
                onClick={() => setCurrent(o)}
              >
                <div className={`product-illustration tone-${i % 4}`}>
                  <Grid2X2 size={40} />
                </div>
                <strong>
                  {
                    [
                      "Steel bracket",
                      "Hex bolt M8",
                      "Precision bearing",
                      "Cordless drill",
                    ][i % 4]
                  }
                </strong>
                <span className="muted small">
                  {o.id} · {o.supplier}
                </span>
                <div className="row between">
                  <Status value={o.status} />
                  <span>{money(o.amount)}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="table-scroll">
            <table className="demo-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      aria-label="Select all rows"
                      checked={
                        visible.length > 0 &&
                        visible.every((o) => selected.includes(o.id))
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? visible.map((o) => o.id) : [],
                        )
                      }
                    />
                  </th>
                  <th>
                    <button
                      className="row"
                      onClick={() => setAscending(!ascending)}
                    >
                      PO #{" "}
                      {ascending ? (
                        <ArrowUp size={13} />
                      ) : (
                        <ArrowDown size={13} />
                      )}
                    </button>
                  </th>
                  <th>Supplier</th>
                  <th>RFQ #</th>
                  <th>Status</th>
                  <th>Order date</th>
                  <th className="number">Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id} data-selected={selected.includes(o.id)}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${o.id}`}
                        checked={selected.includes(o.id)}
                        onChange={() => toggle(o.id)}
                      />
                    </td>
                    <td>
                      <button
                        className="record-link"
                        onClick={() => setCurrent(o)}
                      >
                        {o.id}
                      </button>
                    </td>
                    <td>{o.supplier}</td>
                    <td>
                      {inline ? (
                        <Input
                          aria-label={`Reference ${o.id}`}
                          value={o.reference}
                          onChange={(e) =>
                            setRows((r) =>
                              r.map((v) =>
                                v.id === o.id
                                  ? { ...v, reference: e.target.value }
                                  : v,
                              ),
                            )
                          }
                        />
                      ) : (
                        o.reference
                      )}
                    </td>
                    <td>
                      {inline ? (
                        <select
                          aria-label={`Status ${o.id}`}
                          value={o.status}
                          onChange={(e) =>
                            setRows((r) =>
                              r.map((v) =>
                                v.id === o.id
                                  ? { ...v, status: e.target.value }
                                  : v,
                              ),
                            )
                          }
                        >
                          {[
                            "Draft",
                            "Submitted",
                            "Ordered",
                            "Closed",
                            "Cancelled",
                          ].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <Status value={o.status} />
                      )}
                    </td>
                    <td>{o.date}</td>
                    <td className="number">{money(o.amount)}</td>
                    <td>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Open ${o.id}`}
                        onClick={() => setCurrent(o)}
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visible.length && (
              <p className="empty-state">No matching records.</p>
            )}
          </div>
        )}
        <div className="pagination">
          <span>{filtered.length} row(s)</span>
          <div className="row">
            <span>
              Page {Math.min(page, lastPage) + 1} / {lastPage + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous page"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next page"
              disabled={page >= lastPage}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
      <Sheet.Root
        open={!!current}
        onOpenChange={(open) => !open && setCurrent(null)}
      >
        <Sheet.Content className="record-sheet">
          <Sheet.Header>
            <Sheet.Title>{current?.id}</Sheet.Title>
            <Sheet.Description>
              Review purchase order details.
            </Sheet.Description>
          </Sheet.Header>
          <div className="sheet-scroll">
            {current && (
              <RecordDetails
                key={current.id}
                order={current}
                onUpdate={(updated) => {
                  setRows((items) =>
                    items.map((item) =>
                      item.id === updated.id ? updated : item,
                    ),
                  );
                  setCurrent(updated);
                }}
              />
            )}
          </div>
        </Sheet.Content>
      </Sheet.Root>
      <Dialog.Root open={creating} onOpenChange={setCreating}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>New order</Dialog.Title>
            <Dialog.Description>
              Create a sample purchase order in this preview.
            </Dialog.Description>
          </Dialog.Header>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setRows((r) => [
                {
                  id: `PO-2026-${1001 + r.length}`,
                  supplier,
                  reference: "RFQ-NEW",
                  status: "Draft",
                  date: "2026-10-27",
                  amount: 0,
                },
                ...r,
              ]);
              setSupplier("");
              setCreating(false);
              setStatus("All");
              setSearch("");
              setAscending(false);
              setPage(0);
            }}
          >
            <label className="form-field">
              Supplier
              <Input
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Supplier name"
              />
            </label>
            <Dialog.Footer>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreating(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create order</Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
export function Dashboard() {
  return (
    <div className="workspace">
      <MiniSidebar active="Reports" />
      <div className="workspace-body">
        <div className="demo-heading">
          <div>
            <h2>Dashboard</h2>
            <p className="muted small">
              An overview of your business performance.
            </p>
          </div>
          <Button variant="outline" onClick={() => downloadCsv(initialOrders)}>
            Export report <ArrowUpRight size={15} />
          </Button>
        </div>
        <div className="metric-grid">
          {[
            ["Total revenue", "¥12,840,000", "+12.8%"],
            ["Orders", "1,248", "+8.2%"],
            ["Average order", "¥10,288", "+4.3%"],
            ["Active suppliers", "86", "+6"],
          ].map(([title, value, trend]) => (
            <div className="demo-card" key={title}>
              <p className="muted small">{title}</p>
              <strong className="metric-value">{value}</strong>
              <span className="positive small">{trend} from last month</span>
            </div>
          ))}
        </div>
        <Charts />
        <div className="demo-card">
          <h3>Recent orders</h3>
          <table className="demo-table">
            <tbody>
              {initialOrders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.supplier}</td>
                  <td>
                    <Status value={o.status} />
                  </td>
                  <td className="number">{money(o.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export function Charts() {
  const [period, setPeriod] = useState("Monthly"),
    [hover, setHover] = useState<number | null>(null);
  const values =
    period === "Monthly"
      ? [42, 58, 48, 78, 63, 95, 85, 115, 98, 134, 122, 154]
      : [34, 61, 88, 120, 95, 143];
  return (
    <div className="demo-card">
      <div className="demo-heading">
        <div>
          <h3>Revenue overview</h3>
          <p className="small muted">
            {hover === null
              ? "Revenue over the selected period"
              : `${period} period ${hover + 1}: ${money(values[hover] * 10000)}`}
          </p>
        </div>
        <select
          aria-label="Chart period"
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            setHover(null);
          }}
        >
          <option>Monthly</option>
          <option>Quarterly</option>
        </select>
      </div>
      <div
        className="chart-bars"
        role="img"
        aria-label={`${period} revenue chart`}
      >
        {values.map((v, i) => (
          <div
            className="chart-column"
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div title={money(v * 10000)} style={{ height: `${v / 1.6}%` }} />
            <span>
              {period === "Monthly"
                ? new Date(2026, i, 1).toLocaleString("en", { month: "short" })
                : `Q${i + 1}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
export function MasterList() {
  const [rows, setRows] = useState([
      "ERPboost Supply Co.",
      "East Works Ltd.",
      "Northwind Components",
      "Aoba Precision",
      "Harbor Logistics",
    ]),
    [filter, setFilter] = useState(""),
    [editing, setEditing] = useState<number | null>(null),
    [value, setValue] = useState("");
  return (
    <div className="workspace">
      <MiniSidebar active="Suppliers" />
      <div className="workspace-body">
        <div className="demo-heading">
          <h2>Suppliers</h2>
          <Button
            onClick={() => {
              setEditing(-1);
              setValue("");
            }}
          >
            <Plus size={15} />
            New supplier
          </Button>
        </div>
        <Input
          aria-label="Search suppliers"
          placeholder="Search suppliers..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <table className="demo-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows
              .map((name, i) => ({ name, i }))
              .filter((r) =>
                r.name.toLowerCase().includes(filter.toLowerCase()),
              )
              .map(({ name, i }) => (
                <tr key={i}>
                  <td>{name}</td>
                  <td>SUP-{String(i + 1).padStart(4, "0")}</td>
                  <td>
                    <Badge variant="success">Active</Badge>
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(i);
                        setValue(name);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${name}`}
                      onClick={() =>
                        setRows((r) => r.filter((_, index) => index !== i))
                      }
                    >
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <Dialog.Root
          open={editing !== null}
          onOpenChange={(open) => !open && setEditing(null)}
        >
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {editing === -1 ? "New supplier" : "Edit supplier"}
              </Dialog.Title>
              <Dialog.Description>
                Changes are stored in this preview only.
              </Dialog.Description>
            </Dialog.Header>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setRows((r) =>
                  editing === -1
                    ? [...r, value]
                    : r.map((name, i) => (i === editing ? value : name)),
                );
                setEditing(null);
              }}
            >
              <label className="form-field">
                Supplier name
                <Input
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </label>
              <Dialog.Footer>
                <Button type="submit">Save supplier</Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </div>
  );
}
