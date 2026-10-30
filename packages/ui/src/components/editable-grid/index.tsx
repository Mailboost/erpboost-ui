import { cn } from "@/lib/utils";
import { Badge } from "../badge";
import { ResizeHandle } from "../resize-handle";
import { Toolbar } from "../toolbar";
import { EmptyState } from "../empty-state";
import { Text } from "../text";
import { Pagination } from "../pagination";
import { Alert } from "../alert";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { SearchField } from "../search-field";
import { Select } from "../select";
import { Table } from "../table";
import { Tooltip } from "../tooltip";
import {
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUp,
  Copy,
  KeyRound,
  Link2,
  Maximize2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type {
  GridColumn,
  GridModel,
  GridRelation,
  GridValue,
  EditableGridProps,
} from "./types";
type DataColumn = GridColumn;
type DataModel = GridModel<GridColumn>;
type DataValue = GridValue;

import { GridColumnMenu as DataColumnMenu } from "./column-menu";
import {
  RecordPanel as Dialog,
  RecordPanelBody as DialogBody,
  RecordPanelFooter as DialogFooter,
} from "../record-panel";
import { LoadingPlaceholder as Skeleton } from "../loading-layouts";

type Row = Record<string, DataValue>;
type Sort = { column: string; direction: "asc" | "desc" };
export interface EditableGridState {
  search: string;
  sort: Sort | null;
  widths: Record<string, number>;
  frozen: string | null;
  selected: { row: string; column: string } | null;
  checked: string[];
  page: number;
  pageSize: number;
}
const defaultIdentity = (model: DataModel, row: Row) =>
  JSON.stringify(model.primaryKeys.map((key) => row[key]));
const defaultWidth = (column: DataColumn) =>
  column.name === "id"
    ? 120
    : column.type === "bool"
      ? 110
      : ["timestamp", "timestamptz", "date"].includes(column.type)
        ? 190
        : ["int2", "int4", "int8", "numeric", "float4", "float8"].includes(
              column.type,
            )
          ? 150
          : 250;
const display = (value: DataValue | undefined) =>
  value == null
    ? "NULL"
    : typeof value === "boolean"
      ? String(value).toUpperCase()
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);

export function EditableGrid<C extends GridColumn>({
  model,
  data,
  relations,
  pending,
  fetching,
  error,
  viewSwitch,
  initialState,
  onStateChange,
  onRefresh,
  onOpen,
  onAdd,
  onAddColumn,
  onEditColumn,
  onSaveCell,
  onDelete,
  container,
  renderEditor,
  rowKey,
  rowLimit,
}: EditableGridProps<C>) {
  const identity = (_model: GridModel<C>, row: Row) =>
    rowKey ? rowKey(row) : defaultIdentity(model, row);
  const grid = useRef<HTMLDivElement>(null);
  const columnSelectId = useId();
  const directionSelectId = useId();
  const [sortOpen, setSortOpen] = useState(false);
  const [search, setSearch] = useState(initialState?.search ?? "");
  const [sort, setSort] = useState<Sort | null>(initialState?.sort ?? null);
  const [widths, setWidths] = useState<Record<string, number>>(
    initialState?.widths ?? {},
  );
  const [frozen, setFrozen] = useState<string | null>(
    initialState?.frozen ?? null,
  );
  const [selected, setSelected] = useState<{
    row: string;
    column: string;
  } | null>(initialState?.selected ?? null);
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(initialState?.checked ?? []),
  );
  const [page, setPage] = useState(initialState?.page ?? 1);
  const [pageSize, setPageSize] = useState(initialState?.pageSize ?? 100);
  useEffect(
    () =>
      onStateChange({
        search,
        sort,
        widths,
        frozen,
        selected,
        checked: [...checked],
        page,
        pageSize,
      }),
    [
      search,
      sort,
      widths,
      frozen,
      selected,
      checked,
      page,
      pageSize,
      onStateChange,
    ],
  );
  const [copyError, setCopyError] = useState("");
  const [deletingRows, setDeletingRows] = useState<Row[] | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [editor, setEditor] = useState<{
    row: Row;
    column: C;
    anchor: DOMRect;
  } | null>(null);
  const cellTrigger = useRef<HTMLTableCellElement | null>(null);
  const columns = useMemo(() => model.columns, [model]);
  const visible = useMemo(() => {
    const found = data.filter((row) =>
      Object.values(row).some(
        (value) =>
          value != null &&
          display(value).toLowerCase().includes(search.trim().toLowerCase()),
      ),
    );
    if (!sort) return found;
    return [...found].sort((a, b) => {
      const left = a[sort.column],
        right = b[sort.column];
      if (left == null || right == null)
        return left == null ? (right == null ? 0 : 1) : -1;
      const comparison =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : display(left).localeCompare(display(right), "ja", {
              numeric: true,
            });
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [data, search, sort]);
  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, pages);
  const rows = visible.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  useEffect(() => {
    if (
      !pending &&
      selected &&
      !rows.some((row) => identity(model, row) === selected.row)
    )
      setSelected(null);
  }, [rows, model, selected, pending]);
  const pageKeys = rows.map((row) => identity(model, row));
  const checkedCount = data.filter((row) =>
    checked.has(identity(model, row)),
  ).length;
  const pageChecked =
    pageKeys.length > 0 && pageKeys.every((key) => checked.has(key));
  const sizes = columns.map(
    (column) => widths[column.name] ?? defaultWidth(column),
  );
  const freezeIndex = columns.findIndex((column) => column.name === frozen);
  const styleFor = (index: number): CSSProperties | undefined =>
    index <= freezeIndex
      ? {
          left:
            112 + sizes.slice(0, index).reduce((sum, size) => sum + size, 0),
        }
      : undefined;
  const frozenCellClassName = (index: number) =>
    index <= freezeIndex ? "astw:sticky astw:z-3 astw:bg-card" : undefined;
  const closeEditor = useCallback(() => {
    setEditor(null);
    requestAnimationFrame(
      () => cellTrigger.current?.isConnected && cellTrigger.current.focus(),
    );
  }, []);
  function openCell(row: Row, column: C, cell: HTMLTableCellElement) {
    if (!column.editable) return;
    cellTrigger.current = cell;
    setEditor({ row, column, anchor: cell.getBoundingClientRect() });
  }
  function moveCell(rowIndex: number, columnIndex: number, key: string) {
    const row = Math.max(
      0,
      Math.min(
        rows.length - 1,
        rowIndex + (key === "ArrowDown" ? 1 : key === "ArrowUp" ? -1 : 0),
      ),
    );
    const column = Math.max(
      0,
      Math.min(
        columns.length - 1,
        columnIndex + (key === "ArrowRight" ? 1 : key === "ArrowLeft" ? -1 : 0),
      ),
    );
    const cell = grid.current?.querySelector<HTMLTableCellElement>(
      `td[data-grid-row="${row}"][data-grid-column="${column}"]`,
    );
    cell?.focus();
    cell?.scrollIntoView({ block: "nearest", inline: "nearest" });
    if (cell && grid.current && column > freezeIndex) {
      const viewport = grid.current.getBoundingClientRect();
      const bounds = cell.getBoundingClientRect();
      const left =
        viewport.left +
        112 +
        sizes.slice(0, freezeIndex + 1).reduce((sum, width) => sum + width, 0);
      if (bounds.left < left) grid.current.scrollLeft -= left - bounds.left;
      else if (bounds.right > viewport.right)
        grid.current.scrollLeft += bounds.right - viewport.right;
    }
  }
  async function copyRows() {
    try {
      const items = data.filter((row) => checked.has(identity(model, row)));
      await navigator.clipboard.writeText(
        [
          columns.map((column) => column.name).join("\t"),
          ...items.map((row) =>
            columns
              .map((column) =>
                display(row[column.name])
                  .replaceAll("\t", " ")
                  .replaceAll("\n", " "),
              )
              .join("\t"),
          ),
        ].join("\n"),
      );
      setCopyError("");
    } catch {
      setCopyError("クリップボードへコピーできませんでした。");
    }
  }
  return (
    <div className="erpui-editable-grid astw:flex astw:flex-1 astw:flex-col astw:min-h-0 astw:min-w-0 astw:text-foreground astw:bg-card">
      <Toolbar.Row
        className={cn(
          "erpui-model-toolbar astw:flex astw:items-center astw:justify-between astw:shrink-0 astw:gap-3",
          "astw:min-h-10.5 astw:py-1.5 astw:px-[9px] astw:border-b astw:border-b-border astw:bg-card",
          "astw:[@media(max-width:650px)]:flex-wrap astw:[@media(max-width:650px)]:gap-[7px] erpui-grid-toolbar",
        )}
        aria-label="データの検索と操作"
      >
        {checkedCount ? (
          <div className="erpui-grid-selected-count astw:flex astw:items-center astw:gap-2.5 astw:text-[12px]">
            <span>{checkedCount} 件選択中</span>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="erpui-grid-tool"
                onClick={() => {
                  setDeleteError("");
                  setDeletingRows(
                    data.filter((row) => checked.has(identity(model, row))),
                  );
                }}
              >
                <Trash2 size={14} />
                行を削除
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="erpui-grid-tool"
              onClick={() => void copyRows()}
            >
              <Copy size={14} />
              コピー
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="erpui-grid-tool"
              onClick={() => setChecked(new Set())}
            >
              選択を解除
            </Button>
          </div>
        ) : (
          <SearchField
            clearLabel="検索をクリア"
            onClear={() => {
              setSearch("");
              setPage(1);
            }}
            aria-label="表示中のデータを検索"
            placeholder={`${columns
              .slice(0, 3)
              .map((column) => column.name)
              .join("、")}…で絞り込み`}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        )}
        <div className="erpui-model-actions astw:flex astw:items-center astw:gap-[7px] astw:shrink-0 astw:[@media(max-width:650px)]:ml-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSortOpen(true)}
          >
            <ArrowDownWideNarrow size={15} />
            並び替え{sort && <span>1</span>}
          </Button>
          {sortOpen && (
            <Dialog
              container={container}
              title="並び替え"
              onClose={() => setSortOpen(false)}
            >
              <DialogBody className="erpui-dialog-body">
                <div className="erpui-grid-sort-field astw:grid astw:gap-2">
                  <Text
                    variant="label-sm"
                    render={<label htmlFor={columnSelectId} />}
                  >
                    カラム
                  </Text>
                  <Select.Parts.Root
                    itemToStringLabel={(value) => value || "指定なし"}
                    value={String(sort?.column ?? "")}
                    onValueChange={(value) =>
                      setSort(
                        (value ?? "")
                          ? {
                              column: value ?? "",
                              direction: sort?.direction ?? "asc",
                            }
                          : null,
                      )
                    }
                  >
                    <Select.Parts.Trigger id={columnSelectId}>
                      <Select.Parts.Value />
                    </Select.Parts.Trigger>
                    <Select.Parts.Content container={container}>
                      <Select.Parts.Item value="">指定なし</Select.Parts.Item>
                      {columns.map((column) => (
                        <Select.Parts.Item
                          key={column.name}
                          value={String(column.name)}
                        >
                          {column.name}
                        </Select.Parts.Item>
                      ))}
                    </Select.Parts.Content>
                  </Select.Parts.Root>
                </div>
                {sort && (
                  <div className="erpui-grid-sort-field astw:grid astw:gap-2">
                    <Text
                      variant="label-sm"
                      render={<label htmlFor={directionSelectId} />}
                    >
                      順序
                    </Text>
                    <Select.Parts.Root
                      itemToStringLabel={(value) =>
                        value === "asc" ? "昇順" : "降順"
                      }
                      value={String(sort.direction)}
                      onValueChange={(value) =>
                        setSort({
                          ...sort,
                          direction: (value ?? "") as Sort["direction"],
                        })
                      }
                    >
                      <Select.Parts.Trigger id={directionSelectId}>
                        <Select.Parts.Value />
                      </Select.Parts.Trigger>
                      <Select.Parts.Content container={container}>
                        <Select.Parts.Item value="asc">昇順</Select.Parts.Item>
                        <Select.Parts.Item value="desc">降順</Select.Parts.Item>
                      </Select.Parts.Content>
                    </Select.Parts.Root>
                  </div>
                )}
              </DialogBody>
              <DialogFooter className="erpui-dialog-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSortOpen(false)}
                >
                  閉じる
                </Button>
              </DialogFooter>
            </Dialog>
          )}
          <Tooltip.Root>
            <Tooltip.Trigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="erpui-grid-tool erpui-grid-refresh"
                  aria-label="データを再読み込み"

                  disabled={fetching}
                  onClick={onRefresh}
                >
                  <RefreshCw
                    size={14}
                    className={
                      fetching
                        ? "erpui-spin astw:[.erpui-editable-grid_&]:animate-spin astw:motion-reduce:[.erpui-editable-grid_&]:animate-none"
                        : ""
                    }
                  />
                </Button>
              }
            />
            <Tooltip.Content container={container}>
              {"データを再読み込み"}
            </Tooltip.Content>
          </Tooltip.Root>
          {onAdd && (
            <Button
              variant="default"
              size="sm"
              type="button"
              className="erpui-button erpui-button-primary"
              aria-label="レコードを追加"
              disabled={pending}
              onClick={(event) => onAdd(event.currentTarget)}
            >
              <Plus size={14} />
              追加
            </Button>
          )}
        </div>
      </Toolbar.Row>
      {(error || copyError) && (
        <Alert.Root variant={"error"} className="erpui-ui-alert" role="alert">
          <Alert.Description>{error || copyError}</Alert.Description>
        </Alert.Root>
      )}
      <div
        ref={grid}
        className={cn(
          "erpui-model-columns astw:min-h-0 astw:overflow-auto astw:flex-1 astw:[scrollbar-width:thin]",
          "astw:[scrollbar-color:var(--input)_var(--card)] erpui-record-grid",
        )}
      >
        <Table.Root
          containerClassName="erpui-ui-table-container astw:[.erpui-editable-grid_&]:overflow-visible astw:[.erpui-editable-grid_&]:static"
          className={cn(
            "erpui-record-table astw:[.erpui-editable-grid_&]:table-fixed",
            "astw:[.erpui-editable-grid_&_thead]:sticky astw:[.erpui-editable-grid_&_thead]:top-0",
            "astw:[.erpui-editable-grid_&_thead]:z-4 astw:[.erpui-editable-grid_&_thead]:bg-card",
            "astw:[&_th]:relative astw:[&_td>span:not([data-slot])]:block",
            "astw:[&_td>span:not([data-slot])]:overflow-hidden astw:[&_td>span:not([data-slot])]:text-ellipsis",
          )}
          role="grid"
          aria-label={`${model.name}のデータ`}
          aria-busy={pending}
          aria-rowcount={pending ? -1 : rows.length + 1}
          aria-colcount={columns.length + 2}
          style={{
            width: 112 + 56 + sizes.reduce((sum, size) => sum + size, 0),
          }}
        >
          <colgroup>
            <col className="astw:w-28" />
            {columns.map((column, index) => (
              <col key={column.name} style={{ width: sizes[index] }} />
            ))}
            <col className="astw:w-14" />
          </colgroup>
          <Table.Header>
            <Table.Row>
              <Table.Head data-row-control="">
                <Checkbox
                  indeterminate={
                    !pageChecked && pageKeys.some((key) => checked.has(key))
                  }
                  aria-label="表示中の行をすべて選択"
                  checked={pageChecked}
                  disabled={pending || !rows.length}
                  onCheckedChange={(checked) =>
                    setChecked((previous) => {
                      const next = new Set(previous);
                      for (const key of pageKeys)
                        checked ? next.add(key) : next.delete(key);
                      return next;
                    })
                  }
                />
              </Table.Head>
              {columns.map((column, index) => (
                <Table.Head
                  key={column.name}
                  className={cn(
                    frozenCellClassName(index),
                    index <= freezeIndex && "astw:z-5",
                  )}
                  style={styleFor(index)}
                  aria-sort={
                    sort?.column === column.name
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <div className="erpui-column-heading astw:flex astw:items-center astw:gap-2 astw:min-w-0">
                    <span
                      className="erpui-column-label astw:flex astw:items-center astw:gap-2 astw:min-w-0 astw:flex-1 astw:flex-wrap"
                      title={`${column.name} · ${column.label}`}
                    >
                      {model.primaryKeys.includes(column.name) ? (
                        <KeyRound size={14} />
                      ) : relations.some(
                          (relation) =>
                            relation.fromTable === model.name &&
                            relation.fromField === column.name,
                        ) ? (
                        <Link2 size={14} />
                      ) : null}
                      <span>{column.name}</span>
                      <Badge variant="neutral">{column.type}</Badge>
                      {sort?.column === column.name &&
                        (sort.direction === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        ))}
                    </span>
                    <DataColumnMenu
                      container={container}
                      name={column.name}
                      onSort={(direction) =>
                        setSort({ column: column.name, direction })
                      }
                      onEdit={
                        onEditColumn ? () => onEditColumn(column) : undefined
                      }
                      frozen={frozen === column.name}
                      onFreeze={() =>
                        setFrozen(frozen === column.name ? null : column.name)
                      }
                    />
                  </div>
                  <ResizeHandle
                    orientation="vertical"
                    aria-valuemin={80}
                    aria-valuemax={640}
                    aria-valuenow={sizes[index]}
                    aria-label={`${column.name}のカラム幅`}
                    tabIndex={0}
                    className={cn(
                      "erpui-grid-resize astw:absolute astw:top-0 astw:right-[-3px] astw:z-7 astw:w-1.5 astw:h-full",
                      "astw:cursor-col-resize astw:touch-none astw:[&:hover]:bg-ring astw:[&:hover]:outline-none",
                      "astw:[&:focus-visible]:bg-ring astw:[&:focus-visible]:outline-none",
                    )}
                    onDoubleClick={() =>
                      setWidths((previous) => ({
                        ...previous,
                        [column.name]: defaultWidth(column),
                      }))
                    }
                    onKeyDown={(event) => {
                      if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
                        event.preventDefault();
                        setWidths((previous) => ({
                          ...previous,
                          [column.name]: Math.max(
                            80,
                            Math.min(
                              640,
                              sizes[index] +
                                (event.key === "ArrowRight" ? 16 : -16),
                            ),
                          ),
                        }));
                      }
                    }}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      const target = event.currentTarget;
                      target.setPointerCapture(event.pointerId);
                      target.dataset.startX = String(event.clientX);
                      target.dataset.startWidth = String(sizes[index]);
                    }}
                    onPointerMove={(event) => {
                      if (
                        event.currentTarget.hasPointerCapture(event.pointerId)
                      ) {
                        const width =
                          Number(event.currentTarget.dataset.startWidth) +
                          event.clientX -
                          Number(event.currentTarget.dataset.startX);
                        setWidths((previous) => ({
                          ...previous,
                          [column.name]: Math.max(80, Math.min(640, width)),
                        }));
                      }
                    }}
                    onPointerUp={(event) => {
                      if (
                        event.currentTarget.hasPointerCapture(event.pointerId)
                      )
                        event.currentTarget.releasePointerCapture(
                          event.pointerId,
                        );
                    }}
                  />
                </Table.Head>
              ))}
              <Table.Head
                className={cn(
                  "erpui-record-add-column astw:[.erpui-record-table_&]:w-14 astw:[.erpui-record-table_&]:min-w-14",
                  "astw:[.erpui-record-table_&]:p-0 astw:[&>button]:my-0 astw:[&>button]:mx-auto",
                )}
              >
                <Tooltip.Root>
                  <Tooltip.Trigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        aria-label="カラムを追加"

                        disabled={pending || !onAddColumn}
                        onClick={onAddColumn}
                      >
                        <Plus size={18} />
                      </Button>
                    }
                  />
                  <Tooltip.Content container={container}>
                    {"カラムを追加"}
                  </Tooltip.Content>
                </Tooltip.Root>
              </Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {pending &&
              Array.from({ length: 8 }, (_, row) => (
                <Table.Row
                  key={`pending-${row}`}
                  className="erpui-grid-skeleton-row astw:[&_td]:h-11 astw:[&_td]:py-3 astw:[&_td]:px-4"
                  aria-hidden="true"
                >
                  <Table.Cell data-row-control="">
                    <Skeleton className="erpui-skeleton-icon astw:[.erpui-editable-grid_&]:w-4 astw:[.erpui-editable-grid_&]:h-4" />
                  </Table.Cell>
                  {columns.map((column, index) => (
                    <Table.Cell
                      key={column.name}
                      className={frozenCellClassName(index)}
                      style={styleFor(index)}
                    >
                      <Skeleton />
                    </Table.Cell>
                  ))}
                  <Table.Cell />
                </Table.Row>
              ))}
            {!pending &&
              rows.map((row, rowIndex) => {
                const key = identity(model, row);
                return (
                  <Table.Row
                    key={key}
                    aria-selected={checked.has(key)}
                    data-state={checked.has(key) ? "selected" : undefined}
                  >
                    <Table.Cell data-row-control="">
                      <div className="erpui-grid-row-controls astw:flex astw:items-center astw:gap-2 astw:min-w-0 astw:flex-nowrap">
                        <Checkbox
                          aria-label={`レコード ${rowIndex + 1}を選択`}
                          checked={checked.has(key)}
                          onCheckedChange={(checked) =>
                            setChecked((previous) => {
                              const next = new Set(previous);
                              checked ? next.add(key) : next.delete(key);
                              return next;
                            })
                          }
                        />
                        <Tooltip.Root>
                          <Tooltip.Trigger
                            render={
                              <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                aria-label={`レコード ${rowIndex + 1}の詳細を表示`}

                                aria-haspopup="dialog"
                                onClick={(event) =>
                                  onOpen(row, event.currentTarget)
                                }
                              >
                                <Maximize2 size={13} />
                              </Button>
                            }
                          />
                          <Tooltip.Content container={container}>
                            {"行を開く"}
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </div>
                    </Table.Cell>
                    {columns.map((column, columnIndex) => {
                      const active =
                        selected?.row === key &&
                        selected.column === column.name;
                      const value = row[column.name];
                      return (
                        <Table.Cell
                          key={column.name}
                          role="gridcell"
                          aria-selected={active}
                          aria-readonly={!column.editable}
                          aria-label={`${column.name}: ${display(value)}`}
                          tabIndex={
                            active ||
                            (!selected && rowIndex === 0 && columnIndex === 0)
                              ? 0
                              : -1
                          }
                          data-grid-row={rowIndex}
                          data-grid-column={columnIndex}
                          className={frozenCellClassName(columnIndex)}
                          style={styleFor(columnIndex)}
                          onFocus={() =>
                            setSelected({ row: key, column: column.name })
                          }
                          onClick={(event) => {
                            setSelected({ row: key, column: column.name });
                            event.currentTarget.focus();
                          }}
                          onDoubleClick={(event) =>
                            openCell(row, column, event.currentTarget)
                          }
                          onKeyDown={(event) => {
                            if (
                              [
                                "ArrowLeft",
                                "ArrowRight",
                                "ArrowUp",
                                "ArrowDown",
                              ].includes(event.key)
                            ) {
                              event.preventDefault();
                              moveCell(rowIndex, columnIndex, event.key);
                            } else if (["Enter", "F2"].includes(event.key)) {
                              event.preventDefault();
                              openCell(row, column, event.currentTarget);
                            } else if (
                              (event.metaKey || event.ctrlKey) &&
                              event.key === "c"
                            ) {
                              event.preventDefault();
                              void navigator.clipboard
                                .writeText(display(value))
                                .catch(() =>
                                  setCopyError("コピーできませんでした。"),
                                );
                            }
                          }}
                        >
                          <span
                            title={value == null ? undefined : display(value)}
                            className={
                              value == null
                                ? "erpui-record-null astw:text-muted-foreground! astw:italic"
                                : model.primaryKeys.includes(column.name)
                                  ? "erpui-record-id astw:tabular-nums"
                                  : ""
                            }
                          >
                            {display(value)}
                          </span>
                        </Table.Cell>
                      );
                    })}
                    <Table.Cell
                      className={cn(
                        "erpui-record-add-column astw:[.erpui-record-table_&]:w-14 astw:[.erpui-record-table_&]:min-w-14",
                        "astw:[.erpui-record-table_&]:p-0 astw:[&>button]:my-0 astw:[&>button]:mx-auto",
                      )}
                      aria-hidden="true"
                    />
                  </Table.Row>
                );
              })}
          </Table.Body>
        </Table.Root>
        {pending && (
          <span className="erpui-sr-only astw:sr-only" role="status">
            行データを読み込んでいます
          </span>
        )}
        {!pending && !rows.length && !error && (
          <EmptyState
            className="erpui-data-empty astw:min-h-50 astw:h-[calc(100%_-_36px)]"
            title={
              search
                ? "該当するデータがありません"
                : "このテーブルにはデータがありません"
            }
          />
        )}
      </div>
      <div
        className={cn(
          "erpui-model-table-footer astw:flex astw:items-center astw:justify-between astw:shrink-0 astw:gap-3",
          "astw:min-h-10 astw:py-[5px] astw:px-[9px] astw:border-t astw:border-t-border astw:bg-card",
          "astw:text-foreground astw:text-[12px] astw:[@media(max-width:650px)]:flex-wrap",
        )}
      >
        <div
          className={cn(
            "erpui-grid-pagination astw:flex astw:items-center astw:gap-2 astw:tabular-nums astw:flex-wrap",
            "astw:[@media(max-width:650px)]:gap-[5px] astw:[@media(max-width:650px)]:flex-wrap",
            "astw:[@media(max-width:650px)]:[&>span:last-child]:hidden",
          )}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={pages}
            hasPrevPage={currentPage > 1}
            hasNextPage={currentPage < pages}
            onFirstPage={() => setPage(1)}
            onPreviousPage={() => setPage(currentPage - 1)}
            onNextPage={() => setPage(currentPage + 1)}
            onLastPage={() => setPage(pages)}
            onPageChange={setPage}
            pageSize={pageSize}
            pageSizeOptions={[25, 50, 100]}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            disabled={pending}
            container={container}
          />
          {pending ? (
            <Skeleton className="erpui-skeleton-count astw:[.erpui-editable-grid_&]:w-6 astw:[.erpui-editable-grid_&]:h-2.5" />
          ) : (
            <span>{visible.length} 件</span>
          )}
          {rowLimit !== undefined && data.length === rowLimit && (
            <span className="erpui-grid-limit astw:text-muted-foreground astw:text-[11px] astw:[@media(max-width:900px)]:hidden">
              取得済み{rowLimit}件
            </span>
          )}
        </div>
        {viewSwitch}
      </div>
      {editor &&
        renderEditor({
          column: editor.column,
          row: editor.row,
          anchor: editor.anchor,
          onClose: closeEditor,
          onSave: (value) => onSaveCell(editor.row, editor.column, value),
        })}
      {deletingRows && (
        <Dialog
          container={container}
          title="選択した行を削除"
          error={deleteError || undefined}
          closeDisabled={deleteBusy}
          onClose={() => setDeletingRows(null)}
        >
          <DialogBody className="erpui-dialog-body">
            <p>
              「{model.name}」の選択した{deletingRows.length}行を削除します。
            </p>
          </DialogBody>
          <DialogFooter className="erpui-dialog-actions">
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="erpui-button erpui-button-secondary"
              disabled={deleteBusy}
              onClick={() => setDeletingRows(null)}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              size="sm"
              type="button"
              className="erpui-button erpui-button-danger"
              disabled={deleteBusy}
              onClick={() => {
                if (!onDelete || deleteBusy) return;
                setDeleteBusy(true);
                setDeleteError("");
                void onDelete(deletingRows)
                  .then(() => {
                    setChecked(new Set());
                    setDeletingRows(null);
                  })
                  .catch((error: unknown) =>
                    setDeleteError(
                      error instanceof Error
                        ? error.message
                        : "行を削除できませんでした。",
                    ),
                  )
                  .finally(() => setDeleteBusy(false));
              }}
            >
              {deleteBusy ? "削除中…" : "削除"}
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}

export type {
  EditableGridProps,
  GridColumn,
  GridModel,
  GridRow,
  GridValue,
} from "./types";
