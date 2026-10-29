import type { ComponentProps, ReactNode } from "react";
import { Text } from "../text";
import { cn } from "@/lib/utils";
export function LogViewer({
  text,
  empty,
  className,
  ...props
}: Omit<ComponentProps<"pre">, "children"> & {
  text?: string | null;
  empty?: ReactNode;
}) {
  return text ? (
    <Text
      variant="code-sm"
      className={cn(
        "astw:m-0 astw:whitespace-pre-wrap astw:wrap-anywhere astw:p-4",
        className,
      )}
      render={<pre {...props} data-slot="log-viewer" />}
    >
      {text}
    </Text>
  ) : (
    <>{empty}</>
  );
}
