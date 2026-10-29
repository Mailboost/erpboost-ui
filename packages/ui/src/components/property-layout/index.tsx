import { Children, type ComponentProps, type ReactNode } from "react";
import { Fieldset } from "../fieldset";
import "./style.css";

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
    <div data-slot="property-row" className={`erpui-property-row ${className}`}>
      <div className="erpui-property-row-grid">
        <div className="erpui-property-row-label">{label}</div>
        <div className="erpui-property-row-control">
          {children}
          {Children.toArray(description).length > 0 && (
            <div className="erpui-property-row-description">{description}</div>
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
    <div data-slot="property-section" className="erpui-property-section">
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
    <Fieldset.Root {...props} className={`erpui-form-section ${className}`}>
      <Fieldset.Legend>{legend}</Fieldset.Legend>
      <div className="erpui-form-section-fields">{children}</div>
    </Fieldset.Root>
  );
}
