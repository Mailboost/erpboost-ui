import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import { LoadingPlaceholder } from "../loading-layouts";
import { FormGrid } from "../record-layouts";
import { Table } from "../table";

export type RecordPlaceholderShape =
  "text" | "title" | "badge" | "input" | "lookup" | "textarea" | "action";
/** Decorative only. The caller labels and marks the enclosing loading region. */
export function RecordPlaceholder({
  shape = "text",
  className = "",
  style,
}: {
  shape?: RecordPlaceholderShape;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <LoadingPlaceholder
      style={style}
      className={cn(
        "erpui-record-placeholder astw:[[data-slot=skeleton]&]:max-w-full astw:[&[data-shape=text]]:h-3",
        "astw:[&[data-shape=title]]:w-30 astw:[&[data-shape=title]]:h-5.5 astw:[&[data-shape=badge]]:w-14",
        "astw:[&[data-shape=badge]]:h-5.5 astw:[&[data-shape=badge]]:rounded-[5px]",
        "astw:[&:is(_[data-shape=input],[data-shape=lookup],[data-shape=textarea],[data-shape=action]_)]:h-9",
        "astw:[&:is(_[data-shape=input],[data-shape=lookup],[data-shape=textarea],[data-shape=action]_)]:rounded-[6px]",
        "astw:[&[data-shape=lookup]]:h-16.5 astw:[&[data-shape=textarea]]:h-22",
        "astw:[&[data-shape=action]]:w-28",
        className,
      )}
      data-shape={shape}
      aria-hidden="true"
    />
  );
}
export interface TableLoadingColumn {
  key: string;
  /** An empty action column can keep its place without suggesting an active control. */
  shape?: RecordPlaceholderShape | "empty";
  width?: CSSProperties["width"];
  cellClassName?: string;
}
/** Direct child of Table.Body; keeps the caller's headers, column sizes and scrolling. */
export function TableLoadingRows({
  columns,
  rows = 8,
}: {
  columns: readonly TableLoadingColumn[];
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <Table.Row
          key={row}
          className={cn(
            "erpui-table-loading-row astw:[[data-slot=table-row]&[aria-hidden=true]]:cursor-default",
            "astw:[[data-slot=table-row]&[aria-hidden=true]:hover]:bg-transparent",
          )}
          aria-hidden="true"
        >
          {columns.map((column) => (
            <Table.Cell key={column.key} className={column.cellClassName}>
              {column.shape !== "empty" && (
                <RecordPlaceholder
                  shape={column.shape}
                  style={
                    column.width === undefined
                      ? undefined
                      : { width: column.width }
                  }
                />
              )}
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  );
}
export interface FormLoadingField {
  key: string;
  label: string;
  shape?: "input" | "lookup" | "textarea";
  fullWidth?: boolean;
}
/** No labels are linked to pretend controls; shapes stay outside the accessibility tree. */
export function FormLoadingFields({
  fields,
}: {
  fields: readonly FormLoadingField[];
}) {
  return (
    <FormGrid.Root aria-hidden="true">
      {fields.map((field) => (
        <div
          key={field.key}
          className={cn(
            "erpui-form-loading-field astw:flex astw:flex-col astw:gap-1.5 astw:min-w-0",
            "astw:[&>span:first-child]:wrap-anywhere",
            field.fullWidth
              ? " erpui-form-grid-full astw:col-span-full astw:[@container_erpui-form-grid_(max-width:580px)]:col-auto"
              : "",
          )}
        >
          <span>{field.label}</span>
          <RecordPlaceholder shape={field.shape ?? "input"} />
        </div>
      ))}
    </FormGrid.Root>
  );
}
