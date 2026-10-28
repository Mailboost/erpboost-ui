import type { ComponentProps, ReactNode } from "react";
function Root({ className = "", ...props }: ComponentProps<"dl">) {
  return (
    <dl
      {...props}
      data-slot="description-list"
      className={`erpui-description-list ${className}`}
    />
  );
}
function Item({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{children ?? "—"}</dd>
    </>
  );
}
/** Explicit JSX items, with labels and formatting owned by the application. */
export const DescriptionList = { Root, Item };
