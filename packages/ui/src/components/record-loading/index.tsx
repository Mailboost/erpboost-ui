import type { CSSProperties } from "react";
import { LoadingPlaceholder } from "../loading-layouts";
import { FormGrid } from "../record-layouts";
import { Table } from "../table";
import "./style.css";

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
      className={`erpui-record-placeholder ${className}`}
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
          className="erpui-table-loading-row"
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
          className={`erpui-form-loading-field${field.fullWidth ? " erpui-form-grid-full" : ""}`}
        >
          <span>{field.label}</span>
          <RecordPlaceholder shape={field.shape ?? "input"} />
        </div>
      ))}
    </FormGrid.Root>
  );
}
