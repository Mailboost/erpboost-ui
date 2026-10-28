import type { ComponentProps } from "react";
/** Pointer and keyboard resizing remain controlled by the containing layout. */
export function ResizeHandle({
  orientation,
  className = "",
  ...props
}: Omit<ComponentProps<"div">, "role"> & {
  orientation: "horizontal" | "vertical";
}) {
  return (
    <div
      tabIndex={0}
      {...props}
      role="separator"
      aria-orientation={orientation}
      data-slot="resize-handle"
      className={`erpui-resize-handle ${className}`}
    />
  );
}
