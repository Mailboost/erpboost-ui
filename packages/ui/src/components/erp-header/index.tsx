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
      className={cn(
        "astw:flex astw:min-h-12 astw:min-w-0 astw:shrink-0 astw:items-center astw:gap-2 astw:border-b astw:border-border astw:bg-background astw:px-4 astw:py-2 astw:text-foreground astw:max-[700px]:gap-1 astw:max-[700px]:px-2",
        className,
      )}
      {...props}
    >
      <span
        data-slot="erp-header-brand"
        className="astw:flex astw:flex-[0_0_28px] astw:items-center astw:justify-center astw:[&_img]:size-[26px] astw:[&_img]:object-contain"
      >
        {brand}
      </span>
      <span
        data-slot="erp-header-separator"
        className="astw:shrink-0 astw:text-muted-foreground"
        aria-hidden="true"
      >
        /
      </span>
      <div
        data-slot="erp-header-organization"
        className="astw:min-w-0 astw:max-w-[280px] astw:max-[700px]:flex-1"
      >
        {organization}
      </div>
      <span
        data-slot="erp-header-separator"
        className="astw:shrink-0 astw:text-muted-foreground"
        aria-hidden="true"
      >
        /
      </span>
      <div
        data-slot="erp-header-connection"
        className="astw:min-w-0 astw:max-w-[280px] astw:max-[700px]:flex-1"
      >
        {connection}
      </div>
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
      // Replace the Combobox input-suffix positioning with a complete button.
      className={cn(
        className,
        "astw:static astw:inset-auto astw:min-w-0 astw:max-w-full",
      )}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span data-slot="erp-header-value" className="astw:min-w-0 astw:truncate">
        {children}
      </span>
      <ChevronsUpDown size={13} aria-hidden="true" />
    </Button>
  );
}

/** Decorative loading placeholder with an explicit accessible name. */
function Loading({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <div
      data-slot="erp-header-loading"
      className="astw:flex astw:h-8 astw:items-center astw:gap-1.5 astw:px-2.5"
      role="status"
      aria-label={label}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span
        data-slot="erp-header-skeleton"
        className="astw:h-3 astw:w-24 astw:shrink astw:animate-pulse astw:rounded-sm astw:bg-muted astw:motion-reduce:animate-none"
        aria-hidden="true"
      />
      <ChevronsUpDown size={13} aria-hidden="true" />
    </div>
  );
}

export const ErpHeader = Object.assign(Root, { Trigger, Loading });
