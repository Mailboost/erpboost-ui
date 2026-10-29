import {
  ConnectionsRowsSkeleton,
  LoadingPlaceholder,
  ContextLoading,
} from "@mailboost/erpboost-ui";
export function LoadingLayoutsDemo() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <ContextLoading label="Loading organization" />
      <LoadingPlaceholder style={{ width: 180, height: 20 }} />
      <ConnectionsRowsSkeleton />
    </div>
  );
}
