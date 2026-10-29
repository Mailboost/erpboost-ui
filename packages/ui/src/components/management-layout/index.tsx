import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Table } from "../table";
import { Toolbar } from "../toolbar";
import { EmptyState, type EmptyStateProps } from "../empty-state";
import "./style.css";
function Root({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="management-layout"
      className={`erpui-management-layout ${className}`}
    />
  );
}
function Heading({ className = "", ...props }: ComponentProps<"div">) {
  return <div {...props} className={`erpui-management-heading ${className}`} />;
}
function Surface({ className = "", ...props }: ComponentProps<"section">) {
  return (
    <section
      {...props}
      data-slot="management-surface"
      className={`erpui-management-surface ${className}`}
    />
  );
}
function Tools({
  className = "",
  ...props
}: ComponentProps<typeof Toolbar.Row>) {
  return (
    <Toolbar.Row
      justify="between"
      {...props}
      className={`erpui-management-tools ${className}`}
    />
  );
}
function Search({ className = "", ...props }: ComponentProps<"div">) {
  return <div {...props} className={`erpui-management-search ${className}`} />;
}
export const ManagementLayout = {
  Root,
  Heading,
  Surface,
  Toolbar: Tools,
  Search,
};
export function FormStack({
  className = "",
  gap = 16,
  style,
  ...props
}: ComponentProps<"div"> & { gap?: number }) {
  return (
    <div
      {...props}
      data-slot="form-stack"
      className={`erpui-form-stack ${className}`}
      style={
        { "--erpui-form-stack-gap": `${gap}px`, ...style } as CSSProperties
      }
    />
  );
}
export function IdentityCell({
  icon,
  title,
  description,
  badges,
  monospace = false,
  className = "",
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  badges?: ReactNode;
  monospace?: boolean;
  className?: string;
}) {
  return (
    <span
      data-slot="identity-cell"
      className={`erpui-identity-cell ${className}`}
    >
      {icon && (
        <span className="erpui-identity-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="erpui-identity-content">
        <span
          className="erpui-identity-title"
          data-monospace={monospace || undefined}
        >
          <span className="erpui-identity-label">{title}</span>
          {badges}
        </span>
        {description && (
          <span className="erpui-identity-description">{description}</span>
        )}
      </span>
    </span>
  );
}
export function SettingsList({
  className = "",
  ...props
}: ComponentProps<"div">) {
  return <div {...props} className={`erpui-settings-list ${className}`} />;
}
/** Place inside the consumer's Field.Root to retain label/control associations. */
export function SettingsRow({
  label,
  control,
  className = "",
}: {
  label: ReactNode;
  control: ReactNode;
  className?: string;
}) {
  return (
    <div data-slot="settings-row" className={`erpui-settings-row ${className}`}>
      <div className="erpui-settings-row-label">{label}</div>
      <div className="erpui-settings-row-control">{control}</div>
    </div>
  );
}
export function ResponsiveLabel({
  full,
  compact,
}: {
  full: ReactNode;
  compact: ReactNode;
}) {
  return (
    <span className="erpui-responsive-label">
      <span className="erpui-responsive-label-full">{full}</span>
      <span className="erpui-responsive-label-compact" aria-hidden="true">
        {compact}
      </span>
    </span>
  );
}
function TableRoot({
  className = "",
  containerClassName = "",
  minWidth,
  style,
  ...props
}: ComponentProps<typeof Table.Root> & { minWidth?: number }) {
  return (
    <Table.Root
      {...props}
      className={`erpui-management-table ${className}`}
      containerClassName={`erpui-management-table-scroll ${containerClassName}`}
      style={{
        ...(minWidth === undefined ? {} : { minWidth: `${minWidth}px` }),
        ...style,
      }}
    />
  );
}
function Head({
  hideOnCompact = false,
  width,
  style,
  ...props
}: ComponentProps<typeof Table.Head> & {
  hideOnCompact?: boolean;
  width?: CSSProperties["width"];
}) {
  return (
    <Table.Head
      {...props}
      data-compact={hideOnCompact ? "hidden" : undefined}
      style={{ width, ...style }}
    />
  );
}
function Cell({
  hideOnCompact = false,
  muted = false,
  tabular = false,
  ...props
}: ComponentProps<typeof Table.Cell> & {
  hideOnCompact?: boolean;
  muted?: boolean;
  tabular?: boolean;
}) {
  return (
    <Table.Cell
      {...props}
      data-compact={hideOnCompact ? "hidden" : undefined}
      data-muted={muted || undefined}
      data-tabular={tabular || undefined}
    />
  );
}
export const ManagementTable = { Root: TableRoot, Head, Cell };
export function SetupPanel({ className = "", ...props }: EmptyStateProps) {
  return (
    <Surface className={`erpui-setup-panel ${className}`}>
      <EmptyState {...props} />
    </Surface>
  );
}
