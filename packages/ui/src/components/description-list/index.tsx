import type { ComponentProps, ReactNode } from "react";
import { Text } from "../text";
import { cn } from "@/lib/utils";
function Root({ className, ...props }: ComponentProps<"dl">) {
  return (
    <dl
      {...props}
      data-slot="description-list"
      className={cn(
        "astw:grid astw:grid-cols-[minmax(100px,auto)_minmax(0,1fr)] astw:gap-2",
        className,
      )}
    />
  );
}
function Item({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <>
      <Text
        variant="body-sm"
        className="astw:text-muted-foreground"
        render={<dt />}
      >
        {label}
      </Text>
      <Text
        variant="body-sm"
        className="astw:m-0 astw:wrap-anywhere"
        render={<dd />}
      >
        {children ?? "—"}
      </Text>
    </>
  );
}
export const DescriptionList = { Root, Item };
