import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import { Layout } from "../layout";
import { Skeleton as UiSkeleton } from "../skeleton";
import type { ReactNode, ComponentProps } from "react";
export type LoadingView = "data" | "sync" | "secrets" | "connection" | "inbox";

export function LoadingPlaceholder({
  className = "",
  ...props
}: ComponentProps<typeof UiSkeleton>) {
  return (
    <UiSkeleton
      {...props}
      className={cn(
        "erpui-loading-placeholder astw:[.erpui-grid-skeleton-row:nth-child(3n)_&]:w-[70%]",
        "astw:[[data-slot=skeleton]&]:bg-[color-mix(in_srgb,var(--muted-foreground,#737373)_28%,var(--card,#fff))]",
        "erp-skeleton astw:[.erp-skeleton-table-row:nth-child(3n)_&]:w-[72%]",
        "astw:[.erp-skeleton-table-list>&]:mb-3.5 astw:[.erp-skeleton-table-names>div>&:last-child]:flex-1",
        "astw:[.erp-skeleton-code>&]:max-w-155 astw:[.erp-skeleton-code>&]:h-2.5",
        "astw:[.erp-skeleton-code>&]:w-[80%] astw:[.erp-skeleton-code>&:nth-child(3n)]:w-[50%]",
        "astw:[.erp-skeleton-code>&:nth-child(3n)]:ml-6 astw:[.erp-skeleton-code>&:nth-child(3n+1)]:w-[65%]",
        "astw:[.erp-skeleton-member>&]:w-32.5 astw:[.erp-grid-skeleton-row:nth-child(3n)_&]:w-[70%]",
        className,
      )}
    />
  );
}
function Pending({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`erpui-loading-layout erp-pending astw:min-w-0 astw:overflow-hidden ${className}`}
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <span
        className={cn(
          "erpui-loading-sr-only astw:absolute astw:w-px astw:h-px astw:p-0 astw:overflow-hidden",
          "astw:[clip:rect(0,0,0,0)] astw:whitespace-nowrap",
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          "erp-pending-shapes astw:contents astw:[.erp-form-skeleton_&>div]:grid",
          "astw:[.erp-form-skeleton_&>div]:gap-2 astw:[.erp-history-skeleton_&>div]:grid",
          "astw:[.erp-history-skeleton_&>div]:gap-3 astw:[.erp-history-skeleton_&>div]:pb-5",
          "astw:[.erp-history-skeleton_&>div]:border-b",
          "astw:[.erp-history-skeleton_&>div]:border-b-[var(--border,#e5e5e5)]",
          "astw:[.erp-history-skeleton_&>div>div]:flex astw:[.erp-history-skeleton_&>div>div]:justify-between",
          "astw:[.erp-history-skeleton_&>div>div]:gap-5",
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}
function TableShape({ columns = 6 }: { columns?: number }) {
  return (
    <div
      className={`erp-skeleton-table astw:min-w-150 ${columns === 4 ? " erp-skeleton-order-table" : ""}`}
    >
      <div
        className={cn(
          "erp-skeleton-table-head astw:grid astw:grid-cols-6 astw:items-center astw:gap-7 astw:py-0 astw:px-5",
          "astw:border-b astw:border-b-[var(--border,#e5e5e5)] astw:min-h-9.5",
          "astw:bg-[var(--background,#fafafa)] astw:[.erp-skeleton-order-table_&]:grid-cols-4",
        )}
      >
        {Array.from({ length: columns }, (_, column) => (
          <LoadingPlaceholder
            key={column}
            className="erp-skeleton-caption astw:w-21 astw:max-w-[70%] astw:h-2.5"
          />
        ))}
      </div>
      {Array.from({ length: 8 }, (_, row) => (
        <div
          className={cn(
            "erp-skeleton-table-row astw:grid astw:grid-cols-6 astw:items-center astw:gap-7 astw:py-0 astw:px-5",
            "astw:border-b astw:border-b-[var(--border,#e5e5e5)] astw:min-h-11",
            "astw:[.erp-skeleton-order-table_&]:grid-cols-4",
          )}
          key={row}
        >
          {Array.from({ length: columns }, (_, column) => (
            <LoadingPlaceholder
              key={column}
              className={column === 0 ? "erp-skeleton-short astw:w-[60%]" : ""}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
export function DatabaseSkeleton() {
  return (
    <Pending
      label="データベースを読み込んでいます"
      className={cn(
        "erp-database-skeleton astw:grid astw:grid-cols-[256px_minmax(0,1fr)] astw:h-full astw:min-h-100",
        "astw:bg-[var(--card,#fff)] astw:[@media(650px<width<=900px)]:grid-cols-[210px_minmax(0,1fr)]",
        "astw:[@media(max-width:650px)]:grid-cols-[160px_minmax(0,1fr)]",
      )}
    >
      <aside className="erp-skeleton-table-list astw:py-0 astw:px-4 astw:border-r astw:border-r-[var(--border,#e5e5e5)] astw:overflow-hidden">
        <div
          className={cn(
            "erp-skeleton-sidebar-title astw:flex astw:items-center astw:justify-between astw:h-12 astw:mb-3",
            "astw:text-[12px] astw:text-[var(--foreground,#171717)]",
          )}
        >
          <span>データベース</span>
          <LoadingPlaceholder className="erp-skeleton-count astw:w-6 astw:h-2.5" />
        </div>
        <LoadingPlaceholder className="erp-skeleton-input astw:w-full astw:h-8.5 astw:rounded-[5px]" />
        <LoadingPlaceholder className="erp-skeleton-input astw:w-full astw:h-8.5 astw:rounded-[5px]" />
        <div
          className={cn(
            "erp-skeleton-table-names astw:grid astw:gap-5 astw:pt-2.5 astw:[&>div]:flex",
            "astw:[&>div]:items-center astw:[&>div]:gap-2.5 astw:[&>div:nth-child(3n)]:pr-9",
          )}
        >
          {Array.from({ length: 14 }, (_, index) => (
            <div key={index}>
              <LoadingPlaceholder className="erp-skeleton-icon astw:w-4 astw:h-4" />
              <LoadingPlaceholder />
            </div>
          ))}
        </div>
      </aside>
      <div className="erp-skeleton-workbench astw:flex astw:flex-col astw:min-w-0 astw:overflow-hidden">
        <div
          className={cn(
            "erp-skeleton-tabs astw:flex astw:items-center astw:gap-6 astw:min-h-12 astw:py-3 astw:px-5",
            "astw:border-b astw:border-b-[var(--border,#e5e5e5)]",
          )}
        >
          <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
        </div>
        <div
          className={cn(
            "erp-skeleton-toolbar astw:flex astw:items-center astw:justify-between astw:gap-6 astw:min-h-13",
            "astw:py-2.5 astw:px-5 astw:border-b astw:border-b-[var(--border,#e5e5e5)] astw:[&>div]:flex",
            "astw:[&>div]:gap-2",
          )}
        >
          <LoadingPlaceholder className="erp-skeleton-search astw:w-65 astw:max-w-[60%] astw:h-8" />
          <LoadingPlaceholder
            className={cn(
              "erp-skeleton-button astw:w-22 astw:h-7.5 astw:rounded-[5px]",
              "astw:[@media(max-width:650px)]:[.erp-skeleton-secret-row_&]:w-15",
            )}
          />
        </div>
        <TableShape />
        <div
          className={cn(
            "erp-skeleton-footer astw:flex astw:justify-between astw:items-center astw:gap-6 astw:min-h-10.5",
            "astw:mt-auto astw:py-3 astw:px-5 astw:border-t astw:border-t-[var(--border,#e5e5e5)]",
          )}
        >
          <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
          <LoadingPlaceholder className="erp-skeleton-caption astw:w-21 astw:max-w-[70%] astw:h-2.5" />
        </div>
      </div>
    </Pending>
  );
}
export function ConnectionsRowsSkeleton() {
  return (
    <Pending
      label="ERP接続を読み込んでいます"
      className={cn(
        "erp-management-rows-skeleton astw:border astw:border-[var(--border,#e5e5e5)] astw:rounded-[6px]",
        "astw:[.erp-connections-list>&]:border-0",
      )}
    >
      <TableShape />
    </Pending>
  );
}
export function SecretsRowsSkeleton() {
  return (
    <Pending
      label="シークレットを読み込んでいます"
      className="erp-secrets-rows-skeleton astw:border-t astw:border-t-[var(--border,#e5e5e5)]"
    >
      <div
        className={cn(
          "erp-skeleton-secret-head astw:grid astw:grid-cols-[minmax(0,3fr)_minmax(80px,2fr)_88px]",
          "astw:items-center astw:gap-6 astw:min-h-13.5 astw:py-3 astw:px-4 astw:border-b",
          "astw:border-b-[var(--border,#e5e5e5)] astw:min-h-9.5 astw:bg-[var(--background,#fafafa)]",
          "astw:text-[12px] astw:text-[var(--muted-foreground,#737373)] astw:[@media(max-width:650px)]:gap-3",
          "astw:[@media(max-width:650px)]:grid-cols-[minmax(0,2fr)_minmax(50px,1fr)_60px]",
        )}
      >
        <span>シークレット名</span>
        <span>最終更新日時</span>
        <span />
      </div>
      {Array.from({ length: 5 }, (_, row) => (
        <div
          className={cn(
            "erp-skeleton-secret-row astw:grid astw:grid-cols-[minmax(0,3fr)_minmax(80px,2fr)_88px]",
            "astw:items-center astw:gap-6 astw:min-h-13.5 astw:py-3 astw:px-4 astw:border-b",
            "astw:border-b-[var(--border,#e5e5e5)] astw:[&>div]:flex astw:[&>div]:items-center astw:[&>div]:gap-3",
            "astw:[&>div]:min-w-0 astw:[@media(max-width:650px)]:gap-3",
            "astw:[@media(max-width:650px)]:grid-cols-[minmax(0,2fr)_minmax(50px,1fr)_60px]",
          )}
          key={row}
        >
          <div>
            <LoadingPlaceholder className="erp-skeleton-icon astw:w-4 astw:h-4" />
            <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
          </div>
          <LoadingPlaceholder />
          <LoadingPlaceholder
            className={cn(
              "erp-skeleton-button astw:w-22 astw:h-7.5 astw:rounded-[5px]",
              "astw:[@media(max-width:650px)]:[.erp-skeleton-secret-row_&]:w-15",
            )}
          />
        </div>
      ))}
    </Pending>
  );
}
export function SyncSkeleton() {
  return (
    <Pending
      label="データ同期を読み込んでいます"
      className="erp-sync-skeleton astw:flex astw:flex-col astw:h-full astw:min-h-100 astw:bg-[var(--card,#fff)]"
    >
      <div
        className={cn(
          "erp-skeleton-toolbar astw:flex astw:items-center astw:justify-between astw:gap-6 astw:min-h-13",
          "astw:py-2.5 astw:px-5 astw:border-b astw:border-b-[var(--border,#e5e5e5)] astw:[&>div]:flex",
          "astw:[&>div]:gap-2",
        )}
      >
        <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
        <div>
          <LoadingPlaceholder
            className={cn(
              "erp-skeleton-button astw:w-22 astw:h-7.5 astw:rounded-[5px]",
              "astw:[@media(max-width:650px)]:[.erp-skeleton-secret-row_&]:w-15",
            )}
          />
          <LoadingPlaceholder
            className={cn(
              "erp-skeleton-button astw:w-22 astw:h-7.5 astw:rounded-[5px]",
              "astw:[@media(max-width:650px)]:[.erp-skeleton-secret-row_&]:w-15",
            )}
          />
        </div>
      </div>
      <StudioShape />
    </Pending>
  );
}
function StudioShape() {
  return (
    <div
      className={cn(
        "erp-skeleton-studio astw:grid astw:grid-cols-[190px_minmax(0,1fr)] astw:flex-1 astw:min-h-0",
        "astw:[&>aside]:flex astw:[&>aside]:flex-col astw:[&>aside]:gap-6 astw:[&>aside]:py-6",
        "astw:[&>aside]:px-4 astw:[&>aside]:border-r astw:[&>aside]:border-r-[var(--border,#e5e5e5)]",
        "astw:[@media(max-width:650px)]:grid-cols-[120px_minmax(0,1fr)]",
        "astw:[@media(max-width:650px)]:[&>aside]:py-4.5 astw:[@media(max-width:650px)]:[&>aside]:px-2.5",
      )}
    >
      <aside>
        <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
        <LoadingPlaceholder />
        <LoadingPlaceholder className="erp-skeleton-short astw:w-[60%]" />
      </aside>
      <div className="erp-skeleton-code-area astw:flex astw:flex-col astw:min-w-0">
        <div
          className={cn(
            "erp-skeleton-tabs astw:flex astw:items-center astw:gap-6 astw:min-h-12 astw:py-3 astw:px-5",
            "astw:border-b astw:border-b-[var(--border,#e5e5e5)]",
          )}
        >
          <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
        </div>
        <div
          className={cn(
            "erp-skeleton-code astw:grid astw:gap-4 astw:p-7 astw:min-h-70 astw:[@media(max-width:650px)]:py-5",
            "astw:[@media(max-width:650px)]:px-3.5",
          )}
        >
          {Array.from({ length: 10 }, (_, line) => (
            <LoadingPlaceholder key={line} />
          ))}
        </div>
        <div className="erp-skeleton-output astw:flex-1 astw:min-h-45 astw:border-t astw:border-t-[var(--border,#e5e5e5)]">
          <div
            className={cn(
              "erp-skeleton-tabs astw:flex astw:items-center astw:gap-6 astw:min-h-12 astw:py-3 astw:px-5",
              "astw:border-b astw:border-b-[var(--border,#e5e5e5)]",
            )}
          >
            <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
            <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
          </div>
          <GraphSkeleton />
        </div>
      </div>
    </div>
  );
}
export function SyncEditorSkeleton() {
  return (
    <Pending
      label="同期エディターを読み込んでいます"
      className={cn(
        "erp-sync-skeleton astw:flex astw:flex-col astw:h-full astw:min-h-100 astw:bg-[var(--card,#fff)]",
        "erp-sync-editor-skeleton astw:flex-1 astw:h-auto astw:min-h-0",
      )}
    >
      <StudioShape />
    </Pending>
  );
}
export function GraphSkeleton() {
  return (
    <Pending
      label="グラフを読み込んでいます"
      className={cn(
        "erp-graph-skeleton astw:relative astw:grid astw:grid-cols-[repeat(2,minmax(0,220px))]",
        "astw:justify-center astw:content-center astw:gap-y-10 astw:gap-x-17.5 astw:min-h-62.5 astw:h-full",
        "astw:p-8 astw:bg-[var(--background,#fafafa)] astw:[@media(max-width:650px)]:gap-y-7.5",
        "astw:[@media(max-width:650px)]:gap-x-5 astw:[@media(max-width:650px)]:p-5",
      )}
    >
      <div
        className={cn(
          "erp-skeleton-graph-link astw:absolute astw:left-[30%] astw:right-[30%] astw:top-[40%] astw:h-[35%]",
          "astw:border astw:border-[var(--border,#e5e5e5)]",
        )}
      />
      <div
        className={cn(
          "erp-skeleton-graph-node astw:relative astw:z-1 astw:grid astw:gap-3.5 astw:border",
          "astw:border-[var(--border,#e5e5e5)] astw:rounded-[8px] astw:p-4.5 astw:bg-[var(--card,#fff)]",
          "astw:[&:nth-last-child(1)]:col-span-full astw:[&:nth-last-child(1)]:w-55",
          "astw:[&:nth-last-child(1)]:max-w-full astw:[&:nth-last-child(1)]:justify-self-center",
        )}
      >
        <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
        <LoadingPlaceholder />
        <LoadingPlaceholder />
      </div>
      <div
        className={cn(
          "erp-skeleton-graph-node astw:relative astw:z-1 astw:grid astw:gap-3.5 astw:border",
          "astw:border-[var(--border,#e5e5e5)] astw:rounded-[8px] astw:p-4.5 astw:bg-[var(--card,#fff)]",
          "astw:[&:nth-last-child(1)]:col-span-full astw:[&:nth-last-child(1)]:w-55",
          "astw:[&:nth-last-child(1)]:max-w-full astw:[&:nth-last-child(1)]:justify-self-center",
        )}
      >
        <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
        <LoadingPlaceholder />
        <LoadingPlaceholder />
      </div>
      <div
        className={cn(
          "erp-skeleton-graph-node astw:relative astw:z-1 astw:grid astw:gap-3.5 astw:border",
          "astw:border-[var(--border,#e5e5e5)] astw:rounded-[8px] astw:p-4.5 astw:bg-[var(--card,#fff)]",
          "astw:[&:nth-last-child(1)]:col-span-full astw:[&:nth-last-child(1)]:w-55",
          "astw:[&:nth-last-child(1)]:max-w-full astw:[&:nth-last-child(1)]:justify-self-center",
        )}
      >
        <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
        <LoadingPlaceholder />
        <LoadingPlaceholder />
      </div>
    </Pending>
  );
}
export function ConnectionFormSkeleton() {
  return (
    <Pending
      label="接続設定を読み込んでいます"
      className="erp-form-skeleton astw:grid astw:gap-5"
    >
      {Array.from({ length: 4 }, (_, field) => (
        <div key={field}>
          <LoadingPlaceholder className="erp-skeleton-caption astw:w-21 astw:max-w-[70%] astw:h-2.5" />
          <LoadingPlaceholder className="erp-skeleton-input astw:w-full astw:h-8.5 astw:rounded-[5px]" />
        </div>
      ))}
    </Pending>
  );
}
export function InputSkeleton({ label }: { label: string }) {
  return (
    <span
      className="erp-input-skeleton astw:block astw:w-full"
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <span
        className={cn(
          "erpui-loading-sr-only astw:absolute astw:w-px astw:h-px astw:p-0 astw:overflow-hidden",
          "astw:[clip:rect(0,0,0,0)] astw:whitespace-nowrap",
        )}
      >
        {label}
      </span>
      <LoadingPlaceholder className="erp-skeleton-input astw:w-full astw:h-8.5 astw:rounded-[5px]" />
    </span>
  );
}
export function MembersSkeleton() {
  return (
    <Pending
      label="メンバーを読み込んでいます"
      className="erp-members-skeleton astw:mt-4"
    >
      {Array.from({ length: 4 }, (_, row) => (
        <div
          className={cn(
            "erp-skeleton-member astw:flex astw:items-center astw:justify-between astw:gap-6 astw:py-4 astw:px-0",
            "astw:border-b astw:border-b-[var(--border,#e5e5e5)] astw:[&>div]:grid astw:[&>div]:gap-2.5",
            "astw:[&>div]:w-[55%]",
          )}
          key={row}
        >
          <div>
            <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
            <LoadingPlaceholder />
          </div>
          <LoadingPlaceholder
            className={cn(
              "erp-skeleton-button astw:w-22 astw:h-7.5 astw:rounded-[5px]",
              "astw:[@media(max-width:650px)]:[.erp-skeleton-secret-row_&]:w-15",
            )}
          />
        </div>
      ))}
    </Pending>
  );
}
export function HistorySkeleton() {
  return (
    <Pending
      label="送信履歴を読み込んでいます"
      className="erp-history-skeleton astw:grid astw:gap-6 astw:p-5"
    >
      {Array.from({ length: 3 }, (_, row) => (
        <div key={row}>
          <div>
            <LoadingPlaceholder
              className={cn(
                "erp-skeleton-button astw:w-22 astw:h-7.5 astw:rounded-[5px]",
                "astw:[@media(max-width:650px)]:[.erp-skeleton-secret-row_&]:w-15",
              )}
            />
            <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
          </div>
          <LoadingPlaceholder />
          <LoadingPlaceholder className="erp-skeleton-short astw:w-[60%]" />
        </div>
      ))}
    </Pending>
  );
}
export function PickerSkeleton() {
  return (
    <Pending
      label="連携一覧を読み込んでいます"
      className="erp-picker-skeleton astw:grid astw:gap-5.5 astw:py-3.5 astw:px-3"
    >
      <LoadingPlaceholder />
      <LoadingPlaceholder />
      <LoadingPlaceholder />
    </Pending>
  );
}
export function ErpPageSkeleton({ view }: { view: LoadingView }) {
  if (view === "data") return <DatabaseSkeleton />;
  if (view === "sync") return <SyncSkeleton />;
  if (view === "secrets")
    return (
      <div className="erp-settings-panel erp-secrets-panel">
        <div
          className={cn(
            "erp-skeleton-toolbar astw:flex astw:items-center astw:justify-between astw:gap-6 astw:min-h-13",
            "astw:py-2.5 astw:px-5 astw:border-b astw:border-b-[var(--border,#e5e5e5)] astw:[&>div]:flex",
            "astw:[&>div]:gap-2",
          )}
        >
          <LoadingPlaceholder className="erp-skeleton-search astw:w-65 astw:max-w-[60%] astw:h-8" />
          <LoadingPlaceholder
            className={cn(
              "erp-skeleton-button astw:w-22 astw:h-7.5 astw:rounded-[5px]",
              "astw:[@media(max-width:650px)]:[.erp-skeleton-secret-row_&]:w-15",
            )}
          />
        </div>
        <SecretsRowsSkeleton />
      </div>
    );
  if (view === "connection")
    return (
      <div>
        <div className="erpui-loading-page-heading astw:pb-5 astw:shrink-0 astw:[&>[data-layout-header]>div:first-child]:pt-0">
          <Layout.Header
            title="ERP接続"
            actions={[
              <LoadingPlaceholder
                key="action"
                className={cn(
                  "erp-skeleton-button astw:w-22 astw:h-7.5 astw:rounded-[5px]",
                  "astw:[@media(max-width:650px)]:[.erp-skeleton-secret-row_&]:w-15",
                )}
              />,
            ]}
          />
        </div>
        <ConnectionsRowsSkeleton />
      </div>
    );
  return (
    <Pending
      label="受注一覧を読み込んでいます"
      className="erp-configured-orders erp-orders-skeleton"
    >
      <div className="erpui-loading-page-heading astw:pb-5 astw:shrink-0 astw:[&>[data-layout-header]>div:first-child]:pt-0">
        <Layout.Header
          title="受注一覧"
          actions={[
            <LoadingPlaceholder
              key="action"
              className={cn(
                "erp-skeleton-button astw:w-22 astw:h-7.5 astw:rounded-[5px]",
                "astw:[@media(max-width:650px)]:[.erp-skeleton-secret-row_&]:w-15",
              )}
            />,
          ]}
        />
      </div>
      <div
        className={cn(
          "erp-skeleton-toolbar astw:flex astw:items-center astw:justify-between astw:gap-6 astw:min-h-13",
          "astw:py-2.5 astw:px-5 astw:border-b astw:border-b-[var(--border,#e5e5e5)] astw:[&>div]:flex",
          "astw:[&>div]:gap-2",
        )}
      >
        <LoadingPlaceholder className="erp-skeleton-title astw:w-35 astw:max-w-full astw:h-3.5" />
        <LoadingPlaceholder className="erp-skeleton-search astw:w-65 astw:max-w-[60%] astw:h-8" />
      </div>
      <TableShape columns={4} />
    </Pending>
  );
}

export function PipelineOutputSkeleton() {
  return (
    <Pending
      label="隔離環境で実行結果を待っています"
      className="erp-output-skeleton astw:min-h-45"
    >
      <TableShape />
    </Pending>
  );
}

export function ContextLoading({
  label,
  icon,
}: {
  label: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className="erpui-context-loading astw:flex astw:h-8 astw:items-center astw:gap-1.5 astw:py-0 astw:px-2.5"
      role="status"
      aria-label={label}
    >
      {icon}
      <LoadingPlaceholder className="erpui-context-placeholder astw:[.erpui-context-loading>&]:w-24 astw:[.erpui-context-loading>&]:h-3" />
      <ChevronsUpDown size={13} aria-hidden="true" />
    </div>
  );
}
