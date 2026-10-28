import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Text } from "../text";

export type EmptyStateProps = Omit<ComponentProps<"div">, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Match the heading hierarchy of the containing page or panel. */
  headingLevel?: 2 | 3 | 4;
};

/** The app supplies the message and actions; no fetching or business behavior. */
export function EmptyState({
  title,
  description,
  icon,
  children,
  className,
  headingLevel = 2,
  ...props
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <div
      {...props}
      data-slot="empty-state"
      className={cn(
        "astw:flex astw:min-w-0 astw:flex-col astw:items-center astw:justify-center astw:gap-2 astw:px-6 astw:py-8 astw:text-center",
        className,
      )}
    >
      {icon && (
        <div
          data-slot="empty-state-icon"
          aria-hidden="true"
          className="astw:text-muted-foreground"
        >
          {icon}
        </div>
      )}
      <Text
        variant="heading-sm"
        render={<Heading data-slot="empty-state-title" />}
      >
        {title}
      </Text>
      {description && (
        <div
          data-slot="empty-state-description"
          className="astw:text-body-md astw:text-muted-foreground"
        >
          {description}
        </div>
      )}
      {children && (
        <div
          data-slot="empty-state-actions"
          className="astw:flex astw:flex-wrap astw:items-center astw:justify-center astw:gap-2"
        >
          {children}
        </div>
      )}
    </div>
  );
}
