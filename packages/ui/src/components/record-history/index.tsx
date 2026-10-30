import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import { Card } from "../card";
export function HistoryList({
  className = "",
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={`erpui-history-list astw:grid astw:gap-3 astw:pt-0 astw:px-4.5 astw:pb-4.5 ${className}`}
      {...props}
    />
  );
}
export function HistoryEntry({
  status,
  dateTime,
  timeLabel,
  children,
}: {
  status: ReactNode;
  dateTime: string;
  timeLabel: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card.Root
      className={cn(
        "erpui-history-entry astw:text-[12px] astw:[&_time]:text-[11px] astw:[&_time]:text-muted-foreground",
        "astw:[&_time]:tabular-nums astw:[&_details]:mt-3 astw:[&_summary]:cursor-pointer",
        "astw:[&_summary]:text-foreground",
      )}
    >
      <Card.Header>
        <div
          className={cn(
            "erpui-history-entry-heading astw:flex astw:items-center astw:justify-between astw:flex-wrap",
            "astw:gap-2 astw:[@media(max-width:520px)]:items-start astw:[@media(max-width:520px)]:flex-col",
          )}
        >
          {status}
          <time dateTime={dateTime}>{timeLabel}</time>
        </div>
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card.Root>
  );
}
