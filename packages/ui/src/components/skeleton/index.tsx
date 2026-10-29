import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Decorative placeholder. Label the surrounding loading region. */
export function Skeleton({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "astw:block astw:h-3 astw:w-full astw:shrink-0 astw:animate-pulse astw:rounded-sm astw:bg-muted astw:motion-reduce:animate-none",
        className,
      )}
    />
  );
}
