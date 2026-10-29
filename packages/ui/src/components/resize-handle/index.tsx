import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
/** The containing layout supplies values and pointer/keyboard handlers. */
export function ResizeHandle({
  orientation,
  className,
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
      className={cn(
        "astw:touch-none astw:shrink-0 astw:hover:bg-accent astw:focus-visible:bg-accent",
        orientation === "horizontal"
          ? "astw:h-1 astw:cursor-row-resize astw:border-y astw:border-border astw:bg-muted"
          : "astw:w-1 astw:cursor-col-resize",
        className,
      )}
    />
  );
}
