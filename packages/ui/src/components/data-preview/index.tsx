import type { Key, ReactNode } from "react";
import { Table } from "../table";
export type DataPreviewColumn<Row> = {
  id: string;
  header: ReactNode;
  cell: (row: Row, index: number) => ReactNode;
};
export type DataPreviewProps<Row> = {
  rows: readonly Row[];
  columns: readonly DataPreviewColumn<NoInfer<Row>>[];
  label: string;
  rowKey?: (row: NoInfer<Row>, index: number) => Key;
  rowNumbers?: boolean;
  rowNumberLabel?: ReactNode;
  rowNumberOffset?: number;
  empty?: ReactNode;
  notice?: ReactNode;
  className?: string;
};
/** Read-only table. Values, serialization, result limits and data loading are supplied by the consumer. */
export function DataPreview<Row>({
  rows,
  columns,
  label,
  rowKey = (_, index) => index,
  rowNumbers = true,
  rowNumberLabel = "#",
  rowNumberOffset = 0,
  empty,
  notice,
  className = "",
}: DataPreviewProps<Row>) {
  return (
    <div
      data-slot="data-preview"
      className={`erpui-data-preview astw:min-w-0 astw:[&_[data-slot=table-cell]]:tabular-nums ${className}`}
    >
      <Table.Root
        aria-label={label}
        containerClassName="erpui-data-preview-scroll astw:[.erpui-data-preview_&]:max-w-full astw:[.erpui-data-preview_&]:overscroll-x-contain"
      >
        <Table.Header>
          <Table.Row>
            {rowNumbers && (
              <Table.Head scope="col">{rowNumberLabel}</Table.Head>
            )}
            {columns.map((column) => (
              <Table.Head scope="col" key={column.id}>
                {column.header}
              </Table.Head>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row, index) => (
            <Table.Row key={rowKey(row, index)}>
              {rowNumbers && (
                <Table.Cell>{rowNumberOffset + index + 1}</Table.Cell>
              )}
              {columns.map((column) => (
                <Table.Cell key={column.id}>
                  {column.cell(row, index)}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      {!rows.length && empty}
      {notice}
    </div>
  );
}
