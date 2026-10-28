import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Decorative loading shape. Name the enclosing loading region for assistive technology. */
export function Skeleton({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("erpui-skeleton", className)}
    />
  );
}
