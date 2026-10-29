import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function StatusDot({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: "neutral" | "success" | "error" }) {
  return (
    <span
      {...props}
      data-slot="status-dot"
      data-tone={tone}
      className={cn(
        "astw:inline-block astw:size-2 astw:shrink-0 astw:rounded-full",
        tone === "success"
          ? "astw:bg-success-indicator"
          : tone === "error"
            ? "astw:bg-danger-indicator"
            : "astw:bg-muted-foreground",
        className,
      )}
    />
  );
}
