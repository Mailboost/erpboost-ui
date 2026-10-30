import { cn } from "@/lib/utils";
import { Children, type ComponentProps, type ReactNode } from "react";
import { Fieldset } from "../fieldset";

/** Place inside Field.Root. Labels, validation and typed controls stay with the caller. */
export function PropertyRow({
  label,
  children,
  description,
  className = "",
}: {
  label: ReactNode;
  children: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="property-row"
      className={`erpui-property-row astw:min-w-0 astw:w-full astw:[container:erpui-property-row_/_inline-size] ${className}`}
    >
      <div
        className={cn(
          "erpui-property-row-grid astw:grid astw:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]",
          "astw:[align-items:start] astw:gap-6 astw:min-w-0",
          "astw:[@container_erpui-property-row_(max-width:430px)]:grid-cols-1",
          "astw:[@container_erpui-property-row_(max-width:430px)]:gap-2",
        )}
      >
        <div
          className={cn(
            "erpui-property-row-label astw:flex astw:[align-items:start] astw:flex-wrap astw:gap-2 astw:min-w-0",
            "astw:wrap-anywhere astw:[&_label]:flex astw:[&_label]:flex-wrap astw:[&_label]:items-center",
            "astw:[&_label]:gap-2 astw:[&_label]:min-w-0",
          )}
        >
          {label}
        </div>
        <div className="erpui-property-row-control astw:min-w-0 astw:[&_:is(input,textarea,[role=combobox])]:max-w-full">
          {children}
          {Children.toArray(description).length > 0 && (
            <div
              className={cn(
                "erpui-property-row-description astw:mt-2 astw:text-[11px] astw:leading-[1.6]",
                "astw:text-muted-foreground astw:wrap-anywhere astw:[&_code]:text-inherit",
              )}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export function PropertySection({
  title,
  description,
}: {
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div
      data-slot="property-section"
      className={cn(
        "erpui-property-section astw:mt-1 astw:pt-6 astw:border-t astw:border-t-border astw:[&_h3]:mt-0",
        "astw:[&_h3]:mx-0 astw:[&_h3]:mb-1.5 astw:[&_h3]:text-[14px] astw:[&_h3]:font-medium astw:[&_p]:m-0",
        "astw:[&_p]:text-[12px] astw:[&_p]:text-muted-foreground",
      )}
    >
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}
/** Semantic fieldset for schema/metadata forms; submission and values are application-owned. */
export function FormSection({
  legend,
  children,
  className = "",
  ...props
}: Omit<ComponentProps<typeof Fieldset.Root>, "children"> & {
  legend: ReactNode;
  children: ReactNode;
}) {
  return (
    <Fieldset.Root
      {...props}
      className={`erpui-form-section astw:grid astw:gap-4 astw:min-w-0 astw:[.erpui-form-section+&]:mt-6 ${className}`}
    >
      <Fieldset.Legend>{legend}</Fieldset.Legend>
      <div className="erpui-form-section-fields astw:grid astw:gap-4 astw:min-w-0">
        {children}
      </div>
    </Fieldset.Root>
  );
}
