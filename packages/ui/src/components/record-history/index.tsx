import type { ComponentProps, ReactNode } from "react";
import { Card } from "../card";
import "./style.css";
export function HistoryList({
  className = "",
  ...props
}: ComponentProps<"div">) {
  return <div className={`erpui-history-list ${className}`} {...props} />;
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
    <Card.Root className="erpui-history-entry">
      <Card.Header>
        <div className="erpui-history-entry-heading">
          {status}
          <time dateTime={dateTime}>{timeLabel}</time>
        </div>
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card.Root>
  );
}
