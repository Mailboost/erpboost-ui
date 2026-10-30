import {
  ConnectionsRowsSkeleton,
  LoadingPlaceholder,
  ContextLoading,
} from "@mailboost/erpboost-ui";
export function LoadingLayoutsDemo() {
  return (
    <div className="astw:grid astw:gap-6">
      <ContextLoading label="Loading organization" />
      <LoadingPlaceholder className="astw:w-45 astw:h-5" />
      <ConnectionsRowsSkeleton />
    </div>
  );
}
