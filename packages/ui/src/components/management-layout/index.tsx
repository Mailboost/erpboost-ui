import { cn } from "@/lib/utils";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Table } from "../table";
import { Toolbar } from "../toolbar";
import { EmptyState, type EmptyStateProps } from "../empty-state";
function Root({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="management-layout"
      className={`erpui-management-layout astw:grid astw:gap-0 astw:min-w-0 ${className}`}
    />
  );
}
function Heading({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "erpui-management-heading astw:flex astw:justify-between astw:items-center astw:gap-4 astw:mb-5",
        "astw:min-w-0 astw:[@media(max-width:700px)]:flex-wrap astw:[@media(max-width:700px)]:gap-2",
        "astw:[@media(max-width:700px)]:mb-4.5 astw:[&_[data-layout-header]>div:first-child]:pt-0",
        "astw:[&_[data-layout-header]>div:first-child]:gap-3",
        "astw:[&_[data-layout-header]>div:first-child]:flex-wrap",
        className,
      )}
    />
  );
}
function Surface({ className = "", ...props }: ComponentProps<"section">) {
  return (
    <section
      {...props}
      data-slot="management-surface"
      className={cn(
        "erpui-management-surface astw:border astw:border-border astw:rounded-[6px] astw:bg-card",
        "astw:overflow-hidden astw:min-w-0",
        className,
      )}
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
      className={cn(
        "erpui-management-tools astw:flex astw:flex-wrap astw:items-center astw:justify-between astw:gap-4",
        "astw:py-3.5 astw:px-4",
        className,
      )}
    />
  );
}
function Search({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "erpui-management-search astw:flex-[1_1_180px] astw:max-w-80 astw:min-w-0",
        "astw:[@media(max-width:650px)]:max-w-none",
        className,
      )}
    />
  );
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
      className={`erpui-form-stack astw:grid astw:gap-[var(--erpui-form-stack-gap,16px)] astw:min-w-0 ${className}`}
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
      className={`erpui-identity-cell astw:flex astw:items-center astw:gap-3 astw:min-w-0 ${className}`}
    >
      {icon && (
        <span
          className={cn(
            "erpui-identity-icon astw:inline-flex astw:items-center astw:justify-center astw:w-5 astw:shrink-0",
            "astw:text-muted-foreground",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <span className="erpui-identity-content astw:flex astw:flex-col astw:min-w-0">
        <span
          className="erpui-identity-title astw:flex astw:flex-wrap astw:items-center astw:gap-2 astw:min-w-0 astw:font-semibold"
          data-monospace={monospace || undefined}
        >
          <span
            className={cn(
              "erpui-identity-label",
              "astw:[.erpui-identity-title[data-monospace]_&]:[font-family:ui-monospace,SFMono-Regular,Menlo,monospace]",
              "astw:[.erpui-identity-title[data-monospace]_&]:font-medium astw:min-w-0 astw:wrap-anywhere",
            )}
          >
            {title}
          </span>
          {badges}
        </span>
        {description && (
          <span className="erpui-identity-description astw:text-muted-foreground astw:text-[12px] astw:wrap-anywhere">
            {description}
          </span>
        )}
      </span>
    </span>
  );
}
export function SettingsList({
  className = "",
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={`erpui-settings-list astw:@container/erpui-settings astw:grid astw:gap-0 astw:min-w-0 ${className}`}
    />
  );
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
    <div
      data-slot="settings-row"
      className={cn(
        "erpui-settings-row astw:w-full astw:grid astw:grid-cols-[minmax(0,1fr)_minmax(160px,220px)]",
        "astw:items-center astw:gap-4 astw:py-3 astw:px-0 astw:border-b astw:border-b-border astw:min-w-0",
        "astw:[@container_erpui-settings_(max-width:400px)]:grid-cols-1",
        "astw:[@container_erpui-settings_(max-width:400px)]:gap-2",
        className,
      )}
    >
      <div className="erpui-settings-row-label astw:min-w-0">{label}</div>
      <div className="erpui-settings-row-control astw:min-w-0 astw:[&>*]:w-full astw:[&>*]:min-w-0">
        {control}
      </div>
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
      <span
        className={cn(
          "erpui-responsive-label-full astw:[@media(max-width:500px)]:absolute",
          "astw:[@media(max-width:500px)]:w-px astw:[@media(max-width:500px)]:h-px",
          "astw:[@media(max-width:500px)]:p-0 astw:[@media(max-width:500px)]:border-0",
          "astw:[@media(max-width:500px)]:overflow-hidden astw:[@media(max-width:500px)]:[clip-path:inset(50%)]",
          "astw:[@media(max-width:500px)]:whitespace-nowrap",
        )}
      >
        {full}
      </span>
      <span
        className="erpui-responsive-label-compact astw:hidden astw:[@media(max-width:500px)]:inline"
        aria-hidden="true"
      >
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
      className={cn(
        "erpui-management-table astw:[&_th]:whitespace-nowrap astw:[&_td]:wrap-anywhere",
        "astw:[@media(max-width:700px)]:[&_[data-compact=hidden]]:hidden",
        "astw:[&_[data-muted]]:text-muted-foreground astw:[&_[data-tabular]]:tabular-nums",
        "astw:[&_[data-tabular]]:whitespace-nowrap astw:[&_[data-tabular]]:text-[12px]",
        className,
      )}
      containerClassName={`erpui-management-table-scroll astw:overflow-x-auto astw:max-w-full ${containerClassName}`}
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
    <Surface
      className={cn(
        "erpui-setup-panel astw:[&_[data-slot=empty-state]]:gap-[15px] astw:[&_[data-slot=empty-state]]:py-12",
        "astw:[&_[data-slot=empty-state]]:px-6 astw:[&_[data-slot=empty-state-description]]:max-w-110",
        className,
      )}
    >
      <EmptyState {...props} />
    </Surface>
  );
}
