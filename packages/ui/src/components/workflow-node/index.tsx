import type { ComponentProps, ReactNode } from "react";
import { Card } from "../card";
import { cn } from "@/lib/utils";
/** Card appearance comes from the existing Card; the application owns the graph. */
export function WorkflowNode({
  title,
  subtitle,
  icon,
  status,
  metric,
  children,
  className,
  ...props
}: Omit<ComponentProps<"div">, "title"> & {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  status: ReactNode;
  metric?: ReactNode;
}) {
  return (
    <Card.Root
      {...props}
      data-slot="workflow-node"
      className={cn("astw:w-64", className)}
    >
      {children}
      <Card.Header
        title={
          <span className="astw:flex astw:min-w-0 astw:items-center astw:gap-2">
            {icon}
            <span className="astw:truncate" title={title}>
              {title}
            </span>
          </span>
        }
        description={subtitle}
      />
      <Card.Content>
        <div className="astw:flex astw:items-center astw:gap-2">
          {status}
          {metric && <span className="astw:ml-auto">{metric}</span>}
        </div>
      </Card.Content>
    </Card.Root>
  );
}
