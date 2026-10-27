// Reference example: https://ui.tailor.tech/patterns/datatable-inline-edit
import { useCallback, useMemo, useState } from "react";
import {
  Badge,
  type BadgeProps,
  Button,
  DataTable,
  Input,
  Menu,
  createColumnHelper,
  useDataTable,
  useToast,
} from "@mailboost/erpboost-ui";
import { Check, ChevronDown, Pencil } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../shared/popover";
import { Checkbox } from "../shared/checkbox";

export type StatusValue = "draft" | "active" | "hold";

export type EditableRow = {
  id: string;
  sku: string;
  label: string;
  quantity: number;
  owner: string;
  status: StatusValue;
  confirmed: boolean;
};

type Props = {
  initialRows: EditableRow[];
};

const statusOptions: { value: StatusValue; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "hold", label: "Hold" },
];

const statusLabel = (value: StatusValue) =>
  statusOptions.find((option) => option.value === value)?.label ?? value;

/** Status 値ごとの Badge variant。Status の意味付けはアプリ側で持つ。 */
const STATUS_BADGE_VARIANT: Record<
  StatusValue,
  "outline-neutral" | "success" | "warning"
> = {
  draft: "outline-neutral",
  active: "success",
  hold: "warning",
};

/**
 * Popover ベースの編集セル。
 * トリガをクリックすると Popover に Input + Save/Cancel が出る。
 * Enter で保存 / Esc・blur で破棄。表示中は変更を呼び出し元に伝えない。
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
 * 列挙値（ステータスなど）の編集に使うと、現在値の意味付けと「クリックで切り替えられる」
 * というアフォーダンスをひとつのセルで両立できる。
 *
 * Select は frame / chevron などの装飾が固定で“フォーム入力”の見た目になりがちなので、
 * セル内編集では Menu + 自前トリガの方が見た目を素のテキストに馴染ませやすい。
 */
type BadgeMenuCellProps<V extends string> = {
  /** 現在値。RadioGroup の選択状態として使う。 */
  value: V;
  /** Badge 内に表示するテキスト。 */
  display: string;
  /** Badge variant。値ごとに色分けして意味付けする。 */
  variant: BadgeProps["variant"];
  options: { value: V; label: string }[];
  /** 確定時に呼ばれる。コミット直後に toast を出すと、保存された印象を与えやすい。 */
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

/**
 * インライン Checkbox。
 * クリック直後に確定する軽量フィールド向け。
 */
type InlineCheckboxCellProps = {
  ariaLabel: string;
  value: boolean;
  onCommit: (next: boolean) => void;
};

const InlineCheckboxCell = ({
  ariaLabel,
  value,
  onCommit,
}: InlineCheckboxCellProps) => (
  <div className="flex items-center justify-center">
    <Checkbox
      aria-label={ariaLabel}
      checked={value}
      onCheckedChange={(next) => onCommit(next === true)}
    />
  </div>
);

export const DatatableInlineEdit = ({ initialRows }: Props) => {
  const [rows, setRows] = useState<EditableRow[]>(initialRows);
  const toast = useToast();

  const updateRow = useCallback(
    (id: string, patch: Partial<EditableRow>) => {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    },
    [],
  );

  const updateStatus = useCallback(
    (row: EditableRow, next: StatusValue) => {
      updateRow(row.id, { status: next });
      // Badge select は即時確定のため、保存された旨を toast で明示する。
      toast.success("Status updated", {
        description: `${row.sku} → ${statusLabel(next)}`,
      });
    },
    [toast, updateRow],
  );

  const { column } = createColumnHelper<EditableRow>();
  const columns = useMemo(
    () => [
      column({
        id: "sku",
        label: "SKU",
        render: (row) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.sku}
          </span>
        ),
      }),
      column({
        id: "label",
        label: "Label",
        render: (row) => (
          <PopoverEditCell
            label="Label"
            value={row.label}
            onCommit={(next) => updateRow(row.id, { label: next })}
          />
        ),
      }),
      column({
        id: "quantity",
        label: "Qty",
        render: (row) => (
          <PopoverEditCell
            label="Quantity"
            type="number"
            align="right"
            width="w-48"
            value={String(row.quantity)}
            onCommit={(next) => {
              const parsed = Number.parseInt(next, 10);
              updateRow(row.id, {
                quantity: Number.isFinite(parsed) ? Math.max(0, parsed) : 0,
              });
            }}
          />
        ),
      }),
      column({
        id: "owner",
        label: "Owner",
        render: (row) => (
          <PopoverEditCell
            label="Owner"
            value={row.owner}
            onCommit={(next) => updateRow(row.id, { owner: next })}
          />
        ),
      }),
      column({
        id: "status",
        label: "Status",
        render: (row) => (
          <BadgeMenuCell
            value={row.status}
            display={statusLabel(row.status)}
            variant={STATUS_BADGE_VARIANT[row.status]}
            options={statusOptions}
            onCommit={(next) => updateStatus(row, next)}
          />
        ),
      }),
      column({
        id: "confirmed",
        label: "Confirmed",
        render: (row) => (
          <InlineCheckboxCell
            ariaLabel={`Confirm ${row.label}`}
            value={row.confirmed}
            onCommit={(next) => updateRow(row.id, { confirmed: next })}
          />
        ),
      }),
    ],
    [column, updateRow, updateStatus],
  );

  const table = useDataTable<EditableRow>({
    columns,
    data: { rows, total: rows.length },
  });

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Click a text or number cell to open a Popover and commit with Save or
        Enter. Status opens a Menu (RadioGroup) from the Badge + chevron-down
        trigger, applies immediately, and shows a toast on commit. Confirmed
        commits instantly via the Checkbox.
      </p>
      <DataTable.Root value={table}>
        <DataTable.Table />
      </DataTable.Root>
    </div>
  );
};
