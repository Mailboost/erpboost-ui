import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import { Table } from "../table";
import { RecordPanelFooter } from "../record-panel";
function Grid({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div className="erpui-form-grid-container astw:min-w-0 astw:@container/erpui-form-grid">
      <div
        className={cn(
          "erpui-form-grid astw:grid astw:grid-cols-2 astw:items-start astw:gap-5 astw:[&>*]:min-w-0",
          "astw:[&_input[type=number]]:text-right astw:[&_input[type=number]]:tabular-nums",
          "astw:[@container_erpui-form-grid_(max-width:580px)]:grid-cols-1 astw:[@media(max-width:520px)]:gap-4",
          className,
        )}
        {...props}
      />
    </div>
  );
}
function Full({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`erpui-form-grid-full astw:col-span-full astw:[@container_erpui-form-grid_(max-width:580px)]:col-auto ${className}`}
      {...props}
    />
  );
}
export const FormGrid = { Root: Grid, Full };
export interface DetailTableColumn {
  key: string;
  header: ReactNode;
  width: number;
}
export function DetailTable({
  columns,
  minWidth,
  scrollLabel,
  empty,
  children,
  stickyActions = false,
}: {
  columns: DetailTableColumn[];
  minWidth: number;
  scrollLabel?: string;
  empty?: ReactNode;
  children: ReactNode;
  stickyActions?: boolean;
}) {
  return (
    <div
      className={cn(
        "erpui-detail-table-scroll astw:overflow-auto astw:max-w-full astw:border astw:border-border",
        "astw:rounded-[8px] astw:bg-card astw:overscroll-x-contain astw:[scrollbar-width:thin]",
        "astw:[scrollbar-color:var(--input)_var(--muted)] astw:[&:focus-visible]:outline-2",
        "astw:[&:focus-visible]:outline-solid astw:[&:focus-visible]:outline-ring",
        "astw:[&:focus-visible]:outline-offset-3",
      )}
      role={scrollLabel ? "region" : undefined}
      aria-label={scrollLabel}
      tabIndex={scrollLabel ? 0 : undefined}
    >
      <Table.Root
        containerClassName={cn(
          "erpui-detail-table-container astw:[.erpui-detail-table-scroll_&]:overflow-visible",
          "astw:[.erpui-detail-table-scroll_&]:static",
        )}
        className={cn(
          "erpui-detail-table astw:[&_input[type=number]]:text-right astw:[&_input[type=number]]:tabular-nums",
          "astw:table-fixed astw:[&_th]:whitespace-nowrap astw:[&_td]:align-top",
          "astw:[&_:is(input,select,textarea)]:tabular-nums astw:[&[data-sticky-actions]_td:last-child]:sticky",
          "astw:[&[data-sticky-actions]_td:last-child]:right-0 astw:[&[data-sticky-actions]_td:last-child]:w-12",
          "astw:[&[data-sticky-actions]_td:last-child]:min-w-0",
          "astw:[&[data-sticky-actions]_td:last-child]:bg-card",
          "astw:[&[data-sticky-actions]_td:last-child]:text-center",
          "astw:[&[data-sticky-actions]_td:last-child]:border-l",
          "astw:[&[data-sticky-actions]_td:last-child]:border-l-border",
          "astw:[&[data-sticky-actions]_td:last-child]:align-middle",
        )}
        data-sticky-actions={stickyActions || undefined}
        style={{ minWidth }}
      >
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={{ width: column.width }} />
          ))}
        </colgroup>
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.Head key={column.key} scope="col">
                {column.header}
              </Table.Head>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>{children}</Table.Body>
      </Table.Root>
      {empty && (
        <div className="erpui-detail-table-empty astw:p-6 astw:m-0 astw:text-[12px] astw:text-muted-foreground astw:text-center">
          {empty}
        </div>
      )}
    </div>
  );
}
export function RecordActions({
  status,
  children,
  ...props
}: ComponentProps<typeof RecordPanelFooter> & { status: ReactNode }) {
  return (
    <RecordPanelFooter
      {...props}
      className={cn(
        "erpui-record-actions astw:[.erpui-record-actions&]:flex astw:[.erpui-record-actions&]:items-center",
        "astw:[.erpui-record-actions&]:justify-between astw:[.erpui-record-actions&]:shrink-0",
        "astw:[.erpui-record-actions&]:flex-wrap astw:[.erpui-record-actions&]:gap-3 astw:[&>div]:flex",
        "astw:[&>div]:flex-wrap astw:[&>div]:gap-2 astw:[&_[data-slot=spinner]]:mr-1",
        "astw:[@media(max-width:520px)]:[&>div]:w-full astw:[@media(max-width:520px)]:[&>div>button]:flex-1",
        "astw:[@media(max-width:520px)]:[&>div>button]:justify-center",
        props.className ?? "",
      )}
    >
      {status}
      <div>{children}</div>
    </RecordPanelFooter>
  );
}
