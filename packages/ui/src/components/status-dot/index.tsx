import type { ComponentProps } from "react";
export function StatusDot({
  tone = "neutral",
  className = "",
  ...props
}: ComponentProps<"span"> & { tone?: "neutral" | "success" | "error" }) {
  return (
    <span
      {...props}
      data-slot="status-dot"
      data-tone={tone}
      className={`erpui-status-dot ${className}`}
    />
  );
}
