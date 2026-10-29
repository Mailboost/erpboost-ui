import { ChevronsUpDown } from "lucide-react";
import { Layout } from "../layout";
import { Skeleton as UiSkeleton } from "../skeleton";
import type { ReactNode, ComponentProps } from "react";
export type LoadingView = "data" | "sync" | "secrets" | "connection" | "inbox";
import "./style.css";

export function LoadingPlaceholder({
  className = "",
  ...props
}: ComponentProps<typeof UiSkeleton>) {
  return (
    <UiSkeleton
      {...props}
      className={`erpui-loading-placeholder erp-skeleton ${className}`}
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
      className={`erpui-loading-layout erp-pending ${className}`}
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <span className="erpui-loading-sr-only">{label}</span>
      <div className="erp-pending-shapes" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
function TableShape({ columns = 6 }: { columns?: number }) {
  return (
    <div
      className={`erp-skeleton-table${columns === 4 ? " erp-skeleton-order-table" : ""}`}
    >
      <div className="erp-skeleton-table-head">
        {Array.from({ length: columns }, (_, column) => (
          <LoadingPlaceholder key={column} className="erp-skeleton-caption" />
        ))}
      </div>
      {Array.from({ length: 8 }, (_, row) => (
        <div className="erp-skeleton-table-row" key={row}>
          {Array.from({ length: columns }, (_, column) => (
            <LoadingPlaceholder
              key={column}
              className={column === 0 ? "erp-skeleton-short" : ""}
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
      className="erp-database-skeleton"
    >
      <aside className="erp-skeleton-table-list">
        <div className="erp-skeleton-sidebar-title">
          <span>データベース</span>
          <LoadingPlaceholder className="erp-skeleton-count" />
        </div>
        <LoadingPlaceholder className="erp-skeleton-input" />
        <LoadingPlaceholder className="erp-skeleton-input" />
        <div className="erp-skeleton-table-names">
          {Array.from({ length: 14 }, (_, index) => (
            <div key={index}>
              <LoadingPlaceholder className="erp-skeleton-icon" />
              <LoadingPlaceholder />
            </div>
          ))}
        </div>
      </aside>
      <div className="erp-skeleton-workbench">
        <div className="erp-skeleton-tabs">
          <LoadingPlaceholder className="erp-skeleton-title" />
        </div>
        <div className="erp-skeleton-toolbar">
          <LoadingPlaceholder className="erp-skeleton-search" />
          <LoadingPlaceholder className="erp-skeleton-button" />
        </div>
        <TableShape />
        <div className="erp-skeleton-footer">
          <LoadingPlaceholder className="erp-skeleton-title" />
          <LoadingPlaceholder className="erp-skeleton-caption" />
        </div>
      </div>
    </Pending>
  );
}
export function ConnectionsRowsSkeleton() {
  return (
    <Pending
      label="ERP接続を読み込んでいます"
      className="erp-management-rows-skeleton"
    >
      <TableShape />
    </Pending>
  );
}
export function SecretsRowsSkeleton() {
  return (
    <Pending
      label="シークレットを読み込んでいます"
      className="erp-secrets-rows-skeleton"
    >
      <div className="erp-skeleton-secret-head">
        <span>シークレット名</span>
        <span>最終更新日時</span>
        <span />
      </div>
      {Array.from({ length: 5 }, (_, row) => (
        <div className="erp-skeleton-secret-row" key={row}>
          <div>
            <LoadingPlaceholder className="erp-skeleton-icon" />
            <LoadingPlaceholder className="erp-skeleton-title" />
          </div>
          <LoadingPlaceholder />
          <LoadingPlaceholder className="erp-skeleton-button" />
        </div>
      ))}
    </Pending>
  );
}
export function SyncSkeleton() {
  return (
    <Pending label="データ同期を読み込んでいます" className="erp-sync-skeleton">
      <div className="erp-skeleton-toolbar">
        <LoadingPlaceholder className="erp-skeleton-title" />
        <div>
          <LoadingPlaceholder className="erp-skeleton-button" />
          <LoadingPlaceholder className="erp-skeleton-button" />
        </div>
      </div>
      <StudioShape />
    </Pending>
  );
}
function StudioShape() {
  return (
    <div className="erp-skeleton-studio">
      <aside>
        <LoadingPlaceholder className="erp-skeleton-title" />
        <LoadingPlaceholder />
        <LoadingPlaceholder className="erp-skeleton-short" />
      </aside>
      <div className="erp-skeleton-code-area">
        <div className="erp-skeleton-tabs">
          <LoadingPlaceholder className="erp-skeleton-title" />
        </div>
        <div className="erp-skeleton-code">
          {Array.from({ length: 10 }, (_, line) => (
            <LoadingPlaceholder key={line} />
          ))}
        </div>
        <div className="erp-skeleton-output">
          <div className="erp-skeleton-tabs">
            <LoadingPlaceholder className="erp-skeleton-title" />
            <LoadingPlaceholder className="erp-skeleton-title" />
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
      className="erp-sync-skeleton erp-sync-editor-skeleton"
    >
      <StudioShape />
    </Pending>
  );
}
export function GraphSkeleton() {
  return (
    <Pending label="グラフを読み込んでいます" className="erp-graph-skeleton">
      <div className="erp-skeleton-graph-link" />
      <div className="erp-skeleton-graph-node">
        <LoadingPlaceholder className="erp-skeleton-title" />
        <LoadingPlaceholder />
        <LoadingPlaceholder />
      </div>
      <div className="erp-skeleton-graph-node">
        <LoadingPlaceholder className="erp-skeleton-title" />
        <LoadingPlaceholder />
        <LoadingPlaceholder />
      </div>
      <div className="erp-skeleton-graph-node">
        <LoadingPlaceholder className="erp-skeleton-title" />
        <LoadingPlaceholder />
        <LoadingPlaceholder />
      </div>
    </Pending>
  );
}
export function ConnectionFormSkeleton() {
  return (
    <Pending label="接続設定を読み込んでいます" className="erp-form-skeleton">
      {Array.from({ length: 4 }, (_, field) => (
        <div key={field}>
          <LoadingPlaceholder className="erp-skeleton-caption" />
          <LoadingPlaceholder className="erp-skeleton-input" />
        </div>
      ))}
    </Pending>
  );
}
export function InputSkeleton({ label }: { label: string }) {
  return (
    <span
      className="erp-input-skeleton"
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <span className="erpui-loading-sr-only">{label}</span>
      <LoadingPlaceholder className="erp-skeleton-input" />
    </span>
  );
}
export function MembersSkeleton() {
  return (
    <Pending
      label="メンバーを読み込んでいます"
      className="erp-members-skeleton"
    >
      {Array.from({ length: 4 }, (_, row) => (
        <div className="erp-skeleton-member" key={row}>
          <div>
            <LoadingPlaceholder className="erp-skeleton-title" />
            <LoadingPlaceholder />
          </div>
          <LoadingPlaceholder className="erp-skeleton-button" />
        </div>
      ))}
    </Pending>
  );
}
export function HistorySkeleton() {
  return (
    <Pending
      label="送信履歴を読み込んでいます"
      className="erp-history-skeleton"
    >
      {Array.from({ length: 3 }, (_, row) => (
        <div key={row}>
          <div>
            <LoadingPlaceholder className="erp-skeleton-button" />
            <LoadingPlaceholder className="erp-skeleton-title" />
          </div>
          <LoadingPlaceholder />
          <LoadingPlaceholder className="erp-skeleton-short" />
        </div>
      ))}
    </Pending>
  );
}
export function PickerSkeleton() {
  return (
    <Pending label="連携一覧を読み込んでいます" className="erp-picker-skeleton">
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
        <div className="erp-skeleton-toolbar">
          <LoadingPlaceholder className="erp-skeleton-search" />
          <LoadingPlaceholder className="erp-skeleton-button" />
        </div>
        <SecretsRowsSkeleton />
      </div>
    );
  if (view === "connection")
    return (
      <div>
        <div className="erpui-loading-page-heading">
          <Layout.Header
            title="ERP接続"
            actions={[
              <LoadingPlaceholder
                key="action"
                className="erp-skeleton-button"
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
      <div className="erpui-loading-page-heading">
        <Layout.Header
          title="受注一覧"
          actions={[
            <LoadingPlaceholder key="action" className="erp-skeleton-button" />,
          ]}
        />
      </div>
      <div className="erp-skeleton-toolbar">
        <LoadingPlaceholder className="erp-skeleton-title" />
        <LoadingPlaceholder className="erp-skeleton-search" />
      </div>
      <TableShape columns={4} />
    </Pending>
  );
}

export function PipelineOutputSkeleton() {
  return (
    <Pending
      label="隔離環境で実行結果を待っています"
      className="erp-output-skeleton"
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
    <div className="erpui-context-loading" role="status" aria-label={label}>
      {icon}
      <LoadingPlaceholder className="erpui-context-placeholder" />
      <ChevronsUpDown size={13} aria-hidden="true" />
    </div>
  );
}
