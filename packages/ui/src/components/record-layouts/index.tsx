import type { ComponentProps, ReactNode } from "react";
import { Table } from "../table";
import { RecordPanelFooter } from "../record-panel";
import "./style.css";
function Grid({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div className="erpui-form-grid-container">
      <div className={`erpui-form-grid ${className}`} {...props} />
    </div>
  );
}
function Full({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`erpui-form-grid-full ${className}`} {...props} />;
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
      className="erpui-detail-table-scroll"
      role={scrollLabel ? "region" : undefined}
      aria-label={scrollLabel}
      tabIndex={scrollLabel ? 0 : undefined}
    >
      <Table.Root
        containerClassName="erpui-detail-table-container"
        className="erpui-detail-table"
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
      {empty && <div className="erpui-detail-table-empty">{empty}</div>}
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
      className={`erpui-record-actions ${props.className ?? ""}`}
    >
      {status}
      <div>{children}</div>
    </RecordPanelFooter>
  );
}
