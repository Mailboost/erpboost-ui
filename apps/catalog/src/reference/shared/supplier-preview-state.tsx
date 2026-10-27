import { createContext, useContext, type ReactNode } from "react";
import { useSupplierCascader } from "../patterns__supplier-cascader/useSupplierCascader";

const SupplierPreviewState = createContext<ReturnType<
  typeof useSupplierCascader
> | null>(null);

// The reference page owns this state outside the refreshable preview.
export function SupplierPreviewStateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const cascader = useSupplierCascader();
  return (
    <SupplierPreviewState value={cascader}>{children}</SupplierPreviewState>
  );
}

export function useSupplierPreviewState() {
  const cascader = useContext(SupplierPreviewState);
  if (!cascader)
    throw new Error("Supplier preview requires its state provider.");
  return cascader;
}
