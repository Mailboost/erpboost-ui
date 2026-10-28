import type { ComponentProps, ReactNode } from "react";
export function LogViewer({
  text,
  empty,
  className = "",
  ...props
}: Omit<ComponentProps<"pre">, "children"> & {
  text?: string | null;
  empty?: ReactNode;
}) {
  return text ? (
    <pre
      {...props}
      data-slot="log-viewer"
      className={`erpui-log-viewer ${className}`}
    >
      {text}
    </pre>
  ) : (
    <>{empty}</>
  );
}
