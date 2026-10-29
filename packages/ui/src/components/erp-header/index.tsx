import type { ComponentProps, ReactNode } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button, type ButtonProps } from "../button";
import { cn } from "@/lib/utils";

export type ErpHeaderProps = Omit<ComponentProps<"header">, "children"> & {
  brand: ReactNode;
  organization: ReactNode;
  connection: ReactNode;
};

/** ERPboost's fixed brand / organization / connection header. No auth or selection state. */
function Root({
  brand,
  organization,
  connection,
  className,
  ...props
}: ErpHeaderProps) {
  return (
    <header
      data-slot="erp-header"
      className={cn("erpui-erp-header", className)}
      {...props}
    >
      <span data-slot="erp-header-brand">{brand}</span>
      <span data-slot="erp-header-separator" aria-hidden="true">
        /
      </span>
      <div data-slot="erp-header-organization">{organization}</div>
      <span data-slot="erp-header-separator" aria-hidden="true">
        /
      </span>
      <div data-slot="erp-header-connection">{connection}</div>
    </header>
  );
}

/** Pass to the existing Combobox.Parts.Trigger render prop. */
function Trigger({
  icon,
  children,
  className,
  ...props
}: ButtonProps & { icon?: ReactNode }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      {...props}
      className={cn("erpui-erp-header-trigger", className)}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span data-slot="erp-header-value">{children}</span>
      <ChevronsUpDown size={13} aria-hidden="true" />
    </Button>
  );
}

/** Decorative loading placeholder with an explicit accessible name. */
function Loading({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <div data-slot="erp-header-loading" role="status" aria-label={label}>
      {icon && <span aria-hidden="true">{icon}</span>}
      <span data-slot="erp-header-skeleton" aria-hidden="true" />
      <ChevronsUpDown size={13} aria-hidden="true" />
    </div>
  );
}

export const ErpHeader = Object.assign(Root, { Trigger, Loading });
